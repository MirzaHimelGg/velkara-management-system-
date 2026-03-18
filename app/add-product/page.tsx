"use client";
import React, { useState } from 'react';

export default function AddProductForm() {
  const [name, setName] = useState("");
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
  const [selectedColors, setSelectedColors] = useState<string[]>([]);

  const sizes = ["S", "M", "L", "XL", "XXL"];
  const colors = ["Black", "White", "Navy", "Gray", "Beige"];

  const generateSKU = (name: string, size: string, color: string) => {
    // Generates a clean SKU: VEL-TEE-BLK-L
    const prefix = name.substring(0, 3).toUpperCase();
    return `${prefix}-${color.substring(0, 3).toUpperCase()}-${size}`;
  };

  const handleSubmit = () => {
    const variants = [];
    // The "Magic": This creates every possible combination automatically
    for (const color of selectedColors) {
      for (const size of selectedSizes) {
        variants.push({
          name,
          color,
          size,
          sku: generateSKU(name, size, color),
          stock: 0
        });
      }
    }
    console.log("Ready to save to Database:", variants);
    alert(`Created ${variants.length} variants for ${name}!`);
  };

  return (
    <div className="max-w-2xl bg-white p-8 rounded-2xl shadow-lg border border-gray-100">
      <h2 className="text-2xl font-bold mb-6">Create New Product</h2>
      
      <div className="space-y-6">
        {/* Product Name */}
        <div>
          <label className="block text-sm font-semibold mb-2">Product Name</label>
          <input 
            type="text" 
            placeholder="e.g. Velkara Signature Tee"
            className="w-full p-3 border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
            onChange={(e) => setName(e.target.value)}
          />
        </div>

        {/* Size Selection */}
        <div>
          <label className="block text-sm font-semibold mb-2">Available Sizes</label>
          <div className="flex gap-2 flex-wrap">
            {sizes.map(size => (
              <button 
                key={size}
                onClick={() => setSelectedSizes(prev => prev.includes(size) ? prev.filter(s => s !== size) : [...prev, size])}
                className={`px-4 py-2 rounded-lg border ${selectedSizes.includes(size) ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-600'}`}
              >
                {size}
              </button>
            ))}
          </div>
        </div>

        {/* Color Selection */}
        <div>
          <label className="block text-sm font-semibold mb-2">Available Colors</label>
          <div className="flex gap-2 flex-wrap">
            {colors.map(color => (
              <button 
                key={color}
                onClick={() => setSelectedColors(prev => prev.includes(color) ? prev.filter(c => c !== color) : [...prev, color])}
                className={`px-4 py-2 rounded-lg border ${selectedColors.includes(color) ? 'bg-black text-white' : 'bg-white text-gray-600'}`}
              >
                {color}
              </button>
            ))}
          </div>
        </div>

        <button 
          onClick={handleSubmit}
          className="w-full bg-green-600 text-white font-bold py-4 rounded-xl hover:bg-green-700 transition"
        >
          Generate Variants & Save
        </button>
      </div>
    </div>
  );
}
