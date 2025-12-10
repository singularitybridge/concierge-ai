export interface MenuItem {
  id: string;
  image: string;
  category: string;
  title: {
    en: string;
    zh: string;
    ja: string;
    ru: string;
  };
  description: {
    en: string;
    zh: string;
    ja: string;
    ru: string;
  };
  price?: number;
  isSignature?: boolean;
  isSpicy?: boolean;
  isVegetarian?: boolean;
}

export interface MenuCategory {
  id: string;
  name: {
    en: string;
    zh: string;
    ja: string;
    ru: string;
  };
  icon: string;
}

export const menuCategories: MenuCategory[] = [
  {
    id: 'signature',
    name: {
      en: 'Signature Dishes',
      zh: '招牌菜',
      ja: 'シグネチャー料理',
      ru: 'Фирменные блюда'
    },
    icon: 'star'
  },
  {
    id: 'appetizers',
    name: {
      en: 'Appetizers',
      zh: '前菜',
      ja: '前菜',
      ru: 'Закуски'
    },
    icon: 'utensils'
  },
  {
    id: 'specialty',
    name: {
      en: 'Specialty Dishes',
      zh: '特色菜',
      ja: '特選料理',
      ru: 'Фирменные блюда'
    },
    icon: 'chef-hat'
  },
  {
    id: 'stir-fry',
    name: {
      en: 'Stir-Fry',
      zh: '小炒',
      ja: '炒め物',
      ru: 'Жареные блюда'
    },
    icon: 'flame'
  },
  {
    id: 'soups',
    name: {
      en: 'Soups',
      zh: '汤',
      ja: 'スープ',
      ru: 'Супы'
    },
    icon: 'soup'
  },
  {
    id: 'steamed',
    name: {
      en: 'Steamed Dishes',
      zh: '蒸菜',
      ja: '蒸し料理',
      ru: 'Паровые блюда'
    },
    icon: 'cloud'
  },
  {
    id: 'wild-game',
    name: {
      en: 'Wild Game',
      zh: '野味',
      ja: 'ジビエ',
      ru: 'Дичь'
    },
    icon: 'leaf'
  },
  {
    id: 'mains-desserts',
    name: {
      en: 'Mains & Desserts',
      zh: '主食与甜品',
      ja: '主食とデザート',
      ru: 'Основные блюда и десерты'
    },
    icon: 'cake'
  }
];

