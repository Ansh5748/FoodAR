import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { Button, buttonVariants } from '../ui/button';
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from '../ui/card';
import { Badge } from '../ui/badge';
import { toast } from 'sonner';
import { 
  ArrowLeft, 
  Maximize, 
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
  MessageSquare,
  ChevronLeft,
  ChevronRight,
  ShoppingCart
} from 'lucide-react';
import axios from 'axios';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import CustomerFeedback from '../feedback/CustomerFeedback';
import { cn } from '../../lib/utils';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export default function ARViewer() {
  const { foodItemId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const qrIdFromUrl = searchParams.get('qr');
  
  const [foodData, setFoodData] = useState(null);
  const [restaurantItems, setRestaurantItems] = useState([]);
  const [currentItemIndex, setCurrentItemIndex] = useState(-1);
  const [loading, setLoading] = useState(true);
  const [arLoaded, setArLoaded] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [isPreviewContentLoaded, setIsPreviewContentLoaded] = useState(false);
  const sceneRef = useRef(null);
  const [videoAspect, setVideoAspect] = useState(1);
  const [imageAspect, setImageAspect] = useState(1);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const trackedRef = useRef(null);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const [showFeedbackDialog, setShowFeedbackDialog] = useState(false);

  useEffect(() => {
    setLoading(true);
    setFoodData(null);
    fetchFoodItem();
    // Only track scan once per foodItemId change
    if (trackedRef.current !== foodItemId) {
      trackScan();
      trackedRef.current = foodItemId;
    }
    loadARScript();
    setIsPreviewContentLoaded(false); // Reset on item change
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
        nextX = THREE.MathUtils.clamp(nextX, -1.09, 1.09);

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

useEffect(() => {
  if (!arLoaded || !window.AFRAME) return;

  // prevent double registration
  if (window.AFRAME.components["camera-follower"]) return;

  window.AFRAME.registerComponent("camera-follower", {
    init: function () {
      this.camera = this.el.sceneEl.camera.el;
    },
    tick: function () {
      if (this.camera) {
        // Copy the camera's world position and rotation to this entity
        this.camera.object3D.getWorldPosition(this.el.object3D.position);
        this.camera.object3D.getWorldQuaternion(this.el.object3D.quaternion);
      }
    },
  });
}, [arLoaded]);

useEffect(() => {
  if (!arLoaded || !window.AFRAME) return;

  if (window.AFRAME.components["auto-scale"]) return;

  window.AFRAME.registerComponent("auto-scale", {
    schema: {
      target: { type: "number", default: 1 },   // max size in meters
      boost: { type: "number", default: 1 }      // multiplier
    },

    init: function () {
      this.el.addEventListener("model-loaded", () => {

        const mesh = this.el.getObject3D("mesh");
        if (!mesh) return;

        // Compute bounding box for actual GLTF mesh only
        mesh.traverse((child) => {
          if (child.isMesh) child.geometry.computeBoundingBox();
        });

        const box = new THREE.Box3().setFromObject(mesh);
        const size = box.getSize(new THREE.Vector3());
        const maxDim = Math.max(size.x, size.y, size.z);

        const scale = (this.data.target / maxDim) * this.data.boost;

        // IMPORTANT: scaling the mesh directly bypasses all parent transforms
        mesh.scale.set(scale, scale, scale);
      });
    }
  });
}, [arLoaded]);

useEffect(() => {
  if (!arLoaded || !window.AFRAME) return;

  if (window.AFRAME.components['content-loader']) return;

  // This component will set the React state when the model/image/video is loaded.
  window.AFRAME.registerComponent('content-loader', {
    init: function () {
      const el = this.el;
      const setLoaded = () => {
        // Use a small timeout to ensure rendering completes after loading
        setTimeout(() => setIsPreviewContentLoaded(true), 100);
      };

      // Listen for different load events depending on the content type
      el.addEventListener('model-loaded', setLoaded); // For 3D models
      el.addEventListener('materialtextureloaded', setLoaded); // For images/videos

      // For simple shapes like a-box that load instantly
      if (el.tagName.toLowerCase() === 'a-box') {
        setLoaded();
      }
    }
  });
}, [arLoaded]);


 useEffect(() => {
  if (!previewUrl) return;

  const { food_item } = foodData || {};
  if (food_item?.preview_type === '360_video') {
    const video = document.createElement("video");
    video.src = previewUrl;
    const onLoaded = () => {
      setVideoAspect(video.videoWidth / video.videoHeight);
    };
    video.addEventListener("loadedmetadata", onLoaded);
    return () => video.removeEventListener("loadedmetadata", onLoaded);
  } else if (food_item?.preview_type === '2d_image') {
    const img = new Image();
    img.src = previewUrl;
    img.onload = () => {
      setImageAspect(img.width / img.height);
    };
  }
}, [previewUrl, foodData]);


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
        qr_code_id: qrIdFromUrl || 'scanned',
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

  const handleShowDetails = () => {
    setShowDetailsModal(true);
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

    const { food_item } = foodData;
    const pv = previewUrl;

    // --- REFINED RESPONSIVE SCALING LOGIC ---
    // Mobile screen is usually around 350-450px wide. 
    // Desktop screens are much wider.
    
    const yPos = 1.6;  // Eye level center height
    const zPos = -3.0; // Slightly further back for better framing
    
    // 1. Mobile Scaling
    if (isMobile) {
      // Max dimensions to ensure ~15% margin on sides
      const maxMobileWidth = 1.7; 
      const maxMobileHeight = 3.0;

      switch (food_item.preview_type) {
        case '3d_model':
          return (
            <a-entity position={`0 ${yPos} ${zPos}`}>
              <a-entity
                id="interactive-model"
                gltf-model={pv}
                auto-scale="target: 1.5; boost: 1"
                animation__spin="property: rotation; to: 0 360 0; loop: true; dur: 5000"
                interactive-rotation="enabled: true"
                content-loader
              />
            </a-entity>
          );
        case '360_video':
          let w = maxMobileWidth;
          let h = w / videoAspect;
          
          // If height is too tall (e.g., 9:16), cap the height and shrink width
          if (h > maxMobileHeight) {
            h = maxMobileHeight * 0.85; // Zoom out bit more for 9:16
            w = h * videoAspect;
          }
          
          return (
            <a-plane
              position={`0 ${yPos} ${zPos}`}
              width={w}
              height={h}
              material={`shader: flat; src: ${pv || '#fallbackVideo'}`}
              interactive-rotation="enabled: false" 
              content-loader
            ></a-plane>
          );
        case '2d_image':
          let iw = maxMobileWidth;
          let ih = iw / imageAspect;
          if (ih > maxMobileHeight) {
            ih = maxMobileHeight * 0.8; // Leave some vertical margin
            iw = ih * imageAspect;
          }
          return (
            <a-image
              src={pv || food_item.image_url}
              position={`0 ${yPos} ${zPos}`}
              width={iw}
              height={ih}
              scale="1 1 1"
              interactive-rotation="enabled: false" 
              content-loader
            />
          );
        default:
          return (
            <a-box
              position={`0 ${yPos} ${zPos}`}
              rotation="0 45 0"
              width="1"
              height="1"
              depth="1"
              color="#fb923c"
              animation="property: rotation; to: 0 405 0; loop: true; dur: 10000"
              content-loader
            />
          );
      }
    } 
    
    // 2. Desktop Scaling (Slightly more conservative than mobile)
    else {
      const maxDesktopWidth = 4.0;
      const maxDesktopHeight = 4.0;

      switch (food_item.preview_type) {
        case '3d_model':
          return (
            <a-entity position={`0 ${yPos} ${zPos}`}>
              <a-entity
                id="interactive-model"
                gltf-model={pv}
                auto-scale="target: 2.5; boost: 1"
                animation__spin="property: rotation; to: 0 360 0; loop: true; dur: 5000"
                interactive-rotation="enabled: true"
                content-loader
              />
            </a-entity>
          );
        case '360_video':
          let w = 3.5;
          let h = w / videoAspect;
          
          // Shrink 9:16 videos on desktop
          if (h > maxDesktopHeight) {
            h = maxDesktopHeight * 0.85; // Zoom out bit more for 9:16 on desktop
            w = h * videoAspect;
          }
          
          return (
            <a-plane
              position={`0 ${yPos} ${zPos}`}
              width={w}
              height={h}
              material={`shader: flat; src: ${pv || '#fallbackVideo'}`}
              interactive-rotation="enabled: false" 
              content-loader
            ></a-plane>
          );
        case '2d_image':
          let iw = 2.8;
          let ih = iw / imageAspect;
          if (ih > maxDesktopHeight) {
            ih = maxDesktopHeight * 0.85;
            iw = ih * imageAspect;
          }
          return (
            <a-image
              src={pv || food_item.image_url}
              position={`0 ${yPos} ${zPos}`}
              width={iw}
              height={ih}
              scale="1 1 1"
              interactive-rotation="enabled: false" 
              content-loader
            />
          );
        default:
          return (
            <a-box
              position={`0 ${yPos} ${zPos}`}
              rotation="0 45 0"
              width="1.2"
              height="1.2"
              depth="1.2"
              color="#fb923c"
              animation="property: rotation; to: 0 405 0; loop: true; dur: 10000"
              content-loader
            />
          );
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-500 to-amber-600 flex items-center justify-center">
        <div className="text-center text-white">
          <div className="relative w-24 h-24 mx-auto mb-6">
            <div className="absolute inset-0 rounded-full border-4 border-white/20 animate-pulse"></div>
            <div className="absolute inset-0 rounded-full border-t-4 border-white animate-spin"></div>
            <UtensilsCrossed className="absolute inset-0 m-auto w-10 h-10 text-white" />
          </div>
          <h2 className="text-2xl font-bold mb-2">Preparing Your Dish</h2>
          <p className="text-orange-100 animate-pulse">Loading AR experience...</p>
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
          min-height: 100vh;
          width: 100vw;
          overflow: hidden;
        }
        
        body {
          margin: 0;
          padding: 0;
          overflow: hidden;
          background: transparent !important;
        }

        @keyframes scaleUp {
          0% { transform: translateX(-50%) scale(0); opacity: 0; }
          100% { transform: translateX(-50%) scale(1); opacity: 1; }
        }

        /* AR.js video resizing fix */
        .a-canvas {
          width: 100% !important;
          height: 100% !important;
          position: absolute;
          top: 0;
          left: 0;
        }
        
        video {
          width: 100% !important;
          height: 100% !important;
          object-fit: cover !important;
          position: fixed !important;
          top: 0;
          left: 0;
          z-index: -1;
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
          arjs="sourceType: webcam; debugUIEnabled: false; detectionMode: mono_and_matrix; matrixCodeType: 3x3; trackingMethod: best; videoTexture: true;"
          renderer="logarithmicDepthBuffer: true; antialias: true; alpha: true; precision: medium; sortObjects: true;"
          vr-mode-ui="enabled: false"
          gesture-detector
          style={{ width: '100%', height: '100%', position: 'absolute', top: 0, left: 0, zIndex: 1 }}
        >
          <a-assets timeout="10000">
            {previewUrl && foodData?.food_item?.preview_type === '3d_model' && (
              <a-asset-item id="food-model" src={previewUrl} crossorigin="anonymous" prefetch="true"></a-asset-item>
            )}
            {previewUrl && foodData?.food_item?.preview_type === '360_video' && (
              <video id="food-video" src={previewUrl} autoPlay loop muted crossorigin="anonymous" playsInline></video>
            )}
            {previewUrl && foodData?.food_item?.preview_type === '2d_image' && (
              <img id="food-image" src={previewUrl} crossorigin="anonymous" />
            )}
            <video
              id="fallbackVideo"
              src="https://cdn.aframe.io/videos/sample.mp4"
              autoPlay
              loop
              muted
              crossorigin="anonymous"
              playsInline
            ></video>
          </a-assets>

          {/* Lights for 3D Models */}
          <a-light type="ambient" intensity="0.7"></a-light>
          <a-light type="directional" position="1 1 1" intensity="0.8"></a-light>
          <a-light type="directional" position="-1 1 1" intensity="0.5"></a-light>

          {/* The content is placed in front of the camera's initial position */}
          <a-entity id="content-container" position="0 0 0" rotation="0 0 0">
            {getPreviewContent()}
          </a-entity>

          <a-entity camera look-controls="enabled: true" wasd-controls="enabled: false"></a-entity>
        </a-scene>
      )}

      {/* Loading overlay for A-Frame components */}
      {arLoaded && !isPreviewContentLoaded && (
        <div className="absolute inset-0 z-[100] bg-gradient-to-br from-orange-500/90 to-amber-600/90 flex items-center justify-center backdrop-blur-sm">
          <div className="text-center text-white">
            <div className="relative w-20 h-20 mx-auto mb-4">
              <div className="absolute inset-0 rounded-full border-4 border-white/20 animate-pulse"></div>
              <div className="absolute inset-0 rounded-full border-t-4 border-white animate-spin"></div>
            </div>
            <p className="font-medium">Bringing it to life...</p>
          </div>
        </div>
      )}

          {isPreviewContentLoaded && foodData.food_item?.name && (
            <div className="absolute top-20 left-1/2 z-50 font-bold px-4 py-2 rounded-lg bg-transparent whitespace-nowrap text-sm sm:text-base md:text-xl max-w-[90vw] overflow-hidden transform transition-transform duration-500"
            style={{
              transform: 'translateX(-50%) scale(1)',
              color: '#fb923c',
              animation: 'scaleUp 0.6s ease-out forwards',
            }}
            >
              {foodData.food_item?.name.toUpperCase()}
            </div>
            )}

          {isPreviewContentLoaded && foodData.food_item?.price && (
            <div className="absolute bottom-40 left-1/2 z-50 font-bold px-4 py-2 rounded-lg bg-transparent whitespace-nowrap text-sm sm:text-base md:text-xl max-w-[90vw] overflow-hidden transform transition-transform duration-500"
            style={{
              transform: 'translateX(-50%) scale(1)',
              color: '#22c55e',
              animation: 'scaleUp 0.6s ease-out forwards',
            }}
            >
              {'Price - ' + getCurrencySymbol(foodData.food_item.currency) + foodData.food_item?.price}
            </div>
            )}  

      {/* Top Controls */}
      <div className="absolute top-4 left-4 right-4 flex justify-between items-start z-40">
        <Button
          size="sm"
          variant="secondary"
          onClick={() => navigate(-1)}
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
            onClick={() => setShowDetailsModal(!showDetailsModal)}
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

          {/* Feedback Button */}
          <Dialog open={showFeedbackDialog} onOpenChange={setShowFeedbackDialog}>
            <DialogTrigger asChild>
              <Button
                size="sm"
                variant="secondary"
                className="bg-white/20 backdrop-blur-md text-white border-white/30 hover:bg-white/60 hover:text-black/60"
              >
                <MessageSquare className="w-4 h-4" />
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md p-0 bg-white border-none overflow-hidden rounded-[32px]">
              <CustomerFeedback 
                restaurantId={foodData?.restaurant?.id} 
                foodItemId={foodItemId} 
                source="ar_viewer" 
                formOnly={true} 
                onSuccess={() => setShowFeedbackDialog(false)}
              />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Food Details Modal */}
      {showDetailsModal && (
        <div className="absolute bottom-56 left-4 right-4 z-[60] flex items-center justify-center animate-in slide-in-from-bottom-4 duration-300">
          <Card className="w-full max-w-md bg-white/95 backdrop-blur-md shadow-2xl border-orange-200/50">
            <CardHeader className="pb-3 relative">
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-2 top-2 h-8 w-8 text-gray-400 hover:text-gray-600"
                onClick={() => setShowDetailsModal(false)}
              >
                <RotateCcw className="h-4 w-4 rotate-45" />
              </Button>
              <div className="flex justify-between items-start pr-6">
                <div className="flex-1">
                  <CardTitle className="text-xl font-bold text-gray-900 mb-1">
                    {food_item.name}
                  </CardTitle>
                  <div className="flex items-center text-sm text-gray-600 mb-2">
                    {restaurant.image_url ? (
                          <img src={restaurant.image_url.startsWith('/') ? `${BACKEND_URL}${restaurant.image_url}` : restaurant.image_url} alt={restaurant.name} className="w-5 h-5 mr-2 rounded object-cover border" />
                        ) : (
                          <div className="w-5 h-5 bg-gradient-to-br from-orange-500 to-amber-500 rounded flex items-center justify-center mr-2">
                            <Building className="w-3 h-3 text-white" />
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
                  <Badge variant="secondary" className="text-[10px] px-2 py-0 border border-orange-200 text-orange-600 dark:text-orange-400 mb-2">
                    {food_item.category.replace('_', ' ').toUpperCase()}
                  </Badge>
                  <div className="flex items-center justify-end text-xl font-bold text-green-600 mb-1">
                    <span className="text-xs mr-1">{getCurrencySymbol(food_item.currency || 'INR')}</span>
                    {food_item.price}
                  </div>
                  <div className="flex items-center justify-end text-xs text-gray-500">
                    <Star className="w-3 h-3 mr-1 fill-yellow-400 text-yellow-400" />
                    <span>4.5</span>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <p className="text-gray-700 text-sm leading-relaxed">
                {food_item.description}
              </p>
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
                const contentContainer = sceneRef.current.querySelector('#content-container');                // if (contentContainer) {
                if (contentContainer && contentContainer.object3D) {
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
              // if (contentContainer) {
              if (contentContainer && contentContainer.object3D) {
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
              // if (contentContainer) {
              if (contentContainer && contentContainer.object3D) {
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
    </div>
    </>
  );
}