// src/pages/MenuPage.jsx
import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Plus, Search } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { doc, onSnapshot } from 'firebase/firestore'; // 👉 NEW: Firebase imports
import { db } from '../firebase';

const menuData = {
  biryani: [
    { id: 'b1', category: 'Dum Biryani Section', name: '1 Dum Biryani', price: 1, type: 'Non-Veg', desc: '2 Pieces + FREE Masala Egg', image: '/images/dum-biryani.jpg' },
    { id: 'b2', category: 'Dum Biryani Section', name: '3 Dum Biryani', price: 690, type: 'Non-Veg', desc: '2 Pieces + FREE Masala Egg + ANY Fruit Juice FREE', image: '/images/dum-biryani.jpg' },
    { id: 'b3', category: 'Dum Biryani Section', name: '5 Dum Biryani', price: 1250, type: 'Non-Veg', desc: '2 Pieces + FREE Masala Egg + FREE Dum Biryani', image: '/images/dum-biryani.jpg' },
    { id: 'b4', category: 'Fry Piece Biryani', name: '1 Fry Biryani', price: 249, type: 'Non-Veg', desc: '2 Pieces + FREE Masala Egg', image: '/images/fry-biryani.jpg' },
    { id: 'b5', category: 'Fry Piece Biryani', name: '3 Fry Biryani', price: 749, type: 'Non-Veg', desc: '2 Pieces + FREE Masala Egg + ANY Fruit Juice FREE', image: '/images/fry-biryani.jpg' },
    { id: 'b6', category: 'Fry Piece Biryani', name: '5 Fry Biryani', price: 1249, type: 'Non-Veg', desc: '2 Pieces + FREE Masala Egg + FREE Dum Biryani', image: '/images/fry-biryani.jpg' },
    { id: 'b7', category: 'Combo', name: '1 Fry Biryani Combo', price: 249, type: 'Non-Veg', desc: '2 Pieces + FREE Masala Egg', image: '/images/fry-combo.jpg' }
  ],
  fruitjuice: [
    { id: 'j1', category: 'Juice Section', name: 'Banana Juice', price: 70, type: 'Drink', desc: 'Fresh & Creamy', image: '/images/banana.jpg' },
    { id: 'j2', category: 'Juice Section', name: 'Musk Melon Juice', price: 80, type: 'Drink', desc: 'Refreshing summer cooler', image: '/images/muskmelon.jpg' },
    { id: 'j3', category: 'Juice Section', name: 'Pineapple Juice', price: 80, type: 'Drink', desc: 'Sweet and tangy', image: '/images/pineapple.jpg' },
    { id: 'j4', category: 'Juice Section', name: 'Watermelon Juice', price: 70, type: 'Drink', desc: 'Hydrating fresh juice', image: '/images/watermelon.jpg' },
    { id: 'j5', category: 'Juice Section', name: 'Grape Juice', price: 80, type: 'Drink', desc: 'Rich grape flavor', image: '/images/grape.jpg' },
    { id: 'j6', category: 'Salads Section', name: 'Fruit Salad', price: 50, type: 'Veg', desc: 'Mixed seasonal fruits', image: '/images/salad.jpg' },
    { id: 'j7', category: 'ThickShakes', name: 'Oreo Shake', price: 110, type: 'Drink', desc: 'Classic crushed Oreo blend', image: '/images/oreo.jpg' },
    { id: 'j8', category: 'ThickShakes', name: 'Kit-Kat Shake', price: 110, type: 'Drink', desc: 'Chocolatey wafer goodness', image: '/images/kitkat.jpg' },
    { id: 'j9', category: 'ThickShakes', name: 'Pista Shake', price: 120, type: 'Drink', desc: 'Premium pistachio blend', image: '/images/pista.jpg' },
    { id: 'j10', category: 'ThickShakes', name: 'Chocolate Cake Shake', price: 120, type: 'Drink', desc: 'Rich cake blended shake', image: '/images/chocolate.jpg' },
    { id: 'j11', category: 'ThickShakes', name: 'Butterscotch Shake', price: 120, type: 'Drink', desc: 'Caramel crunch delight', image: '/images/butterscotch.jpg' }
  ],
  fastfood: [
    { id: 'f1', category: 'Noodles', name: 'Chicken Noodles', price: 100, type: 'Non-Veg', desc: 'Spicy wok-tossed noodles.', image: '/images/noodles.jpg' },
    { id: 'f2', category: 'Starters', name: 'Veg Manchurian', price: 80, type: 'Veg', desc: 'Crispy veg balls in dark soy sauce.', image: '/images/manchurian.jpg' },
  ]
};

