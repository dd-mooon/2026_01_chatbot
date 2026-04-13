# LLM 연동 (Ollama / Groq)

## 목적

생성 단계에서 **로컬 Ollama** 또는 **Groq**(OpenAI 호환 HTTP API) 중 하나를 써서, (1) RAG용 답변 생성, (2) 사내 지식이 없을 때 **일반 지식** 안내를 수행한다.  
선택은 `server/config.js`의 `USE_GROQ`(=`GROQ_API_KEY` 존재 여부)로 결정되며, 실제 호출은 [server/services/ollama.js](server/services/ollama.js)에서 한곳으로 모은다.

## 환경 변수 (`server/config.js`)

| 변수 | 설명 | 기본 |
|------|------|------|
| `OLLAMA_MODEL` | Ollama 사용 시 모델 이름 | `llama3:latest` |
| `OLLAMA_HOST` | Ollama API 베이스 URL | `http://127.0.0.1:11434` |
| `OLLAMA_TIMEOUT_MS` | 요청 타임아웃(ms) | `120000` |
| `GROQ_API_KEY` | 설정되면 Groq 경로 사용 | (없음) |
| `GROQ_MODEL` | Groq 사용 시 모델 | `llama-3.3-70b-versatile` |

Groq 사용 시 RAG·일반 지식 모두 **질문과 프롬프트에 포함된 텍스트가 Groq 서버로 전송**된다. 기밀 정책에 맞게 사용할지 판단한다.

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

## 상태 확인 API (`GET /api/ollama-status`)

| 메서드 | 경로 | 설명 |
|--------|------|------|
| `GET` | `/api/ollama-status` | 현재 사용 중인 **provider**(`ollama` \| `groq`), 모델명, 연결 가능 여부 등 |

### Ollama 모드 (`USE_GROQ`가 false)

- `ollama.list()`로 설치된 모델 목록 `models`, 설정 모델과의 일치 여부 `modelAvailable`, `host` 등을 반환한다.  
- 쿼리 `?test=chat`이고 `modelAvailable`이 true이면, 짧은 채팅 한 번으로 **`chatTest`**에 추론 성공 여부를 담는다.

### Groq 모드 (`USE_GROQ`가 true)

- `models` / `modelAvailable` 대신 `provider: "groq"`, `model`, 키 설정 안내 `message` 위주의 JSON을 반환한다.  
- `?test=chat`이면 Groq `chat/completions`에 테스트 메시지를 보내 **`chatTest`**로 성공·실패를 확인한다.

## 실패 시 동작 (채팅과 연동)

- **RAG 단계**에서 LLM 오류: 미답변에 질문 추가, **503** + “답변 생성 중 오류” 및 `GET /api/ollama-status` 확인 안내.  
- **no_match(검색 0건)** 단계에서 LLM 오류: 폴백 문구 + `ollamaFailed: true` 등으로 JSON 응답(필드명은 API 호환 유지).

## 관련 파일

- `server/services/ollama.js`  
- `server/routes/ollama.js`  
- `server/routes/chat.js`  
