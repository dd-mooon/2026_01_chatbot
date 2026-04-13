# FAQ 칩 (자주 묻는 질문)

## 목적

채팅 입력창 위에 **짧은 질문 버튼**을 표시해, 사용자가 한 번에 예시 질문을 보낼 수 있게 한다.  
표시 문구는 지식 항목의 **첫 번째 키워드**에서 가져오며, **최대 개수는 서버 설정**으로 제한된다.

## 설정

- `server/config.js`: `FAQ_MAX = 3`  
- 저장 파일: `server/data/faq.json` — **지식 항목 `id` 문자열 배열** (최대 `FAQ_MAX`개)

## 서버 로직 (`server/services/faq.js`)

1. `loadFaqIds()` — `faq.json`에서 ID 배열을 읽고, 길이를 `FAQ_MAX`로 자른다.  
2. `saveFaqIds(ids)` — 배열을 파일에 저장한다.  
3. `getFaqChips()` — 각 ID에 대해 `exact-match-knowledge`에서 항목을 찾고, **`keywords[0]`**을 칩 라벨로 쓴다.  
   - 존재하지 않는 ID는 제외하고, 남은 ID만으로 `faq.json`을 다시 저장해 **정리**할 수 있다.

## REST API

| 메서드 | 경로 | 설명 |
|--------|------|------|
| `GET` | `/api/faq` | `{ ids, chips, max }` — 선택된 ID, 칩에 쓸 문자열 목록, 상한 |
| `PUT` | `/api/faq` | 본문 `{ "ids": ["1","2"] }` — FAQ로 쓸 지식 ID 목록 (개수 초과 시 400) |

## 클라이언트

- `client/src/hooks/useFaq.js` — 마운트 시 `GET /api/faq`로 `chips`를 받고, 실패·빈 배열이면 기본 3문장 상수를 쓴다.  
- `ChatInput`, `EmptyState`에 `faqChips`로 전달되어 버튼으로 렌더된다.

## 관리자 UI

- `/admin.html`의 지식 목록에서 항목별 **FAQ 체크박스**로 선택한다 (최대 3개).  
- 자세한 동작은 [09-admin-panel.md](09-admin-panel.md).

## 구현 참고

- 라우트는 [server/routes/faq.js](server/routes/faq.js)에 정의되고, [server/index.js](server/index.js)에서 `app.use('/api/faq', faqRouter)`로 마운트된다.  
- `PUT`만 `requireAdminAuth` 미들웨어가 적용된다.
