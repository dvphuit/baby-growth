# Đề xuất chỉnh sửa page Home — BabyGrowth AI

**Tác giả:** Manus AI  
**Phạm vi:** Đề xuất UX/UI và nội dung; chưa thay đổi source code sản phẩm.  
**Cơ sở đánh giá:** Source hiện tại tại commit `1e83bb8`, kết hợp kiểm tra preview của Home ở chế độ Bé.

## 1. Kết luận điều hành

Home hiện tại đã có nền tảng hình ảnh khá rõ: bảng màu warm-earthy, thẻ bo tròn, score card màu sage, bottom navigation và FAB đều tạo được nhận diện nhất quán với định hướng trong tài liệu thiết kế [1](https://github.com/dvphuit/baby-growth/blob/1e83bb8/DESIGN.md). Luồng tương tác cốt lõi cũng đã hiện diện: xem điểm tăng trưởng, ghi nhật ký nhanh, mở AI và truy cập cẩm nang [2](https://github.com/dvphuit/baby-growth/blob/1e83bb8/app/src/components/home/HomeView.tsx).

Điểm cần ưu tiên không phải là thêm nhiều thành phần mới, mà là **làm Home dễ hiểu hơn trong 5 giây đầu**, giảm độ dày của phần đầu trang, đưa “việc cần làm hôm nay” lên vị trí nổi bật, và thay thế các tóm tắt đang hard-code bằng dữ liệu đã có trong store. Hiện tại người dùng phải đi qua nhiều lớp control trước khi nhìn thấy nội dung chính; trong khi đó, năm dòng nhật ký có trọng lượng thị giác gần như ngang nhau và chưa trả lời rõ câu hỏi “bây giờ tôi nên làm gì?”.

Đề xuất tổng thể là chuyển Home từ mô hình “dashboard nhiều module” sang mô hình **Today-first**:

> **Chào người dùng → Tóm tắt hôm nay → Việc cần làm → Chỉ số quan trọng → Ghi nhật ký → Trợ lý AI → Cẩm nang.**

## 2. Hiện trạng và nhận định

| Khu vực | Điểm đang làm tốt | Vấn đề chính | Mức độ |
|---|---|---|---|
| Header | Có profile, mode Bé/Mẹ, AI, thông báo và tìm kiếm trong một hệ thống thống nhất [3](https://github.com/dvphuit/baby-growth/blob/1e83bb8/app/src/components/common/Header.tsx) | Nhiều control xếp chồng trước nội dung Home; age simulator chiếm thêm chiều cao và chưa phải hành động thường xuyên | Cao |
| Health cards | Hai card Growth/Mood tạo điểm nhấn tốt, dễ nhận diện bằng màu | Label tiếng Anh xen kẽ tiếng Việt; score chưa dùng `growthScoreLabel` đã có trong dữ liệu; chưa thể hiện rõ CTA tiếp theo | Trung bình |
| Nhật ký hôm nay | Có các entry quan trọng: bú, ngủ, tã, nhiệt độ và tâm trạng | Nội dung một số row đang hard-code; các row có cùng cấp độ ưu tiên; chưa có trạng thái thiếu dữ liệu hoặc nút thêm rõ ràng | Cao |
| AI banner | Nổi bật và có vị trí dễ thấy | “2,541 Tư vấn AI” thiên về số liệu hơn là lợi ích; icon cộng/cài đặt thiếu nhãn; câu “Bác sĩ Nhi 24/7” có thể tạo kỳ vọng không chính xác | Cao |
| Cẩm nang | Có phân loại chủ đề và số lượt xem/yêu thích | Card rộng 155px, chữ nhỏ và tiêu đề dài; cần tối ưu khả năng đọc và chuyển thành nội dung có ngữ cảnh | Trung bình |
| Layout | Mobile-first, card radius và màu sắc nhất quán | Trên viewport desktop, app bị giới hạn trong cột tối đa 500px nên tạo khoảng trống hai bên lớn; đây có thể là chủ ý PWA nhưng nên có presentation mode tốt hơn | Thấp–trung bình |
| Dữ liệu | Stage data đã có score, mood, temperature, sleep, milk, diaper và growth label [4](https://github.com/dvphuit/baby-growth/blob/1e83bb8/app/src/data/seedData.ts) | HomeView vẫn hiển thị các giá trị cố định như “Happy”, “160ml”, “5 lần”, “36.8 °C” và nội dung thống kê mẫu thay vì map đầy đủ từ state | Cao |

## 3. Đề xuất theo mức độ ưu tiên

### P0 — Nên làm trước để cải thiện trải nghiệm cốt lõi

| Ưu tiên | Đề xuất | Thay đổi cụ thể | Tác động kỳ vọng |
|---|---|---|---|
| P0.1 | **Thu gọn Header** | Giữ ngày, profile, mode Bé/Mẹ và hai hành động AI/thông báo; chuyển age simulator thành một pill “Sơ sinh · 8 tháng 24 ngày” có thể mở bottom sheet. Tìm kiếm nên chuyển thành icon hoặc giữ ở trạng thái collapsed, chỉ mở rộng khi người dùng chạm vào. | Home vào nội dung chính nhanh hơn, giảm cảm giác “bảng điều khiển”. |
| P0.2 | **Đưa “Hôm nay cần làm” lên đầu** | Tái sử dụng `DailyHabits`, module hiện đã có progress `completedCount`, `progressPercent` và thao tác toggle [5](https://github.com/dvphuit/baby-growth/blob/1e83bb8/app/src/components/home/DailyHabits.tsx). Hiển thị một summary card: “3/5 việc đã hoàn thành” + progress bar + CTA “Tiếp tục”. | Tạo định hướng hành động ngay sau khi mở app, thay vì bắt người dùng tự suy luận từ các card. |
| P0.3 | **Loại bỏ hard-code trong Home** | Map `mood`, `moodEmoji`, `milkTotal`, `diaperCount`, `temperature`, `sleepTotal` và `growthScoreLabel` từ `currentStageData.todayVitals`/stage data. Không hiển thị “lần gần nhất” nếu state chưa có timestamp tương ứng; thay bằng tổng trong ngày hoặc nhãn “Chưa cập nhật”. | Tăng độ tin cậy, tránh mâu thuẫn giữa Home và các trang Growth/Timeline. |
| P0.4 | **Đổi AI banner thành CTA có ngữ cảnh** | Đổi tiêu đề thành “Hỏi trợ lý AI về Bé Bơ”, mô tả “Dựa trên các ghi chép hôm nay, bạn muốn hỏi điều gì?”. Dùng một nút pill có nhãn “Mở tư vấn”; đặt “Cài đặt” thành secondary action có tooltip/aria-label. Tránh dùng “Bác sĩ Nhi 24/7” nếu đây là AI; thêm dòng ngắn “AI không thay thế chẩn đoán của bác sĩ”. | Người dùng hiểu ngay giá trị và hành động cần thực hiện; giảm rủi ro hiểu nhầm về tính chất y khoa của sản phẩm. |

### P1 — Nên làm trong vòng lặp UI kế tiếp

| Ưu tiên | Đề xuất | Thay đổi cụ thể | Tác động kỳ vọng |
|---|---|---|---|
| P1.1 | **Tái cấu trúc khu vực chỉ số** | Giữ Growth làm card chính với số điểm lớn hơn và nhãn dữ liệu thật, ví dụ “Phát triển tối ưu”. Card Mood dùng emoji + trạng thái tiếng Việt + CTA “Cập nhật tâm trạng”. Có thể giữ grid 2 cột nhưng giảm chiều cao từ 148px xuống khoảng 124–132px để nhường chỗ cho phần hành động. | Phân biệt rõ “thông tin cần xem” và “hành động cần làm”. |
| P1.2 | **Biến Nhật ký thành danh sách ưu tiên** | Header “Nhật ký hôm nay” thêm nút pill “+ Thêm”. Hiển thị 3 mục cốt lõi trước; hai mục ít cấp bách chuyển vào “Xem thêm”. Mỗi row có chevron hoặc CTA nhỏ, trạng thái màu và thời điểm cập nhật; không dùng dấu chấm/emoji đơn lẻ làm tín hiệu duy nhất. | Giảm chiều dài scroll, tăng khả năng ghi chép nhanh và đọc lướt. |
| P1.3 | **Đưa insight lên trên dữ liệu chi tiết** | Thêm một card ngắn giữa “Việc cần làm” và “Chỉ số”: “Bé đang phát triển tốt — hôm nay còn thiếu cập nhật giấc ngủ buổi trưa” hoặc “Lịch ăn và ngủ đang ổn định”. Nội dung phải sinh từ state; nếu chưa đủ dữ liệu, dùng CTA “Bắt đầu ghi chép”. | Home trả lời được câu hỏi “có gì đáng chú ý hôm nay?”. |
| P1.4 | **Cải thiện cẩm nang** | Tăng card lên khoảng 172–190px, dùng thumbnail/illustration có nền màu chủ đề, tiêu đề tối đa 2 dòng và thêm nhãn thời lượng đọc. Ưu tiên bài liên quan đến stage hiện tại; `Xem tất cả` cần là control thực sự có điều hướng. | Tăng khả năng đọc và cảm giác nội dung được cá nhân hóa. |
| P1.5 | **Đồng nhất ngôn ngữ** | Thay “Growth”, “Healthy”, “Mood”, “Happy”, “Wellness” bằng nhãn tiếng Việt hoặc cặp nhãn có chủ đích: “Tăng trưởng”, “Đạt chuẩn”, “Tâm trạng”, “Vui vẻ”. Chỉ giữ tiếng Anh ở nơi có ý nghĩa thương hiệu hoặc dữ liệu kỹ thuật. | Giảm tải nhận thức và làm sản phẩm thân thiện hơn với nhóm người dùng Việt Nam. |

### P2 — Hoàn thiện chất lượng và khả năng mở rộng

| Ưu tiên | Đề xuất | Thay đổi cụ thể | Tác động kỳ vọng |
|---|---|---|---|
| P2.1 | **Bổ sung trạng thái UI** | Thiết kế empty state, loading state, offline state và error state cho từng module. Ví dụ: “Chưa có dữ liệu nhiệt độ hôm nay · + Cập nhật”. | Home không bị “đẹp nhưng tĩnh” khi dữ liệu chưa đầy đủ. |
| P2.2 | **Tăng khả năng tiếp cận** | Các phần tử đang là `div` có `onClick` nên được chuyển thành `button`/`a` phù hợp; thêm `aria-label` cho icon-only controls; bảo đảm vùng chạm tối thiểu khoảng 44px; không phụ thuộc riêng vào màu để truyền trạng thái. | Tốt hơn cho keyboard, screen reader và người dùng thao tác trên màn hình nhỏ. |
| P2.3 | **Giữ parity giữa Bé và Mẹ** | Dùng cùng một cấu trúc “Tóm tắt hôm nay → Việc cần làm → Chỉ số → Nhật ký”, chỉ thay nội dung. Dữ liệu Mẹ nên map từ `momData` như wellness, pumping stock, sleep debt và mental health thay vì tạo một Home hoàn toàn khác. | Giảm chi phí học lại khi chuyển mode và làm sản phẩm nhất quán hơn. |
| P2.4 | **Cải thiện desktop presentation** | Giữ max-width cho PWA mobile, nhưng ở viewport lớn có thể thêm nền panel, shadow nhẹ hoặc layout 2 cột phụ cho nội dung cẩm nang/insight; không kéo giãn card chính quá rộng. | Khoảng trống desktop có chủ đích hơn mà không phá trải nghiệm mobile. |

## 4. Bố cục Home đề xuất

| Thứ tự | Module | Nội dung nên hiển thị | CTA chính |
|---|---|---|---|
| 1 | Header compact | Avatar, “Chào Bé Bơ”, ngày, mode Bé/Mẹ, AI và thông báo | Mở AI / thông báo |
| 2 | Today summary | “Hôm nay của Bé”, score ngắn, một insight và nhãn dữ liệu | Xem chi tiết |
| 3 | Daily habits | Tiến độ 3/5, progress bar, 2–3 việc gần nhất | Tiếp tục |
| 4 | Health overview | Growth score + Mood + stage label lấy từ state | Xem / cập nhật |
| 5 | Today log | Bú/ăn, ngủ, tã, nhiệt độ, tâm trạng; 3 mục đầu và “Xem thêm” | + Thêm ghi chép |
| 6 | AI assistant | Câu hỏi gợi ý theo dữ liệu hôm nay | Mở tư vấn |
| 7 | Care guide | 3 bài theo stage hoặc theo tín hiệu đang thiếu | Xem tất cả |
| 8 | Bottom navigation | Giữ cấu trúc hiện tại và FAB ghi chép nhanh | Ghi chép nhanh |

Ở lần mở đầu, phần trên màn hình nên cho người dùng nhìn thấy trọn vẹn **Today summary**, một phần **Daily habits** và đầu của **Health overview**. Điều này tạo cảm giác Home là nơi đưa ra định hướng, không chỉ là nơi liệt kê dữ liệu.

## 5. Đề xuất copy cụ thể

| Hiện tại | Đề xuất | Lý do |
|---|---|---|
| `Chỉ số Sức khỏe` | `Tóm tắt hôm nay` hoặc `Chỉ số hôm nay` | Gắn nội dung với ngữ cảnh ngày hiện tại. |
| `Growth / Healthy` | `Tăng trưởng / Phát triển tối ưu` | Dùng stage data `growthScoreLabel` thay vì nhãn cố định. |
| `Mood / Happy` | `Tâm trạng / Vui vẻ` | Đồng nhất với tiếng Việt và vẫn giữ nghĩa rõ ràng. |
| `2,541 Tư vấn AI` | `Hỏi trợ lý AI về Bé Bơ` | Chuyển từ metric không rõ nghĩa sang value proposition. |
| `★ Bác sĩ Nhi 24/7` | `Trợ lý AI chăm sóc Bé` | Tránh diễn đạt khiến người dùng hiểu AI là bác sĩ hoặc đang có trực bác sĩ thật. |
| `Cẩm nang Chăm sóc` | `Gợi ý cho hôm nay` | Nếu nội dung đã cá nhân hóa theo stage; nếu chưa, giữ tên cũ. |
| `Xem chi tiết →` | `Xem phân tích` | Mô tả chính xác hơn destination của score card. |

## 6. Phạm vi triển khai nên chia làm hai đợt

**Đợt 1 — UX và dữ liệu, không thay đổi mạnh visual.** Thu gọn Header; render `DailyHabits`; thay toàn bộ nội dung hard-code bằng stage data; thêm CTA `+ Thêm` cho Nhật ký; chỉnh copy AI; đồng nhất tiếng Việt. Đây là nhóm thay đổi có tác động lớn nhưng rủi ro thấp, vì các store và module liên quan đã có sẵn trong repo [4](https://github.com/dvphuit/baby-growth/blob/1e83bb8/app/src/data/seedData.ts) [5](https://github.com/dvphuit/baby-growth/blob/1e83bb8/app/src/components/home/DailyHabits.tsx).

**Đợt 2 — Visual polish và cá nhân hóa.** Tái thiết kế hierarchy của health cards; thêm insight card; lọc cẩm nang theo stage; bổ sung empty/offline/loading states; kiểm tra accessibility và tối ưu desktop. Đợt này nên thực hiện sau khi quan sát analytics hoặc usability test ngắn để xác định người dùng thường chạm vào score, tracker, AI hay FAB trước.

## 7. Tiêu chí nghiệm thu đề xuất

| Nhóm | Tiêu chí |
|---|---|
| Nhận biết | Trong lần mở đầu, người dùng có thể nói Home đang ưu tiên điều gì hôm nay mà không cần mở tab khác. |
| Dữ liệu | Không còn giá trị demo cố định trong các card và tracker chính; mọi số liệu hiển thị đều lấy từ state hoặc có empty state rõ ràng. |
| Tương tác | Người dùng mở được ghi chép nhanh từ Header/section/FAB và biết rõ sau khi chạm vào từng row sẽ đi đâu. |
| Copy | Các nhãn chính dùng tiếng Việt nhất quán; AI không dùng wording dễ bị hiểu là chẩn đoán hoặc thay thế bác sĩ. |
| Mobile | Nội dung ưu tiên nằm trong màn hình đầu; vùng chạm đủ lớn; không có tiêu đề hoặc metadata bị cắt gây mất nghĩa. |
| Accessibility | Icon-only controls có accessible label; phần tử tương tác dùng semantic element; trạng thái không chỉ được biểu thị bằng màu. |
| Bé/Mẹ | Chuyển mode không làm thay đổi cấu trúc học được của Home, chỉ thay nội dung và màu sắc ngữ cảnh. |

## 8. Kết luận

Nếu chỉ chọn ba chỉnh sửa để bắt đầu, nên chọn **thu gọn Header**, **đưa Daily Habits/Today summary lên đầu**, và **loại bỏ hard-code khỏi Health/Journal**. Ba việc này giải quyết trực tiếp ba vấn đề lớn nhất của Home hiện tại: vào nội dung chính còn chậm, người dùng chưa có next action rõ ràng, và dữ liệu hiển thị chưa phản ánh đúng nguồn state. Các thay đổi visual lớn như thêm illustration, đổi layout desktop hoặc xây lại toàn bộ card nên để sau khi luồng Today-first đã được kiểm chứng.

## References

[1]: https://github.com/dvphuit/baby-growth/blob/1e83bb8/DESIGN.md "BabyGrowth AI design direction"
[2]: https://github.com/dvphuit/baby-growth/blob/1e83bb8/app/src/components/home/HomeView.tsx "Current HomeView implementation"
[3]: https://github.com/dvphuit/baby-growth/blob/1e83bb8/app/src/components/common/Header.tsx "Current Header implementation"
[4]: https://github.com/dvphuit/baby-growth/blob/1e83bb8/app/src/data/seedData.ts "Seed data and stage metrics"
[5]: https://github.com/dvphuit/baby-growth/blob/1e83bb8/app/src/components/home/DailyHabits.tsx "Existing daily habits module"
