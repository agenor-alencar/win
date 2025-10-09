import React from "react";
import { useNotification } from "@/contexts/NotificationContext";
import {
  Toast,
  ToastClose,
  ToastDescription,
  ToastProvider,
  ToastTitle,
  ToastViewport,
  ToastAction,
} from "@/components/ui/toast";
import { CheckCircle, XCircle, AlertTriangle, Info } from "lucide-react";
import { cn } from "@/lib/utils";

const NotificationIcon = ({ type }: { type: string }) => {
  const iconClass = "h-5 w-5 flex-shrink-0";

  switch (type) {
    case "success":
      return <CheckCircle className={cn(iconClass, "text-green-500")} />;
    case "error":
      return <XCircle className={cn(iconClass, "text-red-500")} />;
    case "warning":
      return <AlertTriangle className={cn(iconClass, "text-orange-500")} />;
    case "info":
      return <Info className={cn(iconClass, "text-blue-500")} />;
    default:
      return null;
  }
};

const getToastVariant = (type: string) => {
  switch (type) {
    case "error":
      return "destructive";
    default:
      return "default";
  }
};

const getToastStyles = (type: string) => {
  switch (type) {
    case "success":
      return "border-green-200 bg-green-50 text-green-900 dark:border-green-800 dark:bg-green-950 dark:text-green-100";
    case "warning":
      return "border-orange-200 bg-orange-50 text-orange-900 dark:border-orange-800 dark:bg-orange-950 dark:text-orange-100";
    case "info":
      return "border-blue-200 bg-blue-50 text-blue-900 dark:border-blue-800 dark:bg-blue-950 dark:text-blue-100";
    default:
      return "";
  }
};

export function NotificationToaster() {
  const { notifications, removeNotification } = useNotification();

  return (
    <ToastProvider>
      {notifications.map((notification) => (
        <Toast
          key={notification.id}
          variant={getToastVariant(notification.type)}
          className={cn(getToastStyles(notification.type))}
          onOpenChange={(open) => {
            if (!open) {
              removeNotification(notification.id);
            }
          }}
        >
          <div className="flex items-start gap-3">
            <NotificationIcon type={notification.type} />
            <div className="grid gap-1 flex-1">
              <ToastTitle className="text-sm font-semibold">
                {notification.title}
              </ToastTitle>
              {notification.description && (
                <ToastDescription className="text-sm opacity-90">
                  {notification.description}
                </ToastDescription>
              )}
            </div>
          </div>
          {notification.action && (
            <ToastAction
              onClick={notification.action.onClick}
              altText={notification.action.label}
            >
              {notification.action.label}
            </ToastAction>
          )}
          <ToastClose />
        </Toast>
      ))}
      <ToastViewport />
    </ToastProvider>
  );
}
