import React, { useState, useEffect, useMemo } from 'react';
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
import { useConfirm } from '../ui/ConfirmDialog';
import { cn } from '../../lib/utils';
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
  const { confirmDialog, ConfirmDialogUI } = useConfirm();
  const [restaurant, setRestaurant] = useState(null);
  const [foodItems, setFoodItems] = useState([]);
  const [foodLibraryItems, setFoodLibraryItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [librarySearchTerm, setLibrarySearchTerm] = useState('');
  const [libraryCategoryFilter, setLibraryCategoryFilter] = useState('all');
  const [isOtherCategory, setIsOtherCategory] = useState(false);
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

  const filteredLibraryItems = useMemo(() => {
    return foodLibraryItems.filter(item => {
      const matchesSearch = item.name.toLowerCase().includes(librarySearchTerm.toLowerCase()) ||
                           item.category.toLowerCase().includes(librarySearchTerm.toLowerCase());
      const matchesCategory = libraryCategoryFilter === 'all' || String(item.category).toLowerCase().replace(/\s+/g, "_") === libraryCategoryFilter;
      return matchesSearch && matchesCategory;
    });
  }, [foodLibraryItems, librarySearchTerm, libraryCategoryFilter]);

  // Memoize the library select items to improve rendering performance
  const memoizedLibrarySelectItems = useMemo(() => {
    // Limit to first 100 items for performance, but ensure the currently selected item is included
    let itemsToRender = filteredLibraryItems.slice(0, 100);
    
    if (formData.library_item_id && formData.library_item_id !== 'none') {
      const isAlreadyInList = itemsToRender.some(i => String(i.id) === String(formData.library_item_id));
      if (!isAlreadyInList) {
        const selectedItem = foodLibraryItems.find(i => String(i.id) === String(formData.library_item_id));
        if (selectedItem) {
          itemsToRender = [selectedItem, ...itemsToRender];
        }
      }
    }

    return itemsToRender.map((item) => (
      <SelectItem key={item.id} value={item.id} className="dark:text-foreground">
        <div className="flex items-center">
          <img 
            src={item.thumbnail_url || item.image_url} 
            alt={item.name}
            className="w-6 h-6 rounded mr-2 object-cover border dark:border-border"
            loading="lazy"
            onError={(e) => {
              e.target.style.display = 'none';
            }}
          />
          {item.name} - {item.category.replace(/_/g, " ")}
        </div>
      </SelectItem>
    ));
  }, [filteredLibraryItems, formData.library_item_id, foodLibraryItems]);

  useEffect(() => {
    fetchRestaurant();
    fetchFoodItems();
    fetchFoodLibraryItems();
  }, [restaurantId]);

  useEffect(() => {
    if (!editingItem) return;
    if (foodLibraryItems.length === 0) return;

    const id = String(editingItem.library_item_id || "");
    const exists = foodLibraryItems.some(lib => lib.id === id);

    setFormData(prev => ({
      ...prev,
      library_item_id: exists ? id : ""
    }));
  }, [editingItem, foodLibraryItems]);



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
      setFoodLibraryItems(response.data.map(item => ({
        ...item,
        id: String(item.id),
        category: item.category
          ? item.category.toLowerCase().replace(/\s+/g, "_")
          : ""
      }))
    );
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
    setIsOtherCategory(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // If it's not a custom preview, we MUST have a library item selected
    if (formData.preview_type !== 'custom' && (!formData.library_item_id || formData.library_item_id === 'none')) {
      toast.error("Please select a food library item or switch to Custom Upload.");
      return;
    }

    // If it's a custom preview, we MUST have a URL
    if (formData.preview_type === 'custom' && !formData.preview_url) {
      toast.error("Please provide a custom preview URL.");
      return;
    }

    let detectedType = formData.preview_type;

    if (formData.preview_type === "custom" && formData.preview_url) {
      const url = formData.preview_url.toLowerCase();

      if (url.endsWith(".glb")) {
        detectedType = "3d_model";
      } else if (url.endsWith(".mp4")) {
        detectedType = "360_video";
      } else {
        detectedType = "2d_image";
      }
    }

    // Normalize category to Title Case for consistency and case-insensitive matching
    const normalizedCategory = formData.category
      .trim()
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');

    try {
      const submitData = {
        ...formData,
        category: normalizedCategory,
        preview_type: detectedType,
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
    // If it's a custom item (no library id), we want to show it as 'custom' preview type in the form
    // so the URL field is visible and editable.
    const isCustom = !item.library_item_id;
    
    setFormData({
      name: item.name,
      description: item.description,
      price: item.price.toString(),
      currency: item.currency || 'INR',
      category: item.category,
      preview_type: isCustom ? 'custom' : item.preview_type,
      // Only show preview_url in the custom field if it was already a custom upload
      preview_url: isCustom ? (item.preview_url || '') : '',
      library_item_id : item.library_item_id ? String(item.library_item_id) : ""
    });
    setEditingItem(item);
    
    // Check if the item's category is one of the standard ones
    const isStandard = CATEGORIES.some(cat => cat.label === item.category) || 
                       [...new Set(foodItems.map(i => i.category))].includes(item.category);
    setIsOtherCategory(!isStandard && item.category !== "");
    
    setShowAddDialog(true);
    // console.log("library items:", foodLibraryItems.length, "value:", formData.library_item_id);
    // console.log("All library IDs:", foodLibraryItems.map(i => i.id));
    // console.log("Editing ID:", item.library_item_id);
  };

  const handleDelete = async (itemId) => {
    const confirmed = await confirmDialog({
      title: 'Delete Menu Item',
      message: 'Are you sure you want to delete this food item? This action cannot be undone.',
      confirmLabel: 'Delete',
      variant: 'destructive',
    });
    if (confirmed) {
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
  const idStr = String(libraryItemId);

  if (idStr && idStr !== "none") {
    const libraryItem = foodLibraryItems.find(item => String(item.id) === idStr);

    if (libraryItem) {
      // If we select a library item, we default to its preferred preview type (usually 3d_model)
      // and hide the custom URL field (since preview_type won't be 'custom')
      const initialPreviewType = libraryItem.model_glb_url ? '3d_model' : 
                                libraryItem.video_url ? '360_video' : '2d_image';
      
      setFormData({
        ...formData,
        library_item_id: idStr,
        preview_type: initialPreviewType,
        preview_url: getPreviewUrlForType(libraryItem, initialPreviewType)
      });

      // auto-set filter so the selected item remains visible
      setLibraryCategoryFilter(libraryItem.category);
    }
  } else {
    setFormData({
      ...formData,
      library_item_id: "",
      preview_type: 'custom', // Default to custom when no library item is selected
      preview_url: editingItem?.preview_url || "" // Pre-fill with existing URL if editing
    });
    setLibraryCategoryFilter("all");
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
        return libraryItem.model_glb_url || libraryItem.file_url || '';
    }
  };

  const handlePreviewTypeChange = (previewType) => {
    let newPreviewUrl = formData.preview_url;
    let newLibraryItemId = formData.library_item_id;
    
    if (previewType === 'custom') {
      // Switching TO custom upload: clear library selection and URL
      newLibraryItemId = ""; 
      newPreviewUrl = "";
    } else if (previewType !== 'custom') {
      // If switching away from custom, try to get the URL from the selected library item
      if (formData.library_item_id) {
        const libraryItem = foodLibraryItems.find(item => String(item.id) === String(formData.library_item_id));
        if (libraryItem) {
          newPreviewUrl = getPreviewUrlForType(libraryItem, previewType);
        }
      }
    } 
    
    setFormData({
      ...formData,
      preview_type: previewType,
      preview_url: newPreviewUrl,
      library_item_id: newLibraryItemId
    });
  };


  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50 dark:from-background dark:via-background dark:to-muted flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto mb-4">
          </div>
          <p className="text-gray-600 dark:text-muted-foreground">Loading menu items...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50 dark:from-background dark:via-background dark:to-muted">
      {/* Header */}
      <div className="bg-white/80 dark:bg-card/80 backdrop-blur-sm border-b border-orange-100 dark:border-border sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-center py-3 sm:py-6 gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate('/dashboard')}
              className="self-start mr-4 border-orange-200 dark:border-border text-orange-700 dark:text-orange-400 hover:bg-orange-50 dark:hover:bg-orange-950/20"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Button>
            <div className="flex items-center sm:flex-1">
              <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-amber-500 rounded-lg flex items-center justify-center sm:mr-4 mr-2">
                <UtensilsCrossed className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent">
                  Menu Manager
                </h1>
                <p className="text-gray-600 dark:text-muted-foreground">{restaurant?.name}</p>
              </div>
            </div>
            <div className="self-end flex items-center justify-between space-x-3">
              <Link to={`/restaurant/${restaurantId}/qr-codes`}>
                <Button variant="outline" className="border-orange-200 dark:border-border text-orange-700 dark:text-orange-400 hover:bg-orange-50 dark:hover:bg-orange-950/20">
                  <QrCode className="w-4 h-4 mr-2" />
                  QR Codes
                </Button>
              </Link>
              <Link to="/food-library">
                <Button variant="outline" className="border-blue-200 dark:border-blue-900/50 text-blue-700 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/20">
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
            <h2 className="text-xl font-semibold text-gray-900 dark:text-foreground">Menu Items</h2>
            <p className="text-gray-600 dark:text-muted-foreground">Manage your restaurant's AR-enabled menu</p>
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
            <DialogContent className="w-[95vw] sm:w-auto sm:max-w-2xl p-0 z-[60] bg-white dark:bg-card border dark:border-border">
              <DialogHeader className="pt-4 pl-4">
                <DialogTitle className="dark:text-foreground">
                  {editingItem ? 'Edit Menu Item' : 'Add New Menu Item'}
                </DialogTitle>
                <DialogDescription className="dark:text-muted-foreground">
                  Create an AR-enabled menu item for your restaurant
                </DialogDescription>
              </DialogHeader>
              <div className="max-h-[75vh] overflow-y-auto px-4 sm:px-6 py-4">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name" className="dark:text-foreground">Item Name *</Label>
                    <Input
                      id="name"
                      name="name"
                      required
                      value={formData.name}
                      onChange={handleInputChange}
                      placeholder="Enter item name"
                      className="dark:bg-muted dark:border-border dark:text-foreground"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="price" className="dark:text-foreground">Price *</Label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-muted-foreground text-sm font-medium">
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
                        className="pl-8 dark:bg-muted dark:border-border dark:text-foreground"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="dark:text-foreground">Currency</Label>
                  <Select
                    value={formData.currency}
                    onValueChange={(value) => handleSelectChange('currency', value)}
                  >
                    <SelectTrigger className="dark:bg-muted dark:border-border dark:text-foreground">
                      <SelectValue placeholder="Select currency" />
                    </SelectTrigger>
                    <SelectContent className="z-[70] dark:bg-card dark:border-border">
                      {CURRENCIES.map((currency) => (
                        <SelectItem key={currency.value} value={currency.value} className="dark:text-foreground">
                          {currency.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description" className="dark:text-foreground">Description</Label>
                  <Textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    placeholder="Describe your food item..."
                    rows={3}
                    className="dark:bg-muted dark:border-border dark:text-foreground"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="dark:text-foreground">Select from Food Library</Label>
                  <Select
                  required
                    value={formData.library_item_id || 'none'}
                    onValueChange={handleLibraryItemSelect}
                  >
                    <SelectTrigger className="dark:bg-muted dark:border-border dark:text-foreground">
                      <SelectValue placeholder="Choose from food library or leave empty for custom" />
                    </SelectTrigger>
                    <SelectContent className="z-[70] dark:bg-card dark:border-border max-h-[300px]">
                      <SelectItem value="none" className="dark:text-foreground">Custom Item (No Library Selection)</SelectItem>
                      {memoizedLibrarySelectItems}
                    </SelectContent>
                  </Select>
                  
                  {/* Search and Filter Controls */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-2">
                    <div className="space-y-1">
                      <Label htmlFor="library-search" className="text-xs dark:text-muted-foreground">
                        Search Library Items {filteredLibraryItems.length > 100 ? `(showing top 100 of ${filteredLibraryItems.length})` : ''}
                      </Label>
                      <Input
                        id="library-search"
                        placeholder="Search by name or category..."
                        value={librarySearchTerm}
                        onChange={(e) => setLibrarySearchTerm(e.target.value)}
                        className="h-8 text-sm dark:bg-muted dark:border-border dark:text-foreground"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs dark:text-muted-foreground">Filter by Category</Label>
                      <Select
                        value={libraryCategoryFilter}
                        onValueChange={setLibraryCategoryFilter}
                      >
                        <SelectTrigger className="h-8 text-sm dark:bg-muted dark:border-border dark:text-foreground">
                          <SelectValue placeholder="All Categories" />
                        </SelectTrigger>
                        <SelectContent className="z-[70] dark:bg-card dark:border-border">
                          <SelectItem value="all" className="dark:text-foreground">All Categories</SelectItem>
                          {CATEGORIES.map((category) => (
                            <SelectItem key={category.value} value={category.value} className="dark:text-foreground">
                              {category.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="category" className="dark:text-foreground">Category / Collection *</Label>
                    <Select
                      value={isOtherCategory ? "other" : (formData.category || "select_placeholder")}
                      onValueChange={(value) => {
                        if (value === "other") {
                          setIsOtherCategory(true);
                          setFormData({ ...formData, category: "" });
                        } else if (value === "select_placeholder") {
                          setIsOtherCategory(false);
                          setFormData({ ...formData, category: "" });
                        } else {
                          setIsOtherCategory(false);
                          setFormData({ ...formData, category: value });
                        }
                      }}
                    >
                      <SelectTrigger className="border-orange-200 dark:border-border focus:ring-orange-500 dark:bg-muted dark:text-foreground">
                        <SelectValue placeholder="Select a collection" />
                      </SelectTrigger>
                      <SelectContent className="z-[70] dark:bg-card dark:border-border">
                        <SelectItem value="select_placeholder" className="text-gray-400 italic dark:text-muted-foreground">
                          Select a collection...
                        </SelectItem>
                        {/* Standard Categories */}
                        {CATEGORIES.map((cat) => (
                          <SelectItem key={cat.value} value={cat.label} className="dark:text-foreground">
                            {cat.label}
                          </SelectItem>
                        ))}
                        
                        {/* Existing Custom Categories from Food Items */}
                        {[...new Set(foodItems.map(item => item.category))]
                          .filter(cat => cat && cat.trim() !== "" && !CATEGORIES.some(c => c.label === cat))
                          .map(cat => (
                            <SelectItem key={cat} value={cat} className="dark:text-foreground">
                              {cat}
                            </SelectItem>
                          ))
                        }
                        
                        <SelectItem value="other" className="text-orange-600 dark:text-orange-400 font-medium border-t border-orange-50 dark:border-border mt-1">
                          + Add New Collection
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    
                    {isOtherCategory && (
                      <div className="mt-2 animate-in fade-in slide-in-from-top-1 duration-200">
                        <Label htmlFor="custom-category" className="text-xs text-orange-600 dark:text-orange-400 font-medium">New Collection Name</Label>
                        <Input
                          id="custom-category"
                          name="category"
                          required
                          value={formData.category}
                          onChange={handleInputChange}
                          placeholder="e.g. Signature Specials"
                          className="border-orange-300 dark:border-orange-900/50 focus:border-orange-500 focus:ring-orange-500 h-9 text-sm mt-1 dark:bg-muted dark:text-foreground"
                          autoFocus
                        />
                      </div>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label className="dark:text-foreground">Preview Type</Label>
                    <Select
                      value={formData.preview_type}
                      onValueChange={handlePreviewTypeChange}
                    >
                      <SelectTrigger className="dark:bg-muted dark:border-border dark:text-foreground">
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent className="z-[70] dark:bg-card dark:border-border">
                        {PREVIEW_TYPES.map((type) => (
                          <SelectItem key={type.value} value={type.value} className="dark:text-foreground">
                            <div className="flex items-center">
                              <type.icon className="w-4 h-4 mr-2" />
                              {type.label}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {formData.preview_type === 'custom' && (
                  <div className="space-y-2">
                    <Label htmlFor="preview_url" className="dark:text-foreground">Custom Preview URL</Label>
                    <Input
                      id="preview_url"
                      name="preview_url"
                      value={formData.preview_url}
                      onChange={handleInputChange}
                      placeholder="Use .glb for 3D, .mp4 for video, and any format for images"
                      className="dark:bg-muted dark:border-border dark:text-foreground"
                    />
                  </div>
                )}

                <div className="flex justify-end space-x-3 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowAddDialog(false)}
                    className="dark:border-border dark:text-foreground"
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
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Food Items Grid */}
        {foodItems.length === 0 ? (
          <Card className="bg-white/80 dark:bg-card/80 backdrop-blur-sm border-orange-100 dark:border-border">
            <CardContent className="p-12 text-center">
              <div className="w-16 h-16 bg-gray-100 dark:bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                <UtensilsCrossed className="w-8 h-8 text-gray-400 dark:text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-foreground mb-2">No menu items yet</h3>
              <p className="text-gray-600 dark:text-muted-foreground mb-6">Start by adding your first AR-enabled menu item</p>
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
                foodLibraryItems.find(libItem => String(libItem.id) === String(item.library_item_id)) : null;
              const rawCategory = libraryItem ? libraryItem.category : item.category;
              const displayCategory = libraryItem ? libraryItem.category : item.category;
              
              return (
                <Card key={item.id} className="bg-white/80 dark:bg-card/80 backdrop-blur-sm border-orange-100 dark:border-border hover:shadow-lg transition-all duration-200">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-lg font-semibold text-gray-900 dark:text-foreground mb-1">
                          {item.name}
                        </CardTitle>
                        <div className="flex items-center space-x-2 mb-2">
                          <Badge variant="secondary" className="bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400 border-none">
                            {item.library_item_id
                            ? (CATEGORIES.find(c => c.value === displayCategory)?.label || displayCategory)
                            : "Custom"}
                          </Badge>
                          <Badge variant="outline" className="border-blue-200 dark:border-blue-900/50 text-blue-700 dark:text-blue-400">
                            <PreviewIcon className="w-3 h-3 mr-1" />
                            {PREVIEW_TYPES.find(p => p.value === item.preview_type)?.label}
                            {!item.library_item_id && <sup className="ml-0.5 text-[8px] font-bold">c</sup>}
                          </Badge>
                        </div>
                        <div className="flex items-center text-lg font-bold text-green-600 dark:text-green-400">
                          <span className="text-sm mr-1">{getCurrencySymbol(item.currency || 'INR')}</span>
                          {item.price}
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600 dark:text-muted-foreground text-sm mb-4 line-clamp-2">
                      {item.description}
                    </p>
                      <div className="mb-3 p-2 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-900/50">
                        <div className="flex items-center text-xs text-blue-700 dark:text-blue-400">
                          <Eye className="w-3 h-3 mr-1" />
                          <span>{item.library_item_id ? "From Food Library" : "Custom Added"}</span>
                        </div>
                      </div>
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
                          className="text-xs dark:border-border dark:text-muted-foreground dark:hover:text-foreground"
                        >
                          <Edit className="w-3 h-3 mr-1" />
                          Edit
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => window.open(`/ar/${item.id}`, '_blank')}
                          className="text-xs border-blue-200 dark:border-blue-900/50 text-blue-700 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/20"
                        >
                          <Eye className="w-3 h-3 mr-1" />
                          AR View
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDelete(item.id)}
                          className="text-xs border-red-200 dark:border-red-900/50 text-red-700 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/20"
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
      <ConfirmDialogUI />
    </div>
  );
}