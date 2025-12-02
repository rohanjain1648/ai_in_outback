/**
 * Utility functions for anonymization in peer support features
 */

const ADJECTIVES = [
  'Kind', 'Gentle', 'Wise', 'Caring', 'Peaceful', 'Strong', 'Brave', 'Hopeful',
  'Calm', 'Bright', 'Warm', 'Steady', 'Quiet', 'Thoughtful', 'Patient', 'Resilient'
];

const NATURE_WORDS = [
  'River', 'Mountain', 'Ocean', 'Forest', 'Meadow', 'Valley', 'Creek', 'Hill',
  'Garden', 'Sunrise', 'Moonlight', 'Starlight', 'Breeze', 'Rain', 'Snow', 'Dawn'
];

const ANIMALS = [
  'Koala', 'Kangaroo', 'Wombat', 'Echidna', 'Platypus', 'Kookaburra', 'Cockatoo',
  'Wallaby', 'Possum', 'Quokka', 'Bilby', 'Bandicoot', 'Dingo', 'Emu', 'Cassowary'
];

/**
 * Generate a random anonymous alias for peer support
 */
export function generateRandomAlias(): string {
  const adjective = ADJECTIVES[Math.floor(Math.random() * ADJECTIVES.length)];
  const noun = Math.random() > 0.5 
    ? NATURE_WORDS[Math.floor(Math.random() * NATURE_WORDS.length)]
    : ANIMALS[Math.floor(Math.random() * ANIMALS.length)];
  
  const number = Math.floor(Math.random() * 99) + 1;
  
  return `${adjective}${noun}${number}`;
}

/**
 * Anonymize sensitive data in wellbeing check-ins
 */
export function anonymizeCheckInData(checkIn: any): any {
  const anonymized = { ...checkIn };
  
  // Remove or hash personally identifiable information
  if (anonymized.notes) {
    // Remove potential names, locations, specific details
    anonymized.notes = anonymized.notes
      .replace(/\b[A-Z][a-z]+ [A-Z][a-z]+\b/g, '[Name]') // Names
      .replace(/\b\d{4}\s?[A-Z]{2,3}\b/g, '[Postcode]') // Postcodes
      .replace(/\b\d{10}\b/g, '[Phone]') // Phone numbers
      .replace(/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g, '[Email]'); // Emails
  }
  
  return anonymized;
}

/**
 * Generate anonymous chat room ID
 */
export function generateChatRoomId(): string {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 8);
  return `chat_${timestamp}_${random}`;
}

/**
 * Sanitize message content for peer support chats
 */
export function sanitizeMessage(content: string): string {
  // Remove potential personal information
  return content
    .replace(/\b[A-Z][a-z]+ [A-Z][a-z]+\b/g, '[Name]')
    .replace(/\b\d{4}\s?[A-Z]{2,3}\b/g, '[Location]')
    .replace(/\b\d{10}\b/g, '[Phone]')
    .replace(/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g, '[Email]')
    .replace(/\bhttps?:\/\/[^\s]+/g, '[Link]'); // URLs
}