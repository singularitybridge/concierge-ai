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
      en: 'Chef\'s Signature',
      zh: '主厨推荐',
      ja: 'シェフおすすめ',
      ru: 'Фирменные блюда'
    },
    icon: 'star'
  },
  {
    id: 'sashimi',
    name: {
      en: 'Sashimi & Sushi',
      zh: '刺身与寿司',
      ja: '刺身・寿司',
      ru: 'Сашими и суши'
    },
    icon: 'utensils'
  },
  {
    id: 'hokkaido',
    name: {
      en: 'Hokkaido Specialties',
      zh: '北海道特产',
      ja: '北海道名物',
      ru: 'Блюда Хоккайдо'
    },
    icon: 'chef-hat'
  },
  {
    id: 'wagyu',
    name: {
      en: 'Wagyu & Grills',
      zh: '和牛烧烤',
      ja: '和牛・焼き物',
      ru: 'Вагю и гриль'
    },
    icon: 'flame'
  },
  {
    id: 'nabe',
    name: {
      en: 'Hot Pots',
      zh: '火锅',
      ja: '鍋物',
      ru: 'Горячие горшки'
    },
    icon: 'soup'
  },
  {
    id: 'tempura',
    name: {
      en: 'Tempura',
      zh: '天妇罗',
      ja: '天ぷら',
      ru: 'Темпура'
    },
    icon: 'cloud'
  },
  {
    id: 'rice-noodles',
    name: {
      en: 'Rice & Noodles',
      zh: '饭面',
      ja: 'ご飯・麺類',
      ru: 'Рис и лапша'
    },
    icon: 'leaf'
  },
  {
    id: 'desserts',
    name: {
      en: 'Desserts',
      zh: '甜品',
      ja: 'デザート',
      ru: 'Десерты'
    },
    icon: 'cake'
  }
];

