#!/bin/bash

echo "开始同步网站图标..."

# 使用 tsx 运行 TypeScript 脚本
npx tsx scripts/sync-favicons.ts

echo "同步完成!"