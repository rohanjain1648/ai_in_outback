import Joi from 'joi';

export const skillValidation = {
  createSkill: Joi.object({
    name: Joi.string().trim().max(100).required(),
    category: Joi.string().valid(
      'Agriculture',
      'Crafts',
      'Technology',
      'Business',
      'Health',
      'Education',
      'Traditional',
      'Mechanical',
      'Creative',
      'Other'
    ).required(),
    description: Joi.string().max(500).required(),
    isTraditional: Joi.boolean().default(false),
    tags: Joi.array().items(Joi.string().trim().max(50)).max(10)
  }),

  addUserSkill: Joi.object({
    skillId: Joi.string().hex().length(24).required(),
    proficiencyLevel: Joi.string().valid('Beginner', 'Intermediate', 'Advanced', 'Expert').required(),
    canTeach: Joi.boolean().default(false),
    wantsToLearn: Joi.boolean().default(false),
    yearsOfExperience: Joi.number().min(0).max(100).default(0),
    certifications: Joi.array().items(Joi.string().max(200)).max(10),
    description: Joi.string().max(1000),
    availableForTeaching: Joi.boolean().default(false),
    teachingPreferences: Joi.object({
      format: Joi.array().items(Joi.string().valid('In-person', 'Online', 'Both')).min(1),
      groupSize: Joi.string().valid('Individual', 'Small Group', 'Large Group', 'Any').default('Any'),
      timeCommitment: Joi.string().valid('Flexible', 'Regular', 'Intensive').default('Flexible')
    })
  }),

  updateUserSkill: Joi.object({
    proficiencyLevel: Joi.string().valid('Beginner', 'Intermediate', 'Advanced', 'Expert'),
    canTeach: Joi.boolean(),
    wantsToLearn: Joi.boolean(),
    yearsOfExperience: Joi.number().min(0).max(100),
    certifications: Joi.array().items(Joi.string().max(200)).max(10),
    description: Joi.string().max(1000),
    availableForTeaching: Joi.boolean(),
    teachingPreferences: Joi.object({
      format: Joi.array().items(Joi.string().valid('In-person', 'Online', 'Both')).min(1),
      groupSize: Joi.string().valid('Individual', 'Small Group', 'Large Group', 'Any'),
      timeCommitment: Joi.string().valid('Flexible', 'Regular', 'Intensive')
    })
  }),

  createEndorsement: Joi.object({
    endorsedUserId: Joi.string().hex().length(24).required(),
    skillId: Joi.string().hex().length(24).required(),
    rating: Joi.number().min(1).max(5).required(),
    comment: Joi.string().max(500).required(),
    verificationMethod: Joi.string().valid(
      'Direct Experience',
      'Witnessed Work',
      'Certification Review',
      'Peer Recommendation'
    ).required()
  }),

  createLearningSession: Joi.object({
    learnerId: Joi.string().hex().length(24).required(),
    skillId: Joi.string().hex().length(24).required(),
    title: Joi.string().max(200).required(),
    description: Joi.string().max(1000).required(),
    format: Joi.string().valid('In-person', 'Online', 'Hybrid').required(),
    scheduledDate: Joi.date().greater('now').required(),
    duration: Joi.number().min(15).max(480).required(),
    location: Joi.object({
      coordinates: Joi.array().items(Joi.number()).length(2),
      address: Joi.string().max(200)
    }).when('format', {
      is: Joi.string().valid('In-person', 'Hybrid'),
      then: Joi.required()
    }),
    onlineLink: Joi.string().max(500).when('format', {
      is: Joi.string().valid('Online', 'Hybrid'),
      then: Joi.required()
    }),
    maxParticipants: Joi.number().min(1).max(50).default(1),
    materials: Joi.array().items(Joi.string().max(200)).max(20),
    prerequisites: Joi.array().items(Joi.string().max(200)).max(10),
    learningObjectives: Joi.array().items(Joi.string().max(200)).max(10),
    isRecurring: Joi.boolean().default(false),
    recurringPattern: Joi.object({
      frequency: Joi.string().valid('Weekly', 'Biweekly', 'Monthly').required(),
      endDate: Joi.date().greater(Joi.ref('scheduledDate')).required()
    }).when('isRecurring', {
      is: true,
      then: Joi.required()
    })
  }),

  updateLearningSession: Joi.object({
    title: Joi.string().max(200),
    description: Joi.string().max(1000),
    status: Joi.string().valid('Scheduled', 'In Progress', 'Completed', 'Cancelled'),
    scheduledDate: Joi.date().greater('now'),
    duration: Joi.number().min(15).max(480),
    location: Joi.object({
      coordinates: Joi.array().items(Joi.number()).length(2),
      address: Joi.string().max(200)
    }),
    onlineLink: Joi.string().max(500),
    maxParticipants: Joi.number().min(1).max(50),
    materials: Joi.array().items(Joi.string().max(200)).max(20),
    prerequisites: Joi.array().items(Joi.string().max(200)).max(10),
    learningObjectives: Joi.array().items(Joi.string().max(200)).max(10),
    feedback: Joi.object({
      teacherRating: Joi.number().min(1).max(5),
      learnerRating: Joi.number().min(1).max(5),
      teacherComment: Joi.string().max(500),
      learnerComment: Joi.string().max(500),
      skillsLearned: Joi.array().items(Joi.string().max(100)).max(20)
    })
  }),

  createSkillExchange: Joi.object({
    participantB: Joi.string().hex().length(24).required(),
    skillOfferedByA: Joi.string().hex().length(24).required(),
    skillRequestedByA: Joi.string().hex().length(24).required(),
    skillOfferedByB: Joi.string().hex().length(24).required(),
    skillRequestedByB: Joi.string().hex().length(24).required(),
    exchangeType: Joi.string().valid('Direct', 'Time Bank', 'Skill Credits').default('Direct'),
    timeCommitment: Joi.object({
      hoursOfferedByA: Joi.number().min(1).max(100).required(),
      hoursOfferedByB: Joi.number().min(1).max(100).required()
    }).required()
  }),

  updateSkillExchange: Joi.object({
    status: Joi.string().valid('Proposed', 'Accepted', 'In Progress', 'Completed', 'Cancelled'),
    schedule: Joi.object({
      sessionAtoB: Joi.array().items(Joi.date().greater('now')),
      sessionBtoA: Joi.array().items(Joi.date().greater('now'))
    }),
    completionTracking: Joi.object({
      sessionsCompletedAtoB: Joi.number().min(0),
      sessionsCompletedBtoA: Joi.number().min(0),
      totalSessionsAtoB: Joi.number().min(0),
      totalSessionsBtoA: Joi.number().min(0)
    }),
    feedback: Joi.object({
      fromA: Joi.object({
        rating: Joi.number().min(1).max(5),
        comment: Joi.string().max(500),
        skillsLearned: Joi.array().items(Joi.string().max(100)).max(20)
      }),
      fromB: Joi.object({
        rating: Joi.number().min(1).max(5),
        comment: Joi.string().max(500),
        skillsLearned: Joi.array().items(Joi.string().max(100)).max(20)
      })
    })
  }),

  skillsQuery: Joi.object({
    category: Joi.string().valid(
      'Agriculture',
      'Crafts',
      'Technology',
      'Business',
      'Health',
      'Education',
      'Traditional',
      'Mechanical',
      'Creative',
      'Other'
    ),
    isTraditional: Joi.boolean(),
    search: Joi.string().max(100)
  }),

  matchQuery: Joi.object({
    skillId: Joi.string().hex().length(24).required(),
    type: Joi.string().valid('teacher', 'learner').required()
  }),

  exchangeMatchQuery: Joi.object({
    offeredSkillId: Joi.string().hex().length(24).required(),
    requestedSkillId: Joi.string().hex().length(24).required()
  })
};