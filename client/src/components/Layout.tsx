import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { FiMenu, FiX, FiHome, FiUserPlus, FiUsers, FiCamera, FiLogOut } from 'react-icons/fi';
import { logout } from '@/utils/auth';
import { Button } from '@/components/ui/button';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const menuItems = [
    { path: '/dashboard', icon: FiHome, label: 'Dashboard' },
    { path: '/add-participant', icon: FiUserPlus, label: 'Add Participant' },
    { path: '/participants', icon: FiUsers, label: 'Participants' },
    { path: '/scanner', icon: FiCamera, label: 'QR Scanner' },
  ];

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile Header */}
      <header className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-primary text-primary-foreground shadow-md">
        <div className="flex items-center justify-between px-4 py-3">
          <h1 className="text-lg font-bold">Ciphernox 2025</h1>
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="p-2 rounded-lg hover:bg-primary/90 transition-colors"
            aria-label="Toggle menu"
          >
            {isSidebarOpen ? <FiX size={24} /> : <FiMenu size={24} />}
          </button>
        </div>
      </header>

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 h-full bg-primary text-primary-foreground shadow-xl z-40 transition-transform duration-300 ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:translate-x-0 w-64`}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="p-6 border-b border-primary-foreground/20">
            <h1 className="text-2xl font-bold">Ciphernox</h1>
            <p className="text-sm text-primary-foreground/80 mt-1">2025 IT Get-Together</p>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-2">
            {menuItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setIsSidebarOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                    isActive(item.path)
                      ? 'bg-primary-foreground text-primary font-medium shadow-md'
                      : 'hover:bg-primary-foreground/10'
                  }`}
                >
                  <Icon size={20} />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* Logout Button */}
          <div className="p-4 border-t border-primary-foreground/20">
            <Button
              onClick={handleLogout}
              variant="outline"
              className="w-full flex items-center gap-2 bg-blue-400 border-primary-foreground/20 text-primary-foreground hover:bg-primary-foreground/10"
            >
              <FiLogOut size={18} />
              Logout
            </Button>
          </div>
        </div>
      </aside>

      {/* Overlay for mobile */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Main Content */}
      <main className="lg:ml-64 min-h-screen pt-16 lg:pt-0">
        <div className="p-4 md:p-6 lg:p-8">{children}</div>
      </main>
    </div>
  );
};

export default Layout;
