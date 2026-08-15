# App version QA

## Implemented

Added `AppVersionBadge` to the global App shell. It displays `v<package version> · <short SHA> · <branch/ref>` above the bottom navigation. Build metadata is injected through `VITE_APP_VERSION`, `VITE_BUILD_SHA`, `VITE_BUILD_REF`, and `VITE_BUILD_TIME`.

Production GitHub Actions and both manual Firebase deploy scripts now inject the metadata. The scripts print the version/build/ref summary without printing the OAuth Client ID value.

## Automated validation

`npm run build`, `npm run lint`, `bash -n app/scripts/deploy-test.sh app/scripts/deploy-production.sh`, and `git diff --check` passed. A test build with `VITE_APP_VERSION=9.9.9`, `VITE_BUILD_SHA=abcdef1234567890`, `VITE_BUILD_REF=staging`, and a fixed build time embedded the version and SHA in the generated bundle.

## Preview note

HTTPS preview on port 5180 was unavailable because the normal Vite config uses self-signed TLS. A temporary HTTP preview on port 5181 was started and served by Vite, but the browser page rendered blank; a runtime console check is still needed before final commit. The temporary preview config must be removed before commit.

## Preview DOM validation

Preview HTTP cuối cùng đã mount App bình thường. DOM smoke check xác nhận `.app-version-badge` hiển thị `v9.9.9 · abcdef1 · staging`, với `aria-label` và `title` đầy đủ gồm build time `2026-08-15T00:00:00Z`. Trang trắng ở screenshot đầu là trạng thái tải chậm của proxy; DOM sau đó đã render đầy đủ và không có console error.
