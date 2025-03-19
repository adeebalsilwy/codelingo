import Image from "next/image";

type Props = {
  question: string;
};

export const QuestionBubble = ({ question }: Props) => {
  return (
    <div className="flex items-center gap-x-4 mb-6">
      <Image
        src="/mascot.svg"
        alt="Mascot"
        height={60}
        width={60}
        className="hidden lg:block"
      />
      <Image
        src="/mascot.svg"
        alt="Mascot"
        height={40}
        width={40}
        className="block lg:hidden"
      />
      <div className="flex items-center gap-x-2">
        <Image
          src="/logo1.jpg"
          alt="Logo"
          width={30}
          height={30}
          className="rounded-lg"
        />
        <div className="rounded-xl p-4 bg-primary/10">
          <p className="text-primary/80">
            {question}
          </p>
        </div>
      </div>
    </div>
  );
};
