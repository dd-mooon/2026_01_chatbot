# Connie API 테스트 가이드

서버(`npm start`) **실행 중** 전제·아래 **테스트** 방법.

---

## 1. 준비

### 서버 실행
```bash
cd server
npm start
```
`🚀 Connie server running at http://localhost:3001` 출력 시 준비 **완료** 상태.

### (RAG 답변 테스트 시) Ollama 실행
- Exact Match만 테스트 시 **생략 가능**
- ChromaDB 검색 후 LLM 답변까지: 로컬 [Ollama](https://ollama.com) 실행·`llama3` 모델 **필요**

---

## 2. 터미널에서 curl로 테스트

### 2-1. 루트 (GET /)
**의미:** 서버 기동·API 목록 **확인**

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
**의미:** 서버 생존 **확인**

```bash
curl http://localhost:3001/health
```

**예상 응답:**
```json
{"status":"ok","message":"Connie server is running"}
```

---

### 2-3. 챗봇 질문 – Exact Match (POST /api/chat)
**의미:** 키워드 등록 질문 → 저장 답변·링크 **그대로 반환** 기대

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
**의미:** 키워드 비일치 질문 → ChromaDB 유사 문서 검색 후 Ollama 답변 **생성** 기대

```bash
curl -X POST http://localhost:3001/api/chat \
  -H "Content-Type: application/json" \
  -d '{"question":"탕비실에서 뭐 구할 수 있어?"}'
```

**예상:** `type: "rag"`, `answer` 생성 답변, `sources` 검색 문서.

Ollama 미기동 시 500 에러 **발생 가능**

---

### 2-5. 등록된 지식에 없는 질문
**의미:** 매칭 없을 때 안내 문구 **반환** 여부 **확인**

```bash
curl -X POST http://localhost:3001/api/chat \
  -H "Content-Type: application/json" \
  -d '{"question":"연차는 며칠이야?"}'
```

**예상:**  
- ChromaDB 미검색 시: `type: "no_match"`, answer에 미등록 안내·폴백 문구(`FALLBACK_NO_KNOWLEDGE` 등) **포함** 기대

---

### 2-6. 잘못된 요청 (에러 처리 확인)
**body 없음:**
```bash
curl -X POST http://localhost:3001/api/chat \
  -H "Content-Type: application/json" \
  -d '{}'
```

**예상:** `400`·`question` 문자열 필드 필요 에러 메시지 **반환**

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
**예상:** `201`·지식 추가 완료 `message`·`item` 추가 항목 **반환**

### 지식 수정 (PUT /api/knowledge/:id)
```bash
# 위에서 추가한 항목 id가 3이면
curl -s -X PUT http://localhost:3001/api/knowledge/3 \
  -H "Content-Type: application/json" \
  -d '{"answer":"1년차 연차 15일입니다. 2년차부터 매년 1일씩 추가됩니다."}'
```
**예상:** 지식 수정 완료 `message`·`item` 수정 항목 **반환**

### 지식 삭제 (DELETE /api/knowledge/:id)
```bash
curl -s -X DELETE http://localhost:3001/api/knowledge/3
```
**예상:** 지식 삭제 완료 `message`·`item` 삭제 항목 **반환**

---

## 2-8. 미답변 질문 (피드백 루프)

등록 지식 없음 또는 Ollama 오류 시 질문 **자동** 미답변 목록 **적재**.

### 미답변 목록 (GET /api/unanswered)
```bash
curl -s http://localhost:3001/api/unanswered
```
**예상:** `{ "unanswered": [ { "id", "question", "createdAt" }, ... ] }`

### 미답변 항목 제거 (DELETE /api/unanswered/:id)
답변 지식 등록 후 목록 **제거** 시 **사용**
```bash
curl -s -X DELETE http://localhost:3001/api/unanswered/1730123456789
```
**예상:** 미답변 제거 완료 `message`·`item` 제거 항목 **반환**

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

- **GET만:** 주소창 `http://localhost:3001/` 또는 `http://localhost:3001/health` — JSON **확인**
- **POST 불가:** 주소창 GET만·POST `/api/chat` 는 아래 **택일**
  - 터미널 `curl` (위 명령)
  - 브라우저 개발자 도구(F12) → Console:
    ```javascript
    fetch('http://localhost:3001/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ question: '건전지 어디 있어?' })
    }).then(r => r.json()).then(console.log);
    ```
  - Postman, Insomnia 등 POST `http://localhost:3001/api/chat`, body JSON `{"question":"..."}`

---

## 5. 체크리스트

| 테스트 항목              | 명령/방법                    | 통과 기준                          |
|--------------------------|-----------------------------|------------------------------------|
| 서버 정보                 | `curl http://localhost:3001/` | JSON name, endpoints **포함**        |
| 헬스                      | `curl http://localhost:3001/health` | status ok                          |
| Exact Match 답변          | POST question "건전지 어디?" | type exact_match, refLink **존재**      |
| RAG 답변 (Ollama 필요)    | POST 다른 질문               | type rag, answer·sources **존재**       |
| 미등록 질문               | POST 전혀 다른 주제         | no_match 또는 안내 문구             |
| 잘못된 요청               | POST body `{}`               | 400 + question 필드 필요 메시지    |
| 지식 목록                 | GET /api/knowledge           | knowledge 배열 **반환**                 |
| 지식 추가                 | POST /api/knowledge (keywords, answer, refLink) | 201 + item **반환**     |
| 지식 수정/삭제             | PUT/DELETE /api/knowledge/:id | 200 + message·item                 |
| 미답변 목록                | GET /api/unanswered           | unanswered 배열 **반환**               |
| 미답변 제거                | DELETE /api/unanswered/:id    | 200 + message·item                 |

위 순서 **준수** 시 Connie API 상세 테스트 **가능**.
