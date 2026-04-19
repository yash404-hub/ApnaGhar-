import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Home, User, LogOut, Settings, Wifi, CreditCard, MessageSquare, Gamepad2 } from 'lucide-react';
import { motion } from 'framer-motion';

const Navbar = () => {
  const { user, logout } = useAuth();

  const navItems = user?.role === 'OWNER' ? [
    { name: 'Admin Panel', path: '/admin', icon: Settings },
    { name: 'Complaints', path: '/admin/complaints', icon: MessageSquare },
  ] : [
    { name: 'Dashboard', path: '/dashboard', icon: Home },
    { name: 'Profile', path: '/profile', icon: User },
    { name: 'Rent', path: '/rent', icon: CreditCard },
    { name: 'Chess', path: '/chess', icon: Gamepad2 },
    { name: 'WiFi', path: '/wifi', icon: Wifi },
  ];

  return (
    <nav className="glass sticky top-4 mx-4 z-50 px-6 py-4 flex items-center justify-between">
      <Link to="/" className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
        ApnaGhar
      </Link>

      <div className="hidden md:flex items-center gap-8">
        {navItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className="flex items-center gap-2 text-white/70 hover:text-white transition-colors"
          >
            <item.icon className="w-4 h-4" />
            <span className="text-sm font-medium">{item.name}</span>
          </Link>
        ))}
      </div>

      <div className="flex items-center gap-4">
        <div className="hidden sm:block text-right">
          <p className="text-xs text-white/40 uppercase tracking-wider">Logged in as</p>
          <p className="text-sm font-semibold text-white">{user?.name}</p>
        </div>
        
        <button
          onClick={logout}
          className="p-2 rounded-full bg-white/10 hover:bg-red-500/20 text-white/70 hover:text-red-400 transition-all"
          title="Logout"
        >
          <LogOut className="w-5 h-5" />
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
