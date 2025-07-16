# HAPA Website - Worktree Development Workflow

## Overview
This project uses **git worktrees** to enable parallel development on different components while maintaining a unified codebase for deployment.

## Worktree Structure

```
/home/ahmed/projects/hapa-website/
├── main/              # Main development (current)
├── payload-backend/   # Payload CMS & Backend development
└── frontend/          # Next.js Frontend development
```

## Branch Strategy

### Base Branches
- **`main`** - Production branch (deployment ready)
- **`payload-backend`** - Backend development base (CMS, collections, APIs)
- **`frontend`** - Frontend development base (Next.js, components, pages)

### Feature Branches
Create feature branches **from** the appropriate base branch:

```bash
# Backend features
cd ../payload-backend
git checkout -b feature/user-management
git checkout -b fix/collection-validation
git checkout -b feature/media-optimization

# Frontend features  
cd ../frontend
git checkout -b feature/arabic-navigation
git checkout -b fix/mobile-responsive
git checkout -b feature/contact-form
```

## Development Workflow

### 1. Feature Development
```bash
# Start new feature
git checkout -b feature/your-feature-name

# Work on your feature
# ... make changes ...

# Commit your work
git add .
git commit -m "feat: implement your feature"
```

### 2. Integration Process
```bash
# Step 1: Merge feature to base branch
git checkout payload-backend  # or frontend
git merge feature/your-feature-name

# Step 2: Test in worktree
pnpm dev  # Test your changes

# Step 3: Integration to main (when ready)
cd ../main
git checkout main
git merge payload-backend
git merge frontend
# Resolve any conflicts
```

### 3. Deployment
```bash
# From main worktree
git push origin main
# Vercel auto-deploys from main branch
```

## File Synchronization

### Shared Files (manual sync needed)
- **`.env`** - Copy manually when updated
- **`package.json`** - Copy if dependencies change
- **`CLAUDE.md`** - Keep in sync across worktrees

### Auto-synced Files
- All source code files (`src/`)
- Configuration files
- Documentation

## Best Practices

### 1. Keep Worktrees Clean
```bash
# Check status before switching
git status

# Clean untracked files if needed
git clean -fd
```

### 2. Regular Integration
- Merge to base branches **frequently** (daily/weekly)
- Integrate to `main` for **major milestones**
- Test integration **before** merging to main

### 3. Conflict Resolution
```bash
# When conflicts occur during merge
git status                    # See conflicted files
# Edit files to resolve conflicts
git add .                     # Stage resolved files
git commit                    # Complete the merge
```

### 4. Dependency Management
```bash
# After package.json changes
cp package.json ../other-worktree/
cd ../other-worktree && pnpm install
```

## Common Commands

### Worktree Management
```bash
git worktree list             # Show all worktrees
git worktree remove path      # Remove worktree
git worktree add path branch  # Add new worktree
```

### Branch Management
```bash
git branch -a                 # List all branches
git checkout -b new-branch    # Create and switch to branch
git branch -d branch-name     # Delete merged branch
```

### Status Checking
```bash
# Check all worktrees status
git worktree list
cd ../payload-backend && git status
cd ../frontend && git status
cd ../main && git status
```

## Example Scenarios

### Scenario 1: Backend Feature
```bash
cd ../payload-backend
git checkout -b feature/admin-notifications
# Implement notification system
git commit -m "feat: add admin notification system"
git checkout payload-backend
git merge feature/admin-notifications
```

### Scenario 2: Frontend Feature
```bash
cd ../frontend  
git checkout -b feature/language-switcher
# Implement language switching UI
git commit -m "feat: add Arabic/French language switcher"
git checkout frontend
git merge feature/language-switcher
```

### Scenario 3: Integration
```bash
cd ../main
git checkout main
git merge payload-backend    # Get backend changes
git merge frontend          # Get frontend changes
pnpm build                  # Test full build
git push origin main        # Deploy
```

## Troubleshooting

### Issue: Missing .env file
```bash
# Copy from main worktree
cp ../main/.env .
```

### Issue: Dependency conflicts
```bash
# Clean install
rm -rf node_modules pnpm-lock.yaml
pnpm install
```

### Issue: Merge conflicts
```bash
# See conflicted files
git status
# Edit files manually or use merge tool
git add .
git commit
```

## Team Coordination

### Communication
- **Announce** when merging to base branches
- **Coordinate** integration to main branch
- **Document** breaking changes in commits

### Code Review
- Create pull requests for major features
- Review before merging to `main`
- Test integration before deployment

---

**Remember**: The goal is parallel development with clean integration. Keep features isolated until ready for integration testing.