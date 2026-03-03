# 배포 가이드 (배포만 할 때)

프론트는 **Vercel**, 백엔드는 **Railway** 또는 **Render** 무료 플랜으로 배포합니다.  
배포 환경에서는 ChromaDB·Ollama가 없으므로 **Exact Match(키워드 답변)만** 동작합니다.

---

## 1. 백엔드 배포 (Railway 추천)

### Railway

1. [railway.app](https://railway.app) 가입 (GitHub 연동)
2. **New Project** → **Deploy from GitHub repo** → 이 저장소 선택
3. **Root Directory**를 `server`로 설정 (또는 server 폴더만 배포하는 저장소 사용)
4. **Settings** → **Generate Domain** → 나온 URL 복사 (예: `https://2026-01-chatbot-production.up.railway.app`)
5. 환경 변수(필요 시): `PORT`는 Railway가 자동 주입

**참고:** server만 배포하려면 Railway에서 "Add service" 후 GitHub 연동 시 **서브폴더**를 `server`로 지정하거나, 루트에 `server/`만 두고 빌드/시작 스크립트를 `server` 기준으로 설정.

### Render (대안)

1. [render.com](https://render.com) 가입
2. **New** → **Web Service** → GitHub 저장소 연결
3. **Root Directory**: `server`
4. **Build Command**: `npm install`
5. **Start Command**: `npm start`
6. **Create Web Service** → 생성된 URL 복사

---

## 2. 프론트엔드 배포 (Vercel)

1. [vercel.com](https://vercel.com) 가입 (GitHub 연동)
2. **Add New** → **Project** → 이 저장소 선택
3. **Configure Project**:
   - **Root Directory**: `client` 로 변경 (또는 프로젝트 루트에서 client만 빌드하도록 설정)
   - **Framework Preset**: Vite
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
4. **Environment Variables** 추가:
   - 이름: `VITE_API_URL`
   - 값: 백엔드 URL (Railway/Render에서 복사한 주소, 예: `https://xxx.railway.app`)
5. **Deploy**

배포 후 Vercel이 준 URL(예: `https://2026-01-chatbot.vercel.app`)로 접속하면 챗봇 UI가 열리고, API는 설정한 백엔드로 요청됩니다.

---

## 3. 한 번에 정리

| 단계 | 할 일 |
|------|--------|
| 1 | Railway 또는 Render에서 **server** 배포 → 백엔드 URL 확보 |
| 2 | Vercel에서 **client** 배포, 환경 변수 `VITE_API_URL` = 백엔드 URL |
| 3 | Vercel URL로 접속해서 질문 (Exact Match만 동작) |

---

## 4. 배포 후 동작

- **Exact Match**: 등록된 키워드 질문(예: "건전지 어디 있어?") → ✅ 정상 답변
- **RAG / Ollama**: ChromaDB·Ollama가 배포 서버에 없으므로 → "해당 정보는 등록되어 있지 않습니다" 또는 500 가능

배포만 목표라면 위 구성으로 진행하면 됩니다.
