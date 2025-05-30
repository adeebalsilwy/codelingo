export interface Chapter {
  id: number;
  title: string;
  lessons: any[]; // Replace 'any' with the appropriate type for lessons
  videoYoutube: string | null;
  unit: {
    course: {
      title: string;
    };
    title: string;
  };
  description: string;
}
