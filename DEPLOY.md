# 배포 가이드

산출물 제출 시 **AI 기능(RAG + Ollama)**이 동작해야 합니다.  
아래 **방법 A (권장)**를 사용하면 **무료**로 전체 기능을 배포할 수 있습니다.

---

## 방법 A: AI 전체 동작 배포 (무료, 권장)

**Oracle Cloud Free Tier** VM 하나에 ChromaDB + Ollama + Node.js를 올려서 **Exact Match + RAG + Ollama** 모두 동작시킵니다.

### 1. Oracle Cloud VM 생성

1. [cloud.oracle.com](https://cloud.oracle.com) 가입 (신용카드 필요, 무료 사용 시 과금 없음)
2. **Create a VM instance** → **Always Free** 선택
3. **Shape**: `VM.Standard.E2.1` 또는 `VM.Standard.A1.Flex` (ARM, 24GB RAM 권장)
4. **Image**: Ubuntu 22.04
5. **SSH 키** 생성 후 다운로드

### 2. VM 접속 및 초기 설정

```bash
# SSH 접속 (예: 공인 IP가 123.45.67.89인 경우)
ssh -i ~/.ssh/your-key ubuntu@123.45.67.89

# 시스템 업데이트
sudo apt update && sudo apt upgrade -y

# Docker 설치
sudo apt install -y docker.io docker-compose
sudo usermod -aG docker $USER
# 로그아웃 후 다시 접속하거나: newgrp docker
```

### 3. ChromaDB 실행 (Docker)

```bash
# ChromaDB 컨테이너 실행 (포트 8000, 데이터 영속용 볼륨 포함)
sudo docker run -d --name chromadb -p 8000:8000 -v chroma_data:/chroma/chroma chromadb/chroma

# 확인
curl http://localhost:8000/api/v1/heartbeat
```

> ⚠️ 지식 베이스 데이터는 어드민(`/admin.html`)에서 배포 후 다시 등록해야 합니다. ChromaDB는 처음엔 비어 있습니다.

### 4. Ollama 설치 및 모델 다운로드

```bash
# Ollama 설치
curl -fsSL https://ollama.com/install.sh | sh

# Ollama 서비스 (백그라운드)
ollama serve &

# 모델 다운로드 (llama3 ~ 4.7GB, CPU에서도 동작)
ollama pull llama3

# 또는 더 가벼운 모델 (느린 VM일 경우)
# ollama pull phi3:mini
```

### 5. Node.js 및 프로젝트 배포

```bash
# Node.js 20 설치
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# 프로젝트 클론
git clone https://github.com/YOUR_USERNAME/2026_01_chatbot.git
cd 2026_01_chatbot/server

# 의존성 설치
npm install

# 서버 실행 (백그라운드, pm2 권장)
sudo npm install -g pm2
pm2 start index.js --name connie

# pm2 로그 확인
pm2 logs connie
```

### 6. 방화벽 및 포트 설정

Oracle Cloud 콘솔에서 **Security List**에 인바운드 규칙 추가:

- **TCP 3001**: Node API (또는 80/443)
- **TCP 22**: SSH

```bash
# 서버 내부에서 3001 포트 리스닝 확인
pm2 list
curl http://localhost:3001/health
```

### 7. 프론트엔드 배포 (Vercel)

1. [vercel.com](https://vercel.com) → **Add New** → **Project** → 이 저장소 선택
2. **Root Directory**: `client`
3. **Framework**: Vite
4. **Environment Variables**:
   - `VITE_API_URL` = `http://YOUR_ORACLE_VM_IP:3001` (예: `http://123.45.67.89:3001`)
5. **Deploy**

### 8. 배포 후 확인

- **챗봇 UI**: Vercel URL로 접속
- **어드민**: `http://YOUR_VM_IP:3001/admin.html` → 지식 베이스 등록
- **Exact Match**: ✅
- **RAG (벡터 검색)**: ✅ (어드민에서 지식 베이스 항목 추가 후)
- **Ollama (일반 지식)**: ✅

### 9. 환경 변수 (선택)

```bash
# server/config.js에 반영됨
export OLLAMA_HOST=http://127.0.0.1:11434   # 기본값
export OLLAMA_MODEL=llama3:latest
export OLLAMA_TIMEOUT_MS=120000
```

---

## 방법 B: Exact Match만 (무료, AI 기능 없음)

RAG·Ollama 없이 **키워드 답변만** 필요할 때:

- **백엔드**: Railway 또는 Render
- **프론트**: Vercel
- **동작**: Exact Match만, RAG/Ollama는 없음

---

## 방법 C: 유료 VPS (AI 전체 동작)

Oracle Cloud Free Tier 대신 유료 VPS를 쓰는 경우:

- **DigitalOcean**: $4~6/월
- **Hetzner**: €4~5/월
- **AWS Lightsail**: $3.5~5/월

위 **방법 A (3~6단계)**와 동일하게 ChromaDB + Ollama + Node 배포하면 됩니다.

---

## 요약

| 방법 | 비용 | Exact Match | RAG | Ollama |
|------|------|-------------|-----|--------|
| **A. Oracle Cloud Free** | 무료 | ✅ | ✅ | ✅ |
| B. Railway/Render | 무료 | ✅ | ❌ | ❌ |
| C. 유료 VPS | 유료 | ✅ | ✅ | ✅ |

**산출물 제출 시** → **방법 A** 사용 권장.
