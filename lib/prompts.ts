const KID_QUESTIONS = [
  // Week 1
  `what’s the silliest thing you said today?`,
  `what made you laugh the hardest this week?`,
  `what’s your favorite thing to do with Mommy or Daddy?`,
  `if you could have any superpower, what would it be?`,
  `what’s the best part of being ${0} years old?`, // age filled later
  `who’s your best friend and why?`,
  `what do you want to be when you grow up?`,

  // Week 2
  `what’s your favorite food and why do you love it?`,
  `if you could go anywhere in the world, where would you go?`,
  `what’s the funniest dream you ever had?`,
  `what do you like most about bedtime?`,
  `who makes you feel the safest?`,
  `what’s your favorite color and why?`,
  `what’s the best gift you ever got?`,

  // Week 3
  `what do you like most about our house?`,
  `what’s your favorite thing to do outside?`,
  `if animals could talk, which one would be your best friend?`,
  `what’s the yummiest thing you ate this week?`,
  `what do you love most about your family?`,
  `what’s your favorite story or book?`,
  `what makes you feel proud?`
];

export function getTodayPrompt(kidName: string, kidAge: number) {
  const today = new Date();
  const dayIndex = Math.floor((today.getTime() - new Date(today.getFullYear(), 0, 1).getTime()) / 86400000) % 21;
  const question = KID_QUESTIONS[dayIndex].replace('${0}', String(kidAge));
  return `${kidName}, ${question} Reply!`;
}

export const SEND_DAYS = [1, 4, 0]; // Mon, Thu, Sun
