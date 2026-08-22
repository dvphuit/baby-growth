import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';

const ROOT = process.cwd();
const SRC = join(ROOT, 'src');
const DIALOG = join(SRC, 'features/timeline/components/TimelineEntryDialog.tsx');
const EDITOR = join(SRC, 'features/timeline/components/TimelineEntryEditor.tsx');
const TYPES = join(SRC, 'features/timeline/components/timelineEntryTypes.ts');
const ACTIVITIES_INDEX = join(SRC, 'features/activities/index.ts');
const ARCH_AUDIT = join(SRC, 'architecture/architectureAudit.test.mjs');
const ARCHITECTURE = resolve(ROOT, '..', 'ARCHITECTURE.md');

function between(text, start, end) {
  const startIndex = text.indexOf(start);
  const endIndex = text.indexOf(end, startIndex + start.length);
  if (startIndex < 0 || endIndex < 0 || endIndex <= startIndex) {
    throw new Error(`Unable to locate extraction range: ${start} -> ${end}`);
  }
  return text.slice(startIndex, endIndex).trimEnd();
}

function appendLines(path, lines) {
  let text = readFileSync(path, 'utf8').trimEnd();
  for (const line of lines) {
    if (!text.includes(line)) text += `\n${line}`;
  }
  writeFileSync(path, `${text}\n`);
}

function removeLegacyEdge(text, edge) {
  const line = `  '${edge}',\n`;
  if (text.includes(line)) return text.replace(line, '');
  if (!text.includes(edge)) return text;
  throw new Error(`Legacy edge has unexpected formatting: ${edge}`);
}

const original = readFileSync(DIALOG, 'utf8');
if (existsSync(EDITOR) || existsSync(TYPES)) {
  if (original.includes("from './TimelineEntryEditor'") && existsSync(EDITOR) && existsSync(TYPES)) {
    console.log('Timeline editor is already split; no migration needed.');
    process.exit(0);
  }
  throw new Error('Partial timeline editor split detected.');
}

const editorConstants = between(original, 'const FEEDING_SOURCES = [', 'function entryCategoryLabel');
const dialogHelpers = between(original, 'function entryCategoryLabel', 'function localDateTimeValue');
const editorHelpers = between(original, 'function localDateTimeValue', 'export interface TimelineMediaButtonProps');
const editorBody = between(original, 'const DIAPER_KINDS = [', 'function normalizeToEntryAndSource(')
  .replaceAll('React.FormEvent', 'FormEvent');
const dialogTailStart = original.indexOf('function normalizeToEntryAndSource(');
if (dialogTailStart < 0) throw new Error('Missing normalizeToEntryAndSource marker.');
const dialogTail = original.slice(dialogTailStart).trimStart();

const typesSource = `import type { ActivityRecord } from '@/features/activities';
import type { GrowthHistoryRecord } from '@/features/growth';
import type { TimelineItem } from '@/features/timeline/domain/types';
import type { DerivedTimelineEntry } from '@/features/timeline/domain/timelineSelectors';

export type JournalTimelineEntry = DerivedTimelineEntry & { moment?: TimelineItem };

export type EditableTimelineSource =
  | { kind: 'activity'; record: ActivityRecord }
  | { kind: 'growth'; record: GrowthHistoryRecord }
  | { kind: 'moment'; record: TimelineItem };
`;

const editorSource = `import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type FormEvent,
} from 'react';
import {
  Baby,
  Camera,
  Check,
  CheckCircle2,
  Clock3,
  Droplet,
  Heart,
  Info,
  Image as ImageIcon,
  Images,
  Layers,
  Milk,
  NotebookPen,
  Package,
  Plus,
  Sparkles,
  ShieldAlert,
  TriangleAlert,
  Video,
  X,
} from 'lucide-react';
import {
  HavenMedicationPicker,
  HavenMilkAmountInput,
  HavenTemperatureInput,
  assessBabySleep,
  assessDiaper,
  assessTemperature,
  getAgeInMonths,
  useActivityStore,
  type ActivityRecord,
  type LiveAssessment,
  type NewBabyActivity,
  type NewMomActivity,
} from '@/features/activities';
import { useGrowthStore } from '@/features/growth';
import { useProfileStore } from '@/features/profile';
import { HavenDatePicker } from '@/shared/ui/HavenDatePicker';
import { HavenDropdown } from '@/shared/ui/HavenDropdown';
import { TimelineMediaAsset } from './TimelineMediaAsset';
import {
  detectTimelineMediaType,
  readTimelineMediaFiles,
  removeTimelineMediaFiles,
} from './timelineMediaFiles';
import { getTimelineMediaItems } from '../domain/timelineMedia';
import type { TimelineItem, TimelineMediaItem } from '../domain/types';
import { useTimelineStore } from '../store/useTimelineStore';
import type { EditableTimelineSource } from './timelineEntryTypes';

${editorConstants}

${editorHelpers}

${editorBody}
`;

