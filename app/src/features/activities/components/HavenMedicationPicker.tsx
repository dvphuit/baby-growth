import { useMemo, useState } from 'react';
import { Check, ExternalLink, Plus, Trash2, X } from 'lucide-react';
import {
  normalizeMedicationName,
  type MedicationDoseUnit,
  type MedicationCatalogItem,
} from '@/features/activities/domain/medicationCatalog';

const DOSE_UNITS: Array<{ value: MedicationDoseUnit; label: string }> = [
  { value: 'giọt', label: 'Giọt' },
  { value: 'ml', label: 'ml' },
  { value: 'gói', label: 'Gói' },
  { value: 'viên', label: 'Viên' },
  { value: 'lần xịt', label: 'Lần xịt' },
];

const DOSE_STEPS: Record<MedicationDoseUnit, number> = {
  'giọt': 1,
  'ml': 0.5,
  'gói': 1,
  'viên': 0.25,
  'lần xịt': 1,
};

function formatDoseAmount(value: number): string {
  return Number(value.toFixed(2)).toString().replace('.', ',');
}

function parseDose(value: string): { amount: string; unit: MedicationDoseUnit } | null {
  const match = value.trim().match(/^(\d+(?:[.,]\d+)?)\s*(giọt|ml|gói|viên|lần xịt)$/i);
  if (!match) return null;
  return {
    amount: match[1].replace('.', ','),
    unit: match[2].toLocaleLowerCase('vi-VN') as MedicationDoseUnit,
  };
}

interface HavenMedicationPickerProps {
  items: MedicationCatalogItem[];
  value: string;
  dose: string;
  onSelect: (item: MedicationCatalogItem) => void;
  onCreate: (name: string, infoUrl?: string) => void;
  onDelete: (item: MedicationCatalogItem) => void;
  onDoseChange: (value: string) => void;
}

