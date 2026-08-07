export function formatCurrency(value: number) {
  return value.toLocaleString("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 2,
  });
}

export function formatCompactCurrency(value: number) {
  return `₹${(value / 1000).toFixed(0)}k`;
}
