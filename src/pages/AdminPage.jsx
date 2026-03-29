// src/pages/AdminPage.jsx
import { useState, useEffect, useRef } from 'react';
import { collection, query, orderBy, onSnapshot, doc, updateDoc, setDoc, arrayUnion, arrayRemove, deleteDoc, addDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { 
  CheckCircle, Clock, IndianRupee, QrCode, X, Camera, Lock, 
  Package, Image as ImageIcon, Store, History, ChefHat, Trash2, Zap, XCircle, Search,
  Plus, Edit, Database, PlusCircle, MinusCircle, Save, AlertTriangle
} from 'lucide-react';
import { Scanner } from '@yudiel/react-qr-scanner';

const SECRET_PIN = "2026";

// Exact Menu Data 
const menuData = {
  biryani: [
    { id: 'b1', category: 'Dum Biryani Section', name: 'Dum Biryani (1 Piece)', price: 189, type: 'Non-Veg', desc: '1 Piece Dum Biryani', image: '/b1.jpeg' },
    { id: 'b2', category: 'Dum Biryani Section', name: 'Dum Biryani (2 Pieces)', price: 209, type: 'Non-Veg', desc: '2 Pieces Dum Biryani', image: '/b1.jpeg' },
    { id: 'b3', category: 'Dum Biryani Section', name: 'Dum Biryani (1 Piece + Juice)', price: 219, type: 'Non-Veg', desc: '1 Piece + 1 Fruit Juice', image: '/2bj.jpeg' },
    { id: 'b4', category: 'Dum Biryani Section', name: 'Dum Biryani (2 Pieces + Drink)', price: 229, type: 'Non-Veg', desc: '2 Pieces + 1 Cool Drink', image: '/b1.jpeg' },
    { id: 'b5', category: 'Dum Biryani Section', name: 'Dum Biryani (2 Pieces + Juice)', price: 239, type: 'Non-Veg', desc: '2 Pieces + 1 Fruit Juice', image: '/2bj.jpeg' },
    { id: 'b6', category: 'Fry Piece Biryani', name: 'Fry Biryani (2 Pieces)', price: 229, type: 'Non-Veg', desc: '2 Pieces Fry Biryani', image: '/b1.jpeg' },
    { id: 'b7', category: 'Fry Piece Biryani', name: 'Fry Biryani (2 Pieces + Drink)', price: 249, type: 'Non-Veg', desc: '2 Pieces + 1 Cool Drink', image: '/b1.jpeg' },
    { id: 'b8', category: 'Fry Piece Biryani', name: 'Fry Biryani (2 Pieces + Juice)', price: 259, type: 'Non-Veg', desc: '2 Pieces + 1 Fruit Juice', image: '/2bj.jpeg' },
    { id: 'b9', category: 'Combo', name: 'Biryani (1 Dum Pcs + 1 Fry Pcs)', price: 259, type: 'Non-Veg', desc: '1 Dum Piece + 1 Fry Piece', image: '/c1.jpeg' },
    { id: 'b10', category: 'Combo', name: 'Dum Biryani (2 Pcs) 3+1 Combo', price: 699, type: 'Non-Veg', desc: 'Buy 3 Get 1 Free + 1 Juice', image: '/c1.webp' },
    { id: 'b11', category: 'Combo', name: 'Dum Biryani (2 Pcs) 5+1 Combo', price: 1250, type: 'Non-Veg', desc: 'Buy 5 Get 1 Free + 2 Juices', image: '/c3.jpg' },
    { id: 'b12', category: 'Combo', name: 'Fry Biryani (2 Pcs) 3+1 Combo', price: 749, type: 'Non-Veg', desc: 'Buy 3 Get 1 Free + 1 Juice', image: '/c1.webp' },
    { id: 'b13', category: 'Combo', name: 'Fry Biryani (2 Pcs) 5+1 Combo', price: 1350, type: 'Non-Veg', desc: 'Buy 5 Get 1 Free + 2 Juices', image: '/c3.jpg' }
  ],
  fruitjuice: [
    { id: 'j1', category: 'Fresh Juices', name: 'Banana Juice', price: 70, type: 'Drink', desc: 'Fresh & Creamy', image: '/banana.jpg' },
    { id: 'j2', category: 'Fresh Juices', name: 'Musk-Melon Juice', price: 80, type: 'Drink', desc: 'Refreshing summer cooler', image: '/muskmelon.jpg' },
    { id: 'j3', category: 'Fresh Juices', name: 'Pineapple Juice', price: 80, type: 'Drink', desc: 'Sweet and tangy', image: '/pineapple.jpeg' },
    { id: 'j4', category: 'Fresh Juices', name: 'Watermelon Juice', price: 70, type: 'Drink', desc: 'Hydrating fresh juice', image: '/watermelon.avif' },
    { id: 'j5', category: 'Fresh Juices', name: 'Grape Juice', price: 80, type: 'Drink', desc: 'Rich grape flavor', image: '/grapejuice.jpeg' },
    { id: 'j16', category: 'Fresh Juices', name: 'Sapota Juice', price: 80, type: 'Drink', desc: 'Sweet and delicious', image: '/sapota.jpg' },
    { id: 'j6', category: 'Fresh Juices', name: 'Fruit Salad', price: 50, type: 'Veg', desc: 'Mixed seasonal fruits', image: '/salad.jpg' },
    { id: 'j7', category: 'Thickshakes', name: 'Oreo Shake', price: 100, type: 'Drink', desc: 'Classic crushed Oreo blend', image: '/oreoshake.jpg' },
    { id: 'j8', category: 'Thickshakes', name: 'Kit-Kat Shake', price: 100, type: 'Drink', desc: 'Chocolatey wafer goodness', image: '/kitkat.jpg' },
    { id: 'j9', category: 'Thickshakes', name: 'Vanilla Shake', price: 110, type: 'Drink', desc: 'Rich Flavoured delight', image: '/vanilla.jpeg' },
    { id: 'j10', category: 'Thickshakes', name: 'Chocolate Shake', price: 110, type: 'Drink', desc: 'Rich chocolate blend', image: '/chocolate.jpg' },
    { id: 'j11', category: 'Thickshakes', name: 'Pista Shake', price: 120, type: 'Drink', desc: 'Premium pistachio blend', image: '/pista.webp' },
    { id: 'j12', category: 'Combos', name: '5+1 Any Juice Combo', price: 300, type: 'Drink', desc: 'Buy 5 Get 1 Free (Juices)', image: '/banana.jpg' },
    { id: 'j13', category: 'Combos', name: '5+1 Any Shake Combo', price: 450, type: 'Drink', desc: 'Buy 5 Get 1 Free (Shakes)', image: '/oreoshake.jpg' },
    { id: 'j14', category: 'Combos', name: '10+3 Any Juice Combo', price: 600, type: 'Drink', desc: 'Buy 10 Get 3 Free (Juices)', image: '/pineapple.jpeg' },
    { id: 'j15', category: 'Combos', name: '10+3 Any Shake Combo', price: 900, type: 'Drink', desc: 'Buy 10 Get 3 Free (Shakes)', image: '/chocolate.jpg' }
  ],
  fastfood: [
    { id: 'f1', category: 'Fried Rice Section', name: 'Egg Fried Rice', price: 120, type: 'Non-Veg', desc: 'Classic wok-tossed egg fried rice', image: '/EggFriedRice.jpg' },
    { id: 'f2', category: 'Fried Rice Section', name: 'Chicken Fried Rice', price: 1, type: 'Non-Veg', desc: 'Savory chicken chunks with seasoned rice', image: '/ChickenFriedRice.jpg' },
    { id: 'f3', category: 'Fried Rice Section', name: 'Sp. Chicken Fried Rice', price: 150, type: 'Non-Veg', desc: 'Bheema’s Special double-egg chicken fried rice', image: '/SpChickenFriedRice.avif' },
    { id: 'f4', category: 'Noodles Section', name: 'Egg Noodles', price: 120, type: 'Non-Veg', desc: 'Spicy street-style egg noodles', image: '/EggNoodles.webp' },
    { id: 'f5', category: 'Noodles Section', name: 'Chicken Noodles', price: 140, type: 'Non-Veg', desc: 'Wok-tossed noodles with tender chicken strips', image: '/ChickenNoodles.jpg' },
    { id: 'f6', category: 'Noodles Section', name: 'Sp Chicken Noodles', price: 150, type: 'Non-Veg', desc: 'Extra spicy special chicken noodles', image: '/SpChickenNoodles.jpg' },
    { id: 'f7', category: 'Manchuria Section', name: 'Egg Manchuria', price: 120, type: 'Non-Veg', desc: 'Crispy egg balls in spicy Manchurian sauce', image: '/EggManchuria.cms' },
    { id: 'f8', category: 'Manchuria Section', name: 'Chicken Manchuria', price: 140, type: 'Non-Veg', desc: 'Golden fried chicken in tangy sauce', image: '/ChickenManchuria.webp' },
    { id: 'f9', category: 'Manchuria Section', name: 'Sp Chicken Manchuria', price: 150, type: 'Non-Veg', desc: 'Premium Bheema special spicy Manchuria', image: '/SpChickenManchuria.jpg' }
  ],
  soda: [
    { id: 's1', category: 'Sodas Section', name: 'Lemon Soda', price: 1, type: 'Veg', desc: 'Refreshing Chilled Lemon Soda', image: '/lemon-soda.jpg' },
    { id: 's2', category: 'Sodas Section', name: 'Blue Berry Soda', price: 30, type: 'Veg', desc: 'Chilled Blue Berry Sparkler', image: '/blue-berry-soda.jpg' },
    { id: 's3', category: 'Sodas Section', name: 'Pineapple Apple Soda', price: 30, type: 'Veg', desc: 'Unique Pineapple & Apple Mix', image: '/pineapple-soda.jpg' },
    { id: 's4', category: 'Sodas Section', name: 'Sunanda Soda', price: 30, type: 'Veg', desc: 'Classic Sunanda Special', image: '/sugandha-soda.jpeg' },
    { id: 's5', category: 'Sodas Section', name: 'Mint Soda', price: 30, type: 'Veg', desc: 'Fresh Mint Cooling Soda', image: '/mint-soda.jpeg' },
    { id: 's6', category: 'Sodas Section', name: 'Orange Soda', price: 30, type: 'Veg', desc: 'Zesty Tangy Orange Soda', image: '/orange-soda.jpg' },
    { id: 'm1', category: 'Mojitos Section', name: 'Blue Lagoon', price: 70, type: 'Veg', desc: 'Deep Blue Tropical Mojito', image: '/BlueLagoonMojito.webp' },
    { id: 'm2', category: 'Mojitos Section', name: 'Lemon Mint Mojito', price: 70, type: 'Veg', desc: 'Classic Lemon & Mint Mojito', image: '/LemonMint.jpg' },
    { id: 'm3', category: 'Mojitos Section', name: 'Red Cherry Mojito', price: 80, type: 'Veg', desc: 'Sweet & Tart Red Cherry Mojito', image: '/RedCherryMojito.jpg' },
    { id: 'm4', category: 'Mojitos Section', name: 'Green Mint Mojito', price: 70, type: 'Veg', desc: 'Extra Fresh Green Mint Mojito', image: '/GreenMintMojito.webp' }
  ]
};

const allMenuItemsList = Object.values(menuData).flat();

const formatDateTime = (timestamp) => {
  if (!timestamp) return "Time Not Available";
  const date = timestamp?.toDate ? timestamp.toDate() : new Date(timestamp);
  return date.toLocaleString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit', hour12: true
  });
};

