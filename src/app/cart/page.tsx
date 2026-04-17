"use client";

import { useCart } from "@/lib/cart-context";
import Link from "next/link";

export default function CartPage() {
  const { items, updateQuantity, removeItem, total, clearCart } = useCart();

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-[#0b0c10] text-white flex items-center justify-center p-8">
        <div className="text-center">
          <div className="text-8xl mb-6">🛒</div>
          <h1 className="text-3xl font-bold text-[#c5a059] mb-4">Your Cart is Empty</h1>
          <p className="text-[#45a29e] mb-8">Looks like you haven't added anything yet.</p>
          <Link href="/shop" className="bg-[#c5a059] text-[#0b0c10] px-8 py-3 rounded-lg font-bold hover:bg-[#b8954f]">
            Browse Shop
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0b0c10] text-white">
      <div className="bg-gradient-to-r from-[#1f2833] to-[#2d3b2d] py-12 px-6">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-4xl font-bold text-[#c5a059]">Shopping Cart</h1>
          <p className="text-[#45a29e] mt-2">{items.length} item(s) in your cart</p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-12">
        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-4">
            {items.map((item) => (
              <div key={item.id} className="bg-[#1f2833] rounded-lg border border-[#45a29e]/30 p-4 flex gap-4">
                <div className="w-24 h-24 bg-[#2d3b2d] rounded-lg flex items-center justify-center text-4xl">
                  🌿
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-white">{item.name}</h3>
                  <p className="text-sm text-[#45a29e]">{item.category}</p>
                  <p className="text-xl font-bold text-[#c5a059] mt-2">R{item.price.toLocaleString()}</p>
                </div>
                <div className="flex flex-col items-end justify-between">
                  <button onClick={() => removeItem(item.id)} className="text-red-400 hover:text-red-300 text-sm">
                    Remove
                  </button>
                  <div className="flex items-center gap-3">
                    <button onClick={() => updateQuantity(item.id, item.quantity - 1)} className="w-8 h-8 bg-[#0b0c10] rounded flex items-center justify-center">-</button>
                    <span className="w-8 text-center">{item.quantity}</span>
                    <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="w-8 h-8 bg-[#0b0c10] rounded flex items-center justify-center">+</button>
                  </div>
                </div>
              </div>
            ))}
            <button onClick={clearCart} className="text-red-400 text-sm hover:underline">
              Clear Cart
            </button>
          </div>

          <div className="bg-[#1f2833] rounded-lg border border-[#45a29e]/30 p-6 h-fit">
            <h2 className="text-xl font-bold text-[#c5a059] mb-4">Order Summary</h2>
            <div className="space-y-3 border-b border-[#45a29e]/30 pb-4 mb-4">
              <div className="flex justify-between">
                <span className="text-[#45a29e]">Subtotal</span>
                <span className="text-white">R{total.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#45a29e]">VAT (15%)</span>
                <span className="text-white">R{(total * 0.15).toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#45a29e]">Delivery</span>
                <span className="text-green-400">Free</span>
              </div>
            </div>
            <div className="flex justify-between text-xl font-bold mb-6">
              <span className="text-white">Total</span>
              <span className="text-[#c5a059]">R{(total * 1.15).toLocaleString()}</span>
            </div>
            <Link href="/checkout" className="block w-full bg-[#c5a059] text-[#0b0c10] py-4 rounded-lg font-bold text-center hover:bg-[#b8954f]">
              Proceed to Checkout
            </Link>
            <Link href="/shop" className="block text-center text-[#45a29e] mt-4 hover:text-[#c5a059]">
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}