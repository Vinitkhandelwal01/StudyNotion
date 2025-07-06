# StudyNotion – EdTech Project

**StudyNotion** is a full-stack EdTech platform that enables users to learn coding skills through interactive courses, hands-on projects, and instructor feedback. It is divided into a React-based frontend and a Node.js/Express backend, with MongoDB used for data storage.

---

## 🚀 Features

- User Authentication (Signup, Login, Email Verification, Password Reset)
- Course Catalog with Detailed Course Pages
- Video-based Lessons and Interactive Code Blocks
- Instructor Dashboard for Course Creation & Management
- Progress Tracking & Quizzes
- Reviews and Ratings for Courses
- Secure Payment Integration using Razorpay
- Responsive and Modern UI with Tailwind CSS

---

## 🛠️ Tech Stack

### Frontend
- React
- Redux Toolkit
- React Router DOM
- Tailwind CSS
- Chart.js
- Swiper.js
- Other UI libraries

### Backend
- Node.js
- Express.js
- MongoDB with Mongoose
- JWT Authentication
- Nodemailer (for sending emails)
- Cloudinary (for media uploads)
- Razorpay (for payment integration)

---

## ⚙️ Getting Started

### Prerequisites

Ensure you have the following installed:
- Node.js (v16+ recommended)
- npm or yarn
- A MongoDB instance (local or cloud-based)

---

## 📦 Installation

### 1. Clone the Repository

```bash
git clone <repo-url>
```
### 2. Install Client Dependencies
```bash
npm install
```
### 3. Install Server Dependencies
```bash
cd server
npm install
cd ..
```
## 🔐 Environment Variables
Create a .env file inside the server/ directory and configure the following variables:
```bash
MONGODB_URI=your_mongodb_uri
JWT_SECRET=your_jwt_secret
CLOUDINARY_CLOUD_NAME=your_cloudinary_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
EMAIL_USER=your_email@example.com
EMAIL_PASS=your_email_password_or_app_password
RAZORPAY_KEY_ID=your_razorpay_key
RAZORPAY_KEY_SECRET=your_razorpay_secret
```
## ▶️ Running the Application
Option 1: Run Client and Server Concurrently
```bash
npm run dev
```
Option 2: Run Separately
Client:
```bash
npm start
```
Server:
```bash
cd server
npm run dev
```
## 🌐 Access the App

Frontend: http://localhost:3000 
Backend: http://localhost:4000 (or as configured)

