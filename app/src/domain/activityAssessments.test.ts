import { describe, expect, it } from 'vitest';
import { assessBabySleep, assessDiaper, assessTemperature } from './activityAssessments';

describe('activityAssessments', () => {
  it('validates sleep time and flags restless sleep', () => {
    expect(assessBabySleep({ startedAt: '2026-08-19T10:00', endedAt: '2026-08-19T09:00', quality: 'normal', wakeCount: 0 }).severity).toBe('danger');
    expect(assessBabySleep({ startedAt: '2026-08-19T10:00', endedAt: '2026-08-19T12:00', quality: 'restless', wakeCount: 1 }).severity).toBe('warning');
    expect(assessBabySleep({ startedAt: '2026-08-19T10:00', endedAt: '2026-08-19T12:00', quality: 'restful', wakeCount: 0 }).durationMinutes).toBe(120);
  });

  it('combines Bristol type, stool color and symptoms', () => {
    expect(assessDiaper({ diaperKind: 'dirty', stoolType: 4, stoolColor: 'yellow' }).severity).toBe('good');
    expect(assessDiaper({ diaperKind: 'dirty', stoolType: 7, stoolColor: 'green' }).severity).toBe('warning');
    expect(assessDiaper({ diaperKind: 'dirty', stoolType: 4, stoolColor: 'pale' }).severity).toBe('danger');
  });

  it('uses age, temperature and urgent symptoms', () => {
    expect(assessTemperature({ temperatureC: 38, ageMonths: 2, measurementSite: 'rectal' }).severity).toBe('danger');
    expect(assessTemperature({ temperatureC: 38, ageMonths: 8, measurementSite: 'forehead' }).severity).toBe('warning');
    expect(assessTemperature({ temperatureC: 36.8, ageMonths: 8, measurementSite: 'axillary' }).severity).toBe('good');
    expect(assessTemperature({ temperatureC: 36.8, ageMonths: 8, measurementSite: 'forehead', symptoms: ['breathing'] }).severity).toBe('danger');
  });
});
