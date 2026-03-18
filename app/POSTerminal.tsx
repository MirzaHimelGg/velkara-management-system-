"use client";
import React, { useState } from 'react';

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
}

export default function POSTerminal() {
  const [cart, setCart] = useState<CartItem[]>([]);

  // Calculate Totals
  const subtotal = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  const tax = subtotal * 0.05; // 5% VAT (Common in Dhaka)
  const total = subtotal + tax;

  const addToCart = (product: CartItem) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        return prev.map(item => item.id === product.id 
          ? { ...item, quantity: item.quantity + 1 } : item);
      }
      return [...prev, { ...product, quantity: 1 }];
    });
  };

  const handleCheckout = () => {
    // Logic: In a real app, this sends the 'cart' to Supabase to update stock
    console.log("Processing Sale...", cart);
    alert(`Checkout Complete! Total: ৳ ${total.toFixed(2)}`);
    window.print(); // Simple trick to print a receipt immediately
    setCart([]);
  };

  return (
    <div className="flex h-screen bg-gray-100 p-6 gap-6">
      {/* Left Side: Product Selection / Scanner Area */}
      <div className="flex-1 bg-white rounded-3xl shadow-sm p-6 overflow-y-auto">
        <h2 className="text-xl font-bold mb-6">Quick Select Items</h2>
        <div className="grid grid-cols-3 gap-4">
          {/* Example Quick-Buttons for Best Sellers */}
          {['Black Tee (L)', 'Oud Fragrance', 'Leather Bag'].map((item, idx) => (
            <button 
              key={idx}
              onClick={() => addToCart({ id: `${idx}`, name: item, price: 1200 + (idx * 500), quantity: 1 })}
              className="p-4 border-2 border-gray-50 rounded-2xl hover:border-black transition text-left"
            >
              <p className="font-bold">{item}</p>
              <p className="text-sm text-gray-500">৳ {1200 + (idx * 500)}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Right Side: The Receipt / Checkout Cart */}
      <div className="w-96 bg-white rounded-3xl shadow-xl flex flex-col overflow-hidden">
        <div className="p-6 border-b">
          <h2 className="text-xl font-bold">Current Order</h2>
        </div>

        <div className="flex-1 p-6 space-y-4 overflow-y-auto">
          {cart.map(item => (
            <div key={item.id} className="flex justify-between items-center">
              <div>
                <p className="font-medium">{item.name}</p>
                <p className="text-xs text-gray-400">৳ {item.price} x {item.quantity}</p>
              </div>
              <p className="font-bold">৳ {item.price * item.quantity}</p>
            </div>
          ))}
        </div>

        <div className="p-6 bg-gray-50 space-y-2 border-t">
          <div className="flex justify-between text-gray-500">
            <span>Subtotal</span>
            <span>৳ {subtotal}</span>
          </div>
          <div className="flex justify-between text-gray-500">
            <span>Tax (5%)</span>
            <span>৳ {tax.toFixed(0)}</span>
          </div>
          <div className="flex justify-between text-2xl font-black mt-2">
            <span>Total</span>
            <span>৳ {total.toFixed(0)}</span>
          </div>
          
          <button 
            onClick={handleCheckout}
            disabled={cart.length === 0}
            className="w-full mt-6 py-4 bg-green-600 text-white rounded-2xl font-bold text-lg hover:bg-green-700 disabled:bg-gray-300 transition"
          >
            Complete Sale & Print
          </button>
        </div>
      </div>
    </div>
  );
}
