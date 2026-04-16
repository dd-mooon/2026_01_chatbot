# ChromaDB 및 RAG 검색

## 목적

질문을 문장 그대로 키워드로 쓰지 않아도 **의미 유사** 등록 지식 문단 **검색**·벡터 DB(ChromaDB) **사용**.  
검색 문장 LLM(Ollama 또는 Groq) **컨텍스트** 전달·RAG 답변 **생성**.

## 설정 (`server/config.js`)

| 상수 | 의미 | 기본값 |
|------|------|--------|
| `COLLECTION_NAME` | 컬렉션 이름 | `company_knowledge` |
| `RAG_TOP_K` | 질문당 문서 개수 상한 | `5` |

연결: `server/config.js` **결정**. 우선 **`CHROMA_URL`**(전체 URL), 없으면 **`CHROMA_HOST` / `CHROMA_PORT` / `CHROMA_SSL`**. **`CHROMA_API_TOKEN`** 존재 시 Chroma Cloud 등 토큰 인증 **사용**. 로컬 기본 `localhost:8000` 근처 Chroma 서버 **접속**.

## 서비스 API (`server/services/chroma.js`)

| 함수 | 역할 |
|------|------|
| `addToChromaDB(id, answer, refLink, ...)` | 지식 ID 기준 문서·메타데이터 추가 (`knowledge_${id}`) |
| `updateInChromaDB(...)` | 동일 ID 문서·메타 **갱신** |
| `deleteFromChromaDB(id)` | ID 해당 벡터 **삭제** |
| `searchKnowledge(question)` | `queryTexts: [question]` 유사 문서 검색·`{ text, metadata }[]` **반환** |

메타데이터: `refLink`, `attachmentUrl`, `attachmentName`, `source` 등 **포함 가능**. RAG 성공 시 첫 결과 메타 링크·첨부 표시 **사용**.

## 검색 실패 시

- Chroma 오류·결과 없음 → 빈 배열  
- 채팅 파이프라인: [01-chat-pipeline.md](01-chat-pipeline.md) 기준 미답변 로그·일반 지식 LLM·폴백 문구 **분기**

## `ingest.js` (초기 데이터 적재)

- `server/ingest.js`: 예시 컬렉션 생성·문장 직접 `add`  
- **운영 데이터**: 통상 `POST /api/knowledge`로 JSON·Chroma **동시 갱신**·`ingest.js`는 최초 실험·마이그레이션 용도로 **간주**

## Exact Match와의 관계

- Exact Match **선적용**  
- 매칭 실패 후 Chroma 검색 **실행**  
- API 추가 지식: **답변 본문(`answer`)** 벡터 저장·키워드와 다른 표현 질의에도 RAG **동작 가능**

## 관련 파일

- `server/services/chroma.js`  
- `server/routes/chat.js` — `searchKnowledge` **호출부**  
- `server/routes/knowledge.js` — CRUD 시 Chroma **동기 호출**  
