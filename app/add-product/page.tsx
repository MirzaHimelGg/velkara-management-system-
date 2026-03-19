"use client";
import React, { useState } from 'react';
import { Plus, X, Save, ArrowLeft } from 'lucide-react';

export default function AddProduct() {
  const [name, setName] = useState('');
  const [sizes, setSizes] = useState<string[]>([]);
  const [colors, setColors] = useState<string[]>([]);
  const [currentSize, setCurrentSize] = useState('');
  const [currentColor, setCurrentColor] = useState('');

  const addTag = (type: 'size' | 'color') => {
    if (type === 'size' && currentSize) {
      setSizes([...sizes, currentSize]);
      setCurrentSize('');
    } else if (type === 'color' && currentColor) {
      setColors([...colors, currentColor]);
      setCurrentColor('');
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <button onClick={() => window.location.href='/'} className="flex items-center text-slate-500 hover:text-blue-600 transition">
        <ArrowLeft className="w-4 h-4 mr-2" /> Back to Dashboard
      </button>

      <div className="bg-white/70 backdrop-blur-xl border border-white/40 shadow-2xl rounded-[32px] p-8">
        <h1 className="text-3xl font-extrabold tracking-tight mb-8">New Product</h1>
        
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-semibold mb-2">Product Name</label>
            <input 
              className="w-full bg-white/50 border border-slate-200 rounded-2xl px-4 py-3 focus:ring-4 focus:ring-blue-100 outline-none transition"
              placeholder="e.g. Premium Panjabi 2026"
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          {/* Dynamic Sizes Section */}
          <div>
            <label className="block text-sm font-semibold mb-2">Available Sizes (Press Enter to add)</label>
            <div className="flex flex-wrap gap-2 mb-3">
              {sizes.map(s => (
                <span key={s} className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-sm flex items-center">
                  {s} <X className="w-3 h-3 ml-2 cursor-pointer" onClick={() => setSizes(sizes.filter(x => x !== s))} />
                </span>
              ))}
            </div>
            <div className="flex gap-2">
              <input 
                value={currentSize}
                onChange={(e) => setCurrentSize(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && addTag('size')}
                className="flex-1 bg-white/50 border border-slate-200 rounded-xl px-4 py-2"
                placeholder="XL, 42, M..."
              />
              <button onClick={() => addTag('size')} className="p-2 bg-slate-900 text-white rounded-xl"><Plus /></button>
            </div>
          </div>

          {/* Dynamic Colors Section */}
          <div>
            <label className="block text-sm font-semibold mb-2">Available Colors</label>
            <div className="flex flex-wrap gap-2 mb-3">
              {colors.map(c => (
                <span key={c} className="bg-purple-50 text-purple-700 px-3 py-1 rounded-full text-sm flex items-center">
                  {c} <X className="w-3 h-3 ml-2 cursor-pointer" onClick={() => setColors(colors.filter(x => x !== c))} />
                </span>
              ))}
            </div>
            <div className="flex gap-2">
              <input 
                value={currentColor}
                onChange={(e) => setCurrentColor(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && addTag('color')}
                className="flex-1 bg-white/50 border border-slate-200 rounded-xl px-4 py-2"
                placeholder="Midnight Black, Ruby..."
              />
              <button onClick={() => addTag('color')} className="p-2 bg-slate-900 text-white rounded-xl"><Plus /></button>
            </div>
          </div>

          <button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-[20px] shadow-lg shadow-blue-200 transition-all active:scale-95 flex justify-center items-center">
            <Save className="mr-2" /> Generate All Variants
          </button>
        </div>
      </div>
    </div>
  );
}

