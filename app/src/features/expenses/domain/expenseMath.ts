/**
 * Safe arithmetic evaluator without eval().
 * Supports +, -, *, / with proper operator precedence.
 */
export function evaluateMathExpression(expr: string): number {
  if (!expr) return 0;
  const cleaned = expr.replace(/[^\d+\-*/.]/g, '');
  if (!cleaned) return 0;
  // If ends with operator, evaluate prefix
  const sanitized = cleaned.replace(/[+\-*/.]+$/, '');
  if (!sanitized) return 0;

  try {
    const tokens: (number | string)[] = [];
    let currentNumber = '';
    for (let i = 0; i < sanitized.length; i++) {
      const char = sanitized[i];
      if ('+-*/'.includes(char)) {
        if (currentNumber) {
          tokens.push(parseFloat(currentNumber));
          currentNumber = '';
        }
        tokens.push(char);
      } else {
        currentNumber += char;
      }
    }
    if (currentNumber) {
      tokens.push(parseFloat(currentNumber));
    }

    if (tokens.length === 0) return 0;

    // First pass: Multiplication & Division
    const intermediate: (number | string)[] = [];
    let i = 0;
    while (i < tokens.length) {
      const token = tokens[i];
      if (token === '*' || token === '/') {
        const prev = intermediate.pop();
        const next = tokens[i + 1];
        if (typeof prev === 'number' && typeof next === 'number') {
          const res = token === '*' ? prev * next : (next !== 0 ? prev / next : 0);
          intermediate.push(res);
          i += 2;
          continue;
        }
      }
      intermediate.push(token);
      i++;
    }

    // Second pass: Addition & Subtraction
    let result = typeof intermediate[0] === 'number' ? intermediate[0] : 0;
    let j = 1;
    while (j < intermediate.length) {
      const op = intermediate[j];
      const next = intermediate[j + 1];
      if (typeof next === 'number') {
        if (op === '+') result += next;
        else if (op === '-') result -= next;
      }
      j += 2;
    }

    return Math.max(0, Math.round(result));
  } catch {
    return 0;
  }
}

/**
 * Format math expression for readable UI (e.g. 150000 + 50000 -> 150.000 + 50.000)
 */
export function formatExpression(expr: string): string {
  if (!expr) return '0';
  return expr
    .replace(/(\d+)/g, (match) => {
      const num = Number(match);
      return Number.isFinite(num) ? num.toLocaleString('vi-VN') : match;
    })
    .replace(/\*/g, ' × ')
    .replace(/\//g, ' ÷ ')
    .replace(/\+/g, ' + ')
    .replace(/-/g, ' - ');
}
