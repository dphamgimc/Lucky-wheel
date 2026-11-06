---
name: add-wheel-theme
description: Thêm giao diện theo dịp lễ vào ứng dụng vòng quay Lucky trong repository này, bao gồm đăng ký trong bộ chọn, bảng màu vòng quay, nền, phông tiếng Việt, hiệu ứng công bố và test. Dùng khi người dùng yêu cầu thêm theme như Tết, Trung thu hoặc Halloween; không dùng cho website khác hay chỉ rà soát lỗi mà không thêm giao diện.
---

# Thêm giao diện dịp lễ cho vòng quay

Đọc `AGENTS.md` ở gốc repository và đối chiếu mã hiện tại trước khi sửa. Các đường dẫn dưới đây tính từ gốc repository, không phải từ thư mục skill. Viết giao diện và báo cáo bằng tiếng Việt; chỉ triển khai dịp lễ được yêu cầu, giữ hoạt động của các giao diện đã có.

## Xác định các điểm tích hợp

- `src/themes.js`: registry `themes`, mỗi mục có `colors`, `font`, `effect`, `art`; `resolveTheme()` xác thực lựa chọn đã lưu; `pointedIndex()` và `pointerColor()` dùng chung cho kim.
- `src/themes.css`: CSS riêng theo `[data-theme="theme-id"]`; `src/style.css` chứa kiểu nền tảng và các quy tắc `font` có thể ghi đè kế thừa.
- `src/main.js`: tạo `<select id="theme-select">`, áp dụng theme, lưu `lucky-theme` vào localStorage, vẽ canvas và chạy `fireworks()` khi công bố. Phông Noto Serif được import tại đây; sự kiện `document.fonts.loadingdone` vẽ lại canvas khi không quay.
- `tests/themes.test.js`, `e2e/themes.spec.js`: kiểm tra theme, màu kim, lưu lựa chọn, hiệu ứng; `e2e/fonts.spec.js`: mẫu kiểm chứng glyph tiếng Việt và tải phông chậm; `e2e/app.spec.js` kiểm tra luồng quay chung.

## Triển khai giao diện

1. Chọn ID ổn định dạng kebab-case, ví dụ `mid-autumn`, và nhãn tiếng Việt. Nếu chưa rõ dịp lễ, hỏi trước; nếu đã rõ thì tự chọn màu và hình thức phù hợp với yêu cầu.
2. Thêm mục vào `themes`: bảng `colors` không rỗng, chuỗi `font` hợp lệ cho Canvas, mã `effect` và biểu tượng `art`. Không đổi ID giao diện cũ vì lựa chọn được lưu trên trình duyệt.
3. Thêm option tương ứng vào `#theme-select`. Hiện option được viết tay, **không tự sinh từ registry**. Xác nhận ID trong option, registry và CSS khớp nhau; lựa chọn vẫn bị khoá trong lúc quay.
4. Thêm CSS có phạm vi theme cho nền trang, vùng vòng quay, panel, tiêu đề, điều khiển và popup. Kiểm tra trạng thái focus/disabled. Giữ chữ và ô có tương phản rõ: tên canvas hiện được vẽ màu trắng, nên màu ô quá sáng sẽ khó đọc. Nếu cần màu sáng, điều chỉnh màu chữ tương ứng và kiểm tra lại.
5. Đồng bộ phông của trang, tiêu đề, textarea, tên trúng thưởng và `themes[id].font` trên canvas. Ưu tiên phông đã đóng gói có tiếng Việt; nếu thêm phông mới, kèm tài nguyên và các độ đậm thực sự dùng (canvas hiện dùng 600, tiêu đề dùng 800). Cập nhật dependency/lockfile khi cần. Giữ cơ chế vẽ lại sau khi phông tải xong.
6. Triển khai hiệu ứng công bố phù hợp dịp lễ và nối vào luồng công bố thật. **Hiện `fireworks()` kiểm tra `theme === 'christmas'`, còn `effect` chỉ được ghi vào `data-effect`.** Chỉ thêm tên hiệu ứng trong registry sẽ không chạy hiệu ứng mới. Có thể chuyển sang chọn theo `effect` trong phạm vi cần thiết; giữ pháo hoa và tuyết của các theme cũ.
7. Giữ huỷ vòng `requestAnimationFrame` trước khi tạo hiệu ứng mới, dọn canvas khi xong, không chặn nút đóng/xoá. Xác nhận hiệu ứng hiện trên backdrop của dialog. Nếu dùng Popover API, có dự phòng khi API thiếu; lỗi hiệu ứng không được khiến điều khiển bị khoá. Với hiệu ứng mới, có phương án giảm chuyển động theo tuỳ chọn hệ thống.

