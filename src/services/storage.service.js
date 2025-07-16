/**
 * Created by fulle on 2025/07/04.
 */
import { eventBus, EVENTS } from '../events';
import {STORAGE_KEYS} from './constants';

const StorageService = {
    encryptionConfig: {
        name: 'AES-GCM',
        length: 256,
        iterations: 100000,
        salt: new TextEncoder().encode(`${import.meta.env.VITE_STORAGE_SALT}`), // Should be stored securely
        hash: 'SHA-256'
    },

    // Cache for derived key
    _cachedKey: null,

    // Get derived crypto key
    async _getKey() {
        if (this._cachedKey) return this._cachedKey;

        const passphrase = `${import.meta.env.VITE_STORAGE_SECRET}`;
        if (!passphrase) {
            console.error('Storage encryption secret is not defined');
            eventBus.emit(EVENTS.NOTIFICATION_SHOW, {
                title: 'Security Error',
                message: 'Storage encryption is not properly configured',
                type: 'error'
            });
            throw new Error('Encryption secret not defined');
        }
        window.console.log("passphrase: "+passphrase);
        window.console.log(`salt: ${import.meta.env.VITE_STORAGE_SALT}`);

        try {
            const keyMaterial = await crypto.subtle.importKey(
                'raw',
                new TextEncoder().encode(passphrase),
                { name: 'PBKDF2' },
                false,
                ['deriveBits', 'deriveKey']
            );

            this._cachedKey = await crypto.subtle.deriveKey(
                {
                    name: 'PBKDF2',
                    salt: this.encryptionConfig.salt,
                    iterations: this.encryptionConfig.iterations,
                    hash: this.encryptionConfig.hash
                },
                keyMaterial,
                { name: this.encryptionConfig.name, length: this.encryptionConfig.length },
                false,
                ['encrypt', 'decrypt']
            );

            return this._cachedKey;
        } catch (error) {
            console.error('Key derivation error:', error);
            eventBus.emit(EVENTS.NOTIFICATION_SHOW, {
                title: 'Security Error',
                message: 'Failed to initialize storage encryption',
                type: 'error'
            });
            throw error;
        }
    },

    // Encrypt data
    async _encrypt(data) {
        try {
            const key = await this._getKey();
            const iv = crypto.getRandomValues(new Uint8Array(12));
            const encoded = new TextEncoder().encode(data);

            const encrypted = await crypto.subtle.encrypt(
                { name: this.encryptionConfig.name, iv },
                key,
                encoded
            );

            return {
                iv: Array.from(iv),
                data: Array.from(new Uint8Array(encrypted))
            };
        } catch (error) {
            console.error('Encryption failed:', error);
            throw error;
        }
    },

    // Decrypt data
    async _decrypt(encryptedData) {
        try {
            const key = await this._getKey();
            const { iv, data } = encryptedData;

            const decrypted = await crypto.subtle.decrypt(
                { name: this.encryptionConfig.name, iv: new Uint8Array(iv) },
                key,
                new Uint8Array(data)
            );

            return new TextDecoder().decode(decrypted);
        } catch (error) {
            console.error('Decryption failed:', error);
            throw error;
        }
    },

    // Public methods
    async get(key) {
        try {
            const item = localStorage.getItem(key);
            if (!item) return null;

            // First, try to parse as JSON
            let parsed;
            try {
                parsed = JSON.parse(item);
            } catch (parseError) {
                console.warn(`StorageService.get: Failed to parse JSON for key '${key}'. Data may be corrupted.`, parseError);
                // If it's not valid JSON, it might be old unencrypted data or corrupted data
                // Try to return the raw string for backward compatibility
                return item;
            }

            // Check if data is encrypted (has IV and data properties)
            if (parsed && typeof parsed === 'object' && parsed.iv && parsed.data) {
                try {
                    const decrypted = await this._decrypt(parsed);
                    return JSON.parse(decrypted);
                } catch (decryptError) {
                    console.warn(`StorageService.get: Failed to decrypt data for key '${key}'. Data may be corrupted.`, decryptError);
                    // If decryption fails, try to return the raw parsed data
                    return parsed;
                }
            }

            // If not encrypted, return as-is (for backward compatibility)
            return parsed;
        } catch (error) {
            console.error('StorageService.get error:', error);
            // Clear corrupted data
            try {
                localStorage.removeItem(key);
                console.log(`StorageService.get: Removed corrupted data for key '${key}'`);
            } catch (removeError) {
                console.error('StorageService.get: Failed to remove corrupted data:', removeError);
            }
            return null;
        }
    },

    async set(key, value) {
        try {
            const stringValue = JSON.stringify(value);
            const encrypted = await this._encrypt(stringValue);
            localStorage.setItem(key, JSON.stringify(encrypted));
        } catch (error) {
            console.error('StorageService.set error:', error);

            // Fallback to unencrypted storage
            try {
                localStorage.setItem(key, JSON.stringify(value));
            } catch (fallbackError) {
                console.error('StorageService.set fallback error:', fallbackError);
            }
        }
    },

    remove(key) {
        try {
            localStorage.removeItem(key);
        } catch (error) {
            console.error('StorageService.remove error:', error);
        }
    },

    clear() {
        try {
            localStorage.clear();
        } catch (error) {
            console.error('StorageService.clear error:', error);
        }
    },

    // Clear corrupted data and validate storage
    async clearCorruptedData() {
        try {
            const keys = Object.keys(localStorage);
            const corruptedKeys = [];
            
            for (const key of keys) {
                try {
                    const item = localStorage.getItem(key);
                    if (item) {
                        // Try to parse as JSON
                        JSON.parse(item);
                    }
                } catch (error) {
                    console.warn(`Found corrupted data for key '${key}':`, error);
                    corruptedKeys.push(key);
                }
            }
            
            // Remove corrupted keys
            for (const key of corruptedKeys) {
                try {
                    localStorage.removeItem(key);
                    console.log(`Removed corrupted data for key '${key}'`);
                } catch (error) {
                    console.error(`Failed to remove corrupted key '${key}':`, error);
                }
            }
            
            return corruptedKeys.length;
        } catch (error) {
            console.error('StorageService.clearCorruptedData error:', error);
            return 0;
        }
    },

    // Migration method to encrypt existing data
    async encryptExistingData() {
        try {
            const keys = Object.keys(localStorage);
            for (const key of keys) {
                // Skip already encrypted data
                if (key.startsWith('_enc_')) continue;

                const value = localStorage.getItem(key);
                try {
                    // Check if already encrypted
                    JSON.parse(value);
                    continue;
                } catch {
                    // Not JSON, encrypt it
                    await this.set(`_enc_${key}`, value);
                    localStorage.removeItem(key);
                }
            }
        } catch (error) {
            console.error('Data migration error:', error);
        }
    },
    getAuthToken(type) {
        let key = (!type)? STORAGE_KEYS.AUTH_TOKEN: STORAGE_KEYS.USER_KEY;
        return StorageService.get(key);
    },
    async getUserData () {
        return StorageService.get(STORAGE_KEYS.USER_DATA);
    },
    async setUserData(value) {
        return StorageService.set(STORAGE_KEYS.USER_DATA, value);
    }
};

export default StorageService;