import { useState, useRef } from 'react';
import { useClickOutside } from '../../hooks/useClickOutside';

interface DropdownProps {
  trigger: React.ReactNode;
  children: React.ReactNode;
  align?: 'right' | 'left';
}

export function Dropdown({ trigger, children, align = 'right' }: DropdownProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useClickOutside(ref, () => setOpen(false));

  return (
    <div className="relative font-sans" ref={ref}>
      <div onClick={() => setOpen((o) => !o)}>{trigger}</div>
      {open && (
        <div
          className={`absolute top-full mt-1 z-30 bg-paper-white dark:bg-ink-black border border-cloud-canvas dark:border-stone-gray shadow-xl rounded-xl py-1 min-w-[160px] animate-in fade-in zoom-in-95 duration-150 ${
            align === 'right' ? 'right-0' : 'left-0'
          }`}
          onClick={() => setOpen(false)}
        >
          {children}
        </div>
      )}
    </div>
  );
}

interface DropdownItemProps {
  label: string;
  active?: boolean;
  onClick: () => void;
}

export function DropdownItem({ label, active, onClick }: DropdownItemProps) {
  return (
    <button
      onClick={onClick}
      className={`w-full text-left px-4 py-2 text-sm transition-colors cursor-pointer ${
        active
          ? 'font-bold text-fuenzer-teal bg-fuenzer-teal/10'
          : 'text-ink-black dark:text-cloud-canvas hover:bg-cloud-canvas/60 dark:hover:bg-stone-gray/30'
      }`}
    >
      {label}
    </button>
  );
}
