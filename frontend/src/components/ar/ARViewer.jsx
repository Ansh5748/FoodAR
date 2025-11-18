import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button, buttonVariants } from '../ui/button';
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from '../ui/card';
import { Badge } from '../ui/badge';
import { toast } from 'sonner';
import { 
  ArrowLeft, 
  RotateCcw, 
  ZoomIn, 
  ZoomOut, 
  Camera,
  Share2,
  Info,
  Building,
  DollarSign,
  UtensilsCrossed,
  Phone,
  MapPin,
  Star,
  ShoppingCart,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import axios from 'axios';
import { cn } from '../../lib/utils';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export default function ARViewer() {
  const { foodItemId } = useParams();
  const navigate = useNavigate();
  const [foodData, setFoodData] = useState(null);
  const [restaurantItems, setRestaurantItems] = useState([]);
  const [currentItemIndex, setCurrentItemIndex] = useState(-1);
  const [loading, setLoading] = useState(true);
  const [arLoaded, setArLoaded] = useState(false);
  const [showInfo, setShowInfo] = useState(false);
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [specialInstructions, setSpecialInstructions] = useState('');
  const sceneRef = useRef(null);
  const [videoAspect, setVideoAspect] = useState(1);
  const [previewUrl, setPreviewUrl] = useState(null);

  useEffect(() => {
    setLoading(true);
    setFoodData(null);
    fetchFoodItem();
    // These are called inside fetchFoodItem's success path now
    trackScan();
    loadARScript();
  }, [foodItemId]);

  useEffect(() => {
  if (!arLoaded || !window.AFRAME) return;

  if (window.AFRAME.components['interactive-rotation']) return;

  window.AFRAME.registerComponent('interactive-rotation', {
    schema: {
      enabled: { type: 'boolean', default: true }
    },
    init: function () {
      const el = this.el;
      const obj = el.object3D;
      const sceneEl = el.sceneEl;
      
      this.dragging = false;
      this.startX = 0;
      this.startY = 0;

      const stopAutoRotation = () => {
        if (el.hasAttribute('animation__spin')) el.removeAttribute('animation__spin');
      };

      const onDown = (x, y) => {
        if (sceneEl.camera) sceneEl.camera.el.setAttribute('look-controls', {enabled: false});
        if (!this.data.enabled) return;
        this.dragging = true;
        this.startX = x;
        this.startY = y;
        stopAutoRotation();
      };

      const onMove = (x, y) => {
        if (!this.dragging || !this.data.enabled) return;

        let deltaX = x - this.startX;
        let deltaY = y - this.startY;

        this.startX = x;
        this.startY = y;

        const MAX_SPEED = 12; 

        deltaX = THREE.MathUtils.clamp(deltaX, -MAX_SPEED, MAX_SPEED);
        deltaY = THREE.MathUtils.clamp(deltaY, -MAX_SPEED, MAX_SPEED);

        let nextX = obj.rotation.x + deltaY * 0.01;
        nextX = THREE.MathUtils.clamp(nextX, -0.35, 0.35);

        obj.rotation.x = nextX;
        obj.rotation.y += deltaX * 0.01;
};


    const onUp = () => {
      if (sceneEl.camera) sceneEl.camera.el.setAttribute('look-controls', {enabled: true});
      if (!this.data.enabled) return;
      this.dragging = false;
    };

    const attachListeners = (canvas) => {
      // --- Mouse Listeners ---
      const handleMouseDown = (e) => {
        e.preventDefault();
        onDown(e.clientX, e.clientY);
      };
      const handleMouseMove = (e) => {
        e.preventDefault();
        onMove(e.clientX, e.clientY);
      };
      const handleMouseUp = (e) => {
        e.preventDefault();
        onUp();
      };

      canvas.addEventListener('mousedown', handleMouseDown);
      canvas.addEventListener('mousemove', handleMouseMove);
      canvas.addEventListener('mouseup', handleMouseUp);
      canvas.addEventListener('mouseleave', handleMouseUp); // Use mouseup handler for leave

      // --- Touch Listeners ---
      const handleTouchStart = (e) => {
        // Prevent default touch actions like scrolling or zooming
        e.preventDefault();
        onDown(e.touches[0].clientX, e.touches[0].clientY);
      };
      const handleTouchMove = (e) => {
        e.preventDefault();
        onMove(e.touches[0].clientX, e.touches[0].clientY);
      };
      const handleTouchEnd = (e) => {
        e.preventDefault();
        onUp();
      };

      canvas.addEventListener('touchstart', handleTouchStart, { passive: false });
      canvas.addEventListener('touchmove', handleTouchMove, { passive: false });
      canvas.addEventListener('touchend', handleTouchEnd, { passive: false });
      canvas.addEventListener('touchcancel', handleTouchEnd, { passive: false });
    };

      // Ensure the A-Frame canvas exists before attaching
      if (el.sceneEl.canvas) {
        attachListeners(el.sceneEl.canvas);
      } else {
        el.sceneEl.addEventListener('renderstart', () => {
          attachListeners(el.sceneEl.canvas);
        });
      }
    },
    tick: function () {} // Position is now handled by the parent container
  });
}, [arLoaded]);

// useEffect(() => {
//   if (!arLoaded || !window.AFRAME) return;

//   // prevent double registration
//   if (window.AFRAME.components["position-lock"]) return;

//   window.AFRAME.registerComponent("position-lock", {
//     schema: {
//       x: { type: "number", default: 0 },
//       y: { type: "number", default: 0 },
//       z: { type: "number", default: -3 }
//     },

//     init: function () {
//       // same logic as interactive-rotation: store fixed position
//       this.fixedPosition = new THREE.Vector3(
//         this.data.x,
//         this.data.y,
//         this.data.z
//       );
//     },

//     tick: function () {
//       // same line you used inside interactive-rotation
//       this.el.object3D.position.copy(this.fixedPosition);
//     }
//   });
// }, [arLoaded]);


 useEffect(() => {
  if (!previewUrl) return;

  const video = document.createElement("video");
  video.src = previewUrl;

  const onLoaded = () => {
    const aspect = video.videoWidth / video.videoHeight;
    setVideoAspect(aspect);
  };

  video.addEventListener("loadedmetadata", onLoaded);

  return () => video.removeEventListener("loadedmetadata", onLoaded);
}, [previewUrl]);


  const fetchFoodItem = async () => {
    try {
      const response = await axios.get(`${API}/food-items/${foodItemId}`, { headers: { Authorization: null } });
      const fetchedFoodData = response.data;
      setFoodData(fetchedFoodData);
      
      const mapping = fetchedFoodData.food_item_mapping;
      const lib = fetchedFoodData.library_item;
      if (mapping?.model_glb_url || fetchedFoodData.food_item.preview_type === '3d_model') {
          const fi = fetchedFoodData.food_item;

            const glbUrl = fi?.preview_url || mapping?.model_glb_url || fi?.model_glb_url || lib?.model_glb_url || null;
        setPreviewUrl(glbUrl);
      } else {
        const file = fetchedFoodData.food_item.preview_url || fetchedFoodData.library_item;
        setPreviewUrl(file);
      }

      if (fetchedFoodData && fetchedFoodData.restaurant) {
        const restaurantId = fetchedFoodData.restaurant.id;
        const itemsResponse = await axios.get(`${API}/public/restaurants/${restaurantId}/food-items`, { headers: { Authorization: null } });
        const allItems = itemsResponse.data;
        setRestaurantItems(allItems);

        const currentIndex = allItems.findIndex(item => item.id === foodItemId);
        setCurrentItemIndex(currentIndex);
      } else {
        setRestaurantItems([]);
        setCurrentItemIndex(-1);
      }

    } catch (error) {
      console.error('Error fetching food item:', error);
      toast.error('Failed to load food item');
    } finally {
      setLoading(false);
    }
  };

  const handleNavigation = (direction) => {
    let nextIndex = currentItemIndex + direction;
    if (nextIndex >= 0 && nextIndex < restaurantItems.length) {
      const nextFoodItemId = restaurantItems[nextIndex].id;
      navigate(`/ar/${nextFoodItemId}`);
    }
  };

  const canNavigatePrev = currentItemIndex > 0;
  const canNavigateNext = currentItemIndex < restaurantItems.length - 1 && currentItemIndex !== -1;



  const trackScan = async () => {
    try {
      await axios.post(`${API}/analytics/scan`, {
        food_item_id: foodItemId,
        qr_code_id: 'scanned',
        user_agent: navigator.userAgent
      }, { headers: { Authorization: null } });
    } catch (error) {
      console.error('Error tracking scan:', error);
    }
  };

  const loadARScript = () => {
    // Check if A-Frame is already loaded to prevent duplicate registration
    if (window.AFRAME) {
      console.log('A-Frame already loaded, skipping script load');
      setArLoaded(true);
      return;
    }
    
    // Check if scripts are already being loaded
    if (document.querySelector('script[src*="aframe.min.js"]')) {
      console.log('A-Frame script is already loading');
      
      // Wait for it to be ready
      const checkAFrame = setInterval(() => {
        if (window.AFRAME) {
          clearInterval(checkAFrame);
          setArLoaded(true);
        }
      }, 100);
      
      return;
    }
    
    // Load A-Frame and AR.js scripts
    const aframeScript = document.createElement('script');
    aframeScript.src = 'https://aframe.io/releases/1.4.0/aframe.min.js';
    aframeScript.onload = () => {
      // Check if AR.js is already loaded
      if (!document.querySelector('script[src*="aframe-ar.min.js"]')) {
        const arScript = document.createElement('script');
        arScript.src = 'https://cdn.jsdelivr.net/gh/AR-js-org/AR.js@3.4.5/aframe/build/aframe-ar.min.js';
        arScript.onload = () => {
          setArLoaded(true);
        };
        document.head.appendChild(arScript);
      } else {
        setArLoaded(true);
      }
    };
    document.head.appendChild(aframeScript);
  };

  const handleShare = async () => {
    if (navigator.share && foodData) {
      try {
        await navigator.share({
          title: `${foodData.food_item.name} - AR Preview`,
          text: `Check out this amazing AR preview of ${foodData.food_item.name}!`,
          url: window.location.href
        });
      } catch (error) {
        console.error('Error sharing:', error);
      }
    } else {
      // Fallback: copy to clipboard
      try {
        await navigator.clipboard.writeText(window.location.href);
        toast.success('Link copied to clipboard!');
      } catch (error) {
        console.error('Error copying to clipboard:', error);
        toast.error('Failed to copy link');
      }
    }
  };

  const handleOrder = () => {
    setShowOrderModal(true);
  };

  const handlePlaceOrder = () => {
    // Here you would typically integrate with a payment system or order management
    const orderData = {
      food_item_id: foodData.food_item.id,
      food_name: foodData.food_item.name,
      quantity: quantity,
      special_instructions: specialInstructions,
      total_price: foodData.food_item.price * quantity,
      restaurant: foodData.restaurant
    };
    
    console.log('Order placed:', orderData);
    toast.success(`Order placed for ${quantity}x ${foodData.food_item.name}!`);
    setShowOrderModal(false);
    setQuantity(1);
    setSpecialInstructions('');
  };

  const getCurrencySymbol = (currency) => {
    const symbols = {
      'INR': '₹',
      'USD': '$',
      'EUR': '€',
      'GBP': '£'
    };
    return symbols[currency] || '₹';
  };

  const getPreviewContent = () => {
    if (!foodData) return null;

    const { food_item} = foodData;
    const pv = previewUrl;

    switch (food_item.preview_type) {
      case '3d_model':
        return (
          <a-entity position="0 0 -2">
            <a-entity
              id="interactive-model"
              gltf-model={pv}
              scale="0.025 0.025 0.025"
              animation__spin="property: rotation; to: 0 360 0; loop: true; dur: 5000"
              interactive-rotation="enabled: true"
            />
          </a-entity>
        );
      case '360_video':
        return (
          <a-plane
            position="0 0 -3"
            width={4 * videoAspect}
            height="4.7"
            material={`shader: flat; src: ${pv || '#fallbackVideo'}`}
            interactive-rotation="enabled: false" 
            ></a-plane>
        );
      case '2d_image':
        return (
          <a-image
            src={pv || food_item.image_url}
            width="2.5"
            height="2.5"
            scale="0.5 0.5 0.5"
            interactive-rotation="enabled: false" 
          />
        );
      default:
        return (
          <a-box
            rotation="0 45 0"
            width="1"
            height="1"
            depth="1"
            color="#fb923c"
            animation="property: rotation; to: 0 405 0; loop: true; dur: 10000"
          />
        );
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-transparent flex items-center justify-center">
        <div className="text-center text-white">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p>Loading AR experience...</p>
        </div>
      </div>
    );
  }

  if (!foodData) {
    return (
      <div className="min-h-screen bg-black/80 flex items-center justify-center">
        <div className="text-center text-white">
          <h2 className="text-2xl font-bold mb-4">Food Item Not Found</h2>
          <p className="mb-4">The requested food item could not be loaded.</p>
          <Button onClick={() => window.history.back()} variant="outline">
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  const { food_item, restaurant } = foodData;
  return (
    <>
    <style>
      {`
        .App {
          background: transparent !important;
          }
      `}
    </style>
    <div className="fixed inset-0 w-full h-full overflow-hidden bg-transparent"
      style={{ background: 'transparent' }}
      >
      {/* AR Scene */}
      {arLoaded && (
        <a-scene
          ref={sceneRef}
          embedded
          vr-mode-ui="enabled: false"
          renderer="logarithmicDepthBuffer: true; antialias: true; alpha: true; colorManagement: true;  physicallyCorrectLights: true;"
          arjs="sourceType: webcam; trackingMethod: best; debugUIEnabled: false;"
          style={{ position: 'absolute', top: '10%', left: '10%', width: '80%', height: '80%', zIndex: 10, background: 'transparent', pointerEvents: 'auto',touchAction: 'none',userSelect: 'none', }}
        >
          <a-assets>
            <video
              id="fallbackVideo"
              src="https://videos.pexels.com/video-files/2620043/2620043-uhd_2560_1440_25fps.mp4"
              preload="auto"
              loop
              muted
              playsInline
            />
          </a-assets>

          {/* Camera with content directly attached */}
          <a-entity camera look-controls position="0 1.6 0">
            <a-entity id="content-container" position="0 0 -2">
              {getPreviewContent()}
              
              {/* Floating text */}
            {foodData.food_item.name && (
            <div className="absolute top-10 left-1/2 transform -translate-x-1/2 z-50 text-white text-xl font-bold">
              {foodData.food_item.name.toUpperCase()}
            </div>
            )}
            </a-entity>
          </a-entity>
        </a-scene>
      )}

      {/* AR Navigation Chevrons */}
      <div className="absolute inset-y-0 left-4 flex items-center z-40">
        <button
          onClick={() => handleNavigation(-1)}
          disabled={!canNavigatePrev}
          className={cn(
            buttonVariants({ variant: 'secondary', size: 'icon' }),
            'bg-gradient-to-br from-orange-500 to-amber-500 backdrop-blur-md text-white border-white/30 hover:bg-white/60 hover:text-black/80 w-12 h-12 rounded-full disabled:opacity-30 disabled:cursor-not-allowed'
          )}
          aria-label="Previous item"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
      </div>
      <div className="absolute inset-y-0 right-4 flex items-center z-40">
        <button
          onClick={() => handleNavigation(1)}
          disabled={!canNavigateNext}
          className={cn(
            buttonVariants({ variant: 'secondary', size: 'icon' }),
            'bg-gradient-to-br from-orange-500 to-amber-500 backdrop-blur-md text-white border-white/30 hover:bg-white/60 hover:text-black/80 w-12 h-12 rounded-full disabled:opacity-30 disabled:cursor-not-allowed'
          )}
          aria-label="Next item"
        >
          <ChevronRight className="w-6 h-6" />
        </button>
      </div>

      {/* Loading overlay */}
      {!arLoaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-transparent bg-opacity-75 z-50">
          <div className="text-center text-white">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
            <p className="text-lg">Loading AR components...</p>
            <p className="text-sm text-gray-300 mt-2">Please allow camera access</p>
          </div>
        </div>
      )}

      {/* Top Controls */}
      <div className="absolute top-4 left-4 right-4 flex justify-between items-start z-40">
        <Button
          size="sm"
          variant="secondary"
          onClick={() => window.close()}
          className="bg-white/20 backdrop-blur-md text-white border-white/30 hover:bg-white/60 hover:text-black/60"
          aria-label="Go back to previous page"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>

        <div className="flex space-x-2">
          <Button
            size="sm"
            variant="secondary"
            onClick={() => setShowInfo(!showInfo)}
            className="bg-white/20 backdrop-blur-md text-white border-white/30 hover:bg-white/60 hover:text-black/60"
          >
            <Info className="w-4 h-4" />
          </Button>
          <Button
            size="sm"
            variant="secondary"
            onClick={handleShare}
            className="bg-white/20 backdrop-blur-md text-white border-white/30 hover:bg-white/60 hover:text-black/60"
          >
            <Share2 className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Food Info Panel */}
      {showInfo && (
        <div className="absolute bottom-20 left-4 right-4 z-40">
          <Card className="bg-white/95 backdrop-blur-md border-white/30 shadow-xl">
            <CardHeader className="pb-3">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <CardTitle className="text-xl font-bold text-gray-900 mb-2">
                    {food_item.name}
                  </CardTitle>
                  <div className="flex items-center text-sm text-gray-600 mb-2">
                    {/* <Building className="w-4 h-4 mr-2" /> */}
                    {restaurant.image_url ? (
                          <img src={restaurant.image_url.startsWith('/') ? `${BACKEND_URL}${restaurant.image_url}` : restaurant.image_url} alt={restaurant.name} className="w-6 h-6 mr-2 rounded object-cover border" />
                        ) : (
                          <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-amber-500 rounded flex items-center justify-center">
                            <Building className="w-4 h-4 text-white" />
                          </div>
                        )}
                    <span className="font-medium">{restaurant?.name}</span>
                  </div>
                  {restaurant?.address && (
                    <div className="flex items-center text-xs text-gray-500 mb-2">
                      <MapPin className="w-3 h-3 mr-1" />
                      {restaurant.address}
                    </div>
                  )}
                  {restaurant?.phone && (
                    <div className="flex items-center text-xs text-gray-500">
                      <Phone className="w-3 h-3 mr-1" />
                      {restaurant.phone}
                    </div>
                  )}
                </div>
                <div className="text-right ml-4">
                  <div className="flex items-center text-2xl font-bold text-green-600 mb-2">
                    <span className="text-sm mr-1">{getCurrencySymbol(food_item.currency || 'INR')}</span>
                    {food_item.price}
                  </div>
                  <Badge variant="secondary" className="mb-2">
                    {food_item.category.replace('_', ' ').toUpperCase()}
                  </Badge>
                  <div className="flex items-center text-xs text-gray-500">
                    <Star className="w-3 h-3 mr-1 fill-yellow-400 text-yellow-400" />
                    <span>4.5 (128 reviews)</span>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <p className="text-gray-700 text-sm mb-4 leading-relaxed">
                {food_item.description}
              </p>
              
              {/* Order Button */}
              {/* <Button
                onClick={handleOrder}
                className="w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white font-semibold py-3 rounded-lg shadow-lg"
              >
                <ShoppingCart className="w-5 h-5 mr-2" />
                Order Now - {getCurrencySymbol(food_item.currency || 'INR')}{food_item.price}
              </Button> */}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Bottom Controls */}
      <div className="absolute bottom-4 left-0 right-0 z-40">
        <div className="flex justify-center space-x-4">
          <Button
            size="icon"
            variant="secondary"
            className="bg-white/20 backdrop-blur-md text-white border-white/30 hover:bg-white/60 hover:text-black/80 w-12 h-12 rounded-full"
            onClick={() => {
              // Reset AR scene
              if (sceneRef.current) {
                const contentContainer = sceneRef.current.querySelector('#content-container');
                if (contentContainer) {
                  // Reset position and rotation
                  contentContainer.object3D.position.set(0, 0, -3);
                  contentContainer.object3D.rotation.set(0, 0, 0);
                  contentContainer.object3D.scale.set(1, 1, 1);
                  toast.success('View reset!');
                }
              }
            }}
          >
            <RotateCcw className="w-5 h-5" />
          </Button>

          <Button
            size="icon"
            variant="secondary"
            className="bg-white/20 backdrop-blur-md text-white border-white/30 hover:bg-white/60 hover:text-black/80 w-12 h-12 rounded-full"
            onClick={() => {
              // Take screenshot
              const scene = sceneRef.current;
              if (scene) {
                const dataURL = scene.components.screenshot.getCanvas('perspective').toDataURL('image/png');
                const link = document.createElement('a');
                link.href = dataURL;
                link.download = `${food_item.name}-ar-view.png`;
                link.click();
                toast.success('Screenshot saved!');
              }
            }}
          >
            <Camera className="w-5 h-5" />
          </Button>

          <Button
            size="icon"
            variant="secondary"
            className="bg-white/20 backdrop-blur-md text-white border-white/30 hover:bg-white/60 hover:text-black/80 w-12 h-12 rounded-full"
            onClick={() => {
              // Zoom in
              const contentContainer = sceneRef.current?.querySelector('#content-container');
              if (contentContainer) {
                const currentScale = contentContainer.object3D.scale;
                contentContainer.object3D.scale.set(
                  currentScale.x * 1.2,
                  currentScale.y * 1.2,
                  currentScale.z * 1.2
                );
              }
            }}
          >
            <ZoomIn className="w-5 h-5" />
          </Button>

          <Button
            size="icon"
            variant="secondary"
            className="bg-white/20 backdrop-blur-md text-white border-white/30 hover:bg-white/60 hover:text-black/80 w-12 h-12 rounded-full"
            onClick={() => {
              // Zoom out
              const contentContainer = sceneRef.current?.querySelector('#content-container');
              if (contentContainer) {
                const currentScale = contentContainer.object3D.scale;
                contentContainer.object3D.scale.set(
                  currentScale.x * 0.8,
                  currentScale.y * 0.8,
                  currentScale.z * 0.8
                );
              }
            }}
          >
            <ZoomOut className="w-5 h-5" />
          </Button>
        </div>

        {/* Instructions */}
        <div className="mt-4 text-center">
          <p className="text-white text-sm bg-black/50 rounded-lg px-4 py-2 backdrop-blur-sm">
            Point your camera at a surface to view the AR preview
          </p>
        </div>
      </div>

      {/* Order Modal */}
      {showOrderModal && (
        <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md bg-white shadow-2xl">
            <CardHeader>
              <CardTitle className="text-xl font-bold text-gray-900">
                Place Your Order
              </CardTitle>
              <CardDescription>
                {food_item.name} from {restaurant?.name}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <span className="font-medium">{food_item.name}</span>
                <span className="font-bold text-green-600">
                  {getCurrencySymbol(food_item.currency || 'INR')}{food_item.price}
                </span>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Quantity</label>
                <div className="flex items-center space-x-3">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    disabled={quantity <= 1}
                  >
                    -
                  </Button>
                  <span className="w-12 text-center font-medium">{quantity}</span>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setQuantity(quantity + 1)}
                  >
                    +
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Special Instructions (Optional)</label>
                <textarea
                  value={specialInstructions}
                  onChange={(e) => setSpecialInstructions(e.target.value)}
                  placeholder="Any special requests or modifications..."
                  className="w-full p-3 border border-gray-300 rounded-lg resize-none"
                  rows={3}
                />
              </div>

              <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                <span className="font-medium">Total</span>
                <span className="text-xl font-bold text-green-600">
                  {getCurrencySymbol(food_item.currency || 'INR')}{(food_item.price * quantity).toFixed(2)}
                </span>
              </div>

              <div className="flex space-x-3">
                <Button
                  variant="outline"
                  onClick={() => setShowOrderModal(false)}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handlePlaceOrder}
                  className="flex-1 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white"
                >
                  <ShoppingCart className="w-4 h-4 mr-2" />
                  Place Order
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
    </>
  );
}