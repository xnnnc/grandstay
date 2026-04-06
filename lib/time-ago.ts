export function timeAgo(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  const diffHour = Math.floor(diffMs / 3600000);
  const diffDay = Math.floor(diffMs / 86400000);

  if (diffMin < 1) return "az önce";
  if (diffMin < 60) return `${diffMin} dakika önce`;
  if (diffHour < 24) return `${diffHour} saat önce`;
  if (diffDay === 1) return "dün";
  if (diffDay < 7) return `${diffDay} gün önce`;
  if (diffDay < 30) return `${Math.floor(diffDay / 7)} hafta önce`;
  return `${Math.floor(diffDay / 30)} ay önce`;
}
