
import React from 'react';
import { motion } from 'motion/react';
import { cn } from '../lib/utils';

export interface FilterChip {
  id: string;
  label: string;
  icon?: React.ReactNode;
}

interface FilterChipsProps {
  chips: FilterChip[];
  selectedChip: string | null;
  onSelectChip: (chipId: string) => void;
  className?: string;
}

const FilterChips: React.FC<FilterChipsProps> = ({
  chips,
  selectedChip,
  onSelectChip,
  className
}) => {
  return (
    <div className={cn("flex items-center gap-2 overflow-x-auto no-scrollbar py-2 px-4", className)}>
      {chips.map((chip) => (
        <motion.button
          key={chip.id}
          onClick={() => onSelectChip(chip.id)}
          whileTap={{ scale: 0.95 }}
          whileHover={{ scale: 1.02 }}
          className={cn(
            "flex items-center gap-1.5 px-4 py-2 rounded-full text-[11px] font-black uppercase tracking-widest whitespace-nowrap transition-all duration-300 border",
            "min-h-[40px]", // Touch target height
            selectedChip === chip.id
              ? "bg-pink-500 text-white border-pink-500 shadow-[0_0_15px_rgba(236,72,153,0.4)]"
              : "bg-gray-900/60 text-gray-400 border-gray-700 hover:text-white hover:border-gray-500"
          )}
          aria-pressed={selectedChip === chip.id}
        >
          {chip.icon && <span className="w-4 h-4">{chip.icon}</span>}
          {chip.label}
        </motion.button>
      ))}
    </div>
  );
};

export default FilterChips;
