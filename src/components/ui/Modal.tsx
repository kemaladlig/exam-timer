import { useEffect, useRef } from 'react';
import { X } from 'lucide-react';
import { cn } from '../../utils';
import { Button } from './Button';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  className?: string;
  contentClassName?: string;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  bottomSheet?: boolean;
}

export function Modal({ 
  isOpen, 
  onClose, 
  title, 
  children, 
  className, 
  contentClassName,
  maxWidth = 'md',
  bottomSheet = true,
}: ModalProps) {
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) onClose();
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === overlayRef.current) onClose();
  };

  const maxWidthClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    '2xl': 'max-w-2xl',
  };

  return (
    <div
      ref={overlayRef}
      onClick={handleOverlayClick}
      className={cn(
        'fixed inset-0 z-50 flex justify-center bg-black/60 backdrop-blur-xs animate-modal-backdrop',
        bottomSheet 
          ? 'items-end sm:items-center p-0 sm:p-4' 
          : 'items-center p-4'
      )}
    >
      <div
        className={cn(
          'bg-white dark:bg-zinc-900 text-slate-900 dark:text-zinc-100 w-full shadow-2xl flex flex-col will-change-transform',
          bottomSheet
            ? 'rounded-t-3xl sm:rounded-2xl border-t sm:border border-slate-200 dark:border-zinc-800 max-h-[92dvh] sm:max-h-[90vh] animate-sheet-slide sm:animate-modal-content'
            : 'rounded-2xl border border-slate-200 dark:border-zinc-800 max-h-[90vh] animate-modal-content',
          maxWidthClasses[maxWidth],
          className
        )}
      >
        {/* Mobile drag handle */}
        {bottomSheet && (
          <div className="sm:hidden flex justify-center pt-2.5 pb-0.5 shrink-0">
            <div className="w-10 h-1.2 rounded-full bg-slate-300 dark:bg-zinc-700" />
          </div>
        )}

        {/* Modal Header */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-3 sm:py-4 border-b border-slate-200 dark:border-zinc-800 shrink-0">
          <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white truncate pr-2">{title}</h2>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={onClose} 
            aria-label="Close modal" 
            className="-mr-1.5 text-slate-400 hover:text-slate-700 dark:text-zinc-400 dark:hover:text-white h-8 w-8"
          >
            <X size={18} />
          </Button>
        </div>

        {/* Modal Body */}
        <div className={cn("p-4 sm:p-6 overflow-y-auto overscroll-contain flex-1", contentClassName)}>
          {children}
        </div>
      </div>
    </div>
  );
}
