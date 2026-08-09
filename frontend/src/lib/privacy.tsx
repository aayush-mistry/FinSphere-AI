import { useState } from 'react';

// Temporary fallback for Privacy Mode until a global store is found or implemented.
export function usePrivacyMode() {
  const [isPrivacyMode, setIsPrivacyMode] = useState(false);
  
  const togglePrivacy = () => setIsPrivacyMode(prev => !prev);
  
  return { isPrivacyMode, togglePrivacy };
}

export function PrivacyMask({ 
  value, 
  isPrivacyMode, 
  mask = '••••••' 
}: { 
  value: React.ReactNode; 
  isPrivacyMode: boolean;
  mask?: string;
}) {
  if (isPrivacyMode) {
    return <span className="font-mono text-slate-400 blur-[4px] select-none">{mask}</span>;
  }
  return <>{value}</>;
}
