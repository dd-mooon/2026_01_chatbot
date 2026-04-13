# 채팅 API 및 답변 파이프라인

## 목적

사용자 질문 한 건에 대해 **어떤 순서로** 답을 고르고, 어떤 **응답 형식**으로 돌려주는지 정리한다.

## 엔드포인트

| 메서드 | 경로 | 설명 |
|--------|------|------|
| `POST` | `/api/chat` | 질문을 보내고 답변 JSON을 받는다. |

### 요청 본문

```json
{ "question": "사용자가 입력한 문자열" }
```

- `question`이 없거나 문자열이 아니면 **400**과 에러 메시지를 반환한다.

### 처리 순서 (요약)

1. **Exact Match** (`server/services/knowledge.js`의 `findExactMatch`)  
   - `data/exact-match-knowledge.json`에 등록된 **키워드** 중 하나라도 질문(소문자·trim)에 **포함**되면, 해당 항목의 답·링크·첨부를 그대로 반환하고 **종료**.  
   - 응답 `type`: `"exact_match"`.

2. **ChromaDB 의미 검색** (`server/services/chroma.js`의 `searchKnowledge`)  
   - 질문 텍스트로 컬렉션을 조회해 상위 `RAG_TOP_K`개(설정: `server/config.js`, 기본 5) 문서를 가져온다.

3. **검색 결과가 0건인 경우**  
   - 미답변 로그에 질문을 남긴다 (`addUnanswered`).  
   - **일반 지식 LLM** 모드 (`getGeneralKnowledgeReplyFromOllama` — 내부에서 Ollama 또는 Groq)로 답을 시도한다.  
     - 성공 시: `type: "no_match"`, `generalKnowledge: true`, `disclaimer`에 일반 지식 안내 문구 포함.  
     - LLM 실패 시: 고정 안내 문(`FALLBACK_NO_KNOWLEDGE`)과 `ollamaFailed: true` 등. (필드명은 API 호환을 위해 `ollama` 접두어를 유지하며, Groq 사용 시에도 동일하게 내려간다.)

4. **검색 결과가 1건 이상인 경우 (RAG)**  
   - 문서들을 하나의 `[사내 지식]` 텍스트로 이어 붙인 뒤 LLM에 넘겨 답을 생성한다 (`getAnswerFromOllama`).  
   - 성공 시: `type: "rag"`, `sources`에 검색된 문단·메타데이터, 첫 메타의 `refLink`·첨부 URL 등을 포함할 수 있다.  
   - LLM 실패 시: 미답변에 추가하고 **503**으로 “답변 생성 중 오류” 등 안내를 반환한다(`GET /api/ollama-status`로 연결 상태 확인 가능).

## 응답 필드 (주요)

| 필드 | 의미 |
|------|------|
| `answer` | 사용자에게 보여 줄 본문 |
| `type` | `"exact_match"` \| `"rag"` \| `"no_match"` |
| `refLink`, `attachmentUrl`, `attachmentName` | 관련 링크·첨부 (있을 때만) |
| `matchedKeyword` | Exact Match일 때 매칭된 키워드 |
| `sources` | RAG일 때 검색 근거 문단 목록 |
| `generalKnowledge` | 사내 지식 없을 때 일반 지식으로 답한 경우 |
| `disclaimer` | 일반 지식 답변 시 하단에 붙는 안내 |
| `ollamaFailed` | LLM 미연결·오류 등으로 폴백한 경우(필드명은 구현상 `ollama` 유지) |

## 관련 소스 파일

- `server/routes/chat.js` — 위 순서를 그대로 구현한 라우트  
- `server/services/knowledge.js` — Exact Match  
- `server/services/chroma.js` — 검색  
- `server/services/ollama.js` — RAG·일반 지식 생성  
- `server/services/unanswered.js` — 미답변 기록  

## 클라이언트 연동

- React `useChat` 훅이 `POST /api/chat`을 호출하고, 응답을 메시지 상태에 반영한다 (`client/src/hooks/useChat.js`).
