'use client';
import { useState } from 'react';
import UploadHeader from "../upload/upload-header";

export default function HeroSection() {
  const [hovering, setHovering] = useState(false);
    const [showUpload, setShowUpload] = useState(false);
  
  return (
    <>
    <div className="relative w-full bg-black text-white overflow-hidden min-h-screen xl:min-h-[120vh] 2xl:min-h-[140vh] flex flex-col justify-start">
      {/* Grid background */}
      <div className="absolute inset-0 opacity-10 pointer-events-none">
        <div className="grid grid-cols-12 h-full">
          {Array(12).fill(null).map((_, i) => (
            <div key={i} className="border-r border-white h-full"></div>
          ))}
        </div>
        <div className="grid grid-rows-12 h-full w-full absolute top-0">
          {Array(12).fill(null).map((_, i) => (
            <div key={i} className="border-b border-white w-full"></div>
          ))}
        </div>
      </div>
      <div className="max-w-[1800px] mx-auto px-2 sm:px-8 lg:px-16 py-48 md:py-64 relative z-10 w-full translate-y-[-10%]">
        {/* Small title intro */}
        <div className="mb-12 flex items-center space-x-4">
          <div className="h-1 w-16 bg-lime-400"></div>
          <p className="text-lg uppercase tracking-[0.3em] font-mono text-lime-400">AI-Powered Document Processing</p>
        </div>
        {/* Main headline */}
        <h1 className="text-[6vw] md:text-[5vw] xl:text-[4vw] 2xl:text-[3.5vw] font-extrabold mb-16 font-mono tracking-tight leading-tight">
          PDF<span className="text-lime-400">→</span>SUMMARY
        </h1>
        {/* Short description */}
        <p className="text-3xl md:text-4xl font-light mb-20 md:w-2/3 tracking-wide">
          Complex documents distilled into clarity. AI-powered summaries delivered in seconds.
        </p>
        {/* CTA area */}
            <div className="flex flex-col md:flex-row space-y-6 md:space-y-0 md:space-x-12 jus">
          <button 
            className="bg-white text-black font-mono text-3xl font-bold px-16 py-8 border-4 border-white hover:bg-lime-400 hover:border-gray-800 hover:text-gray-800 hover:font-semibold transition-colors duration-300 shadow-xl"
            onMouseEnter={() => setHovering(true)}
            onMouseLeave={() => setHovering(false)}
            onClick={() => setShowUpload(true)}
          >
            UPLOAD PDF
          </button>
          <div className="flex items-center md:ml-12">
            <div className="bg-lime-400 h-20 w-20 flex items-center justify-center mr-6 rounded-lg shadow-lg">
              <span className="font-mono font-extrabold text-black text-2xl">AI</span>
            </div>
            <p className="font-mono text-xl leading-tight">Powered by advanced<br/>machine learning algorithms</p>
          </div>
        </div>
        {/* Decorative element */}
        <div className="absolute -right-32 bottom-0 opacity-20 md:opacity-40">
          <div className="w-[32rem] h-[32rem] border-8 border-lime-400 rotate-12"></div>
        </div>
        {/* Bottom stats bar */}
        <div className="absolute bottom-[-15px] left-0 right-0 border-t border-gray-800 mt-32">
          <div className="grid grid-cols-3 divide-x divide-gray-800">
            <div className="px-12 py-8">
              <p className="text-lg text-gray-500 uppercase tracking-wider">Processing Speed</p>
              <p className="font-mono font-extrabold text-2xl">2.4 SECONDS</p>
            </div>
            <div className="px-12 py-8">
              <p className="text-lg text-gray-500 uppercase tracking-wider">Accuracy</p>
              <p className="font-mono font-extrabold text-2xl">98.7%</p>
            </div>
            <div className="px-12 py-8">
              <p className="text-lg text-gray-500 uppercase tracking-wider">File Size Limit</p>
              <p className="font-mono font-extrabold text-2xl">100MB</p>
            </div>
          </div>
        </div>
      </div>
      {/* Brutalist decorative elements */}
      <div className="absolute top-24 right-24 w-32 h-32 bg-lime-400 hidden md:block rounded-xl"></div>
      <div className="absolute top-0 left-0 w-8 h-full bg-lime-400"></div>
      {/* UploadHeader below hero section */}
      <div className="relative z-20  bottom-0">
        {/* <UploadHeader /> */}
      </div>
    </div>
      {showUpload && (
          <div className="fixed inset-0 bg-black/80 z-[100] flex items-center justify-center w-full">
          <div className="">
            <button 
              onClick={() => setShowUpload(false)}
              className="absolute top-18  right-4 text-gray-100 z-20 hover:text-gray-200 text-xl p-2 font-extrabold"
            >
              ✕ 
            </button>
            <UploadHeader />
          </div>
        </div>
      )}

    </>
  );
}