// src/pages/AdminPage.jsx
import { useState, useEffect, useRef } from 'react';
import { collection, query, orderBy, onSnapshot, doc, updateDoc, setDoc, arrayUnion, arrayRemove } from 'firebase/firestore';
import { db } from '../firebase';
import { CheckCircle, Clock, Search, IndianRupee, QrCode, X, Camera, Lock, Package } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Scanner } from '@yudiel/react-qr-scanner'; 

const SECRET_PIN = "2026"; 

const menuData = {
  biryani: [
    { id: 'b1', name: '1 Dum Biryani' }, { id: 'b2', name: '3 Dum Biryani' }, { id: 'b3', name: '5 Dum Biryani' },
    { id: 'b4', name: '1 Fry Biryani' }, { id: 'b5', name: '3 Fry Biryani' }, { id: 'b6', name: '5 Fry Biryani' }, { id: 'b7', name: '1 Fry Combo' }
  ],
  fruitjuice: [
    { id: 'j1', name: 'Banana Juice' }, { id: 'j2', name: 'Musk Melon' }, { id: 'j3', name: 'Pineapple' },
    { id: 'j4', name: 'Watermelon' }, { id: 'j5', name: 'Grape Juice' }, { id: 'j6', name: 'Fruit Salad' },
    { id: 'j7', name: 'Oreo Shake' }, { id: 'j8', name: 'Kit-Kat Shake' }, { id: 'j9', name: 'Pista Shake' },
    { id: 'j10', name: 'Choco Cake Shake' }, { id: 'j11', name: 'Butterscotch' }
  ],
  fastfood: [
    { id: 'f1', name: 'Chicken Noodles' }, { id: 'f2', name: 'Veg Manchurian' }
  ]
};

