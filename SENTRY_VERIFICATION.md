# Sentry Verification Guide

## ✅ Sentry Configuration Completed

Sentry has been configured for the Belucha project with the following setup:

### Files Created/Updated

1. **Root Level (for reference):**
   - `sentry.server.config.js` ✅
   - `sentry.edge.config.js` ✅
   - `instrumentation.js` ✅
   - `instrumentation-client.js` ✅
   - `next.config.js` (with Sentry wrapper) ✅

2. **Shop App (`apps/shop/`):**
   - `sentry.server.config.js` ✅
   - `sentry.edge.config.js` ✅
   - `instrumentation.js` ✅
   - `instrumentation-client.js` ✅
   - `next.config.js` (with Sentry wrapper) ✅

### Configuration Details

- **DSN:** `https://358d148bbc5d3fff71871cae743477ec@o4510747557822464.ingest.de.sentry.io/4510747562475600`
- **Organization:** `ecommezzo-6n`
- **Project:** `javascript-nextjs`
- **Traces Sample Rate:** `1.0` (100% - adjust for production)
- **Browser Tracing:** Enabled with `browserTracingIntegration()`
- **Distributed Tracing:** Configured with `tracePropagationTargets`

## 🔄 Next Steps to Verify Sentry

### 1. Restart the Development Server

The Sentry configuration files have been added, but the Next.js app needs to be restarted to load them:

```bash
# Stop the current dev server (Ctrl+C)
# Then restart:
cd apps/shop
npm run dev
```

### 2. Verify Sentry is Loaded

After restarting, open the browser console and check:

```javascript
// In browser console:
typeof window !== 'undefined' && window.Sentry ? 'Sentry loaded ✅' : 'Sentry not found ❌'
```

### 3. Generate a Trace

To generate your first trace and verify performance monitoring:

1. **Navigate to different pages:**
   - Visit `http://localhost:3000`
   - Visit `http://localhost:3000/login`
   - Visit `http://localhost:3000/register`
   - Click on different links

2. **Make API calls:**
   - If GraphQL API is working, any GraphQL query will generate a trace
   - Check Network tab for requests to `/api/graphql`

3. **Wait a few seconds:**
   - Sentry batches and sends traces asynchronously
   - Traces may take 10-30 seconds to appear in Sentry dashboard

### 4. Check Sentry Dashboard

1. Go to: https://ecommezzo-6n.sentry.io/projects/javascript-nextjs/
2. Navigate to **Performance** tab
3. Look for transactions/traces
4. You should see:
   - Page load transactions
   - API request transactions (if GraphQL is working)
   - Navigation transactions

### 5. Verify Distributed Tracing

If you have multiple services (Shop app + CMS), distributed tracing should:
- Show connected traces across services
- Display trace propagation headers in Network tab
- Show service-to-service communication in Sentry

## 🐛 Troubleshooting

### Sentry Not Loading

**Problem:** `window.Sentry` is undefined

**Solutions:**
1. ✅ Ensure `@sentry/nextjs` is installed in root `package.json`
2. ✅ Restart the dev server after adding Sentry files
3. ✅ Check browser console for errors
4. ✅ Verify `instrumentation.js` is in the correct location
5. ✅ Check that `next.config.js` uses `withSentryConfig`

### No Traces Appearing

**Problem:** Traces not showing in Sentry dashboard

**Solutions:**
1. ✅ Wait 30-60 seconds (Sentry batches sends)
2. ✅ Check `tracesSampleRate` is set to `1.0` (not `0`)
3. ✅ Verify DSN is correct
4. ✅ Check browser Network tab for requests to `sentry.io`
5. ✅ Check for CORS errors in console
6. ✅ Verify `tunnelRoute: "/monitoring"` is working (if using)

### Build Errors

**Problem:** Build fails with Sentry errors

**Solutions:**
1. ✅ Ensure `@sentry/nextjs` is in dependencies
2. ✅ Check `next.config.js` syntax
3. ✅ Verify all Sentry config files are valid JavaScript
4. ✅ Check for missing imports

## 📊 Expected Results

After successful setup, you should see in Sentry:

1. **Performance Tab:**
   - Transaction list with page names
   - Duration metrics
   - Throughput metrics
   - P50, P75, P95, P99 percentiles

2. **Transaction Details:**
   - Page load breakdown
   - API call timing
   - Database query timing (if applicable)
   - Network request timing

3. **Distributed Traces:**
   - Connected traces across services
   - Service map visualization
   - End-to-end request flow

## 🎯 Current Status

- ✅ Sentry configuration files created
- ✅ Next.js config updated
- ⏳ **Waiting for dev server restart**
- ⏳ **Waiting for first trace**

## 📝 Notes

- **Development:** `tracesSampleRate: 1.0` captures 100% of transactions
- **Production:** Consider reducing to `0.1` (10%) or `0.2` (20%) to manage costs
- **Tunnel Route:** `/monitoring` is configured to bypass ad-blockers
- **Source Maps:** Enabled for better stack traces

---

**Last Updated:** 2026-01-19  
**Status:** Configuration Complete - Awaiting Verification

