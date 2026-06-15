import { useState, useEffect } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import axios from "axios";
import { format } from "date-fns";
import { motion } from "framer-motion";
import { CalendarIcon, Users, Check, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Textarea } from "../components/ui/textarea";
import { Calendar } from "../components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "../components/ui/popover";
import { API, useAuth } from "../App";

const RoomDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user, token } = useAuth();

  const [room, setRoom] = useState(null);
  const [loading, setLoading] = useState(true);
  const [booking, setBooking] = useState(false);

  const initialCheckIn = searchParams.get("checkIn") ? new Date(searchParams.get("checkIn")) : null;
  const initialCheckOut = searchParams.get("checkOut") ? new Date(searchParams.get("checkOut")) : null;

  const [checkIn, setCheckIn] = useState(initialCheckIn);
  const [checkOut, setCheckOut] = useState(initialCheckOut);
  const [guestName, setGuestName] = useState(user?.name || "");
  const [guestEmail, setGuestEmail] = useState(user?.email || "");
  const [guestPhone, setGuestPhone] = useState("");
  const [specialRequests, setSpecialRequests] = useState("");

  useEffect(() => {
    const fetchRoom = async () => {
      try {
        const response = await axios.get(`${API}/rooms/${id}`);
        setRoom(response.data);
      } catch (error) {
        toast.error("Failed to load room details");
        navigate("/rooms");
      } finally {
        setLoading(false);
      }
    };
    fetchRoom();
  }, [id, navigate]);

  useEffect(() => {
    if (user) {
      setGuestName(user.name);
      setGuestEmail(user.email);
    }
  }, [user]);

  const calculateTotal = () => {
    if (!checkIn || !checkOut || !room) return 0;
    const nights = Math.ceil((checkOut - checkIn) / (1000 * 60 * 60 * 24));
    return nights * room.price_per_night;
  };

  const handleBooking = async (e) => {
    e.preventDefault();
    if (!user) { toast.error("Please sign in to make a booking"); navigate("/auth"); return; }
    if (!checkIn || !checkOut) { toast.error("Please select check-in and check-out dates"); return; }
    if (!guestName || !guestEmail || !guestPhone) { toast.error("Please fill in all guest details"); return; }

    setBooking(true);
    try {
      await axios.post(`${API}/bookings`, {
        room_id: id,
        check_in: format(checkIn, "yyyy-MM-dd"),
        check_out: format(checkOut, "yyyy-MM-dd"),
        guest_name: guestName, guest_email: guestEmail,
        guest_phone: guestPhone, special_requests: specialRequests
      }, { headers: { Authorization: `Bearer ${token}` } });
      toast.success("Booking confirmed! Check your dashboard for details.");
      navigate("/dashboard");
    } catch (error) {
      toast.error(error.response?.data?.detail || "Failed to complete booking");
    } finally {
      setBooking(false);
    }
  };

  if (loading) return (
    <div className="min-h-screen bg-[#F5F2EB] flex items-center justify-center">
      <div className="animate-pulse text-[#1A3C34] font-display text-2xl">Loading...</div>
    </div>
  );

  if (!room) return null;

  const nights = checkIn && checkOut ? Math.ceil((checkOut - checkIn) / (1000 * 60 * 60 * 24)) : 0;

  return (
    <div className="min-h-screen bg-[#F5F2EB]" data-testid="room-detail-page">
      <Navbar />
      <div className="pt-24 px-6">
        <div className="max-w-7xl mx-auto">
          <button onClick={() => navigate("/rooms")}
            className="flex items-center gap-2 text-[#1A3C34] hover:text-[#D4AF37] transition-colors">
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm uppercase tracking-widest">Back to Rooms</span>
          </button>
        </div>
      </div>

      <section className="py-12 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <motion.div initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6 }}>
              <div className="aspect-[4/3] overflow-hidden mb-8">
                <img src={room.image_url} alt={room.name} className="w-full h-full object-cover" />
              </div>
              <span className="text-[#D4AF37] text-xs uppercase tracking-widest">{room.room_type}</span>
              <h1 className="font-display text-4xl md:text-5xl text-[#1A3C34] mt-2 mb-4">{room.name}</h1>
              <p className="text-[#8C8C8C] leading-relaxed mb-8">{room.description}</p>
              <div className="flex items-center gap-4 mb-8">
                <div className="flex items-center gap-2 text-[#1A3C34]">
                  <Users className="w-5 h-5" /><span>Up to {room.capacity} guests</span>
                </div>
                <div className="font-display text-3xl text-[#1A3C34]">
                  ${room.price_per_night}<span className="text-base text-[#8C8C8C] font-body"> / night</span>
                </div>
              </div>
              <h3 className="font-display text-xl text-[#1A3C34] mb-4">Amenities</h3>
              <div className="grid grid-cols-2 gap-3">
                {room.amenities.map((amenity, i) => (
                  <div key={i} className="flex items-center gap-2 text-[#8C8C8C]">
                    <Check className="w-4 h-4 text-[#D4AF37]" /><span>{amenity}</span>
                  </div>
                ))}
              </div>
            </motion.div>

            <motion.div initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6 }}>
              <div className="bg-white p-8 border border-[#E5E5E5] sticky top-28">
                <h2 className="font-display text-2xl text-[#1A3C34] mb-6">Reserve Your Stay</h2>
                <form onSubmit={handleBooking} data-testid="booking-form" className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[#1A3C34] text-xs uppercase tracking-widest mb-2">Check In</label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button variant="outline" data-testid="detail-checkin-picker" className="w-full justify-start text-left font-normal">
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {checkIn ? format(checkIn, "MMM dd") : "Select"}
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
                          <Button variant="outline" data-testid="detail-checkout-picker" className="w-full justify-start text-left font-normal">
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {checkOut ? format(checkOut, "MMM dd") : "Select"}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar mode="single" selected={checkOut} onSelect={setCheckOut}
                            disabled={(date) => date < (checkIn || new Date())} initialFocus />
                        </PopoverContent>
                      </Popover>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[#1A3C34] text-xs uppercase tracking-widest mb-2">Full Name</label>
                    <Input value={guestName} onChange={(e) => setGuestName(e.target.value)}
                      data-testid="guest-name-input" placeholder="John Doe" required />
                  </div>
                  <div>
                    <label className="block text-[#1A3C34] text-xs uppercase tracking-widest mb-2">Email</label>
                    <Input type="email" value={guestEmail} onChange={(e) => setGuestEmail(e.target.value)}
                      data-testid="guest-email-input" placeholder="john@example.com" required />
                  </div>
                  <div>
                    <label className="block text-[#1A3C34] text-xs uppercase tracking-widest mb-2">Phone</label>
                    <Input type="tel" value={guestPhone} onChange={(e) => setGuestPhone(e.target.value)}
                      data-testid="guest-phone-input" placeholder="+1 (555) 123-4567" required />
                  </div>
                  <div>
                    <label className="block text-[#1A3C34] text-xs uppercase tracking-widest mb-2">Special Requests</label>
                    <Textarea value={specialRequests} onChange={(e) => setSpecialRequests(e.target.value)}
                      data-testid="special-requests-input" placeholder="Any special requests..." rows={3} />
                  </div>

                  {nights > 0 && (
                    <div className="border-t pt-4 space-y-2">
                      <div className="flex justify-between text-[#8C8C8C]">
                        <span>${room.price_per_night} x {nights} night{nights > 1 ? "s" : ""}</span>
                        <span>${calculateTotal()}</span>
                      </div>
                      <div className="flex justify-between font-display text-xl text-[#1A3C34]">
                        <span>Total</span><span>${calculateTotal()}</span>
                      </div>
                    </div>
                  )}

                  <Button type="submit" disabled={booking} data-testid="confirm-booking-btn"
                    className="w-full bg-[#1A3C34] hover:bg-[#142E28] text-white text-xs uppercase tracking-widest py-6 btn-scale">
                    {booking ? "Processing..." : "Confirm Booking"}
                  </Button>
                </form>
              </div>
            </motion.div>
          </div>
        </div>
      </section>
      <Footer />
    </div>
  );
};

export default RoomDetailPage;
