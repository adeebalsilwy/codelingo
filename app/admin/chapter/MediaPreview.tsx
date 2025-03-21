import { FC } from 'react';
import Image from 'next/image';

interface MediaPreviewProps {
  url: string;
  type: 'VIDEO' | 'PDF' | 'YOUTUBE' | 'image';
}

export const MediaPreview: FC<MediaPreviewProps> = ({ url, type }) => {
  if (!url) return null;

  return (
    <div
      className="preview-container"
      style={{
        marginTop: '15px',
        maxWidth: '400px',
        borderRadius: '8px',
        overflow: 'hidden',
        border: '1px solid #ddd',
        padding: '8px',
        boxShadow: '0 2px 6px rgba(0,0,0,0.15)'
      }}
    >
      {type === 'VIDEO' && (
        <div>
          <video 
            controls 
            style={{ width: '100%', borderRadius: '8px' }}
            onError={(e) => {
              const target = e.target as HTMLVideoElement;
              target.style.display = 'none';
              const errorMsg = document.createElement('p');
              errorMsg.textContent = 'Error loading video';
              errorMsg.style.color = '#d32f2f';
              target.parentNode?.appendChild(errorMsg);
            }}
          >
            <source src={url} type="video/mp4" />
            <source src={url} type="video/webm" />
            <source src={url} type="video/ogg" />
            Your browser does not support the video tag.
          </video>
          <p style={{ margin: '8px 0', fontSize: '0.9em', color: '#666' }}>
            Selected video: {url.split('/').pop()}
          </p>
        </div>
      )}
      {type === 'PDF' && (
        <div>
          <iframe
            src={url}
            title="PDF Preview"
            style={{
              width: '100%',
              height: '350px',
              border: 'none',
              borderRadius: '8px',
              boxShadow: '0 2px 6px rgba(0,0,0,0.15)'
            }}
            onError={() => {
              const errorMsg = document.createElement('p');
              errorMsg.textContent = 'Error loading PDF';
              errorMsg.style.color = '#d32f2f';
              document.querySelector('.preview-container')?.appendChild(errorMsg);
            }}
          />
          <p style={{ margin: '8px 0', fontSize: '0.9em', color: '#666', textAlign: 'center' }}>
            Selected PDF: {url.split('/').pop()}
          </p>
        </div>
      )}
      {type === 'YOUTUBE' && (
        <div>
          <div className="relative aspect-video">
            <Image
              src={url}
              alt="YouTube thumbnail"
              fill
              className="object-contain"
            />
          </div>
        </div>
      )}
      {type === 'image' && (
        <div className="relative w-full h-48">
          <Image
            src={url}
            alt="Media preview"
            fill
            className="object-contain"
          />
        </div>
      )}
    </div>
  );
}; 