# 미답변 질문 로그

## 목적

ChromaDB에서 **관련 지식을 찾지 못한** 질문을 기록해, 나중에 지식으로 등록하거나 분석할 수 있게 한다.  
또한 RAG 단계에서 **Ollama가 실패**한 경우에도 질문이 미답변에 남을 수 있다(채팅 라우트 로직 참고).

## 저장 형식

- 파일: `server/data/unanswered.json`  
- 항목 예: `{ "id": "타임스탬프 문자열", "question": "...", "createdAt": "ISO 날짜" }`

## 기록 시점 (`addUnanswered`)

구현: `server/services/unanswered.js`.

- 동일 `question` 문자열이 이미 있으면 **중복 추가하지 않는다**.  
- 질문은 `trim` 후 저장한다.

채팅 파이프라인에서 호출되는 경우:

- Chroma 검색 결과가 **0건**일 때 — **일반 지식 Ollama가 성공해도** 먼저 미답변에 남긴다(사내 지식 미매칭 기록용).  
- RAG 경로에서 **Ollama 오류** 시(503 분기).

## REST API

| 메서드 | 경로 | 설명 |
|--------|------|------|
| `GET` | `/api/unanswered` | `{ unanswered: [...] }` 전체 목록 |
| `DELETE` | `/api/unanswered/:id` | 한 건 제거 |
| `DELETE` | `/api/unanswered/bulk` | 본문 `{ "ids": ["id1","id2"] }`로 선택 삭제, 또는 `ids` 없으면 **전체 삭제** |

## 관련 파일

- `server/routes/unanswered.js`  
- `server/services/unanswered.js`  
- `server/routes/chat.js` — `addUnanswered` 호출부  
