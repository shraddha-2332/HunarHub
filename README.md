# HunarHub

HunarHub is a full-stack web platform designed to digitally empower local micro-entrepreneurs such as cobblers, potters, tailors, artisans, and small vendors. The platform helps them build digital visibility, showcase their work, sell handmade products, and accept service requests, while customers can easily discover, support, and transact with local talent.

This project was built as an internship submission based on the problem statement focused on local commerce, digital inclusion, and income growth for small skill-based businesses.

## Problem Statement

Many micro-entrepreneurs rely only on foot traffic or word-of-mouth. Because of that, they face:

- No digital presence or marketing reach
- Limited customer discovery beyond nearby areas
- No structured way to accept service requests or orders
- Dependency on middlemen or offline sales
- Lack of transparency in pricing and availability

HunarHub addresses these issues through a centralized web marketplace for service discovery and handmade product sales.

## Objectives

### Primary Objectives

- Digitally connect local micro-entrepreneurs with customers
- Enable service booking and product selling from one platform
- Promote traditional skills and handmade products
- Increase income opportunities for small vendors

### Secondary Objectives

- Encourage local and sustainable commerce
- Reduce dependency on middlemen
- Provide entrepreneurs with simple digital tools
- Enable community-based economic growth

## Features Implemented

### Customer Features

- User registration and login
- Browse entrepreneurs by category
- Search and filter by skill type, location, and price range
- View entrepreneur profiles
- View products and service listings
- Place service requests
- Purchase handmade products
- View order history and service request history

### Micro-Entrepreneur Features

- Registration and profile creation
- Dashboard for managing profile information
- Add and manage product listings
- Add and manage service listings
- View incoming orders
- View incoming service requests
- Accept, reject, or complete requests and orders
- Availability and pricing details in profile
- Earnings visibility through dashboard summary

### Admin Features

- Demo admin login
- Verify or unverify entrepreneurs
- View platform analytics
- Monitor orders and service requests
- View entrepreneur activity for platform oversight

## Project Scope Mapping

### In Scope Covered

- Responsive web-based platform
- Entrepreneur profiles and service listings
- Product marketplace for handmade items
- Order and service request management
- Admin dashboard

### Simplified / Future Scope

- Complaints and disputes are not implemented as a separate complete workflow
- Reviews backend support exists, but the UI flow is simplified
- No digital payments integration
- No logistics or delivery management
- No native mobile application
- No advanced AI recommendations

## Technology Stack

### Frontend

- HTML5
- CSS3
- JavaScript

### Backend

- Node.js
- Express.js

### Database

- MongoDB
- Mongoose

### Authentication

- JWT based authentication

## Folder Structure

```text
HunarHub/
├── backend/
│   ├── config/
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── .env
│   ├── package.json
│   └── server.js
├── css/
│   └── style.css
├── frontend/
│   └── index.html
├── js/
│   ├── api.js
│   └── auth.js
├── app.js
└── README.md
```

## Core Entities

- Users
- Micro-Entrepreneurs
- Products
- Services
- Service Requests
- Orders
- Reviews

## Demo Roles

### Admin

- Email: `admin@hunarhub.local`
- Password: `Admin@123`

### Other Roles

- Customers and entrepreneurs can register directly from the application UI

## Local Setup

### Prerequisites

- Node.js installed
- MongoDB installed and running locally

### Backend Setup

1. Open terminal in the project root.
2. Move into backend:

```bash
cd backend
```

3. Install dependencies if needed:

```bash
npm install
```

4. Make sure MongoDB is running locally.

5. Start the server:

```bash
npm run dev
```

The backend runs on:

```text
http://localhost:5000
```

### Environment Variables

Current backend `.env` uses:

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/hunarhub
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
NODE_ENV=development
```

## Running the Application

Once the backend server is running:

- Open `http://localhost:5000/`
- Register as a customer or entrepreneur
- Or login with the demo admin credentials

## Deployment Readiness

This project is structured to be deployment-ready with the following adjustments:

- Set production environment variables
- Use a hosted MongoDB instance such as MongoDB Atlas
- Deploy backend on services such as Render, Railway, or AWS
- Serve the frontend through the Node/Express app or adapt it for Netlify/Vercel if separated later

Suggested platforms from the project brief:

- AWS
- Vercel
- Netlify

## Non-Functional Considerations

### Performance

- Lightweight frontend with plain HTML, CSS, and JavaScript
- Simple API structure for fast local testing

### Security

- JWT authentication
- Password hashing using bcrypt

### Reliability

- Structured order and request status tracking
- Role-based route protection

### Usability

- Responsive web layout
- Search-first marketplace design
- Separate workflows for customer, entrepreneur, and admin roles

## Key Performance Indicators Supported

The admin analytics module supports visibility into:

- Number of registered entrepreneurs
- Number of active users
- Service request conversion rate
- Product sales volume
- Average entrepreneur earnings
- Customer satisfaction ratings

## Expected Impact

- Increased digital visibility for local micro-entrepreneurs
- Better access to customers beyond foot traffic
- Promotion of traditional and handmade skills
- Improved local commerce and reduced dependency on middlemen
- Community-focused economic support through digital inclusion

## Future Enhancements

- Digital payments and wallet support
- Complaint and dispute management module
- Logistics and delivery integration
- Mobile application
- Skill training and certification modules
- Richer review and rating UI
- Product image upload and media management

## Submission Deliverables Covered

- Functional web application
- Admin dashboard
- Technical project structure
- Deployment-ready architecture

### Recommended Additional Submission Attachments

- PRD document
- Technical documentation PDF
- GitHub repository link
- Optional deployed live demo link

## Author Note

This project was developed as an internship submission focused on solving a real-world local commerce and digital inclusion problem through a practical full-stack web application.
