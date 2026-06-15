import { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "sonner";
import AdminLayout from "../../components/AdminLayout";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select";
import { API, useAuth } from "../../App";

const AdminBookings = () => {
  const { token } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("all");

  const fetchBookings = async () => {
    try {
      const response = await axios.get(`${API}/bookings/all`, { headers: { Authorization: `Bearer ${token}` } });
      setBookings(response.data);
    } catch (error) {
      toast.error("Failed to fetch bookings");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { if (token) fetchBookings(); }, [token]);

  const filteredBookings = statusFilter === "all" ? bookings : bookings.filter((b) => b.status === statusFilter);

  const updateStatus = async (bookingId, newStatus) => {
    try {
      await axios.put(`${API}/bookings/${bookingId}/status?status=${newStatus}`, {},
        { headers: { Authorization: `Bearer ${token}` } });
      toast.success(`Booking ${newStatus}`);
      fetchBookings();
    } catch (error) {
      toast.error("Failed to update booking status");
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "confirmed": return "bg-green-100 text-green-700";
      case "cancelled": return "bg-red-100 text-red-700";
      case "completed": return "bg-blue-100 text-blue-700";
      default: return "bg-gray-100 text-gray-700";
    }
  };

  return (
    <AdminLayout title="Manage Bookings">
      <div data-testid="admin-bookings">
        <div className="flex items-center justify-between mb-6">
          <p className="text-[#8C8C8C]">{bookings.length} bookings total</p>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-40"><SelectValue placeholder="Filter by status" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Bookings</SelectItem>
              <SelectItem value="confirmed">Confirmed</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {loading ? (
          <div className="text-center py-12 text-[#8C8C8C]">Loading...</div>
        ) : filteredBookings.length === 0 ? (
          <div className="text-center py-12 text-[#8C8C8C]">No bookings found</div>
        ) : (
          <div className="bg-white border border-[#E5E5E5] overflow-x-auto">
            <table className="data-table w-full min-w-[900px]">
              <thead>
                <tr>
                  <th className="p-4 text-left">Guest Details</th>
                  <th className="p-4 text-left">Room</th>
                  <th className="p-4 text-left">Dates</th>
                  <th className="p-4 text-left">Status</th>
                  <th className="p-4 text-right">Total</th>
                  <th className="p-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredBookings.map((booking) => (
                  <tr key={booking.id} data-testid={`admin-booking-${booking.id}`}>
                    <td className="p-4">
                      <p className="text-[#1A3C34] font-medium">{booking.guest_name}</p>
                      <p className="text-[#8C8C8C] text-sm">{booking.guest_email}</p>
                      <p className="text-[#8C8C8C] text-sm">{booking.guest_phone}</p>
                    </td>
                    <td className="p-4">
                      <p className="text-[#1A3C34]">{booking.room_name}</p>
                      <p className="text-[#D4AF37] text-sm">{booking.room_type}</p>
                    </td>
                    <td className="p-4">
                      <p className="text-[#1A3C34]">{booking.check_in}</p>
                      <p className="text-[#8C8C8C] text-sm">to {booking.check_out}</p>
                    </td>
                    <td className="p-4">
                      <span className={`px-2 py-1 text-xs uppercase tracking-wide rounded ${getStatusColor(booking.status)}`}>
                        {booking.status}
                      </span>
                    </td>
                    <td className="p-4 text-right font-display text-[#1A3C34]">${booking.total_price.toFixed(2)}</td>
                    <td className="p-4">
                      <div className="flex justify-center gap-1">
                        {booking.status === "confirmed" && (
                          <>
                            <button onClick={() => updateStatus(booking.id, "completed")}
                              data-testid={`complete-booking-${booking.id}`}
                              className="px-2 py-1 text-xs bg-blue-100 text-blue-700 hover:bg-blue-200 rounded transition-colors">
                              Complete
                            </button>
                            <button onClick={() => updateStatus(booking.id, "cancelled")}
                              data-testid={`cancel-booking-${booking.id}`}
                              className="px-2 py-1 text-xs bg-red-100 text-red-700 hover:bg-red-200 rounded transition-colors">
                              Cancel
                            </button>
                          </>
                        )}
                        {booking.status === "cancelled" && (
                          <button onClick={() => updateStatus(booking.id, "confirmed")}
                            className="px-2 py-1 text-xs bg-green-100 text-green-700 hover:bg-green-200 rounded transition-colors">
                            Reactivate
                          </button>
                        )}
                        {booking.status === "completed" && (
                          <span className="text-[#8C8C8C] text-xs">No actions</span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {filteredBookings.some((b) => b.special_requests) && (
          <div className="mt-8">
            <h3 className="font-display text-lg text-[#1A3C34] mb-4">Bookings with Special Requests</h3>
            <div className="space-y-4">
              {filteredBookings.filter((b) => b.special_requests).map((booking) => (
                <div key={booking.id} className="bg-white border border-[#E5E5E5] p-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-[#1A3C34] font-medium">{booking.guest_name} - {booking.room_name}</p>
                      <p className="text-[#8C8C8C] text-sm">{booking.check_in} to {booking.check_out}</p>
                    </div>
                    <span className={`px-2 py-1 text-xs uppercase rounded ${getStatusColor(booking.status)}`}>
                      {booking.status}
                    </span>
                  </div>
                  <div className="mt-3 p-3 bg-[#F5F2EB]">
                    <p className="text-xs uppercase tracking-widest text-[#8C8C8C] mb-1">Special Requests:</p>
                    <p className="text-[#1A3C34]">{booking.special_requests}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminBookings;
