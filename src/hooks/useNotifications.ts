import { useState } from 'react';
import { useLocalStorage } from './useLocalStorage';
import { NotificationMessage } from '../types';

export const useNotifications = () => {
  const deserializeNotifications = (notifications: any[]): NotificationMessage[] => {
    return notifications.map(notification => ({
      ...notification,
      timestamp: new Date(notification.timestamp)
    }));
  };

  const [notifications, setNotifications] = useLocalStorage<NotificationMessage[]>(
    'notifications', 
    [], 
    deserializeNotifications
  );

  const addNotification = (notification: Omit<NotificationMessage, 'id' | 'timestamp' | 'read'>) => {
    const newNotification: NotificationMessage = {
      ...notification,
      id: Date.now().toString(),
      timestamp: new Date(),
      read: false
    };

    setNotifications(prev => [newNotification, ...prev].slice(0, 50)); // Keep only last 50 notifications

    // Browser notification if enabled
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(notification.title, {
        body: notification.message,
        icon: '/vite.svg'
      });
    }
  };

  const markAsRead = (id: string) => {
    setNotifications(prev => 
      prev.map(notification => 
        notification.id === id ? { ...notification, read: true } : notification
      )
    );
  };

  const clearAll = () => {
    setNotifications([]);
  };

  // Request notification permission on first use
  const requestNotificationPermission = () => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  };

  return {
    notifications,
    addNotification,
    markAsRead,
    clearAll,
    requestNotificationPermission
  };
};