import { useInput, useNotify } from "react-admin";
import { useCallback, useEffect, useState } from "react";

const PDFInput = (props: any) => {
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
        body: formData,
        headers: {
          'Accept': 'application/json'
        }
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
      const { onFileSelect } = props;
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
      if (file.type !== 'application/pdf') {
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
      
      notify('PDF file selected. Click Save to upload.', { type: 'info' });
      
      if (onFileSelect) {
        onFileSelect(file);
      }
    },
    [notify, tempPreview, field, props]
  );

  // Cleanup preview URL when component unmounts
  useEffect(() => {
    return () => {
      if (tempPreview) {
        URL.revokeObjectURL(tempPreview);
      }
    };
  }, [tempPreview]);

  return (
    <div style={{ marginTop: '1rem' }}>
      <div className="file-upload-container" style={{ marginBottom: '1rem' }}>
        <label
          htmlFor="pdf-upload"
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
          {isUploading ? `Uploading... ${uploadProgress}%` : (field.value ? 'Change PDF' : 'Upload PDF')}
        </label>
        <input
          id="pdf-upload"
          type="file"
          accept="application/pdf"
          onChange={handleFileSelect}
          disabled={isUploading}
          style={{
            display: 'none'
          }}
        />
      </div>
      {(field.value || tempPreview) && !isUploading && (
        <div style={{ marginTop: '0.5rem' }}>
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
            {tempFile ? `Selected PDF: ${tempFile.name}` : field.value ? `Current PDF: ${field.value.split('/').pop()}` : ''}
          </div>
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

export default PDFInput;