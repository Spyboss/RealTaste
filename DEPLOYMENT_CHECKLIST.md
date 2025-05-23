# ✅ RealTaste Deployment Checklist

Use this checklist to ensure a smooth deployment process.

## 🔧 Pre-Deployment Setup

### Environment Variables
- [ ] Copy `.env.example` to `.env` in root directory
- [ ] Copy `frontend/.env.example` to `frontend/.env`
- [ ] Fill in all Supabase credentials
- [ ] Set up PayHere merchant credentials
- [ ] Configure Firebase project (if using push notifications)
- [ ] Generate strong JWT secret

### Code Preparation
- [ ] All code committed to Git
- [ ] Code pushed to GitHub repository
- [ ] Build scripts working locally (`npm run build`)
- [ ] Tests passing (if any)
- [ ] No console errors in development

## 🚁 Backend Deployment (Fly.io)

### Setup
- [ ] Fly CLI installed (`fly version` works)
- [ ] Logged into Fly.io (`fly auth login`)
- [ ] App initialized (`fly launch --no-deploy`)

### Configuration
- [ ] `fly.toml` configured correctly
- [ ] Dockerfile created and tested
- [ ] Environment variables set via `fly secrets set`
- [ ] Health check endpoint working (`/health`)

### Deployment
- [ ] First deployment successful (`fly deploy`)
- [ ] App status shows healthy (`fly status`)
- [ ] Logs show no errors (`fly logs`)
- [ ] Health check accessible: `https://your-app.fly.dev/health`

### API Testing
- [ ] Health endpoint responds: `GET /health`
- [ ] Menu endpoint works: `GET /api/menu`
- [ ] CORS headers present in responses
- [ ] Error handling working properly

## 🌐 Frontend Deployment (Cloudflare Pages)

### Setup
- [ ] Cloudflare account created
- [ ] Repository connected to Cloudflare Pages
- [ ] Build settings configured correctly

### Configuration
- [ ] Environment variables set in Cloudflare Pages
- [ ] API URL pointing to Fly.io backend
- [ ] PWA manifest configured
- [ ] Service worker registered

### Deployment
- [ ] Build successful in Cloudflare Pages
- [ ] Site accessible at `https://your-app.pages.dev`
- [ ] PWA installable on mobile devices
- [ ] Offline functionality working

### Frontend Testing
- [ ] All pages load correctly
- [ ] API calls working (check Network tab)
- [ ] PWA installation prompt appears
- [ ] Service worker caching working
- [ ] Responsive design on mobile/tablet

## 🔗 Integration Testing

### API Connectivity
- [ ] Frontend can reach backend API
- [ ] CORS working properly
- [ ] Authentication flow working
- [ ] Error messages displaying correctly

### Database Operations
- [ ] Menu items loading from Supabase
- [ ] Orders can be created
- [ ] Real-time updates working (if implemented)
- [ ] Data persistence working

### Payment Integration (if implemented)
- [ ] PayHere sandbox working
- [ ] Payment flow completing
- [ ] Order status updating after payment

## 📱 Mobile & PWA Testing

### PWA Features
- [ ] App installable on Android
- [ ] App installable on iOS (Add to Home Screen)
- [ ] Offline functionality working
- [ ] Push notifications working (if implemented)

### Mobile Experience
- [ ] Touch interactions working
- [ ] Responsive design on various screen sizes
- [ ] Performance acceptable on mobile networks
- [ ] Loading states showing properly

## 🚨 Security & Performance

### Security
- [ ] HTTPS enforced on both frontend and backend
- [ ] Environment variables not exposed in frontend
- [ ] API rate limiting working
- [ ] Input validation working
- [ ] Security headers present

### Performance
- [ ] Page load times acceptable (<3s)
- [ ] Images optimized
- [ ] JavaScript bundles optimized
- [ ] CDN caching working (Cloudflare)
- [ ] API response times acceptable (<500ms)

## 📊 Monitoring & Alerts

### Monitoring Setup
- [ ] Fly.io monitoring configured
- [ ] Cloudflare analytics enabled
- [ ] Error tracking set up (if using Sentry/similar)
- [ ] Uptime monitoring configured

### Documentation
- [ ] Deployment guide updated
- [ ] API documentation current
- [ ] Environment variables documented
- [ ] Troubleshooting guide available

## 🎉 Go-Live Checklist

### Final Verification
- [ ] All features working end-to-end
- [ ] Performance acceptable under load
- [ ] Error handling graceful
- [ ] User experience smooth

### Communication
- [ ] Team notified of deployment
- [ ] Users informed of new features (if applicable)
- [ ] Support team briefed on changes
- [ ] Rollback plan documented

### Post-Deployment
- [ ] Monitor logs for first 24 hours
- [ ] Check error rates and performance metrics
- [ ] Verify all integrations working
- [ ] Collect user feedback

## 🔄 Rollback Plan

If something goes wrong:

### Backend Rollback
```bash
fly releases list
fly releases rollback <version>
```

### Frontend Rollback
- Use Cloudflare Pages deployment history
- Revert to previous Git commit and redeploy

### Database Rollback
- Supabase has automatic backups
- Contact Supabase support if needed

---

## 📞 Emergency Contacts

- **Fly.io Support:** [fly.io/docs](https://fly.io/docs)
- **Cloudflare Support:** [developers.cloudflare.com](https://developers.cloudflare.com)
- **Supabase Support:** [supabase.com/docs](https://supabase.com/docs)

---

**Remember:** Always test in a staging environment before deploying to production!
