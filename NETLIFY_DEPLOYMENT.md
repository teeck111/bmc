# Netlify Deployment Guide for BMC

This guide will help you deploy the Big Mountain Club website to Netlify with serverless functions for trip management and photo uploads.

## Prerequisites

1. GitHub account with your BMC repository
2. Netlify account (free tier is sufficient)
3. GitHub personal access token with repository permissions

## Step 1: Create GitHub Personal Access Token

1. Go to GitHub Settings > Developer settings > Personal access tokens > Tokens (classic)
2. Click "Generate new token (classic)"
3. Give it a descriptive name like "BMC Netlify Functions"
4. Select these scopes:
   - `repo` (Full control of private repositories)
   - `workflow` (Update GitHub Action workflows)
5. Set expiration (recommended: 1 year)
6. Click "Generate token"
7. **IMPORTANT**: Copy the token immediately - you won't see it again

## Step 2: Deploy to Netlify

1. Sign up/login to [Netlify](https://netlify.com)
2. Click "Add new site" > "Import an existing project"
3. Choose "Deploy with GitHub"
4. Authorize Netlify to access your GitHub account
5. Select your BMC repository
6. Configure build settings:
   - **Build command**: Leave empty (static site)
   - **Publish directory**: `/` (root directory)
   - **Functions directory**: `netlify/functions`
7. Click "Deploy site"

## Step 3: Configure Environment Variables

After deployment, configure the required environment variables:

1. Go to your site dashboard in Netlify
2. Navigate to "Site settings" > "Environment variables"
3. Add the following variables:

### Required Variables:
- **GITHUB_TOKEN**: Your GitHub personal access token from Step 1
- **CLUB_PASSWORD**: `BigMountain2024` (or your desired club password)
- **GITHUB_OWNER**: Your GitHub username (e.g., `tylerkivelson`)
- **GITHUB_REPO**: Your repository name (e.g., `bmc`)

### Optional Variables:
- **TRIPS_FILE**: `trips.json` (default filename for trip data)
- **PHOTOS_DIR**: `photos` (default directory for uploaded photos)

## Step 4: Test the Deployment

1. Visit your Netlify site URL
2. Go to the "Add Trip" page
3. Enter the club password when prompted
4. Try adding a test trip with photos
5. Check that the trip appears on the "Trip Log" page

## Step 5: Custom Domain (Optional)

If you have a custom domain like `bigmtnclub.com`:

1. In Netlify, go to "Site settings" > "Domain management"
2. Click "Add custom domain"
3. Enter your domain name
4. Follow the DNS configuration instructions
5. Enable HTTPS (automatic with Netlify)

## Troubleshooting

### Functions Not Working
- Check the Netlify Functions tab in your site dashboard
- Look for deployment errors in the Functions log
- Verify environment variables are set correctly

### Photos Not Uploading
- Confirm GITHUB_TOKEN has correct permissions
- Check that the repository exists and is accessible
- Verify the token hasn't expired

### Password Issues
- Ensure CLUB_PASSWORD environment variable matches what users enter
- Check for typos or extra spaces in the password

### Local Development

To test locally with Netlify Dev:

1. Install Netlify CLI: `npm install -g netlify-cli`
2. In your project directory: `netlify dev`
3. Access your site at `http://localhost:8888`
4. Functions will be available at `http://localhost:8888/.netlify/functions/[function-name]`

## Environment Variables Summary

```bash
# Required for Netlify deployment
GITHUB_TOKEN=ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxx
CLUB_PASSWORD=BigMountain2024
GITHUB_OWNER=tylerkivelson
GITHUB_REPO=bmc

# Optional (will use defaults if not set)
TRIPS_FILE=trips.json
PHOTOS_DIR=photos
```

## Security Notes

- Never commit your GitHub token to the repository
- Environment variables in Netlify are secure and encrypted
- The club password provides basic access control - consider implementing more robust authentication for production use
- Photos are stored in your GitHub repository and are publicly accessible via the web

## Post-Deployment

After successful deployment:

1. Update any hardcoded URLs in your code to use your new Netlify domain
2. Test all functionality thoroughly
3. Monitor the Netlify dashboard for any errors or usage stats
4. Consider setting up form notifications for new trip submissions

## Support

If you encounter issues:
1. Check Netlify's function logs in the dashboard
2. Verify all environment variables are set correctly
3. Test individual functions using the Netlify CLI
4. Check GitHub API rate limits if you're experiencing failures