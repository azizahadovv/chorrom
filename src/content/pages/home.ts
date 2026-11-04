import { L, type ListDict, type TextDict } from '../types';

export const texts: TextDict = {
  'home.seo.title': L('CHORROM — deraza va eshiklar, Buxoro', 'CHORROM — окна и двери в Бухаре'),
  'home.seo.description': L(
    'CHORROM 2013-yildan beri Buxoroda AKFA profilidan deraza, eshik, surma tizim va pergolalar yasaydi. Narxni onlayn hisoblang, oʻlchov bepul.',
    'CHORROM с 2013 года делает в Бухаре окна, двери, раздвижные системы и перголы из профиля AKFA. Рассчитайте цену онлайн, замер бесплатный.',
  ),

  'home.hero.title': L('Buxoro uylari uchun rom va oynalar', 'Рамы и окна для домов Бухары'),
  'home.hero.lead': L(
    'Oʻz sexmizda yasaymiz, oʻzimiz oʻrnatamiz. Oʻlchov esa bepul.',
    'Делаем в своём цехе и сами устанавливаем. Замер бесплатный.',
  ),
  'home.hero.cta1': L('Bepul oʻlchovga yozilish', 'Записаться на бесплатный замер'),
  'home.hero.cta2': L('Narxni hisoblash', 'Рассчитать цену'),
  'home.hero.photo': L(
    'Shourumdagi qora ramkali LOFT surma tizim, ortida Buxoro koʻchasi',
    'Раздвижная система LOFT с чёрной рамой в шоуруме, за ней улица Бухары',
  ),
  'home.hero.caption': L('LOFT surma tizim, shourumimizda', 'Раздвижная система LOFT в нашем шоуруме'),

  'home.works.title': L('Buxoroda oʻrnatganlarimiz', 'Что мы установили в Бухаре'),
  'home.works.link': L('Barcha ishlar', 'Все работы'),

  'home.rows.title': L('Nimalar yasaymiz', 'Что мы делаем'),
  'home.rows.priceLabel': L('Narxi', 'Цена'),
  'home.rows.priceValue': L('kalkulyatorda', 'в калькуляторе'),

  'home.offer.title': L('Narxni hozir biling', 'Узнайте цену сейчас'),
  'home.offer.text': L(
    'Oʻlchamni kiriting. Aniq narx oʻlchovdan keyin shartnomaga yoziladi.',
    'Введите размеры. Точная цена после замера вписывается в договор.',
  ),
  'home.quick.width': L('Eni, mm', 'Ширина, мм'),
  'home.quick.height': L('Boʻyi, mm', 'Высота, мм'),
  'home.quick.pack': L('Toʻplam', 'Комплектация'),
  'home.quick.submit': L('Toʻliq kalkulyatorda sozlash', 'Настроить в полном калькуляторе'),
  'home.quick.aria': L('Tezkor hisob', 'Быстрый расчёт'),
  'home.quick.or': L('yoki', 'или'),
  'home.quick.monthly': L('12 oy × {sum} soʻm', '12 мес. × {sum} сум'),
  'home.quick.monthlyTail': L('muddatli toʻlov bilan', 'в рассрочку'),

  'home.showroom.title': L('Shourumga keling', 'Приходите в шоурум'),
  'home.showroom.text': L(
    'Profilni qoʻlingizda ushlab koʻrasiz, ranglarni yonma-yon solishtirasiz. Choy bizdan.',
    'Подержите профиль в руках, сравните цвета рядом. Чай за нами.',
  ),
  'home.showroom.photo': L('Shourumdagi kaskad LOFT tizimi', 'Каскадная система LOFT в шоуруме'),
  'home.showroom.address': L('Manzil', 'Адрес'),
  'home.showroom.hours': L('Ish vaqti', 'Время работы'),
  'home.showroom.phone': L('Telefon', 'Телефон'),
  'home.showroom.cta1': L('Tashrif vaqtini tanlash', 'Выбрать время визита'),
  'home.showroom.cta2': L('Jamoa bilan tanishish', 'Познакомиться с командой'),

  'home.steps.title': L('Arizadan tayyor derazagacha', 'От заявки до готового окна'),
  'home.steps.link': L('Kafolat va montaj', 'Гарантия и монтаж'),
};

/** Admin rasm yuklamaguncha ko'rsatiladigan kompaniya fotolari */
export const images: Record<string, string> = {
  'home.hero.photo': '/img/loft-surma.jpg',
  'home.showroom.photo': '/img/loft-kaskad.jpg',
};

