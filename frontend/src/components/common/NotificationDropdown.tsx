import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Bell,
  CheckCheck,
  Trash2,
  Pill,
  Calendar,
  AlertTriangle,
  Utensils,
  Info,
  ExternalLink,
  PlusCircle,
} from 'lucide-react';
import { UserNotification } from '../../types';
import {
  fetchNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  removeNotification,
} from '../../services/healthApi';
import { apiRequest } from '../../services/apiClient';

export const NotificationDropdown: React.FC = () => {
  const [notifications, setNotifications] = useState<UserNotification[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [filter, setFilter] = useState<'ALL' | 'UNREAD'>('ALL');
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  const loadNotifs = async () => {
    try {
      const data = await fetchNotifications();
      setNotifications(data);
    } catch (err) {
      console.warn('Failed to load notifications:', err);
    }
  };

  useEffect(() => {
    loadNotifs();
    const interval = setInterval(loadNotifs, 15000); // Polling every 15s
    return () => clearInterval(interval);
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const handleMarkAsRead = async (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    try {
      await markNotificationAsRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id || n._id === id ? { ...n, read: true } : n))
      );
    } catch (err) {
      console.error(err);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await markAllNotificationsAsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await removeNotification(id);
      setNotifications((prev) => prev.filter((n) => n.id !== id && n._id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  const handleNotificationClick = (item: UserNotification) => {
    handleMarkAsRead(item.id || item._id || '');
    setIsOpen(false);
    if (item.actionUrl) {
      navigate(item.actionUrl);
    }
  };

  const handleCreateTestAlert = async () => {
    try {
      await apiRequest('/notifications', {
        method: 'POST',
        body: JSON.stringify({
          title: 'Tablet Reminder: Atorvastatin 20mg',
          message: 'Scheduled evening dose due in 15 minutes. Take with water after dinner.',
          type: 'MEDICATION',
          priority: 'HIGH',
          actionUrl: '/medications',
        }),
      });
      await loadNotifs();
    } catch (err) {
      console.error(err);
    }
  };

  const filteredNotifs =
    filter === 'UNREAD' ? notifications.filter((n) => !n.read) : notifications;

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'MEDICATION':
        return <Pill className="w-4 h-4 text-teal-600" />;
      case 'APPOINTMENT':
        return <Calendar className="w-4 h-4 text-indigo-600" />;
      case 'EMERGENCY':
        return <AlertTriangle className="w-4 h-4 text-red-600" />;
      case 'DIET':
        return <Utensils className="w-4 h-4 text-amber-600" />;
      default:
        return <Info className="w-4 h-4 text-blue-600" />;
    }
  };

  const getTypeBadgeClass = (type: string) => {
    switch (type) {
      case 'MEDICATION':
        return 'bg-teal-50 text-teal-700 border-teal-200';
      case 'APPOINTMENT':
        return 'bg-indigo-50 text-indigo-700 border-indigo-200';
      case 'EMERGENCY':
        return 'bg-red-50 text-red-700 border-red-200';
      case 'DIET':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      default:
        return 'bg-blue-50 text-blue-700 border-blue-200';
    }
  };

  const formatRelativeTime = (dateStr: string) => {
    try {
      const diffMs = Date.now() - new Date(dateStr).getTime();
      const diffMins = Math.floor(diffMs / (1000 * 60));
      if (diffMins < 1) return 'Just now';
      if (diffMins < 60) return `${diffMins}m ago`;
      const diffHours = Math.floor(diffMins / 60);
      if (diffHours < 24) return `${diffHours}h ago`;
      const diffDays = Math.floor(diffHours / 24);
      return `${diffDays}d ago`;
    } catch {
      return 'Recently';
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 text-slate-600 hover:text-slate-900 rounded-full hover:bg-slate-100 transition-colors relative"
        title="Notifications"
        id="notifications-button"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-rose-500 text-white text-[11px] font-bold rounded-full flex items-center justify-center animate-pulse shadow-sm">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-96 max-w-[90vw] bg-white rounded-xl shadow-2xl border border-slate-200 z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
          {/* Header */}
          <div className="p-4 bg-slate-900 text-white flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Bell className="w-4 h-4 text-teal-400" />
              <h3 className="font-semibold text-sm">Notifications</h3>
              {unreadCount > 0 && (
                <span className="text-[10px] bg-rose-500/90 text-white font-bold px-2 py-0.5 rounded-full">
                  {unreadCount} new
                </span>
              )}
            </div>
            <div className="flex items-center gap-2">
              {unreadCount > 0 && (
                <button
                  onClick={handleMarkAllRead}
                  className="text-xs text-teal-300 hover:text-white flex items-center gap-1 transition-colors"
                  title="Mark all as read"
                >
                  <CheckCheck className="w-3.5 h-3.5" />
                  <span>Mark all</span>
                </button>
              )}
            </div>
          </div>

          {/* Filter Bar */}
          <div className="px-4 py-2 bg-slate-50 border-b border-slate-200 flex items-center justify-between text-xs">
            <div className="flex gap-1.5">
              <button
                onClick={() => setFilter('ALL')}
                className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
                  filter === 'ALL'
                    ? 'bg-slate-800 text-white'
                    : 'text-slate-600 hover:bg-slate-200'
                }`}
              >
                All ({notifications.length})
              </button>
              <button
                onClick={() => setFilter('UNREAD')}
                className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
                  filter === 'UNREAD'
                    ? 'bg-slate-800 text-white'
                    : 'text-slate-600 hover:bg-slate-200'
                }`}
              >
                Unread ({unreadCount})
              </button>
            </div>

            <button
              onClick={handleCreateTestAlert}
              className="text-teal-700 hover:text-teal-900 font-medium flex items-center gap-1"
              title="Simulate incoming reminder"
            >
              <PlusCircle className="w-3 h-3" />
              <span>Simulate Alert</span>
            </button>
          </div>

          {/* Notifications List */}
          <div className="max-h-96 overflow-y-auto divide-y divide-slate-100">
            {filteredNotifs.length === 0 ? (
              <div className="py-10 text-center text-slate-400 px-4">
                <Bell className="w-8 h-8 mx-auto mb-2 opacity-40" />
                <p className="text-sm font-medium text-slate-600">No notifications found</p>
                <p className="text-xs text-slate-400 mt-0.5">
                  You are completely caught up on your health alerts!
                </p>
              </div>
            ) : (
              filteredNotifs.map((item) => (
                <div
                  key={item.id || item._id}
                  onClick={() => handleNotificationClick(item)}
                  className={`p-3.5 flex gap-3 cursor-pointer hover:bg-slate-50 transition-colors relative group ${
                    !item.read ? 'bg-teal-50/40' : 'bg-white'
                  }`}
                >
                  {/* Unread indicator */}
                  {!item.read && (
                    <span className="w-2 h-2 rounded-full bg-teal-500 absolute top-4 left-2" />
                  )}

                  {/* Icon */}
                  <div
                    className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 border ml-1 ${getTypeBadgeClass(
                      item.type
                    )}`}
                  >
                    {getTypeIcon(item.type)}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0 pr-6">
                    <div className="flex items-center justify-between gap-1 mb-0.5">
                      <p
                        className={`text-xs font-semibold truncate ${
                          !item.read ? 'text-slate-900' : 'text-slate-700'
                        }`}
                      >
                        {item.title}
                      </p>
                      <span className="text-[10px] text-slate-400 shrink-0">
                        {formatRelativeTime(item.createdAt)}
                      </span>
                    </div>

                    <p className="text-[11px] text-slate-600 leading-snug line-clamp-2">
                      {item.message}
                    </p>

                    {item.actionUrl && (
                      <span className="inline-flex items-center gap-1 text-[10px] font-medium text-teal-700 hover:text-teal-900 mt-1">
                        View details <ExternalLink className="w-2.5 h-2.5" />
                      </span>
                    )}
                  </div>

                  {/* Delete button */}
                  <button
                    onClick={(e) => handleDelete(item.id || item._id || '', e)}
                    className="opacity-0 group-hover:opacity-100 transition-opacity p-1 text-slate-400 hover:text-red-500 rounded"
                    title="Delete notification"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          <div className="p-2.5 bg-slate-50 border-t border-slate-200 text-center">
            <span className="text-[11px] text-slate-500">
              Synced with MyHealthIO Copilot alerts
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
