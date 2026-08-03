"use client";

import React, { useState, useRef } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { ShieldAlert, UploadCloud, AlertOctagon, FileText, CheckCircle } from 'lucide-react';

export default function FraudIntelligenceCenter() {
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

  const resetScanner = () => {
    setFile(null);
    setResult(null);
  };

  return (
    <Card className="col-span-4 lg:col-span-7 border-slate-100 shadow-sm bg-white overflow-hidden relative group">
      {/* High Risk Overlay */}
      {result && result.risk_score === 95 && (
        <div className="absolute inset-0 z-50 bg-red-600/95 backdrop-blur-sm flex flex-col items-center justify-center text-white p-8 animate-in fade-in duration-300">
          <AlertOctagon size={64} className="text-red-100 mb-4 animate-pulse" />
          <h2 className="text-3xl font-bold tracking-tight mb-2">High Risk Alert</h2>
          <div className="bg-white/10 px-4 py-2 rounded-lg font-mono mb-4 text-red-50 border border-white/20">
            Risk Score: {result.risk_score}/100
          </div>
          <p className="text-lg text-center max-w-md font-medium">{result.reason}</p>
          <button 
            onClick={resetScanner}
            className="mt-8 bg-white text-red-600 font-bold px-8 py-3 rounded-xl hover:bg-red-50 transition-colors shadow-lg hover:shadow-xl hover:-translate-y-0.5"
          >
            Acknowledge & Close
          </button>
        </div>
      )}

      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="p-2 bg-indigo-100 text-indigo-600 rounded-lg shrink-0">
            <ShieldAlert size={20} />
          </div>
          <div>
            <CardTitle className="text-slate-900">Fraud Intelligence Center</CardTitle>
            <CardDescription>Drag and drop receipts or invoices to scan for anomalies and suspicious activity.</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div 
          className={`border-2 border-dashed rounded-2xl p-8 flex flex-col items-center justify-center text-center transition-colors min-h-[200px] cursor-pointer
            ${dragActive ? 'border-indigo-500 bg-indigo-50' : 'border-slate-200 hover:bg-slate-50'}`}
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
          
          {loading ? (
            <div className="flex flex-col items-center space-y-3">
              <div className="w-10 h-10 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
              <p className="text-indigo-600 font-medium">Scanning document...</p>
            </div>
          ) : result && result.risk_score < 95 ? (
            <div className="flex flex-col items-center space-y-3 animate-in zoom-in-95">
              <div className="p-3 bg-emerald-100 text-emerald-600 rounded-full">
                <CheckCircle size={32} />
              </div>
              <div>
                <p className="font-semibold text-emerald-700">Document Verified Safe</p>
                <p className="text-sm text-emerald-600/80">{result.reason}</p>
              </div>
              <button 
                onClick={(e) => { e.stopPropagation(); resetScanner(); }}
                className="mt-2 text-sm text-indigo-600 font-medium hover:underline"
              >
                Scan another document
              </button>
            </div>
          ) : (
            <>
              <div className={`p-4 rounded-full mb-3 transition-colors ${dragActive ? 'bg-indigo-100 text-indigo-600' : 'bg-slate-100 text-slate-400 group-hover:bg-indigo-50 group-hover:text-indigo-500'}`}>
                <UploadCloud size={32} />
              </div>
              <p className="text-sm font-semibold text-slate-700">
                Click to upload <span className="font-normal text-slate-500">or drag and drop</span>
              </p>
              <p className="text-xs text-slate-400 mt-1">SVG, PNG, JPG or PDF (max. 5MB)</p>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
