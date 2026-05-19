import React, { useState, useEffect } from 'react';
import { getCurrentUser, type DemoUser } from '@/lib/auth';

const NOTIFICATIONS_KEY = 'demo_notifications';

export interface Notification {
  id: string;
  type: 'follow' | 'comment' | 'favorite' | 'rating' | 'like' | 'system';
  title: string;
  message: string;
  link?: string;
  read: boolean;
  createdAt: string;
}

const translations = {
  zh: {
    title: '通知',
    markAllRead: '全部标为已读',
    noNotifications: '暂无通知',
    clearAll: '清空所有',
    follow: '关注了你',
    comment: '评论了你的内容',
    favorite: '收藏了你的内容',
    rating: '评价了你的内容',
    like: '点赞了你的内容',
    system: '系统通知',
  },
  en: {
    title: 'Notifications',
    markAllRead: 'Mark all as read',
    noNotifications: 'No notifications',
    clearAll: 'Clear all',
    follow: 'followed you',
    comment: 'commented on your content',
    favorite: 'favorited your content',
    rating: 'rated your content',
    like: 'liked your content',
    system: 'System',
  },
};

function getStoredNotifications(): Notification[] {
  if (typeof window === 'undefined') return [];
  const stored = localStorage.getItem(NOTIFICATIONS_KEY);
  return stored ? JSON.parse(stored) : [];
}

function saveNotifications(notifications: Notification[]): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(notifications));
}

export function addNotification(notification: Omit<Notification, 'id' | 'read' | 'createdAt'>): void {
  const notifications = getStoredNotifications();
  const newNotification: Notification = {
    ...notification,
    id: 'notif-' + Date.now(),
    read: false,
    createdAt: new Date().toISOString(),
  };
  notifications.unshift(newNotification);
  // Keep only last 50 notifications
  if (notifications.length > 50) {
    notifications.pop();
  }
  saveNotifications(notifications);
}

export function markAsRead(notificationId: string): void {
  const notifications = getStoredNotifications();
  const notification = notifications.find(n => n.id === notificationId);
  if (notification) {
    notification.read = true;
    saveNotifications(notifications);
  }
}

export function markAllAsRead(): void {
  const notifications = getStoredNotifications();
  notifications.forEach(n => { n.read = true; });
  saveNotifications(notifications);
}

export function clearAllNotifications(): void {
  saveNotifications([]);
}

export function getUnreadCount(): number {
  const notifications = getStoredNotifications();
  return notifications.filter(n => !n.read).length;
}

// Initialize demo notifications for new users
export function initDemoNotifications(userId: string): void {
  const existing = getStoredNotifications();
  // Check if user already has notifications
  const userHasNotifications = existing.some(n => n.message.includes('欢迎') || existing.length > 0);
  if (userHasNotifications) return;

  // Add welcome notification
  const welcomeNotification: Notification = {
    id: 'notif-welcome-' + Date.now(),
    type: 'system',
    title: '欢迎使用',
    message: '欢迎来到MI TO AI留学生存指南！这里有最全的AI工具推荐、支付解决方案和大学政策指南。',
    link: '/',
    read: false,
    createdAt: new Date().toISOString(),
  };

  // Add tips notification
  const tipsNotification: Notification = {
    id: 'notif-tips-' + Date.now(),
    type: 'system',
    title: '使用提示',
    message: '🔥 快捷键：按 "/" 打开搜索，按 "G" 快速导航到AI工具库',
    link: '/tools',
    read: false,
    createdAt: new Date(Date.now() - 3600000).toISOString(), // 1 hour ago
  };

  // Add favorite notification (simulated)
  const favoriteNotification: Notification = {
    id: 'notif-fav-' + Date.now(),
    type: 'favorite',
    title: '收藏提示',
    message: '💡 你还没有收藏任何内容，快去AI工具库看看吧！',
    link: '/tools',
    read: false,
    createdAt: new Date(Date.now() - 7200000).toISOString(), // 2 hours ago
  };

  const newNotifications = [welcomeNotification, tipsNotification, favoriteNotification];
  saveNotifications([...newNotifications, ...existing]);
}

interface NotificationCenterProps {
  locale?: 'zh' | 'en';
}

