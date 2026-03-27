import { Link } from 'react-router-dom';
import { ShoppingCart, ChevronRight } from 'lucide-react';
import { useCart } from '../context/CartContext';

const GlobalCart = () => {
  const { cart, cartTotal } = useCart();
  
  const itemCount = cart.reduce((total, item) => total + item.qty, 0);

  if (itemCount === 0) return null; 

  return (
    // On mobile: fixed to the absolute bottom, full width. On desktop: floating bottom right.
    <div className="fixed bottom-0 left-0 right-0 p-4 md:p-0 md:bottom-6 md:left-auto md:right-6 z-50 animate-fade-in-up">
      
      {/* Background gradient fade just for mobile so it blends perfectly */}
      <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-neutral-950/80 to-transparent -z-10 md:hidden pointer-events-none"></div>

      <Link 
        to="/checkout"
        className="w-full md:w-auto bg-red-600 hover:bg-red-500 text-white px-6 py-4 rounded-2xl md:rounded-full shadow-[0_-10px_40px_rgba(220,38,38,0.3)] md:shadow-[0_0_30px_rgba(220,38,38,0.5)] flex items-center justify-between md:justify-start gap-4 transition-transform active:scale-95"
      >
        <div className="flex items-center gap-3">
          <div className="relative">
            <ShoppingCart size={24} />
            <span className="absolute -top-2 -right-3 bg-white text-red-600 font-black text-[10px] w-5 h-5 flex items-center justify-center rounded-full">
              {itemCount}
            </span>
          </div>
          <div className="flex flex-col border-l border-red-400/50 pl-3 text-left">
            <span className="text-[10px] font-semibold text-red-200 uppercase tracking-widest">Total</span>
            <span className="font-black text-lg leading-none">₹{cartTotal}</span>
          </div>
        </div>

        <div className="flex items-center gap-1 font-bold text-sm uppercase tracking-wide">
          Checkout <ChevronRight size={18} />
        </div>
      </Link>
    </div>
  );
};

export default GlobalCart;