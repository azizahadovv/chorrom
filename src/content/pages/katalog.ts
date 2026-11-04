import { L, type ListDict, type TextDict } from '../types';

export const texts: TextDict = {
  'katalog.seo.title': L('Katalog — CHORROM', 'Каталог — CHORROM'),
  'katalog.seo.description': L(
    'PVX va alyumin derazalar, surma tizimlar, eshiklar va pergolalar. 1 m² narxi oʻrnatish bilan, oylik toʻlov va texnik xususiyatlar.',
    'Окна ПВХ и алюминиевые, раздвижные системы, двери и перголы. Цена за 1 м² с установкой, ежемесячный платёж и характеристики.',
  ),
  'katalog.head.title': L('Katalog', 'Каталог'),
  'katalog.head.lead': L(
    'Deraza, eshik, surma tizim va pergolalar. Barcha narxlar 1 m² uchun, oʻrnatish bilan. Profil, shisha va rangni kalkulyatorda oʻzgartirasiz.',
    'Окна, двери, раздвижные системы и перголы. Все цены за 1 м² с установкой. Профиль, стекло и цвет меняете в калькуляторе.',
  ),
  'katalog.head.cta': L('Oʻz oʻlchamimni hisoblash', 'Рассчитать мой размер'),

  'katalog.filters.aria': L('Filtrlar', 'Фильтры'),
  'katalog.filters.system': L('Tizim', 'Система'),
  'katalog.filters.place': L('Qayerga', 'Куда'),
  'katalog.filters.price': L('Narx, ming soʻm / m²', 'Цена, тыс. сум / м²'),
  'katalog.filters.min': L('dan', 'от'),
  'katalog.filters.max': L('gacha', 'до'),
  'katalog.filters.reset': L('Filtrlarni tozalash', 'Сбросить фильтры'),
  'katalog.sort.label': L('Saralash', 'Сортировка'),
  'katalog.sort.pop': L('Koʻp tanlanadigan', 'Популярные'),
  'katalog.sort.asc': L('Avval arzonlari', 'Сначала дешевле'),
  'katalog.sort.desc': L('Avval qimmatlari', 'Сначала дороже'),
  'katalog.count': L('{n} ta mahsulot', 'Товаров: {n}'),
  'katalog.empty': L(
    'Bu filtrlarga mos mahsulot topilmadi. Filtrlarni kamaytiring yoki menejerdan soʻrang.',
    'По этим фильтрам ничего не найдено. Уберите часть фильтров или спросите менеджера.',
  ),
  'katalog.productsAria': L('Mahsulotlar', 'Товары'),

  'katalog.card.photo': L('{name} surati', 'Фото: {name}'),
  'katalog.card.perM2': L('1 m² uchun', 'за 1 м²'),
  'katalog.card.from': L('soʻmdan', 'сум, от'),
  'katalog.card.monthly': L('12 oy × {sum} soʻm', '12 мес. × {sum} сум'),
  'katalog.card.more': L('Xususiyatlari', 'Характеристики'),
  'katalog.card.calc': L('Narxini hisoblash', 'Рассчитать цену'),
  'katalog.card.ask': L('Narxini soʻrash', 'Узнать цену'),

  'katalog.spec.photo': L('Surat: mahsulot kesimi', 'Фото: разрез профиля'),
  'katalog.spec.system': L('Tizim', 'Система'),
  'katalog.spec.chambers': L('Kamera soni', 'Количество камер'),
  'katalog.spec.thickness': L('Qalinlik / turi', 'Толщина / тип'),
  'katalog.spec.suitable': L('Kimga mos', 'Кому подходит'),
  'katalog.spec.uw': L('Issiqlik oʻtkazuvchanligi (Uw)', 'Теплопроводность (Uw)'),
  'katalog.spec.db': L('Shovqin izolyatsiyasi', 'Шумоизоляция'),
  'katalog.spec.warranty': L('Kafolat', 'Гарантия'),
  'katalog.spec.warrantyValue': L('{n} yil, yozma', '{n} лет, письменная'),
  'katalog.spec.price': L('Narx, 1 m²', 'Цена, 1 м²'),
  'katalog.spec.priceValue': L('{sum} soʻmdan', 'от {sum} сум'),
  'katalog.spec.ask': L('Menejerdan soʻrash', 'Спросить менеджера'),

  'katalog.guide.title': L('Qaysi profilni tanlash kerak?', 'Какой профиль выбрать?'),
  'katalog.guide.text': L(
    'Qisqa yoʻriqnoma. Ikkilansangiz, usta oʻlchovda uyingizga qarab maslahat beradi.',
    'Короткая подсказка. Если сомневаетесь, мастер на замере посоветует по вашему дому.',
  ),
  'katalog.colors.title': L('Laminatsiya va ranglar', 'Ламинация и цвета'),
  'katalog.colors.text': L(
    'Rom fasad va interyerga mos boʻlsin. Rangli laminatsiya profil narxiga qoʻshimcha ustama qoʻshadi.',
    'Пусть рама подходит к фасаду и интерьеру. Цветная ламинация добавляет наценку к цене профиля.',
  ),
  'katalog.colors.link': L('Rangni kalkulyatorda tanlash', 'Выбрать цвет в калькуляторе'),
};

