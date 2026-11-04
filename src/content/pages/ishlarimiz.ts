import { L, type ListDict, type TextDict } from '../types';

/** Ish turi: filtr tugmalari va har bir ish shu qiymat bo'yicha bog'lanadi ('all' — hammasi). */
export const WORK_KINDS = [
  { value: 'deraza', label: 'Derazalar' },
  { value: 'eshik', label: 'Eshiklar' },
  { value: 'surma', label: 'Surma' },
  { value: 'out', label: 'Pergola va darvoza' },
];

export const texts: TextDict = {
  'works.seo.title': L('Ishlarimiz — CHORROM', 'Наши работы — CHORROM'),
  'works.seo.description': L(
    'Buxoroda CHORROM oʻrnatgan derazalar, eshiklar, surma tizimlar, pergola va darvozalar. Haqiqiy obyektlar va mijozlar sharhlari.',
    'Окна, двери, раздвижные системы, перголы и ворота, установленные CHORROM в Бухаре. Реальные объекты и отзывы клиентов.',
  ),

  'works.head.title': L('Buxoroda qilgan ishlarimiz', 'Наши работы в Бухаре'),
  'works.head.lead': L(
    'Rasmlar oʻzimizning obyektlardan. Mijoz rozi boʻlsa, manzilini aytamiz va borib koʻrishingiz mumkin.',
    'Фотографии — с наших собственных объектов. Если клиент согласен, назовём адрес, и вы сможете съездить посмотреть.',
  ),
  'works.head.instagram': L('Instagramda yana koʻproq', 'Больше в Instagram'),

  'works.case.photo': L(
    'Kechqurun yoritilgan tentli pergola, CHORROM avtomobili bilan',
    'Пергола с тентом с вечерней подсветкой и автомобилем CHORROM',
  ),
  'works.case.label': L('Tanlangan loyiha', 'Избранный проект'),
  'works.case.title': L('Avtosalon uchun tentli pergola', 'Тентовая пергола для автосалона'),
  'works.case.chip1': L('Buxoro', 'Бухара'),
  'works.case.chip2': L('[maydon] m²', '[площадь] м²'),
  'works.case.chip3': L('[muddat] kun', '[срок] дней'),
  'works.case.taskLabel': L('Vazifa', 'Задача'),
  'works.case.task': L(
    '[Mijoz nima soʻradi: masalan, avtomobillarni quyosh va yomgʻirdan himoya qilish, kirish qismini koʻrkam qilish.]',
    '[Что просил клиент: например, защитить автомобили от солнца и дождя, сделать вход привлекательным.]',
  ),
  'works.case.solutionLabel': L('Yechim', 'Решение'),
  'works.case.solution': L(
    '[Nima oʻrnatildi: elektr yuritmali tentli pergola, oʻlchami, rangi, avtomatika.]',
    '[Что установили: тентовая пергола с электроприводом, размер, цвет, автоматика.]',
  ),
  'works.case.resultLabel': L('Natija', 'Результат'),
  'works.case.result': L(
    '[Mijozning oʻz soʻzlari yoki aniq natija, ruxsat bilan.]',
    '[Слова самого клиента или конкретный результат, с разрешения.]',
  ),
  'works.case.cta': L('Menga ham shunday kerak', 'Хочу так же'),
  'works.case.topic': L('Shunday loyiha haqida', 'О таком же проекте'),

  'works.all.title': L('Barcha ishlar', 'Все работы'),
  'works.all.filterAria': L('Turi boʻyicha', 'По типу'),

  'works.reviews.title': L('Mijozlarimiz oʻz soʻzlari bilan', 'Наши клиенты своими словами'),
  'works.reviews.text': L(
    'Faqat ruxsat bergan haqiqiy mijozlar. Har bir sharhda nima oʻrnatilgani yozilgan.',
    'Только реальные клиенты, давшие разрешение. В каждом отзыве указано, что было установлено.',
  ),
  'works.rating.value': L('[reyting]', '[рейтинг]'),
  'works.rating.source': L('Google xaritalar', 'Google Карты'),
  'works.rating.count': L('[N] ta sharh', '[N] отзывов'),

  'works.gu.aria': L('Taklif', 'Предложение'),
  'works.gu.title': L(
    'Uyingiz ham shu roʻyxatda boʻlsin. Usta bepul kelib, oʻlchab, narxni joyida aytadi.',
    'Пусть и ваш дом будет в этом списке. Мастер бесплатно приедет, сделает замер и назовёт цену на месте.',
  ),
  'works.gu.cta1': L('Bepul oʻlchovga yozilish', 'Записаться на бесплатный замер'),
  'works.gu.cta2': L('Narxni hisoblash', 'Рассчитать цену'),
};

