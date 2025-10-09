import React, { createContext, useContext, useState, useCallback } from "react";

export interface NotificationData {
  id: string;
  title: string;
  description?: string;
  type: "success" | "error" | "warning" | "info";
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
}

interface NotificationContextType {
  notifications: NotificationData[];
  addNotification: (notification: Omit<NotificationData, "id">) => void;
  removeNotification: (id: string) => void;
  success: (title: string, description?: string) => void;
  error: (title: string, description?: string) => void;
  warning: (title: string, description?: string) => void;
  info: (title: string, description?: string) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(
  undefined,
);

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [notifications, setNotifications] = useState<NotificationData[]>([]);

  const generateId = useCallback(() => {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }, []);

  const addNotification = useCallback(
    (notification: Omit<NotificationData, "id">) => {
      const id = generateId();
      const newNotification: NotificationData = {
        id,
        duration: 5000,
        ...notification,
      };

      setNotifications((prev) => [...prev, newNotification]);

      // Auto remove notification after duration
      if (newNotification.duration && newNotification.duration > 0) {
        setTimeout(() => {
          removeNotification(id);
        }, newNotification.duration);
      }
    },
    [generateId],
  );

  const removeNotification = useCallback((id: string) => {
    setNotifications((prev) =>
      prev.filter((notification) => notification.id !== id),
    );
  }, []);

  const success = useCallback(
    (title: string, description?: string) => {
      addNotification({ title, description, type: "success" });
    },
    [addNotification],
  );

  const error = useCallback(
    (title: string, description?: string) => {
      addNotification({ title, description, type: "error", duration: 7000 });
    },
    [addNotification],
  );

  const warning = useCallback(
    (title: string, description?: string) => {
      addNotification({ title, description, type: "warning", duration: 6000 });
    },
    [addNotification],
  );

  const info = useCallback(
    (title: string, description?: string) => {
      addNotification({ title, description, type: "info" });
    },
    [addNotification],
  );

  const value: NotificationContextType = {
    notifications,
    addNotification,
    removeNotification,
    success,
    error,
    warning,
    info,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error(
      "useNotification must be used within a NotificationProvider",
    );
  }
  return context;
};
