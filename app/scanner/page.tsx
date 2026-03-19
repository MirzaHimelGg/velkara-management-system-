"use client";

import React, { useEffect } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';

export default function ScannerPage() {
  useEffect(() => {
    const scanner = new Html5QrcodeScanner(
      "reader",
      { fps: 10, qrbox: { width: 250, height: 250 } },
      /* verbose= */ false
    );

    function onScanSuccess(decodedText: string, decodedResult: any) {
      // This sends the barcode to your POS system
      alert(`Barcode Scanned: ${decodedText}`);
      window.location.href = `/pos?sku=${decodedText}`;
      scanner.clear();
    }

    scanner.render(onScanSuccess, (error) => {
      // Handle scan errors silently
    });

    return () => {
      scanner.clear();
    };
  }, []);

  return (
    <div className="min-h-screen bg-gray-100 p-8 flex flex-col items-center">
      <h1 className="text-2xl font-bold mb-4 text-black">Velkara Barcode Scanner</h1>
      <div id="reader" className="w-full max-w-md bg-white rounded-lg overflow-hidden shadow-lg"></div>
      <p className="mt-4 text-gray-600">Point your camera at a clothing tag barcode</p>
      <button 
        onClick={() => window.location.href = '/'}
        className="mt-8 text-blue-600 underline"
      >
        Back to Dashboard
      </button>
    </div>
  );
}

