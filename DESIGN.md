# Dưới Núi Có Một Tiểu Viện — Design Doc

**Genre:** cozy narrative sim, seasonal progression, delayed consequences.
**Platform:** static web (vanilla JS, no backend, no API cost). Save = localStorage.
**Ngôn ngữ:** tiếng Việt. Văn ngắn, ít giải thích, có khoảng trống.

## Core loop
- 1 năm game = 4 mùa (Xuân → Hạ → Thu → Đông), mỗi mùa 12 ngày = 48 ngày.
- Mỗi ngày: 1 event, có thể gồm nhiều nhịp. Arc event đã lên lịch ưu tiên; không có thì rút từ season pool; không có nữa thì "ngày vắng" (solo choices).
- Mỗi choice: chỉnh chỉ số ẩn, set flags, có thể schedule arc node tương lai (day + N), unlock câu vào Sổ Nhỏ, thêm vật vào sân.
- Hết Đông ngày 48 → epilogue lắp ghép từ kết cục các arc + chỉ số.

## Chỉ số ẩn (không hiện số)
| Chỉ số | Ý nghĩa | Hiện qua |
|---|---|---|
| Tâm | vững vàng nội tâm | lời khuyên sâu hơn (mở choice) |
| Duyên | mối nối đã gieo | người cũ dễ quay lại (arc tốt) |
| Danh | tiếng ngoài đời | thêm khách đến, thêm phiền toái |
| Tĩnh | bình yên tiểu viện | mở choice "không làm gì" |
Hiển thị = 1 dòng mô tả sân đầu mỗi ngày, đổi theo chỉ số trội.
Không chỉ số nào "cao là tốt": Danh cao → event phiền toái vào pool; Tĩnh quá cao → vài NPC ngại tới.

## Arcs (nội dung chính, viết tay 100%)
1. **Mộc — thằng bé học kiếm.** 5 node. Nhánh theo lựa chọn ngày 1 (dạy kiếm / chẻ củi / kiếm gỗ / bảo về nghĩ). Chủ đề: vì sao cầm kiếm.
2. **Trần Thức — thư sinh tay áo có máu.** 4 node. Mystery nhẹ: máu của bạn đồng hành, hắn đã bỏ chạy. Chủ đề: hèn nhát và chuộc lỗi.
3. **Ông lão đánh cờ.** 4 node, kỳ ảo nhẹ kiểu Lạn Kha. Ván cờ kéo qua các mùa. Chủ đề: thời gian và buông.

Mỗi node/nhịp: text → 2–4 choices → resultText ngắn → có thể chuyển nhịp hoặc schedule node sau.
Arc có thể **chết** (NPC không quay lại) — đó cũng là một kết cục hợp lệ, có câu riêng trong Sổ Nhỏ.

## One-shots theo mùa (mỗi mùa 4–6)
Xuân: người trẻ. Hạ: nóng nảy, tranh chấp. Thu: thư cũ, người cũ. Đông: chia ly, bệnh, im lặng.
Ngày vắng (mưa/tuyết): Đọc sách / Vá mái hiên / Đánh cờ một mình / Ngồi nhìn mưa — mỗi cái có hậu quả trễ thật (vá mái → event đông; đọc sách → mở choice thư sinh...).

## Sổ Nhỏ Dưới Núi
Một số lựa chọn mở khóa câu đáng nhớ. Hiện có 28 câu; xem lại được từ menu.

## Sân tiểu viện
Vật xuất hiện từ chuyện đã qua (kiếm gỗ treo hiên, bàn cờ đá, chum nước, cây mai, con mèo...). Click vật → 1 dòng nhớ lại.

## Epilogue
Mỗi arc có 2–4 kết cục ngắn + 1 đoạn tổng theo chỉ số trội. Nút "Qua thêm một năm nữa" xóa save hiện tại và bắt đầu lại từ đầu.

## Tone chữ (bất di bất dịch)
- Không thuật ngữ tu tiên đao to búa lớn. Không giải thích bài học — người chơi tự nhận.
- Result text mẫu: "Thiếu niên ôm kiếm gỗ rời đi. Ngoài sân, lá trúc rơi rất chậm."

## Files
- `core.js` — logic game thuần, dùng chung cho browser và simulator
- `boot.js` / `index.html` / `style.css` — day loop và UI DOM
- `ink/scene.js` / `ink/scene.css` — scene painted, NPC, vật, thời tiết và hiệu ứng
- `audio.js` — ambient và SFX sinh bằng WebAudio
- `data/arcs.js`, `data/events.js`, `data/quotes.js`, `data/epilogue.js` — content