export const lists: ListDict = {
  'katalog.places': {
    label: 'Katalog: "Qayerga" filtri (mahsulotdagi "Qayerga" qiymati shu yerdagi kod bilan bogʻlanadi)',
    page: 'katalog',
    fields: [
      { key: 'value', label: 'Kod (lotin, boʻshliqsiz)', type: 'text', required: true },
      { key: 'label', label: 'Nomi', type: 'text', localized: true, required: true },
    ],
    items: [
      { value: 'kvartira', label_uz: 'Kvartira', label_ru: 'Квартира' },
      { value: 'uy', label_uz: 'Xususiy uy', label_ru: 'Частный дом' },
      { value: 'balkon', label_uz: 'Balkon', label_ru: 'Балкон' },
      { value: 'biznes', label_uz: 'Doʻkon va ofis', label_ru: 'Магазин и офис' },
    ],
  },
  'katalog.guide': {
    label: 'Katalog: profil tanlash yoʻriqnomasi',
    page: 'katalog',
    fields: [
      { key: 'title', label: 'Sarlavha', type: 'text', localized: true, required: true },
      { key: 'text', label: 'Matn', type: 'textarea', localized: true },
      { key: 'tag', label: 'Tavsiya', type: 'text', localized: true },
    ],
    items: [
      { title_uz: 'Kvartira uchun', title_ru: 'Для квартиры', text_uz: '3 kamerali PVX va 1–2 kamerali shisha paket yetarli. Narx va issiqlik oʻrtasida eng yaxshi muvozanat.', text_ru: 'Достаточно 3-камерного ПВХ и 1–2-камерного стеклопакета. Лучший баланс цены и тепла.', tag_uz: 'Standart 60 yoki Termo 70', tag_ru: 'Standart 60 или Termo 70' },
      { title_uz: 'Xususiy uy uchun', title_ru: 'Для частного дома', text_uz: 'Devorlar sovuqroq, shamol kuchliroq. 5 kamerali profil va energiya tejovchi shisha gaz sarfini kamaytiradi.', text_ru: 'Стены холоднее, ветер сильнее. 5-камерный профиль и энергосберегающее стекло снижают расход газа.', tag_uz: 'Termo 70 yoki 76 mm', tag_ru: 'Termo 70 или 76 мм' },
      { title_uz: 'Katta oyna va villa uchun', title_ru: 'Для больших окон и виллы', text_uz: 'Keng oynalarga issiq alyumin mustahkamroq: ingichka rom, koʻproq yorugʻlik, panorama koʻrinish.', text_ru: 'Для широких проёмов тёплый алюминий надёжнее: тонкая рама, больше света, панорамный вид.', tag_uz: 'Issiq alyumin, issiq surma', tag_ru: 'Тёплый алюминий, тёплые раздвижные' },
    ],
  },
};
