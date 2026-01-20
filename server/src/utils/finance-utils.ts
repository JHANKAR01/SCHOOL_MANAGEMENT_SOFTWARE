
/**
 * Sovereign Finance Utilities
 */

// 1. Levenshtein Distance for Fuzzy Matching Bank Descriptions
export const fuzzyMatch = (a: string, b: string): number => {
  const matrix = [];
  for (let i = 0; i <= b.length; i++) matrix[i] = [i];
  for (let j = 0; j <= a.length; j++) matrix[0][j] = j;
  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b.charAt(i - 1) == a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          Math.min(matrix[i][j - 1] + 1, matrix[i - 1][j] + 1)
        );
      }
    }
  }
  return matrix[b.length][a.length];
};

// 2. Sibling Discount Calculator
export const calculateSiblingDiscount = async (studentId: string, baseFee: number, db: any) => {
  // Logic: Find other students with same primary_contact phone
  const student = await db.student.findUnique({ where: { id: studentId } });
  if (!student) return { amount: 0, applied: false };

  const siblings = await db.student.findMany({
    where: {
      parent_phone: student.parent_phone,
      id: { not: studentId },
      is_active: true
    }
  });

  if (siblings.length > 0) {
    // If student is the younger one (logic: created_at or DOB), apply 10%
    // Simplified: Always apply if sibling exists for this MVP
    return {
      amount: baseFee * 0.10,
      applied: true,
      siblingId: siblings[0].id
    };
  }

  return { amount: 0, applied: false };
};
