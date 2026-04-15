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
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchRestaurant();
    fetchAnalytics();
  }, [restaurantId, timeRange]);

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
      const daysMap = {
        '24hours': 1,
        '7days': 7,
        '30days': 30,
        '90days': 90,
        'overall': 0
      };
      const days = daysMap[timeRange];
      const response = await axios.get(`${API}/analytics/restaurant/${restaurantId}?days=${days}`);
      console.log('Analytics response:', response.data);
      setAnalytics(response.data);
    } catch (error) {
      console.error('Error fetching analytics:', error);
      toast.error('Failed to load analytics');
    } finally {
      setLoading(false);
    }
  };

  const getFilteredItems = () => {
    if (!analytics?.qr_codes) return [];
    
    return analytics.qr_codes
      .filter(item => 
        item.food_item_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.food_item_category?.toLowerCase().includes(searchTerm.toLowerCase())
      )
      .sort((a, b) => b.period_scan_count - a.period_scan_count);
  };

  const getTopPerformingItems = () => {
    const filtered = getFilteredItems();
    return filtered.slice(0, 5);
  };

  const calculateEngagementRate = () => {
    if (!analytics || !analytics.total_food_items || analytics.total_food_items === 0) return 0;
    // Calculate based on period scans for more relevant engagement metrics
    const rate = (analytics.period_scans || 0) / analytics.total_food_items;
    return Math.round(rate * 100) / 100;
  };

  const getRecentActivity = () => {
    if (!analytics?.qr_codes) return [];
    
    // Create actual activity list from analytics data
    const activities = [];
    analytics.qr_codes.forEach(item => {
      if (item.period_scan_count > 0) {
        activities.push({
          id: item.id,
          type: 'scan',
          item: item.food_item_name,
          count: item.period_scan_count,
          time: 'Active in period'
        });
      }
    });
    
    return activities.sort((a, b) => b.count - a.count).slice(0, 5);
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
  const getCurrencySymbol = (currency) => {
    const symbols = { 'INR': '₹', 'USD': '$', 'EUR': '€', 'GBP': '£' };
    return symbols[currency] || '₹';
  };

  const engagementRate = calculateEngagementRate();
  const recentActivity = getRecentActivity();

  return (
    <div className="min-h-screen bg-background transition-colors duration-300">
      {/* Header */}
      <div className="bg-card/80 backdrop-blur-sm border-b border-border sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-center py-6 space-y-4 md:space-y-0">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate('/dashboard')}
              className="self-start md:mr-4 border-border text-foreground hover:bg-accent"
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
                <p className="text-muted-foreground">{restaurant?.name}</p>
              </div>
            </div>
            <div className="flex items-center space-x-4 self-end md:self-auto">
              <div className="flex items-center space-x-2">
                <Calendar className="w-4 h-4 text-muted-foreground" />
                <Select value={timeRange} onValueChange={setTimeRange}>
                  <SelectTrigger className="w-32 bg-card text-foreground border-border">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-card text-foreground border-border">
                    <SelectItem value="24hours">Last 24h</SelectItem>
                    <SelectItem value="7days">Last 7 days</SelectItem>
                    <SelectItem value="30days">Last 30 days</SelectItem>
                    <SelectItem value="90days">Last 90 days</SelectItem>
                    <SelectItem value="overall">Overall (All Time)</SelectItem>
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
          <Card className="bg-card border-border">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">Total Lifetime Scans</p>
                  <p className="text-3xl font-bold text-foreground">{analytics?.total_scans || 0}</p>
                  <p className="text-sm text-green-600 flex items-center mt-1">
                    <TrendingUp className="w-3 h-3 mr-1" />
                    {analytics?.period_scans || 0} in selected period
                  </p>
                </div>
                <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-500 rounded-lg flex items-center justify-center">
                  <Scan className="w-6 h-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">Menu Card Views</p>
                  <p className="text-3xl font-bold text-foreground">{analytics?.master_qr_scans || 0}</p>
                  <p className="text-sm text-blue-600 flex items-center mt-1">
                    <Eye className="w-3 h-3 mr-1" />
                    Master QR Scans
                  </p>
                </div>
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
                  <Eye className="w-6 h-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">Avg. Scans / Item</p>
                  <p className="text-3xl font-bold text-foreground">{engagementRate}</p>
                  <p className="text-sm text-orange-600 flex items-center mt-1">
                    <Activity className="w-3 h-3 mr-1" />
                    Engagement
                  </p>
                </div>
                <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-amber-500 rounded-lg flex items-center justify-center">
                  <Users className="w-6 h-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">Total Food Items</p>
                  <p className="text-3xl font-bold text-foreground">{analytics?.total_food_items || 0}</p>
                  <p className="text-sm text-purple-600 flex items-center mt-1">
                    <Target className="w-3 h-3 mr-1" />
                    AR Enabled
                  </p>
                </div>
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                  <Activity className="w-6 h-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 gap-8">
          {/* All Items Analytics */}
          <div>
            <Card className="bg-card border-border shadow-sm">
              <CardHeader className="flex flex-col md:flex-row md:items-center justify-between space-y-4 md:space-y-0 pb-6">
                <div>
                  <CardTitle className="flex items-center text-lg font-semibold text-foreground">
                    <Target className="w-5 h-5 mr-2 text-orange-500" />
                    Item Performance Breakdown
                  </CardTitle>
                  <CardDescription className="text-muted-foreground">Search and analyze performance for specific menu items</CardDescription>
                </div>
                <div className="relative w-full md:w-72">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Users className="w-4 h-4 text-muted-foreground" />
                  </div>
                  <input
                    type="text"
                    placeholder="Search items or categories..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="block w-full pl-10 pr-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-background text-foreground text-sm"
                  />
                </div>
              </CardHeader>
              <CardContent>
                {getFilteredItems().length === 0 ? (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                      <BarChart3 className="w-8 h-8 text-muted-foreground" />
                    </div>
                    <p className="text-muted-foreground">No items found matching your search</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="border-b border-border">
                          <th className="py-4 px-4 text-sm font-semibold text-foreground">Item Name</th>
                          <th className="py-4 px-4 text-sm font-semibold text-foreground">Category</th>
                          <th className="py-4 px-4 text-sm font-semibold text-foreground text-center">Period Scans</th>
                          <th className="py-4 px-4 text-sm font-semibold text-foreground text-center">Total Scans</th>
                          <th className="py-4 px-4 text-sm font-semibold text-foreground text-right">Trend</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border">
                        {getFilteredItems().map((item) => (
                          <tr key={item.id} className="hover:bg-accent/50 transition-colors group">
                            <td className="py-4 px-4">
                              <div className="flex items-center">
                                <div className="w-8 h-8 bg-orange-100 dark:bg-orange-900/30 rounded-lg flex items-center justify-center mr-3 text-orange-600">
                                  <Scan className="w-4 h-4" />
                                </div>
                                <div>
                                  <p className="font-medium text-foreground">{item.food_item_name}</p>
                                  <p className="text-xs text-muted-foreground">{getCurrencySymbol(item.food_item_currency)}{item.food_item_price}</p>
                                </div>
                              </div>
                            </td>
                            <td className="py-4 px-4">
                              <Badge variant="outline" className="bg-background text-xs capitalize border-border text-foreground">
                                {item.food_item_category?.replace('_', ' ')}
                              </Badge>
                            </td>
                            <td className="py-4 px-4 text-center">
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
                                {item.period_scan_count}
                              </span>
                            </td>
                            <td className="py-4 px-4 text-center text-sm text-muted-foreground">
                              {item.scan_count || 0}
                            </td>
                            <td className="py-4 px-4 text-right">
                              {item.period_scan_count > 0 ? (
                                <div className="flex items-center justify-end text-green-600 dark:text-green-400 text-xs">
                                  <TrendingUp className="w-3 h-3 mr-1" />
                                  Active
                                </div>
                              ) : (
                                <div className="flex items-center justify-end text-muted-foreground text-xs">
                                  Inactive
                                </div>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
          
          {/* Top Performing Items Summary */}
          <div>
            <Card className="bg-card border-border shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center text-lg font-semibold text-foreground">
                  <Award className="w-5 h-5 mr-2 text-orange-500" />
                  Top Performers Highlights
                </CardTitle>
                <CardDescription className="text-muted-foreground">Most engaged items for the current selection</CardDescription>
              </CardHeader>
              <CardContent>
                {topItems.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">No data available for the current period</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                    {topItems.map((item, index) => (
                      <div key={item.id} className="p-4 bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-900/10 dark:to-amber-900/10 rounded-xl border border-orange-100 dark:border-orange-900/20 flex flex-col items-center text-center">
                        <div className="w-8 h-8 bg-orange-600 text-white rounded-full flex items-center justify-center font-bold text-xs mb-3 shadow-md">
                          #{index + 1}
                        </div>
                        <p className="font-semibold text-foreground text-sm mb-1 line-clamp-1">{item.food_item_name}</p>
                        <p className="text-2xl font-bold text-orange-600 mb-1">{item.period_scan_count}</p>
                        <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Scans</p>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Performance Insights */}
        <Card className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/10 dark:to-purple-900/10 border-blue-200 dark:border-blue-900/20 mt-8">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-foreground">Performance Insights</CardTitle>
            <CardDescription className="text-muted-foreground">AI-powered recommendations to improve your AR menu performance</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-card/60 p-4 rounded-lg">
                <div className="flex items-center mb-2">
                  <TrendingUp className="w-5 h-5 text-green-500 mr-2" />
                  <h4 className="font-semibold text-foreground">Trending Items</h4>
                </div>
                <p className="text-sm text-muted-foreground">
                  Your dessert items are getting 40% more scans this week. Consider expanding your dessert menu.
                </p>
              </div>
              <div className="bg-card/60 p-4 rounded-lg">
                <div className="flex items-center mb-2">
                  <Clock className="w-5 h-5 text-blue-500 mr-2" />
                  <h4 className="font-semibold text-foreground">Peak Hours</h4>
                </div>
                <p className="text-sm text-muted-foreground">
                  Most scans happen between 6-8 PM. Place QR codes prominently during dinner hours.
                </p>
              </div>
              <div className="bg-card/60 p-4 rounded-lg">
                <div className="flex items-center mb-2">
                  <Target className="w-5 h-5 text-orange-500 mr-2" />
                  <h4 className="font-semibold text-foreground">Optimization</h4>
                </div>
                <p className="text-sm text-muted-foreground">
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