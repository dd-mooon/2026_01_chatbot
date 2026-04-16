# 파일 업로드

## 목적

지식 항목 **PDF·이미지 등** 첨부 시 서버 파일 업로드·URL 지식 데이터 **반영**.  
관리자 화면(`admin.html`) 첨부 후 `attachmentUrl` / `attachmentName` **연계**.

## 엔드포인트

| 메서드 | 경로 | 설명 |
|--------|------|------|
| `POST` | `/api/upload` | `multipart/form-data`, 필드명 **`file`** |

### 성공 응답 예

```json
{ "url": "/uploads/1730000000000-filename.pdf", "name": "원본파일명.pdf" }
```

클라이언트·어드민: `url` → 지식 저장 시 `attachmentUrl`·`name` → `attachmentName` **사용**

## 제한 (`server/middleware/upload.js`)

- **저장 위치**: `server/uploads/` (`UPLOADS_DIR`, 없으면 자동 생성)  
- **최대 크기**: 파일당 **20MB** (`LIMIT_FILE_SIZE` 시 400)  
- **파일명**: `Date.now() + '-' + 안전 치환 원본명` (특수문자 `_` 등 **정리**)

## 정적 제공

- `server/index.js`: `app.use('/uploads', express.static(UPLOADS_DIR))` — 브라우저 `/uploads/...` **접근**

## 관련 파일

- `server/routes/upload.js`  
- `server/middleware/upload.js`  
- `server/config.js` — `UPLOADS_DIR`  
