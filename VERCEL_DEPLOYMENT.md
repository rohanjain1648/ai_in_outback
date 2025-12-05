# Vercel Deployment Guide - Rural Connect AI

## Quick Deploy

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/yourusername/rural-connect-ai)

## Prerequisites

- Vercel account (free tier works)
- GitHub repository with Rural Connect AI code
- Backend deployed separately (Railway, Render, or Heroku)

## Step 1: Prepare Environment Variables

Create a `.env.production` file with the following variables:

```bash
# API Configuration
VITE_API_URL=https://your-backend-url.railway.app
VITE_SOCKET_URL=https://your-backend-url.railway.app

# OpenAI (for Spirit Avatars)
VITE_OPENAI_API_KEY=your_openai_api_key

# Blockchain (Polygon Mumbai Testnet)
VITE_BLOCKCHAIN_NETWORK=mumbai
VITE_BLOCKCHAIN_RPC_URL=https://rpc-mumbai.maticvigil.com
VITE_CONTRACT_ADDRESS=your_contract_address

# Google Services
VITE_GOOGLE_MAPS_API_KEY=your_google_maps_key
VITE_GOOGLE_TRANSLATE_API_KEY=your_translate_key

# Feature Flags
VITE_ENABLE_VOICE=true
VITE_ENABLE_BLOCKCHAIN=true
VITE_ENABLE_AR=true
VITE_DEMO_MODE=true
```

## Step 2: Deploy via Vercel CLI

### Install Vercel CLI

```bash
npm install -g vercel
```

### Login to Vercel

```bash
vercel login
```

### Deploy

```bash
# Navigate to project root
cd rural-connect-ai

# Deploy to production
vercel --prod
```

### Set Environment Variables

```bash
# Set each environment variable
vercel env add VITE_API_URL production
vercel env add VITE_SOCKET_URL production
vercel env add VITE_OPENAI_API_KEY production
# ... add all other variables
```

## Step 3: Deploy via Vercel Dashboard

### 1. Import Repository

