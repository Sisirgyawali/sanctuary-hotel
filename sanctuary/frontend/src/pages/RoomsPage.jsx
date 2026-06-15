import { useState, useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import axios from "axios";
import { motion } from "framer-motion";
import { Users, Wifi, Wind, Coffee } from "lucide-react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { Button } from "../components/ui/button";
import { API } from "../App";

const RoomsPage = () => {
  const [searchParams] = useSearchParams();
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    const fetchRooms = async () => {
      try {
        const response = await axios.get(`${API}/rooms`);
        setRooms(response.data);
      } catch (error) {
        console.error("Failed to fetch rooms:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchRooms();
  }, []);

  const filteredRooms = filter === "all" ? rooms : rooms.filter((room) => room.room_type === filter);
  const roomTypes = ["all", "Standard", "Deluxe", "Suite"];

  const getAmenityIcon = (amenity) => {
    if (amenity.toLowerCase().includes("wi-fi")) return Wifi;
    if (amenity.toLowerCase().includes("air")) return Wind;
    return Coffee;
  };

  return (
    <div className="min-h-screen bg-[#F5F2EB]" data-testid="rooms-page">
      <Navbar />

      <section className="pt-32 pb-16 px-6 bg-[#1A3C34]">
        <div className="max-w-7xl mx-auto text-center">
          <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            className="font-accent italic text-[#D4AF37] text-lg mb-2">Accommodations</motion.p>
          <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
            className="font-display text-5xl md:text-6xl font-medium text-white tracking-tight">Our Rooms</motion.h1>
        </div>
      </section>

      <section className="py-8 px-6 bg-white border-b">
        <div className="max-w-7xl mx-auto flex justify-center gap-4 flex-wrap">
          {roomTypes.map((type) => (
            <button key={type} onClick={() => setFilter(type)} data-testid={`filter-${type.toLowerCase()}`}
              className={`px-6 py-2 text-xs uppercase tracking-widest transition-all ${
                filter === type ? "bg-[#1A3C34] text-white" : "bg-transparent text-[#1A3C34] hover:bg-[#1A3C34]/10"
              }`}>
              {type === "all" ? "All Rooms" : type}
            </button>
          ))}
        </div>
      </section>

      <section className="py-16 px-6">
        <div className="max-w-7xl mx-auto">
          {loading ? (
            <div className="flex justify-center items-center py-24">
              <div className="animate-pulse text-[#1A3C34] font-display text-2xl">Loading rooms...</div>
            </div>
          ) : filteredRooms.length === 0 ? (
            <div className="text-center py-24"><p className="text-[#8C8C8C] text-lg">No rooms available in this category.</p></div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredRooms.map((room, index) => (
                <motion.div key={room.id} initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1, duration: 0.5 }}
                  className="room-card bg-white border border-[#E5E5E5] overflow-hidden" data-testid={`room-card-${room.id}`}>
                  <div className="aspect-[4/3] overflow-hidden">
                    <img src={room.image_url} alt={room.name}
                      className="w-full h-full object-cover transition-transform duration-500 hover:scale-105" />
                  </div>
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[#D4AF37] text-xs uppercase tracking-widest">{room.room_type}</span>
                      <div className="flex items-center gap-1 text-[#8C8C8C]">
                        <Users className="w-4 h-4" /><span className="text-sm">{room.capacity}</span>
                      </div>
                    </div>
                    <h3 className="font-display text-2xl text-[#1A3C34] mb-2">{room.name}</h3>
                    <p className="text-[#8C8C8C] text-sm leading-relaxed mb-4 line-clamp-2">{room.description}</p>
                    <div className="flex flex-wrap gap-2 mb-6">
                      {room.amenities.slice(0, 3).map((amenity, i) => {
                        const Icon = getAmenityIcon(amenity);
                        return (
                          <span key={i} className="flex items-center gap-1 text-xs text-[#8C8C8C] bg-[#F5F2EB] px-2 py-1">
                            <Icon className="w-3 h-3" />{amenity}
                          </span>
                        );
                      })}
                      {room.amenities.length > 3 && (
                        <span className="text-xs text-[#8C8C8C] bg-[#F5F2EB] px-2 py-1">+{room.amenities.length - 3} more</span>
                      )}
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="font-display text-2xl text-[#1A3C34]">${room.price_per_night}</span>
                        <span className="text-[#8C8C8C] text-sm"> / night</span>
                      </div>
                      <Link to={`/rooms/${room.id}?${searchParams.toString()}`}>
                        <Button data-testid={`book-room-${room.id}`}
                          className="bg-[#1A3C34] hover:bg-[#142E28] text-white text-xs uppercase tracking-widest btn-scale">
                          View Details
                        </Button>
                      </Link>
                    </div>
                  </div>
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

export default RoomsPage;
