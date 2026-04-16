# 채팅 API 및 답변 파이프라인

## 목적

사용자 질문 1건당 **처리 순서**·**응답 형식** **정리**.

## 엔드포인트

| 메서드 | 경로 | 설명 |
|--------|------|------|
| `POST` | `/api/chat` | 질문 전송·답변 JSON 수신 |

### 요청 본문

```json
{ "question": "사용자가 입력한 문자열" }
```

- `question` 없음 또는 비문자열 → **400**·에러 메시지 **반환**

### 처리 순서 (요약)

1. **Exact Match** (`server/services/knowledge.js`의 `findExactMatch`)  
   - `data/exact-match-knowledge.json` 등록 **키워드** 중 하나라도 질문(소문자·trim)에 **포함** 시 해당 항목 답·링크·첨부 **그대로 반환** 후 **종료**  
   - 응답 `type`: `"exact_match"`

2. **ChromaDB 의미 검색** (`server/services/chroma.js`의 `searchKnowledge`)  
   - 질문 텍스트로 컬렉션 조회·상위 `RAG_TOP_K`개(설정: `server/config.js`, 기본 5) 문서 **수집**

3. **검색 결과 0건**  
   - 미답변 로그에 질문 **기록** (`addUnanswered`)  
   - **일반 지식 LLM** 모드 (`getGeneralKnowledgeReplyFromOllama` — 내부 Ollama 또는 Groq)로 답변 **시도**  
     - 성공: `type: "no_match"`, `generalKnowledge: true`, `disclaimer`에 일반 지식 안내 문구 **포함**  
     - LLM 실패: 고정 안내 문(`FALLBACK_NO_KNOWLEDGE`)·`ollamaFailed: true` 등 (필드명 API 호환 위해 `ollama` 접두어 **유지**, Groq 사용 시에도 응답 필드 **동일 유지**)

4. **검색 결과 1건 이상 (RAG)**  
   - 문서들을 `[사내 지식]` 텍스트로 결합 후 LLM에 전달·답 **생성** (`getAnswerFromOllama`)  
   - 성공: `type: "rag"`, `sources`에 검색 문단·메타데이터, 첫 메타의 `refLink`·첨부 URL 등 **포함 가능**  
   - LLM 실패: 미답변 **추가**·**503**·“답변 생성 중 오류” 등 안내 **반환** (`GET /api/ollama-status`로 연결 상태 **확인 가능**)

## 응답 필드 (주요)

| 필드 | 의미 |
|------|------|
| `answer` | 사용자 표시용 본문 |
| `type` | `"exact_match"` \| `"rag"` \| `"no_match"` |
| `refLink`, `attachmentUrl`, `attachmentName` | 관련 링크·첨부 (존재 시) |
| `matchedKeyword` | Exact Match 시 매칭 키워드 |
| `sources` | RAG 시 검색 근거 문단 목록 |
| `generalKnowledge` | 사내 지식 없을 때 일반 지식 답변 여부 |
| `disclaimer` | 일반 지식 답변 시 하단 안내 |
| `ollamaFailed` | LLM 미연결·오류 등 폴백 (필드명 구현상 `ollama` **유지**) |

## 관련 소스 파일

- `server/routes/chat.js` — 위 순서 **구현** 라우트  
- `server/services/knowledge.js` — Exact Match  
- `server/services/chroma.js` — 검색  
- `server/services/ollama.js` — RAG·일반 지식 생성  
- `server/services/unanswered.js` — 미답변 기록  

## 클라이언트 연동

- React `useChat` 훅: `POST /api/chat` **호출**, 응답 메시지 상태 **반영** (`client/src/hooks/useChat.js`)
