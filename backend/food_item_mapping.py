"""
Food Item Mapping System

This file contains mappings for food items to their correct media assets:
- 2D images (from Unsplash)
- 3D models (from Sketchfab)
- 360° videos (from Shutterstock)

Each food item has a dictionary with the following structure:
{
    "name": "Food Name",
    "category": "Category name (starters, main_course, desserts, drinks)",
    "image_url": "URL to 2D image",
    "model_url": "URL to sketchfab 3D model (.glb)",
    "model_glb_url": "Direct URL to the .glb file for AR viewer",
    "video_url": "URL to 360° video",
    "tags": ["tag1", "tag2"]
}
"""

# Organized by categories: starters, main_course, desserts, drinks
FOOD_ITEMS_MAPPING = {
    # STARTERS
    "starters": {
        "bruschetta": {
            "name": "Bruschetta",
            "category": "starters",
            "image_url": "https://images.unsplash.com/photo-1572695157366-5e585ab2b69f?q=80&w=1000&auto=format&fit=crop",
            "model_url": "https://sketchfab.com/3d-models/bruschetta-mix-f241887751f2402ab3e12a98b43c7438/embed",
            "model_glb_url": None,
            "video_url": "https://videos.pexels.com/video-files/9020883/9020883-uhd_2560_1440_25fps.mp4",
            "tags": ["italian", "bread", "tomato", "appetizer"]
        },
        "spring_rolls": {
            "name": "Spring Rolls",
            "category": "starters",
            "image_url": "https://images.unsplash.com/photo-1669340781012-ae89fbac9fc3?q=80&w=1000&auto=format&fit=crop",
            "model_url": "https://sketchfab.com/models/108fbe18e1a74398ab75a96f83393eb5/embed",
            "model_glb_url": "https://sweet-biscotti-a00c4d.netlify.app/spring_rolls-v1.glb",
            "video_url": "https://videos.pexels.com/video-files/11579504/11579504-uhd_1440_2560_25fps.mp4",
            "tags": ["asian", "fried", "vegetables", "appetizer"]
        },
        "nachos": {
            "name": "Loaded Nachos",
            "category": "starters",
            "image_url": "https://images.unsplash.com/photo-1582169296194-e4d644c48063?q=80&w=1000&auto=format&fit=crop",
            "model_url": "https://sketchfab.com/3d-models/cheese-nachos-d9a524bd63fc46ad90ad043d295b6d46/embed",
            "model_glb_url": None, # TODO: Add direct .glb URL
            "video_url": "https://videos.pexels.com/video-files/7613577/7613577-hd_1080_1920_24fps.mp4",
            "tags": ["mexican", "cheese", "spicy", "sharing"]
        },
        "calamari": {
            "name": "Fried Calamari",
            "category": "starters",
            "image_url": "https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?q=80&w=1000&auto=format&fit=crop",
            "model_url": "https://sketchfab.com/models/c2e8d118a06d4fd5a1b9c7eedc6b3a5a/download",
            "model_glb_url": None, # TODO: Add direct .glb URL
            "video_url": "https://ak.picdn.net/shutterstock/videos/1093161954/preview/stock-footage-rotating-food-isolated-on-black.mp4",
            "tags": ["seafood", "fried", "appetizer", "mediterranean"]
        },
        "hummus": {
            "name": "Hummus with Pita",
            "category": "starters",
            "image_url": "https://images.unsplash.com/photo-1577805947697-89e18249d767?q=80&w=1000&auto=format&fit=crop",
            "model_url": "https://sketchfab.com/models/a5d9cce75c684e8d96fbd1662fdf1e00/download",
            "model_glb_url": None, # TODO: Add direct .glb URL
            "video_url": "https://ak.picdn.net/shutterstock/videos/1075135305/preview/stock-footage-rotating-food-on-black-background.mp4",
            "tags": ["middle eastern", "vegetarian", "chickpeas", "dip"]
        },
        "chicken_wings": {
            "name": "Buffalo Chicken Wings",
            "category": "starters",
            "image_url": "https://images.unsplash.com/photo-1608039755401-742074f0548d?q=80&w=1000&auto=format&fit=crop",
            "model_url": "https://sketchfab.com/models/d6c0a68758b243b48f9fa3c586db2a77/download",
            "model_glb_url": None, # TODO: Add direct .glb URL
            "video_url": "https://ak.picdn.net/shutterstock/videos/1093161954/preview/stock-footage-rotating-food-isolated-on-black.mp4",
            "tags": ["spicy", "chicken", "american", "bar food"]
        },
        "mozzarella_sticks": {
            "name": "Mozzarella Sticks",
            "category": "starters",
            "image_url": "https://images.unsplash.com/photo-1548340748-6d98e4415356?q=80&w=1000&auto=format&fit=crop",
            "model_url": "https://sketchfab.com/models/a439f00b8b7f4d36a0a01b3b1a3e39a0/download",
            "model_glb_url": None, # TODO: Add direct .glb URL
            "video_url": "https://ak.picdn.net/shutterstock/videos/1075135305/preview/stock-footage-rotating-food-on-black-background.mp4",
            "tags": ["cheese", "fried", "italian", "appetizer"]
        },
        "soup": {
            "name": "Tomato Soup",
            "category": "starters",
            "image_url": "https://images.unsplash.com/photo-1547592166-23ac45744acd?q=80&w=1000&auto=format&fit=crop",
            "model_url": "https://sketchfab.com/models/c2e8d118a06d4fd5a1b9c7eedc6b3a5a/download",
            "model_glb_url": None, # TODO: Add direct .glb URL
            "video_url": "https://ak.picdn.net/shutterstock/videos/1093161954/preview/stock-footage-rotating-food-isolated-on-black.mp4",
            "tags": ["hot", "vegetarian", "comfort food", "tomato"]
        }
    },
    
    # MAIN COURSE
    "main_course": {
        "burger": {
            "name": "Classic Cheeseburger",
            "category": "main_course",
            "image_url": "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?q=80&w=1000&auto=format&fit=crop",
            "model_url": "https://sketchfab.com/models/64fa0e8a9736d6c5a1c0c2a0/embed",
            "model_glb_url": None, # TODO: Add direct .glb URL
            "video_url": "https://videos.pexels.com/video-files/4253729/4253729-uhd_2732_1440_25fps.mp4",
            "tags": ["beef", "american", "sandwich", "fast food"]
        },
        "pizza": {
            "name": "Margherita Pizza",
            "category": "main_course",
            "image_url": "https://images.unsplash.com/photo-1604382354936-07c5d9983bd3?q=80&w=1000&auto=format&fit=crop",
            "model_url": "https://sketchfab.com/3d-models/pizza-8a07b3b8e7d24e259b4505f4ca129d0e/embed",
            "model_glb_url": None, # TODO: Add direct .glb URL
            "video_url": "https://ak.picdn.net/shutterstock/videos/1093161954/preview/stock-footage-rotating-pizza-with-mushrooms-and-olives-degrees-looped-animation-of-pizza-isolated-on-black.mp4",
            "tags": ["italian", "cheese", "tomato", "vegetarian"]
        },
        "pasta": {
            "name": "Spaghetti Bolognese",
            "category": "main_course",
            "image_url": "https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?q=80&w=1000&auto=format&fit=crop",
            "model_url": "https://sketchfab.com/models/d6c0a68758b243b48f9fa3c586db2a77/download",
            "model_glb_url": None, # TODO: Add direct .glb URL
            "video_url": "https://ak.picdn.net/shutterstock/videos/1093161954/preview/stock-footage-rotating-food-isolated-on-black.mp4",
            "tags": ["italian", "beef", "tomato sauce", "pasta"]
        },
        "steak": {
            "name": "Ribeye Steak",
            "category": "main_course",
            "image_url": "https://images.unsplash.com/photo-1600891964092-4316c288032e?q=80&w=1000&auto=format&fit=crop",
            "model_url": "https://sketchfab.com/models/a439f00b8b7f4d36a0a01b3b1a3e39a0/download",
            "model_glb_url": None, # TODO: Add direct .glb URL
            "video_url": "https://ak.picdn.net/shutterstock/videos/1093161954/preview/stock-footage-rotating-food-isolated-on-black.mp4",
            "tags": ["beef", "grilled", "american", "protein"]
        },
        "sushi": {
            "name": "Assorted Sushi Platter",
            "category": "main_course",
            "image_url": "https://images.unsplash.com/photo-1579871494447-9811cf80d66c?q=80&w=1000&auto=format&fit=crop",
            "model_url": "https://sketchfab.com/models/c2e8d118a06d4fd5a1b9c7eedc6b3a5a/download",
            "model_glb_url": None, # TODO: Add direct .glb URL
            "video_url": "https://ak.picdn.net/shutterstock/videos/1075135305/preview/stock-footage-rotating-food-on-black-background.mp4",
            "tags": ["japanese", "seafood", "rice", "raw"]
        },
        "curry": {
            "name": "Chicken Tikka Masala",
            "category": "main_course",
            "image_url": "https://images.unsplash.com/photo-1565557623262-b51c2513a641?q=80&w=1000&auto=format&fit=crop",
            "model_url": "https://sketchfab.com/models/d6c0a68758b243b48f9fa3c586db2a77/download",
            "model_glb_url": None, # TODO: Add direct .glb URL
            "video_url": "https://ak.picdn.net/shutterstock/videos/1093161954/preview/stock-footage-rotating-food-isolated-on-black.mp4",
            "tags": ["indian", "spicy", "chicken", "curry"]
        },
        "fish": {
            "name": "Grilled Salmon",
            "category": "main_course",
            "image_url": "https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?q=80&w=1000&auto=format&fit=crop",
            "model_url": "https://sketchfab.com/models/a439f00b8b7f4d36a0a01b3b1a3e39a0/download",
            "model_glb_url": None, # TODO: Add direct .glb URL
            "video_url": "https://ak.picdn.net/shutterstock/videos/1075135305/preview/stock-footage-rotating-food-on-black-background.mp4",
            "tags": ["seafood", "healthy", "grilled", "protein"]
        },
        "salad": {
            "name": "Caesar Salad",
            "category": "main_course",
            "image_url": "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?q=80&w=1000&auto=format&fit=crop",
            "model_url": "https://sketchfab.com/models/c2fb977d91f04a3aaec401c49d899c00/download",
            "model_glb_url": None, # TODO: Add direct .glb URL
            "video_url": "https://ak.picdn.net/shutterstock/videos/1075135305/preview/stock-footage-rotating-food-on-black-background.mp4",
            "tags": ["healthy", "vegetarian", "fresh", "chicken"]
        },
        "tacos": {
            "name": "Beef Tacos",
            "category": "main_course",
            "image_url": "https://images.unsplash.com/photo-1551504734-5ee1c4a1479b?q=80&w=1000&auto=format&fit=crop",
            "model_url": "https://sketchfab.com/models/c2e8d118a06d4fd5a1b9c7eedc6b3a5a/download",
            "model_glb_url": None, # TODO: Add direct .glb URL
            "video_url": "https://ak.picdn.net/shutterstock/videos/1093161954/preview/stock-footage-rotating-food-isolated-on-black.mp4",
            "tags": ["mexican", "spicy", "beef", "tortilla"]
        },
        "lasagna": {
            "name": "Beef Lasagna",
            "category": "main_course",
            "image_url": "https://images.unsplash.com/photo-1574894709920-11b28e7367e3?q=80&w=1000&auto=format&fit=crop",
            "model_url": "https://sketchfab.com/models/d6c0a68758b243b48f9fa3c586db2a77/download",
            "model_glb_url": None, # TODO: Add direct .glb URL
            "video_url": "https://ak.picdn.net/shutterstock/videos/1075135305/preview/stock-footage-rotating-food-on-black-background.mp4",
            "tags": ["italian", "pasta", "beef", "cheese"]
        }
    },
    
    # DESSERTS
    "desserts": {
        "ice_cream": {
            "name": "Vanilla Ice Cream",
            "category": "desserts",
            "image_url": "https://images.unsplash.com/photo-1576506295286-5cda18df43e7?q=80&w=1000&auto=format&fit=crop",
            "model_url": "https://sketchfab.com/models/a5d9cce75c684e8d96fbd1662fdf1e00/download",
            "model_glb_url": None, # TODO: Add direct .glb URL
            "video_url": "https://ak.picdn.net/shutterstock/videos/1093161954/preview/stock-footage-rotating-food-isolated-on-black.mp4",
            "tags": ["cold", "sweet", "vanilla", "dairy"]
        },
        "cake": {
            "name": "Chocolate Cake",
            "category": "desserts",
            "image_url": "https://images.unsplash.com/photo-1578985545062-69928b1d9587?q=80&w=1000&auto=format&fit=crop",
            "model_url": "https://sketchfab.com/models/a5d9cce75c684e8d96fbd1662fdf1e00/download",
            "model_glb_url": None, # TODO: Add direct .glb URL
            "video_url": "https://ak.picdn.net/shutterstock/videos/1075135305/preview/stock-footage-rotating-food-on-black-background.mp4",
            "tags": ["chocolate", "sweet", "baked", "birthday"]
        },
        "cheesecake": {
            "name": "New York Cheesecake",
            "category": "desserts",
            "image_url": "https://images.unsplash.com/photo-1533134242443-d4fd215305ad?q=80&w=1000&auto=format&fit=crop",
            "model_url": "https://sketchfab.com/models/d6c0a68758b243b48f9fa3c586db2a77/download",
            "model_glb_url": None, # TODO: Add direct .glb URL
            "video_url": "https://ak.picdn.net/shutterstock/videos/1093161954/preview/stock-footage-rotating-food-isolated-on-black.mp4",
            "tags": ["cheese", "sweet", "creamy", "american"]
        },
        "tiramisu": {
            "name": "Tiramisu",
            "category": "desserts",
            "image_url": "https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?q=80&w=1000&auto=format&fit=crop",
            "model_url": "https://sketchfab.com/models/a439f00b8b7f4d36a0a01b3b1a3e39a0/download",
            "model_glb_url": None, # TODO: Add direct .glb URL
            "video_url": "https://ak.picdn.net/shutterstock/videos/1075135305/preview/stock-footage-rotating-food-on-black-background.mp4",
            "tags": ["italian", "coffee", "mascarpone", "cocoa"]
        },
        "apple_pie": {
            "name": "Apple Pie",
            "category": "desserts",
            "image_url": "https://images.unsplash.com/photo-1568571780765-9276ac8b75a2?q=80&w=1000&auto=format&fit=crop",
            "model_url": "https://sketchfab.com/models/c2e8d118a06d4fd5a1b9c7eedc6b3a5a/download",
            "model_glb_url": None, # TODO: Add direct .glb URL
            "video_url": "https://ak.picdn.net/shutterstock/videos/1093161954/preview/stock-footage-rotating-food-isolated-on-black.mp4",
            "tags": ["american", "apple", "baked", "cinnamon"]
        },
        "creme_brulee": {
            "name": "Crème Brûlée",
            "category": "desserts",
            "image_url": "https://images.unsplash.com/photo-1615394695852-27471f552c8c?q=80&w=1000&auto=format&fit=crop",
            "model_url": "https://sketchfab.com/models/a5d9cce75c684e8d96fbd1662fdf1e00/download",
            "model_glb_url": None, # TODO: Add direct .glb URL
            "video_url": "https://ak.picdn.net/shutterstock/videos/1075135305/preview/stock-footage-rotating-food-on-black-background.mp4",
            "tags": ["french", "custard", "caramel", "creamy"]
        },
        "brownie": {
            "name": "Chocolate Brownie",
            "category": "desserts",
            "image_url": "https://images.unsplash.com/photo-1606313564200-e75d5e30476c?q=80&w=1000&auto=format&fit=crop",
            "model_url": "https://sketchfab.com/models/d6c0a68758b243b48f9fa3c586db2a77/download",
            "model_glb_url": None, # TODO: Add direct .glb URL
            "video_url": "https://ak.picdn.net/shutterstock/videos/1093161954/preview/stock-footage-rotating-food-isolated-on-black.mp4",
            "tags": ["chocolate", "sweet", "baked", "nuts"]
        },
        "panna_cotta": {
            "name": "Panna Cotta",
            "category": "desserts",
            "image_url": "https://images.unsplash.com/photo-1488477181946-6428a0291777?q=80&w=1000&auto=format&fit=crop",
            "model_url": "https://sketchfab.com/models/a439f00b8b7f4d36a0a01b3b1a3e39a0/download",
            "model_glb_url": None, # TODO: Add direct .glb URL
            "video_url": "https://ak.picdn.net/shutterstock/videos/1075135305/preview/stock-footage-rotating-food-on-black-background.mp4",
            "tags": ["italian", "creamy", "vanilla", "berries"]
        }
    },
    
    # DRINKS
    "drinks": {
        "coffee": {
            "name": "Cappuccino",
            "category": "drinks",
            "image_url": "https://images.unsplash.com/photo-1509042239860-f550ce710b93?q=80&w=1000&auto=format&fit=crop",
            "model_url": "https://sketchfab.com/models/a5d9cce75c684e8d96fbd1662fdf1e00/download",
            "model_glb_url": None, # TODO: Add direct .glb URL
            "video_url": "https://ak.picdn.net/shutterstock/videos/1093161954/preview/stock-footage-rotating-food-isolated-on-black.mp4",
            "tags": ["hot", "caffeine", "milk", "italian"]
        },
        "smoothie": {
            "name": "Berry Smoothie",
            "category": "drinks",
            "image_url": "https://images.unsplash.com/photo-1553530666-ba11a90a0868?q=80&w=1000&auto=format&fit=crop",
            "model_url": "https://sketchfab.com/models/a5d9cce75c684e8d96fbd1662fdf1e00/download",
            "model_glb_url": None, # TODO: Add direct .glb URL
            "video_url": "https://ak.picdn.net/shutterstock/videos/1075135305/preview/stock-footage-rotating-food-on-black-background.mp4",
            "tags": ["cold", "fruit", "healthy", "sweet"]
        },
        "lemonade": {
            "name": "Fresh Lemonade",
            "category": "drinks",
            "image_url": "https://images.unsplash.com/photo-1621263764928-df1444c5e859?q=80&w=1000&auto=format&fit=crop",
            "model_url": "https://sketchfab.com/models/d6c0a68758b243b48f9fa3c586db2a77/download",
            "model_glb_url": None, # TODO: Add direct .glb URL
            "video_url": "https://ak.picdn.net/shutterstock/videos/1093161954/preview/stock-footage-rotating-food-isolated-on-black.mp4",
            "tags": ["cold", "citrus", "refreshing", "sweet"]
        },
        "mojito": {
            "name": "Mojito",
            "category": "drinks",
            "image_url": "https://images.unsplash.com/photo-1551024709-8f23befc6f87?q=80&w=1000&auto=format&fit=crop",
            "model_url": "https://sketchfab.com/models/a439f00b8b7f4d36a0a01b3b1a3e39a0/download",
            "model_glb_url": None, # TODO: Add direct .glb URL
            "video_url": "https://ak.picdn.net/shutterstock/videos/1075135305/preview/stock-footage-rotating-food-on-black-background.mp4",
            "tags": ["alcoholic", "mint", "lime", "refreshing"]
        },
        "tea": {
            "name": "Green Tea",
            "category": "drinks",
            "image_url": "https://images.unsplash.com/photo-1627435601361-ec25f5b1d0e5?q=80&w=1000&auto=format&fit=crop",
            "model_url": "https://sketchfab.com/models/c2e8d118a06d4fd5a1b9c7eedc6b3a5a/download",
            "model_glb_url": None, # TODO: Add direct .glb URL
            "video_url": "https://ak.picdn.net/shutterstock/videos/1093161954/preview/stock-footage-rotating-food-isolated-on-black.mp4",
            "tags": ["hot", "healthy", "antioxidant", "asian"]
        },
        "milkshake": {
            "name": "Chocolate Milkshake",
            "category": "drinks",
            "image_url": "https://images.unsplash.com/photo-1572490122747-3968b75cc699?q=80&w=1000&auto=format&fit=crop",
            "model_url": "https://sketchfab.com/models/a5d9cce75c684e8d96fbd1662fdf1e00/download",
            "model_glb_url": None, # TODO: Add direct .glb URL
            "video_url": "https://ak.picdn.net/shutterstock/videos/1075135305/preview/stock-footage-rotating-food-on-black-background.mp4",
            "tags": ["cold", "chocolate", "dairy", "sweet"]
        },
        "wine": {
            "name": "Red Wine",
            "category": "drinks",
            "image_url": "https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?q=80&w=1000&auto=format&fit=crop",
            "model_url": "https://sketchfab.com/models/d6c0a68758b243b48f9fa3c586db2a77/download",
            "model_glb_url": None, # TODO: Add direct .glb URL
            "video_url": "https://ak.picdn.net/shutterstock/videos/1093161954/preview/stock-footage-rotating-food-isolated-on-black.mp4",
            "tags": ["alcoholic", "grape", "elegant", "dinner"]
        },
        "orange_juice": {
            "name": "Fresh Orange Juice",
            "category": "drinks",
            "image_url": "https://images.unsplash.com/photo-1600271886742-f049cd451bba?q=80&w=1000&auto=format&fit=crop",
            "model_url": "https://sketchfab.com/models/a439f00b8b7f4d36a0a01b3b1a3e39a0/download",
            "model_glb_url": None, # TODO: Add direct .glb URL
            "video_url": "https://ak.picdn.net/shutterstock/videos/1075135305/preview/stock-footage-rotating-food-on-black-background.mp4",
            "tags": ["cold", "fruit", "breakfast", "vitamin c"]
        }
    }
}

