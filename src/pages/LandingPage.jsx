import { Link } from 'react-router-dom';
import { Flame, ArrowRight } from 'lucide-react';

const LandingPage = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center text-center px-4 relative">
      {/* Dark red glow effect in the background */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-red-600/20 blur-[120px] rounded-full pointer-events-none"></div>

      <div className="relative z-10 flex flex-col items-center">
        <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-red-950/50 border border-red-500/30 text-red-400 mb-6">
          <Flame size={18} />
          <span className="font-semibold tracking-wide text-sm uppercase">Fest Exclusive</span>
        </div>

        <h1 className="text-5xl sm:text-6xl md:text-8xl font-black tracking-tighter mb-4 text-white drop-shadow-lg leading-tight">
          BHEEMA'S <br/>
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-orange-400">
            SYNDICATE
          </span>
        </h1>
        
        <p className="text-gray-400 max-w-lg mb-10 text-lg md:text-xl">
          Six premium stalls. One unified cart. Zero waiting in line. Order instantly.
        </p>

        <Link 
          to="/stalls" 
          className="group flex items-center gap-3 bg-red-600 hover:bg-red-500 text-white px-8 py-4 rounded-full font-bold text-lg transition-all duration-300 shadow-[0_0_30px_rgba(220,38,38,0.4)] hover:shadow-[0_0_50px_rgba(220,38,38,0.6)] hover:-translate-y-1"
        >
          Explore The Menu
          <ArrowRight className="group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>
    </div>
  );
};

export default LandingPage;