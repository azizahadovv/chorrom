import { KPI_FIELDS, L, type ListDict, type TextDict } from '../types';

export const texts: TextDict = {
  'kalk.seo.title': L('Deraza narxi kalkulyatori — CHORROM, Buxoro', 'Калькулятор цены окон — CHORROM, Бухара'),
  'kalk.seo.description': L(
    'Deraza narxini onlayn hisoblang: turi, oʻlchami, profil seriyasi, shisha paket va rangini tanlang. Bir nechta derazani bitta hisobga qoʻshing, oʻlchov bepul.',
    'Рассчитайте цену окна онлайн: выберите тип, размеры, серию профиля, стеклопакет и цвет. Добавьте несколько окон в один расчёт, замер бесплатный.',
  ),

  'kalk.head.title': L('Narx kalkulyatori', 'Калькулятор цены'),
  'kalk.head.lead': L(
    'Derazangizni yigʻing: turini, oʻlchamini, profilini va rangini tanlang. Bir nechta derazani bitta hisobga qoʻshib, umumiy narxni va oylik toʻlovni koʻrasiz.',
    'Соберите своё окно: выберите тип, размеры, профиль и цвет. Добавьте несколько окон в один расчёт и увидите общую цену и ежемесячный платёж.',
  ),

  'kalk.preset.label': L('Katalogdan tanlangan:', 'Выбрано из каталога:'),
  'kalk.preset.note': L('Profil seriyasi avtomatik qoʻyildi.', 'Серия профиля подставлена автоматически.'),

  'kalk.cfg.title': L('1. Derazani sozlang', '1. Настройте окно'),
  'kalk.types.title': L('Deraza turi', 'Тип окна'),
  'kalk.draw.aria': L('Tanlangan deraza chizmasi', 'Чертёж выбранного окна'),
  'kalk.dims.width': L('Eni, mm', 'Ширина, мм'),
  'kalk.dims.height': L('Boʻyi, mm', 'Высота, мм'),
  'kalk.unit.mm': L('mm', 'мм'),

  'kalk.opts.material': L('Profil turi', 'Тип профиля'),
  'kalk.opts.series': L('Profil seriyasi', 'Серия профиля'),
  'kalk.opts.glass': L('Shisha paket', 'Стеклопакет'),
  'kalk.opts.furniture': L('Furnitura', 'Фурнитура'),
  'kalk.opts.lamination': L('Laminatsiya', 'Ламинация'),
  'kalk.opts.lamAria': L('Laminatsiya rangi', 'Цвет ламинации'),
  'kalk.opts.extras': L('Qoʻshimchalar', 'Дополнительно'),
  'kalk.opts.qty': L('Soni', 'Количество'),
  'kalk.qty.minus': L('Kamaytirish', 'Уменьшить'),
  'kalk.qty.plus': L('Koʻpaytirish', 'Увеличить'),
  'kalk.add': L('Hisobga qoʻshib, yana deraza qoʻshish', 'Добавить в расчёт и настроить ещё окно'),

  'kalk.total.metaOne': L('joriy: {m2} m²', 'текущее: {m2} м²'),
  'kalk.total.metaMulti': L('{n} ta pozitsiya, joriy: {m2} m²', 'позиций: {n}, текущее: {m2} м²'),
  'kalk.total.monthlyPre': L('{months} oyga boʻlib toʻlasangiz', 'В рассрочку на {months} мес. —'),
  'kalk.total.monthly': L('oyiga {sum} soʻm', '{sum} сум в месяц'),
  'kalk.total.send': L('Hisobni Telegramga yuborish', 'Отправить расчёт в Telegram'),
  'kalk.total.measure': L('Bepul oʻlchovga yozilish', 'Записаться на бесплатный замер'),
  'kalk.total.measureTopic': L('Shu hisob boʻyicha bepul oʻlchov', 'Бесплатный замер по этому расчёту'),

  'kalk.items.title': L('2. Hisobdagi derazalar', '2. Окна в расчёте'),
  'kalk.items.empty': L(
    'Hozircha bitta deraza sozlanmoqda. Yana deraza kerak boʻlsa, “Hisobga qoʻshib, yana deraza qoʻshish” tugmasini bosing.',
    'Пока настраивается одно окно. Если нужно ещё, нажмите «Добавить в расчёт и настроить ещё окно».',
  ),
  'kalk.items.name': L('{type} deraza', '{type} окно'),
  'kalk.items.desc': L('{w}×{h} mm, {series}, {lam}, {qty} dona', '{w}×{h} мм, {series}, {lam}, {qty} шт.'),
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
