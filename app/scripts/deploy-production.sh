#!/usr/bin/env bash
set -euo pipefail

APP_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
PROJECT_ID="${FIREBASE_PROJECT_ID:-baby-growth-dvphu}"
GOOGLE_CLIENT_ID="${VITE_GOOGLE_CLIENT_ID:-598629342498-c8ltki5l6hfn395ts1497hu5euks33kv.apps.googleusercontent.com}"

cd "$APP_DIR"

if ! command -v firebase >/dev/null 2>&1; then
  echo "Firebase CLI chưa được cài đặt. Cài một lần bằng: npm install --global firebase-tools" >&2
  exit 1
fi

if ! firebase projects:list --project "$PROJECT_ID" >/dev/null 2>&1; then
  echo "Không thể truy cập Firebase project '$PROJECT_ID'. Hãy chạy 'firebase login' và kiểm tra quyền project." >&2
  exit 1
fi

export VITE_GOOGLE_CLIENT_ID="$GOOGLE_CLIENT_ID"

echo "Building BabyGrowth production bundle..."
npm run lint
npm run build

echo "Deploying Firebase Hosting production site for project '$PROJECT_ID'..."
firebase deploy --only hosting --project "$PROJECT_ID"

echo
echo "Production deployment completed: https://baby-growth-dvphu.web.app"
echo "Google OAuth origin must be registered as: https://baby-growth-dvphu.web.app"
