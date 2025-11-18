import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../../App';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from '../ui/card';
import { Badge } from '../ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from '../ui/dialog';
import { toast } from 'sonner';
import { 
  Plus, 
  ArrowLeft, 
  UtensilsCrossed, 
  Edit, 
  Trash2, 
  QrCode,
  Eye,
  DollarSign,
  Camera,
  Video,
  Box,
  Upload
} from 'lucide-react';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const CATEGORIES = [
  { value: 'starters', label: 'Starters' },
  { value: 'main_course', label: 'Main Course' },
  { value: 'desserts', label: 'Desserts' },
  { value: 'drinks', label: 'Drinks' }
];

const PREVIEW_TYPES = [
  { value: '3d_model', label: '3D Model', icon: Box },
  { value: '360_video', label: '360° Video', icon: Video },
  { value: '2d_image', label: '2D Image', icon: Camera },
  { value: 'custom', label: 'Custom Upload', icon: Upload }
];

const CURRENCIES = [
  { value: 'INR', label: '₹ INR (Indian Rupee)', symbol: '₹', step: 100 },
  { value: 'USD', label: '$ USD (US Dollar)', symbol: '$', step: 1 },
  { value: 'EUR', label: '€ EUR (Euro)', symbol: '€', step: 1 },
  { value: 'GBP', label: '£ GBP (British Pound)', symbol: '£', step: 1 }
];

