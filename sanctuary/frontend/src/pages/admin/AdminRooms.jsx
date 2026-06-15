import { useState, useEffect } from "react";
import axios from "axios";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";
import AdminLayout from "../../components/AdminLayout";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Textarea } from "../../components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../../components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select";
import { API, useAuth } from "../../App";

const AdminRooms = () => {
  const { token } = useAuth();
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingRoom, setEditingRoom] = useState(null);
  const [formData, setFormData] = useState({
    name: "", room_type: "Standard", description: "",
    price_per_night: "", capacity: "2", amenities: "",
    image_url: "", is_available: true,
  });

  const fetchRooms = async () => {
    try {
      const response = await axios.get(`${API}/rooms`);
      setRooms(response.data);
    } catch (error) {
      toast.error("Failed to fetch rooms");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchRooms(); }, []);

  const resetForm = () => {
    setFormData({ name: "", room_type: "Standard", description: "", price_per_night: "",
      capacity: "2", amenities: "", image_url: "", is_available: true });
    setEditingRoom(null);
  };

  const openCreateDialog = () => { resetForm(); setDialogOpen(true); };

  const openEditDialog = (room) => {
    setEditingRoom(room);
    setFormData({
      name: room.name, room_type: room.room_type, description: room.description,
      price_per_night: room.price_per_night.toString(), capacity: room.capacity.toString(),
      amenities: room.amenities.join(", "), image_url: room.image_url, is_available: room.is_available,
    });
    setDialogOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const roomData = {
      ...formData,
      price_per_night: parseFloat(formData.price_per_night),
      capacity: parseInt(formData.capacity),
      amenities: formData.amenities.split(",").map((a) => a.trim()).filter(Boolean),
    };
    try {
      if (editingRoom) {
        await axios.put(`${API}/rooms/${editingRoom.id}`, roomData, { headers: { Authorization: `Bearer ${token}` } });
        toast.success("Room updated successfully");
      } else {
        await axios.post(`${API}/rooms`, roomData, { headers: { Authorization: `Bearer ${token}` } });
        toast.success("Room created successfully");
      }
      setDialogOpen(false);
      resetForm();
      fetchRooms();
    } catch (error) {
      toast.error(error.response?.data?.detail || "Failed to save room");
    }
  };

  const handleDelete = async (roomId) => {
    if (!window.confirm("Are you sure you want to delete this room?")) return;
    try {
      await axios.delete(`${API}/rooms/${roomId}`, { headers: { Authorization: `Bearer ${token}` } });
      toast.success("Room deleted");
      fetchRooms();
    } catch (error) {
      toast.error("Failed to delete room");
    }
  };

  return (
    <AdminLayout title="Manage Rooms">
      <div data-testid="admin-rooms">
        <div className="flex items-center justify-between mb-6">
          <p className="text-[#8C8C8C]">{rooms.length} rooms total</p>
          <Button onClick={openCreateDialog} data-testid="add-room-btn"
            className="bg-[#1A3C34] hover:bg-[#142E28] text-white">
            <Plus className="w-4 h-4 mr-2" /> Add Room
          </Button>
        </div>

        {loading ? (
          <div className="text-center py-12 text-[#8C8C8C]">Loading...</div>
        ) : rooms.length === 0 ? (
          <div className="text-center py-12 text-[#8C8C8C]">No rooms found</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {rooms.map((room) => (
              <div key={room.id} className="bg-white border border-[#E5E5E5] overflow-hidden" data-testid={`admin-room-${room.id}`}>
                <div className="aspect-video overflow-hidden">
                  <img src={room.image_url} alt={room.name} className="w-full h-full object-cover" />
                </div>
                <div className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[#D4AF37] text-xs uppercase tracking-widest">{room.room_type}</span>
                    <span className={`px-2 py-0.5 text-xs rounded ${room.is_available ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                      {room.is_available ? "Available" : "Unavailable"}
                    </span>
                  </div>
                  <h3 className="font-display text-lg text-[#1A3C34] mb-1">{room.name}</h3>
                  <p className="text-[#8C8C8C] text-sm mb-3 line-clamp-2">{room.description}</p>
                  <div className="flex items-center justify-between">
                    <span className="font-display text-xl text-[#1A3C34]">${room.price_per_night}/night</span>
                    <div className="flex gap-2">
                      <button onClick={() => openEditDialog(room)} data-testid={`edit-room-${room.id}`}
                        className="p-2 text-[#8C8C8C] hover:text-[#1A3C34] transition-colors">
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button onClick={() => handleDelete(room.id)} data-testid={`delete-room-${room.id}`}
                        className="p-2 text-[#8C8C8C] hover:text-red-600 transition-colors">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle className="font-display text-xl text-[#1A3C34]">
                {editingRoom ? "Edit Room" : "Add New Room"}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4" data-testid="room-form">
              <div>
                <label className="block text-xs uppercase tracking-widest text-[#1A3C34] mb-1">Room Name</label>
                <Input value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Deluxe Ocean View" required />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs uppercase tracking-widest text-[#1A3C34] mb-1">Room Type</label>
                  <Select value={formData.room_type} onValueChange={(v) => setFormData({ ...formData, room_type: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Standard">Standard</SelectItem>
                      <SelectItem value="Deluxe">Deluxe</SelectItem>
                      <SelectItem value="Suite">Suite</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="block text-xs uppercase tracking-widest text-[#1A3C34] mb-1">Capacity</label>
                  <Select value={formData.capacity} onValueChange={(v) => setFormData({ ...formData, capacity: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {[1,2,3,4,5,6].map((n) => (
                        <SelectItem key={n} value={n.toString()}>{n} Guest{n > 1 ? "s" : ""}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <label className="block text-xs uppercase tracking-widest text-[#1A3C34] mb-1">Price Per Night ($)</label>
                <Input type="number" value={formData.price_per_night}
                  onChange={(e) => setFormData({ ...formData, price_per_night: e.target.value })}
                  placeholder="199.00" min="0" step="0.01" required />
              </div>
              <div>
                <label className="block text-xs uppercase tracking-widest text-[#1A3C34] mb-1">Description</label>
                <Textarea value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="A beautiful room with..." rows={3} required />
              </div>
              <div>
                <label className="block text-xs uppercase tracking-widest text-[#1A3C34] mb-1">Amenities (comma separated)</label>
                <Input value={formData.amenities} onChange={(e) => setFormData({ ...formData, amenities: e.target.value })}
                  placeholder="Wi-Fi, Air Conditioning, Mini Bar" />
              </div>
              <div>
                <label className="block text-xs uppercase tracking-widest text-[#1A3C34] mb-1">Image URL</label>
                <Input type="url" value={formData.image_url}
                  onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                  placeholder="https://..." required />
              </div>
              <div className="flex gap-3 pt-4">
                <Button type="button" variant="outline" onClick={() => setDialogOpen(false)} className="flex-1">Cancel</Button>
                <Button type="submit" className="flex-1 bg-[#1A3C34] hover:bg-[#142E28] text-white">
                  {editingRoom ? "Update Room" : "Create Room"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
};

export default AdminRooms;
