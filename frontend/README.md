q# Getting Started with Create React App

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

## Available Scripts

In the project directory, you can run:

### `npm start`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in your browser.

The page will reload when you make changes.\
You may also see any lint errors in the console.

### `npm test`

Launches the test runner in the interactive watch mode.\
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

### `npm run build`

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.\
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

### `npm run eject`

**Note: this is a one-way operation. Once you `eject`, you can't go back!**

If you aren't satisfied with the build tool and configuration choices, you can `eject` at any time. This command will remove the single build dependency from your project.

Instead, it will copy all the configuration files and the transitive dependencies (webpack, Babel, ESLint, etc) right into your project so you have full control over them. All of the commands except `eject` will still work, but they will point to the copied scripts so you can tweak them. At this point you're on your own.

You don't have to ever use `eject`. The curated feature set is suitable for small and middle deployments, and you shouldn't feel obligated to use this feature. However we understand that this tool wouldn't be useful if you couldn't customize it when you are ready for it.

## Learn More

You can learn more in the [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started).

To learn React, check out the [React documentation](https://reactjs.org/).

### Frontend Issues

*   **AR Viewer Route Issue (Critical):** The AR viewer at `/ar/{foodItemId}` is redirecting to the login page instead of displaying the AR content. This route should be public and not protected by authentication.
*   **Authentication Flow Issues:**
    *   The registration form submission is not redirecting to the dashboard properly.
    *   Login attempts with test credentials are returning 400 errors.
*   **Missing AR.js Integration:** The AR viewer component exists, but the AR.js/A-Frame scripts are not loading properly.

## New Feature Implementation

The following features need to be implemented:

*   **Dual Interfaces:** The application should have two separate interfaces: one for Admins and one for Restaurant Owners.
*   **Super Admin:** A single super admin with full permissions across the system. The super admin can add new admin accounts and assign permissions.
*   **Admin Permissions:** Admins can have various permissions, such as managing restaurants, the product library, sales data, feedback, and members.
*   **Admin Dashboard:** The admin dashboard should display key statistics.
*   **Restaurant Owner UI:** The restaurant owner UI should allow owners to manage their menus, food items, and view basic analytics.
*   **Currency Selection:** When creating a product, the owner must be able to set the price in either INR (₹) or USD ($).


## 🚀 Backend Setup

```bash
# Navigate to the backend directory
cd "C:\Users\Divyansh Gupta\OneDrive\Desktop\AR_Menu\FoodAR\APP\backend"

# Create and activate a virtual environment
python3 -m venv venv           #  or   py -m venv venv
source venv/bin/activate       #  or   .\venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Run the backend server
uvicorn server:app --reload --host 0.0.0.0 --port 8000

```

## 🚀 Frontend Setup

```bash
# Navigate to the frontend directory
cd "C:\Users\Divyansh Gupta\OneDrive\Desktop\AR_Menu\FoodAR\APP\frontend"

# Install dependencies (if not already installed)
npm install

# Start the frontend development server
npm start
```