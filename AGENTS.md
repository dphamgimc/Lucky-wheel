# Repository Guidelines

## Cấu trúc dự án

Ứng dụng vòng quay chạy hoàn toàn trên trình duyệt, dùng Vite và JavaScript ES modules.

- `index.html`: điểm vào HTML để chỉnh sửa.
- `src/main.js`: giao diện, hoạt ảnh, âm thanh và lưu trữ; `src/wheel.js`: chọn và xoá tên; `src/style.css`: kiểu dáng.
- `tests/*.test.js`: kiểm thử logic; `e2e/*.spec.js`: kiểm thử trình duyệt bằng Playwright.
- `wheelpage.png`: ảnh tham khảo giao diện.
- `dist/`: kết quả build. Chỉnh sửa mã nguồn, không sửa trực tiếp `dist/index.html`. Không commit `node_modules/` hoặc kết quả kiểm thử.

## Lệnh phát triển, kiểm thử và build

- `npm ci`: cài thư viện theo `package-lock.json`.
- `npm run dev`: chạy Vite cục bộ; mở URL được in ra.
- `npm test`: chạy kiểm thử logic bằng bộ chạy tích hợp của Node.
- `npx playwright install chromium`: cài trình duyệt cho kiểm thử E2E.
- `npm run test:e2e`: chạy Playwright, khởi động hoặc dùng lại máy chủ cổng 5173.
- `npm run build`: tạo bản triển khai trong `dist/`.

## Quy ước mã nguồn

Thụt lề hai dấu cách cho khối JavaScript mới, dùng ES module imports, camelCase cho hàm và biến, kebab-case cho lớp CSS và ID HTML. Giữ phong cách mã xung quanh, tránh định dạng lại phần không liên quan. Chưa cấu hình formatter hoặc linter. Lưu văn bản bằng UTF-8 và giữ tiếng Việt trên giao diện.

## Hướng dẫn kiểm thử

Đặt kiểm thử logic trong `tests/`, luồng thao tác trong `e2e/`. Tên kiểm thử cần mô tả hành vi. Chưa có ngưỡng độ bao phủ; kiểm tra hành vi thay đổi, đặc biệt tên trùng, đầu vào rỗng, vị trí kim, giảm tốc, lưu dữ liệu và bố cục điện thoại. Tên trùng là các lượt riêng biệt; chỉ xoá đúng dòng vừa trúng.

Khi đổi hành vi, toàn bộ kiểm thử và build phải thành công. Thực hiện thao tác trình duyệt và kiểm tra ảnh trong `test-results/`. Phân biệt xác nhận phát Web Audio với việc thực sự nghe âm thanh qua loa.

## Quy ước commit và pull request

Thư mục hiện chưa có lịch sử Git để suy ra quy ước commit. Dùng tiêu đề ngắn, nêu hành động, ví dụ `Sửa xoá người trúng có tên trùng`. PR cần mô tả thay đổi, liên kết issue liên quan, ghi lệnh kiểm chứng và kết quả; kèm ảnh máy tính và điện thoại nếu sửa giao diện.

## Quy tắc dành cho agent

Luôn viết bằng tiếng Việt khi trả lời người dùng và soạn tài liệu cho repository này; giữ nguyên tên lệnh, đường dẫn và định danh mã nguồn khi cần.

Bắt đầu mọi câu trả lời cho người dùng bằng biểu tượng ngôi sao (⭐). Khi chỉ sửa tài liệu, không thay đổi mã nguồn hoặc các tệp sinh tự động không liên quan.
