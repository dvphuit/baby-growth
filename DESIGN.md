# 🌿 DESIGN SYSTEM & UI STYLE GUIDE
> **Nguồn trích xuất:** Thư mục thiết kế `@mockup` (Ứng dụng Freud.ai Mental Health, Wellness & Tracking Ecosystem).  
> **Phong cách cốt lõi:** **Warm & Earthy Organic Minimalist** (Tối giản Hữu cơ Ấm áp).

---

## 1. Triết lý Thiết kế & Định vị Cảm xúc (Design Philosophy)

* **Cảm quan thị giác (Aesthetic Vibe):** Gần gũi, dịu nhẹ, nhân văn, trị liệu (*calming, grounding, empathetic*). Xóa bỏ sự khô cứng của các ứng dụng dashboard công nghệ thông thường.
* **Đặc trưng hình học (Geometry & Forms):**
  * **Super-ellipse (Bo góc tròn mềm mại):** Thẻ và container dùng bo góc từ `20px` đến `32px`.
  * **Pill-shaped Elements:** Tất cả nút bấm chính (CTA), thanh tìm kiếm (Search), chip bộ lọc và thẻ trạng thái đều dùng bo tròn toàn phần (`border-radius: 9999px`).
  * **Organic Wave Headers:** Các mảng nền cong lồi/lõm tự nhiên ở đầu màn hình tạo sự chuyển tiếp êm ái giữa header và nội dung chính.
* **Ánh sáng & Đổ bóng (Elevation):** Bóng đổ khuếch tán màu nâu ấm tự nhiên (*diffuse warm shadow*), không dùng bóng đen sắc cạnh.

---

## 2. Bảng Màu Quy Chuẩn (Color Palette & Tokens)

### 2.1. Màu Thương hiệu Cốt lõi (Brand & Primary Surfaces)
| Token Name | Tên màu | Hex Code | Ứng dụng trong Mockup |
| :--- | :--- | :--- | :--- |
| `--color-primary-dark` | **Espresso Dark Brown** | `#33251F` / `#3B2B23` | Nút bấm chính (CTA), Header tối, Icon & Tiêu đề đậm, Nút vuốt hành động |
| `--color-primary-dark-hover`| **Deep Roast Brown** | `#241914` | Trạng thái hover/active của nút chính |
| `--color-primary-brown`| **Warm Clay Brown** | `#4A372E` | Thẻ phụ, tiêu đề cấp 2 |
| `--color-sage` | **Matcha / Sage Green** | `#8DA06F` / `#97A87A` | Header lượn sóng, Nút FAB trung tâm, Badge trạng thái tốt, Vòng điểm số |
| `--color-sage-dark` | **Deep Forest Sage** | `#748756` | Trạng thái active/hover của màu xanh |
| `--color-sage-light` | **Soft Sage Cream** | `#E5ECD9` / `#EDF2E6` | Nền chip active, khung bao quanh icon |
| `--color-sage-subtle` | **Pale Sage Tint** | `#F1F5EB` | Vòng sóng ngoài cùng của gauge điểm số |

### 2.2. Dải Màu Trạng thái & Cảm xúc (Mood & Metric Spectrum)
Trích xuất từ màn hình *Mood Tracker*, *Sleep Quality* và *Mental Health Score*:
| Trạng thái | Tên màu | Hex Code | Nền nhạt tương ứng | Ứng dụng |
| :--- | :--- | :--- | :--- | :--- |
| **Overjoyed / Best** | Meadow Green | `#7EAF50` | `#EEF7E6` | Rất vui, chỉ số sức khỏe tối ưu, hoàn thành mục tiêu |
| **Happy / Energy** | Honey Amber | `#F5B842` | `#FEF7E9` | Vui vẻ, năng động, nhắc nhở nhẹ |
| **Neutral / Normal** | Warm Ochre / Clay | `#83583E` | `#F5EEE9` | Bình thường, cân bằng, nhịp sinh hoạt ổn định |
| **Sad / Warning** | Terracotta Orange | `#E97332` | `#FDF0E9` | Mệt mỏi, buồn bã, cảnh báo chú ý |
| **Depressed / Deep** | Soft Lavender | `#9477ED` | `#F3EFFD` | Quấy khóc, căng thẳng, cần AI / Bác sĩ hỗ trợ |

