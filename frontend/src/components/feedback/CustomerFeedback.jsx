import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
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
import { 
  ArrowLeft, 
  MessageSquare, 
  Star, 
  Plus, 
  Edit, 
  Trash2,
  Filter,
  Search,
  ThumbsUp,
  ThumbsDown,
  Clock,
  User,
  Building,
  Upload,
  Image,
  X,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { cn } from '../../lib/utils';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const RATING_OPTIONS = [
  { value: 5, label: '5 Stars - Excellent', icon: '⭐⭐⭐⭐⭐' },
  { value: 4, label: '4 Stars - Very Good', icon: '⭐⭐⭐⭐' },
  { value: 3, label: '3 Stars - Good', icon: '⭐⭐⭐' },
  { value: 2, label: '2 Stars - Fair', icon: '⭐⭐' },
  { value: 1, label: '1 Star - Poor', icon: '⭐' }
];

const FEEDBACK_TYPES = [
  { value: 'food_quality', label: 'Food Quality' },
  { value: 'service', label: 'Service' },
  { value: 'ambiance', label: 'Ambiance' },
  { value: 'value_for_money', label: 'Value for Money' },
  { value: 'ar_experience', label: 'AR Experience' },
  { value: 'general', label: 'General' }
];

export default function CustomerFeedback({ 
  restaurantId: propRestaurantId, 
  foodItemId: propFoodItemId, 
  source = 'management',
  formOnly = false,
  onSuccess = null
}) {
  const { restaurantId: urlRestaurantId } = useParams();
  const restaurantId = propRestaurantId || urlRestaurantId;
  const { user } = useAuth();
  const { confirmDialog, ConfirmDialogUI } = useConfirm();
  const [restaurant, setRestaurant] = useState(null);
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddDialog, setShowAddDialog] = useState(source !== 'management' || formOnly);
  const [editingFeedback, setEditingFeedback] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [ratingFilter, setRatingFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  const [uploadingImage, setUploadingImage] = useState(false);
  const [foodItems, setFoodItems] = useState([]);
  
  // Pagination and Filtering
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const [formData, setFormData] = useState({
    customer_name: '',
    customer_email: '',
    rating: '5',
    feedback_type: source === 'ar_viewer' ? 'ar_experience' : 'general',
    title: '',
    message: '',
    image_url: '',
    restaurant_id: restaurantId || '',
    food_item_id: propFoodItemId || ''
  });

  // Check if user has permission to view feedback management features
  const isManagement = source === 'management';
  const canManageFeedback = isManagement && (user?.role === 'super_admin' || user?.role === 'admin');

  useEffect(() => {
    if (restaurantId) {
      fetchRestaurant();
      fetchFeedbacks();
      fetchFoodItems();
    } else {
      // If no restaurantId, get the first restaurant for the user
      fetchUserRestaurants();
    }
  }, [restaurantId]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, ratingFilter, typeFilter, sortBy]);

  const fetchFoodItems = async () => {
    if (!restaurantId) return;
    try {
      // Use public endpoint if not management
      const isPublic = source === 'menu' || source === 'ar_viewer';
      const endpoint = isPublic 
        ? `${API}/public/restaurants/${restaurantId}/food-items` 
        : `${API}/restaurants/${restaurantId}/food-items`;
      
      const response = await axios.get(endpoint);
      console.log('Fetched food items for naming:', response.data);
      setFoodItems(response.data);
    } catch (error) {
      console.error('Error fetching food items:', error);
    }
  };

  const fetchUserRestaurants = async () => {
    try {
      const response = await axios.get(`${API}/restaurants`);
      if (response.data.length > 0) {
        setRestaurant(response.data[0]);
        fetchFeedbacks(response.data[0].id);
      }
    } catch (error) {
      console.error('Error fetching restaurants:', error);
      toast.error('Failed to load restaurants');
    } finally {
      setLoading(false);
    }
  };

  const fetchFeedbacks = async (restId = null) => {
    const restaurantIdToUse = restId || restaurant?.id || restaurantId;
    if (!restaurantIdToUse) return;
    
    try {
      const isPublicView = source === 'menu' || source === 'ar_viewer';
      const endpoint = isPublicView 
        ? `${API}/public/feedback/restaurant/${restaurantIdToUse}` 
        : `${API}/feedback/restaurant/${restaurantIdToUse}`;
        
      const response = await axios.get(endpoint);
      console.log('Fetched feedbacks for management:', response.data);
      setFeedbacks(response.data);
    } catch (error) {
      console.error('Error fetching feedbacks:', error);
      // Only show error if we're in management view
      if (!formOnly && source === 'management') {
        toast.error('Failed to load feedback history');
      }
    }
  };

  const fetchRestaurant = async () => {
    try {
      const isPublic = source === 'menu' || source === 'ar_viewer';
      const endpoint = isPublic ? `${API}/public/restaurants/${restaurantId}` : `${API}/restaurants/${restaurantId}`;
      const response = await axios.get(endpoint);
      setRestaurant(response.data);
    } catch (error) {
      console.error('Error fetching restaurant:', error);
      if (!formOnly && source === 'management') {
        toast.error('Failed to load restaurant details');
      }
    } finally {
      setLoading(false);
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
      customer_name: '',
      customer_email: '',
      rating: '5',
      feedback_type: source === 'ar_viewer' ? 'ar_experience' : 'general',
      title: '',
      message: '',
      image_url: '',
      restaurant_id: restaurant?.id || restaurantId || '',
      food_item_id: propFoodItemId || ''
    });
    setEditingFeedback(null);
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    if (file.size > 5 * 1024 * 1024) { // 5MB limit
      toast.error('Image size must be less than 5MB');
      return;
    }

    setUploadingImage(true);
    try {
       // Avoid shadowing the component state `formData`
      const uploadForm = new FormData();
      uploadForm.append('file', file);

      // Determine if this is a public upload (from menu/ar viewer)
      const isPublic = source === 'menu' || source === 'ar_viewer';
      const endpoint = isPublic ? `${API}/public/feedback/upload-image` : `${API}/feedback/upload-image`;

      // Important: Do not set Content-Type header manually for FormData
      // Axios will automatically set it with the correct boundary
      const headers = {};
      if (!isPublic && user?.token) {
        headers.Authorization = `Bearer ${user.token}`;
      }

      const response = await axios.post(endpoint, uploadForm, { headers });

      // support multiple possible response fields from different backends
      const uploadedPath = response.data?.image_url || response.data?.url || response.data?.path;
      if (!uploadedPath) {
        console.error('Upload response:', response.data);
        throw new Error('Unexpected upload response');
      }

      setFormData(prev => ({
        ...prev,
        image_url: uploadedPath
      }));
      toast.success('Image uploaded successfully!');
    } catch (error) {
      console.error('Error uploading image:', error);
      toast.error('Failed to upload image. Please try a different photo.');
    } finally {
      setUploadingImage(false);
    }
  };

  const removeImage = () => {
    setFormData(prev => ({
      ...prev,
      image_url: ''
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!restaurant || !restaurant.id) {
      toast.error('Restaurant not found. Please refresh the page and try again.');
      return;
    }

    try {
      const submitData = {
        ...formData,
        restaurant_id: restaurant.id,
        rating: parseInt(formData.rating)
      };

      console.log('Submitting feedback:', submitData); // Debug log

      if (editingFeedback) {
        // Update existing feedback (Management only)
        if (!canManageFeedback) {
          toast.error('You do not have permission to edit this feedback.');
          return;
        }
        await axios.put(`${API}/feedback/${editingFeedback.id}`, submitData);
        toast.success('Feedback updated successfully!');
      } else {
        // Create new feedback
        const isPublicSubmission = source === 'menu' || source === 'ar_viewer';
        const endpoint = isPublicSubmission ? `${API}/public/feedback` : `${API}/feedback`;
        
        // Find food item name for caching in feedback if submitted from AR/Menu
        const foodItemIdToUse = propFoodItemId || formData.food_item_id;
        const currentFoodItem = foodItems.find(i => String(i.id) === String(foodItemIdToUse));
        
        await axios.post(endpoint, {
          ...submitData,
          source: source,
          food_item_id: foodItemIdToUse || null,
          food_item_name: currentFoodItem?.name || null
        });
        toast.success('Thank you for your feedback!');
      }
      
      setShowAddDialog(false);
      resetForm();
      if (onSuccess) onSuccess();
      fetchFeedbacks();
    } catch (error) {
      console.error('Error saving feedback:', error);
      console.error('Error response:', error.response?.data);
      const detail = error.response?.data?.detail;
      const message = typeof detail === 'string' 
        ? detail 
        : (error.response?.data?.message || 'Failed to save feedback');
      toast.error(message);
    }
  };

  const handleEdit = (feedback) => {
    setFormData({
      customer_name: feedback.customer_name,
      customer_email: feedback.customer_email,
      rating: feedback.rating?.toString() ?? '5',
      feedback_type: feedback.feedback_type,
      title: feedback.title,
      message: feedback.message,
      image_url: feedback.image_url || '',
      restaurant_id: feedback.restaurant_id
    });
    setEditingFeedback(feedback);
    setShowAddDialog(true);
  };

  const handleDelete = async (feedbackId) => {
    const confirmed = await confirmDialog({
      title: 'Delete Feedback',
      message: 'Are you sure you want to delete this feedback? This action cannot be undone.',
      confirmLabel: 'Delete',
      variant: 'destructive',
    });
    if (confirmed) {
      try {
        await axios.delete(`${API}/feedback/${feedbackId}`);
        toast.success('Feedback deleted successfully!');
        fetchFeedbacks();
      } catch (error) {
        console.error('Error deleting feedback:', error);
        toast.error('Failed to delete feedback');
      }
    }
  };

  const getFilteredFeedbacks = () => {
    if (!feedbacks) return [];
    
    console.log('Filtering feedbacks:', {
      count: feedbacks.length,
      ratingFilter,
      typeFilter,
      sortBy
    });

    let result = [...feedbacks].filter(feedback => {
      // Search logic
      const messageLower = (feedback.message || '').toLowerCase();
      const nameLower = (feedback.customer_name || '').toLowerCase();
      
      // Also search in dish name
      let dishNameLower = (feedback.food_item_name || '').toLowerCase();
      if (!dishNameLower && feedback.food_item_id) {
        const item = foodItems.find(i => String(i.id) === String(feedback.food_item_id));
        if (item) dishNameLower = item.name.toLowerCase();
      }

      const matchesSearch = messageLower.includes(searchTerm.toLowerCase()) ||
                           nameLower.includes(searchTerm.toLowerCase()) ||
                           dishNameLower.includes(searchTerm.toLowerCase());
      
      // Filter logic
      const feedbackRating = feedback.rating !== undefined && feedback.rating !== null ? feedback.rating.toString() : '';
      const matchesRating = ratingFilter === 'all' || feedbackRating === ratingFilter;
      const matchesType = typeFilter === 'all' || feedback.feedback_type === typeFilter;
      
      return matchesSearch && matchesRating && matchesType;
    });

    // Sort logic
    result.sort((a, b) => {
      if (sortBy === 'newest') return new Date(b.created_at) - new Date(a.created_at);
      if (sortBy === 'oldest') return new Date(a.created_at) - new Date(b.created_at);
      if (sortBy === 'rating_high') return (b.rating || 0) - (a.rating || 0);
      if (sortBy === 'rating_low') return (a.rating || 0) - (b.rating || 0);
      return 0;
    });

    return result;
  };

  const filteredFeedbacks = getFilteredFeedbacks();
  const totalPages = Math.max(1, Math.ceil(filteredFeedbacks.length / itemsPerPage));
  const currentFeedbacks = filteredFeedbacks.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const getRatingStars = (rating) => {
    return '⭐'.repeat(rating) + '☆'.repeat(5 - rating);
  };

  const getRatingColor = (rating) => {
    if (rating >= 4) return 'text-green-600';
    if (rating >= 3) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getFeedbackTypeColor = (type) => {
    const colors = {
      food_quality: 'bg-orange-100 text-orange-700',
      service: 'bg-blue-100 text-blue-700',
      ambiance: 'bg-purple-100 text-purple-700',
      value_for_money: 'bg-green-100 text-green-700',
      ar_experience: 'bg-pink-100 text-pink-700',
      general: 'bg-gray-100 text-gray-700'
    };
    return colors[type] || colors.general;
  };

  if (loading && !formOnly) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50 dark:from-background dark:via-background dark:to-muted flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-muted-foreground">Loading feedback...</p>
        </div>
      </div>
    );
  }

  // Form Only Mode
  if (formOnly) {
    return (
      <Card className="border-none shadow-none bg-white dark:bg-card p-0 w-full">
        <CardHeader className="px-4 sm:px-6 pt-6 pb-2">
          <CardTitle className="text-xl sm:text-2xl font-serif text-orange-900 dark:text-orange-400 flex items-center">
            <MessageSquare className="w-5 h-5 sm:w-6 sm:h-6 mr-2 text-orange-600 dark:text-orange-500" />
            Share Your Experience
          </CardTitle>
          <CardDescription className="font-body italic text-sm dark:text-muted-foreground">
            Your feedback helps us serve you better at {restaurant?.name || 'our restaurant'}.
          </CardDescription>
        </CardHeader>
        <CardContent className="px-4 sm:px-6 pb-6 overflow-y-auto max-h-[70vh]">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="customer_name" className="text-orange-900 dark:text-orange-400 font-serif">Your Name *</Label>
                <Input
                  id="customer_name"
                  name="customer_name"
                  required
                  value={formData.customer_name}
                  onChange={handleInputChange}
                  placeholder="Enter your name"
                  className="border-orange-100 dark:border-border focus:border-orange-500 rounded-xl h-10 sm:h-12 dark:bg-muted dark:text-foreground"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="customer_email" className="text-orange-900 dark:text-orange-400 font-serif">Email (Optional)</Label>
                <Input
                  id="customer_email"
                  name="customer_email"
                  type="email"
                  value={formData.customer_email}
                  onChange={handleInputChange}
                  placeholder="your@email.com"
                  className="border-orange-100 dark:border-border focus:border-orange-500 rounded-xl h-10 sm:h-12 dark:bg-muted dark:text-foreground"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-orange-900 dark:text-orange-400 font-serif">Rating *</Label>
                <Select
                  value={formData.rating.toString()}
                  onValueChange={(value) => handleSelectChange('rating', value)}
                >
                  <SelectTrigger className="border-orange-100 dark:border-border focus:border-orange-500 rounded-xl h-10 sm:h-12 dark:bg-muted dark:text-foreground">
                    <SelectValue placeholder="Select rating" />
                  </SelectTrigger>
                  <SelectContent className="dark:bg-card dark:border-border">
                    {RATING_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value.toString()} className="dark:text-foreground">
                        <div className="flex items-center text-sm">
                          <span className="mr-2">{option.icon}</span>
                          <span className="hidden xs:inline">{option.label}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-orange-900 dark:text-orange-400 font-serif">Category *</Label>
                <Select
                  value={formData.feedback_type}
                  onValueChange={(value) => handleSelectChange('feedback_type', value)}
                >
                  <SelectTrigger className="border-orange-100 dark:border-border focus:border-orange-500 rounded-xl h-10 sm:h-12 dark:bg-muted dark:text-foreground">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent className="dark:bg-card dark:border-border">
                    {FEEDBACK_TYPES.map((type) => (
                      <SelectItem key={type.value} value={type.value} className="dark:text-foreground">
                        <span className="text-sm">{type.label}</span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="message" className="text-orange-900 dark:text-orange-400 font-serif">Message *</Label>
              <Textarea
                id="message"
                name="message"
                required
                rows={4}
                value={formData.message}
                onChange={handleInputChange}
                placeholder="Tell us about your experience..."
                className="border-orange-100 dark:border-border focus:border-orange-500 rounded-xl resize-none text-sm dark:bg-muted dark:text-foreground"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-orange-900 dark:text-orange-400 font-serif">Add Photo (Optional)</Label>
              <div className="flex items-center gap-4">
                {formData.image_url ? (
                  <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden border border-orange-200 dark:border-border">
                    <img src={formData.image_url} alt="Feedback" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={removeImage}
                      className="absolute top-1 right-1 bg-white/80 dark:bg-black/80 rounded-full p-1 shadow-sm hover:bg-white dark:hover:bg-black"
                    >
                      <X className="w-3 h-3 text-orange-600 dark:text-orange-500" />
                    </button>
                  </div>
                ) : (
                  <label className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl border-2 border-dashed border-orange-200 dark:border-border flex flex-col items-center justify-center cursor-pointer hover:border-orange-400 dark:hover:border-orange-500 hover:bg-orange-50 dark:hover:bg-muted transition-colors">
                    <Upload className="w-5 h-5 sm:w-6 sm:h-6 text-orange-400" />
                    <span className="text-[10px] text-orange-400 mt-1">Upload</span>
                    <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} disabled={uploadingImage} />
                  </label>
                )}
                {uploadingImage && <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-orange-600"></div>}
              </div>
            </div>

            <Button 
              type="submit" 
              className="w-full bg-orange-600 hover:bg-orange-700 text-white rounded-xl h-12 font-serif text-lg mt-2"
              disabled={uploadingImage}
            >
              Submit Feedback
            </Button>
          </form>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50 dark:from-background dark:via-background dark:to-muted">
      {/* Header */}
      <div className="bg-white/80 dark:bg-card/80 backdrop-blur-sm border-b border-orange-100 dark:border-border sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-center py-4 sm:py-6 gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.history.back()}
              className="self-start mr-4 border-orange-200 dark:border-border text-orange-700 dark:text-orange-400 hover:bg-orange-50 dark:hover:bg-orange-950/20"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            <div className="flex items-center sm:flex-1">
              <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-amber-500 rounded-lg flex items-center justify-center sm:mr-4 mr-2">
                <MessageSquare className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent">
                  Customer Feedback
                </h1>
                <p className="text-gray-600 dark:text-muted-foreground">
                  {restaurant ? restaurant.name : 'Loading...'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {restaurant && (
          <>
            {/* Add Feedback Section */}
            <div className="mb-8">
              <Card className="bg-white/80 dark:bg-card/80 backdrop-blur-sm border-orange-100 dark:border-border">
                <CardHeader>
                  <CardTitle className="flex items-center dark:text-foreground">
                    <MessageSquare className="w-5 h-5 mr-2 text-orange-600" />
                    Add Customer Feedback
                  </CardTitle>
                  <CardDescription className="dark:text-muted-foreground">
                    Collect feedback from your customers for {restaurant.name}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
                    <DialogTrigger asChild>
                      <Button 
                        className="bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white w-full"
                        size="lg"
                        onClick={() => {
                          resetForm();
                          setShowAddDialog(true);
                        }}
                      >
                        <Plus className="w-5 h-5 mr-2" />
                        Add New Feedback
                      </Button>
                    </DialogTrigger>
                <DialogContent className="w-[95vw] sm:w-auto sm:max-w-2xl p-4 sm:p-6 max-h-[85vh] overflow-y-auto bg-white dark:bg-card border dark:border-border">
                  <DialogHeader>
                    <DialogTitle className="dark:text-foreground">
                      {editingFeedback ? 'Edit Feedback' : 'Add New Feedback'}
                    </DialogTitle>
                    <DialogDescription className="dark:text-muted-foreground">
                      {editingFeedback ? 'Update the feedback details' : 'Add customer feedback for this restaurant'}
                    </DialogDescription>
                  </DialogHeader>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="customer_name" className="dark:text-foreground">Customer Name *</Label>
                        <Input
                          id="customer_name"
                          name="customer_name"
                          required
                          value={formData.customer_name}
                          onChange={handleInputChange}
                          placeholder="Enter customer name"
                          className="dark:bg-muted dark:border-border dark:text-foreground"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="customer_email" className="dark:text-foreground">Customer Email</Label>
                        <Input
                          id="customer_email"
                          name="customer_email"
                          type="email"
                          value={formData.customer_email}
                          onChange={handleInputChange}
                          placeholder="customer@example.com"
                          className="dark:bg-muted dark:border-border dark:text-foreground"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label className="dark:text-foreground">Rating *</Label>
                        <Select
                          value={formData.rating.toString()}
                          onValueChange={(value) => handleSelectChange('rating', value)}
                        >
                          <SelectTrigger className="dark:bg-muted dark:border-border dark:text-foreground">
                            <SelectValue placeholder="Select rating" />
                          </SelectTrigger>
                          <SelectContent className="dark:bg-card dark:border-border">
                            {RATING_OPTIONS.map((option) => (
                              <SelectItem key={option.value} value={option.value.toString()} className="dark:text-foreground">
                                <div className="flex items-center">
                                  <span className="mr-2">{option.icon}</span>
                                  {option.label}
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label className="dark:text-foreground">Category *</Label>
                        <Select
                          value={formData.feedback_type}
                          onValueChange={(value) => handleSelectChange('feedback_type', value)}
                        >
                          <SelectTrigger className="dark:bg-muted dark:border-border dark:text-foreground">
                            <SelectValue placeholder="Select type" />
                          </SelectTrigger>
                          <SelectContent className="dark:bg-card dark:border-border">
                            {FEEDBACK_TYPES.map((type) => (
                              <SelectItem key={type.value} value={type.value} className="dark:text-foreground">
                                {type.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="message" className="dark:text-foreground">Feedback Message *</Label>
                      <Textarea
                        id="message"
                        name="message"
                        required
                        value={formData.message}
                        onChange={handleInputChange}
                        placeholder="Detailed feedback message..."
                        rows={6}
                        className="dark:bg-muted dark:border-border dark:text-foreground"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label className="dark:text-foreground">Upload Image (Optional)</Label>
                      <div className="space-y-3">
                        {formData.image_url ? (
                          <div className="relative">
                            <img 
                              src={formData.image_url?.startsWith('http') ? formData.image_url : `${BACKEND_URL}${formData.image_url}`} 
                              alt="Feedback image" 
                              className="w-full h-48 object-cover rounded-lg border dark:border-border"
                            />
                            <Button
                              type="button"
                              size="sm"
                              variant="destructive"
                              className="absolute top-2 right-2"
                              onClick={removeImage}
                            >
                              <X className="w-4 h-4" />
                            </Button>
                          </div>
                        ) : (
                          <div className="border-2 border-dashed border-gray-300 dark:border-border rounded-lg p-6 text-center">
                            <input
                              type="file"
                              accept="image/*"
                              onChange={handleImageUpload}
                              className="hidden"
                              id="image-upload"
                              disabled={uploadingImage}
                            />
                            <label htmlFor="image-upload" className="cursor-pointer">
                              <div className="flex flex-col items-center">
                                {uploadingImage ? (
                                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600 mb-2"></div>
                                ) : (
                                  <Upload className="w-8 h-8 text-gray-400 dark:text-muted-foreground mb-2" />
                                )}
                                <p className="text-sm text-gray-600 dark:text-muted-foreground">
                                  {uploadingImage ? 'Uploading...' : 'Click to upload an image'}
                                </p>
                                <p className="text-xs text-gray-500 dark:text-muted-foreground mt-1">PNG, JPG up to 5MB</p>
                              </div>
                            </label>
                          </div>
                        )}
                      </div>
                    </div>

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
                        disabled={!restaurant || !restaurant.id}
                      >
                        {editingFeedback ? 'Update Feedback' : 'Add Feedback'}
                      </Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>
                </CardContent>
              </Card>
            </div>

            {/* Filters - Only visible in management mode */}
            {isManagement && (
              <div className="mb-6 bg-white dark:bg-card p-4 rounded-xl border border-orange-100 dark:border-border shadow-sm">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="search" className="dark:text-foreground">Search Feedback</Label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                      id="search"
                      placeholder="Search feedback..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 dark:bg-muted dark:border-border dark:text-foreground"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="dark:text-foreground">Rating</Label>
                  <Select
                    value={ratingFilter}
                    onValueChange={setRatingFilter}
                  >
                    <SelectTrigger className="dark:bg-muted dark:border-border dark:text-foreground">
                      <SelectValue placeholder="All Ratings" />
                    </SelectTrigger>
                    <SelectContent className="dark:bg-card dark:border-border">
                      <SelectItem value="all" className="dark:text-foreground">All Ratings</SelectItem>
                      {RATING_OPTIONS.map((option) => (
                        <SelectItem key={option.value} value={option.value.toString()} className="dark:text-foreground">
                          {option.icon} {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="dark:text-foreground">Category</Label>
                  <Select
                    value={typeFilter}
                    onValueChange={setTypeFilter}
                  >
                    <SelectTrigger className="dark:bg-muted dark:border-border dark:text-foreground">
                      <SelectValue placeholder="All Types" />
                    </SelectTrigger>
                    <SelectContent className="dark:bg-card dark:border-border">
                      <SelectItem value="all" className="dark:text-foreground">All Types</SelectItem>
                      {FEEDBACK_TYPES.map((type) => (
                        <SelectItem key={type.value} value={type.value} className="dark:text-foreground">
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="dark:text-foreground">Sort By</Label>
                  <Select
                    value={sortBy}
                    onValueChange={setSortBy}
                  >
                    <SelectTrigger className="dark:bg-muted dark:border-border dark:text-foreground">
                      <SelectValue placeholder="Sort by" />
                    </SelectTrigger>
                    <SelectContent className="dark:bg-card dark:border-border">
                      <SelectItem value="newest" className="dark:text-foreground">Newest First</SelectItem>
                      <SelectItem value="oldest" className="dark:text-foreground">Oldest First</SelectItem>
                      <SelectItem value="rating_high" className="dark:text-foreground">Highest Rated</SelectItem>
                      <SelectItem value="rating_low" className="dark:text-foreground">Lowest Rated</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
            )}

            {/* Feedback List */}
            {filteredFeedbacks.length === 0 ? (
              <Card className="bg-white/80 dark:bg-card/80 backdrop-blur-sm border-orange-100 dark:border-border">
                <CardContent className="p-12 text-center">
                  <div className="w-16 h-16 bg-gray-100 dark:bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                    <MessageSquare className="w-8 h-8 text-gray-400 dark:text-muted-foreground" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-foreground mb-2">No feedback yet</h3>
                  <p className="text-gray-600 dark:text-muted-foreground mb-6">Start collecting customer feedback for {restaurant.name}</p>
                  <Button
                    onClick={() => {
                      resetForm();
                      setShowAddDialog(true);
                    }}
                    className="bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add First Feedback
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {currentFeedbacks.map((feedback) => (
                  <Card key={feedback.id} className="bg-white/80 dark:bg-card/80 backdrop-blur-sm border-orange-100 dark:border-border hover:shadow-lg transition-all duration-200">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-muted-foreground mb-3">
                            <div className="flex items-center">
                              <User className="w-4 h-4 mr-1.5 text-orange-400" />
                              <span className="font-medium text-gray-900 dark:text-foreground">{feedback.customer_name}</span>
                            </div>
                            <div className="flex items-center">
                              <Clock className="w-4 h-4 mr-1.5 text-orange-400" />
                              <span>{new Date(feedback.created_at).toLocaleDateString()}</span>
                            </div>
                          </div>
                          
                          <div className="flex flex-wrap items-center gap-2">
                            {feedback.food_item_id && (
                              <Badge variant="outline" className="border-orange-200 dark:border-orange-900/50 text-orange-700 dark:text-orange-400 bg-orange-50/50 dark:bg-orange-950/20 font-serif px-2 py-0.5 text-[11px]">
                                {(() => {
                                  const item = foodItems.find(i => String(i.id) === String(feedback.food_item_id));
                                  if (item) return `Item - ${item.name}`;
                                  if (feedback.food_item_name) return `Item - ${feedback.food_item_name}`;
                                  return 'Item - Product';
                                })()}
                              </Badge>
                            )}
                            <Badge className={cn("px-2 py-0.5 text-[11px] font-medium border-none", getFeedbackTypeColor(feedback.feedback_type))}>
                              {FEEDBACK_TYPES.find(t => t.value === feedback.feedback_type)?.label}
                            </Badge>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className={cn("text-xl font-bold mb-1", getRatingColor(feedback.rating))}>
                            {getRatingStars(feedback.rating)}
                          </div>
                          <div className="text-[10px] uppercase tracking-wider text-gray-400 dark:text-muted-foreground font-semibold">
                            {feedback.rating}/5 Rating
                          </div>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-700 dark:text-muted-foreground mb-4 leading-relaxed">
                        {feedback.message}
                      </p>
                      {feedback.image_url && (
                        <div className="mb-4">
                          <img 
                            src={feedback.image_url?.startsWith('http') ? feedback.image_url : `${BACKEND_URL}${feedback.image_url}`} 
                            alt="Feedback image" 
                            className="w-full max-w-md h-48 object-cover rounded-lg border dark:border-border"
                          />
                        </div>
                      )}
                      {feedback.customer_email && (
                        <p className="text-sm text-gray-500 dark:text-muted-foreground mb-4">
                          Contact: {feedback.customer_email}
                        </p>
                      )}
                      
                      {/* Only show management buttons if user has permissions */}
                      {canManageFeedback && (
                        <div className="flex justify-end space-x-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleEdit(feedback)}
                            className="text-xs dark:border-border dark:text-muted-foreground dark:hover:text-foreground"
                          >
                            <Edit className="w-3 h-3 mr-1" />
                            Edit
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDelete(feedback.id)}
                            className="text-xs border-red-200 dark:border-red-900/50 text-red-700 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/20"
                          >
                            <Trash2 className="w-3 h-3 mr-1" />
                            Delete
                          </Button>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}

                {/* Pagination Controls */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-center space-x-2 mt-8 pb-12">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                      disabled={currentPage === 1}
                      className="border-orange-200 dark:border-border text-orange-700 dark:text-orange-400"
                    >
                      <ChevronLeft className="w-4 h-4 mr-1" />
                      Previous
                    </Button>
                    <div className="flex items-center space-x-1">
                      {[...Array(totalPages)].map((_, i) => (
                        <Button
                          key={i}
                          variant={currentPage === i + 1 ? "default" : "outline"}
                          size="sm"
                          onClick={() => setCurrentPage(i + 1)}
                          className={cn(
                            "w-8 h-8 p-0",
                            currentPage === i + 1 
                              ? "bg-orange-600 text-white" 
                              : "border-orange-100 text-orange-700 hover:bg-orange-50"
                          )}
                        >
                          {i + 1}
                        </Button>
                      ))}
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                      disabled={currentPage === totalPages}
                      className="border-orange-200 text-orange-700"
                    >
                      Next
                      <ChevronRight className="w-4 h-4 ml-1" />
                    </Button>
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>
      <ConfirmDialogUI />
    </div>
  );
}