export default function FoodItemManager() {
  const { restaurantId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [restaurant, setRestaurant] = useState(null);
  const [foodItems, setFoodItems] = useState([]);
  const [foodLibraryItems, setFoodLibraryItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [librarySearchTerm, setLibrarySearchTerm] = useState('');
  const [libraryCategoryFilter, setLibraryCategoryFilter] = useState('all');
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    currency: 'INR',
    category: '',
    preview_type: '3d_model',
    preview_url: '',
    library_item_id: ''
  });

  useEffect(() => {
    fetchRestaurant();
    fetchFoodItems();
    fetchFoodLibraryItems();
  }, [restaurantId]);

  const fetchRestaurant = async () => {
    try {
      const response = await axios.get(`${API}/restaurants/${restaurantId}`);
      setRestaurant(response.data);
    } catch (error) {
      console.error('Error fetching restaurant:', error);
      toast.error('Failed to load restaurant');
      navigate('/dashboard');
    }
  };

  const fetchFoodItems = async () => {
    try {
      const response = await axios.get(`${API}/restaurants/${restaurantId}/food-items`);
      setFoodItems(response.data);
    } catch (error) {
      console.error('Error fetching food items:', error);
      toast.error('Failed to load food items');
    } finally {
      setLoading(false);
    }
  };

  const fetchFoodLibraryItems = async () => {
    try {
      const response = await axios.get(`${API}/food-library`);
      setFoodLibraryItems(response.data);
    } catch (error) {
      console.error('Error fetching food library items:', error);
      // Don't show error toast as this is optional
    }
  };

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSelectChange = (field, value) => {
    setFormData({
      ...formData,
      [field]: value
    });
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      price: '',
      currency: 'INR',
      category: '',
      preview_type: '3d_model',
      preview_url: '',
      library_item_id: ''
    });
    setEditingItem(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.library_item_id) {
      toast.error("Please select a food library item.");
      return;
    }

    try {
      const submitData = {
        ...formData,
        price: parseFloat(formData.price)
      };

      if (editingItem) {
        // Update existing item
        await axios.put(`${API}/restaurants/${restaurantId}/food-items/${editingItem.id}`, submitData);
        toast.success('Food item updated successfully!');
      } else {
        // Create new item
        await axios.post(`${API}/restaurants/${restaurantId}/food-items`, submitData);
        toast.success('Food item created successfully!');
      }
      
      setShowAddDialog(false);
      resetForm();
      fetchFoodItems();
    } catch (error) {
      console.error('Error saving food item:', error);
      toast.error(error.response?.data?.detail || 'Failed to save food item');
    }
  };

  const handleEdit = (item) => {
    setFormData({
      name: item.name,
      description: item.description,
      price: item.price.toString(),
      currency: item.currency || 'INR',
      category: item.category,
      preview_type: item.preview_type,
      preview_url: item.preview_url || '',
      library_item_id: item.library_item_id || ''
    });
    setEditingItem(item);
    setShowAddDialog(true);
  };

  const handleDelete = async (itemId) => {
    if (window.confirm('Are you sure you want to delete this food item?')) {
      try {
        await axios.delete(`${API}/restaurants/${restaurantId}/food-items/${itemId}`);
        toast.success('Food item deleted successfully!');
        fetchFoodItems();
      } catch (error) {
        console.error('Error deleting food item:', error);
        toast.error('Failed to delete food item');
      }
    }
  };

  const getPreviewIcon = (type) => {
    const previewType = PREVIEW_TYPES.find(p => p.value === type);
    return previewType ? previewType.icon : Box;
  };

  const getCurrencySymbol = (currency) => {
    const currencyData = CURRENCIES.find(c => c.value === currency);
    return currencyData ? currencyData.symbol : '₹';
  };

  const getCurrencyStep = (currency) => {
    const currencyData = CURRENCIES.find(c => c.value === currency);
    return currencyData ? currencyData.step : 1;
  };

  const handleLibraryItemSelect = (libraryItemId) => {
    if (libraryItemId && libraryItemId !== 'none') {
      const libraryItem = foodLibraryItems.find(item => item.id === libraryItemId);
      if (libraryItem) {
        setFormData({
          ...formData,
          library_item_id: libraryItemId,
          preview_type: formData.preview_type, // Keep current preview type
          preview_url: getPreviewUrlForType(libraryItem, formData.preview_type)
        });
      }
    } else {
      setFormData({
        ...formData,
        library_item_id: '',
        preview_url: ''
      });
    }
  };

  const getPreviewUrlForType = (libraryItem, previewType) => {
    switch (previewType) {
      case '3d_model':
        return libraryItem.model_glb_url || libraryItem.file_url || '';
      case '360_video':
        return libraryItem.video_url || '';
      case '2d_image':
        return libraryItem.image_url || libraryItem.thumbnail_url || '';
      default:
        return libraryItem.model_url || libraryItem.file_url || '';
    }
  };

  const handlePreviewTypeChange = (previewType) => {
    const newPreviewUrl = formData.library_item_id ? 
      getPreviewUrlForType(
        foodLibraryItems.find(item => item.id === formData.library_item_id), 
        previewType
      ) : '';
    
    setFormData({
      ...formData,
      preview_type: previewType,
      preview_url: newPreviewUrl
    });
  };

  const getFilteredLibraryItems = () => {
    return foodLibraryItems.filter(item => {
      const matchesSearch = item.name.toLowerCase().includes(librarySearchTerm.toLowerCase()) ||
                           item.category.toLowerCase().includes(librarySearchTerm.toLowerCase());
      const matchesCategory = libraryCategoryFilter === 'all' || item.category === libraryCategoryFilter;
      return matchesSearch && matchesCategory;
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading menu items...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50 dark:bg-background dark:bg-none">
      {/* Header */}
      <div className="bg-white/80 dark:bg-card/80 backdrop-blur-sm border-b border-orange-100 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-center py-3 sm:py-6 gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate('/dashboard')}
              className="self-start mr-4 border-orange-200 text-orange-700 hover:bg-orange-50"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Dashboard
            </Button>
            <div className="flex items-center sm:flex-1">
              <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-amber-500 rounded-lg flex items-center justify-center sm:mr-4 mr-2">
                <UtensilsCrossed className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-foreground">Menu Management</h1>
                <p className="text-gray-600 dark:text-muted-foreground">{restaurant?.name}</p>
              </div>
            </div>
            <div className="self-end flex items-center justify-between space-x-3">
              <Link to={`/restaurant/${restaurantId}/qr-codes`}>
                <Button variant="outline" className="border-orange-200 text-orange-700 hover:bg-orange-50">
                  <QrCode className="w-4 h-4 mr-2" />
                  QR Codes
                </Button>
              </Link>
              <Link to="/food-library">
                <Button variant="outline" className="border-blue-200 text-blue-700 hover:bg-blue-50">
                  <Eye className="w-4 h-4 mr-2" />
                  Food Library
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Actions Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Menu Items</h2>
            <p className="text-gray-600">Manage your restaurant's AR-enabled menu</p>
          </div>
          <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
            <DialogTrigger asChild>
              <Button 
                className="bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white"
                onClick={() => {
                  resetForm();
                  setShowAddDialog(true);
                }}
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Menu Item
              </Button>
            </DialogTrigger>
            <DialogContent className="w-[95vw] sm:w-auto sm:max-w-2xl p-4 sm:p-6 max-h-[85vh] overflow-y-auto z-[60]">
              <DialogHeader>
                <DialogTitle>
                  {editingItem ? 'Edit Menu Item' : 'Add New Menu Item'}
                </DialogTitle>
                <DialogDescription>
                  Create an AR-enabled menu item for your restaurant
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Item Name *</Label>
                    <Input
                      id="name"
                      name="name"
                      required
                      value={formData.name}
                      onChange={handleInputChange}
                      placeholder="Enter item name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="price">Price *</Label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm font-medium">
                        {getCurrencySymbol(formData.currency)}
                      </span>
                      <Input
                        id="price"
                        name="price"
                        type="number"
                        step={getCurrencyStep(formData.currency)}
                        required
                        value={formData.price}
                        onChange={handleInputChange}
                        placeholder="0"
                        className="pl-8"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Currency</Label>
                  <Select
                    value={formData.currency}
                    onValueChange={(value) => handleSelectChange('currency', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select currency" />
                    </SelectTrigger>
                    <SelectContent className="z-[70]">
                      {CURRENCIES.map((currency) => (
                        <SelectItem key={currency.value} value={currency.value}>
                          {currency.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    placeholder="Describe your food item..."
                    rows={3}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Select from Food Library</Label>
                  <Select
                  required
                    value={formData.library_item_id || ''}
                    onValueChange={handleLibraryItemSelect}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Choose from food library or leave empty for custom" />
                    </SelectTrigger>
                    <SelectContent className="z-[70]">
                      <SelectItem value="none" disabled>Custom Item (No Library Selection)</SelectItem>
                      {getFilteredLibraryItems().map((item) => (
                        <SelectItem key={item.id} value={item.id}>
                          <div className="flex items-center">
                            <img 
                              src={item.thumbnail_url || item.image_url} 
                              alt={item.name}
                              className="w-6 h-6 rounded mr-2 object-cover"
                              onError={(e) => {
                                e.target.style.display = 'none';
                              }}
                            />
                            {item.name} - {item.category}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  
                  {/* Search and Filter Controls */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-2">
                    <div className="space-y-1">
                      <Label htmlFor="library-search" className="text-xs">Search Library Items</Label>
                      <Input
                        id="library-search"
                        placeholder="Search by name or category..."
                        value={librarySearchTerm}
                        onChange={(e) => setLibrarySearchTerm(e.target.value)}
                        className="h-8 text-sm"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Filter by Category</Label>
                      <Select
                        value={libraryCategoryFilter}
                        onValueChange={setLibraryCategoryFilter}
                      >
                        <SelectTrigger className="h-8 text-sm">
                          <SelectValue placeholder="All Categories" />
                        </SelectTrigger>
                        <SelectContent className="z-[70]">
                          <SelectItem value="all">All Categories</SelectItem>
                          {CATEGORIES.map((category) => (
                            <SelectItem key={category.value} value={category.value}>
                              {category.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Preview Type</Label>
                  <Select
                    value={formData.preview_type}
                    onValueChange={handlePreviewTypeChange}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select preview type" />
                    </SelectTrigger>
                    <SelectContent className="z-[70]">
                      {PREVIEW_TYPES.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          <div className="flex items-center">
                            <type.icon className="w-4 h-4 mr-2" />
                            {type.label}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {formData.preview_type === 'custom' && (
                  <div className="space-y-2">
                    <Label htmlFor="preview_url">Custom Preview URL</Label>
                    <Input
                      id="preview_url"
                      name="preview_url"
                      value={formData.preview_url}
                      onChange={handleInputChange}
                      placeholder="https://example.com/model.glb"
                    />
                  </div>
                )}

                <div className="flex justify-end space-x-3 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowAddDialog(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    className="bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white"
                  >
                    {editingItem ? 'Update Item' : 'Create Item'}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Food Items Grid */}
        {foodItems.length === 0 ? (
          <Card className="bg-white/80 backdrop-blur-sm border-orange-100">
            <CardContent className="p-12 text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <UtensilsCrossed className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No menu items yet</h3>
              <p className="text-gray-600 mb-6">Start by adding your first AR-enabled menu item</p>
              <Button
                onClick={() => {
                  resetForm();
                  setShowAddDialog(true);
                }}
                className="bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Menu Item
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {foodItems.map((item) => {
              const PreviewIcon = getPreviewIcon(item.preview_type);
              // Get the library item's category if the menu item is from library
              const libraryItem = item.library_item_id ? 
                foodLibraryItems.find(libItem => libItem.id === item.library_item_id) : null;
              const displayCategory = libraryItem ? libraryItem.category : item.category;
              
              return (
                <Card key={item.id} className="bg-white/80 backdrop-blur-sm border-orange-100 hover:shadow-lg transition-all duration-200">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-lg font-semibold text-gray-900 mb-1">
                          {item.name}
                        </CardTitle>
                        <div className="flex items-center space-x-2 mb-2">
                          <Badge variant="secondary" className="bg-orange-100 text-orange-700">
                            {CATEGORIES.find(c => c.value === displayCategory)?.label || displayCategory}
                          </Badge>
                          <Badge variant="outline" className="border-blue-200 text-blue-700">
                            <PreviewIcon className="w-3 h-3 mr-1" />
                            {PREVIEW_TYPES.find(p => p.value === item.preview_type)?.label}
                          </Badge>
                        </div>
                        <div className="flex items-center text-lg font-bold text-green-600">
                          <span className="text-sm mr-1">{getCurrencySymbol(item.currency || 'INR')}</span>
                          {item.price}
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                      {item.description}
                    </p>
                    {item.library_item_id && (
                      <div className="mb-3 p-2 bg-blue-50 rounded-lg border border-blue-200">
                        <div className="flex items-center text-xs text-blue-700">
                          <Eye className="w-3 h-3 mr-1" />
                          <span>From Food Library</span>
                        </div>
                      </div>
                    )}
                    <div className="space-y-2">
                      <Button
                        size="sm"
                        className="w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white text-xs"
                        onClick={() => window.open(`/ar/${item.id}`, '_blank')}
                      >
                        <UtensilsCrossed className="w-3 h-3 mr-1" />
                        Order Now
                      </Button>
                      <div className="grid grid-cols-3 gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleEdit(item)}
                          className="text-xs"
                        >
                          <Edit className="w-3 h-3 mr-1" />
                          Edit
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => window.open(`/ar/${item.id}`, '_blank')}
                          className="text-xs border-blue-200 text-blue-700 hover:bg-blue-50"
                        >
                          <Eye className="w-3 h-3 mr-1" />
                          AR View
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDelete(item.id)}
                          className="text-xs border-red-200 text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="w-3 h-3 mr-1" />
                          Delete
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}