### 2.3. Màu Nền & Trung tính (Surfaces & Neutrals)
| Token Name | Hex Code | Mô tả & Ứng dụng |
| :--- | :--- | :--- |
| `--color-canvas` | `#FAF8F5` | Nền canvas toàn app (Tone ngà ấm dịu mắt, thay cho màu trắng tinh `#FFF`) |
| `--color-card-bg` | `#FFFFFF` | Nền thẻ card nổi, Bottom sheet, ô input |
| `--color-card-warm` | `#F6F3ED` | Nền phân mục phụ, ô thông tin thứ cấp |
| `--color-text-primary` | `#2D231E` | Màu chữ tiêu đề và nội dung chính (Nâu đen ấm) |
| `--color-text-secondary`| `#82776E` | Chữ phụ, metadata, nhãn thời gian |
| `--color-text-muted` | `#B2A89F` | Placeholder, divider, icon inactive |
| `--color-border-subtle` | `#ECE6DD` | Viền thanh mảnh cho thẻ và ô nhập liệu |

---

## 3. Hệ thống Typography (Kiểu chữ & Phân cấp)

* **Font chữ đề xuất:** **`Outfit`** (cho Tiêu đề, Số điểm lớn, Badge) kết hợp **`Plus Jakarta Sans`** hoặc **`Nunito`** (cho Nội dung, Form input).
* **Đặc trưng:** Đầu nét tròn nhẹ (*rounded terminals*), khoảng cách chữ mở thoáng, độ dày đa dạng từ Medium (`500`) đến ExtraBold (`800`).

### Thang đo tỷ lệ (Type Scale)
| Cấp độ | Kích thước / Line Height | Trọng số (Weight) | Ứng dụng |
| :--- | :--- | :--- | :--- |
| **Display Hero** | `36px - 44px` / `1.1` | Bold / ExtraBold (`800`) | Điểm số lớn (Score `80`, `92`), Số giờ ngủ (`8.25h`) |
| **Heading 1 (H1)** | `22px - 26px` / `1.25` | Bold (`700`) | Tiêu đề màn hình ("Sign In", "Mood Stats", "Sleep Quality") |
| **Heading 2 (H2)** | `16px - 18px` / `1.3` | SemiBold / Bold (`700`) | Tiêu đề Card, Danh mục tính năng, Tên người dùng |
| **Body Large** | `14px - 15px` / `1.45` | Medium (`500`) | Nội dung hội thoại AI, văn bản nhật ký |
| **Body Regular** | `12px - 13px` / `1.4` | Regular (`400`) | Đoạn mô tả, hướng dẫn, thông tin chi tiết |
| **Caption / Badge**| `9.5px - 11px` / `1.3` | SemiBold / Bold (`700`) | Nhãn trạng thái, pill tag, ngày tháng |

---

## 4. Quy chuẩn Bo góc, Khoảng cách & Đổ bóng (Shapes & Shadows)

### 4.1. Bo góc (Border Radius Scale)
```css
--radius-xs: 8px;      /* Checkbox, thanh trượt nhỏ */
--radius-sm: 12px;     /* Icon container nhỏ, badge */
--radius-md: 18px;     /* Thẻ phụ, bubble chat */
--radius-lg: 24px;     /* Card nội dung tiêu chuẩn, khung ảnh */
--radius-xl: 32px;     /* Bottom sheet, Header bo cong, Card lớn */
--radius-pill: 9999px; /* Nút bấm CTA, Search bar, Filter chips, Nút trượt */
```

