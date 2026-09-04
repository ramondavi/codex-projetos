type ServiceAnnouncement = {
  type: string;
  starts_at: string;
  ends_at: string | null;
};

const oneDayTypes = new Set(["holiday", "optional_day"]);

function brazilianCalendarDay(value: string) {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "America/Sao_Paulo",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date(value));
  const part = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((item) => item.type === type)?.value;
  return `${part("year")}-${part("month")}-${part("day")}`;
}

export function isCurrentServiceAnnouncement(
  announcement: ServiceAnnouncement,
  now: string,
) {
  if (oneDayTypes.has(announcement.type)) {
    return brazilianCalendarDay(announcement.starts_at) === brazilianCalendarDay(now);
  }
  return !announcement.ends_at || new Date(announcement.ends_at) >= new Date(now);
}
