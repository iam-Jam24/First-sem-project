# Full-Stack Real-Time Chat Application

This is a modern, full-stack real-time chat application built with React, Node.js, Express, Socket.io, and MongoDB.

## Features
- **Real-Time Messaging**: Built with Socket.io for instant message delivery.
- **Authentication**: JWT-based user signup and login.
- **Modern UI**: Clean, responsive design with glassmorphism effects and dark mode support using Vanilla CSS.
- **Typing Indicators**: See when the other person is typing in real-time.
- **Group Chats & 1-on-1 Chats**: Support for private and group conversations.

## Prerequisites
- Node.js (v16 or higher)
- MongoDB (Local instance or MongoDB Atlas)

## Getting Started

### 1. Database Setup
1. Ensure MongoDB is running locally on `mongodb://127.0.0.1:27017` or update the `MONGO_URI` environment variable in `backend/config/db.js` with your MongoDB Atlas connection string.

### 2. Backend Setup
1. Navigate to the `backend` directory:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the server:
   ```bash
   node server.js
   ```
   *The server will run on http://localhost:5000*

### 3. Frontend Setup
1. Navigate to the `frontend` directory:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the Vite development server:
   ```bash
   npm run dev
   ```
   *The frontend will run on http://localhost:5173*


