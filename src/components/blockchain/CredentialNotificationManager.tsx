import React from 'react';
import { useCredentialNotifications } from '../../hooks/useCredentialNotifications';
import { CredentialAchievementNotification } from './CredentialAchievementNotification';

export const CredentialNotificationManager: React.FC = () => {
    const { notifications, dismissNotification } = useCredentialNotifications();

    // Show only the most recent notification
    const currentNotification = notifications[notifications.length - 1];

    if (!currentNotification) {
        return null;
    }

    return (
        <CredentialAchievementNotification
            credential={currentNotification.credential}
            onClose={() => dismissNotification(currentNotification.credential._id)}
        />
    );
};
