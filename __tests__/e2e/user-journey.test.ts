/**
 * End-to-End User Journey Tests
 * 
 * These tests simulate complete user workflows from registration to feature usage.
 * They test the integration between frontend and backend components.
 */

import { chromium, Browser, Page, BrowserContext } from 'playwright';

describe('End-to-End User Journeys', () => {
  let browser: Browser;
  let context: BrowserContext;
  let page: Page;

  beforeAll(async () => {
    browser = await chromium.launch({
      headless: process.env.CI === 'true',
      slowMo: process.env.CI !== 'true' ? 100 : 0
    });
  });

  afterAll(async () => {
    await browser.close();
  });

  beforeEach(async () => {
    context = await browser.newContext({
      viewport: { width: 1280, height: 720 }
    });
    page = await context.newPage();
    
    // Navigate to the application
    await page.goto('http://localhost:5173');
  });

  afterEach(async () => {
    await context.close();
  });

  describe('New User Registration and Onboarding', () => {
    it('should complete full user registration and profile setup', async () => {
      // 1. Navigate to registration
      await page.click('[data-testid="register-button"]');
      await page.waitForSelector('[data-testid="register-form"]');

      // 2. Fill registration form
      await page.fill('[data-testid="email-input"]', 'e2e-test@example.com');
      await page.fill('[data-testid="password-input"]', 'Password123!');
      await page.fill('[data-testid="confirm-password-input"]', 'Password123!');
      await page.fill('[data-testid="first-name-input"]', 'E2E');
      await page.fill('[data-testid="last-name-input"]', 'Test');
      
      // 3. Fill location information
      await page.fill('[data-testid="postcode-input"]', '2000');
      await page.selectOption('[data-testid="state-select"]', 'NSW');
      
      // 4. Submit registration
      await page.click('[data-testid="register-submit"]');
      
      // 5. Wait for successful registration and redirect
      await page.waitForSelector('[data-testid="dashboard"]', { timeout: 10000 });
      
      // 6. Verify user is logged in
      expect(await page.textContent('[data-testid="user-welcome"]')).toContain('Welcome, E2E');
      
      // 7. Complete profile setup
      await page.click('[data-testid="complete-profile-button"]');
      await page.waitForSelector('[data-testid="profile-setup-form"]');
      
      // 8. Add bio and contact information
      await page.fill('[data-testid="bio-textarea"]', 'E2E test user for automated testing');
      await page.fill('[data-testid="phone-input"]', '0412345678');
      
      // 9. Set communication preferences
      await page.check('[data-testid="email-notifications"]');
      await page.check('[data-testid="sms-notifications"]');
      
      // 10. Submit profile
      await page.click('[data-testid="save-profile-button"]');
      
      // 11. Verify profile completion
      await page.waitForSelector('[data-testid="profile-complete-message"]');
      expect(await page.textContent('[data-testid="profile-completeness"]')).toContain('85%');
    });

    it('should handle registration validation errors', async () => {
      await page.click('[data-testid="register-button"]');
      await page.waitForSelector('[data-testid="register-form"]');

      // Try to submit empty form
      await page.click('[data-testid="register-submit"]');
      
      // Check for validation errors
      expect(await page.isVisible('[data-testid="email-error"]')).toBe(true);
      expect(await page.isVisible('[data-testid="password-error"]')).toBe(true);
      
      // Fill invalid email
      await page.fill('[data-testid="email-input"]', 'invalid-email');
      await page.click('[data-testid="register-submit"]');
      
      expect(await page.textContent('[data-testid="email-error"]')).toContain('valid email');
      
      // Fill weak password
      await page.fill('[data-testid="email-input"]', 'valid@example.com');
      await page.fill('[data-testid="password-input"]', '123');
      await page.click('[data-testid="register-submit"]');
      
      expect(await page.textContent('[data-testid="password-error"]')).toContain('password must');
    });
  });

  describe('Resource Discovery and Management', () => {
    beforeEach(async () => {
      // Login as existing user
      await loginUser(page, 'test@example.com', 'Password123!');
    });

    it('should search and filter resources effectively', async () => {
      // 1. Navigate to resource search
      await page.click('[data-testid="resources-nav"]');
      await page.waitForSelector('[data-testid="resource-search"]');
      
      // 2. Perform basic search
      await page.fill('[data-testid="search-input"]', 'tractor');
      await page.press('[data-testid="search-input"]', 'Enter');
      
      // 3. Wait for search results
      await page.waitForSelector('[data-testid="search-results"]');
      
      // 4. Verify search results contain relevant items
      const searchResults = await page.locator('[data-testid="resource-card"]').count();
      expect(searchResults).toBeGreaterThan(0);
      
      // 5. Apply category filter
      await page.click('[data-testid="equipment-filter"]');
      await page.waitForSelector('[data-testid="search-results"]');
      
      // 6. Verify filtered results
      const filteredResults = await page.locator('[data-testid="resource-card"]').count();
      expect(filteredResults).toBeLessThanOrEqual(searchResults);
      
      // 7. Apply location filter
      await page.fill('[data-testid="location-filter"]', '2000');
      await page.press('[data-testid="location-filter"]', 'Enter');
      
      // 8. Verify location-based filtering
      await page.waitForSelector('[data-testid="search-results"]');
      const locationResults = await page.locator('[data-testid="resource-card"]').count();
      expect(locationResults).toBeGreaterThanOrEqual(0);
      
      // 9. Clear filters
      await page.click('[data-testid="clear-filters"]');
      await page.waitForSelector('[data-testid="search-results"]');
      
      // 10. Verify all results are shown again
      const allResults = await page.locator('[data-testid="resource-card"]').count();
      expect(allResults).toBeGreaterThanOrEqual(searchResults);
    });

    it('should create and manage resources', async () => {
      // 1. Navigate to create resource
      await page.click('[data-testid="create-resource-button"]');
      await page.waitForSelector('[data-testid="resource-form"]');
      
      // 2. Fill resource details
      await page.fill('[data-testid="resource-title"]', 'E2E Test Tractor');
      await page.fill('[data-testid="resource-description"]', 'Heavy duty tractor for testing');
      await page.selectOption('[data-testid="resource-category"]', 'equipment');
      await page.selectOption('[data-testid="resource-subcategory"]', 'agricultural');
      
      // 3. Set availability
      await page.check('[data-testid="monday-available"]');
      await page.fill('[data-testid="monday-start"]', '08:00');
      await page.fill('[data-testid="monday-end"]', '18:00');
      
      // 4. Add contact information
      await page.fill('[data-testid="contact-phone"]', '0412345678');
      await page.fill('[data-testid="contact-email"]', 'tractor@example.com');
      
      // 5. Set pricing
      await page.selectOption('[data-testid="pricing-type"]', 'hourly');
      await page.fill('[data-testid="pricing-amount"]', '50');
      
      // 6. Submit resource
      await page.click('[data-testid="create-resource-submit"]');
      
      // 7. Verify resource creation
      await page.waitForSelector('[data-testid="resource-created-message"]');
      expect(await page.textContent('[data-testid="success-message"]')).toContain('Resource created successfully');
      
      // 8. Navigate to my resources
      await page.click('[data-testid="my-resources-nav"]');
      await page.waitForSelector('[data-testid="my-resources-list"]');
      
      // 9. Verify resource appears in list
      expect(await page.textContent('[data-testid="my-resources-list"]')).toContain('E2E Test Tractor');
      
      // 10. Edit resource
      await page.click('[data-testid="edit-resource-button"]');
      await page.waitForSelector('[data-testid="resource-form"]');
      
      await page.fill('[data-testid="resource-description"]', 'Updated description for testing');
      await page.click('[data-testid="update-resource-submit"]');
      
      // 11. Verify update
      await page.waitForSelector('[data-testid="resource-updated-message"]');
      expect(await page.textContent('[data-testid="success-message"]')).toContain('Resource updated successfully');
    });
  });

  describe('Community Matching and Connections', () => {
    beforeEach(async () => {
      await loginUser(page, 'test@example.com', 'Password123!');
    });

    it('should complete community profile setup and find matches', async () => {
      // 1. Navigate to community section
      await page.click('[data-testid="community-nav"]');
      await page.waitForSelector('[data-testid="community-dashboard"]');
      
      // 2. Set up community profile
      await page.click('[data-testid="setup-profile-button"]');
      await page.waitForSelector('[data-testid="community-profile-form"]');
      
      // 3. Add skills
      await page.click('[data-testid="add-skill-button"]');
      await page.fill('[data-testid="skill-name"]', 'Cattle Farming');
      await page.selectOption('[data-testid="skill-level"]', 'advanced');
      await page.check('[data-testid="can-teach"]');
      await page.selectOption('[data-testid="skill-category"]', 'agricultural');
      await page.click('[data-testid="save-skill"]');
      
      // 4. Add interests
      await page.click('[data-testid="add-interest-button"]');
      await page.fill('[data-testid="interest-name"]', 'Sustainable Farming');
      await page.selectOption('[data-testid="interest-category"]', 'agriculture');
      await page.selectOption('[data-testid="interest-intensity"]', 'passionate');
      await page.click('[data-testid="save-interest"]');
      
      // 5. Set availability
      await page.check('[data-testid="monday-availability"]');
      await page.fill('[data-testid="monday-start-time"]', '09:00');
      await page.fill('[data-testid="monday-end-time"]', '17:00');
      
      // 6. Set matching preferences
      await page.fill('[data-testid="max-distance"]', '50');
      await page.check('[data-testid="prefer-beginner"]');
      await page.check('[data-testid="prefer-intermediate"]');
      
      // 7. Submit profile
      await page.click('[data-testid="save-community-profile"]');
      
      // 8. Verify profile creation
      await page.waitForSelector('[data-testid="profile-created-message"]');
      
      // 9. View matches
      await page.click('[data-testid="matches-tab"]');
      await page.waitForSelector('[data-testid="matches-list"]');
      
      // 10. Verify matches are displayed
      const matchCount = await page.locator('[data-testid="match-card"]').count();
      expect(matchCount).toBeGreaterThanOrEqual(0);
      
      // 11. Connect with a match (if available)
      if (matchCount > 0) {
        await page.click('[data-testid="connect-button"]');
        await page.waitForSelector('[data-testid="connection-modal"]');
        
        await page.fill('[data-testid="connection-message"]', 'Hi! I\'d love to share my cattle farming knowledge.');
        await page.click('[data-testid="send-connection"]');
        
        await page.waitForSelector('[data-testid="connection-sent-message"]');
        expect(await page.textContent('[data-testid="success-message"]')).toContain('Connection request sent');
      }
    });
  });

  describe('Agricultural Dashboard and Monitoring', () => {
    beforeEach(async () => {
      await loginUser(page, 'farmer@example.com', 'Password123!');
    });

    it('should manage farm profile and crop monitoring', async () => {
      // 1. Navigate to agricultural dashboard
      await page.click('[data-testid="agriculture-nav"]');
      await page.waitForSelector('[data-testid="agricultural-dashboard"]');
      
      // 2. Set up farm profile
      await page.click('[data-testid="setup-farm-button"]');
      await page.waitForSelector('[data-testid="farm-profile-form"]');
      
      await page.fill('[data-testid="farm-name"]', 'E2E Test Farm');
      await page.fill('[data-testid="farm-size"]', '100');
      await page.selectOption('[data-testid="farm-type"]', 'mixed');
      await page.fill('[data-testid="farm-location"]', '2000');
      
      // 3. Add crops
      await page.click('[data-testid="add-crop-button"]');
      await page.fill('[data-testid="crop-name"]', 'Wheat');
      await page.fill('[data-testid="crop-area"]', '50');
      await page.fill('[data-testid="planting-date"]', '2024-03-01');
      await page.click('[data-testid="save-crop"]');
      
      // 4. Submit farm profile
      await page.click('[data-testid="save-farm-profile"]');
      
      // 5. Verify farm creation
      await page.waitForSelector('[data-testid="farm-created-message"]');
      
      // 6. Add crop monitoring entry
      await page.click('[data-testid="crop-monitoring-tab"]');
      await page.click('[data-testid="add-monitoring-entry"]');
      
      await page.selectOption('[data-testid="monitoring-crop"]', 'Wheat');
      await page.fill('[data-testid="monitoring-notes"]', 'Crops looking healthy, good growth');
      await page.selectOption('[data-testid="growth-stage"]', 'vegetative');
      await page.selectOption('[data-testid="health-status"]', 'healthy');
      
      // 7. Upload monitoring photo (mock file upload)
      const fileInput = page.locator('[data-testid="photo-upload"]');
      await fileInput.setInputFiles({
        name: 'crop-photo.jpg',
        mimeType: 'image/jpeg',
        buffer: Buffer.from('fake-image-data')
      });
      
      await page.click('[data-testid="save-monitoring-entry"]');
      
      // 8. Verify monitoring entry
      await page.waitForSelector('[data-testid="monitoring-entry-saved"]');
      
      // 9. View weather data
      await page.click('[data-testid="weather-tab"]');
      await page.waitForSelector('[data-testid="weather-widget"]');
      
      // 10. Verify weather information is displayed
      expect(await page.isVisible('[data-testid="current-temperature"]')).toBe(true);
      expect(await page.isVisible('[data-testid="weather-forecast"]')).toBe(true);
    });
  });

  describe('Emergency Alerts and Response', () => {
    beforeEach(async () => {
      await loginUser(page, 'test@example.com', 'Password123!');
    });

    it('should handle emergency alert workflow', async () => {
      // 1. Navigate to emergency section
      await page.click('[data-testid="emergency-nav"]');
      await page.waitForSelector('[data-testid="emergency-dashboard"]');
      
      // 2. View current alerts
      await page.waitForSelector('[data-testid="alerts-list"]');
      
      // 3. Create community alert (if user has permission)
      if (await page.isVisible('[data-testid="create-alert-button"]')) {
        await page.click('[data-testid="create-alert-button"]');
        await page.waitForSelector('[data-testid="alert-form"]');
        
        await page.fill('[data-testid="alert-title"]', 'E2E Test Alert');
        await page.fill('[data-testid="alert-description"]', 'This is a test emergency alert');
        await page.selectOption('[data-testid="alert-severity"]', 'medium');
        await page.selectOption('[data-testid="alert-category"]', 'weather');
        
        await page.click('[data-testid="submit-alert"]');
        
        // 4. Verify alert creation
        await page.waitForSelector('[data-testid="alert-created-message"]');
      }
      
      // 5. Test emergency contacts
      await page.click('[data-testid="emergency-contacts-tab"]');
      await page.waitForSelector('[data-testid="contacts-list"]');
      
      // 6. Add emergency contact
      await page.click('[data-testid="add-contact-button"]');
      await page.fill('[data-testid="contact-name"]', 'Emergency Contact');
      await page.fill('[data-testid="contact-phone"]', '000');
      await page.selectOption('[data-testid="contact-type"]', 'emergency-services');
      await page.click('[data-testid="save-contact"]');
      
      // 7. Verify contact addition
      await page.waitForSelector('[data-testid="contact-added-message"]');
      expect(await page.textContent('[data-testid="contacts-list"]')).toContain('Emergency Contact');
    });
  });

  describe('Offline Functionality', () => {
    beforeEach(async () => {
      await loginUser(page, 'test@example.com', 'Password123!');
    });

    it('should work offline and sync when back online', async () => {
      // 1. Ensure app is loaded and working online
      await page.waitForSelector('[data-testid="dashboard"]');
      
      // 2. Go offline
      await context.setOffline(true);
      
      // 3. Verify offline indicator appears
      await page.waitForSelector('[data-testid="offline-indicator"]');
      expect(await page.textContent('[data-testid="offline-status"]')).toContain('Offline');
      
      // 4. Try to access cached content
      await page.click('[data-testid="resources-nav"]');
      await page.waitForSelector('[data-testid="resource-search"]');
      
      // 5. Verify offline message for new data
      expect(await page.isVisible('[data-testid="offline-message"]')).toBe(true);
      
      // 6. Access emergency information (should work offline)
      await page.click('[data-testid="emergency-nav"]');
      await page.waitForSelector('[data-testid="emergency-dashboard"]');
      
      // 7. Verify emergency contacts are available offline
      await page.click('[data-testid="emergency-contacts-tab"]');
      expect(await page.isVisible('[data-testid="contacts-list"]')).toBe(true);
      
      // 8. Go back online
      await context.setOffline(false);
      
      // 9. Verify online indicator appears
      await page.waitForSelector('[data-testid="online-indicator"]');
      expect(await page.textContent('[data-testid="online-status"]')).toContain('Online');
      
      // 10. Verify sync occurs
      await page.waitForSelector('[data-testid="sync-complete"]', { timeout: 10000 });
    });
  });

  describe('Mobile Responsiveness', () => {
    beforeEach(async () => {
      // Set mobile viewport
      await page.setViewportSize({ width: 375, height: 667 });
      await loginUser(page, 'test@example.com', 'Password123!');
    });

    it('should work correctly on mobile devices', async () => {
      // 1. Verify mobile navigation
      expect(await page.isVisible('[data-testid="mobile-menu-button"]')).toBe(true);
      
      // 2. Open mobile menu
      await page.click('[data-testid="mobile-menu-button"]');
      await page.waitForSelector('[data-testid="mobile-menu"]');
      
      // 3. Navigate using mobile menu
      await page.click('[data-testid="mobile-resources-nav"]');
      await page.waitForSelector('[data-testid="resource-search"]');
      
      // 4. Test mobile search interface
      await page.fill('[data-testid="search-input"]', 'test');
      await page.press('[data-testid="search-input"]', 'Enter');
      
      // 5. Verify mobile-optimized results
      await page.waitForSelector('[data-testid="mobile-search-results"]');
      
      // 6. Test mobile filters
      await page.click('[data-testid="mobile-filters-button"]');
      await page.waitForSelector('[data-testid="mobile-filters-panel"]');
      
      // 7. Apply filter on mobile
      await page.click('[data-testid="equipment-filter"]');
      await page.click('[data-testid="apply-filters-mobile"]');
      
      // 8. Verify mobile Three.js performance
      await page.click('[data-testid="mobile-menu-button"]');
      await page.click('[data-testid="mobile-3d-view-nav"]');
      
      // Wait for 3D scene to load (with longer timeout for mobile)
      await page.waitForSelector('[data-testid="three-scene"]', { timeout: 15000 });
      
      // 9. Test mobile touch controls
      await page.touchscreen.tap(200, 300);
      await page.waitForTimeout(1000);
      
      // 10. Verify mobile performance indicators
      expect(await page.isVisible('[data-testid="mobile-performance-indicator"]')).toBe(true);
    });
  });
});

// Helper function to login user
async function loginUser(page: Page, email: string, password: string) {
  await page.click('[data-testid="login-button"]');
  await page.waitForSelector('[data-testid="login-form"]');
  
  await page.fill('[data-testid="login-email"]', email);
  await page.fill('[data-testid="login-password"]', password);
  await page.click('[data-testid="login-submit"]');
  
  await page.waitForSelector('[data-testid="dashboard"]', { timeout: 10000 });
}