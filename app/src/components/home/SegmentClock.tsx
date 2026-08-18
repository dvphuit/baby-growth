import { memo } from 'react';

type SegmentDefinition = {
  x: number;
  y: number;
  width: number;
  height: number;
  direction: 'horizontal' | 'vertical';
};

const SEGMENTS: Record<string, SegmentDefinition> = {
  a: { x: 8, y: 4, width: 40, height: 7, direction: 'horizontal' },
  b: { x: 48, y: 8, width: 7, height: 38, direction: 'vertical' },
  c: { x: 48, y: 53, width: 7, height: 38, direction: 'vertical' },
  d: { x: 8, y: 89, width: 40, height: 7, direction: 'horizontal' },
  e: { x: 3, y: 53, width: 7, height: 38, direction: 'vertical' },
  f: { x: 3, y: 8, width: 7, height: 38, direction: 'vertical' },
  g: { x: 8, y: 47, width: 40, height: 7, direction: 'horizontal' },
};

const SEGMENT_ORDER = ['a', 'b', 'c', 'd', 'e', 'f', 'g'] as const;

const DIGIT_MAP: Record<string, string[]> = {
  '0': ['a', 'b', 'c', 'd', 'e', 'f'],
  '1': ['b', 'c'],
  '2': ['a', 'b', 'g', 'e', 'd'],
  '3': ['a', 'b', 'g', 'c', 'd'],
  '4': ['f', 'g', 'b', 'c'],
  '5': ['a', 'f', 'g', 'c', 'd'],
  '6': ['a', 'f', 'g', 'e', 'c', 'd'],
  '7': ['a', 'b', 'c'],
  '8': ['a', 'b', 'c', 'd', 'e', 'f', 'g'],
  '9': ['a', 'b', 'c', 'd', 'f', 'g'],
};

const DIGIT_WIDTH = 58;
const COLON_WIDTH = 18;

function segmentPoints({ x, y, width, height, direction }: SegmentDefinition): string {
  if (direction === 'horizontal') {
    const bevel = height / 2;
    return `${x + bevel},${y} ${x + width - bevel},${y} ${x + width},${y + bevel} ${x + width - bevel},${y + height} ${x + bevel},${y + height} ${x},${y + bevel}`;
  }

  const bevel = width / 2;
  return `${x + bevel},${y} ${x + width},${y + bevel} ${x + width},${y + height - bevel} ${x + bevel},${y + height} ${x},${y + height - bevel} ${x},${y + bevel}`;
}

function Digit({ x, value }: { x: number; value: string }) {
  const on = new Set(DIGIT_MAP[value] ?? []);
  return (
    <g transform={`translate(${x}, 0)`}>
      {SEGMENT_ORDER.map((seg) => {
        return (
          <polygon
            key={seg}
            points={segmentPoints(SEGMENTS[seg])}
            className={on.has(seg) ? 'seg-on' : 'seg-off'}
          />
        );
      })}
    </g>
  );
}

function Colon({ x }: { x: number }) {
  return (
    <g transform={`translate(${x}, 0)`}>
      <circle cx={9} cy={35} r={3} className="seg-on" />
      <circle cx={9} cy={65} r={3} className="seg-on" />
    </g>
  );
}

export const SegmentClock = memo(function SegmentClock({ time }: { time: string }) {
  let cursor = 0;
  const cells: React.ReactNode[] = [];
  for (const ch of time) {
    if (ch >= '0' && ch <= '9') {
      cells.push(<Digit key={`d-${cursor}`} x={cursor} value={ch} />);
      cursor += DIGIT_WIDTH;
    } else if (ch === ':') {
      cells.push(<Colon key={`c-${cursor}`} x={cursor} />);
      cursor += COLON_WIDTH;
    }
  }

  return (
    <svg
      className="haven-seg-svg"
      viewBox={`0 0 ${cursor} 100`}
      role="img"
      aria-label={time}
      preserveAspectRatio="xMinYMid meet"
    >
      {cells}
    </svg>
  );
});
