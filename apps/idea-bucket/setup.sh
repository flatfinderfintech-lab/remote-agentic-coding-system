#!/bin/bash

# Idea Bucket AI - Setup Script
# This script initializes the database and prepares the app for development

set -e  # Exit on error

echo "🚀 Setting up Idea Bucket AI..."

# Check if .env exists
if [ ! -f .env ]; then
  echo "📝 Creating .env file from .env.example..."
  cp .env.example .env
  echo "✅ .env file created"
else
  echo "✅ .env file already exists"
fi

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Generate Prisma client
echo "🔧 Generating Prisma client..."
PRISMA_ENGINES_CHECKSUM_IGNORE_MISSING=1 npx prisma generate || {
  echo "⚠️  Prisma generation failed. You may need to run this manually:"
  echo "    PRISMA_ENGINES_CHECKSUM_IGNORE_MISSING=1 npx prisma generate"
}

# Run migrations
echo "🗄️  Running database migrations..."
PRISMA_ENGINES_CHECKSUM_IGNORE_MISSING=1 npx prisma migrate dev --name init || {
  echo "⚠️  Migration failed. You may need to run this manually:"
  echo "    PRISMA_ENGINES_CHECKSUM_IGNORE_MISSING=1 npx prisma migrate dev --name init"
}

echo ""
echo "✨ Setup complete!"
echo ""
echo "To start the development server, run:"
echo "  npm run dev"
echo ""
echo "Then open http://localhost:3000 in your browser."
echo ""
