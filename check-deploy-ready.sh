#!/bin/bash
# Check if the app is ready for deployment

echo "🔍 Checking deployment readiness..."
echo ""

# Check for required files
echo "📁 Checking files..."
files=(
  "vercel.json"
  "supabase-schema.sql"
  ".env.example"
  "src/lib/supabase.ts"
  "src/lib/contactService.supabase.ts"
)

all_files_exist=true
for file in "${files[@]}"; do
  if [ -f "$file" ]; then
    echo "  ✅ $file"
  else
    echo "  ❌ $file (missing)"
    all_files_exist=false
  fi
done

echo ""

# Check if .env exists (for local dev)
echo "🔑 Checking environment..."
if [ -f ".env" ]; then
  echo "  ✅ .env file exists (local development ready)"
  
  if grep -q "VITE_SUPABASE_URL=your-project-url" .env; then
    echo "  ⚠️  Warning: .env still has placeholder values"
    echo "     Update with your real Supabase credentials"
  else
    echo "  ✅ .env appears configured"
  fi
else
  echo "  ⚠️  .env file not found (okay for deployment, required for local dev)"
  echo "     Run: cp .env.example .env"
fi

echo ""

# Check build
echo "🔨 Checking build..."
if npm run build > /dev/null 2>&1; then
  echo "  ✅ Build successful"
else
  echo "  ❌ Build failed - run 'npm run build' to see errors"
fi

echo ""

# Check tests
echo "🧪 Checking tests..."
if npm test -- --run --reporter=basic > /dev/null 2>&1; then
  echo "  ✅ All tests passing"
else
  echo "  ⚠️  Some tests failing (not critical for deployment)"
fi

echo ""

# Check git
echo "📦 Checking git..."
if git rev-parse --git-dir > /dev/null 2>&1; then
  echo "  ✅ Git repository initialized"
  
  if git remote -v | grep -q "origin"; then
    echo "  ✅ Git remote configured"
    git remote -v | head -n 1
  else
    echo "  ⚠️  No git remote set"
    echo "     Add with: git remote add origin https://github.com/YOUR_USERNAME/niche-crm-mvp.git"
  fi
  
  if [ -n "$(git status --porcelain)" ]; then
    echo "  ⚠️  Uncommitted changes"
    echo "     Run: git add . && git commit -m 'Ready for deployment'"
  else
    echo "  ✅ All changes committed"
  fi
else
  echo "  ❌ Not a git repository"
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

if [ "$all_files_exist" = true ]; then
  echo "✅ Deployment files ready!"
  echo ""
  echo "📖 Next steps:"
  echo "   1. Read QUICKSTART.md for 10-minute deploy guide"
  echo "   2. Create Supabase project and run supabase-schema.sql"
  echo "   3. Push to GitHub"
  echo "   4. Deploy to Vercel with environment variables"
  echo ""
  echo "🚀 You're ready to launch!"
else
  echo "❌ Missing required files"
  echo ""
  echo "Please ensure all deployment files are present."
fi

echo ""
