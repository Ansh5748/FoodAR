import requests
import sys
import json
from datetime import datetime
import time

class FoodARAPITester:
    def __init__(self, base_url="https://foodar-menu.preview.emergentagent.com"):
        self.base_url = base_url
        self.api_url = f"{base_url}/api"
        self.token = None
        self.user_id = None
        self.restaurant_id = None
        self.food_item_id = None
        self.qr_code_id = None
        self.tests_run = 0
        self.tests_passed = 0

    def run_test(self, name, method, endpoint, expected_status, data=None, headers=None):
        """Run a single API test"""
        url = f"{self.api_url}/{endpoint}"
        test_headers = {'Content-Type': 'application/json'}
        
        if self.token:
            test_headers['Authorization'] = f'Bearer {self.token}'
        
        if headers:
            test_headers.update(headers)

        self.tests_run += 1
        print(f"\n🔍 Testing {name}...")
        print(f"   URL: {url}")
        
        try:
            if method == 'GET':
                response = requests.get(url, headers=test_headers, timeout=10)
            elif method == 'POST':
                response = requests.post(url, json=data, headers=test_headers, timeout=10)
            elif method == 'PUT':
                response = requests.put(url, json=data, headers=test_headers, timeout=10)
            elif method == 'DELETE':
                response = requests.delete(url, headers=test_headers, timeout=10)

            success = response.status_code == expected_status
            if success:
                self.tests_passed += 1
                print(f"✅ Passed - Status: {response.status_code}")
                try:
                    return success, response.json()
                except:
                    return success, {}
            else:
                print(f"❌ Failed - Expected {expected_status}, got {response.status_code}")
                try:
                    error_data = response.json()
                    print(f"   Error: {error_data}")
                except:
                    print(f"   Error: {response.text}")
                return False, {}

        except Exception as e:
            print(f"❌ Failed - Error: {str(e)}")
            return False, {}

    def test_user_registration(self):
        """Test user registration"""
        timestamp = datetime.now().strftime('%H%M%S')
        user_data = {
            "email": f"test_user_{timestamp}@foodar.com",
            "password": "TestPass123!",
            "name": f"Test User {timestamp}",
            "role": "restaurant_owner"
        }
        
        success, response = self.run_test(
            "User Registration",
            "POST",
            "auth/register",
            200,
            data=user_data
        )
        
        if success and 'access_token' in response:
            self.token = response['access_token']
            self.user_id = response['user']['id']
            print(f"   User ID: {self.user_id}")
            return True
        return False

    def test_user_login(self):
        """Test user login with existing credentials"""
        login_data = {
            "email": "test@foodar.com",
            "password": "password123"
        }
        
        success, response = self.run_test(
            "User Login",
            "POST", 
            "auth/login",
            200,
            data=login_data
        )
        
        if success and 'access_token' in response:
            self.token = response['access_token']
            self.user_id = response['user']['id']
            return True
        return False

    def test_get_current_user(self):
        """Test getting current user info"""
        success, response = self.run_test(
            "Get Current User",
            "GET",
            "auth/me",
            200
        )
        return success

    def test_create_restaurant(self):
        """Test creating a restaurant"""
        restaurant_data = {
            "name": f"Test Restaurant {datetime.now().strftime('%H%M%S')}",
            "description": "A test restaurant for FoodAR testing",
            "address": "123 Test Street, Test City",
            "phone": "+1234567890"
        }
        
        success, response = self.run_test(
            "Create Restaurant",
            "POST",
            "restaurants",
            200,
            data=restaurant_data
        )
        
        if success and 'id' in response:
            self.restaurant_id = response['id']
            print(f"   Restaurant ID: {self.restaurant_id}")
            return True
        return False

    def test_get_restaurants(self):
        """Test getting user restaurants"""
        success, response = self.run_test(
            "Get User Restaurants",
            "GET",
            "restaurants",
            200
        )
        
        if success and isinstance(response, list):
            print(f"   Found {len(response)} restaurants")
            if len(response) > 0 and not self.restaurant_id:
                self.restaurant_id = response[0]['id']
                print(f"   Using restaurant ID: {self.restaurant_id}")
        return success

    def test_create_food_item(self):
        """Test creating a food item"""
        if not self.restaurant_id:
            print("❌ No restaurant ID available for food item creation")
            return False
            
        food_data = {
            "name": f"Test Burger {datetime.now().strftime('%H%M%S')}",
            "description": "A delicious test burger with all the fixings",
            "price": 12.99,
            "category": "main_course",
            "preview_type": "3d_model",
            "preview_url": "/models/burger.glb"
        }
        
        success, response = self.run_test(
            "Create Food Item",
            "POST",
            f"restaurants/{self.restaurant_id}/food-items",
            200,
            data=food_data
        )
        
        if success and 'id' in response:
            self.food_item_id = response['id']
            self.qr_code_id = response.get('qr_code_id')
            print(f"   Food Item ID: {self.food_item_id}")
            print(f"   QR Code ID: {self.qr_code_id}")
            return True
        return False

    def test_get_food_items(self):
        """Test getting restaurant food items"""
        if not self.restaurant_id:
            print("❌ No restaurant ID available")
            return False
            
        success, response = self.run_test(
            "Get Restaurant Food Items",
            "GET",
            f"restaurants/{self.restaurant_id}/food-items",
            200
        )
        
        if success and isinstance(response, list):
            print(f"   Found {len(response)} food items")
            if len(response) > 0 and not self.food_item_id:
                self.food_item_id = response[0]['id']
                print(f"   Using food item ID: {self.food_item_id}")
        return success

    def test_get_food_item_public(self):
        """Test public food item endpoint for AR viewer"""
        if not self.food_item_id:
            print("❌ No food item ID available")
            return False
            
        success, response = self.run_test(
            "Get Food Item (Public)",
            "GET",
            f"food-items/{self.food_item_id}",
            200
        )
        
        if success:
            print(f"   Food Item: {response.get('food_item', {}).get('name', 'Unknown')}")
            print(f"   Restaurant: {response.get('restaurant', {}).get('name', 'Unknown')}")
        return success

    def test_get_qr_code(self):
        """Test getting QR code for food item"""
        if not self.food_item_id:
            print("❌ No food item ID available")
            return False
            
        success, response = self.run_test(
            "Get QR Code",
            "GET",
            f"qr-codes/{self.food_item_id}",
            200
        )
        
        if success:
            print(f"   QR Data: {response.get('qr_data', 'Unknown')}")
            print(f"   Scan Count: {response.get('scan_count', 0)}")
        return success

    def test_food_library(self):
        """Test food library endpoint"""
        success, response = self.run_test(
            "Get Food Library",
            "GET",
            "food-library",
            200
        )
        
        if success and isinstance(response, list):
            print(f"   Found {len(response)} library items")
            categories = set(item.get('category') for item in response)
            print(f"   Categories: {', '.join(categories)}")
        return success

    def test_food_library_search(self):
        """Test food library with search"""
        success, response = self.run_test(
            "Search Food Library",
            "GET",
            "food-library?category=main_course&search=pizza",
            200
        )
        
        if success and isinstance(response, list):
            print(f"   Found {len(response)} items matching search")
        return success

    def test_track_qr_scan(self):
        """Test QR scan tracking"""
        if not self.food_item_id or not self.qr_code_id:
            print("❌ No food item or QR code ID available")
            return False
            
        success, response = self.run_test(
            "Track QR Scan",
            "POST",
            f"analytics/scan?food_item_id={self.food_item_id}&qr_code_id={self.qr_code_id}&user_agent=TestAgent",
            200
        )
        return success

    def test_restaurant_analytics(self):
        """Test restaurant analytics"""
        if not self.restaurant_id:
            print("❌ No restaurant ID available")
            return False
            
        success, response = self.run_test(
            "Get Restaurant Analytics",
            "GET",
            f"analytics/restaurant/{self.restaurant_id}",
            200
        )
        
        if success:
            print(f"   Total Scans: {response.get('total_scans', 0)}")
            print(f"   Total Food Items: {response.get('total_food_items', 0)}")
        return success

