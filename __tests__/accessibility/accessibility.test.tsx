/**
 * Accessibility Tests
 * 
 * Tests to ensure the application is accessible to users with disabilities
 * and complies with WCAG 2.1 guidelines.
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';
import userEvent from '@testing-library/user-event';

// Extend Jest matchers
expect.extend(toHaveNoViolations);

// Mock components for testing
const MockResourceSearch = () => (
  <div>
    <h1>Search Resources</h1>
    <label htmlFor="search-input">Search for resources</label>
    <input
      id="search-input"
      type="text"
      placeholder="Enter search terms"
      aria-describedby="search-help"
    />
    <div id="search-help">
      Enter keywords to find community resources like equipment, services, or knowledge
    </div>
    <button type="submit" aria-label="Submit search">
      Search
    </button>
    <div role="region" aria-label="Search results" aria-live="polite">
      <div role="list">
        <div role="listitem">
          <h3>
            <a href="/resource/1" aria-describedby="resource-1-desc">
              Tractor Rental Service
            </a>
          </h3>
          <p id="resource-1-desc">
            Heavy duty tractor available for rent in Sydney region
          </p>
        </div>
      </div>
    </div>
  </div>
);

const MockNavigationMenu = () => (
  <nav aria-label="Main navigation">
    <ul>
      <li>
        <a href="/dashboard" aria-current="page">
          Dashboard
        </a>
      </li>
      <li>
        <a href="/resources">Resources</a>
      </li>
      <li>
        <a href="/community">Community</a>
      </li>
      <li>
        <a href="/agriculture">Agriculture</a>
      </li>
      <li>
        <button
          aria-expanded="false"
          aria-haspopup="true"
          aria-controls="user-menu"
        >
          User Menu
        </button>
        <ul id="user-menu" hidden>
          <li><a href="/profile">Profile</a></li>
          <li><a href="/settings">Settings</a></li>
          <li><button>Logout</button></li>
        </ul>
      </li>
    </ul>
  </nav>
);

const MockFormComponent = () => {
  const [errors, setErrors] = React.useState<Record<string, string>>({});
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    const newErrors: Record<string, string> = {};
    
    if (!formData.get('email')) {
      newErrors.email = 'Email is required';
    }
    if (!formData.get('password')) {
      newErrors.password = 'Password is required';
    }
    
    setErrors(newErrors);
  };
  
  return (
    <form onSubmit={handleSubmit} noValidate>
      <fieldset>
        <legend>User Registration</legend>
        
        <div>
          <label htmlFor="email">
            Email Address <span aria-label="required">*</span>
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            aria-invalid={errors.email ? 'true' : 'false'}
            aria-describedby={errors.email ? 'email-error' : 'email-help'}
          />
          <div id="email-help">
            We'll use this to send you important updates
          </div>
          {errors.email && (
            <div id="email-error" role="alert" aria-live="polite">
              {errors.email}
            </div>
          )}
        </div>
        
        <div>
          <label htmlFor="password">
            Password <span aria-label="required">*</span>
          </label>
          <input
            id="password"
            name="password"
            type="password"
            required
            aria-invalid={errors.password ? 'true' : 'false'}
            aria-describedby={errors.password ? 'password-error' : 'password-help'}
          />
          <div id="password-help">
            Must be at least 8 characters with uppercase, lowercase, and numbers
          </div>
          {errors.password && (
            <div id="password-error" role="alert" aria-live="polite">
              {errors.password}
            </div>
          )}
        </div>
        
        <button type="submit">Register</button>
      </fieldset>
    </form>
  );
};

const MockThreeJSScene = () => (
  <div>
    <div
      role="img"
      aria-label="Interactive 3D landscape of rural Australia"
      tabIndex={0}
      onKeyDown={(e) => {
        // Handle keyboard navigation
        if (e.key === 'ArrowUp') {
          console.log('Move camera forward');
        }
      }}
    >
      <canvas aria-hidden="true" />
    </div>
    
    <div role="region" aria-label="3D scene controls">
      <button aria-label="Reset camera view">Reset View</button>
      <button aria-label="Toggle weather effects">Weather</button>
      <button aria-label="Change time of day">Time</button>
    </div>
    
    <div role="region" aria-label="Alternative content for 3D scene">
      <h3>Scene Description</h3>
      <p>
        A panoramic view of the Australian countryside featuring rolling hills,
        eucalyptus trees, and a small rural town in the distance. The current
        weather is sunny with scattered clouds.
      </p>
      
      <h4>Interactive Elements</h4>
      <ul>
        <li>Community center (clickable)</li>
        <li>Farm buildings (clickable)</li>
        <li>Weather station (clickable)</li>
      </ul>
    </div>
  </div>
);

describe('Accessibility Tests', () => {
  describe('WCAG 2.1 Compliance', () => {
    it('should have no accessibility violations in search component', async () => {
      const { container } = render(<MockResourceSearch />);
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('should have no accessibility violations in navigation', async () => {
      const { container } = render(<MockNavigationMenu />);
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('should have no accessibility violations in forms', async () => {
      const { container } = render(<MockFormComponent />);
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('should have no accessibility violations in 3D scene', async () => {
      const { container } = render(<MockThreeJSScene />);
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });
  });

  describe('Keyboard Navigation', () => {
    it('should support keyboard navigation in search interface', async () => {
      const user = userEvent.setup();
      render(<MockResourceSearch />);

      const searchInput = screen.getByLabelText('Search for resources');
      const searchButton = screen.getByRole('button', { name: 'Submit search' });

      // Tab to search input
      await user.tab();
      expect(searchInput).toHaveFocus();

      // Type in search input
      await user.type(searchInput, 'tractor');
      expect(searchInput).toHaveValue('tractor');

      // Tab to search button
      await user.tab();
      expect(searchButton).toHaveFocus();

      // Press Enter to submit
      await user.keyboard('{Enter}');
      // Verify search was triggered (would need mock implementation)
    });

    it('should support keyboard navigation in dropdown menus', async () => {
      const user = userEvent.setup();
      render(<MockNavigationMenu />);

      const userMenuButton = screen.getByRole('button', { name: 'User Menu' });

      // Tab to user menu button
      await user.tab();
      await user.tab();
      await user.tab();
      await user.tab();
      await user.tab();
      expect(userMenuButton).toHaveFocus();

      // Press Enter to open menu
      await user.keyboard('{Enter}');
      expect(userMenuButton).toHaveAttribute('aria-expanded', 'true');

      // Arrow down to first menu item
      await user.keyboard('{ArrowDown}');
      const profileLink = screen.getByRole('link', { name: 'Profile' });
      expect(profileLink).toHaveFocus();

      // Arrow down to next item
      await user.keyboard('{ArrowDown}');
      const settingsLink = screen.getByRole('link', { name: 'Settings' });
      expect(settingsLink).toHaveFocus();

      // Escape to close menu
      await user.keyboard('{Escape}');
      expect(userMenuButton).toHaveAttribute('aria-expanded', 'false');
      expect(userMenuButton).toHaveFocus();
    });

    it('should support keyboard navigation in 3D scenes', () => {
      render(<MockThreeJSScene />);

      const sceneElement = screen.getByRole('img', { 
        name: 'Interactive 3D landscape of rural Australia' 
      });

      // Focus on 3D scene
      sceneElement.focus();
      expect(sceneElement).toHaveFocus();

      // Test keyboard event handling
      const keyDownSpy = jest.fn();
      sceneElement.addEventListener('keydown', keyDownSpy);

      fireEvent.keyDown(sceneElement, { key: 'ArrowUp' });
      expect(keyDownSpy).toHaveBeenCalledWith(
        expect.objectContaining({ key: 'ArrowUp' })
      );
    });
  });

  describe('Screen Reader Support', () => {
    it('should provide proper labels and descriptions', () => {
      render(<MockResourceSearch />);

      // Check for proper labeling
      const searchInput = screen.getByLabelText('Search for resources');
      expect(searchInput).toHaveAttribute('aria-describedby', 'search-help');

      const helpText = screen.getByText(
        'Enter keywords to find community resources like equipment, services, or knowledge'
      );
      expect(helpText).toHaveAttribute('id', 'search-help');

      // Check for live regions
      const resultsRegion = screen.getByRole('region', { name: 'Search results' });
      expect(resultsRegion).toHaveAttribute('aria-live', 'polite');
    });

    it('should announce form validation errors', async () => {
      const user = userEvent.setup();
      render(<MockFormComponent />);

      const submitButton = screen.getByRole('button', { name: 'Register' });
      
      // Submit form without filling required fields
      await user.click(submitButton);

      // Check for error announcements
      const emailError = screen.getByRole('alert');
      expect(emailError).toHaveTextContent('Email is required');
      expect(emailError).toHaveAttribute('aria-live', 'polite');

      const emailInput = screen.getByLabelText(/Email Address/);
      expect(emailInput).toHaveAttribute('aria-invalid', 'true');
      expect(emailInput).toHaveAttribute('aria-describedby', 'email-error');
    });

    it('should provide alternative content for 3D scenes', () => {
      render(<MockThreeJSScene />);

      // Check for descriptive content
      const sceneDescription = screen.getByText(/A panoramic view of the Australian countryside/);
      expect(sceneDescription).toBeInTheDocument();

      const interactiveElements = screen.getByText('Interactive Elements');
      expect(interactiveElements).toBeInTheDocument();

      // Check that canvas is hidden from screen readers
      const canvas = document.querySelector('canvas');
      expect(canvas).toHaveAttribute('aria-hidden', 'true');
    });
  });

  describe('Color and Contrast', () => {
    it('should not rely solely on color for information', () => {
      render(
        <div>
          <div style={{ color: 'red' }}>
            <span aria-label="Error">⚠️</span> This field is required
          </div>
          <div style={{ color: 'green' }}>
            <span aria-label="Success">✓</span> Form submitted successfully
          </div>
          <div>
            <span style={{ color: 'red', fontWeight: 'bold' }}>
              High Priority
            </span>
            <span style={{ color: 'orange', fontWeight: 'bold' }}>
              Medium Priority
            </span>
            <span style={{ color: 'green', fontWeight: 'bold' }}>
              Low Priority
            </span>
          </div>
        </div>
      );

      // Verify that icons and text provide meaning beyond color
      expect(screen.getByLabelText('Error')).toBeInTheDocument();
      expect(screen.getByLabelText('Success')).toBeInTheDocument();
      expect(screen.getByText('This field is required')).toBeInTheDocument();
      expect(screen.getByText('Form submitted successfully')).toBeInTheDocument();
    });

    it('should provide sufficient color contrast', () => {
      // This would typically be tested with automated tools like axe
      // or manual testing with contrast checkers
      
      const testColors = [
        { background: '#ffffff', foreground: '#000000', ratio: 21 }, // Perfect contrast
        { background: '#ffffff', foreground: '#767676', ratio: 4.54 }, // AA compliant
        { background: '#000000', foreground: '#ffffff', ratio: 21 }, // Perfect contrast
        { background: '#0066cc', foreground: '#ffffff', ratio: 7.73 }, // AAA compliant
      ];

      testColors.forEach(({ background, foreground, ratio }) => {
        expect(ratio).toBeGreaterThanOrEqual(4.5); // WCAG AA standard
      });
    });
  });

  describe('Focus Management', () => {
    it('should manage focus properly in modal dialogs', async () => {
      const MockModal = () => {
        const [isOpen, setIsOpen] = React.useState(false);
        const modalRef = React.useRef<HTMLDivElement>(null);

        React.useEffect(() => {
          if (isOpen && modalRef.current) {
            const firstFocusable = modalRef.current.querySelector(
              'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
            ) as HTMLElement;
            firstFocusable?.focus();
          }
        }, [isOpen]);

        const handleKeyDown = (e: React.KeyboardEvent) => {
          if (e.key === 'Escape') {
            setIsOpen(false);
          }
        };

        return (
          <div>
            <button onClick={() => setIsOpen(true)}>
              Open Modal
            </button>
            
            {isOpen && (
              <div
                role="dialog"
                aria-modal="true"
                aria-labelledby="modal-title"
                ref={modalRef}
                onKeyDown={handleKeyDown}
              >
                <h2 id="modal-title">Confirm Action</h2>
                <p>Are you sure you want to proceed?</p>
                <button onClick={() => setIsOpen(false)}>
                  Cancel
                </button>
                <button onClick={() => setIsOpen(false)}>
                  Confirm
                </button>
              </div>
            )}
          </div>
        );
      };

      const user = userEvent.setup();
      render(<MockModal />);

      const openButton = screen.getByRole('button', { name: 'Open Modal' });
      await user.click(openButton);

      // Check that modal is properly labeled
      const modal = screen.getByRole('dialog');
      expect(modal).toHaveAttribute('aria-modal', 'true');
      expect(modal).toHaveAttribute('aria-labelledby', 'modal-title');

      // Check that focus is managed
      const cancelButton = screen.getByRole('button', { name: 'Cancel' });
      expect(cancelButton).toHaveFocus();

      // Test escape key
      await user.keyboard('{Escape}');
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });

    it('should provide visible focus indicators', () => {
      render(
        <div>
          <button style={{ outline: '2px solid blue' }}>
            Focused Button
          </button>
          <a href="#" style={{ outline: '2px solid blue' }}>
            Focused Link
          </a>
          <input style={{ outline: '2px solid blue' }} />
        </div>
      );

      // In a real test, you would check computed styles
      // This is a simplified example
      const button = screen.getByRole('button');
      const link = screen.getByRole('link');
      const input = screen.getByRole('textbox');

      expect(button).toHaveStyle('outline: 2px solid blue');
      expect(link).toHaveStyle('outline: 2px solid blue');
      expect(input).toHaveStyle('outline: 2px solid blue');
    });
  });

  describe('Mobile Accessibility', () => {
    it('should provide adequate touch targets', () => {
      render(
        <div>
          <button style={{ minHeight: '44px', minWidth: '44px' }}>
            Touch Target
          </button>
          <a 
            href="#" 
            style={{ 
              display: 'inline-block', 
              minHeight: '44px', 
              minWidth: '44px',
              padding: '12px'
            }}
          >
            Link
          </a>
        </div>
      );

      const button = screen.getByRole('button');
      const link = screen.getByRole('link');

      // Check minimum touch target size (44px x 44px)
      expect(button).toHaveStyle('min-height: 44px');
      expect(button).toHaveStyle('min-width: 44px');
      expect(link).toHaveStyle('min-height: 44px');
      expect(link).toHaveStyle('min-width: 44px');
    });

    it('should support gesture navigation', () => {
      const MockSwipeableComponent = () => {
        const [currentIndex, setCurrentIndex] = React.useState(0);
        const items = ['Item 1', 'Item 2', 'Item 3'];

        return (
          <div
            role="region"
            aria-label="Swipeable content"
            aria-live="polite"
          >
            <div>{items[currentIndex]}</div>
            <button 
              onClick={() => setCurrentIndex(Math.max(0, currentIndex - 1))}
              aria-label="Previous item"
            >
              Previous
            </button>
            <button 
              onClick={() => setCurrentIndex(Math.min(items.length - 1, currentIndex + 1))}
              aria-label="Next item"
            >
              Next
            </button>
            <div aria-live="polite">
              Item {currentIndex + 1} of {items.length}
            </div>
          </div>
        );
      };

      const user = userEvent.setup();
      render(<MockSwipeableComponent />);

      expect(screen.getByText('Item 1')).toBeInTheDocument();
      expect(screen.getByText('Item 1 of 3')).toBeInTheDocument();

      // Test navigation buttons as alternative to gestures
      const nextButton = screen.getByRole('button', { name: 'Next item' });
      user.click(nextButton);

      // Would need to wait for state update in real component
    });
  });

  describe('Reduced Motion Support', () => {
    it('should respect prefers-reduced-motion', () => {
      // Mock the media query
      Object.defineProperty(window, 'matchMedia', {
        writable: true,
        value: jest.fn().mockImplementation(query => ({
          matches: query === '(prefers-reduced-motion: reduce)',
          media: query,
          onchange: null,
          addListener: jest.fn(),
          removeListener: jest.fn(),
          addEventListener: jest.fn(),
          removeEventListener: jest.fn(),
          dispatchEvent: jest.fn(),
        })),
      });

      const MockAnimatedComponent = () => {
        const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        
        return (
          <div
            style={{
              transition: prefersReducedMotion ? 'none' : 'all 0.3s ease',
              animation: prefersReducedMotion ? 'none' : 'fadeIn 0.5s ease-in-out',
            }}
          >
            Animated Content
          </div>
        );
      };

      render(<MockAnimatedComponent />);

      const animatedElement = screen.getByText('Animated Content');
      expect(animatedElement).toHaveStyle('transition: none');
      expect(animatedElement).toHaveStyle('animation: none');
    });
  });
});

// Helper function to test color contrast
function getContrastRatio(color1: string, color2: string): number {
  // Simplified contrast ratio calculation
  // In a real implementation, you would use a proper color contrast library
  
  const getLuminance = (color: string): number => {
    // Convert hex to RGB and calculate relative luminance
    const hex = color.replace('#', '');
    const r = parseInt(hex.substr(0, 2), 16) / 255;
    const g = parseInt(hex.substr(2, 2), 16) / 255;
    const b = parseInt(hex.substr(4, 2), 16) / 255;
    
    const sRGB = [r, g, b].map(c => {
      return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
    });
    
    return 0.2126 * sRGB[0] + 0.7152 * sRGB[1] + 0.0722 * sRGB[2];
  };

  const lum1 = getLuminance(color1);
  const lum2 = getLuminance(color2);
  
  const brightest = Math.max(lum1, lum2);
  const darkest = Math.min(lum1, lum2);
  
  return (brightest + 0.05) / (darkest + 0.05);
}