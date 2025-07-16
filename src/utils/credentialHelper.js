/**
 * Credential Helper Utility
 * Provides reliable credential loading with fallbacks
 */

import StorageService from '../services/storage.service';

/**
 * Get credentials with multiple fallback strategies
 */
export const getCredentials = async () => {
  console.log('🔐 Getting credentials with fallback strategies...');
  
  // Strategy 1: Try StorageService.get (encrypted)
  try {
    const encryptedCreds = await StorageService.get('userCredentials');
    if (encryptedCreds) {
      console.log('🔐 Credentials found via StorageService (encrypted)');
      return encryptedCreds;
    }
  } catch (error) {
    console.warn('⚠️ StorageService.get failed:', error);
  }
  
  // Strategy 2: Try localStorage directly (unencrypted fallback)
  try {
    const localCreds = localStorage.getItem('userCredentials');
    if (localCreds) {
      console.log('🔐 Credentials found via localStorage (unencrypted)');
      return localCreds;
    }
  } catch (error) {
    console.warn('⚠️ localStorage.getItem failed:', error);
  }
  
  // Strategy 3: Try parsing from localStorage if it's JSON
  try {
    const rawCreds = localStorage.getItem('userCredentials');
    if (rawCreds) {
      const parsedCreds = JSON.parse(rawCreds);
      if (parsedCreds) {
        console.log('🔐 Credentials found via localStorage JSON parsing');
        return parsedCreds;
      }
    }
  } catch (error) {
    console.warn('⚠️ JSON parsing failed:', error);
  }
  
  console.error('❌ No credentials found in any storage location');
  return null;
};

/**
 * Set credentials in both StorageService and localStorage
 */
export const setCredentials = async (credentials) => {
  console.log('🔐 Setting credentials in both storage locations...');
  
  try {
    // Set in StorageService (encrypted)
    await StorageService.set('userCredentials', credentials);
    console.log('✅ Credentials set in StorageService');
  } catch (error) {
    console.warn('⚠️ Failed to set credentials in StorageService:', error);
  }
  
  try {
    // Set in localStorage (unencrypted fallback)
    localStorage.setItem('userCredentials', credentials);
    console.log('✅ Credentials set in localStorage');
  } catch (error) {
    console.warn('⚠️ Failed to set credentials in localStorage:', error);
  }
};

/**
 * Clear credentials from all storage locations
 */
export const clearCredentials = () => {
  console.log('🔐 Clearing credentials from all storage locations...');
  
  try {
    StorageService.remove('userCredentials');
    console.log('✅ Credentials cleared from StorageService');
  } catch (error) {
    console.warn('⚠️ Failed to clear credentials from StorageService:', error);
  }
  
  try {
    localStorage.removeItem('userCredentials');
    console.log('✅ Credentials cleared from localStorage');
  } catch (error) {
    console.warn('⚠️ Failed to clear credentials from localStorage:', error);
  }
};

/**
 * Clear and re-set credentials to fix corrupted data
 */
export const fixCredentials = async (username, password) => {
  console.log('🔧 === FIXING CREDENTIALS ===');
  
  // Clear any corrupted data
  clearCredentials();
  
  // Wait a moment for clearing to complete
  await new Promise(resolve => setTimeout(resolve, 100));
  
  // Re-set credentials with the fixed StorageService
  const credentials = btoa(`${username}:${password}`);
  await setCredentials(credentials);
  
  // Verify the fix
  const storedCreds = await getCredentials();
  const success = storedCreds === credentials;
  
  console.log('🔧 Credential fix result:', success ? 'SUCCESS' : 'FAILED');
  return success;
};

/**
 * Check if credentials are available
 */
export const hasCredentials = async () => {
  const creds = await getCredentials();
  return !!creds;
};

/**
 * Validate credentials by making a test API call
 */
export const validateCredentials = async (credentials) => {
  if (!credentials) {
    console.log('❌ No credentials provided for validation');
    return false;
  }
  
  try {
    console.log('🔐 Validating credentials with API call...');
    const response = await fetch('/api/me', {
      headers: {
        'Authorization': `Basic ${credentials}`,
      },
    });
    
    if (response.ok) {
      console.log('✅ Credentials are valid');
      return true;
    } else {
      console.log('❌ Credentials are invalid (API returned:', response.status, ')');
      return false;
    }
  } catch (error) {
    console.error('❌ Error validating credentials:', error);
    return false;
  }
}; 