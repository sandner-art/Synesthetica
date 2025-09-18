import type { EvaluatedFunction } from '../types';

const cache = new Map<string, EvaluatedFunction>();

export const parseFunction = (expression: string): EvaluatedFunction | null => {
  if (cache.has(expression)) {
    return cache.get(expression)!;
  }
  
  if (!expression.trim()) {
    // Return a safe, zero function for empty or whitespace-only input.
    return () => 0;
  }

  try {
    // Expose Math object functions and constants safely
    const func = new Function(
      'x', 't', 'a', 'b', 'c',
      'const { PI, sin, cos, tan, exp, log, sqrt, abs, pow, floor, ceil, random, max, min, cosh, sinh, tanh, asin, acos, atan, sign, round } = Math; return ' + expression
    );
    
    const evaluatedFunc = func as EvaluatedFunction;
    // Do a quick test evaluation to catch runtime errors that parsing alone might miss.
    evaluatedFunc(0, 0, 1, 1, 1);
    
    cache.set(expression, evaluatedFunc);
    return evaluatedFunc;
  } catch (error) {
    // Don't log to console, as this will fire frequently while a user is typing.
    // The UI will handle the null return value.
    return null;
  }
};

/**
 * Numerically calculates the derivative of a function at a point using the central difference method.
 * @param func The function to differentiate.
 * @param x The point at which to evaluate the derivative.
 * @param t Time parameter for the function.
 * @param a, b, c Other function parameters.
 * @returns The approximate derivative (slope) at point x.
 */
export const getDerivative = (func: EvaluatedFunction, x: number, t: number, a: number, b: number, c: number): number => {
    const h = 0.0001; // A small step for the finite difference calculation
    const f_x_plus_h = func(x + h, t, a, b, c);
    const f_x_minus_h = func(x - h, t, a, b, c);

    if (!isFinite(f_x_plus_h) || !isFinite(f_x_minus_h)) {
        return 0; // Avoid NaN/Infinity issues with discontinuous functions like tan(x)
    }

    return (f_x_plus_h - f_x_minus_h) / (2 * h);
};