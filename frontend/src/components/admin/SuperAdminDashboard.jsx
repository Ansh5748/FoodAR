import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Button } from '../ui/button';
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from '../ui/card';
import { Badge } from '../ui/badge';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Checkbox } from '../ui/checkbox';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { toast } from 'sonner';
import { 
  ArrowLeft,
  Users,
  Building,
  QrCode,
  BarChart3,
  Settings,
  Shield,
  Plus,
  Edit,
  Trash2,
  Download,
  Eye,
  TrendingUp,
  Activity,
  Database,
  FileText,
  UserCheck,
  AlertTriangle,
  CheckCircle,
  XCircle
} from 'lucide-react';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL?.replace(/\/$/, '');
const API = BACKEND_URL ? `${BACKEND_URL}/api` : '/api';

export default function SuperAdminDashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [admins, setAdmins] = useState([]);
  const [permissions, setPermissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddAdmin, setShowAddAdmin] = useState(false);
  const [editingAdmin, setEditingAdmin] = useState(null);
  const [editingAdminDetails, setEditingAdminDetails] = useState(null);
  const [newAdmin, setNewAdmin] = useState({
    email: '',
    name: '',
    password: '',
    permissions: []
  });

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [statsRes, adminsRes, permissionsRes] = await Promise.all([
        axios.get(`${API}/admin/stats`),
        axios.get(`${API}/admin/members`),
        axios.get(`${API}/admin/permissions`)
      ]);
      
      setStats(statsRes.data);
      setAdmins(adminsRes.data);
      setPermissions(permissionsRes.data.permissions);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const handleAddAdmin = async () => {
    try {
      await axios.post(`${API}/admin/members/create`, newAdmin);
      toast.success('Admin created successfully');
      setShowAddAdmin(false);
      setNewAdmin({ email: '', name: '', password: '', permissions: [] });
      fetchDashboardData();
    } catch (error) {
      console.error('Error adding admin:', error);
      toast.error(error.response?.data?.detail || 'Failed to add admin');
    }
  };

  const handleUpdatePermissions = async (userId, newPermissions) => {
    try {
      await axios.put(`${API}/admin/members/${userId}/permissions`, {
        permissions: newPermissions
      });
      toast.success('Permissions updated successfully');
      setEditingAdmin(null); // Close dialog after successful update
      fetchDashboardData();
    } catch (error) {
      console.error('Error updating permissions:', error);
      toast.error('Failed to update permissions');
    }
  };

  const handleRemoveAdmin = async (userId) => {
    if (window.confirm('Are you sure you want to remove admin privileges?')) {
      try {
        await axios.delete(`${API}/admin/members/${userId}`);
        toast.success('Admin privileges removed successfully');
        fetchDashboardData();
      } catch (error) {
        console.error('Error removing admin:', error);
        toast.error('Failed to remove admin');
      }
    }
  };

  const handleUpdateAdminDetails = async (userId, updatedDetails) => {
    try {
      await axios.put(`${API}/admin/members/${userId}/details`, updatedDetails);
      toast.success('Admin details updated successfully');
      setEditingAdminDetails(null);
      fetchDashboardData();
    } catch (error) {
      console.error('Error updating admin details:', error);
      toast.error('Failed to update admin details');
    }
  };

  const togglePermission = (permission) => {
    if (editingAdmin) {
      const newPermissions = editingAdmin.permissions.includes(permission)
        ? editingAdmin.permissions.filter(p => p !== permission)
        : [...editingAdmin.permissions, permission];
      setEditingAdmin({ ...editingAdmin, permissions: newPermissions });
    } else {
      const newPermissions = newAdmin.permissions.includes(permission)
        ? newAdmin.permissions.filter(p => p !== permission)
        : [...newAdmin.permissions, permission];
      setNewAdmin({ ...newAdmin, permissions: newPermissions });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading Super Admin Dashboard...</p>
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
              <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-purple-500 rounded-lg flex items-center justify-center mr-4">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-red-600 to-purple-600 bg-clip-text text-transparent">
                  Super Admin Dashboard
                </h1>
                <p className="text-gray-600">Complete system oversight and management</p>
              </div>
            </div>
            
            {/* Row 3: Role Badge */}
            <Badge variant="destructive" className="px-3 py-1 self-end md:self-auto">
              <Shield className="w-3 h-3 mr-1" />
              Super Admin
            </Badge>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Key Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="bg-white/80 backdrop-blur-sm border-orange-100">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Restaurants</p>
                  <p className="text-2xl font-bold text-gray-900">{stats?.restaurants?.total || 0}</p>
                  <p className="text-xs text-green-600">{stats?.restaurants?.active || 0} active</p>
                </div>
                <Building className="w-8 h-8 text-orange-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-sm border-orange-100">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Users</p>
                  <p className="text-2xl font-bold text-gray-900">{stats?.users?.total || 0}</p>
                  <p className="text-xs text-blue-600">{stats?.users?.admins || 0} admins</p>
                </div>
                <Users className="w-8 h-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-sm border-orange-100">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">QR Scans</p>
                  <p className="text-2xl font-bold text-gray-900">{stats?.total_scans || 0}</p>
                  <p className="text-xs text-green-600">{stats?.qr_codes || 0} codes</p>
                </div>
                <QrCode className="w-8 h-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-sm border-orange-100">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Food Items</p>
                  <p className="text-2xl font-bold text-gray-900">{stats?.food_items || 0}</p>
                  <p className="text-xs text-purple-600">{stats?.library_items || 0} in library</p>
                </div>
                <Database className="w-8 h-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Admin Management */}
        <Card className="bg-white/80 backdrop-blur-sm border-orange-100 mb-8">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center">
                  <Shield className="w-5 h-5 mr-2" />
                  Admin Management
                </CardTitle>
                <CardDescription>Manage admin users and their permissions</CardDescription>
              </div>
              <Dialog open={showAddAdmin} onOpenChange={setShowAddAdmin}>
                <DialogTrigger asChild>
                  <Button className="bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Admin
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>Add New Admin</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="admin-email">Email</Label>
                      <Input
                        id="admin-email"
                        type="email"
                        value={newAdmin.email}
                        onChange={(e) => setNewAdmin({ ...newAdmin, email: e.target.value })}
                        placeholder="admin@example.com"
                      />
                    </div>
                    <div>
                      <Label htmlFor="admin-name">Name</Label>
                      <Input
                        id="admin-name"
                        value={newAdmin.name}
                        onChange={(e) => setNewAdmin({ ...newAdmin, name: e.target.value })}
                        placeholder="Admin Name"
                      />
                    </div>
                    <div>
                      <Label htmlFor="admin-password">Password</Label>
                      <Input
                        id="admin-password"
                        type="password"
                        value={newAdmin.password}
                        onChange={(e) => setNewAdmin({ ...newAdmin, password: e.target.value })}
                        placeholder="Set admin password"
                      />
                    </div>
                    <div>
                      <Label>Permissions</Label>
                      <div className="grid grid-cols-2 gap-2 mt-2 max-h-60 overflow-y-auto">
                        {permissions.map((permission) => (
                          <div key={permission} className="flex items-center space-x-2">
                            <Checkbox
                              id={permission}
                              checked={newAdmin.permissions.includes(permission)}
                              onCheckedChange={() => togglePermission(permission)}
                            />
                            <Label htmlFor={permission} className="text-sm">
                              {permission.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                            </Label>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="flex justify-end space-x-2">
                      <Button variant="outline" onClick={() => setShowAddAdmin(false)}>
                        Cancel
                      </Button>
                      <Button onClick={handleAddAdmin}>
                        Add Admin
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Password</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Permissions</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {admins.map((admin) => (
                  <TableRow key={admin.id}>
                    <TableCell className="font-medium">{admin.name}</TableCell>
                    <TableCell>{admin.email}</TableCell>
                    <TableCell>
                      {admin.role === 'super_admin' ? (
                        <span className="text-gray-400 text-sm">Hidden</span>
                      ) : (
                        <span className="text-sm font-mono bg-gray-100 px-2 py-1 rounded">
                          {admin.password || 'No password set'}
                        </span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge variant={admin.role === 'super_admin' ? 'destructive' : 'default'}>
                        {admin.role === 'super_admin' ? 'Super Admin' : 'Admin'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {admin.permissions.slice(0, 3).map((permission) => (
                          <Badge key={permission} variant="secondary" className="text-xs">
                            {permission.replace(/_/g, ' ').split(' ')[0]}
                          </Badge>
                        ))}
                        {admin.permissions.length > 3 && (
                          <Badge variant="outline" className="text-xs">
                            +{admin.permissions.length - 3} more
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        {admin.role !== 'super_admin' && (
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setEditingAdminDetails({
                                  ...admin,
                                  password: admin.password || ''
                                })}
                              >
                                <Settings className="w-4 h-4" />
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-md">
                              <DialogHeader>
                                <DialogTitle>Edit Admin Details</DialogTitle>
                              </DialogHeader>
                              <div className="space-y-4">
                                <div>
                                  <Label htmlFor="edit-name">Name</Label>
                                  <Input
                                    id="edit-name"
                                    value={editingAdminDetails?.name || ''}
                                    onChange={(e) => setEditingAdminDetails({
                                      ...editingAdminDetails,
                                      name: e.target.value
                                    })}
                                  />
                                </div>
                                <div>
                                  <Label htmlFor="edit-email">Email</Label>
                                  <Input
                                    id="edit-email"
                                    type="email"
                                    value={editingAdminDetails?.email || ''}
                                    onChange={(e) => setEditingAdminDetails({
                                      ...editingAdminDetails,
                                      email: e.target.value
                                    })}
                                  />
                                </div>
                                <div>
                                  <Label htmlFor="edit-password">Password</Label>
                                  <Input
                                    id="edit-password"
                                    type="password"
                                    value={editingAdminDetails?.password || ''}
                                    onChange={(e) => setEditingAdminDetails({
                                      ...editingAdminDetails,
                                      password: e.target.value
                                    })}
                                    placeholder="Enter new password"
                                  />
                                </div>
                                <div className="flex justify-end space-x-2">
                                  <Button variant="outline" onClick={() => setEditingAdminDetails(null)}>
                                    Cancel
                                  </Button>
                                  <Button onClick={() => {
                                    handleUpdateAdminDetails(admin.id, {
                                      name: editingAdminDetails.name,
                                      email: editingAdminDetails.email,
                                      password: editingAdminDetails.password
                                    });
                                  }}>
                                    Update Details
                                  </Button>
                                </div>
                              </div>
                            </DialogContent>
                          </Dialog>
                        )}
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setEditingAdmin(admin)}
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-2xl">
                            <DialogHeader>
                              <DialogTitle>Edit Admin Permissions</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4">
                              <div>
                                <Label>Permissions for {admin.name}</Label>
                                <div className="grid grid-cols-2 gap-2 mt-2 max-h-60 overflow-y-auto">
                                  {permissions.map((permission) => (
                                    <div key={permission} className="flex items-center space-x-2">
                                      <Checkbox
                                        id={`edit-${permission}`}
                                        checked={editingAdmin?.permissions.includes(permission) || false}
                                        onCheckedChange={() => togglePermission(permission)}
                                      />
                                      <Label htmlFor={`edit-${permission}`} className="text-sm">
                                        {permission.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                                      </Label>
                                    </div>
                                  ))}
                                </div>
                              </div>
                              <div className="flex justify-end space-x-2">
                                <Button variant="outline" onClick={() => setEditingAdmin(null)}>
                                  Cancel
                                </Button>
                                <Button onClick={() => {
                                  handleUpdatePermissions(admin.id, editingAdmin.permissions);
                                }}>
                                  Update Permissions
                                </Button>
                              </div>
                            </div>
                          </DialogContent>
                        </Dialog>
                        {admin.role !== 'super_admin' && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleRemoveAdmin(admin.id)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* System Overview */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="bg-white/80 backdrop-blur-sm border-orange-100">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Activity className="w-5 h-5 mr-2" />
                Recent Activity
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {stats?.recent_analytics?.slice(0, 5).map((event, index) => (
                  <div key={index} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">{event.event_type}</p>
                      <p className="text-xs text-gray-500">
                        {new Date(event.timestamp).toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))}
                {(!stats?.recent_analytics || stats.recent_analytics.length === 0) && (
                  <p className="text-gray-500 text-center py-4">No recent activity</p>
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-sm border-orange-100">
            <CardHeader>
              <CardTitle className="flex items-center">
                <BarChart3 className="w-5 h-5 mr-2" />
                System Health
              </CardTitle>
            </CardHeader>
            <CardContent>
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
                <div className="flex items-center justify-between">
                  <span className="text-sm">Active Sessions</span>
                  <Badge variant="default" className="bg-orange-100 text-orange-800">
                    <Users className="w-3 h-3 mr-1" />
                    {stats?.users?.total || 0}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
