# Tiến độ Lucky và thông tin bàn giao

Cập nhật: 07/11/2026, múi giờ Asia/Saigon. Đọc tệp này cùng `AGENTS.md` trước khi tiếp tục sau khi nén context. Các kết quả kiểm chứng dưới đây là của lượt triển khai gần nhất, cần chạy lại nếu đổi mã.

## Quy tắc làm việc

- Luôn trả lời và soạn tài liệu bằng tiếng Việt; bắt đầu câu trả lời bằng ⭐.
- Giữ nguyên chức năng hiện có khi chỉnh giao diện. Chỉ sửa nguồn; không sửa tay `dist/index.html` hoặc các tệp build.
- Dùng UTF-8 và kiểm tra dấu tiếng Việt sau khi viết tệp bằng PowerShell.
- Chưa khởi tạo Git tại lần kiểm tra gần nhất: `git status`/`git log` báo `not a git repository`. Không có danh sách commit hoặc baseline diff. Không tự tạo commit hay khởi tạo Git nếu chưa được yêu cầu.

## Đã hoàn thành

- Ứng dụng Vite + JavaScript ES modules + Canvas, tham khảo `wheelpage.png`.
- Nhập mỗi dòng một tên, cập nhật vòng quay ngay khi gõ; bỏ qua dòng rỗng và khoảng trắng đầu/cuối.
- Bấm vòng quay hoặc **Quay ngay** để quay, giảm tốc và chọn ngẫu nhiên bằng `crypto.getRandomValues`.
- Popup hiển thị tên trúng, âm thanh hợp âm “tada”, hiệu ứng theo giao diện; có đóng popup hoặc xoá đúng lượt vừa trúng.
- Tên trùng là các lượt độc lập, xác suất theo từng dòng. Xoá một người trúng không xoá mọi dòng cùng tên.
- Danh sách, kết quả và lựa chọn giao diện lưu trong localStorage: `lucky-names`, `lucky-history`, `lucky-theme`.
- Có trộn tên, sắp xếp A–Z, xoá toàn bộ danh sách, tab kết quả và nút bật/tắt âm thanh.
- Bốn giao diện: Mặc định, Giáng sinh, Tết Trung Thu, Tết Nguyên Đán.
- Bố cục responsive; bộ chọn giao diện và nút âm thanh không tràn ngang ở 320/360/390px. Có kiểm tra tablet 768/820px và desktop 1024/1440px.
- Làm mới giao diện bằng hướng dẫn `design-taste-frontend`: chữ rõ hơn, nền trung tính xanh lá, hai cột trên máy tính/một cột trên điện thoại, nút quay rõ ràng, trạng thái và focus/hover. Có **Tạm dừng trang trí / Tiếp tục trang trí** cho bánh và lồng đèn bay.

## Tệp và luồng quan trọng

| Tệp | Vai trò |
| --- | --- |
| `index.html` | Điểm vào Vite, metadata tiếng Việt; không nhầm với bản sinh trong `dist/`. |
| `src/main.js` | DOM, chọn giao diện, lưu dữ liệu, vẽ vòng quay, luồng quay/popup, Web Audio và hiệu ứng. |
| `src/wheel.js` | `parseNames`, `chooseEntry`, `removeEntry`, `secureRandom`; giữ định danh dòng để xử lý tên trùng. |
| `src/themes.js` | Registry theme, `resolveTheme`, `pointedIndex`, `pointerColor`. |
| `src/style.css` | Kiểu giao diện nền tảng, bố cục, typography, nút quay và responsive. |
| `src/themes.css` | Màu/nền/phông riêng theo `[data-theme="id"]`, hình bánh/lồng đèn và CSS animation. |
| `tests/` | Test logic bằng `node:test`. |
| `e2e/` | Playwright: luồng quay, giao diện, phông, Tết/Trung Thu và thiết kế mới. |
| `playwright.config.js` | Máy chủ test cổng 5173; có thể dùng lại máy chủ đang chạy. |

`applyTheme()` cập nhật `html.dataset.theme`, bảng màu, hình trong popup và vẽ lại vòng quay. Bộ chọn `#theme-select` vẫn được tạo riêng trong `main.js`, không tự sinh từ registry; option `tet` được append riêng. Khi thêm theme, phải cập nhật cả registry, bộ chọn, CSS và test.

`fireworks()` hiện phân nhánh theo `themes[theme].effect` (`apricot`, `snow`, còn lại là pháo hoa). Thông tin trong skill `add-wheel-theme` nói còn kiểm tra trực tiếp `theme === 'christmas'` đã cũ; luôn đối chiếu mã hiện tại. Chưa chỉnh lại skill sau các lần mở rộng.

## Quy ước bảng màu và hiệu ứng

Giao diện nền mới dùng các màu chính: nền `#f5f5ef`, chữ `#27302a`, nhấn xanh `#456f3a`, đường viền `#d7dbd0`, sân vòng quay `#e6ebdf`, dấu nhấn logo `#bc542b`. Hướng tham khảo là `green-mat-chocolate`; không áp nguyên starter landing page vào ứng dụng đang hoạt động.

