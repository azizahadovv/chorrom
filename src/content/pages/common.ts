import { L, type ListDict, type TextDict } from '../types';

// Butun saytda takrorlanadigan matnlar: aloqa ma'lumotlari, header, footer, ariza formalari.
export const texts: TextDict = {
  'common.contact.phone': L('+998 55 500 05 08', '+998 55 500 05 08'),
  'common.contact.address': L('Buxoro, Chorchinor, 42-uy', 'Бухара, Чорчинор, дом 42'),
  'common.contact.addressShort': L('Chorchinor, 42-uy', 'Чорчинор, дом 42'),
  'common.contact.hours': L('8:30 – 18:30', '8:30 – 18:30'),
  'common.contact.hoursLabel': L('Ish vaqti 8:30 – 18:30', 'Работаем 8:30 – 18:30'),
  'common.contact.email': L('chorrom@gmail.com', 'chorrom@gmail.com'),
  'common.contact.telegram': L('[@telegram]', '[@telegram]'),
  'common.contact.telegramUrl': L('[https://t.me/...]', '[https://t.me/...]'),
  'common.contact.instagramUrl': L('[https://instagram.com/...]', '[https://instagram.com/...]'),
  'common.contact.mapUrl': L('[Xarita havolasi]', '[Ссылка на карту]'),

  'common.header.cta': L('Bepul oʻlchov', 'Бесплатный замер'),
  'common.logo.tagline': L('WINDOWS & DOOR COMPANY', 'WINDOWS & DOOR COMPANY'),

  'common.footer.about': L(
    'Buxorodagi deraza va eshik ishlab chiqaruvchi. 2013-yildan beri AKFA profili bilan ishlaymiz.',
    'Производитель окон и дверей в Бухаре. С 2013 года работаем с профилем AKFA.',
  ),
  'common.footer.catalog': L('Katalog', 'Каталог'),
  'common.footer.company': L('Kompaniya', 'Компания'),
  'common.footer.contact': L('Aloqa', 'Контакты'),
  'common.footer.team': L('Asoschi va jamoa', 'Основатель и команда'),
  'common.footer.warranty': L('Kafolat', 'Гарантия'),
  'common.footer.jobs': L('Boʻsh ish oʻrinlari', 'Вакансии'),
  'common.footer.showroom': L('Shourum: Chorchinor, 42-uy', 'Шоурум: Чорчинор, дом 42'),
  'common.footer.copyright': L('© 2026 CHORROM', '© 2026 CHORROM'),
  'common.footer.privacy': L('Maxfiylik siyosati', 'Политика конфиденциальности'),

  'common.sticky.measure': L('Bepul oʻlchov', 'Замер'),

  'common.lead.defaultTopic': L('Bepul oʻlchov', 'Бесплатный замер'),
  'common.lead.text': L(
    'Raqamingizni qoldiring. Menejer ish vaqtida qoʻngʻiroq qilib, qulay vaqtni kelishadi.',
    'Оставьте номер. Менеджер позвонит в рабочее время и согласует удобное время.',
  ),
  'common.lead.submit': L('Ariza qoldirish', 'Оставить заявку'),

  // Sahifa oxiridagi ariza bloki (bosh sahifa)
  'common.fin.title': L('Ustani bepul chaqiring', 'Вызовите мастера бесплатно'),
  'common.fin.text': L(
    'Raqamingizni qoldiring. Menejer ish vaqtida qoʻngʻiroq qilib, usta keladigan vaqtni kelishadi.',
    'Оставьте номер. Менеджер позвонит в рабочее время и договорится о визите мастера.',
  ),
  'common.fin.pickAria': L('Nima kerak', 'Что нужно'),
  'common.fin.submit': L('Ustani chaqirish', 'Вызвать мастера'),
  'common.fin.phoneLabel': L('Telefon', 'Телефон'),
  'common.fin.telegramLabel': L('Telegram', 'Telegram'),
  'common.fin.addressLabel': L('Shourum va sex', 'Шоурум и цех'),
  'common.fin.hoursLabel': L('Ish vaqti', 'Время работы'),

  // Mavzular (arizada saqlanadi)
  'common.topic.telegram': L('Telegram orqali', 'Через Telegram'),
  'common.topic.product': L('Mahsulot boʻyicha savol', 'Вопрос по товару'),
};

export const lists: ListDict = {
  'common.finPick': {
    label: 'Ariza formasi: "Nima kerak" tanlovlari',
    page: 'common',
    fields: [{ key: 'label', label: 'Nomi', type: 'text', localized: true, required: true }],
    items: [
      { label_uz: 'Deraza', label_ru: 'Окна' },
      { label_uz: 'Eshik', label_ru: 'Двери' },
      { label_uz: 'Pergola', label_ru: 'Пергола' },
      { label_uz: 'Boshqa', label_ru: 'Другое' },
    ],
  },
};
