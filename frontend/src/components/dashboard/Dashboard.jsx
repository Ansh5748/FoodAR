import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../../App';
import { QRCodeCanvas } from 'qrcode.react';
import { Button } from '../ui/button';
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from '../ui/card';
import { Badge } from '../ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../ui/dialog';
import { toast } from 'sonner';
import { useConfirm } from '../ui/ConfirmDialog';
import logo from "../../DishLook(1).png";
import { 
  Building, 
  Plus, 
  QrCode, 
  BarChart3, 
  UtensilsCrossed, 
  Eye, 
  Scan,
  TrendingUp,
  Users,
  LogOut,
  Settings,
  Shield,
  Crown,
  Trash
} from 'lucide-react';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export default function Dashboard() {
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [analytics, setAnalytics] = useState({});
  const [masterQrs, setMasterQrs] = useState({});
  const [showQrDialog, setShowQrDialog] = useState(false);
  const [selectedRestaurant, setSelectedRestaurant] = useState(null);
  const { user, logout } = useAuth();
  const { confirmDialog, ConfirmDialogUI } = useConfirm();

  useEffect(() => {
    fetchRestaurants();
  }, []);

  const fetchRestaurants = async () => {
    try {
      const response = await axios.get(`${API}/restaurants`);
      setRestaurants(response.data);
      
      // Fetch analytics for each restaurant
      const analyticsPromises = response.data.map(async (restaurant) => {
        try {
          const analyticsResponse = await axios.get(`${API}/analytics/restaurant/${restaurant.id}`);
          return { [restaurant.id]: analyticsResponse.data };
        } catch (error) {
          return { [restaurant.id]: { total_scans: 0, total_food_items: 0 } };
        }
      });
      
      const analyticsResults = await Promise.all(analyticsPromises);
      const analyticsData = analyticsResults.reduce((acc, curr) => ({ ...acc, ...curr }), {});
      setAnalytics(analyticsData);
      
      // Fetch Master QRs for each restaurant
      const qrPromises = response.data.map(async (restaurant) => {
        try {
          const qrResponse = await axios.get(`${API}/restaurants/${restaurant.id}/master-qr`);
          return { [restaurant.id]: qrResponse.data };
        } catch (error) {
          return { [restaurant.id]: null };
        }
      });
      
      const qrResults = await Promise.all(qrPromises);
      const qrData = qrResults.reduce((acc, curr) => ({ ...acc, ...curr }), {});
      setMasterQrs(qrData);
      
    } catch (error) {
      console.error('Error fetching restaurants:', error);
      toast.error('Failed to load restaurants');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully');
  };

  const canDeleteRestaurant = (restaurant) => {
    if (user?.role === 'admin' || user?.role === 'super_admin') return true;
    return restaurant.owner_id === user?.id;
  };

  const handleDeleteRestaurant = async (restaurantId) => {
    const confirmed = await confirmDialog({
      title: 'Delete Restaurant',
      message: 'Are you sure you want to permanently delete this restaurant and all its data? This cannot be undone.',
      confirmLabel: 'Delete',
      variant: 'destructive',
    });
    if (!confirmed) return;
    try {
      await axios.delete(`${API}/restaurants/${restaurantId}`);
      toast.success('Restaurant deleted');
      setRestaurants((prev) => prev.filter(r => r.id !== restaurantId));
    } catch (e) {
      toast.error(e.response?.data?.detail || 'Failed to delete restaurant');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50 dark:from-background dark:via-background dark:to-muted flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50 dark:from-background dark:via-background dark:to-muted">
      {/* Header */}
      <div className="bg-white/80 dark:bg-card/80 backdrop-blur-sm border-b border-orange-100 dark:border-border sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center py-4 sm:py-6 gap-3">
            <div className="flex items-center">
              <div>
                <img 
              src={logo}
              alt="DishLook Logo"
              className="w-10 h-10 bg-gradient-to-br from-orange-500 to-amber-500 rounded-lg flex items-center justify-center sm:mr-4 mr-2"
            />
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-foreground">
                  DishLook Dashboard
                </h1>
                <p className="text-gray-600 dark:text-muted-foreground">Welcome back, {user?.name}</p>
              </div>
            </div>
            <div className="flex items-center space-x-3 sm:space-x-4">
              {/* Role-based navigation */}
              {user?.role === 'super_admin' && (
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => window.location.href = '/super-admin'}
                  className="border-red-200 dark:border-red-900/50 text-red-700 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/20"
                >
                  <Crown className="w-4 h-4 mr-2" />
                  Super Admin
                </Button>
              )}
              {user?.role === 'admin' && (
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => window.location.href = '/admin'}
                  className="border-blue-200 dark:border-blue-900/50 text-blue-700 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/20"
                >
                  <Shield className="w-4 h-4 mr-2" />
                  Admin Panel
                </Button>
              )}
              <Link to="/settings">
                <Button variant="outline" size="sm" className="border-orange-200 dark:border-orange-900/50 text-orange-700 dark:text-orange-400 hover:bg-orange-50 dark:hover:bg-orange-950/20">
                  <Settings className="w-4 h-4 mr-2" />
                  Settings
                </Button>
              </Link>
              <Button variant="outline" size="sm" onClick={handleLogout} className="border-red-200 dark:border-red-900/50 text-red-700 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/20">
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="bg-white/80 dark:bg-card/80 backdrop-blur-sm border-orange-100 dark:border-border">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-muted-foreground mb-1">Total Restaurants</p>
                  <p className="text-3xl font-bold text-gray-900 dark:text-foreground">{restaurants.length}</p>
                </div>
                <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-amber-500 rounded-lg flex items-center justify-center">
                  <Building className="w-6 h-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/80 dark:bg-card/80 backdrop-blur-sm border-orange-100 dark:border-border">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-muted-foreground mb-1">Total Menu Items</p>
                  <p className="text-3xl font-bold text-gray-900 dark:text-foreground">
                    {Object.values(analytics).reduce((sum, data) => sum + (data.total_food_items || 0), 0)}
                  </p>
                </div>
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
                  <UtensilsCrossed className="w-6 h-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/80 dark:bg-card/80 backdrop-blur-sm border-orange-100 dark:border-border">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-muted-foreground mb-1">Total QR Scans</p>
                  <p className="text-3xl font-bold text-gray-900 dark:text-foreground">
                    {Object.values(analytics).reduce((sum, data) => sum + (data.total_scans || 0), 0)}
                  </p>
                </div>
                <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-500 rounded-lg flex items-center justify-center">
                  <Scan className="w-6 h-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/80 dark:bg-card/80 backdrop-blur-sm border-orange-100 dark:border-border">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-muted-foreground mb-1">Avg Scans/Item</p>
                  <p className="text-3xl font-bold text-gray-900 dark:text-foreground">
                    {restaurants.length > 0 ? 
                      Math.round(Object.values(analytics).reduce((sum, data) => sum + (data.total_scans || 0), 0) / 
                      Math.max(1, Object.values(analytics).reduce((sum, data) => sum + (data.total_food_items || 0), 0))) 
                      : 0}
                  </p>
                </div>
                <div className="w-12 h-12 bg-gradient-to-br from-pink-500 to-rose-500 rounded-lg flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-foreground mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {(user?.role === 'admin' || user?.role === 'super_admin' || restaurants.length === 0) && (
              <Link to="/restaurant-setup">
                <Card className="bg-white/80 dark:bg-card/80 backdrop-blur-sm border-orange-100 dark:border-border hover:shadow-lg transition-all duration-200 cursor-pointer group">
                  <CardContent className="p-6">
                    <div className="flex items-center">
                      <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-amber-500 rounded-lg flex items-center justify-center mr-4 group-hover:scale-110 transition-transform">
                        <Plus className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900 dark:text-foreground">Add Restaurant</h3>
                        <p className="text-gray-600 dark:text-muted-foreground text-sm">Create a new restaurant profile</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            )}
            {/* Owner-only quick action replacing Add Restaurant when exactly 1 restaurant exists */}
            {user?.role === 'restaurant_owner' && restaurants.length === 1 && (
              <Link to={`/restaurant/${restaurants[0].id}/analytics`}>
                <Card className="bg-white/80 dark:bg-card/80 backdrop-blur-sm border-orange-100 dark:border-border hover:shadow-lg transition-all duration-200 cursor-pointer group">
                  <CardContent className="p-6">
                    <div className="flex items-center">
                      <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-green-500 rounded-lg flex items-center justify-center mr-4 group-hover:scale-110 transition-transform">
                        <BarChart3 className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900 dark:text-foreground">Analytics Overview</h3>
                        <p className="text-gray-600 dark:text-muted-foreground text-sm">View performance of your restaurant</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            )}

            <Link to="/food-library">
              <Card className="bg-white/80 dark:bg-card/80 backdrop-blur-sm border-orange-100 dark:border-border hover:shadow-lg transition-all duration-200 cursor-pointer group">
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-lg flex items-center justify-center mr-4 group-hover:scale-110 transition-transform">
                      <Eye className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-foreground">Browse Food Library</h3>
                      <p className="text-gray-600 dark:text-muted-foreground text-sm">Explore 3D models and videos</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>

            <Link to="/customer-feedback">
              <Card className="bg-white/80 dark:bg-card/80 backdrop-blur-sm border-orange-100 dark:border-border hover:shadow-lg transition-all duration-200 cursor-pointer group">
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-500 rounded-lg flex items-center justify-center mr-4 group-hover:scale-110 transition-transform">
                      <Users className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-foreground">Customer Feedback</h3>
                      <p className="text-gray-600 dark:text-muted-foreground text-sm">View customer reviews and ratings</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          </div>
        </div>

        {/* Restaurants List */}
        <div>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-foreground">Your Restaurants</h2>
            {(user?.role === 'admin' || user?.role === 'super_admin' || (user?.role === 'restaurant_owner' && restaurants.length === 0)) && (
              <Link to="/restaurant-setup">
                <Button className="bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Restaurant
                </Button>
              </Link>
            )}
          </div>

          {restaurants.length === 0 ? (
            <Card className="bg-white/80 dark:bg-card/80 backdrop-blur-sm border-orange-100 dark:border-border">
              <CardContent className="p-12 text-center">
                <div className="w-16 h-16 bg-gray-100 dark:bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                  <Building className="w-8 h-8 text-gray-400 dark:text-muted-foreground" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-foreground mb-2">No restaurants yet</h3>
                <p className="text-gray-600 dark:text-muted-foreground mb-6">Create your first restaurant to start managing AR menus</p>
                {(user?.role === 'admin' || user?.role === 'super_admin' || user?.role === 'restaurant_owner') && (
                  <Link to="/restaurant-setup">
                    <Button className="bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white">
                      <Plus className="w-4 h-4 mr-2" />
                      Create Restaurant
                    </Button>
                  </Link>
                )}
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {restaurants.map((restaurant) => (
                <Card key={restaurant.id} className="bg-white/80 dark:bg-card/80 backdrop-blur-sm border-orange-100 dark:border-border hover:shadow-lg transition-all duration-200">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        {restaurant.image_url ? (
                          <img src={restaurant.image_url.startsWith('/') ? `${BACKEND_URL}${restaurant.image_url}` : restaurant.image_url} alt={restaurant.name} className="w-8 h-8 rounded object-cover border dark:border-border" />
                        ) : (
                          <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-amber-500 rounded flex items-center justify-center">
                            <Building className="w-4 h-4 text-white" />
                          </div>
                        )}
                        <CardTitle className="text-lg font-semibold text-gray-900 dark:text-foreground">
                          {restaurant.name}
                        </CardTitle>
                      </div>
                      <Badge variant="secondary" className="bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400">
                        Active
                      </Badge>
                    </div>
                    <CardDescription className="text-gray-600 dark:text-muted-foreground">
                      {restaurant.description || 'No description available'}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3 mb-6">
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-gray-600 dark:text-muted-foreground">Menu Items</span>
                        <span className="font-semibold dark:text-foreground">{analytics[restaurant.id]?.total_food_items || 0}</span>
                      </div>
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-gray-600 dark:text-muted-foreground">Total Scans</span>
                        <span className="font-semibold dark:text-foreground">{analytics[restaurant.id]?.total_scans || 0}</span>
                      </div>
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-gray-600 dark:text-muted-foreground">Address</span>
                        <span className="font-semibold text-right dark:text-foreground">{restaurant.address || 'Not set'}</span>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-3 gap-2">
                      <Link to={`/restaurant/${restaurant.id}/food-items`}>
                        <Button variant="outline" size="sm" className="w-full text-xs dark:border-border dark:text-muted-foreground dark:hover:text-foreground">
                          <UtensilsCrossed className="w-3 h-3 mr-1" />
                          Menu
                        </Button>
                      </Link>
                      <Link to={`/restaurant/${restaurant.id}/qr-codes`}>
                        <Button variant="outline" size="sm" className="w-full text-xs dark:border-border dark:text-muted-foreground dark:hover:text-foreground">
                          <QrCode className="w-3 h-3 mr-1" />
                          QR Codes
                        </Button>
                      </Link>
                      <Link to={`/restaurant/${restaurant.id}/analytics`}>
                        <Button variant="outline" size="sm" className="w-full text-xs dark:border-border dark:text-muted-foreground dark:hover:text-foreground">
                          <BarChart3 className="w-3 h-3 mr-1" />
                          Analytics
                        </Button>
                      </Link>
                    </div>
                    
                    <div className="mt-3 grid grid-cols-2 gap-2">
                      <Button 
                        variant="default" 
                        size="sm" 
                        className="w-full text-xs bg-orange-500 hover:bg-orange-600"
                        onClick={() => {
                          setSelectedRestaurant(restaurant);
                          setShowQrDialog(true);
                        }}
                      >
                        <QrCode className="w-3 h-3 mr-1" />
                        Master QR
                      </Button>
                      <Link to={`${window.location.origin}/menu/${restaurant.id}`} target="_blank" className="w-full">
                        <Button variant="outline" size="sm" className="w-full text-xs border-orange-200 dark:border-orange-900/50 text-orange-700 dark:text-orange-400 hover:bg-orange-50 dark:hover:bg-orange-950/20">
                          <Eye className="w-3 h-3 mr-1" />
                          View Menu
                        </Button>
                      </Link>
                    </div>
                  {canDeleteRestaurant(restaurant) && (
                    <div className="pt-3">
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full text-xs border-red-200 dark:border-red-900/50 text-red-700 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/20"
                        onClick={() => handleDeleteRestaurant(restaurant.id)}
                      >
                        <Trash className="w-3 h-3 mr-1" /> Delete Restaurant
                      </Button>
                    </div>
                  )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>

      <Dialog open={showQrDialog} onOpenChange={setShowQrDialog}>
        <DialogContent className="sm:max-w-md bg-white dark:bg-card">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-gray-900 dark:text-foreground">Restaurant Menu Master QR</DialogTitle>
            <DialogDescription className="text-gray-600 dark:text-muted-foreground">
              Customers can scan this single QR to see the complete 3D AR menu of {selectedRestaurant?.name}.
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col items-center justify-center p-6 bg-orange-50 dark:bg-orange-950/10 rounded-xl border border-orange-100 dark:border-orange-900/20 mt-4">
            {selectedRestaurant && masterQrs[selectedRestaurant.id] ? (
              <>
                <div className="bg-white p-4 rounded-2xl shadow-sm border border-orange-100 dark:border-orange-900/20 mb-6">
                  <QRCodeCanvas
                    id="dashboard-master-qr-canvas"
                    value={`${window.location.origin}/menu/${selectedRestaurant.id}`}
                    size={200}
                    level={"H"}
                    includeMargin={true}
                  />
                </div>
                <div className="text-center space-y-2">
                  <p className="font-semibold text-orange-900 dark:text-orange-400">{selectedRestaurant.name}</p>
                  <p className="text-xs text-orange-700 dark:text-orange-500 max-w-[200px] break-all">
                    {window.location.origin}/menu/{selectedRestaurant.id}
                  </p>
                </div>
                <div className="flex gap-3 mt-6 w-full">
                  <Button 
                    className="flex-1 bg-orange-500 hover:bg-orange-600 text-white"
                    onClick={() => {
                      const canvas = document.getElementById('dashboard-master-qr-canvas');
                      if (canvas) {
                        const link = document.createElement('a');
                        link.href = canvas.toDataURL('image/png');
                        link.download = `${selectedRestaurant.name}_Master_QR.png`;
                        link.click();
                      }
                    }}
                  >
                    Download QR
                  </Button>
                  <Button 
                    variant="outline" 
                    className="flex-1 border-orange-200 dark:border-orange-900/50 text-orange-700 dark:text-orange-400"
                    onClick={() => {
                      window.open(`${window.location.origin}/menu/${selectedRestaurant.id}`, '_blank');
                    }}
                  >
                    Open Menu
                  </Button>
                </div>
              </>
            ) : (
              <div className="py-12 text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500 mx-auto mb-4"></div>
                <p className="dark:text-muted-foreground">Generating Master QR...</p>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
      <ConfirmDialogUI />
    </div>
  );
}