'use client';

import { X, CheckCircle, AlertCircle, Info } from 'lucide-react';
import { useEffect } from 'react';

interface VoiceActionModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  message: string;
  type?: 'success' | 'error' | 'info' | 'warning';
  actions?: Array<{
    label: string;
    onClick: () => void;
    variant?: 'primary' | 'secondary' | 'danger';
  }>;
}

export default function VoiceActionModal({
  isOpen,
  onClose,
  title,
  message,
  type = 'info',
  actions = []
}: VoiceActionModalProps) {
  // Close on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const typeConfig = {
    success: {
      icon: CheckCircle,
      iconColor: 'text-green-600',
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200'
    },
    error: {
      icon: AlertCircle,
      iconColor: 'text-red-600',
      bgColor: 'bg-red-50',
      borderColor: 'border-red-200'
    },
    warning: {
      icon: AlertCircle,
      iconColor: 'text-amber-600',
      bgColor: 'bg-amber-50',
      borderColor: 'border-amber-200'
    },
    info: {
      icon: Info,
      iconColor: 'text-blue-600',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200'
    }
  };

  const config = typeConfig[type];
  const Icon = config.icon;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 z-50 animate-in fade-in duration-200"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
        <div
          className="bg-white rounded-xl shadow-2xl max-w-md w-full pointer-events-auto animate-in zoom-in-95 duration-200"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-start justify-between p-6 pb-4">
            <div className="flex items-start gap-3 flex-1">
              <div className={`${config.bgColor} ${config.borderColor} border rounded-lg p-2`}>
                <Icon className={`w-6 h-6 ${config.iconColor}`} />
              </div>
              <div className="flex-1">
                <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              aria-label="Close modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Content */}
          <div className="px-6 pb-6">
            <p className="text-sm text-gray-600 leading-relaxed">{message}</p>
          </div>

          {/* Actions */}
          {actions.length > 0 && (
            <div className="flex items-center gap-3 px-6 pb-6">
              {actions.map((action, idx) => {
                const variants = {
                  primary: 'bg-indigo-600 hover:bg-indigo-700 text-white',
                  secondary: 'bg-gray-100 hover:bg-gray-200 text-gray-900',
                  danger: 'bg-red-600 hover:bg-red-700 text-white'
                };

                return (
                  <button
                    key={idx}
                    onClick={() => {
                      action.onClick();
                      onClose();
                    }}
                    className={`flex-1 px-4 py-2.5 rounded-lg font-medium text-sm transition-colors ${
                      variants[action.variant || 'primary']
                    }`}
                  >
                    {action.label}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
