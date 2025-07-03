// Глобальные константы для эмоций и принципов
export const EMOTION_LABELS: Record<string, Record<string, string>> = {
  en: { happy: 'Happy', sad: 'Sad', angry: 'Angry', anxious: 'Anxious', tired: 'Tired', confused: 'Confused', excited: 'Excited', neutral: 'Neutral' },
  ru: { happy: 'Счастье', sad: 'Грусть', angry: 'Злость', anxious: 'Тревога', tired: 'Усталость', confused: 'Замешательство', excited: 'Восторг', neutral: 'Нейтрально' },
  it: { happy: 'Felice', sad: 'Triste', angry: 'Arrabbiato', anxious: 'Ansioso', tired: 'Stanco', confused: 'Confuso', excited: 'Eccitato', neutral: 'Neutrale' },
  az: { happy: 'Xoşbəxt', sad: 'Kədərli', angry: 'Qəzəbli', anxious: 'Narahat', tired: 'Yorğun', confused: 'Çaşqın', excited: 'Həyəcanlı', neutral: 'Neytral' },
}

export const EMOTION_RESPONSES: Record<string, Record<string, string>> = {
  en: { happy: 'I am glad to help you!', sad: 'I am here for you.', angry: 'Let\'s try to solve this together.', anxious: 'Take a deep breath, I am with you.', tired: 'Let\'s take it easy.', confused: 'Let\'s clarify things.', excited: 'Yay! Let\'s go!', neutral: 'Ready to assist.' },
  ru: { happy: 'Рада помочь!', sad: 'Я здесь, чтобы поддержать.', angry: 'Давайте решим это вместе.', anxious: 'Сделайте вдох, я рядом.', tired: 'Давайте не спешить.', confused: 'Давайте разберёмся.', excited: 'Ура! Вперёд!', neutral: 'Готова помочь.' },
  it: { happy: 'Sono felice di aiutarti!', sad: 'Sono qui per te.', angry: 'Risolviamolo insieme.', anxious: 'Fai un respiro profondo, sono con te.', tired: 'Andiamo con calma.', confused: 'Facciamo chiarezza.', excited: 'Evviva! Andiamo!', neutral: 'Pronto ad aiutare.' },
  az: { happy: 'Kömək etməyə şadam!', sad: 'Səninləyəm.', angry: 'Gəlin bunu birlikdə həll edək.', anxious: 'Dərin nəfəs alın, mən buradayam.', tired: 'Tələsməyək.', confused: 'Aydınlaşdıraq.', excited: 'Yaşasın! Başlayaq!', neutral: 'Köməyə hazıram.' },
}

export const PRINCIPLES_LABELS: Record<string, Record<string, string>> = {
  en: { evolve: 'Evolve', create_ai: 'Create AI', optimize: 'Optimize' },
  ru: { evolve: 'Эволюция', create_ai: 'Создать ИИ', optimize: 'Оптимизация' },
  it: { evolve: 'Evolvere', create_ai: 'Crea IA', optimize: 'Ottimizza' },
  az: { evolve: 'Təkamül', create_ai: 'AI yarat', optimize: 'Optimallaşdır' },
} 