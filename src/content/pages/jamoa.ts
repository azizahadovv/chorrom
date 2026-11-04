import { KPI_FIELDS, L, type ListDict, type TextDict } from '../types';

export const texts: TextDict = {
  'team.seo.title': L('Asoschi va jamoa — CHORROM', 'Основатель и команда — CHORROM'),
  'team.seo.description': L(
    'CHORROM asoschisi va jamoasi bilan tanishing: derazani oʻlchaydigan, yasaydigan va oʻrnatadigan har bir kishi oʻz jamoamizda ishlaydi.',
    'Познакомьтесь с основателем и командой CHORROM: каждый, кто замеряет, изготавливает и устанавливает окна, работает в нашей команде.',
  ),

  'team.head.title': L('Uyingizga keladigan odamlar bilan tanishing', 'Познакомьтесь с людьми, которые придут к вам домой'),
  'team.head.lead': L(
    'Derazani oʻlchaydigan, yasaydigan va oʻrnatadigan har bir kishi CHORROM jamoasida ishlaydi. Begona brigadalarni yollamaymiz.',
    'Каждый, кто замеряет, изготавливает и устанавливает окна, работает в команде CHORROM. Сторонние бригады мы не нанимаем.',
  ),

  'team.owner.photo': L('Surat: asoschi sexda, ish kiyimida', 'Фото: основатель в цехе, в рабочей одежде'),
  'team.owner.label': L('Asoschi', 'Основатель'),
  'team.owner.name': L('[Ism Familiya]', '[Имя Фамилия]'),
  'team.owner.role': L('CHORROM asoschisi va rahbari', 'Основатель и руководитель CHORROM'),
  'team.owner.letter': L(
    'Assalomu alaykum. 2013-yilda Chorchinorda kichik sexdan boshlaganmiz.\n\n[Boshlanish hikoyasi: nechta usta, birinchi buyurtma, nima uchun bu ishni tanlagansiz.]\n\nBugun jamoamiz kattalashgan, lekin qoida oʻzgarmagan: har bir buyurtmani oʻzim nazorat qilaman, narxni shartnomaga yozamiz va oʻrnatgandan keyin ham telefonimizni koʻtaramiz.\n\n[Siz uchun muhim boʻlgan yana bir fikr.]',
    'Ассалому алейкум. В 2013 году мы начинали с небольшого цеха в Чорчиноре.\n\n[История начала: сколько было мастеров, первый заказ, почему вы выбрали это дело.]\n\nСегодня наша команда выросла, но правило не изменилось: каждый заказ я контролирую сам, цену мы записываем в договор и берём трубку и после установки.\n\n[Ещё одна важная для вас мысль.]',
    true,
  ),
  'team.owner.quote': L(
    '[Asoschining oʻz soʻzlari: bitta jumlada, nima uchun mijoz sizga ishonishi kerak.]',
    '[Слова самого основателя: одной фразой, почему клиент должен вам доверять.]',
  ),
  'team.owner.tlAria': L('Tarix', 'История'),
  'team.owner.cta1': L('Shourumda uchrashish', 'Встретиться в шоуруме'),
  'team.owner.cta2': L('Asoschiga savol berish', 'Задать вопрос основателю'),
  'team.owner.askTopic': L('Asoschiga savol', 'Вопрос основателю'),

  'team.rules.title': L('Jamoamizning uchta qoidasi', 'Три правила нашей команды'),

  'team.members.title': L('Jamoa', 'Команда'),
  'team.members.text': L(
    'Har bir bosqichda sizga kim javob berishini oldindan bilasiz.',
    'Вы заранее знаете, кто отвечает за каждый этап.',
  ),

  'team.hire.title': L('Jamoamizga qoʻshiling', 'Присоединяйтесь к команде'),
  'team.hire.text': L(
    'Montaj ustasi va sex ishchilariga doim ehtiyojimiz bor. Tajriba boʻlmasa, oʻrgatamiz.',
    'Нам всегда нужны монтажники и работники цеха. Нет опыта — научим.',
  ),
  'team.hire.cta': L('Ishga ariza qoldirish', 'Оставить заявку на работу'),
  'team.hire.topic': L('Ishga ariza', 'Заявка на работу'),

  'team.gu.aria': L('Taklif', 'Предложение'),
  'team.gu.title': L(
    'Bizni yaqindan bilib oling: usta bepul keladi, shourumda esa asoschining oʻzi bilan gaplashishingiz mumkin.',
    'Узнайте нас поближе: мастер приедет бесплатно, а в шоуруме можно поговорить с самим основателем.',
  ),
  'team.gu.cta1': L('Bepul oʻlchovga yozilish', 'Записаться на бесплатный замер'),
  'team.gu.cta2': L('Shourumga tashrif', 'Визит в шоурум'),
};

