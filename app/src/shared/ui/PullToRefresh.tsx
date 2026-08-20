import { useEffect, useRef, useState } from 'react';
import { Loader2 } from 'lucide-react';
import { animate, motion, useMotionValue, useTransform } from 'motion/react';
import { havenSnappySpring, havenSoftSpring } from '@/shared/motion/motionPresets';
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
  const startY = useRef(0);
  const pulling = useRef(false);
  const distance = useRef(0);
  const [refreshing, setRefreshing] = useState(false);
  const pullY = useMotionValue(0);
  const indicatorOpacity = useTransform(pullY, [0, 12, THRESHOLD], [0, 0.45, 1]);
  const pullRotation = useTransform(pullY, [0, THRESHOLD], [0, 270]);
  const pullScale = useTransform(pullY, [0, THRESHOLD], [0.82, 1]);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const reset = () => {
      distance.current = 0;
      void animate(pullY, 0, havenSoftSpring);
    };

    const onTouchStart = (event: TouchEvent) => {
      if (refreshing || event.touches.length !== 1) return;
      if (window.scrollY > 0) return;
      const scroller = getNearestScrollable(event.target, root);
      if (scroller && scroller.scrollTop > 0) return;
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

      event.preventDefault();
      const nextDistance = Math.min(dy * RESISTANCE, MAX_PULL);
      distance.current = nextDistance;
      pullY.set(nextDistance);
    };

    const finish = () => {
      if (!pulling.current) return;
      pulling.current = false;
      if (distance.current >= THRESHOLD) {
        setRefreshing(true);
        void animate(pullY, THRESHOLD, havenSnappySpring);
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
    root.addEventListener('touchmove', onTouchMove, { passive: false });
    root.addEventListener('touchend', onTouchEnd, { passive: true });
    root.addEventListener('touchcancel', onTouchCancel, { passive: true });

    return () => {
      root.removeEventListener('touchstart', onTouchStart);
      root.removeEventListener('touchmove', onTouchMove);
      root.removeEventListener('touchend', onTouchEnd);
      root.removeEventListener('touchcancel', onTouchCancel);
    };
  }, [onRefresh, pullY, refreshing]);

  return (
    <div className="ptr-root" ref={rootRef}>
      <motion.div
        className="ptr-indicator"
        style={{ height: MAX_PULL, opacity: refreshing ? 1 : indicatorOpacity }}
        aria-hidden="true"
      >
        <motion.div
          animate={refreshing ? { rotate: 360 } : { rotate: 0 }}
          transition={refreshing ? { duration: 0.8, repeat: Infinity, ease: 'linear' } : havenSnappySpring}
        >
          <motion.div style={{ rotate: pullRotation, scale: pullScale }}>
            <Loader2 className="ptr-spinner" size={26} strokeWidth={2.5} />
          </motion.div>
        </motion.div>
      </motion.div>
      <motion.div className="ptr-content" style={{ y: pullY }}>
        {children}
      </motion.div>
    </div>
  );
};

export default PullToRefresh;
