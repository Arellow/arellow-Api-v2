import { startOfDay, endOfDay, startOfWeek, endOfWeek, subWeeks, subMonths, startOfMonth, endOfMonth, subYears, startOfYear, endOfYear, subDays } from 'date-fns';

export function getDateRange(filterTime: string) {
  const now = new Date();

  switch (filterTime) {
    case "today":
      return {
        current: {
          start: startOfDay(now),
          end: endOfDay(now),
        },
        previous: {
          start: startOfDay(subDays(now, 1)),
          end: endOfDay(subDays(now, 1)),
        }
      };

    case "this_week":
      return {
        current: {
          start: startOfWeek(now, { weekStartsOn: 1 }),
          end: endOfWeek(now, { weekStartsOn: 1 }),
        },
        previous: {
          start: startOfWeek(subWeeks(now, 1), { weekStartsOn: 1 }),
          end: endOfWeek(subWeeks(now, 1), { weekStartsOn: 1 }),
        }
      };

    case "last_week":
      return {
        current: {
          start: startOfWeek(subWeeks(now, 1), { weekStartsOn: 1 }),
          end: endOfWeek(subWeeks(now, 1), { weekStartsOn: 1 }),
        },
        previous: {
          start: startOfWeek(subWeeks(now, 2), { weekStartsOn: 1 }),
          end: endOfWeek(subWeeks(now, 2), { weekStartsOn: 1 }),
        }
      };

    case "this_month":
      return {
        current: {
          start: startOfMonth(now),
          end: endOfMonth(now),
        },
        previous: {
          start: startOfMonth(subMonths(now, 1)),
          end: endOfMonth(subMonths(now, 1)),
        }
      };

    case "last_month":
      return {
        current: {
          start: startOfMonth(subMonths(now, 1)),
          end: endOfMonth(subMonths(now, 1)),
        },
        previous: {
          start: startOfMonth(subMonths(now, 2)),
          end: endOfMonth(subMonths(now, 2)),
        }
      };

    case "this_year":
      return {
        current: {
          start: startOfYear(now),
          end: endOfYear(now),
        },
        previous: {
          start: startOfYear(subYears(now, 1)),
          end: endOfYear(subYears(now, 1)),
        }
      };

    case "last_year":
      return {
        current: {
          start: startOfYear(subYears(now, 1)),
          end: endOfYear(subYears(now, 1)),
        },
        previous: {
          start: startOfYear(subYears(now, 2)),
          end: endOfYear(subYears(now, 2)),
        }
      };

    default:
      throw new Error("Invalid filterTime");
  }
}