export const menuItems: MenuItem[] = [
  // Chef's Signature
  {
    id: 'kaiseki-omakase',
    image: '/menu/sichuan-boiled-wagyu-beef.jpg',
    category: 'signature',
    title: {
      en: 'Kaiseki Omakase',
      zh: '怀石料理套餐',
      ja: '懐石おまかせ',
      ru: 'Кайсеки Омакасе'
    },
    description: {
      en: 'A 7-course seasonal tasting menu featuring the finest Hokkaido ingredients, crafted by our head chef',
      zh: '七道菜的时令品尝菜单，精选北海道最优质的食材，由我们的主厨精心烹制',
      ja: '北海道の最高級食材を使用した、料理長による7品のおまかせコース',
      ru: 'Дегустационное меню из 7 блюд с лучшими ингредиентами Хоккайдо'
    },
    isSignature: true
  },
  {
    id: 'snow-crab-course',
    image: '/menu/spicy-numbing-seafood-hotpot.jpg',
    category: 'signature',
    title: {
      en: 'Hokkaido Snow Crab Course',
      zh: '北海道雪蟹套餐',
      ja: '北海道ズワイガニコース',
      ru: 'Курс из снежного краба Хоккайдо'
    },
    description: {
      en: 'Full course featuring premium Hokkaido snow crab: sashimi, grilled, steamed, and crab miso soup',
      zh: '北海道优质雪蟹全套：刺身、烧烤、清蒸和蟹味噌汤',
      ja: '北海道産ズワイガニのフルコース：お刺身、焼き、蒸し、蟹味噌汁',
      ru: 'Полный курс премиального снежного краба: сашими, гриль, на пару, суп мисо'
    },
    isSignature: true
  },
  {
    id: 'wagyu-a5-tasting',
    image: '/menu/soy-braised-beef.jpg',
    category: 'signature',
    title: {
      en: 'A5 Wagyu Tasting',
      zh: 'A5和牛品鉴',
      ja: 'A5和牛テイスティング',
      ru: 'Дегустация A5 Вагю'
    },
    description: {
      en: 'Premium A5 Japanese wagyu served three ways: seared, sukiyaki-style, and as elegant nigiri',
      zh: 'A5级日本和牛三种烹饪方式：香煎、寿喜烧风格和精致握寿司',
      ja: 'A5和牛を3通りで：炙り、すき焼き風、握り寿司',
      ru: 'Премиальная говядина A5 Вагю тремя способами: обжаренная, сукияки, нигири'
    },
    isSignature: true
  },
  {
    id: 'uni-trio',
    image: '/menu/pickled-cabbage-fish.jpg',
    category: 'signature',
    title: {
      en: 'Hokkaido Uni Trio',
      zh: '北海道海胆三味',
      ja: '北海道うに三種盛り',
      ru: 'Трио морских ежей Хоккайдо'
    },
    description: {
      en: 'Fresh sea urchin from three Hokkaido regions, each with its unique flavor profile',
      zh: '来自北海道三个地区的新鲜海胆，每种都有独特的风味',
      ja: '北海道3産地のうにの食べ比べ、それぞれ異なる味わい',
      ru: 'Свежие морские ежи из трех регионов Хоккайдо с уникальными вкусами'
    },
    isSignature: true
  },

  // Sashimi & Sushi
  {
    id: 'otoro-sashimi',
    image: '/menu/boiling-fish-in-spicy-broth.jpg',
    category: 'sashimi',
    title: {
      en: 'Otoro Tuna Sashimi',
      zh: '大腹金枪鱼刺身',
      ja: '大トロ刺身',
      ru: 'Сашими из Оторо тунца'
    },
    description: {
      en: 'The finest fatty tuna belly, hand-selected from Tsukiji Market, served with fresh wasabi',
      zh: '最上等的金枪鱼腹部，筑地市场精选，配新鲜山葵',
      ja: '築地から厳選した最高級大トロ、本わさび添え',
      ru: 'Лучший жирный тунец из рынка Цукидзи со свежим васаби'
    }
  },
  {
    id: 'hokkaido-sashimi-mori',
    image: '/menu/cold-chicken-in-chili-oil.jpg',
    category: 'sashimi',
    title: {
      en: 'Hokkaido Sashimi Platter',
      zh: '北海道刺身拼盘',
      ja: '北海道刺身盛り合わせ',
      ru: 'Ассорти сашими из Хоккайдо'
    },
    description: {
      en: 'Premium assortment of Hokkaido seafood: salmon, scallop, sweet shrimp, squid, and seasonal catch',
      zh: '北海道优质海鲜拼盘：三文鱼、扇贝、甜虾、鱿鱼和时令鱼',
      ja: 'サーモン、ホタテ、甘エビ、イカ、季節の魚の盛り合わせ',
      ru: 'Премиальное ассорти морепродуктов: лосось, гребешок, креветка, кальмар'
    }
  },
  {
    id: 'ikura-don',
    image: '/menu/fried-rice.jpg',
    category: 'sashimi',
    title: {
      en: 'Ikura Salmon Roe Bowl',
      zh: '三文鱼籽盖饭',
      ja: 'いくら丼',
      ru: 'Икура Дон'
    },
    description: {
      en: 'Glistening Hokkaido salmon roe over warm rice, a beloved Hokkaido delicacy',
      zh: '晶莹的北海道三文鱼籽盖在温暖的米饭上，北海道经典美食',
      ja: 'きらきら輝く北海道産いくらをご飯に、北海道の名物',
      ru: 'Сияющая икра лосося Хоккайдо на теплом рисе'
    }
  },
  {
    id: 'sushi-omakase',
    image: '/menu/garlic-spare-ribs.jpg',
    category: 'sashimi',
    title: {
      en: 'Sushi Omakase (12pc)',
      zh: '寿司套餐（12贯）',
      ja: '寿司おまかせ（12貫）',
      ru: 'Суши Омакасе (12 шт.)'
    },
    description: {
      en: 'Chef\'s selection of 12 nigiri sushi featuring the day\'s finest catch',
      zh: '主厨精选12贯握寿司，呈现当日最新鲜的食材',
      ja: '料理長が厳選した本日の12貫握り寿司',
      ru: '12 нигири суши от шефа с лучшим уловом дня'
    }
  },

  // Hokkaido Specialties
  {
    id: 'jingisukan',
    image: '/menu/braised-beef-brisket-with-potato.jpg',
    category: 'hokkaido',
    title: {
      en: 'Jingisukan Lamb BBQ',
      zh: '成吉思汗烤羊肉',
      ja: 'ジンギスカン',
      ru: 'Дзингисукан баранина'
    },
    description: {
      en: 'Hokkaido\'s iconic grilled lamb on a dome-shaped grill with fresh vegetables',
      zh: '北海道标志性的烤羊肉，圆顶烤架配新鲜蔬菜',
      ja: '北海道名物、ドーム型の鉄板で焼くラム肉と新鮮野菜',
      ru: 'Легендарная баранина Хоккайдо на куполообразном гриле с овощами'
    }
  },
  {
    id: 'yubari-melon',
    image: '/menu/handmade-ice-jelly.jpg',
    category: 'hokkaido',
    title: {
      en: 'Yubari King Melon',
      zh: '夕张王甜瓜',
      ja: '夕張メロン',
      ru: 'Юбари Кинг Дыня'
    },
    description: {
      en: 'The legendary Yubari melon from Hokkaido, renowned for its perfect sweetness',
      zh: '传奇的北海道夕张甜瓜，以其完美的甜度闻名',
      ja: '北海道が誇る夕張メロン、完璧な甘さ',
      ru: 'Легендарная дыня Юбари из Хоккайдо, известная идеальной сладостью'
    },
    isVegetarian: true
  },
  {
    id: 'hokkaido-scallops',
    image: '/menu/steamed-pork-with-rice-powder.jpg',
    category: 'hokkaido',
    title: {
      en: 'Grilled Hokkaido Scallops',
      zh: '烤北海道扇贝',
      ja: '北海道産ホタテの炙り',
      ru: 'Гребешки Хоккайдо на гриле'
    },
    description: {
      en: 'Giant Hokkaido scallops grilled with butter and soy, caramelized to perfection',
      zh: '巨大的北海道扇贝用黄油和酱油烤制，焦糖化完美',
      ja: '北海道産の大きなホタテをバター醤油で香ばしく',
      ru: 'Гигантские гребешки Хоккайдо на гриле с маслом и соей'
    }
  },
  {
    id: 'soup-curry',
    image: '/menu/free-range-chicken-soup.jpg',
    category: 'hokkaido',
    title: {
      en: 'Sapporo Soup Curry',
      zh: '札幌汤咖喱',
      ja: '札幌スープカレー',
      ru: 'Саппоро Суп Карри'
    },
    description: {
      en: 'Sapporo\'s famous soup curry with tender chicken and Hokkaido vegetables',
      zh: '札幌著名的汤咖喱配嫩鸡肉和北海道蔬菜',
      ja: '札幌名物スープカレー、柔らかチキンと北海道野菜',
      ru: 'Знаменитый суп-карри Саппоро с нежной курицей и овощами'
    },
    isSpicy: true
  },

  // Wagyu & Grills
  {
    id: 'wagyu-sirloin',
    image: '/menu/twice-cooked-pork.jpg',
    category: 'wagyu',
    title: {
      en: 'A5 Wagyu Sirloin Steak',
      zh: 'A5和牛西冷牛排',
      ja: 'A5和牛サーロインステーキ',
      ru: 'Стейк Сирлоин A5 Вагю'
    },
    description: {
      en: 'Premium A5 wagyu sirloin grilled over Japanese charcoal, served with seasonal garnish',
      zh: 'A5级和牛西冷用日本木炭烤制，配时令装饰',
      ja: 'A5和牛サーロインを備長炭で焼き上げ、季節の付け合わせと',
      ru: 'Премиальный стейк A5 Вагю на японском угле с сезонным гарниром'
    }
  },
  {
    id: 'wagyu-yakiniku',
    image: '/menu/kung-pao-chicken.jpg',
    category: 'wagyu',
    title: {
      en: 'Wagyu Yakiniku Set',
      zh: '和牛烧肉套餐',
      ja: '和牛焼肉セット',
      ru: 'Сет Вагю Якинику'
    },
    description: {
      en: 'Assorted wagyu cuts for tabletop grilling: ribeye, short rib, and tongue',
      zh: '各种和牛部位供桌上烧烤：肋眼、短肋和牛舌',
      ja: 'テーブルで焼く和牛セット：リブアイ、カルビ、タン',
      ru: 'Ассорти вагю для гриля за столом: рибай, ребра и язык'
    }
  },
  {
    id: 'robata-seafood',
    image: '/menu/spicy-chicken-pot.jpg',
    category: 'wagyu',
    title: {
      en: 'Robata Seafood Grill',
      zh: '�的场海鲜烧烤',
      ja: '海鮮炉端焼き',
      ru: 'Робата морепродукты'
    },
    description: {
      en: 'Traditional charcoal-grilled seafood: king crab, lobster, and giant prawns',
      zh: '传统炭烤海鲜：帝王蟹、龙虾和大虾',
      ja: '炭火で焼く海鮮：タラバガニ、伊勢海老、大海老',
      ru: 'Морепродукты на угле: королевский краб, лобстер, креветки'
    }
  },

  // Hot Pots
  {
    id: 'shabu-shabu',
    image: '/menu/mapo-tofu.jpg',
    category: 'nabe',
    title: {
      en: 'Wagyu Shabu Shabu',
      zh: '和牛涮涮锅',
      ja: '和牛しゃぶしゃぶ',
      ru: 'Вагю Сябу-Сябу'
    },
    description: {
      en: 'Thinly sliced wagyu beef swished in kombu dashi with seasonal vegetables',
      zh: '薄切和牛在昆布高汤中涮煮，配时令蔬菜',
      ja: '薄切り和牛を昆布出汁でしゃぶしゃぶ、旬の野菜と',
      ru: 'Тонко нарезанная вагю в бульоне комбу с сезонными овощами'
    }
  },
  {
    id: 'sukiyaki',
    image: '/menu/yu-xiang-shredded-pork.jpg',
    category: 'nabe',
    title: {
      en: 'Premium Sukiyaki',
      zh: '特选寿喜烧',
      ja: '特選すき焼き',
      ru: 'Премиум Сукияки'
    },
    description: {
      en: 'Wagyu beef simmered in sweet soy broth with tofu, vegetables, and raw egg dip',
      zh: '和牛在甜酱油汤中炖煮，配豆腐、蔬菜和生鸡蛋蘸料',
      ja: '和牛を甘辛い割り下で、豆腐、野菜、溶き卵で',
      ru: 'Вагю в сладком соевом бульоне с тофу, овощами и сырым яйцом'
    }
  },
  {
    id: 'crab-nabe',
    image: '/menu/silky-pork-soup.jpg',
    category: 'nabe',
    title: {
      en: 'Hokkaido Crab Hot Pot',
      zh: '北海道螃蟹火锅',
      ja: '北海道カニ鍋',
      ru: 'Краб Хоккайдо Набе'
    },
    description: {
      en: 'Rich hot pot with Hokkaido king crab, vegetables, and tofu in dashi broth',
      zh: '浓郁火锅配北海道帝王蟹、蔬菜和豆腐，高汤底',
      ja: '北海道産タラバガニの鍋、野菜と豆腐を出汁で',
      ru: 'Богатый хот-пот с крабом Хоккайдо, овощами и тофу'
    }
  },

  // Tempura
  {
    id: 'tempura-mori',
    image: '/menu/crispy-corn-cake.jpg',
    category: 'tempura',
    title: {
      en: 'Tempura Moriawase',
      zh: '天妇罗拼盘',
      ja: '天ぷら盛り合わせ',
      ru: 'Темпура Ассорти'
    },
    description: {
      en: 'Assorted tempura: tiger prawn, seasonal vegetables, and Hokkaido squid',
      zh: '天妇罗拼盘：虎虾、时令蔬菜和北海道鱿鱼',
      ja: '天ぷら盛り合わせ：車海老、旬の野菜、北海道産イカ',
      ru: 'Ассорти темпуры: тигровая креветка, сезонные овощи, кальмар'
    }
  },
  {
    id: 'ebi-tempura',
    image: '/menu/hot-and-sour-potato-shreds.jpg',
    category: 'tempura',
    title: {
      en: 'Tiger Prawn Tempura',
      zh: '虎虾天妇罗',
      ja: '車海老の天ぷら',
      ru: 'Темпура с тигровыми креветками'
    },
    description: {
      en: 'Five large tiger prawns in light, crispy batter with tentsuyu dipping sauce',
      zh: '五只大虎虾裹上轻脆面糊，配天汁蘸酱',
      ja: '大きな車海老5尾をサクサクの衣で、天つゆと',
      ru: 'Пять больших тигровых креветок в легком хрустящем кляре'
    }
  },
  {
    id: 'vegetable-tempura',
    image: '/menu/stir-fried-seasonal-vegetables.jpg',
    category: 'tempura',
    title: {
      en: 'Seasonal Vegetable Tempura',
      zh: '时令蔬菜天妇罗',
      ja: '季節野菜の天ぷら',
      ru: 'Овощная темпура'
    },
    description: {
      en: 'Light and crispy tempura of seasonal Hokkaido vegetables',
      zh: '北海道时令蔬菜的轻脆天妇罗',
      ja: '北海道の旬の野菜を軽くサクサクに',
      ru: 'Легкая хрустящая темпура из сезонных овощей Хоккайдо'
    },
    isVegetarian: true
  },

  // Rice & Noodles
  {
    id: 'sapporo-ramen',
    image: '/menu/mouthwatering-chicken.jpg',
    category: 'rice-noodles',
    title: {
      en: 'Sapporo Miso Ramen',
      zh: '札幌味噌拉面',
      ja: '札幌味噌ラーメン',
      ru: 'Саппоро Мисо Рамен'
    },
    description: {
      en: 'Hokkaido\'s signature rich miso ramen with chashu pork, corn, and butter',
      zh: '北海道招牌浓郁味噌拉面配叉烧、玉米和黄油',
      ja: '北海道名物の濃厚味噌ラーメン、チャーシュー、コーン、バター',
      ru: 'Фирменный мисо рамен Хоккайдо с чашу, кукурузой и маслом'
    }
  },
  {
    id: 'unagi-don',
    image: '/menu/eggplant-with-chili-pepper.jpg',
    category: 'rice-noodles',
    title: {
      en: 'Grilled Unagi Don',
      zh: '烤鳗鱼饭',
      ja: 'うな丼',
      ru: 'Унаги Дон'
    },
    description: {
      en: 'Grilled freshwater eel glazed with sweet tare sauce over fluffy rice',
      zh: '烤淡水鳗鱼淋上甜酱汁，盖在蓬松米饭上',
      ja: '香ばしく焼いた鰻を甘いタレで、ふっくらご飯の上に',
      ru: 'Жареный угорь в сладком соусе таре на пышном рисе'
    }
  },
  {
    id: 'chirashi-don',
    image: '/menu/spicy-diced-chicken.jpg',
    category: 'rice-noodles',
    title: {
      en: 'Chirashi Don',
      zh: '什锦刺身饭',
      ja: 'ちらし丼',
      ru: 'Чираши Дон'
    },
    description: {
      en: 'Assorted sashimi over sushi rice with ikura and seasonal garnish',
      zh: '各种刺身盖在寿司饭上，配三文鱼籽和时令装饰',
      ja: '色とりどりのお刺身を酢飯に、いくらと季節の薬味',
      ru: 'Ассорти сашими на рисе для суши с икрой и гарниром'
    }
  },
  {
    id: 'soba-cold',
    image: '/menu/smashed-cucumber-with-garlic.jpg',
    category: 'rice-noodles',
    title: {
      en: 'Zaru Soba',
      zh: '冷�的面',
      ja: 'ざるそば',
      ru: 'Зару Соба'
    },
    description: {
      en: 'Chilled buckwheat noodles served on a bamboo mat with dipping sauce',
      zh: '冷荞麦面放在竹席上，配蘸酱',
      ja: '竹ざるに盛った冷たいそば、つゆと薬味',
      ru: 'Охлажденная гречневая лапша на бамбуковой подставке'
    },
    isVegetarian: true
  },

  // Desserts
  {
    id: 'matcha-parfait',
    image: '/menu/tomato-scrambled-eggs.jpg',
    category: 'desserts',
    title: {
      en: 'Matcha Parfait',
      zh: '抹茶芭菲',
      ja: '抹茶パフェ',
      ru: 'Матча Парфе'
    },
    description: {
      en: 'Layers of matcha ice cream, red bean, mochi, and cream with matcha sauce',
      zh: '抹茶冰淇淋、红豆、麻糬和奶油层层叠加，淋上抹茶酱',
      ja: '抹茶アイス、あんこ、もち、クリームを重ねて、抹茶ソース',
      ru: 'Слои мороженого матча, красной фасоли, моти и крема'
    },
    isVegetarian: true
  },
  {
    id: 'hokkaido-milk-soft',
    image: '/menu/green-pepper-shredded-pork.jpg',
    category: 'desserts',
    title: {
      en: 'Hokkaido Milk Soft Serve',
      zh: '北海道牛奶冰淇淋',
      ja: '北海道ミルクソフト',
      ru: 'Мягкое мороженое Хоккайдо'
    },
    description: {
      en: 'Creamy soft serve made with rich Hokkaido milk, pure and simple perfection',
      zh: '用浓郁的北海道牛奶制作的奶油冰淇淋，纯粹简单的完美',
      ja: '濃厚な北海道牛乳で作るクリーミーなソフトクリーム',
      ru: 'Кремовое мороженое из богатого молока Хоккайдо'
    },
    isVegetarian: true
  },
  {
    id: 'mochi-ice-cream',
    image: '/menu/braised-venison.jpg',
    category: 'desserts',
    title: {
      en: 'Mochi Ice Cream Trio',
      zh: '麻糬冰淇淋三味',
      ja: 'もちアイス三種',
      ru: 'Моти-мороженое Трио'
    },
    description: {
      en: 'Three flavors of ice cream wrapped in soft mochi: matcha, strawberry, and black sesame',
      zh: '三种口味冰淇淋裹在软糯麻糬中：抹茶、草莓和黑芝麻',
      ja: '抹茶、いちご、黒ごまの三種のもちアイス',
      ru: 'Три вкуса мороженого в моти: матча, клубника, черный кунжут'
    },
    isVegetarian: true
  },
  {
    id: 'dorayaki',
    image: '/menu/pickled-pepper-chicken-giblets.jpg',
    category: 'desserts',
    title: {
      en: 'Dorayaki',
      zh: '铜锣烧',
      ja: 'どら焼き',
      ru: 'Дораяки'
    },
    description: {
      en: 'Traditional Japanese pancake sandwich filled with sweet red bean paste',
      zh: '传统日式铜锣烧，夹有甜红豆馅',
      ja: '伝統的などら焼き、ふっくらあんこ入り',
      ru: 'Традиционный японский блинчик с начинкой из красной фасоли'
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
