# 미답변 질문 로그

## 목적

ChromaDB **관련 지식 미검색** 질문 **기록**·추후 지식 등록·분석 **용도**.  
RAG 단계 **LLM(Ollama/Groq) 실패** 시에도 질문 미답변 **잔존 가능** (채팅 라우트 로직 **참고**).

## 저장 형식

- 파일: `server/data/unanswered.json`  
- 항목 예: `{ "id": "타임스탬프 문자열", "question": "...", "createdAt": "ISO 날짜" }`

## 기록 시점 (`addUnanswered`)

구현: `server/services/unanswered.js`.

- 동일 `question` 문자열 기존 존재 시 중복 추가 **생략**  
- 질문 `trim` 후 저장

채팅 파이프라인 **호출** 경우:

- Chroma 검색 **0건** — 일반 지식 LLM 성공 **이전에도** 미답변 **기록** (사내 지식 미매칭 로그 용도)  
- RAG 경로 **LLM 오류** (503 분기)

## REST API

| 메서드 | 경로 | 설명 |
|--------|------|------|
| `GET` | `/api/unanswered` | `{ unanswered: [...] }` 전체 목록 |
| `DELETE` | `/api/unanswered/:id` | 한 건 제거 |
| `DELETE` | `/api/unanswered/bulk` | 본문 `{ "ids": ["id1","id2"] }` 선택 삭제·`ids` 없으면 **전체 삭제** |

## 관련 파일

- `server/routes/unanswered.js`  
- `server/services/unanswered.js`  
- `server/routes/chat.js` — `addUnanswered` **호출부**  
