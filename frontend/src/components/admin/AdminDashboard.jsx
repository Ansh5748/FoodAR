import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Button } from '../ui/button';
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from '../ui/card';
import { Badge } from '../ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { toast } from 'sonner';
import { 
  ArrowLeft,
  Users,
  Building,
  QrCode,
  BarChart3,
  Shield,
  Eye,
  TrendingUp,
  Activity,
  Database,
  FileText,
  UserCheck,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Settings,
  Download
} from 'lucide-react';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL?.replace(/\/$/, '');
const API = BACKEND_URL ? `${BACKEND_URL}/api` : '/api';

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [restaurants, setRestaurants] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [userRes, restaurantsRes] = await Promise.all([
        axios.get(`${API}/auth/me`),
        axios.get(`${API}/restaurants`)
      ]);
      
      setUser(userRes.data);
      setRestaurants(restaurantsRes.data);
      
      // Fetch analytics if user has permission
      if (userRes.data.permissions.includes('view_analytics')) {
        try {
          const analyticsRes = await axios.get(`${API}/analytics/restaurant/all`);
          setAnalytics(analyticsRes.data);
        } catch (error) {
          console.log('Analytics not accessible');
        }
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const hasPermission = (permission) => {
    return user?.permissions?.includes(permission) || user?.permissions?.includes('full_super_admin_access');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading Admin Dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-orange-100 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between py-6 space-y-4 md:space-y-0">
            {/* Row 1: Back Button */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate('/dashboard')}
              className="self-start border-orange-200 text-orange-700 hover:bg-orange-50"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Button>
            
            {/* Row 2: Icon and Title */}
            <div className="flex items-center md:flex-1 md:justify-center">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-lg flex items-center justify-center mr-4">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Admin Dashboard
                </h1>
                <p className="text-gray-600">Administrative oversight and management</p>
              </div>
            </div>
            
            {/* Row 3: Role Badge */}
            <Badge variant="default" className="px-3 py-1 self-end md:self-auto">
              <Shield className="w-3 h-3 mr-1" />
              Admin
            </Badge>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Key Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {hasPermission('view_restaurant_status') && (
            <Card className="bg-white/80 backdrop-blur-sm border-orange-100">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Restaurants</p>
                    <p className="text-2xl font-bold text-gray-900">{restaurants.length}</p>
                    <p className="text-xs text-green-600">
                      {restaurants.filter(r => r.is_active !== false).length} active
                    </p>
                  </div>
                  <Building className="w-8 h-8 text-orange-500" />
                </div>
              </CardContent>
            </Card>
          )}

          {hasPermission('view_user_management') && (
            <Card className="bg-white/80 backdrop-blur-sm border-orange-100">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">System Users</p>
                    <p className="text-2xl font-bold text-gray-900">-</p>
                    <p className="text-xs text-blue-600">All users</p>
                  </div>
                  <Users className="w-8 h-8 text-blue-500" />
                </div>
              </CardContent>
            </Card>
          )}

          {hasPermission('view_analytics') && (
            <Card className="bg-white/80 backdrop-blur-sm border-orange-100">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Scans</p>
                    <p className="text-2xl font-bold text-gray-900">{analytics?.total_scans || 0}</p>
                    <p className="text-xs text-green-600">QR interactions</p>
                  </div>
                  <QrCode className="w-8 h-8 text-green-500" />
                </div>
              </CardContent>
            </Card>
          )}

          {hasPermission('view_sales_data') && (
            <Card className="bg-white/80 backdrop-blur-sm border-orange-100">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Revenue</p>
                    <p className="text-2xl font-bold text-gray-900">-</p>
                    <p className="text-xs text-purple-600">Sales data</p>
                  </div>
                  <TrendingUp className="w-8 h-8 text-purple-500" />
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Restaurant Management */}
        {hasPermission('manage_restaurants') && (
          <Card className="bg-white/80 backdrop-blur-sm border-orange-100 mb-8">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Building className="w-5 h-5 mr-2" />
                Restaurant Management
              </CardTitle>
              <CardDescription>Manage restaurant accounts and status</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Restaurant Name</TableHead>
                    <TableHead>Owner</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {restaurants.map((restaurant) => (
                    <TableRow key={restaurant.id}>
                      <TableCell className="font-medium">{restaurant.name}</TableCell>
                      <TableCell>{restaurant.owner_id}</TableCell>
                      <TableCell>
                        <Badge variant={restaurant.is_active !== false ? 'default' : 'destructive'}>
                          {restaurant.is_active !== false ? 'Active' : 'Inactive'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {new Date(restaurant.created_at).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button variant="outline" size="sm">
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button variant="outline" size="sm">
                            <Settings className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}

        {/* Analytics */}
        {hasPermission('view_analytics') && (
          <Card className="bg-white/80 backdrop-blur-sm border-orange-100 mb-8">
            <CardHeader>
              <CardTitle className="flex items-center">
                <BarChart3 className="w-5 h-5 mr-2" />
                Analytics Overview
              </CardTitle>
              <CardDescription>System-wide analytics and insights</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <p className="text-2xl font-bold text-gray-900">{analytics?.total_scans || 0}</p>
                  <p className="text-sm text-gray-600">Total QR Scans</p>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <p className="text-2xl font-bold text-gray-900">{analytics?.total_food_items || 0}</p>
                  <p className="text-sm text-gray-600">Food Items</p>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <p className="text-2xl font-bold text-gray-900">{analytics?.qr_codes?.length || 0}</p>
                  <p className="text-sm text-gray-600">QR Codes</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Reports */}
        {hasPermission('generate_reports') && (
          <Card className="bg-white/80 backdrop-blur-sm border-orange-100 mb-8">
            <CardHeader>
              <CardTitle className="flex items-center">
                <FileText className="w-5 h-5 mr-2" />
                Reports & Exports
              </CardTitle>
              <CardDescription>Generate and download system reports</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <Button variant="outline" className="h-20 flex flex-col items-center justify-center">
                  <Download className="w-6 h-6 mb-2" />
                  <span>Restaurant Report</span>
                </Button>
                <Button variant="outline" className="h-20 flex flex-col items-center justify-center">
                  <Download className="w-6 h-6 mb-2" />
                  <span>Analytics Report</span>
                </Button>
                <Button variant="outline" className="h-20 flex flex-col items-center justify-center">
                  <Download className="w-6 h-6 mb-2" />
                  <span>User Report</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* System Status */}
        <Card className="bg-white/80 backdrop-blur-sm border-orange-100">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Activity className="w-5 h-5 mr-2" />
              System Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Database Status</span>
                  <Badge variant="default" className="bg-green-100 text-green-800">
                    <CheckCircle className="w-3 h-3 mr-1" />
                    Healthy
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">API Status</span>
                  <Badge variant="default" className="bg-green-100 text-green-800">
                    <CheckCircle className="w-3 h-3 mr-1" />
                    Online
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Storage Usage</span>
                  <Badge variant="default" className="bg-blue-100 text-blue-800">
                    <Database className="w-3 h-3 mr-1" />
                    Normal
                  </Badge>
                </div>
              </div>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Active Restaurants</span>
                  <Badge variant="default" className="bg-orange-100 text-orange-800">
                    <Building className="w-3 h-3 mr-1" />
                    {restaurants.filter(r => r.is_active !== false).length}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Total QR Codes</span>
                  <Badge variant="default" className="bg-green-100 text-green-800">
                    <QrCode className="w-3 h-3 mr-1" />
                    {analytics?.qr_codes?.length || 0}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Your Permissions</span>
                  <Badge variant="default" className="bg-purple-100 text-purple-800">
                    <Shield className="w-3 h-3 mr-1" />
                    {user?.permissions?.length || 0}
                  </Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
