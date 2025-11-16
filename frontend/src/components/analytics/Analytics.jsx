import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../../App';
import { Button } from '../ui/button';
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from '../ui/card';
import { Badge } from '../ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { toast } from 'sonner';
import { 
  ArrowLeft,
  BarChart3,
  TrendingUp,
  Eye,
  Scan,
  Calendar,
  Users,
  Clock,
  Target,
  Award,
  Activity
} from 'lucide-react';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export default function Analytics() {
  const { restaurantId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [restaurant, setRestaurant] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('7days');

  useEffect(() => {
    fetchRestaurant();
    fetchAnalytics();
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

  const fetchAnalytics = async () => {
    try {
      const response = await axios.get(`${API}/analytics/restaurant/${restaurantId}`);
      setAnalytics(response.data);
    } catch (error) {
      console.error('Error fetching analytics:', error);
      toast.error('Failed to load analytics');
    } finally {
      setLoading(false);
    }
  };

  const getTopPerformingItems = () => {
    if (!analytics?.qr_codes) return [];
    
    return analytics.qr_codes
      .sort((a, b) => b.scan_count - a.scan_count)
      .slice(0, 5)
      .map(qr => {
        const foodItem = qr.food_item || { name: 'Unknown Item', price: 0 };
        return {
          ...qr,
          food_item: foodItem
        };
      });
  };

  const calculateEngagementRate = () => {
    if (!analytics || analytics.total_food_items === 0) return 0;
    return Math.round((analytics.total_scans / analytics.total_food_items) * 100) / 100;
  };

  const getRecentActivity = () => {
    // Mock recent activity data - in a real app this would come from the backend
    return [
      { id: 1, type: 'scan', item: 'Margherita Pizza', time: '2 minutes ago' },
      { id: 2, type: 'scan', item: 'Caesar Salad', time: '5 minutes ago' },
      { id: 3, type: 'scan', item: 'Chocolate Cake', time: '12 minutes ago' },
      { id: 4, type: 'scan', item: 'Beef Burger', time: '18 minutes ago' },
      { id: 5, type: 'scan', item: 'Fresh Juice', time: '23 minutes ago' },
    ];
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading analytics...</p>
        </div>
      </div>
    );
  }

  const topItems = getTopPerformingItems();
  const engagementRate = calculateEngagementRate();
  const recentActivity = getRecentActivity();

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-orange-100 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-center py-6 space-y-4 md:space-y-0">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate('/dashboard')}
              className="self-start md:mr-4 border-orange-200 text-orange-700 hover:bg-orange-50"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Dashboard
            </Button>
            <div className="flex items-center flex-1">
              <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-500 rounded-lg flex items-center justify-center mr-4">
                <BarChart3 className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                  Analytics Dashboard
                </h1>
                <p className="text-gray-600">{restaurant?.name}</p>
              </div>
            </div>
            <div className="flex items-center space-x-4 self-end md:self-auto">
              <div className="flex items-center space-x-2">
                <Calendar className="w-4 h-4 text-gray-500" />
                <Select value={timeRange} onValueChange={setTimeRange}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="24hours">Last 24h</SelectItem>
                    <SelectItem value="7days">Last 7 days</SelectItem>
                    <SelectItem value="30days">Last 30 days</SelectItem>
                    <SelectItem value="90days">Last 90 days</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="bg-white/80 backdrop-blur-sm border-orange-100">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">Total Scans</p>
                  <p className="text-3xl font-bold text-gray-900">{analytics?.total_scans || 0}</p>
                  <p className="text-sm text-green-600 flex items-center mt-1">
                    <TrendingUp className="w-3 h-3 mr-1" />
                    +12% from last week
                  </p>
                </div>
                <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-500 rounded-lg flex items-center justify-center">
                  <Scan className="w-6 h-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-sm border-orange-100">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">Active Items</p>
                  <p className="text-3xl font-bold text-gray-900">{analytics?.total_food_items || 0}</p>
                  <p className="text-sm text-blue-600 flex items-center mt-1">
                    <Target className="w-3 h-3 mr-1" />
                    All items have QR codes
                  </p>
                </div>
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
                  <Eye className="w-6 h-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-sm border-orange-100">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">Engagement Rate</p>
                  <p className="text-3xl font-bold text-gray-900">{engagementRate}</p>
                  <p className="text-sm text-orange-600 flex items-center mt-1">
                    <Activity className="w-3 h-3 mr-1" />
                    Scans per item
                  </p>
                </div>
                <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-amber-500 rounded-lg flex items-center justify-center">
                  <Users className="w-6 h-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-sm border-orange-100">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">Avg. Daily Scans</p>
                  <p className="text-3xl font-bold text-gray-900">{Math.round((analytics?.total_scans || 0) / 7)}</p>
                  <p className="text-sm text-purple-600 flex items-center mt-1">
                    <Clock className="w-3 h-3 mr-1" />
                    Last 7 days
                  </p>
                </div>
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                  <BarChart3 className="w-6 h-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Top Performing Items */}
          <div className="lg:col-span-2">
            <Card className="bg-white/80 backdrop-blur-sm border-orange-100">
              <CardHeader>
                <CardTitle className="flex items-center text-lg font-semibold text-gray-900">
                  <Award className="w-5 h-5 mr-2 text-orange-500" />
                  Top Performing Items
                </CardTitle>
                <CardDescription>Items with the most QR code scans</CardDescription>
              </CardHeader>
              <CardContent>
                {topItems.length === 0 ? (
                  <div className="text-center py-8">
                    <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                      <BarChart3 className="w-6 h-6 text-gray-400" />
                    </div>
                    <p className="text-gray-600">No scan data available yet</p>
                    <p className="text-sm text-gray-500 mt-1">Start promoting your QR codes to see analytics</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {topItems.map((item, index) => (
                      <div key={item.id} className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-amber-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                            {index + 1}
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900">{item.food_item_name || 'Unknown Item'}</p>
                            <p className="text-sm text-gray-600">${item.food_item_price || '0.00'}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-bold text-green-600">{item.scan_count}</p>
                          <p className="text-xs text-gray-500">scans</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Recent Activity */}
          <div>
            <Card className="bg-white/80 backdrop-blur-sm border-orange-100">
              <CardHeader>
                <CardTitle className="flex items-center text-lg font-semibold text-gray-900">
                  <Activity className="w-5 h-5 mr-2 text-green-500" />
                  Recent Activity
                </CardTitle>
                <CardDescription>Latest QR code scans</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {recentActivity.map((activity) => (
                    <div key={activity.id} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                      <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-emerald-500 rounded-full flex items-center justify-center">
                        <Scan className="w-4 h-4 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900 truncate">{activity.item}</p>
                        <p className="text-xs text-gray-500">{activity.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Performance Insights */}
        <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200 mt-8">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-gray-900">Performance Insights</CardTitle>
            <CardDescription>AI-powered recommendations to improve your AR menu performance</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white/60 p-4 rounded-lg">
                <div className="flex items-center mb-2">
                  <TrendingUp className="w-5 h-5 text-green-500 mr-2" />
                  <h4 className="font-semibold text-gray-900">Trending Items</h4>
                </div>
                <p className="text-sm text-gray-600">
                  Your dessert items are getting 40% more scans this week. Consider expanding your dessert menu.
                </p>
              </div>
              <div className="bg-white/60 p-4 rounded-lg">
                <div className="flex items-center mb-2">
                  <Clock className="w-5 h-5 text-blue-500 mr-2" />
                  <h4 className="font-semibold text-gray-900">Peak Hours</h4>
                </div>
                <p className="text-sm text-gray-600">
                  Most scans happen between 6-8 PM. Place QR codes prominently during dinner hours.
                </p>
              </div>
              <div className="bg-white/60 p-4 rounded-lg">
                <div className="flex items-center mb-2">
                  <Target className="w-5 h-5 text-orange-500 mr-2" />
                  <h4 className="font-semibold text-gray-900">Optimization</h4>
                </div>
                <p className="text-sm text-gray-600">
                  Items with 3D models get 60% more engagement than 2D images. Consider upgrading previews.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}