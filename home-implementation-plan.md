# Kế hoạch triển khai chỉnh sửa page Home — BabyGrowth AI

## Mục tiêu

Cải thiện page Home theo hướng **Today-first**, giúp người dùng hiểu tình trạng của Bé và biết hành động tiếp theo trong vài giây đầu sau khi mở app. Kế hoạch tập trung vào bốn kết quả: giảm độ dày của Header, đưa việc cần làm hôm nay lên vị trí ưu tiên, thay nội dung hard-code bằng dữ liệu từ store, và làm rõ các CTA ghi chép/AI mà không phá vỡ visual language Warm & Earthy hiện tại.

Phạm vi lần này là triển khai trong repository React hiện có, ưu tiên thay đổi nhỏ và có thể kiểm chứng. Không xây lại toàn bộ app, không thay đổi mô hình dữ liệu lớn, không thêm backend/API mới và không thay đổi cấu trúc bottom navigation nếu chưa có bằng chứng UX cần thiết.

## Phạm vi triển khai theo thứ tự ưu tiên

### Giai đoạn 0 — Baseline và kiểm tra an toàn

1. Xác nhận branch và commit làm việc; tạo một branch tính năng riêng cho Home.
2. Chạy kiểm tra baseline trước khi chỉnh sửa: cài dependency nếu cần, chạy type-check/build hiện có, mở preview và ghi nhận lỗi runtime hoặc lỗi môi trường.
3. Đối chiếu các nguồn dữ liệu hiện tại gồm `HomeView`, `Header`, `DailyHabits`, `useBabyStore`, `useMomStore`, `seedData`, các style Home/Header/shared và các modal Quick Log/AI.
4. Xác định các hành vi phải giữ nguyên: mở score detail, mở Quick Log, mở AI chat, mở pumping ở mode Mẹ, chuyển mode Bé/Mẹ, chuyển stage và điều hướng sang profile.

**Kết quả:** Có baseline rõ ràng, danh sách hành vi không được hồi quy và phạm vi file cần chỉnh sửa.

### Giai đoạn 1 — Đồng bộ dữ liệu Home và chuẩn hóa copy, ưu tiên P0

1. Refactor `HomeView` để lấy toàn bộ dữ liệu hiển thị chính từ `currentStageData` và `momData`, thay cho giá trị cố định.
2. Ở mode Bé, map các trường đã có trong stage data: `growthScore`, `growthScoreLabel`, `todayVitals.mood`, `todayVitals.moodEmoji`, `todayVitals.milkTotal`, `todayVitals.sleepTotal`, `todayVitals.diaperCount` và `todayVitals.temperature`.
3. Bổ sung helper hoặc mapping nhỏ cho nhãn trạng thái để xử lý dữ liệu thiếu một cách nhất quán. Khi chưa có dữ liệu, hiển thị empty state như “Chưa cập nhật” và CTA phù hợp, không tự suy diễn số liệu.
4. Thay các nhãn tiếng Anh xen kẽ bằng copy tiếng Việt có chủ đích: “Tăng trưởng”, “Phát triển tối ưu”, “Tâm trạng”, “Vui vẻ”, “Xem phân tích”. Giữ tên token/biến kỹ thuật bằng tiếng Anh nếu cần, chỉ thay text hiển thị.
5. Chỉnh AI banner trong `HomeView`: dùng value proposition rõ ràng như “Hỏi trợ lý AI về Bé Bơ”, thêm mô tả ngắn theo dữ liệu hôm nay, CTA có nhãn “Mở tư vấn”, và làm rõ action phụ. Không khẳng định AI là bác sĩ hoặc thay thế chẩn đoán y khoa.
6. Bảo đảm mode Mẹ cũng dùng wording nhất quán, không bị ảnh hưởng bởi các helper chỉ dành cho dữ liệu Bé.

**File dự kiến:** `app/src/components/home/HomeView.tsx`, có thể thêm helper nhỏ trong `app/src/utils/format.ts` hoặc file mapping riêng nếu việc này giúp tránh logic lặp.

**Kết quả:** Home phản ánh dữ liệu store hiện tại, không còn demo value cố định ở các widget chính và copy nhất quán với người dùng Việt Nam.

### Giai đoạn 2 — Đưa “Today summary” và “Daily habits” lên đầu, ưu tiên P0

