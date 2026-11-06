# Lucky — Vòng quay may mắn

## Giao diện ứng dụng

Màn hình chính có bố cục hai cột trên máy tính, một cột trên điện thoại; có thể quay bằng cách bấm vòng quay hoặc nút **Quay ngay**. Bộ chọn giao diện và nút âm thanh vẫn nằm ở đầu trang. Ở giao diện Tết và Trung Thu, nút **Tạm dừng trang trí** cho phép dừng hoặc tiếp tục bánh/lồng đèn bay. Phông chữ giao diện được đóng gói cục bộ và hỗ trợ tiếng Việt.

## Giao diện

**Tết Nguyên Đán** dùng sắc đỏ, vàng và xanh lá, phông Noto Serif hỗ trợ tiếng Việt. Bánh tét và bánh chưng bay khi chờ quay; hoa mai vàng năm cánh rơi khi công bố người trúng. Khi bật giảm chuyển động, bánh và hoa được hiển thị tĩnh.

**Tết Trung Thu** có nền đêm trăng, vòng quay đỏ–vàng–xanh và phông Noto Serif hỗ trợ tiếng Việt. Lồng đèn bay trong khu vực vòng quay khi chờ, ẩn trong lúc quay và công bố, rồi xuất hiện lại khi đóng kết quả. Công bố người trúng giữ pháo hoa và popup của giao diện Mặc định. Tuỳ chọn giảm chuyển động chuyển lồng đèn thành trang trí tĩnh.

Chọn **Mặc định** hoặc **Giáng sinh** trên thanh đầu trang. Mỗi giao diện có bảng màu vòng quay, nền và kiểu chữ riêng; khi công bố kết quả, Mặc định có pháo hoa, Giáng sinh có tuyết rơi phát sáng. Lựa chọn được lưu trên trình duyệt. Không đổi giao diện trong lúc quay. Mũi tên lấy màu ô hiện nằm dưới kim và trở về màu trung tính nếu danh sách rỗng.

Ứng dụng Vite, JavaScript và Canvas. Danh sách và lịch sử được lưu bằng localStorage trên trình duyệt hiện tại.

## Chạy ứng dụng

```sh
npm install
npm run dev
```

## Kiểm chứng

```sh
npm test
npx playwright install chromium
npm run test:e2e
npm run build
```

Test logic kiểm tra khoảng chọn ngẫu nhiên, dòng trống và tên trùng. Test trình duyệt thực hiện nhập tên, quay đủ thời gian, mở/đóng hộp thoại, xoá đúng một tên trùng, tải lại để kiểm tra lịch sử, bố cục 390px và các nút danh sách. Ảnh kiểm chứng được ghi vào `test-results/`.

Tên trùng được tính là các lượt tham gia độc lập. Xoá người trúng chỉ xoá đúng dòng vừa được chọn. Kết quả cũ vẫn còn trong lịch sử. Âm thanh hợp âm “tada” được tổng hợp bằng Web Audio sau thao tác quay; có nút bật/tắt âm thanh.
