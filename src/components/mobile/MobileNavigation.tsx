import React, { useState } from 'react';
import { Menu, X, Home, MessageCircle, Users, Briefcase, Heart, Camera, Bell } from 'lucide-react';
import { useDeviceDetection } from '../../utils/mobileDetection';

interface NavigationItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  onClick: () => void;
  badge?: number;
  active?: boolean;
}

interface MobileNavigationProps {
  items: NavigationItem[];
  onItemClick?: (itemId: string) => void;
}

const MobileNavigation: React.FC<MobileNavigationProps> = ({ items, onItemClick }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const deviceInfo = useDeviceDetection();

  const handleItemClick = (item: NavigationItem) => {
    item.onClick();
    onItemClick?.(item.id);
    setIsMenuOpen(false);
  };

  // Mobile bottom navigation for small screens
  if (deviceInfo.isMobile && deviceInfo.screenSize === 'xs') {
    return (
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50">
        <div className="flex justify-around items-center py-2">
          {items.slice(0, 5).map((item) => (
            <button
              key={item.id}
              onClick={() => handleItemClick(item)}
              className={`flex flex-col items-center justify-center p-2 min-w-0 flex-1 ${
                item.active 
                  ? 'text-blue-600' 
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <div className="relative">
                {item.icon}
                {item.badge && item.badge > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                    {item.badge > 99 ? '99+' : item.badge}
                  </span>
                )}
              </div>
              <span className="text-xs mt-1 truncate max-w-full">
                {item.label}
              </span>
            </button>
          ))}
        </div>
      </div>
    );
  }

  // Mobile hamburger menu for larger mobile screens and tablets
  if (deviceInfo.isMobile || deviceInfo.isTablet) {
    return (
      <>
        {/* Hamburger menu button */}
        <button
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className="fixed top-4 right-4 z-50 p-3 bg-white rounded-full shadow-lg border border-gray-200 lg:hidden"
        >
          {isMenuOpen ? (
            <X className="w-6 h-6 text-gray-600" />
          ) : (
            <Menu className="w-6 h-6 text-gray-600" />
          )}
        </button>

        {/* Overlay */}
        {isMenuOpen && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
            onClick={() => setIsMenuOpen(false)}
          />
        )}

        {/* Slide-out menu */}
        <div
          className={`fixed top-0 right-0 h-full w-80 max-w-[80vw] bg-white shadow-xl z-50 transform transition-transform duration-300 ease-in-out lg:hidden ${
            isMenuOpen ? 'translate-x-0' : 'translate-x-full'
          }`}
        >
          <div className="p-6">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-xl font-semibold text-gray-900">Menu</h2>
              <button
                onClick={() => setIsMenuOpen(false)}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <X className="w-5 h-5 text-gray-600" />
              </button>
            </div>

            <nav className="space-y-2">
              {items.map((item) => (
                <button
                  key={item.id}
                  onClick={() => handleItemClick(item)}
                  className={`w-full flex items-center space-x-3 p-3 rounded-lg text-left transition-colors ${
                    item.active
                      ? 'bg-blue-50 text-blue-600 border border-blue-200'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <div className="relative">
                    {item.icon}
                    {item.badge && item.badge > 0 && (
                      <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                        {item.badge > 99 ? '99+' : item.badge}
                      </span>
                    )}
                  </div>
                  <span className="font-medium">{item.label}</span>
                </button>
              ))}
            </nav>
          </div>
        </div>
      </>
    );
  }

  // Desktop navigation (horizontal)
  return (
    <nav className="hidden lg:flex items-center space-x-6">
      {items.map((item) => (
        <button
          key={item.id}
          onClick={() => handleItemClick(item)}
          className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
            item.active
              ? 'bg-blue-50 text-blue-600 border border-blue-200'
              : 'text-gray-700 hover:bg-gray-50'
          }`}
        >
          <div className="relative">
            {item.icon}
            {item.badge && item.badge > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                {item.badge > 99 ? '99+' : item.badge}
              </span>
            )}
          </div>
          <span className="font-medium">{item.label}</span>
        </button>
      ))}
    </nav>
  );
};

// Example usage component
export const ExampleMobileNavigation: React.FC<{
  currentView: string;
  onViewChange: (view: string) => void;
  unreadMessages?: number;
}> = ({ currentView, onViewChange, unreadMessages = 0 }) => {
  const navigationItems: NavigationItem[] = [
    {
      id: 'home',
      label: 'Home',
      icon: <Home className="w-5 h-5" />,
      onClick: () => onViewChange('home'),
      active: currentView === 'home'
    },
    {
      id: 'chat',
      label: 'Messages',
      icon: <MessageCircle className="w-5 h-5" />,
      onClick: () => onViewChange('chat'),
      active: currentView === 'chat',
      badge: unreadMessages
    },
    {
      id: 'community',
      label: 'Community',
      icon: <Users className="w-5 h-5" />,
      onClick: () => onViewChange('community'),
      active: currentView === 'community'
    },
    {
      id: 'business',
      label: 'Business',
      icon: <Briefcase className="w-5 h-5" />,
      onClick: () => onViewChange('business'),
      active: currentView === 'business'
    },
    {
      id: 'wellbeing',
      label: 'Wellbeing',
      icon: <Heart className="w-5 h-5" />,
      onClick: () => onViewChange('wellbeing'),
      active: currentView === 'wellbeing'
    },
    {
      id: 'agriculture',
      label: 'Agriculture',
      icon: <Camera className="w-5 h-5" />,
      onClick: () => onViewChange('agriculture'),
      active: currentView === 'agriculture'
    }
  ];

  return <MobileNavigation items={navigationItems} />;
};

export default MobileNavigation;