// @ts-nocheck
/**
 * Demo Data Seeding Script for Hackathon
 * Creates realistic dummy data for all features
 */

import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { config } from '../src/config';

// Import models
import { User } from '../src/models/User';
import Farm from '../src/models/Farm';
import Business from '../src/models/Business';
import CulturalStory from '../src/models/CulturalStory';
import { Skill } from '../src/models/Skill';
import { UserSkill } from '../src/models/UserSkill';
import GigJob from '../src/models/GigJob';
import ServiceListing from '../src/models/ServiceListing';
import BlockchainCredential from '../src/models/BlockchainCredential';
import SpiritAvatar from '../src/models/SpiritAvatar';
import Resource from '../src/models/Resource';
import EmergencyAlert from '../src/models/EmergencyAlert';
import WellbeingCheckIn from '../src/models/WellbeingCheckIn';
import ChatRoom from '../src/models/ChatRoom';
import ChatMessage from '../src/models/ChatMessage';

async function seedDemoData() {
    try {
        console.log('🌱 Starting demo data seeding...');

        // Connect to database
        await mongoose.connect(config.database.uri);
        console.log('✅ Connected to MongoDB');

        // Clear existing data
        console.log('🗑️  Clearing existing data...');
        await Promise.all([
            User.deleteMany({}),
            Farm.deleteMany({}),
            Business.deleteMany({}),
            CulturalStory.deleteMany({}),
            Skill.deleteMany({}),
            UserSkill.deleteMany({}),
            GigJob.deleteMany({}),
            ServiceListing.deleteMany({}),
            BlockchainCredential.deleteMany({}),
            SpiritAvatar.deleteMany({}),
            Resource.deleteMany({}),
            EmergencyAlert.deleteMany({}),
            WellbeingCheckIn.deleteMany({}),
            ChatRoom.deleteMany({}),
            ChatMessage.deleteMany({})
        ]);
        console.log('✅ Cleared existing data');

        // Seed continues in next part...

        // Create demo users
        console.log('👥 Creating demo users...');
        const hashedPassword = await bcrypt.hash('demo123', 10);

        const users = await User.insertMany([
            {
                username: 'sarah_farmer',
                email: 'sarah@demo.com',
                password: hashedPassword,
                firstName: 'Sarah',
                lastName: 'Thompson',
                role: 'user',
                profile: {
                    bio: 'Third-generation farmer passionate about sustainable agriculture',
                    location: {
                        state: 'NSW',
                        region: 'Central West',
                        postcode: '2800',
                        coordinates: { latitude: -33.4189, longitude: 149.5778 }
                    },
                    interests: ['Sustainable Farming', 'Community', 'Indigenous Culture'],
                    skills: ['Crop Management', 'Livestock Care', 'Water Conservation']
                }
            },
            {
                username: 'jack_elder',
                email: 'jack@demo.com',
                password: hashedPassword,
                firstName: 'Jack',
                lastName: 'Williams',
                role: 'user',
                profile: {
                    bio: 'Elder and cultural knowledge keeper, sharing stories for 40+ years',
                    location: {
                        state: 'QLD',
                        region: 'Far North Queensland',
                        postcode: '4870',
                        coordinates: { latitude: -16.9186, longitude: 145.7781 }
                    },
                    interests: ['Cultural Heritage', 'Storytelling', 'Traditional Skills'],
                    skills: ['Traditional Crafts', 'Bush Medicine', 'Language Teaching']
                }
            },
            {
                username: 'emma_health',
                email: 'emma@demo.com',
                password: hashedPassword,
                firstName: 'Emma',
                lastName: 'Chen',
                role: 'user',
                profile: {
                    bio: 'Mental health counselor specializing in rural communities',
                    location: {
                        state: 'VIC',
                        region: 'Gippsland',
                        postcode: '3850',
                        coordinates: { latitude: -37.8136, longitude: 147.1320 }
                    },
                    interests: ['Mental Health', 'Community Support', 'Wellbeing'],
                    skills: ['Counseling', 'Crisis Support', 'Group Facilitation']
                }
            },
            {
                username: 'tom_tech',
                email: 'tom@demo.com',
                password: hashedPassword,
                firstName: 'Tom',
                lastName: 'Anderson',
                role: 'user',
                profile: {
                    bio: 'Tech enthusiast helping rural communities embrace digital tools',
                    location: {
                        state: 'SA',
                        region: 'Riverland',
                        postcode: '5341',
                        coordinates: { latitude: -34.1833, longitude: 140.7833 }
                    },
                    interests: ['Technology', 'Education', 'Innovation'],
                    skills: ['Web Development', 'Digital Literacy', 'Tech Support']
                }
            },
            {
                username: 'lisa_business',
                email: 'lisa@demo.com',
                password: hashedPassword,
                firstName: 'Lisa',
                lastName: 'Martinez',
                role: 'user',
                profile: {
                    bio: 'Small business owner and community connector',
                    location: {
                        state: 'WA',
                        region: 'Wheatbelt',
                        postcode: '6401',
                        coordinates: { latitude: -31.9505, longitude: 116.8228 }
                    },
                    interests: ['Business', 'Community Development', 'Local Economy'],
                    skills: ['Business Management', 'Marketing', 'Event Planning']
                }
            }
        ]);
        console.log(`✅ Created ${users.length} demo users`);

        // Create farms
        console.log('🚜 Creating farms...');
        const farms = await Farm.insertMany([
            {
                userId: users[0]._id,
                name: 'Thompson Family Farm',
                location: {
                    state: 'NSW',
                    region: 'Central West',
                    coordinates: { latitude: -33.4189, longitude: 149.5778 }
                },
                size: 500,
                farmType: 'mixed',
                crops: ['Wheat', 'Barley', 'Canola'],
                livestock: ['Sheep', 'Cattle'],
                soilType: 'Clay loam',
                irrigationType: 'Drip irrigation',
                sustainabilityPractices: ['Crop rotation', 'Water conservation', 'Organic fertilizers']
            },
            {
                userId: users[3]._id,
                name: 'Riverside Organic Farm',
                location: {
                    state: 'SA',
                    region: 'Riverland',
                    coordinates: { latitude: -34.1833, longitude: 140.7833 }
                },
                size: 200,
                farmType: 'crop',
                crops: ['Citrus', 'Stone Fruit', 'Vegetables'],
                soilType: 'Sandy loam',
                irrigationType: 'Drip irrigation',
                sustainabilityPractices: ['Organic certification', 'Composting', 'Biodiversity corridors']
            }
        ]);
        console.log(`✅ Created ${farms.length} farms`);

        // Create businesses
        console.log('🏪 Creating businesses...');
        const businesses = await Business.insertMany([
            {
                ownerId: users[4]._id,
                name: 'Wheatbelt General Store',
                description: 'Your one-stop shop for groceries, hardware, and community essentials',
                category: 'retail',
                subcategory: 'General Store',
                location: {
                    state: 'WA',
                    region: 'Wheatbelt',
                    address: '45 Main Street, Northam',
                    postcode: '6401',
                    coordinates: { latitude: -31.9505, longitude: 116.8228 }
                },
                contact: {
                    phone: '(08) 9622 1234',
                    email: 'info@wheatbeltstore.com.au',
                    website: 'https://wheatbeltstore.com.au'
                },
                operatingHours: {
                    monday: { open: '08:00', close: '18:00', isOpen: true },
                    tuesday: { open: '08:00', close: '18:00', isOpen: true },
                    wednesday: { open: '08:00', close: '18:00', isOpen: true },
                    thursday: { open: '08:00', close: '18:00', isOpen: true },
                    friday: { open: '08:00', close: '19:00', isOpen: true },
                    saturday: { open: '09:00', close: '17:00', isOpen: true },
                    sunday: { open: '10:00', close: '16:00', isOpen: true }
                },
                services: ['Groceries', 'Hardware', 'Post Office', 'Fuel'],
                rating: 4.7,
                reviewCount: 23
            },
            {
                ownerId: users[2]._id,
                name: 'Gippsland Wellness Center',
                description: 'Holistic health and wellness services for rural communities',
                category: 'health',
                subcategory: 'Wellness Center',
                location: {
                    state: 'VIC',
                    region: 'Gippsland',
                    address: '12 Health Street, Sale',
                    postcode: '3850',
                    coordinates: { latitude: -37.8136, longitude: 147.1320 }
                },
                contact: {
                    phone: '(03) 5144 5678',
                    email: 'hello@gippslandwellness.com.au'
                },
                services: ['Counseling', 'Yoga', 'Meditation', 'Massage Therapy'],
                rating: 4.9,
                reviewCount: 45
            }
        ]);
        console.log(`✅ Created ${businesses.length} businesses`);

        // Create cultural stories
        console.log('📖 Creating cultural stories...');
        const stories = await CulturalStory.insertMany([
            {
                authorId: users[1]._id,
                title: 'The Dreamtime Story of the Rainbow Serpent',
                content: 'Long ago, before time began, the Rainbow Serpent slept beneath the earth. When she awoke, she pushed through the surface, creating mountains, valleys, and rivers with her powerful body. This is how our land was formed, and why we must respect and care for it...',
                type: 'oral_history',
                language: 'English',
                region: 'Far North Queensland',
                tags: ['Dreamtime', 'Creation Story', 'Rainbow Serpent', 'Traditional'],
                culturalSignificance: 'high',
                isPublic: true,
                viewCount: 156,
                likeCount: 42
            },
            {
                authorId: users[1]._id,
                title: 'Traditional Bush Medicine: Healing with Native Plants',
                content: 'For thousands of years, our people have used the plants of this land for healing. The tea tree provides antiseptic properties, eucalyptus helps with respiratory issues, and kakadu plum is rich in vitamin C. This knowledge, passed down through generations, is a gift we must preserve...',
                type: 'traditional_knowledge',
                language: 'English',
                region: 'Far North Queensland',
                tags: ['Bush Medicine', 'Traditional Knowledge', 'Healing', 'Plants'],
                culturalSignificance: 'high',
                isPublic: true,
                viewCount: 203,
                likeCount: 67
            },
            {
                authorId: users[0]._id,
                title: 'Farming Through the Generations',
                content: 'My grandfather started this farm in 1952 with nothing but determination and a dream. He taught my father, who taught me, about reading the land, respecting the seasons, and working with nature rather than against it. Now I teach my children these same lessons...',
                type: 'personal_story',
                language: 'English',
                region: 'Central West NSW',
                tags: ['Farming', 'Family History', 'Agriculture', 'Heritage'],
                culturalSignificance: 'medium',
                isPublic: true,
                viewCount: 89,
                likeCount: 34
            }
        ]);
        console.log(`✅ Created ${stories.length} cultural stories`);

        // Create skills
        console.log('🎯 Creating skills...');
        const skills = await Skill.insertMany([
            {
                name: 'Traditional Basket Weaving',
                category: 'traditional_crafts',
                description: 'Ancient technique using native grasses and reeds',
                difficulty: 'intermediate',
                tags: ['Traditional', 'Crafts', 'Indigenous']
            },
            {
                name: 'Sustainable Farming Practices',
                category: 'agriculture',
                description: 'Modern sustainable agriculture techniques',
                difficulty: 'intermediate',
                tags: ['Farming', 'Sustainability', 'Agriculture']
            },
            {
                name: 'Digital Literacy for Seniors',
                category: 'technology',
                description: 'Teaching technology skills to older community members',
                difficulty: 'beginner',
                tags: ['Technology', 'Education', 'Community']
            },
            {
                name: 'Mental Health First Aid',
                category: 'health',
                description: 'Providing initial support for mental health crises',
                difficulty: 'intermediate',
                tags: ['Mental Health', 'First Aid', 'Support']
            }
        ]);
        console.log(`✅ Created ${skills.length} skills`);

        // Create gig jobs
        console.log('💼 Creating gig jobs...');
        const gigs = await GigJob.insertMany([
            {
                posterId: users[0]._id,
                title: 'Help Needed with Harvest',
                description: 'Looking for 2-3 people to help with wheat harvest. Experience with farm machinery preferred but not required. Will provide training.',
                category: 'agriculture',
                budget: { min: 25, max: 35, currency: 'AUD', type: 'hourly' },
                duration: '2 weeks',
                location: {
                    state: 'NSW',
                    region: 'Central West',
                    coordinates: { latitude: -33.4189, longitude: 149.5778 }
                },
                skills: ['Farm Work', 'Physical Labor', 'Machinery Operation'],
                status: 'open',
                urgency: 'high'
            },
            {
                posterId: users[4]._id,
                title: 'Social Media Manager for Local Business',
                description: 'Need someone to manage Facebook and Instagram for our general store. 5-10 hours per week, flexible schedule.',
                category: 'marketing',
                budget: { min: 500, max: 800, currency: 'AUD', type: 'monthly' },
                duration: 'Ongoing',
                location: {
                    state: 'WA',
                    region: 'Wheatbelt',
                    coordinates: { latitude: -31.9505, longitude: 116.8228 }
                },
                skills: ['Social Media', 'Marketing', 'Content Creation'],
                status: 'open',
                urgency: 'medium'
            },
            {
                posterId: users[2]._id,
                title: 'Peer Support Volunteer',
                description: 'Seeking compassionate individuals to provide peer support for mental health programs. Training provided.',
                category: 'community',
                budget: { min: 0, max: 0, currency: 'AUD', type: 'volunteer' },
                duration: '6 months minimum',
                location: {
                    state: 'VIC',
                    region: 'Gippsland',
                    coordinates: { latitude: -37.8136, longitude: 147.1320 }
                },
                skills: ['Empathy', 'Active Listening', 'Communication'],
                status: 'open',
                urgency: 'medium'
            }
        ]);
        console.log(`✅ Created ${gigs.length} gig jobs`);

        // Create service listings
        console.log('🔧 Creating service listings...');
        const services = await ServiceListing.insertMany([
            {
                providerId: users[2]._id,
                name: 'Mental Health Counseling',
                description: 'Professional counseling services for individuals and families dealing with stress, anxiety, depression, and life transitions.',
                category: 'health',
                subcategory: 'Mental Health',
                serviceType: 'professional',
                location: {
                    state: 'VIC',
                    region: 'Gippsland',
                    coordinates: { latitude: -37.8136, longitude: 147.1320 }
                },
                pricing: { amount: 120, currency: 'AUD', unit: 'session' },
                availability: 'By appointment',
                contact: { phone: '0412 345 678', email: 'emma@demo.com' },
                rating: 4.9,
                reviewCount: 28
            },
            {
                providerId: users[3]._id,
                name: 'Tech Support & Training',
                description: 'Help with computers, smartphones, internet setup, and digital skills training. Patient and friendly service for all ages.',
                category: 'technology',
                subcategory: 'IT Support',
                serviceType: 'professional',
                location: {
                    state: 'SA',
                    region: 'Riverland',
                    coordinates: { latitude: -34.1833, longitude: 140.7833 }
                },
                pricing: { amount: 60, currency: 'AUD', unit: 'hour' },
                availability: 'Flexible hours',
                contact: { phone: '0423 456 789', email: 'tom@demo.com' },
                rating: 4.8,
                reviewCount: 15
            }
        ]);
        console.log(`✅ Created ${services.length} service listings`);

        // Create blockchain credentials
        console.log('🔐 Creating blockchain credentials...');
        const credentials = await BlockchainCredential.insertMany([
            {
                userId: users[1]._id,
                credentialType: 'skill_certification',
                metadata: {
                    skillName: 'Traditional Basket Weaving',
                    level: 'Master',
                    issuer: 'Indigenous Cultural Council',
                    description: 'Certified master in traditional basket weaving techniques'
                },
                verifiedBy: users[2]._id,
                blockchainTxHash: '0x' + Math.random().toString(16).substr(2, 64),
                status: 'verified'
            },
            {
                userId: users[0]._id,
                credentialType: 'achievement',
                metadata: {
                    achievementName: 'Sustainable Farming Champion',
                    year: '2024',
                    issuer: 'Rural Sustainability Network',
                    description: 'Recognized for outstanding sustainable farming practices'
                },
                verifiedBy: users[3]._id,
                blockchainTxHash: '0x' + Math.random().toString(16).substr(2, 64),
                status: 'verified'
            },
            {
                userId: users[2]._id,
                credentialType: 'professional_license',
                metadata: {
                    licenseName: 'Mental Health Counselor',
                    licenseNumber: 'MHC-2024-1234',
                    issuer: 'Australian Counseling Association',
                    expiryDate: new Date('2025-12-31')
                },
                verifiedBy: users[4]._id,
                blockchainTxHash: '0x' + Math.random().toString(16).substr(2, 64),
                status: 'verified'
            }
        ]);
        console.log(`✅ Created ${credentials.length} blockchain credentials`);

        // Create spirit avatars
        console.log('✨ Creating spirit avatars...');
        const avatars = await SpiritAvatar.insertMany([
            {
                userId: users[0]._id,
                name: 'Golden Harvest Spirit',
                animalSpirit: 'Eagle',
                colorPalette: ['#FFD700', '#8B4513', '#228B22'],
                traits: ['Visionary', 'Hardworking', 'Connected to Land'],
                elements: ['Earth', 'Air'],
                generationPrompt: 'A majestic eagle soaring over golden wheat fields',
                imageUrl: '/avatars/golden-harvest-spirit.png'
            },
            {
                userId: users[1]._id,
                name: 'Ancient Wisdom Keeper',
                animalSpirit: 'Owl',
                colorPalette: ['#8B4513', '#DEB887', '#2F4F4F'],
                traits: ['Wise', 'Patient', 'Teacher'],
                elements: ['Earth', 'Spirit'],
                generationPrompt: 'A wise owl perched on ancient eucalyptus',
                imageUrl: '/avatars/ancient-wisdom-keeper.png'
            },
            {
                userId: users[2]._id,
                name: 'Healing Waters Spirit',
                animalSpirit: 'Dolphin',
                colorPalette: ['#4682B4', '#87CEEB', '#98FB98'],
                traits: ['Compassionate', 'Healing', 'Nurturing'],
                elements: ['Water', 'Spirit'],
                generationPrompt: 'A gentle dolphin in crystal clear healing waters',
                imageUrl: '/avatars/healing-waters-spirit.png'
            }
        ]);
        console.log(`✅ Created ${avatars.length} spirit avatars`);

        // Create resources
        console.log('📚 Creating resources...');
        const resources = await Resource.insertMany([
            {
                title: 'Mental Health Support Line',
                description: '24/7 crisis support and counseling services for rural communities',
                category: 'health',
                subcategory: 'Mental Health',
                type: 'service',
                location: {
                    state: 'National',
                    coverage: 'national'
                },
                contact: {
                    phone: '1800 123 456',
                    website: 'https://ruralmindcare.org.au'
                },
                accessibility: {
                    wheelchairAccessible: true,
                    languageSupport: ['English', 'Indigenous Languages']
                },
                rating: 4.8,
                reviewCount: 234
            },
            {
                title: 'Sustainable Farming Guide',
                description: 'Comprehensive guide to sustainable and regenerative farming practices',
                category: 'agriculture',
                subcategory: 'Education',
                type: 'information',
                location: {
                    state: 'National',
                    coverage: 'national'
                },
                contact: {
                    website: 'https://sustainablefarmingguide.com.au'
                },
                tags: ['Farming', 'Sustainability', 'Education'],
                rating: 4.6,
                reviewCount: 89
            },
            {
                title: 'Indigenous Cultural Center',
                description: 'Community center offering cultural programs, language classes, and traditional skills workshops',
                category: 'culture',
                subcategory: 'Community Center',
                type: 'facility',
                location: {
                    state: 'QLD',
                    region: 'Far North Queensland',
                    coordinates: { latitude: -16.9186, longitude: 145.7781 }
                },
                contact: {
                    phone: '(07) 4041 1234',
                    email: 'info@culturalcenter.org.au'
                },
                operatingHours: {
                    monday: '09:00-17:00',
                    tuesday: '09:00-17:00',
                    wednesday: '09:00-17:00',
                    thursday: '09:00-17:00',
                    friday: '09:00-17:00'
                },
                rating: 4.9,
                reviewCount: 156
            }
        ]);
        console.log(`✅ Created ${resources.length} resources`);

        // Create emergency alerts
        console.log('🚨 Creating emergency alerts...');
        const alerts = await EmergencyAlert.insertMany([
            {
                reportedBy: users[0]._id,
                type: 'weather',
                severity: 'moderate',
                title: 'Severe Storm Warning',
                description: 'Severe thunderstorms expected in the Central West region. Heavy rain and strong winds possible.',
                location: {
                    state: 'NSW',
                    region: 'Central West',
                    coordinates: { latitude: -33.4189, longitude: 149.5778 },
                    radius: 50
                },
                affectedAreas: ['Orange', 'Bathurst', 'Dubbo'],
                status: 'active',
                priority: 'high'
            },
            {
                reportedBy: users[3]._id,
                type: 'community',
                severity: 'low',
                title: 'Community Meeting - Water Management',
                description: 'Important community meeting to discuss water allocation and conservation strategies.',
                location: {
                    state: 'SA',
                    region: 'Riverland',
                    coordinates: { latitude: -34.1833, longitude: 140.7833 },
                    radius: 30
                },
                status: 'active',
                priority: 'medium'
            }
        ]);
        console.log(`✅ Created ${alerts.length} emergency alerts`);

        // Create wellbeing check-ins
        console.log('💚 Creating wellbeing check-ins...');
        const checkIns = await WellbeingCheckIn.insertMany([
            {
                userId: users[0]._id,
                mood: 7,
                stressLevel: 4,
                sleepQuality: 6,
                physicalHealth: 7,
                socialConnection: 8,
                notes: 'Feeling good overall. Harvest is going well and weather has been cooperative.',
                tags: ['positive', 'productive']
            },
            {
                userId: users[2]._id,
                mood: 8,
                stressLevel: 3,
                sleepQuality: 8,
                physicalHealth: 8,
                socialConnection: 9,
                notes: 'Great week! Helped several community members and feeling fulfilled.',
                tags: ['positive', 'fulfilled']
            }
        ]);
        console.log(`✅ Created ${checkIns.length} wellbeing check-ins`);

        // Create chat rooms
        console.log('💬 Creating chat rooms...');
        const chatRooms = await ChatRoom.insertMany([
            {
                name: 'Sustainable Farming Group',
                type: 'community',
                participants: [
                    { userId: users[0]._id, username: users[0].username, role: 'admin' },
                    { userId: users[3]._id, username: users[3].username, role: 'member' }
                ],
                createdBy: users[0]._id,
                isPrivate: false,
                settings: {
                    allowFileSharing: true,
                    allowVoiceMessages: true,
                    allowVideoCall: true,
                    moderationEnabled: false
                },
                metadata: {
                    tags: ['Farming', 'Sustainability', 'Community']
                }
            },
            {
                name: 'Cultural Heritage Keepers',
                type: 'community',
                participants: [
                    { userId: users[1]._id, username: users[1].username, role: 'admin' },
                    { userId: users[0]._id, username: users[0].username, role: 'member' },
                    { userId: users[2]._id, username: users[2].username, role: 'member' }
                ],
                createdBy: users[1]._id,
                isPrivate: false,
                settings: {
                    allowFileSharing: true,
                    allowVoiceMessages: true,
                    allowVideoCall: true,
                    moderationEnabled: false
                },
                metadata: {
                    tags: ['Culture', 'Heritage', 'Stories']
                }
            }
        ]);
        console.log(`✅ Created ${chatRooms.length} chat rooms`);

        // Create chat messages
        console.log('💬 Creating chat messages...');
        const messages = await ChatMessage.insertMany([
            {
                senderId: users[0]._id,
                senderName: users[0].username,
                roomId: chatRooms[0]._id,
                content: 'Hey everyone! Just wanted to share that our new drip irrigation system is working great. Water usage down 30%!',
                type: 'text'
            },
            {
                senderId: users[3]._id,
                senderName: users[3].username,
                roomId: chatRooms[0]._id,
                content: 'That\'s fantastic Sarah! Would love to learn more about your setup. Maybe we could arrange a farm visit?',
                type: 'text'
            },
            {
                senderId: users[1]._id,
                senderName: users[1].username,
                roomId: chatRooms[1]._id,
                content: 'Welcome to the Cultural Heritage Keepers group! This is a space to share stories, knowledge, and preserve our traditions.',
                type: 'text'
            }
        ]);
        console.log(`✅ Created ${messages.length} chat messages`);

        console.log('\n🎉 Demo data seeding completed successfully!');
        console.log('\n📊 Summary:');
        console.log(`   - ${users.length} users`);
        console.log(`   - ${farms.length} farms`);
        console.log(`   - ${businesses.length} businesses`);
        console.log(`   - ${stories.length} cultural stories`);
        console.log(`   - ${skills.length} skills`);
        console.log(`   - ${gigs.length} gig jobs`);
        console.log(`   - ${services.length} service listings`);
        console.log(`   - ${credentials.length} blockchain credentials`);
        console.log(`   - ${avatars.length} spirit avatars`);
        console.log(`   - ${resources.length} resources`);
        console.log(`   - ${alerts.length} emergency alerts`);
        console.log(`   - ${checkIns.length} wellbeing check-ins`);
        console.log(`   - ${chatRooms.length} chat rooms`);
        console.log(`   - ${messages.length} chat messages`);
        console.log('\n🔑 Demo Login Credentials:');
        console.log('   Email: sarah@demo.com');
        console.log('   Password: demo123');
        console.log('\n   (All demo users have the same password: demo123)');

    } catch (error) {
        console.error('❌ Error seeding demo data:', error);
        throw error;
    } finally {
        await mongoose.disconnect();
        console.log('\n✅ Disconnected from MongoDB');
    }
}

// Run the seeding
seedDemoData()
    .then(() => {
        console.log('\n✨ All done! Your demo data is ready.');
        process.exit(0);
    })
    .catch((error) => {
        console.error('\n❌ Seeding failed:', error);
        process.exit(1);
    });
