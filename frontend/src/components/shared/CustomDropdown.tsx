import { useState, useRef } from 'react';
import { Check, ChevronDown } from 'lucide-react';
import { useClickOutside } from '../../hooks/useClickOutside';
import { useEscapeKey } from '../../hooks/useEscapeKey';

interface CustomDropdownProps {
  value: string;
  onChange: (val: string) => void;
  options: string[];
  placeholder?: string;
  prefix?: string;
}

export function CustomDropdown({ value, onChange, options, placeholder, prefix }: CustomDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useClickOutside(dropdownRef, () => setIsOpen(false));
  useEscapeKey(isOpen, () => setIsOpen(false));

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        className={`min-h-11 md:min-h-9 h-11 md:h-9 px-4 md:px-5 bg-paper-white dark:bg-[#1A1A1A] border ${isOpen ? 'border-fuenzer-teal' : 'border-cloud-canvas dark:border-stone-gray'} rounded-full text-xs font-medium text-stone-gray dark:text-silver-mist outline-none cursor-pointer hover:border-fuenzer-teal/50 transition-colors shadow-sm focus:ring-1 focus:ring-fuenzer-teal flex items-center gap-2 justify-between min-w-[120px]`}
      >
        <span>
          {prefix ? `${prefix}: ` : ''}
          {value || placeholder}
        </span>
        <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${isOpen ? 'rotate-180 text-fuenzer-teal' : ''}`} aria-hidden="true" />
      </button>

      {isOpen && (
        <div
          role="listbox"
          className="absolute z-50 top-full mt-2 w-full min-w-[140px] bg-paper-white dark:bg-[#1A1A1A] border border-cloud-canvas dark:border-stone-gray rounded-xl shadow-xl overflow-hidden animate-in fade-in"
        >
          <div className="py-1">
            {options.map((option) => (
              <button
                key={option}
                type="button"
                role="option"
                aria-selected={value === option}
                onClick={() => {
                  onChange(option);
                  setIsOpen(false);
                }}
                className={`w-full min-h-10 text-left px-4 py-2 text-xs font-medium transition-colors flex items-center justify-between ${
                  value === option
                    ? 'bg-fuenzer-teal/10 text-fuenzer-teal dark:text-fuenzer-teal'
                    : 'text-stone-gray dark:text-silver-mist hover:bg-cloud-canvas/50 dark:hover:bg-stone-gray/50'
                }`}
              >
                {option}
                {value === option && <Check className="w-3.5 h-3.5" aria-hidden="true" />}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
