import { Link } from 'react-router-dom';
import { ChefHat, Pizza, CupSoda, Coffee, Droplet, Drumstick } from 'lucide-react';

const StallList = () => {
  const stalls = [
    { id: 'biryani', name: "Bheema's Biryani", desc: 'Authentic Dum Biryani', icon: ChefHat, color: 'bg-orange-600' },
    { id: 'fastfood', name: "Bheema's Fast Food", desc: 'Noodles & Manchurian', icon: Pizza, color: 'bg-red-600' },
    { id: 'soda', name: "Bheema's Soda", desc: 'Fizzy & Refreshing', icon: CupSoda, color: 'bg-blue-600' },
    { id: 'cooldrinks', name: "Bheema's Cooldrinks", desc: 'Chilled Beverages', icon: Coffee, color: 'bg-cyan-600' },
    { id: 'fruitjuice', name: "Bheema's Fruit Juice", desc: 'Fresh & Healthy', icon: Droplet, color: 'bg-green-600' },
    { id: 'shawarma', name: "Bheema's Shawarma", desc: 'Juicy Roasted Chicken', icon: Drumstick, color: 'bg-yellow-600' },
  ];

  return (
    <div className="min-h-screen py-16 px-4 max-w-6xl mx-auto">
      <div className="text-center mb-16">
        <h2 className="text-4xl md:text-5xl font-black mb-4">The Syndicate Fleet</h2>
        <p className="text-gray-400 text-lg">Select a stall to view its menu.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {stalls.map((stall) => {
          const Icon = stall.icon;
          return (
            <Link 
              to={`/menu/${stall.id}`} 
              key={stall.id}
              className="bg-neutral-900 border border-neutral-800 rounded-2xl overflow-hidden hover:border-red-500/50 hover:shadow-[0_0_30px_rgba(220,38,38,0.15)] transition-all duration-300 group"
            >
              <div className={`h-32 ${stall.color} flex items-center justify-center`}>
                <Icon size={56} className="text-white transform group-hover:scale-110 transition-transform duration-300" />
              </div>
              <div className="p-6">
                <h3 className="text-2xl font-bold mb-2">{stall.name}</h3>
                <p className="text-gray-400">{stall.desc}</p>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
};

export default StallList;