1. Tái cấu trúc thứ tự JSX của Home mode Bé theo thứ tự: tiêu đề/ngữ cảnh hôm nay, summary ngắn, Daily Habits, health overview, nhật ký hôm nay, AI assistant và cẩm nang.
2. Tận dụng component `DailyHabits` hiện có thay vì viết lại checklist. Kiểm tra contract của component và style hiện tại; nếu cần, trích xuất một biến thể compact cho Home nhưng giữ lại logic `completedCount`, `progressPercent` và `toggleHabit`.
3. Hiển thị summary gọn, gồm tiến độ kiểu `3/5`, progress bar, một câu insight dữ liệu và CTA “Tiếp tục”. Không đưa quá nhiều chi tiết vào vùng đầu màn hình.
4. Nếu `dailyHabits` rỗng hoặc chưa sẵn sàng, render empty state có hướng dẫn rõ ràng thay vì progress bar lỗi hoặc chia cho 0.
5. Giữ parity về cấu trúc giữa mode Bé và Mẹ ở mức layout tổng thể. Mode Mẹ có thể dùng summary wellness/pumping/recovery hiện có thay cho checklist Bé nếu dữ liệu thói quen không áp dụng.

**File dự kiến:** `app/src/components/home/HomeView.tsx`, `app/src/components/home/DailyHabits.tsx`, `app/src/styles/home.css`, và style liên quan đến habits nếu đang được đặt trong shared stylesheet.

**Kết quả:** Người dùng nhìn thấy việc cần làm và tiến độ ngay sau khi mở Home; Home có next action rõ ràng.

### Giai đoạn 3 — Thu gọn Header và giảm độ dày phần đầu trang, ưu tiên P0/P1

1. Giữ lại các hành động có tần suất cao trong Header: profile, chuyển mode Bé/Mẹ, AI, thông báo và ngày hiện tại.
2. Thu gọn age simulator thành một control/pill duy nhất hiển thị stage hiện tại và tuổi hiện tại. Khi chạm vào, mở bottom sheet hoặc popover chứa bốn stage hiện có.
3. Chuyển search bar sang trạng thái compact/collapsed trên Home; khi người dùng chạm vào icon hoặc input, mới mở rộng. Không xóa khả năng tìm kiếm hiện tại.
4. Đảm bảo các control mới dùng semantic button, có `aria-label`, focus state và vùng chạm đủ lớn.
5. Không thay đổi logic `setProfileMode`, `setStage`, `onOpenAiChat`, `onOpenNotifications` và navigation profile; chỉ thay đổi cách trình bày và điểm mở control.
6. Nếu bottom sheet age simulator chưa có API phù hợp, dùng một trạng thái local trong `Header` và component/pattern `BottomSheet` hiện có thay vì thêm thư viện mới.

**File dự kiến:** `app/src/components/common/Header.tsx`, `app/src/styles/header.css`, có thể chỉnh `app/src/components/common/BottomSheet.tsx` nếu cần mở rộng pattern hiện tại.

**Kết quả:** Nội dung chính xuất hiện sớm hơn, nhưng các chức năng stage/search vẫn đầy đủ và dễ truy cập.

### Giai đoạn 4 — Tối ưu Health overview và Today log, ưu tiên P1

1. Giữ Growth card làm chỉ số chính; hiển thị score lớn hơn, stage label từ dữ liệu thật và CTA “Xem phân tích”.
2. Chuyển Mood card thành card vừa hiển thị trạng thái vừa có CTA “Cập nhật tâm trạng”, sử dụng mood và emoji từ store.
3. Điều chỉnh chiều cao, padding và hierarchy của hai card để nhường không gian cho summary/habits; không đổi palette Warm & Earthy.
4. Thêm nút `+ Thêm` rõ ràng ở header “Nhật ký hôm nay”, kết nối với `onOpenQuickLog`.
5. Đánh giá số lượng tracker row hiển thị ban đầu. Ưu tiên ba mục cốt lõi, cho phép mở rộng “Xem thêm” nếu không làm mất khả năng truy cập các mục còn lại.
6. Mỗi row cần có trạng thái dễ đọc và CTA/chevron rõ; không dùng chấm màu hoặc emoji đơn lẻ làm tín hiệu duy nhất.
7. Bổ sung empty state theo từng loại dữ liệu nếu giá trị thiếu; không hiển thị số mẫu mặc định chỉ để lấp giao diện.

**File dự kiến:** `app/src/components/home/HomeView.tsx`, `app/src/styles/home.css`, có thể chỉnh icon/utility trong `app/src/styles/shared.css`.

**Kết quả:** Người dùng phân biệt được dữ liệu cần xem, dữ liệu cần cập nhật và hành động tiếp theo.

### Giai đoạn 5 — Tinh chỉnh AI và Care Guide, ưu tiên P1

