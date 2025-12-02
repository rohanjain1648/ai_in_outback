import mongoose from 'mongoose';
import MentalHealthResource from '../src/models/MentalHealthResource';
import { config } from '../src/config';

const mentalHealthResources = [
  {
    title: 'Lifeline',
    description: '24/7 crisis support and suicide prevention service providing confidential support to anyone in suicidal crisis or emotional distress.',
    category: 'crisis',
    resourceType: 'phone',
    contactInfo: {
      phone: '13 11 14',
      website: 'https://www.lifeline.org.au'
    },
    availability: {
      hours: '24/7',
      days: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'],
      timezone: 'Australia/Sydney',
      is24x7: true
    },
    targetAudience: ['adults', 'youth', 'seniors'],
    services: ['crisis_intervention', 'suicide_prevention', 'emotional_support'],
    cost: 'free',
    location: {
      state: 'NSW',
      isNational: true
    },
    languages: ['English'],
    specializations: ['crisis', 'suicide_prevention', 'emotional_distress'],
    rating: 4.8,
    reviewCount: 1250,
    isVerified: true,
    lastVerified: new Date()
  },
  {
    title: 'Beyond Blue',
    description: 'Support for anxiety, depression and suicide prevention. Provides information and support to help everyone achieve their best possible mental health.',
    category: 'crisis',
    resourceType: 'phone',
    contactInfo: {
      phone: '1300 22 4636',
      website: 'https://www.beyondblue.org.au'
    },
    availability: {
      hours: '24/7',
      days: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'],
      timezone: 'Australia/Sydney',
      is24x7: true
    },
    targetAudience: ['adults', 'youth', 'seniors'],
    services: ['counseling', 'information', 'support'],
    cost: 'free',
    location: {
      state: 'VIC',
      isNational: true
    },
    languages: ['English'],
    specializations: ['anxiety', 'depression', 'suicide_prevention'],
    rating: 4.7,
    reviewCount: 980,
    isVerified: true,
    lastVerified: new Date()
  },
  {
    title: 'Kids Helpline',
    description: 'Free, private and confidential 24/7 phone and online counselling service for young people aged 5 to 25.',
    category: 'crisis',
    resourceType: 'phone',
    contactInfo: {
      phone: '1800 55 1800',
      website: 'https://kidshelpline.com.au'
    },
    availability: {
      hours: '24/7',
      days: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'],
      timezone: 'Australia/Sydney',
      is24x7: true
    },
    targetAudience: ['youth', 'children'],
    services: ['counseling', 'crisis_intervention', 'online_chat'],
    cost: 'free',
    location: {
      state: 'QLD',
      isNational: true
    },
    languages: ['English'],
    specializations: ['youth_mental_health', 'crisis', 'family_issues'],
    rating: 4.6,
    reviewCount: 750,
    isVerified: true,
    lastVerified: new Date()
  },
  {
    title: 'MensLine Australia',
    description: 'Professional telephone and online support and information service for Australian men.',
    category: 'crisis',
    resourceType: 'phone',
    contactInfo: {
      phone: '1300 78 99 78',
      website: 'https://mensline.org.au'
    },
    availability: {
      hours: '24/7',
      days: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'],
      timezone: 'Australia/Sydney',
      is24x7: true
    },
    targetAudience: ['adults', 'men'],
    services: ['counseling', 'support', 'information'],
    cost: 'free',
    location: {
      state: 'NSW',
      isNational: true
    },
    languages: ['English'],
    specializations: ['mens_mental_health', 'relationship_issues', 'family_violence'],
    rating: 4.5,
    reviewCount: 420,
    isVerified: true,
    lastVerified: new Date()
  },
  {
    title: 'Rural Mental Health Support Network',
    description: 'Specialized mental health support for rural and remote communities, understanding the unique challenges of rural life.',
    category: 'telehealth',
    resourceType: 'video_call',
    contactInfo: {
      phone: '1800 RURAL1',
      website: 'https://ruralmh.org.au',
      email: 'support@ruralmh.org.au'
    },
    availability: {
      hours: '8:00 AM - 8:00 PM',
      days: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'],
      timezone: 'Australia/Sydney',
      is24x7: false
    },
    targetAudience: ['farmers', 'rural_residents', 'adults'],
    services: ['telehealth', 'counseling', 'peer_support'],
    cost: 'bulk_billed',
    location: {
      state: 'NSW',
      region: 'Rural NSW',
      isNational: false
    },
    languages: ['English'],
    specializations: ['rural_mental_health', 'farming_stress', 'isolation'],
    rating: 4.9,
    reviewCount: 180,
    isVerified: true,
    lastVerified: new Date()
  },
  {
    title: 'Headspace',
    description: 'Mental health support for young people aged 12-25, providing early intervention mental health services.',
    category: 'professional',
    resourceType: 'in_person',
    contactInfo: {
      phone: '1800 650 890',
      website: 'https://headspace.org.au'
    },
    availability: {
      hours: '9:00 AM - 5:00 PM',
      days: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'],
      timezone: 'Australia/Sydney',
      is24x7: false
    },
    targetAudience: ['youth', 'young_adults'],
    services: ['counseling', 'mental_health_treatment', 'group_therapy'],
    cost: 'bulk_billed',
    location: {
      state: 'VIC',
      isNational: true
    },
    languages: ['English', 'Arabic', 'Mandarin'],
    specializations: ['youth_mental_health', 'anxiety', 'depression', 'substance_use'],
    rating: 4.4,
    reviewCount: 650,
    isVerified: true,
    lastVerified: new Date()
  },
  {
    title: 'SANE Australia',
    description: 'Support for people affected by complex mental health issues including schizophrenia, bipolar disorder and other psychotic illnesses.',
    category: 'support_group',
    resourceType: 'online_chat',
    contactInfo: {
      phone: '1800 18 7263',
      website: 'https://www.sane.org'
    },
    availability: {
      hours: '10:00 AM - 10:00 PM',
      days: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'],
      timezone: 'Australia/Melbourne',
      is24x7: false
    },
    targetAudience: ['adults', 'families', 'carers'],
    services: ['peer_support', 'online_forums', 'information'],
    cost: 'free',
    location: {
      state: 'VIC',
      isNational: true
    },
    languages: ['English'],
    specializations: ['complex_mental_illness', 'bipolar', 'schizophrenia', 'family_support'],
    rating: 4.3,
    reviewCount: 320,
    isVerified: true,
    lastVerified: new Date()
  },
  {
    title: 'Black Dog Institute',
    description: 'Leading research institute focused on mood disorders, providing evidence-based resources and support.',
    category: 'self_help',
    resourceType: 'website',
    contactInfo: {
      website: 'https://www.blackdoginstitute.org.au'
    },
    availability: {
      hours: '24/7 online resources',
      days: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'],
      timezone: 'Australia/Sydney',
      is24x7: true
    },
    targetAudience: ['adults', 'professionals', 'researchers'],
    services: ['self_help_tools', 'information', 'research'],
    cost: 'free',
    location: {
      state: 'NSW',
      isNational: true
    },
    languages: ['English'],
    specializations: ['depression', 'bipolar', 'mood_disorders', 'workplace_mental_health'],
    rating: 4.6,
    reviewCount: 890,
    isVerified: true,
    lastVerified: new Date()
  },
  {
    title: 'Centre for Rural and Remote Mental Health',
    description: 'Specialized services for rural and remote communities in NSW, providing culturally appropriate mental health support.',
    category: 'professional',
    resourceType: 'telehealth',
    contactInfo: {
      phone: '02 6759 2111',
      website: 'https://www.crrmh.com.au',
      email: 'info@crrmh.com.au'
    },
    availability: {
      hours: '8:30 AM - 5:00 PM',
      days: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'],
      timezone: 'Australia/Sydney',
      is24x7: false
    },
    targetAudience: ['rural_residents', 'indigenous', 'farmers'],
    services: ['telehealth', 'counseling', 'training'],
    cost: 'bulk_billed',
    location: {
      state: 'NSW',
      region: 'Rural NSW',
      isNational: false
    },
    languages: ['English'],
    specializations: ['rural_mental_health', 'indigenous_mental_health', 'trauma'],
    rating: 4.7,
    reviewCount: 95,
    isVerified: true,
    lastVerified: new Date()
  },
  {
    title: 'Mindspot',
    description: 'Free online assessment and treatment service for Australian adults with anxiety and depression.',
    category: 'telehealth',
    resourceType: 'website',
    contactInfo: {
      phone: '1800 61 44 34',
      website: 'https://mindspot.org.au'
    },
    availability: {
      hours: '8:00 AM - 8:00 PM',
      days: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'],
      timezone: 'Australia/Sydney',
      is24x7: false
    },
    targetAudience: ['adults'],
    services: ['online_therapy', 'assessment', 'self_help_programs'],
    cost: 'free',
    location: {
      state: 'NSW',
      isNational: true
    },
    languages: ['English', 'Arabic'],
    specializations: ['anxiety', 'depression', 'online_therapy'],
    rating: 4.2,
    reviewCount: 540,
    isVerified: true,
    lastVerified: new Date()
  }
];

async function seedMentalHealthResources() {
  try {
    // Connect to MongoDB
    await mongoose.connect(config.database.uri);
    console.log('Connected to MongoDB');

    // Clear existing resources
    await MentalHealthResource.deleteMany({});
    console.log('Cleared existing mental health resources');

    // Insert new resources
    const insertedResources = await MentalHealthResource.insertMany(mentalHealthResources);
    console.log(`Inserted ${insertedResources.length} mental health resources`);

    console.log('Mental health resources seeded successfully!');
  } catch (error) {
    console.error('Error seeding mental health resources:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

// Run the seeding function
if (require.main === module) {
  seedMentalHealthResources();
}

export default seedMentalHealthResources;