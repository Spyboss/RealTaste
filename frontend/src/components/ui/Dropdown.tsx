import React, { useState, useRef, useEffect } from 'react';
import { cn } from '@/utils/cn';

interface DropdownProps {
  trigger: React.ReactNode;
  children: React.ReactNode;
  align?: 'left' | 'right';
  className?: string;
}

const Dropdown: React.FC<DropdownProps> = ({ 
  trigger, 
  children, 
  align = 'right',
  className 
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <div onClick={toggleDropdown} className="cursor-pointer">
        {trigger}
      </div>
      
      {isOpen && (
        <div 
          className={cn(
            'absolute top-full mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50',
            align === 'left' ? 'left-0' : 'right-0',
            className
          )}
        >
          {children}
        </div>
      )}
    </div>
  );
};

interface DropdownItemProps {
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
  icon?: React.ReactNode;
}

const DropdownItem: React.FC<DropdownItemProps> = ({ 
  children, 
  onClick, 
  className,
  icon 
}) => {
  return (
    <button
      onClick={onClick}
      className={cn(
        'w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center space-x-2 transition-colors',
        className
      )}
    >
      {icon && <span className="flex-shrink-0">{icon}</span>}
      <span>{children}</span>
    </button>
  );
};

const DropdownSeparator: React.FC = () => {
  return <div className="border-t border-gray-200 my-1" />;
};

export { Dropdown, DropdownItem, DropdownSeparator };
export default Dropdown;