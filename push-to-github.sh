#!/bin/bash
# Helper script to push your code to GitHub

set -e

echo "🚀 GitHub Push Helper"
echo ""
echo "This will help you push your Niche CRM to GitHub"
echo ""

# Check if gh CLI is installed
if command -v gh &> /dev/null; then
    echo "✅ GitHub CLI found"
    echo ""
    echo "Choose an option:"
    echo "1) Create new repo and push (easiest)"
    echo "2) Push to existing repo"
    read -p "Enter choice (1 or 2): " choice
    
    if [ "$choice" = "1" ]; then
        echo ""
        echo "Creating GitHub repository..."
        gh repo create niche-crm-mvp --public --source=. --remote=origin --push
        echo ""
        echo "✅ Done! Your code is on GitHub"
        gh repo view --web
    elif [ "$choice" = "2" ]; then
        echo ""
        read -p "Enter your GitHub username: " username
        git remote add origin "https://github.com/$username/niche-crm-mvp.git"
        git push -u origin main
        echo ""
        echo "✅ Done! Visit: https://github.com/$username/niche-crm-mvp"
    fi
else
    echo "❌ GitHub CLI not found"
    echo ""
    echo "📖 Two options:"
    echo ""
    echo "Option 1: Install GitHub CLI (recommended)"
    echo "   Run: sudo apt install gh"
    echo "   Then run this script again"
    echo ""
    echo "Option 2: Manual setup"
    echo "   1. Create repo at: https://github.com/new"
    echo "   2. Name it: niche-crm-mvp"
    echo "   3. Run these commands:"
    echo ""
    read -p "   Enter your GitHub username: " username
    echo ""
    echo "   git remote add origin https://github.com/$username/niche-crm-mvp.git"
    echo "   git push -u origin main"
    echo ""
    echo "📖 Full guide: Read GITHUB-SETUP.md"
fi
