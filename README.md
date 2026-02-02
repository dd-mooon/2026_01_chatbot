# 코니 (Connie)

**Company Helper & AI Virtual Interactive Service**

신규 입사자의 빠른 적응을 돕는 사내 지식 가이드 챗봇

---

## 📋 프로젝트 소개

Connie는 사내 규정 및 복지 정보를 AI 챗봇으로 제공하여, 신규 입사자의 정보 탐색 시간을 단축하고 지원 부서의 반복 업무를 자동화하는 프로젝트입니다.

### 주요 특징

- ✅ **정확한 정보 전달**: 사내 공식 문서 기반 신뢰할 수 있는 답변 제공
- ✅ **RAG 기반 지능형 응답**: ChromaDB 벡터 검색 + Ollama LLM을 활용한 문맥 이해
- ✅ **데이터 보안**: 로컬 LLM(Ollama) 사용으로 사내 기밀 외부 유출 원천 차단
- ✅ **실시간 지식 업데이트**: 관리자가 어드민에서 즉시 지식을 보강 가능 (향후 구현 예정)

---

## 🛠 기술 스택

- **Backend**: Node.js (Express)
- **AI Engine**: Ollama (Local LLM - Llama 3)
- **Vector DB**: ChromaDB (로컬 지식 저장소)
- **Language**: JavaScript (ES Modules)

---

## 📦 설치 방법

### 1. 저장소 클론

```bash
git clone <repository-url>
cd 2026_01_chatbot
```

### 2. 의존성 설치

```bash
cd server
npm install
```

### 3. ChromaDB 서버 실행

ChromaDB 서버가 실행 중이어야 합니다. 설치되어 있지 않다면:

```bash
# ChromaDB 설치 (Python 필요)
pip install chromadb

# ChromaDB 서버 실행
chroma run
```

기본적으로 `http://localhost:8000`에서 실행됩니다.

### 4. Ollama 설치 및 모델 다운로드

```bash
# Ollama 설치 (macOS)
brew install ollama

# 또는 공식 사이트에서 설치: https://ollama.ai

# Llama 3 모델 다운로드
ollama pull llama3
```

---

## 🚀 실행 방법

### 서버 시작

```bash
cd server
npm run start
```

서버가 `http://localhost:3001`에서 실행됩니다.

### Chrome 새창으로 열기 (macOS)

```bash
npm run start:new
# 또는
npm run open:chrome
```

---

## 📡 API 엔드포인트

### `GET /health`

서버 상태 확인

**응답:**
```json
{
  "status": "ok",
  "message": "Connie server is running"
}
```

### `POST /api/chat`

챗봇 질문 및 답변

**요청:**
```json
{
  "question": "건전지 어디 있어요?"
}
```

**응답:**
```json
{
  "answer": "건전지는 탕비실 세 번째 서랍에 있습니다.",
  "sources": [
    {
      "text": "건전지는 탕비실 세 번째 서랍에 있습니다.",
      "metadata": {
        "source": "office_guide"
      }
    }
  ]
}
```

---

## 💾 지식 베이스 설정

### 초기 데이터 추가

`ingest.js`를 실행하여 ChromaDB에 사내 지식을 추가합니다:

```bash
cd server
node ingest.js
```

### 데이터 구조

ChromaDB의 `company_knowledge` 컬렉션에 다음 형식으로 저장됩니다:

- **documents**: 지식 텍스트 (예: "건전지는 탕비실 세 번째 서랍에 있습니다.")
- **metadatas**: 메타데이터 (예: `{ source: "office_guide" }`)
- **ids**: 고유 ID

---

## 🔧 환경 변수

다음 환경 변수를 설정할 수 있습니다:

- `PORT`: 서버 포트 (기본값: 3001)
- `OLLAMA_MODEL`: 사용할 Ollama 모델 (기본값: llama3)

**예시:**
```bash
PORT=3002 OLLAMA_MODEL=llama3.1 npm run start
```

---

## 📁 프로젝트 구조

```
2026_01_chatbot/
├── server/
│   ├── index.js              # Express 서버 및 API 엔드포인트
│   ├── ingest.js             # ChromaDB 지식 데이터 추가 스크립트
│   ├── package.json
│   ├── scripts/
│   │   └── start-new-window.sh  # Chrome 새창 열기 스크립트
│   └── .vscode/
│       └── tasks.json        # VS Code 작업 설정
├── .gitignore
└── README.md
```

---

## 🔄 동작 원리

1. **사용자 질문** → React 프론트엔드에서 백엔드로 전달
2. **지식 검색** → ChromaDB에서 질문과 유사한 사내 규정 문장 추출 (상위 5개)
3. **답변 생성** → Ollama가 추출된 문맥을 참고하여 최종 답변 생성
4. **응답 반환** → 답변과 참조 출처를 함께 반환

---

## 🗺 로드맵

- [x] 백엔드 API 서버 구축
- [x] ChromaDB 연동 및 지식 검색
- [x] Ollama 연동 및 RAG 답변 생성
- [ ] 프론트엔드 (React) 구현
- [ ] 어드민 지식 관리 페이지
- [ ] 키워드 Exact Match 기능
- [ ] 미답변 질문 로깅 및 피드백 루프

---
