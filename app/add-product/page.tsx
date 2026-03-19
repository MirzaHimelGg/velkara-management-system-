"use client";
import React, { useState, useEffect, useRef } from 'react';
import { createClient } from '@supabase/supabase-js';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { Plus, Save, ArrowLeft, Loader2, Search, Sparkles, Camera, X } from 'lucide-react';

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);

export default function SmartAddProduct() {
  const [sku, setSku] = useState('');
  const [name, setName] = useState('');
  const [category, setCategory] = useState('');
  const [price, setPrice] = useState('');
  const [stockToAdd, setStockToAdd] = useState('1');
  const [size, setSize] = useState('');
  const [color, setColor] = useState('');
  const [loading, setLoading] = useState(false);
  const [isNewProduct, setIsNewProduct] = useState(true);
  const [showScanner, setShowScanner] = useState(false);
  const scannerRef = useRef<Html5QrcodeScanner | null>(null);

  // --- CAMERA TRIGGER ---
  const startCamera = () => {
    setShowScanner(true);
    setTimeout(() => {
      const scanner = new Html5QrcodeScanner("reader", { fps: 10, qrbox: 250 }, false);
      scanner.render((decodedText) => {
        handleLookup(decodedText);
        scanner.clear();
        setShowScanner(false);
      }, (err) => {});
      scannerRef.current = scanner;
    }, 100);
  };

  const generateSmartSku = () => {
    if (!category) return alert("Enter a Category first!");
    const prefix = category.substring(0, 3).toUpperCase();
    const newSku = `${prefix}-${Math.floor(1000 + Math.random() * 9000)}`;
    setSku(newSku);
    setIsNewProduct(true);
  };

  // --- FIXED LOOKUP LOGIC ---
  const handleLookup = async (inputSku: string) => {
    if (!inputSku) return;
    setSku(inputSku);
    setLoading(true);
    
    const { data, error } = await supabase.from('products').select('*').eq('sku', inputSku).single();
    
    if (data && !error) {
      // FOUND: Fill data for restock
      setName(data.name || '');
      setCategory(data.category || '');
      setPrice(data.price?.toString() || '');
      setSize(data.variant_size || '');
      setColor(data.variant_color || '');
      setIsNewProduct(false);
    } else {
      // NOT FOUND: Allow manual entry
      setIsNewProduct(true);
      setName('');
      setCategory('');
      setPrice('');
      setSize('');
      setColor('');
      console.log("New SKU detected, ready for manual input.");
    }
    setLoading(false);
  };

  const handleSave = async () => {
    if (!sku || !name || !price) return alert("SKU, Name, and Price are mandatory!");
    setLoading(true);

    if (isNewProduct) {
      const { error } = await supabase.from('products').insert([{
        sku, name, category, price: parseFloat(price), 
        variant_size: size, variant_color: color, stock: parseInt(stockToAdd)
      }]);
      if (!error) { alert("Success: New Product Added!"); window.location.href = '/dashboard'; }
    } else {
      const { data } = await supabase.from('products').select('stock').eq('sku', sku).single();
      const { error } = await supabase.from('products').update({
        stock: (data?.stock || 0) + parseInt(stockToAdd),
        price: parseFloat(price)
      }).eq('sku', sku);
      if (!error) { alert("Success: Stock Updated!"); window.location.href = '/dashboard'; }
    }
    setLoading(false);
  };

  return (
    <div className="max-w-2xl mx-auto py-10 px-4">
      <button onClick={() => window.location.href='/dashboard'} className="flex items-center text-slate-500 font-bold mb-6"><ArrowLeft className="w-4 h-4 mr-2" /> Back</button>

      <div className="bg-white/80 backdrop-blur-2xl border border-white shadow-2xl rounded-[40px] p-8 md:p-12">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-black text-slate-900">{isNewProduct ? "Add Product" : "Restock"}</h1>
          <button onClick={startCamera} className="bg-blue-600 text-white p-4 rounded-2xl shadow-lg hover:scale-105 transition-all"><Camera /></button>
        </div>

        {/* SCANNER OVERLAY */}
        {showScanner && (
          <div className="fixed inset-0 z-50 bg-slate-900/90 flex items-center justify-center p-6">
            <div className="w-full max-w-md bg-white rounded-[30px] p-4 relative">
              <button onClick={() => {scannerRef.current?.clear(); setShowScanner(false);}} className="absolute -top-12 right-0 text-white"><X size={32}/></button>
              <div id="reader"></div>
            </div>
          </div>
        )}

        <div className="space-y-6">
          <div className="bg-slate-900 p-6 rounded-3xl text-white">
            <div className="flex justify-between items-center mb-2">
              <label className="text-[10px] font-black uppercase tracking-widest opacity-60">SKU / BARCODE</label>
              <button onClick={generateSmartSku} className="text-[10px] font-black bg-blue-600 px-3 py-1 rounded-full flex items-center"><Sparkles className="w-3 h-3 mr-1" /> AUTO-GENERATE</button>
            </div>
            <div className="flex gap-3">
              <input value={sku} onChange={(e) => setSku(e.target.value)} onBlur={() => handleLookup(sku)} placeholder="Scan or Type..." className="flex-1 bg-white/10 p-4 rounded-xl font-black text-xl outline-none" />
              <button onClick={() => handleLookup(sku)} className="bg-white/10 p-4 rounded-xl"><Search/></button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input value={category} onChange={(e) => setCategory(e.target.value)} className="w-full bg-slate-50 border p-4 rounded-2xl font-bold" placeholder="Category" />
            <input value={name} onChange={(e) => setName(e.target.value)} className="w-full bg-slate-50 border p-4 rounded-2xl font-bold" placeholder="Product Name" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <input type="number" value={price} onChange={(e) => setPrice(e.target.value)} className="w-full bg-slate-50 border p-4 rounded-2xl font-bold text-blue-600" placeholder="Price (৳)" />
            <input value={size} onChange={(e) => setSize(e.target.value)} className="w-full bg-slate-50 border p-4 rounded-2xl font-bold" placeholder="Size" />
            <input value={color} onChange={(e) => setColor(e.target.value)} className="w-full bg-slate-50 border p-4 rounded-2xl font-bold" placeholder="Color" />
          </div>

          <div className="bg-blue-50 p-6 rounded-3xl border border-blue-100">
            <label className="block text-xs font-black text-blue-900 mb-2 uppercase">Stock to Add</label>
            <input type="number" value={stockToAdd} onChange={(e) => setStockToAdd(e.target.value)} className="w-full bg-white p-4 rounded-xl font-black text-2xl text-blue-600" />
          </div>

          <button onClick={handleSave} disabled={loading} className="w-full bg-slate-900 text-white py-6 rounded-[25px] font-black text-xl flex justify-center items-center active:scale-95 transition-all">
            {loading ? <Loader2 className="animate-spin" /> : <Save className="mr-2" />} {isNewProduct ? "CONFIRM & ADD" : "UPDATE STOCK"}
          </button>
        </div>
      </div>
    </div>
  );
}
