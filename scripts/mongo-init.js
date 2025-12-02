// MongoDB initialization script for Rural Connect AI

// Switch to the application database
db = db.getSiblingDB('rural-connect-ai');

// Create application user
db.createUser({
  user: 'rural-connect-user',
  pwd: 'rural-connect-password',
  roles: [
    {
      role: 'readWrite',
      db: 'rural-connect-ai'
    }
  ]
});

// Create indexes for better performance
db.users.createIndex({ email: 1 }, { unique: true });
db.users.createIndex({ 'location.postcode': 1 });
db.users.createIndex({ createdAt: -1 });

db.resources.createIndex({ category: 1, 'location.postcode': 1 });
db.resources.createIndex({ ownerId: 1 });
db.resources.createIndex({ 'availability.status': 1 });
db.resources.createIndex({ createdAt: -1 });
db.resources.createIndex({ title: 'text', description: 'text' });

db.communityMembers.createIndex({ userId: 1 }, { unique: true });
db.communityMembers.createIndex({ 'skills.category': 1 });
db.communityMembers.createIndex({ 'interests.category': 1 });
db.communityMembers.createIndex({ isAvailableForMatching: 1 });

db.farms.createIndex({ ownerId: 1 });
db.farms.createIndex({ 'location.postcode': 1 });
db.farms.createIndex({ farmType: 1 });

db.emergencyAlerts.createIndex({ 'location.postcode': 1, severity: 1 });
db.emergencyAlerts.createIndex({ isActive: 1, createdAt: -1 });
db.emergencyAlerts.createIndex({ category: 1 });

print('MongoDB initialization completed for Rural Connect AI');