const MenuPage = () => {
  const { stallId } = useParams();
  const { addToCart } = useCart();
  const [searchQuery, setSearchQuery] = useState('');
  
  // 👉 NEW: State to hold sold out items from Firebase
  const [soldOutItems, setSoldOutItems] = useState([]);

  // 👉 NEW: Listen to the secret "settings" document in real-time
  useEffect(() => {
    const unsub = onSnapshot(doc(db, "settings", "menu"), (docSnap) => {
      if (docSnap.exists()) {
        setSoldOutItems(docSnap.data().outOfStock || []);
      }
    });
    return () => unsub();
  }, []);
  
  const items = menuData[stallId] || [];
  const stallName = stallId.charAt(0).toUpperCase() + stallId.slice(1);

  const filteredItems = items.filter(item => 
    item.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    item.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const groupedItems = filteredItems.reduce((acc, item) => {
    if (!acc[item.category]) acc[item.category] = [];
    acc[item.category].push(item);
    return acc;
  }, {});

  return (
    <div className="min-h-screen py-8 px-4 max-w-5xl mx-auto relative pb-40">
      <div className="flex items-center gap-4 mb-6">
        <Link to="/stalls" className="bg-neutral-900 p-3 rounded-full hover:bg-neutral-800 transition-colors border border-neutral-800 shadow-lg">
          <ArrowLeft size={24} className="text-white" />
        </Link>
        <div>
          <h1 className="text-3xl sm:text-4xl font-black text-white leading-tight">
            BHEEMA'S <span className="text-red-500 uppercase">{stallName}</span>
          </h1>
        </div>
      </div>

      <div className="sticky top-0 z-20 bg-neutral-950/95 backdrop-blur-md pt-2 pb-6 mb-2">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <Search size={20} className="text-gray-500" />
          </div>
          <input 
            type="text" 
            placeholder={`Search ${stallName} menu...`}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-neutral-900 border border-neutral-800 text-white py-4 pl-12 pr-4 rounded-2xl focus:border-red-500 focus:ring-1 focus:ring-red-500 outline-none transition-all shadow-lg"
          />
          {searchQuery && (
            <button onClick={() => setSearchQuery('')} className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-500 hover:text-white">
              Clear
            </button>
          )}
        </div>
      </div>

      {Object.keys(groupedItems).length === 0 ? (
        <div className="text-center text-gray-500 mt-20 bg-neutral-900/50 p-10 rounded-3xl border border-neutral-800 border-dashed">
          <p className="text-xl font-bold mb-2">No items found</p>
          <p className="text-sm">Try searching for something else like "Oreo" or "Combo"</p>
        </div>
      ) : (
        Object.entries(groupedItems).map(([category, categoryItems], index) => (
          <div key={index} className="mb-10">
            <div className="flex items-center gap-4 mb-6 pt-2">
              <h2 className="text-lg sm:text-xl font-black text-gray-300 uppercase tracking-widest">{category}</h2>
              <div className="flex-1 h-px bg-gradient-to-r from-red-500/30 to-transparent"></div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {categoryItems.map((item) => {
                // 👉 NEW: Check if this specific item is sold out!
                const isSoldOut = soldOutItems.includes(item.id);

                return (
                  <div key={item.id} className={`bg-neutral-900/50 border ${isSoldOut ? 'border-neutral-800/30 opacity-60' : 'border-neutral-800/80 hover:border-red-500/30'} p-4 rounded-3xl flex items-center gap-4 transition-all`}>
                    
                    <div className="flex-1 flex flex-col justify-between h-full">
                      <div>
                        <h3 className="text-lg font-bold text-white leading-tight mb-1">{item.name}</h3>
                        <span className={`bg-neutral-950 font-black px-3 py-1 rounded-lg border border-neutral-800 text-sm tracking-wide inline-block mb-2 ${isSoldOut ? 'text-gray-500' : 'text-red-400'}`}>
                          ₹{item.price}
                        </span>
                        <p className="text-gray-400 text-xs sm:text-sm leading-relaxed line-clamp-2 mb-4">{item.desc}</p>
                      </div>
                      
                      {/* 👉 NEW: Dynamic Button (Red if active, Gray if sold out) */}
                      <button 
                        onClick={() => !isSoldOut && addToCart(item)}
                        disabled={isSoldOut}
                        className={`w-full font-black text-xs uppercase tracking-widest py-3 rounded-xl transition-transform flex items-center justify-center gap-1.5 ${isSoldOut ? 'bg-neutral-950 text-gray-600 border border-neutral-800 cursor-not-allowed shadow-none' : 'bg-red-600 hover:bg-red-500 text-white active:scale-95 border border-red-500 shadow-[0_4px_15px_rgba(220,38,38,0.3)]'}`}
                      >
                        {isSoldOut ? "SOLD OUT" : <><Plus size={16} /> ADD</>}
                      </button>
                    </div>
                    
                    <div className="w-28 h-28 sm:w-32 sm:h-32 flex-shrink-0 relative">
                      <div className={`w-full h-full rounded-2xl overflow-hidden border border-neutral-800 shadow-inner ${isSoldOut ? 'grayscale contrast-50' : ''}`}>
                        <img 
                          src={item.image || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=500&q=80'} 
                          alt={item.name} 
                          className="w-full h-full object-cover"
                          loading="lazy"
                        />
                      </div>
                    </div>

                  </div>
                );
              })}
            </div>
          </div>
        ))
      )}
    </div>
  );
};

export default MenuPage;