# Google Drive sync QA

## Baseline

Branch task: `feat/google-drive-sync-hardening`, tách từ `origin/master` để không kéo theo Home PR. Google Drive service hiện có OAuth token in-memory, file JSON trong `appDataFolder`, fingerprint-based conflict detection, local IndexedDB storage, auto-sync debounce/interval và UI `GoogleSyncCard` trong Profile.

## Profile configuration state

Preview Profile render thành công khi không có `VITE_GOOGLE_CLIENT_ID`. Card hiển thị rõ `Google Drive chưa được cấu hình` và hướng dẫn thêm biến vào `.env.local`; không có runtime error.

## Initial gaps identified

Service chưa có timeout cho fetch, offline state chưa được publish ngay khi app khởi động hoặc mất mạng, pull snapshot không xóa local record cũ khi remote thiếu key, query file chưa chọn rõ bản mới nhất nếu tồn tại duplicate, validation snapshot còn nhẹ. UI subscription giữ error cục bộ nếu service đã clear error và một số button chưa khai báo `type="button"`.

## Implemented so far

Đã bổ sung fetch timeout 15 giây, chọn remote file mới nhất, validation `schemaVersion/updatedAt/deviceId/records/fingerprint`, xóa local record khi remote snapshot không còn key, offline/online event publishing, bảo vệ conflict resolution khi offline, đồng bộ error state từ service và semantic button types trong GoogleSyncCard.

## Validation

`npm run build`, `npm run lint` và `git diff --check` đều đạt trên branch `feat/google-drive-sync-hardening`. Production build không phát sinh lỗi TypeScript/JSX sau các thay đổi timeout, offline listeners, stale-record cleanup, conflict guard và auto-sync cleanup.

Profile preview đã render đúng configuration fallback khi thiếu `VITE_GOOGLE_CLIENT_ID`; không có runtime error. Các luồng OAuth thật chưa thể thực hiện trong sandbox vì không có client ID/Google account test, nên cần xác nhận thêm trên preview có cấu hình OAuth hợp lệ.
