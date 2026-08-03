"use client";

import React, { useState, useRef } from 'react';
import { UploadCloud, ShieldAlert, CheckCircle, FileText, AlertOctagon } from 'lucide-react';

export default function FraudEnginePage() {
  const [dragActive, setDragActive] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ risk_score: number; reason: string } | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      await handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      await handleFile(e.target.files[0]);
    }
  };

  const handleFile = async (selectedFile: File) => {
    setFile(selectedFile);
    setLoading(true);
    setResult(null);

    const formData = new FormData();
    formData.append("file", selectedFile);

    try {
      const res = await fetch('http://localhost:8000/api/fraud/scan', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      setResult(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 relative">
      <div className="flex items-center gap-3">
        <div className="p-3 bg-indigo-100 text-indigo-600 rounded-xl">
          <ShieldAlert size={28} />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-slate-800">Fraud Intelligence Engine</h1>
          <p className="text-slate-500">Upload invoices or payment requests. AI will scan for high-risk patterns.</p>
        </div>
      </div>

      <div 
        className={`border-2 border-dashed rounded-3xl p-12 text-center transition-colors bg-white ${dragActive ? 'border-indigo-500 bg-indigo-50' : 'border-slate-300 hover:bg-slate-50'}`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
      >
        <input 
          ref={inputRef} 
          type="file" 
          className="hidden" 
          onChange={handleChange} 
          accept="image/*,.pdf"
        />
        <UploadCloud size={48} className={`mx-auto mb-4 ${dragActive ? 'text-indigo-600' : 'text-slate-400'}`} />
        <p className="text-lg font-medium text-slate-700">Drag & drop a file here</p>
        <p className="text-slate-500 text-sm mt-1">or click to browse from your computer</p>
        
        {file && (
          <div className="mt-6 flex items-center justify-center gap-2 text-indigo-600 font-medium">
            <FileText size={20} />
            {file.name}
          </div>
        )}
      </div>

      {loading && (
        <div className="flex flex-col items-center justify-center py-8 space-y-4">
          <div className="w-16 h-16 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
          <p className="text-indigo-600 font-medium animate-pulse">AI is scanning document for anomalies...</p>
        </div>
      )}

      {/* Red Alert Modal for High Risk */}
      {result && result.risk_score >= 80 && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-red-600 text-white rounded-3xl p-8 max-w-lg w-full shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex justify-center mb-6">
              <AlertOctagon size={80} className="text-red-200 animate-pulse" />
            </div>
            <h2 className="text-3xl font-bold text-center mb-2">High Risk Alert!</h2>
            <div className="bg-red-700/50 rounded-xl p-4 mb-6">
              <p className="font-mono text-xl text-center">Risk Score: <span className="font-bold text-red-200">{result.risk_score}/100</span></p>
            </div>
            <p className="text-lg text-center mb-8 text-red-100">{result.reason}</p>
            <button 
              onClick={() => setResult(null)}
              className="w-full bg-white text-red-600 font-bold py-4 rounded-xl hover:bg-red-50 transition-colors"
            >
              Block Transaction & Close
            </button>
          </div>
        </div>
      )}

      {/* Safe Result */}
      {result && result.risk_score < 80 && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-6 flex items-start gap-4 animate-in slide-in-from-bottom-4">
          <div className="bg-emerald-100 p-2 rounded-full text-emerald-600 shrink-0">
            <CheckCircle size={24} />
          </div>
          <div>
            <h3 className="text-lg font-bold text-emerald-800">Document is Safe</h3>
            <p className="text-emerald-700 mt-1">{result.reason}</p>
            <p className="text-sm text-emerald-600 mt-2 font-mono">Risk Score: {result.risk_score}/100</p>
          </div>
        </div>
      )}
    </div>
  );
}
