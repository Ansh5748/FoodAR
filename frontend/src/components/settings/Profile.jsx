import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../../App';
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Building, ArrowLeft, Star, Phone, MapPin, FileText } from 'lucide-react';
import { toast } from 'sonner';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export default function Profile() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [restaurants, setRestaurants] = useState([]);
  const [defaultRestaurantId, setDefaultRestaurantId] = useState(localStorage.getItem('defaultRestaurantId') || '');
  const [editing, setEditing] = useState(false);
  const [editForm, setEditForm] = useState({ name: '', description: '', address: '', phone: '' });
  const [imageUploading, setImageUploading] = useState(false);
  const fileInputRef = React.useRef(null);

  const isAdmin = useMemo(() => user?.role === 'admin' || user?.role === 'super_admin', [user]);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await axios.get(`${API}/restaurants`);
        setRestaurants(res.data || []);
        if (!defaultRestaurantId && res.data?.length > 0) {
          setDefaultRestaurantId(res.data[0].id);
        }
        const primaryNow = res.data?.[0];
        if (primaryNow) {
          setEditForm({
            name: primaryNow.name || '',
            description: primaryNow.description || '',
            address: primaryNow.address || '',
            phone: primaryNow.phone || ''
          });
        }
      } catch (e) {
        toast.error('Failed to load restaurants');
      }
    };
    load();
  }, []); // eslint-disable-line

  const handleSetDefault = async (restaurantId) => {
    try {
      // Persist locally for now; if backend endpoint added later, call it here
      localStorage.setItem('defaultRestaurantId', restaurantId);
      setDefaultRestaurantId(restaurantId);
      toast.success('Default restaurant updated');
    } catch (e) {
      toast.error('Failed to set default restaurant');
    }
  };

  const primary = restaurants.find(r => r.id === defaultRestaurantId) || restaurants[0];

  const handleSave = async () => {
    if (!primary) return;
    try {
      const payload = { ...editForm };
      await axios.put(`${API}/restaurants/${primary.id}`, payload);
      toast.success('Restaurant updated');
      setEditing(false);
      const res = await axios.get(`${API}/restaurants`);
      setRestaurants(res.data || []);
    } catch (e) {
      toast.error(e.response?.data?.detail || 'Failed to update');
    }
  };

  const handleImageUpload = async (file) => {
    if (!primary || !file) return;
    try {
      setImageUploading(true);
      const form = new FormData();
      form.append('file', file);
      await axios.post(`${API}/restaurants/${primary.id}/upload-image`, form, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      toast.success('Image uploaded');
      const refreshed = await axios.get(`${API}/restaurants`);
      setRestaurants(refreshed.data || []);
    } catch (e) {
      toast.error(e.response?.data?.detail || 'Image upload failed');
    } finally {
      setImageUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50 dark:bg-background dark:bg-none">
      <div className="bg-white/80 backdrop-blur-sm border-b border-orange-100 sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center py-6">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate(-1)}
              className="mr-4 border-orange-200 text-orange-700 hover:bg-orange-50"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent">
                My Profile
              </h1>
              <p className="text-gray-600">Manage your restaurant details</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {primary && (
          <Card className="bg-white/80 backdrop-blur-sm border-orange-100">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <label className="mr-4 cursor-pointer relative group">
                    {primary?.image_url ? (
                      <img src={primary.image_url.startsWith('/') ? `${BACKEND_URL}${primary.image_url}` : primary.image_url} alt="Restaurant" className="w-12 h-12 rounded-lg object-cover border" />
                    ) : (
                      <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-amber-500 rounded-lg flex items-center justify-center">
                        <Building className="w-6 h-6 text-white" />
                      </div>
                    )}
                    <input type="file" accept="image/*" className="hidden" onChange={(e) => e.target.files && handleImageUpload(e.target.files[0])} />
                    <span className="absolute inset-0 hidden group-hover:flex items-center justify-center bg-black/40 text-white text-[10px] rounded-lg">Change</span>
                  </label>
                  <div>
                    <CardTitle>{primary.name}</CardTitle>
                    <CardDescription>Default restaurant</CardDescription>
                  </div>
                </div>
                {isAdmin && (
                  <Button variant="outline" size="sm" onClick={() => handleSetDefault(primary.id)}>
                    <Star className="w-4 h-4 mr-2" /> Set as default
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {!editing ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-semibold text-gray-700">Description</Label>
                    <div className="flex items-start mt-1 text-gray-800">
                      <FileText className="w-4 h-4 text-gray-400 mr-2 mt-1" />
                      <p>{primary.description || '—'}</p>
                    </div>
                  </div>
                  <div>
                    <Label className="text-sm font-semibold text-gray-700">Phone</Label>
                    <div className="flex items-center mt-1 text-gray-800">
                      <Phone className="w-4 h-4 text-gray-400 mr-2" />
                      <p>{primary.phone || '—'}</p>
                    </div>
                  </div>
                  <div className="md:col-span-2">
                    <Label className="text-sm font-semibold text-gray-700">Address</Label>
                    <div className="flex items-center mt-1 text-gray-800">
                      <MapPin className="w-4 h-4 text-gray-400 mr-2" />
                      <p>{primary.address || '—'}</p>
                    </div>
                  </div>
                  <div className="md:col-span-2 flex items-center justify-between pt-2">
                    <div className="flex items-center space-x-3">
                      {primary.image_url && (
                        <img src={primary.image_url.startsWith('/') ? `${BACKEND_URL}${primary.image_url}` : primary.image_url} alt="Restaurant" className="w-16 h-16 rounded object-cover border" />
                      )}
                      <div>
                        <Label className="text-sm font-semibold text-gray-700">Logo / Image</Label>
                        <p className="text-gray-600 text-sm">Upload a cover or logo image</p>
                      </div>
                    </div>
                    <label className="cursor-pointer">
                      <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={(e) => e.target.files && handleImageUpload(e.target.files[0])} />
                      <Button variant="outline" disabled={imageUploading} onClick={() => fileInputRef.current?.click()}>
                        {imageUploading ? 'Uploading...' : (primary?.image_url ? 'Update Image' : 'Add Image')}
                      </Button>
                    </label>
                  </div>
                  <div className="md:col-span-2">
                    <Button variant="outline" onClick={() => setEditing(true)}>Edit</Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Name</Label>
                      <Input id="name" value={editForm.name} onChange={(e) => setEditForm({ ...editForm, name: e.target.value })} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone</Label>
                      <Input id="phone" value={editForm.phone} onChange={(e) => setEditForm({ ...editForm, phone: e.target.value.replace(/[^0-9+\-\s()]/g, '') })} />
                    </div>
                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="address">Address</Label>
                      <Input id="address" value={editForm.address} onChange={(e) => setEditForm({ ...editForm, address: e.target.value })} />
                    </div>
                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="description">Description</Label>
                      <textarea id="description" className="w-full p-3 border rounded" rows={3} value={editForm.description} onChange={(e) => setEditForm({ ...editForm, description: e.target.value })} />
                    </div>
                  </div>
                  <div className="flex justify-end space-x-3">
                    <Button variant="outline" onClick={() => setEditing(false)}>Cancel</Button>
                    <Button onClick={handleSave}>Save Changes</Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {isAdmin && restaurants.length > 1 && (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {restaurants.filter(r => r.id !== primary?.id).map(r => (
              <Card key={r.id} className="bg-white/80 backdrop-blur-sm border-orange-100">
                <CardHeader>
                  <CardTitle className="text-lg font-semibold text-gray-900">{r.name}</CardTitle>
                  <CardDescription>{r.description || '—'}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center text-gray-800"><Phone className="w-3 h-3 mr-2 text-gray-400" /> {r.phone || '—'}</div>
                    <div className="flex items-center text-gray-800"><MapPin className="w-3 h-3 mr-2 text-gray-400" /> {r.address || '—'}</div>
                  </div>
                  <div className="pt-4">
                    <Button variant="outline" size="sm" onClick={() => handleSetDefault(r.id)}>
                      <Star className="w-4 h-4 mr-2" /> Set as default
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}