1. Làm AI banner thành một CTA có ngữ cảnh, ưu tiên nút chính có text thay vì chỉ icon.
2. Thêm accessible labels cho nút icon-only và kiểm tra hierarchy giữa CTA mở chat với action phụ/cài đặt.
3. Giữ AI disclaimer ở mức ngắn, không gây hoang mang nhưng không tạo kỳ vọng sai về chẩn đoán hoặc trực bác sĩ.
4. Cải thiện Care Guide: tăng khả năng đọc của card, giới hạn tiêu đề hai dòng, bổ sung metadata hữu ích như thời lượng đọc nếu dữ liệu đã có; nếu chưa có, không tạo số liệu giả.
5. Đảm bảo `Xem tất cả` là hành động thực sự có route hoặc callback. Nếu route chưa có, hiển thị toast placeholder rõ ràng thay vì để control không phản hồi.
6. Chỉ cá nhân hóa bài viết theo stage nếu dữ liệu nội dung đã có nguồn đáng tin; trong giai đoạn đầu có thể giữ seed content nhưng cần tách rõ khỏi số liệu động.

**File dự kiến:** `app/src/components/home/HomeView.tsx`, `app/src/styles/home.css`, có thể cập nhật route/callback trong `app/src/App.tsx` nếu cần.

### Giai đoạn 6 — Accessibility, responsive và motion polish, ưu tiên P2

1. Chuyển các phần tử tương tác đang là `div` có `onClick` sang `button` hoặc link semantic khi phù hợp.
2. Bổ sung focus-visible, keyboard activation, accessible names, trạng thái selected/expanded và thông báo cho các control mới.
3. Kiểm tra contrast cho text trên card sage, orange và dark brown; không dùng màu là tín hiệu duy nhất cho trạng thái.
4. Kiểm tra viewport mobile nhỏ, tablet và desktop. Giữ app shell tối đa 500px nếu đó là chủ ý PWA; trên desktop tạo panel/shadow/background có chủ đích nếu cần, không kéo giãn card một cách máy móc.
5. Dùng transition ngắn cho press/hover/expand, chỉ animate transform/opacity và tôn trọng `prefers-reduced-motion`. Không thêm animation gây phân tán ở khu vực dữ liệu.
6. Kiểm tra không có overflow ngang ở header, cards, bottom nav và horizontal care guide.

**File dự kiến:** `app/src/styles/home.css`, `app/src/styles/header.css`, `app/src/styles/shared.css`, `app/src/styles/animations.css`, cùng các component đã chỉnh.

## Quyết định kỹ thuật

| Quyết định | Cách thực hiện |
|---|---|
| Nguồn dữ liệu | Ưu tiên store và seed schema hiện có; không thêm API/backend. |
| Tái sử dụng | Tái sử dụng `DailyHabits`, `BottomSheet`, Quick Log modal và các design tokens hiện tại. |
| Styling | Giữ hệ thống CSS hiện có và token trong `styles/tokens.css`; chỉ bổ sung class cần thiết, tránh hard-code màu mới. |
| Routing | Không thay đổi route hiện có; chỉ thêm callback/route khi control “Xem tất cả” thực sự cần destination. |
| Mobile-first | Ưu tiên trải nghiệm trong app shell 500px; desktop chỉ được polish sau khi mobile ổn định. |
| Copy y khoa | Dùng wording “trợ lý AI”; tránh tuyên bố AI là bác sĩ hoặc thay thế bác sĩ. |
| Animation | Giữ chuyển động ngắn, có reduced-motion fallback. |

## Kế hoạch kiểm thử và nghiệm thu

### Kiểm thử tự động và tĩnh

1. Chạy TypeScript check và build production sau mỗi nhóm thay đổi lớn.
2. Chạy lint/format theo script hiện có nếu repository hỗ trợ.
3. Kiểm tra không còn literal demo trong `HomeView` đối với mood, milk, diaper, temperature, sleep và score label; các fallback phải là empty state có chủ đích.
4. Kiểm tra các import và route không bị bỏ sót khi tái cấu trúc component.

### Kiểm thử hành vi trong trình duyệt

