import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import useEmblaCarousel from 'embla-carousel-react';
import { 
  UtensilsCrossed, 
  ChevronRight, 
  ChevronLeft, 
  Star, 
  Info,
  Clock,
  MapPin,
  Phone,
  Eye,
  MessageSquare,
  ArrowRight,
  BookOpen
} from 'lucide-react';
import { Button } from '../ui/button';
import { Card, CardContent } from '../ui/card';
import { Badge } from '../ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import CustomerFeedback from '../feedback/CustomerFeedback';
import { cn } from '../../lib/utils';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const CATEGORIES = [
  { id: 'starters', label: 'Starters' },
  { id: 'main_course', label: 'Main Course' },
  { id: 'desserts', label: 'Desserts' },
  { id: 'drinks', label: 'Drinks' }
];

export default function RestaurantMenu() {
  const { restaurantId } = useParams();
  const [restaurant, setRestaurant] = useState(null);
  const [foodItems, setFoodItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [dynamicCategories, setDynamicCategories] = useState([]);
  const [showFeedbackDialog, setShowFeedbackDialog] = useState(false);
  const trackedRef = useRef(false);
  const [emblaRef, emblaApi] = useEmblaCarousel({ 
    
    loop: false, 
    align: 'start',
    skipSnaps: false,
    duration: 30
  });

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setSelectedIndex(emblaApi.selectedScrollSnap());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    onSelect();
    emblaApi.on('select', onSelect);
    emblaApi.on('reInit', onSelect);
  }, [emblaApi, onSelect]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [resResponse, itemsResponse] = await Promise.all([
          axios.get(`${API}/public/restaurants/${restaurantId}`),
          axios.get(`${API}/public/restaurants/${restaurantId}/food-items`)
        ]);
        
        setRestaurant(resResponse.data);
        setFoodItems(itemsResponse.data);

        // Extract unique categories from items
        const categories = [...new Set(itemsResponse.data.map(item => item.category))];
        const categoryList = categories.map(catId => {
          const found = CATEGORIES.find(c => c.id === catId);
          return {
            id: catId,
            label: found ? found.label : catId.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')
          };
        });
        setDynamicCategories(categoryList);
      } catch (error) {
        console.error('Error fetching menu data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [restaurantId]);

  useEffect(() => {
    if (restaurant && restaurant.master_qr_id && !trackedRef.current) {
      const trackMenuView = async () => {
        try {
          // Immediately set to true to prevent concurrent calls
          trackedRef.current = true;
          await axios.post(`${API}/analytics/scan`, {
            restaurant_id: restaurantId,
            qr_code_id: restaurant.master_qr_id,
            user_agent: navigator.userAgent
          });
        } catch (error) {
          console.error('Error tracking menu view:', error);
        }
      };
      trackMenuView();
    }
  }, [restaurant, restaurantId]);

  const scrollTo = useCallback((index) => emblaApi && emblaApi.scrollTo(index), [emblaApi]);

  const getCurrencySymbol = (currency) => {
    const symbols = { 'INR': '₹', 'USD': '$', 'EUR': '€', 'GBP': '£' };
    return symbols[currency] || '₹';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FFF7ED] flex items-center justify-center">
        <div className="text-center">
          <div className="relative w-20 h-20 mx-auto mb-6">
            <div className="absolute inset-0 rounded-full border-4 border-orange-200 animate-pulse"></div>
            <div className="absolute inset-0 rounded-full border-t-4 border-orange-600 animate-spin"></div>
            <UtensilsCrossed className="absolute inset-0 m-auto w-8 h-8 text-orange-600" />
          </div>
          <p className="text-orange-900 font-serif italic text-xl">Curating Your Experience...</p>
        </div>
      </div>
    );
  }

  if (!restaurant) {
    return (
      <div className="min-h-screen bg-[#FFF7ED] flex items-center justify-center p-4">
        <Card className="max-w-md w-full text-center p-8 bg-white border-none shadow-xl rounded-3xl">
          <div className="w-20 h-20 bg-orange-50 rounded-full flex items-center justify-center mx-auto mb-6">
            <UtensilsCrossed className="w-10 h-10 text-orange-200" />
          </div>
          <h2 className="text-3xl font-serif font-bold text-gray-900 mb-2">A Taste of Mystery</h2>
          <p className="text-gray-600 mb-8 font-serif italic">This menu is currently hidden from the world.</p>
          <Link to="/">
            <Button className="w-full bg-orange-600 hover:bg-orange-700 text-white rounded-full h-12">Return Home</Button>
          </Link>
        </Card>
      </div>
    );
  }

  const groupedItems = dynamicCategories.map(cat => ({
    ...cat,
    items: foodItems.filter(item => item.category === cat.id)
  })).filter(group => group.items.length > 0);

  return (
    <div className="min-h-screen bg-[#FFF7ED] selection:bg-orange-100">
      <style>
        {`
          @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;1,400&family=Lora:ital,wght@0,400;0,500;1,400&display=swap');
          
          .font-serif { font-family: 'Playfair Display', serif; }
          .font-body { font-family: 'Lora', serif; }
          
          .menu-page {
            background: #fff;
            box-shadow: 0 10px 30px -5px rgba(0,0,0,0.1);
            position: relative;
            overflow: hidden;
            height: 75vh;
            min-height: 550px;
            max-height: 800px;
          }

          .menu-items-container {
            height: calc(100% - 180px); /* Adjust for header and footer spacing */
            overflow-y: auto;
            padding-right: 10px;
          }

          .menu-items-container::-webkit-scrollbar {
            width: 4px;
          }

          .menu-items-container::-webkit-scrollbar-track {
            background: transparent;
          }

          .menu-items-container::-webkit-scrollbar-thumb {
            background: rgba(234, 88, 12, 0.1);
            border-radius: 10px;
          }
          
          .menu-page::before {
            content: '';
            position: absolute;
            inset: 10px;
            border: 1px solid rgba(234, 88, 12, 0.2);
            pointer-events: none;
            z-index: 10;
          }

          .menu-item-row {
            display: flex;
            align-items: baseline;
            gap: 8px;
            margin-bottom: 12px;
          }

          .dots-leader {
            flex-grow: 1;
            border-bottom: 2px dotted rgba(0,0,0,0.1);
            height: 4px;
          }

          .no-scrollbar::-webkit-scrollbar { display: none; }
          .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }

          .page-turn-shadow {
            box-shadow: -10px 0 20px -10px rgba(0,0,0,0.1) inset;
          }

          @keyframes flipIn {
            from { transform: rotateY(10deg); opacity: 0.5; }
            to { transform: rotateY(0); opacity: 1; }
          }

          .animate-flip {
            animation: flipIn 0.5s cubic-bezier(0.4, 0, 0.2, 1);
          }
        `}
      </style>

      {/* Hero Header */}
      <div className="relative h-[45vh] w-full">
        <div className="absolute inset-0 bg-black/40 z-10" />
        <img 
          src={restaurant.image_url || 'https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?auto=format&fit=crop&q=80'} 
          alt={restaurant.name}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 z-20 flex flex-col items-center justify-center px-4 text-center">
          <div className="mb-4 inline-flex items-center justify-center p-3 rounded-full bg-white/10 backdrop-blur-md border border-white/20">
            <UtensilsCrossed className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-5xl md:text-7xl font-serif text-white mb-4 drop-shadow-lg tracking-tight">
            {restaurant.name}
          </h1>
          <div className="flex items-center gap-4 text-white/90 font-body italic text-sm md:text-base">
            <span className="flex items-center"><MapPin className="w-4 h-4 mr-1.5 text-orange-400" /> {restaurant.address || 'Signature Location'}</span>
            <div className="w-1.5 h-1.5 rounded-full bg-orange-400" />
            <span className="flex items-center"><Phone className="w-4 h-4 mr-1.5 text-orange-400" /> {restaurant.phone || 'Private Line'}</span>
          </div>
        </div>
      </div>

      {/* Elegant Category Navigation */}
      <div className="sticky top-0 z-40 bg-[#FFF7ED]/95 backdrop-blur-md border-b border-orange-100 py-4">
        <div className="max-w-4xl mx-auto px-4 flex justify-start md:justify-center overflow-x-auto no-scrollbar gap-4">
          <button
            onClick={() => scrollTo(0)}
            className={cn(
              "px-6 py-2 rounded-full font-serif text-sm transition-all duration-300 whitespace-nowrap",
              selectedIndex === 0 
                ? "bg-orange-600 text-white shadow-lg shadow-orange-200 transform scale-105" 
                : "bg-white text-orange-900 border border-orange-100 hover:bg-orange-50"
            )}
          >
            Cover
          </button>
          {groupedItems.map((group, idx) => (
            <button
              key={group.id}
              onClick={() => scrollTo(idx + 1)}
              className={cn(
                "px-6 py-2 rounded-full font-serif text-sm transition-all duration-300 whitespace-nowrap",
                selectedIndex === idx + 1
                  ? "bg-orange-600 text-white shadow-lg shadow-orange-200 transform scale-105" 
                  : "bg-white text-orange-900 border border-orange-100 hover:bg-orange-50"
              )}
            >
              {group.label}
            </button>
          ))}
        </div>
      </div>

      {/* Menu Book / Carousel */}
      <div className="max-w-4xl mx-auto px-4 py-12 md:py-20">
        <div className="embla overflow-hidden" ref={emblaRef}>
          <div className="embla__container flex">
            {/* Welcome Page */}
            <div className="embla__slide flex-[0_0_100%] min-w-0 px-2 md:px-6">
              <div className="menu-page bg-white p-8 md:p-16 rounded-[40px] border border-orange-50 animate-flip flex flex-col items-center justify-center text-center">
                <div className="w-24 h-24 bg-orange-50 rounded-full flex items-center justify-center mb-8">
                  <UtensilsCrossed className="w-12 h-12 text-orange-600" />
                </div>
                <h2 className="text-5xl font-serif text-orange-900 mb-4">Welcome</h2>
                <div className="w-12 h-[2px] bg-orange-200 mb-6" />
                <p className="font-body italic text-gray-600 max-w-xs leading-relaxed">
                  To the culinary journey of {restaurant.name}. 
                  Explore our menu in immersive Augmented Reality.
                </p>
                <Button 
                  onClick={() => scrollTo(1)}
                  className="mt-12 bg-orange-600 hover:bg-orange-700 text-white rounded-full px-8 h-12 font-serif italic"
                >
                  Open Menu <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
              </div>
            </div>

            {groupedItems.map((group, groupIdx) => (
              <div key={group.id} className="embla__slide flex-[0_0_100%] min-w-0 px-2 md:px-6">
                <div className="menu-page bg-white p-8 md:p-16 rounded-[40px] border border-orange-50 animate-flip">
                  {/* Category Header */}
                  <div className="text-center mb-16 relative">
                    <div className="absolute top-1/2 left-0 right-0 h-[1px] bg-orange-100 -z-10" />
                    <span className="bg-white px-8 font-serif text-4xl text-orange-900 italic tracking-widest uppercase">
                      {group.label}
                    </span>
                    <p className="mt-4 font-body italic text-orange-400 text-sm tracking-widest">
                      Our Chef's Selection
                    </p>
                  </div>

                  {/* Items List */}
                  <div className="menu-items-container space-y-10 pr-2">
                    {group.items.map((item) => (
                      <div key={item.id} className="group">
                        <div className="menu-item-row">
                          <div className="flex flex-col">
                            <h3 className="font-serif text-xl md:text-2xl text-gray-900 group-hover:text-orange-700 transition-colors">
                              {item.name}
                            </h3>
                            {item.name.toLowerCase().includes('signature') && (
                              <span className="text-[10px] font-body uppercase tracking-[0.2em] text-orange-500 font-bold -mt-1">
                                Signature Dish
                              </span>
                            )}
                          </div>
                          <div className="dots-leader" />
                          <div className="flex items-center gap-4 shrink-0">
                            <span className="font-serif text-lg md:text-xl font-bold text-gray-900">
                              {getCurrencySymbol(item.currency)}{item.price}
                            </span>
                            <Link to={`/ar/${item.id}`}>
                              <Button 
                                size="sm"
                                variant="ghost"
                                className="md:bg-gradient-to-r md:from-orange-600 md:to-amber-600 md:hover:from-orange-700 md:hover:to-amber-700 md:text-white rounded-full p-2 md:px-4 text-xs font-serif italic md:shadow-md transition-all hover:scale-110 text-orange-600 hover:bg-orange-50 md:hover:bg-transparent"
                              >
                                <Eye className="w-6 h-6 md:w-3.5 md:h-3.5 md:mr-1.5" />
                                <span className="hidden md:inline">Preview</span>
                              </Button>
                            </Link>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Page Indicator / Swipe Hint */}
                  <div className="absolute bottom-10 left-8 right-8 flex items-center justify-between text-orange-300 font-serif italic text-sm">
                    <button onClick={() => scrollTo(groupIdx)} className="flex items-center gap-2 hover:text-orange-500 transition-colors">
                      <ChevronLeft className="w-4 h-4" /> Previous
                    </button>
                    
                    <span className="text-orange-900/40">Page {groupIdx + 1} of {groupedItems.length}</span>

                    {groupIdx < groupedItems.length - 1 ? (
                      <button onClick={() => scrollTo(groupIdx + 2)} className="flex items-center gap-2 hover:text-orange-500 transition-colors">
                        Next <ChevronRight className="w-4 h-4" />
                      </button>
                    ) : <div />}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Floating Action Button - Feedback */}
      <div className="fixed bottom-8 right-8 z-50">
        <Dialog open={showFeedbackDialog} onOpenChange={setShowFeedbackDialog}>
          <DialogTrigger asChild>
            <Button 
              className="w-16 h-16 rounded-full bg-orange-600 text-white shadow-2xl shadow-orange-500/40 hover:scale-110 transition-all group p-0"
            >
              <MessageSquare className="w-6 h-6 group-hover:rotate-12 transition-transform" />
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md p-0 bg-white border-none overflow-hidden rounded-[32px]">
            <CustomerFeedback 
              restaurantId={restaurantId} 
              source="menu" 
              formOnly={true} 
              onSuccess={() => setShowFeedbackDialog(false)} 
            />
          </DialogContent>
        </Dialog>
      </div>

      {/* Aesthetic Footer */}
      <footer className="max-w-4xl mx-auto px-4 pb-20 text-center">
        <div className="w-20 h-[1px] bg-orange-200 mx-auto mb-8" />
        <h2 className="font-serif italic text-2xl text-orange-900/60 mb-2">Bon Appétit</h2>
        <p className="font-body text-orange-400 text-sm italic tracking-widest">
          Immerse yourself in a new way of dining.
        </p>
      </footer>
    </div>
  );
}