const AdminPage = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(() => sessionStorage.getItem('adminAuth') === 'true');
  const [pinInput, setPinInput] = useState("");
  const [pinError, setPinError] = useState(false);

  const [orders, setOrders] = useState([]);
  const [soldOutItems, setSoldOutItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [manualId, setManualId] = useState(""); 
  const [showScanner, setShowScanner] = useState(false);
  
  const isFirstLoad = useRef(true);
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthenticated) return; 

    const q = query(collection(db, "orders"), orderBy("timestamp", "desc"));
    const unsubOrders = onSnapshot(q, (snapshot) => {
      if (!isFirstLoad.current) {
        snapshot.docChanges().forEach((change) => {
          if (change.type === "added") {
            const audio = new Audio('https://actions.google.com/sounds/v1/alarms/beep_short.ogg');
            audio.play().catch(e => console.log("Audio blocked:", e));
          }
        });
      }
      const ordersData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setOrders(ordersData);
      setLoading(false);
      isFirstLoad.current = false; 
    });

    const unsubInventory = onSnapshot(doc(db, "settings", "menu"), (docSnap) => {
      if (docSnap.exists()) {
        setSoldOutItems(docSnap.data().outOfStock || []);
      }
    });
    
    return () => {
      unsubOrders();
      unsubInventory();
    };
  }, [isAuthenticated]);

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

  const handleScan = (data) => {
    if (data) {
      let text = "";
      if (typeof data === 'string') text = data;
      else if (Array.isArray(data) && data.length > 0) text = data[0].rawValue;
      else if (data.text) text = data.text;

      const match = text.match(/BHM-[A-Z0-9-]+/i);
      if (match) {
        setShowScanner(false);
        navigate(`/admin/verify/${match[0].toUpperCase()}`); 
      }
    }
  };

  const handleManualVerify = (e) => {
    e.preventDefault();
    if (!manualId.trim()) return;
    navigate(`/admin/verify/${manualId.toUpperCase()}`);
  };

  const markAsCompleted = async (docId) => {
    if (!window.confirm("Verify UTR matches PhonePe. Mark as completed?")) return;
    try {
      const orderRef = doc(db, "orders", docId);
      await updateDoc(orderRef, { status: "Completed" });
    } catch (error) {
      alert("Failed to update status.");
    }
  };

  const toggleInventory = async (itemId, isCurrentlySoldOut) => {
    const menuRef = doc(db, "settings", "menu");
    try {
      await setDoc(menuRef, {
        outOfStock: isCurrentlySoldOut ? arrayRemove(itemId) : arrayUnion(itemId)
      }, { merge: true });
    } catch (error) {
      alert("Failed to update inventory. Make sure your Firebase security rules allow writing.");
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-neutral-950 flex flex-col items-center justify-center p-4 animate-fade-in-up">
        <div className="bg-neutral-900 border border-neutral-800 p-8 rounded-3xl w-full max-w-sm text-center shadow-[0_0_50px_rgba(220,38,38,0.1)]">
          <div className="bg-red-500/10 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 border border-red-500/20">
            <Lock size={36} className="text-red-500" />
          </div>
          <h1 className="text-2xl font-black text-white uppercase tracking-widest mb-2">Restricted Area</h1>
          <p className="text-gray-400 text-sm mb-8">Enter admin passcode to access the command center.</p>
          <form onSubmit={handleLogin} className="space-y-4">
            <input type="password" maxLength="4" placeholder="••••" value={pinInput} onChange={(e) => setPinInput(e.target.value)}
              className={`w-full bg-neutral-950 border ${pinError ? 'border-red-500' : 'border-neutral-800'} text-white text-center text-3xl tracking-[1em] py-4 rounded-xl focus:border-red-500 outline-none font-mono transition-colors`} />
            {pinError && <p className="text-red-500 text-xs font-bold uppercase tracking-widest animate-pulse">Access Denied.</p>}
            <button type="submit" className="w-full bg-white text-black font-black py-4 rounded-xl uppercase tracking-widest hover:bg-gray-200 transition-colors mt-2">Unlock</button>
          </form>
        </div>
      </div>
    );
  }

  if (loading) return <div className="min-h-screen bg-neutral-950 flex items-center justify-center text-white">Loading Command Center...</div>;

  const filteredOrders = orders.filter(o => 
    o.orderId.toLowerCase().includes(searchTerm.toLowerCase()) ||
    o.customerDetails?.utr.includes(searchTerm) ||
    o.customerDetails?.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const activeOrders = filteredOrders.filter(o => o.status !== "Completed");
  const completedOrders = filteredOrders.filter(o => o.status === "Completed");
  const totalRevenue = completedOrders.reduce((total, order) => total + (order.totalAmount || 0), 0);

  return (
    <div className="min-h-screen bg-neutral-950 p-4 md:p-8 font-sans pb-20 relative">
      
      {showScanner && (
        <div className="fixed inset-0 z-50 bg-black flex flex-col animate-fade-in-up">
          <div className="p-6 flex justify-between items-center bg-neutral-950 border-b border-neutral-800">
            <h2 className="text-white font-black text-xl flex items-center gap-2"><Camera className="text-red-500"/> Scan Ticket</h2>
            <button onClick={() => setShowScanner(false)} className="bg-neutral-900 p-2 rounded-full text-gray-400 hover:text-white"><X size={24} /></button>
          </div>
          <div className="flex-1 flex items-center justify-center overflow-hidden bg-black relative">
            <div className="absolute inset-0 z-0">
              <Scanner onScan={handleScan} onError={(error) => console.log(error)} components={{ audio: false, finder: true }} />
            </div>
          </div>
        </div>
      )}

      {/* 👉 NEW: Admin Header with Logo */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10 border-b border-neutral-800 pb-6">
        <div className="flex items-center gap-4">
          <img 
            src="/bheemas-logo.png" 
            alt="Bheemas Logo" 
            className="w-14 h-14 md:w-16 md:h-16 rounded-2xl object-cover border-2 border-red-500 shadow-[0_0_20px_rgba(220,38,38,0.3)] shrink-0" 
          />
          <div>
            <h1 className="text-3xl font-black text-white tracking-tight uppercase">Command Center</h1>
            <p className="text-red-400 font-bold tracking-widest text-xs uppercase mt-1">Bheema's Syndicate Live POS</p>
          </div>
        </div>
      </div>

      <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-6 md:p-8 mb-10 shadow-[0_0_40px_rgba(220,38,38,0.05)]">
        <div className="flex flex-col md:flex-row gap-8 items-center justify-between">
          <div className="flex-1 w-full flex flex-col items-center md:items-start text-center md:text-left">
            <h2 className="text-2xl font-black text-white mb-2 flex items-center gap-2 justify-center md:justify-start w-full"><QrCode className="text-red-500" size={28}/> Quick Scan</h2>
            <p className="text-gray-400 text-sm mb-6">Instantly scan and redeem a student's ticket.</p>
            <button onClick={() => setShowScanner(true)} className="w-full bg-red-600 hover:bg-red-500 text-white font-black py-4 rounded-xl transition-transform active:scale-95 text-lg uppercase tracking-widest flex items-center justify-center gap-2 border border-red-500"><Camera size={24}/> Open Scanner</button>
          </div>
          <div className="w-full h-px md:w-px md:h-32 bg-neutral-800 my-4 md:my-0"></div>
          <div className="flex-1 w-full text-center md:text-left">
            <h2 className="text-lg font-bold text-white mb-2">Manual Entry</h2>
            <p className="text-gray-400 text-sm mb-4">If camera fails, enter the BHM- ID.</p>
            <form onSubmit={handleManualVerify} className="flex gap-2">
              <input type="text" placeholder="BHM-XXXXX" value={manualId} onChange={(e) => setManualId(e.target.value)} className="flex-1 bg-neutral-950 border border-neutral-800 text-white px-4 py-3 rounded-xl focus:border-red-500 outline-none uppercase font-mono" />
              <button type="submit" className="bg-neutral-800 hover:bg-neutral-700 text-white font-bold px-6 py-3 rounded-xl transition-colors">Search</button>
            </form>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-10">
        <div className="bg-neutral-900 border border-neutral-800 p-6 rounded-2xl flex flex-col justify-center">
          <p className="text-gray-500 text-xs font-bold uppercase tracking-widest mb-2">Active Orders</p>
          <p className="text-4xl sm:text-5xl font-black text-white">{activeOrders.length}</p>
        </div>
        <div className="bg-neutral-900 border border-neutral-800 p-6 rounded-2xl flex flex-col justify-center">
          <p className="text-gray-500 text-xs font-bold uppercase tracking-widest mb-2">Completed Today</p>
          <p className="text-4xl sm:text-5xl font-black text-green-500">{completedOrders.length}</p>
        </div>
        <div className="col-span-2 md:col-span-1 bg-neutral-900 border border-neutral-800 p-6 rounded-2xl flex flex-col justify-center relative overflow-hidden">
          <IndianRupee className="absolute -right-4 -bottom-4 text-neutral-800/50" size={120} />
          <p className="text-gray-500 text-xs font-bold uppercase tracking-widest mb-2 relative z-10">Total Revenue</p>
          <p className="text-4xl sm:text-5xl font-black text-white relative z-10">₹{totalRevenue}</p>
        </div>
      </div>

      <div className="flex items-center gap-3 mb-6">
        <Clock className="text-red-500 animate-pulse" size={24} />
        <h2 className="text-2xl font-black text-white uppercase tracking-wider">Kitchen Queue</h2>
      </div>

      {activeOrders.length === 0 ? (
        <div className="bg-neutral-900 border border-neutral-800 border-dashed rounded-3xl p-12 text-center text-gray-500 mb-16">
          <CheckCircle size={48} className="mx-auto mb-4 opacity-50" />
          <p className="text-xl font-bold">Kitchen is clear!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
          {activeOrders.map((order) => (
            <div key={order.id} className="bg-neutral-900 border border-red-500/40 rounded-3xl p-6 shadow-[0_0_30px_rgba(220,38,38,0.1)] flex flex-col">
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-xl font-black text-white font-mono bg-neutral-950 px-3 py-1 rounded-lg border border-neutral-800">{order.orderId}</h3>
                <span className="bg-red-500 text-white px-3 py-1 rounded-lg font-black text-lg">₹{order.totalAmount}</span>
              </div>
              <div className="mb-4">
                <p className="text-white font-bold text-lg">{order.customerDetails?.name}</p>
                <p className="text-gray-400 text-sm">{order.customerDetails?.phone}</p>
              </div>
              <div className="bg-neutral-950 border border-yellow-500/30 rounded-xl p-4 mb-4 flex flex-col">
                <span className="text-yellow-500 text-xs font-bold uppercase tracking-widest mb-1">Verify UTR</span>
                <span className="text-white font-mono text-lg tracking-widest">{order.customerDetails?.utr}</span>
              </div>
              <div className="bg-neutral-950 rounded-xl p-4 mb-6 flex-1 border border-neutral-800">
                <span className="text-gray-500 text-xs font-bold uppercase tracking-widest mb-3 block">Items</span>
                <div className="space-y-3">
                  {order.items?.map((item, idx) => (
                    <div key={idx} className="flex justify-between items-center text-gray-300 border-b border-neutral-800 pb-2 last:border-0 last:pb-0">
                      <span className="font-medium text-white">{item.name}</span>
                      <span className="bg-neutral-800 text-white font-black px-2 py-1 rounded text-sm">x{item.qty}</span>
                    </div>
                  ))}
                </div>
              </div>
              <button onClick={() => markAsCompleted(order.id)} className="w-full bg-green-600 hover:bg-green-500 text-white font-black py-4 rounded-xl transition-transform active:scale-95 flex items-center justify-center gap-2 uppercase tracking-widest">
                <CheckCircle size={20} /> Mark Completed
              </button>
            </div>
          ))}
        </div>
      )}

      <div className="flex items-center gap-3 mb-6 mt-16 border-t border-neutral-800 pt-16">
        <Package className="text-blue-500" size={24} />
        <h2 className="text-2xl font-black text-white uppercase tracking-wider">Inventory Control</h2>
      </div>

      <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-6 md:p-8 mb-16 shadow-[0_0_40px_rgba(0,0,0,0.5)]">
        <p className="text-gray-400 text-sm mb-6">Click an item to instantly mark it as Sold Out on the student's website.</p>
        
        <div className="space-y-8">
          {Object.entries(menuData).map(([category, items]) => (
            <div key={category}>
              <h3 className="text-white font-bold uppercase tracking-widest mb-4 text-sm bg-neutral-950 inline-block px-3 py-1 rounded-lg border border-neutral-800">{category}</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                {items.map(item => {
                  const isSoldOut = soldOutItems.includes(item.id);
                  return (
                    <button
                      key={item.id}
                      onClick={() => toggleInventory(item.id, isSoldOut)}
                      className={`p-3 rounded-xl border transition-all text-left flex justify-between items-center ${isSoldOut ? 'bg-red-500/10 border-red-500/50 text-red-500' : 'bg-neutral-950 border-neutral-800 text-white hover:border-blue-500/50'}`}
                    >
                      <span className="font-medium text-sm truncate pr-2">{item.name}</span>
                      {isSoldOut ? <X size={16} className="flex-shrink-0" /> : <CheckCircle size={16} className="text-green-500 flex-shrink-0" />}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AdminPage;