import type { Transition, Variants } from 'motion/react';

export const havenSpring: Transition = {
  type: 'spring',
  stiffness: 420,
  damping: 34,
  mass: 0.76,
};

export const havenSoftSpring: Transition = {
  type: 'spring',
  stiffness: 300,
  damping: 30,
  mass: 0.9,
};

export const havenSnappySpring: Transition = {
  type: 'spring',
  stiffness: 520,
  damping: 36,
  mass: 0.68,
};

export const havenLayoutTransition: Transition = {
  ...havenSpring,
  layout: {
    type: 'spring',
    stiffness: 420,
    damping: 34,
    mass: 0.76,
  },
};

export const havenRouteVariants: Variants = {
  initial: { opacity: 0, y: 10, scale: 0.992, filter: 'blur(3px)' },
  animate: { opacity: 1, y: 0, scale: 1, filter: 'blur(0px)' },
  exit: { opacity: 0, y: -6, scale: 0.996, filter: 'blur(2px)' },
};

export const havenRouteTransition: Transition = {
  duration: 0.24,
  ease: [0.2, 0.75, 0.3, 1],
};

export const havenOverlayVariants: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
  exit: { opacity: 0 },
};

export const havenOverlayTransition: Transition = {
  duration: 0.2,
  ease: [0.2, 0.75, 0.3, 1],
};

export const havenSheetVariants: Variants = {
  hidden: { y: '100%', scale: 0.985 },
  visible: { y: 0, scale: 1 },
  exit: { y: '100%', scale: 0.992 },
};

export const havenDialogVariants: Variants = {
  hidden: { opacity: 0, y: 18, scale: 0.965 },
  visible: { opacity: 1, y: 0, scale: 1 },
  exit: { opacity: 0, y: 10, scale: 0.982 },
};

export const havenDialogTransition: Transition = {
  type: 'spring',
  stiffness: 480,
  damping: 38,
  mass: 0.72,
  layout: {
    type: 'spring',
    stiffness: 430,
    damping: 38,
    mass: 0.78,
  },
};

export const havenToastVariants: Variants = {
  hidden: { opacity: 0, y: -14, scale: 0.96, filter: 'blur(4px)' },
  visible: { opacity: 1, y: 0, scale: 1, filter: 'blur(0px)' },
  exit: { opacity: 0, y: -8, scale: 0.98, filter: 'blur(2px)' },
};

export const havenPress = { scale: 0.96 } as const;
export const havenPressStrong = { scale: 0.92 } as const;
export const havenHoverLift = { y: -2 } as const;
