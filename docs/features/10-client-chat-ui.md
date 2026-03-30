# React 채팅 클라이언트 UI

## 목적

Vite + React로 구현된 **사용자용 채팅 화면**의 구성과 데이터 흐름을 정리한다. 개발 서버는 보통 `5173`, API는 `3001`로 프록시된다.

## 구성 요약

| 경로 | 역할 |
|------|------|
| `client/src/App.jsx` | 레이아웃: 헤더, 메시지 스크롤 영역, 에러 배너, 입력창. `useChat` + `useFaq`. |
| `client/src/hooks/useChat.js` | 메시지 상태, `POST /api/chat`, 로딩·에러 처리. |
| `client/src/hooks/useFaq.js` | `GET /api/faq`로 FAQ 칩 문구 로드. |
| `client/src/components/ChatHeader.jsx` | 로고, 봇 이름, 서브타이틀. |
| `client/src/components/ChatMessage.jsx` | 사용자/봇 말풍선, 시간, 출처 라벨, 링크·첨부, 면책 문구. |
| `client/src/components/ChatInput.jsx` | 입력, 전송(아이콘), FAQ 칩 버튼. |
| `client/src/components/EmptyState.jsx` | 대화 없을 때 안내 + FAQ. |
| `client/src/components/LoadingSpinner.jsx` | 응답 대기 표시. |
| `client/src/BotAvatar.jsx` | 봇 아바타 SVG. |
| `client/src/utils/formatTime.js` | `formatMessageTime` — “방금 전”, 분 전, 시각 등 상대 표시. |
| `client/src/config/constants.js` | `API_BASE`(`VITE_API_URL`), 회사 사이트, 답변 출처 라벨(`ANSWER_SOURCE_LABEL`). |

## API 연동

- **기본 URL**: `import.meta.env.VITE_API_URL`이 비어 있으면 **동일 오리진**으로 요청(프록시 사용 시 빈 문자열이 일반적).  
- 사용자 메시지·봇 메시지에 `timestamp: Date.now()`를 넣어 시간 표시에 사용한다.

## 메시지 객체 (assistant 예)

`useChat`이 서버 응답을 다음 필드까지 메시지에 넣는다:  
`content`, `refLink`, `attachmentUrl`, `attachmentName`, `type`, `ollamaFailed`, `ollamaError`, `generalKnowledge`, `disclaimer`, `timestamp`.

`ChatMessage`는 `ANSWER_SOURCE_LABEL`로 `exact_match` / `rag` / `no_match`(일반 지식 포함)에 따른 설명 문구를 하단에 표시한다.

## 스타일

- Tailwind 유틸 클래스 기반.  
- Teams 느낌의 **보라 액센트(`#6264a7`)**, **회색 배경·테두리**, 둥근 말풍선 등은 컴포넌트 클래스에서 정의된다.

## 관련 백엔드 문서

- 전체 답변 흐름: [01-chat-pipeline.md](01-chat-pipeline.md)  
- FAQ 칩: [07-faq-chips.md](07-faq-chips.md)  
