const TIME_ZONE = 'Africa/Johannesburg';
const LOCAL_DATE_TIME_PATTERN =
  /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})$/;

export function fromDateTimeLocal(value: string): string {
  const match = LOCAL_DATE_TIME_PATTERN.exec(value);
  if (!match) {
    throw new Error('Please provide a valid appointment date and time.');
  }

  const [, yearPart, monthPart, dayPart, hourPart, minutePart] = match;
  const year = Number(yearPart);
  const month = Number(monthPart);
  const day = Number(dayPart);
  const hour = Number(hourPart);
  const minute = Number(minutePart);
  const localDate = new Date(Date.UTC(year, month - 1, day, hour, minute));
  if (
    localDate.getUTCFullYear() !== year ||
    localDate.getUTCMonth() !== month - 1 ||
    localDate.getUTCDate() !== day ||
    localDate.getUTCHours() !== hour ||
    localDate.getUTCMinutes() !== minute
  ) {
    throw new Error('Please provide a valid appointment date and time.');
  }

  return `${value}:00+02:00`;
}

export function toDateTimeLocal(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) {
    throw new Error('Could not format the appointment date and time.');
  }

  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: TIME_ZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
  }).formatToParts(date);
  const values = Object.fromEntries(
    parts.map(({ type, value }) => [type, value]),
  );

  return `${values.year}-${values.month}-${values.day}T${values.hour}:${values.minute}`;
}

export function formatSA(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) {
    throw new Error('Could not format the appointment date and time.');
  }

  return date.toLocaleString('en-ZA', {
    timeZone: TIME_ZONE,
    dateStyle: 'medium',
    timeStyle: 'short',
  });
}
