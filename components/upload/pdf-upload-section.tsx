'use client';

// Import necessary dependencies
import * as React from 'react';
import { useEdgeStore } from '@/lib/edgestore';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';
import Image from 'next/image';

// Define what props our component needs
interface PdfUploadSectionProps {
  isSignedIn: boolean;  // To check if user is logged in
  onUploadComplete: (url: string) => void;  // Function to run after upload finishes
}

export function PdfUploadSection({ isSignedIn, onUploadComplete }: PdfUploadSectionProps) {
  // State management for our component
  const [file, setFile] = React.useState<File>();  // Store the selected PDF file
  const [error, setError] = React.useState<string>('');  // Store any error messages
  const [isUploading, setIsUploading] = React.useState(false);  // Track if upload is in progress
  const [isDragging, setIsDragging] = React.useState(false);  // Track if user is dragging a file
  const { edgestore } = useEdgeStore();  // Our file storage service

  // Check if the file is valid (PDF and under 10MB)
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

  // Handle the file upload process
  const handleUpload = async () => {
    // Check if user is signed in
    if (!isSignedIn) {
      toast.error('Please sign in to upload files');
      return;
    }

    // Make sure we have a file to upload
    if (!file) return;

    try {
      // Start upload process
      setIsUploading(true);
      let loadingToastId: string | number = '';

      // Upload the file with progress tracking
      const uploadPromise = await edgestore.publicFiles.upload({
        file,
        onProgressChange: (progress) => {
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

      // Show success message and notify parent component
      toast.dismiss(loadingToastId);
      toast.success('🎉 Upload complete!', {
        description: "Your PDF is safely in the cloud.",
        duration: 2000,
      });

      onUploadComplete(uploadPromise.url);

    } catch (err) {
      // Handle any errors during upload
      toast.error('⚠️ Upload failed', {
        description: "Please try again.",
        duration: 3000,
      });
      console.error(err);
    } finally {
      setIsUploading(false);
    }
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
    <section className="w-screen h-[80vh] grid place-items-center">
      {/* Main container */}
      <div className="grid w-full max-w-7xl h-[50vh] gap-6 mx-4 my-4 md:grid-cols-2">
        {/* Upload box */}
        <div className="bg-yellow-50 rounded-xl border-2 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] p-6 flex flex-col justify-center items-center">
          {/* Title */}
          <h2 className="text-lg lg:text-3xl font-extrabold text-center text-black mb-4">Upload PDF</h2>
          
          {/* Hidden file input for clicking */}
          <input
            type="file"
            accept=".pdf,application/pdf"
            onChange={(e) => {
              // Handle file selection
              const selectedFile = e.target.files?.[0];
              if (selectedFile && validateFile(selectedFile)) {
                setFile(selectedFile);
                setError('');
              } else {
                setFile(undefined);
              }
            }}
            className="hidden"
            id="pdf-upload"
          />
          
          {/* Drag and drop zone */}
          <div 
            className={`grid border-2 border-dashed ${isDragging ? 'border-green-500 bg-green-50' : 'border-gray-300'} w-full h-full rounded-md p-4 items-center justify-center cursor-pointer`}
            onClick={() => document.getElementById('pdf-upload')?.click()}
            onDragEnter={handleDragIn}
            onDragLeave={handleDragOut}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            {/* Upload interface elements */}
            <div className="flex flex-col items-center justify-center text-center">
              <Image 
                src="/pdf.png" 
                alt="Upload PDF" 
                width={130} 
                height={130} 
                className="transform transition-all duration-300 ease-in-out hover:scale-110" 
              />
              <div className="flex gap-2 mt-4">
                <p className="font-bold text-green-500 underline">Choose</p>
                <p className="font-bold text-gray-600">Your Files Here.</p>
              </div>
              <p className="font-semibold text-sm text-gray-600 m-0.5">10MB Max PDF Size</p>
            </div>

            {file && (
              <div className="border-2 w-dvw max-w-lg h-18 rounded-md pd-4 mt-4">
                <p className="text-center p-2">{file.name}</p>
              </div>
            )}
          </div>

          {/* Error messages */}
          {error && <p className="text-sm text-red-500 mt-2">{error}</p>}
          
          {/* Sign in reminder */}
          {!isSignedIn && (
            <p className="text-sm text-red-500 mt-2">
              Please sign in to upload files
            </p>
          )}

          {/* Upload button - only shows when file is selected */}
          {file && (
            <button
              onClick={handleUpload}
              disabled={isUploading || !isSignedIn}
              className="mt-4 px-4 py-2 bg-amber-300 hover:bg-amber-400 rounded-md flex items-center gap-2 disabled:opacity-50"
            >
              {/* Show loading spinner or upload text */}
              {isUploading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Uploading...</span>
                </>
              ) : (
                <span>Upload PDF</span>
              )}
            </button>
          )}
        </div>
      </div>
    </section>
  );
}
