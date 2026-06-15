import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { motion } from "framer-motion";
import { format } from "date-fns";
import { CalendarDays, MapPin, Clock } from "lucide-react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { Badge } from "../components/ui/badge";
import { API, useAuth } from "../App";

const DashboardPage = () => {
  const { user, token } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const response = await axios.get(`${API}/bookings`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setBookings(response.data);
      } catch (error) {
        console.error("Failed to fetch bookings:", error);
      } finally {
        setLoading(false);
      }
    };
    if (token) fetchBookings();
  }, [token]);

  const getStatusColor = (status) => {
    switch (status) {
      case "confirmed": return "bg-green-100 text-green-700 border-green-200";
      case "cancelled": return "bg-red-100 text-red-700 border-red-200";
      case "completed": return "bg-blue-100 text-blue-700 border-blue-200";
      default: return "bg-gray-100 text-gray-700 border-gray-200";
    }
  };

  return (
    <div className="min-h-screen bg-[#F5F2EB]" data-testid="dashboard-page">
      <Navbar />

      <section className="pt-32 pb-12 px-6 bg-[#1A3C34]">
        <div className="max-w-7xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <p className="font-accent italic text-[#D4AF37] text-lg mb-2">Welcome back</p>
            <h1 className="font-display text-4xl md:text-5xl font-medium text-white tracking-tight">{user?.name}</h1>
          </motion.div>
        </div>
      </section>

      <section className="py-12 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <h2 className="font-display text-2xl text-[#1A3C34]">Your Bookings</h2>
            <Link to="/rooms" className="text-[#1A3C34] hover:text-[#D4AF37] text-sm uppercase tracking-widest transition-colors">
              Book New Room →
            </Link>
          </div>

          {loading ? (
            <div className="flex justify-center items-center py-24">
              <div className="animate-pulse text-[#1A3C34] font-display text-xl">Loading bookings...</div>
            </div>
          ) : bookings.length === 0 ? (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              className="bg-white p-12 text-center border border-[#E5E5E5]">
              <CalendarDays className="w-16 h-16 mx-auto text-[#8C8C8C] mb-4" />
              <h3 className="font-display text-2xl text-[#1A3C34] mb-2">No Bookings Yet</h3>
              <p className="text-[#8C8C8C] mb-6">Start your journey by booking your first room at The Sanctuary.</p>
              <Link to="/rooms">
                <button className="bg-[#1A3C34] hover:bg-[#142E28] text-white text-xs uppercase tracking-widest px-8 py-3">
                  Explore Rooms
                </button>
              </Link>
            </motion.div>
          ) : (
            <div className="space-y-6">
              {bookings.map((booking, index) => (
                <motion.div key={booking.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-white border border-[#E5E5E5] p-6" data-testid={`booking-card-${booking.id}`}>
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-display text-xl text-[#1A3C34]">{booking.room_name}</h3>
                        <Badge variant="outline" className={`text-xs uppercase ${getStatusColor(booking.status)}`}>
                          {booking.status}
                        </Badge>
                      </div>
                      <p className="text-[#D4AF37] text-sm mb-4">{booking.room_type}</p>
                      <div className="flex flex-wrap gap-6 text-sm text-[#8C8C8C]">
                        <div className="flex items-center gap-2">
                          <CalendarDays className="w-4 h-4" />
                          <span>{format(new Date(booking.check_in), "MMM dd")} - {format(new Date(booking.check_out), "MMM dd, yyyy")}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4" /><span>{booking.guest_name}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4" />
                          <span>Booked {format(new Date(booking.created_at), "MMM dd, yyyy")}</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-display text-3xl text-[#1A3C34]">${booking.total_price.toFixed(2)}</div>
                      <p className="text-[#8C8C8C] text-sm">Total</p>
                    </div>
                  </div>
                  {booking.special_requests && (
                    <div className="mt-4 pt-4 border-t border-[#E5E5E5]">
                      <p className="text-xs uppercase tracking-widest text-[#8C8C8C] mb-1">Special Requests</p>
                      <p className="text-[#1A3C34]">{booking.special_requests}</p>
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </section>
      <Footer />
    </div>
  );
};

export default DashboardPage;
