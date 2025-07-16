/**
 * Login Test Utility
 * Helps debug login and credential storage issues
 */

import { getCredentials, setCredentials } from './credentialHelper';

export const testCredentialStorage = async () => {
  console.log('🧪 === TESTING CREDENTIAL STORAGE ===');
  
  // Test 1: Check if credentials exist
  console.log('📋 Test 1: Checking existing credentials...');
  const existingCreds = await getCredentials();
  console.log('Existing credentials:', existingCreds ? 'Found' : 'Not found');
  
  // Test 2: Try to set test credentials
  console.log('📋 Test 2: Setting test credentials...');
  const testCreds = btoa('testuser:testpass');
  await setCredentials(testCreds);
  
  // Test 3: Verify credentials were stored
  console.log('📋 Test 3: Verifying stored credentials...');
  const storedCreds = await getCredentials();
  console.log('Stored credentials:', storedCreds ? 'Found' : 'Not found');
  console.log('Credentials match:', storedCreds === testCreds ? 'Yes' : 'No');
  
  // Test 4: Check localStorage directly
  console.log('📋 Test 4: Checking localStorage directly...');
  const localCreds = localStorage.getItem('userCredentials');
  console.log('localStorage credentials:', localCreds ? 'Found' : 'Not found');
  
  // Test 5: Check StorageService directly
  console.log('📋 Test 5: Checking StorageService directly...');
  try {
    const storageCreds = await import('../services/storage.service').then(module => 
      module.default.get('userCredentials')
    );
    console.log('StorageService credentials:', storageCreds ? 'Found' : 'Not found');
  } catch (error) {
    console.error('StorageService error:', error);
  }
  
  console.log('🧪 === CREDENTIAL STORAGE TEST COMPLETE ===');
  return {
    existingCreds: !!existingCreds,
    storedCreds: !!storedCreds,
    credentialsMatch: storedCreds === testCreds,
    localStorageCreds: !!localCreds,
    testCreds: testCreds
  };
};

export const simulateLogin = async (username, password) => {
  console.log('🔐 === SIMULATING LOGIN ===');
  console.log('Username:', username);
  console.log('Password:', password ? '[HIDDEN]' : 'Not provided');
  
  if (!username || !password) {
    console.error('❌ Username and password required');
    return false;
  }
  
  try {
    // Create credentials
    const credentials = btoa(`${username}:${password}`);
    console.log('🔐 Generated credentials:', credentials ? 'Success' : 'Failed');
    
    // Store credentials using our helper
    await setCredentials(credentials);
    console.log('✅ Credentials stored using helper');
    
    // Verify storage
    const storedCreds = await getCredentials();
    const success = storedCreds === credentials;
    
    console.log('🔍 Verification:', success ? 'SUCCESS' : 'FAILED');
    console.log('🔐 === LOGIN SIMULATION COMPLETE ===');
    
    return success;
  } catch (error) {
    console.error('❌ Login simulation failed:', error);
    return false;
  }
}; 