// خلفيات القصة النصّية — الترتيب نفسه في iOS (StoryTextBackground) ولوحة التحكم (UserStoriesTab.js)
export const STORY_BACKGROUNDS: [string, string][] = [
  ["#833AB4", "#E1306C"], ["#F58529", "#DD2A7B"], ["#0F2027", "#2C5364"], ["#11998E", "#38EF7D"],
  ["#FC466B", "#3F5EFB"], ["#000000", "#434343"], ["#F7971E", "#FFD200"], ["#8E2DE2", "#4A00E0"],
];

export function storyBackground(i?: number): string {
  const [a, b] = STORY_BACKGROUNDS[i && i >= 0 && i < STORY_BACKGROUNDS.length ? i : 0];
  return `linear-gradient(135deg, ${a}, ${b})`;
}
