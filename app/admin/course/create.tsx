import { SimpleForm, Create, TextInput, required, ImageInput, ImageField } from "react-admin";

export const CourseCreate = () => {
  return (
    <Create>
      <SimpleForm>
        <TextInput 
          source="title" 
          validate={[required()]} 
          label="Title"
        />
        <ImageInput 
          source="imageSrc" 
          label="Course Image"
          accept="image/*"
          validate={[required()]}
        >
          <ImageField source="src" title="title" />
        </ImageInput>
      </SimpleForm>
    </Create>
  );
};
