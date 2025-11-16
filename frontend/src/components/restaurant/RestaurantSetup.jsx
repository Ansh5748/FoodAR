import React, { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../../App';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from '../ui/card';
import { toast } from 'sonner';
import { Building, MapPin, Phone, FileText, ArrowLeft, ArrowRight } from 'lucide-react';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export default function RestaurantSetup() {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    address: '',
    phone: ''
  });
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();
  const imageFileRef = useRef(null);

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await axios.post(`${API}/restaurants`, formData);
      toast.success('Restaurant created successfully!');
      // If image selected in hidden ref, upload it
      if (imageFileRef.current) {
        const file = imageFileRef.current.files?.[0];
        if (file) {
          const fd = new FormData();
          fd.append('file', file);
          try {
            await axios.post(`${API}/restaurants/${response.data.id}/upload-image`, fd, { headers: { 'Content-Type': 'multipart/form-data' } });
          } catch (err) {}
        }
      }
      navigate(`/restaurant/${response.data.id}/food-items`);
    } catch (error) {
      console.error('Error creating restaurant:', error);
      toast.error(error.response?.data?.detail || 'Failed to create restaurant');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50 dark:bg-background dark:bg-none">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-orange-100 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-center py-6 space-y-4 md:space-y-0">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate('/dashboard')}
              className="self-start md:mr-4 border-orange-200 text-orange-700 hover:bg-orange-50"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Button>
            <div className="flex items-center">
              <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-amber-500 rounded-lg flex items-center justify-center mr-4">
                <Building className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent">
                  Restaurant Setup
                </h1>
                <p className="text-gray-600">Create your restaurant profile</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <Card className="bg-white/80 backdrop-blur-sm border-orange-100 shadow-2xl">
          <CardHeader className="text-center pb-8">
            <div className="mx-auto mb-4 w-16 h-16 bg-gradient-to-br from-orange-500 to-amber-500 rounded-full flex items-center justify-center">
              <Building className="w-8 h-8 text-white" />
            </div>
            <CardTitle className="text-3xl font-bold bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent">
              Set Up Your Restaurant
            </CardTitle>
            <CardDescription className="text-gray-600 text-lg">
              Tell us about your restaurant to get started with AR menus
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Image Upload */}
              <div className="space-y-2">
                <Label className="text-sm font-semibold text-gray-700">Restaurant Image (Optional)</Label>
                <div className="flex items-center space-x-3">
                  <label className="cursor-pointer">
                    <input ref={imageFileRef} type="file" accept="image/*" className="hidden" onChange={(e) => setFormData({ ...formData, image_filename: e.target.files?.[0]?.name || '' })} />
                    <div className="px-3 py-2 border rounded bg-white hover:bg-gray-50">Choose Image</div>
                  </label>
                  <p className="text-xs text-gray-500">Add a Image for your Restaurant Identity</p>
                  {formData.image_filename && (
                    <span className="text-xs text-gray-600">{formData.image_filename}</span>
                  )}
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="name" className="text-sm font-semibold text-gray-700">
                  Restaurant Name *
                </Label>
                <div className="relative">
                  <Building className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    id="name"
                    name="name"
                    type="text"
                    required
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="Enter restaurant name"
                    className="pl-10 h-12 border-gray-200 focus:border-orange-500 focus:ring-orange-500 rounded-lg"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description" className="text-sm font-semibold text-gray-700">
                  Description
                </Label>
                <div className="relative">
                  <FileText className="absolute left-3 top-3 text-gray-400 w-4 h-4" />
                  <Textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    placeholder="Tell customers about your restaurant..."
                    className="pl-10 min-h-[100px] border-gray-200 focus:border-orange-500 focus:ring-orange-500 rounded-lg resize-none"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="address" className="text-sm font-semibold text-gray-700">
                  Address
                </Label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    id="address"
                    name="address"
                    type="text"
                    value={formData.address}
                    onChange={handleInputChange}
                    placeholder="Enter restaurant address"
                    className="pl-10 h-12 border-gray-200 focus:border-orange-500 focus:ring-orange-500 rounded-lg"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone" className="text-sm font-semibold text-gray-700">
                  Phone Number
                </Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    id="phone"
                    name="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => {
                      const digitsOnly = e.target.value.replace(/[^0-9+\-\s()]/g, '');
                      setFormData({ ...formData, phone: digitsOnly });
                    }}
                    placeholder="Enter phone number"
                    className="pl-10 h-12 border-gray-200 focus:border-orange-500 focus:ring-orange-500 rounded-lg"
                  />
                </div>
              </div>

              <div className="pt-6">
                <Button
                  type="submit"
                  disabled={loading || !formData.name.trim()}
                  className="w-full h-12 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-semibold rounded-lg transform transition-all duration-200 hover:scale-105 shadow-lg hover:shadow-xl"
                >
                  {loading ? (
                    <div className="flex items-center justify-center">
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                      Creating Restaurant...
                    </div>
                  ) : (
                    <div className="flex items-center justify-center">
                      Create Restaurant
                      <ArrowRight className="ml-2 w-4 h-4" />
                    </div>
                  )}
                </Button>
              </div>

              <div className="text-center pt-4">
                <p className="text-sm text-gray-500">
                  After creating your restaurant, you'll be able to add menu items and generate QR codes
                </p>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}