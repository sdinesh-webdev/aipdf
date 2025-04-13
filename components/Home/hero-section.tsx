'use client'
import Link from "next/link";
import Image from "next/image";
import { useState } from "react";

export default function HeroSection() {
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [isDragging, setIsDragging] = useState(false);

    const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement> | DragEvent) => {
        const file = event instanceof DragEvent 
            ? event.dataTransfer?.files[0]
            : event.target.files?.[0];

        if (file && file.type === 'application/pdf') {
            if (file.size <= 10 * 1024 * 1024) { // 10MB in bytes
                setSelectedFile(file);
            } else {
                alert('File size exceeds 10MB limit');
            }
        } else {
            alert('Please select a valid PDF file');
        }
    };

    const handleDrag = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
    };

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

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
        handleFileUpload(e as DragEvent);
    };

    return(
        <section className="w-screen h-[80vh] grid place-items-center">
            <div className="grid w-full max-w-7xl h-[50vh] gap-6 mx-4 my-4 md:grid-cols-2">
                <div className="bg-yellow-50 rounded-xl border-2  shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] p-6 flex flex-col justify-center items-center">
                    <h2 className="text-lg lg:text-3xl font-extrabold text-center text-black mb-4">Upload PDF</h2>
                   
                    <input
                        type="file"
                        accept=".pdf"
                        onChange={handleFileUpload}
                        className="hidden"
                        id="pdf-upload"
                    />
                    
                    <div 
                        className={`grid border-2 border-dashed ${isDragging ? 'border-green-500 bg-green-50' : 'border-gray-300'} w-full h-full rounded-md p-4 items-center justify-center cursor-pointer`}
                        onClick={() => document.getElementById('pdf-upload')?.click()}
                        onDragEnter={handleDragIn}
                        onDragLeave={handleDragOut}
                        onDragOver={handleDrag}
                        onDrop={handleDrop}
                    >
                        <div className="flex flex-col items-center justify-center text-center">
                            <Image 
                                src="/pdf.png" 
                                alt="Upload PDF" 
                                width={130} 
                                height={130} 
                                className="transform transition-all duration-300 ease-in-out hover:scale-110" 
                            />
                            <div className="flex gap-2 mt-4">
                                <p className="font-bold text-green-500 underline">Choose </p>
                                <p className="font-bold  text-gray-600">Your Files Here .</p>
                            </div>
                            <p className="font-semibold text-sm text-gray-600 m-0.5">10_MB Max PDF Size</p>
                        </div>

                        <div className="border-2 w-dvw max-w-lg h-18 rounded-md pd-4">
                            <p className="text-center p-2">{selectedFile ? selectedFile.name : ''}</p>
                        </div>
                    </div>
                </div>

                <div className="bg-yellow-50 rounded-xl border-2 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] p-6 flex flex-col justify-center items-center">
                    <h2 className="text-lg lg:text-3xl font-extrabold text-center text-black mb-4">Here's your summary</h2>
                    <div className="border-2 border-gray-300 w-full h-full rounded-md p-4 flex items-center justify-center">
                        {/* Content for the gray border box can go here */}
                    </div>
                </div>
            </div>
        </section>
    );
}