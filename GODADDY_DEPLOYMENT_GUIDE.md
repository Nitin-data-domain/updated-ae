# 🚀 GoDaddy Node.js Hosting & MySQL Deployment Guide

This guide will walk you step-by-step through deploying your **Aharada Education Backend API** to **GoDaddy cPanel (Linux Hosting with Node.js support)** using **MySQL Database**, while keeping your React frontend on **Vercel**.

---

## 📋 Overview of the Setup

- **Frontend**: Hosted on [Vercel](https://vercel.com) (Live)
- **Backend**: Hosted on **GoDaddy cPanel** (Node.js Application Manager)
- **Database**: **GoDaddy MySQL Server** (managed via cPanel MySQL Wizard / phpMyAdmin)

---

## Step 1: Create the MySQL Database in GoDaddy cPanel

1. Log into your **GoDaddy Account** and open **cPanel**.
2. Under the **Databases** section, click **MySQL® Database Wizard**.
3. **Step 1 - Create A Database**:
   - Enter a database name (e.g. `aharada_db` or `ae_db`).
   - *Note down the full database name* (it will look like `cpanelusername_aharada_db`).
   - Click **Next Step**.
4. **Step 2 - Create Database Users**:
   - Enter a username (e.g. `db_user`).
   - Enter a strong password (or generate one).
   - *Note down the full username and password*!
   - Click **Create User**.
5. **Step 3 - Add User to Database**:
   - Check the box **ALL PRIVILEGES**.
   - Click **Make Changes**.

> 💡 **Database Connection Details to note:**
> - **Host**: `localhost` (In GoDaddy cPanel, MySQL is always `localhost`)
> - **Port**: `3306`
> - **Database Name**: e.g., `cpanelusername_aharada_db`
> - **Username**: e.g., `cpanelusername_db_user`
> - **Password**: `your_password`

---

## Step 2: Set Up the Node.js App in GoDaddy cPanel

1. In cPanel, find the **Software** section and click **Setup Node.js App** (or *Node.js Selector*).
2. Click **Create Application**:
   - **Node.js version**: Select `20.x` (or `18.x` / `22.x`).
   - **Application mode**: Select `Production`.
   - **Application root**: Enter the folder name where your backend will live (e.g. `api` or `backend`).
   - **Application URL**: Select your subdomain or path (e.g., `api.yourdomain.com` or `yourdomain.com/api`).
   - **Application startup file**: Enter `server.js` (or `app.js` — both work!).
3. Click **Create** at the top right.
4. Once created, cPanel will show a command at the top to enter the virtual environment, for example:
   ```bash
   source /home/cpanelusername/nodevenv/api/20/bin/activate && cd /home/cpanelusername/api
   ```

---

## Step 3: Upload Backend Files to GoDaddy

1. In cPanel, open **File Manager** and navigate to your Application root folder (e.g. `public_html/api` or `api`).
2. Upload the contents of your local `server/` directory:
   - `server.js`
   - `app.js`
   - `package.json`
   - `package-lock.json`
   - `config/` (contains `db.js`)
   - `controllers/`
   - `middleware/`
   - `models/`
   - `routes/`
   - `seed.js`
   - `reset-admin.js`
   - `.env`
3. *(Do not upload `node_modules` or `.git` — you will install packages on the server in the next step!)*

---

## Step 4: Configure Environment Variables in GoDaddy

Create or edit the `.env` file in your application root folder on GoDaddy:

```env
PORT=5000
NODE_ENV=production

# MySQL Database Details (from Step 1)
DB_HOST=localhost
DB_PORT=3306
DB_NAME=cpanelusername_aharada_db
DB_USER=cpanelusername_db_user
DB_PASSWORD=your_mysql_password

# Authentication
JWT_SECRET=aharada_edu_jwt_secret_key_2024_secure
JWT_EXPIRE=7d

# Frontend Live URL (for CORS allowance)
CLIENT_URL=https://your-frontend-project.vercel.app

# Cloudinary - Image Storage
CLOUDINARY_CLOUD_NAME=dprlzu2ns
CLOUDINARY_API_KEY=124785717795421
CLOUDINARY_API_SECRET=MrOGGkP7c9Lqome6_uZQoPNf8HA

# Fast2SMS (optional - leave blank to log OTPs to console)
FAST2SMS_API_KEY=
```

*(You can also set these environment variables directly in cPanel's **Setup Node.js App > Environment variables** section).*

---

## Step 5: Install Dependencies and Start the App

1. In **Setup Node.js App**, scroll down to the **Detected configuration files** section.
2. Click **Run NPM Install** (or open Terminal in cPanel, run the virtual environment command from Step 2, and type `npm install --production`).
3. Click **Restart** on your application.
4. **Auto-Migration & Seeding**:
   - The moment the server starts, Sequelize will automatically **create all MySQL tables**!
   - If the database is fresh, it will also automatically **seed default admin accounts, programs, faculty, events, and placements**.
5. Test your API by opening:
   ```
   https://api.yourdomain.com/api/health
   ```
   You should see:
   ```json
   { "status": "OK", "message": "Aharada Education API is running" }
   ```

---

## Step 6: Connect Vercel Frontend to GoDaddy Backend

1. Open your project on [Vercel Dashboard](https://vercel.com).
2. Go to **Settings > Environment Variables**.
3. Add or update the variable:
   - **Key**: `VITE_API_URL`
   - **Value**: `https://api.yourdomain.com` *(your GoDaddy API URL, without trailing slash)*
4. Go to **Deployments** and click **Redeploy** on the latest deployment so it picks up the new backend URL.

---

## 🔑 Default Admin Credentials

- **Email**: `admin@aharada.edu` *(or `md@aharadaedu.in`)*
- **Password**: `admin123` *(or `Aharada@Prabhu`)*
- **Login URL**: `https://your-frontend-domain.vercel.app/admin/login`

To reset or add admin credentials on the server at any time, run:
```bash
node reset-admin.js
```
