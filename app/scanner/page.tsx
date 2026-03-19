"use client";
import React, { useEffect } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';

export default function ScannerPage() {
  useEffect(() => {
    const scanner = new Html5QrcodeScanner(
      "reader", { fps: 10, qrbox: { width: 250, height: 250 } }, false
    );

    scanner.render((decodedText) => {
      // SUCCESS: Send the barcode to the POS page as a "query parameter"
      window.location.href = `/pos?sku=${decodedText}`;
      scanner.clear();
    }, (error) => { /* ignore scan errors */ });

    return () => scanner.clear();
  }, []);

  return (
    <div className="flex flex-col items-center p-8 bg-slate-50 min-h-screen">
      <h1 className="text-2xl font-black mb-6">Velkara Scanner</h1>
      <div id="reader" className="w-full max-w-md bg-white rounded-3xl overflow-hidden shadow-2xl border-8 border-white"></div>
      <button onClick={() => window.location.href='/dashboard'} className="mt-8 text-slate-500 underline font-medium">Cancel</button>
    </div>
  );
}
