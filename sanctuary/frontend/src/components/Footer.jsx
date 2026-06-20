import { Link } from "react-router-dom";
import { MapPin, Phone, Mail } from "lucide-react";

const Footer = () => (
  <footer data-testid="footer" className="bg-[#1A3C34] text-white">
    <div className="max-w-7xl mx-auto px-6 md:px-12 py-16">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
        <div className="md:col-span-2">
          <h3 className="font-display text-3xl font-medium mb-4">The Sanctuary</h3>
          <p className="font-accent italic text-lg text-white/70 mb-6">Where tranquility meets luxury</p>
          <p className="text-white/60 leading-relaxed max-w-md">
            Nestled in nature's embrace, The Sanctuary offers an escape from the ordinary.
            Experience unparalleled hospitality and create memories that last a lifetime.
          </p>
        </div>
        <div>
          <h4 className="font-body text-xs uppercase tracking-widest text-[#D4AF37] mb-6">Explore</h4>
          <ul className="space-y-3">
            <li><Link to="/rooms" className="text-white/70 hover:text-[#D4AF37] transition-colors">Accommodations</Link></li>
            <li><Link to="/menu" className="text-white/70 hover:text-[#D4AF37] transition-colors">Dining</Link></li>
            <li><Link to="/auth" className="text-white/70 hover:text-[#D4AF37] transition-colors">Book Now</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="font-body text-xs uppercase tracking-widest text-[#D4AF37] mb-6">Contact</h4>
          <ul className="space-y-4">
            <li className="flex items-start gap-3">
              <MapPin className="w-5 h-5 text-[#D4AF37] flex-shrink-0 mt-0.5" />
              <span className="text-white/70">Kathmandu, Nepal</span>
            </li>
            <li className="flex items-center gap-3">
              <Phone className="w-5 h-5 text-[#D4AF37]" />
              <span className="text-white/70">+977 9861601893</span>
            </li>
            <li className="flex items-center gap-3">
              <Mail className="w-5 h-5 text-[#D4AF37]" />
              <span className="text-white/70">shishirgyawali222@gmail.com</span>
            </li>
          </ul>
        </div>
      </div>
      <div className="border-t border-white/10 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
        <p className="text-white/50 text-sm">&copy; {new Date().getFullYear()} The Sanctuary. All rights reserved.</p>
        <div className="flex gap-6">
          <span className="text-white/50 text-sm hover:text-white/70 cursor-pointer">Privacy Policy</span>
          <span className="text-white/50 text-sm hover:text-white/70 cursor-pointer">Terms of Service</span>
        </div>
      </div>
    </div>
  </footer>
);

export default Footer;
