import { useEffect, useRef, useState } from 'react';
import { Loader2 } from 'lucide-react';
import './PullToRefresh.css';

const THRESHOLD = 64;
const MAX_PULL = 96;
const RESISTANCE = 0.5;
const SETTLE_MS = 220;

interface PullToRefreshProps {
  onRefresh: () => void;
  children: React.ReactNode;
}

function getNearestScrollable(node: EventTarget | null, root: HTMLElement): HTMLElement | null {
  let el = node as HTMLElement | null;
  while (el && el !== root && el !== document.body) {
    const style = getComputedStyle(el);
    const overflowY = style.overflowY;
    if ((overflowY === 'auto' || overflowY === 'scroll' || overflowY === 'overlay') && el.scrollHeight > el.clientHeight) {
      return el;
    }
    el = el.parentElement;
  }
  return null;
}

export const PullToRefresh: React.FC<PullToRefreshProps> = ({ onRefresh, children }) => {
  const rootRef = useRef<HTMLDivElement>(null);
  const indicatorRef = useRef<HTMLDivElement>(null);
  const iconRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const settleTimerRef = useRef<number | null>(null);
  const startY = useRef(0);
  const pulling = useRef(false);
  const distance = useRef(0);
  const [refreshing, setRefreshing] = useState(false);

  const applyPullVisuals = (value: number) => {
    const clamped = Math.max(0, Math.min(value, MAX_PULL));
    distance.current = clamped;
    if (contentRef.current) contentRef.current.style.transform = `translate3d(0, ${clamped}px, 0)`;
    if (indicatorRef.current) {
      const opacity = clamped <= 12
        ? (clamped / 12) * 0.45
        : 0.45 + ((Math.min(clamped, THRESHOLD) - 12) / (THRESHOLD - 12)) * 0.55;
      indicatorRef.current.style.opacity = String(refreshing ? 1 : Math.max(0, Math.min(1, opacity)));
    }
    if (iconRef.current) {
      const progress = Math.min(1, clamped / THRESHOLD);
      const rotation = progress * 270;
      const scale = 0.82 + progress * 0.18;
      iconRef.current.style.transform = `rotate(${rotation}deg) scale(${scale})`;
    }
  };

  const settleTo = (target: number) => {
    const root = rootRef.current;
    if (!root) {
      applyPullVisuals(target);
      return;
    }
    if (settleTimerRef.current !== null) window.clearTimeout(settleTimerRef.current);
    root.classList.add('ptr-settling');
    requestAnimationFrame(() => applyPullVisuals(target));
    settleTimerRef.current = window.setTimeout(() => {
      root.classList.remove('ptr-settling');
      settleTimerRef.current = null;
    }, SETTLE_MS);
  };

  useEffect(() => () => {
    if (settleTimerRef.current !== null) window.clearTimeout(settleTimerRef.current);
  }, []);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const reset = () => settleTo(0);

    const onTouchStart = (event: TouchEvent) => {
      if (refreshing || event.touches.length !== 1) return;
      if (window.scrollY > 0) return;
      const scroller = getNearestScrollable(event.target, root);
      if (scroller && scroller.scrollTop > 0) return;
      root.classList.remove('ptr-settling');
      startY.current = event.touches[0].clientY;
      pulling.current = true;
      distance.current = 0;
    };

    const onTouchMove = (event: TouchEvent) => {
      if (!pulling.current || refreshing || event.touches.length !== 1) return;
      if (window.scrollY > 0) {
        pulling.current = false;
        reset();
        return;
      }

      const dy = event.touches[0].clientY - startY.current;
      if (dy <= 0) {
        pulling.current = false;
        reset();
        return;
      }

      applyPullVisuals(Math.min(dy * RESISTANCE, MAX_PULL));
    };

    const finish = () => {
      if (!pulling.current) return;
      pulling.current = false;
      if (distance.current >= THRESHOLD) {
        setRefreshing(true);
        settleTo(THRESHOLD);
        onRefresh();
      } else {
        reset();
      }
    };

    const onTouchEnd = () => finish();
    const onTouchCancel = () => {
      pulling.current = false;
      reset();
    };

    root.addEventListener('touchstart', onTouchStart, { passive: true });
    root.addEventListener('touchmove', onTouchMove, { passive: true });
    root.addEventListener('touchend', onTouchEnd, { passive: true });
    root.addEventListener('touchcancel', onTouchCancel, { passive: true });

    return () => {
      root.removeEventListener('touchstart', onTouchStart);
      root.removeEventListener('touchmove', onTouchMove);
      root.removeEventListener('touchend', onTouchEnd);
      root.removeEventListener('touchcancel', onTouchCancel);
    };
  }, [onRefresh, refreshing]);

  return (
    <div className={`ptr-root ${refreshing ? 'is-refreshing' : ''}`} ref={rootRef}>
      <div
        ref={indicatorRef}
        className="ptr-indicator"
        style={{ height: MAX_PULL, opacity: refreshing ? 1 : 0 }}
        aria-hidden="true"
      >
        <div className="ptr-spinner-wrap">
          <div ref={iconRef} className="ptr-pull-icon">
            <Loader2 className="ptr-spinner" size={26} strokeWidth={2.5} />
          </div>
        </div>
      </div>
      <div ref={contentRef} className="ptr-content">
        {children}
      </div>
    </div>
  );
};

export default PullToRefresh;
