# 파일 업로드

## 목적

지식 항목에 **PDF·이미지 등**을 붙일 때, 서버에 파일을 올리고 URL을 지식 데이터에 넣기 위해 사용한다.  
관리자 화면(`admin.html`)에서 첨부 후 `attachmentUrl` / `attachmentName`에 반영하는 흐름과 맞물린다.

## 엔드포인트

| 메서드 | 경로 | 설명 |
|--------|------|------|
| `POST` | `/api/upload` | `multipart/form-data`, 필드명 **`file`** |

### 성공 응답 예

```json
{ "url": "/uploads/1730000000000-filename.pdf", "name": "원본파일명.pdf" }
```

클라이언트·어드민은 이 `url`을 지식 저장 시 `attachmentUrl`로 넣고, `name`을 `attachmentName`으로 쓴다.

## 제한 (`server/middleware/upload.js`)

- **저장 위치**: `server/uploads/` (`UPLOADS_DIR`, 없으면 자동 생성)  
- **최대 크기**: 파일당 **20MB** (`LIMIT_FILE_SIZE` 시 400)  
- **파일명**: `Date.now() + '-' + 안전하게 치환한 원본명` (특수문자는 `_` 등으로 정리)

## 정적 제공

- `server/index.js`에서 `app.use('/uploads', express.static(UPLOADS_DIR))` 로 브라우저가 `/uploads/...`로 접근한다.

## 관련 파일

- `server/routes/upload.js`  
- `server/middleware/upload.js`  
- `server/config.js` — `UPLOADS_DIR`  
