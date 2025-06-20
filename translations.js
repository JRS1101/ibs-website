// 다국어 번역 데이터
const translations = {
    ko: {
        // 네비게이션
        nav_home: "홈",
        nav_about: "회사소개", 
        nav_services: "서비스",
        nav_jig_gallery: "JIG 갤러리",
        nav_portfolio: "포트폴리오",
        nav_technology: "기술력",
        nav_contact: "문의",
        
        // 메인 섹션
        hero_title: "전문가 팀의 JIG 설계 혁신",
        hero_subtitle: "반도체 PCB JIG 설계 분야의 전문가들이 만들어가는<br>혁신적인 기술 솔루션과 차별화된 서비스",
        hero_btn_contact: "문의하기",
        hero_btn_portfolio: "프로젝트 보기",
        hero_stat_years: "년 경력",
        hero_stat_projects: "프로젝트", 
        hero_stat_mems: "세계최초<br>MEMS JIG 개발",
        
        // 회사소개 섹션
        about_title: "I.B.S 소개",
        about_subtitle: "InnoBridge SOLUTION - 혁신적인 기술 솔루션 파트너",
        about_main_title: "전문가 팀과 함께하는 기술 혁신",
        about_description: "I.B.S(InnoBridge SOLUTION)는 반도체 PCB JIG 설계 분야의 전문 기업입니다. 수원에 본사를 둔 혁신적인 기술 솔루션 회사로, 경험 많은 전문가팀이 고객에게 최적의 솔루션을 제공합니다.",
        
        feature_probe_title: "반도체 Test Wire Probe JIG",
        feature_probe_desc: "사양,거버,설계부터 완제까지 Wire Probe Jig 원스톱 서비스",
        feature_mems_title: "MEMS JIG 개발",
        feature_mems_desc: "세계 최초 전기검사 MEMS JIG 개발 경험",
        feature_optimization_title: "설계 공정 Process 최적화",
        feature_optimization_desc: "전문 소프트웨어 도구를 활용한 설계 효율성 극대화",
        feature_education_title: "설계 소프트웨어 교육",
        feature_education_desc: "IA-Station, EZ-Cat, Cam350, AutoCAD 등 전문 교육",
        
        ceo_intro_title: "대표이사 소개",
        ceo_name: "이준로 대표이사",
        ceo_position: "CEO (Chief Executive Officer)",
        ceo_experience: "20년 JIG 설계 경력",
        ceo_education: "공주사범대학교 영문학과",
        ceo_expertise: "Wire Probe JIG, MEMS JIG 전문가",
        
        // 서비스 섹션
        services_title: "전문 서비스",
        services_subtitle: "고객의 기술향상을 위한 맞춤형 솔루션",
        
        service_design_title: "JIG 설계 및 완제 제작",
        service_design_desc: "설계 기술 및 제작 노하우를 바탕으로 다양한 Wire Probe 설계부터 완제 제작까지 원스톱 서비스",
        service_consulting_title: "기술 컨설팅",
        service_consulting_desc: "20년 노하우를 바탕으로 한 전문 기술 컨설팅 서비스",
        service_optimization_title: "설계 프로세스 최적화",
        service_optimization_desc: "전문 소프트웨어 도구를 활용한 설계 프로세스 혁신",
        service_education_title: "설계 소프트웨어 교육",
        service_education_desc: "고객사 엔지니어 대상 전문 소프트웨어 교육 서비스",
        
        // 포트폴리오 섹션
        portfolio_title: "주요 프로젝트",
        portfolio_subtitle: "혁신적인 JIG 설계 프로젝트들",
        
        // 기술력 섹션
        technology_title: "기술력 & 특허",
        technology_subtitle: "20년 축적된 노하우와 혁신 기술",
        tech_core_title: "핵심 기술",
        tech_capability_title: "보유 역량",
        tech_innovation_title: "혁신 기술",
        
        // 연락처 섹션
        contact_title: "문의하기",
        contact_subtitle: "I.B.S와 함께 기술 혁신을 시작하세요",
        contact_address_title: "주소",
        contact_phone_title: "연락처",
        contact_email_title: "이메일",
        contact_website_title: "웹사이트",
        contact_method_title: "문의 방법",
        contact_direct_title: "직접 연락하기 (빠른 응답)",
        contact_form_title: "온라인 문의 폼",
        form_name: "이름",
        form_email: "이메일",
        form_phone: "전화번호",
        form_company: "회사명",
        form_message: "문의내용",
        
        // JIG 갤러리 섹션
        gallery_title: "JIG 갤러리",
        gallery_subtitle: "I.B.S에서 설계하고 제작한 다양한 JIG 제품들을 만나보세요.<br>20년의 경험과 전문성으로 완성된 혁신적인 기술력을 확인해보실 수 있습니다.",
        gallery_stat_years: "년 설계 경험",
        gallery_stat_jigs: "완성된 JIG",
        gallery_stat_first: "세계최초",
        gallery_stat_mems: "MEMS JIG",
        filter_all: "전체",
        filter_wire_probe: "Wire Probe JIG",
        filter_mems: "MEMS JIG",
        filter_precision: "초정밀 JIG",
        filter_custom: "맞춤형 JIG",
        filter_software: "Software 교육",
        
        // 서비스 상세 항목들
        service_design_item1: "Wire Probe JIG 설계부터 완제 제작까지",
        service_design_item2: "20~30㎛ 통합 Structure 제작",
        service_design_item3: "전장 10mm 통합 Structure",
        service_design_item4: "Agpdcu Probe 탑재 치공구 완제품",
        service_design_item5: "MEMS JIG 설계 및 제작",
        
        service_consulting_item1: "설계 최적화 컨설팅",
        service_consulting_item2: "프로세스 개선 방안 제시",
        service_consulting_item3: "비용 절감 솔루션",
        
        service_optimization_item1: "IA-Station, EZ-Cat 활용 최적화",
        service_optimization_item2: "Cam350, AutoCAD 전문 기술",
        service_optimization_item3: "CAD/CAM 다양한 도구활용",
        
        service_education_item1: "IA-Station, EZ-Cat 실무 교육",
        service_education_item2: "Cam350, AutoCAD 활용법 전수",
        service_education_item3: "다양한 맞춤형 교육 커리큘럼",
        
        // 포트폴리오 항목들
        portfolio_mems_title: "MEMS JIG 개발",
        portfolio_mems_desc: "세계 최초 전기검사 MEMS JIG 개발",
        portfolio_mems_item1: "세계 최초 전기검사 MEMS JIG 개발",
        portfolio_mems_item2: "삼성전기 납품 상용화",
        portfolio_mems_item3: "차세대 MEMS JIG 개발(Multiway MEMS)",
        
        portfolio_30um_title: "30um Probe JIG 개발",
        portfolio_30um_desc: "Agpdcu Probe 탑재 치공구 개발",
        portfolio_30um_item1: "Agpdcu Probe 탑재 치공구 개발",
        portfolio_30um_item2: "Rew Pin 개발 탑재 치공구 상용화",
        portfolio_30um_item3: "높은 정밀도 구현",
        
        portfolio_automation_title: "설계 공정 Process 자동화 개발",
        portfolio_automation_desc: "고객사 맞춤형 설계 프로세스 최적화",
        portfolio_automation_item1: "다양한 설계 소프트웨어 도구 활용 전문성",
        portfolio_automation_item2: "AI를 활용한 설계 자동화 개발",
        portfolio_automation_item3: "고객사 엔지니어 대상 맞춤형 교육 프로그램",
        
        portfolio_wireprobe_title: "Wire Probe JIG 설계 및 제작",
        portfolio_wireprobe_desc: "20~30㎛ 통합 Structure 설계부터 완제 제작까지",
        portfolio_wireprobe_item1: "설계부터 제작까지 원스톱 서비스 구축",
        portfolio_wireprobe_item2: "25,30㎛ 삼성전기 승인 완료",
        portfolio_wireprobe_item3: "전장 10mm 통합 Wire Probe Jig 개발",
        
        portfolio_education_title: "설계 소프트웨어 교육 시스템",
        portfolio_education_desc: "고객사 역량 강화를 위한 전문 교육 서비스",
        portfolio_education_item1: "IA-Station, EZ-Cat, Cam350 전문 교육",
        portfolio_education_item2: "JIG Trouble 해결 방향 제시",
        portfolio_education_item3: "실무 중심 맞춤형 교육 커리큘럼",
        
        // 태그들
        tag_world_first: "세계최초",
        tag_electrical_test: "전기검사",
        tag_commercialization: "상용화",
        tag_software_education: "소프트웨어 교육",
        tag_process_improvement: "프로세스 개선",
        tag_customer_support: "고객 지원",
        tag_samsung: "삼성전기",
        tag_complete_product: "완제 제작",
        tag_integrated_structure: "통합 Structure",
        tag_education_service: "교육 서비스",
        tag_software_expertise: "소프트웨어 전문성",
        tag_capability_enhancement: "역량 강화",
        
        // 기술력 상세 항목들
        tech_core_item1: "JIG 사양부터 완제 제작 기술 보유",
        tech_core_item2: "JIG 최적 개발 설계 기술 지원",
        tech_core_item3: "고객 맞춤 영업전략 솔루션 지원",
        
        tech_capability_item1: "20년 이상 JIG 설계 경험",
        tech_capability_item2: "삼성전기 공급업체 개발 승인",
        tech_capability_item3: "소프트웨어 활용 전문성",
        tech_capability_item4: "AI 프롬프트 엔지니어링 기술",
        
        tech_innovation_item1: "MEMS JIG 설계,제작 기술 보유",
        tech_innovation_item2: "20~30㎛ JIG 개발 기술 보유",
        tech_innovation_item3: "맞춤 설계 Process 자동화 지원",
        
        // 통계 항목들
        stat_years: "년 경력",
        stat_projects: "완료 프로젝트",
        stat_software: "소프트웨어 전문성",
        stat_world_first: "세계 최초 기술"
    },
    
    en: {
        // Navigation
        nav_home: "Home",
        nav_about: "About",
        nav_services: "Services", 
        nav_jig_gallery: "JIG Gallery",
        nav_portfolio: "Portfolio",
        nav_technology: "Technology",
        nav_contact: "Contact",
        
        // Main Section
        hero_title: "JIG Design Innovation by Expert Team",
        hero_subtitle: "Innovative technology solutions and differentiated services<br>created by experts in semiconductor PCB JIG design",
        hero_btn_contact: "Contact Us",
        hero_btn_portfolio: "View Projects",
        hero_stat_years: "Years Experience",
        hero_stat_projects: "Projects",
        hero_stat_mems: "World's First<br>MEMS JIG Development",
        
        // About Section
        about_title: "About I.B.S",
        about_subtitle: "InnoBridge SOLUTION - Innovative Technology Solution Partner",
        about_main_title: "Technology Innovation with Expert Team",
        about_description: "I.B.S (InnoBridge SOLUTION) is a specialized company in semiconductor PCB JIG design. An innovative technology solution company headquartered in Suwon, our experienced expert team provides optimal solutions to customers.",
        
        feature_probe_title: "Semiconductor Test Wire Probe JIG",
        feature_probe_desc: "One-stop service from specifications, gerber, design to finished products for Wire Probe JIG",
        feature_mems_title: "MEMS JIG Development",
        feature_mems_desc: "Experience in developing world's first electrical inspection MEMS JIG",
        feature_optimization_title: "Design Process Optimization",
        feature_optimization_desc: "Maximizing design efficiency using professional software tools",
        feature_education_title: "Design Software Education",
        feature_education_desc: "Professional training in IA-Station, EZ-Cat, Cam350, AutoCAD, etc.",
        
        ceo_intro_title: "CEO Introduction",
        ceo_name: "CEO Lee Jun-ro",
        ceo_position: "CEO (Chief Executive Officer)",
        ceo_experience: "20 years JIG design experience",
        ceo_education: "Kongju National University, English Literature",
        ceo_expertise: "Wire Probe JIG, MEMS JIG Expert",
        
        // Services Section
        services_title: "Professional Services",
        services_subtitle: "Customized solutions for customer technology improvement",
        
        service_design_title: "JIG Design & Manufacturing",
        service_design_desc: "One-stop service from various Wire Probe design to finished product manufacturing based on design technology and manufacturing know-how",
        service_consulting_title: "Technical Consulting",
        service_consulting_desc: "Professional technical consulting service based on 20 years of know-how",
                service_optimization_title: "Design Process Optimization",
        service_optimization_desc: "Design process innovation using professional software tools",
        service_education_title: "Design Software Education",
        service_education_desc: "Professional software education services for client company engineers",
        
        // Portfolio Section
        portfolio_title: "Major Projects",
        portfolio_subtitle: "Innovative JIG Design Projects",
        
        // Technology Section
        technology_title: "Technology & Patents",
        technology_subtitle: "20 years of accumulated know-how and innovative technology",
        tech_core_title: "Core Technology",
        tech_capability_title: "Capabilities",
        tech_innovation_title: "Innovation Technology",
        
        // Contact Section
        contact_title: "Contact Us",
        contact_subtitle: "Get direct consultation from JIG design experts",
        contact_address_title: "Address",
        contact_phone_title: "Phone",
        contact_email_title: "Email",
        contact_website_title: "Website",
        contact_method_title: "Contact Method",
        contact_direct_title: "Call us now!",
        contact_form_title: "Or contact online",
        form_name: "Name",
        form_email: "Email",
        form_phone: "Phone Number",
        form_company: "Company",
        form_message: "Message",
        
        // JIG Gallery Section
        gallery_title: "JIG Gallery",
        gallery_subtitle: "Discover various JIG products designed and manufactured by I.B.S.<br>Experience our innovative technology refined through 20 years of expertise.",
        gallery_stat_years: "Years of Design Experience",
        gallery_stat_jigs: "Completed JIGs",
        gallery_stat_first: "World's First",
        gallery_stat_mems: "MEMS JIG",
        filter_all: "All",
        filter_wire_probe: "Wire Probe JIG",
        filter_mems: "MEMS JIG",
        filter_precision: "Precision JIG",
        filter_custom: "Custom JIG",
        filter_software: "Software Training",
        
        // Service Detail Items
        service_design_item1: "From Wire Probe JIG design to complete manufacturing",
        service_design_item2: "20~30㎛ integrated Structure manufacturing",
        service_design_item3: "Full length 10mm integrated Structure",
        service_design_item4: "Agpdcu Probe mounted jig complete products",
        service_design_item5: "MEMS JIG design and manufacturing",
        
        service_consulting_item1: "Design optimization consulting",
        service_consulting_item2: "Process improvement proposal",
        service_consulting_item3: "Cost reduction solutions",
        
        service_optimization_item1: "IA-Station, EZ-Cat utilization optimization",
        service_optimization_item2: "Cam350, AutoCAD professional technology",
        service_optimization_item3: "Various CAD/CAM tool utilization",
        
        service_education_item1: "IA-Station, EZ-Cat practical training",
        service_education_item2: "Cam350, AutoCAD utilization transfer",
        service_education_item3: "Various customized training curriculum",
        
        // Portfolio Items
        portfolio_mems_title: "MEMS JIG Development",
        portfolio_mems_desc: "World's first electrical test MEMS JIG development",
        portfolio_mems_item1: "World's first electrical test MEMS JIG development",
        portfolio_mems_item2: "Samsung Electro-Mechanics supply commercialization",
        portfolio_mems_item3: "Next-generation MEMS JIG development (Multiway MEMS)",
        
        portfolio_30um_title: "30um Probe JIG Development",
        portfolio_30um_desc: "Agpdcu Probe mounted jig development",
        portfolio_30um_item1: "Agpdcu Probe mounted jig development",
        portfolio_30um_item2: "Rew Pin development mounted jig commercialization",
        portfolio_30um_item3: "High precision implementation",
        
        portfolio_automation_title: "Design Process Automation Development",
        portfolio_automation_desc: "Customer-customized design process optimization",
        portfolio_automation_item1: "Various design software tool utilization expertise",
        portfolio_automation_item2: "AI-powered design automation development",
        portfolio_automation_item3: "Customized training programs for customer engineers",
        
        portfolio_wireprobe_title: "Wire Probe JIG Design and Manufacturing",
        portfolio_wireprobe_desc: "From 20~30㎛ integrated Structure design to complete manufacturing",
        portfolio_wireprobe_item1: "One-stop service from design to manufacturing",
        portfolio_wireprobe_item2: "25,30㎛ Samsung Electro-Mechanics approval completed",
        portfolio_wireprobe_item3: "Full length 10mm integrated Wire Probe Jig development",
        
        portfolio_education_title: "Design Software Education System",
        portfolio_education_desc: "Professional education services for customer capability enhancement",
        portfolio_education_item1: "IA-Station, EZ-Cat, Cam350 professional training",
        portfolio_education_item2: "JIG Trouble resolution direction presentation",
        portfolio_education_item3: "Practice-oriented customized training curriculum",
        
        // Tags
        tag_world_first: "World's First",
        tag_electrical_test: "Electrical Test",
        tag_commercialization: "Commercialization",
        tag_software_education: "Software Education",
        tag_process_improvement: "Process Improvement",
        tag_customer_support: "Customer Support",
        tag_samsung: "Samsung Electro-Mechanics",
        tag_complete_product: "Complete Manufacturing",
        tag_integrated_structure: "Integrated Structure",
        tag_education_service: "Education Service",
        tag_software_expertise: "Software Expertise",
        tag_capability_enhancement: "Capability Enhancement",
        
        // Technology Detail Items
        tech_core_item1: "JIG specification to complete manufacturing technology",
        tech_core_item2: "JIG optimal development design technology support",
        tech_core_item3: "Customer-customized sales strategy solution support",
        
        tech_capability_item1: "20+ years JIG design experience",
        tech_capability_item2: "Samsung Electro-Mechanics supplier development approval",
        tech_capability_item3: "Software utilization expertise",
        tech_capability_item4: "AI prompt engineering technology",
        
        tech_innovation_item1: "MEMS JIG design and manufacturing technology",
        tech_innovation_item2: "20~30㎛ JIG development technology",
        tech_innovation_item3: "Customized design process automation support",
        
        // Statistics Items
        stat_years: "Years Experience",
        stat_projects: "Completed Projects",
        stat_software: "Software Expertise",
        stat_world_first: "World's First Technology"
    },
    
    ja: {
        // ナビゲーション
        nav_home: "ホーム",
        nav_about: "会社紹介",
        nav_services: "サービス",
        nav_jig_gallery: "治具ギャラリー", 
        nav_portfolio: "ポートフォリオ",
        nav_technology: "技術力",
        nav_contact: "お問い合わせ",
        
        // メインセクション
        hero_title: "専門家チームによる治具設計革新",
        hero_subtitle: "半導体PCB 治具設計分野の専門家が創り出す<br>革新的な技術ソリューションと差別化されたサービス",
        hero_btn_contact: "お問い合わせ",
        hero_btn_portfolio: "プロジェクトを見る",
        hero_stat_years: "年の経験",
        hero_stat_projects: "プロジェクト",
        hero_stat_mems: "世界初<br>MEMS 治具開発",
        
        // 会社紹介セクション
        about_title: "I.B.S 紹介",
        about_subtitle: "InnoBridge SOLUTION - 革新的な技術ソリューションパートナー",
        about_main_title: "専門家チームとの技術革新",
        about_description: "I.B.S(InnoBridge SOLUTION)は半導体PCB 治具設計分野の専門企業です。水原に本社を置く革新的な技術ソリューション会社として、経験豊富な専門家チームがお客様に最適なソリューションを提供します。",
        
        feature_probe_title: "半導体テストワイヤプローブ治具", 
        feature_probe_desc: "仕様、ガーバー、設計から完成品まで Wire Probe 治具 ワンストップサービス",
        feature_mems_title: "MEMS 治具開発",
        feature_mems_desc: "世界初電気検査MEMS 治具開発経験",
        feature_optimization_title: "設計工程プロセス最適化",
        feature_optimization_desc: "専門ソフトウェアツールを活用した設計効率性の最大化",
        feature_education_title: "設計ソフトウェア教育",
        feature_education_desc: "IA-Station、EZ-Cat、Cam350、AutoCADなど専門教育",
        
        ceo_intro_title: "代表取締役紹介",
        ceo_name: "イ・ジュンロ代表取締役",
        ceo_position: "CEO（最高経営責任者）",
        ceo_experience: "20年治具設計経験",
        ceo_education: "公州師範大学校英文学科",
        ceo_expertise: "Wire Probe 治具、MEMS 治具専門家",
        
        // サービスセクション
        services_title: "専門サービス",
        services_subtitle: "お客様の技術向上のためのカスタマイズソリューション",
        
        service_design_title: "治具設計・完成品製作",
        service_design_desc: "設計技術と製作ノウハウに基づく多様なWire Probe設計から完成品製作までのワンストップサービス",
        service_consulting_title: "技術コンサルティング",
        service_consulting_desc: "20年のノウハウに基づく専門技術コンサルティングサービス",
        service_optimization_title: "設計プロセス最適化",
        service_optimization_desc: "専門ソフトウェアツールを活用した設計プロセス革新",
        service_education_title: "設計ソフトウェア教育",
        service_education_desc: "お客様企業エンジニア対象の専門ソフトウェア教育サービス",
        
        // ポートフォリオセクション
        portfolio_title: "主要プロジェクト",
        portfolio_subtitle: "革新的な治具設計プロジェクト",
        
        // 技術セクション
        technology_title: "技術力・特許",
        technology_subtitle: "20年蓄積されたノウハウと革新技術",
        tech_core_title: "コア技術",
        tech_capability_title: "保有能力",
        tech_innovation_title: "革新技術",
        
        // 連絡先セクション
        contact_title: "お問い合わせ",
        contact_subtitle: "治具設計専門家に直接相談してください",
        contact_address_title: "住所",
        contact_phone_title: "連絡先",
        contact_email_title: "メール",
        contact_website_title: "ウェブサイト",
        contact_method_title: "お問い合わせ方法",
        contact_direct_title: "今すぐお電話ください！",
        contact_form_title: "またはオンラインお問い合わせ",
        form_name: "お名前",
        form_email: "メールアドレス",
        form_phone: "電話番号",
        form_company: "会社名",
        form_message: "お問い合わせ内容",
        
        // 治具ギャラリーセクション
        gallery_title: "治具ギャラリー",
        gallery_subtitle: "I.B.Sで設計・製作した様々な治具製品をご覧ください。<br>20年の経験と専門性で完成した革新的な技術力をご確認いただけます。",
        gallery_stat_years: "年設計経験",
        gallery_stat_jigs: "完成した治具",
        gallery_stat_first: "世界初",
        gallery_stat_mems: "MEMS 治具",
        filter_all: "全て",
        filter_wire_probe: "Wire Probe 治具",
        filter_mems: "MEMS 治具",
        filter_precision: "超精密治具",
        filter_custom: "カスタム治具",
        filter_software: "ソフトウェア教育",
        
        // サービス詳細項目
        service_design_item1: "Wire Probe 治具設計から完成品製作まで",
        service_design_item2: "20~30㎛統合Structure製作",
        service_design_item3: "全長10mm統合Structure",
        service_design_item4: "Agpdcu Probe搭載治工具完成品",
        service_design_item5: "MEMS 治具設計・製作",
        
        service_consulting_item1: "設計最適化コンサルティング",
        service_consulting_item2: "プロセス改善方案提示",
        service_consulting_item3: "コスト削減ソリューション",
        
        service_optimization_item1: "IA-Station、EZ-Cat活用最適化",
        service_optimization_item2: "Cam350、AutoCAD専門技術",
        service_optimization_item3: "CAD/CAM多様ツール活用",
        
        service_education_item1: "IA-Station、EZ-Cat実務教育",
        service_education_item2: "Cam350、AutoCAD活用法伝授",
        service_education_item3: "多様なカスタマイズ教育カリキュラム",
        
        // ポートフォリオ項目
        portfolio_mems_title: "MEMS 治具開発",
        portfolio_mems_desc: "世界初電気検査MEMS 治具開発",
        portfolio_mems_item1: "世界初電気検査MEMS 治具開発",
        portfolio_mems_item2: "サムスン電機納品商用化",
        portfolio_mems_item3: "次世代MEMS 治具開発（Multiway MEMS）",
        
        portfolio_30um_title: "30um Probe 治具開発",
        portfolio_30um_desc: "Agpdcu Probe搭載治工具開発",
        portfolio_30um_item1: "Agpdcu Probe搭載治工具開発",
        portfolio_30um_item2: "Rew Pin開発搭載治工具商用化",
        portfolio_30um_item3: "高精度実現",
        
        portfolio_automation_title: "設計工程Process自動化開発",
        portfolio_automation_desc: "お客様カスタマイズ設計プロセス最適化",
        portfolio_automation_item1: "多様な設計ソフトウェアツール活用専門性",
        portfolio_automation_item2: "AIを活用した設計自動化開発",
        portfolio_automation_item3: "お客様エンジニア対象カスタマイズ教育プログラム",
        
        portfolio_wireprobe_title: "Wire Probe 治具設計・製作",
        portfolio_wireprobe_desc: "20~30㎛統合Structure設計から完成品製作まで",
        portfolio_wireprobe_item1: "設計から製作までワンストップサービス構築",
        portfolio_wireprobe_item2: "25、30㎛サムスン電機承認完了",
        portfolio_wireprobe_item3: "全長10mm統合Wire Probe 治具開発",
        
        portfolio_education_title: "設計ソフトウェア教育システム",
        portfolio_education_desc: "お客様能力強化のための専門教育サービス",
        portfolio_education_item1: "IA-Station、EZ-Cat、Cam350専門教育",
        portfolio_education_item2: "治具 Trouble解決方向提示",
        portfolio_education_item3: "実務中心カスタマイズ教育カリキュラム",
        
        // タグ
        tag_world_first: "世界初",
        tag_electrical_test: "電気検査",
        tag_commercialization: "商用化",
        tag_software_education: "ソフトウェア教育",
        tag_process_improvement: "プロセス改善",
        tag_customer_support: "顧客支援",
        tag_samsung: "サムスン電機",
        tag_complete_product: "完成品製作",
        tag_integrated_structure: "統合Structure",
        tag_education_service: "教育サービス",
        tag_software_expertise: "ソフトウェア専門性",
        tag_capability_enhancement: "能力強化",
        
        // 技術力詳細項目
        tech_core_item1: "治具仕様から完成品製作技術保有",
        tech_core_item2: "治具最適開発設計技術支援",
        tech_core_item3: "顧客カスタマイズ営業戦略ソリューション支援",
        
        tech_capability_item1: "20年以上治具設計経験",
        tech_capability_item2: "サムスン電機サプライヤー開発承認",
        tech_capability_item3: "ソフトウェア活用専門性",
        tech_capability_item4: "AIプロンプトエンジニアリング技術",
        
        tech_innovation_item1: "MEMS 治具設計・製作技術保有",
        tech_innovation_item2: "20~30㎛ 治具開発技術保有",
        tech_innovation_item3: "カスタマイズ設計Process自動化支援",
        
        // 統計項目
        stat_years: "年経験",
        stat_projects: "完了プロジェクト",
        stat_software: "ソフトウェア専門性",
        stat_world_first: "世界初技術"
    },
    
    zh: {
        // 导航
        nav_home: "首页",
        nav_about: "公司介绍",
        nav_services: "服务",
        nav_jig_gallery: "JIG画廊",
        nav_portfolio: "作品集",
        nav_technology: "技术力",
        nav_contact: "联系我们",
        
        // 主要部分
        hero_title: "专家团队的JIG设计创新",
        hero_subtitle: "半导体PCB JIG设计领域专家打造的<br>创新技术解决方案和差异化服务",
        hero_btn_contact: "联系我们",
        hero_btn_portfolio: "查看项目",
        hero_stat_years: "年经验",
        hero_stat_projects: "项目",
        hero_stat_mems: "世界首创<br>MEMS JIG开发",
        
        // 公司介绍部分
        about_title: "I.B.S 介绍",
        about_subtitle: "InnoBridge SOLUTION - 创新技术解决方案合作伙伴",
        about_main_title: "与专家团队共同进行技术创新",
        about_description: "I.B.S(InnoBridge SOLUTION)是半导体PCB JIG设计领域的专业企业。作为总部位于水原的创新技术解决方案公司，经验丰富的专家团队为客户提供最佳解决方案。",
        
        feature_probe_title: "半导体测试线探针JIG",
        feature_probe_desc: "从规格、Gerber、设计到成品的Wire Probe JIG一站式服务",
        feature_mems_title: "MEMS JIG开发",
        feature_mems_desc: "世界首创电气检查MEMS JIG开发经验",
        feature_optimization_title: "设计工艺流程优化",
        feature_optimization_desc: "利用专业软件工具最大化设计效率",
        feature_education_title: "设计软件教育",
        feature_education_desc: "IA-Station、EZ-Cat、Cam350、AutoCAD等专业教育",
        
        ceo_intro_title: "总裁介绍",
        ceo_name: "李俊路总裁",
        ceo_position: "CEO（首席执行官）",
        ceo_experience: "20年JIG设计经验",
        ceo_education: "公州师范大学英文学科",
        ceo_expertise: "Wire Probe JIG、MEMS JIG专家",
        
        // 服务部分
        services_title: "专业服务",
        services_subtitle: "为客户技术提升提供的定制化解决方案",
        
        service_design_title: "JIG设计与成品制作",
        service_design_desc: "基于设计技术和制作诀窍，从各种Wire Probe设计到成品制作的一站式服务",
        service_consulting_title: "技术咨询",
        service_consulting_desc: "基于20年诀窍的专业技术咨询服务",
        service_optimization_title: "设计流程优化",
        service_optimization_desc: "利用专业软件工具进行设计流程创新",
        service_education_title: "设计软件教育",
        service_education_desc: "面向客户企业工程师的专业软件教育服务",
        
        // 作品集部分
        portfolio_title: "主要项目",
        portfolio_subtitle: "创新JIG设计项目",
        
        // 技术部分
        technology_title: "技术力与专利",
        technology_subtitle: "20年积累的诀窍与创新技术",
        tech_core_title: "核心技术",
        tech_capability_title: "拥有能力",
        tech_innovation_title: "创新技术",
        
        // 联系部分
        contact_title: "联系我们",
        contact_subtitle: "请直接向JIG设计专家咨询",
        contact_address_title: "地址",
        contact_phone_title: "联系方式",
        contact_email_title: "邮箱",
        contact_website_title: "网站",
        contact_method_title: "联系方式",
        contact_direct_title: "立即联系我们！",
        contact_form_title: "或在线咨询",
        form_name: "姓名",
        form_email: "邮箱",
        form_phone: "电话号码",
        form_company: "公司名",
        form_message: "咨询内容",
        
        // JIG画廊部分
        gallery_title: "JIG画廊",
        gallery_subtitle: "了解I.B.S设计制作的各种JIG产品。<br>通过20年经验和专业性完成的创新技术力，请您确认。",
        gallery_stat_years: "年设计经验",
        gallery_stat_jigs: "完成的JIG",
        gallery_stat_first: "世界首创",
        gallery_stat_mems: "MEMS JIG",
        filter_all: "全部",
        filter_wire_probe: "Wire Probe JIG",
        filter_mems: "MEMS JIG",
        filter_precision: "超精密JIG",
        filter_custom: "定制JIG",
        filter_software: "软件教育",
        
        // 服务详细项目
        service_design_item1: "从Wire Probe JIG设计到完成品制作",
        service_design_item2: "20~30㎛集成Structure制作",
        service_design_item3: "全长10mm集成Structure",
        service_design_item4: "Agpdcu Probe搭载治工具完成品",
        service_design_item5: "MEMS JIG设计与制作",
        
        service_consulting_item1: "设计优化咨询",
        service_consulting_item2: "流程改善方案提示",
        service_consulting_item3: "成本削减解决方案",
        
        service_optimization_item1: "IA-Station、EZ-Cat活用优化",
        service_optimization_item2: "Cam350、AutoCAD专业技术",
        service_optimization_item3: "CAD/CAM多样工具活用",
        
        service_education_item1: "IA-Station、EZ-Cat实务教育",
        service_education_item2: "Cam350、AutoCAD活用法传授",
        service_education_item3: "多样定制化教育课程",
        
        // 作品集项目
        portfolio_mems_title: "MEMS JIG开发",
        portfolio_mems_desc: "世界首创电气检查MEMS JIG开发",
        portfolio_mems_item1: "世界首创电气检查MEMS JIG开发",
        portfolio_mems_item2: "三星电机供货商用化",
        portfolio_mems_item3: "下一代MEMS JIG开发（Multiway MEMS）",
        
        portfolio_30um_title: "30um Probe JIG开发",
        portfolio_30um_desc: "Agpdcu Probe搭载治工具开发",
        portfolio_30um_item1: "Agpdcu Probe搭载治工具开发",
        portfolio_30um_item2: "Rew Pin开发搭载治工具商用化",
        portfolio_30um_item3: "高精度实现",
        
        portfolio_automation_title: "设计工程Process自动化开发",
        portfolio_automation_desc: "客户定制化设计流程优化",
        portfolio_automation_item1: "多样设计软件工具活用专业性",
        portfolio_automation_item2: "利用AI的设计自动化开发",
        portfolio_automation_item3: "客户工程师对象定制化教育项目",
        
        portfolio_wireprobe_title: "Wire Probe JIG设计与制作",
        portfolio_wireprobe_desc: "从20~30㎛集成Structure设计到完成品制作",
        portfolio_wireprobe_item1: "从设计到制作的一站式服务构建",
        portfolio_wireprobe_item2: "25、30㎛三星电机批准完成",
        portfolio_wireprobe_item3: "全长10mm集成Wire Probe Jig开发",
        
        portfolio_education_title: "设计软件教育系统",
        portfolio_education_desc: "为客户能力强化的专业教育服务",
        portfolio_education_item1: "IA-Station、EZ-Cat、Cam350专业教育",
        portfolio_education_item2: "JIG Trouble解决方向提示",
        portfolio_education_item3: "实务中心定制化教育课程",
        
        // 标签
        tag_world_first: "世界首创",
        tag_electrical_test: "电气检查",
        tag_commercialization: "商用化",
        tag_software_education: "软件教育",
        tag_process_improvement: "流程改善",
        tag_customer_support: "客户支援",
        tag_samsung: "三星电机",
        tag_complete_product: "完成品制作",
        tag_integrated_structure: "集成Structure",
        tag_education_service: "教育服务",
        tag_software_expertise: "软件专业性",
        tag_capability_enhancement: "能力强化",
        
        // 技术力详细项目
        tech_core_item1: "从JIG规格到完成品制作技术保有",
        tech_core_item2: "JIG最优开发设计技术支援",
        tech_core_item3: "客户定制营业战略解决方案支援",
        
        tech_capability_item1: "20年以上JIG设计经验",
        tech_capability_item2: "三星电机供应商开发批准",
        tech_capability_item3: "软件活用专业性",
        tech_capability_item4: "AI提示工程技术",
        
        tech_innovation_item1: "MEMS JIG设计制作技术保有",
        tech_innovation_item2: "20~30㎛ JIG开发技术保有",
        tech_innovation_item3: "定制设计Process自动化支援",
        
        // 统计项目
        stat_years: "年经验",
        stat_projects: "完成项目",
        stat_software: "软件专业性",
        stat_world_first: "世界首创技术"
    }
};

