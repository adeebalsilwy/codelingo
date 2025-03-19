import { useInput, useNotify } from "react-admin";
import { useCallback, useEffect, useState } from "react";

const FileInput = (props: any) => {
  const { field } = useInput(props);
  const notify = useNotify();
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [tempFile, setTempFile] = useState<File | null>(null);
  const [tempPreview, setTempPreview] = useState<string | null>(null);

  const uploadFile = async (file: File) => {
    setIsUploading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      });

      if (!response.ok) throw new Error('Upload failed');

      const data = await response.json();
      return `/contectchapter/${data.filename}`;
    } catch (error) {
      notify('File upload failed', { type: 'error' });
      throw error;
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const handleFileSelect = useCallback(
    async (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (!file) {
        setTempFile(null);
        setTempPreview(null);
        field.onChange(null);
        return;
      }

      // Validate file size (max 100MB)
      const maxSize = 100 * 1024 * 1024;
      if (file.size > maxSize) {
        notify('File size exceeds 100MB limit', { type: 'error' });
        return;
      }

      // Validate file type
      const validTypes = {
        VIDEO: ['video/mp4', 'video/webm', 'video/ogg'],
        PDF: ['application/pdf']
      };

      const contentType = props.contentType;
      if (contentType === 'VIDEO' && !validTypes.VIDEO.includes(file.type)) {
        notify('Please upload a valid video file (MP4, WebM, or OGG)', { type: 'error' });
        event.target.value = '';
        return;
      }
      if (contentType === 'PDF' && !validTypes.PDF.includes(file.type)) {
        notify('Please upload a valid PDF file', { type: 'error' });
        event.target.value = '';
        return;
      }

      // Clean up previous preview
      if (tempPreview) {
        URL.revokeObjectURL(tempPreview);
      }

      // Create and store preview
      const previewUrl = URL.createObjectURL(file);
      setTempFile(file);
      setTempPreview(previewUrl);
      field.onChange(file); // Update form field value
      
      notify('File selected. Click Save to upload.', { type: 'info' });
      
      if (props.onFileSelect) {
        props.onFileSelect(file);
      }
    },
    [notify, props.contentType, props.onFileSelect, tempPreview]
  );

  // Cleanup preview URL when component unmounts or content type changes
  useEffect(() => {
    return () => {
      if (tempPreview) {
        URL.revokeObjectURL(tempPreview);
      }
    };
  }, [tempPreview]);

  useEffect(() => {
    // Clear preview, temp file and field value when content type changes
    setTempFile(null);
    setTempPreview(null);
    field.onChange(null);
    setUploadProgress(0);
    setIsUploading(false);
  }, [props.contentType]);

  return (
    <div style={{ marginTop: '1rem' }}>
      <div className="file-upload-container" style={{ marginBottom: '1rem' }}>
        <label
          htmlFor="file-upload"
          style={{
            display: 'inline-block',
            padding: '8px 16px',
            backgroundColor: isUploading ? '#ccc' : '#1976d2',
            color: 'white',
            borderRadius: '4px',
            cursor: isUploading ? 'not-allowed' : 'pointer',
            transition: 'background-color 0.3s',
            border: 'none',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
            pointerEvents: isUploading ? 'none' : 'auto'
          }}
        >
          {isUploading ? `Uploading... ${uploadProgress}%` : (field.value ? 'Change File' : `Upload ${props.contentType}`)}
        </label>
        <input
          id="file-upload"
          type="file"
          accept={props.contentType === 'VIDEO' ? 'video/mp4,video/webm,video/ogg' : 'application/pdf'}
          onChange={handleFileSelect}
          disabled={isUploading}
          style={{
            display: 'none'
          }}
        />
      </div>
      {(field.value || tempPreview) && !isUploading && (
        <div style={{ marginTop: '0.5rem' }}>
          {props.contentType === 'VIDEO' ? (
            <div>
              <video 
                controls 
                key={tempPreview || field.value}
                style={{ 
                  maxWidth: '100%', 
                  maxHeight: '200px', 
                  marginBottom: '0.5rem',
                  borderRadius: '4px',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                }}
              >
                <source src={tempPreview || field.value} type={tempFile?.type || "video/mp4"} />
                Your browser does not support the video tag.
              </video>
              <div style={{ fontSize: '0.875rem', color: '#666' }}>
                {tempFile ? `Selected video: ${tempFile.name}` : field.value ? `Current video: ${field.value.split('/').pop()}` : ''}
              </div>
            </div>
          ) : (
            <div>
              <object
                data={tempPreview || field.value}
                type="application/pdf"
                style={{
                  width: '100%',
                  height: '200px',
                  borderRadius: '4px',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                }}
              >
                <p>PDF preview not available</p>
              </object>
              <div style={{ fontSize: '0.875rem', color: '#666' }}>
                {tempFile ? `Selected PDF: ${tempFile.name}` : `Current PDF: ${field.value.split('/').pop()}`}
              </div>
            </div>
          )}
        </div>
      )}
      {isUploading && (
        <div style={{ marginTop: '1rem' }}>
          <div style={{ 
            width: '100%', 
            height: '4px', 
            backgroundColor: '#e0e0e0', 
            borderRadius: '2px',
            overflow: 'hidden'
          }}>
            <div style={{
              width: `${uploadProgress}%`,
              height: '100%',
              backgroundColor: '#1976d2',
              transition: 'width 0.3s ease'
            }} />
          </div>
        </div>
      )}
    </div>
  );
};

export default FileInput;