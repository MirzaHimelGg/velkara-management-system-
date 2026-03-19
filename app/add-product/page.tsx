"use client";
import React, { useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import { Plus, X, Save, ArrowLeft, Loader2, Printer } from 'lucide-react';

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);

export default function AddProduct() {
  const [name, setName] = useState('');
  const [category, setCategory] = useState('');
  const [price, setPrice] = useState('');
  const [sizes, setSizes] = useState<string[]>([]);
  const [colors, setColors] = useState<string[]>([]);
  const [currentSize, setCurrentSize] = useState('');
  const [currentColor, setCurrentColor] = useState('');
  const [loading, setLoading] = useState(false);

  const addTag = (type: 'size' | 'color') => {
    if (type === 'size' && currentSize.trim()) {
      if (!sizes.includes(currentSize.trim())) setSizes([...sizes, currentSize.trim()]);
      setCurrentSize('');
    } else if (type === 'color' && currentColor.trim()) {
      if (!colors.includes(currentColor.trim())) setColors([...colors, currentColor.trim()]);
      setCurrentColor('');
    }
  };

  // --- THE LABEL PRINTER ENGINE ---
  const printBarcodes = (variants: any[]) => {
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>Velkara Labels</title>
            <style>
              body { display: flex; flex-wrap: wrap; gap: 10px; font-family: sans-serif; padding: 20px; }
              .label { 
                width: 150px; border: 1px solid #000; padding: 10px; text-align: center; 
                border-radius: 5px; page-break-inside: avoid;
              }
              .brand { font-weight: 900; font-size: 14px; margin-bottom: 2px; }
              .name { font-size: 10px; color: #555; }
              .price { font-size: 16px; font-weight: 900; margin: 5px 0; }
              .sku { font-family: 'Libre Barcode 39', 'Courier New', monospace; font-size: 12px; border-top: 1px dashed #ccc; padding-top: 5px; }
              .details { font-size: 9px; font-weight: bold; text-transform: uppercase; }
            </style>
          </head>
          <body>
            ${variants.map(v => `
              <div class="label">
                <div class="brand">VELKARA.</div>
                <div class="name">${v.name}</div>
                <div class="price">৳${v.price}</div>
                <div class="details">${v.variant_size} / ${v.variant_color}</div>
                <div class="sku">${v.sku}</div>
              </div>
            `).join('')}
            <script>window.onload = function() { window.print(); window.close(); };</script>
          </body>
        </html>
      `);
      printWindow.document.close();
    }
  };

  const handleGenerateAndSave = async () => {
    if (!name || sizes.length === 0 || colors.length === 0 || !price || !category) {
      alert("Fill all fields first!");
      return;
    }

    setLoading(true);
    const allVariants: any[] = [];

    sizes.forEach(s => {
      colors.forEach(c => {
        allVariants.push({
          name: name,
          category: category.trim(),
          variant_size: s,
          variant_color: c,
          stock: 0,
          price: parseFloat(price),
          sku: `VEL-${name.substring(0,3).toUpperCase()}-${s}-${c.substring(0,2).toUpperCase()}`
        });
      });
    });

    const { error } = await supabase.from('products').insert(allVariants);

    if (error) {
      alert("Error: " + error.message);
    } else {
      const confirmPrint = window.confirm(`Success! ${allVariants.length} variants created. Do you want to print price tags now?`);
      if (confirmPrint) printBarcodes(allVariants);
      window.location.href = '/dashboard';
    }
    setLoading(false);
  };

  return (
    <div className="max-w-2xl mx-auto py-10 px-4 animate-in fade-in slide-in-from-bottom-4">
      <button onClick={() => window.location.href='/dashboard'} className="flex items-center text-slate-500 hover:text-blue-600 mb-6 font-bold">
        <ArrowLeft className="w-4 h-4 mr-2" /> Back
      </button>

      <div className="bg-white/70 backdrop-blur-2xl border border-white shadow-2xl rounded-[40px] p-8 md:p-12">
        <h1 className="text-4xl font-black mb-8 text-slate-900">Add Inventory</h1>
        
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input placeholder="Product Name" className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 font-bold" onChange={(e) => setName(e.target.value)} />
            <input placeholder="Category (e.g. Panjabi)" className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 font-bold" onChange={(e) => setCategory(e.target.value)} />
          </div>

          <input type="number" placeholder="Price (৳)" className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 font-bold" onChange={(e) => setPrice(e.target.value)} />

          {/* SIZES */}
          <div>
            <div className="flex flex-wrap gap-2 mb-2">{sizes.map(s => <span key={s} className="bg-blue-600 text-white px-3 py-1 rounded-full text-xs font-black flex items-center">{s} <X className="ml-2 cursor-pointer w-3 h-3" onClick={() => setSizes(sizes.filter(x => x !== s))} /></span>)}</div>
            <div className="flex gap-2">
              <input value={currentSize} onChange={(e) => setCurrentSize(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addTag('size'))} className="flex-1 bg-slate-50 p-3 rounded-xl outline-none" placeholder="Add size (e.g. XL)..." />
              <button onClick={() => addTag('size')} className="p-3 bg-slate-900 text-white rounded-xl"><Plus/></button>
            </div>
          </div>

          {/* COLORS */}
          <div>
            <div className="flex flex-wrap gap-2 mb-2">{colors.map(c => <span key={c} className="bg-slate-900 text-white px-3 py-1 rounded-full text-xs font-black flex items-center">{c} <X className="ml-2 cursor-pointer w-3 h-3" onClick={() => setColors(colors.filter(x => x !== c))} /></span>)}</div>
            <div className="flex gap-2">
              <input value={currentColor} onChange={(e) => setCurrentColor(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addTag('color'))} className="flex-1 bg-slate-50 p-3 rounded-xl outline-none" placeholder="Add color (e.g. Black)..." />
              <button onClick={() => addTag('color')} className="p-3 bg-slate-900 text-white rounded-xl"><Plus/></button>
            </div>
          </div>

          <button 
            onClick={handleGenerateAndSave}
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-black py-6 rounded-[24px] shadow-xl flex justify-center items-center disabled:opacity-50"
          >
            {loading ? <Loader2 className="animate-spin mr-2" /> : <Save className="mr-2" />}
            GENERATE & PRINT TAGS
          </button>
        </div>
      </div>
    </div>
  );
}
