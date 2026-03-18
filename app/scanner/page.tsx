"use client";
import { Html5QrcodeScanner } from "html5-qrcode";
import { useEffect } from "react";

export default function BarcodeScanner({ onScanSuccess }: { onScanSuccess: (decodedText: string) => void }) {
  useEffect(() => {
    const scanner = new Html5QrcodeScanner(
      "reader",
      { fps: 10, qrbox: { width: 250, height: 150 } },
      /* verbose= */ false
    );

    scanner.render(
      (decodedText) => {
        onScanSuccess(decodedText);
        // Optional: stop scanning after a success to prevent multiple scans
        // scanner.clear(); 
      },
      (error) => {
        // Softly handle scan errors (like "no barcode in view")
      }
    );

    return () => {
      scanner.clear().catch(error => console.error("Failed to clear scanner", error));
    };
  }, [onScanSuccess]);

  return (
    <div className="p-4 bg-white rounded-xl shadow-md">
      <h2 className="text-lg font-bold mb-4">Scan Item Barcode</h2>
      <div id="reader" className="overflow-hidden rounded-lg"></div>
    </div>
  );
}
