// Lighthouse CI configuration for Rural Connect AI

module.exports = {
  ci: {
    collect: {
      url: [
        'http://localhost:8080',
        'http://localhost:8080/dashboard',
        'http://localhost:8080/resources',
        'http://localhost:8080/community',
        'http://localhost:8080/agriculture'
      ],
      startServerCommand: 'npm run preview',
      startServerReadyPattern: 'Local:',
      startServerReadyTimeout: 30000,
      numberOfRuns: 3
    },
    assert: {
      assertions: {
        'categories:performance': ['warn', { minScore: 0.8 }],
        'categories:accessibility': ['error', { minScore: 0.9 }],
        'categories:best-practices': ['warn', { minScore: 0.8 }],
        'categories:seo': ['warn', { minScore: 0.8 }],
        'categories:pwa': ['warn', { minScore: 0.7 }]
      }
    },
    upload: {
      target: 'temporary-public-storage'
    }
  }
};