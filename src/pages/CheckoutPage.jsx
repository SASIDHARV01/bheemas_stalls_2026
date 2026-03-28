// src/pages/CheckoutPage.jsx
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { ArrowLeft, CheckCircle, Minus, Plus, Trash2, AlertCircle, Copy } from 'lucide-react'; 
import { collection, addDoc, serverTimestamp, query, where, getDocs } from 'firebase/firestore';
import { db } from '../firebase'; 
import emailjs from '@emailjs/browser';

const CheckoutPage = () => {
  const { cart, cartTotal, clearCart, updateQuantity, removeFromCart } = useCart();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadStatus, setUploadStatus] = useState(""); 
  const [orderId, setOrderId] = useState(null);
  const [errorPopup, setErrorPopup] = useState(""); 
  const [copied, setCopied] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '', phone: '', email: '', utr: ''
  });
  
  const [paymentProof, setPaymentProof] = useState(null);

  const targetUpiId = "6301041236@axl"; 

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleCopy = () => {
    navigator.clipboard.writeText(targetUpiId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!paymentProof) {
      setErrorPopup("PLEASE UPLOAD PAYMENT PROOF!");
      return;
    }

    setIsSubmitting(true);
    setErrorPopup(""); 
    
    try {
      setUploadStatus("VERIFYING UTR...");
      const utrQuery = query(collection(db, "orders"), where("customerDetails.utr", "==", formData.utr));
      const duplicateCheck = await getDocs(utrQuery);

      if (!duplicateCheck.empty) {
        setErrorPopup("UTR ALREADY USED!");
        setIsSubmitting(false);
        return; 
      }

      setUploadStatus("UPLOADING PROOF...");
      const imgData = new FormData();
      imgData.append('image', paymentProof);

      const imgbbResponse = await fetch(`https://api.imgbb.com/1/upload?key=${import.meta.env.VITE_IMGBB_API_KEY}`, {
        method: 'POST',
        body: imgData
      });
      
      const imgbbResult = await imgbbResponse.json();
      if (!imgbbResult.success) throw new Error("UPLOAD FAILED.");

      const proofUrl = imgbbResult.data.url; 

      setUploadStatus("PROCESSING...");
      const timestampHex = Date.now().toString(36).toUpperCase();
      const randomHex = Math.floor(Math.random() * 46656).toString(36).padStart(3, '0').toUpperCase();
      const newOrderId = `BHM-${timestampHex}-${randomHex}`;

      const verifyLink = `${window.location.origin}/admin/verify/${newOrderId}`;
      const ticketQrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(verifyLink)}`;

      await addDoc(collection(db, "orders"), {
        orderId: newOrderId,
        customerDetails: { ...formData, proofUrl }, 
        items: cart,
        totalAmount: cartTotal,
        status: "Pending Verification",
        timestamp: serverTimestamp() 
      });

      setUploadStatus("SENDING EMAIL...");
      const templateParams = {
        to_name: formData.name,
        to_email: formData.email, 
        order_id: newOrderId,
        utr_number: formData.utr,
        ticket_qr: ticketQrUrl 
      };

      await emailjs.send('service_axc3q8h', 'template_2bve1qj', templateParams, '99v-QBIUfCSIHFudd');

      setOrderId(newOrderId);
      clearCart();

    } catch (error) {
      setErrorPopup(error.message || "SOMETHING WENT WRONG.");
    } finally {
      setIsSubmitting(false);
      setUploadStatus("");
    }
  };

  if (orderId) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-center px-4 bg-neutral-950">
        <CheckCircle size={80} className="text-green-500 mb-6" />
        <h1 className="text-5xl font-black text-white mb-2 uppercase tracking-tighter italic">CONFIRMED!</h1>
        <div className="bg-neutral-900 border border-neutral-800 p-8 rounded-3xl mb-8 w-full max-w-sm shadow-2xl shadow-red-500/10">
          <p className="text-xs text-gray-500 uppercase font-bold tracking-widest mb-2">YOUR TICKET ID</p>
          <p className="text-4xl font-black text-red-500 font-mono tracking-tighter italic">{orderId}</p>
        </div>
        <Link to="/stalls" className="bg-white text-black px-10 py-4 rounded-full font-black uppercase tracking-widest hover:scale-105 transition-transform">BACK TO MENU</Link>
      </div>
    );
  }

  if (cart.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-center px-4 bg-neutral-950">
        <h1 className="text-3xl font-black text-white mb-4 uppercase italic">YOUR CART IS EMPTY</h1>
        <Link to="/stalls" className="text-red-500 font-black flex items-center gap-2 uppercase italic tracking-tighter"><ArrowLeft size={20} /> Go back to stalls</Link>
      </div>
    );
  }

  const paymentQrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(`upi://pay?pa=${targetUpiId}&pn=Bheemas%20Syndicate&am=${cartTotal}&cu=INR`)}`;

  return (
    <div className="min-h-screen py-10 px-4 max-w-6xl mx-auto bg-neutral-950">
      
      {errorPopup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md">
          <div className="bg-neutral-900 border border-red-500 p-8 rounded-3xl w-full max-w-sm text-center shadow-2xl">
            <AlertCircle size={56} className="text-red-500 mx-auto mb-4" />
            <h3 className="text-2xl font-black text-white uppercase tracking-tighter italic mb-2">ERROR</h3>
            <p className="text-gray-400 mb-8 font-bold text-sm">{errorPopup}</p>
            <button onClick={() => setErrorPopup("")} className="w-full bg-red-600 text-white font-black py-4 rounded-xl uppercase tracking-widest">TRY AGAIN</button>
          </div>
        </div>
      )}

      {/* HEADER */}
      <div className="flex items-center gap-4 mb-10 border-b border-neutral-800 pb-6">
        <Link to="/stalls" className="bg-neutral-900 p-3 rounded-full border border-neutral-800 hover:bg-neutral-800 transition-colors">
          <ArrowLeft size={24} className="text-white" />
        </Link>
        <div className="flex items-center gap-4">
          <img src="/logo.jpeg" alt="Bheemas Logo" className="w-12 h-12 rounded-full border-2 border-red-500 shadow-lg" />
          <h1 className="text-4xl font-black text-white uppercase tracking-tighter italic">CHECKOUT</h1>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="space-y-6">
          {/* STEP 1: DETAILS */}
          <div className="bg-neutral-900 p-6 rounded-3xl border border-neutral-800 shadow-xl">
            <h2 className="text-xl font-black text-white mb-6 uppercase tracking-tighter italic text-red-500">1. Student Details</h2>
            <div className="space-y-4">
              <input required type="text" name="name" onChange={handleChange} placeholder="FULL NAME" className="w-full bg-neutral-950 border border-neutral-800 text-white p-4 rounded-xl focus:border-red-500 outline-none font-bold placeholder:text-neutral-700" />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <input required type="tel" name="phone" onChange={handleChange} placeholder="PHONE NUMBER" className="w-full bg-neutral-950 border border-neutral-800 text-white p-4 rounded-xl focus:border-red-500 outline-none font-bold placeholder:text-neutral-700" />
                <input required type="email" name="email" onChange={handleChange} placeholder="EMAIL ADDRESS" className="w-full bg-neutral-950 border border-neutral-800 text-white p-4 rounded-xl focus:border-red-500 outline-none font-bold placeholder:text-neutral-700" />
              </div>
            </div>
          </div>

          {/* STEP 2: SUMMARY WITH EDITING CONTROLS */}
          <div className="bg-neutral-900 p-6 rounded-3xl border border-neutral-800 shadow-xl">
            <h2 className="text-xl font-black text-white mb-6 uppercase tracking-tighter italic text-red-500">Order Summary</h2>
            <div className="space-y-4 mb-6">
              {cart.map((item) => (
                <div key={item.id} className="flex flex-col sm:flex-row sm:items-center justify-between bg-neutral-950 p-4 rounded-2xl border border-neutral-800 gap-4">
                  <div className="flex-1">
                    <p className="text-white font-black text-sm uppercase tracking-tight italic">{item.name}</p>
                    <p className="text-red-500 font-black">₹{item.price * item.qty}</p>
                  </div>
                  
                  {/* 👉 THE + / - / TRASH CONTROLS RE-ADDED */}
                  <div className="flex items-center gap-3 bg-neutral-900 p-1.5 rounded-xl border border-neutral-800 w-fit">
                    <button type="button" onClick={() => updateQuantity(item.id, -1)} disabled={item.qty <= 1} className="p-2 text-gray-400 hover:text-white disabled:opacity-30 transition-colors">
                      <Minus size={18} />
                    </button>
                    <span className="text-white font-black text-lg w-6 text-center">{item.qty}</span>
                    <button type="button" onClick={() => updateQuantity(item.id, 1)} className="p-2 text-gray-400 hover:text-white transition-colors">
                      <Plus size={18} />
                    </button>
                    <div className="w-px h-6 bg-neutral-800 mx-1"></div>
                    <button type="button" onClick={() => removeFromCart(item.id)} className="p-2 text-red-500 hover:bg-red-500/10 rounded-lg transition-colors">
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
            <div className="border-t border-neutral-800 pt-6 flex justify-between items-center">
              <span className="text-lg font-black text-gray-400 uppercase tracking-tighter italic">TOTAL TO PAY</span>
              <span className="text-4xl font-black text-red-500 italic">₹{cartTotal}</span>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          {/* STEP 3: PAYMENT */}
          <div className="bg-neutral-900 p-8 rounded-3xl border border-neutral-800 text-center shadow-xl">
            <h2 className="text-xl font-black text-white mb-4 uppercase tracking-tighter italic text-red-500">3. Payment</h2>
            <div className="bg-white p-3 rounded-2xl mb-6 inline-block shadow-2xl">
              <img src={paymentQrUrl} alt="QR" className="w-44 h-44" />
            </div>
            
            <div className="w-full bg-neutral-950 border border-neutral-800 rounded-2xl p-4 flex flex-col gap-3">
              <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest text-left">COPY UPI ID TO PAY MANUALLY</p>
              <div className="flex justify-between items-center gap-4">
                <span className="text-white font-black font-mono text-lg tracking-wider truncate">{targetUpiId}</span>
                <button type="button" onClick={handleCopy} className={`shrink-0 px-6 py-3 rounded-xl font-black uppercase tracking-widest text-xs transition-all active:scale-95 ${copied ? 'bg-green-600 text-white' : 'bg-white text-black hover:bg-gray-200 shadow-lg'}`}>
                  {copied ? "COPIED!" : "COPY ID"}
                </button>
              </div>
            </div>
          </div>

          {/* STEP 4: VERIFY */}
          <div className="bg-neutral-900 p-8 rounded-3xl border border-neutral-800 shadow-xl">
            <h2 className="text-xl font-black text-white mb-8 uppercase tracking-tighter italic text-red-500">4. Verification</h2>
            <div className="space-y-6">
              <div>
                <label className="text-gray-500 text-[10px] font-black uppercase tracking-[0.2em] mb-2 block">ENTER 12-DIGIT UTR NUMBER</label>
                <input required type="text" name="utr" onChange={handleChange} placeholder="31XXXXXXXXXX" minLength="12" maxLength="12"
                  className="w-full bg-neutral-950 border border-neutral-800 text-white p-5 rounded-2xl focus:border-red-500 outline-none text-center font-black text-xl tracking-[0.2em] placeholder:tracking-normal placeholder:text-neutral-800" />
              </div>

              <div>
                <label className="text-gray-500 text-[10px] font-black uppercase tracking-[0.2em] mb-2 block">UPLOAD SCREENSHOT</label>
                <div className="bg-neutral-950 border border-neutral-800 rounded-2xl p-4">
                  <input required type="file" accept="image/*" onChange={(e) => setPaymentProof(e.target.files[0])}
                    className="w-full text-white text-xs font-black uppercase file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-[10px] file:font-black file:uppercase file:bg-red-600 file:text-white cursor-pointer" />
                </div>
              </div>

              <button type="submit" disabled={isSubmitting} className="w-full bg-red-600 hover:bg-red-500 text-white font-black py-5 rounded-2xl text-xl uppercase tracking-widest italic transition-transform active:scale-95 shadow-xl shadow-red-500/20">
                {isSubmitting ? <span className="animate-pulse">{uploadStatus}</span> : "COMPLETE ORDER"}
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default CheckoutPage;