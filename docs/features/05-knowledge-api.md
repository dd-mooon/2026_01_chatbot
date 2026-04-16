# 지식 CRUD API

## 목적

Exact Match + RAG용 **지식 항목** HTTP **생성·조회·수정·삭제**.  
성공 시 **JSON 파일**(`exact-match-knowledge.json`)·**ChromaDB** **동시 반영**.

## 엔드포인트

| 메서드 | 경로 | 설명 |
|--------|------|------|
| `GET` | `/api/knowledge` | 전체 지식 목록 `{ knowledge: [...] }` |
| `POST` | `/api/knowledge` | 항목 추가 (201) |
| `PUT` | `/api/knowledge/:id` | 해당 `id` 수정 |
| `DELETE` | `/api/knowledge/:id` | 해당 `id` 삭제 (JSON + Chroma) |

## POST 본문

```json
{
  "keywords": ["키워드1", "키워드2"],
  "answer": "챗봇이 보여 줄 답변 본문",
  "refLink": "https://...",
  "attachmentUrl": "/uploads/...",
  "attachmentName": "원본파일명.pdf"
}
```

- **필수**: `keywords` 비어 있지 않은 배열·`answer` 문자열  
- `id`: 서버 `generateNewId()` **자동 부여**

## 처리 흐름

1. **POST**: 새 `id` 배열 push → 파일 저장 → `addToChromaDB`. Chroma 실패 시에도 JSON 저장·콘솔 경고 **유지**  
2. **PUT**: 본문 필드 병합 저장 → `updateInChromaDB`  
3. **DELETE**: 배열 제거 후 저장 → `deleteFromChromaDB`

## 관련 파일

- `server/routes/knowledge.js`  
- `server/services/knowledge.js` — 로드·저장·ID·`findExactMatch`  
- `server/services/chroma.js` — 벡터 동기화  

## 관리 UI

- 브라우저 관리자 화면: 배포 예 `https://two026-01-chatbot-1.onrender.com/admin.html`, 로컬 `http://<서버>:3001/admin.html` — [09-admin-panel.md](09-admin-panel.md) **참고**
