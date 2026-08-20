import type { Transition, Variants } from 'motion/react';

/** Lightweight defaults: prefer compositor-friendly transforms and opacity. */
export const havenSpring: Transition = {
  type: 'spring',
  stiffness: 360,
  damping: 38,
  mass: 0.82,
};

export const havenSoftSpring: Transition = {
  type: 'spring',
  stiffness: 260,
  damping: 34,
  mass: 0.95,
};

export const havenSnappySpring: Transition = {
  type: 'spring',
  stiffness: 440,
  damping: 42,
  mass: 0.72,
};

export const havenLayoutTransition: Transition = {
  type: 'tween',
  duration: 0.16,
  ease: [0.2, 0.75, 0.3, 1],
};

export const havenRouteVariants: Variants = {
  initial: { opacity: 0, y: 4 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -2 },
};

export const havenRouteTransition: Transition = {
  duration: 0.14,
  ease: [0.2, 0.75, 0.3, 1],
};

export const havenOverlayVariants: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, pointerEvents: 'auto' },
  exit: { opacity: 0, pointerEvents: 'none' },
};

export const havenOverlayTransition: Transition = {
  duration: 0.16,
  ease: [0.2, 0.75, 0.3, 1],
};

export const havenSheetVariants: Variants = {
  hidden: { y: '100%' },
  visible: { y: 0 },
  exit: { y: '100%' },
};

export const havenSheetTransition: Transition = {
  type: 'tween',
  duration: 0.18,
  ease: [0.2, 0.75, 0.3, 1],
};

export const havenDialogVariants: Variants = {
  hidden: { opacity: 0, y: 12, scale: 0.98 },
  visible: { opacity: 1, y: 0, scale: 1 },
  exit: { opacity: 0, y: 8, scale: 0.99 },
};

export const havenDialogTransition: Transition = {
  type: 'spring',
  stiffness: 400,
  damping: 40,
  mass: 0.8,
};

export const havenPopupVariants: Variants = {
  hidden: (placement: 'above' | 'below') => ({
    opacity: 0,
    y: placement === 'above' ? 4 : -4,
    scale: 0.99,
  }),
  visible: { opacity: 1, y: 0, scale: 1 },
  exit: (placement: 'above' | 'below') => ({
    opacity: 0,
    y: placement === 'above' ? 2 : -2,
    scale: 0.995,
  }),
};

export const havenPopupTransition: Transition = {
  duration: 0.14,
  ease: [0.2, 0.75, 0.3, 1],
};

export const havenPickerVariants: Variants = {
  hidden: { opacity: 0, y: 6, scale: 0.985 },
  visible: { opacity: 1, y: 0, scale: 1 },
  exit: { opacity: 0, y: 4, scale: 0.99 },
};

export const havenPickerTransition: Transition = {
  type: 'spring',
  stiffness: 400,
  damping: 40,
  mass: 0.8,
};

export const havenToastVariants: Variants = {
  hidden: { opacity: 0, y: -10, scale: 0.98 },
  visible: { opacity: 1, y: 0, scale: 1 },
  exit: { opacity: 0, y: -6, scale: 0.99 },
};

export const havenPress = { scale: 0.97 } as const;
export const havenPressStrong = { scale: 0.94 } as const;
export const havenHoverLift = { y: -1 } as const;
