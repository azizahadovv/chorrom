import { KPI_FIELDS, L, type ListDict, type TextDict } from '../types';

export const ICON_OPTIONS = [
  { value: 'ruler', label: 'Oʻlchov (chizgʻich)' },
  { value: 'card', label: 'Toʻlov kartasi' },
  { value: 'shield', label: 'Kafolat (qalqon)' },
  { value: 'factory', label: 'Sex (zavod)' },
  { value: 'profile', label: 'Profil kesimi' },
  { value: 'sound', label: 'Shovqin' },
  { value: 'colors', label: 'Ranglar' },
];

export const texts: TextDict = {
  'show.seo.title': L('Shourum — CHORROM, Buxoro', 'Шоурум — CHORROM, Бухара'),
  'show.seo.description': L(
    'CHORROM shourumi Buxoroda: profil kesimlari, shovqin sinovi, ranglar va laminatsiya namunalari, sex yonida. Tashrif vaqtini onlayn tanlang.',
    'Шоурум CHORROM в Бухаре: разрезы профилей, тест на шумоизоляцию, образцы цветов и ламинации, рядом с цехом. Выберите время визита онлайн.',
  ),

  'show.head.title': L('Shourumga keling, choy bizdan', 'Приходите в шоурум, чай за нами'),
  'show.head.lead': L(
    'Derazani rasmda tanlash qiyin. Shourumda profilni qoʻlingizda ushlaysiz, ranglarni yonma-yon koʻrasiz va yaxshi oyna shovqinni qanday toʻsishini oʻzingiz eshitasiz.',
    'Выбирать окно по картинке сложно. В шоуруме вы подержите профиль в руках, увидите цвета рядом друг с другом и сами услышите, как хорошее окно гасит шум.',
  ),
  'show.head.cta': L('Tashrif vaqtini tanlash', 'Выбрать время визита'),
  'show.kpi.city': L('Buxoro', 'Бухара'),
  'show.kpi.hours': L('ish vaqti', 'часы работы'),

  'show.see.title': L('Shourumda nimalarni koʻrasiz', 'Что вы увидите в шоуруме'),

  'show.photo': L('Shourumdagi kaskad LOFT tizimi', 'Каскадная система LOFT в шоуруме'),
  'show.founder.photo': L('Shourum ichidan koʻrinish', 'Вид шоурума изнутри'),
  'show.founder.title': L('Assalomu alaykum!', 'Ассалому алейкум!'),
  'show.founder.letter': L(
    'Men [Ism], CHORROM asoschisiman. 2013-yilda Chorchinorda kichik sexdan boshlaganmiz. Har bir buyurtmani hozir ham oʻzim nazorat qilaman, chunki bu derazalar qoʻshnilarimiz va tanishlarimiz uyida turadi.\n\nShourumga kelganingizda sotib olishga majbur emassiz. Savollaringizga javob beramiz, namunalarni koʻrsatamiz, qaror sizda.',
    'Меня зовут [Имя], я основатель CHORROM. В 2013 году мы начинали с небольшого цеха в Чорчиноре. Каждый заказ я до сих пор контролирую сам, потому что эти окна стоят в домах наших соседей и знакомых.\n\nПридя в шоурум, вы не обязаны ничего покупать. Ответим на вопросы, покажем образцы, решение за вами.',
    true,
  ),
  'show.founder.name': L('[Ism Familiya]', '[Имя Фамилия]'),
  'show.founder.role': L('CHORROM asoschisi', 'Основатель CHORROM'),

  'show.map.aria': L('Shourum joylashuvi sxemasi', 'Схема расположения шоурума'),
  'show.map.mainStreet': L('[Asosiy koʻcha nomi]', '[Название главной улицы]'),
  'show.map.street': L('[Koʻcha]', '[Улица]'),
  'show.map.name': L('CHORROM shourumi', 'Шоурум CHORROM'),

  'show.book.title': L('Tashrif vaqtini tanlang', 'Выберите время визита'),
  'show.book.text': L(
    'Kelishingizdan oldin menejer qoʻngʻiroq qilib tasdiqlaydi. Sizni namunalar va choy kutadi.',
    'Перед визитом менеджер позвонит и подтвердит время. Вас ждут образцы и чай.',
  ),
  'show.book.day': L('Kun', 'День'),
  'show.book.time': L('Vaqt', 'Время'),
  'show.book.submit': L('Tashrifni band qilish', 'Забронировать визит'),
  'show.book.mapLink': L('Yoʻnalishni xaritada ochish', 'Открыть маршрут на карте'),
};

