import { useState, useEffect } from "react";
import axios from "axios";
import { Bed, CalendarCheck, UtensilsCrossed, Users } from "lucide-react";
import AdminLayout from "../../components/AdminLayout";
import { API, useAuth } from "../../App";

const AdminDashboard = () => {
  const { token } = useAuth();
  const [stats, setStats] = useState({ rooms: 0, bookings: 0, menuItems: 0, confirmedBookings: 0 });
  const [recentBookings, setRecentBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [roomsRes, bookingsRes, menuRes] = await Promise.all([
          axios.get(`${API}/rooms`),
          axios.get(`${API}/bookings/all`, { headers: { Authorization: `Bearer ${token}` } }),
          axios.get(`${API}/menu`),
        ]);
        const bookings = bookingsRes.data;
        setStats({
          rooms: roomsRes.data.length, bookings: bookings.length,
          menuItems: menuRes.data.length,
          confirmedBookings: bookings.filter((b) => b.status === "confirmed").length,
        });
        setRecentBookings(bookings.slice(0, 5));
      } catch (error) {
        console.error("Failed to fetch dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };
    if (token) fetchData();
  }, [token]);

  const statCards = [
    { label: "Total Rooms", value: stats.rooms, icon: Bed, color: "bg-blue-50 text-blue-600" },
    { label: "Total Bookings", value: stats.bookings, icon: CalendarCheck, color: "bg-green-50 text-green-600" },
    { label: "Menu Items", value: stats.menuItems, icon: UtensilsCrossed, color: "bg-orange-50 text-orange-600" },
    { label: "Active Bookings", value: stats.confirmedBookings, icon: Users, color: "bg-purple-50 text-purple-600" },
  ];

  return (
    <AdminLayout title="Dashboard">
      <div data-testid="admin-dashboard">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {statCards.map((stat, index) => (
            <div key={index} className="bg-white p-6 border border-[#E5E5E5]">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[#8C8C8C] text-xs uppercase tracking-widest mb-1">{stat.label}</p>
                  <p className="font-display text-3xl text-[#1A3C34]">{loading ? "..." : stat.value}</p>
                </div>
                <div className={`p-3 rounded-full ${stat.color}`}>
                  <stat.icon className="w-6 h-6" />
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="bg-white border border-[#E5E5E5]">
          <div className="p-6 border-b border-[#E5E5E5]">
            <h2 className="font-display text-xl text-[#1A3C34]">Recent Bookings</h2>
          </div>
          {loading ? (
            <div className="p-6 text-center text-[#8C8C8C]">Loading...</div>
          ) : recentBookings.length === 0 ? (
            <div className="p-6 text-center text-[#8C8C8C]">No bookings yet</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="data-table w-full">
                <thead>
                  <tr>
                    <th className="p-4 text-left">Guest</th>
                    <th className="p-4 text-left">Room</th>
                    <th className="p-4 text-left">Dates</th>
                    <th className="p-4 text-left">Status</th>
                    <th className="p-4 text-right">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {recentBookings.map((booking) => (
                    <tr key={booking.id}>
                      <td className="p-4">
                        <p className="text-[#1A3C34] font-medium">{booking.guest_name}</p>
                        <p className="text-[#8C8C8C] text-sm">{booking.guest_email}</p>
                      </td>
                      <td className="p-4">
                        <p className="text-[#1A3C34]">{booking.room_name}</p>
                        <p className="text-[#D4AF37] text-sm">{booking.room_type}</p>
                      </td>
                      <td className="p-4 text-[#8C8C8C]">{booking.check_in} → {booking.check_out}</td>
                      <td className="p-4">
                        <span className={`px-2 py-1 text-xs uppercase tracking-wide rounded ${
                          booking.status === "confirmed" ? "status-confirmed" :
                          booking.status === "cancelled" ? "status-cancelled" : "status-completed"
                        }`}>{booking.status}</span>
                      </td>
                      <td className="p-4 text-right font-display text-[#1A3C34]">${booking.total_price.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminDashboard;
