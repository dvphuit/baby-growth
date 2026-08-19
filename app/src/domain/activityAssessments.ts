export type AssessmentSeverity = 'good' | 'info' | 'warning' | 'danger';

export interface LiveAssessment {
  severity: AssessmentSeverity;
  label: string;
  detail: string;
}

export function assessBabySleep(input: {
  startedAt: string;
  endedAt: string;
  quality: 'restful' | 'normal' | 'restless';
  wakeCount: number;
}): LiveAssessment & { durationMinutes: number | null } {
  const start = new Date(input.startedAt);
  const end = new Date(input.endedAt);
  if (!Number.isFinite(start.getTime()) || !Number.isFinite(end.getTime())) {
    return { severity: 'info', label: 'Chưa đủ thời gian', detail: 'Chọn giờ bắt đầu và kết thúc.', durationMinutes: null };
  }

  const durationMinutes = Math.round((end.getTime() - start.getTime()) / 60_000);
  if (durationMinutes <= 0) {
    return { severity: 'danger', label: 'Thời gian chưa hợp lệ', detail: 'Giờ kết thúc phải sau giờ bắt đầu.', durationMinutes };
  }

  const durationLabel = durationMinutes >= 60
    ? `${Math.floor(durationMinutes / 60)} giờ ${durationMinutes % 60 ? `${durationMinutes % 60} phút` : ''}`.trim()
    : `${durationMinutes} phút`;

  if (durationMinutes < 15) {
    return { severity: 'warning', label: `Giấc rất ngắn · ${durationLabel}`, detail: 'Kiểm tra lại thời gian hoặc ghi chú nếu bé bị đánh thức sớm.', durationMinutes };
  }
  if (input.quality === 'restless' || input.wakeCount >= 4) {
    return { severity: 'warning', label: `Ngủ chưa yên · ${durationLabel}`, detail: 'Bé thức nhiều hoặc ngủ không sâu; nên theo dõi thêm các giấc tiếp theo.', durationMinutes };
  }
  return { severity: 'good', label: `Đã ghi ${durationLabel}`, detail: 'Thời lượng hợp lệ. Đánh giá tổng ngày sẽ dựa trên tất cả các giấc.', durationMinutes };
}

export function assessDiaper(input: {
  diaperKind: 'wet' | 'dirty' | 'both';
  stoolType?: 1 | 2 | 3 | 4 | 5 | 6 | 7;
  stoolColor?: 'yellow' | 'brown' | 'green' | 'red' | 'black' | 'pale';
  flags?: Array<'mucus' | 'blood'>;
}): LiveAssessment {
  if (input.diaperKind === 'wet') {
    return { severity: 'good', label: 'Tã ướt', detail: 'Không cần phân loại phân cho lần thay tã này.' };
  }

  if (input.flags?.includes('blood') || input.stoolColor === 'red') {
    return { severity: 'danger', label: 'Có dấu hiệu máu trong phân', detail: 'Chụp lại nếu có thể và liên hệ bác sĩ để được hướng dẫn.' };
  }
  if (input.stoolColor === 'black') {
    return { severity: 'danger', label: 'Phân đen cần kiểm tra', detail: 'Ngoài phân su vài ngày đầu hoặc do sắt/thức ăn, phân đen như hắc ín cần được đánh giá y tế.' };
  }
  if (input.stoolColor === 'pale') {
    return { severity: 'danger', label: 'Phân trắng hoặc xám nhạt', detail: 'Màu phân rất nhạt có thể liên quan đến đường mật; nên liên hệ bác sĩ.' };
  }
  if (input.stoolType === 7) {
    return { severity: 'warning', label: 'Phân toàn nước · Bristol 7', detail: 'Theo dõi số lần đi ngoài và dấu hiệu mất nước; cần khám nếu lặp lại hoặc bé mệt.' };
  }
  if (input.stoolType === 1 || input.stoolType === 2) {
    return { severity: 'warning', label: 'Phân cứng · Có thể táo bón', detail: 'Theo dõi đau rặn, nứt hậu môn và số ngày chưa đi ngoài.' };
  }
  if (input.flags?.includes('mucus')) {
    return { severity: 'warning', label: 'Có nhầy trong phân', detail: 'Theo dõi thêm; cần hỏi bác sĩ nếu nhầy lặp lại, kèm máu, sốt hoặc bé bú kém.' };
  }
  if (input.stoolType === 6) {
    return { severity: 'info', label: 'Phân mềm nhão · Bristol 6', detail: 'Có thể bình thường ở trẻ nhỏ; theo dõi nếu số lần tăng hoặc chuyển thành toàn nước.' };
  }
  return { severity: 'good', label: 'Chưa thấy dấu hiệu cảnh báo', detail: 'Vàng, nâu và xanh thường có thể là màu phân bình thường.' };
}

const URGENT_TEMPERATURE_SYMPTOMS = new Set(['lethargy', 'breathing', 'seizure', 'rash']);

export function assessTemperature(input: {
  temperatureC: number;
  ageMonths: number | null;
  measurementSite: 'rectal' | 'ear' | 'forehead' | 'oral' | 'axillary';
  symptoms?: Array<'lethargy' | 'breathing' | 'seizure' | 'rash' | 'dehydration'>;
}): LiveAssessment {
  const urgentSymptom = input.symptoms?.some((symptom) => URGENT_TEMPERATURE_SYMPTOMS.has(symptom));
  if (urgentSymptom) {
    return { severity: 'danger', label: 'Có dấu hiệu cần cấp cứu', detail: 'Khó thở, co giật, khó đánh thức hoặc ban tím cần được đánh giá y tế ngay.' };
  }
  if (input.temperatureC < 36) {
    return { severity: 'danger', label: 'Hạ thân nhiệt', detail: 'Ủ ấm, đo lại đúng cách và liên hệ y tế nếu nhiệt độ vẫn dưới 36°C.' };
  }
  if (input.ageMonths !== null && input.ageMonths < 3 && input.temperatureC >= 38) {
    return { severity: 'danger', label: 'Bé dưới 3 tháng sốt từ 38°C', detail: 'Cần liên hệ cơ sở y tế ngay, kể cả khi bé vẫn có vẻ khỏe.' };
  }
  if (input.temperatureC >= 40) {
    return { severity: 'danger', label: 'Sốt từ 40°C', detail: 'Cần liên hệ y tế ngay và theo dõi sát tình trạng của bé.' };
  }
  if (input.temperatureC >= 39) {
    return { severity: 'warning', label: 'Sốt cao', detail: 'Cho bé uống/bú đủ, mặc thoáng và liên hệ bác sĩ nếu bé mệt hoặc sốt kéo dài.' };
  }
  if (input.temperatureC >= 38) {
    return { severity: 'warning', label: 'Có sốt', detail: 'Theo dõi triệu chứng, bù đủ nước/sữa và đo lại theo hướng dẫn.' };
  }
  if (input.temperatureC >= 37.5) {
    return { severity: 'info', label: 'Thân nhiệt hơi cao', detail: 'Nghỉ 15–30 phút, bỏ bớt quần áo dày và đo lại.' };
  }
  if (input.measurementSite === 'axillary') {
    return { severity: 'good', label: 'Trong khoảng bình thường', detail: 'Đo nách tiện lợi nhưng kém chính xác hơn; đo lại nếu bé có triệu chứng.' };
  }
  return { severity: 'good', label: 'Trong khoảng bình thường', detail: 'Chưa thấy cảnh báo từ nhiệt độ và triệu chứng đã chọn.' };
}
