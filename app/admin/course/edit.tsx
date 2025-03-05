import { SimpleForm, Edit, TextInput, required, ImageInput, ImageField } from "react-admin";

export const CourseEdit = () => {
  return (
    <Edit>
      <SimpleForm>
        <TextInput 
          source="id" 
          disabled
          label="Id"
        />
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
        <ImageField source="imageSrc" title="Current Image" />
      </SimpleForm>
    </Edit>
  );
};
