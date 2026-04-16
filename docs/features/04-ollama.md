# LLM 연동 (Ollama / Groq)

## 목적

생성 단계 **로컬 Ollama** 또는 **Groq**(OpenAI 호환 HTTP API) **택일**·(1) RAG 답변 생성 (2) 사내 지식 없을 때 **일반 지식** 안내.  
선택: `server/config.js` `USE_GROQ`(=`GROQ_API_KEY` 존재 여부) **결정**·실제 호출 [server/services/ollama.js](server/services/ollama.js) **단일 집결**.

## 환경 변수 (`server/config.js`)

| 변수 | 설명 | 기본 |
|------|------|------|
| `OLLAMA_MODEL` | Ollama 모델 이름 | `llama3:latest` |
| `OLLAMA_HOST` | Ollama API 베이스 URL | `http://127.0.0.1:11434` |
| `OLLAMA_TIMEOUT_MS` | 요청 타임아웃(ms) | `120000` |
| `GROQ_API_KEY` | 설정 시 Groq 경로 | (없음) |
| `GROQ_MODEL` | Groq 모델 | `llama-3.3-70b-versatile` |

Groq 사용 시 RAG·일반 지식 모두 **질문·프롬프트 텍스트 Groq 서버 전송**. 기밀 정책 **별도 검토**.

## 서비스 함수 (`server/services/ollama.js`)

### `getAnswerFromOllama(contextText, question)`

- **용도**: Chroma `[사내 지식]`·`[질문]` 프롬프트 삽입·**등록 지식만** 인용 답변 유도  
- 참고 자료 미포함 내용: 미등록 고정 안내 문구로 답변 **지시**  
- 내부 `withTimeout`·`OLLAMA_TIMEOUT_MS` 이내 응답 **대기**

### `getGeneralKnowledgeReplyFromOllama(question)`

- **용도**: Chroma 검색 **0건** 시 일반 지식 범위 짧은 답변 **요청**  
- 미지 시 고정 안내 문구만 답변 **제한**  
- 응답 공백 시 `FALLBACK_NO_KNOWLEDGE` **대체**

### 재export

- `FALLBACK_NO_KNOWLEDGE`, `GENERAL_KNOWLEDGE_DISCLAIMER` — 클라이언트 `disclaimer` 등으로 전달·UI **표시**

## 상태 확인 API (`GET /api/ollama-status`)

| 메서드 | 경로 | 설명 |
|--------|------|------|
| `GET` | `/api/ollama-status` | **provider**(`ollama` \| `groq`), 모델명, 연결 가능 여부 등 |

### Ollama 모드 (`USE_GROQ` false)

- `ollama.list()` 설치 모델 목록 `models`·설정 모델 일치 `modelAvailable`·`host` 등 **반환**  
- 쿼리 `?test=chat`·`modelAvailable` true 시 서비스 **`probeOllamaChat()`** 짧은 추론 1회·**`chatTest`** 결과 **포함**

### Groq 모드 (`USE_GROQ` true)

- `models` / `modelAvailable` 대신 `provider: "groq"`, `model`, 키 설정 안내 `message` 위주 JSON **반환**  
- `?test=chat` 시 **`probeGroqChat()`** 테스트 메시지·**`chatTest`** 성공·실패 **확인** (Groq HTTP 호출 `server/services/ollama.js` **단일 위치**)

## 실패 시 동작 (채팅 연동)

- **RAG 단계** LLM 오류: 미답변 질문 **추가**·**503**·“답변 생성 중 오류”·`GET /api/ollama-status` 확인 안내  
- **no_match(검색 0건)** LLM 오류: 폴백 문구·`ollamaFailed: true` 등 JSON (필드명 API 호환 **유지**)

## 관련 파일

- `server/services/ollama.js`  
- `server/routes/ollama.js`  
- `server/routes/chat.js`  