// 현재 언어 상태
let currentLanguage = 'ko';

// 언어 변경 함수
function changeLanguage(lang) {
    currentLanguage = lang;
    localStorage.setItem('language', lang);
    translatePage();
    updateLanguageSelector();
}

// 페이지 번역 함수
function translatePage() {
    const elements = document.querySelectorAll('[data-translate]');
    elements.forEach(element => {
        const key = element.getAttribute('data-translate');
        if (translations[currentLanguage] && translations[currentLanguage][key]) {
            element.innerHTML = translations[currentLanguage][key];
        }
    });
    
    // HTML lang 속성 업데이트
    document.documentElement.lang = currentLanguage;
}

// 언어 선택기 UI 업데이트
function updateLanguageSelector() {
    const selector = document.querySelector('.language-selector');
    if (selector) {
        const flags = {
            ko: '🇰🇷',
            en: '🇺🇸', 
            ja: '🇯🇵',
            zh: '🇨🇳'
        };
        
        const names = {
            ko: 'KO',
            en: 'EN',
            ja: 'JP', 
            zh: 'CN'
        };
        
        const currentFlag = selector.querySelector('.current-language');
        if (currentFlag) {
            currentFlag.innerHTML = `${flags[currentLanguage]} ${names[currentLanguage]}`;
        }
    }
}

// 페이지 로드 시 초기화
document.addEventListener('DOMContentLoaded', function() {
    // 저장된 언어 설정 불러오기
    const savedLanguage = localStorage.getItem('language');
    if (savedLanguage && translations[savedLanguage]) {
        currentLanguage = savedLanguage;
    }
    
    // 초기 번역 실행
    translatePage();
    updateLanguageSelector();
    
    // 언어 선택 이벤트 리스너 추가
    const languageOptions = document.querySelectorAll('.language-option');
    languageOptions.forEach(option => {
        option.addEventListener('click', function(e) {
            e.preventDefault();
            const lang = this.getAttribute('data-lang');
            changeLanguage(lang);
        });
    });
}); 