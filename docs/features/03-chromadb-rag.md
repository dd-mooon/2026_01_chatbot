# ChromaDB 및 RAG 검색

## 목적

질문을 **문장 그대로** 검색 키워드로 쓰지 않아도, **의미가 비슷한** 등록 지식 문장을 찾기 위해 벡터 DB(ChromaDB)를 사용한다.  
검색된 문장들은 LLM(Ollama 또는 Groq)에 **컨텍스트**로 넘겨 RAG 답변을 만든다.

## 설정 (`server/config.js`)

| 상수 | 의미 | 기본값 |
|------|------|--------|
| `COLLECTION_NAME` | 컬렉션 이름 | `company_knowledge` |
| `RAG_TOP_K` | 질문당 가져올 문서 개수 상한 | `5` |

연결 정보는 `server/config.js`에서 결정한다. 우선 **`CHROMA_URL`**(전체 URL), 없으면 **`CHROMA_HOST` / `CHROMA_PORT` / `CHROMA_SSL`**. **`CHROMA_API_TOKEN`**이 있으면 Chroma Cloud 등 토큰 인증에 사용한다. 로컬이면 기본적으로 `localhost:8000` 근처의 Chroma 서버에 붙는다.

## 서비스 API (`server/services/chroma.js`)

| 함수 | 역할 |
|------|------|
| `addToChromaDB(id, answer, refLink, ...)` | 지식 ID 기준으로 문서·메타데이터 추가 (`knowledge_${id}`) |
| `updateInChromaDB(...)` | 동일 ID로 문서·메타 갱신 |
| `deleteFromChromaDB(id)` | ID에 해당 벡터 삭제 |
| `searchKnowledge(question)` | `queryTexts: [question]`으로 유사 문서 검색, `{ text, metadata }[]` 반환 |

메타데이터에는 `refLink`, `attachmentUrl`, `attachmentName`, `source` 등이 포함될 수 있으며, RAG 성공 시 첫 번째 결과의 메타가 링크·첨부 표시에 쓰인다.

## 검색 실패 시

- Chroma 오류나 결과 없음 → 빈 배열.  
- 채팅 파이프라인은 [01-chat-pipeline.md](01-chat-pipeline.md)대로 미답변 로그 + 일반 지식 LLM 또는 폴백 문구로 분기한다.

## `ingest.js` (초기 데이터 적재)

- `server/ingest.js`는 예시로 컬렉션을 만들고 문장을 직접 `add`한다.  
- **운영 데이터**는 보통 `POST /api/knowledge`로 넣으면 JSON과 Chroma가 함께 갱신되므로, `ingest.js`는 최초 실험·마이그레이션용으로 보면 된다.

## Exact Match와의 관계

- Exact Match가 **먼저** 적용된다.  
- 매칭 실패 후에만 Chroma 검색이 실행된다.  
- 지식 항목은 API 추가 시 **답변 본문(`answer`)**이 벡터로 저장되므로, 키워드와 다른 표현으로 물어도 RAG가 동작할 수 있다.

## 관련 파일

- `server/services/chroma.js`  
- `server/routes/chat.js` — `searchKnowledge` 호출부  
- `server/routes/knowledge.js` — CRUD 시 Chroma 동기 호출  
