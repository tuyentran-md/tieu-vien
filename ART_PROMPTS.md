# Bộ prompt ảnh — Tiểu Viện Dưới Núi

Mục tiêu: một bộ hình **đồng bộ một phong cách** để thay hết SVG. Tạo trong **một project GPT-image** (hoặc Midjourney/NanoBanana), giữ nguyên style anchor + seed để các hình ăn khớp với nền tranh đã có.

Nền hiện dùng: `assets/art/courtyard-master-clean-xuan.png` — hãy đính kèm ảnh này làm **style reference** cho mọi lần tạo, để ánh sáng/màu/chất cọ khớp.

---

## 0. STYLE ANCHOR (dán vào đầu MỌI prompt)

```
STYLE: traditional East-Asian ink-and-color landscape painting (thủy mặc / gongbi-lite),
soft muted earth palette on warm rice-paper tone, gentle watercolor washes with fine ink
linework, hand-painted gouache feel, diffuse overcast morning light, low contrast, calm and
contemplative mood, subtle paper grain, no harsh outlines, no cel-shading, no anime, no 3D
render, no glossy digital look. Painterly, quiet, aged. Muted sage green / ochre / stone grey /
soft indigo. Consistent with the attached reference painting.
```

Quy ước xuất (mọi nhân vật & vật):
- **Nền trong suốt** (transparent PNG), chỉ vẽ đối tượng + bóng đổ mềm dưới chân.
- **Toàn thân, đứng thẳng, nhìn hơi nghiêng 3/4**, tầm nhìn ngang (eye-level), cỡ dọc.
- Bóng đổ: một vệt ellipse mờ dưới chân, không đổ bóng cứng.
- Cùng một **hướng sáng** (dịu, từ trên-trái) cho tất cả để ghép vào sân không lệch.
- Đặt **cùng một seed** cho mỗi nhân vật khi làm biến thể, để giữ nhận diện.

Cỡ đề xuất: nhân vật 768×1024 (dọc), vật 768×768, nền 1920×1080 (16:9).

---

## 1. NỀN (backgrounds)

Đã có bản xuân. Nếu muốn 4 mùa rõ (khuyến nghị — để "một năm" cảm được):

**Nền — khung chung**
```
[STYLE ANCHOR]
A small courtyard temple/retreat at the foot of misty layered mountains. Left: an old wooden
gate in a low earthen wall, tall bamboo grove. Center: worn stone-slab path, a stone lantern,
an old gnarled tree. Right: a wooden house with curved tiled roof, raised porch, paper lattice
windows, a low tea table, a water jar. Distant peaks fading into fog. 16:9 frame, empty of people,
eye-level, painterly, tranquil.
```
Biến thể mùa (thêm vào cuối):
- **Xuân:** `spring — faint plum blossoms near the porch, soft new green, thin drifting mist, a few petals in the air.`
- **Hạ:** `summer — deep lush greens, warm hazy light, cicada-still air, denser foliage.`
- **Thu:** `autumn — ochre and rust foliage, fallen leaves on the stone path, high clear pale sky, dry grass.`
- **Đông:** `winter — bare tree, thin snow on the roof and ground, pale grey-blue light, a single plum branch blooming, still and silent.`

> Lưu ý: giữ **bố cục y hệt** (cổng trái – cây giữa – nhà phải) ở cả 4 mùa để chuyển mùa không giật. Cách chắc nhất: đưa bản xuân làm reference + chỉ đổi mô tả mùa.

---

## 2. NHÂN VẬT

Mỗi nhân vật: prompt gốc + ghi chú biến thể. Giữ **transparent PNG, toàn thân, 3/4**.

### Mộc — thiếu niên học kiếm (`boy`)
```
[STYLE ANCHOR]
Full-body cutout, transparent background. A thin peasant boy about 12, tanned face, barefoot,
patched short hemp tunic and loose trousers, tousled hair. He holds a slender leafless bamboo
switch in both hands, a little solemn, a little hopeful. Shy posture, shoulders slightly drawn in.
Soft shadow under feet. Painterly ink-and-color, muted tones.
```
Biến thể:
- **Đông / cuối mạch:** cao hơn nửa cái đầu, áo bông cũ, dáng đứng thẳng và tự tin hơn, có thể mặc áo võ quán bạc màu (nhánh nhân vật đi huyện).
- **Cảm xúc:** một bản mặt tươi (vừa thắng), một bản mặt bầm tím một bên (sau chợ phiên).

