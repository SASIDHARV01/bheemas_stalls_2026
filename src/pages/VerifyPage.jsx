// src/pages/VerifyPage.jsx
import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { collection, query, where, getDocs, doc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { ShieldCheck, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';

const VerifyPage = () => {
  const { orderId } = useParams(); // Grabs the ID from the URL the QR code scanned
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [redeeming, setRedeeming] = useState(false);

  // 1. Fetch the exact order from Firebase
  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const q = query(collection(db, "orders"), where("orderId", "==", orderId));
        const querySnapshot = await getDocs(q);
        
        if (querySnapshot.empty) {
          setError(true);
        } else {
          // Get the first matching document
          const docData = querySnapshot.docs[0];
          setOrder({ docId: docData.id, ...docData.data() });
        }
      } catch (err) {
        console.error("Error fetching order:", err);
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [orderId]);

  // 2. The function that EXPIRES the QR code
  const handleRedeem = async () => {
    if (!window.confirm("Are you sure you want to redeem this ticket? It cannot be undone.")) return;
    
    setRedeeming(true);
    try {
      const orderRef = doc(db, "orders", order.docId);
      await updateDoc(orderRef, {
        status: "Completed" // This makes the ticket useless for future scans!
      });
      
      // Update local UI immediately
      setOrder(prev => ({ ...prev, status: "Completed" }));
    } catch (err) {
      alert("Failed to redeem ticket. Check connection.");
    } finally {
      setRedeeming(false);
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center text-white">Verifying Ticket...</div>;
  
  if (error || !order) return (
    <div className="min-h-screen bg-neutral-950 flex flex-col items-center justify-center text-center p-6">
      <AlertTriangle size={80} className="text-red-500 mb-4" />
      <h1 className="text-4xl font-black text-white mb-2">INVALID TICKET</h1>
      <p className="text-gray-400 mb-8">This order ID does not exist in the database. Possible fake ticket.</p>
      <p className="font-mono text-red-500 bg-red-500/10 p-4 rounded-xl">{orderId}</p>
    </div>
  );

  // If the ticket was already scanned before...
  const isRedeemed = order.status === "Completed";

  return (
    <div className="min-h-screen bg-neutral-950 p-6 flex flex-col items-center justify-center">
      <div className={`w-full max-w-md rounded-3xl p-8 border-2 ${isRedeemed ? 'bg-red-950/30 border-red-500 shadow-[0_0_50px_rgba(220,38,38,0.2)]' : 'bg-green-950/30 border-green-500 shadow-[0_0_50px_rgba(34,197,94,0.2)]'}`}>
        
        <div className="flex flex-col items-center text-center mb-8">
          {isRedeemed ? (
            <XCircle size={64} className="text-red-500 mb-4" />
          ) : (
            <ShieldCheck size={64} className="text-green-500 mb-4" />
          )}
          <h1 className={`text-3xl font-black uppercase tracking-wider ${isRedeemed ? 'text-red-500' : 'text-green-500'}`}>
            {isRedeemed ? "Already Redeemed" : "Valid Ticket"}
          </h1>
          <p className="text-gray-400 font-mono mt-2">{order.orderId}</p>
        </div>

        <div className="bg-neutral-900 rounded-2xl p-6 mb-8 border border-neutral-800">
          <h2 className="text-gray-500 text-sm font-bold uppercase tracking-widest mb-4">Customer Details</h2>
          <p className="text-white font-bold text-lg">{order.customerDetails.name}</p>
          <p className="text-gray-400">{order.customerDetails.phone}</p>
          <p className="text-gray-400 font-mono text-sm mt-2">UTR: {order.customerDetails.utr}</p>
          
          <hr className="border-neutral-800 my-4" />
          
          <h2 className="text-gray-500 text-sm font-bold uppercase tracking-widest mb-4">Food to Serve</h2>
          <div className="space-y-3">
            {order.items.map((item, idx) => (
              <div key={idx} className="flex justify-between items-center bg-neutral-950 p-3 rounded-xl border border-neutral-800">
                <span className="text-white font-medium">{item.name}</span>
                <span className="bg-white text-black font-black w-8 h-8 flex items-center justify-center rounded-lg">x{item.qty}</span>
              </div>
            ))}
          </div>
        </div>

        {!isRedeemed ? (
          <button 
            onClick={handleRedeem}
            disabled={redeeming}
            className="w-full bg-green-600 hover:bg-green-500 text-white font-black py-5 rounded-2xl text-xl uppercase tracking-widest transition-transform active:scale-95 shadow-lg flex items-center justify-center gap-2"
          >
            {redeeming ? "Processing..." : "Handover Food & Redeem"}
          </button>
        ) : (
          <div className="w-full bg-red-500/10 border border-red-500/50 text-red-500 font-black py-5 rounded-2xl text-lg uppercase tracking-widest flex items-center justify-center text-center">
            Ticket Expired
          </div>
        )}
        
        <div className="mt-6 text-center">
          <Link to="/admin" className="text-gray-500 hover:text-white underline text-sm">Return to Admin Dashboard</Link>
        </div>

      </div>
    </div>
  );
};

export default VerifyPage;