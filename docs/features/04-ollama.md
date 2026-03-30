# Ollama 연동

## 목적

로컬(또는 `OLLAMA_HOST`로 지정한) Ollama에서 **Llama 등 채팅 모델**을 호출해, (1) RAG용 답변 생성, (2) 사내 지식이 없을 때 **일반 지식** 안내, 두 가지 역할을 한다.

## 환경 변수 (`server/config.js`)

| 변수 | 설명 | 기본 |
|------|------|------|
| `OLLAMA_MODEL` | 사용 모델 이름 | `llama3:latest` |
| `OLLAMA_HOST` | Ollama API 베이스 URL | `http://127.0.0.1:11434` |
| `OLLAMA_TIMEOUT_MS` | 요청 타임아웃(ms) | `120000` |

## 서비스 함수 (`server/services/ollama.js`)

### `getAnswerFromOllama(contextText, question)`

- **용도**: Chroma에서 모은 `[사내 지식]` 블록과 `[질문]`을 프롬프트에 넣어, **등록된 지식만** 인용하도록 답하게 한다.  
- 참고 자료에 없는 내용은 “해당 정보는 등록되어 있지 않습니다…”로 답하라고 지시한다.  
- 내부적으로 `withTimeout`으로 `OLLAMA_TIMEOUT_MS` 이내 응답을 기다린다.

### `getGeneralKnowledgeReplyFromOllama(question)`

- **용도**: Chroma 검색 결과가 **0건**일 때, 일반 지식 범위에서 짧게 답하도록 요청한다.  
- 모르면 고정 안내 문구만 답하라고 제한한다.  
- 응답이 비면 `FALLBACK_NO_KNOWLEDGE`로 대체한다.

### 재export

- `FALLBACK_NO_KNOWLEDGE`, `GENERAL_KNOWLEDGE_DISCLAIMER` — 클라이언트에 `disclaimer` 등으로 전달되어 UI에 표시된다.

## 상태 확인 API

| 메서드 | 경로 | 설명 |
|--------|------|------|
| `GET` | `/api/ollama-status` | 모델 목록, 설정된 모델 설치 여부(`modelAvailable`), 호스트 등 |

쿼리 `?test=chat`을 붙이고 `modelAvailable`이 true일 때, 짧은 채팅 한 번으로 **실제 추론 가능 여부**를 확인한다(`chatTest` 필드).

## 실패 시 동작 (채팅과 연동)

- **RAG 단계**에서 Ollama 오류: 미답변에 질문 추가, **503** + “Ollama 서비스 확인” 안내.  
- **no_match(검색 0건)** 단계에서 Ollama 오류: 폴백 문구 + `ollamaFailed: true` 등으로 JSON 응답.

## 관련 파일

- `server/services/ollama.js`  
- `server/routes/ollama.js`  
- `server/routes/chat.js`  
