"use client";

import { useRef, useState } from "react";
import type { ChangeEvent, DragEvent, MouseEvent } from "react";
import { AlertOctagon, CheckCircle, FileText, ShieldAlert, UploadCloud } from "lucide-react";

import { api } from "@/lib/api";
import type { FraudScanResult } from "@/lib/types";
import { cn } from "@/lib/utils";

type FraudScannerProps = {
  title?: string;
  description?: string;
  compact?: boolean;
  showHighRiskOverlay?: boolean;
};

const HIGH_RISK_THRESHOLD = 80;

export default function FraudScanner({
  title = "Fraud Intelligence Center",
  description = "Drag and drop receipts or invoices to scan for anomalies and suspicious activity.",
  compact = false,
  showHighRiskOverlay = false,
}: FraudScannerProps) {
  const [dragActive, setDragActive] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<FraudScanResult | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const isHighRisk = result ? result.risk_score >= HIGH_RISK_THRESHOLD : false;
  const highRiskResult = isHighRisk ? result : null;

  function handleDrag(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    setDragActive(event.type === "dragenter" || event.type === "dragover");
  }

  async function handleSelectedFile(selectedFile: File) {
    setFileName(selectedFile.name);
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      setResult(await api.scanFraudDocument(selectedFile));
    } catch (scanError: unknown) {
      setError(scanError instanceof Error ? scanError.message : "Unable to scan this document.");
    } finally {
      setLoading(false);
    }
  }

  async function handleDrop(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    setDragActive(false);

    const droppedFile = event.dataTransfer.files[0];
    if (droppedFile) {
      await handleSelectedFile(droppedFile);
    }
  }

  async function handleChange(event: ChangeEvent<HTMLInputElement>) {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
      await handleSelectedFile(selectedFile);
    }
  }

  function resetScanner(event?: MouseEvent) {
    event?.stopPropagation();
    setFileName(null);
    setError(null);
    setResult(null);
    if (inputRef.current) {
      inputRef.current.value = "";
    }
  }

  return (
    <div className="relative">
      {showHighRiskOverlay && highRiskResult && (
        <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-red-600/95 p-8 text-center text-white backdrop-blur-sm animate-in fade-in duration-300">
          <AlertOctagon size={64} className="mb-4 animate-pulse text-red-100" />
          <h2 className="mb-2 text-3xl font-bold tracking-tight">High Risk Alert</h2>
          <div className="mb-4 rounded-lg border border-white/20 bg-white/10 px-4 py-2 font-mono text-red-50">
            Risk Score: {highRiskResult.risk_score}/100
          </div>
          <p className="max-w-md text-lg font-medium">{highRiskResult.reason}</p>
          <button
            onClick={resetScanner}
            className="mt-8 rounded-lg bg-white px-8 py-3 font-bold text-red-600 shadow-lg transition-all hover:-translate-y-0.5 hover:bg-red-50 hover:shadow-xl"
          >
            Acknowledge & Close
          </button>
        </div>
      )}

      <div className="mb-5 flex items-center gap-3">
        <div className="shrink-0 rounded-lg bg-indigo-100 p-2 text-indigo-600">
          <ShieldAlert size={compact ? 20 : 28} />
        </div>
        <div>
          <h2 className={cn("font-semibold text-slate-900", compact ? "text-base" : "text-3xl")}>{title}</h2>
          <p className="text-sm text-slate-500">{description}</p>
        </div>
      </div>

      <div
        className={cn(
          "flex min-h-[220px] cursor-pointer flex-col items-center justify-center border-2 border-dashed bg-white p-8 text-center transition-colors",
          compact ? "rounded-lg" : "rounded-xl",
          dragActive ? "border-indigo-500 bg-indigo-50" : "border-slate-200 hover:bg-slate-50"
        )}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
      >
        <input ref={inputRef} type="file" className="hidden" onChange={handleChange} accept="image/*,.pdf" />

        {loading ? (
          <div className="flex flex-col items-center gap-3">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-indigo-200 border-t-indigo-600" />
            <p className="font-medium text-indigo-600">Scanning document...</p>
          </div>
        ) : result && !isHighRisk ? (
          <div className="flex flex-col items-center gap-3 animate-in zoom-in-95">
            <div className="rounded-full bg-emerald-100 p-3 text-emerald-600">
              <CheckCircle size={32} />
            </div>
            <div>
              <p className="font-semibold text-emerald-700">Document Verified Safe</p>
              <p className="text-sm text-emerald-600/80">{result.reason}</p>
              <p className="mt-2 font-mono text-xs text-emerald-600">Risk Score: {result.risk_score}/100</p>
            </div>
            <button onClick={resetScanner} className="mt-2 text-sm font-medium text-indigo-600 hover:underline">
              Scan another document
            </button>
          </div>
        ) : result && isHighRisk && !showHighRiskOverlay ? (
          <div className="flex max-w-md flex-col items-center gap-3 animate-in zoom-in-95">
            <div className="rounded-full bg-red-100 p-3 text-red-600">
              <AlertOctagon size={36} />
            </div>
            <p className="text-lg font-bold text-red-700">High Risk Alert</p>
            <p className="text-sm text-red-600">{result.reason}</p>
            <p className="font-mono text-xs text-red-600">Risk Score: {result.risk_score}/100</p>
            <button onClick={resetScanner} className="mt-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-bold text-white">
              Block Transaction & Close
            </button>
          </div>
        ) : (
          <>
            <div
              className={cn(
                "mb-3 rounded-full p-4 transition-colors",
                dragActive ? "bg-indigo-100 text-indigo-600" : "bg-slate-100 text-slate-400"
              )}
            >
              <UploadCloud size={compact ? 32 : 48} />
            </div>
            <p className="text-sm font-semibold text-slate-700">
              Click to upload <span className="font-normal text-slate-500">or drag and drop</span>
            </p>
            <p className="mt-1 text-xs text-slate-400">SVG, PNG, JPG or PDF up to 5MB</p>
            {fileName && (
              <div className="mt-6 flex items-center justify-center gap-2 font-medium text-indigo-600">
                <FileText size={20} />
                {fileName}
              </div>
            )}
            {error && <p className="mt-4 text-sm font-medium text-red-600">{error}</p>}
          </>
        )}
      </div>
    </div>
  );
}
