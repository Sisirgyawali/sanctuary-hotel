import { useState, useEffect } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { API } from "../App";

const MenuPage = () => {
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState("Breakfast");
  const categories = ["Breakfast", "Lunch", "Dinner", "Beverages"];

  useEffect(() => {
    const fetchMenu = async () => {
      try {
        const response = await axios.get(`${API}/menu`);
        setMenuItems(response.data);
      } catch (error) {
        console.error("Failed to fetch menu:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchMenu();
  }, []);

  const filteredItems = menuItems.filter((item) => item.category === activeCategory);

  return (
    <div className="min-h-screen bg-[#F5F2EB]" data-testid="menu-page">
      <Navbar />

      <section className="relative pt-32 pb-24 px-6">
        <div className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url('https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=1920&q=80')` }} />
        <div className="absolute inset-0 bg-[#1A3C34]/85" />
        <div className="relative z-10 max-w-4xl mx-auto text-center">
          <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            className="font-accent italic text-[#D4AF37] text-lg mb-2">Culinary Excellence</motion.p>
          <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
            className="font-display text-5xl md:text-7xl font-medium text-white tracking-tight mb-6">Our Menu</motion.h1>
          <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
            className="text-white/70 text-lg max-w-2xl mx-auto">
            Experience a culinary journey crafted by our world-class chefs, featuring locally sourced ingredients.
          </motion.p>
        </div>
      </section>

      <section className="sticky top-20 z-40 bg-white border-b border-[#E5E5E5] shadow-sm">
        <div className="max-w-4xl mx-auto px-6">
          <div className="flex justify-center gap-8 py-4">
            {categories.map((category) => (
              <button key={category} onClick={() => setActiveCategory(category)}
                data-testid={`menu-tab-${category.toLowerCase()}`}
                className={`menu-tab pb-2 text-sm uppercase tracking-widest transition-colors ${
                  activeCategory === category ? "text-[#1A3C34] active" : "text-[#8C8C8C] hover:text-[#1A3C34]"
                }`}>
                {category}
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 px-6">
        <div className="max-w-3xl mx-auto">
          {loading ? (
            <div className="flex justify-center items-center py-24">
              <div className="animate-pulse text-[#1A3C34] font-display text-2xl">Loading menu...</div>
            </div>
          ) : filteredItems.length === 0 ? (
            <div className="text-center py-24">
              <p className="text-[#8C8C8C] text-lg">No items available in this category.</p>
            </div>
          ) : (
            <div className="bg-white p-8 md:p-12 border border-[#E5E5E5]">
              <div className="text-center mb-12 pb-8 border-b border-[#E5E5E5]">
                <h2 className="font-display text-4xl text-[#1A3C34]">{activeCategory}</h2>
                <div className="w-16 h-0.5 bg-[#D4AF37] mx-auto mt-4" />
              </div>
              <div className="space-y-8">
                {filteredItems.map((item, index) => (
                  <motion.div key={item.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }} className="group" data-testid={`menu-item-${item.id}`}>
                    <div className="flex items-start gap-6">
                      <div className="w-24 h-24 flex-shrink-0 overflow-hidden rounded-sm">
                        <img src={item.image_url} alt={item.name}
                          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-baseline justify-between gap-4">
                          <h3 className="font-display text-xl text-[#1A3C34] group-hover:text-[#D4AF37] transition-colors">
                            {item.name}
                          </h3>
                          <div className="flex-1 border-b border-dotted border-[#E5E5E5] mb-2" />
                          <span className="font-display text-xl text-[#1A3C34]">${item.price.toFixed(2)}</span>
                        </div>
                        <p className="text-[#8C8C8C] text-sm leading-relaxed mt-2">{item.description}</p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
              <div className="text-center mt-12 pt-8 border-t border-[#E5E5E5]">
                <p className="font-accent italic text-[#8C8C8C]">All prices are subject to applicable taxes and service charges.</p>
              </div>
            </div>
          )}
        </div>
      </section>
      <Footer />
    </div>
  );
};

export default MenuPage;
