import React, { useEffect, useState } from 'react';
import { Mail, Heart, X, ExternalLink, ArrowRight } from 'lucide-react';
import { PageView } from '../types/classifieds';

export interface AppNotification {
  id: string;
  type: 'message' | 'favorite';
  title: string;
  senderName: string;
  senderPhoto?: string;
  preview: string;
  timestamp: string;
  targetTab: 'messages' | 'favorites';
}

interface RealtimeNotificationToastProps {
  notifications: AppNotification[];
  onDismiss: (id: string) => void;
  onNavigate: (view: PageView) => void;
}

export const RealtimeNotificationToast: React.FC<RealtimeNotificationToastProps> = ({
  notifications,
  onDismiss,
  onNavigate
}) => {
  if (notifications.length === 0) return null;

  return (
    <div className="fixed top-3 sm:top-5 right-0 left-0 sm:left-auto sm:right-5 z-[9999] pointer-events-none flex flex-col items-center sm:items-end px-3 sm:px-0 space-y-2.5 max-w-md sm:w-96 mx-auto sm:mx-0">
      {notifications.map((notif) => (
        <ToastItem
          key={notif.id}
          notification={notif}
          onDismiss={onDismiss}
          onNavigate={onNavigate}
        />
      ))}
    </div>
  );
};

interface ToastItemProps {
  notification: AppNotification;
  onDismiss: (id: string) => void;
  onNavigate: (view: PageView) => void;
}

const ToastItem: React.FC<ToastItemProps> = ({ notification, onDismiss, onNavigate }) => {
  const [progress, setProgress] = useState(100);

  // Auto-dismiss after 7 seconds with smooth bar
  useEffect(() => {
    const duration = 7000;
    const interval = 50;
    const step = (interval / duration) * 100;

    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev <= step) {
          clearInterval(timer);
          onDismiss(notification.id);
          return 0;
        }
        return prev - step;
      });
    }, interval);

    return () => clearInterval(timer);
  }, [notification.id, onDismiss]);

  const handleClick = () => {
    onDismiss(notification.id);
    if (notification.type === 'message') {
      onNavigate({ type: 'chat' });
    } else {
      onNavigate({
        type: 'my-account',
        activeTab: notification.targetTab
      });
    }
  };

  const isMsg = notification.type === 'message';

  return (
    <div
      onClick={handleClick}
      className="pointer-events-auto w-full bg-white/98 backdrop-blur-md border border-gray-200 shadow-2xl rounded-sm p-3.5 sm:p-4 text-xs cursor-pointer transition-all hover:scale-[1.01] hover:border-gray-300 relative overflow-hidden group animate-in slide-in-from-top-3 sm:slide-in-from-right-4 duration-300"
      role="alert"
    >
      <div className="flex items-start gap-3">
        {/* User Photo & Icon Badge */}
        <div className="relative shrink-0">
          {notification.senderPhoto ? (
            <img
              src={notification.senderPhoto}
              alt={notification.senderName}
              className="w-10 h-10 sm:w-11 sm:h-11 rounded-full object-cover border-2 border-white shadow-md"
            />
          ) : (
            <div
              className={`w-10 h-10 sm:w-11 sm:h-11 rounded-full flex items-center justify-center font-bold text-sm shadow-xs ${
                isMsg
                  ? 'bg-sky-100 text-[#0098d9] border border-sky-300'
                  : 'bg-rose-100 text-rose-600 border border-rose-300'
              }`}
            >
              {notification.senderName.charAt(0).toUpperCase()}
            </div>
          )}
          <div
            className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center text-white text-[10px] shadow-xs border border-white ${
              isMsg ? 'bg-[#0098d9]' : 'bg-rose-600'
            }`}
          >
            {isMsg ? (
              <Mail className="w-2.5 h-2.5" />
            ) : (
              <Heart className="w-2.5 h-2.5 fill-white" />
            )}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0 pr-5">
          <div className="flex items-center justify-between gap-1 mb-0.5">
            <span
              className={`font-bold text-[11px] uppercase tracking-wider ${
                isMsg ? 'text-[#0098d9]' : 'text-rose-600'
              }`}
            >
              {notification.title}
            </span>
            <span className="text-[10px] text-gray-400 font-normal">
              {notification.timestamp}
            </span>
          </div>

          <p className="font-bold text-gray-900 text-xs sm:text-sm truncate">
            {notification.senderName}
          </p>

          <p className="text-gray-600 text-xs mt-0.5 line-clamp-2 leading-relaxed">
            {notification.preview}
          </p>

          <div className="mt-2 flex items-center gap-1 text-[11px] font-bold text-[#0098d9] group-hover:underline">
            <span>{isMsg ? 'Abrir conversa na Minha Conta' : 'Ver quem favoritou'}</span>
            <ArrowRight className="w-3 h-3 transition-transform group-hover:translate-x-0.5" />
          </div>
        </div>

        {/* Close Button */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onDismiss(notification.id);
          }}
          className="absolute top-2.5 right-2.5 p-1 text-gray-400 hover:text-gray-700 rounded-full hover:bg-gray-100 transition-colors"
          title="Fechar"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Progress Bar Timer */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-100">
        <div
          className={`h-full transition-all ease-linear ${
            isMsg ? 'bg-[#0098d9]' : 'bg-rose-500'
          }`}
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
};
