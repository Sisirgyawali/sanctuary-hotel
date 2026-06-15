import { Link, useLocation } from "react-router-dom";
import { LayoutDashboard, Bed, UtensilsCrossed, CalendarCheck, LogOut } from "lucide-react";
import { useAuth } from "../App";

const AdminLayout = ({ children, title }) => {
  const location = useLocation();
  const { user, logout } = useAuth();

  const navItems = [
    { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
    { href: "/admin/rooms", label: "Rooms", icon: Bed },
    { href: "/admin/menu", label: "Menu", icon: UtensilsCrossed },
    { href: "/admin/bookings", label: "Bookings", icon: CalendarCheck },
  ];

  return (
    <div className="min-h-screen bg-[#F5F2EB] flex" data-testid="admin-layout">
      <aside className="admin-sidebar w-64 flex-shrink-0 fixed h-full">
        <div className="p-6">
          <Link to="/" className="font-display text-xl text-white">The Sanctuary</Link>
          <p className="text-[#D4AF37] text-xs uppercase tracking-widest mt-1">Admin Panel</p>
        </div>
        <nav className="mt-6">
          {navItems.map((item) => (
            <Link
              key={item.href}
              to={item.href}
              data-testid={`admin-nav-${item.label.toLowerCase()}`}
              className={`admin-nav-item flex items-center gap-3 px-6 py-3 text-white/80 hover:text-white transition-all ${
                location.pathname === item.href ? "active bg-[#142E28] text-white" : ""
              }`}
            >
              <item.icon className="w-5 h-5" />
              <span className="text-sm">{item.label}</span>
            </Link>
          ))}
        </nav>
        <div className="absolute bottom-0 left-0 right-0 p-6 border-t border-white/10">
          <div className="mb-4">
            <p className="text-white text-sm">{user?.name}</p>
            <p className="text-white/50 text-xs">{user?.email}</p>
          </div>
          <button onClick={logout} data-testid="admin-logout-btn"
            className="flex items-center gap-2 text-white/70 hover:text-red-400 text-sm transition-colors">
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
        </div>
      </aside>
      <main className="flex-1 ml-64">
        <header className="bg-white border-b border-[#E5E5E5] px-8 py-6">
          <h1 className="font-display text-2xl text-[#1A3C34]">{title}</h1>
        </header>
        <div className="p-8">{children}</div>
      </main>
    </div>
  );
};

export default AdminLayout;
