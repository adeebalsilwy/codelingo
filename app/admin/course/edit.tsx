import { SimpleForm, Edit, TextInput, required, ImageInput, ImageField, useNotify, useRedirect, SaveButton, Toolbar, RecordContextProvider, Button } from "react-admin";
import { useState } from "react";

// Custom toolbar to show the save button with loading state
const CustomToolbar = ({ loading, ...props }: { loading: boolean, [key: string]: any }) => (
  <Toolbar {...props}>
    <SaveButton
      label={loading ? "Saving..." : "Save"}
      disabled={loading}
      alwaysEnable
    />
  </Toolbar>
);

export const CourseEdit = () => {
  const notify = useNotify();
  const redirect = useRedirect();
  const [loading, setLoading] = useState(false);

  const onSuccess = () => {
    setLoading(false);
    notify('Course updated successfully', { type: 'success' });
    redirect('list', 'courses');
  };

  const onError = (error: any) => {
    setLoading(false);
    notify(`Error: ${error.message || 'Failed to update course'}`, { type: 'error' });
    console.error("Course update error:", error);
  };

  const handleSubmit = () => {
    setLoading(true);
  };

  return (
    <Edit 
      mutationOptions={{ onSuccess, onError }}
      component="div"
    >
      <SimpleForm toolbar={<CustomToolbar loading={loading} />} onSubmit={handleSubmit}>
        <TextInput 
          source="id" 
          disabled
          label="Id"
        />
        <TextInput 
          source="title" 
          validate={[required()]} 
          label="Title"
          fullWidth
        />
        <TextInput 
          source="description" 
          label="Description"
          multiline
          rows={4}
          fullWidth
        />
        <div className="mb-4">
          <p className="text-sm mb-2 font-semibold">Upload new image:</p>
          <ImageInput 
            source="imageSrc" 
            label="Course Image"
            accept="image/*"
            placeholder={<p>Drag and drop an image or click to select one</p>}
          >
            <ImageField source="src" title="title" />
          </ImageInput>
          <p className="text-xs text-gray-500 mt-1">
            {loading ? "Uploading image..." : "Image will be uploaded when you save the course."}
          </p>
        </div>
        <div className="mt-4">
          <p className="text-sm mb-2 font-semibold">Current Image:</p>
          <ImageField source="imageSrc" title="Current Image" />
        </div>
      </SimpleForm>
    </Edit>
  );
};
