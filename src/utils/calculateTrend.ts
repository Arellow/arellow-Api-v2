export function calculateTrend(current: number, previous: number) {
  const percentage = previous === 0 ? (current > 0 ? 100 : 0) : ((current - previous) / previous) * 100;
  const trend = current > previous ? "up" : current < previous ? "down" : "equal";
  return { percentage: Math.round(percentage), trend };
}
