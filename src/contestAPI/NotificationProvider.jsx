import React, { createContext, useContext, useState, useCallback } from 'react';
import Notification from './Notification';

const NotificationContext = createContext();

export const useNotification = () => {
    const context = useContext(NotificationContext);
    if (!context) {
        throw new Error('useNotification must be used within NotificationProvider');
    }
    return context;
};

export const NotificationProvider = ({ children }) => {
    const [notification, setNotification] = useState(null);
    const [queue, setQueue] = useState([]);

    const showNotification = useCallback((message, type = "success", duration = 3000) => {
        const id = Date.now();
        const newNotification = { id, message, type, duration };

        if (notification) {
            // If a notification is already showing, add to queue
            setQueue(prev => [...prev, newNotification]);
        } else {
            // Show immediately
            setNotification(newNotification);
        }

        return id; // Return ID for potential manual removal
    }, [notification]);

    const hideNotification = useCallback(() => {
        setNotification(null);

        // If there are notifications in queue, show the next one
        setTimeout(() => {
            setQueue(prev => {
                if (prev.length > 0) {
                    const [next, ...rest] = prev;
                    setNotification(next);
                    return rest;
                }
                return prev;
            });
        }, 300); // Wait for exit animation
    }, []);

    const success = useCallback((message, duration = 3000) => {
        return showNotification(message, "success", duration);
    }, [showNotification]);

    const error = useCallback((message, duration = 3000) => {
        return showNotification(message, "error", duration);
    }, [showNotification]);

    const warning = useCallback((message, duration = 3000) => {
        return showNotification(message, "warning", duration);
    }, [showNotification]);

    const info = useCallback((message, duration = 3000) => {
        return showNotification(message, "info", duration);
    }, [showNotification]);

    return (
        <NotificationContext.Provider value={{
            showNotification,
            hideNotification,
            success,
            error,
            warning,
            info
        }}>
            {children}

            {notification && (
                <Notification
                    key={notification.id}
                    message={notification.message}
                    type={notification.type}
                    duration={notification.duration}
                    onClose={hideNotification}
                    position="top-right"
                />
            )}
        </NotificationContext.Provider>
    );
};