// ===== SỔ NHỎ DƯỚI NÚI — các câu mở khóa =====

const QUOTES = {
  q_sai:        "Sai mà biết là sai, thì chưa sai hẳn.",
  q_hat:        "Có những hạt gieo xuống không nảy mầm ở sân nhà mình. Không có nghĩa là nó không nảy mầm.",
  q_run:        "Tay run mà chân vẫn đứng đó — vậy là được rồi.",
  q_tuchon:     "Giữ một người giỏi nhất là để cửa mở, chứ không phải nắm tay áo.",
  q_moc_ket:    "Dạy kiếm, cuối cùng là dạy lúc nào không cần rút kiếm.",
  q_nuacau:     "Có những nửa câu không cần nửa còn lại.",
  q_cuadong:    "Có những người mình chỉ gặp một lần. Cánh cửa đóng hôm ấy, là đóng cả một đời.",
  q_chay:       "Chạy không phải là tội. Chạy rồi không dám nhìn lại, mới là.",
  q_ngoiim:     "Người ta thường tự biết câu trả lời. Họ chỉ thiếu một người ngồi im nghe câu hỏi.",
  q_khuyensom:  "Có những lời khuyên đúng, nhưng nói ra quá sớm thì thành sai.",
  q_thatha:     "Người khó tha thứ cho mình nhất, thường chính là mình.",
  q_thoigian:   "Việc gì khuyên không được thì để thời gian khuyên. Nó nói chậm, nhưng chưa từng nói sai.",
  q_khonghieu:  "Có những chuyện không cần hiểu. Chỉ cần đừng bỏ dở.",
  q_codanh:     "Có kiểu đánh cờ không phải để thắng — như người dọn nhà lần cuối: chậm, kỹ, không tiếc.",
  q_vanco:      "Ván cờ chưa tàn thì còn chỗ cho người ngồi xuống.",
  q_di_truoc:   "Người đi trước không mất. Họ chỉ đợi ở một khúc quành mình chưa tới.",
  q_khongchac:  "Không chắc, thì đừng. Thuốc mà đoán thì thành độc, lời mà đoán thì thành dao.",
  q_dixa:       "Người đi xa chưa chắc vì ghét quê nhà. Có khi chỉ vì ở lại thì không còn là mình nữa.",
  q_chamlai:    "Nhiều chuyện không cần phân xử. Chỉ cần một chén nước đủ chậm.",
  q_binhthuong: "Hai chữ khó viết nhất, treo giữa nhà lại sang nhất: Bình Thường.",
  q_chennuoc:   "Có những việc mình làm mà không biết là mình đã làm. Đó thường là những việc lớn nhất.",
  q_loinhan:    "Có những đoạn đường, tự nó là lời nhắn.",
  q_motdoan:    "Đưa nhau một đoạn, cũng là một đoạn.",
  q_thangthua:  "Có những món nợ chỉ cần đủ năm tháng là tự xóa. Đừng trả sớm quá.",
  q_dinhnui:    "Đỉnh núi nào nhìn từ xa cũng nhỏ. Chỉ có đường lên là dài.",
  q_cauhoi:     "Trẻ con giữ câu hỏi bền hơn người lớn giữ câu trả lời.",
  q_canhlua:    "Có người ngủ được vì có người thức. Xưa nay vẫn vậy.",
  q_chumnuoc:   "Cứu một người đôi khi chỉ tốn một chum nước — và mình không bao giờ biết.",
};

// ===== VẬT TRONG SÂN — mỗi vật một dòng nhớ =====

const ITEMS = {
  kiem_go_trao:   { name: "Thanh kiếm gỗ (đã trao đi)", memory: "Trao cho một thiếu niên đứng ngoài cửa từ sáng sớm, mùa xuân năm ấy." },
  kiem_go_hien:   { name: "Thanh kiếm gỗ treo bên hiên", memory: "Kiếm gỗ trầy xước khắp thân. Chủ nó giờ hiểu vì sao mình cầm kiếm." },
  ban_co:         { name: "Bàn cờ đá dưới gốc cây", memory: "Không nhớ tiểu viện từng có bàn cờ này. Nó cứ ở đó, như đã đợi sẵn." },
  quan_co_khuyet: { name: "Quân cờ trắng khuyết một góc", memory: "Ván cờ mười năm đã tàn. Quân cờ này là nước đi cuối cùng." },
  buc_thu:        { name: "Bức thư từ phương nam", memory: "Chữ của người đã dám quay đầu nhìn lại. Chữ không nhòe nữa." },
  buc_thu_vodanh: { name: "Phong thư không tên", memory: "“Nếu không có chén nước ở sân ông, tôi đã không qua nổi con dốc ấy.”" },
  cay_mai:        { name: "Cây mai góc sân", memory: "Hạt giống người buôn để lại. Trồng xuống rồi thì phần còn lại không phải việc của mình." },
  la_de:          { name: "Chiếc lá đề trong sách", memory: "Tăng nhân để lại trên chồng lá quét gọn. Quanh đây không có cây bồ đề nào." },
  con_meo:        { name: "Con mèo tam thể", memory: "Đến vào một ngày tuyết, gầy trơ xương. Giờ nó coi bậc cửa là của nó." },
};

// ===== MÔ TẢ SÂN ĐẦU NGÀY — theo mùa × chỉ số trội =====

const YARD_LINES = {
  xuan: {
    tam:   "Sương sớm tan chậm. Chén trà đầu ngày cầm trên tay, không sóng sánh.",
    duyen: "Chim về làm tổ dưới mái hiên. Sân dạo này hay có dấu chân.",
    danh:  "Dưới làng lại có người hỏi đường lên tiểu viện.",
    tinh:  "Sương sớm chưa tan hẳn ngoài hiên. Ấm trà pha từ sáng vẫn còn ấm.",
    none:  "Một sớm mùa xuân như mọi sớm mùa xuân.",
  },
  ha: {
    tam:   "Nắng gắt mà lòng không gắt. Cũng là một thứ công phu.",
    duyen: "Tiếng ve ran. Chum nước đầu hè đã có người ghé uống.",
    danh:  "Đường núi trưa nay có tiếng người — lại ai đó tìm lên.",
    tinh:  "Gió qua rặng trúc, cả trưa chỉ nghe một thứ tiếng đó.",
    none:  "Ngày hạ dài. Bóng cây trước sân tròn rồi lại nghiêng.",
  },
  thu: {
    tam:   "Lá rụng không cần gió. Nhìn lá rơi mà không thấy tiếc, là thu đã vào trong người.",
    duyen: "Mùa thu là mùa người cũ. Hôm nay ngồi pha trà dư một chén.",
    danh:  "Người dưới bến đò nhắn: có khách phương xa hỏi thăm tiểu viện.",
    tinh:  "Sân đầy lá mà không vội quét. Lá cũng cần nằm một lúc.",
    none:  "Trời thu cao. Tiếng chim đi qua, không dừng.",
  },
  dong: {
    tam:   "Tuyết đè cành trúc, cành trúc không gãy. Xem cũng học được một điều.",
    duyen: "Tuyết phủ đường núi, vậy mà vẫn có dấu chân hướng về tiểu viện.",
    danh:  "Cuối năm, quà dưới làng gửi lên đặt kín một góc thềm.",
    tinh:  "Tuyết rơi không tiếng. Cả ngọn núi đang ngồi im.",
    none:  "Ngày đông, khói bếp thẳng. Trời không gió.",
  },
};
