// src/pages/VerifyPage.jsx
import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { Lock, CheckCircle, AlertTriangle, ArrowLeft, XCircle, Image as ImageIcon } from 'lucide-react';

const SECRET_PIN = "2026";

const VerifyPage = () => {
  const { id } = useParams(); 
  const navigate = useNavigate();
  
  const [isAuthenticated, setIsAuthenticated] = useState(() => sessionStorage.getItem('adminAuth') === 'true');
  const [pinInput, setPinInput] = useState("");
  const [pinError, setPinError] = useState(false);

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!isAuthenticated) return;

    const fetchOrder = async () => {
      try {
        const q = doc(db, "orders", id);
        const docSnap = await getDoc(q);

        if (docSnap.exists()) {
          setOrder({ id: docSnap.id, ...docSnap.data() });
        } else {
          setError("Ticket Not Found in Database!");
        }
      } catch (err) {
        setError("Error connecting to database.");
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [id, isAuthenticated]);

  const handleLogin = (e) => {
    e.preventDefault();
    if (pinInput === SECRET_PIN) {
      setIsAuthenticated(true);
      sessionStorage.setItem('adminAuth', 'true');
      setPinError(false);
    } else {
      setPinError(true);
      setPinInput("");
    }
  };

  const markAsCompleted = async () => {
    if (!window.confirm("Did you check the UTR and Screenshot?")) return;
    
    try {
      const orderRef = doc(db, "orders", id);
      await updateDoc(orderRef, { status: "Completed" });
      setOrder(prev => ({ ...prev, status: "Completed" }));
    } catch (error) {
      alert("Failed to update status.");
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-neutral-950 flex flex-col items-center justify-center p-4 animate-fade-in-up">
        <div className="bg-neutral-900 border border-neutral-800 p-8 rounded-3xl w-full max-w-sm text-center shadow-[0_0_50px_rgba(220,38,38,0.1)]">
          <div className="bg-red-500/10 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 border border-red-500/20">
            <Lock size={36} className="text-red-500" />
          </div>
          <h1 className="text-2xl font-black text-white uppercase tracking-widest mb-2">Admin Only</h1>
          <p className="text-gray-400 text-sm mb-8">Enter PIN to verify this ticket.</p>
          
          <form onSubmit={handleLogin} className="space-y-4">
            <input type="password" maxLength="4" placeholder="••••" value={pinInput} onChange={(e) => setPinInput(e.target.value)}
              className={`w-full bg-neutral-950 border ${pinError ? 'border-red-500' : 'border-neutral-800'} text-white text-center text-3xl tracking-[1em] py-4 rounded-xl focus:border-red-500 outline-none font-mono transition-colors`} />
            {pinError && <p className="text-red-500 text-xs font-bold uppercase tracking-widest animate-pulse">Incorrect PIN.</p>}
            <button type="submit" className="w-full bg-white text-black font-black py-4 rounded-xl uppercase tracking-widest hover:bg-gray-200 transition-colors mt-2">Unlock</button>
          </form>
        </div>
      </div>
    );
  }

  if (loading) return <div className="min-h-screen bg-neutral-950 flex items-center justify-center text-white">Searching Database...</div>;
  
  if (error) return (
    <div className="min-h-screen bg-neutral-950 flex flex-col items-center justify-center p-4 text-center">
      <XCircle size={64} className="text-red-500 mb-4" />
      <h1 className="text-3xl font-black text-white mb-2">Invalid Ticket</h1>
      <p className="text-gray-400 mb-8">{error}</p>
      <Link to="/admin" className="bg-neutral-800 text-white px-6 py-3 rounded-xl font-bold">Back to Command Center</Link>
    </div>
  );

  const isCompleted = order.status === "Completed";

  return (
    <div className="min-h-screen bg-neutral-950 p-4 py-10 flex flex-col items-center">
      <div className="w-full max-w-lg">
        <Link to="/admin" className="flex items-center gap-2 text-gray-400 hover:text-white mb-8 transition-colors w-fit">
          <ArrowLeft size={20} /> Back to Scanner
        </Link>

        {isCompleted ? (
          <div className="bg-red-500/10 border border-red-500/50 rounded-3xl p-8 text-center animate-fade-in-up mb-6 shadow-[0_0_50px_rgba(220,38,38,0.2)]">
            <AlertTriangle size={64} className="text-red-500 mx-auto mb-4 animate-pulse" />
            <h1 className="text-3xl font-black text-red-500 uppercase tracking-widest mb-2">Already Redeemed</h1>
            <p className="text-white font-mono bg-red-500/20 py-2 rounded-lg mt-4">{order.orderId}</p>
            <p className="text-gray-400 mt-4 text-sm">Do not give food. This ticket has already been used.</p>
          </div>
        ) : (
          <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-6 shadow-xl mb-6">
            <div className="flex justify-between items-start mb-6 border-b border-neutral-800 pb-6">
              <div>
                <span className="text-green-500 text-xs font-bold uppercase tracking-widest mb-1 block">Valid Ticket</span>
                <h1 className="text-2xl font-black text-white font-mono">{order.orderId}</h1>
              </div>
              <span className="bg-red-500 text-white px-4 py-2 rounded-xl font-black text-xl">₹{order.totalAmount}</span>
            </div>

            <div className="bg-neutral-950 border border-yellow-500/30 rounded-xl p-6 mb-6 text-center">
              <span className="text-yellow-500 text-sm font-bold uppercase tracking-widest mb-2 block">Check PhonePe UTR</span>
              <span className="text-white font-mono text-3xl tracking-widest block">{order.customerDetails?.utr}</span>
              <p className="text-gray-500 text-xs mt-3 mb-6">Name: {order.customerDetails?.name}</p>

              {/* 👉 NEW: PAYMENT SCREENSHOT VIEWER */}
              <div className="border-t border-neutral-800 pt-6">
                <span className="text-gray-400 text-xs font-bold uppercase tracking-widest mb-4 flex items-center justify-center gap-2">
                  <ImageIcon size={16} /> Payment Proof
                </span>
                
                {order.customerDetails?.proofUrl ? (
                  <a href={order.customerDetails.proofUrl} target="_blank" rel="noreferrer" className="block w-full max-w-[250px] mx-auto rounded-xl overflow-hidden border-2 border-neutral-800 hover:border-blue-500 transition-colors shadow-lg">
                    <img src={order.customerDetails.proofUrl} alt="Payment Proof" className="w-full h-auto object-cover" />
                  </a>
                ) : (
                  <div className="bg-red-500/10 border border-red-500/30 text-red-400 p-4 rounded-xl text-sm font-bold">
                    No screenshot uploaded for this order!
                  </div>
                )}
                <p className="text-gray-600 text-[10px] mt-3 uppercase tracking-wider">Tap image to view full screen</p>
              </div>
            </div>

            <div className="mb-8">
              <span className="text-gray-500 text-xs font-bold uppercase tracking-widest mb-3 block">Order Items</span>
              <div className="space-y-3 bg-neutral-950 p-4 rounded-xl border border-neutral-800">
                {order.items?.map((item, idx) => (
                  <div key={idx} className="flex justify-between items-center text-gray-300 border-b border-neutral-800 pb-2 last:border-0 last:pb-0">
                    <span className="font-medium text-lg text-white">{item.name}</span>
                    <span className="bg-neutral-800 text-white font-black px-3 py-1 rounded-lg">x{item.qty}</span>
                  </div>
                ))}
              </div>
            </div>

            <button onClick={markAsCompleted} className="w-full bg-green-600 hover:bg-green-500 text-white font-black py-5 rounded-xl transition-transform active:scale-95 flex items-center justify-center gap-2 uppercase tracking-widest text-lg shadow-[0_0_20px_rgba(22,163,74,0.4)]">
              <CheckCircle size={24} /> Verify & Complete Order
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default VerifyPage;