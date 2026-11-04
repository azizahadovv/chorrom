import { KPI_FIELDS, L, type ListDict, type TextDict } from '../types';

export const texts: TextDict = {
  'why.seo.title': L('Nega CHORROM — kafolat va sifat', 'Почему CHORROM — гарантия и качество'),
  'why.seo.description': L(
    'Arzon usta bilan CHORROM farqi, asl AKFA profilini tekshirish, yozma kafolat nimani qamraydi va montaj qanday qilinadi.',
    'Чем CHORROM отличается от дешёвого мастера, как проверить оригинальный профиль AKFA, что покрывает письменная гарантия и как проходит монтаж.',
  ),

  'why.head.title': L(
    'Deraza uzoq yillar turadi. Ustani bir marta toʻgʻri tanlang',
    'Окно служит долгие годы. Выберите мастера правильно с первого раза',
  ),
  'why.head.lead': L(
    'Arzon deraza bilan sifatlisi orasidagi farq birinchi qishdayoq seziladi. Bu sahifada nima uchun CHORROM’ni tanlashadi, kafolat nimani qamraydi va montaj qanday qilinadi, shular haqida.',
    'Разница между дешёвым и качественным окном чувствуется уже в первую зиму. На этой странице — почему выбирают CHORROM, что покрывает гарантия и как проходит монтаж.',
  ),

  'why.compare.title': L('Arzon usta va CHORROM', 'Дешёвый мастер и CHORROM'),
  'why.compare.text': L(
    'Farq ikki-uch yildan keyin koʻrinadi. Tanlashdan oldin solishtiring.',
    'Разница видна через два-три года. Сравните, прежде чем выбирать.',
  ),
  'why.compare.us': L('CHORROM', 'CHORROM'),
  'why.compare.them': L('Bozordagi arzon usta', 'Дешёвый мастер с рынка'),

  'why.akfa.photo': L('Surat: profil kesimi va markirovka yaqindan', 'Фото: разрез профиля и маркировка крупным планом'),
  'why.akfa.title': L('Profil asl AKFA ekanini oʻzingiz tekshiring', 'Проверьте сами, что профиль — оригинальный AKFA'),
  'why.akfa.text': L(
    'Bozorda nusxa profillar koʻp. Ular tashqi koʻrinishdan farq qilmaydi, lekin 3–4 yilda sargʻayadi va qiyshayadi.',
    'На рынке много копий профиля. Внешне они не отличаются, но через 3–4 года желтеют и деформируются.',
  ),

  'why.warranty.title': L('Kafolat nimani qamraydi', 'Что покрывает гарантия'),
  'why.warranty.text': L(
    'Har bir buyurtmaga yozma kafolat beriladi. Muddat tanlangan toʻplamga bogʻliq.',
    'На каждый заказ выдаётся письменная гарантия. Срок зависит от выбранной комплектации.',
  ),
  'why.warranty.colWhat': L('Nima kiradi', 'Что входит'),
  'why.warranty.col1': L('Standart', 'Стандарт'),
  'why.warranty.col2': L('Optimal', 'Оптимал'),
  'why.warranty.col3': L('Premium', 'Премиум'),

  'why.montaj.title': L('Montaj qanday qilinadi', 'Как проходит монтаж'),
  'why.montaj.text': L(
    'Eng yaxshi deraza ham notoʻgʻri oʻrnatilsa, sovuq oʻtkazadi. Shuning uchun montajni oʻz ustalarimiz qiladi.',
    'Даже лучшее окно пропускает холод, если установлено неправильно. Поэтому монтаж делают наши собственные мастера.',
  ),
  'why.montaj.link': L('Ustalarimiz bilan tanishing', 'Познакомьтесь с нашими мастерами'),

  'why.docs.title': L('Hujjatlar va sertifikatlar', 'Документы и сертификаты'),
  'why.docs.text': L('Asl nusxalarini shourumda koʻrishingiz mumkin.', 'Оригиналы можно посмотреть в шоуруме.'),

  'why.gu.aria': L('Kafolat', 'Гарантия'),
  'why.gu.title': L(
    'Narx shartnomaga yoziladi va oʻzgarmaydi. Oʻrnatgandan keyin biror narsa toʻgʻri ishlamasa, usta qaytib keladi, bepul.',
    'Цена записывается в договор и не меняется. Если после установки что-то работает не так, мастер вернётся — бесплатно.',
  ),
  'why.gu.cta1': L('Bepul oʻlchovga yozilish', 'Записаться на бесплатный замер'),
  'why.gu.cta2': L('Bajarilgan ishlarni koʻrish', 'Посмотреть выполненные работы'),
};

