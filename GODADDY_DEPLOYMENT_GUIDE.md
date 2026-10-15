# 🚀 GoDaddy Complete Unified Website & MySQL Deployment Guide

This guide explains how your **entire Aharada Education Platform** (React Frontend + Node.js Backend API + MySQL Database + All Uploaded Media & Notes) runs as a single, unified high-performance application on **GoDaddy cPanel (Linux Hosting with Node.js support)**.

---

## 📋 Architecture Overview: Why This Solves the "Reflecting Only to My System" Problem

Previously:
1. Uploads were performed on your local development machine (`localhost:3000` / `localhost:5000`), storing files in local folders and local SQLite.
2. The live site on GoDaddy/Vercel had no knowledge of your local laptop's files or local database records.
3. When external visitors opened the live website, their browsers requested images from URLs that didn't exist on the production server.

**The Unified GoDaddy Solution**:
- **Domain**: `https://aharadaedu.com` (or your GoDaddy domain)
- **Frontend SPA**: React bundle located in `public/`, served directly by Express.
- **Backend API**: REST API at `/api/*` on the exact same origin.
- **Static Assets & Uploads**: `/uploads/*` served directly from the GoDaddy persistent disk.
- **Database**: GoDaddy MySQL server (`localhost:3306`).
- **Result**: Whenever an administrator uploads notes, faculty photos, or event photos via the `/admin` portal on GoDaddy, the files save directly to GoDaddy's disk and database. Every user on any phone, laptop, or network in the world sees the changes instantly with zero delay and zero CORS/domain issues.

---

## 📦 What is Inside `godaddy-deploy.zip`?

The pre-built `godaddy-deploy.zip` (30.2 MB) in the project root already contains:
- `server.js` & `app.js`: Unified production entry points.
- `public/`: The compiled React frontend (ready to serve instantly).
- `uploads/`: All active faculty photographs, event images, digital library notes (PDFs), and brochures.
- `models/`, `controllers/`, `routes/`, `middleware/`, `config/`: Complete backend logic.
- `package.json` & `package-lock.json`: Dependencies list for Linux installation.
- `.env.example`: Sample configuration template.

*(Notice: `node_modules` is excluded to avoid OS binary mismatches. You will install them cleanly on GoDaddy with one click).*

---

## Step 1: Create the MySQL Database in GoDaddy cPanel

1. Log into your **GoDaddy Account** and open **cPanel**.
2. Under the **Databases** section, click **MySQL® Database Wizard**.
3. **Step 1 - Create A Database**:
   - Enter a database name (e.g. `aharada_db`).
   - Note down the full name: e.g., `cpaneluser_aharada_db`.
   - Click **Next Step**.
4. **Step 2 - Create Database Users**:
   - Enter a username (e.g. `db_user` -> `cpaneluser_db_user`).
   - Enter a strong password and note it down.
   - Click **Create User**.
5. **Step 3 - Add User to Database**:
   - Check **ALL PRIVILEGES**.
   - Click **Make Changes**.

> 💡 **Database Details Summary:**
> - **Host**: `localhost` (In GoDaddy cPanel, MySQL is always `localhost`)
> - **Port**: `3306`
> - **Database Name**: `cpaneluser_aharada_db`
> - **User**: `cpaneluser_db_user`
> - **Password**: `your_strong_password`

---

## Step 2: Set Up the Node.js Application in GoDaddy cPanel

1. In cPanel, find **Software** and click **Setup Node.js App** (or *Node.js Selector*).
2. Click **Create Application**:
   - **Node.js version**: Select `20.x` (or `18.x` / `22.x`).
   - **Application mode**: `Production`.
   - **Application root**: Enter `public_html` (if deploying on main domain) or `api` (if using a subfolder/subdomain).
   - **Application URL**: Select your root domain `aharadaedu.com` (or `www.aharadaedu.com`).
   - **Application startup file**: `server.js` (or `app.js`).
3. Click **Create** at top right.

---

## Step 3: Upload & Extract `godaddy-deploy.zip`

