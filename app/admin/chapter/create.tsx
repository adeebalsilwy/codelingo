import { Create, TextInput, ReferenceInput, NumberInput, required, SelectInput, SimpleForm } from "react-admin";
import { FC, useState } from "react";
import { MyRichTextInput } from "./myreach";
import Image from 'next/image';

interface ChapterFormData {
  title: string;
  description: string;
  content: string;
  video_youtube?: string;
  unitId: number;
  order: number;
}

const YouTubeInput: FC<{ source: string }> = ({ source }) => {
  const [preview, setPreview] = useState<string>("");

  const handleYouTubePreview = (url: string) => {
    const videoId = url.match(/(?:youtube\.com\/(?:[^/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?/\s]{11})/)?.[1];
    if (videoId) {
      setPreview(`https://img.youtube.com/vi/${videoId}/hqdefault.jpg`);
    } else {
      setPreview("");
    }
  };

  return (
    <div className="youtube-container">
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <span style={{ fontSize: '24px' }}>📺</span>
        <TextInput
          source={source}
          label="YouTube URL"
          fullWidth
          helperText="Enter YouTube URL (optional)"
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleYouTubePreview(e.target.value)}
          validate={[
            (value: string) => {
              if (!value) return undefined;
              const isValid = value.match(/^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/.+$/);
              return isValid ? undefined : 'Please enter a valid YouTube URL';
            }
          ]}
        />
      </div>
      {preview && (
        <div className="preview-container relative" style={{ marginTop: '15px', maxWidth: '400px', aspectRatio: '16/9' }}>
          <Image 
            src={preview} 
            alt="YouTube thumbnail" 
            fill
            className="rounded-lg object-cover"
          />
        </div>
      )}
    </div>
  );
};

export const ChapterCreate = () => {
  return (
    <Create>
      <SimpleForm>
          <div style={{ display: 'grid', gap: '1.5rem', maxWidth: '800px', margin: '0 auto', width: '100%' }}>
            <TextInput 
              source="title" 
              validate={[required()]} 
              label="Title"
              fullWidth
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: '8px' } }}
            />
            <MyRichTextInput 
              source="description" 
              validate={(value: any) => {
                if (!value) return 'Description is required';
                return undefined;
              }}
              label="Description"
              sx={{ 
                '& .tox-editor-container': { borderRadius: '8px', overflow: 'hidden' },
              '& .tox-editor-header': { flexWrap: 'wrap' }
            }}
          />
          <MyRichTextInput
            source="content"
            label="Content"
            sx={{
              '& .tox-editor-container': { borderRadius: '8px', overflow: 'hidden' },
              '& .tox-editor-header': { flexWrap: 'wrap' }
            }}
          />
          <YouTubeInput source="video_youtube" />
            <div style={{ display: 'grid', gap: '1.5rem', gridTemplateColumns: '1fr' }}>
              <ReferenceInput 
                source="unitId" 
                reference="units"
                filter={{ include: { course: true } }}
                sort={{ field: "order", order: "ASC" }}
              >
                <SelectInput 
                  validate={[required()]} 
                  label="Unit" 
                  optionText={(record) => {
                    if (!record) return "";
                    const unit = record as { title: string; course: { title: string } };
                    return unit.course ? `${unit.title} - ${unit.course.title}` : unit.title;
                  }}
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: '8px' } }}
                />
              </ReferenceInput>
              <NumberInput 
                source="order" 
                validate={[required()]} 
                label="Order"
              min={1}
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: '8px' } }}
              />
            </div>
          </div>
      </SimpleForm>
    </Create>
  );
};

export default ChapterCreate;