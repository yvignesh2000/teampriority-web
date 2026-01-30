// Date utility functions

export function getToday(): Date {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), now.getDate());
}

export function getWeekStart(date: Date = new Date()): Date {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Adjust for Sunday
    return new Date(d.setDate(diff));
}

export function getWeekEnd(date: Date = new Date()): Date {
    const start = getWeekStart(date);
    return new Date(start.getTime() + 6 * 24 * 60 * 60 * 1000);
}

export function isSameDay(date1: Date, date2: Date): boolean {
    return (
        date1.getFullYear() === date2.getFullYear() &&
        date1.getMonth() === date2.getMonth() &&
        date1.getDate() === date2.getDate()
    );
}

export function isSameWeek(date1: Date, date2: Date): boolean {
    return getWeekStart(date1).getTime() === getWeekStart(date2).getTime();
}

export function formatDate(date: Date): string {
    return date.toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
    });
}

export function formatDateFull(date: Date): string {
    return date.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    });
}

export function formatWeekRange(weekStart: Date): string {
    const weekEnd = getWeekEnd(weekStart);
    const startMonth = weekStart.toLocaleDateString('en-US', { month: 'short' });
    const endMonth = weekEnd.toLocaleDateString('en-US', { month: 'short' });

    if (startMonth === endMonth) {
        return `${startMonth} ${weekStart.getDate()} - ${weekEnd.getDate()}`;
    }
    return `${startMonth} ${weekStart.getDate()} - ${endMonth} ${weekEnd.getDate()}`;
}

export function getRelativeDay(offset: number): Date {
    const today = getToday();
    return new Date(today.getTime() + offset * 24 * 60 * 60 * 1000);
}

export function isWeekend(date: Date = new Date()): boolean {
    const day = date.getDay();
    return day === 0 || day === 6;
}

export function isFriday(date: Date = new Date()): boolean {
    return date.getDay() === 5;
}

export function getHourMinute(): { hour: number; minute: number } {
    const now = new Date();
    return { hour: now.getHours(), minute: now.getMinutes() };
}

// Check if current time is past a specific time
export function isPastTime(hour: number, minute: number): boolean {
    const now = new Date();
    const targetTime = new Date(now.getFullYear(), now.getMonth(), now.getDate(), hour, minute);
    return now >= targetTime;
}
