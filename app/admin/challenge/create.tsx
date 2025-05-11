import { SimpleForm, Create, TextInput, ReferenceInput, NumberInput, required, SelectInput, useGetList } from "react-admin";
import { useEffect, useState } from "react";

interface Lesson {
  id: number;
  title: string;
  unit: { 
    title: string;
    course?: {
      title: string;
    }
  };
  chapter: { title: string };
}

export const ChallengeCreate = () => {
  const [lessonOptions, setLessonOptions] = useState<{ id: number, name: string }[]>([]);
  const { data: lessons, isLoading } = useGetList<Lesson>(
    'lessons',
    { pagination: { page: 1, perPage: 1000 }, sort: { field: 'title', order: 'ASC' } }
  );

  useEffect(() => {
    if (lessons) {
      // Group lessons by course for better organization
      const courseMap: Record<string, { courseName: string, lessons: { id: number, name: string, unit: string, chapter: string }[] }> = {};
      
      lessons.forEach(lesson => {
        const courseName = lesson.unit?.course?.title || 'Other';
        const unitName = lesson.unit?.title || 'N/A';
        const chapterName = lesson.chapter?.title || 'N/A';
        
        if (!courseMap[courseName]) {
          courseMap[courseName] = { courseName, lessons: [] };
        }
        
        courseMap[courseName].lessons.push({
          id: lesson.id,
          name: lesson.title,
          unit: unitName,
          chapter: chapterName
        });
      });
      
      // Sort courses and create formatted options
      const options = Object.values(courseMap)
        .sort((a, b) => a.courseName.localeCompare(b.courseName))
        .flatMap(course => course.lessons.map(lesson => ({
          id: lesson.id,
          name: `${lesson.name} (${course.courseName} → ${lesson.unit} → ${lesson.chapter})`
        })));
      
      setLessonOptions(options);
    }
  }, [lessons]);

  return (
    <Create>
      <SimpleForm>
        <TextInput 
          source="question" 
          validate={[required()]} 
          label="Question"
          fullWidth
        />
        <SelectInput
          source="type"
          choices={[
            {
              id: "SELECT",
              name: "SELECT",
            },
            {
              id: "ASSIST",
              name: "ASSIST",
            }
          ]}
          validate={[required()]} 
        />
        <SelectInput
          source="lessonId"
          label="Lesson"
          choices={lessonOptions}
          isLoading={isLoading}
          fullWidth
          optionText="name"
          optionValue="id"
        />
        <NumberInput
          source="order"
          validate={[required()]}
          label="Order"
          defaultValue={1}
        />
      </SimpleForm>
    </Create>
  );
};