def get_food_item_media(name, category=None):
    """
    Get media assets for a food item by name and optionally category.
    
    Args:
        name (str): The name of the food item
        category (str, optional): The category to search in (starters, main_course, desserts, drinks)
        
    Returns:
        dict: A dictionary containing image_url, model_url, video_url, and category
              If the food item is not found, returns default media
    """
    # Convert name to lowercase for case-insensitive matching

    name_normalized = name.lower().replace(" ", "_").replace("-", "_")
    
    # If category is provided, search in that category first
    if category and category in FOOD_ITEMS_MAPPING:
        category_items = FOOD_ITEMS_MAPPING[category]
        for key, item in category_items.items():
            key_normalized = key.lower().replace(" ", "_").replace("-", "_")
            if key_normalized == name_normalized:
                return item

    # If not found in the specified category (or if no category was provided),
    # search in all categories as a fallback.
    for cat, items in FOOD_ITEMS_MAPPING.items():
        for key, item in items.items():
            key_normalized = key.lower().replace(" ", "_").replace("-", "_")
            if key_normalized == name_normalized:
                return item
    
    # Return default media if no match is found
    return {
        "name": name,
        "category": category or "main_course",
        "image_url": "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=1000&auto=format&fit=crop",
        "model_url": "https://sketchfab.com/models/a5d9cce75c684e8d96fbd1662fdf1e00/download",
        "model_glb_url": None,
        "video_url": "https://ak.picdn.net/shutterstock/videos/1093161954/preview/stock-footage-rotating-food-isolated-on-black.mp4",
        "tags": ["food"]
    }

def get_all_food_items():
    """
    Get all food items from all categories.
    
    Returns:
        list: A list of all food items with their media assets
    """
    all_items = []
    
    for category, items in FOOD_ITEMS_MAPPING.items():
        for key, item in items.items():
            all_items.append(item)
    
    return all_items