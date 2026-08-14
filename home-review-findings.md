# Findings: Home page review

## Preview
- App render thành công ở URL preview tạm thời.
- Home là layout mobile-first, trong viewport desktop nội dung nằm trong một cột hẹp ở giữa, khoảng trống hai bên lớn.
- Header có ngày, CTA Bác sĩ AI, thông báo, profile; có chuyển mode Bé/Mẹ và bộ lọc mốc tuổi.
- Home baby mode gồm: Chỉ số Sức khỏe (Growth 92 + Mood Happy), Nhật ký Hôm nay với 5 tracker rows, banner Tư vấn AI, Cẩm nang Chăm sóc với horizontal cards.
- Bottom nav gồm Trang chủ, Nhật ký, FAB Ghi chép nhanh, Tăng trưởng, Chi tiêu.

## Initial UX observations
- Header chứa nhiều lớp thông tin và control trước nội dung chính; trên mobile có nguy cơ chiếm nhiều chiều cao.
- Hai health cards được đặt cạnh nhau, trực quan nhưng label tiếng Anh (Growth, Healthy, Mood, Happy) chưa nhất quán với copy tiếng Việt còn lại.
- Nhật ký Hôm nay là khu vực có giá trị sử dụng cao nhưng 5 rows gần như cùng trọng lượng thị giác; chưa có trạng thái hoàn thành/thiếu dữ liệu hoặc CTA thêm nhanh rõ ràng từng dòng.
- AI banner nổi bật mạnh nhưng copy '2,541 Tư vấn AI' dễ hiểu như số liệu thống kê hơn là hành động; nút cộng/cài đặt phía trong chưa có label rõ.
- Cẩm nang đặt sau banner, card nhỏ 155px và text dài; khả năng đọc trên mobile bị hạn chế.
- Home có nhiều section nhưng chưa có một vùng 'ưu tiên hôm nay' hoặc insight tổng hợp giúp người dùng biết nên làm gì tiếp theo.
- Một số dữ liệu đang hard-coded trong HomeView (Mood Happy, 160ml, 5 lần tã, 36.8°C, nội dung cẩm nang), cần xem lại khi chuyển sang dữ liệu thật.