export const lists: ListDict = {
  'team.kpis': {
    label: 'Jamoa: sarlavha ostidagi raqamlar',
    page: 'jamoa',
    fields: KPI_FIELDS,
    items: [
      { value_uz: '2013', value_ru: '2013', text_uz: 'yildan beri birga', text_ru: 'год — с тех пор вместе' },
      { value_uz: '[N] kishi', value_ru: '[N] человек', text_uz: 'jamoada', text_ru: 'в команде' },
      { value_uz: '[N] ta', value_ru: '[N]', text_uz: 'montaj brigadasi', text_ru: 'монтажных бригад' },
      { value_uz: 'Oʻz sexi', value_ru: 'Свой цех', text_uz: 'Chorchinorda', text_ru: 'в Чорчиноре' },
    ],
  },
  'team.timeline': {
    label: 'Jamoa: asoschi blokidagi tarix (yil va voqea)',
    page: 'jamoa',
    fields: [
      { key: 'year', label: 'Yil', type: 'text', localized: true, required: true },
      { key: 'text', label: 'Voqea', type: 'textarea', localized: true, required: true },
    ],
    items: [
      { year_uz: '2013', year_ru: '2013', text_uz: 'Chorchinorda kichik sex ochildi, birinchi buyurtmalar qoʻshnilardan keldi.', text_ru: 'В Чорчиноре открылся небольшой цех, первые заказы пришли от соседей.' },
      { year_uz: '[yil]', year_ru: '[год]', text_uz: '[AKFA profili bilan rasmiy ishlash boshlandi.]', text_ru: '[Началась официальная работа с профилем AKFA.]' },
      { year_uz: '[yil]', year_ru: '[год]', text_uz: '[Yangi uskunalar, sex kengaytirildi, alyumin tizimlar qoʻshildi.]', text_ru: '[Новое оборудование, цех расширен, добавлены алюминиевые системы.]' },
      { year_uz: '[yil]', year_ru: '[год]', text_uz: '[Pergola va avtomatik darvozalar yoʻnalishi ochildi.]', text_ru: '[Открыто направление перголы и автоматических ворот.]' },
      { year_uz: 'Bugun', year_ru: 'Сегодня', text_uz: '[N] kishilik jamoa, shourum va Buxoro viloyati boʻylab oʻrnatish.', text_ru: 'Команда из [N] человек, шоурум и установка по всей Бухарской области.' },
    ],
  },
  'team.rules': {
    label: 'Jamoa: jamoamizning qoidalari',
    page: 'jamoa',
    fields: [
      { key: 'title', label: 'Qoida', type: 'text', localized: true, required: true },
      { key: 'text', label: 'Izoh', type: 'textarea', localized: true },
    ],
    items: [
      { title_uz: 'Narx bir marta aytiladi', title_ru: 'Цена называется один раз', text_uz: 'Oʻlchovda aytilgan narx shartnomaga yoziladi. Keyin “qoʻshimcha” chiqmaydi.', text_ru: 'Цена, названная на замере, записывается в договор. Потом никаких «доплат».' },
      { title_uz: 'Uyingizni oʻz uyimizdek', title_ru: 'Ваш дом — как наш', text_uz: 'Poyabzal gʻilofi kiyamiz, mebelni yopamiz, chiqindini olib ketamiz.', text_ru: 'Надеваем бахилы, укрываем мебель, вывозим мусор.' },
      { title_uz: 'Telefon har doim koʻtariladi', title_ru: 'Трубку берём всегда', text_uz: 'Oʻrnatgandan keyin ham. Rostlash va servis uchun bitta raqam.', text_ru: 'И после установки тоже. Один номер для регулировки и сервиса.' },
    ],
  },
  'team.members': {
    label: 'Jamoa: xodimlar kartalari',
    page: 'jamoa',
    fields: [
      { key: 'photo', label: 'Surat', type: 'image' },
      { key: 'photoLabel', label: 'Surat oʻrnidagi yozuv (surat yoʻq paytda)', type: 'text', localized: true },
      { key: 'name', label: 'Ism Familiya', type: 'text', localized: true, required: true },
      { key: 'role', label: 'Lavozim', type: 'text', localized: true },
      { key: 'text', label: 'Nima qiladi', type: 'textarea', localized: true },
      { key: 'exp', label: 'Tajriba (masalan: 5 yil tajriba)', type: 'text', localized: true },
    ],
    items: [
      { photoLabel_uz: 'Surat', photoLabel_ru: 'Фото', name_uz: '[Ism Familiya]', name_ru: '[Имя Фамилия]', role_uz: 'Savdo menejeri', role_ru: 'Менеджер по продажам', text_uz: 'Arizangizni qabul qiladi, oʻlchov vaqtini kelishadi va hisobni tushuntiradi.', text_ru: 'Принимает вашу заявку, согласует время замера и объясняет расчёт.', exp_uz: '[N] yil tajriba', exp_ru: '[N] лет опыта' },
      { photoLabel_uz: 'Surat', photoLabel_ru: 'Фото', name_uz: '[Ism Familiya]', name_ru: '[Имя Фамилия]', role_uz: 'Oʻlchovchi usta', role_ru: 'Мастер-замерщик', text_uz: 'Uyingizga keladi, namunalarni koʻrsatadi va narxni joyida aytadi.', text_ru: 'Приезжает к вам, показывает образцы и называет цену на месте.', exp_uz: '[N] yil tajriba', exp_ru: '[N] лет опыта' },
      { photoLabel_uz: 'Surat', photoLabel_ru: 'Фото', name_uz: '[Ism Familiya]', name_ru: '[Имя Фамилия]', role_uz: 'Sex boshligʻi', role_ru: 'Начальник цеха', text_uz: 'Har bir derazaning oʻlchami va sifatini sexdan chiqishidan oldin tekshiradi.', text_ru: 'Проверяет размеры и качество каждого окна до выхода из цеха.', exp_uz: '[N] yil tajriba', exp_ru: '[N] лет опыта' },
      { photoLabel_uz: 'Surat', photoLabel_ru: 'Фото', name_uz: '[Ism Familiya]', name_ru: '[Имя Фамилия]', role_uz: 'Montaj brigadiri', role_ru: 'Бригадир монтажа', text_uz: 'Oʻrnatishni boshqaradi, ishdan keyin joyni toza topshiradi.', text_ru: 'Руководит установкой, после работы сдаёт объект чистым.', exp_uz: '[N] yil tajriba', exp_ru: '[N] лет опыта' },
      { photoLabel_uz: 'Surat', photoLabel_ru: 'Фото', name_uz: '[Ism Familiya]', name_ru: '[Имя Фамилия]', role_uz: 'Montaj ustasi', role_ru: 'Мастер-монтажник', text_uz: 'Germetik montaj, tokcha va otliv oʻrnatish.', text_ru: 'Герметичный монтаж, установка подоконников и отливов.', exp_uz: '[N] yil tajriba', exp_ru: '[N] лет опыта' },
      { photoLabel_uz: 'Surat', photoLabel_ru: 'Фото', name_uz: '[Ism Familiya]', name_ru: '[Имя Фамилия]', role_uz: 'Servis ustasi', role_ru: 'Сервисный мастер', text_uz: 'Kafolat davrida rostlash va ta’mir uchun keladi.', text_ru: 'Приезжает на регулировку и ремонт в гарантийный период.', exp_uz: '[N] yil tajriba', exp_ru: '[N] лет опыта' },
      { photoLabel_uz: 'Surat', photoLabel_ru: 'Фото', name_uz: '[Ism Familiya]', name_ru: '[Имя Фамилия]', role_uz: 'Shourum maslahatchisi', role_ru: 'Консультант шоурума', text_uz: 'Shourumda kutib oladi, profil va ranglarni koʻrsatadi.', text_ru: 'Встречает в шоуруме, показывает профили и цвета.', exp_uz: '[N] yil tajriba', exp_ru: '[N] лет опыта' },
      { photoLabel_uz: 'Surat: butun jamoa', photoLabel_ru: 'Фото: вся команда', name_uz: 'Butun jamoa', name_ru: 'Вся команда', role_uz: '[N] kishi', role_ru: '[N] человек', text_uz: 'Sexdagi ustalar, haydovchilar va ofis xodimlari bilan birga.', text_ru: 'Вместе с мастерами цеха, водителями и сотрудниками офиса.', exp_uz: '', exp_ru: '' },
    ],
  },
};
