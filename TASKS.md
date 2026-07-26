# GadgetZone Frontend Tasks

To ensure this project is built to **Industry Standards**, every member must follow **Clean Architecture Design Patterns**. 
* **Frontend Clean Architecture:** We will separate UI (Components) from Business Logic (Custom React Hooks) and API Calls (Services). We will also build highly reusable UI components (like Buttons, Inputs, Cards) rather than writing the same code twice.

---

### Member 1: Main Frontend Developer (Customer Site)
* **Goal:** Build the customer-facing web app using Next.js, Tailwind CSS, and Zustand.
* **Responsibilities (10 Points):**
  1. **Project Setup (Frontend):** Initialize the Next.js frontend repository, configure Tailwind CSS, and set up the folder structure (components, pages, services, hooks).
  2. **Core Reusable Components:** Develop basic atomic UI components (Buttons, Inputs, Modals, Spinners) in `components/ui` to ensure consistent styling.
  3. **Layout & Navigation:** Develop the main Layout component, including a responsive Navigation Bar (with the cart icon) and Footer.
  4. **Home Page UI:** Build the Home Page showcasing featured gadgets, banners, and promotional sections.
  5. **Product Listing Page:** Develop the UI to display all products in a grid, including pagination or infinite scroll.
  6. **Search & Filter Logic:** Implement the UI and logic for searching gadgets by name and filtering them by category or price range.
  7. **Product Details Page:** Build the individual product page displaying large images, descriptions, price, and the "Add to Cart" button.
  8. **State Management (Zustand):** Set up the global Zustand store to manage the Shopping Cart state (add items, remove items, calculate subtotal on the frontend).
  9. **Cart & Checkout UI:** Develop the Shopping Cart drawer/page and the Checkout form for customers to enter shipping details.
  10. **API Integration (Customer):** Create `services/api.js` to fetch products from the backend and connect the UI to the live data, separating API calls from UI code.

### Member 2: Admin Frontend Developer (Admin Dashboard)
* **Goal:** Build the secure admin control panel.
* **Responsibilities (10 Points):**
  1. **Admin Routing Setup:** Configure secure, protected routes in Next.js so only users with an "Admin" role can access the dashboard pages.
  2. **Dashboard Layout:** Build a specialized Admin Layout consisting of a permanent Sidebar navigation and a top Header for admin controls.
  3. **Analytics Dashboard UI:** Develop the main dashboard page using charts (e.g., Recharts or Chart.js) to display total sales and user growth.
  4. **Reusable Table Component:** Create a robust, reusable Data Table component for displaying lists of products, users, and orders efficiently.
  5. **Product Management (Read & Delete):** Build the UI table to list all current gadgets and implement the logic/API calls to delete gadgets.
  6. **Product Management (Create & Update):** Develop complex form UIs using React Hook Form to add new gadgets or edit existing ones, including form validation.
  7. **Image Upload Handling:** Implement the frontend logic to allow admins to upload images for gadgets when creating or updating them.
  8. **Order Management UI:** Build the UI to display all customer orders and their current status (Pending, Shipped, Delivered).
  9. **Order Status Update Logic:** Implement the dropdowns and API calls that allow an admin to change the status of an order and notify the backend.
  10. **API Integration (Admin):** Write clean, separated API service functions dedicated specifically to fetching and mutating admin data, distinct from customer APIs.
