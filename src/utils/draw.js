// generate 5 random numbers (1–45)
export const generateDrawNumbers = (allUserScores = []) => {
  const numbers = new Set();

  // 🔥 Step 1: pick numbers from users (to ensure matches)
  if (allUserScores.length > 0) {
    const randomUser =
      allUserScores[Math.floor(Math.random() * allUserScores.length)];

    for (let num of randomUser) {
      if (numbers.size < 3) {
        numbers.add(Number(num)); // ensure matches
      }
    }
  }

  // 🔥 Step 2: fill rest randomly
  while (numbers.size < 5) {
    numbers.add(Math.floor(Math.random() * 45) + 1);
  }

  return Array.from(numbers);
};

// ✅ CORRECT MATCH LOGIC
export const getMatchCount = (userScores, drawNumbers) => {
  let count = 0;

  for (let num of userScores) {
    if (drawNumbers.includes(Number(num))) {
      count++;
    }
  }

  return count;
};