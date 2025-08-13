import { useEffect } from 'react';
import { CheckCircle, XCircle, AlertCircle, Info } from 'lucide-react';
import { cn } from '@/lib/utils';

interface NotificationProps {
  message: string;
  type?: 'success' | 'error' | 'warning' | 'info';
  onClose: () => void;
  duration?: number;
}

const iconMap = {
  success: CheckCircle,
  error: XCircle,
  warning: AlertCircle,
  info: Info,
};

const colorMap = {
  success: 'bg-success text-white',
  error: 'bg-destructive text-white',
  warning: 'bg-accent text-accent-foreground',
  info: 'bg-primary text-primary-foreground',
};

export function Notification({ message, type = 'info', onClose, duration = 3000 }: NotificationProps) {
  const Icon = iconMap[type];

  useEffect(() => {
    const timer = setTimeout(onClose, duration);
    return () => clearTimeout(timer);
  }, [onClose, duration]);

  return (
    <div className={cn(
      'fixed top-4 right-4 z-50 px-6 py-3 rounded-lg shadow-lg flex items-center space-x-2 transition-all duration-300 transform',
      colorMap[type]
    )}>
      <Icon className="w-5 h-5" />
      <span className="font-medium">{message}</span>
    </div>
  );
}
