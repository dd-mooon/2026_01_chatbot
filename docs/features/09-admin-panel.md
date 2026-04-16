# 관리자 페이지 (`/admin.html`)

## 목적

별도 빌드 없이 **Express 정적 파일** 단일 HTML에서 지식 베이스·미답변·FAQ·첨부 업로드 **관리**.

## 로그인

- 최초 접속 **로그인 / 회원가입** 화면 (`@concentrix.com` 고정)  
- 상세 [11-admin-auth.md](11-admin-auth.md) **참고**

## 접속

- **배포(과제 데모)**: [https://two026-01-chatbot-1.onrender.com/admin.html](https://two026-01-chatbot-1.onrender.com/admin.html)  
- **로컬**: 서버 기동 후 `http://localhost:3001/admin.html` (포트 `PORT` 환경 변수)  
- 헤더 **챗봇 열기**: 배포 챗봇 [https://2026-01-chatbot.vercel.app/](https://2026-01-chatbot.vercel.app/) **연결**  
- 루트 `GET /` JSON `admin` 안내 **포함**

## 주요 섹션

### 1. 지식 추가 / 수정

- **키워드**: 쉼표 구분 다중 입력 (내부 배열 저장)  
- **답변 본문**·**참고 링크**  
- **첨부**: 파일 선택 → **업로드** → `POST /api/upload`·성공 시 숨은 필드 URL·파일명·칩 UI  
- **추가** / 편집 **저장**·**취소**  
- 미답변 목록 “답 등록” 진입 시 `pendingUnansweredId` 등 **연계 가능**

### 2. 지식 베이스

- **목록**: `GET /api/knowledge`  
- 각 행: 답 미리보기·메타·**FAQ 체크박스**(최대 3개)·**수정**·**삭제**  
- FAQ 선택: `PUT /api/faq` ID 배열 저장 **연동**

### 3. 미답변 질문

- **목록**: `GET /api/unanswered`  
- **선택 삭제** / **전체 지우기**: `DELETE /api/unanswered/bulk`  
- **답 등록**: 질문 지식 추가 폼 **채움**  
- **제거**: 개별 `DELETE /api/unanswered/:id`

## 헤더·상태

- 서버 헬스 등 연결 상태 표시 영역  
- 채팅 클라이언트 링크 안내

## 관련 API 문서

- 인증: [11-admin-auth.md](11-admin-auth.md)  
- 지식: [05-knowledge-api.md](05-knowledge-api.md)  
- 미답변: [06-unanswered.md](06-unanswered.md)  
- FAQ: [07-faq-chips.md](07-faq-chips.md)  
- 업로드: [08-file-upload.md](08-file-upload.md)  

## 소스 위치

- `server/public/admin.html` — 마크업 + 인라인 스크립트 API 호출  
