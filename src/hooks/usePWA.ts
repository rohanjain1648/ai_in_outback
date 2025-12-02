import { useState, useEffect } from 'react';

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

interface PWAState {
  isInstallable: boolean;
  isInstalled: boolean;
  isStandalone: boolean;
  canInstall: boolean;
  installPrompt: BeforeInstallPromptEvent | null;
}

export const usePWA = () => {
  const [pwaState, setPwaState] = useState<PWAState>({
    isInstallable: false,
    isInstalled: false,
    isStandalone: false,
    canInstall: false,
    installPrompt: null
  });

  useEffect(() => {
    // Check if app is running in standalone mode
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches ||
                        (window.navigator as any).standalone ||
                        document.referrer.includes('android-app://');

    // Check if app is already installed
    const isInstalled = isStandalone || 
                       localStorage.getItem('pwa-installed') === 'true';

    setPwaState(prev => ({
      ...prev,
      isStandalone,
      isInstalled
    }));

    // Listen for beforeinstallprompt event
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      const installEvent = e as BeforeInstallPromptEvent;
      
      setPwaState(prev => ({
        ...prev,
        isInstallable: true,
        canInstall: !prev.isInstalled,
        installPrompt: installEvent
      }));
    };

    // Listen for app installed event
    const handleAppInstalled = () => {
      console.log('PWA was installed');
      localStorage.setItem('pwa-installed', 'true');
      
      setPwaState(prev => ({
        ...prev,
        isInstalled: true,
        canInstall: false,
        installPrompt: null
      }));
    };

    // Add event listeners
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    // Check for iOS Safari installation prompt
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    const isInStandaloneMode = (window.navigator as any).standalone;
    
    if (isIOS && !isInStandaloneMode && !isInstalled) {
      setPwaState(prev => ({
        ...prev,
        isInstallable: true,
        canInstall: true
      }));
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const installPWA = async (): Promise<boolean> => {
    if (!pwaState.installPrompt) {
      return false;
    }

    try {
      await pwaState.installPrompt.prompt();
      const choiceResult = await pwaState.installPrompt.userChoice;
      
      if (choiceResult.outcome === 'accepted') {
        console.log('User accepted the install prompt');
        return true;
      } else {
        console.log('User dismissed the install prompt');
        return false;
      }
    } catch (error) {
      console.error('Error during PWA installation:', error);
      return false;
    }
  };

  const dismissInstallPrompt = () => {
    setPwaState(prev => ({
      ...prev,
      canInstall: false,
      installPrompt: null
    }));
    
    // Remember that user dismissed the prompt
    localStorage.setItem('pwa-install-dismissed', Date.now().toString());
  };

  const shouldShowInstallPrompt = (): boolean => {
    if (!pwaState.canInstall || pwaState.isInstalled) {
      return false;
    }

    // Don't show if user recently dismissed
    const lastDismissed = localStorage.getItem('pwa-install-dismissed');
    if (lastDismissed) {
      const dismissedTime = parseInt(lastDismissed);
      const daysSinceDismissed = (Date.now() - dismissedTime) / (1000 * 60 * 60 * 24);
      
      if (daysSinceDismissed < 7) { // Don't show for 7 days after dismissal
        return false;
      }
    }

    return true;
  };

  const getInstallInstructions = (): string => {
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    const isAndroid = /Android/.test(navigator.userAgent);
    
    if (isIOS) {
      return 'Tap the Share button and select "Add to Home Screen"';
    } else if (isAndroid) {
      return 'Tap the menu button and select "Add to Home Screen" or "Install App"';
    } else {
      return 'Look for the install button in your browser\'s address bar';
    }
  };

  return {
    ...pwaState,
    installPWA,
    dismissInstallPrompt,
    shouldShowInstallPrompt,
    getInstallInstructions
  };
};