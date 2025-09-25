import React from 'react';
import { Icon } from './Icon';

interface TypeBadgeProps {
  type: 'Obrigatória' | 'Normativa';
  isExpanded?: boolean;
}

export const TypeBadge: React.FC<TypeBadgeProps> = ({ type, isExpanded = false }) => {
  const isNormativa = type === 'Normativa';
  
  const iconName = isNormativa ? 'autorenew' : 'flag';
  const text = isNormativa ? 'Normativa' : 'Obrigatória';

  const baseOuterClasses = "group inline-flex items-center justify-center rounded-full bg-[#F8FFBC] dark:bg-[#4A4319] border border-[#FEC700] text-[#6B5E21] dark:text-[#F8FFBC] shadow-[0_1px_2px_0_rgba(0,0,0,0.3),_0_1px_3px_1px_rgba(0,0,0,0.15)] transition-all duration-300 ease-in-out h-6 flex-shrink-0";
  const expandedOuterClasses = "w-auto pl-[5px] pr-1";
  const collapsedOuterClasses = "w-6 hover:w-auto hover:pl-[5px] hover:pr-1 cursor-pointer";

  const baseInnerClasses = "overflow-hidden transition-all duration-300 ease-in-out";
  const expandedInnerClasses = "w-auto ml-1";
  const collapsedInnerClasses = "w-0 group-hover:w-auto group-hover:ml-1";

  return (
    <div 
      className={`${baseOuterClasses} ${isExpanded ? expandedOuterClasses : collapsedOuterClasses}`}
      title={text}
    >
      <Icon name={iconName} className="text-sm flex-shrink-0" />
      <div className={`${baseInnerClasses} ${isExpanded ? expandedInnerClasses : collapsedInnerClasses}`}>
        <span className="whitespace-nowrap text-xs font-bold uppercase tracking-wider">
          {text}
        </span>
      </div>
    </div>
  );
};