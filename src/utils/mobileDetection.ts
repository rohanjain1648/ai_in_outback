// Mobile detection and device utilities
export interface DeviceInfo {
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  isTouchDevice: boolean;
  screenSize: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  orientation: 'portrait' | 'landscape';
  pixelRatio: number;
  hasCamera: boolean;
  supportsWebRTC: boolean;
  supportsServiceWorker: boolean;
  connectionType?: string;
}

export class MobileDetection {
  private static instance: MobileDetection;
  private deviceInfo: DeviceInfo;
  private listeners: ((info: DeviceInfo) => void)[] = [];

  private constructor() {
    this.deviceInfo = this.detectDevice();
    this.setupEventListeners();
  }

  public static getInstance(): MobileDetection {
    if (!MobileDetection.instance) {
      MobileDetection.instance = new MobileDetection();
    }
    return MobileDetection.instance;
  }

  private detectDevice(): DeviceInfo {
    const userAgent = navigator.userAgent.toLowerCase();
    const width = window.innerWidth;
    const height = window.innerHeight;

    // Mobile detection
    const isMobile = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent) ||
                     (width <= 768 && 'ontouchstart' in window);

    // Tablet detection
    const isTablet = /ipad|android(?!.*mobile)|tablet/i.test(userAgent) ||
                     (width >= 768 && width <= 1024 && 'ontouchstart' in window);

    // Desktop detection
    const isDesktop = !isMobile && !isTablet;

    // Touch device detection
    const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;

    // Screen size detection
    let screenSize: DeviceInfo['screenSize'] = 'md';
    if (width < 640) screenSize = 'xs';
    else if (width < 768) screenSize = 'sm';
    else if (width < 1024) screenSize = 'md';
    else if (width < 1280) screenSize = 'lg';
    else if (width < 1536) screenSize = 'xl';
    else screenSize = '2xl';

    // Orientation detection
    const orientation: DeviceInfo['orientation'] = width > height ? 'landscape' : 'portrait';

    // Pixel ratio
    const pixelRatio = window.devicePixelRatio || 1;

    // Camera support detection
    const hasCamera = !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia);

    // WebRTC support detection
    const supportsWebRTC = !!(window.RTCPeerConnection || window.webkitRTCPeerConnection);

    // Service Worker support detection
    const supportsServiceWorker = 'serviceWorker' in navigator;

    // Connection type (if available)
    const connection = (navigator as any).connection || (navigator as any).mozConnection || (navigator as any).webkitConnection;
    const connectionType = connection?.effectiveType;

    return {
      isMobile,
      isTablet,
      isDesktop,
      isTouchDevice,
      screenSize,
      orientation,
      pixelRatio,
      hasCamera,
      supportsWebRTC,
      supportsServiceWorker,
      connectionType
    };
  }

  private setupEventListeners(): void {
    // Listen for resize events
    window.addEventListener('resize', () => {
      const newInfo = this.detectDevice();
      if (this.hasDeviceInfoChanged(this.deviceInfo, newInfo)) {
        this.deviceInfo = newInfo;
        this.notifyListeners();
      }
    });

    // Listen for orientation changes
    window.addEventListener('orientationchange', () => {
      setTimeout(() => {
        const newInfo = this.detectDevice();
        this.deviceInfo = newInfo;
        this.notifyListeners();
      }, 100); // Small delay to ensure dimensions are updated
    });

    // Listen for connection changes
    const connection = (navigator as any).connection || (navigator as any).mozConnection || (navigator as any).webkitConnection;
    if (connection) {
      connection.addEventListener('change', () => {
        this.deviceInfo.connectionType = connection.effectiveType;
        this.notifyListeners();
      });
    }
  }

  private hasDeviceInfoChanged(oldInfo: DeviceInfo, newInfo: DeviceInfo): boolean {
    return (
      oldInfo.screenSize !== newInfo.screenSize ||
      oldInfo.orientation !== newInfo.orientation ||
      oldInfo.isMobile !== newInfo.isMobile ||
      oldInfo.isTablet !== newInfo.isTablet
    );
  }

  private notifyListeners(): void {
    this.listeners.forEach(listener => {
      try {
        listener(this.deviceInfo);
      } catch (error) {
        console.error('Error in device info listener:', error);
      }
    });
  }

  public getDeviceInfo(): DeviceInfo {
    return { ...this.deviceInfo };
  }

  public isMobile(): boolean {
    return this.deviceInfo.isMobile;
  }

  public isTablet(): boolean {
    return this.deviceInfo.isTablet;
  }

  public isDesktop(): boolean {
    return this.deviceInfo.isDesktop;
  }

  public isTouchDevice(): boolean {
    return this.deviceInfo.isTouchDevice;
  }

  public getScreenSize(): DeviceInfo['screenSize'] {
    return this.deviceInfo.screenSize;
  }

  public getOrientation(): DeviceInfo['orientation'] {
    return this.deviceInfo.orientation;
  }

  public hasCamera(): boolean {
    return this.deviceInfo.hasCamera;
  }

  public supportsWebRTC(): boolean {
    return this.deviceInfo.supportsWebRTC;
  }

  public isSlowConnection(): boolean {
    return this.deviceInfo.connectionType === 'slow-2g' || this.deviceInfo.connectionType === '2g';
  }

  public isFastConnection(): boolean {
    return this.deviceInfo.connectionType === '4g' || this.deviceInfo.connectionType === '5g';
  }

  public onDeviceChange(callback: (info: DeviceInfo) => void): () => void {
    this.listeners.push(callback);
    
    // Return unsubscribe function
    return () => {
      const index = this.listeners.indexOf(callback);
      if (index > -1) {
        this.listeners.splice(index, 1);
      }
    };
  }

  // Performance optimization methods
  public shouldUseReducedMotion(): boolean {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }

  public shouldUseLowQuality(): boolean {
    return this.isMobile() && (this.isSlowConnection() || this.deviceInfo.pixelRatio < 2);
  }

  public getOptimalImageSize(): { width: number; height: number } {
    const { screenSize, pixelRatio } = this.deviceInfo;
    
    let baseWidth = 1920;
    let baseHeight = 1080;
    
    switch (screenSize) {
      case 'xs':
        baseWidth = 480;
        baseHeight = 320;
        break;
      case 'sm':
        baseWidth = 640;
        baseHeight = 480;
        break;
      case 'md':
        baseWidth = 1024;
        baseHeight = 768;
        break;
      case 'lg':
        baseWidth = 1280;
        baseHeight = 720;
        break;
      case 'xl':
        baseWidth = 1920;
        baseHeight = 1080;
        break;
      case '2xl':
        baseWidth = 2560;
        baseHeight = 1440;
        break;
    }
    
    return {
      width: Math.round(baseWidth * Math.min(pixelRatio, 2)),
      height: Math.round(baseHeight * Math.min(pixelRatio, 2))
    };
  }
}

// Export singleton instance
export const mobileDetection = MobileDetection.getInstance();

// React hook for device detection
export const useDeviceDetection = () => {
  const [deviceInfo, setDeviceInfo] = React.useState<DeviceInfo>(mobileDetection.getDeviceInfo());

  React.useEffect(() => {
    const unsubscribe = mobileDetection.onDeviceChange(setDeviceInfo);
    return unsubscribe;
  }, []);

  return deviceInfo;
};

// Import React for the hook
import React from 'react';