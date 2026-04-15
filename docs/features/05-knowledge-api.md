# 지식 CRUD API

## 목적

Exact Match + RAG에 쓰이는 **지식 항목**을 HTTP로 생성·조회·수정·삭제한다.  
성공 시 **JSON 파일**(`exact-match-knowledge.json`)과 **ChromaDB**를 함께 맞춘다.

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

- **필수**: `keywords`는 비어 있지 않은 배열, `answer`는 문자열.  
- `id`는 서버가 `generateNewId()`로 자동 부여한다.

## 처리 흐름

1. **POST**: 새 `id`로 배열에 push → 파일 저장 → `addToChromaDB`. Chroma 실패 시에도 JSON은 저장되며 콘솔에 경고만 남긴다.  
2. **PUT**: 본문에 온 필드로 병합해 저장 → `updateInChromaDB`.  
3. **DELETE**: 배열에서 제거 후 저장 → `deleteFromChromaDB`.

## 관련 파일

- `server/routes/knowledge.js`  
- `server/services/knowledge.js` — 로드·저장·ID·`findExactMatch`  
- `server/services/chroma.js` — 벡터 동기화  

## 관리 UI

- 브라우저에서 관리자 화면: 배포 예 `https://two026-01-chatbot-1.onrender.com/admin.html`, 로컬 `http://<서버>:3001/admin.html` — [09-admin-panel.md](09-admin-panel.md)
