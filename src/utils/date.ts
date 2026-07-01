import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import isToday from 'dayjs/plugin/isToday';
import isYesterday from 'dayjs/plugin/isYesterday';

dayjs.extend(relativeTime);
dayjs.extend(isToday);
dayjs.extend(isYesterday);

export const formatDate = (date: string): string => {
  const d = dayjs(date);
  if (d.isToday()) return 'Today';
  if (d.isYesterday()) return 'Yesterday';
  return d.format('MMM DD, YYYY');
};

export const formatDateShort = (date: string): string => {
  return dayjs(date).format('MMM DD');
};

export const getCurrentMonth = (): number => dayjs().month() + 1;
export const getCurrentYear = (): number => dayjs().year();
export const getCurrentDate = (): string => dayjs().format('YYYY-MM-DD');

export const getMonthName = (month: number): string => {
  return dayjs()
    .month(month - 1)
    .format('MMMM');
};

export const getDaysInMonth = (month: number, year: number): number => {
  return dayjs(`${year}-${month}-01`).daysInMonth();
};

export const getStartOfMonth = (month: number, year: number): string => {
  return dayjs(`${year}-${month}-01`).format('YYYY-MM-DD');
};

export const getEndOfMonth = (month: number, year: number): string => {
  return dayjs(`${year}-${month}-01`).endOf('month').format('YYYY-MM-DD');
};

export const getGreeting = (): string => {
  const hour = dayjs().hour();
  if (hour < 12) return 'Good morning,';
  if (hour < 17) return 'Good afternoon,';
  return 'Good evening,';
};
