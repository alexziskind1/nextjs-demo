# YouTube Comments Setup Guide

## Quick Setup (Recommended)

### Method 1: YouTube Data API Key (Easiest)

#### Step 1: Create Google Cloud Project
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Note your Project ID

#### Step 2: Enable YouTube Data API v3
1. In the Google Cloud Console, go to "APIs & Services" > "Library"
2. Search for "YouTube Data API v3"
3. Click on it and press "Enable"

#### Step 3: Create API Key
1. Go to "APIs & Services" > "Credentials"
2. Click "Create Credentials" > "API Key"
3. Copy the generated API key
4. **Optional but recommended**: Click "Restrict Key" and add restrictions:
   - Application restrictions: HTTP referrers or IP addresses
   - API restrictions: Select "YouTube Data API v3"

#### Step 4: Configure Your Application
Add to your `.env.local`:
```
YOUTUBE_API_KEY=your_api_key_here
```

#### Step 5: Test the Setup
1. Start your development server: `npm run dev`
2. Go to `http://localhost:3000/youtube-comments`
3. Try fetching comments from a public YouTube video

---

## Alternative Setup: Service Account (Advanced)

### When to use Service Accounts:
- You need server-to-server authentication
- You're building enterprise applications
- You need more granular permission control

**Note**: Service accounts for YouTube Data API can be complex and may not work for all use cases. API keys are recommended for most applications.

### Step 1: Create Google Cloud Project
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Note your Project ID

### Step 2: Enable YouTube Data API v3
1. In the Google Cloud Console, go to "APIs & Services" > "Library"
2. Search for "YouTube Data API v3"
3. Click on it and press "Enable"

### Step 3: Create Service Account
1. Go to "APIs & Services" > "Credentials"
2. Click "Create Credentials" > "Service Account"
3. Fill in the service account details:
   - Name: `youtube-comments-fetcher`
   - Description: `Service account for fetching YouTube comments`
4. Click "Create and Continue"
5. Skip the optional steps and click "Done"

### Step 4: Download Service Account Key
1. In the "Credentials" page, find your newly created service account
2. Click on the service account email
3. Go to the "Keys" tab
4. Click "Add Key" > "Create new key"
5. Choose "JSON" format
6. Download the JSON file

### Step 5: Configure Your Application

#### Option A: Using Environment Variables (Recommended for all environments)
1. Copy the entire content of the downloaded JSON file
2. **Easy method**: Use our conversion script:
   ```bash
   npm run convert-service-account ./path/to/your/service-account.json
   ```
   This will output the exact line to add to your `.env.local` file.

3. **Manual method**: Copy the JSON content and add to your `.env.local`:
   ```
   GOOGLE_SERVICE_ACCOUNT_JSON={"type":"service_account","project_id":"your-project","private_key_id":"...","private_key":"..."}
   ```

4. **For production deployment**, set this as an environment variable in your hosting platform:
   - **Vercel**: Go to Project Settings > Environment Variables
   - **Netlify**: Go to Site Settings > Environment Variables  
   - **Railway**: Use the Variables tab in your project
   - **Heroku**: Use `heroku config:set GOOGLE_SERVICE_ACCOUNT_JSON='{"type":"service_account",...}'`
   - **Docker**: Pass as environment variable in your container

#### Option B: Using File Path (Only for local development)
1. Place the downloaded JSON file in your project root directory
2. Rename it to something like `google-service-account.json`
3. Add to your `.env.local`:
   ```
   GOOGLE_SERVICE_ACCOUNT_PATH=./google-service-account.json
   ```
4. ⚠️ **Important**: Add the JSON file to your `.gitignore`:
   ```
   # Add to .gitignore
   google-service-account.json
   ```

**Why Option A is better:**
- ✅ No risk of accidentally committing secrets
- ✅ Works seamlessly in all deployment environments
- ✅ Easier to manage in CI/CD pipelines
- ✅ Better for containerized deployments

### Step 6: Test the Setup
1. Start your development server: `npm run dev`
2. Go to `http://localhost:3000/youtube-comments`
3. Try fetching comments from a public YouTube video

## Deployment with Environment Variables

### Platform-Specific Instructions:

#### Vercel
1. Go to your project dashboard
2. Navigate to "Settings" > "Environment Variables"
3. Add new variable:
   - **Name**: `GOOGLE_SERVICE_ACCOUNT_JSON`
   - **Value**: `{"type":"service_account","project_id":"..."}` (paste your entire JSON)
   - **Environment**: Production, Preview, Development (as needed)

#### Netlify
1. Go to "Site settings" > "Environment variables"
2. Click "Add a variable"
3. Set `GOOGLE_SERVICE_ACCOUNT_JSON` with your JSON content

#### Railway
1. In your project dashboard, go to the "Variables" tab
2. Add `GOOGLE_SERVICE_ACCOUNT_JSON` with your JSON content

#### Heroku
```bash
heroku config:set GOOGLE_SERVICE_ACCOUNT_JSON='{"type":"service_account","project_id":"your-project",...}'
```

#### Docker
```dockerfile
# In your Dockerfile or docker-compose.yml
ENV GOOGLE_SERVICE_ACCOUNT_JSON='{"type":"service_account",...}'
```

#### GitHub Actions (CI/CD)
```yaml
# In your workflow file
env:
  GOOGLE_SERVICE_ACCOUNT_JSON: ${{ secrets.GOOGLE_SERVICE_ACCOUNT_JSON }}
```

### Environment Variable Best Practices:
- ✅ Always use environment variables for secrets in production
- ✅ Never commit `.env.local` or `.env.production` files
- ✅ Use different service accounts for different environments
- ✅ Regularly rotate service account keys
- ✅ Set up monitoring for API usage and quota

## Security Notes

⚠️ **Important Security Considerations:**

1. **Never commit service account files to version control**
2. **Use environment variables for production deployments**
3. **Restrict service account permissions to minimum required**
4. **Consider using Google Cloud IAM for additional security**

## Troubleshooting

### Common Issues:

1. **"Authentication failed"**
   - Check that the JSON file path is correct
   - Ensure the JSON content is valid
   - Verify the service account has been created properly

2. **"API quota exceeded"**
   - Check your Google Cloud Console for API usage
   - YouTube Data API has daily quotas and rate limits

3. **"Video not found"**
   - Ensure the video is public
   - Check that the YouTube URL is valid
   - Some videos may have comments disabled

4. **"Comments are disabled"**
   - The video owner has disabled comments
   - Try with a different video that allows comments

## API Quotas

YouTube Data API v3 has the following default quotas:
- **Daily quota**: 10,000 units per day
- **Queries per day**: Varies based on quota consumption
- **CommentThreads.list**: Costs 1 unit per request

Each comment fetch request typically uses 1-2 quota units.
