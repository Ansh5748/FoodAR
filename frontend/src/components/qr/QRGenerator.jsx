import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../../App';
import { QRCodeCanvas } from 'qrcode.react';
import { Button } from '../ui/button';
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from '../ui/card';
import { Badge } from '../ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { toast } from 'sonner';
import { 
  ArrowLeft,
  QrCode,
  Download,
  Share2,
  Eye,
  Scan,
  Copy,
  UtensilsCrossed,
  Smartphone,
  Printer,
  FileImage
} from 'lucide-react';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const getCurrencySymbol = (currency) => {
  const symbols = {
    INR: "₹",
    USD: "$",
    EUR: "€",
    GBP: "£",
  };
  return symbols[currency] || "₹";
};

export default function QRGenerator() {
  const { restaurantId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [restaurant, setRestaurant] = useState(null);
  const [foodItems, setFoodItems] = useState([]);
  const [qrCodes, setQrCodes] = useState([]);
  const [masterQR, setMasterQR] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState('');
  const [downloadFormat, setDownloadFormat] = useState('png');
  const canvasRef = useRef(null);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        // Fetch core data first
        const [res, items, master] = await Promise.all([
          axios.get(`${API}/restaurants/${restaurantId}`),
          axios.get(`${API}/restaurants/${restaurantId}/food-items`),
          axios.get(`${API}/restaurants/${restaurantId}/master-qr`).catch(() => ({ data: null }))
        ]);
        
        setRestaurant(res.data);
        setFoodItems(items.data);
        setMasterQR(master.data);

        // If we have items, fetch their individual QR codes
        if (items.data.length > 0) {
          const qrPromises = items.data.map(async (item) => {
            if (item.qr_code_id) {
              try {
                const response = await axios.get(`${API}/qr-codes/${item.id}`);
                return { ...response.data, food_item: item };
              } catch (error) {
                return null;
              }
            }
            return null;
          });
          
          const qrResults = await Promise.all(qrPromises);
          setQrCodes(qrResults.filter(qr => qr !== null));
        }
      } catch (error) {
        console.error('Error loading QR data:', error);
        if (error.response?.status === 404) {
          toast.error('Restaurant not found');
          navigate('/dashboard');
        }
      } finally {
        setLoading(false);
      }
    };
    
    loadData();
  }, [restaurantId]);

  const downloadQRCode = (qrCode, format = 'png', qrCanvasId) => {
    const canvas = document.getElementById(qrCanvasId);
    if (!canvas) {
      toast.error('Could not find QR Code to download.');
      return;
    }

    const link = document.createElement('a');

    if (format === 'pdf') {
      // For PDF, we'll use the print function.
      printQRCode(qrCode, qrCanvasId);
      return;
    } else {
      // For PNG/JPG, convert canvas to data URL
      let imageType = 'image/png';
      if (format === 'jpg') {
        imageType = 'image/jpeg';
      }
      const image = canvas.toDataURL(imageType);
      link.href = image;
      link.download = `${qrCode.food_item.name}_qr_code.${format}`;
    }

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast.success(`QR code downloaded as ${format.toUpperCase()}`);
  };

  const copyQRUrl = async (qrCode) => {
    const urlToCopy = `${window.location.origin}/ar/${qrCode.food_item.id}?qr=${qrCode.id}`;
    try {
      await navigator.clipboard.writeText(urlToCopy);
      toast.success('QR code URL copied to clipboard!');
    } catch (error) {
      console.error('Failed to copy URL:', error);
      toast.error('Failed to copy URL');
    }
  };

  const shareQRCode = async (qrCode) => {
    const urlToShare = `${window.location.origin}/ar/${qrCode.food_item.id}?qr=${qrCode.id}`;
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${qrCode.food_item.name} - AR Menu`,
          text: `Check out this AR preview of ${qrCode.food_item.name}!`,
          url: urlToShare
        });
      } catch (error) {
        console.error('Error sharing:', error);
      }
    } else {
      // Fallback to copying URL
      copyQRUrl(qrCode);
    }
  };

  const printQRCode = (qrCode, qrCanvasId) => {
    const canvas = document.getElementById(qrCanvasId);
    if (!canvas) {
      toast.error('Could not find QR Code to print.');
      return;
    }
    const qrImage = canvas.toDataURL('image/png');
    const printWindow = window.open('', '_blank');

    const priceHtml = qrCode.food_item.price 
      ? `<p>Price: ${getCurrencySymbol(qrCode.food_item.currency || 'INR')}${qrCode.food_item.price}</p>`
      : '';

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>QR Code - ${qrCode.food_item.name}</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            text-align: center;
            margin: 20px;
          }
          .qr-container {
            max-width: 400px;
            margin: 0 auto;
            padding: 20px;
            border: 2px solid #333;
            border-radius: 10px;
          }
          img {
            max-width: 100%;
            height: auto;
          }
          h2 {
            margin-top: 20px;
            color: #333;
          }
          .restaurant-name {
            color: #666;
            font-size: 14px;
          }
          .instructions {
            margin-top: 20px;
            font-size: 12px;
            color: #666;
          }
        </style>
      </head>
      <body>
        <div class="qr-container">
          <img src="${qrImage}" alt="QR Code">
          <h2>${qrCode.food_item.name}</h2>
          <div class="restaurant-name">${restaurant?.name}</div>
          <div class="instructions">
            <p>Scan with your phone camera to view AR preview</p>
            ${priceHtml}
          </div>
        </div>
      </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
    printWindow.close();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50 dark:from-background dark:via-background dark:to-muted flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-muted-foreground">Loading QR codes...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50 dark:from-background dark:via-background dark:to-muted">
      {/* Header */}
      <div className="bg-white/80 dark:bg-card/80 backdrop-blur-sm border-b border-orange-100 dark:border-border sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-center py-4 sm:py-6 gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate(`/restaurant/${restaurantId}/food-items`)}
              className="self-start mr-4 border-orange-200 dark:border-border text-orange-700 dark:text-orange-400 hover:bg-orange-50 dark:hover:bg-orange-950/20"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Menu
            </Button>
            <div className="flex items-center sm:flex-1">
              <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-amber-500 rounded-lg flex items-center justify-center sm:mr-4 mr-2">
                <QrCode className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent">
                  QR Code Manager
                </h1>
                <p className="text-gray-600 dark:text-muted-foreground">{restaurant?.name}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Master QR Code Section */}
        {masterQR && (
          <Card className="mb-8 border-orange-200 dark:border-orange-900/50 bg-white/50 dark:bg-card/50 overflow-hidden">
            <div className="md:flex">
              <div className="p-8 bg-white dark:bg-zinc-900 flex flex-col items-center justify-center border-r border-orange-100 dark:border-border min-w-[300px]">
                <div className="p-4 bg-white rounded-xl shadow-inner border border-gray-100 mb-4">
                  <QRCodeCanvas
                    id="master-qr-canvas"
                    value={`${window.location.origin}/menu/${restaurantId}`}
                    size={200}
                    level={"H"}
                    includeMargin={true}
                  />
                </div>
                <div className="flex flex-wrap justify-center gap-2 mt-4">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => downloadQRCode({ food_item: { name: `${restaurant?.name}_Master_Menu` } }, downloadFormat, 'master-qr-canvas')}
                    className="text-xs"
                  >
                    <Download className="w-3 h-3 mr-1" />
                    Download
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => printQRCode({ food_item: { name: `${restaurant?.name} Master Menu` } }, 'master-qr-canvas')}
                    className="text-xs"
                  >
                    <Printer className="w-3 h-3 mr-1" />
                    Print
                  </Button>
                </div>
              </div>
              <div className="p-8 flex-1">
                <div className="flex items-center space-x-2 mb-4">
                  <Badge className="bg-orange-500 text-white border-none">Master QR Code</Badge>
                  <Badge variant="outline" className="text-orange-600 dark:text-orange-400 border-orange-200 dark:border-orange-900/50">Full Menu Access</Badge>
                </div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-foreground mb-4">Restaurant Master QR Code</h2>
                <p className="text-gray-600 dark:text-muted-foreground mb-6">
                  This QR code links directly to your complete restaurant menu. Place this on dining tables, your entrance, or marketing materials to give customers instant access to your entire selection.
                </p>
                <div className="p-4 bg-orange-50 dark:bg-orange-950/20 rounded-lg border border-orange-100 dark:border-orange-900/30 flex items-center justify-between">
                  <div className="flex items-center text-sm font-medium text-orange-800 dark:text-orange-300">
                    <Smartphone className="w-4 h-4 mr-2" />
                    {window.location.origin}/menu/{restaurantId}
                  </div>
                  <Button 
                    size="sm" 
                    variant="ghost" 
                    onClick={() => {
                      navigator.clipboard.writeText(`${window.location.origin}/menu/${restaurantId}`);
                      toast.success('Menu URL copied!');
                    }}
                    className="text-orange-600 hover:text-orange-700 hover:bg-orange-100 dark:hover:bg-orange-900/30"
                  >
                    <Copy className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        )}

        {/* Instructions Card */}
        <Card className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/20 dark:to-purple-950/20 border-blue-200 dark:border-blue-900/50 mb-8">
          <CardContent className="p-6">
            <div className="flex items-start space-x-4">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-lg flex items-center justify-center flex-shrink-0">
                <Smartphone className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-foreground mb-2">How QR Codes Work</h3>
                <p className="text-gray-700 dark:text-muted-foreground mb-4">
                  Each QR code is automatically generated when you create a menu item. Customers can scan these codes with their phone camera to instantly view AR previews of your food.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div className="flex items-center text-gray-600 dark:text-muted-foreground">
                    <Scan className="w-4 h-4 mr-2 text-blue-500" />
                    Customer scans QR code
                  </div>
                  <div className="flex items-center text-gray-600 dark:text-muted-foreground">
                    <Smartphone className="w-4 h-4 mr-2 text-blue-500" />
                    Opens AR viewer in browser
                  </div>
                  <div className="flex items-center text-gray-600 dark:text-muted-foreground">
                    <Eye className="w-4 h-4 mr-2 text-blue-500" />
                    Views 3D/AR food preview
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* QR Codes Grid */}
        {qrCodes.length === 0 ? (
          <Card className="bg-white/80 dark:bg-card/80 backdrop-blur-sm border-orange-100 dark:border-border">
            <CardContent className="p-12 text-center">
              <div className="w-16 h-16 bg-gray-100 dark:bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                <QrCode className="w-8 h-8 text-gray-400 dark:text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-foreground mb-2">No QR codes yet</h3>
              <p className="text-gray-600 dark:text-muted-foreground mb-6">
                QR codes are automatically generated when you add menu items
              </p>
              <Button
                onClick={() => navigate(`/restaurant/${restaurantId}/food-items`)}
                className="bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white"
              >
                <UtensilsCrossed className="w-4 h-4 mr-2" />
                Add Menu Items
              </Button>
            </CardContent>
          </Card>
        ) : (
          <>
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-foreground">QR Codes ({qrCodes.length})</h2>
                <p className="text-gray-600 dark:text-muted-foreground">Download, print, or share your AR-enabled QR codes</p>
              </div>
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-600 dark:text-muted-foreground">Format:</span>
                  <Select value={downloadFormat} onValueChange={setDownloadFormat}>
                    <SelectTrigger className="w-24 dark:bg-muted dark:border-border dark:text-foreground">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="dark:bg-card dark:border-border">
                      <SelectItem value="png" className="dark:text-foreground">PNG</SelectItem>
                      <SelectItem value="jpg" className="dark:text-foreground">JPG</SelectItem>
                      <SelectItem value="pdf" className="dark:text-foreground">PDF</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {qrCodes.map((qrCode) => (
                <Card key={qrCode.id} className="bg-white/80 dark:bg-card/80 backdrop-blur-sm border-orange-100 dark:border-border hover:shadow-lg transition-all duration-200">
                  <CardHeader className="pb-4">
                    <CardTitle className="text-lg font-semibold text-gray-900 dark:text-foreground mb-1">
                      {qrCode.food_item.name}
                    </CardTitle>
                    <div className="flex items-center space-x-2">
                      <Badge variant="secondary" className="bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400">
                        {getCurrencySymbol(qrCode.food_item.currency)} {qrCode.food_item.price}
                      </Badge>
                      <Badge variant="outline" className="text-xs dark:border-border dark:text-muted-foreground">
                        {qrCode.scan_count} scans
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {/* QR Code Image */}
                    <div className="bg-white p-4 rounded-lg border-2 border-gray-200 dark:border-border mb-4 flex justify-center">
                      <QRCodeCanvas
                        id={`qr-canvas-${qrCode.id}`}
                        value={`${window.location.origin}/ar/${qrCode.food_item.id}?qr=${qrCode.id}`}
                        size={256} // Increased size for better quality
                        bgColor={"#ffffff"}
                        fgColor={"#000000"}
                        level={"L"}
                        includeMargin={true} // A small margin helps scanners
                      />
                    </div>

                    {/* Action Buttons */}
                    <div className="space-y-2">
                      <div className="grid grid-cols-2 gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => downloadQRCode(qrCode, downloadFormat, `qr-canvas-${qrCode.id}`)}
                          className="text-xs dark:border-border dark:text-muted-foreground dark:hover:text-foreground"
                        >
                          <Download className="w-3 h-3 mr-1" />
                          Download
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => printQRCode(qrCode, `qr-canvas-${qrCode.id}`)}
                          className="text-xs dark:border-border dark:text-muted-foreground dark:hover:text-foreground"
                        >
                          <Printer className="w-3 h-3 mr-1" />
                          Print
                        </Button>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => copyQRUrl(qrCode)}
                          className="text-xs border-blue-200 dark:border-blue-900/50 text-blue-700 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/20"
                        >
                          <Copy className="w-3 h-3 mr-1" />
                          Copy URL
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => shareQRCode(qrCode)}
                          className="text-xs border-green-200 dark:border-green-900/50 text-green-700 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-950/20"
                        >
                          <Share2 className="w-3 h-3 mr-1" />
                          Share
                        </Button>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => window.open(`/ar/${qrCode.food_item.id}`, '_blank')}
                        className="w-full text-xs border-purple-200 dark:border-purple-900/50 text-purple-700 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-950/20"
                      >
                        <Eye className="w-3 h-3 mr-1" />
                        Test AR Preview
                      </Button>
                    </div>

                    {/* QR Code URL */}
                    <div className="mt-4 p-2 bg-gray-50 dark:bg-muted rounded text-xs text-gray-600 dark:text-muted-foreground break-all">
                      {`${window.location.origin}/ar/${qrCode.food_item.id}`}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </>
        )}

        {/* Usage Tips */}
        <Card className="bg-white/80 dark:bg-card/80 backdrop-blur-sm border-orange-100 dark:border-border mt-8">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-gray-900 dark:text-foreground">Usage Tips</CardTitle>
            <CardDescription className="dark:text-muted-foreground">Best practices for using your QR codes</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold text-gray-900 dark:text-foreground mb-2">Printing Guidelines</h4>
                <ul className="space-y-1 text-sm text-gray-600 dark:text-muted-foreground">
                  <li>• Print at least 2cm x 2cm for best scanning</li>
                  <li>• Use high contrast (black on white)</li>
                  <li>• Test scan before mass printing</li>
                  <li>• Include item name and price below QR code</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 dark:text-foreground mb-2">Placement Ideas</h4>
                <ul className="space-y-1 text-sm text-gray-600 dark:text-muted-foreground">
                  <li>• Table tents next to food displays</li>
                  <li>• Menu cards with QR codes</li>
                  <li>• Digital menu screens</li>
                  <li>• Social media posts and marketing</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Hidden canvas for PDF generation */}
      <canvas ref={canvasRef} style={{ display: 'none' }} />
    </div>
  );
}