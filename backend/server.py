from fastapi import FastAPI, APIRouter, HTTPException, Depends, UploadFile, File, Form
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from fastapi.staticfiles import StaticFiles
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
import hashlib
import qrcode
import io
import base64
from pathlib import Path
from pydantic import BaseModel, Field, EmailStr
from typing import List, Optional, Dict, Any
import uuid
from datetime import datetime, timezone, timedelta
import jwt
from passlib.context import CryptContext
import json
from bson import ObjectId

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Security
security = HTTPBearer()
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
SECRET_KEY = os.environ.get("SECRET_KEY", "your-secret-key-change-in-production")
ALGORITHM = "HS256"

app = FastAPI(title="FoodAR API", description="AR-QR Restaurant Management System")
api_router = APIRouter(prefix="/api")


# Create uploads directory
uploads_dir = Path("uploads")
uploads_dir.mkdir(exist_ok=True)
app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")

# Models
class User(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    email: EmailStr
    name: str
    role: str = "restaurant_owner"  # restaurant_owner, admin, super_admin
    permissions: List[str] = []
    default_restaurant_id: Optional[str] = None
    is_active: bool = True
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

# Define all available permissions
AVAILABLE_PERMISSIONS = [
    "manage_restaurants",  # Approve/deactivate restaurant accounts
    "view_restaurant_status",  # View restaurant status and details
    "edit_food_library",  # Add/edit/remove 3D models, videos, images
    "view_sales_data",  # Access revenue reports
    "view_analytics",  # Product scan counts, QR usage
    "manage_feedback",  # View and respond to customer feedback
    "generate_reports",  # Download CSV/PDF reports
    "manage_members",  # Add/remove admins and assign roles
    "view_user_management",  # Manage user accounts
    "view_system_stats",  # System-wide statistics
    "manage_qr_codes",  # QR code management
    "view_financial_data",  # Financial reports and data
    "manage_content",  # Content management
    "view_audit_logs",  # System audit logs
    "full_super_admin_access"  # All permissions
]

class UserCreate(BaseModel):
    email: EmailStr
    password: str
    name: str
    role: str = "restaurant_owner"

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class Restaurant(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    description: Optional[str] = None
    address: Optional[str] = None
    phone: Optional[str] = None
    image_url: Optional[str] = None
    owner_id: str
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class RestaurantCreate(BaseModel):
    name: str
    description: Optional[str] = None
    address: Optional[str] = None
    phone: Optional[str] = None
    image_url: Optional[str] = None

class FoodItem(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    description: str
    price: float
    currency: str = "INR"  # INR, USD, EUR, etc.
    category: str  # starters, main_course, desserts, drinks
    restaurant_id: str
    preview_type: str  # 3d_model, 360_video, 2d_image, custom
    preview_url: Optional[str] = None
    qr_code_id: Optional[str] = None
    library_item_id: Optional[str] = None  # If using pre-built model
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class FoodItemCreate(BaseModel):
    name: str
    description: str
    price: float
    currency: str = "INR"
    category: str
    preview_type: str
    preview_url: Optional[str] = None
    library_item_id: Optional[str] = None

class QRCodeModel(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    food_item_id: str
    qr_data: str
    qr_image_url: str
    scan_count: int = 0
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class FoodLibraryItem(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    category: str
    preview_type: str  # kept for backward-compat; items also include all three assets
    file_url: Optional[str] = None  # legacy primary file
    thumbnail_url: Optional[str] = None
    # New optional asset fields so each item can have all three
    image_url: Optional[str] = None
    model_url: Optional[str] = None
    model_glb_url: Optional[str] = None 
    video_url: Optional[str] = None
    tags: List[str] = []
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class AnalyticsEvent(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    event_type: str  # qr_scan, ar_view
    food_item_id: str
    qr_code_id: Optional[str] = None
    user_agent: Optional[str] = None
    ip_address: Optional[str] = None
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class AnalyticsScanRequest(BaseModel):
    food_item_id: str
    qr_code_id: str
    user_agent: Optional[str] = None

class Feedback(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    restaurant_id: str
    customer_name: str
    customer_email: Optional[str] = None
    rating: int = Field(ge=1, le=5)
    feedback_type: str  # food_quality, service, ambiance, value_for_money, ar_experience, general
    title: str
    message: str
    image_url: Optional[str] = None
    is_public: bool = True
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: Optional[datetime] = None

class FeedbackCreate(BaseModel):
    restaurant_id: str
    customer_name: str
    customer_email: Optional[str] = None
    rating: int = Field(ge=1, le=5)
    feedback_type: str
    title: str
    message: str
    image_url: Optional[str] = None
    is_public: bool = True

class AdminInvite(BaseModel):
    email: EmailStr
    name: str
    permissions: List[str]

class PermissionUpdate(BaseModel):
    permissions: List[str]

class AdminCreate(BaseModel):
    email: EmailStr
    name: str
    password: str
    permissions: List[str]

class AdminDetailsUpdate(BaseModel):
    email: EmailStr
    name: str
    password: Optional[str] = None

def serialize_doc(doc):
    if doc and '_id' in doc:
        doc['_id'] = str(doc['_id'])
    return doc

# Utility functions
def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        expire = datetime.now(timezone.utc) + timedelta(minutes=15)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password):
    # """Hashes a password, truncating it to 72 bytes to comply with bcrypt limit."""
    # password_bytes = password.encode('utf-8')
    # if len(password_bytes) > 72:
    #     password_bytes = password_bytes[:72]
    return pwd_context.hash(password)

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    try:
        payload = jwt.decode(credentials.credentials, SECRET_KEY, algorithms=[ALGORITHM])
        email: str = payload.get("sub")
        if email is None:
            raise HTTPException(status_code=401, detail="Invalid authentication credentials")
    except jwt.PyJWTError:
        raise HTTPException(status_code=401, detail="Invalid authentication credentials")
    
    user = await db.users.find_one({"email": email})
    if user is None:
        raise HTTPException(status_code=401, detail="User not found")
    return User(**user)

async def require_admin(current_user: User = Depends(get_current_user)):
    if current_user.role not in ["admin", "super_admin"]:
        raise HTTPException(status_code=403, detail="Not authorized")
    return current_user

admin_router = APIRouter(prefix="/api/admin", dependencies=[Depends(require_admin)])

async def require_super_admin(current_user: User = Depends(get_current_user)):
    if current_user.role != "super_admin":
        raise HTTPException(status_code=403, detail="Super admin access required")
    return current_user

def generate_qr_code(data: str) -> str:
    qr = qrcode.QRCode(version=1, box_size=10, border=5)
    qr.add_data(data)
    qr.make(fit=True)
    
    img = qr.make_image(fill_color="black", back_color="white")
    buffer = io.BytesIO()
    img.save(buffer, format='PNG')
    buffer.seek(0)
    
    # Convert to base64
    img_base64 = base64.b64encode(buffer.getvalue()).decode()
    return f"data:image/png;base64,{img_base64}"

# Authentication routes
@api_router.post("/auth/register", response_model=Dict[str, Any])
async def register(user_data: UserCreate):
    # Check if user exists
    existing_user = await db.users.find_one({"email": user_data.email})
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    # Hash password and create user
    hashed_password = get_password_hash(user_data.password)
    user_dict = user_data.dict()
    user_dict.pop("password")
    user_obj = User(**user_dict)
    
    # Insert user with hashed password
    user_doc = user_obj.dict()
    user_doc["password_hash"] = hashed_password
    await db.users.insert_one(user_doc)
    
    # Create access token
    access_token = create_access_token(data={"sub": user_obj.email})
    return {"access_token": access_token, "token_type": "bearer", "user": user_obj}

@api_router.post("/auth/login", response_model=Dict[str, Any])
async def login(user_data: UserLogin):
    user = await db.users.find_one({"email": user_data.email})
    if not user or not verify_password(user_data.password, user["password_hash"]):
        raise HTTPException(status_code=400, detail="Invalid email or password")
    
    # Special handling for super admin
    if user_data.email == "divyanshgupta5748@gmail.com" and user_data.password == "#Divy5748Ansh":
        # Ensure super admin has correct role and permissions
        await db.users.update_one(
            {"email": user_data.email},
            {
                "$set": {
                    "role": "super_admin",
                    "permissions": ["full_super_admin_access"],
                    "is_active": True
                }
            }
        )
        user = await db.users.find_one({"email": user_data.email})
    
    access_token = create_access_token(data={"sub": user["email"]})
    user_obj = User(**user)
    return {"access_token": access_token, "token_type": "bearer", "user": user_obj}

@api_router.get("/auth/me", response_model=User)
async def get_current_user_info(current_user: User = Depends(get_current_user)):
    return current_user

# Restaurant routes
@api_router.post("/restaurants", response_model=Restaurant)
async def create_restaurant(restaurant_data: RestaurantCreate, current_user: User = Depends(get_current_user)):
    # Check if user is admin or super_admin - they can create unlimited restaurants
    if current_user.role not in ["admin", "super_admin"]:
        # For regular restaurant owners, check if they already have a restaurant
        existing_restaurants = await db.restaurants.count_documents({"owner_id": current_user.id})
        if existing_restaurants >= 1:
            raise HTTPException(
                status_code=403, 
                detail="Restaurant owners can only create one restaurant. Contact admin for additional restaurants."
            )
    
    restaurant_dict = restaurant_data.dict()
    restaurant_dict["owner_id"] = current_user.id
    restaurant_obj = Restaurant(**restaurant_dict)
    await db.restaurants.insert_one(restaurant_obj.dict())
    return restaurant_obj

@api_router.get("/restaurants", response_model=List[Restaurant])
async def get_user_restaurants(current_user: User = Depends(get_current_user)):
    restaurants = await db.restaurants.find({"owner_id": current_user.id}).to_list(100)
    return [Restaurant(**restaurant) for restaurant in restaurants]

@api_router.get("/restaurants/{restaurant_id}", response_model=Restaurant)
async def get_restaurant(restaurant_id: str, current_user: User = Depends(get_current_user)):
    restaurant = await db.restaurants.find_one({"id": restaurant_id})
    if not restaurant:
        raise HTTPException(status_code=404, detail="Restaurant not found")
    # Only owner or admin/super_admin can view
    if restaurant["owner_id"] != current_user.id and current_user.role not in ["admin", "super_admin"]:
        raise HTTPException(status_code=403, detail="Not authorized to access this restaurant")
    return Restaurant(**restaurant)

@api_router.put("/restaurants/{restaurant_id}", response_model=Restaurant)
async def update_restaurant(restaurant_id: str, restaurant_data: RestaurantCreate, current_user: User = Depends(get_current_user)):
    existing = await db.restaurants.find_one({"id": restaurant_id})
    if not existing:
        raise HTTPException(status_code=404, detail="Restaurant not found")
    if existing["owner_id"] != current_user.id and current_user.role not in ["admin", "super_admin"]:
        raise HTTPException(status_code=403, detail="Not authorized to update this restaurant")
    update_data = {k: v for k, v in restaurant_data.dict().items() if v is not None}
    await db.restaurants.update_one({"id": restaurant_id}, {"$set": update_data})
    updated = await db.restaurants.find_one({"id": restaurant_id})
    return Restaurant(**updated)

@api_router.delete("/restaurants/{restaurant_id}")
async def delete_restaurant(restaurant_id: str, current_user: User = Depends(get_current_user)):
    existing = await db.restaurants.find_one({"id": restaurant_id})
    if not existing:
        raise HTTPException(status_code=404, detail="Restaurant not found")
    if existing["owner_id"] != current_user.id and current_user.role not in ["admin", "super_admin"]:
        raise HTTPException(status_code=403, detail="Not authorized to delete this restaurant")
    # Delete related food items and QR codes
    food_items = await db.food_items.find({"restaurant_id": restaurant_id}).to_list(10000)
    for item in food_items:
        await db.qr_codes.delete_one({"food_item_id": item["id"]})
    await db.food_items.delete_many({"restaurant_id": restaurant_id})
    # Delete related feedback
    await db.feedback.delete_many({"restaurant_id": restaurant_id})
    # Delete restaurant
    await db.restaurants.delete_one({"id": restaurant_id})
    return {"message": "Restaurant deleted successfully"}

@api_router.put("/restaurants/{restaurant_id}/default")
async def set_default_restaurant(restaurant_id: str, current_user: User = Depends(get_current_user)):
    # Only admins/super_admins can set a default restaurant for themselves
    if current_user.role not in ["admin", "super_admin"]:
        raise HTTPException(status_code=403, detail="Not authorized to set default restaurant")
    # Ensure restaurant exists
    existing = await db.restaurants.find_one({"id": restaurant_id})
    if not existing:
        raise HTTPException(status_code=404, detail="Restaurant not found")
    await db.users.update_one({"id": current_user.id}, {"$set": {"default_restaurant_id": restaurant_id}})
    return {"message": "Default restaurant updated"}

@api_router.post("/restaurants/{restaurant_id}/upload-image")
async def upload_restaurant_image(restaurant_id: str, file: UploadFile = File(...), current_user: User = Depends(get_current_user)):
    restaurant = await db.restaurants.find_one({"id": restaurant_id})
    if not restaurant:
        raise HTTPException(status_code=404, detail="Restaurant not found")
    if restaurant["owner_id"] != current_user.id and current_user.role not in ["admin", "super_admin"]:
        raise HTTPException(status_code=403, detail="Not authorized")
    if not file.content_type.startswith('image/'):
        raise HTTPException(status_code=400, detail="File must be an image")
    # Save file
    ext = file.filename.split('.')[-1]
    filename = f"restaurant_{restaurant_id}_{uuid.uuid4()}.{ext}"
    file_path = uploads_dir / filename
    with open(file_path, "wb") as buffer:
        content = await file.read()
        buffer.write(content)
    backend_origin = os.environ.get("BACKEND_PUBLIC_URL", "")
    image_path = f"/uploads/{filename}"
    image_url = f"{backend_origin}{image_path}" if backend_origin else image_path
    await db.restaurants.update_one({"id": restaurant_id}, {"$set": {"image_url": image_url}})
    return {"image_url": image_url}

# Food items routes
@api_router.post("/restaurants/{restaurant_id}/food-items", response_model=FoodItem)
async def create_food_item(
    restaurant_id: str, 
    food_data: FoodItemCreate, 
    current_user: User = Depends(get_current_user)
):
    # Verify restaurant ownership
    restaurant = await db.restaurants.find_one({"id": restaurant_id, "owner_id": current_user.id})
    if not restaurant:
        raise HTTPException(status_code=404, detail="Restaurant not found")
    
    food_dict = food_data.dict()
    food_dict["restaurant_id"] = restaurant_id
    food_obj = FoodItem(**food_dict)
    
    # Generate QR code
    qr_data = f"https://foodar-menu.preview.emergentagent.com/ar/{food_obj.id}"
    qr_image = generate_qr_code(qr_data)
    
    qr_code_obj = QRCodeModel(
        food_item_id=food_obj.id,
        qr_data=qr_data,
        qr_image_url=qr_image
    )
    
    await db.qr_codes.insert_one(qr_code_obj.dict())
    food_obj.qr_code_id = qr_code_obj.id
    
    await db.food_items.insert_one(food_obj.dict())
    return food_obj

@api_router.get("/restaurants/{restaurant_id}/food-items", response_model=List[FoodItem])
async def get_restaurant_food_items(restaurant_id: str, current_user: User = Depends(get_current_user)):
    # Verify restaurant ownership
    restaurant = await db.restaurants.find_one({"id": restaurant_id, "owner_id": current_user.id})
    if not restaurant:
        raise HTTPException(status_code=404, detail="Restaurant not found")
    
    food_items = await db.food_items.find({"restaurant_id": restaurant_id}).to_list(1000)
    return [FoodItem(**item) for item in food_items]

@api_router.get("/public/restaurants/{restaurant_id}/food-items", response_model=List[FoodItem])
async def get_restaurant_food_items_public(restaurant_id: str):
    """Public endpoint to get all food items for a restaurant."""
    restaurant = await db.restaurants.find_one({"id": restaurant_id})
    if not restaurant:
        raise HTTPException(status_code=404, detail="Restaurant not found")
    food_items = await db.food_items.find({"restaurant_id": restaurant_id}).to_list(1000)
    return [FoodItem(**item) for item in food_items]

@api_router.put("/restaurants/{restaurant_id}/food-items/{food_item_id}", response_model=FoodItem)
async def update_food_item(
    restaurant_id: str,
    food_item_id: str,
    food_data: FoodItemCreate,
    current_user: User = Depends(get_current_user)
):
    # Verify restaurant ownership
    restaurant = await db.restaurants.find_one({"id": restaurant_id, "owner_id": current_user.id})
    if not restaurant:
        raise HTTPException(status_code=404, detail="Restaurant not found")
    
    # Check if food item exists and belongs to this restaurant
    existing_item = await db.food_items.find_one({"id": food_item_id, "restaurant_id": restaurant_id})
    if not existing_item:
        raise HTTPException(status_code=404, detail="Food item not found")
    
    # Update the food item
    update_data = food_data.dict()
    update_data["updated_at"] = datetime.now(timezone.utc)
    
    await db.food_items.update_one(
        {"id": food_item_id},
        {"$set": update_data}
    )
    
    # Return updated item
    updated_item = await db.food_items.find_one({"id": food_item_id})
    return FoodItem(**updated_item)

@api_router.delete("/restaurants/{restaurant_id}/food-items/{food_item_id}")
async def delete_food_item(
    restaurant_id: str,
    food_item_id: str,
    current_user: User = Depends(get_current_user)
):
    # Verify restaurant ownership
    restaurant = await db.restaurants.find_one({"id": restaurant_id, "owner_id": current_user.id})
    if not restaurant:
        raise HTTPException(status_code=404, detail="Restaurant not found")
    
    # Check if food item exists and belongs to this restaurant
    existing_item = await db.food_items.find_one({"id": food_item_id, "restaurant_id": restaurant_id})
    if not existing_item:
        raise HTTPException(status_code=404, detail="Food item not found")
    
    # Delete the food item
    await db.food_items.delete_one({"id": food_item_id})
    
    # Also delete associated QR code
    await db.qr_codes.delete_one({"food_item_id": food_item_id})
    
    return {"message": "Food item deleted successfully"}

@api_router.get("/food-items/{food_item_id}")
async def get_food_item_public(food_item_id: str):
    """Public endpoint for AR viewer"""
    from food_item_mapping import get_food_item_media
    food_item = await db.food_items.find_one({"id": food_item_id})
    if not food_item:
        raise HTTPException(status_code=404, detail="Food item not found")
    
    # Get restaurant info
    restaurant = await db.restaurants.find_one({"id": food_item["restaurant_id"]})
    
    # Get library item if applicable
    library_item = None
    if food_item.get("library_item_id"):
        library_item = await db.food_library.find_one({"id": food_item["library_item_id"]})
    
    # Get the full media mapping from food_item_mapping.py
    food_item_mapping = get_food_item_media(food_item["name"], food_item["category"])
    
    return {
        "food_item": FoodItem(**food_item),
        "restaurant": Restaurant(**restaurant) if restaurant else None,
        "library_item": FoodLibraryItem(**library_item) if library_item else None,
        "food_item_mapping": food_item_mapping
    }

# QR Code routes
@api_router.get("/qr-codes/{food_item_id}", response_model=QRCodeModel)
async def get_qr_code(food_item_id: str, current_user: User = Depends(get_current_user)):
    qr_code = await db.qr_codes.find_one({"food_item_id": food_item_id})
    if not qr_code:
        raise HTTPException(status_code=404, detail="QR code not found")
    return QRCodeModel(**qr_code)

# Food Library routes
@api_router.get("/food-library", response_model=List[FoodLibraryItem])
async def get_food_library(category: Optional[str] = None, search: Optional[str] = None):
    from food_item_mapping import get_food_item_media, get_all_food_items, FOOD_ITEMS_MAPPING
    
    # Use the new food item mapping structure instead of database
    all_items = get_all_food_items()
    filtered_items = []
    
    # Filter by category if provided
    if category:
        filtered_items = [item for item in all_items if item.get("category") == category]
    else:
        filtered_items = all_items
    
    # Filter by search term if provided
    if search:
        search_lower = search.lower()
        filtered_items = [
            item for item in filtered_items 
            if search_lower in item.get("name", "").lower() 
            or any(search_lower in tag.lower() for tag in item.get("tags", []))
        ]
    
    normalized = []
    for item in filtered_items:
        # Generate a unique ID for each item
        # item_id = str(uuid.uuid4())
        
        # ⭐ STABLE ID: based on name + category (never changes)
        item_key = f"{item.get('name','')}-{item.get('category','')}"
        item_id = hashlib.md5(item_key.encode()).hexdigest()
        
        # Determine preview_type based on available media URLs
        preview_type = "2d_image"  # Default
        if item.get("model_url"):
            preview_type = "3d_model"
        elif item.get("video_url"):
            preview_type = "360_video"
        
        # Set file_url based on preview_type
        file_url = item.get("image_url")
        if preview_type == "3d_model" and item.get("model_url"):
            file_url = item.get("model_url")
        elif preview_type == "360_video" and item.get("video_url"):
            file_url = item.get("video_url")
        
        # Create a dictionary that matches the FoodLibraryItem model
        normalized_item = {
            "id": item_id,
            "name": item.get("name", "Unknown Food"),
            "category": item.get("category", "main_course"),
            "preview_type": preview_type,
            "file_url": file_url,
            "thumbnail_url": item.get("image_url"),
            "image_url": item.get("image_url"),
            "model_url": item.get("model_url"),
            "model_glb_url": item.get("model_glb_url"),
            "video_url": item.get("video_url"),
            "tags": item.get("tags", []),
            "created_at": datetime.now().isoformat()
        }
        
        normalized.append(normalized_item)
    
    return normalized

# Analytics routes
@api_router.post("/analytics/scan")
async def track_qr_scan(request: AnalyticsScanRequest):
    # Update scan count
    await db.qr_codes.update_one(
        {"id": request.qr_code_id},
        {"$inc": {"scan_count": 1}}
    )
    
    # Track analytics event
    event = AnalyticsEvent(
        event_type="qr_scan",
        food_item_id=request.food_item_id,
        qr_code_id=request.qr_code_id,
        user_agent=request.user_agent
    )
    await db.analytics.insert_one(event.dict())
    return {"status": "success"}

@api_router.get("/analytics/restaurant/{restaurant_id}")
async def get_restaurant_analytics(restaurant_id: str, current_user: User = Depends(get_current_user)):
    # Verify restaurant ownership
    restaurant = await db.restaurants.find_one({"id": restaurant_id, "owner_id": current_user.id})
    if not restaurant:
        raise HTTPException(status_code=404, detail="Restaurant not found")
    
    # Get food items for this restaurant
    food_items = await db.food_items.find({"restaurant_id": restaurant_id}).to_list(1000)
    food_item_ids = [item["id"] for item in food_items]
    
    # Get analytics data
    analytics = await db.analytics.find({"food_item_id": {"$in": food_item_ids}}).to_list(1000)
    
    # Get QR code scan counts
    qr_codes = await db.qr_codes.find({"food_item_id": {"$in": food_item_ids}}).to_list(1000)
    
    total_scans = sum(qr["scan_count"] for qr in qr_codes)
    
    return {
        "total_scans": total_scans,
        "total_food_items": len(food_items),
        "analytics_events": [serialize_doc(event) for event in analytics],
        "qr_codes": [serialize_doc(qr) for qr in qr_codes]
    }

@admin_router.post("/members/invite", dependencies=[Depends(require_super_admin)])
async def invite_admin(invite_data: AdminInvite):
    existing_user = await db.users.find_one({"email": invite_data.email})
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    # Create a new admin user without a password (they will set it up later)
    new_admin = {
        "id": str(uuid.uuid4()),
        "email": invite_data.email,
        "name": invite_data.name,
        "role": "admin",
        "permissions": invite_data.permissions,
        "is_active": True,
        "created_at": datetime.now(timezone.utc),
        "password_hash": None  # User will set password on first login
    }
    await db.users.insert_one(new_admin)
    # Here you would typically send an email invite
    return {"message": f"Admin invitation sent to {invite_data.email}"}

@admin_router.post("/members/create", dependencies=[Depends(require_super_admin)])
async def create_admin(admin_data: AdminCreate):
    existing_user = await db.users.find_one({"email": admin_data.email})
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    # Create a new admin user with password
    new_admin = {
        "id": str(uuid.uuid4()),
        "email": admin_data.email,
        "name": admin_data.name,
        "role": "admin",
        "permissions": admin_data.permissions,
        "is_active": True,
        "created_at": datetime.now(timezone.utc),
        "password_hash": get_password_hash(admin_data.password),
        "password": admin_data.password  # Store plain text password for super admin to see
    }
    await db.users.insert_one(new_admin)
    return {"message": f"Admin created successfully for {admin_data.email}"}

@admin_router.get("/members", dependencies=[Depends(require_super_admin)])
async def get_all_admins():
    """Get all admin users"""
    admins = await db.users.find({"role": {"$in": ["admin", "super_admin"]}}).to_list(100)
    return [User(**admin) for admin in admins]

@admin_router.put("/members/{user_id}/permissions", dependencies=[Depends(require_super_admin)])
async def update_admin_permissions(user_id: str, permission_data: PermissionUpdate):
    """Update admin permissions"""
    user = await db.users.find_one({"id": user_id, "role": {"$in": ["admin", "super_admin"]}})
    if not user:
        raise HTTPException(status_code=404, detail="Admin not found")
    
    await db.users.update_one(
        {"id": user_id},
        {"$set": {"permissions": permission_data.permissions}}
    )
    return {"message": "Permissions updated successfully"}

@admin_router.put("/members/{user_id}/details", dependencies=[Depends(require_super_admin)])
async def update_admin_details(user_id: str, details: AdminDetailsUpdate):
    """Update admin details (name, email, password)"""
    user = await db.users.find_one({"id": user_id, "role": "admin"})
    if not user:
        raise HTTPException(status_code=404, detail="Admin not found")
    
    # Check if email is already taken by another user
    existing_user = await db.users.find_one({"email": details.email, "id": {"$ne": user_id}})
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already taken by another user")
    
    update_data = {
        "name": details.name,
        "email": details.email
    }
    
    # Only update password if provided
    if details.password:
        update_data["password_hash"] = get_password_hash(details.password)
        update_data["password"] = details.password  # Store plain text for super admin to see
    
    await db.users.update_one(
        {"id": user_id},
        {"$set": update_data}
    )
    return {"message": "Admin details updated successfully"}

@admin_router.delete("/members/{user_id}", dependencies=[Depends(require_super_admin)])
async def remove_admin(user_id: str):
    """Remove admin privileges (convert back to restaurant owner)"""
    user = await db.users.find_one({"id": user_id, "role": "admin"})
    if not user:
        raise HTTPException(status_code=404, detail="Admin not found")
    
    await db.users.update_one(
        {"id": user_id},
        {"$set": {"role": "restaurant_owner", "permissions": []}}
    )
    return {"message": "Admin privileges removed successfully"}

@admin_router.get("/permissions", dependencies=[Depends(require_super_admin)])
async def get_available_permissions():
    """Get all available permissions"""
    return {"permissions": AVAILABLE_PERMISSIONS}

@admin_router.get("/stats", dependencies=[Depends(require_super_admin)])
async def get_system_stats():
    """Get system-wide statistics for super admin dashboard"""
    # Count restaurants
    total_restaurants = await db.restaurants.count_documents({})
    active_restaurants = await db.restaurants.count_documents({"is_active": True})
    
    # Count users
    total_users = await db.users.count_documents({})
    admin_users = await db.users.count_documents({"role": {"$in": ["admin", "super_admin"]}})
    
    # Count food items
    total_food_items = await db.food_items.count_documents({})
    
    # Count QR codes and scans
    total_qr_codes = await db.qr_codes.count_documents({})
    total_scans = await db.qr_codes.aggregate([
        {"$group": {"_id": None, "total": {"$sum": "$scan_count"}}}
    ]).to_list(1)
    total_scan_count = total_scans[0]["total"] if total_scans else 0
    
    # Count library items
    total_library_items = await db.food_library.count_documents({})
    
    # Get recent analytics
    recent_analytics = await db.analytics.find({}).sort("timestamp", -1).limit(10).to_list(10)
    
    return {
        "restaurants": {
            "total": total_restaurants,
            "active": active_restaurants
        },
        "users": {
            "total": total_users,
            "admins": admin_users
        },
        "food_items": total_food_items,
        "qr_codes": total_qr_codes,
        "total_scans": total_scan_count,
        "library_items": total_library_items,
        "recent_analytics": [serialize_doc(event) for event in recent_analytics]
    }
@app.get("/")
def root():
    return {"message": "DishLook Backend running successfully 🚀"}

# Include router
app.include_router(api_router)
app.include_router(admin_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

# Seed food library on startup
@app.on_event("startup")
async def startup_db_client():
    # Seed food library
    await seed_food_library()
    # Create super admin if not exists
    super_admin_email = "divyanshgupta5748@gmail.com"
    user = await db.users.find_one({"email": super_admin_email})
    if not user:
        super_admin = {
            "id": str(uuid.uuid4()),
            "email": super_admin_email,
            "name": "Super Admin",
            "role": "super_admin",
            "permissions": ["full_super_admin_access"],
            "is_active": True,
            "created_at": datetime.now(timezone.utc),
            "password_hash": get_password_hash("#Divy5748Ansh")
        }
        await db.users.insert_one(super_admin)
        logger.info(f"Super admin created: {super_admin_email}")
    else:
        # Ensure existing super admin has correct permissions
        await db.users.update_one(
            {"email": super_admin_email},
            {
                "$set": {
                    "role": "super_admin",
                    "permissions": ["full_super_admin_access"],
                    "is_active": True
                }
            }
        )

@app.on_event("startup")
async def seed_food_library():
    """Seed the database with sample food library items"""
    existing_count = await db.food_library.count_documents({})
    if existing_count == 0:
        sample_foods = [
            # Starters
            {"name": "Classic Caesar Salad", "category": "starters", "preview_type": "3d_model", "file_url": "/models/caesar_salad.glb", "thumbnail_url": "/images/caesar_salad.jpg", "tags": ["salad", "lettuce", "caesar", "healthy"]},
            {"name": "Bruschetta", "category": "starters", "preview_type": "3d_model", "file_url": "/models/bruschetta.glb", "thumbnail_url": "/images/bruschetta.jpg", "tags": ["bread", "tomato", "italian", "appetizer"]},
            {"name": "Buffalo Wings", "category": "starters", "preview_type": "360_video", "file_url": "/videos/buffalo_wings.mp4", "thumbnail_url": "/images/buffalo_wings.jpg", "tags": ["chicken", "wings", "spicy", "american"]},
            {"name": "Mozzarella Sticks", "category": "starters", "preview_type": "3d_model", "file_url": "/models/mozzarella_sticks.glb", "thumbnail_url": "/images/mozzarella_sticks.jpg", "tags": ["cheese", "fried", "appetizer"]},
            
            # Main Course
            {"name": "Margherita Pizza", "category": "main_course", "preview_type": "3d_model", "file_url": "/models/margherita_pizza.glb", "thumbnail_url": "/images/margherita_pizza.jpg", "tags": ["pizza", "italian", "tomato", "basil", "mozzarella"]},
            {"name": "Beef Burger", "category": "main_course", "preview_type": "360_video", "file_url": "/videos/beef_burger.mp4", "thumbnail_url": "/images/beef_burger.jpg", "tags": ["burger", "beef", "american", "fries"]},
            {"name": "Grilled Salmon", "category": "main_course", "preview_type": "3d_model", "file_url": "/models/grilled_salmon.glb", "thumbnail_url": "/images/grilled_salmon.jpg", "tags": ["salmon", "fish", "grilled", "healthy"]},
            {"name": "Spaghetti Carbonara", "category": "main_course", "preview_type": "3d_model", "file_url": "/models/spaghetti_carbonara.glb", "thumbnail_url": "/images/spaghetti_carbonara.jpg", "tags": ["pasta", "italian", "carbonara", "cream"]},
            {"name": "Chicken Teriyaki", "category": "main_course", "preview_type": "360_video", "file_url": "/videos/chicken_teriyaki.mp4", "thumbnail_url": "/images/chicken_teriyaki.jpg", "tags": ["chicken", "japanese", "teriyaki", "rice"]},
            {"name": "Fish and Chips", "category": "main_course", "preview_type": "3d_model", "file_url": "/models/fish_chips.glb", "thumbnail_url": "/images/fish_chips.jpg", "tags": ["fish", "chips", "british", "fried"]},
            
            # Desserts
            {"name": "Chocolate Lava Cake", "category": "desserts", "preview_type": "360_video", "file_url": "/videos/chocolate_lava_cake.mp4", "thumbnail_url": "/images/chocolate_lava_cake.jpg", "tags": ["chocolate", "cake", "dessert", "lava"]},
            {"name": "Tiramisu", "category": "desserts", "preview_type": "3d_model", "file_url": "/models/tiramisu.glb", "thumbnail_url": "/images/tiramisu.jpg", "tags": ["tiramisu", "italian", "coffee", "mascarpone"]},
            {"name": "Ice Cream Sundae", "category": "desserts", "preview_type": "3d_model", "file_url": "/models/ice_cream_sundae.glb", "thumbnail_url": "/images/ice_cream_sundae.jpg", "tags": ["ice cream", "sundae", "vanilla", "chocolate"]},
            {"name": "Cheesecake", "category": "desserts", "preview_type": "360_video", "file_url": "/videos/cheesecake.mp4", "thumbnail_url": "/images/cheesecake.jpg", "tags": ["cheesecake", "cream", "dessert", "berry"]},
            
            # Drinks
            {"name": "Coca Cola", "category": "drinks", "preview_type": "3d_model", "file_url": "/models/coca_cola.glb", "thumbnail_url": "/images/coca_cola.jpg", "tags": ["soda", "cola", "soft drink", "fizzy"]},
            {"name": "Fresh Orange Juice", "category": "drinks", "preview_type": "3d_model", "file_url": "/models/orange_juice.glb", "thumbnail_url": "/images/orange_juice.jpg", "tags": ["juice", "orange", "fresh", "vitamin c"]},
            {"name": "Cappuccino", "category": "drinks", "preview_type": "360_video", "file_url": "/videos/cappuccino.mp4", "thumbnail_url": "/images/cappuccino.jpg", "tags": ["coffee", "cappuccino", "milk", "foam"]},
            {"name": "Red Wine", "category": "drinks", "preview_type": "3d_model", "file_url": "/models/red_wine.glb", "thumbnail_url": "/images/red_wine.jpg", "tags": ["wine", "red wine", "alcohol", "grape"]},
        ]
        
        # Add unique IDs and timestamps to each item
        for food in sample_foods:
            food_item = FoodLibraryItem(**food)
            await db.food_library.insert_one(food_item.dict())

        # Ensure at least 200 items by generating variations with public assets
        # TO SCALE: Change 200 to desired number in the while condition below
        base_categories = ["starters", "main_course", "desserts", "drinks"]
        base_types = ["3d_model", "360_video", "2d_image"]
        # Food-specific 3D models from Sketchfab (free, CORS-friendly)
        glb_assets = [
            "https://modelviewer.dev/shared-assets/models/Astronaut.glb",  # Fallback
            "https://modelviewer.dev/shared-assets/models/RobotExpressive.glb",  # Fallback
            "https://modelviewer.dev/shared-assets/models/NeilArmstrong.glb",  # Fallback
            "https://modelviewer.dev/shared-assets/models/ShopifyMascot.glb",  # Fallback
        ]
        # Food-specific 360 videos (public domain)
        video_360_urls = [
            "https://storage.googleapis.com/vrview/examples/coral.mp4",  # Fallback
            "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",  # Food demo
        ]

        index = 0
        # Insert until count reaches 200
        # TO SCALE: Change 200 to desired number
        while await db.food_library.count_documents({}) < 200:
            category = base_categories[index % len(base_categories)]
            ptype = base_types[index % len(base_types)]
            name = f"Sample {category.replace('_',' ').title()} {index + 1}"

            # Food-specific 2D images using Unsplash with food keywords
            food_keywords = {
                "starters": ["appetizer", "salad", "soup", "bruschetta"],
                "main_course": ["pizza", "burger", "pasta", "steak"],
                "desserts": ["cake", "ice-cream", "tiramisu", "cheesecake"],
                "drinks": ["coffee", "juice", "wine", "cocktail"]
            }
            keyword = food_keywords[category][index % len(food_keywords[category])]
            image_url = f"https://source.unsplash.com/800x600/?{keyword}"
            thumb_url = image_url

            if ptype == "3d_model":
                file_url = glb_assets[index % len(glb_assets)]
            elif ptype == "360_video":
                file_url = video_360_urls[index % len(video_360_urls)]
            else:  # 2d_image
                file_url = thumb_url

            glb = file_url if ptype == "3d_model" else None

            gen_item = FoodLibraryItem(
                name=name,
                category=category,
                preview_type=ptype,
                file_url=file_url,
                thumbnail_url=thumb_url,
                image_url=image_url,
                model_url=glb_assets[index % len(glb_assets)],
                model_glb_url=glb, 
                video_url=video_360_urls[index % len(video_360_urls)],
                tags=[category.replace("_", " "), ptype, keyword]
            )
            await db.food_library.insert_one(gen_item.dict())
            index += 1
    else:
        # Top up to at least 200 items if some already exist
        count_now = existing_count
        if count_now < 200:  # TO SCALE: Change 200 to desired number
            base_categories = ["starters", "main_course", "desserts", "drinks"]
            base_types = ["3d_model", "360_video", "2d_image"]
            glb_assets = [
                "https://modelviewer.dev/shared-assets/models/Astronaut.glb",
                "https://modelviewer.dev/shared-assets/models/RobotExpressive.glb",
                "https://modelviewer.dev/shared-assets/models/NeilArmstrong.glb",
                "https://modelviewer.dev/shared-assets/models/ShopifyMascot.glb",
            ]
            video_360_urls = [
                "https://storage.googleapis.com/vrview/examples/coral.mp4",
                # "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
            ]
            food_keywords = {
                "starters": ["appetizer", "salad", "soup", "bruschetta"],
                "main_course": ["pizza", "burger", "pasta", "steak"],
                "desserts": ["cake", "ice-cream", "tiramisu", "cheesecake"],
                "drinks": ["coffee", "juice", "wine", "cocktail"]
            }

            index = 0
            while count_now < 200:  # TO SCALE: Change 200 to desired number
                category = base_categories[index % len(base_categories)]
                ptype = base_types[index % len(base_types)]
                name = f"Sample {category.replace('_',' ').title()} {count_now + 1}"

                keyword = food_keywords[category][index % len(food_keywords[category])]
                image_url = f"https://source.unsplash.com/800x600/?{keyword}"
                thumb_url = image_url

                if ptype == "3d_model":
                    file_url = glb_assets[index % len(glb_assets)]
                elif ptype == "360_video":
                    file_url = video_360_urls[index % len(video_360_urls)]
                else:
                    file_url = thumb_url

                glb = file_url if ptype == "3d_model" else None

                gen_item = FoodLibraryItem(
                    name=name,
                    category=category,
                    preview_type=ptype,
                    file_url=file_url,
                    thumbnail_url=thumb_url,
                    image_url=image_url,
                    model_url=glb_assets[index % len(glb_assets)],
                    model_glb_url=glb,
                    video_url=video_360_urls[index % len(video_360_urls)],
                    tags=[category.replace("_", " "), ptype, keyword]
                )
                await db.food_library.insert_one(gen_item.dict())
                index += 1
                count_now += 1

# Feedback routes
@api_router.post("/feedback/upload-image")
async def upload_feedback_image(file: UploadFile = File(...), current_user: User = Depends(get_current_user)):
    # Validate file type
    if not file.content_type.startswith('image/'):
        raise HTTPException(status_code=400, detail="File must be an image")
    
    # Generate unique filename
    file_extension = file.filename.split('.')[-1]
    filename = f"feedback_{uuid.uuid4()}.{file_extension}"
    file_path = uploads_dir / filename
    
    # Save file
    with open(file_path, "wb") as buffer:
        content = await file.read()
        buffer.write(content)
    
    # Return URL
    return {"image_url": f"/uploads/{filename}"}

@api_router.post("/feedback", response_model=Feedback)
async def create_feedback(feedback_data: FeedbackCreate, current_user: User = Depends(get_current_user)):
    # Verify restaurant ownership
    restaurant = await db.restaurants.find_one({"id": feedback_data.restaurant_id, "owner_id": current_user.id})
    if not restaurant:
        # Check if restaurant exists but user doesn't own it
        restaurant_exists = await db.restaurants.find_one({"id": feedback_data.restaurant_id})
        if restaurant_exists:
            raise HTTPException(status_code=403, detail="You don't have permission to add feedback for this restaurant")
        else:
            raise HTTPException(status_code=404, detail="Restaurant not found")
    
    feedback_dict = feedback_data.dict()
    feedback_obj = Feedback(**feedback_dict)
    
    await db.feedback.insert_one(feedback_obj.dict())
    return feedback_obj

@api_router.get("/feedback/restaurant/{restaurant_id}", response_model=List[Feedback])
async def get_restaurant_feedback(restaurant_id: str, current_user: User = Depends(get_current_user)):
    # Verify restaurant ownership
    restaurant = await db.restaurants.find_one({"id": restaurant_id, "owner_id": current_user.id})
    if not restaurant:
        raise HTTPException(status_code=404, detail="Restaurant not found")
    
    feedbacks = await db.feedback.find({"restaurant_id": restaurant_id}).sort("created_at", -1).to_list(1000)
    return [Feedback(**feedback) for feedback in feedbacks]

@api_router.put("/feedback/{feedback_id}", response_model=Feedback)
async def update_feedback(
    feedback_id: str,
    feedback_data: FeedbackCreate,
    current_user: User = Depends(get_current_user)
):
    # Verify feedback exists and restaurant ownership
    existing_feedback = await db.feedback.find_one({"id": feedback_id})
    if not existing_feedback:
        raise HTTPException(status_code=404, detail="Feedback not found")
    
    restaurant = await db.restaurants.find_one({"id": existing_feedback["restaurant_id"], "owner_id": current_user.id})
    if not restaurant:
        raise HTTPException(status_code=404, detail="Restaurant not found")
    
    # Update the feedback
    update_data = feedback_data.dict()
    update_data["updated_at"] = datetime.now(timezone.utc)
    
    await db.feedback.update_one(
        {"id": feedback_id},
        {"$set": update_data}
    )
    
    # Return updated feedback
    updated_feedback = await db.feedback.find_one({"id": feedback_id})
    return Feedback(**updated_feedback)

@api_router.delete("/feedback/{feedback_id}")
async def delete_feedback(feedback_id: str, current_user: User = Depends(get_current_user)):
    # Verify feedback exists and restaurant ownership
    existing_feedback = await db.feedback.find_one({"id": feedback_id})
    if not existing_feedback:
        raise HTTPException(status_code=404, detail="Feedback not found")
    
    restaurant = await db.restaurants.find_one({"id": existing_feedback["restaurant_id"], "owner_id": current_user.id})
    if not restaurant:
        raise HTTPException(status_code=404, detail="Restaurant not found")
    
    # Delete the feedback
    await db.feedback.delete_one({"id": feedback_id})
    
    return {"message": "Feedback deleted successfully"}

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()