1. Go to [vercel.com/new](https://vercel.com/new)
2. Click "Import Git Repository"
3. Select your GitHub repository
4. Click "Import"

### 2. Configure Project

**Framework Preset**: Vite  
**Root Directory**: `./`  
**Build Command**: `npm run build`  
**Output Directory**: `dist`  
**Install Command**: `npm install`

### 3. Add Environment Variables

In the Vercel dashboard:
1. Go to Project Settings → Environment Variables
2. Add each variable from `.env.production`
3. Select "Production" environment
4. Click "Save"

### 4. Deploy

Click "Deploy" and wait for build to complete.

## Step 4: Configure Custom Domain (Optional)

### Add Domain

1. Go to Project Settings → Domains
2. Add your custom domain (e.g., `ruralconnect.au`)
3. Follow DNS configuration instructions
4. Wait for SSL certificate provisioning

### DNS Configuration

Add these records to your DNS provider:

```
Type: A
Name: @
Value: 76.76.21.21

Type: CNAME
Name: www
Value: cname.vercel-dns.com
```

## Step 5: Set Up Demo Credentials

### Create Demo User

After deployment, create a demo user via backend API:

```bash
curl -X POST https://your-backend-url.railway.app/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "demo@ruralconnect.au",
    "password": "demo2024",
    "name": "Demo User",
    "role": "user",
    "location": {
      "type": "Point",
      "coordinates": [133.7751, -25.2744]
    }
  }'
```

### Seed Demo Data

Run seeding scripts on backend:

```bash
# SSH into backend server or run locally
npm run seed:all
```

This will populate:
- Sample gig jobs
- Service listings
- Community members
- Blockchain credentials
- Cultural stories

## Step 6: Configure Vercel Settings

### Build & Development Settings

```json
{
  "buildCommand": "npm run build",
  "devCommand": "npm run dev",
  "installCommand": "npm install",
  "framework": "vite",
  "outputDirectory": "dist"
}
```

### Headers Configuration

Create `vercel.json` in project root:

```json
{
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "X-Content-Type-Options",
          "value": "nosniff"
        },
        {
          "key": "X-Frame-Options",
          "value": "DENY"
        },
        {
          "key": "X-XSS-Protection",
          "value": "1; mode=block"
        },
        {
          "key": "Referrer-Policy",
          "value": "strict-origin-when-cross-origin"
        },
        {
          "key": "Permissions-Policy",
          "value": "camera=*, microphone=*, geolocation=*"
        }
      ]
    }
  ],
  "rewrites": [
    {
      "source": "/api/:path*",
      "destination": "https://your-backend-url.railway.app/api/:path*"
    }
  ]
}
```

### Redirects

Add redirects for clean URLs:

```json
{
  "redirects": [
    {
      "source": "/home",
      "destination": "/",
      "permanent": true
    },
    {
      "source": "/demo",
      "destination": "/",
      "permanent": false
    }
  ]
}
```

## Step 7: Enable Analytics

### Vercel Analytics

1. Go to Project Settings → Analytics
2. Enable Vercel Analytics
3. Add analytics script to `index.html`:

```html
<script>
  window.va = window.va || function () { (window.vaq = window.vaq || []).push(arguments); };
</script>
<script defer src="/_vercel/insights/script.js"></script>
```

### Speed Insights

1. Enable Speed Insights in project settings
2. Monitor Core Web Vitals
3. Optimize based on insights

## Step 8: Set Up Continuous Deployment

### Automatic Deployments

Vercel automatically deploys on:
- Push to `main` branch → Production
- Push to other branches → Preview deployments
- Pull requests → Preview deployments

### Deployment Protection

1. Go to Project Settings → Deployment Protection
2. Enable "Vercel Authentication" for preview deployments
3. Add team members who can access previews

### Branch Protection

Configure in GitHub:
1. Require pull request reviews
2. Require status checks to pass
3. Require branches to be up to date

## Step 9: Monitor Deployment

### Check Deployment Status

```bash
# List deployments
vercel ls

# View deployment logs
vercel logs [deployment-url]

# Inspect deployment
vercel inspect [deployment-url]
```

### Deployment Dashboard

Monitor in Vercel dashboard:
- Build logs
- Runtime logs
- Analytics
- Performance metrics

## Step 10: Optimize Performance

### Enable Edge Caching

Add cache headers in `vercel.json`:

```json
{
  "headers": [
    {
      "source": "/assets/(.*)",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "public, max-age=31536000, immutable"
        }
      ]
    }
  ]
}
```

### Image Optimization

Use Vercel Image Optimization:

```typescript
// Use next/image or Vercel's image API
<img src="/_vercel/image?url=/avatar.png&w=400&q=75" />
```

### Enable Compression

Vercel automatically enables:
- Brotli compression
- Gzip compression
- HTTP/2 push

## Troubleshooting

### Build Fails

**Issue**: Build fails with module not found

**Solution**:
```bash
# Clear Vercel cache
vercel --force

# Check package.json dependencies
npm install

# Verify build locally
npm run build
```

### Environment Variables Not Working

**Issue**: Environment variables not accessible

**Solution**:
1. Ensure variables are prefixed with `VITE_`
2. Redeploy after adding variables
3. Check variable scope (Production/Preview/Development)

### API Calls Failing

**Issue**: CORS errors or API not reachable

**Solution**:
1. Check backend CORS configuration
2. Verify `VITE_API_URL` is correct
3. Ensure backend is deployed and running
4. Check network tab for actual error

### Voice Interface Not Working

**Issue**: Microphone permissions or Web Speech API errors

**Solution**:
1. Ensure HTTPS is enabled (required for microphone)
2. Check browser compatibility
3. Verify Permissions-Policy header
4. Test in Chrome/Edge (best support)

### Blockchain Transactions Failing

**Issue**: Transactions not confirming

**Solution**:
1. Check Polygon Mumbai testnet status
2. Verify contract address is correct
3. Ensure wallet has test MATIC
4. Check transaction queue

## Demo Mode Configuration

For hackathon demo, enable demo mode:

```bash
# Set in Vercel environment variables
VITE_DEMO_MODE=true
VITE_USE_MOCK_DATA=true
VITE_SKIP_AUTH=false
```

This enables:
- Simulated metrics data
- Pre-populated content
- Faster load times
- Demo user auto-login option

## Post-Deployment Checklist

- [ ] Deployment successful
- [ ] All environment variables set
- [ ] Custom domain configured (if applicable)
- [ ] SSL certificate active
- [ ] Demo credentials working
- [ ] All features functional
- [ ] Analytics enabled
- [ ] Performance optimized
- [ ] Error monitoring active
- [ ] Backup plan in place

## Monitoring and Maintenance

### Daily Checks
- Deployment status
- Error logs
- Performance metrics
- User feedback

### Weekly Checks
- Analytics review
- Performance optimization
- Security updates
- Dependency updates

### Monthly Checks
- Cost analysis
- Feature usage
- User growth
- Technical debt

## Support

For deployment issues:
- **Vercel Docs**: [vercel.com/docs](https://vercel.com/docs)
- **Vercel Support**: [vercel.com/support](https://vercel.com/support)
- **Project Issues**: [GitHub Issues](https://github.com/yourusername/rural-connect-ai/issues)

## Cost Estimation

### Vercel Free Tier
- 100 GB bandwidth/month
- Unlimited deployments
- Automatic HTTPS
- Analytics included

### Vercel Pro ($20/month)
- 1 TB bandwidth/month
- Advanced analytics
- Team collaboration
- Priority support

### Estimated Costs
- **Demo/Hackathon**: Free tier sufficient
- **Production (small)**: Free tier
- **Production (medium)**: Pro tier
- **Production (large)**: Enterprise

---

**Deployment Complete! 🚀**

Your Rural Connect AI platform is now live and ready to serve rural Australian communities.

**Live Demo**: https://rural-connect-ai.vercel.app  
**Admin Dashboard**: https://rural-connect-ai.vercel.app/admin  
**Demo Credentials**: demo@ruralconnect.au / demo2024

---

*Built with ❤️ for Rural Australia | Powered by Kiro AI | Deployed on Vercel*