1. In cPanel, open **File Manager**.
2. Navigate to your Application root folder (e.g. `public_html` or the folder you set in Step 2).
3. Click **Upload** at the top bar and upload `godaddy-deploy.zip`.
4. Right-click `godaddy-deploy.zip` in File Manager and select **Extract** -> **Extract Files**.
5. If the extracted files are inside a nested `server/` folder, open the `server` folder, select all files/folders (`public`, `uploads`, `server.js`, `package.json`, etc.), click **Move**, and move them directly to the Application root (`public_html/`).
6. Ensure your Application root folder contains:
   ```text
   public_html/
   ├── app.js
   ├── server.js
   ├── package.json
   ├── package-lock.json
   ├── .env
   ├── config/
   ├── controllers/
   ├── middleware/
   ├── models/
   ├── portal/
   ├── public/
   │   ├── index.html
   │   └── assets/
   ├── routes/
   ├── scripts/
   └── uploads/
       ├── books/
       ├── brochures/
       └── images/
   ```

---

## Step 4: Configure Production `.env` on GoDaddy

In cPanel File Manager, create or edit the `.env` file in the application folder:

```env
PORT=5000
NODE_ENV=production

# GoDaddy MySQL Database Details (from Step 1)
DB_HOST=localhost
DB_PORT=3306
DB_NAME=cpaneluser_aharada_db
DB_USER=cpaneluser_db_user
DB_PASSWORD=your_actual_mysql_password
FORCE_MYSQL=true

# Authentication
JWT_SECRET=aharada_edu_jwt_secret_key_2024_secure
JWT_EXPIRE=7d

# Unified Domain
CLIENT_URL=https://aharadaedu.com

# Grievance Portal Configuration (Neon PostgreSQL)
DATABASE_URL=postgresql://neondb_owner:npg_oFGbWMI2P9sr@ep-quiet-cherry-ahbx45cl.c-3.us-east-1.aws.neon.tech/neondb?sslmode=require
COLLEGE_NAME=Aharada Education
WEBHOOK_SECRET=COLLEGE_GRIEVANCE_SECRET_2026
SMTP_HOST=smtp.gmail.com
SMTP_USER=girdharnitin4@gmail.com
SMTP_PASS=bejgpyevkplblqaf
```

---

## Step 5: Install Dependencies & Launch

1. Go back to cPanel -> **Setup Node.js App**.
2. Click the edit icon (pencil) next to your application.
3. Scroll down to **Detected configuration files** and click **Run NPM Install**.
   *(Alternatively, open Terminal in cPanel, paste the virtualenv command shown at the top of the Node.js page, and run `npm install --production`).*
4. Click **Restart** on the application.

### Automatic Migration & Asset Synchronization:
The moment the server boots on GoDaddy:
1. Sequelize automatically creates all MySQL tables.
2. It auto-migrates and synchronizes all active faculty photographs (`/uploads/images/*`), notes PDFs (`/uploads/books/*`), and campus event images directly into your GoDaddy MySQL database!
3. Check health endpoint:
   ```text
   https://aharadaedu.com/api/health
   ```
   Returns: `{"status": "OK", "message": "Aharada Education API is running"}`.
4. Open the website:
   ```text
   https://aharadaedu.com
   ```
   The complete website loads instantly with all faculty photos, study notes, events, and programs!

---

## Step 6: Log Into the Production Admin Panel

- **Admin Login URL**: `https://aharadaedu.com/admin/login`
- **Default Superadmin Credentials**:
  - Email: `admin@aharada.edu` *(or `md@aharadaedu.in`)*
  - Password: `admin123` *(or `Aharada@Prabhu`)*

### Testing Uploads from Admin:
1. Go to `https://aharadaedu.com/admin/faculty`. Edit or add a faculty photo.
2. Go to `https://aharadaedu.com/admin/events`. Upload event pictures.
3. Go to `https://aharadaedu.com/admin/books`. Upload new PDF study notes or textbooks.
4. **Open the website on another phone or computer** -> The uploaded photos, notes, and events reflect immediately for everyone!
