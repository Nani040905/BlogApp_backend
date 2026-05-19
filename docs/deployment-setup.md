# 🛠️ Backend Setup, local development & Deployment Guide

This guide provides instructions for setting up, configuring, and deploying the **BlogApp Backend** application.

---

## 💻 Local Development Setup

### Prerequisites
*   **Node.js**: Version `18.x` or higher (recommended: `20.x` LTS)
*   **MongoDB**: An active local instance (`mongodb://localhost:27017/blogDB1`) or a MongoDB Atlas cloud cluster.

### 1. Project Initialization & Package Installation

If you are setting up the project from scratch or installing the modules manually, here are the step-by-step instructions.

#### Step A: Initialize the Node.js Project
Create a `package.json` configurations file:
```bash
# Initialize npm with default settings
npm init -y
```

> [!NOTE]
> Make sure to add `"type": "module"` inside your root `package.json` to enable ES6 dynamic module loading (e.g. using `import` instead of `require`).

#### Step B: Install Production Dependencies
Run the following command to install the required production libraries:
```bash
npm install express@^5.2.1 mongoose@^9.1.5 jsonwebtoken@^9.0.3 bcryptjs@^3.0.3 cookie-parser@^1.4.7 cors@^2.8.6 dotenv@^17.2.3 multer@^2.1.1 cloudinary@^2.9.0
```

Here is a breakdown of what each package is used for:
*   `express`: Express v5 framework for REST API routing and endpoints.
*   `mongoose`: Mongoose v9 Object Data Modeling (ODM) library for MongoDB queries and schemas.
*   `jsonwebtoken`: JSON Web Token generator and validator for secure HttpOnly sessions.
*   `bcryptjs`: Secure cryptographic password-hashing salting library.
*   `cookie-parser`: Middleware to extract and parse HTTP session cookies automatically.
*   `cors`: Cross-Origin Resource Sharing validator allowing authorized frontend connections.
*   `dotenv`: Loads environment parameters (`.env`) into the Express server environment.
*   `multer`: In-memory file storage manager intercepting image upload payloads.
*   `cloudinary`: Cloudinary SDK streaming profile images directly to the media cloud.

#### Step C: Install Development Dependencies
Run the following command to install Nodemon for hot-reloading development support:
```bash
npm install -D nodemon@^3.1.11
```

#### Step D: Install All Packages (Existing Repository)
If you already have `package.json` cloned, simply execute the standard install command:
```bash
npm install
```

---

### 2. Configure Environment Variables
Create a `.env` file in the root of the `BlogApp_backend` directory:
```env
# Server Port Configuration
PORT=4000

# MongoDB Database Connection String
DB_URL=mongodb://localhost:27017/blogDB1

# Authorized CORS Origins (Comma-separated list of allowed URLs)
FRONTEND_URL=http://localhost:5173

# Security Key for JWT Signatures
JWT_SECRET=your_super_long_jwt_signature_secret_key_here

# Cloudinary Integration credentials (for profile images)
CLOUD_NAME=your_cloudinary_cloud_name
API_KEY=your_cloudinary_api_key
API_SECRET=your_cloudinary_api_secret
```

---

## 🚀 Running Commands

These scripts are defined in `package.json` and are available via `npm run <command>`:

### Start Development Server (Nodemon)
Starts the node server with automatic reloading when file changes are detected:
```bash
npm run dev
```

### Start Production Server
Starts the application in production mode:
```bash
npm start
```

---

## 📦 Production Deployment Guide (Render)

Render is recommended for hosting Node.js Express APIs.

### Step 1: Connect Git Repository
1.  Push your codebase to your Git provider (GitHub, GitLab, or Bitbucket).
2.  Log into your [Render Dashboard](https://render.com) and click **New + > Web Service**.
3.  Import the BlogApp repository.

### Step 2: Configure Web Service Parameters
Set the following properties in the Render dashboard:
*   **Name**: `blogapp-backend-service`
*   **Runtime**: `Node`
*   **Root Directory**: `BlogApp_backend`
*   **Build Command**: `npm install`
*   **Start Command**: `node server.js`
*   **Instance Type**: `Free` (or appropriate tier)

### Step 3: Add Environment Variables
Under the **Environment Variables** tab, add all keys defined in your local `.env` file:
*   Set `PORT` to `4000` (Render binds this port automatically).
*   Set `DB_URL` to your production MongoDB Atlas cluster string.
*   Set `FRONTEND_URL` to your live Vercel frontend URL (`https://blog-app-frontend-one-lake.vercel.app`).
*   Set your production `JWT_SECRET`, `CLOUD_NAME`, `API_KEY`, and `API_SECRET`.

Click **Deploy Web Service**! Render will build your dependencies and launch the server.

---

## 🔎 API Health & Test Verification

You can test that the API is running correctly using the root health check endpoint:

*   **Endpoint**: `GET /`
*   **Expected Response (200 OK)**:
    ```json
    {
      "message": "Blog App API is running..."
    }
    ```

> [!TIP]
> The project includes a `req.http` file containing pre-configured HTTP requests. You can run these directly within your IDE (using extensions like REST Client) to test and verify backend routes easily.
