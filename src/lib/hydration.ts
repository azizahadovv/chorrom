// Sahifa build vaqtidagi ma'lumot bilan chizilgan. Admin o'sha paytdan keyin biror narsani o'zgartirgan bo'lsa,
// yangi ma'lumot sahifa chunk'i gidratsiya bo'lishidan oldin kelib qolsa React "HTML mos kelmadi" xatosini beradi.
// Shuning uchun yangilash so'rovlari gidratsiya tugagach yuboriladi.
let done = false;
const waiting = new Set<() => void>();

export const isHydrated = () => done;

export function markHydrated() {
  if (done) return;
  done = true;
  waiting.forEach((fn) => fn());
  waiting.clear();
}

/** fn gidratsiyadan keyin (allaqachon tugagan bo'lsa darhol) chaqiriladi. Qaytgan funksiya kutishni bekor qiladi. */
export function whenHydrated(fn: () => void) {
  if (done) {
    fn();
    return () => {};
  }
  waiting.add(fn);
  return () => {
    waiting.delete(fn);
  };
}
