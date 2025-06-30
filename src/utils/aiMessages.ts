const encouragementMessages = [
  "It's wonderful how you noticed that sparkle! You have a gift for seeing the positive.",
  "That's such a thoughtful observation! Your ability to appreciate these moments is beautiful.",
  "What a lovely sparkle you've discovered! Your positive perspective is inspiring.",
  "You have such a beautiful way of seeing the world around you!",
  "Noticing these sparkles is how relationships grow stronger. Wonderful job!",
  "Your thoughtfulness shines through in what you've shared!",
  "That's the kind of appreciation that makes relationships thrive!",
  "Your partner is lucky to have someone who notices such beautiful details!",
  "What a meaningful observation! Your heart is truly open.",
  "You're building a treasury of beautiful moments together!",
  "That spark of appreciation you just shared is what makes relationships special.",
  "Your ability to see beauty in the everyday is a gift.",
  "That's such a heartwarming observation!",
  "Noticing these special moments is how love grows deeper.",
  "Your kindness and awareness shine through in what you've shared!"
];

export const getRandomAIMessage = (): string => {
  const randomIndex = Math.floor(Math.random() * encouragementMessages.length);
  return encouragementMessages[randomIndex];
};