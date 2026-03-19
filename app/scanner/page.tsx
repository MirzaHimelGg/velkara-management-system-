"use client";
import React, { useEffect, useState } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { createClient } from '@supabase/supabase-js';
import { ArrowLeft, PackagePlus, ShoppingCart, RefreshCcw } from 'lucide-react';

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);

export default function ScannerPage() {
  const [mode, setMode] = useState<'POS' | 'RESTOCK'>('POS');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const scanner = new Html5QrcodeScanner(
      "reader", { fps: 10, qrbox: { width: 250, height: 250 } }, false
    );

    const onScanSuccess = async (sku: string) => {
      if (mode === 'POS') {
        // Mode 1: Send to Billing
        window.location.href = `/pos?sku=${sku}`;
      } else {
        // Mode 2: Direct Restock (Add 1 back to inventory)
        setLoading(true);
        const { data, error } = await supabase.from('products').select('id, name, stock').eq('sku', sku).single();
        
        if (data) {
          const { error: updateError } = await supabase
            .from('products')
            .update({ stock: (data.stock || 0) + 1 })
            .eq('id', data.id);
          
          if (!updateError) {
            alert(`Restocked: 1 unit of ${data.name} added back.`);
          }
        } else {
          alert("SKU not found in Velkara database.");
        }
        setLoading(false);
      }
    };

    scanner.render(onScanSuccess, (err) => {});
    return () => { scanner.clear().catch(() => {}); };
  }, [mode]); // Re-run if mode changes

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center p-6">
      <div className="w-full max-w-md bg-white/80 backdrop-blur-2xl rounded-[40px] shadow-2xl p-8 border border-white">
        <div className="flex justify-between items-center mb-8">
          <button onClick={() => window.location.href='/dashboard'}><ArrowLeft /></button>
          <h1 className="text-2xl font-black">Velkara Cam</h1>
          <div className="w-6" />
        </div>

        {/* MODE TOGGLE */}
        <div className="flex bg-slate-100 p-1.5 rounded-2xl mb-8">
          <button 
            onClick={() => setMode('POS')}
            className={`flex-1 flex items-center justify-center py-3 rounded-xl font-bold transition-all ${mode === 'POS' ? 'bg-white shadow-md text-blue-600' : 'text-slate-400'}`}
          >
            <ShoppingCart className="w-4 h-4 mr-2" /> SELL
          </button>
          <button 
            onClick={() => setMode('RESTOCK')}
            className={`flex-1 flex items-center justify-center py-3 rounded-xl font-bold transition-all ${mode === 'RESTOCK' ? 'bg-white shadow-md text-emerald-600' : 'text-slate-400'}`}
          >
            <PackagePlus className="w-4 h-4 mr-2" /> RESTOCK
          </button>
        </div>

        <div id="reader" className="rounded-3xl overflow-hidden border-4 border-white shadow-inner"></div>

        {loading && (
          <div className="mt-6 flex items-center justify-center text-blue-600 font-bold">
            <RefreshCcw className="animate-spin mr-2" /> Updating Inventory...
          </div>
        )}

        <p className="text-center text-slate-400 text-xs mt-8 font-bold uppercase tracking-widest">
          {mode === 'POS' ? 'Scanning will add item to POS cart' : 'Scanning will add +1 to product stock'}
        </p>
      </div>
    </div>
  );
}
