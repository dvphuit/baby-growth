import {
  Baby,
  Droplets,
  Heart,
  Image as ImageIcon,
  Milk,
  MoonStar,
  NotebookPen,
  Pill,
  Ruler,
  Thermometer,
  type LucideIcon,
} from 'lucide-react';

const ENTRY_META: Record<string, { icon: LucideIcon; tone: string }> = {
  feeding: { icon: Milk, tone: 'apricot' },
  sleep: { icon: MoonStar, tone: 'lavender' },
  diaper: { icon: Baby, tone: 'sage' },
  medicine: { icon: Pill, tone: 'rose' },
  temperature: { icon: Thermometer, tone: 'coral' },
  growth: { icon: Ruler, tone: 'sage' },
  pumping: { icon: Droplets, tone: 'blue' },
  mood: { icon: Heart, tone: 'rose' },
  moment: { icon: ImageIcon, tone: 'moment' },
};

export function entryMeta(entry: { type: string }): { icon: LucideIcon; tone: string } {
  return ENTRY_META[entry.type] ?? { icon: NotebookPen, tone: 'neutral' };
}
