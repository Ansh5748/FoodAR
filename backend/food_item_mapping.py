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
            "image_url": "https://images.unsplash.com/photo-1572695157366-5e585ab2b69f",
            "model_url": "https://sketchfab.com/3d-models/bruschetta-mix-f241887751f2402ab3e12a98b43c7438/embed",
            "model_glb_url": None,
            "video_url": "https://videos.pexels.com/video-files/9020883/9020883-uhd_2560_1440_25fps.mp4",
            "tags": ["italian", "bread", "tomato", "appetizer"]
        },
        "spring_rolls": {
            "name": "Spring Rolls",
            "category": "starters",
            "image_url": "https://images.unsplash.com/photo-1669340781012-ae89fbac9fc3",
            "model_url": "https://sketchfab.com/models/108fbe18e1a74398ab75a96f83393eb5/embed",
            "model_glb_url": "https://sweet-biscotti-a00c4d.netlify.app/spring_rolls-v1.glb",
            "video_url": "https://videos.pexels.com/video-files/11579504/11579504-uhd_1440_2560_25fps.mp4",
            "tags": ["asian", "fried", "vegetables", "appetizer"]
        },
        "nachos": {
            "name": "Loaded Nachos",
            "category": "starters",
            "image_url": "https://images.unsplash.com/photo-1582169296194-e4d644c48063",
            "model_url": "https://sketchfab.com/3d-models/cheese-nachos-d9a524bd63fc46ad90ad043d295b6d46/embed",
            "model_glb_url": None, # TODO: Add direct .glb URL
            "video_url": "https://videos.pexels.com/video-files/7613577/7613577-hd_1080_1920_24fps.mp4",
            "tags": ["mexican", "cheese", "spicy", "sharing"]
        },
        "calamari": {
            "name": "Fried Calamari",
            "category": "starters",
            "image_url": "https://images.unsplash.com/photo-1599487488170-d11ec9c172f0",
            "model_url": "https://sketchfab.com/3d-models/calamari-in-salsa-di-pomodoro-9360f295a1c343e98f98d32a7353210f/embed",
            "model_glb_url": None, # TODO: Add direct .glb URL
            "video_url": "https://videos.pexels.com/video-files/7008565/7008565-hd_1080_1920_25fps.mp4",
            "tags": ["seafood", "fried", "appetizer", "mediterranean"]
        },
        "hummus": {
            "name": "Hummus with Pita",
            "category": "starters",
            "image_url": "https://plus.unsplash.com/premium_photo-1672174773811-a483dacc407d",
            "model_url": "https://sketchfab.com/3d-models/arabic-hummus-plate-chickpeas-dip-7f58d703dde4416a98c7b6a843a186e3/embed",
            "model_glb_url": None, # TODO: Add direct .glb URL
            "video_url": "https://videos.pexels.com/video-files/6252810/6252810-hd_1080_1920_30fps.mp4",
            "tags": ["middle eastern", "vegetarian", "chickpeas", "dip"]
        },
        "chicken_wings": {
            "name": "Buffalo Chicken Wings",
            "category": "starters",
            "image_url": "https://images.unsplash.com/photo-1608039755401-742074f0548d",
            "model_url": "https://sketchfab.com/3d-models/chicken-wings-80ad878cf2f64dd799e300cb860df514/embed",
            "model_glb_url": None, # TODO: Add direct .glb URL
            "video_url": "https://videos.pexels.com/video-files/4253714/4253714-uhd_2732_1440_25fps.mp4",
            "tags": ["spicy", "chicken", "american", "bar food"]
        },
        "mozzarella_sticks": {
            "name": "Mozzarella Sticks",
            "category": "starters",
            "image_url": "https://images.unsplash.com/photo-1734774924912-dcbb467f8599",
            "model_url": "https://sketchfab.com/3d-models/mozzarella-sticks-124ac53dd3084f60b076046a5f38bdfc/embed",
            "model_glb_url": None, # TODO: Add direct .glb URL
            "video_url": "https://videos.pexels.com/video-files/16423978/16423978-uhd_1440_2560_25fps.mp4",
            "tags": ["cheese", "fried", "italian", "appetizer"]
        },
        "soup": {
            "name": "Tomato Soup",
            "category": "starters",
            "image_url": "https://images.unsplash.com/photo-1547592166-23ac45744acd",
            "model_url": "https://sketchfab.com/3d-models/tomato-soup-63b6a6f21e5c446682de1b1c1666dcb5/embed",
            "model_glb_url": None, # TODO: Add direct .glb URL
            "video_url": "https://videos.pexels.com/video-files/7185518/7185518-sd_640_360_25fps.mp4",
            "tags": ["hot", "vegetarian", "comfort food", "tomato"]
        }
    },
    
    # MAIN COURSE
    "main_course": {
        "burger": {
            "name": "Classic Cheeseburger",
            "category": "main_course",
            "image_url": "https://images.unsplash.com/photo-1568901346375-23c9450c58cd",
            "model_url": "https://sketchfab.com/3d-models/cheese-burger-23da893b2106404daa7bd17c32a5f612/embed",
            "model_glb_url": None, # TODO: Add direct .glb URL
            "video_url": "https://videos.pexels.com/video-files/4253729/4253729-uhd_2732_1440_25fps.mp4",
            "tags": ["beef", "american", "sandwich", "fast food"]
        },
        "pizza": {
            "name": "Margherita Pizza",
            "category": "main_course",
            "image_url": "https://images.unsplash.com/photo-1604382354936-07c5d9983bd3",
            "model_url": "https://sketchfab.com/3d-models/pizza-8a07b3b8e7d24e259b4505f4ca129d0e/embed",
            "model_glb_url": None, # TODO: Add direct .glb URL
            "video_url": "https://videos.pexels.com/video-files/30627970/13111085_360_640_25fps.mp4", # https://videos.pexels.com/video-files/3196344/3196344-sd_640_360_25fps.mp4
            "tags": ["italian", "cheese", "tomato", "vegetarian"]
        },
        "pasta": {
            "name": "Spaghetti Bolognese",
            "category": "main_course",
            "image_url": "https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9",
            "model_url": "https://sketchfab.com/3d-models/spaghetti-bolognese-8b25b5e42ab343f5a2e9fcb78dc16a0f/embed",
            "model_glb_url": None, # TODO: Add direct .glb URL
            "video_url": "https://videos.pexels.com/video-files/4389249/4389249-uhd_2560_1440_25fps.mp4",
            "tags": ["italian", "beef", "tomato sauce", "pasta"]
        },
        "steak": {
            "name": "Ribeye Steak",
            "category": "main_course",
            "image_url": "https://images.unsplash.com/photo-1546964124-0cce460f38ef",
            "model_url": "https://sketchfab.com/3d-models/boneless-ribeye-steak-on-chopping-board-4a38c7713edf4e02b8ce2b1c785b3e76/embed",
            "model_glb_url": None, # TODO: Add direct .glb URL
            "video_url": "https://videos.pexels.com/video-files/7613411/7613411-hd_1920_1080_24fps.mp4",
            "tags": ["beef", "grilled", "american", "protein"]
        },
        "sushi": {
            "name": "Assorted Sushi Platter",
            "category": "main_course",
            "image_url": "https://images.unsplash.com/photo-1579871494447-9811cf80d66c",
            "model_url": "https://sketchfab.com/3d-models/stylized-sushi-10370d114a08464aaa46b279d92cb836/embed",
            "model_glb_url": None, # TODO: Add direct .glb URL
            "video_url": "https://videos.pexels.com/video-files/3297823/3297823-sd_960_506_25fps.mp4",
            "tags": ["japanese", "seafood", "rice", "raw"]
        },
        "curry": {
            "name": "Chicken Tikka Masala",
            "category": "main_course",
            "image_url": "https://images.unsplash.com/photo-1603894584373-5ac82b2ae398",
            "model_url": "https://sketchfab.com/3d-models/chicken-chickpeas-curry-with-garlic-naan-c5af0bdc7fe048bf9a89d877aabc8eb5/embed",
            "model_glb_url": None, # TODO: Add direct .glb URL
            "video_url": "https://videos.pexels.com/video-files/9694890/9694890-hd_1080_1920_25fps.mp4",
            "tags": ["indian", "spicy", "chicken", "curry"]
        },
        "fish": {
            "name": "Grilled Salmon",
            "category": "main_course",
            "image_url": "https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2",
            "model_url": "https://sketchfab.com/3d-models/grilled-salmon-e4b624991e67468bb2de3ef345bee5e5/embed",
            "model_glb_url": None, # TODO: Add direct .glb URL
            "video_url": "https://videos.pexels.com/video-files/12409706/12409706-uhd_1440_2560_25fps.mp4",
            "tags": ["seafood", "healthy", "grilled", "protein"]
        },
        "salad": {
            "name": "Caesar Salad",
            "category": "main_course",
            "image_url": "https://images.unsplash.com/photo-1512621776951-a57141f2eefd",
            "model_url": "https://sketchfab.com/3d-models/caesar-salad-with-shrimp-88ec2d5d7bd64c3f8c5d2715091884af/embed",
            "model_glb_url": None, # TODO: Add direct .glb URL
            "video_url": "https://videos.pexels.com/video-files/27877444/12252814_1080_1920_30fps.mp4",
            "tags": ["healthy", "vegetarian", "fresh", "chicken"]
        },
        "tacos": {
            "name": "Tacos",
            "category": "main_course",
            "image_url": "https://media.istockphoto.com/id/2222140020/photo/delicious-tacos-on-slate-background.webp",
            "model_url": "https://sketchfab.com/3d-models/taco-5b8095131eca4914b6dce4e96b290a3f/embed",
            "model_glb_url": None, # TODO: Add direct .glb URL
            "video_url": "https://videos.pexels.com/video-files/33461799/14237297_1920_1080_30fps.mp4",
            "tags": ["mexican", "spicy", "fresh", "vegetarian"]
        },
        "lasagna": {
            "name": "Beef Lasagna",
            "category": "main_course",
            "image_url": "https://images.unsplash.com/photo-1574894709920-11b28e7367e3",
            "model_url": "https://sketchfab.com/3d-models/lasagna-9f823705ac9a489ca4b54abb382285f0/embed",
            "model_glb_url": None, # TODO: Add direct .glb URL
            "video_url": "https://videos.pexels.com/video-files/27769284/12220110_1080_1920_30fps.mp4",
            "tags": ["italian", "pasta", "beef", "cheese"]
        }
    },
    
    # DESSERTS
    "desserts": {
        "ice_cream": {
            "name": "Vanilla Ice Cream",
            "category": "desserts",
            "image_url": "https://images.unsplash.com/photo-1576506295286-5cda18df43e7",
            "model_url": "https://sketchfab.com/3d-models/vanilla-ice-cream-low-poly-67bff7e77cf749ed8c4ecb44aa7ddf52/embed",
            "model_glb_url": None, # TODO: Add direct .glb URL
            "video_url": "https://videos.pexels.com/video-files/5059604/5059604-uhd_1440_2732_30fps.mp4",
            "tags": ["cold", "sweet", "vanilla", "dairy"]
        },
        "cake": {
            "name": "Chocolate Cake",
            "category": "desserts",
            "image_url": "https://images.unsplash.com/photo-1578985545062-69928b1d9587",
            "model_url": "https://sketchfab.com/3d-models/chocolate-gateau-2b74dca897f146ee84de66bbe4a8470d/embed",
            "model_glb_url": None, # TODO: Add direct .glb URL
            "video_url": "https://videos.pexels.com/video-files/5930369/5930369-sd_360_640_30fps.mp4",
            "tags": ["chocolate", "sweet", "baked", "birthday"]
        },
        "cheesecake": {
            "name": "New York Cheesecake",
            "category": "desserts",
            "image_url": "https://images.unsplash.com/photo-1533134242443-d4fd215305ad",
            "model_url": "https://sketchfab.com/3d-models/cheesecake-421f8eabd94e447c8f63711279221ac3/embed",
            "model_glb_url": None, # TODO: Add direct .glb URL
            "video_url": "https://videos.pexels.com/video-files/7551704/7551704-sd_360_640_30fps.mp4",
            "tags": ["cheese", "sweet", "creamy", "american"]
        },
        "tiramisu": {
            "name": "Tiramisu",
            "category": "desserts",
            "image_url": "https://images.unsplash.com/photo-1571877227200-a0d98ea607e9",
            "model_url": "https://sketchfab.com/3d-models/tiramisu-31aad1969a13449798b559939c197885/embed",
            "model_glb_url": None, # TODO: Add direct .glb URL
            "video_url": "https://videos.pexels.com/video-files/31999293/13637123_360_640_30fps.mp4",
            "tags": ["italian", "coffee", "mascarpone", "cocoa"]
        },
        "apple_pie": {
            "name": "Apple Pie",
            "category": "desserts",
            "image_url": "https://images.unsplash.com/photo-1568571780765-9276ac8b75a2",
            "model_url": "https://sketchfab.com/3d-models/8th-pie-week-2-food-treats-b10c785c094b44eb839994b8c018d536/embed",
            "model_glb_url": None, # TODO: Add direct .glb URL
            "video_url": "https://videos.pexels.com/video-files/6162082/6162082-hd_1080_1778_30fps.mp4",
            "tags": ["american", "apple", "baked", "cinnamon"]
        },
        "creme_brulee": {
            "name": "Crème Brûlée",
            "category": "desserts",
            "image_url": "https://images.unsplash.com/photo-1676300184943-09b2a08319a3",
            "model_url": "https://sketchfab.com/3d-models/creme-brulee-78f31ff3129441da8e07b860c6fc6568/embed",
            "model_glb_url": None, # TODO: Add direct .glb URL
            "video_url": "https://videos.pexels.com/video-files/34556311/14641997_640_360_24fps.mp4",
            "tags": ["french", "custard", "caramel", "creamy"]
        },
        "brownie": {
            "name": "Chocolate Brownie",
            "category": "desserts",
            "image_url": "https://images.unsplash.com/photo-1606313564200-e75d5e30476c",
            "model_url": "https://sketchfab.com/3d-models/chocolate-brownie-bdc511ba5b3f43f3975a7fc3c07140e0/embed",
            "model_glb_url": None, # TODO: Add direct .glb URL
            "video_url": "https://videos.pexels.com/video-files/31745144/13525410_1080_1920_30fps.mp4",
            "tags": ["chocolate", "sweet", "baked", "nuts"]
        },
        "panna_cotta": {
            "name": "Panna Cotta",
            "category": "desserts",
            "image_url": "https://images.unsplash.com/photo-1488477181946-6428a0291777",
            "model_url": "https://sketchfab.com/3d-models/panna-cotta-75d158452f954d90a3121dfcce06e62d/embed`1q23e45jk",
            "model_glb_url": None, # TODO: Add direct .glb URL
            "video_url": "https://videos.pexels.com/video-files/7931710/7931710-uhd_1440_2560_24fps.mp4",
            "tags": ["italian", "creamy", "vanilla", "berries"]
        }
    },
    
    # DRINKS
    "drinks": {
        "coffee": {
            "name": "Cappuccino",
            "category": "drinks",
            "image_url": "https://images.unsplash.com/photo-1509042239860-f550ce710b93",
            "model_url": "https://sketchfab.com/3d-models/cup-of-cappuccino-2beccb20ab744cabaeaddb36487f5cd7/embed",
            "model_glb_url": None, # TODO: Add direct .glb URL
            "video_url": "https://videos.pexels.com/video-files/4374506/4374506-sd_360_640_25fps.mp4",
            "tags": ["hot", "caffeine", "milk", "italian"]
        },
        "smoothie": {
            "name": "Berry Smoothie",
            "category": "drinks",
            "image_url": "https://images.unsplash.com/photo-1600718374662-0483d2b9da44",
            "model_url": "https://sketchfab.com/3d-models/berry-smoothie-69a7aa79eb9f4bbc8a2e65e8ff22baec/embed",
            "model_glb_url": None, # TODO: Add direct .glb URL
            "video_url": "https://videos.pexels.com/video-files/7656424/7656424-sd_360_640_25fps.mp4",
            "tags": ["cold", "fruit", "healthy", "sweet"]
        },
        "lemonade": {
            "name": "Fresh Lemonade",
            "category": "drinks",
            "image_url": "https://images.unsplash.com/photo-1621263764928-df1444c5e859",
            "model_url": "https://sketchfab.com/3d-models/homemade-lemonade-85c0c24608ca44c9a77a7210518bb25d/embed",
            "model_glb_url": None, # TODO: Add direct .glb URL
            "video_url": "https://videos.pexels.com/video-files/8045845/8045845-sd_360_640_25fps.mp4",
            "tags": ["cold", "citrus", "refreshing", "sweet"]
        },
        "mojito": {
            "name": "Mojito",
            "category": "drinks",
            "image_url": "https://images.unsplash.com/photo-1551024709-8f23befc6f87",
            "model_url": "https://sketchfab.com/3d-models/lime-mojito-5778405ffd7b4635bffcb42384da1442/embed",
            "model_glb_url": None, # TODO: Add direct .glb URL
            "video_url": "https://videos.pexels.com/video-files/5230365/5230365-sd_360_640_25fps.mp4", # https://videos.pexels.com/video-files/5935125/5935125-sd_360_640_25fps.mp4
            "tags": ["alcoholic", "mint", "lime", "refreshing"]
        },
        "tea": {
            "name": "Green Tea",
            "category": "drinks",
            "image_url": "https://images.unsplash.com/photo-1627435601361-ec25f5b1d0e5",
            "model_url": "https://sketchfab.com/3d-models/green-tea-latte-6af1546dc1154a098299b3e3585cb79a/embed",
            "model_glb_url": None, # TODO: Add direct .glb URL
            "video_url": "https://videos.pexels.com/video-files/5430727/5430727-sd_360_640_25fps.mp4",
            "tags": ["hot", "healthy", "antioxidant", "asian"]
        },
        "milkshake": {
            "name": "Chocolate Milkshake",
            "category": "drinks",
            "image_url": "https://images.unsplash.com/photo-1572490122747-3968b75cc699",
            "model_url": "https://sketchfab.com/3d-models/chocolate-swirl-milkshake-9c4f4ece24884d8d8cd54b8a75f0fffa/embed",
            "model_glb_url": None, # TODO: Add direct .glb URL
            "video_url": "https://videos.pexels.com/video-files/5230362/5230362-sd_360_640_25fps.mp4", # https://videos.pexels.com/video-files/5230364/5230364-sd_360_640_25fps.mp4
            "tags": ["cold", "chocolate", "dairy", "sweet"]
        },
        "wine": {
            "name": "Red Wine",
            "category": "drinks",
            "image_url": "https://images.unsplash.com/photo-1510812431401-41d2bd2722f3",
            "model_url": "https://sketchfab.com/3d-models/red-wine-glass-ad6a40bbcf50435bbd41411ece4b9dbe/embed",
            "model_glb_url": None, # TODO: Add direct .glb URL
            "video_url": "https://videos.pexels.com/video-files/4457028/4457028-sd_360_640_25fps.mp4",
            "tags": ["alcoholic", "grape", "elegant", "dinner"]
        },
        "orange_juice": {
            "name": "Fresh Orange Juice",
            "category": "drinks",
            "image_url": "https://images.unsplash.com/photo-1600271886742-f049cd451bba",
            "model_url": "https://sketchfab.com/3d-models/orange-juice-ca159d6faa8947c0a633272e7fec6d1c/embed",
            "model_glb_url": None, # TODO: Add direct .glb URL
            "video_url": "https://videos.pexels.com/video-files/8212307/8212307-sd_360_640_30fps.mp4",
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