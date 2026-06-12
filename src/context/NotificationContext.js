"use client";
import { useNotifications } from "@/hooks/useNotifications";
import { createContext, useContext } from "react";


const NotificationContext = createContext(null);

export function NotificationProvider({ children }) {
    const notificationData = useNotifications();
    return (
        <NotificationContext.Provider value={notificationData}>
            {children}
        </NotificationContext.Provider>
    );
}

export function useNotificationContext() {
    return useContext(NotificationContext);
}