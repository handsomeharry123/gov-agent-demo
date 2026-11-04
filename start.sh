#!/bin/bash
# 项目根目录兼容入口：实际前端工程位于 002.前端代码。
set -e
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
exec bash "$SCRIPT_DIR/002.前端代码/start.sh"
