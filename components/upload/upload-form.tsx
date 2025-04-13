'use client';

// Import necessary dependencies
import * as React from 'react';
import { useAuth } from "@clerk/nextjs";
import { PdfUploadSection } from './pdf-upload-section';
import { toast } from 'sonner';
import { generatedPdfSummary, summarizeExtractedText, storePdfSummaryAction } from '@/actions/upload-actions';

/**
 * UploadForm Component
 * This component handles PDF file uploads using EdgeStore for storage
 */
export default function UploadForm() {
  const { userId, isLoaded, isSignedIn } = useAuth();
  
  // === State Management ===
  // Store the URL of the uploaded file
  const [uploadedUrl, setUploadedUrl] = React.useState<string>('');
  // Track different processing states
  const [extractedText, setExtractedText] = React.useState<string>('');
  const [isExtracting, setIsExtracting] = React.useState(false);
  const [summary, setSummary] = React.useState<string>('');
  const [isSummarizing, setIsSummarizing] = React.useState(false);
  const [isStoring, setIsStoring] = React.useState(false);

  const handleUploadComplete = async (uploadedFileUrl: string) => {
    setUploadedUrl(uploadedFileUrl);
    setIsExtracting(true);
    
    // Continue with text extraction
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

      // STEP 3: Generate Summary using AI
      // Uses Gemini AI to create a summary
      // Shows loading state and final result
      setIsSummarizing(true);
      const summaryToastId = toast.loading('🤖 AI is working its magic...', {
        duration: Infinity,
      });
      
      const summarizationResult = await summarizeExtractedText(extractionResult.data);
      toast.dismiss(summaryToastId);
      
      if (summarizationResult.success) {
        setSummary(summarizationResult.data);
        
        // Store the summary
        setIsStoring(true);
        const storeToastId = toast.loading('💾 Saving your summary...', {
          duration: Infinity,
        });

        const storeResult = await storePdfSummaryAction({
          fileUrl: uploadedFileUrl,
          summary: summarizationResult.data,
          title: 'document.pdf',
        });

        toast.dismiss(storeToastId);

        if (storeResult.success) {
          toast.success('✅ Summary saved!', {
            description: "Everything's stored safely.",
            duration: 3000,
          });
        } else {
          toast.error('📝 Save failed', {
            description: storeResult.message,
            duration: 4000,
          });
        }
        setIsStoring(false);

      } else {
        toast.error('😕 Summarization hiccup', {
          description: summarizationResult.message,
          duration: 4000,
        });
      }
    } else {
      toast.error('📄 Text extraction failed', {
        description: extractionResult.message,
        duration: 4000,
      });
    }

    setIsExtracting(false);
    setIsSummarizing(false);
  };

  return (
    <div className="space-y-6">
      <PdfUploadSection 
        isSignedIn={isSignedIn ?? false}
        onUploadComplete={handleUploadComplete}
      />

      {/* === Results Display Section === */}
      {/* Show uploaded file URL */}
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

      {/* Show extracted text when available */}
      {isExtracting && <p>Extracting text...</p>}
      {extractedText && (
        <div>
          <h3>Extracted Text:</h3>
          <p>{extractedText}</p>
        </div>
      )}
      {/* Show final summary when ready */}
      {isSummarizing && <p>Generating summary...</p>}
      {summary && (
        <div>
          <h3>Summary:</h3>
          <p>{summary}</p>
        </div>
      )}
    </div>
  );
}