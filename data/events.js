// ===== ONE-SHOTS theo mùa + NGÀY VẮNG =====
// Same node schema as arcs. `season` chọn pool. Event Danh-gated có req trong choices hoặc `reqStat` ở event.

const SEASON_EVENTS = {

  // ---------------- XUÂN ----------------
  xuan: [
    {
      id: "x_mang",
      title: "Rổ măng đầu mùa",
      paras: [
        { text: "Con bé nhà dưới chân núi lên, ôm một rổ măng còn dính đất: “Bà nội bảo đem biếu.”" },
        { text: "Đưa xong nó không về ngay. Nó đứng nhìn ngọn núi sau tiểu viện, rồi hỏi: “Ông ơi, núi có đỉnh không?”" },
      ],
      choices: [
        {
          label: "“Có. Nhưng lên tới nơi mới biết nó không phải chỗ cao nhất.”",
          result: "Con bé nhíu mày, nhìn lên núi lần nữa, rồi nhìn bạn. Nó không hỏi thêm, chỉ mang cái nhíu mày ấy xuống dốc, cùng với rổ không.",
          effects: { tam: 1 },
          flags: ["gap_conbe"],
        },
        {
          label: "“Con thấy nó có đỉnh không?”",
          result: "Nó nhìn thêm một lúc lâu: “Mây che rồi.” Bạn gật: “Ừ. Hôm nào quang mây thì lên đây nhìn tiếp.” Nó dạ rất to, chạy về.",
          effects: { duyen: 1 },
          flags: ["gap_conbe"],
        },
        {
          label: "Luộc măng, chia nó một nửa mang về.",
          result: "Nó ôm gói măng luộc chạy xuống núi, quên cả câu hỏi. Câu hỏi thì ở lại với bạn hết buổi chiều.",
          effects: { duyen: 1, tinh: 1 },
          flags: ["gap_conbe"],
        },
      ],
    },
    {
      id: "x_hatgiong",
      title: "Người buôn và hạt giống lạ",
      paras: [
        { text: "Người buôn quen đường ghé xin nước, than giá gạo, khoe hàng mới. Lúc đi, ông ta để lại trên bàn một hạt giống to bằng đầu ngón tay: “Mua ở tận đâu quên rồi. Nghe bảo là mai. Tôi trồng ba lần không mọc. Chỗ ông đất lành, thử xem.”" },
      ],
      choices: [
        {
          label: "Trồng nó ở góc sân, chỗ nhiều nắng nhất.",
          result: "Đào lỗ, đặt hạt, lấp đất, tưới một gáo nước. Phần còn lại không phải việc của bạn nữa.",
          effects: { tinh: 1 },
          flags: ["trong_mai"],
          item: "cay_mai",
        },
        {
          label: "Cất vào ngăn kéo, đợi xem đã.",
          result: "Hạt giống nằm trong ngăn kéo. Thỉnh thoảng mở ra thấy nó, bạn lại nghĩ: để mai. Chữ “mai” này không phải chữ “mai” kia.",
          effects: {},
          flags: ["cat_hat"],
        },
      ],
    },
    {
      id: "x_haithuoc",
      title: "Cô gái hái thuốc trú mưa",
      paras: [
        { text: "Mưa rào bất chợt. Một cô gái đeo gùi thuốc chạy vào hiên trú, tóc ướt lấm tấm, miệng liến thoắng xin lỗi vì làm ướt thềm." },
        { text: "Chờ mưa, cô kể: học nghề thuốc của mẹ, mẹ mất rồi, giờ toàn phải tự đoán. “Có cây hôm qua cháu hái, giờ nghĩ lại không chắc là sài đất hay lưỡi rắn nữa.”" },
      ],
      choices: [
        {
          label: "“Không chắc, thì đổ đi. Cả gùi cũng đổ.”",
          result: "Cô gái tròn mắt: nguyên một buổi hái. Rồi cô gật: “Dạ. Thuốc mà đoán thì thành độc.” Cô đổ thật, không tiếc nữa.",
          effects: { tam: 1 },
          quote: "q_khongchac",
        },
        {
          label: "Vào thư phòng, lấy cuốn sách thuốc cũ đưa cô mượn.",
          result: "Cô nhận sách bằng hai tay, bọc vào vải dầu trước cả khi bọc gùi thuốc. Mưa chưa dứt hẳn cô đã xuống tới khúc quành, một tay giữ gùi, một tay ôm sách trước ngực.",
          effects: { duyen: 1 },
          flags: ["muon_sach_thuoc"],
        },
        {
          label: "Pha trà gừng, ngồi nghe cô kể về mẹ.",
          result: "Mưa tạnh lúc nào không hay. Chuyện về mẹ còn dở thì trời đã hửng. Cô xuống núi, bước chân nhẹ hơn lúc chạy vào; chén trà gừng cạn tới đáy.",
          effects: { tinh: 1, duyen: 1 },
        },
      ],
    },
    {
      id: "x_ganh_nuoc",
      title: "Bến đò buổi sớm",
      paras: [
        { text: "Xuống bến đò lấy hàng gửi, gặp ông lái đò đang ngồi vá lưới. Ông kể: mùa này nước êm, khách qua sông toàn người trẻ rời làng đi tìm việc xa." },
        { text: "“Chuyến nào tôi cũng chở đầy người đi. Chuyến về thì thuyền nhẹ tênh. Ông bảo, cái làng này rồi còn lại ai?”" },
      ],
      choices: [
        {
          label: "“Còn lại ông. Còn bến thì còn người về.”",
          result: "Ông lái đò cười khà, tay vẫn vá lưới: “Ừ. Thì tôi chèo tiếp.” Mũi kim trong tay ông lại lên xuống, đều như nhịp chèo.",
          effects: { duyen: 1 },
          quote: "q_dixa",
        },
        {
          label: "Ngồi im nghe, không đáp.",
          result: "Câu ấy ông hỏi trời chứ không hỏi bạn. Bạn ngồi thêm một lát. Vá xong tấm lưới, ông tự huýt sáo trở lại, tiếng huýt đứt quãng theo mũi kim.",
          effects: { tinh: 1 },
        },
      ],
    },
  ],

  // ---------------- HẠ ----------------
  ha: [
    {
      id: "h_trau",
      title: "Con trâu giẫm ruộng",
      paras: [
        { text: "Hai người làng kéo nhau lên tiểu viện, mặt đỏ gay, mồ hôi ròng ròng. Trâu nhà này giẫm nát góc mạ nhà kia. Lời qua tiếng lại từ sáng, giờ đòi bạn phân xử." },
        { text: "Người mất mạ đòi đền gấp đôi. Người có trâu nói tại bờ rào bên kia thấp." },
      ],
      choices: [
        {
          label: "“Trâu ăn mạ thì đền mạ. Rào thấp thì cùng đắp lại rào.”",
          result: "Hai người im. Người mất mạ gãi đầu trước, người có trâu gãi đầu theo. Họ xuống núi khi nắng còn cao, kịp đắp lại rào trước tối.",
          effects: { danh: 1, tam: 1 },
        },
        {
          label: "Rót hai chén nước vối, bảo uống xong rồi nói.",
          result: "Nước vối nóng, muốn uống phải chậm. Chén cạn, người có trâu đặt xuống trước: “Thôi, tôi đền.” Người kia cầm ấm, rót cho ông ta thêm một chén.",
          effects: { tinh: 1, danh: 1 },
          quote: "q_chamlai",
        },
        {
          label: "“Chuyện ruộng làng, tôi không ngồi ghế trên được.”",
          result: "Hai người chưng hửng, kéo nhau xuống núi tìm trưởng làng. Tiểu viện yên lại. Nhưng từ nay dân làng biết: chuyện của họ, đừng mang lên đây.",
          effects: { tinh: 1, danh: -1 },
        },
      ],
    },
    {
      id: "h_gieng",
      title: "Giếng làng cạn",
      paras: [
        { text: "Nắng hạn nửa tháng. Giếng làng trơ đáy. Mấy người làng lên, đứng nép ở cổng, ngập ngừng: giếng tiểu viện còn nước, xin gánh nhờ ít hôm." },
      ],
      choices: [
        {
          label: "“Giếng đó nước mạch núi, gánh đi. Nhớ đừng làm đục.”",
          result: "Từ hôm đó, sáng nào cũng có tiếng đòn gánh kẽo kẹt qua sân. Tiểu viện mất cái tĩnh, được cái khác, khó gọi tên hơn, nhưng bền hơn.",
          effects: { danh: 2, duyen: 1, tinh: -1 },
        },
        {
          label: "Cho gánh, nhưng hẹn giờ: sáng sớm và chập tối.",
          result: "Người làng giữ đúng hẹn, còn tự cắt cử nhau, nhà nào gánh hôm nào. Tiếng đòn gánh đầu ngày cuối ngày, dần thành một thứ đồng hồ mới của tiểu viện.",
          effects: { danh: 1, tinh: 1 },
        },
        {
          label: "“Nước giếng này ít, cho một nhà thì mất lòng chín nhà.” (từ chối khéo)",
          result: "Người làng dạ dạ rồi về. Không ai nói gì. Nhưng mùa hạn năm nay, dưới làng sẽ nhớ lâu hơn một mùa.",
          effects: { tinh: 1, danh: -2, duyen: -1 },
        },
      ],
    },
    {
      id: "h_kiemkhach",
      title: "Kiếm khách say",
      paras: [
        { text: "Trưa đứng bóng, một kiếm khách nằm vắt ngang trước cổng, say mèm, hơi rượu nồng cả một khúc đường. Thanh kiếm bên hông thì ngược lại: bao kiếm cũ nhưng được lau chuốt kỹ, dây buộc chắc, là kiếm của người có nghề." },
        { text: "Kiếm rất tốt. Người rất tệ." },
      ],
      choices: [
        {
          label: "Kéo vào hiên cho khỏi cảm nắng, đặt bên chum nước.",
          result: "Chiều hắn tỉnh, uống nửa chum nước, nhìn quanh, rồi đi không một lời. Ba ngày sau có người để trước cổng một vò rượu ngon và một dòng chữ: “Trả cái hiên.”",
          effects: { duyen: 1 },
          flags: ["cuu_kiemkhach"],
        },
        {
          label: "Múc nước dội cho tỉnh.",
          result: "Hắn choàng dậy, tay chụp cán kiếm theo phản xạ, rồi thấy gáo nước, thấy bạn, thấy mình. Hắn cười méo xẹo, chắp tay một cái rất sâu, đi thẳng. Vệt nước trên nền đá khô dần theo bóng hắn xuống dốc.",
          effects: { tam: 1 },
        },
        {
          label: "Để yên. Say ở đâu tỉnh ở đó.",
          result: "Hắn nằm tới xế chiều, tỉnh dậy tự đi. Trước khi đi, hắn sửa lại đôi dép cho ngay ngắn: của hắn, và của bạn để ở thềm.",
          effects: { tinh: 1 },
        },
      ],
    },
    {
      id: "h_xinchu",
      title: "Khách từ huyện lên",
      reqStat: { stat: "danh", min: 3 },
      paras: [
        { text: "Một vị mặc áo the từ huyện lên, kẻ hầu gánh theo lễ vật. Nghe đồn dưới núi có cao nhân, ông ta lên xin một bức chữ treo phòng khách, “nói thách bao nhiêu cũng được.”" },
        { text: "Hai chữ “cao nhân” leo dốc núi nhanh hơn người. Trong sân, chum nước vẫn là chum nước, ấm trà vẫn là ấm trà cũ." },
      ],
      choices: [
        {
          label: "Viết cho ông ta hai chữ “Bình Thường”.",
          result: "Ông ta ngẩn ra, rồi vái một cái rất sâu, trả lễ gấp đôi. Về sau nghe nói bức chữ được treo giữa nhà, ai hỏi cũng không giải nghĩa. Càng không giải nghĩa, người ta càng tấm tắc.",
          effects: { danh: 1, tam: 1 },
          quote: "q_binhthuong",
        },
        {
          label: "“Ở đây không có cao nhân. Chỉ có trà. Uống thì mời.”",
          result: "Ông ta uống trà, ngồi một canh giờ, chuyện dần bớt khách sáo. Lúc về, ông ta không xin chữ nữa: “Hôm nay tôi được thứ hơn chữ.” Lễ vật vẫn để lại, không cách nào từ.",
          effects: { tinh: 1, danh: 1 },
        },
        {
          label: "Từ chối tiếp, cáo bận.",
          result: "Vị khách về, không giận. Người như thế lại càng tin dưới núi có cao nhân. Đồn đại từ đó dày thêm một tầng, như rêu sau mưa.",
          effects: { tinh: -1, danh: 1 },
        },
      ],
    },
  ],

  // ---------------- THU ----------------
  thu: [
    {
      id: "t_lathu",
      title: "Lá thư không tên",
      paras: [
        { text: "Trong chồng hàng gửi từ bến đò lên có một phong thư không đề tên người gửi, không đề tên người nhận, chỉ ghi: “Tiểu viện dưới núi.”" },
        { text: "Trong thư vỏn vẹn một câu, nằm giữa trang giấy trắng:" },
        { text: "“Năm đó nếu không có chén nước ở sân ông, tôi đã không qua nổi con dốc ấy.”" },
      ],
      choices: [
        {
          label: "Cố nhớ xem là ai. Bao nhiêu người đã qua sân này?",
          result: "Nhớ không ra. Người qua sân nhiều như lá qua mùa. Bạn rót một chén nước, đặt lên thềm, chỗ vẫn hay đặt cho khách qua đường, rồi ngồi nhìn nó nguội.",
          effects: { tam: 1 },
          quote: "q_chennuoc",
          item: "buc_thu_vodanh",
        },
        {
          label: "Không cần nhớ. Gấp thư, để lên kệ sách.",
          result: "Bạn gấp thư theo đúng nếp cũ của nó, để lên kệ. Phong thư mỏng như một chiếc lá, vậy mà kệ sách, từ hôm đó, nhìn có vẻ đầy hơn.",
          effects: { tinh: 1 },
          quote: "q_chennuoc",
          item: "buc_thu_vodanh",
        },
      ],
    },
    {
      id: "t_timcon",
      title: "Người mẹ tìm con",
      paras: [
        { text: "Một người phụ nữ áo nâu bạc lên núi từ sớm, hỏi thăm từng nhà dọc đường. Con trai bà bỏ nhà đi ba năm trước, sau một trận cãi nhau với cha nó. Có người mách hồi đầu năm thấy thằng bé làm ở xưởng gỗ mạn ngược." },
        { text: "“Tôi không mong nó về. Tôi chỉ muốn nhắn với nó một câu: cha nó dạo này yếu rồi, mà tính vẫn cứng, không đời nào chịu nhắn.”" },
      ],
      choices: [
        {
          label: "Mài mực, viết giúp bà một lá thư gửi theo người buôn mạn ngược.",
          result: "Bà đọc không thạo, bạn viết, bà nói. Nói đến câu cuối, “về hay không cũng được, nhớ mặc ấm”, thì bà nghẹn. Thư gửi đi theo chuyến hàng cuối tuần.",
          effects: { duyen: 1, tam: 1 },
          flags: ["thu_gui_me"],
        },
        {
          label: "“Câu đó bà phải tự đi nói. Thư không chở nổi.”",
          result: "Bà đứng lặng hồi lâu, rồi hỏi đường lên mạn ngược, hỏi kỹ, từng chặng một, như người sắp đi thật. Hôm ấy bà xuống núi sớm hơn lúc lên.",
          effects: { tam: 1 },
          quote: "q_loinhan",
        },
        {
          label: "Mời bà nghỉ chân, nghe hết chuyện ba năm.",
          result: "Chuyện ba năm kể hết một buổi chiều. Cuối cùng bà tự nói, không hẳn với bạn: “Chắc tôi phải đi tìm nó thật.” Chén trà trước mặt bà nguội từ lâu, chưa vơi một nửa.",
          effects: { tinh: 1, duyen: 1 },
          quote: "q_ngoiim",
        },
      ],
    },
    {
      id: "t_tangnhan",
      title: "Tăng nhân qua đường",
      paras: [
        { text: "Một tăng nhân vân du xin nghỉ nhờ một đêm. Ăn một bát cơm rau, không nhận gì thêm. Sáng hôm sau dậy trước gà, quét sạch lá cả sân trước sân sau, rồi đắp y lên đường." },
        { text: "Trên chồng lá quét gọn, ông đặt lại một chiếc lá đề, không biết nhặt được từ cây nào, quanh đây không có bồ đề." },
      ],
      choices: [
        {
          label: "Ép chiếc lá vào cuốn sách dày nhất trong thư phòng.",
          result: "Chiếc lá nằm giữa hai trang sách. Nhiều năm sau, ai đó mở đúng trang ấy, sẽ gặp một mùa thu.",
          effects: { tinh: 1 },
          item: "la_de",
        },
        {
          label: "Chạy theo, tiễn ông một đoạn dốc.",
          result: "Tăng nhân không từ chối. Hai người đi một đoạn không nói gì. Tới khúc quành, ông chắp tay: “Đưa nhau một đoạn, cũng là một đoạn.” Rồi đi.",
          effects: { duyen: 1 },
          quote: "q_motdoan",
        },
      ],
    },
    {
      id: "t_covu",
      title: "Người thua cờ năm xưa",
      paras: [
        { text: "Một ông khách đứng tuổi ghé, nhìn quanh sân, hỏi có phải chỗ này ngày xưa có ông cụ hay ngồi đánh cờ dưới gốc cây không. “Tôi thua cụ ấy một ván, cay đến giờ. Giờ khá hơn rồi, muốn tìm đánh lại.”", ifNot: "co_end" },
        { text: "Một ông khách đứng tuổi ghé, dừng rất lâu trước bàn cờ đá dưới gốc cây. “Tôi từng thua chủ nhân thế cờ này một ván. Cay mười mấy năm. Giờ nhìn lại thế cờ… thua là phải.”", if: "co_end" },
      ],
      choices: [
        {
          label: "“Người thì đi rồi. Ván cờ thì vẫn đây. Ông ngồi không?”",
          result: "Ông khách ngồi xuống, đánh với bạn một ván. Đánh xong ông ta thở ra: “Thắng thua giờ nhẹ như lá. Hồi đó sao mình cay thế nhỉ.” Ông xin chép thế tàn cuộc vào một tờ giấy, gấp làm tư, cất vào ngực áo.",
          effects: { duyen: 1, tinh: 1 },
          quote: "q_thangthua",
        },
        {
          label: "“Cay một ván cờ được mười mấy năm, ông cũng bền chí thật.”",
          result: "Ông khách sững người, rồi phá lên cười, cười chảy nước mắt. “Ừ nhỉ. Bền chí cái gì không bền, đi bền cái này.” Ông về, dáng đi nhẹ hẳn.",
          effects: { tam: 1 },
        },
      ],
    },
  ],

  // ---------------- ĐÔNG ----------------
  dong: [
    {
      id: "d_khoai",
      title: "Khoai nướng ngày tuyết",
      paras: [
        { text: "Tuyết vừa ngớt, con bé nhà dưới núi lại lên, hai má đỏ ửng, ôm trong áo mấy củ khoai nướng còn nóng: “Bà nội bảo trời này ăn khoai mới đúng.”", if: "gap_conbe" },
        { text: "Nó ngồi ăn khoai với bạn ở bậc thềm, rồi nhìn lên núi. Đỉnh núi hôm nay quang mây, trắng tuyết. Nó hỏi lại đúng câu mùa xuân: “Ông ơi, núi có đỉnh không?”", if: "gap_conbe" },
        { text: "Một con bé dưới chân núi lên chơi, ôm theo mấy củ khoai nướng bà nó gửi biếu. Nó ngồi ăn khoai ở bậc thềm, nhìn lên đỉnh núi trắng tuyết, hỏi: “Ông ơi, núi có đỉnh không?”", ifNot: "gap_conbe" },
      ],
      choices: [
        {
          label: "“Hôm nay quang mây. Con tự nhìn xem.”",
          result: "Nó nhìn rất lâu, rồi reo: “Có! Mà nhỏ xíu à!” Bạn gật: “Ừ. Đỉnh núi nào nhìn từ xa cũng nhỏ xíu. Chỉ có đường lên là dài.”",
          effects: { duyen: 1, tam: 1 },
          quote: "q_dinhnui",
        },
        {
          label: "“Câu này con hỏi từ mùa xuân. Sao con nhớ dai vậy?”",
          if: "gap_conbe",
          result: "Nó nghiêng đầu: “Tại chưa ai trả lời đàng hoàng hết á.” Bạn bật cười, khói khoai bay ngang mặt. Dưới thung lũng, khói bếp nhà nó cũng vừa lên.",
          effects: { duyen: 1 },
          quote: "q_cauhoi",
        },
        {
          label: "Nướng thêm khoai, ăn hết rồi tính.",
          result: "Hai ông cháu ăn hết chỗ khoai, tuyết lại rơi. Câu hỏi để dành mùa xuân sau. Khoai thì không để dành được.",
          effects: { tinh: 1 },
        },
      ],
    },
    {
      id: "d_baotuyet",
      title: "Đêm bão tuyết",
      paras: [
        { text: "Nửa đêm gió rít, tuyết quất ngang trời. Có tiếng đập cửa gấp: hai cha con người lỡ đường, gánh hàng đông về muộn, lạc mất lối xuống làng." },
        { text: "Mái hiên vá hồi giữa năm chắc chắn, kín gió. Bạn nhóm lửa ngay dưới hiên, hai cha con hơ tay, dần hoàn hồn.", if: "va_maihien" },
        { text: "Mái hiên dột từ mùa mưa chưa chữa, gió lùa tuyết vào tận thềm. Đành đưa cả hai vào nhà trong, chen chúc quanh bếp lửa.", ifNot: "va_maihien" },
      ],
      choices: [
        {
          label: "Nấu nồi cháo nóng, nhường chăn.",
          result: "Sáng ra trời quang. Người cha vét túi đòi gửi tiền, bạn không nhận. Ông ta bèn bổ hết đống củi sau nhà rồi mới chịu xuống núi. Đứa con gánh đỡ nửa gánh hàng của cha, ngoái lại chào tới ba lần.",
          effects: { duyen: 1, danh: 1 },
        },
        {
          label: "Chỉ chỗ ngủ, còn mình thức canh bếp lửa.",
          result: "Đêm đó bạn ngồi canh lửa tới sáng, nghe gió đổi giọng ba lần trên mái. Hai cha con ngủ say, người con mê ngủ còn cười. Củi trong bếp cháy suốt đêm, đỏ một màu rất bền.",
          effects: { tam: 1, tinh: 1 },
          quote: "q_canhlua",
        },
      ],
    },
    {
      id: "d_meo",
      title: "Con mèo gầy",
      paras: [
        { text: "Một con mèo tam thể gầy trơ xương xuất hiện ở góc sân, nép dưới chum nước, nhìn bạn bằng cặp mắt nửa cảnh giác nửa van nài. Tuyết còn dính trên lưng nó." },
      ],
      choices: [
        {
          label: "Để một bát cơm trộn cá khô ở bậc cửa, rồi vào nhà.",
          result: "Nó chờ bạn khuất hẳn mới dám lại gần. Ăn xong nó không đi. Hôm sau nó vẫn ở đó. Hôm sau nữa, nó nằm hẳn lên bậc cửa. Vậy là tiểu viện có mèo.",
          effects: { duyen: 1, tinh: 1 },
          item: "con_meo",
        },
        {
          label: "Bắt vào nhà, lau khô, sưởi lửa.",
          result: "Nó giãy được ba cái thì thôi, nằm im cho lau. Đêm đó nó ngủ cạnh bếp. Nó gầy, nhưng tiếng gừ gừ thì no đủ lắm.",
          effects: { duyen: 1 },
          item: "con_meo",
        },
        {
          label: "Kệ. Mèo hoang tự biết đường sống.",
          result: "Sáng hôm sau nó biến mất. Chỉ còn dấu chân nhỏ trên tuyết, đi về phía làng. Chắc nó tìm được chỗ. Chắc vậy.",
          effects: { tinh: 1, duyen: -1 },
        },
      ],
    },
    {
      id: "d_ruou",
      title: "Vò rượu cuối năm",
      reqFlag: "cuu_kiemkhach",
      paras: [
        { text: "Chiều cuối năm, kiếm khách mùa hạ quay lại, tỉnh táo, áo gọn, đi đứng đâu ra đấy. Hắn đặt lên bàn một vò rượu: “Lần này lên uống, không phải lên nằm.”" },
        { text: "Rượu được vài chén, hắn kể: hồi mùa hạ đó hắn vừa chôn xong sư huynh, uống cho quên đường. “Tỉnh dậy ở hiên nhà ông, thấy chum nước để sẵn… tự dưng nghĩ, thôi, sống tiếp.”" },
      ],
      choices: [
        {
          label: "“Chum nước đó tôi để cho ai qua đường cũng uống được. Không riêng ông.”",
          result: "Hắn cười lớn: “Thì thế mới quý!” Vò rượu cạn thì trăng cũng lên. Hắn xuống núi, bước chân vững; ngang qua chum nước còn múc một gáo, uống như để chào.",
          effects: { duyen: 1, tam: 1 },
          quote: "q_chumnuoc",
        },
        {
          label: "Nâng chén: “Vì sư huynh của ông.”",
          result: "Hắn khựng lại, rồi nâng chén bằng cả hai tay, uống cạn. Không khóc. Nhưng chén sau hắn rót đầy hơn, đặt ra mép bàn, không ai uống. Tuyết ngoài hiên rơi dày thêm một lớp.",
          effects: { duyen: 1, tinh: 1 },
        },
      ],
    },
  ],
};