export default function NotificationCenter({ locale = 'zh' }: NotificationCenterProps) {
  const [user, setUser] = useState<DemoUser | null>(null);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const t = translations[locale];

  useEffect(() => {
    const currentUser = getCurrentUser();
    setUser(currentUser);

    // Initialize demo notifications for new users
    if (currentUser) {
      initDemoNotifications(currentUser.id);
    }

    // Load notifications
    const stored = getStoredNotifications();
    setNotifications(stored);
    setUnreadCount(stored.filter(n => !n.read).length);

    // Poll for new notifications every 30 seconds
    const interval = setInterval(() => {
      const fresh = getStoredNotifications();
      setNotifications(fresh);
      setUnreadCount(fresh.filter(n => !n.read).length);
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  const handleOpen = () => {
    setIsOpen(!isOpen);
  };

  const handleMarkAllRead = () => {
    markAllAsRead();
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    setUnreadCount(0);
  };

  const handleClearAll = () => {
    clearAllNotifications();
    setNotifications([]);
    setUnreadCount(0);
  };

  const handleNotificationClick = (notification: Notification) => {
    if (!notification.read) {
      markAsRead(notification.id);
      setNotifications(prev =>
        prev.map(n => n.id === notification.id ? { ...n, read: true } : n)
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    }
    if (notification.link) {
      window.location.href = notification.link;
    }
    setIsOpen(false);
  };

  const getNotificationIcon = (type: Notification['type']) => {
    switch (type) {
      case 'follow':
        return (
          <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
          </svg>
        );
      case 'comment':
        return (
          <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
          </svg>
        );
      case 'favorite':
        return (
          <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
        );
      case 'rating':
        return (
          <svg className="w-5 h-5 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        );
      case 'like':
        return (
          <svg className="w-5 h-5 text-pink-500" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
          </svg>
        );
      default:
        return (
          <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return locale === 'zh' ? '刚刚' : 'Just now';
    if (minutes < 60) return `${minutes}${locale === 'zh' ? '分钟前' : 'm ago'}`;
    if (hours < 24) return `${hours}${locale === 'zh' ? '小时前' : 'h ago'}`;
    if (days < 7) return `${days}${locale === 'zh' ? '天前' : 'd ago'}`;
    return date.toLocaleDateString(locale === 'zh' ? 'zh-CN' : 'en-US');
  };

  if (!user) return null;

  return (
    <div className="relative">
      {/* Bell Button */}
      <button
        onClick={handleOpen}
        className="relative p-2 text-gray-600 hover:text-gray-900 transition-colors"
        aria-label={t.title}
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />

          {/* Panel */}
          <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-lg border border-gray-200 z-50 overflow-hidden">
            {/* Header */}
            <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
              <h3 className="font-semibold text-gray-900">{t.title}</h3>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleMarkAllRead}
                  className="text-xs text-primary-600 hover:text-primary-700"
                >
                  {t.markAllRead}
                </button>
                <button
                  onClick={handleClearAll}
                  className="text-xs text-gray-500 hover:text-gray-700"
                >
                  {t.clearAll}
                </button>
              </div>
            </div>

            {/* Notifications List */}
            <div className="max-h-96 overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="py-12 text-center text-gray-500">
                  <svg className="w-12 h-12 mx-auto mb-3 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                  </svg>
                  <p>{t.noNotifications}</p>
                </div>
              ) : (
                notifications.map((notification) => (
                  <button
                    key={notification.id}
                    onClick={() => handleNotificationClick(notification)}
                    className={`w-full px-4 py-3 flex items-start gap-3 hover:bg-gray-50 transition-colors text-left ${
                      !notification.read ? 'bg-primary-50' : ''
                    }`}
                  >
                    <div className="flex-shrink-0 mt-0.5">
                      {getNotificationIcon(notification.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm ${!notification.read ? 'font-medium text-gray-900' : 'text-gray-700'}`}>
                        {notification.message}
                      </p>
                      <p className="text-xs text-gray-500 mt-0.5">
                        {formatTime(notification.createdAt)}
                      </p>
                    </div>
                    {!notification.read && (
                      <div className="flex-shrink-0 w-2 h-2 bg-primary-500 rounded-full mt-2" />
                    )}
                  </button>
                ))
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
