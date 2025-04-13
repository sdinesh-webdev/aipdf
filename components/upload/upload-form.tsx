'use client';

import * as React from 'react';
import { useAuth } from "@clerk/nextjs";
import { PdfUploadSection } from './pdf-upload-section';
import { toast } from 'sonner';
import { generatedPdfSummary } from '@/actions/upload-actions';
import { SummaryGenerator } from './summary-generator';

export default function UploadForm() {
  const { userId, isLoaded, isSignedIn } = useAuth();
  
  const [uploadedUrl, setUploadedUrl] = React.useState<string>('');
  const [extractedText, setExtractedText] = React.useState<string>('');
  const [isExtracting, setIsExtracting] = React.useState(false);

  const handleUploadComplete = async (uploadedFileUrl: string) => {
    setUploadedUrl(uploadedFileUrl);
    setIsExtracting(true);
    
    const extractionResult = await generatedPdfSummary([
      {
        serverData: {
          file: { url: uploadedFileUrl, name: 'document.pdf' },
        },
      },
    ]);

    if (extractionResult.success) {
      setExtractedText(extractionResult.data);
      toast.success('📝 Text extracted!', {
        description: "Now let's create a summary.",
        duration: 2000,
      });
    } else {
      toast.error('📄 Text extraction failed', {
        description: extractionResult.message,
        duration: 4000,
      });
    }

    setIsExtracting(false);
  };

  return (
    <div className="space-y-6">
      <PdfUploadSection 
        isSignedIn={isSignedIn ?? false}
        onUploadComplete={handleUploadComplete}
      />

      {uploadedUrl && (
        <div>
          <p>File uploaded successfully!</p>
          <p>
            URL:{' '}
            <a href={uploadedUrl} target="_blank" rel="noopener noreferrer">
              {uploadedUrl}
            </a>
          </p>
        </div>
      )}

      {isExtracting && <p>Extracting text...</p>}
      {extractedText && (
        <div>
          <h3>Extracted Text:</h3>
          <p>{extractedText}</p>
        </div>
      )}
      
      {extractedText && <SummaryGenerator extractedText={extractedText} fileUrl={uploadedUrl} />}
    </div>
  );
}