### 4.2. Đổ bóng (Elevation & Shadows)
```css
/* Đổ bóng thẻ nội dung tiêu chuẩn */
--shadow-card: 0 4px 20px -2px rgba(51, 37, 31, 0.05);

/* Đổ bóng thẻ khi tương tác hover / active */
--shadow-card-hover: 0 8px 26px -4px rgba(51, 37, 31, 0.08);

/* Đổ bóng nút nổi (Floating Action Button) */
--shadow-floating: 0 8px 24px -2px rgba(51, 37, 31, 0.12);

/* Đổ bóng Bottom Navigation Dock */
--shadow-bottom-nav: 0 -4px 20px rgba(51, 37, 31, 0.04);

/* Đổ bóng Modal & Bottom Sheet trượt lên */
--shadow-modal: 0 -12px 32px rgba(51, 37, 31, 0.14);
```

---

## 5. Đặc tả Chi tiết Thành phần Giao diện (UI Component Library)

### 5.1. Header Hữu cơ (Organic Wave Header)
* **Cấu trúc:** Mảng cong mềm mại (`border-radius: 0 0 32px 32px`) với nền màu **Sage Green** hoặc **Dark Espresso**.
* **Phần tử bên trong:**
  * Avatar tròn viền trắng nổi bật.
  * Tên người dùng và badge trạng thái dạng pill mờ (`background: rgba(255,255,255,0.25)`).
  * Nút chuyển đổi nhanh chế độ dạng pill đôi mượt mà.

### 5.2. Nút Bấm (Button Styles)
* **Primary CTA Button:** Nền `#33251F` (Dark Brown), chữ trắng, bo tròn Pill `9999px`, chiều cao `48px - 54px`, kèm icon mũi tên `→` hoặc ổ khóa `🔒`.
* **Secondary / Active Button:** Nền Sage Green `#8DA06F` chữ trắng, hoặc nền trắng viền `#ECE6DD`.
* **Swipe-to-Action Button:** Thanh nút trượt bo tròn lớn với icon `>>` bên trái, người dùng vuốt sang phải để xác nhận (ví dụ: *Swipe for AI suggestions*, *Swipe to Wake Up!*).
* **Floating Action Button (FAB):** Nút tròn `52px - 56px`, nền xanh Sage, viền trắng dày `3px`, nổi ở giữa thanh Bottom Navigation với hiệu ứng *Pulse Glow*.

### 5.3. Vòng tròn Điểm số & Gauge (Score Rings Component)
* **Quy chuẩn:** Vòng tròn trung tâm dốc màu radial (`#8DA06F` $\to$ `#5E7043`), bao bọc bởi 2-3 lớp sóng đồng tâm bán trong suốt (`var(--color-sage-light)` và `var(--color-sage-subtle)`).
* **Nội dung:** Số điểm lớn (size 42px), nhãn trạng thái ("Mentally Stable", "Phát triển tối ưu"), kèm mô tả ngắn gọn bên dưới.

### 5.4. Thanh Chọn Cảm xúc Đường cong (Curved Mood Spectrum Slider)
* **Quy chuẩn:** Bố cục 5 mặt biểu cảm đặt trên đường cung tròn/ngang.
* **Tương tác:** Khi chọn một cảm xúc, vòng tròn chứa emoji phóng to `scale(1.15)`, xuất hiện viền đậm `#33251F` và đổi màu nhãn tương ứng.

### 5.5. Biểu đồ Cột Viên thuốc & Donut (Capsule Charts)
* **Bar Chart:** Các cột đồ thị được bo tròn hoàn toàn dạng viên thuốc (*capsule*), kết hợp 2 màu tương phản (ví dụ: Cột dương = Sage Green, Cột âm = Terracotta Orange).
* **Donut Chart:** Lòng rỗng lớn (`cutout: 70%`), viền phân cách trắng sắc nét giữa các phân khúc màu ấm.

### 5.6. Ghi âm & Dạng sóng Âm thanh (Audio Waveform Widget)
* **Quy chuẩn:** Trích xuất từ màn hình *Journal Voice Input* và *AI Chat Voice*:
  * Khối hiển thị các vạch sóng âm thanh dọc đa chiều cao màu nâu ngà.
  * Nút Mic tròn lớn ở giữa (Dark Brown) với bộ đếm thời gian thực (`00:05`).
  * 2 nút hành động tròn 2 bên (Hủy `✕` màu cam, Xác nhận `✓` màu xanh).

