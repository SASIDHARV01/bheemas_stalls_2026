// src/pages/AdminPage.jsx
import { useState, useEffect, useRef } from 'react';
import { collection, query, orderBy, onSnapshot, doc, updateDoc, setDoc, arrayUnion, arrayRemove } from 'firebase/firestore';
import { db } from '../firebase';
import { CheckCircle, Clock, IndianRupee, QrCode, X, Camera, Lock, Package, Image as ImageIcon, Store, History, ChefHat } from 'lucide-react';
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
  
  const [selectedStall, setSelectedStall] = useState(null);
  
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
      alert("Failed to update inventory.");
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
  const totalRevenue = completedOrders.reduce((total, order) => total + Number(order.totalAmount || 0), 0);

  // 👉 NEW: Segregate BOTH Active and Completed orders by Stall
  const activeStallData = {};
  const completedStallData = {};

  Object.keys(menuData).forEach(key => {
    activeStallData[key] = { orders: [] };
    completedStallData[key] = { revenue: 0, orderCount: 0, orders: [] };
  });
  
  activeStallData['uncategorized'] = { orders: [] };
  completedStallData['uncategorized'] = { revenue: 0, orderCount: 0, orders: [] };

  // Helper function to slice orders up by stall
  const processOrders = (orderList, destinationObj, isCompleted) => {
    orderList.forEach(order => {
      const stallContributions = {};
      
      order.items?.forEach(item => {
        let foundStall = 'uncategorized';
        for (const [stallId, stallItems] of Object.entries(menuData)) {
          if (stallItems.some(si => si.id === item.id || si.name === item.name)) {
            foundStall = stallId;
            break;
          }
        }
        
        if (!stallContributions[foundStall]) stallContributions[foundStall] = { items: [], stallRevenue: 0 };
        stallContributions[foundStall].items.push(item);
        stallContributions[foundStall].stallRevenue += (Number(item.price || 0) * Number(item.qty || 1));
      });

      Object.entries(stallContributions).forEach(([stallId, data]) => {
        if (destinationObj[stallId]) {
          if (isCompleted) {
            destinationObj[stallId].revenue += data.stallRevenue;
            destinationObj[stallId].orderCount += 1;
          }
          
          destinationObj[stallId].orders.push({
            docId: order.id,
            orderId: order.orderId,
            customerName: order.customerDetails?.name,
            phone: order.customerDetails?.phone,
            utr: order.customerDetails?.utr,
            proofUrl: order.customerDetails?.proofUrl,
            stallRevenue: data.stallRevenue,
            totalGlobalAmount: order.totalAmount,
            items: data.items 
          });
        }
      });
    });
  };

  // Run the slicing logic
  processOrders(activeOrders, activeStallData, false);
  processOrders(completedOrders, completedStallData, true);

  const visibleCompletedStalls = Object.entries(completedStallData).filter(([id, data]) => id !== 'uncategorized' || data.revenue > 0);
  const visibleActiveStalls = Object.entries(activeStallData).filter(([id, data]) => id !== 'uncategorized' || data.orders.length > 0);

  return (
    <div className="min-h-screen bg-neutral-950 p-4 md:p-8 font-sans pb-20 relative">
      
      {/* SCANNER MODAL */}
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

      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10 border-b border-neutral-800 pb-6">
        <div className="flex items-center gap-4">
          <img src="/logo.jpeg" alt="Bheemas Logo" className="w-14 h-14 md:w-16 md:h-16 rounded-2xl object-cover border-2 border-red-500 shadow-[0_0_20px_rgba(220,38,38,0.3)] shrink-0" />
          <div>
            <h1 className="text-3xl font-black text-white tracking-tight uppercase">Command Center</h1>
            <p className="text-red-400 font-bold tracking-widest text-xs uppercase mt-1">Bheema's Syndicate Live POS</p>
          </div>
        </div>
      </div>

      {/* QUICK ACTIONS */}
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

      {/* GLOBAL STATS */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-10">
        <div className="bg-neutral-900 border border-neutral-800 p-6 rounded-2xl flex flex-col justify-center">
          <p className="text-gray-500 text-xs font-bold uppercase tracking-widest mb-2">Total Active</p>
          <p className="text-4xl sm:text-5xl font-black text-white">{activeOrders.length}</p>
        </div>
        <div className="bg-neutral-900 border border-neutral-800 p-6 rounded-2xl flex flex-col justify-center">
          <p className="text-gray-500 text-xs font-bold uppercase tracking-widest mb-2">Total Completed</p>
          <p className="text-4xl sm:text-5xl font-black text-green-500">{completedOrders.length}</p>
        </div>
        <div className="col-span-2 md:col-span-1 bg-neutral-900 border border-neutral-800 p-6 rounded-2xl flex flex-col justify-center relative overflow-hidden">
          <IndianRupee className="absolute -right-4 -bottom-4 text-neutral-800/50" size={120} />
          <p className="text-gray-500 text-xs font-bold uppercase tracking-widest mb-2 relative z-10">Global Revenue</p>
          <p className="text-4xl sm:text-5xl font-black text-white relative z-10">₹{totalRevenue}</p>
        </div>
      </div>

      {/* REVENUE CARDS */}
      <div className="flex items-center gap-3 mb-6 mt-16 border-t border-neutral-800 pt-16">
        <Store className="text-blue-500" size={24} />
        <h2 className="text-2xl font-black text-white uppercase tracking-wider">Stall Revenue Breakdown</h2>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-16">
        {visibleCompletedStalls.map(([stallId, data]) => (
          <div key={stallId} className={`bg-neutral-900 border ${stallId === 'uncategorized' ? 'border-red-500/50' : 'border-neutral-800'} rounded-2xl p-5 shadow-lg`}>
            <h3 className={`${stallId === 'uncategorized' ? 'text-red-400' : 'text-gray-400'} font-bold uppercase tracking-widest text-xs mb-2`}>{stallId}</h3>
            <p className="text-2xl sm:text-3xl font-black text-white mb-1">₹{data.revenue}</p>
            <p className="text-xs text-gray-500 font-bold">{data.orderCount} Stall Orders</p>
          </div>
        ))}
      </div>

      {/* 👉 UPDATED: SEGREGATED KITCHEN QUEUE */}
      <div className="flex items-center gap-3 mb-6 border-t border-neutral-800 pt-16">
        <ChefHat className="text-red-500 animate-pulse" size={24} />
        <h2 className="text-2xl font-black text-white uppercase tracking-wider">Kitchen Queue (Live)</h2>
      </div>

      <div className="space-y-12 mb-16">
        {activeOrders.length === 0 ? (
          <div className="bg-neutral-900 border border-neutral-800 border-dashed rounded-3xl p-12 text-center text-gray-500">
            <CheckCircle size={48} className="mx-auto mb-4 opacity-50" />
            <p className="text-xl font-bold">All kitchens are clear!</p>
          </div>
        ) : (
          visibleActiveStalls.map(([stallId, data]) => (
            <div key={stallId} className="bg-neutral-900/30 p-4 md:p-6 rounded-3xl border border-red-500/20">
              <h3 className="text-2xl font-black text-white mb-6 uppercase tracking-widest border-b border-neutral-800/50 pb-3 flex justify-between items-center">
                <span>{stallId} Queue</span>
                <span className="text-sm font-bold text-red-500 bg-red-500/10 px-3 py-1 rounded-lg animate-pulse">{data.orders.length} Pending</span>
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {data.orders.map((o, idx) => (
                  <div key={idx} className="bg-neutral-900 border border-red-500/40 rounded-2xl p-5 shadow-[0_0_30px_rgba(220,38,38,0.1)] flex flex-col">
                    <div className="flex justify-between items-start mb-4 border-b border-neutral-800 pb-4">
                      <h3 className="text-lg font-black text-white font-mono bg-neutral-950 px-2 py-1 rounded-md border border-neutral-800">{o.orderId}</h3>
                      <div className="text-right">
                        <span className="text-xs text-gray-500 uppercase tracking-widest block mb-1">Stall Cut</span>
                        <span className="bg-red-500 text-white px-2 py-1 rounded font-black">₹{o.stallRevenue}</span>
                      </div>
                    </div>
                    
                    <div className="bg-neutral-950 border border-yellow-500/30 rounded-xl p-3 mb-4 flex flex-col relative overflow-hidden">
                      <span className="text-yellow-500 text-[10px] font-bold uppercase tracking-widest mb-1">Verify UTR</span>
                      <span className="text-white font-mono text-base tracking-widest">{o.utr}</span>
                      {o.proofUrl && (
                        <a href={o.proofUrl} target="_blank" rel="noreferrer" className="mt-2 text-blue-400 hover:text-blue-300 text-[10px] font-bold uppercase tracking-widest py-1 bg-blue-500/10 rounded text-center flex items-center justify-center gap-1 transition-colors">
                          <ImageIcon size={12} /> View Screenshot
                        </a>
                      )}
                    </div>

                    <div className="bg-neutral-950 rounded-xl p-3 mb-5 flex-1 border border-neutral-800">
                      <span className="text-gray-500 text-[10px] font-bold uppercase tracking-widest mb-2 block">To Cook:</span>
                      <div className="space-y-2">
                        {o.items.map((item, i) => (
                          <div key={i} className="flex justify-between items-center text-gray-300 border-b border-neutral-800/50 pb-1.5 last:border-0 last:pb-0">
                            <span className="font-medium text-sm text-white">{item.name}</span>
                            <span className="bg-neutral-800 text-white font-black px-2 py-0.5 rounded text-xs">x{item.qty}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Note: Clicking this completes the ENTIRE order globally for all stalls */}
                    <button onClick={() => markAsCompleted(o.docId)} className="w-full bg-green-600 hover:bg-green-500 text-white font-black py-3 rounded-lg transition-transform active:scale-95 flex items-center justify-center gap-2 uppercase tracking-widest text-sm">
                      <CheckCircle size={16} /> Mark Order Complete
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ))
        )}
      </div>

      {/* 👉 SEGREGATED REDEEMED HISTORY */}
      <div className="flex items-center gap-3 mb-6 border-t border-neutral-800 pt-16">
        <History className="text-gray-400" size={24} />
        <h2 className="text-2xl font-black text-white uppercase tracking-wider">Redeemed History</h2>
      </div>

      <div className="space-y-12 mb-16">
        {visibleCompletedStalls.length === 0 ? (
          <p className="text-gray-500 text-center py-10 font-bold tracking-widest uppercase bg-neutral-900/50 rounded-2xl border border-neutral-800">No expired tickets yet.</p>
        ) : (
          visibleCompletedStalls.map(([stallId, data]) => (
            <div key={stallId} className="bg-neutral-900/30 p-4 md:p-6 rounded-3xl border border-neutral-800">
              <h3 className="text-xl font-black text-gray-300 mb-6 uppercase tracking-widest border-b border-neutral-800/50 pb-3 flex justify-between items-center">
                <span>{stallId} Stall</span>
                <span className="text-sm font-bold text-gray-500 bg-neutral-900 px-3 py-1 rounded-lg">₹{data.revenue}</span>
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {data.orders.map((o, idx) => (
                  <div key={idx} className="bg-neutral-950 border border-neutral-800/80 rounded-2xl p-4 opacity-80 hover:opacity-100 transition-opacity">
                    <div className="flex justify-between items-center mb-3">
                       <span className="text-gray-400 font-mono font-bold line-through decoration-red-500/50">{o.orderId}</span>
                       <span className="text-[10px] font-bold text-red-500 uppercase tracking-widest bg-red-500/10 border border-red-500/20 px-2 py-1 rounded">Expired</span>
                    </div>
                    
                    <div className="mb-4">
                      <p className="text-gray-300 text-sm font-medium">{o.customerName}</p>
                      <p className="text-gray-500 text-xs mt-1 font-mono tracking-wider">{o.utr}</p>
                    </div>

                    <div className="space-y-2 border-t border-neutral-800/50 pt-3">
                      {o.items.map((item, i) => (
                        <div key={i} className="flex justify-between items-center text-xs text-gray-400">
                          <span>{item.name}</span>
                          <span className="bg-neutral-900 px-1.5 py-0.5 rounded text-gray-500 font-bold">x{item.qty}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))
        )}
      </div>

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