const AdminPage = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(() => sessionStorage.getItem('adminAuth') === 'true');
  const [pinInput, setPinInput] = useState("");
  const [pinError, setPinError] = useState(false);

  const [orders, setOrders] = useState([]);
  const [soldOutItems, setSoldOutItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState(""); 
  const [showScanner, setShowScanner] = useState(false);
  
  const [adminStallMode, setAdminStallMode] = useState("biryani"); 
  const [scanResult, setScanResult] = useState(null); 
  const [revenueDetailStall, setRevenueDetailStall] = useState(null);
  
  // Custom Modals to replace window functions!
  const [customAlert, setCustomAlert] = useState(null); 
  const [confirmDialog, setConfirmDialog] = useState(null);

  // CRUD STATE
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);
  const [editingOrder, setEditingOrder] = useState(null);
  const [formData, setFormData] = useState({ name: '', email: '', utr: '', items: [] });
  const [selectedMenuItem, setSelectedMenuItem] = useState("");

  const isFirstLoad = useRef(true);

  useEffect(() => {
    if (!isAuthenticated) return; 

    const q = query(collection(db, "orders"), orderBy("timestamp", "desc"));
    const unsubOrders = onSnapshot(q, (snapshot) => {
      if (!isFirstLoad.current) {
        snapshot.docChanges().forEach((change) => {
          if (change.type === "added") {
            new Audio('https://actions.google.com/sounds/v1/alarms/beep_short.ogg').play().catch(e => console.log(e));
          }
        });
      }
      setOrders(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setLoading(false);
      isFirstLoad.current = false; 
    });

    const unsubInventory = onSnapshot(doc(db, "settings", "menu"), (docSnap) => {
      if (docSnap.exists()) setSoldOutItems(docSnap.data().outOfStock || []);
    });
    
    return () => { unsubOrders(); unsubInventory(); };
  }, [isAuthenticated]);

  const handleLogin = (e) => {
    e.preventDefault();
    if (pinInput === SECRET_PIN) {
      setIsAuthenticated(true); sessionStorage.setItem('adminAuth', 'true'); setPinError(false);
    } else { setPinError(true); setPinInput(""); }
  };

  const handleScan = async (data) => {
    if (data) {
      let text = typeof data === 'string' ? data : (data[0]?.rawValue || data.text || "");
      const match = text.match(/BHM-[A-Z0-9-]+/i);
      
      if (match) {
        setShowScanner(false);
        const scannedOrderId = match[0].toUpperCase();
        const order = orders.find(o => o.orderId === scannedOrderId);

        if (!order) {
          setScanResult({ type: 'error', message: 'TICKET NOT FOUND IN DATABASE' });
          return;
        }

        const redemptionStatus = order.redemptionStatus || {};
        const hasStallItems = order.items.some(item => menuData[adminStallMode].some(m => m.id === item.id));

        if (!hasStallItems) {
          setScanResult({ type: 'error', message: `NO ${adminStallMode.toUpperCase()} ITEMS IN THIS ORDER`, order });
        } else if (redemptionStatus[adminStallMode] === true) {
          setScanResult({ type: 'expired', message: `TICKET EXPIRED! ALREADY COLLECTED AT ${adminStallMode.toUpperCase()}`, order });
        } else {
          const updatedStatus = { 
            ...redemptionStatus, 
            [adminStallMode]: true, 
            [`${adminStallMode}_time`]: new Date().toISOString() 
          };
          await updateDoc(doc(db, "orders", order.id), { redemptionStatus: updatedStatus });
          setScanResult({ type: 'success', message: `SUCCESS! REDEEMED AT ${adminStallMode.toUpperCase()}`, order });
        }
      }
    }
  };

  const handleManualPunch = async (docId, stallId, currentStatus) => {
    const updatedStatus = { 
        ...(currentStatus || {}), 
        [stallId]: true, 
        [`${stallId}_time`]: new Date().toISOString() 
    };
    await updateDoc(doc(db, "orders", docId), { redemptionStatus: updatedStatus });
  };

  const toggleInventory = async (itemId, isCurrentlySoldOut) => {
    const menuRef = doc(db, "settings", "menu");
    await setDoc(menuRef, { outOfStock: isCurrentlySoldOut ? arrayRemove(itemId) : arrayUnion(itemId) }, { merge: true });
  };

  // --- CRUD OPERATIONS FOR ORDERS ---
  const openCreateModal = () => {
    setEditingOrder(null);
    setFormData({ name: '', email: '', utr: '', items: [] });
    setIsOrderModalOpen(true);
  };

  const openEditModal = (order) => {
    setEditingOrder(order);
    setFormData({
      name: order.customerDetails?.name || '',
      email: order.customerDetails?.email || '',
      utr: order.customerDetails?.utr || '',
      items: JSON.parse(JSON.stringify(order.items)) // deep copy to edit safely
    });
    setIsOrderModalOpen(true);
  };

  // REPLACED window.confirm
  const triggerDeleteOrder = (docId) => {
    setConfirmDialog({
      message: "WARNING: Are you sure you want to permanently delete this entire order?",
      onConfirm: async () => {
        await deleteDoc(doc(db, "orders", docId));
        setConfirmDialog(null);
      }
    });
  };

  const handleAddItemToForm = () => {
    if (!selectedMenuItem) return;
    const itemData = allMenuItemsList.find(i => i.id === selectedMenuItem);
    if (!itemData) return;

    setFormData(prev => {
      const existingItemIndex = prev.items.findIndex(i => i.id === itemData.id);
      if (existingItemIndex >= 0) {
        const newItems = [...prev.items];
        newItems[existingItemIndex].qty += 1;
        return { ...prev, items: newItems };
      } else {
        return { ...prev, items: [...prev.items, { id: itemData.id, name: itemData.name, price: itemData.price, qty: 1 }] };
      }
    });
    setSelectedMenuItem("");
  };

  const updateFormItemQty = (index, delta) => {
    setFormData(prev => {
      const newItems = [...prev.items];
      newItems[index].qty += delta;
      if (newItems[index].qty <= 0) newItems.splice(index, 1);
      return { ...prev, items: newItems };
    });
  };

  const handleSaveOrder = async (e) => {
    e.preventDefault();
    if (formData.items.length === 0) {
      // REPLACED window.alert
      setCustomAlert("Order must have at least one item!");
      return;
    }

    const orderData = {
      customerDetails: {
        name: formData.name,
        email: formData.email,
        utr: formData.utr || "MANUAL-ENTRY",
        ...(editingOrder?.customerDetails?.proofUrl ? { proofUrl: editingOrder.customerDetails.proofUrl } : {})
      },
      items: formData.items,
      timestamp: editingOrder ? editingOrder.timestamp : new Date(),
      orderId: editingOrder ? editingOrder.orderId : `BHM-${Math.floor(100000 + Math.random() * 900000)}`,
      redemptionStatus: editingOrder ? editingOrder.redemptionStatus : {}
    };

    try {
      if (editingOrder) {
        await updateDoc(doc(db, "orders", editingOrder.id), orderData);
      } else {
        await addDoc(collection(db, "orders"), orderData);
      }
      setIsOrderModalOpen(false);
    } catch (err) {
      console.error("Error saving order:", err);
      // REPLACED window.alert
      setCustomAlert("Failed to save order.");
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-neutral-950 flex flex-col items-center justify-center p-4">
        <div className="bg-neutral-900 border border-neutral-800 p-6 sm:p-8 rounded-3xl w-full max-w-sm text-center shadow-[0_0_50px_rgba(220,38,38,0.1)]">
          <div className="bg-red-500/10 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 border border-red-500/20"><Lock size={36} className="text-red-500" /></div>
          <h1 className="text-2xl font-black text-white uppercase tracking-widest mb-2">Restricted Area</h1>
          <form onSubmit={handleLogin} className="space-y-4">
            <input 
              type="password" maxLength="4" inputMode="numeric" pattern="[0-9]*" placeholder="••••" 
              value={pinInput} onChange={(e) => setPinInput(e.target.value)}
              className={`w-full bg-neutral-950 border ${pinError ? 'border-red-500' : 'border-neutral-800'} text-white text-center text-3xl tracking-[1em] py-4 rounded-xl outline-none`} 
            />
            <button type="submit" className="w-full bg-white text-black font-black py-4 rounded-xl uppercase tracking-widest active:scale-95 transition-transform">Unlock</button>
          </form>
        </div>
      </div>
    );
  }

  if (loading) return <div className="min-h-screen bg-neutral-950 flex items-center justify-center text-white">Loading Command Center...</div>;

  const filteredOrders = orders.filter(o => {
    const term = searchTerm.toLowerCase();
    return o.orderId?.toLowerCase().includes(term) || 
           o.customerDetails?.name?.toLowerCase().includes(term) ||
           o.customerDetails?.email?.toLowerCase().includes(term) || 
           (o.customerDetails?.utr && o.customerDetails.utr.toLowerCase().includes(term));
  });

  let totalQueuedItems = 0;
  let totalPunchedItems = 0;
  let totalRedeemedRevenue = 0;

  orders.forEach(order => {
    Object.keys(menuData).forEach(stallKey => {
      const stallItems = order.items?.filter(item => menuData[stallKey].some(m => m.id === item.id)) || [];
      if (stallItems.length > 0) {
        if (order.redemptionStatus?.[stallKey] === true) {
          totalPunchedItems++;
          totalRedeemedRevenue += stallItems.reduce((acc, it) => acc + (it.price * it.qty), 0);
        } else {
          totalQueuedItems++;
        }
      }
    });
  });

  return (
    <div className="min-h-screen bg-neutral-950 p-4 md:p-8 font-sans pb-40 relative">
      
      {/* MOBILE SAFE CUSTOM ALERT MODAL */}
      {customAlert && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/95 backdrop-blur-md">
          <div className="bg-neutral-900 border-2 border-red-500 shadow-[0_0_50px_rgba(220,38,38,0.2)] p-6 rounded-3xl w-full max-w-sm text-center">
            <AlertTriangle size={60} className="text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-black text-white uppercase tracking-widest mb-2">Notice</h2>
            <p className="text-gray-300 font-bold text-sm mb-6">{customAlert}</p>
            <button onClick={() => setCustomAlert(null)} className="w-full bg-red-600 text-white font-black py-4 rounded-xl uppercase tracking-widest active:scale-95 transition-transform">Okay</button>
          </div>
        </div>
      )}

      {/* MOBILE SAFE CUSTOM CONFIRM MODAL */}
      {confirmDialog && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/95 backdrop-blur-md">
          <div className="bg-neutral-900 border-2 border-red-500 shadow-[0_0_50px_rgba(220,38,38,0.2)] p-6 rounded-3xl w-full max-w-sm text-center">
            <Trash2 size={60} className="text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-black text-white uppercase tracking-widest mb-2">Confirm Delete</h2>
            <p className="text-gray-300 font-bold text-sm mb-6">{confirmDialog.message}</p>
            <div className="flex gap-4">
              <button onClick={() => setConfirmDialog(null)} className="flex-1 bg-neutral-800 text-white font-black py-4 rounded-xl uppercase tracking-widest active:scale-95 transition-transform">Cancel</button>
              <button onClick={confirmDialog.onConfirm} className="flex-1 bg-red-600 text-white font-black py-4 rounded-xl uppercase tracking-widest active:scale-95 transition-transform">Delete</button>
            </div>
          </div>
        </div>
      )}

      {/* MOBILE STICKY FLOATING SCANNER BUTTON */}
      <div className="md:hidden fixed bottom-6 left-4 right-4 z-[90] pointer-events-none flex justify-center">
         <button 
           onClick={() => setShowScanner(true)} 
           className="pointer-events-auto w-full max-w-[300px] bg-red-600 text-white font-black py-4 rounded-full shadow-[0_10px_40px_rgba(220,38,38,0.5)] flex items-center justify-center gap-2 text-lg uppercase tracking-widest active:scale-95 transition-transform border-2 border-red-500"
         >
           <Camera size={24}/> Scan Ticket
         </button>
      </div>

      {/* CREATE / EDIT ORDER MODAL */}
      {isOrderModalOpen && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/95 backdrop-blur-md">
          <div className="bg-neutral-900 border-2 border-neutral-800 shadow-[0_0_50px_rgba(255,255,255,0.05)] p-5 md:p-6 rounded-3xl w-full max-w-lg flex flex-col max-h-[90vh]">
            <div className="flex justify-between items-center mb-6 border-b border-neutral-800 pb-4">
              <h2 className="text-xl md:text-2xl font-black uppercase tracking-widest text-white">
                {editingOrder ? 'Edit Order' : 'Create Order'}
              </h2>
              <button onClick={() => setIsOrderModalOpen(false)} className="bg-neutral-800 p-2 rounded-full text-gray-400 hover:text-white transition-colors"><X size={20} /></button>
            </div>
            
            <form onSubmit={handleSaveOrder} className="flex-1 overflow-y-auto pr-2 space-y-4">
              <div>
                <label className="text-[10px] text-gray-400 font-bold uppercase tracking-widest block mb-1">Customer Name</label>
                <input type="text" required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full bg-neutral-950 border border-neutral-800 text-white p-3 rounded-xl outline-none focus:border-red-500" />
              </div>
              <div>
                <label className="text-[10px] text-gray-400 font-bold uppercase tracking-widest block mb-1">Email ID</label>
                <input type="email" required value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="w-full bg-neutral-950 border border-neutral-800 text-white p-3 rounded-xl outline-none focus:border-red-500" />
              </div>
              <div>
                <label className="text-[10px] text-gray-400 font-bold uppercase tracking-widest block mb-1">UTR / Payment Ref</label>
                <input type="text" value={formData.utr} onChange={e => setFormData({...formData, utr: e.target.value})} placeholder="Optional for Cash" className="w-full bg-neutral-950 border border-neutral-800 text-white p-3 rounded-xl outline-none focus:border-red-500" />
              </div>

              <div className="border-t border-neutral-800 pt-4 mt-2">
                <label className="text-[10px] text-gray-400 font-bold uppercase tracking-widest block mb-2">Order Items</label>
                <div className="flex gap-2 mb-4">
                  <select value={selectedMenuItem} onChange={(e) => setSelectedMenuItem(e.target.value)} className="flex-1 bg-neutral-950 border border-neutral-800 text-white p-3 rounded-xl outline-none focus:border-red-500 text-xs truncate">
                    <option value="">-- Select Item to Add --</option>
                    {allMenuItemsList.map(item => (
                      <option key={item.id} value={item.id}>{item.name} - ₹{item.price}</option>
                    ))}
                  </select>
                  <button type="button" onClick={handleAddItemToForm} className="bg-neutral-800 text-white p-3 rounded-xl hover:bg-neutral-700 transition-colors"><Plus size={20}/></button>
                </div>

                <div className="space-y-2">
                  {formData.items.map((item, index) => (
                    <div key={index} className="flex justify-between items-center bg-neutral-950 border border-neutral-800 p-3 rounded-xl">
                      <span className="text-xs font-bold text-white uppercase truncate pr-2">{item.name}</span>
                      <div className="flex items-center gap-3 shrink-0">
                        <button type="button" onClick={() => updateFormItemQty(index, -1)} className="text-gray-400 hover:text-red-500"><MinusCircle size={18}/></button>
                        <span className="text-white font-black w-4 text-center text-sm">{item.qty}</span>
                        <button type="button" onClick={() => updateFormItemQty(index, 1)} className="text-gray-400 hover:text-green-500"><PlusCircle size={18}/></button>
                      </div>
                    </div>
                  ))}
                  {formData.items.length === 0 && <p className="text-xs text-red-500 text-center italic mt-2">No items added yet.</p>}
                </div>
              </div>

              <button type="submit" className="w-full bg-white text-black flex items-center justify-center gap-2 font-black py-4 rounded-xl uppercase tracking-widest mt-6 active:scale-95 transition-transform">
                <Save size={20} /> Save Order
              </button>
            </form>
          </div>
        </div>
      )}

      {/* REVENUE MODAL */}
      {revenueDetailStall && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/95 backdrop-blur-md">
          <div className="bg-neutral-900 border-2 border-neutral-800 shadow-[0_0_50px_rgba(34,197,94,0.1)] p-5 md:p-6 rounded-3xl w-full max-w-lg flex flex-col max-h-[85vh]">
            <div className="flex justify-between items-center mb-6 border-b border-neutral-800 pb-4">
              <div>
                <h2 className="text-xl md:text-2xl font-black uppercase tracking-widest text-white">{revenueDetailStall} Revenue</h2>
                <p className="text-[10px] md:text-xs text-green-500 font-bold uppercase mt-1">Detailed Order Breakdown</p>
              </div>
              <button onClick={() => setRevenueDetailStall(null)} className="bg-neutral-800 p-2 rounded-full text-gray-400 hover:text-white transition-colors"><X size={20} /></button>
            </div>
            
            <div className="flex-1 overflow-y-auto pr-2 space-y-3">
              {orders.filter(o => o.redemptionStatus?.[revenueDetailStall] === true).map((o, idx) => {
                const sItems = o.items.filter(it => menuData[revenueDetailStall].some(mi => mi.id === it.id));
                const orderRev = sItems.reduce((sAcc, sIt) => sAcc + (sIt.price * sIt.qty), 0);
                
                return (
                  <div key={idx} className="bg-neutral-950 border border-neutral-800 rounded-xl p-3 md:p-4 flex justify-between items-center">
                    <div className="flex-1 min-w-0 pr-2">
                      <h4 className="text-xs md:text-sm font-black text-white uppercase truncate">{o.customerDetails?.name || "No Name"}</h4>
                      <p className="text-[10px] text-gray-500 font-mono mt-1">{o.orderId}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-base md:text-lg font-black text-green-500">₹{orderRev}</p>
                    </div>
                  </div>
                )
              })}
            </div>
            
            <button onClick={() => setRevenueDetailStall(null)} className="w-full bg-white text-black font-black py-4 rounded-xl uppercase tracking-widest mt-6 active:scale-95 transition-transform">Close Details</button>
          </div>
        </div>
      )}

      {/* SUCCESS/ERROR SCANNED MODAL */}
      {scanResult && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/95 backdrop-blur-md">
          <div className={`bg-neutral-900 border-4 ${scanResult.type === 'success' ? 'border-green-500 shadow-[0_0_50px_rgba(34,197,94,0.3)]' : 'border-red-600 shadow-[0_0_50px_rgba(220,38,38,0.3)]'} p-6 md:p-8 rounded-3xl w-full max-w-sm text-center`}>
            {scanResult.type === 'success' ? <CheckCircle size={80} className="text-green-500 mx-auto mb-4" /> : <XCircle size={80} className="text-red-600 mx-auto mb-4" />}
            <h2 className={`text-2xl md:text-3xl font-black uppercase tracking-widest mb-2 ${scanResult.type === 'success' ? 'text-green-500' : 'text-red-600'}`}>
              {scanResult.type === 'success' ? 'SUCCESS' : 'EXPIRED'}
            </h2>
            <p className="text-white font-bold uppercase text-xs md:text-sm mb-6 px-2">{scanResult.message}</p>
            
            {scanResult.order && scanResult.order.items && (
              <div className="bg-black/50 p-4 rounded-xl mb-6 text-left border border-neutral-800">
                <p className="text-[10px] md:text-xs text-gray-500 font-bold uppercase mb-2">Order Contains:</p>
                {scanResult.order.items.filter(it => menuData[adminStallMode].some(m=>m.id === it.id)).map((it, i) => (
                  <div key={i} className="flex justify-between items-center text-xs md:text-sm font-bold text-white uppercase border-b border-neutral-800/50 pb-1 mb-1">
                    <span className="truncate pr-2">{it.name}</span><span className="text-red-500 shrink-0">x{it.qty}</span>
                  </div>
                ))}
              </div>
            )}
            <button onClick={() => setScanResult(null)} className="w-full bg-white text-black font-black py-4 rounded-xl uppercase tracking-widest active:scale-95 transition-transform">Close</button>
          </div>
        </div>
      )}

      {showScanner && (
        <div className="fixed inset-0 z-[120] bg-black flex flex-col">
          <div className="p-4 md:p-6 flex justify-between items-center bg-neutral-950 border-b border-neutral-800">
            <h2 className="text-white font-black text-lg md:text-xl flex items-center gap-2">Scanning: <span className="text-red-500 uppercase">{adminStallMode}</span></h2>
            <button onClick={() => setShowScanner(false)} className="bg-neutral-900 p-3 rounded-full text-gray-400 active:bg-neutral-800"><X size={24} /></button>
          </div>
          <div className="flex-1 flex items-center justify-center overflow-hidden bg-black relative">
            <Scanner onScan={handleScan} components={{ audio: false, finder: true }} />
          </div>
        </div>
      )}

      {/* --- PAGE HEADER --- */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8 border-b border-neutral-800 pb-6">
        <div className="flex items-center gap-4">
          <img src="/logo.jpeg" alt="Logo" className="w-12 h-12 md:w-14 md:h-14 rounded-2xl object-cover border-2 border-red-500 shrink-0" />
          <div>
            <h1 className="text-2xl md:text-3xl font-black text-white tracking-tight uppercase">Command Center</h1>
            <p className="text-red-400 font-bold tracking-widest text-[10px] md:text-xs uppercase mt-1">Multi-Stall Operations</p>
          </div>
        </div>
      </div>

      <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-5 md:p-8 mb-8 shadow-[0_0_40px_rgba(220,38,38,0.05)]">
        <h3 className="text-[10px] md:text-xs font-black uppercase text-red-500 mb-4 flex items-center gap-2"><Zap size={16}/> 1. Select Your Stall</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-3">
          {['biryani', 'fruitjuice', 'fastfood', 'soda'].map(mode => (
            <button key={mode} onClick={() => setAdminStallMode(mode)} 
              className={`py-3 md:py-4 rounded-xl font-black uppercase tracking-widest text-[10px] md:text-xs border transition-all active:scale-95 ${adminStallMode === mode ? 'bg-red-600 border-red-500 text-white' : 'bg-neutral-950 border-neutral-800 text-gray-500'}`}>
              {mode}
            </button>
          ))}
        </div>
        <button onClick={() => setShowScanner(true)} className="hidden md:flex w-full bg-white text-black font-black py-4 rounded-xl transition-transform active:scale-95 text-lg uppercase tracking-widest items-center justify-center gap-2 mt-4">
          <Camera size={24}/> OPEN SCANNER
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4 mb-8">
        <div className="bg-neutral-900 border border-neutral-800 p-4 md:p-6 rounded-2xl flex flex-col justify-center">
          <p className="text-gray-500 text-[10px] md:text-xs font-bold uppercase tracking-widest mb-1 md:mb-2">Queued Items</p>
          <p className="text-3xl sm:text-4xl lg:text-5xl font-black text-white">{totalQueuedItems}</p>
        </div>
        <div className="bg-neutral-900 border border-neutral-800 p-4 md:p-6 rounded-2xl flex flex-col justify-center">
          <p className="text-gray-500 text-[10px] md:text-xs font-bold uppercase tracking-widest mb-1 md:mb-2">Punched</p>
          <p className="text-3xl sm:text-4xl lg:text-5xl font-black text-green-500">{totalPunchedItems}</p>
        </div>
        <div className="col-span-2 md:col-span-1 bg-neutral-900 border border-neutral-800 p-5 md:p-6 rounded-2xl flex flex-col justify-center relative overflow-hidden">
          <IndianRupee className="absolute -right-4 -bottom-4 text-neutral-800/50" size={100} />
          <p className="text-gray-500 text-[10px] md:text-xs font-bold uppercase tracking-widest mb-1 md:mb-2 relative z-10">Total Redeemed</p>
          <p className="text-3xl sm:text-4xl lg:text-5xl font-black text-white relative z-10">₹{totalRedeemedRevenue}</p>
        </div>
      </div>

      <div className="relative mb-10 max-w-2xl mx-auto">
        <Search className="absolute left-4 top-4 text-gray-600" />
        <input type="text" placeholder="SEARCH ID, NAME, EMAIL..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full bg-neutral-900 border border-neutral-800 p-4 pl-12 rounded-2xl font-bold focus:border-red-500 outline-none uppercase italic text-white text-sm" />
      </div>

      {/* 1. KITCHEN QUEUE SECTION */}
      <div className="flex items-center gap-2 md:gap-3 mb-6 border-t border-neutral-800 pt-10 md:pt-16">
        <ChefHat className="text-red-500 animate-pulse" size={24} />
        <h2 className="text-xl md:text-2xl font-black text-white uppercase tracking-wider">Kitchen Queue</h2>
      </div>

      <div className="space-y-8 md:space-y-12 mb-12 md:mb-16">
        {['biryani', 'fruitjuice', 'fastfood', 'soda'].map(stallKey => {
          const stallOrders = filteredOrders.filter(o => {
              const hasItems = o.items?.some(it => menuData[stallKey].some(mi => mi.id === it.id));
              const isRedeemed = o.redemptionStatus?.[stallKey] === true;
              return hasItems && !isRedeemed; 
          });

          if (stallOrders.length === 0) return null;

          return (
            <div key={stallKey} className="bg-neutral-900/30 p-4 md:p-6 rounded-3xl border border-red-500/20">
              <h3 className="text-lg md:text-2xl font-black text-white mb-4 md:mb-6 uppercase tracking-widest border-b border-neutral-800/50 pb-3 flex justify-between items-center">
                <span>{stallKey} Queue</span>
                <span className="text-[10px] md:text-sm font-bold text-red-500 bg-red-500/10 px-2 md:px-3 py-1 rounded-lg animate-pulse">{stallOrders.length} Pending</span>
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                {stallOrders.map((o, idx) => (
                  <div key={idx} className="bg-neutral-900 border border-red-500/40 rounded-2xl p-4 md:p-5 shadow-[0_0_30px_rgba(220,38,38,0.1)] flex flex-col">
                    <div className="flex justify-between items-start mb-4 border-b border-neutral-800 pb-3 md:pb-4">
                      <div className="flex-1 min-w-0 pr-2">
                         <h3 className="text-base md:text-lg font-black text-white uppercase break-words">{o.customerDetails?.name || "No Name"}</h3>
                         {o.customerDetails?.email && (
                           <p className="text-[10px] md:text-[11px] text-gray-400 lowercase mb-1 break-all">{o.customerDetails.email}</p>
                         )}
                         <p className="text-[10px] md:text-xs text-red-500 font-mono font-bold mt-1">{o.orderId}</p>
                         <div className="flex items-center gap-1 mt-2 text-[9px] md:text-[10px] text-gray-500 font-bold uppercase">
                           <Clock size={12} className="text-gray-400 shrink-0" />
                           <span className="truncate">{formatDateTime(o.timestamp)}</span>
                         </div>
                      </div>
                      <span className="text-[8px] font-black uppercase px-2 py-1 rounded bg-green-500/20 text-green-500 shrink-0 mt-1">READY</span>
                    </div>
                    
                    <div className="bg-neutral-950 rounded-xl p-3 mb-4 flex-1 border border-neutral-800">
                      <span className="text-gray-500 text-[9px] md:text-[10px] font-bold uppercase tracking-widest mb-2 block">To Serve:</span>
                      <div className="space-y-2">
                        {o.items.filter(it => menuData[stallKey].some(mi => mi.id === it.id)).map((item, i) => (
                          <div key={i} className="flex justify-between items-center text-gray-300 border-b border-neutral-800/50 pb-1.5 last:border-0 last:pb-0">
                            <span className="font-medium text-xs md:text-sm text-white uppercase pr-2">{item.name}</span>
                            <span className="bg-neutral-800 text-white font-black px-2 py-0.5 rounded text-[10px] md:text-xs shrink-0">x{item.qty}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="flex gap-2">
                       <button onClick={() => handleManualPunch(o.id, stallKey, o.redemptionStatus)} className="w-full font-black py-3 rounded-xl uppercase tracking-widest text-[10px] md:text-xs active:scale-95 transition-transform bg-green-600 text-white shadow-lg">
                         Punch Item
                       </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* 2. DEDICATED REDEEMED HISTORY SECTION */}
      <div className="flex items-center gap-2 md:gap-3 mb-6 border-t border-neutral-800 pt-10 md:pt-16">
        <History className="text-gray-400" size={24} />
        <h2 className="text-xl md:text-2xl font-black text-white uppercase tracking-wider">Redeemed History</h2>
      </div>

      <div className="space-y-8 md:space-y-12 mb-12 md:mb-16">
        {['biryani', 'fruitjuice', 'fastfood', 'soda'].map(stallKey => {
          const historyOrders = filteredOrders.filter(o => o.redemptionStatus?.[stallKey] === true);
          if (historyOrders.length === 0) return null;

          return (
            <div key={stallKey + '-history'} className="bg-neutral-900/20 p-4 md:p-6 rounded-3xl border border-neutral-800">
              <h3 className="text-lg md:text-xl font-black text-gray-400 mb-4 md:mb-6 uppercase tracking-widest border-b border-neutral-800/50 pb-3 flex justify-between items-center">
                <span>{stallKey} History</span>
                <span className="text-[10px] md:text-sm font-bold text-gray-500 bg-neutral-900 border border-neutral-800 px-2 md:px-3 py-1 rounded-lg">{historyOrders.length} Redeemed</span>
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                {historyOrders.map((o, idx) => (
                  <div key={idx} className="bg-neutral-900 border border-neutral-800 rounded-2xl p-4 md:p-5 shadow-sm flex flex-col">
                    <div className="flex justify-between items-start mb-3 md:mb-4 border-b border-neutral-800 pb-3 md:pb-4">
                      <div className="flex-1 min-w-0 pr-2">
                         <h3 className="text-sm md:text-lg font-black text-gray-300 uppercase break-words">{o.customerDetails?.name || "No Name"}</h3>
                         {o.customerDetails?.email && (
                           <p className="text-[9px] md:text-[11px] text-gray-500 lowercase mb-1 break-all">{o.customerDetails.email}</p>
                         )}
                         <p className="text-[10px] md:text-xs text-gray-500 font-mono font-bold mt-1">{o.orderId}</p>
                         
                         <div className="flex flex-col gap-1.5 mt-2 md:mt-3 text-[8px] md:text-[10px] font-bold uppercase tracking-wider">
                           <div className="flex items-center gap-1.5 md:gap-2 text-gray-500">
                             <Clock size={12} className="text-gray-600 shrink-0" /> 
                             <span className="truncate">Ordered: {formatDateTime(o.timestamp)}</span>
                           </div>
                           <div className="flex items-center gap-1.5 md:gap-2 text-green-500">
                             <CheckCircle size={12} className="shrink-0" /> 
                             <span className="truncate">Redeemed: {formatDateTime(o.redemptionStatus[`${stallKey}_time`] || o.timestamp)}</span>
                           </div>
                         </div>
                      </div>
                    </div>
                    
                    <div className="bg-neutral-950 rounded-xl p-3 flex-1 border border-neutral-800">
                      <span className="text-gray-600 text-[8px] md:text-[10px] font-bold uppercase tracking-widest mb-2 block">Items Collected:</span>
                      <div className="space-y-1.5 md:space-y-2">
                        {o.items.filter(it => menuData[stallKey].some(mi => mi.id === it.id)).map((item, i) => (
                          <div key={i} className="flex justify-between items-center text-gray-400 border-b border-neutral-800/50 pb-1.5 last:border-0 last:pb-0">
                            <span className="font-medium text-[11px] md:text-sm uppercase pr-2">{item.name}</span>
                            <span className="bg-neutral-800 text-gray-300 font-black px-2 py-0.5 rounded text-[10px] md:text-xs shrink-0">x{item.qty}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* 3. DEDICATED STALL REVENUE SECTION */}
      <div className="flex items-center gap-2 md:gap-3 mb-6 border-t border-neutral-800 pt-10 md:pt-16">
        <IndianRupee className="text-green-500" size={24} />
        <h2 className="text-xl md:text-2xl font-black text-white uppercase tracking-wider">Stall Revenue</h2>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-12 md:mb-16">
        {['biryani', 'fruitjuice', 'fastfood', 'soda'].map(stallKey => {
          const history = orders.filter(o => o.redemptionStatus?.[stallKey] === true);
          
          const stallRevenue = history.reduce((acc, o) => {
              const sItems = o.items.filter(it => menuData[stallKey].some(mi => mi.id === it.id));
              return acc + sItems.reduce((sAcc, sIt) => sAcc + (sIt.price * sIt.qty), 0);
          }, 0);

          return (
            <div 
              key={stallKey} 
              onClick={() => { if(history.length > 0) setRevenueDetailStall(stallKey) }}
              className={`bg-neutral-900 border border-neutral-800 rounded-2xl p-4 md:p-5 shadow-lg flex flex-col transition-all group ${history.length > 0 ? 'cursor-pointer hover:border-green-500/50 active:scale-[0.98]' : 'opacity-60'}`}
            >
              <h3 className="text-gray-400 font-bold uppercase tracking-widest text-[10px] md:text-xs mb-1 md:mb-2 group-hover:text-white transition-colors">{stallKey} Revenue</h3>
              <p className="text-2xl md:text-3xl font-black text-green-500 mb-1 md:mb-2">₹{stallRevenue}</p>
              <p className="text-[10px] md:text-xs text-gray-500 font-bold mb-3 md:mb-4">{history.length} Orders Punched</p>
              
              {history.length > 0 ? (
                <div className="mt-auto bg-neutral-950 text-center py-2 md:py-3 rounded-lg text-[9px] md:text-[10px] font-black uppercase text-gray-400 group-hover:text-green-500 group-hover:bg-green-500/10 transition-all border border-neutral-800">
                  Tap to View Details
                </div>
              ) : (
                <div className="mt-auto bg-neutral-950 text-center py-2 md:py-3 rounded-lg text-[9px] md:text-[10px] font-black uppercase text-gray-600 border border-neutral-800/50">
                  No Sales Yet
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* 4. INVENTORY CONTROL SECTION */}
      <div className="flex items-center gap-2 md:gap-3 mb-6 border-t border-neutral-800 pt-10 md:pt-16">
        <Package className="text-blue-500" size={24} />
        <h2 className="text-xl md:text-2xl font-black text-white uppercase tracking-wider">Inventory Control</h2>
      </div>

      <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-4 md:p-8 mb-16 shadow-[0_0_40px_rgba(0,0,0,0.5)]">
        <div className="space-y-6 md:space-y-8">
          {Object.entries(menuData).map(([category, items]) => (
            <div key={category}>
              <h3 className="text-white font-bold uppercase tracking-widest mb-3 md:mb-4 text-[10px] md:text-sm bg-neutral-950 inline-block px-3 py-1.5 rounded-lg border border-neutral-800">{category}</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 md:gap-3">
                {items.map(item => {
                  const isSoldOut = soldOutItems.includes(item.id);
                  return (
                    <button key={item.id} onClick={() => toggleInventory(item.id, isSoldOut)}
                      className={`p-3 md:p-4 rounded-xl border transition-all text-left flex justify-between items-center active:scale-95 ${isSoldOut ? 'bg-red-500/10 border-red-500/50 text-red-500' : 'bg-neutral-950 border-neutral-800 text-white'}`}>
                      <span className="font-medium text-[10px] md:text-xs uppercase truncate pr-2">{item.name}</span>
                      {isSoldOut ? <X size={16} className="shrink-0" /> : <CheckCircle size={16} className="text-green-500 shrink-0" />}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 5. SUPER ADMIN: ORDER MANAGEMENT SECTION (CRUD) */}
      <div className="flex items-center justify-between mb-6 border-t border-red-500/30 pt-10 md:pt-16">
        <div className="flex items-center gap-2 md:gap-3">
          <Database className="text-purple-500" size={24} />
          <h2 className="text-xl md:text-2xl font-black text-white uppercase tracking-wider">Super Admin: Manage Orders</h2>
        </div>
        <button onClick={openCreateModal} className="bg-white text-black text-[10px] md:text-xs font-black px-4 py-2 rounded-lg uppercase tracking-widest flex items-center gap-2 active:scale-95 transition-transform">
          <Plus size={16}/> Create Order
        </button>
      </div>

      <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-4 md:p-8 shadow-[0_0_40px_rgba(168,85,247,0.05)]">
        <div className="space-y-4">
          {filteredOrders.length === 0 ? (
            <p className="text-gray-500 text-center font-bold text-sm uppercase">No orders found.</p>
          ) : (
            filteredOrders.map((o) => (
              <div key={o.id} className="bg-neutral-950 border border-neutral-800 p-4 rounded-2xl flex flex-col md:flex-row justify-between md:items-center gap-4 hover:border-neutral-700 transition-colors">
                <div className="flex-1 min-w-0">
                   <div className="flex items-center gap-2 mb-1">
                     <span className="text-white font-black uppercase text-sm md:text-base truncate">{o.customerDetails?.name || "No Name"}</span>
                     <span className="bg-neutral-800 text-gray-400 text-[9px] font-bold px-2 py-0.5 rounded uppercase">{o.items.length} Items</span>
                   </div>
                   <p className="text-red-500 font-mono text-[10px] md:text-xs font-bold">{o.orderId}</p>
                   {o.customerDetails?.email && <p className="text-gray-500 text-[10px] mt-1 truncate">{o.customerDetails.email}</p>}
                </div>
                
                <div className="flex gap-2 shrink-0 border-t border-neutral-800 md:border-0 pt-3 md:pt-0">
                  <button onClick={() => openEditModal(o)} className="flex-1 md:flex-none bg-neutral-800 text-blue-400 p-3 rounded-xl hover:bg-neutral-700 hover:text-white transition-colors flex items-center justify-center">
                    <Edit size={18} />
                  </button>
                  <button onClick={() => triggerDeleteOrder(o.id)} className="flex-1 md:flex-none bg-neutral-800 text-red-500 p-3 rounded-xl hover:bg-red-900 hover:text-white transition-colors flex items-center justify-center">
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
      
    </div>
  );
};

export default AdminPage;