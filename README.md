
# RentForge – Equipment Rental Platform

RentForge is a modern equipment rental marketplace that connects equipment owners with customers. Users can explore equipment, compare rental prices, and manage equipment rental activities through a role-based platform.

## Live Website

- **Live Site:** https://rent-forge-client-eight.vercel.app/
- **Backend API:** https://rentforge-server.onrender.com

## GitHub Repositories

- **Client:** https://github.com/Sharminakther336/RentForge-Client
- **Server:** https://github.com/Sharminakther336/RentForge-Server

## Technology Stack

### Frontend
- Next.js (App Router)
- React
- TypeScript
- Tailwind CSS
- Framer Motion
- Lucide React

### Backend
- Node.js
- Express.js
- MongoDB
- JWT Authentication
- bcryptjs
- Stripe SDK

## Key Features

- Responsive and modern user interface.
- Email and password authentication.
- JWT-based authentication and role-based access control.
- Three user roles: Customer, Owner, and Admin.
- Featured equipment and equipment categories.
- Equipment search, filtering, and sorting.
- Dynamic equipment details pages.
- Owner dashboard for adding and managing equipment.
- Admin dashboard for managing users and equipment.
- Equipment approval and rejection system.
- Customer, Owner, and Admin dashboards.
- Responsive navigation with mobile menu.
- Animated sections using Framer Motion.

## User Roles

| Role | Main Responsibilities |
|---|---|
| Customer | Browse equipment and access customer dashboard |
| Owner | Add and manage equipment and rental activities |
| Admin | Manage users and approve or manage equipment |

## Main Packages Used

### Frontend Packages
- next
- react
- react-dom
- typescript
- tailwindcss
- framer-motion
- lucide-react

### Backend Packages
- express
- mongodb
- jsonwebtoken
- bcryptjs
- cors
- dotenv
- stripe
- nodemon

## Project Structure

### Client
```text
rentforge-client/
├── src/
│   ├── app/
│   │   ├── dashboard/
│   │   ├── equipment/
│   │   ├── login/
│   │   ├── register/
│   │   └── page.tsx
│   ├── components/
│   │   ├── banner/
│   │   ├── navbar/
│   │   ├── equipment/
│   │   ├── categories/
│   │   └── footer/
│   └── ...
├── public/
├── .env.local
└── package.json
```

### Server
```text
rentforge-server/
├── controllers/
├── routes/
├── middleware/
├── config/
├── server.js
├── .env
└── package.json
```

## Installation and Setup

### 1. Clone the Client

```bash
git clone https://github.com/Sharminakther336/RentForge-Client.git
cd RentForge-Client
npm install
```

Create a `.env.local` file:

```env
NEXT_PUBLIC_API_URL=http://localhost:5000
```

Start the frontend:

```bash
npm run dev
```

Frontend runs at:

http://localhost:3000

### 2. Clone the Server

Open another terminal:

```bash
git clone https://github.com/Sharminakther336/RentForge-Server.git
cd RentForge-Server
npm install
```

Create a `.env` file:

```env
PORT=5000
MONGODB_URI=your_mongodb_connection_string
DB_NAME=rentforge
JWT_SECRET=your_jwt_secret
CLIENT_URL=http://localhost:3000
```

Start the backend:

```bash
npm run dev
```

Backend runs at:

http://localhost:5000

## Environment Variables

Never commit `.env` or `.env.local` files to GitHub.

Keep MongoDB credentials, JWT secrets, and other private configuration values secure.

## Development

Build the frontend:

```bash
npm run build
```

Start the production frontend:

```bash
npm start
```

## Project Status

RentForge is under active development. Equipment browsing, authentication, role-based dashboards, and equipment management are implemented. Booking, payment, analytics, and other remaining assignment features are being developed and tested.

## Author

**RentForge Project**

Equipment Rental Platform – Assignment 9, Category 003.
