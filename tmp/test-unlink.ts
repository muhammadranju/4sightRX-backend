import fs from 'fs';
import path from 'path';
import unlinkFile from '../src/shared/unlinkFile';

const testDir = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(testDir)) {
  fs.mkdirSync(testDir);
}

const testFile = 'test-delete.txt';
const filePath = path.join(testDir, testFile);
fs.writeFileSync(filePath, 'test content');

console.log('--- Testing unlinkFile ---');

// Test 1: Valid local file
console.log('Test 1: Deleting existing local file...');
unlinkFile(testFile);
if (!fs.existsSync(filePath)) {
  console.log('SUCCESS: Local file deleted.');
} else {
  console.log('FAILURE: Local file still exists.');
}

// Test 2: External URL
console.log('\nTest 2: External URL (should be ignored)...');
try {
  unlinkFile('https://example.com/image.png');
  console.log('SUCCESS: External URL ignored without error.');
} catch (error) {
  console.log('FAILURE: Error with external URL:', error);
}

// Test 3: Null/Undefined/Empty string
console.log('\nTest 3: Null/Undefined/Empty string (should be ignored)...');
try {
  unlinkFile(null as any);
  unlinkFile(undefined as any);
  unlinkFile('');
  console.log('SUCCESS: Null/Undefined/Empty string ignored without error.');
} catch (error) {
  console.log('FAILURE: Error with null/undefined/empty string:', error);
}

// Test 4: Non-existent file
console.log('\nTest 4: Non-existent file (should be ignored)...');
try {
  unlinkFile('non-existent-file.png');
  console.log('SUCCESS: Non-existent file ignored without error.');
} catch (error) {
  console.log('FAILURE: Error with non-existent file:', error);
}

console.log('\n--- Verification Finished ---');
