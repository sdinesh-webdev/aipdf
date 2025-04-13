'use server';

import { fetchandExtractPdfText } from "@/lib/langchain";
import { summarizeWithGeminiAI } from "@/lib/geminiai"; // Retain Gemini AI import
import { auth } from "@clerk/nextjs/server";
import { getDbConnection } from "@/lib/db";

/**
 * Processes the uploaded PDF and extracts its text content
 */
export async function generatedPdfSummary(uploadResponse: [{
    serverData: {
        file: {
            url: string;
            name: string;
        };
    };
}]) {
    const { userId } = await auth();
    if (!userId) {
        return { success: false, message: 'Unauthorized: User not authenticated', data: null };
    }

    // Log the user ID before proceeding
    console.log('Processing PDF for user:', userId);

    // Step 1: Validate the upload response
    if (!uploadResponse || !uploadResponse[0]?.serverData?.file?.url) {
        return { success: false, message: 'Oops! Looks like the upload response is missing or the PDF URL is nowhere to be found.', data: null };
    }

    const pdfUrl = uploadResponse[0].serverData.file.url;
    console.log('PDF URL:', pdfUrl); // Debug log to confirm the URL

    try {
        // Step 2: Extract text from the PDF using Langchain
        const pdfText = await fetchandExtractPdfText(pdfUrl);
        console.log('Extracted PDF Text:', pdfText); // Debug log to confirm extracted text

        if (!pdfText) {
            console.warn('No text extracted from the PDF.'); // Warning for empty text
            return { 
                success: false, 
                message: 'No text could be extracted from the PDF. Please ensure the PDF contains readable text.',
                data: null 
            };
        }

        // Additional debug log for successful extraction
        console.log('PDF text extraction successful. Text length:', pdfText.length);
        return {
            success: true,
            message: 'Text extracted successfully',
            data: pdfText
        };
    } catch (err: any) {
        console.error('PDF processing error:', err); // Enhanced error log
        if (err.response) {
            console.error('Error response:', err.response); // Log response details if available
        }
        return { 
            success: false, 
            message: `PDF processing failed: ${err.message}`,
            data: null 
        };
    }
}

/**
 * Summarizes the extracted text using Gemini AI
 */
export async function summarizeExtractedText(extractedText: string) {
    try {
        console.log('Starting Gemini AI summarization...');
        const summary = await summarizeWithGeminiAI(extractedText);
        console.log('Gemini AI Summary:', summary);
        return { success: true, data: summary };
    } catch (err: any) {
        console.error('Gemini AI summarization error:', err);
        return { success: false, message: `Summarization failed: ${err.message}`, data: null };
    }
}

/**
 * Saves PDF summary to the database
 * @param {Object} params - The summary parameters
 * @param {string} params.fileUrl - URL of the stored PDF
 * @param {string} params.summary - Generated summary content
 * @param {string} params.title - Title of the summary
 * @returns {Promise<{success: boolean, message?: string}>}
 * @throws {Error} When required fields are missing or database operation fails
 */
async function savePdfSummary({
    fileUrl,
    summary,
    title
}: {
    fileUrl: string;
    summary: string;
    title: string;
}): Promise<{ success: boolean; message?: string }> {
    const { userId: clerkUserId } = await auth();
    if (!clerkUserId) {
        throw new Error('Unauthorized: User not authenticated');
    }

    // Input validation
    if (!fileUrl || !summary || !title) {
        throw new Error('Missing required fields');
    }

    try {
        const sql = await getDbConnection();
        
        // First, get the user's UUID from the users table using clerk_user_id
        const userResult = await sql`
            SELECT id 
            FROM users 
            WHERE clerk_user_id = ${clerkUserId}
        `;

        if (!userResult || userResult.length === 0) {
            throw new Error('User not found in database');
        }

        const userUuid = userResult[0].id;

        // Insert the summary with the correct user UUID
        await sql`
            INSERT INTO summaries (
                user_id,
                title,
                pdf_url,
                summary,
                status
            ) VALUES (
                ${userUuid},
                ${title},
                ${fileUrl},
                ${summary},
                'completed'
            )
        `;

        return { 
            success: true, 
            message: 'Summary saved successfully' 
        };
    } catch (error) {
        console.error('Error saving PDF summary:', error);
        if (error instanceof Error) {
            // Check for specific database errors
            if (error.message.includes('foreign key constraint')) {
                throw new Error('Failed to save: User reference invalid');
            }
            throw new Error(error.message);
        }
        throw new Error('Failed to save PDF summary');
    }
}

/**
 * Main action to store PDF summary
 * @param {Object} params - The action parameters
 * @returns {Promise<{success: boolean, message: string, data?: any}>}
 */
export async function storePdfSummaryAction({
    fileUrl,
    summary,
    title,
}: {
    fileUrl: string;
    summary: string;
    title: string;
}): Promise<{
    success: boolean;
    message: string;
    data?: any;
}> {
    try {
        // Validate required inputs
        if (!fileUrl || !summary || !title) {
            return {
                success: false,
                message: 'Missing required fields',
            };
        }

        // Store the summary
        const result = await savePdfSummary({
            fileUrl,
            summary,
            title,
        });

        // Return success response
        return {
            success: true,
            message: 'PDF summary stored successfully',
            data: result
        };

    } catch (error) {
        // Error handling and logging
        console.error('Error in storePdfSummaryAction:', error);
        return {
            success: false,
            message: error instanceof Error ? error.message : 'Failed to store PDF summary',
        };
    }
// }