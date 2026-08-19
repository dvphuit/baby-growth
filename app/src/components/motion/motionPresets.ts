import type { Transition, Variants } from 'motion/react';

export const havenLayoutTransition: Transition = {
  type: 'spring',
  stiffness: 430,
  damping: 38,
  mass: 0.78,
  layout: {
    type: 'spring',
    stiffness: 430,
    damping: 38,
    mass: 0.78,
  },
};

export const havenRouteVariants: Variants = {
  initial: { opacity: 0, y: 8, scale: 0.995 },
  animate: { opacity: 1, y: 0, scale: 1 },
  exit: { opacity: 0, y: -5, scale: 0.998 },
};

export const havenRouteTransition: Transition = {
  duration: 0.2,
  ease: [0.2, 0.75, 0.3, 1],
};

export const havenDialogTransition: Transition = {
  type: 'spring',
  stiffness: 480,
  damping: 38,
  mass: 0.72,
};
