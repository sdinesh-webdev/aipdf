'use client';

import * as React from 'react';
import { useAuth } from "@clerk/nextjs";
import { PdfUploadSection } from './pdf-upload-section';
import { toast } from 'sonner';
import { Copy } from 'lucide-react';

import { generatedPdfSummary, summarizeExtractedText, storePdfSummaryAction } from '@/actions/upload-actions';

/**
 * UploadForm Component
 * This component handles PDF file uploads using EdgeStore for storage and displays the generated summary
 */
export default function UploadForm() {
  const { userId, isLoaded, isSignedIn } = useAuth();
  
  // === State Management ===
  const [uploadedUrl, setUploadedUrl] = React.useState<string>('');
  const [extractedText, setExtractedText] = React.useState<string>('');
  const [isExtracting, setIsExtracting] = React.useState(false);
  const [summary, setSummary] = React.useState<string>('');
  const [isSummarizing, setIsSummarizing] = React.useState(false);
  const [isStoring, setIsStoring] = React.useState(false);

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(summary);
      toast.success('Summary copied to clipboard!');
    } catch (err) {
      toast.error('Failed to copy summary');
    }
  };

  const handleUploadComplete = async (uploadedFileUrl: string) => {
    setUploadedUrl(uploadedFileUrl);
    setIsExtracting(true);
    
    // Step 1: Extract text from PDF
    const extractionResult = await generatedPdfSummary([
      {
        serverData: {
          file: { url: uploadedFileUrl, name: 'document.pdf' },
        },
      },
    ]);

    if (extractionResult.success && extractionResult.data) {
      setExtractedText(extractionResult.data);
      toast.success('📝 Text extracted!', {
        description: "Now let's create a summary.",
        duration: 2000,
      });

      // Step 2: Generate Summary using Gemini AI
      setIsSummarizing(true);
      const summaryToastId = toast.loading('🤖 AI is working its magic...', {
        duration: Infinity,
      });
      
      const summarizationResult = await summarizeExtractedText(extractionResult.data);
      toast.dismiss(summaryToastId);
      
      if (summarizationResult.success && summarizationResult.data) {
        setSummary(summarizationResult.data);
        
        // Step 3: Store the summary
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
    <section className="relative w-full min-h-screen xl:min-h-[120vh] bg-transparent text-white overflow-hidden px-4">


     

      <div className="w-full mx-auto pt-32 pb-16 relative z-10">
        <div className="w-full grid md:grid-cols-2 gap-12">
          {/* Upload Section */}
          <div className="relative">
            {/* Small title intro */}
           
            <PdfUploadSection 
              isSignedIn={isSignedIn ?? false}
              onUploadComplete={handleUploadComplete}
            />
          </div>

          {/* Summary Display Box */}
          <div className="relative w-full">
            <div className="mb-8 flex items-center space-x-4">
              <div className="h-1 w-16 bg-lime-400"></div>
              <p className="text-lg uppercase tracking-[0.3em] font-mono text-lime-400">AI Summary</p>
            </div>
            
            <div className="bg-transparent rounded-none border-4 border-lime-400 p-6 flex flex-col min-h-[600px] max-h-[80vh] w-full transition-all duration-300 shadow-[8px_8px_0px_0px_rgba(163,230,53,1)]">
              <div className="flex justify-between items-center mb-6">
                <div className="flex flex-col items-start space-y-2">
                  <h2 className="font-mono text-3xl font-bold text-lime-400">
                    Document Summary
                  </h2>
                  <div className="h-1 w-20 bg-black"></div>
                </div>
                {summary && (
                  <button
                    onClick={copyToClipboard}
                    className="flex items-center gap-2 px-4 py-2 text-sm font-mono font-bold hover:bg-lime-400 hover:text-black transition-colors rounded-none border-2 border-black"
                  >
                    <Copy className="w-4 h-4" />
                    COPY
                  </button>
                )}
              </div>

              <div className="relative border-2 border-black bg-white w-full flex-1 p-6 overflow-auto transition-all duration-300">
                {isSummarizing ? (
                  <div className="flex flex-col items-center justify-center space-y-3 h-full">
                    <div className="animate-spin rounded-none h-8 w-8 border-b-2 border-black"></div>
                    <p className="text-black font-mono font-medium">PROCESSING...</p>
                  </div>
                ) : summary ? (
                  <div className="prose prose-black max-w-none animate-fadeIn font-mono">
                    {(() => {
                      // Enhanced summary parsing for professional display
                      const lines = summary.split('\n');
                      const blocks = [];
                      let currentList = [];
                      let inList = false;
                      for (let i = 0; i < lines.length; i++) {
                        const line = lines[i].trim();
                        // Heading: Emoji + **Title**
                        const headingMatch = line.match(/^([📝💡🎯🔍])\s+\*\*([^*]+)\*\*/);
                        if (headingMatch) {
                          if (currentList.length) {
                            blocks.push({ type: 'list', items: currentList });
                            currentList = [];
                          }
                          blocks.push({ type: 'heading', emoji: headingMatch[1], title: headingMatch[2] });
                          inList = false;
                          continue;
                        }
                        // List item: starts with '*'
                        if (line.startsWith('*')) {
                          currentList.push(line.replace(/^\*\s*/, ''));
                          inList = true;
                          continue;
                        }
                        // If line is not empty, treat as paragraph
                        if (line) {
                          if (currentList.length) {
                            blocks.push({ type: 'list', items: currentList });
                            currentList = [];
                          }
                          blocks.push({ type: 'paragraph', text: line });
                          inList = false;
                        } else {
                          // Empty line: treat as spacing
                          if (currentList.length) {
                            blocks.push({ type: 'list', items: currentList });
                            currentList = [];
                          }
                          blocks.push({ type: 'spacer' });
                          inList = false;
                        }
                      }
                      if (currentList.length) {
                        blocks.push({ type: 'list', items: currentList });
                      }
                      // Render blocks
                      return blocks.map((block, idx) => {
                        if (block.type === 'heading') {
                          return (
                            <h2 key={idx} className="text-2xl font-bold text-gray-900 mb-3 mt-6 flex items-center gap-2">
                              <span className="text-2xl">{block.emoji}</span>
                              {block.title}
                            </h2>
                          );
                        }
                        if (block.type === 'list' && block.items) {
                          return (
                            <ul key={idx} className="list-disc ml-6 mb-3">
                              {block.items.map((item, i) => {
                                // Render bold text inside list items
                                const parts = item.split(/(\*\*[^*]+\*\*)/g);
                                return (
                                  <li key={i} className="text-gray-800 font-semibold leading-relaxed mb-1">
                                    {parts.map((part, j) => {
                                      if (part.startsWith('**') && part.endsWith('**')) {
                                        return <strong key={j} className="text-black font-semibold">{part.slice(2, -2)}</strong>;
                                      }
                                      return part;
                                    })}
                                  </li>
                                );
                              })}
                            </ul>
                          );
                        }
                        if (block.type === 'paragraph' && block.text) {
                          // Render bold text inside paragraph
                          const parts = block.text.split(/(\*\*[^*]+\*\*)/g);
                          return (
                            <p key={idx} className="text-gray-700 font-semibold mb-4 leading-relaxed">
                              {parts.map((part, i) => {
                                if (part.startsWith('**') && part.endsWith('**')) {
                                  return <strong key={i} className="text-black font-semibold">{part.slice(2, -2)}</strong>;
                                }
                                return part;
                              })}
                            </p>
                          );
                        }
                        if (block.type === 'spacer') {
                          return <div key={idx} className="h-2" />;
                        }
                        return null;
                      });
                    })()}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-full space-y-4 text-center">
                    <div className="bg-lime-400 h-20 w-20 flex items-center justify-center rounded-none shadow-lg">
                      <span className="font-mono font-extrabold text-black text-2xl">AI</span>
                    </div>
                    <p className="text-gray-600 font-mono font-medium text-lg">
                      UPLOAD YOUR PDF TO BEGIN
                    </p>
                    <p className="text-gray-500 font-mono text-sm">
                      INSTANT AI-POWERED ANALYSIS
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}