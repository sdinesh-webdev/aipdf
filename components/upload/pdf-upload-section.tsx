'use client';

// Import necessary dependencies
import * as React from 'react';
import { useEdgeStore } from '@/lib/edgestore';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';
import Image from 'next/image';

// Define what props our component needs
interface PdfUploadSectionProps {
  isSignedIn: boolean;
  onUploadComplete: (url: string) => void;
}

export function PdfUploadSection({ isSignedIn, onUploadComplete }: PdfUploadSectionProps) {
  // State management
  const [file, setFile] = React.useState<File>();
  const [error, setError] = React.useState<string>('');
  const [isUploading, setIsUploading] = React.useState(false);
  const [isDragging, setIsDragging] = React.useState(false);
  const [uploadProgress, setUploadProgress] = React.useState(0);
  const { edgestore } = useEdgeStore();

  // Validate file function
  const validateFile = (file: File) => {
    if (!file.type.includes('pdf')) {
      toast.error('📚 Oops! PDFs only please!', {
        description: "Let's stick to PDF files for now.",
        duration: 3000,
      });
      return false;
    }
    if (file.size > 10 * 1024 * 1024) {
      toast.error('📦 That\'s a big file!', {
        description: 'Keep it under 10MB please.',
        duration: 3000,
      });
      return false;
    }
    return true;
  };

  // Handle upload function
  const handleUpload = async () => {
    if (!isSignedIn) {
      toast.error('Please sign in to upload files');
      return;
    }

    if (!file) return;

    try {
      setIsUploading(true);
      let loadingToastId: string | number = '';

      const uploadPromise = await edgestore.publicFiles.upload({
        file,
        onProgressChange: (progress) => {
          setUploadProgress(progress); // Update progress state
          if (progress === 0) {
            loadingToastId = toast.loading('🚀 Initiating upload...', {
              duration: Infinity,
            });
          } else if (progress === 100) {
            toast.dismiss(loadingToastId);
          } else if (progress % 25 === 0) {
            toast.dismiss(loadingToastId);
            loadingToastId = toast.loading(`📤 Upload progress: ${progress}%`, {
              duration: Infinity,
            });
          }
        },
      });

      toast.dismiss(loadingToastId);
      toast.success('🎉 Upload complete!', {
        description: "Your PDF is safely in the cloud.",
        duration: 2000,
      });

      onUploadComplete(uploadPromise.url);

    } catch (err) {
      toast.error('⚠️ Upload failed', {
        description: "Please try again.",
        duration: 3000,
      });
      console.error(err);
    } finally {
      setIsUploading(false);
    }
  };

  // Handle file removal
  const handleRemoveFile = (e: React.MouseEvent) => {
    e.stopPropagation();
    setFile(undefined);
    setUploadProgress(0);
    setError('');
  };

  // Drag and drop handlers
  const handleDragIn = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragOut = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile && validateFile(droppedFile)) {
      setFile(droppedFile);
      setError('');
    }
  };

  return (
    <div className="relative w-full">
     

      <div className="max-w-5xl mx-auto px-2 sm:px-3 lg:px-4 py-12 md:py-16 relative z-10">
        <div className="mb-3 flex items-center space-x-1">
          <div className="h-px w-6 bg-lime-400"></div>
          <p className="text-xs uppercase tracking-widest font-mono text-lime-400">Secure Document Upload</p>
        </div>

        {/* Hidden File Input */}
        <input
          type="file"
          accept=".pdf,application/pdf"
          onChange={(e) => {
            const selectedFile = e.target.files?.[0];
            if (selectedFile && validateFile(selectedFile)) {
              setFile(selectedFile);
              setError('');
            }
          }}
          className="hidden"
          id="pdf-upload"
        />

        {/* Drop Zone Area */}
        <div className="flex flex-col w-full">
          <div
            className={`border-2 ${isDragging ? 'border-lime-400 bg-black/40' : 'border-gray-800'} 
            rounded-none p-8 cursor-pointer transition-all duration-300 relative overflow-hidden group
            hover:border-lime-400 hover:bg-black/40`}
            onClick={() => document.getElementById('pdf-upload')?.click()}
            onDragEnter={handleDragIn}
            onDragLeave={handleDragOut}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            {/* Cancel Button - Circular with cross sign */}
            {file && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleRemoveFile(e);
                }}
                className="absolute top-2 right-2 w-6 h-6 rounded-full bg-black/80 border
                border-gray-700 hover:border-rose-500 flex items-center justify-center
                transition-all duration-300 group/cancel z-20"
              >
                <svg 
                  className="w-3 h-3 text-gray-400 group-hover/cancel:text-rose-500 transition-colors duration-300" 
                  fill="none" 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth="2.5" 
                  viewBox="0 0 24 24" 
                  stroke="currentColor"
                >
                  <path d="M6 18L18 6M6 6l12 12"></path>
                </svg>
              </button>
            )}

            <div className="flex flex-col items-center justify-center text-center space-y-3">
              <Image 
                src="/pdf.png" 
                alt="Upload PDF" 
                width={60} 
                height={60} 
                className="transition-transform duration-300 group-hover:scale-110" 
              />
              <div className="space-y-2">
                <h3 className="text-2xl font-bold font-mono tracking-tight">
                  {file ? file.name : 'Choose or Drop PDF'}
                </h3>
                <p className="text-base font-mono text-gray-400">Maximum file size: 10MB</p>
              </div>
            </div>

            {/* Upload Progress */}
            {file && uploadProgress > 0 && (
              <div className="absolute bottom-0 left-0 w-full h-1 bg-gray-800">
                <div
                  className="h-full bg-lime-400 transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            )}
          </div>

          {/* Action Button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleUpload();
            }}
            disabled={isUploading || !isSignedIn || !file}
            className={`bg-white text-black font-mono text-xl font-bold px-8 py-4 border-2 border-white 
            hover:bg-lime-400 hover:border-gray-800 hover:text-gray-800 hover:font-semibold 
            transition-colors duration-300 shadow-xl mt-4 relative z-10
            ${(isUploading || !isSignedIn || !file) ? 'opacity-60 cursor-not-allowed' : ''}`}
          >
            {isUploading ? (
              <span className="flex items-center justify-center gap-1">
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                </svg>
                Processing...
              </span>
            ) : 'PROCESS PDF'}
          </button>
        </div>

        {/* Error Messages */}
        {error && (
          <p className="text-base text-red-500 mt-2 font-mono text-center">{error}</p>
        )}
        {!isSignedIn && (
          <p className="text-base text-red-500 mt-2 font-mono text-center">
            Please sign in to upload files
          </p>
        )}
      </div>

      {/* Brutalist decorative elements */}
      <div className="absolute top-6 right-6 w-8 h-8 bg-lime-400 hidden md:block"></div>
    </div>
  );
}