export function HavenMedicationPicker({
  items,
  value,
  dose,
  onSelect,
  onCreate,
  onDelete,
  onDoseChange,
}: HavenMedicationPickerProps) {
  const [adding, setAdding] = useState(false);
  const [newName, setNewName] = useState('');
  const [newInfoUrl, setNewInfoUrl] = useState('');
  const [addError, setAddError] = useState<string | null>(null);
  const visibleItems = useMemo(() => {
    if (!value || items.some((item) => normalizeMedicationName(item.name) === normalizeMedicationName(value))) {
      return items;
    }
    return [
      ...items,
      {
        id: 'medication-current',
        name: value,
        detail: 'Đang sử dụng',
        kind: 'medicine' as const,
        builtIn: false,
        lastDose: dose || undefined,
      },
    ];
  }, [dose, items, value]);
  const selectedItem = visibleItems.find(
    (item) => normalizeMedicationName(item.name) === normalizeMedicationName(value),
  );
  const parsedDose = parseDose(dose);
  const activeUnit = parsedDose?.unit ?? selectedItem?.preferredDoseUnit ?? 'ml';
  const numericDose = parsedDose ? Number(parsedDose.amount.replace(',', '.')) : 0;

  const selectDoseUnit = (unit: MedicationDoseUnit) => {
    const amount = numericDose > 0 ? parsedDose!.amount : formatDoseAmount(DOSE_STEPS[unit]);
    onDoseChange(`${amount} ${unit}`);
  };

  const adjustDoseAmount = (direction: -1 | 1) => {
    const nextAmount = Math.max(0, numericDose + DOSE_STEPS[activeUnit] * direction);
    if (nextAmount === 0) {
      onDoseChange('');
      return;
    }
    onDoseChange(`${formatDoseAmount(nextAmount)} ${activeUnit}`);
  };

  const createMedication = () => {
    const nextName = newName.trim().replace(/\s+/g, ' ');
    if (!nextName) {
      setAddError('Nhập tên thuốc hoặc vitamin.');
      return;
    }
    let nextInfoUrl: string | undefined;
    if (newInfoUrl.trim()) {
      try {
        const candidate = /^https?:\/\//i.test(newInfoUrl.trim())
          ? newInfoUrl.trim()
          : `https://${newInfoUrl.trim()}`;
        const parsed = new URL(candidate);
        if (!['http:', 'https:'].includes(parsed.protocol)) throw new Error('Unsupported URL');
        nextInfoUrl = parsed.toString();
      } catch {
        setAddError('Link tham khảo chưa đúng định dạng.');
        return;
      }
    }
    onCreate(nextName, nextInfoUrl);
    setNewName('');
    setNewInfoUrl('');
    setAddError(null);
    setAdding(false);
  };

  return (
    <div className="haven-medication-picker">
      <div className="haven-medication-heading">
        <div>
          <strong>Thuốc / vitamin thường dùng</strong>
          <small>Chọn nhanh hoặc thêm loại riêng</small>
        </div>
        {!adding && (
          <button type="button" className="haven-medication-add-trigger" onClick={() => setAdding(true)}>
            <Plus size={14} /> Thêm loại
          </button>
        )}
      </div>

      <div className="haven-medication-grid" role="radiogroup" aria-label="Chọn thuốc hoặc vitamin">
        {visibleItems.map((item) => {
          const selected = normalizeMedicationName(item.name) === normalizeMedicationName(value);
          return (
            <span className={`haven-medication-option ${selected ? 'is-selected' : ''}`} key={item.id}>
              <button
                type="button"
                role="radio"
                aria-checked={selected}
                onClick={() => onSelect(item)}
              >
                <span>{item.name}</span>
                {selected && <Check size={13} />}
              </button>
              {!item.builtIn && (
                <button
                  type="button"
                  className="haven-medication-delete"
                  aria-label={`Xóa ${item.name} khỏi danh sách`}
                  onClick={() => onDelete(item)}
                >
                  <Trash2 size={12} />
                </button>
              )}
            </span>
          );
        })}
      </div>

      {selectedItem && (
        <div className="haven-medication-selected-info">
          <span>{selectedItem.detail}</span>
          {selectedItem.infoUrl && (
            <a href={selectedItem.infoUrl} target="_blank" rel="noopener noreferrer">
              Xem thêm <ExternalLink size={12} />
            </a>
          )}
        </div>
      )}

      {adding && (
        <div className="haven-medication-create">
          <label>
            <span>Tên loại mới</span>
            <input
              autoFocus
              value={newName}
              onChange={(event) => {
                setNewName(event.target.value);
                setAddError(null);
              }}
              onKeyDown={(event) => {
                if (event.key !== 'Enter') return;
                event.preventDefault();
                createMedication();
              }}
              placeholder="Ví dụ: Sắt, men vi sinh..."
            />
          </label>
          <label>
            <span>Link tham khảo <small>(không bắt buộc)</small></span>
            <input
              type="url"
              value={newInfoUrl}
              onChange={(event) => {
                setNewInfoUrl(event.target.value);
                setAddError(null);
              }}
              placeholder="https://..."
            />
          </label>
          <div className="haven-medication-create-actions">
            <button type="button" onClick={() => {
              setAdding(false);
              setNewName('');
              setNewInfoUrl('');
              setAddError(null);
            }}>Hủy</button>
            <button type="button" className="is-primary" onClick={createMedication}>Thêm vào danh sách</button>
          </div>
          {addError && <p role="alert">{addError}</p>}
        </div>
      )}

      <div className="haven-medication-dose" role="group" aria-label="Liều đã dùng">
        <div className="haven-medication-dose-heading">
          <span>Liều đã dùng</span>
          <output aria-live="polite">
            {dose ? <strong>{dose}</strong> : <span>Chưa chọn</span>}
          </output>
          {dose && (
            <button type="button" aria-label="Xóa liều đã chọn" onClick={() => onDoseChange('')}>
              <X size={12} />
            </button>
          )}
        </div>

        {selectedItem ? (
          <>
            <div className="haven-medication-dose-row">
              <small>Đơn vị</small>
              <div className="haven-medication-dose-chips" role="group" aria-label="Đơn vị liều">
                {DOSE_UNITS.map((unit) => (
                  <button
                    key={unit.value}
                    type="button"
                    className={activeUnit === unit.value ? 'is-selected' : ''}
                    aria-pressed={activeUnit === unit.value}
                    onClick={() => selectDoseUnit(unit.value)}
                  >
                    {unit.label}
                  </button>
                ))}
              </div>
            </div>
            <div className="haven-medication-dose-row">
              <small>Lượng</small>
              <div className="haven-medication-dose-stepper" role="group" aria-label="Lượng đã dùng">
                <button
                  type="button"
                  aria-label="Giảm lượng"
                  disabled={numericDose <= 0}
                  onClick={() => adjustDoseAmount(-1)}
                >
                  −
                </button>
                <output aria-live="polite" aria-label="Lượng hiện tại">
                  {parsedDose?.amount ?? '0'}
                </output>
                <button type="button" aria-label="Tăng lượng" onClick={() => adjustDoseAmount(1)}>
                  +
                </button>
              </div>
            </div>
          </>
        ) : (
          <p>Chọn thuốc hoặc vitamin trước.</p>
        )}
        <small className="haven-medication-dose-note">
          Tap để ghi lượng đã dùng, không phải khuyến nghị liều. Luôn theo nhãn hoặc hướng dẫn bác sĩ.
        </small>
      </div>
    </div>
  );
}
