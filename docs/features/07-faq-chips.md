# FAQ 칩 (자주 묻는 질문)

## 목적

채팅 입력창 위 **짧은 질문 버튼** 표시·사용자 예시 질문 **원클릭 전송**.  
표시 문구: 지식 항목 **첫 키워드** 출처·최대 개수 서버 설정 **제한**.

## 설정

- `server/config.js`: `FAQ_MAX = 3`  
- 저장 파일: `server/data/faq.json` — 지식 항목 `id` 문자열 배열 (최대 `FAQ_MAX`개)

## 서버 로직 (`server/services/faq.js`)

1. `loadFaqIds()` — `faq.json` ID 배열 읽기·길이 `FAQ_MAX` **절단**  
2. `saveFaqIds(ids)` — 배열 파일 **저장**  
3. `getFaqChips()` — 각 ID `exact-match-knowledge` 항목 조회·**`keywords[0]`** 칩 라벨 **사용**  
   - 미존재 ID **제외**·잔여 ID만 `faq.json` **재저장**·**정리** 가능

## REST API

| 메서드 | 경로 | 설명 |
|--------|------|------|
| `GET` | `/api/faq` | `{ ids, chips, max }` — 선택 ID·칩 문자열·상한 |
| `PUT` | `/api/faq` | 본문 `{ "ids": ["1","2"] }` — FAQ 지식 ID 목록 (개수 초과 시 400) |

## 클라이언트

- `client/src/hooks/useFaq.js` — 마운트 시 `GET /api/faq`로 `chips` 수신·실패·빈 배열 시 기본 3문장 상수 **사용**  
- `ChatInput`, `EmptyState`에 `faqChips` 전달·버튼 **렌더**

## 관리자 UI

- `/admin.html` 지식 목록 항목별 **FAQ 체크박스** 선택 (최대 3개)  
- 상세 [09-admin-panel.md](09-admin-panel.md) **참고**

## 구현 참고

- 라우트 [server/routes/faq.js](server/routes/faq.js) 정의·[server/index.js](server/index.js) `app.use('/api/faq', faqRouter)` **마운트**  
- `PUT`만 `requireAdminAuth` 미들웨어 **적용**
