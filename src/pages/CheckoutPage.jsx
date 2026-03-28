// src/pages/CheckoutPage.jsx
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { ArrowLeft, CheckCircle, Minus, Plus, Trash2 } from 'lucide-react'; 
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase'; 
import emailjs from '@emailjs/browser';

const CheckoutPage = () => {
  const { cart, cartTotal, clearCart, updateQuantity, removeFromCart } = useCart();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderId, setOrderId] = useState(null);
  
  const [formData, setFormData] = useState({
    name: '', phone: '', email: '', utr: ''
  });

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    const timestampHex = Date.now().toString(36).toUpperCase();
    const randomHex = Math.floor(Math.random() * 46656).toString(36).padStart(3, '0').toUpperCase();
    const newOrderId = `BHM-${timestampHex}-${randomHex}`;

    const verifyLink = `${window.location.origin}/admin/verify/${newOrderId}`;
    const ticketQrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(verifyLink)}`;

    try {
      await addDoc(collection(db, "orders"), {
        orderId: newOrderId,
        customerDetails: formData,
        items: cart,
        totalAmount: cartTotal,
        status: "Pending Verification",
        timestamp: serverTimestamp() 
      });

      const templateParams = {
        to_name: formData.name,
        to_email: formData.email, 
        order_id: newOrderId,
        utr_number: formData.utr,
        ticket_qr: ticketQrUrl 
      };

      await emailjs.send(
        'service_axc3q8h', 
        'template_2bve1qj', 
        templateParams,
        '99v-QBIUfCSIHFudd'
      );

      setOrderId(newOrderId);
      clearCart();

    } catch (error) {
      console.error("❌ ERROR: ", error);
      alert("Something went wrong with the order. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (orderId) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-center px-4 animate-fade-in-up">
        <CheckCircle size={80} className="text-green-500 mb-6" />
        <h1 className="text-4xl md:text-5xl font-black text-white mb-2">Order Confirmed!</h1>
        <p className="text-gray-400 text-lg mb-8">Please take a screenshot of this page.</p>
        
        <div className="bg-neutral-900 border border-neutral-800 p-8 rounded-2xl mb-8 w-full max-w-sm shadow-[0_0_40px_rgba(220,38,38,0.15)]">
          <p className="text-sm text-gray-500 uppercase tracking-widest mb-2">Your Order ID</p>
          <p className="text-5xl font-black text-red-500">{orderId}</p>
        </div>

        <p className="text-gray-400 mb-8 max-w-md">
          A confirmation email with your ticket has been sent to <span className="text-white font-bold">{formData.email}</span>.
        </p>
        
        <Link to="/stalls" className="bg-white text-black px-8 py-3 rounded-full font-bold hover:bg-gray-200 transition-colors">
          Return to Menu
        </Link>
      </div>
    );
  }

  if (cart.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-center px-4">
        <h1 className="text-3xl font-bold text-white mb-4">Your cart is empty</h1>
        <Link to="/stalls" className="text-red-500 hover:text-red-400 font-medium flex items-center gap-2">
          <ArrowLeft size={20} /> Go back to stalls
        </Link>
      </div>
    );
  }

  const upiLink = `upi://pay?pa=6301041236@axl&pn=Bheemas%20Syndicate&am=${cartTotal}&cu=INR`;
  const paymentQrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(upiLink)}`;

  return (
    <div className="min-h-screen py-10 px-4 max-w-6xl mx-auto">
      
      {/* 👉 NEW: Checkout Header with Logo */}
      <div className="flex items-center gap-4 mb-10">
        <Link to="/stalls" className="bg-neutral-900 p-3 rounded-full hover:bg-neutral-800 transition-colors border border-neutral-800 shrink-0">
          <ArrowLeft size={24} className="text-white" />
        </Link>
        <div className="flex items-center gap-3 md:gap-4">
          <img 
            src="/bheemas-logo.png" 
            alt="Bheemas Logo" 
            className="w-10 h-10 sm:w-12 sm:h-12 rounded-full object-cover border border-red-500 shadow-[0_0_10px_rgba(220,38,38,0.3)] shrink-0" 
          />
          <h1 className="text-3xl sm:text-4xl font-black text-white uppercase tracking-tight">Checkout</h1>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        <div className="space-y-6">
          <div className="bg-neutral-900 p-6 md:p-8 rounded-2xl border border-neutral-800">
            <h2 className="text-2xl font-bold text-white mb-4">Student Details</h2>
            <div className="space-y-4">
              <input required type="text" name="name" onChange={handleChange} placeholder="Full Name" 
                className="w-full bg-neutral-950 border border-neutral-800 text-white p-4 rounded-xl focus:border-red-500 outline-none" />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <input required type="tel" name="phone" onChange={handleChange} placeholder="Phone Number" 
                  className="w-full bg-neutral-950 border border-neutral-800 text-white p-4 rounded-xl focus:border-red-500 outline-none" />
                <input required type="email" name="email" onChange={handleChange} placeholder="Email Address" 
                  className="w-full bg-neutral-950 border border-neutral-800 text-white p-4 rounded-xl focus:border-red-500 outline-none" />
              </div>
            </div>
          </div>

          <div className="bg-neutral-900 p-6 md:p-8 rounded-2xl border border-neutral-800">
            <h2 className="text-2xl font-bold text-white mb-6">Order Summary</h2>
            <div className="space-y-3 mb-6">
              {cart.map((item) => (
                <div key={item.id} className="flex flex-col sm:flex-row sm:items-center justify-between bg-neutral-950 p-4 rounded-xl border border-neutral-800 gap-4">
                  <div className="flex-1">
                    <p className="text-white font-bold leading-tight">{item.name}</p>
                    <p className="text-red-400 font-black text-sm">₹{item.price * item.qty}</p>
                  </div>
                  <div className="flex items-center gap-2 bg-neutral-900 p-1 rounded-lg border border-neutral-800 w-fit">
                    <button type="button" onClick={() => updateQuantity(item.id, -1)} disabled={item.qty <= 1} className="p-2 text-gray-400 hover:text-white disabled:opacity-30 transition-colors">
                      <Minus size={16} />
                    </button>
                    <span className="text-white font-black w-4 text-center">{item.qty}</span>
                    <button type="button" onClick={() => updateQuantity(item.id, 1)} className="p-2 text-gray-400 hover:text-white transition-colors">
                      <Plus size={16} />
                    </button>
                    <div className="w-px h-6 bg-neutral-800 mx-1"></div>
                    <button type="button" onClick={() => removeFromCart(item.id)} className="p-2 text-red-500 hover:bg-red-500/10 rounded-md transition-colors">
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
            <div className="border-t border-neutral-800 pt-6 flex justify-between items-center">
              <span className="text-xl text-white font-bold">Total to Pay</span>
              <span className="text-3xl font-black text-red-500">₹{cartTotal}</span>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-neutral-900 p-6 md:p-8 rounded-2xl border border-neutral-800 text-center flex flex-col items-center">
            <h2 className="text-xl font-bold text-white mb-2">Step 1: Pay for Order</h2>
            <p className="text-gray-400 text-sm mb-6">Scan with any UPI app to pay exactly ₹{cartTotal}</p>
            <div className="bg-white p-3 rounded-xl mb-6 shadow-[0_0_30px_rgba(255,255,255,0.1)] flex items-center justify-center">
              <img src={paymentQrUrl} alt="Scan to pay" className="w-40 h-40" />
            </div>
            <a href={upiLink} className="md:hidden w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-4 rounded-xl mb-6 flex items-center justify-center gap-2 transition-transform active:scale-95 shadow-lg shadow-blue-500/20">
              Open UPI App to Pay ₹{cartTotal}
            </a>
            <p className="text-xs text-gray-500 text-left w-full">Make sure to copy the 12-digit UTR number from your app after paying!</p>
          </div>

          <div className="bg-neutral-900 p-6 md:p-8 rounded-2xl border border-neutral-800">
            <h2 className="text-xl font-bold text-white mb-2">Step 2: Verify & Place Order</h2>
            <p className="text-gray-400 text-sm mb-6">Paste the 12-digit UTR from your payment app below.</p>
            <input required type="text" name="utr" onChange={handleChange} placeholder="Enter 12-Digit UTR Number" minLength="12" maxLength="12"
              className="w-full bg-neutral-950 border border-neutral-800 text-white p-4 rounded-xl focus:border-red-500 outline-none tracking-widest font-mono text-center mb-6" />
            <button type="submit" disabled={isSubmitting} className="w-full bg-red-600 hover:bg-red-500 text-white font-black py-4 rounded-xl transition-transform active:scale-95 disabled:bg-neutral-800 disabled:text-gray-500 shadow-[0_4px_20px_rgba(220,38,38,0.4)] text-lg uppercase tracking-widest flex items-center justify-center gap-2">
              {isSubmitting ? "Processing..." : "Place Order"}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default CheckoutPage;