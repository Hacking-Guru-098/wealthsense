import React, { useState, useRef } from 'react';
import { UploadCloud, File as FileIcon, X } from 'lucide-react';

export default function FileUpload({ onFileSelect, onManualFallback }) {
  const [dragActive, setDragActive] = useState(false);
  const [file, setFile] = useState(null);
  const inputRef = useRef(null);

  const handleDrag = (e) => { 
    e.preventDefault(); e.stopPropagation(); 
    if (e.type === "dragenter" || e.type === "dragover") setDragActive(true); 
    else if (e.type === "dragleave") setDragActive(false); 
  };
  const handleDrop = (e) => { 
    e.preventDefault(); e.stopPropagation(); 
    setDragActive(false); 
    if (e.dataTransfer.files && e.dataTransfer.files[0]) handleFile(e.dataTransfer.files[0]); 
  };
  const handleChange = (e) => { 
    e.preventDefault(); 
    if (e.target.files && e.target.files[0]) handleFile(e.target.files[0]); 
  };
  
  const handleFile = (selectedFile) => {
    if (selectedFile.type === "application/pdf") {
      setFile(selectedFile);
      onFileSelect(selectedFile);
    } else { alert("Please upload a PDF file (e.g., CAMS statement)."); }
  };

  return (
    <div className="w-full max-w-lg mx-auto">
      <div 
        className={`border-2 border-dashed rounded-3xl p-10 flex flex-col items-center justify-center transition-all duration-200 ${dragActive ? 'border-indigo-600 bg-indigo-50/50 scale-[1.02]' : 'border-gray-300 bg-gray-50 hover:bg-gray-100'}`}
        onDragEnter={handleDrag} onDragLeave={handleDrag} onDragOver={handleDrag} onDrop={handleDrop}
      >
        <input ref={inputRef} type="file" className="hidden" accept=".pdf" onChange={handleChange} />
        {!file ? (
          <div className="flex flex-col items-center cursor-pointer text-center" onClick={() => inputRef.current.click()}>
            <div className="w-20 h-20 rounded-full bg-white shadow-sm flex items-center justify-center mb-6">
               <UploadCloud className="w-10 h-10 text-indigo-600" />
            </div>
            <p className="text-xl font-bold text-gray-900">Drag & Drop CAMS Statement</p>
            <p className="text-sm font-medium text-gray-500 mt-2">Only .pdf format is supported</p>
          </div>
        ) : (
          <div className="flex flex-col items-center text-center">
            <div className="w-20 h-20 rounded-full bg-indigo-100 flex items-center justify-center mb-6 relative">
              <FileIcon className="w-10 h-10 text-indigo-600" />
            </div>
            <p className="text-lg font-bold text-gray-900 w-64 truncate px-4">{file.name}</p>
            <div className="flex gap-4 mt-8">
              <button onClick={() => onFileSelect(file)} className="px-6 py-2.5 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 shadow-sm transition">Analyze Portfolio</button>
              <button onClick={(e) => { e.stopPropagation(); setFile(null); inputRef.current.value = null; }} className="px-6 py-2.5 text-red-600 bg-red-50 rounded-xl hover:bg-red-100 font-bold transition">Remove</button>
            </div>
          </div>
        )}
      </div>
      <div className="mt-8 text-center flex items-center justify-center gap-4">
        <div className="h-px bg-gray-200 flex-1"></div>
        <span className="text-sm font-bold text-gray-400 uppercase tracking-widest">or</span>
        <div className="h-px bg-gray-200 flex-1"></div>
      </div>
      <div className="mt-6 text-center">
        <button onClick={onManualFallback} className="text-indigo-600 font-bold hover:text-indigo-800 transition underline underline-offset-4 decoration-2 decoration-indigo-200 hover:decoration-indigo-600">Enter portfolio data manually</button>
      </div>
    </div>
  );
}
