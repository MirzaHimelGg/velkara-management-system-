"use client";
export const dynamic = 'force-dynamic';


import React from 'react';

// This represents the data coming from your Supabase database
const inventoryData = [
  { id: 1, name: "Velkara Premium Tee", category: "Apparel", size: "L", color: "Midnight Black", stock: 45, price: 1200 },
  { id: 2, name: "Velkara Premium Tee", category: "Apparel", size: "M", color: "Midnight Black", stock: 12, price: 1200 },
  { id: 3, name: "Inspired Oud Wood 50ml", category: "Fragrance", size: "N/A", color: "Clear", stock: 8, price: 3500 },
];

export default function Dashboard() {
  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <header className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Velkara Management System</h1>
        <button 
          onClick={() => window.location.href = '/add-product'}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
        >
          + Add New Product
        </button>

      
      </header>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="p-6 bg-white rounded-xl shadow-sm border border-gray-100">
          <p className="text-sm text-gray-500 uppercase font-semibold">Total Stock</p>
          <p className="text-2xl font-bold">1,240 Units</p>
        </div>
        <div className="p-6 bg-white rounded-xl shadow-sm border border-gray-100">
          <p className="text-sm text-gray-500 uppercase font-semibold">Low Stock Items</p>
          <p className="text-2xl font-bold text-red-500">4 Items</p>
        </div>
        <div className="p-6 bg-white rounded-xl shadow-sm border border-gray-100">
          <p className="text-sm text-gray-500 uppercase font-semibold">Today's Revenue</p>
          <p className="text-2xl font-bold text-green-600">৳ 14,500</p>
        </div>
      </div>

      {/* Inventory Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              <th className="p-4 font-semibold text-gray-700">Product Name</th>
              <th className="p-4 font-semibold text-gray-700">Category</th>
              <th className="p-4 font-semibold text-gray-700">Variant (Size/Color)</th>
              <th className="p-4 font-semibold text-gray-700">Stock</th>
              <th className="p-4 font-semibold text-gray-700">Price</th>
              <th className="p-4 font-semibold text-gray-700">Status</th>
            </tr>
          </thead>
          <tbody>
            {inventoryData.map((item) => (
              <tr key={item.id} className="border-b border-gray-50 hover:bg-gray-50 transition">
                <td className="p-4 font-medium text-gray-800">{item.name}</td>
                <td className="p-4 text-gray-600">{item.category}</td>
                <td className="p-4 text-gray-600">{item.size} / {item.color}</td>
                <td className="p-4 font-mono">{item.stock}</td>
                <td className="p-4">৳ {item.price}</td>
                <td className="p-4">
                  <span className={`px-2 py-1 rounded text-xs font-bold ${item.stock < 15 ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                    {item.stock < 15 ? 'Low Stock' : 'In Stock'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
