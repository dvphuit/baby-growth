export function getZodiacSign(dateStr: string): string {
  const date = new Date(dateStr);
  if (!Number.isFinite(date.getTime())) return 'Chưa xác định';
  const month = date.getMonth() + 1;
  const day = date.getDate();
  if ((month === 3 && day >= 21) || (month === 4 && day <= 19)) return 'Bạch Dương ♈';
  if ((month === 4 && day >= 20) || (month === 5 && day <= 20)) return 'Kim Ngưu ♉';
  if ((month === 5 && day >= 21) || (month === 6 && day <= 21)) return 'Song Tử ♊';
  if ((month === 6 && day >= 22) || (month === 7 && day <= 22)) return 'Cự Giải ♋';
  if ((month === 7 && day >= 23) || (month === 8 && day <= 22)) return 'Sư Tử ♌';
  if ((month === 8 && day >= 23) || (month === 9 && day <= 22)) return 'Xử Nữ ♍';
  if ((month === 9 && day >= 23) || (month === 10 && day <= 23)) return 'Thiên Bình ♎';
  if ((month === 10 && day >= 24) || (month === 11 && day <= 22)) return 'Bọ Cạp ♏';
  if ((month === 11 && day >= 23) || (month === 12 && day <= 21)) return 'Nhân Mã ♐';
  if ((month === 12 && day >= 22) || (month === 1 && day <= 19)) return 'Ma Kết ♑';
  if ((month === 1 && day >= 20) || (month === 2 && day <= 18)) return 'Bảo Bình ♒';
  return 'Song Ngư ♓';
}
