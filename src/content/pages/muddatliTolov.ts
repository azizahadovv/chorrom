import { KPI_FIELDS, L, type ListDict, type TextDict } from '../types';

export const texts: TextDict = {
  'inst.seo.title': L('Muddatli toʻlov — CHORROM', 'Рассрочка — CHORROM'),
  'inst.seo.description': L(
    'Derazani hozir oʻrnating, toʻlovni 3, 6 yoki 12 oyga boʻling. Oylik toʻlovni onlayn hisoblang va muddatli toʻlovga ariza qoldiring.',
    'Установите окна сейчас, а оплату разделите на 3, 6 или 12 месяцев. Рассчитайте ежемесячный платёж онлайн и оставьте заявку на рассрочку.',
  ),

  'inst.head.title': L('Hozir oʻrnating, keyin boʻlib toʻlang', 'Установите сейчас, платите частями потом'),
  'inst.head.lead': L(
    'Qishni kutib oʻtirmang. Derazani bugun oʻrnatamiz, toʻlovni 3, 6 yoki 12 oyga boʻlasiz. Shartlarni menejer oldindan aniq aytadi, yashirin toʻlov yoʻq.',
    'Не ждите зимы. Установим окна сегодня, а оплату вы разделите на 3, 6 или 12 месяцев. Менеджер заранее точно назовёт условия, скрытых платежей нет.',
  ),

  'inst.calc.title': L('Oylik toʻlovni hisoblang', 'Рассчитайте ежемесячный платёж'),
  'inst.calc.sum': L('Buyurtma summasi', 'Сумма заказа'),
  'inst.calc.first': L('Boshlangʻich toʻlov', 'Первоначальный взнос'),
  'inst.calc.firstValue': L('{pct}% — {sum}', '{pct}% — {sum}'),
  'inst.calc.term': L('Muddat', 'Срок'),
  'inst.calc.monthOption': L('{n} oy', '{n} мес.'),
  'inst.calc.note': L(
    'Hisob taxminiy. Ustama foizi va aniq shartlar [Hamkor bank] tomonidan belgilanadi.',
    'Расчёт примерный. Процент наценки и точные условия устанавливает [Банк-партнёр].',
  ),
  'inst.calc.perMonth': L('Oyiga', 'В месяц'),
  'inst.calc.during': L('{n} oy davomida', 'в течение {n} мес.'),
  'inst.calc.apply': L('Muddatli toʻlovga ariza', 'Заявка на рассрочку'),
  'inst.calc.toCalc': L('Avval derazani hisoblash', 'Сначала рассчитать окно'),

  'inst.plan.caption': L('Toʻlov jadvali (namuna)', 'График платежей (пример)'),
  'inst.plan.month': L('Oy', 'Месяц'),
  'inst.plan.payment': L('Toʻlov', 'Платёж'),
  'inst.plan.rest': L('Qolgan qarz', 'Остаток долга'),
  'inst.plan.row': L('{n}-oy', '{n}-й мес.'),

  'inst.steps.title': L('Qanday rasmiylashtiriladi', 'Как оформляется'),
  'inst.steps.text': L(
    'Hammasi bitta tashrifda, shourumda yoki oʻlchov paytida uyingizda.',
    'Всё за один визит: в шоуруме или у вас дома во время замера.',
  ),

  'inst.faq.title': L('Muddatli toʻlov boʻyicha savollar', 'Вопросы о рассрочке'),
};

export const lists: ListDict = {
  'inst.kpis': {
    label: 'Muddatli toʻlov: sarlavha ostidagi raqamlar',
    page: 'muddatli-tolov',
    fields: KPI_FIELDS,
    items: [
      { value_uz: '3–12 oy', value_ru: '3–12 мес.', text_uz: 'muddat', text_ru: 'срок' },
      { value_uz: '[N]%', value_ru: 'от [N]%', text_uz: 'dan boshlangʻich toʻlov', text_ru: 'первоначальный взнос' },
      { value_uz: '[Hamkor bank]', value_ru: '[Банк-партнёр]', text_uz: 'orqali rasmiylashtiriladi', text_ru: 'оформление через банк' },
    ],
  },
  'inst.steps': {
    label: 'Muddatli toʻlov: rasmiylashtirish bosqichlari',
    page: 'muddatli-tolov',
    fields: [
      { key: 'title', label: 'Sarlavha', type: 'text', localized: true, required: true },
      { key: 'text', label: 'Matn', type: 'textarea', localized: true },
    ],
    items: [
      {
        title_uz: 'Oʻlchov va aniq narx',
        title_ru: 'Замер и точная цена',
        text_uz: 'Usta bepul oʻlchaydi, summa shartnomaga yoziladi.',
        text_ru: 'Мастер бесплатно делает замер, сумма фиксируется в договоре.',
      },
      {
        title_uz: 'Hujjatlar',
        title_ru: 'Документы',
        text_uz: '[Pasport yoki ID-karta], [boshqa hujjatlar: bank talabi boʻyicha].',
        text_ru: '[Паспорт или ID-карта], [другие документы: по требованию банка].',
      },
      {
        title_uz: 'Tasdiq va oʻrnatish',
        title_ru: 'Одобрение и установка',
        text_uz: 'Bank tasdiqlagach, buyurtma sexga ketadi va [N] ish kunida oʻrnatiladi.',
        text_ru: 'После одобрения банка заказ уходит в цех и устанавливается за [N] рабочих дней.',
      },
    ],
  },
  'inst.faq': {
    label: 'Muddatli toʻlov: savol-javoblar',
    page: 'muddatli-tolov',
    fields: [
      { key: 'q', label: 'Savol', type: 'text', localized: true, required: true },
      { key: 'a', label: 'Javob', type: 'textarea', localized: true, required: true },
    ],
    items: [
      {
        q_uz: 'Ustama bormi?',
        q_ru: 'Есть ли наценка?',
        a_uz: '[Bank shartlari boʻyicha yozing: ustamasiz yoki necha foiz.] Hisobdagi oylik toʻlov shartnomaga yoziladi.',
        a_ru: '[Укажите по условиям банка: без наценки или сколько процентов.] Ежемесячный платёж из расчёта фиксируется в договоре.',
      },
      {
        q_uz: 'Muddatidan oldin toʻlasam boʻladimi?',
        q_ru: 'Можно ли погасить досрочно?',
        a_uz: '[Shartni yozing.]',
        a_ru: '[Укажите условие.]',
      },
      {
        q_uz: 'Boshlangʻich toʻlovsiz olsa boʻladimi?',
        q_ru: 'Можно ли без первоначального взноса?',
        a_uz: '[Shartni yozing.]',
        a_ru: '[Укажите условие.]',
      },
      {
        q_uz: 'Qaysi mahsulotlarga amal qiladi?',
        q_ru: 'На какие товары распространяется?',
        a_uz: 'Katalogdagi barcha deraza, eshik, surma tizim va pergolalarga.',
        a_ru: 'На все окна, двери, раздвижные системы и перголы из каталога.',
      },
    ],
  },
};
