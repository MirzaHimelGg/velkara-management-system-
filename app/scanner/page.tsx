"use client";
import React, { useEffect } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';

export default function ScannerPage() {
  useEffect(() => {
    // We create the scanner inside the effect
    const scanner = new Html5QrcodeScanner(
      "reader", 
      { fps: 10, qrbox: { width: 250, height: 250 } }, 
      /* verbose= */ false
    );

    // This function handles the successful scan
    const onScanSuccess = (decodedText: string) => {
      window.location.href = `/pos?sku=${decodedText}`;
      scanner.clear().catch(err => console.error("Failed to clear scanner", err));
    };

    const onScanFailure = (error: any) => {
      // We ignore constant scanning attempts to keep the console clean
    };

    scanner.render(onScanSuccess, onScanFailure);

    // This is the cleanup function React wants
    return () => {
      scanner.clear().catch(err => console.error("Cleanup failed", err));
    };
  }, []);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50 p-6">
      <div className="bg-white/70 backdrop-blur-xl p-8 rounded-[40px] shadow-2xl border border-white w-full max-w-md">
        <h1 className="text-3xl font-black text-center mb-8 tracking-tight text-slate-900">Velkara Scanner</h1>
        
        <div id="reader" className="overflow-hidden rounded-3xl border-4 border-white shadow-inner bg-slate-100"></div>
        
        <p className="text-center text-slate-500 mt-6 font-medium">
          Align the barcode within the frame
        </p>
        
        <button 
          onClick={() => window.location.href = '/dashboard'}
          className="w-full mt-8 py-4 bg-white border border-slate-200 rounded-2xl font-bold text-slate-600 hover:bg-slate-50 transition-all"
        >
          Cancel Scanning
        </button>
      </div>
    </div>
  );
}