export const lists: ListDict = {
  'why.kpis': {
    label: 'Nega biz: sarlavha ostidagi raqamlar',
    page: 'nega-biz',
    fields: KPI_FIELDS,
    items: [
      { value_uz: '2013', value_ru: '2013', text_uz: 'yildan beri Buxoroda', text_ru: 'год — с тех пор в Бухаре' },
      { value_uz: 'Oʻz sexi', value_ru: 'Свой цех', text_uz: 'Chorchinorda', text_ru: 'в Чорчиноре' },
      { value_uz: '[N] yil', value_ru: '[N] лет', text_uz: 'gacha yozma kafolat', text_ru: 'письменной гарантии' },
      { value_uz: '[N]+', value_ru: '[N]+', text_uz: 'oʻrnatilgan obyekt', text_ru: 'установленных объектов' },
    ],
  },
  'why.compare': {
    label: 'Nega biz: "Arzon usta va CHORROM" taqqoslash qatorlari',
    page: 'nega-biz',
    fields: [
      { key: 'k', label: 'Mezon', type: 'text', localized: true, required: true },
      { key: 'us', label: 'CHORROM', type: 'text', localized: true, required: true },
      { key: 'them', label: 'Arzon usta', type: 'text', localized: true },
    ],
    items: [
      { k_uz: 'Profil', k_ru: 'Профиль', us_uz: 'AKFA asl profili, sertifikatini koʻrsatamiz', us_ru: 'Оригинальный профиль AKFA, покажем сертификат', them_uz: 'Koʻpincha kelib chiqishi noma’lum', them_ru: 'Часто неизвестного происхождения' },
      { k_uz: 'Oʻlchov', k_ru: 'Замер', us_uz: 'Bepul, usta oʻzi keladi', us_ru: 'Бесплатно, мастер приезжает сам', them_uz: 'Koʻpincha oʻzingiz oʻlchaysiz', them_ru: 'Часто замеряете сами' },
      { k_uz: 'Narx', k_ru: 'Цена', us_uz: 'Shartnomada qotiriladi', us_ru: 'Фиксируется в договоре', them_uz: 'Ish davomida “qoʻshimcha” chiqadi', them_ru: 'В процессе появляются «доплаты»' },
      { k_uz: 'Kafolat', k_ru: 'Гарантия', us_uz: 'Yozma, shartnomada', us_ru: 'Письменная, в договоре', them_uz: 'Ogʻzaki va’da', them_ru: 'Устное обещание' },
      { k_uz: 'Oʻrnatish', k_ru: 'Установка', us_uz: 'Germetik montaj, chiqindini olib ketamiz', us_ru: 'Герметичный монтаж, мусор вывозим', them_uz: 'Chiqindi sizga qoladi', them_ru: 'Мусор остаётся вам' },
      { k_uz: 'Keyingi servis', k_ru: 'Сервис после', us_uz: 'Rostlash va ta’mir bir qoʻngʻiroqda', us_ru: 'Регулировка и ремонт — одним звонком', them_uz: 'Telefon koʻtarilmaydi', them_ru: 'Телефон не берут' },
    ],
  },
  'why.akfa.steps': {
    label: 'Nega biz: asl AKFA profilini tekshirish qadamlari',
    page: 'nega-biz',
    fields: [{ key: 'text', label: 'Matn', type: 'textarea', localized: true, required: true }],
    items: [
      { text_uz: 'Romning ichki tomonida ishlab chiqaruvchi markirovkasi va partiya raqami boʻladi.', text_ru: 'С внутренней стороны рамы есть маркировка производителя и номер партии.' },
      { text_uz: 'Shartnomani imzolashdan oldin profil sertifikatini koʻrsatamiz.', text_ru: 'До подписания договора покажем сертификат на профиль.' },
      { text_uz: 'Shourumda profil kesimini qoʻlingizda ushlab, kameralarni sanab koʻrasiz.', text_ru: 'В шоуруме подержите разрез профиля в руках и сами посчитаете камеры.' },
    ],
  },
  'why.warranty': {
    label: 'Nega biz: kafolat jadvali qatorlari (ustun sarlavhalari — matnlarda)',
    page: 'nega-biz',
    fields: [
      { key: 'what', label: 'Nima kiradi', type: 'text', localized: true, required: true },
      { key: 'c1', label: '1-ustun (Standart)', type: 'text', localized: true, required: true },
      { key: 'c2', label: '2-ustun (Optimal)', type: 'text', localized: true, required: true },
      { key: 'c3', label: '3-ustun (Premium)', type: 'text', localized: true, required: true },
    ],
    items: [
      { what_uz: 'Profil (rang, shakl)', what_ru: 'Профиль (цвет, форма)', c1_uz: '[N] yil', c1_ru: '[N] лет', c2_uz: '[N] yil', c2_ru: '[N] лет', c3_uz: '[N] yil', c3_ru: '[N] лет' },
      { what_uz: 'Shisha paket germetikligi', what_ru: 'Герметичность стеклопакета', c1_uz: '[N] yil', c1_ru: '[N] лет', c2_uz: '[N] yil', c2_ru: '[N] лет', c3_uz: '[N] yil', c3_ru: '[N] лет' },
      { what_uz: 'Furnitura', what_ru: 'Фурнитура', c1_uz: '[N] yil', c1_ru: '[N] лет', c2_uz: '[N] yil', c2_ru: '[N] лет', c3_uz: '[N] yil', c3_ru: '[N] лет' },
      { what_uz: 'Montaj ishi', what_ru: 'Монтажные работы', c1_uz: '[N] yil', c1_ru: '[N] лет', c2_uz: '[N] yil', c2_ru: '[N] лет', c3_uz: '[N] yil', c3_ru: '[N] лет' },
      { what_uz: 'Bepul rostlash', what_ru: 'Бесплатная регулировка', c1_uz: '1 marta', c1_ru: '1 раз', c2_uz: '[N] marta', c2_ru: '[N] раз', c3_uz: '[N] marta', c3_ru: '[N] раз' },
    ],
  },
  'why.montaj': {
    label: 'Nega biz: montaj bosqichlari',
    page: 'nega-biz',
    fields: [
      { key: 'title', label: 'Sarlavha', type: 'text', localized: true, required: true },
      { key: 'text', label: 'Matn', type: 'textarea', localized: true },
    ],
    items: [
      { title_uz: 'Eski romni ehtiyotkor olib tashlash', title_ru: 'Аккуратный демонтаж старой рамы', text_uz: 'Devor va otkoslarni kam shikastlab, chiqindini darrov qoplarga yigʻamiz.', text_ru: 'Минимально повреждаем стены и откосы, мусор сразу собираем в мешки.' },
      { title_uz: 'Tekislash va mahkamlash', title_ru: 'Выравнивание и крепление', text_uz: 'Rom lazer sath bilan toʻgʻrilanadi va ankerlarga mahkamlanadi.', text_ru: 'Раму выставляют лазерным уровнем и крепят на анкеры.' },
      { title_uz: 'Uch qatlamli germetiklash', title_ru: 'Трёхслойная герметизация', text_uz: 'Ichki bugʻ izolyatsiya lentasi, montaj koʻpigi va tashqi himoya lentasi.', text_ru: 'Внутренняя пароизоляционная лента, монтажная пена и наружная защитная лента.' },
      { title_uz: 'Tokcha va otliv', title_ru: 'Подоконник и отлив', text_uz: 'Tokcha va otliv suv toʻplanmaydigan qiyalikda oʻrnatiladi.', text_ru: 'Подоконник и отлив ставятся с уклоном, чтобы не скапливалась вода.' },
      { title_uz: 'Furniturani sozlash', title_ru: 'Настройка фурнитуры', text_uz: 'Har bir tavaqa yopilishi va qishki-yozgi rejimi tekshiriladi.', text_ru: 'Проверяется закрывание каждой створки и зимний-летний режим.' },
      { title_uz: 'Tozalash va topshirish', title_ru: 'Уборка и сдача', text_uz: 'Joyni tozalab, kafolat hujjati va parvarish boʻyicha maslahat beramiz.', text_ru: 'Убираем за собой, выдаём гарантийный документ и советы по уходу.' },
    ],
  },
  'why.docs': {
    label: 'Nega biz: hujjatlar va sertifikatlar',
    page: 'nega-biz',
    fields: [
      { key: 'title', label: 'Hujjat nomi', type: 'text', localized: true, required: true },
      { key: 'image', label: 'Hujjat surati (skan)', type: 'image' },
    ],
    items: [
      { title_uz: '[AKFA profil sertifikati]', title_ru: '[Сертификат на профиль AKFA]' },
      { title_uz: '[Diler yoki hamkorlik shartnomasi]', title_ru: '[Дилерский или партнёрский договор]' },
      { title_uz: '[Shisha paket sertifikati]', title_ru: '[Сертификат на стеклопакет]' },
      { title_uz: '[Namunaviy kafolat varaqasi]', title_ru: '[Образец гарантийного талона]' },
    ],
  },
};
