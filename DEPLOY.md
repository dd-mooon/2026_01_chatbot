# 배포 가이드

이 저장소 **스터디 데모** 구성: **프론트 → Vercel**, **백엔드(API·어드민) → Render**, 생성 LLM → **Groq**(`GROQ_API_KEY`). 저장소: [github.com/dd-mooon/2026_01_chatbot](https://github.com/dd-mooon/2026_01_chatbot).

---

## 데모 URL ([README.md](./README.md) 2.1과 동일)

| 구분 | URL |
|------|-----|
| 챗봇 UI | [https://2026-01-chatbot.vercel.app/](https://2026-01-chatbot.vercel.app/) |
| 관리자 | [https://two026-01-chatbot-1.onrender.com/admin.html](https://two026-01-chatbot-1.onrender.com/admin.html) |

테스트 계정·권한: README **2.1 배포 데모 URL** 절.

---

## Render (백엔드)

1. GitHub 저장소 연결 → **Web Service** 생성.  
2. **Root Directory**: `server`.  
3. **Build**: `npm install` — **Start Command**: `npm start` (또는 `node index.js`).  
4. **환경 변수** (값은 [README.md](./README.md) **9. 환경 변수**·[server/config.js](server/config.js) 참고):  
   - `CHROMA_URL` 또는 `CHROMA_HOST` / `CHROMA_PORT` / `CHROMA_SSL` — RAG용 ChromaDB.  
   - `GROQ_API_KEY` — RAG·일반 지식 등 **Groq** 호출 (이 데모는 Render에서 Ollama 미사용).  
   - `ALLOWED_ORIGINS` — CORS에 **Vercel 프론트 URL** 포함 (예: `https://2026-01-chatbot.vercel.app`).  
   - `PORT` — Render가 주입하면 그 값 사용.  
5. 배포 URL 확인 후 `GET /health`·`GET /` 로 응답 확인.

---

## Vercel (프론트)

1. 동일 저장소 → **Project** → **Root Directory**: `client`.  
2. **Framework**: Vite.  
3. **Environment Variables**: `VITE_API_URL` = Render 백엔드 URL **끝 슬래시 없이** (예: `https://two026-01-chatbot-1.onrender.com`).  
4. 배포 후 챗봇·어드민 `/admin.html`까지 동작 확인.

---

## 이 데모에서의 동작 요약

- **Exact Match**: `exact-match-knowledge.json` 키워드 매칭.  
- **RAG**: ChromaDB 검색 + **Groq**로 답 문장 생성.  
- **미매칭·일반 지식**: **Groq** 호출 (면책 문구 등은 README·파이프라인 문서 참고).  

Render 무료 플랜 **슬립** 시 첫 요청 지연 가능.

---

## 스터디 제출·시드 데이터 (재배포 후에도 유지)

Render 기본 디스크는 **비영구**라서, 배포 후 어드민에서만 추가·수정한 지식이나 `server/uploads/`에 올린 파일은 **재시작·재배포 시 사라질 수 있습니다.**

**고정(시드)으로 두는 방법**은 Git에 넣는 것입니다.

| 경로 | 역할 |
|------|------|
| [server/data/exact-match-knowledge.json](server/data/exact-match-knowledge.json) | Exact Match·칩용 기본 지식 (저장소에 커밋됨) |
| [server/data/faq.json](server/data/faq.json) | FAQ 칩에 노출할 지식 `id` 목록 |
| [server/uploads/HR_Guidebook_demo.pdf](server/uploads/HR_Guidebook_demo.pdf) | 첨부 데모 PDF (커밋 시 배포본에서도 `/uploads/...`로 제공) |

내용을 바꾼 뒤 **반드시 커밋·푸시**하면, 다음 배포부터 동일 데이터가 다시 깔립니다. RAG(Chroma)에도 반영하려면 프로젝트에 있는 수집·동기화 절차(예: ingest 스크립트)를 한 번 실행해야 할 수 있습니다.