### Trần Thức — thư sinh tay áo có máu (`scholar`)
```
[STYLE ANCHOR]
Full-body cutout, transparent background. A young scholar in a faded blue-grey robe with crossed
collar and cloth belt, a book-satchel wrapped in oilcloth slung on his back, hair in a topknot.
Refined but travel-worn, a quiet unease in his eyes. Standing, hands together in a slight bow.
Soft shadow under feet. Painterly ink-and-color, muted tones.
```
Biến thể:
- **Đêm mưa (mở mạch):** áo ướt sũng, tay ôm tráp sách, một vệt máu khô mờ nơi ống tay áo, cầm đèn lồng giấy nhỏ.
- **Thu (quay lại):** gầy hơn, áo cũ hơn, mắt nhìn thẳng và bình tĩnh hơn.

### Ông lão đánh cờ (`oldman`)
```
[STYLE ANCHOR]
Full-body cutout, transparent background. An old man in a pale white-grey robe, long thin silver
beard, holding a bamboo staff. Serene, otherworldly, slightly translucent as if half-mist. He
looks like someone who has been waiting a very long time. Soft shadow under feet, faint. Painterly
ink-and-color, muted tones.
```
Biến thể:
- **Đông (ván tàn):** áo trắng lẫn vào tuyết, càng mờ ảo hơn, gần như không có bóng.

### Khách cờ trung niên — con trai người xưa (`oldman2`)
```
[STYLE ANCHOR]
Full-body cutout, transparent background. A middle-aged man in coarse brown cloth, build of a
farmer but ink-stained calloused fingers of someone who once held a brush. Weathered, quietly
shaken. Standing, looking down as if at a chessboard. Soft shadow under feet. Painterly, muted.
```

### Kiếm khách (`swordsman`)
```
[STYLE ANCHOR]
Full-body cutout, transparent background. A wandering swordsman in a dark travel robe, a well-kept
old sword at his hip with a worn but carefully oiled scabbard and a red tassel, a headband. Rough
but with a hidden discipline. Soft shadow under feet. Painterly, muted.
```
Biến thể:
- **Hạ (say):** nằm/ngồi bệt, say rượu, áo xộc xệch, một bầu rượu, mặt đỏ.
- **Đông (tỉnh, quay lại):** đứng thẳng, áo gọn, tay cầm một vò rượu, thần thái điềm tĩnh.

### Tăng nhân qua đường (`monk`)
```
[STYLE ANCHOR]
Full-body cutout, transparent background. A travelling Buddhist monk, shaved head, ochre-brown
kasaya robe worn across one shoulder, a conical straw hat hanging at his back, a wooden prayer-bead
bracelet, a simple staff. Calm, weightless presence. Soft shadow under feet. Painterly, muted.
```

### Cô gái hái thuốc (`woman`)
```
[STYLE ANCHOR]
Full-body cutout, transparent background. A young woman in a plum-brown short jacket and skirt, a
woven herb-basket on her back with a few sprigs poking out, hair in a low bun, sleeves tied for
work. Bright, talkative energy softened by grief. Soft shadow under feet. Painterly, muted.
```
Biến thể: **trú mưa:** tóc ướt lấm tấm, ôm gùi thuốc, dáng vừa chạy vào tránh mưa.

### Con bé dưới chân núi (`child`)
```
[STYLE ANCHOR]
Full-body cutout, transparent background. A small village girl about 7, round rosy cheeks, hair in
two little buns, simple padded tunic. Curious, open-faced, looking up as if asking a question.
Soft shadow under feet. Painterly, muted.
```
Biến thể: **xuân:** ôm một rổ măng dính đất. **đông:** hai má đỏ ửng, ôm mấy củ khoai nướng trong vạt áo.

### Người mẹ tìm con (`oldwoman`)
```
[STYLE ANCHOR]
Full-body cutout, transparent background. A weary middle-aged/old woman in faded brown, a cloth
head-wrap, a walking stick. Tired feet, patient sorrow in her face, a woman who has walked far.
Soft shadow under feet. Painterly, muted.
```

### Người buôn đường núi (`trader`)
```
[STYLE ANCHOR]
Full-body cutout, transparent background. A travelling pedlar with a shoulder carrying-pole, two
cloth bundles of goods balanced at each end, a topknot, sturdy plain clothes, a shrewd friendly
face. Soft shadow under feet. Painterly, muted.
```

### Dân làng (`villager`)
```
[STYLE ANCHOR]
Full-body cutout, transparent background. A plain mountain villager in undyed hemp work clothes,
sun-worn, a cloth at the waist. Honest, unremarkable, standing as if come to ask a favour. Soft
shadow under feet. Painterly, muted.
```

### Người đưa thư / khách nón lá (`master` / `traveler`)
```
[STYLE ANCHOR]
Full-body cutout, transparent background. A traveller in a dark plain robe under a wide conical
straw hat that shadows the face, carrying a satchel. Anonymous, passing-through. Soft shadow under
feet. Painterly, muted.
```
Biến thể: **bão tuyết (d_baotuyet):** một người cha và một đứa con đội nón, gánh hàng, tuyết bám vai, dáng lỡ đường co ro.

---

## 3. VẬT TRONG SÂN (items — transparent PNG, 768×768)

