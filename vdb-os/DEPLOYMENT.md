# VDB Singularity OS Deployment Guide

This guide provides instructions for deploying the VDB Singularity OS to a standard web server (like cPanel on InfinityFree) and for installing it as a Progressive Web App (PWA) on a mobile device.

---

## Method 1: Deploying to a Web Host (e.g., cPanel / InfinityFree)

This method makes the OS accessible via a public URL.

**Steps:**

1.  **Gather Files:** Collect all the files from the project directory:
    - `.htaccess` **(Crucial for Apache servers like InfinityFree)**
    - `index.html`
    - `index.tsx`
    - `metadata.json`
    - `manifest.json`
    - `sw.js`
    - `icon-512.png`
    - `config.ts` **(New)**
    - The `utils/` directory and its contents.
    - The `components/` directory and its contents.

2.  **Log in to cPanel:** Access your web hosting control panel (e.g., the one provided by InfinityFree).

3.  **Open File Manager:** Navigate to the "File Manager" utility.

4.  **Go to `htdocs` (or `public_html`):** Open the root directory for your website. On InfinityFree, this is typically the `htdocs` folder.

5.  **Upload Files:** Use the "Upload" functionality in the File Manager to upload all the files and directories collected in Step 1. Make sure to preserve the directory structure (i.e., the `utils` and `components` folders must be uploaded as folders).

6.  **Verify:** Navigate to your domain (e.g., `http://vdbmart.42web.io`) in a web browser. The VDB Singularity OS should load.

---

## Method 2: Installing as a Progressive Web App (PWA)

This method installs the OS directly onto your phone's home screen, allowing it to run full-screen and offline, just like a native app. This is the recommended method for mobile use.

**Prerequisites:**
- The OS must first be deployed to a web host (see Method 1).
- You must be using a compatible mobile browser (e.g., Google Chrome on Android, Safari on iOS).

**Steps:**

1.  **Navigate to the OS:** Open the URL where you deployed the OS on your phone's browser.

2.  **Wait for the Install Prompt:**
    - The OS will automatically detect that it can be installed.
    - An **"Install OS"** button will appear in the top-right corner of the OS interface.

3.  **Tap "Install OS":**
    - Tap the "Install OS" button.
    - Your phone's native installation prompt will appear. Confirm the installation.

4.  **Launch from Home Screen:**
    - VDB Singularity OS will now appear on your home screen and in your app drawer, just like any other app.
    - You can launch it directly from the icon for a full-screen, offline-capable experience.
