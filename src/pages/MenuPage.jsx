// src/pages/MenuPage.jsx
import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Plus, Search } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { doc, onSnapshot } from 'firebase/firestore'; 
import { db } from '../firebase';

const menuData = {
  biryani: [
    // DUM BIRYANI SECTION
    { id: 'b1', category: 'Dum Biryani Section', name: 'Dum Biryani (1 Piece)', price: 189, type: 'Non-Veg', desc: '1 Piece Dum Biryani', image: '/b1.jpeg' },
    { id: 'b2', category: 'Dum Biryani Section', name: 'Dum Biryani (2 Pieces)', price: 209, type: 'Non-Veg', desc: '2 Pieces Dum Biryani', image: '/b1.jpeg' },
    { id: 'b3', category: 'Dum Biryani Section', name: 'Dum Biryani (1 Piece + Juice)', price: 219, type: 'Non-Veg', desc: '1 Piece + 1 Fruit Juice', image: '/2bj.jpeg' },
    { id: 'b4', category: 'Dum Biryani Section', name: 'Dum Biryani (2 Pieces + Drink)', price: 229, type: 'Non-Veg', desc: '2 Pieces + 1 Cool Drink', image: '/b1.jpeg' },
    { id: 'b5', category: 'Dum Biryani Section', name: 'Dum Biryani (2 Pieces + Juice)', price: 239, type: 'Non-Veg', desc: '2 Pieces + 1 Fruit Juice', image: '/2bj.jpeg' },

    // FRY BIRYANI SECTION
    { id: 'b6', category: 'Fry Piece Biryani', name: 'Fry Biryani (2 Pieces)', price: 229, type: 'Non-Veg', desc: '2 Pieces Fry Biryani', image: '/b1.jpeg' },
    { id: 'b7', category: 'Fry Piece Biryani', name: 'Fry Biryani (2 Pieces + Drink)', price: 249, type: 'Non-Veg', desc: '2 Pieces + 1 Cool Drink', image: '/b1.jpeg' },
    { id: 'b8', category: 'Fry Piece Biryani', name: 'Fry Biryani (2 Pieces + Juice)', price: 259, type: 'Non-Veg', desc: '2 Pieces + 1 Fruit Juice', image: '/2bj.jpeg' },

    // COMBO SECTION
    { id: 'b9', category: 'Combo', name: 'Biryani (1 Dum Pcs + 1 Fry Pcs)', price: 259, type: 'Non-Veg', desc: '1 Dum Piece + 1 Fry Piece', image: '/c1.jpeg' },
    { id: 'b10', category: 'Combo', name: 'Dum Biryani (2 Pcs) 3+1 Combo', price: 699, type: 'Non-Veg', desc: 'Buy 3 Get 1 Free + 1 Juice', image: '/c1.webp' },
    { id: 'b11', category: 'Combo', name: 'Dum Biryani (2 Pcs) 5+1 Combo', price: 1250, type: 'Non-Veg', desc: 'Buy 5 Get 1 Free + 2 Juices', image: '/c3.jpg' },
    { id: 'b12', category: 'Combo', name: 'Fry Biryani (2 Pcs) 3+1 Combo', price: 749, type: 'Non-Veg', desc: 'Buy 3 Get 1 Free + 1 Juice', image: '/c1.webp' },
    { id: 'b13', category: 'Combo', name: 'Fry Biryani (2 Pcs) 5+1 Combo', price: 1350, type: 'Non-Veg', desc: 'Buy 5 Get 1 Free + 2 Juices', image: '/c3.jpg' }
  ],
  fruitjuice: [
    // FRESH JUICES
    { id: 'j1', category: 'Fresh Juices', name: 'Banana Juice', price: 70, type: 'Drink', desc: 'Fresh & Creamy', image: '/banana.jpg' },
    { id: 'j2', category: 'Fresh Juices', name: 'Musk-Melon Juice', price: 80, type: 'Drink', desc: 'Refreshing summer cooler', image: '/muskmelon.jpg' },
    { id: 'j3', category: 'Fresh Juices', name: 'Pineapple Juice', price: 80, type: 'Drink', desc: 'Sweet and tangy', image: '/pineapple.jpeg' },
    { id: 'j4', category: 'Fresh Juices', name: 'Watermelon Juice', price: 70, type: 'Drink', desc: 'Hydrating fresh juice', image: '/watermelon.avif' },
    { id: 'j5', category: 'Fresh Juices', name: 'Grape Juice', price: 80, type: 'Drink', desc: 'Rich grape flavor', image: '/grapejuice.jpeg' },
    { id: 'j16', category: 'Fresh Juices', name: 'Sapota Juice', price: 80, type: 'Drink', desc: 'Sweet and delicious', image: '/sapota.avif' },
    { id: 'j6', category: 'Fresh Juices', name: 'Fruit Salad', price: 50, type: 'Veg', desc: 'Mixed seasonal fruits', image: '/salad.jpg' },

    // THICKSHAKES
    { id: 'j7', category: 'Thickshakes', name: 'Oreo Shake', price: 100, type: 'Drink', desc: 'Classic crushed Oreo blend', image: '/oreoshake.jpg' },
    { id: 'j8', category: 'Thickshakes', name: 'Kit-Kat Shake', price: 100, type: 'Drink', desc: 'Chocolatey wafer goodness', image: '/kitkat.jpg' },
    { id: 'j9', category: 'Thickshakes', name: 'Vanilla Shake', price: 110, type: 'Drink', desc: 'Rich Flavoured delight', image: '/vanilla.jpeg' },
    { id: 'j10', category: 'Thickshakes', name: 'Chocolate Shake', price: 110, type: 'Drink', desc: 'Rich chocolate blend', image: '/chocolate.jpg' },
    { id: 'j11', category: 'Thickshakes', name: 'Pista Shake', price: 120, type: 'Drink', desc: 'Premium pistachio blend', image: '/pista.webp' },

    // COMBOS
    { id: 'j12', category: 'Combos', name: '5+1 Any Juice Combo', price: 300, type: 'Drink', desc: 'Buy 5 Get 1 Free (Juices)', image: '/banana.jpg' },
    { id: 'j13', category: 'Combos', name: '5+1 Any Shake Combo', price: 450, type: 'Drink', desc: 'Buy 5 Get 1 Free (Shakes)', image: '/oreoshake.jpg' },
    { id: 'j14', category: 'Combos', name: '10+3 Any Juice Combo', price: 600, type: 'Drink', desc: 'Buy 10 Get 3 Free (Juices)', image: '/pineapple.jpeg' },
    { id: 'j15', category: 'Combos', name: '10+3 Any Shake Combo', price: 900, type: 'Drink', desc: 'Buy 10 Get 3 Free (Shakes)', image: '/chocolate.jpg' }
  ],
  fastfood: [
    { id: 'f1', category: 'Noodles', name: 'Chicken Noodles', price: 100, type: 'Non-Veg', desc: 'Spicy wok-tossed noodles.', image: '/images/noodles.jpg' },
    { id: 'f2', category: 'Starters', name: 'Veg Manchurian', price: 80, type: 'Veg', desc: 'Crispy veg balls in dark soy sauce.', image: '/images/manchurian.jpg' },
  ],
  soda: [
  // --- Sodas Section ---
  { 
    id: 's1', 
    category: 'Sodas Section', 
    name: 'Lemon Soda', 
    price: 30, 
    type: 'Veg', 
    desc: 'Refreshing Chilled Lemon Soda', 
    image: '/lemon-soda.jpg' 
  },
  { 
    id: 's2', 
    category: 'Sodas Section', 
    name: 'Blue Berry Soda', 
    price: 30, 
    type: 'Veg', 
    desc: 'Chilled Blue Berry Sparkler', 
    image: '/blue-berry-soda.jpg' 
  },
  { 
    id: 's3', 
    category: 'Sodas Section', 
    name: 'Pineapple Apple Soda', 
    price: 30, 
    type: 'Veg', 
    desc: 'Unique Pineapple & Apple Mix', 
    image: '/pineapple-soda.jpg' 
  },
  { 
    id: 's4', 
    category: 'Sodas Section', 
    name: 'Sunanda Soda', 
    price: 30, 
    type: 'Veg', 
    desc: 'Classic Sunanda Special', 
    image: '/sugandha-soda.jpeg' 
  },
  { 
    id: 's5', 
    category: 'Sodas Section', 
    name: 'Mint Soda', 
    price: 30, 
    type: 'Veg', 
    desc: 'Fresh Mint Cooling Soda', 
    image: '/mint-soda.jpeg' 
  },
  { 
    id: 's6', 
    category: 'Sodas Section', 
    name: 'Orange Soda', 
    price: 30, 
    type: 'Veg', 
    desc: 'Zesty Tangy Orange Soda', 
    image: '/orange-soda.jpg' 
  },

  // --- Mojitos Section ---
  { 
    id: 'm1', 
    category: 'Mojitos Section', 
    name: 'Blue Lagoon', 
    price: 70, 
    type: 'Veg', 
    desc: 'Deep Blue Tropical Mojito', 
    image: '/BlueLagoonMojito.webp' 
  },
  { 
    id: 'm2', 
    category: 'Mojitos Section', 
    name: 'Lemon Mint Mojito', 
    price: 70, 
    type: 'Veg', 
    desc: 'Classic Lemon & Mint Mojito', 
    image: '/LemonMint.jpg' 
  },
  { 
    id: 'm3', 
    category: 'Mojitos Section', 
    name: 'Red Cherry Mojito', 
    price: 80, 
    type: 'Veg', 
    desc: 'Sweet & Tart Red Cherry Mojito', 
    image: '/RedCherryMojito.jpg' 
  },
  { 
    id: 'm4', 
    category: 'Mojitos Section', 
    name: 'Green Mint Mojito', 
    price: 70, 
    type: 'Veg', 
    desc: 'Extra Fresh Green Mint Mojito', 
    image: '/GreenMintMojito.webp' 
  }
],
fastfood: [
  // --- Fried Rice Section ---
  { 
    id: 'f1', 
    category: 'Fried Rice Section', 
    name: 'Egg Fried Rice', 
    price: 120, 
    type: 'Non-Veg', 
    desc: 'Classic wok-tossed egg fried rice', 
    image: '/EggFriedRice.jpg' 
  },
  { 
    id: 'f2', 
    category: 'Fried Rice Section', 
    name: 'Chicken Fried Rice', 
    price: 140, 
    type: 'Non-Veg', 
    desc: 'Savory chicken chunks with seasoned rice', 
    image: '/ChickenFriedRice.jpg' 
  },
  { 
    id: 'f3', 
    category: 'Fried Rice Section', 
    name: 'Sp. Chicken Fried Rice', 
    price: 150, 
    type: 'Non-Veg', 
    desc: 'Bheema’s Special double-egg chicken fried rice', 
    image: '/SpChickenFriedRice.avif' 
  },

  // --- Noodles Section ---
  { 
    id: 'f4', 
    category: 'Noodles Section', 
    name: 'Egg Noodles', 
    price: 120, 
    type: 'Non-Veg', 
    desc: 'Spicy street-style egg noodles', 
    image: '/EggNoodles.webp' 
  },
  { 
    id: 'f5', 
    category: 'Noodles Section', 
    name: 'Chicken Noodles', 
    price: 140, 
    type: 'Non-Veg', 
    desc: 'Wok-tossed noodles with tender chicken strips', 
    image: '/ChickenNoodles.jpg' 
  },
  { 
    id: 'f6', 
    category: 'Noodles Section', 
    name: 'Sp Chicken Noodles', 
    price: 150, 
    type: 'Non-Veg', 
    desc: 'Extra spicy special chicken noodles', 
    image: '/SpChickenNoodles.jpg' 
  },

  // --- Manchuria Section ---
  { 
    id: 'f7', 
    category: 'Manchuria Section', 
    name: 'Egg Manchuria', 
    price: 120, 
    type: 'Non-Veg', 
    desc: 'Crispy egg balls in spicy Manchurian sauce', 
    image: '/EggManchuria.cms' 
  },
  { 
    id: 'f8', 
    category: 'Manchuria Section', 
    name: 'Chicken Manchuria', 
    price: 140, 
    type: 'Non-Veg', 
    desc: 'Golden fried chicken in tangy sauce', 
    image: '/ChickenManchuria.webp' 
  },
  { 
    id: 'f9', 
    category: 'Manchuria Section', 
    name: 'Sp Chicken Manchuria', 
    price: 150, 
    type: 'Non-Veg', 
    desc: 'Premium Bheema special spicy Manchuria', 
    image: '/SpChickenManchuria.jpg' 
  }
]
};

const MenuPage = () => {
  const { stallId } = useParams();
  const { addToCart } = useCart();
  const [searchQuery, setSearchQuery] = useState('');
  const [soldOutItems, setSoldOutItems] = useState([]);

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
      
      {/* 👉 NEW: Menu Header with Logo */}
      <div className="flex items-center gap-4 mb-6">
        <Link to="/stalls" className="bg-neutral-900 p-3 rounded-full hover:bg-neutral-800 transition-colors border border-neutral-800 shadow-lg shrink-0">
          <ArrowLeft size={24} className="text-white" />
        </Link>
        <div className="flex items-center gap-3 md:gap-4">
          <img 
            src="/logo.jpeg
            " 
            alt="Bheemas Logo" 
            className="w-12 h-12 sm:w-16 sm:h-16 rounded-full object-cover border-2 border-red-500 shadow-[0_0_15px_rgba(220,38,38,0.4)] shrink-0" 
          />
          <div>
            <h1 className="text-2xl sm:text-4xl font-black text-white leading-tight">
              BHEEMA'S <span className="text-red-500 uppercase block sm:inline">{stallName}</span>
            </h1>
          </div>
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