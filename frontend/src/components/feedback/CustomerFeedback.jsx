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
  X
} from 'lucide-react';

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

export default function CustomerFeedback() {
  const { restaurantId } = useParams();
  const { user } = useAuth();
  const [restaurant, setRestaurant] = useState(null);
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [editingFeedback, setEditingFeedback] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [ratingFilter, setRatingFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [uploadingImage, setUploadingImage] = useState(false);
  const [formData, setFormData] = useState({
    customer_name: '',
    customer_email: '',
    rating: 5,
    feedback_type: 'general',
    title: '',
    message: '',
    image_url: '',
    restaurant_id: ''
  });

  // Check if user has permission to view feedback management features
  const canManageFeedback = user?.role === 'super_admin' || 
    (user?.role === 'admin' && user?.permissions?.includes('manage_feedback'));

  useEffect(() => {
    if (restaurantId) {
      fetchRestaurant();
      fetchFeedbacks();
    } else {
      // If no restaurantId, get the first restaurant for the user
      fetchUserRestaurants();
    }
  }, [restaurantId]);

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

  const fetchRestaurant = async () => {
    try {
      const response = await axios.get(`${API}/restaurants/${restaurantId}`);
      setRestaurant(response.data);
    } catch (error) {
      console.error('Error fetching restaurant:', error);
      toast.error('Failed to load restaurant');
    } finally {
      setLoading(false);
    }
  };

  const fetchFeedbacks = async (restId = null) => {
    const restaurantIdToUse = restId || restaurant?.id;
    if (!restaurantIdToUse) return;
    
    try {
      const response = await axios.get(`${API}/feedback/restaurant/${restaurantIdToUse}`);
      setFeedbacks(response.data);
    } catch (error) {
      console.error('Error fetching feedbacks:', error);
      toast.error('Failed to load feedback');
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
      rating: 5,
      feedback_type: 'general',
      title: '',
      message: '',
      image_url: '',
      restaurant_id: restaurant?.id || ''
    });
    setEditingFeedback(null);
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
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
      const formData = new FormData();
      formData.append('file', file);

      const response = await axios.post(`${API}/feedback/upload-image`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      setFormData(prev => ({
        ...prev,
        image_url: response.data.image_url
      }));
      toast.success('Image uploaded successfully!');
    } catch (error) {
      console.error('Error uploading image:', error);
      toast.error('Failed to upload image');
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
        // Update existing feedback
        await axios.put(`${API}/feedback/${editingFeedback.id}`, submitData);
        toast.success('Feedback updated successfully!');
      } else {
        // Create new feedback
        await axios.post(`${API}/feedback`, submitData);
        toast.success('Feedback added successfully!');
      }
      
      setShowAddDialog(false);
      resetForm();
      fetchFeedbacks();
    } catch (error) {
      console.error('Error saving feedback:', error);
      console.error('Error response:', error.response?.data); // Debug log
      toast.error(error.response?.data?.detail || 'Failed to save feedback');
    }
  };

  const handleEdit = (feedback) => {
    setFormData({
      customer_name: feedback.customer_name,
      customer_email: feedback.customer_email,
      rating: feedback.rating,
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
    if (window.confirm('Are you sure you want to delete this feedback?')) {
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
    return feedbacks.filter(feedback => {
      const matchesSearch = feedback.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           feedback.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           feedback.customer_name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesRating = ratingFilter === 'all' || feedback.rating.toString() === ratingFilter;
      const matchesType = typeFilter === 'all' || feedback.feedback_type === typeFilter;
      return matchesSearch && matchesRating && matchesType;
    });
  };

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

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading feedback...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-orange-100 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-center py-4 sm:py-6 gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.history.back()}
              className="self-start mr-4 border-orange-200 text-orange-700 hover:bg-orange-50"
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
                <p className="text-gray-600">
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
              <Card className="bg-white/80 backdrop-blur-sm border-orange-100">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <MessageSquare className="w-5 h-5 mr-2 text-orange-600" />
                    Add Customer Feedback
                  </CardTitle>
                  <CardDescription>
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
                <DialogContent className="w-[95vw] sm:w-auto sm:max-w-2xl p-4 sm:p-6 max-h-[85vh] overflow-y-auto z-[60]">
                  <DialogHeader>
                    <DialogTitle>
                      {editingFeedback ? 'Edit Feedback' : 'Add New Feedback'}
                    </DialogTitle>
                    <DialogDescription>
                      {editingFeedback ? 'Update the feedback details' : 'Add customer feedback for this restaurant'}
                    </DialogDescription>
                  </DialogHeader>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="customer_name">Customer Name *</Label>
                        <Input
                          id="customer_name"
                          name="customer_name"
                          required
                          value={formData.customer_name}
                          onChange={handleInputChange}
                          placeholder="Enter customer name"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="customer_email">Customer Email</Label>
                        <Input
                          id="customer_email"
                          name="customer_email"
                          type="email"
                          value={formData.customer_email}
                          onChange={handleInputChange}
                          placeholder="customer@example.com"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Rating *</Label>
                        <Select
                          value={formData.rating.toString()}
                          onValueChange={(value) => handleSelectChange('rating', value)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select rating" />
                          </SelectTrigger>
                          <SelectContent>
                            {RATING_OPTIONS.map((option) => (
                              <SelectItem key={option.value} value={option.value.toString()}>
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
                        <Label>Feedback Type</Label>
                        <Select
                          value={formData.feedback_type}
                          onValueChange={(value) => handleSelectChange('feedback_type', value)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select type" />
                          </SelectTrigger>
                          <SelectContent>
                            {FEEDBACK_TYPES.map((type) => (
                              <SelectItem key={type.value} value={type.value}>
                                {type.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="title">Feedback Title *</Label>
                      <Input
                        id="title"
                        name="title"
                        required
                        value={formData.title}
                        onChange={handleInputChange}
                        placeholder="Brief title for the feedback"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="message">Feedback Message *</Label>
                      <Textarea
                        id="message"
                        name="message"
                        required
                        value={formData.message}
                        onChange={handleInputChange}
                        placeholder="Detailed feedback message..."
                        rows={4}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Upload Image (Optional)</Label>
                      <div className="space-y-3">
                        {formData.image_url ? (
                          <div className="relative">
                            <img 
                              src={`${BACKEND_URL}${formData.image_url}`} 
                              alt="Feedback image" 
                              className="w-full h-48 object-cover rounded-lg border"
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
                          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
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
                                  <Upload className="w-8 h-8 text-gray-400 mb-2" />
                                )}
                                <p className="text-sm text-gray-600">
                                  {uploadingImage ? 'Uploading...' : 'Click to upload an image'}
                                </p>
                                <p className="text-xs text-gray-500 mt-1">PNG, JPG up to 5MB</p>
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

            {/* Filters - Only visible to super admin or admin with manage_feedback permission */}
            {canManageFeedback && (
              <div className="mb-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="search">Search Feedback</Label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                      id="search"
                      placeholder="Search by title, message, or customer name..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Filter by Rating</Label>
                  <Select
                    value={ratingFilter}
                    onValueChange={setRatingFilter}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="All Ratings" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Ratings</SelectItem>
                      {RATING_OPTIONS.map((option) => (
                        <SelectItem key={option.value} value={option.value.toString()}>
                          {option.icon} {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Filter by Type</Label>
                  <Select
                    value={typeFilter}
                    onValueChange={setTypeFilter}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="All Types" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Types</SelectItem>
                      {FEEDBACK_TYPES.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
            )}

            {/* Feedback List */}
            {getFilteredFeedbacks().length === 0 ? (
              <Card className="bg-white/80 backdrop-blur-sm border-orange-100">
                <CardContent className="p-12 text-center">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <MessageSquare className="w-8 h-8 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No feedback yet</h3>
                  <p className="text-gray-600 mb-6">Start collecting customer feedback for {restaurant.name}</p>
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
                {getFilteredFeedbacks().map((feedback) => (
                  <Card key={feedback.id} className="bg-white/80 backdrop-blur-sm border-orange-100 hover:shadow-lg transition-all duration-200">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <CardTitle className="text-lg font-semibold text-gray-900">
                              {feedback.title}
                            </CardTitle>
                            <Badge className={getFeedbackTypeColor(feedback.feedback_type)}>
                              {FEEDBACK_TYPES.find(t => t.value === feedback.feedback_type)?.label}
                            </Badge>
                          </div>
                          <div className="flex items-center space-x-4 text-sm text-gray-600">
                            <div className="flex items-center">
                              <User className="w-4 h-4 mr-1" />
                              {feedback.customer_name}
                            </div>
                            <div className="flex items-center">
                              <Clock className="w-4 h-4 mr-1" />
                              {new Date(feedback.created_at).toLocaleDateString()}
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className={`text-2xl font-bold ${getRatingColor(feedback.rating)}`}>
                            {getRatingStars(feedback.rating)}
                          </div>
                          <div className="text-sm text-gray-500">
                            {feedback.rating}/5 stars
                          </div>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-700 mb-4 leading-relaxed">
                        {feedback.message}
                      </p>
                      {feedback.image_url && (
                        <div className="mb-4">
                          <img 
                            src={`${BACKEND_URL}${feedback.image_url}`} 
                            alt="Feedback image" 
                            className="w-full max-w-md h-48 object-cover rounded-lg border"
                          />
                        </div>
                      )}
                      {feedback.customer_email && (
                        <p className="text-sm text-gray-500 mb-4">
                          Contact: {feedback.customer_email}
                        </p>
                      )}
                      <div className="flex justify-end space-x-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleEdit(feedback)}
                          className="text-xs"
                        >
                          <Edit className="w-3 h-3 mr-1" />
                          Edit
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDelete(feedback.id)}
                          className="text-xs border-red-200 text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="w-3 h-3 mr-1" />
                          Delete
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