1. Mode Bé: score card mở Score Detail; Mood card mở Quick Log; tracker row mở đúng flow; CTA `+ Thêm` mở Quick Log; FAB vẫn hoạt động.
2. Mode Mẹ: chuyển mode không lỗi; wellness score, pumping, sleep debt và EPDS vẫn hiển thị đúng; pumping row mở Add Pumping.
3. Header: chuyển Bé/Mẹ, mở age selector, đổi stage, mở search, mở AI, mở notification và profile đều hoạt động.
4. Daily Habits: toggle item cập nhật progress; trạng thái hoàn thành không làm layout vỡ; danh sách rỗng có empty state.
5. AI: CTA chính mở đúng chat modal; action phụ có phản hồi; copy disclaimer không gây hiểu nhầm.
6. Care Guide: card có thể mở hoặc `Xem tất cả` có phản hồi rõ ràng, không có control dead-end.
7. Responsive: kiểm tra tối thiểu viewport khoảng 320px, 375px, 430px và desktop rộng; kiểm tra safe area phía dưới và không che nội dung bởi bottom nav.
8. Accessibility: dùng keyboard để đi qua control, kiểm tra focus visible, đọc accessible label, và kiểm tra reduced motion.

### Tiêu chí hoàn thành

| Nhóm | Tiêu chí nghiệm thu |
|---|---|
| Hierarchy | Người dùng thấy summary và next action trước khi phải cuộn sâu. |
| Data integrity | Widget chính dùng dữ liệu store hoặc hiển thị empty state; không còn số liệu demo gây hiểu nhầm. |
| Interaction | Tất cả CTA nhìn thấy đều có hành vi hoặc placeholder toast rõ ràng. |
| Copy | Nhãn chính bằng tiếng Việt, AI được mô tả là trợ lý AI và không tuyên bố thay thế bác sĩ. |
| Accessibility | Control semantic, accessible label, focus state và trạng thái không chỉ phụ thuộc màu. |
| Responsive | Không overflow ngang, không bị bottom nav che, hiển thị tốt trên mobile nhỏ. |
| Regression | Các luồng score, Quick Log, AI, profile, mode Bé/Mẹ và stage selector vẫn hoạt động. |

## Các rủi ro và cách xử lý

| Rủi ro | Ảnh hưởng | Biện pháp |
|---|---|---|
| `DailyHabits` chưa phù hợp hoàn toàn với cả hai mode | Layout hoặc copy Mẹ bị gượng ép | Chỉ dùng checklist cho Bé; tạo summary tương ứng từ `momData` cho mode Mẹ. |
| Một số dữ liệu seed không có timestamp hoặc trạng thái cập nhật | Hiển thị “lần gần nhất” không chính xác | Chỉ hiển thị tổng/ngữ cảnh có trong schema; dùng “Chưa cập nhật” khi thiếu metadata. |
| Thu gọn search làm giảm khả năng khám phá | Người dùng không biết có tìm kiếm | Dùng icon có tooltip/aria-label và placeholder khi expanded; kiểm thử click discovery. |
| Thay đổi Header làm tăng độ phức tạp state | Regression ở stage/mode | Giữ nguyên setter hiện tại, giới hạn state mới trong phạm vi mở/đóng selector. |
| AI copy tạo kỳ vọng y khoa | Rủi ro niềm tin và an toàn | Dùng “trợ lý AI”, disclaimer ngắn và review toàn bộ text liên quan. |
| CSS hiện tại có nhiều class compact phụ thuộc lẫn nhau | Vỡ layout khi giảm chiều cao | Chỉnh theo từng nhóm, chụp/kiểm tra preview sau mỗi nhóm, tránh xóa class dùng chung vội vàng. |

## Thứ tự bàn giao đề xuất

1. Hoàn thành Giai đoạn 0 và baseline.
2. Gộp Giai đoạn 1–2 thành mốc **P0: Data + Today-first**.
3. Kiểm thử và review mốc P0 trước khi chỉnh Header.
4. Gộp Giai đoạn 3–5 thành mốc **P1: Navigation + hierarchy + CTA**.
5. Hoàn thành Giai đoạn 6 thành mốc **P2: Quality + accessibility**.
6. Chạy full regression, kiểm tra diff, sau đó mới commit/push nếu được phê duyệt.

## Giả định và điểm cần xác nhận

- Người dùng muốn triển khai trực tiếp trên repository `dvphuit/baby-growth`, không chỉ tạo mockup.
- Ưu tiên trải nghiệm mobile/PWA vì app shell hiện giới hạn 500px.
- Không cần thu thập dữ liệu analytics mới trước khi triển khai P0; usability/analytics có thể dùng để tinh chỉnh P1/P2.
- Các nội dung cẩm nang hiện có thể tiếp tục dùng seed content trong giai đoạn đầu, nhưng không được tạo thêm số liệu tương tác giả nếu chưa có nguồn dữ liệu.
- Việc push branch hoặc tạo pull request sẽ chỉ thực hiện sau khi người dùng duyệt kết quả triển khai.
