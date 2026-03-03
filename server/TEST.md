# Connie API 테스트 가이드

서버(`npm start`)가 **실행 중인 상태**에서 아래 방법으로 테스트하세요.

---

## 1. 준비

### 서버 실행
```bash
cd server
npm start
```
`🚀 Connie server running at http://localhost:3001` 이 보이면 준비 완료.

### (RAG 답변 테스트 시) Ollama 실행
- Exact Match만 테스트하면 불필요.
- ChromaDB 검색 후 LLM 답변까지 보려면 로컬에서 [Ollama](https://ollama.com) 실행 후 `llama3` 모델 다운로드 필요.

---

## 2. 터미널에서 curl로 테스트

### 2-1. 루트 (GET /)
**의미:** 서버가 떠 있는지, 어떤 API가 있는지 확인.

```bash
curl http://localhost:3001/
```

**예상 응답:**
```json
{
  "name": "Connie",
  "message": "사내 지식 챗봇 API 서버",
  "endpoints": {
    "health": "GET /health",
    "chat": "POST /api/chat (body: { question: \"...\" })",
    "knowledge": "GET /api/knowledge (목록), POST/PUT/DELETE /api/knowledge (CRUD)"
  }
}
```

---

### 2-2. 헬스 체크 (GET /health)
**의미:** 서버 생존 확인.

```bash
curl http://localhost:3001/health
```

**예상 응답:**
```json
{"status":"ok","message":"Connie server is running"}
```

---

### 2-3. 챗봇 질문 – Exact Match (POST /api/chat)
**의미:** 키워드가 등록된 질문 → 저장된 답변 + 링크가 그대로 나와야 함.

```bash
curl -X POST http://localhost:3001/api/chat \
  -H "Content-Type: application/json" \
  -d '{"question":"건전지 어디 있어?"}'
```

**예상 응답 예시:**
```json
{
  "answer": "건전지는 탕비실 세 번째 서랍에 있습니다.",
  "refLink": "/guide/office-supplies",
  "type": "exact_match",
  "matchedKeyword": "건전지 어디",
  "sources": []
}
```

다른 Exact Match 예시:
```bash
curl -X POST http://localhost:3001/api/chat \
  -H "Content-Type: application/json" \
  -d '{"question":"입사자 회식 언제야?"}'
```

---

### 2-4. 챗봇 질문 – RAG (ChromaDB + Ollama)
**의미:** 등록된 키워드와 정확히 안 맞는 질문 → ChromaDB에서 비슷한 문서 검색 후 Ollama가 답변 생성.

```bash
curl -X POST http://localhost:3001/api/chat \
  -H "Content-Type: application/json" \
  -d '{"question":"탕비실에서 뭐 구할 수 있어?"}'
```

**예상:** `type: "rag"`, `answer`에 생성된 답변, `sources`에 검색된 문서들.

Ollama가 꺼져 있으면 500 에러가 날 수 있음.

---

### 2-5. 등록된 지식에 없는 질문
**의미:** 매칭되는 게 없을 때 안내 문구가 나오는지 확인.

```bash
curl -X POST http://localhost:3001/api/chat \
  -H "Content-Type: application/json" \
  -d '{"question":"연차는 며칠이야?"}'
```

**예상:**  
- ChromaDB에서도 못 찾으면: `type: "no_match"`, answer에 "해당 정보는 등록되어 있지 않습니다. 인사/총무에 문의해 주세요." 등.

---

### 2-6. 잘못된 요청 (에러 처리 확인)
**body 없음:**
```bash
curl -X POST http://localhost:3001/api/chat \
  -H "Content-Type: application/json" \
  -d '{}'
```

**예상:** `400`, `"question 필드(문자열)가 필요합니다."` 같은 메시지.

---

## 2-7. 어드민 — 지식 CRUD

### 지식 목록 (GET /api/knowledge)
```bash
curl -s http://localhost:3001/api/knowledge
```
**예상:** `{ "knowledge": [ { "id", "keywords", "answer", "refLink" }, ... ] }`

### 지식 추가 (POST /api/knowledge)
```bash
curl -s -X POST http://localhost:3001/api/knowledge \
  -H "Content-Type: application/json" \
  -d '{"keywords":["연차","연차일수"],"answer":"1년차 연차 15일, 2년차부터 1년에 1일 추가됩니다.","refLink":"/guide/leave"}'
```
**예상:** `201`, `message: "지식이 추가되었습니다."`, `item`에 추가된 항목.

### 지식 수정 (PUT /api/knowledge/:id)
```bash
# 위에서 추가한 항목 id가 3이면
curl -s -X PUT http://localhost:3001/api/knowledge/3 \
  -H "Content-Type: application/json" \
  -d '{"answer":"1년차 연차 15일입니다. 2년차부터 매년 1일씩 추가됩니다."}'
```
**예상:** `message: "지식이 수정되었습니다."`, `item`에 수정된 항목.

### 지식 삭제 (DELETE /api/knowledge/:id)
```bash
curl -s -X DELETE http://localhost:3001/api/knowledge/3
```
**예상:** `message: "지식이 삭제되었습니다."`, `item`에 삭제된 항목.

---

## 2-8. 미답변 질문 (피드백 루프)

등록된 지식이 없거나 Ollama 오류로 답을 주지 못한 질문이 자동으로 미답변 목록에 쌓입니다.

### 미답변 목록 (GET /api/unanswered)
```bash
curl -s http://localhost:3001/api/unanswered
```
**예상:** `{ "unanswered": [ { "id", "question", "createdAt" }, ... ] }`

### 미답변 항목 제거 (DELETE /api/unanswered/:id)
답변을 지식으로 등록한 뒤 목록에서 제거할 때 사용.
```bash
curl -s -X DELETE http://localhost:3001/api/unanswered/1730123456789
```
**예상:** `message: "미답변 목록에서 제거되었습니다."`, `item`에 제거된 항목.

---

## 3. 한 번에 여러 개 테스트 (쉘 스크립트)

`server` 폴더에서:

```bash
# 루트
curl -s http://localhost:3001/ | head -5

# 헬스
curl -s http://localhost:3001/health

# Exact Match 2개
curl -s -X POST http://localhost:3001/api/chat -H "Content-Type: application/json" -d '{"question":"건전지 어디?"}'
curl -s -X POST http://localhost:3001/api/chat -H "Content-Type: application/json" -d '{"question":"회식 언제야?"}'
```

---

## 4. 브라우저에서 테스트

- **GET만 가능:** 주소창에 `http://localhost:3001/` 또는 `http://localhost:3001/health` 입력 → JSON 확인.
- **POST는 불가:** 주소창은 GET만 되므로, POST `/api/chat` 는 아래 중 하나로 테스트.
  - 터미널 `curl` (위 명령어)
  - 브라우저 개발자 도구(F12) → Console에서:
    ```javascript
    fetch('http://localhost:3001/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ question: '건전지 어디 있어?' })
    }).then(r => r.json()).then(console.log);
    ```
  - Postman, Insomnia 등에서 POST `http://localhost:3001/api/chat`, body JSON `{"question":"..."}` 로 요청.

---

## 5. 체크리스트

| 테스트 항목              | 명령/방법                    | 통과 기준                          |
|--------------------------|-----------------------------|------------------------------------|
| 서버 정보                 | `curl http://localhost:3001/` | JSON에 name, endpoints 포함        |
| 헬스                      | `curl http://localhost:3001/health` | status ok                          |
| Exact Match 답변          | POST question "건전지 어디?" | type exact_match, refLink 있음      |
| RAG 답변 (Ollama 필요)    | POST 다른 질문               | type rag, answer·sources 있음       |
| 미등록 질문               | POST 전혀 다른 주제         | no_match 또는 안내 문구             |
| 잘못된 요청               | POST body `{}`               | 400 + question 필드 필요 메시지    |
| 지식 목록                 | GET /api/knowledge           | knowledge 배열 반환                 |
| 지식 추가                 | POST /api/knowledge (keywords, answer, refLink) | 201 + item 반환     |
| 지식 수정/삭제             | PUT/DELETE /api/knowledge/:id | 200 + message·item                 |
| 미답변 목록                | GET /api/unanswered           | unanswered 배열 반환               |
| 미답변 제거                | DELETE /api/unanswered/:id    | 200 + message·item                 |

이 순서대로 하면 Connie API를 자세히 테스트할 수 있습니다.
