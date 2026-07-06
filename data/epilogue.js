// ===== EPILOGUE — lắp ghép cuối năm =====
// Mỗi block: {if: flag} hoặc {ifNot} hoặc {stat: "..."} (chỉ số trội). Engine ghép theo thứ tự.

const EPILOGUE = {
  opening: "Đêm cuối năm, tuyết ngừng. Bạn châm đèn, mở những câu đã ghi trong năm, ngồi nhớ lại một năm người qua kẻ lại.",

  arcs: [
    // --- Mộc ---
    { if: "moc_end_totdep", text: "Mộc giờ quét lối đi trước cả khi gõ cửa. Mùa xuân tới, sân này sẽ có thêm một đứa trẻ chẻ củi — và một đứa đứng dạy, cố làm mặt nghiêm. Kiếm gỗ treo bên hiên, lâu rồi không ai cần rút xuống." },
    { if: "moc_end_venui", text: "Mộc học ở võ quán dưới huyện, nhưng mùa xuân nào cũng xin nghỉ mấy hôm, lên núi chẻ củi. Người dưới đó hỏi thì nó chỉ cười. Đống củi sau nhà chưa mùa nào vơi." },
    { if: "moc_end_lang", text: "Gói trà của Mộc vẫn trong thư phòng, chưa mở. Trà để dành được. Đứa trẻ ấy cũng vậy — cứ để nó đi hết đoạn đường của nó đã." },
    { if: "moc_dihuyen_tot", ifNot: "moc_end_venui", text: "Mộc ở võ quán dưới huyện. Thỉnh thoảng người quen kể: thằng bé đánh giỏi, nhưng ít khoe. Nghe câu sau mừng hơn câu trước." },
    { if: "moc_dead", text: "Thiếu niên hỏi học kiếm mùa xuân ấy không quay lại. Đôi khi quét sân, bạn vẫn nhìn ra khúc quành. Hạt đã gieo thì ở đâu đó vẫn là hạt." },

    // --- Trần Thức ---
    { if: "thu_end_tot", text: "Thư của Trần Thức nằm trong tráp gỗ. Hai người phương nam ấy, một người mất một cánh tay, một người vừa tìm lại được đường về. Xuân tới sân sẽ có người quét — lần này không phải để trả ơn." },
    { if: "thu_end_lung", text: "Trần Thức vẫn chép sách thuê ở trấn bên, ngày chép chữ người, đêm viết chữ mình. Thư trả lời đã gửi: sân dưới núi mùa nào cũng có lá rụng. Còn lại, để thời gian lo." },
    { if: "thu_dead", text: "Người thư sinh đêm mưa ấy đã xuống thuyền về phương nam, để lại một bài thơ trên vách quán trọ. Mỗi lần mưa đêm, tiếng mưa trên mái nghe rõ hơn mọi khi." },

    // --- Ông lão đánh cờ ---
    { if: "co_end_cuoi", text: "Bàn cờ đá vẫn dưới gốc cây, thế tàn cuộc không ai dọn. Quân cờ khuyết góc nằm trong ngăn án thư. “Chủ viện này được” — cả năm được khen đúng một câu, mà nhớ tới giờ." },
    { if: "co_end", ifNot: "co_end_cuoi", text: "Ván cờ mười năm đã tàn dưới gốc cây trước sân. Người đánh nốt ván ấy giờ ở một khúc quành nào đó phía trước, cùng bạn cờ của mình. Nợ trả xong rồi, chắc hai người đang bày ván mới." },
    { if: "co_dead", text: "Bàn cờ đá dưới gốc cây vẫn còn thế cờ dở. Thỉnh thoảng bạn vẫn thấy như quân trắng vừa nhích thêm một nước. Có thể chỉ là lá rụng. Có thể không." },

    // --- các mối nhỏ ---
    { if: "trong_mai", text: "Cây mai góc sân đã lên được một gang tay. Người buôn nói đúng: đất này lành." },
    { if: "item_con_meo", text: "Con mèo tam thể giờ ngủ cạnh bếp như thể nó sinh ra ở đó. Mèo không biết ơn ai bao giờ. Nhưng nó ở lại — với mèo, đó là một lời rất dài." },
    { if: "thu_gui_me", text: "Lá thư gửi mạn ngược cho người mẹ tìm con, không biết đã tới chưa. Thư đi mùa thu, đường mùa đông khó. Nhưng thư có bốn chữ 'nhớ mặc ấm', kiểu gì cũng ấm được một đoạn." },
  ],

  by_stat: {
    tam:   "Năm nay bạn học được cách đứng cho vững trước chuyện của người khác — vững, mà không cứng. Lời khuyên nói ra ít hơn năm ngoái, nhưng trúng hơn.",
    duyen: "Năm nay tiểu viện gieo được nhiều mối duyên. Người đến rồi đi, nhưng ai đi cũng mang theo một chút gì của cái sân này — và để lại một chút gì của họ.",
    danh:  "Năm nay tiếng lành đồn xa hơn bạn muốn. Người tìm đến đông hơn, phiền cũng nhiều hơn. Sang năm có lẽ phải học thêm một chữ: chối.",
    tinh:  "Năm nay tiểu viện tĩnh. Tĩnh đến mức nghe được lá rơi bên kia rặng trúc. Chỉ mong cái tĩnh này là ao thu, đừng thành giếng cạn.",
  },

  closing: "Đèn cạn dầu. Bạn gấp sổ, ra hiên đứng một lát.\n\nDưới núi, đèn nhà ai còn sáng. Trên núi, tuyết bắt đầu tan ở những chỗ khuất gió.\n\nMùa xuân năm sau, tuyết tan sớm.",
};
