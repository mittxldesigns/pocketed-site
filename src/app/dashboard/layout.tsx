'use client';

import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  LayoutDashboard,
  ShoppingBag,
  CreditCard,
  Shield,
  Truck,
  Wifi,
  Bell,
  LogOut,
  Menu,
  X,
} from 'lucide-react';
import { createClient } from '@/utils/supabase/client';

const navItems = [
  { name: 'Overview', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Purchases', href: '/dashboard/purchases', icon: ShoppingBag },
  { name: 'Subscriptions', href: '/dashboard/subscriptions', icon: CreditCard },
  { name: 'Warranties', href: '/dashboard/warranties', icon: Shield },
  { name: 'Delivery', href: '/dashboard/deliveries', icon: Truck },
  { name: 'Outages', href: '/dashboard/outages', icon: Wifi },
  { name: 'Alerts', href: '/dashboard/alerts', icon: Bell },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();
  const [user, setUser] = useState<any>(null);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const getUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setUser(user);
      setIsLoading(false);
    };

    getUser();
  }, [supabase]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  const getInitial = () => {
    if (!user) return '?';
    const email = user.email || user.user_metadata?.full_name || 'U';
    return email.charAt(0).toUpperCase();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-stone-950 flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-950 font-sans">
      {/* Mobile Hamburger */}
      <div className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-stone-900 border-b border-white/[0.05] flex items-center justify-between px-4 z-40">
        <button
          onClick={() => setIsMobileOpen(!isMobileOpen)}
          className="text-white p-2"
        >
          {isMobileOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
        <div className="flex-1 text-center">
          <span className="text-white font-semibold">Pocketed</span>
        </div>
        <div className="w-10" />
      </div>

      {/* Sidebar */}
      <aside
        className={`fixed left-0 top-0 w-64 h-screen bg-stone-900 border-r border-white/[0.05] flex flex-col transition-transform duration-300 lg:translate-x-0 z-50 ${
          isMobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Logo */}
        <div className="p-6 border-b border-white/[0.05]">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-br from-amber-400 to-amber-500 rounded-lg flex items-center justify-center">
              <span className="text-stone-950 font-bold text-sm">P</span>
            </div>
            <span className="text-white font-semibold">Pocketed</span>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-6 space-y-2">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsMobileOpen(false)}
                className={`flex items-center gap-3 px-4 py-2 rounded-xl transition ${
                  isActive
                    ? 'bg-white/[0.06] text-amber-400'
                    : 'text-stone-400 hover:text-white hover:bg-white/[0.03]'
                }`}
              >
                <Icon size={20} />
                <span className="font-medium">{item.name}</span>
              </Link>
            );
          })}
        </nav>

        {/* User Section */}
        <div className="p-4 border-t border-white/[0.05] space-y-3">
          {user && (
            <div className="flex items-center gap-3 px-4 py-2">
              <div className="w-8 h-8 bg-amber-500 rounded-full flex items-center justify-center">
                <span className="text-stone-950 font-semibold text-xs">
                  {getInitial()}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-white text-sm font-medium truncate">
                  {user.email}
                </p>
              </div>
            </div>
          )}
          <button
            onClick={handleSignOut}
            className="w-full flex items-center gap-3 px-4 py-2 text-stone-400 hover:text-white hover:bg-white/[0.03] rounded-xl transition"
          >
            <LogOut size={20} />
            <span className="font-medium">Sign out</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main
        className={`transition-all duration-300 lg:ml-64 ${
          isMobileOpen ? 'blur-sm' : ''
        }`}
      >
        <div className="pt-16 lg:pt-0 p-6 lg:p-8">{children}</div>
      </main>

      {/* Mobile Overlay */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-black/50 lg:hidden z-40"
          onClick={() => setIsMobileOpen(false)}
        />
      )}
    </div>
  );
}