### 5.7. Thanh Điều hướng Đáy (Bottom Navigation Bar)
* **Quy chuẩn:** Nền trắng/kem sáng, bo cong 2 góc trên `24px` hoặc dạng dock nổi.
* **Bố cục:** 4-5 tab đối xứng, ở chính giữa là nút **FAB tròn nổi lên trên `14px`** tạo điểm nhấn trọng tâm cho hành động thêm mới nhanh.

### 5.8. Bottom Sheet & Modal
* **Quy chuẩn:** Trượt từ dưới lên, bo góc trên `32px`, có thanh kéo tay cầm nhỏ ở giữa (`width: 40px`, `height: 4px`, `border-radius: 9999px`).
* **Lưới hành động nhanh (Quick Log Grid):** Bố cục lưới 3 cột, mỗi ô gồm icon tròn nền trắng nổi trên nền kem canvas.

---

## 6. Phong cách Hình ảnh & Minh họa (Illustration Style)

* **Phong cách:** **Flat Editorial Vector Art** (Minh họa vector hiện đại, nét vẽ mượt mà, tối giản hóa chi tiết rườm rà).
* **Bảng màu minh họa:** Tone màu da tự nhiên kết hợp các mảng màu thương hiệu (xanh olive, cam đất, vàng mật ong, nâu ấm).
* **Iconography:** Nét vẽ mỏng (`stroke-width: 1.75px - 2px`), góc uốn tròn mềm, thường đặt trong khung tròn hoặc squircle nền màu nhạt.

---

## 7. Mã Nguồn CSS Design Tokens (Sẵn sàng import)

```css
/* ==========================================================================
   FREUD.AI WARM & EARTHY DESIGN SYSTEM TOKENS
   ========================================================================== */

:root {
  /* Brand Core Palette */
  --color-primary-dark: #33251F;
  --color-primary-dark-hover: #241914;
  --color-primary-brown: #4A372E;
  
  --color-sage: #8DA06F;
  --color-sage-dark: #748756;
  --color-sage-light: #E5ECD9;
  --color-sage-subtle: #F1F5EB;

  /* Mood & Metric Spectrum */
  --color-overjoyed: #7EAF50;
  --color-overjoyed-bg: #EEF7E6;
  --color-happy: #F5B842;
  --color-happy-bg: #FEF7E9;
  --color-neutral: #83583E;
  --color-neutral-bg: #F5EEE9;
  --color-sad: #E97332;
  --color-sad-bg: #FDF0E9;
  --color-depressed: #9477ED;
  --color-depressed-bg: #F3EFFD;

  /* Surfaces & Canvas */
  --color-canvas: #FAF8F5;
  --color-card-bg: #FFFFFF;
  --color-card-warm: #F6F3ED;
  --color-card-sage: #F2F6ED;

  /* Text & Borders */
  --color-text-primary: #2D231E;
  --color-text-secondary: #82776E;
  --color-text-muted: #B2A89F;
  --color-border-subtle: #ECE6DD;
  --color-border-hover: #D8CEBF;

  /* Border Radius Scale */
  --radius-xs: 8px;
  --radius-sm: 12px;
  --radius-md: 18px;
  --radius-lg: 24px;
  --radius-xl: 32px;
  --radius-pill: 9999px;

  /* Typography */
  --font-family-display: 'Outfit', -apple-system, sans-serif;
  --font-family-body: 'Plus Jakarta Sans', -apple-system, sans-serif;

  /* Shadows */
  --shadow-card: 0 4px 20px -2px rgba(51, 37, 31, 0.05);
  --shadow-card-hover: 0 8px 26px -4px rgba(51, 37, 31, 0.08);
  --shadow-floating: 0 8px 24px -2px rgba(51, 37, 31, 0.12);
  --shadow-bottom-nav: 0 -4px 20px rgba(51, 37, 31, 0.04);
  --shadow-modal: 0 -12px 32px rgba(51, 37, 31, 0.14);
}
```
