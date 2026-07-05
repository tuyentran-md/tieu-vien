// ===== ARCS — nội dung chính, 3 arc viết tay =====
// Node schema:
// { title, paras:[{text, if?:flag, ifNot?:flag}], choices:[{label, if?, ifNot?, req?:{stat,min}, result, effects?, flags?, schedule?:{node,delay}, quote?, item?, kill?:arcId }] }
// effects: {tam,duyen,danh,tinh} ; schedule.delay tính từ ngày hiện tại.
//
// Giọng văn: hình ảnh đi trước, kết luận nhường cho người chơi.
// Result để dư âm ở vật, thời tiết, nhịp tay, chỗ im lặng — không giải nghĩa.

const ARC_STARTS = [
  { day: 1, node: "moc_1" },
  { day: 5, node: "co_1" },
  { day: 7, node: "thu_1" },
];

const ARCS = {

  // ============================================================
  // ARC 1 — MỘC, thằng bé học kiếm
  // ============================================================

  moc_1: {
    title: "Bóng nhỏ ngoài cổng",
    paras: [
      { text: "Sương còn nằm ngang lối đá. Ngoài cổng, một đứa trẻ đứng từ lúc bếp chưa đỏ lửa; áo vá ở vai, chân đất, hai tay giữ một nhánh trúc đã tước sạch lá." },
      { text: "Bạn mở cổng. Nó lùi nửa bước, như sợ tiếng then cửa cũng có thể làm mình sai." },
      { text: "Mãi một lúc sau, nó mới nhìn vào khoảng sân sau lưng bạn: “Học kiếm… có thể không bị bắt nạt nữa không?”" },
    ],
    choices: [
      {
        label: "Nhận nhánh trúc, bảo nó thử một đường trước sân.",
        result: "Nhánh trúc đi qua tay nó một lần đã thành một vệt rất thẳng. Đứa trẻ mừng quá, quên cả vết đất ở gót chân. Lúc nó xuống dốc, sân vẫn còn tiếng áo quệt qua hàng trúc.",
        effects: { danh: 1 },
        flags: ["moc_som"],
        schedule: { node: "moc_2a", delay: 9 },
      },
      {
        label: "Dẫn nó ra sau nhà, đặt cây rìu bên đống củi.",
        result: "Nó nhìn cây rìu, rồi nhìn hai bàn tay mình. Một lát sau, tiếng củi tách ra trong sương sớm — khô, gọn, tiếng sau chắc hơn tiếng trước.",
        effects: { tam: 1 },
        flags: ["moc_cui"],
        schedule: { node: "moc_2b", delay: 9 },
      },
      {
        label: "Lấy thanh kiếm gỗ cũ trên hiên, trao mà không giảng giải.",
        result: "Nó đỡ thanh kiếm bằng cả hai tay, nghiêm trang như nhận một thứ nặng hơn gỗ. Suốt quãng dốc xuống núi, nó không đổi tay lấy một lần. Sương trên lối đá tan lúc nào không hay.",
        effects: { duyen: 1 },
        flags: ["moc_go"],
        item: "kiem_go_trao",
        schedule: { node: "moc_2c", delay: 9 },
      },
      {
        label: "Rót một chén nước, hỏi nó muốn cầm kiếm để làm gì.",
        result: "Nó cúi đầu rất thấp. Câu trả lời mắc ở cổ, chưa ra được. Bạn để chén nước trên bậc đá; đến khi nó đi rồi, trong chén vẫn còn một vòng sương mỏng.",
        effects: { tinh: 1 },
        flags: ["moc_ve"],
        schedule: { node: "moc_2d", delay: 11 },
      },
    ],
  },

  // ---- Node 2: bốn lối vào, hội tụ dần ----

  moc_2a: {
    title: "Mộc quay lại, mắt sáng",
    paras: [
      { text: "Chưa tới cổng đã nghe tiếng nó gọi. Mộc chạy một mạch lên dốc núi mà không mệt — nó vừa thắng thằng lớn nhất trong đám hay chặn đường nó." },
      { text: "“Chỉ một đường thôi! Nó ngã ngồi luôn!” — nó kể lại ba lần, mỗi lần tay vung cao hơn một chút." },
      { text: "Chén nước bạn rót nguội dần trên bậc thềm. Nó mải kể. Câu “từ nay hết bị chặn đường” — không thấy nó nhắc tới." },
    ],
    choices: [
      {
        label: "“Rồi sao nữa?” — hỏi, và chỉ hỏi vậy.",
        result: "Nó khựng giữa câu kể, tay còn vung dở trên không. Hình như chưa ai hỏi nó câu đó bao giờ. Nó ngồi xuống bậc thềm, cầm chén nước lên, quên cả uống.",
        effects: { tam: 1 },
        flags: ["moc_khung"],
        schedule: { node: "moc_3", delay: 10 },
      },
      {
        label: "Gọi nó ra giữa sân, dạy tiếp đường thứ hai.",
        result: "Đường thứ hai nó bắt còn nhanh hơn đường thứ nhất. Nhánh trúc vút qua, lá trong sân dạt ra một vệt. Bạn đứng xem, vui được nửa buổi; nửa còn lại không gọi được tên.",
        effects: { danh: 1 },
        flags: ["moc_kieu"],
        schedule: { node: "moc_3", delay: 10 },
      },
      {
        label: "“Thằng bé đó ngã, có ai đỡ nó dậy không?”",
        result: "Mộc im bặt. Lúc về nó quên cả chào, đi được mươi bước lại ngoái đầu nhìn — như định hỏi gì, rồi thôi.",
        effects: { tam: 1, duyen: 1 },
        flags: ["moc_khung"],
        schedule: { node: "moc_3", delay: 10 },
      },
    ],
  },

  moc_2b: {
    title: "Đống củi sau nhà",
    paras: [
      { text: "Chín ngày, Mộc lên núi đủ chín lần. Không nhắc gì đến kiếm nữa. Chẻ củi, gánh nước, quét lá; áo ướt mồ hôi rồi khô lại ngay trên lưng." },
      { text: "Sáng nay củi hết. Nó đứng giữa sân, hai bàn tay đã lên chai, hỏi:" },
      { text: "“Con chẻ hết củi rồi. Giờ… con còn phải làm gì nữa?”" },
    ],
    choices: [
      {
        label: "“Con thấy tay mình khác gì chín ngày trước?”",
        result: "Nó xòe hai bàn tay, nhìn rất lâu, như nhìn tay của ai khác. “Chắc hơn,” nó nói. Bạn vào hiên, lấy thanh kiếm gỗ xuống, đặt vào giữa hai bàn tay ấy.",
        effects: { tam: 1, duyen: 1 },
        flags: ["moc_kien"],
        item: "kiem_go_trao",
        schedule: { node: "moc_3", delay: 10 },
      },
      {
        label: "Không nói gì, ra giữa sân đứng thế, chờ nó đứng theo.",
        result: "Đường kiếm đầu tiên, nó vung như chẻ củi. Không đẹp. Nhưng chắc.",
        effects: { tam: 1 },
        flags: ["moc_kien"],
        schedule: { node: "moc_3", delay: 10 },
      },
      {
        label: "“Còn một đống nữa, mai người ta chở tới.”",
        result: "Nó “dạ” một tiếng, không hỏi thêm. Hôm sau nó vẫn đến. Bạn bắt đầu dạy nó từ hôm sau nữa.",
        effects: { tam: 2 },
        flags: ["moc_kien", "moc_nhan"],
        schedule: { node: "moc_3", delay: 10 },
      },
    ],
  },

  moc_2c: {
    title: "Thanh kiếm gỗ trầy xước",
    paras: [
      { text: "Mộc quay lại. Thanh kiếm gỗ trên tay nó đã trầy xước khắp thân — nó tập một mình, ngoài bãi đá, chín ngày." },
      { text: "“Con tập theo mấy ông múa võ ở chợ. Nhưng con biết là sai hết rồi. Thầy… dạy con được không?”" },
      { text: "Nó gọi bạn là thầy. Tự nó gọi." },
    ],
    choices: [
      {
        label: "Gật đầu, dẫn nó ra sân. Buổi đầu chỉ sửa cách đứng.",
        result: "Cả buổi sáng chỉ có một chuyện: đứng cho vững. Nó không phàn nàn một câu. Đến trưa, dấu hai bàn chân nó in giữa sân đã sâu và thẳng.",
        effects: { duyen: 1, tam: 1 },
        flags: ["moc_tro"],
        schedule: { node: "moc_3", delay: 10 },
      },
      {
        label: "“Sai mà biết là sai, thì chưa sai hẳn.”",
        result: "Nó ngẫm câu đó rất lâu, lâu hơn cả lúc tập. Rồi nó cười.",
        effects: { tam: 1 },
        flags: ["moc_tro"],
        quote: "q_sai",
        schedule: { node: "moc_3", delay: 10 },
      },
    ],
  },

  moc_2d: {
    title: "Mười một ngày",
    paras: [
      { text: "Mười một ngày. Con đường núi trước cửa vẫn vắng.", ifNot: "___duyen2" },
      { text: "Chiều nay, có bóng người nhỏ đứng dưới gốc cây — Mộc. Nó không gõ cửa, chỉ đặt ở bậc thềm một bó rau, rồi đứng đó.", if: "___duyen2" },
      { text: "Bạn ra sân. Nó nói, mắt nhìn xuống: “Con nghĩ rồi. Con muốn học kiếm… không phải để đánh lại tụi nó. Con muốn tụi nó nhìn con kiểu khác.”", if: "___duyen2" },
      { text: "Chiều nào quét sân, đến khúc nhìn ra con dốc, tay chổi cũng chậm lại một nhịp. Chén nước hôm ấy cất đi lâu rồi; câu hỏi thì chưa cất được.", ifNot: "___duyen2" },
    ],
    choices: [
      {
        label: "“Nhìn kiểu khác — là kiểu gì?”",
        if: "___duyen2",
        result: "“Là… không phải sợ. Là nể.” Nói xong nó tự cau mày, thấy vẫn chưa đúng. Bạn nhặt bó rau trên thềm, bảo nó mang vào bếp. Học kiếm, bắt đầu từ sáng mai.",
        effects: { duyen: 1, tam: 1 },
        flags: ["moc_hieu"],
        schedule: { node: "moc_3", delay: 9 },
      },
      {
        label: "Đẩy cổng mở rộng thêm, nghiêng đầu về phía sân.",
        if: "___duyen2",
        result: "Nó thở ra một hơi rất dài, như đã nín từ mười một ngày trước.",
        effects: { duyen: 1 },
        flags: ["moc_hieu"],
        schedule: { node: "moc_3", delay: 9 },
      },
      {
        label: "Nhìn con đường vắng thêm một lát, rồi vào nhà.",
        ifNot: "___duyen2",
        result: "Gió lật mấy tờ lá khô qua lối đá, không có bước chân nào theo sau. Tối đó bạn chép vào sổ một dòng, gấp sổ, thổi đèn.",
        effects: { tinh: 1 },
        quote: "q_hat",
        kill: "moc",
      },
    ],
  },

  // ---- Node 3: hội tụ — chuyện ở chợ phiên ----

  moc_3: {
    title: "Chuyện dưới chợ phiên",
    paras: [
      { text: "Người gánh hàng lên núi kể chuyện chợ phiên: đám trẻ làng bên gây sự, đánh một đứa bé bán bánh." },
      { text: "Mộc có ở đó.", },
      { text: "Nghe nói nó xông vào rất nhanh, đánh trả rất rát — cho tới khi người lớn kéo ra. Đứa bị đánh đầu tiên thì chạy thoát từ lâu.", if: "moc_kieu" },
      { text: "Nghe nói nó không đánh. Nó đứng chắn trước đứa bé bán bánh, ăn trọn mấy quyền, không lùi. Đám kia đánh chán thì bỏ đi.", ifNot: "moc_kieu" },
      { text: "Hôm nay Mộc lên núi. Mặt còn tím một bên. Nó chưa nói gì, ngồi ở bậc thềm." },
    ],
    choices: [
      {
        label: "Lấy hũ thuốc trong thư phòng, ngồi xuống bôi cho nó. Không hỏi.",
        result: "Nó ngồi im cho bạn bôi thuốc. Được nửa chừng, nó tự kể, kể hết, không đợi ai hỏi. Thuốc bôi xong thì chuyện cũng vừa xong.",
        effects: { duyen: 1, tinh: 1 },
        schedule: { node: "moc_4", delay: 13 },
      },
      {
        label: "“Hôm đó, tay con run không?”",
        result: "Nó nhìn bạn rất lâu. “Run.” — “Run mà vẫn đứng đó, vậy là được rồi.”",
        effects: { tam: 1, duyen: 1 },
        quote: "q_run",
        schedule: { node: "moc_4", delay: 13 },
      },
      {
        label: "“Đánh nhau ngoài chợ, ta không dạy loại đó.” — nói lạnh.",
        result: "Nó đứng bật dậy, mắt đỏ. “Vậy thầy dạy kiếm để làm gì?!” Nó bỏ về. Câu hỏi thì ở lại.",
        effects: { tam: -1, duyen: -1 },
        flags: ["moc_ranNut"],
        schedule: { node: "moc_4", delay: 13 },
      },
    ],
  },

  // ---- Node 4: mùa thu — ngã rẽ ----

  moc_4: {
    title: "Người của võ quán",
    paras: [
      { text: "Một người đàn ông áo gọn, đi đứng có nghề, ghé tiểu viện. Ông ta là người của võ quán dưới huyện, đi tìm trẻ có căn cơ." },
      { text: "“Thằng nhỏ hay lên chỗ này, ta xem qua rồi. Được. Theo ta xuống huyện, ba năm thành tài, có lương, có danh phận.”" },
      { text: "Ông ta nói thêm, giọng không ác ý: “Ở đây, nó học được gì? Chẻ củi à?”" },
      { text: "Mộc đứng ở góc sân, nghe hết. Nó nhìn bạn.", ifNot: "moc_ranNut" },
      { text: "Mộc đứng ở góc sân, nghe hết. Từ hôm bị bạn nói lạnh, nó vẫn lên núi — nhưng ít nói hẳn. Giờ nó nhìn ông kia nhiều hơn nhìn bạn.", if: "moc_ranNut" },
    ],
    choices: [
      {
        label: "“Đi hay ở, con tự chọn.” — rồi đi pha trà.",
        result: "Bạn pha xong ấm trà thì người võ quán đã về. Mộc vẫn đứng giữa sân. “Con ở,” nó nói, như thể chuyện đã rõ từ đầu.",
        req: { stat: "duyen", min: 3 },
        effects: { duyen: 1, tinh: 1 },
        flags: ["moc_olai"],
        quote: "q_tuchon",
        schedule: { node: "moc_5", delay: 11 },
      },
      {
        label: "“Đi hay ở, con tự chọn.” — rồi đi pha trà.",
        req: { stat: "duyen", max: 2 },
        result: "Bạn pha xong ấm trà thì ngoài sân đã vắng. Cả hai người đều đã xuống núi. Trên bậc thềm, thanh kiếm gỗ đặt lại ngay ngắn.",
        effects: { tinh: -1 },
        flags: ["moc_dihuyen"],
        item: "kiem_go_hien",
        schedule: { node: "moc_5", delay: 11 },
      },
      {
        label: "“Nó có căn cơ thật. Ông dạy được nhiều hơn tôi.” — nói thật lòng.",
        result: "Người võ quán nhìn bạn một lúc lâu, rồi chắp tay — cái chắp tay của người gặp được kẻ không tranh. Mộc thì quay mặt đi. Hôm sau, nó xuống huyện.",
        effects: { tam: 1, danh: 1 },
        flags: ["moc_dihuyen_tot"],
        schedule: { node: "moc_5", delay: 11 },
      },
      {
        label: "“Nó là học trò của tôi.” — chỉ một câu.",
        result: "Người võ quán cười, chắp tay, xuống núi. Mộc đứng thẳng hơn mọi ngày. Nhưng đêm đó bạn tự hỏi: mình giữ nó cho nó, hay cho mình?",
        effects: { duyen: 1, danh: 1, tam: -1 },
        flags: ["moc_olai"],
        schedule: { node: "moc_5", delay: 11 },
      },
    ],
  },

  // ---- Node 5: mùa đông — kết ----

  moc_5: {
    title: "Tuyết đầu mùa, Mộc",
    paras: [
      { text: "Tuyết xuống từ đêm qua, phủ mỏng trên mái hiên." },
      { text: "Mộc lên núi từ sớm, quét lối đi từ cổng vào thềm rồi mới gõ cửa. Nó đã cao hơn hồi mùa xuân gần nửa cái đầu. Nó xin bạn một việc: mùa xuân tới, cho nó dẫn thằng bé bán bánh dưới chợ lên theo học — “nó bị bắt nạt, giống con hồi đó.”", if: "moc_olai" },
      { text: "Mộc từ huyện về thăm nhà, ghé tiểu viện. Áo võ quán mới, đi đứng đã ra dáng. Nó đặt lên bàn một gói trà — thứ trà đắt hơn mọi thứ trong tiểu viện này. “Thầy dưới đó dạy nhanh lắm,” nó nói, rồi im, tay xoay xoay cái chén chưa uống.", if: "moc_dihuyen_tot" },
      { text: "Có tiếng gõ cửa. Mộc — áo võ quán, mặt già đi. Nó đứng ngoài thềm, không dám vào hẳn. “Con xuống đó mới biết… ở đây thầy dạy con cái gì.” Nó đặt lên bậc thềm một gói trà, cúi đầu thật thấp, rồi về trong tuyết.", if: "moc_dihuyen" },
    ],
    choices: [
      {
        label: "“Được. Nhưng con dạy nó chẻ củi trước.”",
        if: "moc_olai",
        result: "Mộc bật cười — rồi chợt hiểu ra là bạn không đùa. Nó nhìn ra đống củi sau nhà, nhìn hai bàn tay mình. “Dạ,” nó nói, rất khẽ.",
        effects: { duyen: 1, tam: 1 },
        quote: "q_moc_ket",
        item: "kiem_go_hien",
        flags: ["moc_end_totdep"],
      },
      {
        label: "Pha đúng gói trà nó mang tới, hai thầy trò uống.",
        if: "moc_dihuyen_tot",
        result: "Trà ngon thật. Uống được nửa chén, Mộc nói: “Mùa xuân con xin nghỉ mấy hôm, lên đây chẻ củi.” Bạn không hỏi vì sao, chỉ rót thêm. Ngoài hiên tuyết vẫn xuống, đều và im.",
        effects: { duyen: 1 },
        quote: "q_moc_ket",
        flags: ["moc_end_venui"],
      },
      {
        label: "Mở cửa, gọi nó lại: “Trà này phải hai người uống mới đáng.”",
        if: "moc_dihuyen",
        result: "Nó quay lại, đứng ở thềm một lúc mới dám bước vào. Ấm trà hôm đó pha hơi lâu — vì chẳng ai vội.",
        effects: { duyen: 2 },
        quote: "q_moc_ket",
        flags: ["moc_end_venui"],
      },
      {
        label: "Để gói trà trên thềm thêm một đêm, cho tuyết xem trước.",
        if: "moc_dihuyen",
        result: "Sáng ra, gói trà phủ một lớp tuyết mỏng, như được gói thêm một lần nữa. Bạn phủi nhẹ, cất vào thư phòng. Chưa uống vội.",
        effects: { tinh: 1 },
        flags: ["moc_end_lang"],
      },
    ],
  },

  // ============================================================
  // ARC 2 — TRẦN THỨC, thư sinh tay áo có máu
  // ============================================================

  thu_1: {
    title: "Khách đêm mưa",
    paras: [
      { text: "Mưa từ chập tối. Có tiếng gõ cửa — một thư sinh, tay ôm tráp sách bọc vải dầu, áo ướt sũng." },
      { text: "Lời lẽ rất lễ độ: xin ngủ nhờ một đêm, sáng mai đi sớm, có ba đồng tiền xin gửi lại." },
      { text: "Khi hắn chắp tay, ống tay áo trễ xuống. Có một vệt máu khô, không phải của vết thương nào trên người hắn." },
    ],
    choices: [
      {
        label: "Mời vào phòng khách, đưa áo khô.",
        result: "Hắn cảm tạ ba lần. Nửa đêm bạn dậy châm đèn, thấy phòng khách vẫn sáng — hắn ngồi nhìn ngọn đèn, tráp sách chưa mở.",
        effects: { duyen: 1 },
        flags: ["thu_phongkhach"],
        schedule: { node: "thu_2", delay: 1 },
      },
      {
        label: "Chỉ mái hiên: “Đêm nay ngủ tạm ngoài này.”",
        result: "Hắn không một lời trách, trải áo ngoài hiên. Tiếng mưa trên mái đều đều, không biết hắn có ngủ được không.",
        effects: { tinh: 1 },
        flags: ["thu_hien"],
        schedule: { node: "thu_2", delay: 1 },
      },
      {
        label: "Nhìn thẳng vệt máu trên tay áo, hỏi: “Máu này của ai?”",
        result: "Hắn khựng nửa nhịp — rất ngắn, nhưng có. “Máu thỏ rừng. Tiểu sinh vụng, làm bếp bị dây.” Người vụng làm bếp không có kiểu khựng đó.",
        effects: { tam: 1 },
        flags: ["thu_hoimau", "thu_phongkhach"],
        schedule: { node: "thu_2", delay: 1 },
      },
      {
        label: "“Tiểu viện không chứa chuyện không rõ ràng.” — từ chối.",
        result: "Hắn đứng dưới mưa thêm một lúc, chắp tay, rồi đi. Ánh đèn lồng của hắn nhỏ dần về phía bến đò.",
        effects: { tinh: 1, duyen: -1 },
        flags: ["thu_tuchoi"],
        schedule: { node: "thu_2x", delay: 23 },
      },
    ],
  },

  // ---- Node 2: sáng hôm sau ----

  thu_2: {
    title: "Sáng hôm sau",
    paras: [
      { text: "Mưa tạnh từ gà gáy. Thư sinh dậy sớm, quét sạch cả khoảng sân trước hiên — lá dồn thành một đống vuông vức, rất mực thư sinh.", if: "thu_hien" },
      { text: "Mưa tạnh từ gà gáy. Thư sinh xin phép đi sớm. Ba đồng tiền đặt ngay ngắn trên bàn, dưới chén trà úp ngược.", ifNot: "thu_hien" },
      { text: "Trước khi xuống núi, hắn đứng ở cổng, quay lại như muốn nói một câu. Nói được nửa câu thì thôi:" },
      { text: "“Nếu sau này có người hỏi về tiểu sinh… ” — hắn bỏ lửng, cúi chào, đi." },
    ],
    choices: [
      {
        label: "“Thì ta sẽ nói: có một người đọc sách từng quét sân ở đây.”",
        result: "Hắn đứng sững. Rồi vai hắn chùng xuống, như trút được — hoặc như gánh thêm. Hắn đi không quay đầu nữa.",
        effects: { duyen: 1 },
        flags: ["thu_hua"],
        schedule: { node: "thu_3", delay: 22 },
      },
      {
        label: "Không nói gì. Gật đầu một cái.",
        req: { stat: "tinh", min: 2 },
        result: "Hắn nhìn cái gật đầu ấy một lúc, rồi chắp tay — sâu hơn mọi lần từ đêm qua. Nửa câu kia hắn mang theo xuống núi, không rơi lại chữ nào.",
        effects: { tinh: 1, duyen: 1 },
        flags: ["thu_hua"],
        quote: "q_nuacau",
        schedule: { node: "thu_3", delay: 22 },
      },
      {
        label: "“Nửa câu còn lại, khi nào quay lại nói nốt.”",
        result: "Hắn cười — nụ cười đầu tiên từ tối qua, mà buồn hơn cả lúc không cười. “Vâng. Nếu tiểu sinh còn dám quay lại.”",
        effects: { duyen: 1 },
        flags: ["thu_hen"],
        schedule: { node: "thu_3", delay: 22 },
      },
    ],
  },

  // ---- Node 2x: nhánh đã từ chối ----

  thu_2x: {
    title: "Tin từ bến đò",
    paras: [
      { text: "Người buôn ghé xin nước, kể chuyện vặt dọc đường. Ở bến đò mùa mưa có một thư sinh ở lại gần nửa tháng, ai thuê gì chép nấy, rồi xuống thuyền đi về phía nam." },
      { text: "“Hắn để lại một bài thơ trên vách quán trọ. Chữ đẹp lắm. Mà bài thơ thì…” — người buôn gãi đầu — “ai đọc cũng thấy như hắn viết cho một người đã chết.”" },
    ],
    choices: [
      {
        label: "Hỏi người buôn còn nhớ được câu nào không.",
        result: "Ông ta chỉ nhớ một câu giữa bài: “Cố nhân như thủy, phụ nhất trản trà.” — người xưa như nước, phụ một chén trà. Bạn nghĩ về đêm mưa hôm đó rất lâu.",
        effects: { tam: 1 },
        quote: "q_cuadong",
        kill: "thu",
      },
      {
        label: "Rót thêm nước cho người buôn, không hỏi nữa.",
        result: "Người buôn uống xong, gánh hàng xuống dốc. Chuyện dừng ở đó. Nhưng đêm ấy trời lại mưa, và tiếng mưa trên mái nghe rõ hơn mọi khi.",
        effects: { tinh: 1 },
        quote: "q_cuadong",
        kill: "thu",
      },
    ],
  },

  // ---- Node 3: mùa thu — hắn quay lại, nói thật ----

  thu_3: {
    title: "Nửa câu còn lại",
    paras: [
      { text: "Đầu thu, thư sinh quay lại. Gầy hơn, áo cũ hơn, nhưng mắt nhìn thẳng hơn." },
      { text: "Hắn xin một chén trà, uống cạn, rồi nói nốt nửa câu bỏ dở hồi mùa xuân:" },
      { text: "“Tiểu sinh họ Trần, tên Thức. Đêm đó tay áo có máu — là máu của bạn đồng hành. Đường qua rừng gặp cướp, huynh ấy đẩy tiểu sinh chạy trước, nói sẽ theo sau.”" },
      { text: "“Tiểu sinh chạy thật. Chạy một mạch. Không quay đầu lấy một lần. Đến giờ… vẫn không biết huynh ấy sống chết ra sao.”" },
      { text: "“Kỳ thi năm nay tiểu sinh bỏ. Chữ trong đầu cứ nhòe đi. Người ta bảo xuống phía nam có đám lái buôn từng qua khu rừng đó…”" },
    ],
    choices: [
      {
        label: "“Vậy còn ngồi đây uống trà của ta làm gì?”",
        result: "Trần Thức sững người — rồi đứng bật dậy, chắp tay sát đất. Hắn xuống núi ngay chiều đó, đi về phía nam.",
        effects: { tam: 1, duyen: 1 },
        flags: ["thu_ditim"],
        schedule: { node: "thu_4", delay: 15 },
      },
      {
        label: "“Chạy, không phải là tội. Chạy rồi không dám nhìn lại, mới là.”",
        result: "Hắn cúi đầu rất lâu. “Tiểu sinh biết. Nên lần này muốn nhìn lại cho rõ.” Sáng hôm sau hắn đi sớm, về phía nam.",
        effects: { tam: 1 },
        flags: ["thu_ditim"],
        quote: "q_chay",
        schedule: { node: "thu_4", delay: 15 },
      },
      {
        label: "Rót thêm một chén, chờ hắn tự nói tiếp.",
        req: { stat: "tinh", min: 3 },
        result: "Chén thứ hai cạn, hắn tự đứng dậy: “Trà đủ ấm rồi. Tiểu sinh đi đây.” Hắn xuống núi khi nắng chiều còn trên vai áo. Hai cái chén nằm cạnh nhau trên bàn, một cái đã khô.",
        effects: { tinh: 1, duyen: 1 },
        flags: ["thu_ditim", "thu_tralanh"],
        quote: "q_ngoiim",
        schedule: { node: "thu_4", delay: 15 },
      },
      {
        label: "“Ở lại đây ôn thi. Chuyện cũ, coi như nước chảy qua cầu.”",
        result: "Hắn nhìn bạn, có gì đó tắt đi trong mắt. Hắn ở lại ba hôm. Đèn phòng khách sáng khuya cả ba đêm, mà nghiên mực cạn rất chậm. Sáng ngày thứ tư, chiếu gấp vuông vức, người đã xuống núi.",
        effects: { duyen: -1, tam: -1 },
        flags: ["thu_khuyensai"],
        quote: "q_khuyensom",
        schedule: { node: "thu_4", delay: 15 },
      },
    ],
  },

  // ---- Node 4: mùa đông — lá thư ----

  thu_4: {
    title: "Thư từ phương nam",
    paras: [
      { text: "Người đưa hàng chuyến cuối năm mang lên một phong thư, chữ rất đẹp, đề gửi “tiểu viện dưới núi”." },
      { text: "“…Tiểu sinh tìm được rồi. Huynh ấy còn sống — mất một cánh tay, đang chép sách thuê ở trấn ven sông. Tiểu sinh đứng trước sạp sách nửa canh giờ không dám bước vào. Rồi nhớ chén trà mùa thu, mới bước.”", if: "thu_ditim" },
      { text: "“Huynh ấy nhìn tiểu sinh, câu đầu tiên là: 'Ngươi gầy đi.' Không một lời trách. Hóa ra suốt hai năm, người không tha thứ cho tiểu sinh… chỉ có một mình tiểu sinh.”", if: "thu_ditim" },
      { text: "“…Tiểu sinh không về phía nam nữa. Cũng không thi lại. Hiện chép sách thuê ở trấn bên, ngày chép chữ người, đêm viết chữ mình. Có lẽ một ngày nào đó sẽ dám đi tìm. Chưa phải bây giờ.”", if: "thu_khuyensai" },
      { text: "Cuối thư có một dòng tái bút: “Xuân tới, tiểu sinh xin ghé quét sân một buổi. Lần này không phải để trả ơn.”", if: "thu_ditim" },
    ],
    choices: [
      {
        label: "Gấp thư lại, cất vào tráp gỗ trong thư phòng.",
        if: "thu_ditim",
        result: "Bức thư nằm trong tráp, cạnh mấy cuốn sách cũ. Mùa xuân sân sẽ có người quét. Bạn tin thế.",
        effects: { duyen: 1 },
        item: "buc_thu",
        quote: "q_thatha",
        flags: ["thu_end_tot"],
      },
      {
        label: "Đọc lại lần nữa, dưới hiên, cho tuyết cùng đọc.",
        if: "thu_ditim",
        result: "Đọc lần thứ hai mới để ý: chữ trong thư không nhòe một nét nào. Vài bông tuyết lọt qua mái, chạm vào mép giấy, tan thành một chấm nhỏ, rồi khô.",
        effects: { tinh: 1, tam: 1 },
        item: "buc_thu",
        quote: "q_thatha",
        flags: ["thu_end_tot"],
      },
      {
        label: "Viết thư trả lời: “Sân dưới núi mùa nào cũng có lá rụng.”",
        if: "thu_khuyensai",
        result: "Bạn viết đúng một dòng ấy, không thêm chữ nào. Người đưa hàng mang thư đi chuyến đầu năm. Đèn thư phòng đêm đó tắt muộn hơn thường lệ một chút.",
        effects: { duyen: 1 },
        item: "buc_thu",
        quote: "q_thoigian",
        flags: ["thu_end_lung"],
      },
    ],
  },

  // ============================================================
  // ARC 3 — ÔNG LÃO ĐÁNH CỜ
  // ============================================================

  co_1: {
    title: "Ván cờ dưới gốc cây",
    paras: [
      { text: "Sáng ra đã thấy một ông lão ngồi dưới gốc cây trước sân, bên bàn cờ đá — bàn cờ mà bạn không nhớ tiểu viện từng có." },
      { text: "Thế cờ trên bàn đang dở dang, đen trắng quấn nhau đã sâu. Ông lão ngồi bên phần quân trắng, không giục, không gọi, chỉ chờ." },
      { text: "Thấy bạn ra, ông nói, như tiếp một câu chuyện đã bắt đầu từ lâu lắm: “Một ván thôi. Ta còn nợ một người một ván chưa tàn.”" },
    ],
    choices: [
      {
        label: "Ngồi xuống bên phần quân đen, đi một nước.",
        result: "Bạn đặt một quân. Ông lão nhìn nước cờ rất lâu, rồi gật đầu: “Ừ. Hắn cũng sẽ đi nước này.” Rồi ông đứng dậy, đi. Ván cờ ở lại.",
        effects: { duyen: 1 },
        flags: ["co_danhco"],
        item: "ban_co",
        schedule: { node: "co_2", delay: 13 },
      },
      {
        label: "Pha một ấm trà, đặt bên bàn cờ, đứng xem.",
        result: "Ông lão uống trà, không đi nước nào. “Cờ chưa tới lúc,” ông nói. “Trà thì vừa đúng lúc.” Ông đi khi chén còn ấm.",
        effects: { tinh: 1 },
        flags: ["co_xemco"],
        item: "ban_co",
        schedule: { node: "co_2", delay: 13 },
      },
      {
        label: "“Nợ ai? Người đó đâu rồi?”",
        result: "Ông lão nhìn lên đường núi, chỗ khúc quành khuất sau rặng trúc. “Đi trước rồi. Đi trước lâu rồi.” — ông chỉ nói vậy, rồi chống gối đứng dậy, xuống núi.",
        effects: { tam: 1 },
        flags: ["co_hoi"],
        item: "ban_co",
        schedule: { node: "co_2", delay: 13 },
      },
    ],
  },

  co_2: {
    title: "Thế cờ tự đổi",
    paras: [
      { text: "Bàn cờ đá vẫn ở dưới gốc cây, từ hôm đó không ai chạm vào. Bạn chắc chắn không ai chạm vào." },
      { text: "Nhưng sáng nay quét sân, bạn dừng lại giữa chừng: thế cờ đã khác. Quân trắng vừa đi thêm một nước — một nước rất cũ kỹ, nhẫn nại, kiểu của người xưa." },
      { text: "Lá rụng trên mặt bàn đá, mà không lá nào nằm trên quân cờ." },
    ],
    choices: [
      {
        label: "Đi tiếp một nước quân đen, không thắc mắc.",
        result: "Bạn đặt quân đen xuống, nhặt chiếc lá trên thành bàn, rồi quét sân tiếp. Chổi đưa tới đâu sân sạch tới đó. Thế cờ sau lưng, cứ để nó tự dở dang.",
        effects: { tinh: 1, duyen: 1 },
        flags: ["co_danhtiep"],
        quote: "q_khonghieu",
        schedule: { node: "co_3", delay: 16 },
      },
      {
        label: "Ngồi nhìn thế cờ nguyên một buổi chiều.",
        result: "Nhìn lâu mới thấy: thế trắng không đánh để thắng. Nó đánh như người dọn nhà lần cuối — chậm, kỹ, không tiếc.",
        effects: { tam: 1 },
        flags: ["co_nhinra"],
        quote: "q_codanh",
        schedule: { node: "co_3", delay: 16 },
      },
      {
        label: "Lấy vải phủ bàn cờ lại. Chuyện này không nên dây vào.",
        result: "Bạn phủ vải lên bàn cờ. Đêm đó gió lớn. Sáng ra, tấm vải được xếp vuông vức đặt ở góc bàn, thế cờ vẫn thêm một nước trắng.",
        effects: { tinh: -1 },
        flags: ["co_phuvai"],
        schedule: { node: "co_3", delay: 16 },
      },
    ],
  },

  co_3: {
    title: "Người nhận ra thế cờ",
    paras: [
      { text: "Một người trung niên áo vải ghé xin nước, dáng người làm ruộng nhưng tay có vết chai của người từng cầm bút." },
      { text: "Ngang qua gốc cây, ông ta dừng sững lại trước bàn cờ. Rất lâu. Khi quay sang bạn, mặt ông ta trắng bệch:" },
      { text: "“Thế cờ này… là ván của cha tôi. Ván ông đánh dở với bạn cờ trước khi mất. Mười năm trước tôi xóa bàn cờ đó rồi — chính tay tôi xóa. Sao nó ở đây?”" },
    ],
    choices: [
      {
        label: "Kể thật về ông lão áo trắng và những nước cờ tự đi.",
        result: "Ông ta nghe xong, ngồi phịch xuống bậc thềm. “Bạn cờ của cha tôi… mất trước cha tôi hai năm.” Không ai nói gì thêm. Gió chiều lật một chiếc lá trên mặt bàn đá; quân cờ không quân nào xê dịch.",
        effects: { tam: 1, danh: 1 },
        flags: ["co_kethat"],
        schedule: { node: "co_4", delay: 10 },
      },
      {
        label: "“Ván cờ chưa tàn thì còn người muốn đánh nốt. Ông ngồi xuống đi.”",
        result: "Người trung niên ngồi xuống bên phần quân trắng của ván cờ dở — chỗ ngồi của bạn cờ cha mình. Ông ta run tay đi một nước. Rồi khóc như trẻ nhỏ.",
        effects: { duyen: 2 },
        flags: ["co_connguoi"],
        quote: "q_vanco",
        schedule: { node: "co_4", delay: 10 },
      },
      {
        label: "Chỉ rót nước, để ông ta đứng với bàn cờ bao lâu tùy ý.",
        req: { stat: "tinh", min: 3 },
        result: "Ông ta đứng đó đến xế chiều. Trước khi đi, ông ta sửa lại một quân cờ bị lệch — sửa rất khẽ, như sợ đánh thức ai.",
        effects: { tinh: 1, duyen: 1 },
        flags: ["co_lang"],
        schedule: { node: "co_4", delay: 10 },
      },
    ],
  },

  co_4: {
    title: "Ván cờ tàn",
    paras: [
      { text: "Ngày tuyết rơi dày nhất, ông lão quay lại. Áo trắng lẫn vào tuyết, đi từ đường núi vào không để lại dấu chân." },
      { text: "Ông ngồi xuống bàn cờ, đi một nước cuối. Chỉ một nước — mà cả thế cờ đang quấn nhau chợt rời ra, thắng thua bỗng không còn nằm ở đâu cả." },
      { text: "“Ván này tàn rồi,” ông nói. Nghe như người vừa trả xong một món nợ mang theo quá lâu." },
      { text: "“Con trai hắn đã ngồi vào chỗ này. Vậy là đủ.”", if: "co_connguoi" },
    ],
    choices: [
      {
        label: "“Ván tàn rồi… ông đi đâu?”",
        result: "Ông lão đứng dậy, phủi tuyết trên vai. “Đi trước. Như hắn thôi.” Ông xuống núi trong tuyết, đến khúc quành sau rặng trúc thì không thấy nữa. Trên bàn cờ, một quân trắng khuyết mất một góc — khuyết từ bao giờ không rõ.",
        effects: { tam: 1 },
        item: "quan_co_khuyet",
        quote: "q_di_truoc",
        flags: ["co_end"],
      },
      {
        label: "Cúi đầu tiễn, không hỏi gì.",
        req: { stat: "tinh", min: 2 },
        result: "Ông lão nhìn bạn, lần đầu tiên cười. “Chủ viện này được.” Ông đi vào tuyết. Bàn cờ đá ở lại, và một quân trắng khuyết một góc, nằm ngay giữa lòng bàn tay bạn từ lúc nào.",
        effects: { tinh: 1, duyen: 1 },
        item: "quan_co_khuyet",
        quote: "q_di_truoc",
        flags: ["co_end", "co_end_cuoi"],
      },
      {
        label: "Mời ông ở lại uống chén trà cuối năm.",
        result: "“Trà thì ta nợ nhiều người lắm rồi. Thôi.” Ông cười trong râu, rồi đi. Chén trà rót ra hôm đó, bạn để nguyên trên bàn cờ đến khi nguội hẳn — coi như có người đã uống.",
        effects: { duyen: 1 },
        item: "quan_co_khuyet",
        quote: "q_di_truoc",
        flags: ["co_end"],
      },
    ],
  },
};