export const lists: ListDict = {
  'home.facts': {
    label: 'Bosh sahifa: hero pastidagi 3 fakt',
    page: 'home',
    fields: [
      { key: 'title', label: 'Qalin matn', type: 'text', localized: true, required: true },
      { key: 'text', label: 'Izoh', type: 'text', localized: true },
    ],
    items: [
      { title_uz: '2013-yildan', title_ru: 'С 2013 года', text_uz: 'Buxoroda ishlaymiz', text_ru: 'работаем в Бухаре' },
      { title_uz: 'AKFA profili', title_ru: 'Профиль AKFA', text_uz: 'sertifikati bilan', text_ru: 'с сертификатом' },
      { title_uz: 'Chorchinor, 42-uy', title_ru: 'Чорчинор, дом 42', text_uz: 'sex va shourum', text_ru: 'цех и шоурум' },
    ],
  },
  'home.works': {
    label: 'Bosh sahifa: "Buxoroda oʻrnatganlarimiz" — 3 ta katta foto',
    page: 'home',
    fields: [
      { key: 'photo', label: 'Surat', type: 'image', required: true },
      { key: 'title', label: 'Nomi', type: 'text', localized: true, required: true },
      { key: 'place', label: 'Joyi', type: 'text', localized: true },
      { key: 'alt', label: 'Surat tavsifi (alt)', type: 'text', localized: true },
    ],
    items: [
      {
        photo: '/img/pergola-tentli.jpg',
        title_uz: 'Tentli pergola', title_ru: 'Пергола с тентом',
        place_uz: 'Avtosalon, Buxoro', place_ru: 'Автосалон, Бухара',
        alt_uz: 'Kechqurun yoritilgan tentli pergola, ostida CHORROM avtomobili',
        alt_ru: 'Пергола с тентом с вечерней подсветкой, под ней автомобиль CHORROM',
      },
      {
        photo: '/img/vitraj-eshik.jpg',
        title_uz: 'Vitrajli kirish guruhi', title_ru: 'Входная группа с витражом',
        place_uz: 'Xususiy uy', place_ru: 'Частный дом',
        alt_uz: 'Naqshli vitrajli kirish guruhi, ustunlar orasida',
        alt_ru: 'Входная группа с узорным витражом между колоннами',
      },
      {
        photo: '/img/dush.jpg',
        title_uz: 'Shisha dush kabinasi', title_ru: 'Стеклянная душевая кабина',
        place_uz: 'Kvartira', place_ru: 'Квартира',
        alt_uz: 'Qora ramkali shisha dush kabinasi',
        alt_ru: 'Стеклянная душевая кабина с чёрной рамой',
      },
    ],
  },
  'home.rows': {
    label: 'Bosh sahifa: "Nimalar yasaymiz" qatorlari',
    page: 'home',
    fields: [
      { key: 'title', label: 'Nomi', type: 'text', localized: true, required: true },
      { key: 'text', label: 'Izoh', type: 'text', localized: true },
      { key: 'href', label: 'Havola (masalan /katalog#surma-tizimlar)', type: 'url' },
    ],
    items: [
      { title_uz: 'Surma tizimlar', title_ru: 'Раздвижные системы', text_uz: 'LOFT, kaskad va panorama surma', text_ru: 'LOFT, каскадные и панорамные', href: '/katalog#surma-tizimlar' },
      { title_uz: 'PVX derazalar', title_ru: 'Окна ПВХ', text_uz: 'Kvartira va xususiy uy uchun, 3 va 5 kamerali', text_ru: 'Для квартиры и частного дома, 3 и 5 камер', href: '/katalog#derazalar' },
      { title_uz: 'Alyumin tizimlar', title_ru: 'Алюминиевые системы', text_uz: 'Issiq va sovuq alyumin, vitraj, fasad', text_ru: 'Тёплый и холодный алюминий, витражи, фасады', href: '/katalog#derazalar' },
      { title_uz: 'Kirish guruhlari', title_ru: 'Входные группы', text_uz: 'Vitrajli va oddiy kirish eshiklari', text_ru: 'Входные двери с витражом и без', href: '/katalog#eshiklar' },
      { title_uz: 'Pergola, darvoza, dush', title_ru: 'Перголы, ворота, душевые', text_uz: 'Tentli pergola, rolstavni, shisha kabinalar', text_ru: 'Перголы с тентом, рольставни, стеклянные кабины', href: '/katalog#pergola' },
    ],
  },
  'home.steps': {
    label: 'Bosh sahifa: 4 qadam',
    page: 'home',
    fields: [
      { key: 'title', label: 'Sarlavha', type: 'text', localized: true, required: true },
      { key: 'text', label: 'Matn', type: 'text', localized: true },
    ],
    items: [
      { title_uz: 'Ariza', title_ru: 'Заявка', text_uz: 'Saytda, Telegramda yoki telefonda.', text_ru: 'На сайте, в Telegram или по телефону.' },
      { title_uz: 'Bepul oʻlchov', title_ru: 'Бесплатный замер', text_uz: 'Usta keladi va narxni joyida aytadi.', text_ru: 'Мастер приедет и назовёт цену на месте.' },
      { title_uz: 'Sexda tayyorlash', title_ru: 'Изготовление в цехе', text_uz: 'Chorchinordagi sexda, sizning oʻlchamingizda.', text_ru: 'В цехе в Чорчиноре, по вашим размерам.' },
      { title_uz: 'Oʻrnatish', title_ru: 'Установка', text_uz: 'Toza montaj va yozma kafolat.', text_ru: 'Аккуратный монтаж и письменная гарантия.' },
    ],
  },
};
