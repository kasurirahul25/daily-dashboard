# My Daily Dashboard

React + Express + MongoDB. Track today's tasks, plan tomorrow, and log the questions you practised.

## Setup

1. Install everything (run once, inside this folder):
   ```
   npm run install:all
   ```
2. Create your env file:
   ```
   cd server
   cp .env.example .env
   ```
   Open `server/.env` and paste your MongoDB URL:
   ```
   MONGO_URI=mongodb+srv://USER:PASSWORD@CLUSTER.mongodb.net/daily-dashboard
   PORT=5000
   ```
   (If your password has special characters like `@` or `#`, URL-encode them.
   On MongoDB Atlas also allow your IP under Network Access.)
3. Start both server and website:
   ```
   npm run dev
   ```
4. Open http://localhost:5173

## Structure
```
daily-dashboard/
  server/   Express API + Mongoose models (Task, Practice)
  client/   React (Vite) UI
```
