import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from '../ui/card';
import { Badge } from '../ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../ui/tabs';
import { toast } from 'sonner';
import { 
  ArrowLeft,
  Search,
  Eye,
  Box,
  Video,
  Camera,
  Filter,
  Grid3X3,
  List,
  UtensilsCrossed
} from 'lucide-react';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL?.replace(/\/$/, '');
const API = BACKEND_URL ? `${BACKEND_URL}/api` : '/api';

const PAGE_SIZE = 40; // Fixed page size as requested

const CATEGORIES = [
  { value: 'all', label: 'All Categories' },
  { value: 'starters', label: 'Starters' },
  { value: 'main_course', label: 'Main Course' },
  { value: 'desserts', label: 'Desserts' },
  { value: 'drinks', label: 'Drinks' }
];

// Removed PREVIEW_TYPES filter since every product now has all three types
const SORT_OPTIONS = [
  { value: 'name_asc', label: 'Name A-Z' },
  { value: 'name_desc', label: 'Name Z-A' },
  { value: 'category_asc', label: 'Category A-Z' },
  { value: 'newest', label: 'Newest First' },
  { value: 'oldest', label: 'Oldest First' }
];

export default function FoodLibrary() {
  const navigate = useNavigate();
  const [libraryItems, setLibraryItems] = useState([]);
  const [filteredItems, setFilteredItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState('name_asc');
  const [viewMode, setViewMode] = useState('grid'); // grid or list
  const [previewItem, setPreviewItem] = useState(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [modelViewerReady, setModelViewerReady] = useState(false);
  const [selectedTags, setSelectedTags] = useState([]); // multi-select tags
  const [page, setPage] = useState(1);

  useEffect(() => {
    fetchLibraryItems();
  }, []);

  useEffect(() => {
    filterItems();
  }, [libraryItems, searchTerm, selectedCategory, sortBy, selectedTags]);

  // Load model-viewer script when needed
  useEffect(() => {
    if (isPreviewOpen && !modelViewerReady) {
      const existing = document.querySelector('script[data-model-viewer]');
      if (!existing) {
        const script = document.createElement('script');
        script.src = 'https://unpkg.com/@google/model-viewer/dist/model-viewer.min.js';
        script.async = true;
        script.setAttribute('data-model-viewer', 'true');
        script.type = 'module';
        script.onload = () => {
          console.log('Model viewer script loaded successfully');
          setModelViewerReady(true);
        };
        script.onerror = (error) => {
          console.error('Failed to load model viewer script:', error);
          toast.error('Failed to load 3D viewer. Please try again later.');
        };
        document.head.appendChild(script);
        
        return () => {
          // Only remove if it exists to prevent errors
          if (document.head.contains(script)) {
            document.head.removeChild(script);
          }
        };
      } else {
        setModelViewerReady(true);
      }
    }
  }, [isPreviewOpen, modelViewerReady]);

  const fetchLibraryItems = async () => {
    try {
      const response = await axios.get(`${API}/food-library`);
      setLibraryItems(response.data);
    } catch (error) {
      console.error('Error fetching library items:', error);
      toast.error('Failed to load food library');
    } finally {
      setLoading(false);
    }
  };

  const getAllTags = () => {
    const tagSet = new Set();
    for (const item of libraryItems) {
      if (Array.isArray(item.tags)) {
        item.tags.forEach(t => tagSet.add(String(t)));
      }
    }
    return Array.from(tagSet).sort((a, b) => a.localeCompare(b));
  };

  const filterItems = () => {
    let filtered = libraryItems;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(item =>
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    // Category filter
    if (selectedCategory && selectedCategory !== 'all') {
      filtered = filtered.filter(item => item.category === selectedCategory);
    }

    // Tag filter (must include all selected tags)
    if (selectedTags.length > 0) {
      filtered = filtered.filter(item =>
        Array.isArray(item.tags) && selectedTags.every(t => item.tags.includes(t))
      );
    }

    // Sort items
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'name_asc':
          return a.name.localeCompare(b.name);
        case 'name_desc':
          return b.name.localeCompare(a.name);
        case 'category_asc':
          return a.category.localeCompare(b.category);
        case 'newest':
          return new Date(b.created_at) - new Date(a.created_at);
        case 'oldest':
          return new Date(a.created_at) - new Date(b.created_at);
        default:
          return 0;
      }
    });

    setFilteredItems(filtered);
    setPage(1); // reset page when filters change
  };

  const handlePreview = (item) => {
    setPreviewItem(item);
    setIsPreviewOpen(true);
  };

  const getPreviewIcon = (type) => {
    // Since every item now has all three types, just return a generic icon
    return Box;
  };

  const handleChangePage = (nextPage) => {
    setPage(nextPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading food library...</p>
        </div>
      </div>
    );
  }

  const totalPages = Math.max(1, Math.ceil(filteredItems.length / PAGE_SIZE));
  const start = (page - 1) * PAGE_SIZE;
  const end = start + PAGE_SIZE;
  const pageItems = filteredItems.slice(start, end);

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-orange-100 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-center py-4 sm:py-6 gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate('/dashboard')}
              className="self-start mr-4 border-orange-200 text-orange-700 hover:bg-orange-50"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Dashboard
            </Button>
            <div className="flex items-center">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-lg flex items-center justify-center sm:mr-4 mr-2">
                <UtensilsCrossed className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Food Library
                </h1>
                <p className="text-gray-600">Explore 2D, 3D and 360° previews for your menu</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filters */}
        <Card className="bg-white/80 backdrop-blur-sm border-orange-100 mb-8">
          <CardContent className="p-6">
            <div className="flex flex-col lg:flex-row gap-4">
              {/* Search */}
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="Search food items or tags..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 border-gray-200 focus:border-orange-500 focus:ring-orange-500"
                  />
                </div>
              </div>

              {/* Category Filter */}
              <div className="min-w-48">
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger className="border-gray-200 focus:border-orange-500 focus:ring-orange-500">
                    <SelectValue placeholder="Filter by category" />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map((category) => (
                      <SelectItem key={category.value} value={category.value}>
                        {category.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Sort Filter */}
              <div className="min-w-48">
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="border-gray-200 focus:border-orange-500 focus:ring-orange-500">
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    {SORT_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* View Mode Toggle */}
              <div className="flex border border-gray-200 rounded-lg overflow-hidden">
                <Button
                  variant={viewMode === 'grid' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('grid')}
                  className="rounded-none"
                >
                  <Grid3X3 className="w-4 h-4" />
                </Button>
                <Button
                  variant={viewMode === 'list' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('list')}
                  className="rounded-none"
                >
                  <List className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Tag selector pane */}
            <div className="mt-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-700">Tags</span>
                <Button variant="ghost" size="sm" onClick={() => setSelectedTags([])}>Clear</Button>
              </div>
              <div className="flex gap-2 overflow-x-auto py-1">
                {getAllTags().map(tag => {
                  const active = selectedTags.includes(tag);
                  return (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => {
                        setSelectedTags((prev) => active ? prev.filter(t => t !== tag) : [...prev, tag]);
                      }}
                      className={`px-3 py-1 rounded-full text-sm border ${active ? 'bg-orange-100 border-orange-300 text-orange-800' : 'bg-white border-gray-200 text-gray-700'} whitespace-nowrap`}
                    >
                      {tag}
                    </button>
                  );
                })}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Results Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              Library Items ({filteredItems.length})
            </h2>
            <p className="text-gray-600">
              {searchTerm || selectedCategory !== 'all' || selectedTags.length > 0
                ? 'Filtered results'
                : 'All available food models and videos'
              }
            </p>
          </div>
        </div>

        {/* Library Items */}
        {pageItems.length === 0 ? (
          <Card className="bg-white/80 backdrop-blur-sm border-orange-100">
            <CardContent className="p-12 text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Filter className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No items found</h3>
              <p className="text-gray-600 mb-6">
                Try adjusting your search terms or filters
              </p>
              <Button
                variant="outline"
                onClick={() => {
                  setSearchTerm('');
                  setSelectedCategory('all');
                  setSortBy('name_asc');
                  setSelectedTags([]);
                }}
              >
                Clear Filters
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className={viewMode === 'grid' 
            ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'
            : 'space-y-4'
          }>
            {pageItems.map((item) => {
              const PreviewIcon = getPreviewIcon(item.preview_type);
              
              if (viewMode === 'list') {
                return (
                  <Card key={item.id} className="bg-white/80 backdrop-blur-sm border-orange-100 hover:shadow-lg transition-all duration-200">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4 flex-1">
                          <div className="w-16 h-16 rounded-md overflow-hidden bg-gray-100 dark:bg-gray-800 flex-shrink-0">
                            <img
                              src={item.image_url || item.thumbnail_url}
                              alt={item.name}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                console.error("Failed to load thumbnail:", item.image_url);
                                e.target.src = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=1000&auto=format&fit=crop';
                              }}
                            />
                          </div>
                          <div className="flex-1">
                            <h3 className="font-semibold text-gray-900 mb-1">{item.name}</h3>
                            <div className="flex items-center space-x-2 mb-2">
                              <Badge variant="secondary" className="bg-orange-100 text-orange-700">
                                {CATEGORIES.find(c => c.value === item.category)?.label}
                              </Badge>
                              {/* Removed type badge since all items have all types */}
                            </div>
                            <div className="flex flex-wrap gap-1">
                              {item.tags.slice(0, 3).map((tag) => (
                                <span key={tag} className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded">
                                  {tag}
                                </span>
                              ))}
                              {item.tags.length > 3 && (
                                <span className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded">
                                  +{item.tags.length - 3} more
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handlePreview(item)}
                          className="border-green-200 text-green-700 hover:bg-green-50"
                        >
                          <Eye className="w-4 h-4 mr-2" />
                          Preview
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              }

              return (
                <Card key={item.id} className="bg-white/80 backdrop-blur-sm border-orange-100 hover:shadow-lg transition-all duration-200 group">
                  <CardContent className="p-0">
                    {/* Preview Image/Icon */}
                    <div className="aspect-square bg-gradient-to-br from-gray-200 to-gray-300 relative overflow-hidden rounded-t-lg">
                      <img 
                        src={item.image_url || item.thumbnail_url} 
                        alt={item.name}
                        className="w-full h-full object-cover transition-all duration-300 group-hover:scale-105"
                        onError={(e) => {
                          console.error("Failed to load thumbnail:", item.image_url);
                          e.target.src = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=1000&auto=format&fit=crop';
                        }}
                      />
                      <div className="absolute inset-0 flex items-center justify-center" style={{display: 'none'}}>
                        <PreviewIcon className="w-16 h-16 text-gray-600" />
                      </div>
                      <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-200 flex items-center justify-center opacity-0 group-hover:opacity-100">
                        <Button
                          size="sm"
                          onClick={() => handlePreview(item)}
                          className="bg-white text-gray-900 hover:bg-gray-100"
                        >
                          <Eye className="w-4 h-4 mr-2" />
                          Preview
                        </Button>
                      </div>
                    </div>
                    
                    {/* Content */}
                    <div className="p-4">
                      <h3 className="font-semibold text-gray-900 mb-2 line-clamp-1">
                        {item.name}
                      </h3>
                      <div className="flex items-center space-x-2 mb-3">
                        <Badge variant="secondary" className="bg-orange-100 text-orange-700 text-xs">
                          {CATEGORIES.find(c => c.value === item.category)?.label}
                        </Badge>
                        {/* Removed type badge since all items have all types */}
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {item.tags.slice(0, 2).map((tag) => (
                          <span key={tag} className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded">
                            {tag}
                          </span>
                        ))}
                        {item.tags.length > 2 && (
                          <span className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded">
                            +{item.tags.length - 2}
                          </span>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        {/* Pagination controls */}
        {filteredItems.length > 0 && (
          <div className="flex items-center justify-between mt-6">
            <div className="text-sm text-gray-600">
              Showing {Math.min(start + 1, filteredItems.length)}–{Math.min(end, filteredItems.length)} of {filteredItems.length}
            </div>
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm" disabled={page === 1} onClick={() => handleChangePage(Math.max(1, page - 1))}>Previous</Button>
              <span className="text-sm text-gray-700">Page {page} of {totalPages}</span>
              <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => handleChangePage(Math.min(totalPages, page + 1))}>Next</Button>
            </div>
          </div>
        )}
      </div>

      {/* Preview Modal */}
      <Dialog open={isPreviewOpen} onOpenChange={(open) => { if (!open) { setIsPreviewOpen(false); setPreviewItem(null); } }}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle className="flex items-center">
              {previewItem?.name}
              {previewItem && (
                <Badge variant="outline" className="ml-2">
                  {previewItem.preview_type === '3d_model' ? '3D Model' : previewItem.preview_type === '360_video' ? '360° Video' : '2D Image'}
                </Badge>
              )}
            </DialogTitle>
          </DialogHeader>
          <div className="w-full">
            {previewItem && (
              <Tabs defaultValue="image" className="w-full">
                <TabsList className="mb-3">
                  <TabsTrigger value="image">Image</TabsTrigger>
                  <TabsTrigger value="model">3D Model</TabsTrigger>
                  <TabsTrigger value="video">360° Video</TabsTrigger>
                </TabsList>

                <TabsContent value="image">
                  <div className="w-full aspect-video flex items-center justify-center bg-black/5 rounded-lg overflow-hidden relative">
                    <img 
                      src={previewItem.image_url} 
                      alt={previewItem.name} 
                      className="w-full h-full object-contain bg-black" 
                      loading="eager"
                      onError={(e) => {
                        console.error("Failed to load image:", previewItem.image_url);
                        // Prevent infinite error loop by removing the error handler
                        e.target.onerror = null;
                        // Set a fallback image
                        e.target.src = previewItem.thumbnail_url || previewItem.file_url || "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=1000&auto=format&fit=crop";
                      }}
                    />
                  </div>
                </TabsContent>

                <TabsContent value="model">
                  <div className="w-full aspect-video flex items-center justify-center bg-black/5 rounded-lg overflow-hidden relative">
                    {previewItem.model_url ? (
                      <iframe
                        src={previewItem.model_url}
                        title={`3D model of ${previewItem.name}`}
                        className="w-full h-full border-0"
                        allow="autoplay; fullscreen; vr"
                        allowFullScreen
                        style={{ minHeight: '400px' }}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-600">
                        <div className="text-center p-4">
                          <p className="text-red-500 font-medium">No 3D model available</p>
                          <p className="text-gray-600 text-sm mt-2">This item does not have a 3D model URL</p>
                        </div>
                      </div>
                    )}
                  </div>
                </TabsContent>

                <TabsContent value="video">
                  <div className="w-full aspect-video flex items-center justify-center bg-black/5 rounded-lg overflow-hidden relative">
                    {previewItem.video_url ? (
                      <video 
                        src={previewItem.video_url} 
                        controls 
                        autoPlay
                        playsInline 
                        className="w-full h-full object-contain bg-black"
                        poster={previewItem.image_url}
                        onLoadStart={() => console.log("Video loading started:", previewItem.video_url)}
                        onCanPlay={() => console.log("Video can play now:", previewItem.video_url)}
                        onError={(e) => {
                          console.error("Failed to load video:", previewItem.video_url, e);
                        }}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-600">
                        <div className="text-center p-4">
                          <p className="text-red-500 font-medium">No 360° video available</p>
                          <p className="text-gray-600 text-sm mt-2">This item does not have a 360° video URL</p>
                        </div>
                      </div>
                    )}
                  </div>
                </TabsContent>
              </Tabs>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}