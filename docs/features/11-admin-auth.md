# 관리자 로그인·회원가입

## 목적

`/admin.html` 및 **지식·업로드·미답변·FAQ 수정** API **로그인 사내 계정만** 사용.  
비밀번호 서버 **scrypt** 해시·`admin-users.json` **저장**.

## 이메일 정책

- 허용 도메인: **`@concentrix.com`** 만 (`server/config.js` `ADMIN_EMAIL_DOMAIN`)
- 로컬 파트(골뱅이 앞): 영문·숫자·`._+-`, 길이 1~64자
- 관리자 화면: **아이디만** 입력·UI `@concentrix.com` 고정 표시

## 역할·상태 (`admin-users.json` 사용자 객체)

| 필드 | 값 | 설명 |
|------|-----|------|
| `role` | `superadmin` \| `admin` | 최고 관리자: 가입 **승인/거절** (어드민 「가입 승인」) |
| `status` | `active` \| `pending` | `pending` **로그인 불가**·승인 시 `active` |

- **첫 가입**(`users` 비어 있음): 해당 계정 **`superadmin` + `active`** 생성·즉시 로그인 **가능**
- **이후 가입**: **`admin` + `pending`**·세션 없음·「승인 대기」 안내. 최고 관리자 승인 후 `active`·로그인 **가능**

## 레거시 데이터

`role` / `status` 없는 기존 사용자: 서버 기동 후 **가입일 최소 계정** `superadmin`·`active`·나머지 `admin`·`active` 자동 보정·파일 **저장**

## 인증 API

| 메서드 | 경로 | 인증 | 설명 |
|--------|------|------|------|
| `POST` | `/api/auth/register` | 불필요 | 첫 계정: 가입+세션. 이후: `pending` 요청만 (세션 없음) |
| `POST` | `/api/auth/login` | 불필요 | `pending` → 403 |
| `POST` | `/api/auth/logout` | (있으면 무효화) | 세션 삭제·쿠키 제거 |
| `GET` | `/api/auth/me` | 쿠키 | `{ user: { email, role, status } }` 또는 401 |
| `GET` | `/api/auth/pending-registrations` | 쿠키 + **superadmin** | `{ pending: [{ id, email, createdAt }] }` |
| `POST` | `/api/auth/approve-registration` | 쿠키 + superadmin | 본문 `{ "userId": "..." }` |
| `POST` | `/api/auth/reject-registration` | 쿠키 + superadmin | 본문 `{ "userId": "..." }` — 대기 계정 삭제 |

요청 본문 예: `{ "email": "user@concentrix.com", "password": "..." }`

## 세션

- 쿠키명: **`connie_admin`** (httpOnly, `Path=/`, `SameSite=lax`, 프로덕션 `Secure` 권장)
- 세션 데이터 **프로세스 메모리** 보관·**서버 재시작 시 전원 로그아웃**

## 보호 API (로그인 필요)

미들웨어: `server/middleware/requireAdminAuth.js` — 유효 세션 없으면 **401**.  
`active` 관리자·최고 관리자 공통 지식/업로드 등 어드민 API **사용 가능**.

| 영역 | 경로 |
|------|------|
| 지식 | `GET/POST/PUT/DELETE /api/knowledge` … |
| 업로드 | `POST /api/upload` |
| 미답변 | `GET /api/unanswered`, `DELETE /api/unanswered/:id`, `DELETE /api/unanswered/bulk` |
| FAQ 수정 | `PUT /api/faq` |

**공개 API** (채팅 클라이언트·봇):

- `POST /api/chat`, `GET /api/ollama-status`, **`GET /api/faq`** (칩 목록)

## CORS

- `credentials: true` + 허용 `origin` 목록·쿠키 전달 **가능** (`server/config.js` `CORS_ALLOWED_ORIGINS`)

## 관련 파일

| 파일 | 역할 |
|------|------|
| `server/routes/auth.js` | register / login / logout / me / 승인 API |
| `server/services/adminUsers.js` | 사용자, 역할, 승인·거절, 레거시 마이그레이션 |
| `server/services/adminSessions.js` | 세션 토큰 발급·검증 |
| `server/middleware/requireAdminAuth.js` | `requireAdminAuth` (승인 API는 `auth.js`에서 superadmin 검증) |
| `server/data/admin-users.json` | 계정 저장소 |
| `server/public/admin.html` | 로그인·가입·가입 승인 UI |

## 운영 시 참고

- `admin-users.json`: **비밀번호 해시만** 저장·저장소 반영 여부 팀 정책 **준수**
- 최고 관리자 계정 분실: 파일 직접 `role`·`status` 수정 또는 `users` 비운 뒤 첫 가입 **부트스트랩**

## 같이 보면 좋은 문서

- [09-admin-panel.md](09-admin-panel.md) — 어드민 화면 구성  
- [05-knowledge-api.md](05-knowledge-api.md), [08-file-upload.md](08-file-upload.md) — 보호 엔드포인트 상세  
