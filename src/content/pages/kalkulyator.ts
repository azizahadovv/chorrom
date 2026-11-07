import { KPI_FIELDS, L, type ListDict, type TextDict } from '../types';

export const texts: TextDict = {
  'kalk.seo.title': L('Narx kalkulyatori: deraza, eshik, surma, pergola — CHORROM, Buxoro', 'Калькулятор цены: окна, двери, раздвижные системы, перголы — CHORROM, Бухара'),
  'kalk.seo.description': L(
    'Deraza, eshik, surma tizim, pergola, darvoza, dush kabinasi va setka narxini onlayn hisoblang. Bir nechta mahsulotni bitta hisobga qoʻshing, oʻlchov bepul.',
    'Рассчитайте онлайн цену окна, двери, раздвижной системы, перголы, ворот, душевой кабины и сетки. Добавьте несколько изделий в один расчёт, замер бесплатный.',
  ),

  'kalk.head.title': L('Narx kalkulyatori', 'Калькулятор цены'),
  'kalk.head.lead': L(
    'Mahsulotni tanlang va sozlang: turini, oʻlchamini, modelini va rangini. Bir nechta mahsulotni bitta hisobga qoʻshib, umumiy narxni va oylik toʻlovni koʻrasiz.',
    'Выберите и настройте изделие: тип, размеры, модель и цвет. Добавьте несколько изделий в один расчёт и увидите общую цену и ежемесячный платёж.',
  ),

  'kalk.preset.label': L('Katalogdan tanlangan:', 'Выбрано из каталога:'),
  'kalk.preset.note': L('Mahsulot turi va modeli avtomatik qoʻyildi.', 'Тип изделия и модель подставлены автоматически.'),

  'kalk.cfg.title': L('1. Mahsulotni tanlang va sozlang', '1. Выберите и настройте изделие'),
  'kalk.draw.aria': L('Tanlangan mahsulot chizmasi', 'Чертёж выбранного изделия'),
  'kalk.unit.mm': L('mm', 'мм'),
  'kalk.unit.m2': L('m²', 'м²'),
  'kalk.unit.m': L('m', 'м'),

  'kalk.opts.lamination': L('Laminatsiya', 'Ламинация'),
  'kalk.opts.lamAria': L('Laminatsiya rangi', 'Цвет ламинации'),
  'kalk.opts.extras': L('Qoʻshimchalar', 'Дополнительно'),
  'kalk.opts.qty': L('Soni', 'Количество'),
  'kalk.qty.minus': L('Kamaytirish', 'Уменьшить'),
  'kalk.qty.plus': L('Koʻpaytirish', 'Увеличить'),
  'kalk.add': L('Hisobga qoʻshib, yana qoʻshish', 'Добавить в расчёт и настроить ещё'),

  'kalk.total.metaOne': L('joriy: {m}', 'текущее: {m}'),
  'kalk.total.metaMulti': L('{n} ta pozitsiya, joriy: {m}', 'позиций: {n}, текущее: {m}'),
  'kalk.total.partial': L('Narxi kiritilmagan pozitsiya jami summaga kirmagan, uni menejer aytadi.', 'Позиция без цены не вошла в итог, её назовёт менеджер.'),
  'kalk.total.monthlyPre': L('{months} oyga boʻlib toʻlasangiz', 'В рассрочку на {months} мес. —'),
  'kalk.total.monthly': L('oyiga {sum} soʻm', '{sum} сум в месяц'),
  'kalk.total.send': L('Hisobni Telegramga yuborish', 'Отправить расчёт в Telegram'),
  'kalk.total.measure': L('Bepul oʻlchovga yozilish', 'Записаться на бесплатный замер'),
  'kalk.total.measureTopic': L('Shu hisob boʻyicha bepul oʻlchov', 'Бесплатный замер по этому расчёту'),

  'kalk.items.title': L('2. Hisobdagi mahsulotlar', '2. Изделия в расчёте'),
  'kalk.items.empty': L(
    'Hozircha bitta mahsulot sozlanmoqda. Yana kerak boʻlsa, “Hisobga qoʻshib, yana qoʻshish” tugmasini bosing.',
    'Пока настраивается одно изделие. Если нужно ещё, нажмите «Добавить в расчёт и настроить ещё».',
  ),
  'kalk.items.qty': L('{qty} dona', '{qty} шт.'),
  'kalk.items.remove': L('Oʻchirish', 'Удалить'),

  'kalk.factors.title': L('Narxga nimalar ta’sir qiladi', 'Что влияет на цену'),
  'kalk.factors.text': L(
    'Kalkulyator taxminiy narx beradi. Aniq summa oʻlchovdan keyin shartnomaga yoziladi va oʻzgarmaydi.',
    'Калькулятор показывает примерную цену. Точная сумма после замера фиксируется в договоре и больше не меняется.',
  ),
};

export const lists: ListDict = {
  'kalk.kpis': {
    label: 'Kalkulyator: sarlavha ostidagi 3 koʻrsatkich',
    page: 'kalkulyator',
    fields: KPI_FIELDS,
    items: [
      { value_uz: '2 daqiqa', value_ru: '2 минуты', text_uz: 'toʻliq hisob uchun', text_ru: 'на полный расчёт' },
      { value_uz: 'Bepul', value_ru: 'Бесплатно', text_uz: 'aniq oʻlchov uyingizda', text_ru: 'точный замер у вас дома' },
      { value_uz: 'Shartnomada', value_ru: 'В договоре', text_uz: 'narx qotiriladi', text_ru: 'цена фиксируется' },
    ],
  },
  'kalk.factors': {
    label: 'Kalkulyator: "Narxga nimalar ta’sir qiladi" kartalari',
    page: 'kalkulyator',
    fields: [
      { key: 'title', label: 'Sarlavha', type: 'text', localized: true, required: true },
      { key: 'text', label: 'Matn', type: 'textarea', localized: true },
    ],
    items: [
      {
        title_uz: 'Profil',
        title_ru: 'Профиль',
        text_uz: 'Kameralar soni va qalinlik issiqlikni ushlab turishni belgilaydi.',
        text_ru: 'Количество камер и толщина определяют, насколько окно держит тепло.',
      },
      {
        title_uz: 'Shisha paket',
        title_ru: 'Стеклопакет',
        text_uz: 'Energiya tejovchi va shovqindan himoyalovchi shisha qimmatroq, lekin qishda oʻzini oqlaydi.',
        text_ru: 'Энергосберегающее и шумозащитное стекло дороже, но зимой окупает себя.',
      },
      {
        title_uz: 'Ochilish turi',
        title_ru: 'Тип открывания',
        text_uz: 'Har bir ochiladigan tavaqa furnitura qoʻshadi. Ochilmaydigan qism arzonroq.',
        text_ru: 'Каждая открывающаяся створка добавляет фурнитуру. Глухая часть дешевле.',
      },
      {
        title_uz: 'Montaj sharoiti',
        title_ru: 'Условия монтажа',
        text_uz: 'Qavat, eski romni olib tashlash va devor holatini usta joyida baholaydi.',
        text_ru: 'Этаж, демонтаж старой рамы и состояние стен мастер оценивает на месте.',
      },
    ],
  },
};
