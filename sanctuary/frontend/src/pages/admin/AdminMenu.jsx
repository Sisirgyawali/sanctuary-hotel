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

const AdminMenu = () => {
  const { token } = useAuth();
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [formData, setFormData] = useState({
    name: "", description: "", price: "", category: "Breakfast",
    image_url: "", is_available: true,
  });

  const fetchItems = async () => {
    try {
      const response = await axios.get(`${API}/menu/all`, { headers: { Authorization: `Bearer ${token}` } });
      setMenuItems(response.data);
    } catch (error) {
      toast.error("Failed to fetch menu items");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { if (token) fetchItems(); }, [token]);

  const resetForm = () => {
    setFormData({ name: "", description: "", price: "", category: "Breakfast", image_url: "", is_available: true });
    setEditingItem(null);
  };

  const openEditDialog = (item) => {
    setEditingItem(item);
    setFormData({
      name: item.name, description: item.description, price: item.price.toString(),
      category: item.category, image_url: item.image_url, is_available: item.is_available,
    });
    setDialogOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const itemData = { ...formData, price: parseFloat(formData.price) };
    try {
      if (editingItem) {
        await axios.put(`${API}/menu/${editingItem.id}`, itemData, { headers: { Authorization: `Bearer ${token}` } });
        toast.success("Menu item updated");
      } else {
        await axios.post(`${API}/menu`, itemData, { headers: { Authorization: `Bearer ${token}` } });
        toast.success("Menu item created");
      }
      setDialogOpen(false);
      resetForm();
      fetchItems();
    } catch (error) {
      toast.error("Failed to save menu item");
    }
  };

  const handleDelete = async (itemId) => {
    if (!window.confirm("Delete this menu item?")) return;
    try {
      await axios.delete(`${API}/menu/${itemId}`, { headers: { Authorization: `Bearer ${token}` } });
      toast.success("Menu item deleted");
      fetchItems();
    } catch (error) {
      toast.error("Failed to delete menu item");
    }
  };

  const categories = ["all", "Breakfast", "Lunch", "Dinner", "Beverages"];
  const filtered = categoryFilter === "all" ? menuItems : menuItems.filter((i) => i.category === categoryFilter);

  return (
    <AdminLayout title="Manage Menu">
      <div>
        <div className="flex items-center justify-between mb-6">
          <div className="flex gap-2 flex-wrap">
            {categories.map((cat) => (
              <button key={cat} onClick={() => setCategoryFilter(cat)}
                className={`px-4 py-1.5 text-xs uppercase tracking-widest transition-all ${
                  categoryFilter === cat ? "bg-[#1A3C34] text-white" : "bg-white border border-[#E5E5E5] text-[#1A3C34] hover:bg-[#F5F2EB]"
                }`}>
                {cat === "all" ? "All" : cat}
              </button>
            ))}
          </div>
          <Button onClick={() => { resetForm(); setDialogOpen(true); }}
            className="bg-[#1A3C34] hover:bg-[#142E28] text-white">
            <Plus className="w-4 h-4 mr-2" /> Add Item
          </Button>
        </div>

        {loading ? (
          <div className="text-center py-12 text-[#8C8C8C]">Loading...</div>
        ) : (
          <div className="bg-white border border-[#E5E5E5] overflow-x-auto">
            <table className="data-table w-full min-w-[700px]">
              <thead>
                <tr>
                  <th className="p-4 text-left">Item</th>
                  <th className="p-4 text-left">Category</th>
                  <th className="p-4 text-right">Price</th>
                  <th className="p-4 text-center">Status</th>
                  <th className="p-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((item) => (
                  <tr key={item.id}>
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <img src={item.image_url} alt={item.name} className="w-12 h-12 object-cover rounded-sm" />
                        <div>
                          <p className="text-[#1A3C34] font-medium">{item.name}</p>
                          <p className="text-[#8C8C8C] text-sm line-clamp-1">{item.description}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4"><span className="text-[#D4AF37] text-xs uppercase tracking-widest">{item.category}</span></td>
                    <td className="p-4 text-right font-display text-[#1A3C34]">${item.price.toFixed(2)}</td>
                    <td className="p-4 text-center">
                      <span className={`px-2 py-0.5 text-xs rounded ${item.is_available ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                        {item.is_available ? "Active" : "Hidden"}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex justify-center gap-2">
                        <button onClick={() => openEditDialog(item)} className="p-2 text-[#8C8C8C] hover:text-[#1A3C34] transition-colors">
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button onClick={() => handleDelete(item.id)} className="p-2 text-[#8C8C8C] hover:text-red-600 transition-colors">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle className="font-display text-xl text-[#1A3C34]">
                {editingItem ? "Edit Menu Item" : "Add Menu Item"}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs uppercase tracking-widest text-[#1A3C34] mb-1">Name</label>
                <Input value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Eggs Benedict" required />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs uppercase tracking-widest text-[#1A3C34] mb-1">Category</label>
                  <Select value={formData.category} onValueChange={(v) => setFormData({ ...formData, category: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {["Breakfast","Lunch","Dinner","Beverages"].map((c) => (
                        <SelectItem key={c} value={c}>{c}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="block text-xs uppercase tracking-widest text-[#1A3C34] mb-1">Price ($)</label>
                  <Input type="number" value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    placeholder="18.00" min="0" step="0.01" required />
                </div>
              </div>
              <div>
                <label className="block text-xs uppercase tracking-widest text-[#1A3C34] mb-1">Description</label>
                <Textarea value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Describe the dish..." rows={2} required />
              </div>
              <div>
                <label className="block text-xs uppercase tracking-widest text-[#1A3C34] mb-1">Image URL</label>
                <Input type="url" value={formData.image_url}
                  onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                  placeholder="https://..." required />
              </div>
              <div className="flex items-center gap-2">
                <input type="checkbox" id="available" checked={formData.is_available}
                  onChange={(e) => setFormData({ ...formData, is_available: e.target.checked })}
                  className="w-4 h-4 accent-[#1A3C34]" />
                <label htmlFor="available" className="text-sm text-[#1A3C34]">Available on menu</label>
              </div>
              <div className="flex gap-3 pt-2">
                <Button type="button" variant="outline" onClick={() => setDialogOpen(false)} className="flex-1">Cancel</Button>
                <Button type="submit" className="flex-1 bg-[#1A3C34] hover:bg-[#142E28] text-white">
                  {editingItem ? "Update" : "Create"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
};

export default AdminMenu;
