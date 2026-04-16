# React 채팅 클라이언트 UI

## 목적

Vite + React **사용자 채팅 화면** 구성·데이터 흐름 **정리**. 개발 서버 통상 `5173`·API `3001` 프록시 **설정**.

## 구성 요약

| 경로 | 역할 |
|------|------|
| `client/src/App.jsx` | 레이아웃: 헤더, 메시지 스크롤, 에러 배너, 입력. `useChat` + `useFaq` |
| `client/src/hooks/useChat.js` | 메시지 상태, `POST /api/chat`, 로딩·에러 처리 |
| `client/src/hooks/useFaq.js` | `GET /api/faq` FAQ 칩 문구 로드 |
| `client/src/components/ChatHeader.jsx` | 로고, 봇 이름, 서브타이틀 |
| `client/src/components/ChatMessage.jsx` | 사용자/봇 말풍선, 시간, 출처 라벨, 링크·첨부, 면책 문구 |
| `client/src/components/ChatInput.jsx` | 입력, 전송(아이콘), FAQ 칩 버튼 |
| `client/src/components/EmptyState.jsx` | 대화 없을 때 안내 + FAQ |
| `client/src/components/LoadingSpinner.jsx` | 응답 대기 표시 |
| `client/src/BotAvatar.jsx` | 봇 아바타 SVG |
| `client/src/utils/formatTime.js` | `formatMetaTime` — 말풍선 시각 ([ChatMessage.jsx](client/src/components/ChatMessage.jsx)) |
| `client/src/config/constants.js` | `API_BASE`(`VITE_API_URL`), 회사 사이트, `ANSWER_SOURCE_LABEL` |

## API 연동

- **기본 URL**: `import.meta.env.VITE_API_URL` 공백 시 **동일 오리진** 요청 (프록시 시 빈 문자열 일반적)  
- 사용자·봇 메시지 `timestamp: Date.now()` 시간 표시 **사용**

## 메시지 객체 (assistant 예)

`useChat` 서버 응답 필드 메시지 **매핑**:  
`content`, `refLink`, `attachmentUrl`, `attachmentName`, `type`, `ollamaFailed`, `ollamaError`, `generalKnowledge`, `disclaimer`, `timestamp`.

`ChatMessage`: `ANSWER_SOURCE_LABEL`로 `exact_match` / `rag` / `no_match`(일반 지식 포함) 설명 문구 하단 **표시**.  
RAG **`sources`**: `useChat` 어시스턴트 메시지 전달·`ChatMessage`에서 **`type === 'rag'`** 시 `<details>` **「참고한 사내 문단 (N개)」** 접이식 (문단 본문·`metadata.source` 등).

## 스타일

- Tailwind 유틸 기반  
- **틸 액센트(`#006666`)**, 흰 헤더·슬레이트 배경·테두리·둥근 말풍선 등 컴포넌트 클래스 **정의** ([ChatHeader.jsx](client/src/components/ChatHeader.jsx) 등)

## 관련 백엔드 문서

- 전체 답변 흐름: [01-chat-pipeline.md](01-chat-pipeline.md)  
- FAQ 칩: [07-faq-chips.md](07-faq-chips.md)  
