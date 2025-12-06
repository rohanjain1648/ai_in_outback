import { useEffect, useState } from 'react';
import { BlockchainCredential } from '../types/blockchain';
import { socketService } from '../services/socketService';

interface CredentialNotification {
    credential: BlockchainCredential;
    timestamp: Date;
}

export const useCredentialNotifications = () => {
    const [notifications, setNotifications] = useState<CredentialNotification[]>([]);

    useEffect(() => {
        // Listen for credential achievement events from socket
        const handleCredentialAchieved = (data: { credential: BlockchainCredential }) => {
            setNotifications((prev) => [
                ...prev,
                {
                    credential: data.credential,
                    timestamp: new Date(),
                },
            ]);
        };

        socketService.on('credential_achieved', handleCredentialAchieved);

        return () => {
            socketService.off('credential_achieved', handleCredentialAchieved);
        };
    }, []);

    const dismissNotification = (credentialId: string) => {
        setNotifications((prev) =>
            prev.filter((notif) => notif.credential._id !== credentialId)
        );
    };

    const clearAll = () => {
        setNotifications([]);
    };

    return {
        notifications,
        dismissNotification,
        clearAll,
    };
};
