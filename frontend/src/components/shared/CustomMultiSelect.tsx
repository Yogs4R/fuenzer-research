import { useState, useRef } from 'react';
import { Check, ChevronDown } from 'lucide-react';
import { useClickOutside } from '../../hooks/useClickOutside';
import { useEscapeKey } from '../../hooks/useEscapeKey';

interface CustomMultiSelectProps {
  values: string[];
  onChange: (vals: string[]) => void;
  options: string[];
  placeholder?: string;
}

export function CustomMultiSelect({ values, onChange, options, placeholder }: CustomMultiSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useClickOutside(dropdownRef, () => setIsOpen(false));
  useEscapeKey(isOpen, () => setIsOpen(false));

  const toggleOption = (option: string) => {
    if (option === 'All') {
      onChange(['All']);
      return;
    }

    let newValues = values.filter((v) => v !== 'All');
    if (newValues.includes(option)) {
      newValues = newValues.filter((v) => v !== option);
    } else {
      newValues.push(option);
    }

    if (newValues.length === 0) {
      newValues = ['All'];
    }

    onChange(newValues);
  };

  const displayValue = values.includes('All')
    ? 'All'
    : values.length > 1
      ? `${values.length} Selected`
      : values[0];

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        className={`min-h-11 md:min-h-9 h-11 md:h-9 px-4 md:px-5 bg-paper-white dark:bg-[#1A1A1A] border ${isOpen ? 'border-fuenzer-teal' : 'border-cloud-canvas dark:border-stone-gray'} rounded-full text-xs font-medium text-stone-gray dark:text-silver-mist outline-none cursor-pointer hover:border-fuenzer-teal/50 transition-colors shadow-sm focus:ring-1 focus:ring-fuenzer-teal flex items-center gap-2 justify-between min-w-[120px]`}
      >
        <span>{displayValue || placeholder}</span>
        <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${isOpen ? 'rotate-180 text-fuenzer-teal' : ''}`} aria-hidden="true" />
      </button>

      {isOpen && (
        <div
          role="listbox"
          aria-multiselectable="true"
          className="absolute z-50 top-full mt-2 w-full min-w-[140px] bg-paper-white dark:bg-[#1A1A1A] border border-cloud-canvas dark:border-stone-gray rounded-xl shadow-xl overflow-hidden animate-in fade-in"
        >
          <div className="py-1">
            {options.map((option) => (
              <button
                key={option}
                type="button"
                role="option"
                aria-selected={values.includes(option)}
                onClick={() => toggleOption(option)}
                className={`w-full min-h-10 text-left px-4 py-2 text-xs font-medium transition-colors flex items-center justify-between hover:bg-cloud-canvas/50 dark:hover:bg-stone-gray/50 ${
                  values.includes(option) ? 'text-fuenzer-teal' : 'text-stone-gray dark:text-silver-mist'
                }`}
              >
                <div className="flex items-center gap-2">
                  <div
                    className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${
                      values.includes(option)
                        ? 'bg-fuenzer-teal border-fuenzer-teal text-white'
                        : 'border-slate-gray dark:border-stone-gray'
                    }`}
                  >
                    {values.includes(option) && <Check className="w-3 h-3" strokeWidth={3} aria-hidden="true" />}
                  </div>
                  {option}
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