| ID / nhãn | Bảng màu ô theo thứ tự | Hiệu ứng lúc chờ | Công bố |
| --- | --- | --- | --- |
| `default` / Mặc định | `#f4b942`, `#8560d5`, `#ee6b92`, `#37b4c5`, `#62b88f`, `#ef8b54`, `#6577d5`, `#d467ba` | Không | `fireworks`, pháo hoa nhiều màu, hình `✦ 🏆 ✦`. |
| `christmas` / Giáng sinh | `#b83243`, `#24765a`, `#bf8b30`, `#375f70`, `#8c2941`, `#43896b` | Không | `snow`, tuyết trắng/vàng phát sáng, hình `❄ 🎄 ❄`. |
| `mid-autumn` / Tết Trung Thu | `#a8393c`, `#98601e`, `#315e7b`, `#754d88`, `#277268`, `#a34d26` | Lồng đèn CSS bay trong vùng vòng quay | Giữ pháo hoa, bảng màu hạt và hình popup của Mặc định. |
| `tet` / Tết Nguyên Đán | `#aa2936`, `#397241`, `#9a621c`, `#a93d24`, `#6b4785`, `#24726d` | Bánh tét dạng đòn và bánh chưng vuông bằng CSS | `apricot`, hoa mai vàng năm cánh, hình `✿ 🧧 ✿`. |

- Tên trên canvas hiện màu trắng: ưu tiên màu ô đủ đậm, không chọn ô quá sáng nếu chưa đổi màu chữ tương ứng.
- Kim ở góc 0, lấy màu ô đang dưới kim cả khi quay và khi dừng. Lặp bảng màu theo chỉ số ô, không theo tên; danh sách rỗng dùng `#a79bac`.
- Lồng đèn/bánh ẩn khi quay hoặc popup mở, trở lại khi đóng popup. Chuyển giao diện phải ẩn đúng loại trang trí không liên quan.
- `data-idle-paused="true"` tạm dừng animation trang trí. CSS giảm chuyển động giữ bánh/lồng đèn tĩnh; hoa mai dùng vị trí tĩnh và giảm số lượng.
- Hiệu ứng công bố dùng `#fireworks`, Canvas và `requestAnimationFrame`; huỷ vòng cũ trước hiệu ứng mới, dọn khi kết thúc hoặc đóng popup. Popover manual đưa hiệu ứng lên trên backdrop, có kiểm tra API trước khi gọi.
- Hoa mai không được phủ lên popup/tên người trúng. Khi resize, phải quy đổi tọa độ popup từ CSS pixel về hệ tọa độ bitmap canvas.

## Kiểu chữ và độ đọc được

- Giao diện nền: **Noto Sans Variable**, tải cục bộ qua `@fontsource-variable/noto-sans`; `font-family: 'Noto Sans Variable'`.
- Giao diện lễ hội: **Noto Serif**, tải cục bộ qua `@fontsource/noto-serif`, các độ đậm 400/600/700/800. Đồng bộ trang, tiêu đề, ô nhập, popup và font Canvas; popup Trung Thu giữ chữ sans như Mặc định.
- Canvas Mặc định còn dùng `system-ui`; ba theme lễ hội dùng `"Noto Serif", serif`. `maxLabelSize` của Tết/Trung Thu là 48, còn các theme khác dùng mặc định 35. Canvas nội bộ 1000×1000 bị thu theo CSS, nên cỡ `ctx.font` không phải cỡ nhìn thấy trên điện thoại.
- Có listener `document.fonts.loadingdone` vẽ lại canvas khi không quay. Không chỉ đổi CSS mà quên tên được vẽ trực tiếp trên canvas.
- Không quay lại Georgia: đã xác nhận bằng CDP rằng Georgia xen Times New Roman khi thiếu glyph tiếng Việt. Kiểm tra bằng các tên như `Nguyễn Thị Hồng`, `Đặng Quốc Bảo`, `Dì Hương`, cả khi phông tải chậm.

## Các lỗi đã sửa

1. Phông Giáng sinh bị xen glyph/phông cho dấu tiếng Việt: chuyển Noto Serif đóng gói cục bộ, kiểm tra phông thực sự vẽ glyph và canvas sau tải phông.
2. Thanh công cụ tràn ở 320–360px: cho phép xuống dòng trên màn hình nhỏ, giữ nhãn giao diện đầy đủ.
3. Thiếu `showPopover` làm kẹt điều khiển sau công bố: kiểm tra hỗ trợ API, dùng optional call khi đóng.
4. Hoa mai phủ lên tên người trúng: tránh toàn bộ vùng popup và dọn hiệu ứng khi đóng.
5. Vùng tránh hoa mai lệch sau đổi kích thước: quy đổi tọa độ CSS sang bitmap; có test đổi từ 390×844 sang 900×650 khi hiệu ứng đang chạy.
6. Tương phản logo/đoạn hướng dẫn thấp trong lần làm mới UI: dùng màu nhấn đậm và tăng tương phản chữ.
7. Quá nhiều tệp phông sans theo độ đậm: chuyển sang Noto Sans Variable; số tệp tải ở giao diện mặc định giảm từ 10 xuống 3.

