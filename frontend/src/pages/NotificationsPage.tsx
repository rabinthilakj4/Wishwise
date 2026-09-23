import React, { useEffect, useState } from 'react';
import { Bell, CheckCheck, Target, AlertTriangle, Clock } from 'lucide-react';
import { cartService } from '../services/cartService';
import { Notification } from '../types';

export const NotificationsPage: React.FC = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchNotifs = async () => {
    setIsLoading(true);
    try {
      const res: any = await cartService.getNotifications();
      setNotifications(res.data.notifications || []);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifs();
  }, []);

  const handleMarkAllRead = async () => {
    await cartService.markAllNotificationsRead();
    fetchNotifs();
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-black text-gray-900 tracking-tight flex items-center gap-2">
          <Bell className="w-6 h-6 text-purple-600" /> Notifications Center
        </h1>
        <button
          onClick={handleMarkAllRead}
          className="flex items-center gap-1 text-xs font-bold text-purple-700 bg-purple-50 hover:bg-purple-100 px-3.5 py-1.5 rounded-full border border-purple-200"
        >
          <CheckCheck className="w-4 h-4" /> Mark All as Read
        </button>
      </div>

      {isLoading ? (
        <p className="text-xs text-gray-500">Loading notifications...</p>
      ) : notifications.length === 0 ? (
        <div className="bg-white p-8 rounded-3xl border border-gray-100 text-center text-xs text-gray-500">
          No notifications found.
        </div>
      ) : (
        <div className="space-y-3">
          {notifications.map((n) => (
            <div
              key={n.id}
              className={`bg-white p-4 rounded-2xl border transition shadow-sm ${
                n.read ? 'border-gray-100 opacity-75' : 'border-purple-200 bg-purple-50/30'
              }`}
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h4 className="font-bold text-xs text-gray-900">{n.title}</h4>
                  <p className="text-xs text-gray-600 mt-0.5">{n.message}</p>
                  <span className="text-[10px] text-gray-400 mt-2 block">{new Date(n.createdAt).toLocaleString()}</span>
                </div>
                {!n.read && (
                  <span className="w-2 h-2 rounded-full bg-purple-600 flex-shrink-0 mt-1"></span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
