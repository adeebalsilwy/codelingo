"use client";

import { toast } from "sonner";
import Image from "next/image";
import Confetti from "react-confetti";
import { useRouter } from "next/navigation";
import { useState, useTransition, useEffect, useCallback } from "react";
import { useAudio, useWindowSize, useMount } from "react-use";

import { reduceHearts } from "@/actions/user-progress";
import { useHeartsModal } from "@/store/use-hearts-modal";
import { challengeOptions, challenges, userSubscription } from "@/db/schema";
import { usePracticeModal } from "@/store/use-practice-modal";
import { upsertChallengeProgress } from "@/actions/challenge-progress";

import { Header } from "./header";
import { Footer } from "./footer";
import { Challenge } from "./challenge";
import { ResultCard } from "./result-card";
import { QuestionBubble } from "./question-bubble";

type Props ={
  initialPercentage: number;
  initialHearts: number;
  initialLessonId: number;
  initialLessonChallenges: (typeof challenges.$inferSelect & {
    completed: boolean;
    challengeOptions: typeof challengeOptions.$inferSelect[];
  })[];
  userSubscription: typeof userSubscription.$inferSelect & {
    isActive: boolean;
  } | null;
};

export const Quiz = ({
  initialPercentage,
  initialHearts,
  initialLessonId,
  initialLessonChallenges,
  userSubscription,
}: Props) => {
  const { width, height } = useWindowSize();
  const router = useRouter();
  const { open: openHeartsModal } = useHeartsModal();
  const { open: openPracticeModal } = usePracticeModal();

  const [finishAudio] = useAudio({ src: "/finish.mp3", autoPlay: true });
  const [correctAudio, _c, correctControls] = useAudio({ src: "/correct.wav" });
  const [incorrectAudio, _i, incorrectControls] = useAudio({ src: "/incorrect.wav" });
  
  const [pending, startTransition] = useTransition();

  const [lessonId] = useState(initialLessonId);
  const [hearts, setHearts] = useState(initialHearts);
  const [challenges] = useState(() => {
    // Try to restore completed challenges from localStorage
    if (typeof window !== 'undefined') {
      try {
        const savedProgress = localStorage.getItem(`lesson_progress_${initialLessonId}`);
        if (savedProgress) {
          const { completedChallenges = [] } = JSON.parse(savedProgress);
          if (completedChallenges.length > 0) {
            return initialLessonChallenges.map(challenge => ({
              ...challenge,
              completed: challenge.completed || completedChallenges.includes(challenge.id)
            }));
          }
        }
      } catch (error) {
        console.error("Error reading from localStorage:", error);
      }
    }
    
    return initialLessonChallenges;
  });
  
  const [activeIndex, setActiveIndex] = useState(() => {
    // Try to restore active index from localStorage
    if (typeof window !== 'undefined') {
      try {
        const savedProgress = localStorage.getItem(`lesson_progress_${initialLessonId}`);
        if (savedProgress) {
          const { activeIndex: savedActiveIndex } = JSON.parse(savedProgress);
          if (savedActiveIndex !== undefined && savedActiveIndex >= 0) {
            return savedActiveIndex;
          }
        }
      } catch (error) {
        console.error("Error reading from localStorage:", error);
      }
    }
    
    const uncompletedIndex = challenges.findIndex((challenge) => !challenge.completed);
    return uncompletedIndex === -1 ? 0 : uncompletedIndex;
  });
  
  const [percentage, setPercentage] = useState(() => {
    // Try to restore progress from localStorage if available
    if (typeof window !== 'undefined') {
      try {
        const savedProgress = localStorage.getItem(`lesson_progress_${initialLessonId}`);
        if (savedProgress) {
          const { percentage: savedPercentage } = JSON.parse(savedProgress);
          if (savedPercentage > 0 && savedPercentage < 100) {
            return savedPercentage;
          }
        }
      } catch (error) {
        console.error("Error reading from localStorage:", error);
      }
    }
    
    return initialPercentage === 100 ? 0 : initialPercentage;
  });
  
  const [selectedOption, setSelectedOption] = useState<number>();
  const [status, setStatus] = useState<"correct" | "wrong" | "none">("none");

  const saveProgressToLocalStorage = useCallback(() => {
    try {
      if (typeof window !== 'undefined') {
        localStorage.setItem(`lesson_progress_${initialLessonId}`, JSON.stringify({
          activeIndex,
          percentage,
          completedChallenges: challenges.filter(c => c.completed).map(c => c.id)
        }));
      }
    } catch (error) {
      console.error("Failed to save progress to localStorage:", error);
    }
  }, [initialLessonId, activeIndex, percentage, challenges]);

  // Save progress when component unmounts or user navigates away
  useEffect(() => {
    const saveProgressOnExit = () => {
      saveProgressToLocalStorage();
    };
    
    window.addEventListener('beforeunload', saveProgressOnExit);
    
    return () => {
      window.removeEventListener('beforeunload', saveProgressOnExit);
      saveProgressToLocalStorage();
    };
  }, [saveProgressToLocalStorage]);

  const challenge = challenges[activeIndex];
  const options = challenge?.challengeOptions ?? [];

  const onNext = () => {
    setActiveIndex((current: number) => {
      const newIndex = current + 1;
      // Save progress after advancing to next challenge
      setTimeout(() => saveProgressToLocalStorage(), 0);
      return newIndex;
    });
  };

  const onSelect = (id: number) => {
    if (status !== "none") return;

    setSelectedOption(id);
  };

  const onContinue = () => {
    if (!selectedOption) return;

    if (status === "wrong") {
      setStatus("none");
      setSelectedOption(undefined);
      return;
    }

    if (status === "correct") {
      onNext();
      setStatus("none");
      setSelectedOption(undefined);
      return;
    }

    const correctOption = options.find((option) => option.correct);

    if (!correctOption) {
      return;
    }

    if (correctOption.id === selectedOption) {
      startTransition(() => {
        upsertChallengeProgress(challenge.id)
          .then((response) => {
            if (response?.error === "hearts") {
              openHeartsModal();
              return;
            }

            correctControls.play();
            setStatus("correct");
            setPercentage((prev: number) => prev + 100 / challenges.length);

            // This is a practice
            if (initialPercentage === 100) {
              setHearts((prev: number) => Math.min(prev + 1, 5));
            }
          })
          .catch(() => toast.error("Something went wrong. Please try again."))
      });
    } else {
      startTransition(() => {
        reduceHearts(challenge.id)
          .then((response) => {
            if (response?.error === "hearts") {
              openHeartsModal();
              return;
            }

            incorrectControls.play();
            setStatus("wrong");

            if (!response?.error) {
              setHearts((prev: number) => Math.max(prev - 1, 0));
            }
          })
          .catch(() => toast.error("Something went wrong. Please try again."))
      });
    }
  };

  useMount(() => {
    if (initialPercentage === 100) {
      openPracticeModal();
    }
    
    // Save initial state to localStorage to persist progress even if user navigates away
    saveProgressToLocalStorage();
  });

  if (!challenge) {
    return (
      <>
        {finishAudio}
        <Confetti
          width={width}
          height={height}
          recycle={false}
          numberOfPieces={500}
          tweenDuration={10000}
        />
        <div className="flex flex-col gap-y-4 lg:gap-y-8 max-w-lg mx-auto text-center items-center justify-center h-full">
          <Image
            src="/finish.svg"
            alt="Finish"
            className="hidden lg:block"
            height={100}
            width={100}
          />
          <Image
            src="/finish.svg"
            alt="Finish"
            className="block lg:hidden"
            height={50}
            width={50}
          />
          <h1 className="text-xl lg:text-3xl font-bold text-neutral-700">
            Great job! <br /> You&apos;ve completed the lesson.
          </h1>
          <div className="flex items-center gap-x-4 w-full">
            <ResultCard
              variant="points"
              value={challenges.length * 10}
            />
            <ResultCard
              variant="hearts"
              value={hearts}
            />
          </div>
        </div>
        <Footer
          lessonId={lessonId}
          status="completed"
          onCheck={() => router.push("/learn")}
        />
      </>
    );
  }

  const title = challenge.type === "ASSIST" 
    ? "Select the correct meaning"
    : challenge.question;

  return (
    <>
      {incorrectAudio}
      {correctAudio}
      <Header
        hearts={hearts}
        percentage={percentage}
        hasActiveSubscription={!!userSubscription?.isActive}
      />
      <div className="flex-1">
        <div className="h-full flex items-center justify-center">
          <div className="lg:min-h-[350px] lg:w-[600px] w-full px-6 lg:px-0 flex flex-col gap-y-12">
            <h1 className="text-lg lg:text-3xl text-center lg:text-start font-bold text-neutral-700">
              {title}
            </h1>
            <div>
              {challenge.type === "ASSIST" && (
                <QuestionBubble question={challenge.question} />
              )}
              <Challenge
                options={options}
                onSelect={onSelect}
                status={status}
                selectedOption={selectedOption}
                disabled={pending}
                type={challenge.type}
              />
            </div>
          </div>
        </div>
      </div>
      <Footer
        disabled={pending || !selectedOption}
        status={status}
        onCheck={onContinue}
      />
    </>
  );
};
