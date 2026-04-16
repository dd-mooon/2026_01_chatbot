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