## Kiểm chứng gần nhất

```sh
npm ci
npm run dev
npm test
npx playwright install chromium
npm run test:e2e
npm run build
```

- `npm test`: **11/11 pass**.
- `npm run test:e2e`: **15/15 pass** trên Chromium, gồm test cũ và `e2e/design.spec.js` mới.
- `npm run build`: **thành công**.
- Đã xem ảnh desktop/tablet/mobile và popup lễ hội. Chỉ xác nhận Web Audio phát nốt, chưa xác nhận nghe trực tiếp qua loa hoặc thao tác trên điện thoại vật lý.
- URL cục bộ gần nhất: `http://127.0.0.1:5173/`, trả HTTP 200 cuối lượt. Tiến trình có thể hết sau khi đổi phiên; kiểm tra lại trước khi nói đang chạy. Các lần tự mở tab bằng công cụ trình duyệt không khả dụng; từng có lệnh mở bằng shell bị chặn. Không khẳng định đã mở tab nếu chỉ xác nhận máy chủ chạy.

## Giới hạn kiểm tra thiết kế và việc còn lại

Không còn hạng mục triển khai được người dùng yêu cầu đang chạy dở ở cuối lượt. Các điểm dưới đây là hạn chế/việc có thể làm tiếp nếu được yêu cầu, không phải tính năng đã được giao nhưng bỏ dở:

- `perf.mjs` trên bản build cuối ở 1440/390px: **0 FAIL, 2 WARN** về phông 213,7 KiB; tổng tải 229,3 KiB. Đây là đo cục bộ; có thể tối ưu subset phông thêm nhưng phải giữ dấu tiếng Việt.
- `consistency.mjs`: **117 FAIL, 19 WARN**, không được nói toàn bộ checker thiết kế pass. Đã đối chiếu: còn các nhóm quy tắc landing page (`hero-fill`, `hero-screen`, `section-height`, `one-section`, `one-screen`, `cta`, `copy-actions`, `flush`, `off-grid`, `section-gaps`, `container-edges`, `visual-caption`, `text-only`) và nhận diện động từ tiếng Anh (`copy-buttons`). Checker coi hai cột ứng dụng là section dọc hoặc yêu cầu CTA bán hàng. Giữ luồng ứng dụng theo yêu cầu người dùng, không thêm hero toàn màn hình hay section quảng bá để làm xanh checker. Lần cuối không có lỗi JavaScript hoặc cảnh báo tương phản ở năm kích thước.
- `assets/layout/check.mjs` của skill không hoàn tất: `Cannot read properties of undefined (reading 'map')`, rồi `r.sections is not iterable`. Kit kỳ vọng shell `.hero`/`.wrap`; không sửa kit để che lỗi, cũng không coi checker này đã pass.
- Một số ảnh tablet từ `shoot.mjs` ban đầu trắng; chạy lại `--wait 1500` cho ảnh đúng. Không suy ra ứng dụng trắng chỉ từ một ảnh công cụ.
- Báo cáo chi tiết và ảnh: `test-results/design-review.md`, `test-results/design-final-audit/report.json`, `design-1440.png`, `design-1024.png`, `design-820-retry.png`, `design-768-retry.png`, `design-390.png`. **`test-results/` bị ignore và có thể bị Playwright xoá khi chạy lại**; các quyết định cần giữ đã được chép vào PROGRESS này.
- Có thể cập nhật skill `add-wheel-theme` cho khớp dispatcher hiệu ứng và các theme mới; chưa làm vì yêu cầu vừa rồi là thay giao diện ứng dụng, không phải sửa skill.
- Chưa xác minh Safari/Firefox, điện thoại vật lý hay âm thanh qua loa. Không có yêu cầu deploy, khởi tạo Git hoặc tạo commit đang chờ.

## Skills đã thêm trong project

- `.agents/skills/add-wheel-theme/SKILL.md`: viết tiếng Việt, hướng dẫn thêm theme, đăng ký bộ chọn, phông, màu kim, hiệu ứng, đọc được trên điện thoại và test. Đã qua validator lúc tạo; một số mô tả mã cũ cần đối chiếu như ghi ở trên.
- `.agents/skills/design-taste-frontend/`: cài từ `leonxlnx/taste-skill`, tên frontmatter `design-taste-frontend`, bản nguồn ghi 2.5.0; đầy đủ tài nguyên và LICENSE MIT. Không dịch/sửa kit nhập từ nguồn. Validator đã pass lúc cài.
- Khi dùng checker/ảnh của skill trên Windows, đặt `CHROME_PATH` bằng `node -p "require('playwright').chromium.executablePath()"`; chạy trên `dist/index.html` kèm `--root dist`. Chạy các script kiểm tra Chrome tuần tự. Báo cáo đúng lỗi công cụ và ngoại lệ, không thay đổi chức năng ứng dụng để ép theo cấu trúc landing page.
