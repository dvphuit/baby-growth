import React from 'react';
import {
  Gamepad2,
  GraduationCap,
  Heart,
  HeartPulse,
  Layers,
  Milk,
  Package,
  Shirt,
  Wallet,
  Sparkles,
} from 'lucide-react';
import { getExpenseCategory } from '@/data/expenseCategories';

interface ExpenseCategoryIconProps {
  category: string;
  size?: number;
  className?: string;
  style?: React.CSSProperties;
}

export const ExpenseCategoryIcon: React.FC<ExpenseCategoryIconProps> = ({
  category,
  size = 18,
  className = '',
  style,
}) => {
  const cat = getExpenseCategory(category);

  const renderIcon = () => {
    switch (cat.iconName) {
      case 'Milk':
        return <Milk size={size} />;
      case 'Layers':
        return <Layers size={size} />;
      case 'HeartPulse':
        return <HeartPulse size={size} />;
      case 'Shirt':
        return <Shirt size={size} />;
      case 'Gamepad2':
        return <Gamepad2 size={size} />;
      case 'Package':
        return <Package size={size} />;
      case 'GraduationCap':
        return <GraduationCap size={size} />;
      case 'Heart':
        return <Heart size={size} />;
      case 'Wallet':
        return <Wallet size={size} />;
      default:
        return <Sparkles size={size} />;
    }
  };

  return (
    <span
      className={`expense-cat-icon tone-${cat.tone} ${className}`}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: cat.color,
        ...style,
      }}
      aria-hidden="true"
    >
      {renderIcon()}
    </span>
  );
};
