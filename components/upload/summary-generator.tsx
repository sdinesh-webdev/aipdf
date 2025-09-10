import * as React from 'react';
import { toast } from 'sonner';
import { summarizeExtractedText, storePdfSummaryAction } from '@/actions/upload-actions';

interface SummaryGeneratorProps {
  extractedText: string;
  fileUrl: string;
}

export function SummaryGenerator({ extractedText, fileUrl }: SummaryGeneratorProps) {
  const [summary, setSummary] = React.useState<string>('');
  const [isSummarizing, setIsSummarizing] = React.useState(false);
  const [isStoring, setIsStoring] = React.useState(false);

  React.useEffect(() => {
    const generateSummary = async () => {
      setIsSummarizing(true);
      const summaryToastId = toast.loading('🤖 AI is working its magic...', {
        duration: Infinity,
      });
      
      const summarizationResult = await summarizeExtractedText(extractedText);
      toast.dismiss(summaryToastId);
      
      if (summarizationResult.success && summarizationResult.data) {
        // ✅ only set if data is non-null
        setSummary(summarizationResult.data);
        await storeSummary(summarizationResult.data);
      } else {
        toast.error('😕 Summarization hiccup', {
          description: summarizationResult.message,
          duration: 4000,
        });
      }
      setIsSummarizing(false);
    };

    if (extractedText) {
      generateSummary();
    }
  }, [extractedText, fileUrl]);

  const storeSummary = async (summaryText: string) => {
    setIsStoring(true);
    const storeToastId = toast.loading('💾 Saving your summary...', {
      duration: Infinity,
    });

    const storeResult = await storePdfSummaryAction({
      fileUrl,
      summary: summaryText,
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
  };

  return (
    <div>
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
