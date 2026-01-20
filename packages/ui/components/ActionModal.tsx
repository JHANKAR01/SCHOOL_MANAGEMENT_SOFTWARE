import React from 'react';
import { X } from 'lucide-react';
import { SovereignButton } from './SovereignComponents';

interface ActionModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  onConfirm?: () => void;
  confirmLabel?: string;
}

export const ActionModal: React.FC<ActionModalProps> = ({ 
  isOpen, 
  onClose, 
  title, 
  children, 
  footer,
  onConfirm,
  confirmLabel = 'Confirm'
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Modal Panel */}
      <div className="relative w-full max-w-lg bg-white rounded-xl shadow-2xl transform transition-all flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-100">
          <h3 className="text-lg font-bold text-gray-900">{title}</h3>
          <button 
            onClick={onClose}
            className="p-1 rounded-full hover:bg-gray-100 text-gray-500 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto">
          {children}
        </div>

        {/* Footer */}
        {(footer || onConfirm) && (
          <div className="p-4 bg-gray-50 border-t border-gray-100 rounded-b-xl flex justify-end gap-3">
            {footer ? footer : (
              <>
                <SovereignButton variant="ghost" onClick={onClose}>Cancel</SovereignButton>
                <SovereignButton onClick={onConfirm}>{confirmLabel}</SovereignButton>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
};