const dialogSource = `import { useEffect, useState } from 'react';
import { Check, Clock3, Pencil, Trash2 } from 'lucide-react';
import { useActivityStore, type ActivityRecord } from '@/features/activities';
import { useGrowthStore } from '@/features/growth';
import { HavenDialog } from '@/shared/ui/HavenDialog';
import { getTimelineMediaItems } from '../domain/timelineMedia';
import type { TimelineItem, TimelineMediaItem } from '../domain/types';
import { buildBabyTimelineEntry } from '../domain/timelineSelectors';
import { useTimelineStore } from '../store/useTimelineStore';
import { TimelineEntryEditor } from './TimelineEntryEditor';
import { TimelineMediaButton } from './TimelineMediaButton';
import { entryMeta } from './timelineEntryPresentation';
import { removeTimelineMediaFiles } from './timelineMediaFiles';
import type { EditableTimelineSource, JournalTimelineEntry } from './timelineEntryTypes';

export { TimelineEntryEditor, TimelineMediaButton };
export type { TimelineEntryEditorProps } from './TimelineEntryEditor';
export type { TimelineMediaButtonProps } from './TimelineMediaButton';
export type { EditableTimelineSource, JournalTimelineEntry } from './timelineEntryTypes';

${dialogHelpers}

${dialogTail}
`;

writeFileSync(TYPES, typesSource);
writeFileSync(EDITOR, editorSource);
writeFileSync(DIALOG, dialogSource);

appendLines(ACTIVITIES_INDEX, [
  "export { assessBabySleep, assessDiaper, assessTemperature } from './domain/activityAssessments';",
  "export type { LiveAssessment } from './domain/activityAssessments';",
  "export { getAgeInMonths } from './domain/dailyCareTargets';",
  "export { useActivityStore } from './store/useActivityStore';",
  "export type { NewBabyActivity, NewMomActivity } from './store/useActivityStore';",
]);

let audit = readFileSync(ARCH_AUDIT, 'utf8');
for (const edge of [
  'features/timeline/components/TimelineEntryDialog.tsx -> @/features/activities/domain/activityAssessments',
  'features/timeline/components/TimelineEntryDialog.tsx -> @/features/activities/domain/dailyCareTargets',
  'features/timeline/components/TimelineEntryDialog.tsx -> @/features/activities/store/useActivityStore',
  'features/timeline/components/TimelineEntryDialog.tsx -> @/features/growth/store/useGrowthStore',
  'features/timeline/components/TimelineEntryDialog.tsx -> @/features/profile/store/useProfileStore',
]) {
  audit = removeLegacyEdge(audit, edge);
}

const guardAnchor = `  it('requires every feature to expose a public index entry point', () => {
    expect(findMissingFeaturePublicApis(SRC)).toEqual([]);
  });
`;
const guard = `
  it('keeps the timeline dialog shell separate from editor runtime', () => {
    const dialog = readFileSync(join(SRC, 'features/timeline/components/TimelineEntryDialog.tsx'), 'utf8');
    const editor = readFileSync(join(SRC, 'features/timeline/components/TimelineEntryEditor.tsx'), 'utf8');

    expect(dialog).toContain("from './TimelineEntryEditor'");
    expect(dialog).not.toContain('journal-feeding-editor');
    expect(dialog).not.toContain('HavenMedicationPicker');
    expect(dialog).not.toContain('assessBabySleep');
    expect(editor).toContain('id="timeline-edit-form"');
    expect(editor).not.toContain('<HavenDialog');
    expect(editor).not.toContain("@/features/activities/");
    expect(editor).not.toContain("@/features/growth/");
    expect(editor).not.toContain("@/features/profile/");
  });
`;
if (!audit.includes('keeps the timeline dialog shell separate from editor runtime')) {
  if (!audit.includes(guardAnchor)) throw new Error('Architecture guard anchor not found.');
  audit = audit.replace(guardAnchor, `${guardAnchor}${guard}`);
}
writeFileSync(ARCH_AUDIT, audit);

let architecture = readFileSync(ARCHITECTURE, 'utf8');
const componentRule = 'Split a large component when one part can have a clear responsibility such as form state, a selector-backed view model, media interaction, or a reusable presentation component. Do not split a file only to reduce its line count.';
const timelineRule = 'For timeline entries, the dialog shell owns detail presentation and edit/delete orchestration, while `TimelineEntryEditor` owns edit-form state, validation, and save orchestration. Cross-feature editor dependencies must use feature public APIs.';
if (!architecture.includes(timelineRule)) {
  if (!architecture.includes(componentRule)) throw new Error('Component rule anchor not found.');
  architecture = architecture.replace(componentRule, `${componentRule}\n\n${timelineRule}`);
  writeFileSync(ARCHITECTURE, architecture);
}

const finalDialog = readFileSync(DIALOG, 'utf8');
const finalEditor = readFileSync(EDITOR, 'utf8');
for (const forbidden of [
  'function TimelineEntryEditor',
  'HavenMedicationPicker',
  'assessBabySleep',
  'useProfileStore',
  'TimelineMediaSyncBadge',
  'useTimelineMediaUrl',
]) {
  if (finalDialog.includes(forbidden)) throw new Error(`Dialog still owns editor/media runtime: ${forbidden}`);
}
for (const required of [
  'export function TimelineEntryEditor',
  "from '@/features/activities'",
  "from '@/features/growth'",
  "from '@/features/profile'",
]) {
  if (!finalEditor.includes(required)) throw new Error(`Editor split missing required marker: ${required}`);
}
if (finalEditor.includes("@/features/activities/") || finalEditor.includes("@/features/growth/") || finalEditor.includes("@/features/profile/")) {
  throw new Error('Timeline editor still deep-imports another feature.');
}

console.log('Timeline editor ownership split applied.');