export const menuItems: MenuItem[] = [
  // Signature Dishes (招牌菜)
  {
    id: 'spicy-chicken-pot',
    image: '/menu/spicy-chicken-pot.jpg',
    category: 'signature',
    title: {
      en: 'Spicy Chicken Pot',
      zh: '香辣鸡煲',
      ja: 'スパイシーチキン鍋',
      ru: 'Острая курица в горшочке'
    },
    description: {
      en: 'Tender chicken pieces simmered in a fragrant, spicy broth with aromatic spices and fresh herbs',
      zh: '嫩滑鸡肉配上香辣汤底，搭配香料和新鲜香草慢炖而成',
      ja: '柔らかい鶏肉を香り豊かなスパイシーブロスでじっくり煮込んだ一品',
      ru: 'Нежная курица, тушенная в ароматном остром бульоне с пряностями и свежей зеленью'
    },
    isSignature: true,
    isSpicy: true
  },
  {
    id: 'spicy-numbing-seafood-hotpot',
    image: '/menu/spicy-numbing-seafood-hotpot.jpg',
    category: 'signature',
    title: {
      en: 'Mala Seafood Dry Pot',
      zh: '麻辣海鲜干锅',
      ja: '麻辣シーフード干鍋',
      ru: 'Острый сухой вок с морепродуктами'
    },
    description: {
      en: 'Fresh seafood tossed in numbing Sichuan peppercorns and dried chilies, creating an addictive mala sensation',
      zh: '新鲜海鲜配上四川花椒和干辣椒，麻辣鲜香',
      ja: '新鮮な海鮮を四川山椒と唐辛子で炒めた、クセになる麻辣の一品',
      ru: 'Свежие морепродукты с сычуаньским перцем и сушеным чили'
    },
    isSignature: true,
    isSpicy: true
  },
  {
    id: 'sichuan-boiled-wagyu-beef',
    image: '/menu/sichuan-boiled-wagyu-beef.jpg',
    category: 'signature',
    title: {
      en: 'Sichuan Boiled Wagyu Beef',
      zh: '水煮和牛',
      ja: '水煮和牛',
      ru: 'Говядина Вагю по-сычуаньски'
    },
    description: {
      en: 'Premium wagyu beef slices in a fiery red chili oil broth, garnished with bean sprouts and cilantro',
      zh: '优质和牛薄片配上红油辣汤，搭配豆芽和香菜',
      ja: 'プレミアム和牛を真っ赤なラー油スープで仕上げ、もやしとパクチーを添えて',
      ru: 'Премиальная говядина Вагю в огненном бульоне с чили, ростками фасоли и кинзой'
    },
    isSignature: true,
    isSpicy: true
  },
  {
    id: 'pickled-cabbage-fish',
    image: '/menu/pickled-cabbage-fish.jpg',
    category: 'signature',
    title: {
      en: 'Pickled Cabbage Fish',
      zh: '酸菜鱼',
      ja: '酸菜魚',
      ru: 'Рыба с квашеной капустой'
    },
    description: {
      en: 'Fresh fish fillets in a tangy pickled mustard green broth, a classic Sichuan comfort dish',
      zh: '新鲜鱼片配上酸菜汤底，经典四川家常味道',
      ja: '新鮮な魚の切り身を酸菜スープで煮込んだ、四川の家庭料理の定番',
      ru: 'Филе свежей рыбы в кисловатом бульоне с маринованной горчичной зеленью'
    },
    isSignature: true
  },
  {
    id: 'boiling-fish-in-spicy-broth',
    image: '/menu/boiling-fish-in-spicy-broth.jpg',
    category: 'signature',
    title: {
      en: 'Boiling Fish in Spicy Broth',
      zh: '麻辣沸腾鱼',
      ja: '麻辣沸騰魚',
      ru: 'Кипящая рыба в остром бульоне'
    },
    description: {
      en: 'Dramatic tableside presentation of fresh fish in bubbling mala broth with numbing peppercorns',
      zh: '现场浇热油的新鲜鱼片，麻辣汤底沸腾上桌',
      ja: 'テーブルで熱々の油を注ぐパフォーマンス、麻辣スープで煮込んだ新鮮な魚',
      ru: 'Эффектная подача свежей рыбы в бурлящем остром бульоне с сычуаньским перцем'
    },
    isSignature: true,
    isSpicy: true
  },

  // Appetizers (前菜)
  {
    id: 'soy-braised-beef',
    image: '/menu/soy-braised-beef.jpg',
    category: 'appetizers',
    title: {
      en: 'Soy Braised Beef',
      zh: '酱牛肉',
      ja: '醤油牛肉',
      ru: 'Говядина в соевом соусе'
    },
    description: {
      en: 'Thinly sliced beef slowly braised in aromatic soy sauce, served cold with a silky texture',
      zh: '薄切牛肉配上香浓酱汁慢炖，冷盘呈上，口感细腻',
      ja: '香り高い醤油でじっくり煮込んだ牛肉の薄切り、冷製で滑らかな食感',
      ru: 'Тонко нарезанная говядина, тушенная в ароматном соевом соусе, подается холодной'
    }
  },
  {
    id: 'cold-chicken-in-chili-oil',
    image: '/menu/cold-chicken-in-chili-oil.jpg',
    category: 'appetizers',
    title: {
      en: 'Bo Bo Chicken',
      zh: '钵钵鸡',
      ja: '鉢鉢鶏',
      ru: 'Курица Бо Бо'
    },
    description: {
      en: 'Cold chicken skewers marinated in fragrant chili oil with sesame and Sichuan peppercorn',
      zh: '串串冷鸡肉浸泡在香辣红油中，配以芝麻和花椒',
      ja: '香り豊かなラー油に漬け込んだ冷製鶏肉の串、ゴマと山椒を添えて',
      ru: 'Холодные куриные шашлычки в ароматном масле чили с кунжутом и сычуаньским перцем'
    },
    isSpicy: true
  },
  {
    id: 'pork-ear-in-chili-oil',
    image: '/menu/pork-ear-in-chili-oil.jpg',
    category: 'appetizers',
    title: {
      en: 'Pork Ear in Chili Oil',
      zh: '红油猪耳',
      ja: '紅油豚耳',
      ru: 'Свиные уши в масле чили'
    },
    description: {
      en: 'Thinly sliced pig ears with a crunchy texture, dressed in spicy red chili oil',
      zh: '薄切猪耳朵，口感爽脆，配以香辣红油',
      ja: '薄切りの豚耳、コリコリ食感にスパイシーな紅油をかけて',
      ru: 'Тонко нарезанные свиные уши с хрустящей текстурой в остром красном масле чили'
    },
    isSpicy: true
  },
  {
    id: 'smashed-cucumber-with-garlic',
    image: '/menu/smashed-cucumber-with-garlic.jpg',
    category: 'appetizers',
    title: {
      en: 'Smashed Cucumber with Garlic',
      zh: '蒜拍黄瓜',
      ja: 'たたきキュウリのニンニク和え',
      ru: 'Битые огурцы с чесноком'
    },
    description: {
      en: 'Refreshing smashed cucumbers tossed with fresh garlic, light soy sauce, and sesame oil',
      zh: '爽脆黄瓜配上新鲜蒜蓉、生抽和香油',
      ja: 'さっぱりとしたたたきキュウリに、生ニンニク、薄口醤油、ごま油を和えて',
      ru: 'Освежающие битые огурцы со свежим чесноком, легким соевым соусом и кунжутным маслом'
    },
    isVegetarian: true
  },
  {
    id: 'mouthwatering-chicken',
    image: '/menu/mouthwatering-chicken.jpg',
    category: 'appetizers',
    title: {
      en: 'Mouthwatering Chicken',
      zh: '口水鸡',
      ja: '口水鶏',
      ru: 'Курица "Слюнки текут"'
    },
    description: {
      en: 'Poached chicken slices drenched in a spicy, numbing sauce so good it makes your mouth water',
      zh: '白切鸡片浇上麻辣酱汁，让人垂涎欲滴',
      ja: '茹で鶏のスライスに、よだれが出るほど美味しい麻辣ソースをたっぷりと',
      ru: 'Ломтики отварной курицы в остром соусе, от которого текут слюнки'
    },
    isSpicy: true
  },

  // Specialty Dishes (特色菜)
  {
    id: 'garlic-spare-ribs',
    image: '/menu/garlic-spare-ribs.jpg',
    category: 'specialty',
    title: {
      en: 'Garlic Spare Ribs',
      zh: '蒜香排骨',
      ja: 'ガーリックスペアリブ',
      ru: 'Свиные ребрышки с чесноком'
    },
    description: {
      en: 'Crispy fried spare ribs coated in a fragrant garlic sauce, perfectly balanced sweet and savory',
      zh: '酥脆排骨裹上香浓蒜汁，甜咸适中',
      ja: 'カリカリに揚げたスペアリブに香り豊かなガーリックソースを絡めて',
      ru: 'Хрустящие жареные ребрышки в ароматном чесночном соусе'
    }
  },
  {
    id: 'pickled-pepper-chicken-giblets',
    image: '/menu/pickled-pepper-chicken-giblets.jpg',
    category: 'specialty',
    title: {
      en: 'Pickled Pepper Chicken Giblets',
      zh: '泡椒鸡杂',
      ja: '泡椒鶏モツ',
      ru: 'Куриные потроха с маринованным перцем'
    },
    description: {
      en: 'Tender chicken gizzards and hearts stir-fried with tangy pickled peppers',
      zh: '嫩滑鸡胗和鸡心配上酸辣泡椒快炒',
      ja: '柔らかい鶏の砂肝とハツを酸っぱい泡椒で炒めて',
      ru: 'Нежные куриные потроха, обжаренные с кисловатым маринованным перцем'
    },
    isSpicy: true
  },
  {
    id: 'yu-xiang-shredded-pork',
    image: '/menu/yu-xiang-shredded-pork.jpg',
    category: 'specialty',
    title: {
      en: 'Yu Xiang Shredded Pork',
      zh: '鱼香肉丝',
      ja: '魚香肉絲',
      ru: 'Свинина Юй Сян'
    },
    description: {
      en: 'Shredded pork in a savory-sweet "fish fragrant" sauce with wood ear mushrooms and bamboo',
      zh: '肉丝配上甜咸鱼香汁，搭配木耳和竹笋',
      ja: '細切り豚肉を甘辛い魚香ソースで炒め、キクラゲと竹の子を添えて',
      ru: 'Нашинкованная свинина в сладко-соленом соусе "рыбный аромат" с древесными грибами'
    }
  },
  {
    id: 'spicy-diced-chicken',
    image: '/menu/spicy-diced-chicken.jpg',
    category: 'specialty',
    title: {
      en: 'La Zi Ji - Spicy Diced Chicken',
      zh: '辣子鸡',
      ja: '辣子鶏',
      ru: 'Ла Цзы Цзи - Острая курица'
    },
    description: {
      en: 'Crispy chicken pieces buried in a mountain of dried chilies and Sichuan peppercorns',
      zh: '酥脆鸡块埋在满满的干辣椒和花椒中',
      ja: 'カリカリの鶏肉を山盛りの唐辛子と山椒で覆って',
      ru: 'Хрустящие кусочки курицы в горе сушеного чили и сычуаньского перца'
    },
    isSpicy: true
  },
  {
    id: 'green-pepper-shredded-pork',
    image: '/menu/green-pepper-shredded-pork.jpg',
    category: 'specialty',
    title: {
      en: 'Green Pepper Shredded Pork',
      zh: '青椒肉丝',
      ja: '青椒肉絲',
      ru: 'Свинина с зеленым перцем'
    },
    description: {
      en: 'Classic stir-fry of tender pork strips with fresh green peppers in a light soy glaze',
      zh: '经典快炒嫩肉丝配上新鲜青椒，淋上生抽',
      ja: '柔らかい豚肉の細切りと新鮮なピーマンの定番炒め、薄口醤油で仕上げ',
      ru: 'Классическое жаркое из нежной свинины со свежим зеленым перцем'
    }
  },
  {
    id: 'kung-pao-chicken',
    image: '/menu/kung-pao-chicken.jpg',
    category: 'specialty',
    title: {
      en: 'Kung Pao Chicken',
      zh: '宫保鸡丁',
      ja: '宮保鶏丁',
      ru: 'Курица Гунбао'
    },
    description: {
      en: 'Diced chicken with peanuts, dried chilies, and Sichuan peppercorns in a sweet-savory sauce',
      zh: '鸡丁配上花生、干辣椒和花椒，浇上甜咸酱汁',
      ja: '鶏肉のさいの目切りにピーナッツ、唐辛子、山椒を加え、甘辛いソースで',
      ru: 'Нарезанная кубиками курица с арахисом, сушеным чили и сычуаньским перцем'
    },
    isSpicy: true
  },
  {
    id: 'twice-cooked-pork',
    image: '/menu/twice-cooked-pork.jpg',
    category: 'specialty',
    title: {
      en: 'Twice Cooked Pork',
      zh: '回锅肉',
      ja: '回鍋肉',
      ru: 'Свинина двойной обжарки'
    },
    description: {
      en: 'Sliced pork belly first boiled then stir-fried with leeks and fermented black beans',
      zh: '五花肉先煮后炒，配上韭菜和豆豉',
      ja: '豚バラ肉を茹でてから、ニラと豆豉で炒めた四川の定番',
      ru: 'Свиная грудинка, сначала отваренная, затем обжаренная с луком-пореем'
    }
  },
  {
    id: 'braised-beef-brisket-with-potato',
    image: '/menu/braised-beef-brisket-with-potato.jpg',
    category: 'specialty',
    title: {
      en: 'Braised Beef Brisket with Potato',
      zh: '土豆炖牛腩',
      ja: '牛バラ肉とジャガイモの煮込み',
      ru: 'Тушеная говяжья грудинка с картофелем'
    },
    description: {
      en: 'Tender beef brisket slow-braised with potatoes until melt-in-your-mouth perfection',
      zh: '嫩牛腩和土豆慢炖至入口即化',
      ja: '牛バラ肉とジャガイモをじっくり煮込み、とろけるような柔らかさに',
      ru: 'Нежная говяжья грудинка, медленно тушенная с картофелем до таяния во рту'
    }
  },

  // Stir-Fry (小炒)
  {
    id: 'hot-and-sour-potato-shreds',
    image: '/menu/hot-and-sour-potato-shreds.jpg',
    category: 'stir-fry',
    title: {
      en: 'Hot and Sour Potato Shreds',
      zh: '酸辣土豆丝',
      ja: '酸辣土豆絲',
      ru: 'Кисло-острая картофельная соломка'
    },
    description: {
      en: 'Julienned potatoes with a crisp texture, stir-fried with vinegar and dried chilies',
      zh: '细切土豆丝口感爽脆，配上醋和干辣椒快炒',
      ja: '千切りジャガイモをシャキシャキに、お酢と唐辛子で炒めて',
      ru: 'Хрустящая картофельная соломка, обжаренная с уксусом и сушеным чили'
    },
    isSpicy: true,
    isVegetarian: true
  },
  {
    id: 'crispy-corn-cake',
    image: '/menu/crispy-corn-cake.jpg',
    category: 'stir-fry',
    title: {
      en: 'Crispy Corn Cake',
      zh: '玉米烙',
      ja: 'コーンケーキ',
      ru: 'Хрустящий кукурузный кейк'
    },
    description: {
      en: 'Sweet corn kernels pan-fried into a crispy golden cake, a delightful sweet-savory treat',
      zh: '甜玉米粒煎成金黄酥脆的饼，甜咸可口',
      ja: 'スイートコーンをカリカリのゴールデンケーキに、甘じょっぱいおやつ',
      ru: 'Зерна сладкой кукурузы, обжаренные в хрустящую золотистую лепешку'
    },
    isVegetarian: true
  },
  {
    id: 'mapo-tofu',
    image: '/menu/mapo-tofu.jpg',
    category: 'stir-fry',
    title: {
      en: 'Mapo Tofu',
      zh: '麻婆豆腐',
      ja: '麻婆豆腐',
      ru: 'Мапо Тофу'
    },
    description: {
      en: 'Silken tofu in a fiery sauce with fermented black beans, chili oil, and ground pork',
      zh: '嫩豆腐配上麻辣酱汁、豆豉、辣油和肉末',
      ja: '絹ごし豆腐を豆豉、ラー油、挽肉入りの激辛ソースで',
      ru: 'Шелковистый тофу в остром соусе с ферментированными бобами и фаршем'
    },
    isSpicy: true
  },
  {
    id: 'eggplant-with-chili-pepper',
    image: '/menu/eggplant-with-chili-pepper.jpg',
    category: 'stir-fry',
    title: {
      en: 'Eggplant with Chili Pepper',
      zh: '尖椒炒茄子',
      ja: '茄子と唐辛子の炒め',
      ru: 'Баклажаны с острым перцем'
    },
    description: {
      en: 'Tender eggplant stir-fried with fresh green chili peppers in a savory garlic sauce',
      zh: '嫩茄子配上新鲜青椒，蒜香酱汁快炒',
      ja: '柔らかいナスと青唐辛子をガーリックソースで炒めて',
      ru: 'Нежные баклажаны, обжаренные со свежим зеленым чили в чесночном соусе'
    },
    isSpicy: true,
    isVegetarian: true
  },
  {
    id: 'tomato-scrambled-eggs',
    image: '/menu/tomato-scrambled-eggs.jpg',
    category: 'stir-fry',
    title: {
      en: 'Tomato Scrambled Eggs',
      zh: '番茄炒鸡蛋',
      ja: 'トマトと卵の炒め',
      ru: 'Яичница с помидорами'
    },
    description: {
      en: 'Fluffy scrambled eggs with sweet tomatoes, a beloved Chinese comfort classic',
      zh: '滑嫩鸡蛋配上甜番茄，中国家常菜经典',
      ja: 'ふわふわの炒り卵と甘いトマト、中国の定番家庭料理',
      ru: 'Пышная яичница со сладкими помидорами, любимая китайская классика'
    },
    isVegetarian: true
  },
  {
    id: 'stir-fried-seasonal-vegetables',
    image: '/menu/stir-fried-seasonal-vegetables.jpg',
    category: 'stir-fry',
    title: {
      en: 'Stir-Fried Seasonal Vegetables',
      zh: '炒时蔬',
      ja: '季節野菜の炒め',
      ru: 'Жареные сезонные овощи'
    },
    description: {
      en: 'Fresh seasonal vegetables quickly stir-fried with garlic to preserve their natural crunch',
      zh: '新鲜时令蔬菜配上蒜蓉快炒，保持爽脆',
      ja: '新鮮な旬の野菜をニンニクでサッと炒め、シャキシャキ感をキープ',
      ru: 'Свежие сезонные овощи, быстро обжаренные с чесноком'
    },
    isVegetarian: true
  },

  // Soups (汤)
  {
    id: 'free-range-chicken-soup',
    image: '/menu/free-range-chicken-soup.jpg',
    category: 'soups',
    title: {
      en: 'Otaru Farm Free-Range Chicken Soup',
      zh: '小樽农场走地鸡鸡汤',
      ja: '小樽農場地鶏のスープ',
      ru: 'Суп из деревенской курицы с фермы Отару'
    },
    description: {
      en: 'Rich, nourishing soup made with premium free-range chicken from Otaru Farm, simmered for hours',
      zh: '选用小樽农场优质走地鸡，慢炖数小时，营养丰富',
      ja: '小樽農場の上質な地鶏を何時間も煮込んだ、栄養たっぷりのスープ',
      ru: 'Богатый питательный суп из премиальной деревенской курицы с фермы Отару'
    }
  },
  {
    id: 'silky-pork-soup',
    image: '/menu/silky-pork-soup.jpg',
    category: 'soups',
    title: {
      en: 'Silky Pork Soup',
      zh: '滑肉汤',
      ja: 'なめらか豚肉スープ',
      ru: 'Шелковистый суп со свининой'
    },
    description: {
      en: 'Velvety pork slices in a clear, light broth with delicate seasonings',
      zh: '滑嫩肉片配上清淡汤底，味道细腻',
      ja: 'なめらかな豚肉を澄んだ軽いスープで、繊細な味付けで',
      ru: 'Бархатистые ломтики свинины в прозрачном легком бульоне'
    }
  },

  // Steamed Dishes (蒸菜)
  {
    id: 'steamed-pork-with-rice-powder',
    image: '/menu/steamed-pork-with-rice-powder.jpg',
    category: 'steamed',
    title: {
      en: 'Steamed Pork with Rice Powder',
      zh: '粉蒸肉',
      ja: '粉蒸肉',
      ru: 'Свинина на пару с рисовой пудрой'
    },
    description: {
      en: 'Tender pork belly coated in toasted rice powder, steamed until melt-in-your-mouth soft',
      zh: '五花肉裹上烤米粉，蒸至入口即化',
      ja: '豚バラ肉に炒った米粉をまぶし、とろけるような柔らかさに蒸して',
      ru: 'Нежная свиная грудинка в обжаренной рисовой пудре, приготовленная на пару'
    }
  },

  // Wild Game (野味)
  {
    id: 'braised-venison',
    image: '/menu/braised-venison.jpg',
    category: 'wild-game',
    title: {
      en: 'Braised Venison',
      zh: '红烧鹿肉',
      ja: '鹿肉の煮込み',
      ru: 'Тушеная оленина'
    },
    description: {
      en: 'Premium venison slowly braised in aromatic soy sauce with warming spices',
      zh: '优质鹿肉配上香浓酱油和温暖香料慢炖',
      ja: 'プレミアム鹿肉を香り高い醤油と温かいスパイスでじっくり煮込んで',
      ru: 'Премиальная оленина, медленно тушенная в ароматном соевом соусе со специями'
    }
  },
  {
    id: 'braised-wild-turtle',
    image: '/menu/braised-wild-turtle.jpg',
    category: 'wild-game',
    title: {
      en: 'Braised Wild Turtle',
      zh: '红烧野生甲鱼',
      ja: 'スッポンの煮込み',
      ru: 'Тушеная дикая черепаха'
    },
    description: {
      en: 'Wild soft-shell turtle braised in a rich, savory sauce, prized for its collagen',
      zh: '野生甲鱼红烧，胶原蛋白丰富，滋补佳品',
      ja: '野生のスッポンを濃厚なソースで煮込んだ、コラーゲン豊富な一品',
      ru: 'Дикая мягкотелая черепаха, тушенная в насыщенном соусе, ценится за коллаген'
    }
  },
  {
    id: 'sichuan-braised-bear-paw',
    image: '/menu/sichuan-braised-bear-paw.jpg',
    category: 'wild-game',
    title: {
      en: 'Sichuan Braised Bear Paw',
      zh: '川味红烧熊掌',
      ja: '四川風熊の手煮込み',
      ru: 'Медвежья лапа по-сычуаньски'
    },
    description: {
      en: 'A rare delicacy braised in traditional Sichuan style with aromatic spices',
      zh: '珍稀食材配上传统四川做法和香料慢炖',
      ja: '希少な珍味を四川の伝統的な方法で香り豊かなスパイスと煮込んで',
      ru: 'Редкий деликатес, тушенный в традиционном сычуаньском стиле с ароматными специями'
    }
  },

  // Mains & Desserts (主食与甜品)
  {
    id: 'fried-rice',
    image: '/menu/fried-rice.jpg',
    category: 'mains-desserts',
    title: {
      en: 'House Special Fried Rice',
      zh: '炒饭',
      ja: 'チャーハン',
      ru: 'Жареный рис по-домашнему'
    },
    description: {
      en: 'Wok-tossed rice with eggs, scallions, and savory seasonings, perfectly smoky',
      zh: '锅气十足的炒饭，配上鸡蛋、葱花和调味料',
      ja: '中華鍋で炒めたご飯に卵とネギ、香ばしいスモーキーな一品',
      ru: 'Рис, обжаренный в воке с яйцами, зеленым луком и ароматными приправами'
    }
  },
  {
    id: 'handmade-ice-jelly',
    image: '/menu/handmade-ice-jelly.jpg',
    category: 'mains-desserts',
    title: {
      en: 'Handmade Ice Jelly',
      zh: '手工冰粉',
      ja: '手作り冰粉',
      ru: 'Домашнее ледяное желе'
    },
    description: {
      en: 'Refreshing Sichuan dessert of handmade jelly with brown sugar syrup, sesame, and peanuts',
      zh: '清爽四川甜品，手工冰粉配上红糖浆、芝麻和花生',
      ja: 'さっぱりとした四川デザート、手作りゼリーに黒糖シロップ、ゴマ、ピーナッツを添えて',
      ru: 'Освежающий сычуаньский десерт: домашнее желе с сиропом, кунжутом и арахисом'
    },
    isVegetarian: true
  }
];

export function getMenuItemsByCategory(categoryId: string): MenuItem[] {
  return menuItems.filter(item => item.category === categoryId);
}

export function getSignatureItems(): MenuItem[] {
  return menuItems.filter(item => item.isSignature);
}

export function getSpicyItems(): MenuItem[] {
  return menuItems.filter(item => item.isSpicy);
}

export function getVegetarianItems(): MenuItem[] {
  return menuItems.filter(item => item.isVegetarian);
}
