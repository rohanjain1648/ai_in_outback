import mongoose from 'mongoose';
import { ServiceListing } from '../src/models/ServiceListing';
import { config } from '../src/config';

const sampleServices = [
    {
        name: 'Rural Health Clinic - Dubbo',
        category: 'health',
        subcategory: 'General Practice',
        description: 'Comprehensive primary healthcare services for rural communities. Bulk billing available for eligible patients.',
        location: {
            type: 'Point',
            coordinates: [148.6011, -32.2426],
            address: '123 Macquarie St, Dubbo NSW 2830',
            city: 'Dubbo',
            state: 'NSW',
            postcode: '2830',
            region: 'Central West NSW'
        },
        contact: {
            phone: '02 6884 5555',
            email: 'info@dubbohealthclinic.com.au',
            website: 'https://dubbohealthclinic.com.au',
            hours: 'Mon-Fri 8am-6pm, Sat 9am-1pm'
        },
        services: ['General Practice', 'Emergency Care', 'Vaccinations', 'Health Checks', 'Chronic Disease Management'],
        isVerified: true,
        source: 'manual',
        offlineAvailable: true,
        isEssential: true,
        tags: ['health', 'clinic', 'emergency', 'bulk-billing'],
        accessibility: {
            wheelchairAccessible: true,
            parkingAvailable: true,
            publicTransportNearby: true,
            interpreterServices: true
        }
    },
    {
        name: 'Centrelink - Wagga Wagga',
        category: 'government',
        subcategory: 'Social Services',
        description: 'Government services including Centrelink, Medicare, and Child Support. Appointments recommended.',
        location: {
            type: 'Point',
            coordinates: [147.3598, -35.1082],
            address: '45 Baylis St, Wagga Wagga NSW 2650',
            city: 'Wagga Wagga',
            state: 'NSW',
            postcode: '2650',
            region: 'Riverina NSW'
        },
        contact: {
            phone: '132 850',
            website: 'https://www.servicesaustralia.gov.au',
            hours: 'Mon-Fri 9am-4pm'
        },
        services: ['Centrelink', 'Medicare', 'Child Support', 'Job Services', 'Family Assistance'],
        isVerified: true,
        source: 'government_api',
        offlineAvailable: true,
        isEssential: true,
        tags: ['government', 'centrelink', 'medicare', 'social-services'],
        accessibility: {
            wheelchairAccessible: true,
            parkingAvailable: true,
            interpreterServices: true
        }
    },
    {
        name: 'Rural Bus Service - Orange',
        category: 'transport',
        subcategory: 'Public Transport',
        description: 'Local bus services connecting Orange with surrounding rural areas. Concession fares available.',
        location: {
            type: 'Point',
            coordinates: [149.0988, -33.2838],
            address: 'Orange Bus Depot, 78 Kite St, Orange NSW 2800',
            city: 'Orange',
            state: 'NSW',
            postcode: '2800',
            region: 'Central West NSW'
        },
        contact: {
            phone: '02 6361 7788',
            email: 'info@orangebuses.com.au',
            website: 'https://orangebuses.com.au',
            hours: 'Services run Mon-Sat 6am-8pm'
        },
        services: ['Local Bus Routes', 'School Bus Services', 'Community Transport', 'Accessible Transport'],
        isVerified: true,
        source: 'manual',
        offlineAvailable: true,
        isEssential: false,
        tags: ['transport', 'bus', 'public-transport', 'accessible'],
        accessibility: {
            wheelchairAccessible: true,
            parkingAvailable: true
        }
    },
    {
        name: 'Emergency Services - Tamworth',
        category: 'emergency',
        subcategory: 'Emergency Response',
        description: '24/7 emergency services including ambulance, fire, and police. Call 000 for emergencies.',
        location: {
            type: 'Point',
            coordinates: [150.9294, -31.0927],
            address: 'Tamworth Emergency Services Complex, 100 Marius St, Tamworth NSW 2340',
            city: 'Tamworth',
            state: 'NSW',
            postcode: '2340',
            region: 'New England NSW'
        },
        contact: {
            phone: '000',
            emergencyContact: '000',
            hours: '24/7'
        },
        services: ['Ambulance', 'Fire Brigade', 'Police', 'SES', 'Emergency Medical'],
        isVerified: true,
        source: 'government_api',
        offlineAvailable: true,
        isEssential: true,
        tags: ['emergency', 'ambulance', 'fire', 'police', '24-7'],
        accessibility: {
            wheelchairAccessible: true,
            parkingAvailable: true
        }
    },
    {
        name: 'Albury Community Legal Centre',
        category: 'legal',
        subcategory: 'Legal Aid',
        description: 'Free legal advice and assistance for people who cannot afford a lawyer. Appointments essential.',
        location: {
            type: 'Point',
            coordinates: [146.9132, -36.0737],
            address: '553 Kiewa St, Albury NSW 2640',
            city: 'Albury',
            state: 'NSW',
            postcode: '2640',
            region: 'Murray NSW'
        },
        contact: {
            phone: '02 6021 3655',
            email: 'admin@alburycommunitylegal.org.au',
            website: 'https://alburycommunitylegal.org.au',
            hours: 'Mon-Fri 9am-5pm'
        },
        services: ['Legal Advice', 'Court Support', 'Family Law', 'Tenancy Issues', 'Employment Law'],
        isVerified: true,
        source: 'community',
        offlineAvailable: false,
        isEssential: false,
        tags: ['legal', 'legal-aid', 'free-advice', 'community'],
        eligibility: {
            incomeRequirements: 'Must meet income test criteria',
            residencyRequirements: 'Must reside in Albury-Wodonga region'
        }
    },
    {
        name: 'Bathurst TAFE',
        category: 'education',
        subcategory: 'Vocational Training',
        description: 'Technical and vocational education courses including agriculture, trades, and business.',
        location: {
            type: 'Point',
            coordinates: [149.5806, -33.4192],
            address: '70 Keppel St, Bathurst NSW 2795',
            city: 'Bathurst',
            state: 'NSW',
            postcode: '2795',
            region: 'Central West NSW'
        },
        contact: {
            phone: '02 6338 4200',
            email: 'bathurst@tafensw.edu.au',
            website: 'https://www.tafensw.edu.au/bathurst',
            hours: 'Mon-Fri 8:30am-5pm'
        },
        services: ['Agriculture Courses', 'Trade Training', 'Business Courses', 'IT Training', 'Apprenticeships'],
        isVerified: true,
        source: 'government_api',
        offlineAvailable: false,
        isEssential: false,
        tags: ['education', 'tafe', 'training', 'vocational', 'agriculture']
    }
];

async function seedServiceListings() {
    try {
        // Connect to MongoDB
        await mongoose.connect(config.database.uri);
        console.log('Connected to MongoDB');

        // Clear existing service listings
        await ServiceListing.deleteMany({});
        console.log('Cleared existing service listings');

        // Insert sample services
        const services = await ServiceListing.insertMany(sampleServices);
        console.log(`✅ Successfully seeded ${services.length} service listings`);

        // Display summary
        console.log('\nSeeded Services:');
        services.forEach((service, index) => {
            console.log(`${index + 1}. ${service.name} (${service.category}) - ${service.location.city}`);
        });

        await mongoose.disconnect();
        console.log('\nDisconnected from MongoDB');
    } catch (error) {
        console.error('Error seeding service listings:', error);
        process.exit(1);
    }
}

// Run the seed function
if (require.main === module) {
    seedServiceListings();
}

export { seedServiceListings };
