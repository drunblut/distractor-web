// Simplified math logic for web version
export const generateMathProblem = (level: number) => {
  let num1: number, num2: number, operator: string, correctAnswer: number;
  
  switch (level) {
    case 1:
      // Level 1: Addition (both ≤6, ≥1) and Subtraction (minuend 2-12, result >1)
      if (Math.random() < 0.5) {
        // Addition
        operator = '+';
        num1 = Math.floor(Math.random() * 6) + 1; // 1-6
        num2 = Math.floor(Math.random() * 6) + 1; // 1-6
        correctAnswer = num1 + num2;
      } else {
        // Subtraction
        operator = '-';
        do {
          num1 = Math.floor(Math.random() * 11) + 2; // 2-12
          num2 = Math.floor(Math.random() * (num1 - 1)) + 1; // ensure result > 1
          correctAnswer = num1 - num2;
        } while (correctAnswer <= 1);
      }
      break;
      
    case 2:
      // Level 2: Addition (both >5, <11) and Subtraction (minuend >5, <15, result >1)
      if (Math.random() < 0.5) {
        // Addition
        operator = '+';
        num1 = Math.floor(Math.random() * 5) + 6; // 6-10
        num2 = Math.floor(Math.random() * 5) + 6; // 6-10
        correctAnswer = num1 + num2;
      } else {
        // Subtraction
        operator = '-';
        do {
          num1 = Math.floor(Math.random() * 9) + 6; // 6-14
          num2 = Math.floor(Math.random() * (num1 - 1)) + 1;
          correctAnswer = num1 - num2;
        } while (correctAnswer <= 1);
      }
      break;
      
    case 3:
      // Level 3: Level 2 + Multiplication and Division
      const operations = ['+', '-', '*', '/'];
      operator = operations[Math.floor(Math.random() * 4)];
      
      if (operator === '+') {
        num1 = Math.floor(Math.random() * 5) + 6; // 6-10
        num2 = Math.floor(Math.random() * 5) + 6; // 6-10
        correctAnswer = num1 + num2;
      } else if (operator === '-') {
        do {
          num1 = Math.floor(Math.random() * 9) + 6; // 6-14
          num2 = Math.floor(Math.random() * (num1 - 1)) + 1;
          correctAnswer = num1 - num2;
        } while (correctAnswer <= 1);
      } else if (operator === '*') {
        num1 = Math.floor(Math.random() * 4) + 2; // 2-5
        num2 = Math.floor(Math.random() * 4) + 2; // 2-5
        correctAnswer = num1 * num2;
      } else { // Division
        do {
          num2 = Math.floor(Math.random() * 4) + 2; // 2-5 (divisor)
          correctAnswer = Math.floor(Math.random() * 5) + 2; // 2-6 (result)
          num1 = num2 * correctAnswer; // dividend
        } while (correctAnswer <= 1);
      }
      break;
      
    case 4:
      // Level 4: Harder multiplication and division
      const level4Operations = ['+', '-', '*', '/'];
      operator = level4Operations[Math.floor(Math.random() * 4)];
      
      if (operator === '+') {
        num1 = Math.floor(Math.random() * 5) + 6; // 6-10
        num2 = Math.floor(Math.random() * 5) + 6; // 6-10
        correctAnswer = num1 + num2;
      } else if (operator === '-') {
        do {
          num1 = Math.floor(Math.random() * 9) + 6; // 6-14
          num2 = Math.floor(Math.random() * (num1 - 1)) + 1;
          correctAnswer = num1 - num2;
        } while (correctAnswer <= 1);
      } else if (operator === '*') {
        num1 = Math.floor(Math.random() * 5) + 5; // 5-9
        num2 = Math.floor(Math.random() * 5) + 5; // 5-9
        correctAnswer = num1 * num2;
      } else { // Division
        do {
          num2 = Math.floor(Math.random() * 5) + 6; // 6-10 (divisor)
          correctAnswer = Math.floor(Math.random() * 5) + 2; // 2-6 (result)
          num1 = num2 * correctAnswer; // dividend
        } while (correctAnswer <= 1);
      }
      break;
      
    default:
      // Default to Level 1
      operator = '+';
      num1 = Math.floor(Math.random() * 6) + 1;
      num2 = Math.floor(Math.random() * 6) + 1;
      correctAnswer = num1 + num2;
  }
  
  return { num1, num2, operator, correctAnswer };
};

// Original Distractor App Point System
export const getPointsForMathTask = (level: number): number => {
  const pointsTable: { [key: number]: number } = {
    1: 1,
    2: 2, 
    3: 3,
    4: 4
  };
  
  return pointsTable[level] || 0;
};

export interface MathProblem {
  num1: number;
  num2: number;
  operator: string;
  correctAnswer: number;
}

export interface MathTaskStats {
  level: number;
  streak: number;
  correctCount: number;
  totalScore: number;
  totalCorrect: number;
  totalAttempts: number;
}