import type { Language } from './types';
const labels: Record<string, [string, string]> = {
  fire: ['Вогонь', 'Fire'],
  water: ['Вода', 'Water'],
  air: ['Повітря', 'Air'],
  earth: ['Земля', 'Earth'],
  light: ['Світло', 'Light'],
  dark: ['Темрява', 'Dark'],
  heat: ['Жар', 'Heat'],
  power: ['Сила', 'Power'],
  protection: ['Захист', 'Protection'],
  transformation: ['Перетворення', 'Transformation'],
  poison: ['Отрута', 'Poison'],
  purification: ['Очищення', 'Purification'],
  concealment: ['Приховування', 'Concealment'],
  freezing: ['Замороження', 'Freezing'],
  mobility: ['Рухливість', 'Mobility'],
  lightning: ['Блискавка', 'Lightning'],
  growth: ['Ріст', 'Growth'],
  preservation: ['Збереження', 'Preservation'],
  healing: ['Зцілення', 'Healing'],
  divination: ['Віщування', 'Divination'],
  necromancy: ['Некромантія', 'Necromancy'],
};
export const label = (id: string, language: Language) =>
  labels[id]?.[language === 'ua' ? 0 : 1] ?? id;
