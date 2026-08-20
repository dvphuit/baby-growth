import React from 'react';

export interface HavenIconProps {
  size?: number;
  className?: string;
  color?: string;
  secondaryColor?: string;
  style?: React.CSSProperties;
}

/**
 * 1. Feeding / Milk Bottle Icon
 * Organic baby bottle with gentle measurement ticks and soft nipple cap
 */
export const HavenFeedingIcon: React.FC<HavenIconProps> = ({
  size = 24,
  className = '',
  color = 'var(--color-sage-dark, #4b6637)',
  secondaryColor = 'var(--color-sage-light, #E5ECD9)',
  style,
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={`haven-icon haven-icon-feeding ${className}`}
    style={style}
    aria-hidden="true"
  >
    {/* Cap & Nipple */}
    <path
      d="M10 2C10 2 11 1 12 1C13 1 14 2 14 2V4H10V2Z"
      fill={color}
      opacity="0.85"
    />
    <rect x="8.5" y="4" width="7" height="2" rx="1" fill={color} />
    {/* Bottle Body */}
    <rect
      x="7"
      y="6"
      width="10"
      height="15"
      rx="3.5"
      fill={secondaryColor}
      stroke={color}
      strokeWidth="1.6"
    />
    {/* Measurement lines */}
    <line x1="9.5" y1="10" x2="12" y2="10" stroke={color} strokeWidth="1.4" strokeLinecap="round" />
    <line x1="9.5" y1="13" x2="13.5" y2="13" stroke={color} strokeWidth="1.4" strokeLinecap="round" />
    <line x1="9.5" y1="16" x2="11.5" y2="16" stroke={color} strokeWidth="1.4" strokeLinecap="round" />
    {/* Milk level curve */}
    <path
      d="M8.5 17C10 16.5 14 17.5 15.5 17V18C15.5 19.38 14.38 20.5 13 20.5H11C9.62 20.5 8.5 19.38 8.5 18V17Z"
      fill={color}
      opacity="0.2"
    />
  </svg>
);

/**
 * 2. Pumping / Breast Pump Icon
 * Soft maternal suction shield and milk collection bottle
 */
export const HavenPumpingIcon: React.FC<HavenIconProps> = ({
  size = 24,
  className = '',
  color = 'var(--color-mom-rose, #C86D7C)',
  secondaryColor = 'var(--color-mom-rose-light, #F9ECEE)',
  style,
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={`haven-icon haven-icon-pumping ${className}`}
    style={style}
    aria-hidden="true"
  >
    {/* Pump Shield / Funnel */}
    <path
      d="M3.5 6.5C5 8 7 8.5 8.5 8.5H10V5.5H8.5C7 5.5 5 6 3.5 6.5Z"
      fill={secondaryColor}
      stroke={color}
      strokeWidth="1.5"
    />
    {/* Connector top & tubing */}
    <path
      d="M10 5H13C14.5 5 15.5 6 15.5 7.5V9H10V5Z"
      fill={color}
      opacity="0.8"
    />
    {/* Collection Bottle */}
    <rect
      x="8"
      y="9"
      width="8"
      height="12"
      rx="3"
      fill={secondaryColor}
      stroke={color}
      strokeWidth="1.6"
    />
    {/* Milk Drop Accent */}
    <path
      d="M12 12C12 12 10.5 14 10.5 15C10.5 15.83 11.17 16.5 12 16.5C12.83 16.5 13.5 15.83 13.5 15C13.5 14 12 12 12 12Z"
      fill={color}
    />
  </svg>
);

/**
 * 3. Sleep Icon
 * Gentle crescent moon with a sleeping organic star
 */
export const HavenSleepIcon: React.FC<HavenIconProps> = ({
  size = 24,
  className = '',
  color = 'var(--color-depressed, #9477ED)',
  secondaryColor = 'var(--color-depressed-bg, #F3EFFD)',
  style,
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={`haven-icon haven-icon-sleep ${className}`}
    style={style}
    aria-hidden="true"
  >
    {/* Soft Aura Ring */}
    <circle cx="12" cy="12" r="10" fill={secondaryColor} opacity="0.6" />
    {/* Crescent Moon */}
    <path
      d="M16.5 14.5C16.5 18.09 13.59 21 10 21C6.41 21 3.5 18.09 3.5 14.5C3.5 11.23 5.91 8.52 9.04 8.06C8.85 8.78 8.75 9.53 8.75 10.31C8.75 14.34 12.02 17.61 16.05 17.61C16.2 17.61 16.35 17.6 16.5 17.59V14.5Z"
      fill={color}
    />
    {/* Little Star Accent */}
    <path
      d="M17 5L17.8 7.2L20 8L17.8 8.8L17 11L16.2 8.8L14 8L16.2 7.2L17 5Z"
      fill={color}
      opacity="0.9"
    />
  </svg>
);

/**
 * 4. Diaper / Hygiene Icon
 * Rounded baby diaper with soft fastener tabs
 */
export const HavenDiaperIcon: React.FC<HavenIconProps> = ({
  size = 24,
  className = '',
  color = 'var(--color-happy, #F5B842)',
  secondaryColor = 'var(--color-happy-bg, #FEF7E9)',
  style,
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={`haven-icon haven-icon-diaper ${className}`}
    style={style}
    aria-hidden="true"
  >
    {/* Main Diaper Body */}
    <path
      d="M4 6.5C4 6.5 5.5 5 7 5H17C18.5 5 20 6.5 20 6.5L19 12C19 16.42 15.42 20 11 20H13C8.58 20 5 16.42 5 12L4 6.5Z"
      fill={secondaryColor}
      stroke={color}
      strokeWidth="1.6"
      strokeLinejoin="round"
    />
    {/* Elastic Leg Cutouts */}
    <path
      d="M5 12C6.8 12.8 8 14.6 8 16.8"
      stroke={color}
      strokeWidth="1.4"
      strokeLinecap="round"
    />
    <path
      d="M19 12C17.2 12.8 16 14.6 16 16.8"
      stroke={color}
      strokeWidth="1.4"
      strokeLinecap="round"
    />
    {/* Fastener Tabs */}
    <rect x="5" y="7" width="3" height="2" rx="1" fill={color} />
    <rect x="16" y="7" width="3" height="2" rx="1" fill={color} />
  </svg>
);

/**
 * 5. Growth Scale Icon
 * Modern rounded baby weight scale with digital readout
 */
export const HavenScaleIcon: React.FC<HavenIconProps> = ({
  size = 24,
  className = '',
  color = 'var(--color-sage-dark, #4b6637)',
  secondaryColor = 'var(--color-sage-light, #E5ECD9)',
  style,
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={`haven-icon haven-icon-scale ${className}`}
    style={style}
    aria-hidden="true"
  >
    {/* Curved Baby Tray Top */}
    <path
      d="M2.5 8C4.5 10 7.5 11 12 11C16.5 11 19.5 10 21.5 8"
      stroke={color}
      strokeWidth="1.8"
      strokeLinecap="round"
    />
    {/* Base Stand */}
    <rect
      x="5"
      y="11"
      width="14"
      height="9"
      rx="3"
      fill={secondaryColor}
      stroke={color}
      strokeWidth="1.6"
    />
    {/* Digital Display Window */}
    <rect x="8.5" y="13.5" width="7" height="3.5" rx="1" fill="#FFFFFF" stroke={color} strokeWidth="1" />
    <line x1="10.5" y1="15.2" x2="13.5" y2="15.2" stroke={color} strokeWidth="1.2" strokeLinecap="round" />
  </svg>
);

/**
 * 6. Height Ruler Icon
 * Vertical growth chart with measurement markings
 */
export const HavenRulerIcon: React.FC<HavenIconProps> = ({
  size = 24,
  className = '',
  color = 'var(--color-overjoyed, #7EAF50)',
  secondaryColor = 'var(--color-overjoyed-bg, #EEF7E6)',
  style,
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={`haven-icon haven-icon-ruler ${className}`}
    style={style}
    aria-hidden="true"
  >
    {/* Ruler Strip */}
    <rect
      x="7"
      y="2.5"
      width="10"
      height="19"
      rx="2.5"
      fill={secondaryColor}
      stroke={color}
      strokeWidth="1.6"
    />
    {/* Tick Marks */}
    <line x1="7" y1="5.5" x2="12" y2="5.5" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
    <line x1="7" y1="8.5" x2="10" y2="8.5" stroke={color} strokeWidth="1.2" strokeLinecap="round" />
    <line x1="7" y1="11.5" x2="13" y2="11.5" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
    <line x1="7" y1="14.5" x2="10" y2="14.5" stroke={color} strokeWidth="1.2" strokeLinecap="round" />
    <line x1="7" y1="17.5" x2="12" y2="17.5" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
  </svg>
);

/**
 * 7. Head Circumference Icon
 * Flexible measuring tape around cranial curve
 */
export const HavenHeadCircIcon: React.FC<HavenIconProps> = ({
  size = 24,
  className = '',
  color = 'var(--color-neutral, #83583E)',
  secondaryColor = 'var(--color-neutral-bg, #F5EEE9)',
  style,
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={`haven-icon haven-icon-head ${className}`}
    style={style}
    aria-hidden="true"
  >
    {/* Head Outline Silhouette */}
    <circle cx="12" cy="11.5" r="7.5" fill={secondaryColor} stroke={color} strokeWidth="1.6" />
    {/* Measuring Tape Band */}
    <path
      d="M4.5 12.5C4.5 12.5 8 15 12 15C16 15 19.5 12.5 19.5 12.5"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
    />
    <circle cx="12" cy="15" r="1.5" fill={color} />
  </svg>
);

/**
 * 8. Medicine / Vitamins Icon
 * Gentle dropper with nutrient drop
 */
export const HavenMedicineIcon: React.FC<HavenIconProps> = ({
  size = 24,
  className = '',
  color = '#5B8DEF',
  secondaryColor = '#EDF3FD',
  style,
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={`haven-icon haven-icon-medicine ${className}`}
    style={style}
    aria-hidden="true"
  >
    {/* Dropper bulb */}
    <path
      d="M17.5 4L20 6.5C20.6 7.1 20.6 8 20 8.6L18.5 10.1L13.9 5.5L15.4 4C16 3.4 16.9 3.4 17.5 4Z"
      fill={color}
    />
    {/* Dropper stem */}
    <path
      d="M13.9 5.5L6.5 12.9C6.2 13.2 6 13.6 6 14V17H9C9.4 17 9.8 16.8 10.1 16.5L17.5 9.1L13.9 5.5Z"
      fill={secondaryColor}
      stroke={color}
      strokeWidth="1.5"
    />
    {/* Tip & Drop */}
    <path d="M6 17L3.5 19.5" stroke={color} strokeWidth="1.6" strokeLinecap="round" />
    <circle cx="3.5" cy="20.5" r="1" fill={color} />
  </svg>
);

/**
 * 9. Temperature / Health Icon
 * Thermometer with warm status level
 */
export const HavenTemperatureIcon: React.FC<HavenIconProps> = ({
  size = 24,
  className = '',
  color = 'var(--color-sad, #E97332)',
  secondaryColor = 'var(--color-sad-bg, #FDF0E9)',
  style,
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={`haven-icon haven-icon-temperature ${className}`}
    style={style}
    aria-hidden="true"
  >
    <rect x="9.5" y="3" width="5" height="12" rx="2.5" fill={secondaryColor} stroke={color} strokeWidth="1.5" />
    <circle cx="12" cy="17" r="4" fill={secondaryColor} stroke={color} strokeWidth="1.5" />
    {/* Mercury Fill */}
    <circle cx="12" cy="17" r="2.2" fill={color} />
    <line x1="12" y1="8" x2="12" y2="15" stroke={color} strokeWidth="2" strokeLinecap="round" />
  </svg>
);

/**
 * 10. Wallet / Family Expense Icon
 * Warm clay leather purse with leaf emblem
 */
export const HavenWalletIcon: React.FC<HavenIconProps> = ({
  size = 24,
  className = '',
  color = 'var(--color-neutral, #83583E)',
  secondaryColor = 'var(--color-neutral-bg, #F5EEE9)',
  style,
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={`haven-icon haven-icon-wallet ${className}`}
    style={style}
    aria-hidden="true"
  >
    <rect x="3" y="5.5" width="18" height="14" rx="3.5" fill={secondaryColor} stroke={color} strokeWidth="1.6" />
    <path d="M3 9.5H21" stroke={color} strokeWidth="1.4" />
    <rect x="14" y="11" width="5.5" height="4" rx="1.5" fill={color} />
    <circle cx="16.5" cy="13" r="0.8" fill="#FFFFFF" />
  </svg>
);

/**
 * 11. AI Haven Sparkle Icon
 * Organic 4-point glowing star
 */
export const HavenSparkleIcon: React.FC<HavenIconProps> = ({
  size = 24,
  className = '',
  color = 'var(--color-sage-dark, #4b6637)',
  style,
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={`haven-icon haven-icon-sparkle ${className}`}
    style={style}
    aria-hidden="true"
  >
    <path
      d="M12 2C12 7.52 7.52 12 2 12C7.52 12 12 16.48 12 22C12 16.48 16.48 12 22 12C16.48 12 12 7.52 12 2Z"
      fill={color}
    />
    <circle cx="18" cy="6" r="1.5" fill={color} opacity="0.6" />
    <circle cx="6" cy="18" r="1" fill={color} opacity="0.5" />
  </svg>
);

/**
 * Haven Icon Badge Container
 * Wraps any Haven icon in a super-ellipse with soft aura background
 */
export interface HavenIconBadgeProps {
  icon: React.ReactNode;
  tone?: 'sage' | 'rose' | 'amber' | 'lavender' | 'clay' | 'blue' | 'meadow';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  style?: React.CSSProperties;
}

export const HavenIconBadge: React.FC<HavenIconBadgeProps> = ({
  icon,
  tone = 'sage',
  size = 'md',
  className = '',
  style,
}) => {
  const toneClass = `haven-badge-${tone}`;
  const sizeClass = `haven-badge-${size}`;

  return (
    <div className={`haven-icon-badge ${toneClass} ${sizeClass} ${className}`} style={style}>
      {icon}
    </div>
  );
};
