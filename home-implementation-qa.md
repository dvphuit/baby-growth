# QA record — Home Today-first implementation

## Visual preview

Preview HTTP đã render thành công Home mode Bé. Thứ tự hiển thị hiện tại là `Tóm tắt hôm nay` → `Daily habits` → `Chỉ số sức khỏe` → `Nhật ký hôm nay` → AI → Cẩm nang → bottom navigation. Header hiển thị Trợ lý AI, profile, mode Bé/Mẹ, search trigger và stage compact.

## Stage picker

Đã mở stage picker từ button `Sơ sinh · 8 tháng 24 ngày`. Bottom sheet hiển thị bốn lựa chọn với mô tả rõ. Đã chọn `Mầm non`; sheet đóng và Home cập nhật đúng stage, tuổi, growth score 88, growth label `Năng động & Khỏe mạnh`, mood `Rất vui`, milk `400 ml`, sleep `11.5 giờ`, temperature `36.6 °C`.

## Current observation

Data mapping hoạt động theo stage state. Daily habits hiển thị tiến độ 3/5 và 60% hoàn thành. AI CTA có nhãn `Mở tư vấn`/`Tùy chỉnh`. Cần tiếp tục kiểm tra search, mode Mẹ, Quick Log, AI modal, notification/profile và responsive viewport.

## Search compact

Đã mở search trigger; input hiển thị đúng placeholder và nút đóng có accessible hint. Đã đóng search; control quay lại trạng thái compact và nội dung Home không thay đổi.

## Mode Mẹ

Đã chuyển sang mode Mẹ; Home hiển thị đúng wellness score 94, dữ liệu sữa đông, pumping, nợ giấc ngủ và EPDS. CTA `+ Thêm` mở đúng modal `Ghi Nhận Cữ Hút Sữa Mẹ`, không bị trỏ nhầm sang Quick Log của mode Bé.

## AI modal

Đã mở modal AI từ Header thành công ở mode Mẹ. Luồng mở/đóng hoạt động, nhưng modal vẫn hiển thị copy `Bác sĩ Freud AI (Nhi khoa & Sản khoa)` và `Trực tuyến 24/7`, chưa đồng nhất với wording `Trợ lý AI` ở Home. Cần chỉnh copy modal để tránh tạo kỳ vọng AI là bác sĩ hoặc có trực tuyến thật.

## AI copy follow-up

Đã cập nhật `AI_CHAT_KNOWLEDGE` và `AIDoctorChatModal`: tên hiển thị chuyển thành `Trợ lý Freud AI về chăm sóc Bé & Mẹ`, trạng thái thành `Sẵn sàng hỗ trợ · Thông tin tham khảo`, đồng thời thêm disclaimer không thay thế chẩn đoán/tư vấn trực tiếp. Build/lint sau thay đổi đều đạt.

## AI modal verification

Sau hot reload, modal hiển thị đúng tên `Trợ lý Freud AI về chăm sóc Bé & Mẹ`, trạng thái `Sẵn sàng hỗ trợ · Thông tin tham khảo` và disclaimer. Greeting lịch sử trong chat vẫn còn cụm `Bác sĩ Freud AI`, nên cần cập nhật store khởi tạo và các component AI liên quan.

## AI copy sweep

Đã quét toàn bộ source cho các cụm `Bác sĩ Freud AI`, `Bác sĩ AI` và `Trực tuyến 24/7`. Các bề mặt liên quan đã được đổi sang `Trợ lý AI`, `Thông tin tham khảo` hoặc `Sẵn sàng hỗ trợ`, gồm chat store, AIAdviceCard, ProfileView và seed content.

## Accessibility and responsive smoke check

Console smoke check cho viewport hiện tại cho thấy `horizontalOverflow: false`. Có hai control icon-only chưa có accessible label: nút đóng modal AI và nút gửi tin nhắn; cả hai đã được bổ sung `aria-label` tương ứng.

## Final verification

Build production, lint và `git diff --check` đều đạt. Preview render thành công ở mode Bé và Mẹ; stage picker cập nhật dữ liệu theo stage; search compact mở/đóng đúng; CTA pumping mở đúng modal; AI modal mở đúng và copy mới hiển thị. Smoke check cuối cho kết quả `horizontalOverflow: false` và `interactiveWithoutLabel: []` ở viewport kiểm tra.

Build vẫn phát cảnh báo chunk JavaScript lớn hơn 500 kB sau minification; đây là warning có sẵn/không chặn build, chưa xử lý trong phạm vi Home.

## P2 follow-up preview

Preview sau semantic refactor render thành công ở mode Mẹ và Bé. Các health card, tracker row, DailyHabits item và AI CTA đều được browser nhận diện là `button` với accessible hint tương ứng. DailyHabits vẫn hiển thị tiến độ 3/5, layout không vỡ và không có lỗi runtime trong preview.

## P2 regression

DOM smoke check ở preview cho kết quả `horizontalOverflow: false` và `unlabeledControls: []`. Health card `btnOpenFreudScore` vẫn mở đúng Score Detail sau khi chuyển sang button semantic.
