# 관리자 로그인·회원가입

## 목적

`/admin.html` 및 **지식·업로드·미답변·FAQ 수정** API를 **로그인한 사내 계정**만 쓰도록 보호한다.  
비밀번호는 서버에서 **scrypt**로 해시해 `admin-users.json`에 저장한다.

## 이메일 정책

- 허용 도메인: **`@concentrix.com`** 만 (`server/config.js`의 `ADMIN_EMAIL_DOMAIN`).
- 로컬 파트(골뱅이 앞): 영문·숫자 및 `._+-`, 길이 1~64자.
- 관리자 화면에서는 **아이디만 입력**하고 UI에 `@concentrix.com`이 고정 표시된다.

## 역할·상태 (`admin-users.json` 사용자 객체)

| 필드 | 값 | 설명 |
|------|-----|------|
| `role` | `superadmin` \| `admin` | 최고 관리자는 가입 **승인/거절**만 가능 (어드민 UI의 「가입 승인」). |
| `status` | `active` \| `pending` | `pending` 인 계정은 **로그인 불가**. 승인 시 `active`. |

- **첫 번째 가입**(`users`가 비어 있을 때): 해당 계정은 **`superadmin` + `active`** 로 생성되며 즉시 로그인된다.
- **그 이후 가입**: **`admin` + `pending`**. 세션 쿠키 없이 「승인 대기」 안내만 표시. 최고 관리자가 승인하면 `active` 가 되어 로그인 가능.

## 레거시 데이터

`role` / `status` 가 없는 기존 사용자는 서버 기동 후 **가입일이 가장 이른 계정**을 `superadmin`·`active`, 나머지를 `admin`·`active` 로 자동 보정해 파일에 저장한다.

## 인증 API

| 메서드 | 경로 | 인증 | 설명 |
|--------|------|------|------|
| `POST` | `/api/auth/register` | 불필요 | 첫 계정: 가입+세션. 이후: `pending` 요청만 (세션 없음). |
| `POST` | `/api/auth/login` | 불필요 | `pending` 이면 403. |
| `POST` | `/api/auth/logout` | (있으면 무효화) | 세션 삭제·쿠키 제거 |
| `GET` | `/api/auth/me` | 쿠키 | `{ user: { email, role, status } }` 또는 401 |
| `GET` | `/api/auth/pending-registrations` | 쿠키 + **superadmin** | `{ pending: [{ id, email, createdAt }] }` |
| `POST` | `/api/auth/approve-registration` | 쿠키 + superadmin | 본문 `{ "userId": "..." }` |
| `POST` | `/api/auth/reject-registration` | 쿠키 + superadmin | 본문 `{ "userId": "..." }` — 대기 계정 삭제 |

요청 본문 예: `{ "email": "user@concentrix.com", "password": "..." }`

## 세션

- 쿠키 이름: **`connie_admin`** (httpOnly, `Path=/`, `SameSite=lax`, 프로덕션에서는 `Secure` 권장).
- 세션 데이터는 **프로세스 메모리**에 보관한다. **서버 재시작 시 전원 로그아웃**된다.

## 보호되는 API (로그인 필요)

미들웨어: `server/middleware/requireAdminAuth.js` — 쿠키에 유효한 세션이 없으면 **401**.  
`active` 관리자·최고 관리자 모두 지식/업로드 등 일반 어드민 API 사용 가능.

| 영역 | 경로 |
|------|------|
| 지식 | `GET/POST/PUT/DELETE /api/knowledge` … |
| 업로드 | `POST /api/upload` |
| 미답변 | `GET /api/unanswered`, `DELETE /api/unanswered/:id`, `DELETE /api/unanswered/bulk` |
| FAQ 수정 | `PUT /api/faq` |

**공개로 둔 API** (채팅 클라이언트·봇용):

- `POST /api/chat`, `GET /api/ollama-status`, **`GET /api/faq`** (칩용 목록)

## CORS

- `credentials: true` + 허용 `origin` 목록으로 쿠키 전달이 가능하도록 설정되어 있다 (`server/config.js`의 `CORS_ALLOWED_ORIGINS`).

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

- `admin-users.json`에는 **비밀번호 해시**만 저장된다. 저장소에 올릴지 여부는 팀 정책에 따른다.
- 최고 관리자 계정을 잃어버리면 파일에서 직접 `role`·`status` 를 수정하거나, `users` 를 비운 뒤 첫 가입으로 부트스트랩해야 한다.

## 같이 보면 좋은 문서

- [09-admin-panel.md](09-admin-panel.md) — 어드민 화면 구성  
- [05-knowledge-api.md](05-knowledge-api.md), [08-file-upload.md](08-file-upload.md) — 보호되는 엔드포인트 상세  
