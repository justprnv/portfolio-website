# GitHub Pages Deployment Guide

This guide will help you deploy your portfolio website to GitHub Pages for free hosting.

## Prerequisites

- GitHub account
- Git installed on your computer
- Your portfolio project ready to deploy

## Step 1: Create a GitHub Repository

1. **Go to GitHub.com** and sign in to your account
2. **Click the "+" icon** in the top right corner and select "New repository"
3. **Name your repository** (e.g., `pranav-sawant-portfolio` or `my-portfolio`)
4. **Make it Public** (required for free GitHub Pages)
5. **Don't initialize** with README, .gitignore, or license (we already have these)
6. **Click "Create repository"**

## Step 2: Initialize Git and Push to GitHub

1. **Open Command Prompt/PowerShell** in your project folder:
   ```bash
   cd "C:\Users\prana\Downloads\Portfolio Website for Pranav Sawant"
   ```

2. **Initialize Git repository**:
   ```bash
   git init
   ```

3. **Add all files**:
   ```bash
   git add .
   ```

4. **Make your first commit**:
   ```bash
   git commit -m "Initial commit: Portfolio website"
   ```

5. **Add your GitHub repository as remote** (replace `YOUR_USERNAME` and `YOUR_REPO_NAME`):
   ```bash
   git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
   ```

6. **Push to GitHub**:
   ```bash
   git branch -M main
   git push -u origin main
   ```

## Step 3: Configure GitHub Pages

1. **Go to your repository** on GitHub
2. **Click on "Settings"** tab (at the top of your repository)
3. **Scroll down to "Pages"** section in the left sidebar
4. **Under "Source"**, select "GitHub Actions"
5. **GitHub will suggest workflows** - we'll create a custom one

## Step 4: Create GitHub Actions Workflow

1. **In your repository**, click on "Actions" tab
2. **Click "New workflow"**
3. **Click "set up a workflow yourself"**
4. **Replace the content** with this workflow:

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [ main ]

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: "pages"
  cancel-in-progress: false

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v4
        
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '18'
          cache: 'npm'
          
      - name: Install dependencies
        run: npm ci
        
      - name: Build
        run: npm run build
        
      - name: Setup Pages
        uses: actions/configure-pages@v4
        
      - name: Upload artifact
        uses: actions/upload-pages-artifact@v3
        with:
          path: './build'

  deploy:
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    runs-on: ubuntu-latest
    needs: build
    steps:
      - name: Deploy to GitHub Pages
        id: deployment
        uses: actions/deploy-pages@v4
```

5. **Click "Start commit"**
6. **Add commit message**: "Add GitHub Pages deployment workflow"
7. **Click "Commit new file"**

## Step 5: Enable GitHub Pages

1. **Go back to Settings > Pages**
2. **Under "Source"**, select "GitHub Actions"
3. **Wait for the workflow to run** (it may take 2-3 minutes)
4. **Your site will be available at**: `https://YOUR_USERNAME.github.io/YOUR_REPO_NAME`

## Step 6: Custom Domain (Optional)

If you have a custom domain:

1. **In Settings > Pages**, scroll to "Custom domain"
2. **Enter your domain** (e.g., `www.yourname.com`)
3. **Check "Enforce HTTPS"**
4. **Add a CNAME file** to your repository root with your domain name

## Step 7: Update and Redeploy

Every time you make changes:

1. **Make your changes** to the code
2. **Commit and push**:
   ```bash
   git add .
   git commit -m "Update portfolio content"
   git push
   ```
3. **GitHub Actions will automatically rebuild and deploy** your site

## Troubleshooting

### Build Fails
- Check the "Actions" tab for error details
- Ensure all dependencies are in `package.json`
- Make sure the build command works locally: `npm run build`

### Site Not Loading
- Wait 5-10 minutes after deployment
- Check the Pages settings in your repository
- Ensure the repository is public

### Custom Domain Issues
- DNS propagation can take up to 24 hours
- Make sure your domain points to `YOUR_USERNAME.github.io`
- Check the CNAME file in your repository

## Alternative: Manual Deployment

If you prefer manual deployment:

1. **Build the project**:
   ```bash
   npm run build
   ```

2. **Go to Settings > Pages**
3. **Select "Deploy from a branch"**
4. **Choose "main" branch and "/build" folder**
5. **Click "Save"**

## Your Live Portfolio

Once deployed, your portfolio will be available at:
`https://YOUR_USERNAME.github.io/YOUR_REPO_NAME`

Share this link with potential employers, clients, and colleagues!

---

**Need help?** Check the [GitHub Pages documentation](https://docs.github.com/en/pages) or create an issue in your repository.
