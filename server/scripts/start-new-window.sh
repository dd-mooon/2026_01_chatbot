#!/bin/bash
# 서버 실행 후 Chrome **새 창**으로 열기
ROOT="$(cd "$(dirname "$0")/.." && pwd)"

# 서버를 백그라운드로 실행
cd "$ROOT"
node index.js &
SERVER_PID=$!

# 서버가 시작될 때까지 대기
sleep 2

# Chrome 새 창으로 열기
open -na "Google Chrome" --args "http://localhost:3001"

echo "서버가 실행 중입니다. 종료하려면: kill $SERVER_PID"
