/**
 * API Error Handler Utility
 * Provides consistent error handling for API calls across the application
 */

import { eventBus, EVENTS } from '../events';
import StorageService from '../services/storage.service';

export class APIError extends Error {
  constructor(message, status, code, details = {}) {
    super(message);
    this.name = 'APIError';
    this.status = status;
    this.code = code;
    this.details = details;
    this.timestamp = new Date().toISOString();
  }
}

export const API_ERROR_CODES = {
  NETWORK_ERROR: 'NETWORK_ERROR',
  TIMEOUT_ERROR: 'TIMEOUT_ERROR',
  UNAUTHORIZED: 'UNAUTHORIZED',
  FORBIDDEN: 'FORBIDDEN',
  NOT_FOUND: 'NOT_FOUND',
  SERVER_ERROR: 'SERVER_ERROR',
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  UNKNOWN_ERROR: 'UNKNOWN_ERROR'
};

export const API_ERROR_MESSAGES = {
  [API_ERROR_CODES.NETWORK_ERROR]: 'Network connection error. Please check your internet connection and try again.',
  [API_ERROR_CODES.TIMEOUT_ERROR]: 'Request timed out. Please try again.',
  [API_ERROR_CODES.UNAUTHORIZED]: 'Authentication required. Please log in again.',
  [API_ERROR_CODES.FORBIDDEN]: 'Access denied. You do not have permission to perform this action.',
  [API_ERROR_CODES.NOT_FOUND]: 'The requested resource was not found.',
  [API_ERROR_CODES.SERVER_ERROR]: 'Server error occurred. Please try again later.',
  [API_ERROR_CODES.VALIDATION_ERROR]: 'Invalid data provided. Please check your input and try again.',
  [API_ERROR_CODES.UNKNOWN_ERROR]: 'An unexpected error occurred. Please try again.'
};

/**
 * Handles API response errors and returns appropriate error objects
 */
export const handleAPIError = (error, context = '') => {
  console.error(`🚨 API Error in ${context}:`, error);

  // Network errors (no response)
  if (!error.response) {
    if (error.code === 'ECONNABORTED' || error.message.includes('timeout')) {
      return new APIError(
        API_ERROR_MESSAGES[API_ERROR_CODES.TIMEOUT_ERROR],
        0,
        API_ERROR_CODES.TIMEOUT_ERROR,
        { originalError: error.message }
      );
    }
    
    return new APIError(
      API_ERROR_MESSAGES[API_ERROR_CODES.NETWORK_ERROR],
      0,
      API_ERROR_CODES.NETWORK_ERROR,
      { originalError: error.message }
    );
  }

  const { status, data } = error.response;
  let errorCode = API_ERROR_CODES.UNKNOWN_ERROR;
  let errorMessage = API_ERROR_MESSAGES[API_ERROR_CODES.UNKNOWN_ERROR];

  // Handle specific HTTP status codes
  switch (status) {
    case 401:
      errorCode = API_ERROR_CODES.UNAUTHORIZED;
      errorMessage = API_ERROR_MESSAGES[API_ERROR_CODES.UNAUTHORIZED];
      // Clear credentials and redirect to login
      handleUnauthorizedError();
      break;
    case 403:
      errorCode = API_ERROR_CODES.FORBIDDEN;
      errorMessage = API_ERROR_MESSAGES[API_ERROR_CODES.FORBIDDEN];
      break;
    case 404:
      errorCode = API_ERROR_CODES.NOT_FOUND;
      errorMessage = API_ERROR_MESSAGES[API_ERROR_CODES.NOT_FOUND];
      break;
    case 422:
      errorCode = API_ERROR_CODES.VALIDATION_ERROR;
      errorMessage = data?.message || API_ERROR_MESSAGES[API_ERROR_CODES.VALIDATION_ERROR];
      break;
    case 500:
    case 502:
    case 503:
    case 504:
      errorCode = API_ERROR_CODES.SERVER_ERROR;
      errorMessage = API_ERROR_MESSAGES[API_ERROR_CODES.SERVER_ERROR];
      break;
    default:
      errorMessage = data?.message || errorMessage;
  }

  return new APIError(errorMessage, status, errorCode, {
    originalError: error.message,
    responseData: data,
    context
  });
};

/**
 * Handles unauthorized errors by clearing credentials and redirecting to login
 */
const handleUnauthorizedError = () => {
  console.log('🔐 Handling unauthorized error - clearing credentials');
  
  // Clear all stored credentials
  StorageService.remove('userCredentials');
  StorageService.remove('userKey');
  StorageService.remove('authToken');
  localStorage.removeItem('userOrgUnitId');
  localStorage.removeItem('userOrgUnitName');
  localStorage.removeItem('userEmail');
  
  // Emit logout event
  eventBus.emit(EVENTS.LOGOUT);
  
  // Redirect to login page
  setTimeout(() => {
    window.location.href = '/main/login';
  }, 1000);
};

/**
 * Wraps fetch calls with error handling
 */
export const safeFetch = async (url, options = {}, context = '') => {
  try {
    const response = await fetch(url, options);
    
    if (!response.ok) {
      const error = new Error(`HTTP error! status: ${response.status}`);
      error.response = {
        status: response.status,
        statusText: response.statusText,
        data: await response.text().catch(() => 'Unable to read response body')
      };
      throw error;
    }
    
    return response;
  } catch (error) {
    throw handleAPIError(error, context);
  }
};

/**
 * Wraps API calls with retry logic and error handling
 */
export const apiCallWithRetry = async (apiCall, maxRetries = 3, context = '') => {
  let lastError;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await apiCall();
    } catch (error) {
      lastError = handleAPIError(error, context);
      
      // Don't retry for certain error types
      if (lastError.code === API_ERROR_CODES.UNAUTHORIZED || 
          lastError.code === API_ERROR_CODES.FORBIDDEN ||
          lastError.code === API_ERROR_CODES.VALIDATION_ERROR) {
        throw lastError;
      }
      
      // Don't retry on last attempt
      if (attempt === maxRetries) {
        throw lastError;
      }
      
      // Wait before retrying (exponential backoff)
      const delay = Math.min(1000 * Math.pow(2, attempt - 1), 5000);
      console.log(`🔄 Retrying API call (attempt ${attempt}/${maxRetries}) in ${delay}ms`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  
  throw lastError;
};

/**
 * Shows user-friendly error messages
 */
export const showErrorMessage = (error, context = '') => {
  const message = error instanceof APIError ? error.message : error.message || 'An unexpected error occurred';
  
  console.error(`❌ Error in ${context}:`, message);
  
  // Emit error event for global error handling
  eventBus.emit(EVENTS.ERROR, {
    message,
    code: error.code || API_ERROR_CODES.UNKNOWN_ERROR,
    context,
    timestamp: new Date().toISOString()
  });
  
  return message;
};

/**
 * Logs API call details for debugging
 */
export const logAPICall = (method, url, options = {}, context = '') => {
  console.log(`📡 API Call [${context}]:`, {
    method,
    url,
    headers: options.headers ? Object.keys(options.headers) : [],
    timestamp: new Date().toISOString()
  });
};

/**
 * Logs API response details for debugging
 */
export const logAPIResponse = (response, data, context = '') => {
  console.log(`📥 API Response [${context}]:`, {
    status: response.status,
    statusText: response.statusText,
    dataType: typeof data,
    timestamp: new Date().toISOString()
  });
}; 