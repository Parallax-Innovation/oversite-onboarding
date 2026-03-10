# Deploying Web Changes

## Automatic Deployment

OverSite uses Vercel with auto-deploy from `main` branch.

**Workflow:**
1. Make your changes locally
2. Test with `pnpm dev`
3. Commit: `git add <files> && git commit -m "Your message"`
4. Push: `git push origin main`
5. Vercel automatically deploys to https://oversite.so

## Preview Deployments

For larger changes, use a feature branch:

```bash
git checkout -b feat/my-feature
# make changes
git push -u origin feat/my-feature
```

Vercel creates a preview deployment for every branch push.

## Important Notes

- **Never** `git add .` -- only add specific files you changed
- **Never** push secrets to the repository
- Vercel env vars are configured in the Vercel dashboard (Sean has access)

## Checking Deployment Status

```bash
# View recent deployments
vercel ls

# Or check GitHub Actions / Vercel dashboard
```

## Rollback

If something breaks:
1. Find the last working commit: `git log --oneline -10`
2. Revert: `git revert <bad-commit>`
3. Push: `git push origin main`
