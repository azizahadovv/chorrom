-- Narxlar: prototipdagi NAMUNA qiymatlar ("isSample": true). Admin → "Narxlar" bo'limida haqiqiysi kiritiladi.
INSERT INTO price_settings (id, data) VALUES (1, $json$
{
  "isSample": true,
  "minArea": 0.5,
  "quickCoef": 1.12,
  "materials": [
    {"id": "pvx", "label": {"uz": "PVX", "ru": "ПВХ"}, "defaultSeries": "termo-70", "series": [
      {"id": "standart-60", "name": "AKFA Standart 60", "price": 850000},
      {"id": "termo-70", "name": "AKFA Termo 70", "price": 1050000},
      {"id": "pvx-76", "name": "AKFA 5 kamerali 76", "price": 1250000}
    ]},
    {"id": "al", "label": {"uz": "Alyumin", "ru": "Алюминий"}, "defaultSeries": "issiq-al", "series": [
      {"id": "sovuq-al", "name": "Sovuq alyumin", "price": 1400000},
      {"id": "issiq-al", "name": "Issiq alyumin (termo)", "price": 1950000}
    ]}
  ],
  "types": [
    {"id": "1", "label": {"uz": "Bir tavaqali", "ru": "Одностворчатое"}, "coef": 1.15, "meshCount": 1},
    {"id": "2", "label": {"uz": "Ikki tavaqali", "ru": "Двустворчатое"}, "coef": 1, "meshCount": 1},
    {"id": "3", "label": {"uz": "Uch tavaqali", "ru": "Трёхстворчатое"}, "coef": 0.97, "meshCount": 2},
    {"id": "b", "label": {"uz": "Balkon bloki", "ru": "Балконный блок"}, "coef": 1.1, "meshCount": 1}
  ],
  "glass": [
    {"id": "g1", "label": {"uz": "1 kamerali", "ru": "Однокамерный"}, "coef": 1},
    {"id": "g2", "label": {"uz": "2 kamerali, energiya tejovchi", "ru": "Двухкамерный, энергосберегающий"}, "coef": 1.12, "isDefault": true},
    {"id": "g3", "label": {"uz": "Shovqindan himoyalovchi", "ru": "Шумозащитный"}, "coef": 1.25}
  ],
  "furniture": [
    {"id": "std", "label": {"uz": "Standart", "ru": "Стандартная"}, "coef": 1},
    {"id": "eu", "label": {"uz": "Yevropa, bolalar qulfi bilan", "ru": "Европейская, с детским замком"}, "coef": 1.08, "isDefault": true}
  ],
  "lamination": [
    {"id": "oq", "name": {"uz": "Oq", "ru": "Белый"}, "hex": "#F4F4F2", "surcharge": 0, "note": {"uz": "Har qanday uslubga", "ru": "Под любой стиль"}},
    {"id": "antratsit", "name": {"uz": "Antratsit RAL 7016", "ru": "Антрацит RAL 7016"}, "hex": "#3A4146", "surcharge": 0.15, "note": {"uz": "Zamonaviy fasad", "ru": "Современный фасад"}},
    {"id": "yongoq", "name": {"uz": "Yongʻoq", "ru": "Орех"}, "hex": "#6B4A33", "surcharge": 0.15, "note": {"uz": "Klassik uy", "ru": "Классический дом"}},
    {"id": "oltin-dub", "name": {"uz": "Oltin dub", "ru": "Золотой дуб"}, "hex": "#A9773F", "surcharge": 0.15, "note": {"uz": "Issiq interyer", "ru": "Тёплый интерьер"}},
    {"id": "kumush", "name": {"uz": "Kumush", "ru": "Серебро"}, "hex": "#B9BEC1", "surcharge": 0.12, "note": {"uz": "Ofis va vitraj", "ru": "Офис и витражи"}}
  ],
  "extras": [
    {"id": "sill", "label": {"uz": "Deraza tokchasi", "ru": "Подоконник"}, "price": 180000, "unit": "per_m", "isDefault": true},
    {"id": "mesh", "label": {"uz": "Chivin toʻri", "ru": "Москитная сетка"}, "price": 120000, "unit": "per_sash"},
    {"id": "drip", "label": {"uz": "Tashqi otliv", "ru": "Наружный отлив"}, "price": 90000, "unit": "per_m", "isDefault": true},
    {"id": "install", "label": {"uz": "Oʻrnatish va demontaj", "ru": "Монтаж и демонтаж"}, "price": 0.12, "unit": "pct", "isDefault": true}
  ],
  "packs": [
    {"id": "standart", "label": {"uz": "Standart: kvartira uchun", "ru": "Стандарт: для квартиры"}, "price": 850000},
    {"id": "optimal", "label": {"uz": "Optimal: xususiy uy uchun", "ru": "Оптимал: для частного дома"}, "price": 1050000, "isDefault": true},
    {"id": "premium", "label": {"uz": "Premium: issiq alyumin", "ru": "Премиум: тёплый алюминий"}, "price": 1950000}
  ],
  "installment": {
    "months": [3, 6, 12],
    "markup": {"3": 0, "6": 0, "12": 0},
    "defaultMonths": 12,
    "sumMin": 2000000, "sumMax": 60000000, "sumStep": 500000, "sumDefault": 12000000,
    "firstMin": 0, "firstMax": 50, "firstStep": 5, "firstDefault": 20
  }
}
$json$::jsonb)
ON CONFLICT (id) DO NOTHING;