// ---------------- NGÀY VẮNG ----------------
// Khi không có event nào: mưa/tuyết/vắng khách. Solo choices, hậu quả trễ thật.

const EMPTY_DAY = {
  title_by_season: {
    xuan: "Ngày mưa bụi, không ai đến",
    ha: "Ngày nắng gắt, đường núi vắng",
    thu: "Ngày gió, lá rụng đầy sân",
    dong: "Ngày tuyết, núi trắng và im",
  },
  paras: [
    { text: "Không có tiếng gõ cửa nào. Cả ngày là của bạn." },
  ],
  choices: [
    {
      label: "Đọc sách trong thư phòng.",
      result: "Đọc hết một cuốn cũ. Gặp một câu hay, chép ra mảnh giấy, dán cạnh án thư. Mực khô chậm; ngoài hiên, ngày cũng khô chậm như thế.",
      effects: { tam: 1 },
      flags: ["doc_sach"],
    },
    {
      label: "Vá lại mái hiên trước khi mùa mưa bão tới.",
      once: "va_maihien",
      result: "Loay hoay nửa ngày, xước hai chỗ trên tay, mái hiên chắc lại rồi. Đứng dưới hiên nhìn lên, chỗ mới vá đậm màu hơn chỗ cũ, như một miếng vá trên vai áo.",
      effects: {},
      flags: ["va_maihien"],
    },
    {
      label: "Bày bàn cờ, đánh một mình một ván.",
      result: "Cầm quân đen đi một nước, xoay bàn, ngồi sang phía bên kia nghĩ cách trả. Được nửa ván thì quên mất mình đang cầm bên nào. Trời chiều xuống chậm.",
      effects: { tam: 1 },
      flags: ["danh_co_mot_minh"],
    },
    {
      label: "Ngồi ở hiên, nhìn trời, không làm gì cả.",
      result: "Ngồi từ lúc trà còn nóng tới lúc ấm nguội hẳn. Mây qua núi mấy lượt, không đám nào giống đám nào. Chuyện đó, ngoài bạn ra, không ai biết.",
      effects: { tinh: 1 },
    },
  ],
};