Không đổi thuật toán chọn người thắng, xác suất của tên trùng hoặc cấu trúc lịch sử chỉ để thêm giao diện. Màu kim phải tiếp tục lấy từ bảng màu của **ô đang dưới kim**, không gán cố định theo dịp lễ; khi không có tên, dùng màu trung tính.

## Những lỗi cần tránh và cách kiểm chứng

- **Chữ nhỏ khi thu canvas:** canvas có kích thước nội bộ 1000px và được thu bằng CSS. Cỡ chữ trong `ctx.font` không phải cỡ nhìn thấy; kiểm tra ảnh với danh sách mẫu, tên dài và nhiều người trên điện thoại. Không thu nhỏ toàn bộ chữ để vừa tên; giữ giới hạn độ dài hợp lý và hiển thị tên đầy đủ trong popup.
- **Dấu tiếng Việt lệch phông:** Georgia từng phải xen Times New Roman cho ký tự thiếu. Thử `Nguyễn Thị Hồng`, `Đặng Quốc Bảo`, `Dì Hương`; kiểm tra cả tiêu đề, ô nhập, canvas và người trúng. Chỉ kiểm tra `font-family` CSS là chưa đủ. Dùng mẫu CDP trong `e2e/fonts.spec.js` để xác nhận phông thực sự vẽ glyph, kết hợp ảnh chụp và test tải phông chậm/chặn dịch vụ phông ngoài.
- **Phông kế thừa không đầy đủ:** `h1`, `.brand>span`, `#winner-name` có khai báo `font` riêng. Kiểm tra từng vùng sau đổi theme. Nếu dùng nhiều subset phông, giữ `unicode-range` đúng để Latin và tiếng Việt cùng thuộc một họ phông.
- **Tràn thanh công cụ:** kiểm tra 320px, 360px, 390px và máy tính; không chỉ kiểm tra 390px như test cũ. Không để nhãn giao diện hoặc nút âm thanh ra ngoài màn hình, và không che lỗi bằng `overflow-x: hidden`.
- **Test chỉ nhận hai giao diện:** vòng lặp hiện chỉ có `default`, `christmas`, kèm ternary về palette/effect. Bổ sung dữ liệu kỳ vọng rõ ràng cho giao diện mới; đừng để giao diện thứ ba tự dùng kỳ vọng Giáng sinh.

## Test và bàn giao

Thêm test Node cho registry mới, `resolveTheme(id)` và màu kim với bảng màu mới, gồm danh sách rỗng/một người/nhiều người. Thêm test Playwright chọn giao diện qua UI, tải lại để kiểm tra lưu, đổi về giao diện cũ, kiểm tra nền/phông/màu canvas và màu kim lúc quay lẫn dừng. Quay thật tới popup; kiểm tra có hạt hiệu ứng được vẽ chứ không chỉ có `data-effect`. Thử đóng và xoá đúng một dòng tên trùng, rồi quay tiếp.

Chạy từ gốc repository:

```sh
npm test
npm run test:e2e
npm run build
```

Nếu thiếu Chromium, chạy `npx playwright install chromium`. Playwright dùng cổng 5173 và có thể dùng lại máy chủ: xác nhận đó là đúng ứng dụng. Xem trực tiếp ảnh desktop/mobile và popup trong `test-results/`; test pass không chứng minh chữ dễ đọc. Chỉ báo hoàn tất khi kiểm chứng thành công; nếu công cụ bị chặn, nêu phần chưa xác nhận. Không khẳng định đã nghe qua loa khi chỉ kiểm tra Web Audio.

Sửa nguồn, không sửa tay `dist/`. Cập nhật mô tả theme trong `README.md` nếu cần. Bàn giao ngắn gọn: ID/nhãn theme, thay đổi hình thức và hiệu ứng, lệnh cùng kết quả kiểm chứng, hạn chế còn lại.