def main():
    print("🚀 Starting DishLook Backend API Tests")
    print("=" * 50)
    
    tester = FoodARAPITester()
    
    # Test sequence
    tests = [
        ("User Registration", tester.test_user_registration),
        ("Get Current User", tester.test_get_current_user),
        ("Create Restaurant", tester.test_create_restaurant),
        ("Get Restaurants", tester.test_get_restaurants),
        ("Create Food Item", tester.test_create_food_item),
        ("Get Food Items", tester.test_get_food_items),
        ("Get Food Item (Public)", tester.test_get_food_item_public),
        ("Get QR Code", tester.test_get_qr_code),
        ("Food Library", tester.test_food_library),
        ("Food Library Search", tester.test_food_library_search),
        ("Track QR Scan", tester.test_track_qr_scan),
        ("Restaurant Analytics", tester.test_restaurant_analytics),
    ]
    
    # Run all tests
    for test_name, test_func in tests:
        try:
            test_func()
            time.sleep(0.5)  # Small delay between tests
        except Exception as e:
            print(f"❌ {test_name} failed with exception: {str(e)}")
    
    # Print final results
    print("\n" + "=" * 50)
    print(f"📊 Final Results: {tester.tests_passed}/{tester.tests_run} tests passed")
    
    if tester.tests_passed == tester.tests_run:
        print("🎉 All backend tests passed!")
        return 0
    else:
        print(f"⚠️  {tester.tests_run - tester.tests_passed} tests failed")
        return 1

if __name__ == "__main__":
    sys.exit(main())