- **kiem_go_hien** — `A worn wooden practice sword leaning against a wooden porch pillar, scratched from use, a faded cloth grip. Painterly, muted, transparent background.`
- **ban_co** — `An old weathered stone Go/chess board table under a tree, a half-finished game of black and white stones scattered mid-battle, a few fallen leaves on the rim but none on the stones. Painterly, muted, transparent background.`
- **quan_co_khuyet** — `A single white Go stone with a small chip missing from one edge, resting on stone. Extreme simplicity, painterly, transparent background.`
- **buc_thu** — `A folded letter on aged paper with elegant brush calligraphy (illegible), resting on a wooden surface. Painterly, muted, transparent background.`
- **cay_mai** — `A small potted/planted apricot (mai) tree in a corner of a courtyard; a bare-branch winter version blooming with pale pink-white blossoms. Painterly, muted, transparent background.` (làm 2 bản: non mới trồng / nở hoa mùa đông)
- **la_de** — `A single bodhi leaf pressed between the pages of an open old book. Painterly, muted, transparent background.`
- **con_meo** — `A thin calico cat curled asleep on a wooden porch step, content. Painterly, muted, transparent background.` (thêm bản: mèo gầy ướt tuyết, mắt cảnh giác — lúc mới tới)

---

## 4. QUY TRÌNH GIỮ ĐỒNG BỘ

1. Tạo **nền 4 mùa trước**, chốt xong mới làm nhân vật (để lấy đúng tông sáng).
2. Mỗi nhân vật: tạo **bản gốc**, ưng ý thì **khóa seed** và tạo biến thể mùa/cảm xúc từ đó → giữ khuôn mặt & trang phục nhất quán.
3. Luôn đính kèm **1 nhân vật đã duyệt + nền** làm reference cho lần kế → cả bộ cùng "một cây cọ".
4. Xuất PNG nền trong suốt. Nếu model không tách nền tốt: xuất nền phẳng màu xám trung tính rồi tách sau (remove.bg / Photoshop).
5. Đặt tên file theo id có sẵn để em ghép thẳng vào scene: `npc-boy.png`, `npc-boy-dong.png`, `npc-scholar-rain.png`, `item-ban_co.png`, `bg-ha.png`… Bỏ vào `assets/art/`.
6. Gửi em 1–2 hình mẫu trước; em sẽ dựng lớp overlay + tọa độ + cơ chế đổi biến thể (mùa/cảm xúc/cầm vật) trong `ink/scene.js`, thay dần SVG.

> Khi có bộ ảnh, đợt sau em sẽ: thay figure SVG bằng ảnh cutout theo vai + biến thể, ghép item bằng ảnh, và (nếu làm 4 nền mùa) chuyển nền theo mùa thay vì lọc CSS.

---

## 5. TÁI BỐ CỤC NỀN — bàn trà + bàn cờ (yêu cầu của sếp)

Vấn đề bản hiện tại (`courtyard-master-spring-bright.png`): bàn trà nhỏ và **sát mép phải**, khó ghép; bàn cờ (overlay `it-ban_co`) lại ở **giữa-trái dưới gốc cây**, xa bàn trà. Sếp muốn **bàn cờ nằm cạnh bàn trà**, bàn trà **to hơn và kéo vào trong**.

Cách chắc nhất: **giữ y hệt bố cục lớn** (cổng trái – cây giữa – nhà phải) bằng cách đính `courtyard-master-spring-bright.png` làm reference, chỉ đổi vùng hiên/sân phải. Xuất `courtyard-master-spring-bright.png` (đè bản cũ) cỡ 1920×1080 (16:9).

```
[STYLE ANCHOR]
Redraw of the attached courtyard painting — KEEP the same overall layout, palette, light and
brush feel: wooden gate + bamboo on the left, worn stone path and old gnarled tree in the
center, wooden house with curved tiled roof and raised porch on the right. ONLY change the porch
/ right-foreground area: make the low wooden tea table noticeably LARGER and moved INWARD from
the edge onto the porch (not touching the frame), with a small teapot and two cups and a faint
wisp of steam. Beside the tea table, set a low stone GO/weiqi board table with a few black and
white stones, as if two people just paused a game over tea. Both tables share the porch, close
together, unhurried. Keep everything else identical to the reference. 16:9 frame, eye-level,
empty of people, painterly ink-and-color, muted sage/ochre/stone, tranquil.
```

Sau khi có nền mới:
- Dời overlay `it-ban_co` (và `fx-danh_co_mot_minh`, `it-quan_co_khuyet`) trong `ink/scene.js` sang toạ độ cạnh bàn trà (vùng ~62–72% ngang, ~62–68% dọc) cho khớp ảnh, rồi eyeball lại.
- Nếu làm 4 nền mùa, giữ đúng chỗ hai bàn ở cả bốn để chuyển mùa không giật.
