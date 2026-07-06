# Deployment & Environment

This section guides developers through setting up the environment, running the application locally, building for production, and recommended deployment strategies.

---

## ⚙️ Environment Variables Configuration

The backend server relies on a `.env` file for API key configurations. Create this file in the `backend/` directory.

### `backend/.env`
```ini
# ThinkFlow Backend Environment Configuration

# Set your Gemini API key (Required for AI topic generation & analysis)
# Obtain a key from Google AI Studio: https://aistudio.google.com/
GEMINI_API_KEY="AI_STUDIO_KEY_HERE"

# Server settings
PORT=3001

# AI Model Configuration (Default general model)
GEMINI_MODEL=gemini-2.5-flash
```

---

## 🚀 Running Locally

To run the full stack application, you need to launch both the frontend client and the backend server.

### 1. Start the Backend Server
```bash
cd backend
npm install
npm run dev
```
- **Port**: Runs on `http://localhost:3001`.
- **Scripts**: Compiles on-the-fly using `ts-node` and watches files with `nodemon`.

### 2. Start the Frontend Client (Vite Dev Server)
Open a new terminal window:
```bash
npm install
npm run dev
```
- **Port**: Runs on `http://localhost:5173`.
- **Proxy**: Vite proxies any `/api` call on port 5173 to `http://localhost:3001/api`.

---

## 🏗️ Production Build and Deployment

In a production environment, the frontend assets should be compiled into static files and served efficiently, while the Express API serves endpoint responses.

### 1. Compile the Static Frontend Bundle
In the root directory, run:
```bash
npm run build
```
This generates a production-optimized static package in the `dist/` directory.

### 2. Compile the Backend TypeScript
In the `backend/` directory, run:
```bash
npm run build
```
This compiles the TypeScript code into vanilla JavaScript inside the `backend/dist/` directory.

### 3. Recommended Production Hostings
- **Static Assets (Frontend)**: Vercel, Netlify, or AWS S3 + CloudFront. (Configure routing rules to proxy `/api` calls to the backend server).
- **Web App Server (Backend Node.js)**: Render, Heroku, AWS ECS, or DigitalOcean Droplet.
