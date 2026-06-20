import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { CalendarIcon, Users, Bed, Utensils, Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { Button } from "../components/ui/button";
import { Calendar } from "../components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "../components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";

const HomePage = () => {
  const navigate = useNavigate();
  const [checkIn, setCheckIn] = useState(null);
  const [checkOut, setCheckOut] = useState(null);
  const [guests, setGuests] = useState("2");

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (checkIn) params.set("checkIn", format(checkIn, "yyyy-MM-dd"));
    if (checkOut) params.set("checkOut", format(checkOut, "yyyy-MM-dd"));
    params.set("guests", guests);
    navigate(`/rooms?${params.toString()}`);
  };

  const fadeUp = {
    hidden: { opacity: 0, y: 30 },
    visible: (i) => ({ opacity: 1, y: 0, transition: { delay: i * 0.15, duration: 0.6, ease: "easeOut" } })
  };

  return (
    <div className="min-h-screen" data-testid="home-page">
      <Navbar transparent />

      {/* Hero */}
      <section className="hero-section relative">
        <div className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url('https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1920&q=80')` }} />
        <div className="hero-overlay" />

        <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-6 text-center">
          <motion.p initial="hidden" animate="visible" custom={0} variants={fadeUp}
            className="font-accent italic text-[#D4AF37] text-lg md:text-xl mb-4">
            Welcome to
          </motion.p>
          <motion.h1 initial="hidden" animate="visible" custom={1} variants={fadeUp}
            className="font-display text-5xl md:text-7xl lg:text-8xl font-medium text-white tracking-tight mb-6">
            The Sanctuary
          </motion.h1>
          <motion.p initial="hidden" animate="visible" custom={2} variants={fadeUp}
            className="font-body text-white/80 text-lg md:text-xl max-w-2xl mb-12">
            An oasis of tranquility where luxury meets nature. Experience hospitality redefined.
          </motion.p>

          {/* Booking Widget */}
          <motion.div initial="hidden" animate="visible" custom={3} variants={fadeUp}
            className="booking-widget glass w-full max-w-4xl p-6 md:p-8" data-testid="booking-widget">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-[#1A3C34] text-xs uppercase tracking-widest mb-2">Check In</label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" data-testid="checkin-picker"
                      className="w-full justify-start text-left font-normal border-[#1A3C34]/20 hover:border-[#1A3C34]">
                      <CalendarIcon className="mr-2 h-4 w-4 text-[#1A3C34]" />
                      {checkIn ? format(checkIn, "MMM dd, yyyy") : <span className="text-muted-foreground">Select date</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar mode="single" selected={checkIn} onSelect={setCheckIn}
                      disabled={(date) => date < new Date()} initialFocus />
                  </PopoverContent>
                </Popover>
              </div>
              <div>
                <label className="block text-[#1A3C34] text-xs uppercase tracking-widest mb-2">Check Out</label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" data-testid="checkout-picker"
                      className="w-full justify-start text-left font-normal border-[#1A3C34]/20 hover:border-[#1A3C34]">
                      <CalendarIcon className="mr-2 h-4 w-4 text-[#1A3C34]" />
                      {checkOut ? format(checkOut, "MMM dd, yyyy") : <span className="text-muted-foreground">Select date</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar mode="single" selected={checkOut} onSelect={setCheckOut}
                      disabled={(date) => date < (checkIn || new Date())} initialFocus />
                  </PopoverContent>
                </Popover>
              </div>
              <div>
                <label className="block text-[#1A3C34] text-xs uppercase tracking-widest mb-2">Guests</label>
                <Select value={guests} onValueChange={setGuests}>
                  <SelectTrigger data-testid="guests-select" className="border-[#1A3C34]/20 hover:border-[#1A3C34]">
                    <Users className="mr-2 h-4 w-4 text-[#1A3C34]" />
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {[1, 2, 3, 4].map((num) => (
                      <SelectItem key={num} value={num.toString()}>{num} {num === 1 ? "Guest" : "Guests"}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-end">
                <Button onClick={handleSearch} data-testid="search-rooms-btn"
                  className="w-full bg-[#1A3C34] hover:bg-[#142E28] text-white text-xs uppercase tracking-widest h-10 btn-scale">
                  Check Availability
                </Button>
              </div>
            </div>
          </motion.div>
        </div>

        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
          <div className="w-6 h-10 rounded-full border-2 border-white/50 flex items-start justify-center p-2">
            <div className="w-1 h-2 bg-white/50 rounded-full animate-pulse" />
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-24 px-6 bg-[#F5F2EB] noise-bg relative">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <p className="font-accent italic text-[#D4AF37] text-lg mb-2">Discover</p>
            <h2 className="font-display text-4xl md:text-5xl font-medium text-[#1A3C34] tracking-tight">
              An Experience Unlike Any Other
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { icon: Bed, title: "Luxurious Rooms", description: "From cozy standards to presidential suites, each room is a haven of comfort and elegance." },
              { icon: Utensils, title: "Fine Dining", description: "Savor culinary masterpieces crafted by our world-renowned chefs using locally sourced ingredients." },
              { icon: Sparkles, title: "Premium Service", description: "Our dedicated team ensures every moment of your stay exceeds expectations." }
            ].map((feature, index) => (
              <motion.div key={index} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }} transition={{ delay: index * 0.15, duration: 0.6 }}
                className="text-center p-8">
                <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-[#1A3C34] flex items-center justify-center">
                  <feature.icon className="w-7 h-7 text-[#D4AF37]" />
                </div>
                <h3 className="font-display text-2xl text-[#1A3C34] mb-4">{feature.title}</h3>
                <p className="text-[#8C8C8C] leading-relaxed">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Rooms Preview */}
      <section className="py-24 px-6 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <p className="font-accent italic text-[#D4AF37] text-lg mb-2">Accommodations</p>
            <h2 className="font-display text-4xl md:text-5xl font-medium text-[#1A3C34] tracking-tight">Our Finest Rooms</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { img: "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=600&q=80", label: "Standard", name: "Garden View Room", price: "$150" },
              { img: "https://images.unsplash.com/photo-1598414381594-18d86505f5d5?w=600&q=80", label: "Deluxe", name: "Ocean Suite", price: "$280" },
              { img: "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=600&q=80", label: "Suite", name: "Penthouse Suite", price: "$900" },
            ].map((room, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                className="room-card border border-[#E5E5E5] overflow-hidden">
                <div className="aspect-[4/3] overflow-hidden">
                  <img src={room.img} alt={room.name} className="w-full h-full object-cover" />
                </div>
                <div className="p-6">
                  <p className="text-[#D4AF37] text-xs uppercase tracking-widest mb-1">{room.label}</p>
                  <h3 className="font-display text-xl text-[#1A3C34] mb-3">{room.name}</h3>
                  <div className="flex items-center justify-between">
                    <span className="font-display text-xl text-[#1A3C34]">{room.price}<span className="text-sm text-[#8C8C8C] font-body"> /night</span></span>
                    <Link to="/rooms"><Button className="bg-[#1A3C34] hover:bg-[#142E28] text-white text-xs uppercase tracking-widest">View</Button></Link>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-6 bg-[#1A3C34]">
        <div className="max-w-4xl mx-auto text-center">
          <p className="font-accent italic text-[#D4AF37] text-lg mb-4">Your Journey Awaits</p>
          <h2 className="font-display text-4xl md:text-5xl font-medium text-white tracking-tight mb-8">
            Ready to Experience The Sanctuary?
          </h2>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/rooms">
              <Button data-testid="explore-rooms-btn"
                className="bg-[#D4AF37] hover:bg-[#c9a432] text-[#1A3C34] text-xs uppercase tracking-widest px-8 py-6 btn-scale">
                Explore Rooms
              </Button>
            </Link>
            <Link to="/menu">
              <Button variant="outline" data-testid="view-menu-btn"
                className="bg-transparent border-2 border-white text-white hover:bg-white hover:text-[#1A3C34] text-xs uppercase tracking-widest px-8 py-6">
                View Dining Menu
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default HomePage;
