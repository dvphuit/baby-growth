const REDUCED_MOTION_QUERY = '(prefers-reduced-motion: reduce)';

export function prefersReducedMotion(): boolean {
  return typeof window !== 'undefined'
    && typeof window.matchMedia === 'function'
    && window.matchMedia(REDUCED_MOTION_QUERY).matches;
}

function commitFinalFrame(element: HTMLElement, frame: Keyframe | undefined): void {
  if (!frame) return;
  if (typeof frame.transform === 'string') element.style.transform = frame.transform;
  if (frame.opacity !== undefined) element.style.opacity = String(frame.opacity);
}

export async function animateElement(
  element: HTMLElement | null,
  keyframes: Keyframe[],
  options: KeyframeAnimationOptions,
): Promise<void> {
  if (!element || keyframes.length === 0) return;
  const finalFrame = keyframes.at(-1);

  if (prefersReducedMotion() || typeof element.animate !== 'function') {
    commitFinalFrame(element, finalFrame);
    return;
  }

  element.getAnimations?.().forEach((animation) => animation.cancel());
  const animation = element.animate(keyframes, options);
  try {
    await animation.finished;
  } catch {
    return;
  }
  commitFinalFrame(element, finalFrame);
  animation.cancel();
}

export function cancelElementAnimations(element: HTMLElement | null): void {
  element?.getAnimations?.().forEach((animation) => animation.cancel());
}
