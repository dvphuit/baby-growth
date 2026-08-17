import { useEffect, useRef, useState } from 'react';
import { Loader2 } from 'lucide-react';
import './PullToRefresh.css';

const THRESHOLD = 64;
const MAX_PULL = 96;
const RESISTANCE = 0.5;

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
  const contentRef = useRef<HTMLDivElement>(null);
  const startY = useRef(0);
  const pulling = useRef(false);
  const distance = useRef(0);
  const [pull, setPull] = useState(0);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    const root = rootRef.current;
    const content = contentRef.current;
    if (!root || !content) return;

    const onTouchStart = (e: TouchEvent) => {
      if (refreshing || e.touches.length !== 1) return;
      if (window.scrollY > 0) return;
      const scroller = getNearestScrollable(e.target, root);
      if (scroller && scroller.scrollTop > 0) return;
      startY.current = e.touches[0].clientY;
      pulling.current = true;
      distance.current = 0;
    };

    const onTouchMove = (e: TouchEvent) => {
      if (!pulling.current || refreshing || e.touches.length !== 1) return;
      if (window.scrollY > 0) {
        pulling.current = false;
        setPull(0);
        return;
      }
      const dy = e.touches[0].clientY - startY.current;
      if (dy <= 0) {
        pulling.current = false;
        setPull(0);
        return;
      }
      e.preventDefault();
      const d = Math.min(dy * RESISTANCE, MAX_PULL);
      distance.current = d;
      setPull(d);
    };

    const finish = () => {
      if (!pulling.current) return;
      pulling.current = false;
      if (distance.current >= THRESHOLD) {
        setRefreshing(true);
        setPull(THRESHOLD);
        onRefresh();
      } else {
        setPull(0);
      }
    };

    const onTouchEnd = () => finish();
    const onTouchCancel = () => {
      pulling.current = false;
      setPull(0);
    };

    root.addEventListener('touchstart', onTouchStart, { passive: true });
    root.addEventListener('touchmove', onTouchMove, { passive: false });
    root.addEventListener('touchend', onTouchEnd, { passive: true });
    root.addEventListener('touchcancel', onTouchCancel, { passive: true });

    return () => {
      root.removeEventListener('touchstart', onTouchStart);
      root.removeEventListener('touchmove', onTouchMove);
      root.removeEventListener('touchend', onTouchEnd);
      root.removeEventListener('touchcancel', onTouchCancel);
    };
  }, [onRefresh, refreshing]);

  const progress = Math.min(pull / THRESHOLD, 1);

  return (
    <div className="ptr-root" ref={rootRef}>
      <div
        className="ptr-indicator"
        style={{ height: MAX_PULL, opacity: pull > 0 || refreshing ? 1 : 0 }}
        aria-hidden="true"
      >
        <Loader2
          className={`ptr-spinner${refreshing ? ' ptr-spinner--active' : ''}`}
          style={{
            transform: `rotate(${progress * 270}deg)`,
            opacity: refreshing ? 1 : progress,
          }}
          size={26}
          strokeWidth={2.5}
        />
      </div>
      <div
        className="ptr-content"
        ref={contentRef}
        style={{
          transform: `translateY(${pull}px)`,
          transition: pulling.current ? 'none' : 'transform 0.25s ease',
        }}
      >
        {children}
      </div>
    </div>
  );
};

export default PullToRefresh;