export const lists: ListDict = {
  'show.kpis': {
    label: 'Shourum: sarlavha ostidagi qoʻshimcha raqamlar (manzil va ish vaqti “Umumiy: aloqa”dan olinadi)',
    page: 'shourum',
    fields: KPI_FIELDS,
    items: [{ value_uz: 'Sex yonida', value_ru: 'Рядом с цехом', text_uz: 'ishlab chiqarishni ham koʻrasiz', text_ru: 'увидите и производство' }],
  },
  'show.see': {
    label: 'Shourum: “Shourumda nimalarni koʻrasiz” kartalari',
    page: 'shourum',
    fields: [
      { key: 'icon', label: 'Belgi', type: 'select', options: ICON_OPTIONS },
      { key: 'title', label: 'Sarlavha', type: 'text', localized: true, required: true },
      { key: 'text', label: 'Matn', type: 'textarea', localized: true },
    ],
    items: [
      {
        icon: 'profile',
        title_uz: 'Profil kesimlari',
        title_ru: 'Разрезы профилей',
        text_uz: '3, 5 kamerali PVX va issiq alyuminni yonma-yon solishtirasiz.',
        text_ru: 'Сравните 3- и 5-камерный ПВХ и тёплый алюминий бок о бок.',
      },
      {
        icon: 'sound',
        title_uz: 'Shovqin sinovi',
        title_ru: 'Тест на шум',
        text_uz: 'Oddiy va shovqindan himoyalovchi shisha farqini quloq bilan eshitasiz.',
        text_ru: 'Услышите разницу между обычным и шумозащитным стеклом своими ушами.',
      },
      {
        icon: 'colors',
        title_uz: 'Ranglar va laminatsiya',
        title_ru: 'Цвета и ламинация',
        text_uz: 'Antratsit, yongʻoq, oltin dub va boshqa ranglar haqiqiy namunada.',
        text_ru: 'Антрацит, орех, золотой дуб и другие цвета на настоящих образцах.',
      },
      {
        icon: 'factory',
        title_uz: 'Ishlab chiqarish',
        title_ru: 'Производство',
        text_uz: 'Xohlasangiz, sexga kirib derazangiz qanday yasalishini koʻrasiz.',
        text_ru: 'При желании зайдёте в цех и увидите, как делают ваше окно.',
      },
    ],
  },
  'show.days': {
    label: 'Shourum: tashrif kunlari (tugmalar)',
    page: 'shourum',
    fields: [{ key: 'label', label: 'Kun', type: 'text', localized: true, required: true }],
    items: [
      { label_uz: 'Bugun', label_ru: 'Сегодня' },
      { label_uz: 'Ertaga', label_ru: 'Завтра' },
      { label_uz: 'Shanba', label_ru: 'Суббота' },
      { label_uz: 'Boshqa kun', label_ru: 'Другой день' },
    ],
  },
  'show.times': {
    label: 'Shourum: tashrif vaqtlari (tugmalar)',
    page: 'shourum',
    fields: [{ key: 'label', label: 'Vaqt', type: 'text', localized: true, required: true }],
    items: [
      { label_uz: '10:00', label_ru: '10:00' },
      { label_uz: '12:00', label_ru: '12:00' },
      { label_uz: '15:00', label_ru: '15:00' },
      { label_uz: '17:00', label_ru: '17:00' },
    ],
  },
};

/** Admin rasm yuklamaguncha ko'rsatiladigan kompaniya fotolari */
export const images: Record<string, string> = {
  'show.photo': '/img/loft-kaskad.jpg',
  'show.founder.photo': '/img/loft-surma.jpg',
};
