export interface TimeRange {
  startTime: string; // "HH:MM" format
  endTime: string; // "HH:MM" format
}

export interface DaySchedule {
  day: number; // 0 = Sunday, 6 = Saturday
  enabled: boolean;
  timeRanges: TimeRange[];
}

export interface DateSchedule {
  startDate: string; // ISO date
  endDate: string; // ISO date
  timeRanges?: TimeRange[];
}

export interface EventSchedule {
  eventName: string;
  eventType: "special" | "festival" | "promotion" | "custom";
  isActive: boolean;
  priority: number;
}

export interface MenuSchedule {
  type: "always" | "time-based" | "date-based" | "event-based" | "season-based";

  // Time-based (daily/weekly)
  daySchedules?: DaySchedule[];

  // Date-based (specific dates)
  dateRanges?: DateSchedule[];

  // Event-based
  events?: EventSchedule[];

  // Season-based
  season?: {
    startMonth: number; // 1-12
    startDay: number; // 1-31
    endMonth: number;
    endDay: number;
  };

  // Auto-switch settings
  autoSwitch?: boolean;
  transitionMessage?: string;
  preOpenMinutes?: number; // Show "opening soon" message
  preCloseMinutes?: number; // Show "closing soon" message
}

export function isMenuActive(
  schedule: MenuSchedule,
  currentDate: Date = new Date()
): {
  active: boolean;
  reason?: string;
  nextChange?: Date;
  timeRemaining?: number;
} {
  if (schedule.type === "always") {
    return { active: true };
  }

  const currentDay = currentDate.getDay();
  const currentTime = `${currentDate
    .getHours()
    .toString()
    .padStart(2, "0")}:${currentDate.getMinutes().toString().padStart(2, "0")}`;
  const currentMonth = currentDate.getMonth() + 1;
  const currentDayOfMonth = currentDate.getDate();

  // Time-based scheduling
  if (schedule.type === "time-based" && schedule.daySchedules) {
    const todaySchedule = schedule.daySchedules.find(
      (ds) => ds.day === currentDay
    );

    if (!todaySchedule || !todaySchedule.enabled) {
      return {
        active: false,
        reason: "Not scheduled for today",
      };
    }

    for (const range of todaySchedule.timeRanges) {
      if (isTimeInRange(currentTime, range.startTime, range.endTime)) {
        const endTime = parseTime(range.endTime);
        const now = parseTime(currentTime);
        const remaining = endTime.getTime() - now.getTime();

        return {
          active: true,
          timeRemaining: Math.floor(remaining / 60000), // minutes
          nextChange: endTime,
        };
      }
    }

    // Find next time slot
    const nextRange = findNextTimeSlot(schedule.daySchedules, currentDate);
    return {
      active: false,
      reason: "Outside scheduled hours",
      nextChange: nextRange,
    };
  }

  // Date-based scheduling
  if (schedule.type === "date-based" && schedule.dateRanges) {
    for (const dateRange of schedule.dateRanges) {
      const start = new Date(dateRange.startDate);
      const end = new Date(dateRange.endDate);

      if (currentDate >= start && currentDate <= end) {
        // Check time ranges if specified
        if (dateRange.timeRanges) {
          for (const timeRange of dateRange.timeRanges) {
            if (
              isTimeInRange(currentTime, timeRange.startTime, timeRange.endTime)
            ) {
              return { active: true };
            }
          }
          return { active: false, reason: "Outside scheduled hours" };
        }

        return { active: true };
      }
    }

    return {
      active: false,
      reason: "Outside scheduled dates",
    };
  }

  // Season-based scheduling
  if (schedule.type === "season-based" && schedule.season) {
    const { startMonth, startDay, endMonth, endDay } = schedule.season;

    const isInSeason = isDateInSeasonRange(
      currentMonth,
      currentDayOfMonth,
      startMonth,
      startDay,
      endMonth,
      endDay
    );

    return {
      active: isInSeason,
      reason: isInSeason ? undefined : "Outside season",
    };
  }

  // Event-based scheduling
  if (schedule.type === "event-based" && schedule.events) {
    const activeEvent = schedule.events.find((e) => e.isActive);
    return {
      active: !!activeEvent,
      reason: activeEvent
        ? `Event: ${activeEvent.eventName}`
        : "No active events",
    };
  }

  return { active: false, reason: "Unknown schedule type" };
}

