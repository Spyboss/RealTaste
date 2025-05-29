# Admin Testing Guide

This guide provides instructions on how to access and test the admin features of the application.

## 1. Running the `reduce-orders.js` Script

The `reduce-orders.js` script is used to reduce the number of orders in the database to a manageable sample size for testing. This is particularly useful when working with a large dataset.

### Steps:

1. Open a terminal and navigate to the project root directory.
2. Ensure you have the necessary environment variables set up in a `.env` file:
   ```
   SUPABASE_URL=your_supabase_url
   SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
   ```
3. Run the script using Node.js:
   ```bash
   node reduce-orders.js
   ```
4. The script will connect to Supabase, retrieve all orders, keep a sample of 15 orders, and delete the rest. You'll see output in the terminal indicating the progress.

## 2. Accessing Admin Features in the Frontend

### URL:
The admin features can be accessed at:
```
http://localhost:3000/admin
```

### Login Credentials:
Use the following credentials to log in:
- Username: `admin`
- Password: `admin123`

## 3. Testing Key Admin Features

### A. Viewing the Order List

1. After logging in, you'll be directed to the Admin Dashboard.
2. Click on the "Order Management" tab in the dashboard.
3. You'll see a list of all orders with details such as order ID, customer name, status, and total amount.
4. Verify that the order list is displayed correctly and can be scrolled through.

### B. Updating Order Status

1. In the Order Management page, find an order with a status that you want to update.
2. Click on the status dropdown for that order.
3. Select a new status from the available options (e.g., "received", "preparing", "ready_for_pickup", "completed", "cancelled").
4. Confirm that the status updates correctly and the UI reflects the change.

### C. Viewing Analytics and Reports

1. In the Admin Dashboard, click on the "Analytics" tab.
2. You'll see various analytics and reports, including:
   - Daily summary of orders and revenue
   - Top performing items
   - Sales trends over time
3. Verify that the analytics data is displayed correctly and matches the expected values.
4. You can also view more detailed analytics by selecting different timeframes (today, week, month).

## Additional Notes

- Make sure the backend server is running before accessing the admin features.
- If you encounter any issues, check the browser console and server logs for error messages.
- For more detailed information about the API endpoints, refer to the backend code in the `backend/src/routes/admin.ts` file.