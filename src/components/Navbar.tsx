import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Home, Leaf, User, BookOpen, LogOut } from 'lucide-react';
import { account } from '../lib/appwrite';
import toast from 'react-hot-toast';

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  
  async function handleSignOut() {
    try {
      await account.deleteSession('current');
      toast.success('Signed out successfully');
      navigate('/sign-in');
    } catch (error) {
      toast.error('Failed to sign out');
    }
  }

  const navItems = [
    { path: '/', icon: Home, label: 'Feed' },
    { path: '/my-plants', icon: Leaf, label: 'My Plants' },
    { path: '/wiki', icon: BookOpen, label: 'Plant Wiki' },
    { path: '/profile', icon: User, label: 'Profile' },
  ];

  return (
    <nav className="bg-white shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-2">
            <Leaf className="h-6 w-6 text-emerald-600" />
            <span className="text-xl font-bold text-gray-900">PlantHead</span>
          </Link>

          <div className="hidden md:flex items-center gap-6">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium ${
                  location.pathname === item.path
                    ? 'text-emerald-600 bg-emerald-50'
                    : 'text-gray-600 hover:text-emerald-600 hover:bg-emerald-50'
                }`}
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </Link>
            ))}
            <button
              onClick={handleSignOut}
              className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-gray-600 hover:text-emerald-600 hover:bg-emerald-50"
            >
              <LogOut className="h-4 w-4" />
              Sign Out
            </button>
          </div>

          <div className="md:hidden flex items-center gap-4">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`p-2 rounded-lg ${
                  location.pathname === item.path
                    ? 'text-emerald-600 bg-emerald-50'
                    : 'text-gray-600 hover:text-emerald-600 hover:bg-emerald-50'
                }`}
              >
                <item.icon className="h-5 w-5" />
              </Link>
            ))}
            <button
              onClick={handleSignOut}
              className="p-2 rounded-lg text-gray-600 hover:text-emerald-600 hover:bg-emerald-50"
            >
              <LogOut className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}