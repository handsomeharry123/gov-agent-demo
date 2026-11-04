#!/bin/bash
# 项目根目录兼容入口：停止 002.前端代码中的开发服务。
set -e
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
exec bash "$SCRIPT_DIR/002.前端代码/stop.sh"
