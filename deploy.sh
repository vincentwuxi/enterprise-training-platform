#!/bin/bash
# deploy.sh — 一键构建并部署到生产服务器
# 用法：bash deploy.sh

set -e

SERVER="wenyun@100.102.139.9"
REMOTE_DIR="/var/www/training"
PORT=8082

echo "🔨 [1/3] Building production bundle..."
cd "$(dirname "$0")/platform"
npm run build

echo "📤 [2/3] Uploading to $SERVER:$REMOTE_DIR ..."
rsync -avz --delete dist/ "$SERVER:$REMOTE_DIR/"

echo "🔄 [3/3] Reloading Nginx..."
ssh "$SERVER" "sudo systemctl reload nginx"

echo ""
echo "✅ Deploy complete!"
echo "🌐 http://100.102.139.9:$PORT"