export const lists: ListDict = {
  'works.filters': {
    label: 'Ishlarimiz: filtr tugmalari',
    page: 'ishlarimiz',
    fields: [
      { key: 'value', label: 'Qaysi ishlarni koʻrsatadi', type: 'select', options: [{ value: 'all', label: 'Hammasi' }, ...WORK_KINDS], required: true },
      { key: 'label', label: 'Tugma matni', type: 'text', localized: true, required: true },
    ],
    items: [
      { value: 'all', label_uz: 'Hammasi', label_ru: 'Все' },
      { value: 'eshik', label_uz: 'Eshiklar', label_ru: 'Двери' },
      { value: 'surma', label_uz: 'Surma', label_ru: 'Раздвижные' },
      { value: 'out', label_uz: 'Pergola va darvoza', label_ru: 'Перголы и ворота' },
    ],
  },
  'works.items': {
    label: 'Ishlarimiz: bajarilgan ishlar',
    page: 'ishlarimiz',
    fields: [
      { key: 'kind', label: 'Turi', type: 'select', options: WORK_KINDS, required: true },
      { key: 'photo', label: 'Surat', type: 'image' },
      { key: 'photoLabel', label: 'Surat oʻrnidagi yozuv (surat yoʻq paytda)', type: 'text', localized: true },
      { key: 'title', label: 'Loyiha nomi', type: 'text', localized: true, required: true },
      { key: 'place', label: 'Joy / manzil', type: 'text', localized: true },
      { key: 'chips', label: 'Belgilar (vergul bilan: Issiq alyumin, Antratsit)', type: 'text', localized: true },
    ],
    items: [
      { kind: 'surma', photo: '/img/loft-surma.jpg', photoLabel_uz: 'LOFT surma tizim surati', photoLabel_ru: 'Фото: раздвижная система LOFT', title_uz: 'LOFT surma tizim', title_ru: 'Раздвижная система LOFT', place_uz: 'Shourum, Buxoro', place_ru: 'Шоурум, Бухара', chips_uz: 'Qora ramka, Tonirovka', chips_ru: 'Чёрная рама, Тонировка' },
      { kind: 'eshik', photo: '/img/vitraj-eshik.jpg', photoLabel_uz: 'Vitrajli kirish guruhi surati', photoLabel_ru: 'Фото: входная группа с витражом', title_uz: 'Vitrajli kirish guruhi', title_ru: 'Входная группа с витражом', place_uz: 'Xususiy uy, [mahalla]', place_ru: 'Частный дом, [махалля]', chips_uz: 'Alyumin, Vitraj', chips_ru: 'Алюминий, Витраж' },
      { kind: 'surma', photo: '/img/loft-kaskad.jpg', photoLabel_uz: 'Kaskad LOFT tizimi surati', photoLabel_ru: 'Фото: каскадная система LOFT', title_uz: 'Kaskad LOFT tizimi', title_ru: 'Каскадная система LOFT', place_uz: 'Shourum, Buxoro', place_ru: 'Шоурум, Бухара', chips_uz: 'Kaskad', chips_ru: 'Каскад' },
      { kind: 'out', photo: '/img/dush.jpg', photoLabel_uz: 'Shisha dush kabinasi surati', photoLabel_ru: 'Фото: стеклянная душевая кабина', title_uz: 'Shisha dush kabinasi', title_ru: 'Стеклянная душевая кабина', place_uz: 'Kvartira, [manzil]', place_ru: 'Квартира, [адрес]', chips_uz: 'Toblangan shisha', chips_ru: 'Закалённое стекло' },
    ],
  },
  'works.videos': {
    label: 'Ishlarimiz: mijoz video-sharhlari',
    page: 'ishlarimiz',
    fields: [
      { key: 'title', label: 'Sarlavha', type: 'text', localized: true, required: true },
      { key: 'note', label: 'Izoh', type: 'text', localized: true },
      { key: 'url', label: 'Video havolasi (YouTube, Instagram...)', type: 'url', required: true },
    ],
    items: [
      { title_uz: '[Mijoz video-sharhi]', title_ru: '[Видеоотзыв клиента]', note_uz: '30–60 soniya, ruxsat bilan', note_ru: '30–60 секунд, с разрешения', url: '' },
    ],
  },
  'works.reviews': {
    label: 'Ishlarimiz: mijozlar sharhlari',
    page: 'ishlarimiz',
    fields: [
      { key: 'quote', label: 'Sharh matni', type: 'textarea', localized: true, required: true },
      { key: 'name', label: 'Mijoz ismi', type: 'text', localized: true, required: true },
      { key: 'place', label: 'Mahalla va nima oʻrnatilgan', type: 'text', localized: true },
    ],
    items: [
      {
        quote_uz: '[Mijozning oʻz soʻzlari. Aniq natija boʻlsin: qishda uy qancha issiq boʻlgani yoki shovqin yoʻqolgani.]',
        quote_ru: '[Слова самого клиента. Конкретный результат: насколько теплее стало зимой или что пропал шум.]',
        name_uz: '[Ism]',
        name_ru: '[Имя]',
        place_uz: '[Mahalla], [nima oʻrnatilgan]',
        place_ru: '[Махалля], [что установлено]',
      },
      {
        quote_uz: '[Ikkinchi sharh. Ikkilangan narsasini ham aytsin: narxdan choʻchigan, lekin kafolat ishontirgan.]',
        quote_ru: '[Второй отзыв. Пусть расскажет и о сомнениях: смутила цена, но убедила гарантия.]',
        name_uz: '[Ism]',
        name_ru: '[Имя]',
        place_uz: '[Mahalla], [nima oʻrnatilgan]',
        place_ru: '[Махалля], [что установлено]',
      },
    ],
  },
};

/** Admin rasm yuklamaguncha ko'rsatiladigan kompaniya fotolari */
export const images: Record<string, string> = {
  'works.case.photo': '/img/pergola-tentli.jpg',
};
