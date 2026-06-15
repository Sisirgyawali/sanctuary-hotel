import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../App";
import { Menu, X, User } from "lucide-react";
import { Button } from "./ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "./ui/dropdown-menu";

const Navbar = ({ transparent = false }) => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { href: "/", label: "Home" },
    { href: "/rooms", label: "Rooms" },
    { href: "/menu", label: "Dining" },
  ];

  const bgClass = transparent && !scrolled ? "bg-transparent" : "bg-white/95 backdrop-blur-md shadow-sm";
  const textClass = transparent && !scrolled ? "text-white" : "text-[#1A3C34]";

  return (
    <nav data-testid="navbar" className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${bgClass}`}>
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        <div className="flex items-center justify-between h-20">
          <Link to="/" className={`font-display text-2xl font-medium tracking-tight ${textClass}`}>
            The Sanctuary
          </Link>

          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                to={link.href}
                className={`font-body text-sm uppercase tracking-widest transition-colors hover:text-[#D4AF37] ${
                  location.pathname === link.href ? "text-[#D4AF37]" : textClass
                }`}
              >
                {link.label}
              </Link>
            ))}

            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" data-testid="user-menu-trigger" className={`gap-2 ${textClass} hover:text-[#D4AF37]`}>
                    <User className="w-4 h-4" />
                    <span className="text-sm uppercase tracking-widest">{user.name}</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuItem asChild>
                    <Link to="/dashboard" data-testid="dashboard-link">My Bookings</Link>
                  </DropdownMenuItem>
                  {user.role === "admin" && (
                    <DropdownMenuItem asChild>
                      <Link to="/admin" data-testid="admin-link">Admin Panel</Link>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem onClick={logout} data-testid="logout-btn" className="text-red-600">
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Link to="/auth">
                <Button data-testid="login-btn" className="bg-[#1A3C34] hover:bg-[#142E28] text-white text-xs uppercase tracking-widest rounded-sm px-6">
                  Sign In
                </Button>
              </Link>
            )}
          </div>

          <button className={`md:hidden ${textClass}`} onClick={() => setIsOpen(!isOpen)} data-testid="mobile-menu-btn">
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {isOpen && (
          <div className="md:hidden absolute top-20 left-0 right-0 bg-white shadow-lg">
            <div className="px-6 py-4 space-y-4">
              {navLinks.map((link) => (
                <Link key={link.href} to={link.href} onClick={() => setIsOpen(false)}
                  className="block text-[#1A3C34] font-body text-sm uppercase tracking-widest py-2">
                  {link.label}
                </Link>
              ))}
              {user ? (
                <>
                  <Link to="/dashboard" onClick={() => setIsOpen(false)}
                    className="block text-[#1A3C34] font-body text-sm uppercase tracking-widest py-2">
                    My Bookings
                  </Link>
                  {user.role === "admin" && (
                    <Link to="/admin" onClick={() => setIsOpen(false)}
                      className="block text-[#1A3C34] font-body text-sm uppercase tracking-widest py-2">
                      Admin Panel
                    </Link>
                  )}
                  <button onClick={() => { logout(); setIsOpen(false); }}
                    className="block text-red-600 font-body text-sm uppercase tracking-widest py-2">
                    Sign Out
                  </button>
                </>
              ) : (
                <Link to="/auth" onClick={() => setIsOpen(false)}>
                  <Button className="w-full bg-[#1A3C34] hover:bg-[#142E28] text-white text-xs uppercase tracking-widest rounded-sm">
                    Sign In
                  </Button>
                </Link>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
