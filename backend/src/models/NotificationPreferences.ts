import mongoose, { Document, Schema } from 'mongoose';

export interface INotificationPreferences extends Document {
  userId: mongoose.Types.ObjectId;
  emergencyAlerts: boolean;
  communityMessages: boolean;
  skillMatches: boolean;
  businessOpportunities: boolean;
  culturalEvents: boolean;
  wellbeingCheckins: boolean;
  pushNotifications: boolean;
  emailNotifications: boolean;
  quietHours: {
    enabled: boolean;
    start: string; // HH:MM format
    end: string;   // HH:MM format
    timezone?: string;
  };
  categories: {
    [key: string]: boolean;
  };
  pushSubscription?: {
    endpoint: string;
    keys: {
      p256dh: string;
      auth: string;
    };
  };
  createdAt: Date;
  updatedAt: Date;
}

const NotificationPreferencesSchema = new Schema<INotificationPreferences>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true,
    index: true
  },
  emergencyAlerts: {
    type: Boolean,
    default: true
  },
  communityMessages: {
    type: Boolean,
    default: true
  },
  skillMatches: {
    type: Boolean,
    default: true
  },
  businessOpportunities: {
    type: Boolean,
    default: true
  },
  culturalEvents: {
    type: Boolean,
    default: true
  },
  wellbeingCheckins: {
    type: Boolean,
    default: true
  },
  pushNotifications: {
    type: Boolean,
    default: true
  },
  emailNotifications: {
    type: Boolean,
    default: false
  },
  quietHours: {
    enabled: {
      type: Boolean,
      default: false
    },
    start: {
      type: String,
      default: '22:00',
      validate: {
        validator: function(v: string) {
          return /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/.test(v);
        },
        message: 'Start time must be in HH:MM format'
      }
    },
    end: {
      type: String,
      default: '07:00',
      validate: {
        validator: function(v: string) {
          return /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/.test(v);
        },
        message: 'End time must be in HH:MM format'
      }
    },
    timezone: {
      type: String,
      default: 'Australia/Sydney'
    }
  },
  categories: {
    type: Map,
    of: Boolean,
    default: new Map()
  },
  pushSubscription: {
    endpoint: String,
    keys: {
      p256dh: String,
      auth: String
    }
  }
}, {
  timestamps: true
});

// Methods
NotificationPreferencesSchema.methods.shouldReceiveNotification = function(
  category: string, 
  currentTime?: Date
): boolean {
  // Check if category is enabled
  const categoryEnabled = this.categories.get(category) ?? this[category as keyof INotificationPreferences];
  if (!categoryEnabled) return false;

  // Check push notifications setting
  if (!this.pushNotifications) return false;

  // Check quiet hours
  if (this.quietHours.enabled && currentTime) {
    const time = currentTime.toLocaleTimeString('en-AU', { 
      hour12: false, 
      hour: '2-digit', 
      minute: '2-digit',
      timeZone: this.quietHours.timezone 
    });
    
    const start = this.quietHours.start;
    const end = this.quietHours.end;
    
    // Handle overnight quiet hours (e.g., 22:00 to 07:00)
    if (start > end) {
      if (time >= start || time <= end) return false;
    } else {
      if (time >= start && time <= end) return false;
    }
  }

  return true;
};

NotificationPreferencesSchema.statics.getDefaultPreferences = function(userId: mongoose.Types.ObjectId) {
  return {
    userId,
    emergencyAlerts: true,
    communityMessages: true,
    skillMatches: true,
    businessOpportunities: true,
    culturalEvents: true,
    wellbeingCheckins: true,
    pushNotifications: true,
    emailNotifications: false,
    quietHours: {
      enabled: false,
      start: '22:00',
      end: '07:00',
      timezone: 'Australia/Sydney'
    },
    categories: new Map()
  };
};

export default mongoose.model<INotificationPreferences>('NotificationPreferences', NotificationPreferencesSchema);