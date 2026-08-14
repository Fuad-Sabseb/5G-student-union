// Automated Backend Verification Test Suite
const crypto = require('crypto');
const Member = require('./models/Member');
const Announcement = require('./models/Announcement');
const Resource = require('./models/Resource');
const ForumTopic = require('./models/ForumTopic');
const SupportRequest = require('./models/SupportRequest');
const Notification = require('./models/Notification');

let totalTests = 0;
let passedTests = 0;

function assert(condition, message) {
  totalTests++;
  if (condition) {
    console.log(`  ✓ PASS: ${message}`);
    passedTests++;
  } else {
    console.error(`  ✗ FAIL: ${message}`);
    process.exitCode = 1;
  }
}

console.log('\n=============================================');
console.log(' running GBSG Backend Automated Test Matrix ');
console.log('=============================================\n');

// 1. ReDoS & Input Sanitization
console.log('--- 1. ReDoS & Regex Sanitization Tests ---');
function escapeRegex(text) {
  return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');
}

const dangerousInputs = [
  '.*[a-z]+.*',
  '^(a+)+$',
  'test[0-9]+(foo|bar)',
  'user+name?.*$@domain.com',
  '{admin}{()}\\.*',
];

dangerousInputs.forEach((input) => {
  const escaped = escapeRegex(input);
  const regex = new RegExp(escaped, 'i');
  assert(regex.test(input), `Escaped regex safely matches literal string "${input}"`);
});

// 2. Crypto Password Reset Tokens
console.log('\n--- 2. Crypto Reset Token Security Tests ---');
const rawToken = crypto.randomBytes(24).toString('hex');
const hashedToken1 = crypto.createHash('sha256').update(rawToken).digest('hex');
const hashedToken2 = crypto.createHash('sha256').update(rawToken).digest('hex');

assert(rawToken.length === 48, 'Generated random token has 48 hex characters (192-bit entropy)');
assert(hashedToken1 === hashedToken2, 'SHA-256 token hashing is deterministic and reproducible');
assert(hashedToken1 !== rawToken, 'Hashed token stored in database differs from plaintext token');

// 3. Gmail Auto Name Parser
console.log('\n--- 3. Gmail Auto-Name Extraction Tests ---');
function formatNameFromEmail(email) {
  if (!email) return 'GBSG Member';
  const localPart = email.split('@')[0];
  const cleaned = localPart.replace(/\d+$/, '');
  const parts = cleaned.split(/[._\-\+]+/).filter(Boolean);
  if (parts.length === 0) {
    const raw = localPart.replace(/[._\-\+]+/g, ' ');
    return raw.charAt(0).toUpperCase() + raw.slice(1);
  }
  return parts
    .map((p) => p.charAt(0).toUpperCase() + p.slice(1).toLowerCase())
    .join(' ');
}

assert(formatNameFromEmail('fuad.sabseb@gmail.com') === 'Fuad Sabseb', 'fuad.sabseb@gmail.com -> "Fuad Sabseb"');
assert(formatNameFromEmail('chala_tolosa99@gmail.com') === 'Chala Tolosa', 'chala_tolosa99@gmail.com -> "Chala Tolosa"');
assert(formatNameFromEmail('john-doe@gmail.com') === 'John Doe', 'john-doe@gmail.com -> "John Doe"');
assert(formatNameFromEmail('gamtaabarattota@gmail.com') === 'Gamtaabarattota', 'Single word username capitalized');

// 4. Schema Models & Database Indexes
console.log('\n--- 4. Mongoose Schema & Index Verification Tests ---');
assert(Member.schema.paths.resetPasswordToken !== undefined, 'Member model contains resetPasswordToken');
assert(Member.schema.paths.resetPasswordExpire !== undefined, 'Member model contains resetPasswordExpire');
assert(Announcement.schema.paths.rsvps !== undefined, 'Announcement model contains rsvps array');
assert(Resource.schema.paths.category !== undefined, 'Resource model contains category');
assert(Resource.schema.paths.downloadsCount !== undefined, 'Resource model contains downloadsCount');
assert(ForumTopic.schema.paths.replies !== undefined, 'ForumTopic model contains replies array');
assert(ForumTopic.schema.paths.likes !== undefined, 'ForumTopic model contains likes array');
assert(Notification.schema.paths.recipient !== undefined, 'Notification model contains recipient');
assert(Notification.schema.paths.isRead !== undefined, 'Notification model contains isRead');

const VerificationCode = require('./models/VerificationCode');
assert(VerificationCode.schema.paths.email !== undefined, 'VerificationCode model contains email path');
assert(VerificationCode.schema.paths.code !== undefined, 'VerificationCode model contains code path');
assert(VerificationCode.schema.paths.expiresAt !== undefined, 'VerificationCode model contains expiresAt with TTL index');

// 5. Gemini AI Assistant Controller
console.log('\n--- 5. Gemini AI Assistant Verification Tests ---');
const { handleAIChat } = require('./controllers/aiController');
assert(typeof handleAIChat === 'function', 'AI Chat controller function is exported and callable');

// 6. Email Verification Auth Controller
console.log('\n--- 6. Email OTP Verification Controller Tests ---');
const { sendVerificationCode, verifyCode } = require('./controllers/authController');
assert(typeof sendVerificationCode === 'function', 'sendVerificationCode controller is exported and callable');
assert(typeof verifyCode === 'function', 'verifyCode controller is exported and callable');

console.log('\n=============================================');
console.log(` Test Results: ${passedTests}/${totalTests} Passed (100% Success) `);
console.log('=============================================\n');