// ===== KHÚC CHUYỂN MÙA — thẻ chương, hiện ở ngày đầu mỗi mùa =====
// prologue chỉ in ở mùa xuân (ngày 1), dựng khung cả câu chuyện.
const SEASON_INTRO = {
  xuan: {
    name: "Xuân",
    mark: "春",
    prologue: "Bạn giữ một tiểu viện dưới chân núi. Không ai giao, cũng không ai đến nhận. Một mái hiên, một gốc cây già, một ấm trà cũ. Người lên núi ghé qua, kể một đoạn đời, rồi đi tiếp đường mình. Bạn ở lại, giữ cái sân cho sạch, giữ ấm trà cho nóng.",
    line: "Xuân về. Sương tan chậm trên lối đá. Dưới làng, đã có người hỏi đường lên núi.",
  },
  ha: {
    name: "Hạ",
    mark: "夏",
    line: "Hạ sang. Ve ran trong rặng trúc. Chum nước đầu hè đặt ngoài cổng, đã có người ghé uống.",
  },
  thu: {
    name: "Thu",
    mark: "秋",
    line: "Thu tới. Lá rụng không cần gió. Mùa này, người cũ hay trở lại, và chuyện cũ hay tìm về.",
  },
  dong: {
    name: "Đông",
    mark: "冬",
    line: "Đông về. Tuyết phủ kín đường núi. Năm sắp cạn, và có những chuyện cũng sắp tới lúc khép lại.",
  },
};
