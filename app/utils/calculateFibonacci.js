module.exports = function calculateFibonacci(n) {
  if (n > 10) throw new Error("Too big number");
  if (n < 2) return n;
  return calculateFibonacci(n - 1) + calculateFibonacci(n - 2);
}