function isTimeInRange(current: string, start: string, end: string): boolean {
  const currentMinutes = timeToMinutes(current);
  const startMinutes = timeToMinutes(start);
  const endMinutes = timeToMinutes(end);

  if (endMinutes < startMinutes) {
    // Spans midnight
    return currentMinutes >= startMinutes || currentMinutes <= endMinutes;
  }

  return currentMinutes >= startMinutes && currentMinutes <= endMinutes;
}

function timeToMinutes(time: string): number {
  const [hours, minutes] = time.split(":").map(Number);
  return hours * 60 + minutes;
}

function parseTime(time: string): Date {
  const [hours, minutes] = time.split(":").map(Number);
  const date = new Date();
  date.setHours(hours, minutes, 0, 0);
  return date;
}

function findNextTimeSlot(
  schedules: DaySchedule[],
  currentDate: Date
): Date | undefined {
  const currentDay = currentDate.getDay();

  // Check remaining slots today
  const todaySchedule = schedules.find((s) => s.day === currentDay);
  if (todaySchedule) {
    const currentTime = `${currentDate
      .getHours()
      .toString()
      .padStart(2, "0")}:${currentDate
      .getMinutes()
      .toString()
      .padStart(2, "0")}`;

    for (const range of todaySchedule.timeRanges) {
      if (timeToMinutes(range.startTime) > timeToMinutes(currentTime)) {
        const [hours, minutes] = range.startTime.split(":").map(Number);
        const nextSlot = new Date(currentDate);
        nextSlot.setHours(hours, minutes, 0, 0);
        return nextSlot;
      }
    }
  }

  // Check next 7 days
  for (let i = 1; i <= 7; i++) {
    const nextDay = (currentDay + i) % 7;
    const schedule = schedules.find((s) => s.day === nextDay && s.enabled);

    if (schedule && schedule.timeRanges.length > 0) {
      const nextDate = new Date(currentDate);
      nextDate.setDate(nextDate.getDate() + i);
      const [hours, minutes] = schedule.timeRanges[0].startTime
        .split(":")
        .map(Number);
      nextDate.setHours(hours, minutes, 0, 0);
      return nextDate;
    }
  }

  return undefined;
}

function isDateInSeasonRange(
  currentMonth: number,
  currentDay: number,
  startMonth: number,
  startDay: number,
  endMonth: number,
  endDay: number
): boolean {
  const currentDate = currentMonth * 100 + currentDay;
  const startDate = startMonth * 100 + startDay;
  const endDate = endMonth * 100 + endDay;

  if (endDate < startDate) {
    // Spans year boundary
    return currentDate >= startDate || currentDate <= endDate;
  }

  return currentDate >= startDate && currentDate <= endDate;
}

export function getMenuStatus(
  schedule: MenuSchedule,
  currentDate: Date = new Date()
): {
  status: "active" | "upcoming" | "closed" | "ending-soon" | "starting-soon";
  message: string;
  timeRemaining?: number;
  nextChange?: Date;
} {
  const { active, reason, nextChange, timeRemaining } = isMenuActive(
    schedule,
    currentDate
  );

  if (active) {
    if (
      timeRemaining &&
      schedule.preCloseMinutes &&
      timeRemaining <= schedule.preCloseMinutes
    ) {
      return {
        status: "ending-soon",
        message: `Ends in ${timeRemaining} minutes`,
        timeRemaining,
        nextChange,
      };
    }

    return {
      status: "active",
      message: "Available now",
      timeRemaining,
      nextChange,
    };
  }

  if (nextChange && schedule.preOpenMinutes) {
    const minutesUntilOpen = Math.floor(
      (nextChange.getTime() - currentDate.getTime()) / 60000
    );

    if (minutesUntilOpen <= schedule.preOpenMinutes && minutesUntilOpen > 0) {
      return {
        status: "starting-soon",
        message: `Opens in ${minutesUntilOpen} minutes`,
        timeRemaining: minutesUntilOpen,
        nextChange,
      };
    }
  }

  if (nextChange) {
    return {
      status: "upcoming",
      message: `Opens ${formatNextChange(nextChange)}`,
      nextChange,
    };
  }

  return {
    status: "closed",
    message: reason || "Currently unavailable",
  };
}

function formatNextChange(date: Date): string {
  const now = new Date();
  const diff = date.getTime() - now.getTime();
  const hours = Math.floor(diff / 3600000);
  const minutes = Math.floor((diff % 3600000) / 60000);

  if (hours < 24) {
    if (hours === 0) {
      return `in ${minutes} minutes`;
    }
    return `in ${hours}h ${minutes}m`;
  }

  const days = Math.floor(hours / 24);
  return `in ${days} day${days > 1 ? "s" : ""}`;
}
