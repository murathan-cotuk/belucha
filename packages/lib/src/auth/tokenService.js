/**
 * Token Service - Centralized token management for Belucha E-Commerce
 * 
 * Provides localStorage abstraction for JWT token management with:
 * - Token storage and retrieval
 * - Token validation and expiry checking
 * - JWT claims parsing
 * - Role-based token separation (Customer vs Seller)
 * - SSR safety
 * - Future-proof design for httpOnly cookie migration
 * 
 * @module tokenService
 */

import { jwtDecode } from 'jwt-decode';

/**
 * User type definitions
 * @typedef {'customer' | 'seller'} UserType
 */

/**
 * Token storage key prefixes
 * @constant
 */
const STORAGE_PREFIX = 'belucha_';
const TOKEN_KEY = {
  customer: `${STORAGE_PREFIX}customer_token`,
  seller: `${STORAGE_PREFIX}seller_token`,
};
const USER_ID_KEY = {
  customer: `${STORAGE_PREFIX}customer_id`,
  seller: `${STORAGE_PREFIX}seller_id`,
};
const LOGGED_IN_KEY = {
  customer: `${STORAGE_PREFIX}customer_logged_in`,
  seller: `${STORAGE_PREFIX}seller_logged_in`,
};

/**
 * Check if running in browser environment (SSR safety)
 * @returns {boolean}
 */
const isBrowser = () => {
  return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';
};

/**
 * Safe localStorage getter with SSR check
 * @param {string} key - Storage key
 * @returns {string | null}
 */
const safeGetItem = (key) => {
  if (!isBrowser()) {
    return null;
  }
  try {
    return localStorage.getItem(key);
  } catch (error) {
    console.error(`[tokenService] Error reading localStorage key "${key}":`, error);
    return null;
  }
};

/**
 * Safe localStorage setter with SSR check
 * @param {string} key - Storage key
 * @param {string} value - Value to store
 * @returns {boolean} - Success status
 */
const safeSetItem = (key, value) => {
  if (!isBrowser()) {
    return false;
  }
  try {
    localStorage.setItem(key, value);
    return true;
  } catch (error) {
    console.error(`[tokenService] Error writing localStorage key "${key}":`, error);
    return false;
  }
};

/**
 * Safe localStorage remover with SSR check
 * @param {string} key - Storage key
 * @returns {boolean} - Success status
 */
const safeRemoveItem = (key) => {
  if (!isBrowser()) {
    return false;
  }
  try {
    localStorage.removeItem(key);
    return true;
  } catch (error) {
    console.error(`[tokenService] Error removing localStorage key "${key}":`, error);
    return false;
  }
};

/**
 * Validate JWT token format (basic structure check)
 * @param {string} token - JWT token string
 * @returns {boolean}
 */
const isValidTokenFormat = (token) => {
  if (!token || typeof token !== 'string') {
    return false;
  }
  
  // JWT format: header.payload.signature (3 parts separated by dots)
  const parts = token.split('.');
  if (parts.length !== 3) {
    return false;
  }
  
  // Each part should be base64url encoded (non-empty)
  return parts.every(part => part.length > 0);
};

/**
 * Decode JWT token and extract claims
 * @param {string} token - JWT token string
 * @returns {object | null} - Decoded token claims or null if invalid
 */
const decodeToken = (token) => {
  if (!isValidTokenFormat(token)) {
    return null;
  }
  
  try {
    return jwtDecode(token);
  } catch (error) {
    console.error('[tokenService] Error decoding token:', error);
    return null;
  }
};

/**
 * Check if token is expired
 * @param {string} token - JWT token string
 * @returns {boolean} - True if expired or invalid
 */
const isTokenExpired = (token) => {
  const claims = decodeToken(token);
  if (!claims) {
    return true; // Invalid token considered expired
  }
  
  // Check exp claim (expiration time in seconds since epoch)
  if (claims.exp) {
    const expirationTime = claims.exp * 1000; // Convert to milliseconds
    const currentTime = Date.now();
    return currentTime >= expirationTime;
  }
  
  // If no exp claim, assume token is valid (but warn)
  console.warn('[tokenService] Token has no expiration claim (exp)');
  return false;
};

/**
 * Check if token should be refreshed (expires within X minutes)
 * @param {string} token - JWT token string
 * @param {number} minutesBeforeExpiry - Minutes before expiry to trigger refresh (default: 5)
 * @returns {boolean}
 */
const shouldRefreshToken = (token, minutesBeforeExpiry = 5) => {
  const claims = decodeToken(token);
  if (!claims || !claims.exp) {
    return false;
  }
  
  const expirationTime = claims.exp * 1000; // Convert to milliseconds
  const currentTime = Date.now();
  const refreshThreshold = minutesBeforeExpiry * 60 * 1000; // Convert minutes to milliseconds
  
  return (expirationTime - currentTime) <= refreshThreshold;
};

// ============================================================================
// Public API
// ============================================================================

/**
 * Token Storage API
 */

/**
 * Store JWT token for a user type
 * @param {string} token - JWT token string
 * @param {UserType} userType - 'customer' | 'seller'
 * @returns {boolean} - Success status
 */
export const setToken = (token, userType) => {
  if (!token || !userType) {
    console.error('[tokenService] setToken: token and userType are required');
    return false;
  }
  
  if (userType !== 'customer' && userType !== 'seller') {
    console.error(`[tokenService] setToken: Invalid userType "${userType}". Must be "customer" or "seller"`);
    return false;
  }
  
  // Validate token format before storing
  if (!isValidTokenFormat(token)) {
    console.error('[tokenService] setToken: Invalid token format');
    return false;
  }
  
  // Check if token is already expired
  if (isTokenExpired(token)) {
    console.warn('[tokenService] setToken: Token is expired, storing anyway (backend should handle refresh)');
  }
  
  const key = TOKEN_KEY[userType];
  const success = safeSetItem(key, token);
  
  if (success) {
    // Also set logged_in flag
    safeSetItem(LOGGED_IN_KEY[userType], 'true');
  }
  
  return success;
};

/**
 * Retrieve JWT token for a user type
 * @param {UserType} userType - 'customer' | 'seller'
 * @returns {string | null} - Token string or null if not found/invalid
 */
export const getToken = (userType) => {
  if (!userType) {
    console.error('[tokenService] getToken: userType is required');
    return null;
  }
  
  if (userType !== 'customer' && userType !== 'seller') {
    console.error(`[tokenService] getToken: Invalid userType "${userType}". Must be "customer" or "seller"`);
    return null;
  }
  
  const key = TOKEN_KEY[userType];
  const token = safeGetItem(key);
  
  if (!token) {
    return null;
  }
  
  // Validate token format
  if (!isValidTokenFormat(token)) {
    console.warn(`[tokenService] getToken: Invalid token format for ${userType}, removing`);
    removeToken(userType);
    return null;
  }
  
  // Check if token is expired
  if (isTokenExpired(token)) {
    console.warn(`[tokenService] getToken: Token expired for ${userType}, removing`);
    removeToken(userType);
    return null;
  }
  
  return token;
};

/**
 * Remove JWT token for a user type (logout)
 * @param {UserType} userType - 'customer' | 'seller'
 * @returns {boolean} - Success status
 */
export const removeToken = (userType) => {
  if (!userType) {
    console.error('[tokenService] removeToken: userType is required');
    return false;
  }
  
  if (userType !== 'customer' && userType !== 'seller') {
    console.error(`[tokenService] removeToken: Invalid userType "${userType}". Must be "customer" or "seller"`);
    return false;
  }
  
  const tokenKey = TOKEN_KEY[userType];
  const userIdKey = USER_ID_KEY[userType];
  const loggedInKey = LOGGED_IN_KEY[userType];
  
  safeRemoveItem(tokenKey);
  safeRemoveItem(userIdKey);
  safeRemoveItem(loggedInKey);
  
  return true;
};

/**
 * User Data API
 */

/**
 * Store user ID for a user type
 * @param {string} userId - User ID string
 * @param {UserType} userType - 'customer' | 'seller'
 * @returns {boolean} - Success status
 */
export const setUser = (userId, userType) => {
  if (!userId || !userType) {
    console.error('[tokenService] setUser: userId and userType are required');
    return false;
  }
  
  if (userType !== 'customer' && userType !== 'seller') {
    console.error(`[tokenService] setUser: Invalid userType "${userType}". Must be "customer" or "seller"`);
    return false;
  }
  
  const key = USER_ID_KEY[userType];
  return safeSetItem(key, String(userId));
};

/**
 * Retrieve user ID for a user type
 * @param {UserType} userType - 'customer' | 'seller'
 * @returns {string | null} - User ID or null if not found
 */
export const getUser = (userType) => {
  if (!userType) {
    console.error('[tokenService] getUser: userType is required');
    return null;
  }
  
  if (userType !== 'customer' && userType !== 'seller') {
    console.error(`[tokenService] getUser: Invalid userType "${userType}". Must be "customer" or "seller"`);
    return null;
  }
  
  const key = USER_ID_KEY[userType];
  return safeGetItem(key);
};

/**
 * Remove user ID for a user type
 * @param {UserType} userType - 'customer' | 'seller'
 * @returns {boolean} - Success status
 */
export const removeUser = (userType) => {
  if (!userType) {
    console.error('[tokenService] removeUser: userType is required');
    return false;
  }
  
  if (userType !== 'customer' && userType !== 'seller') {
    console.error(`[tokenService] removeUser: Invalid userType "${userType}". Must be "customer" or "seller"`);
    return false;
  }
  
  const key = USER_ID_KEY[userType];
  return safeRemoveItem(key);
};

/**
 * Validation API
 */

/**
 * Check if a token is valid (format + expiry)
 * @param {string} token - JWT token string
 * @returns {boolean}
 */
export const isTokenValid = (token) => {
  if (!token) {
    return false;
  }
  
  if (!isValidTokenFormat(token)) {
    return false;
  }
  
  if (isTokenExpired(token)) {
    return false;
  }
  
  return true;
};

/**
 * Check if a token is expired
 * @param {string} token - JWT token string
 * @returns {boolean}
 */
export { isTokenExpired };

/**
 * Decode JWT token and return claims
 * @param {string} token - JWT token string
 * @returns {object | null} - Decoded token claims or null if invalid
 */
export const getTokenClaims = (token) => {
  return decodeToken(token);
};

/**
 * Refresh Token API (Placeholder - backend not ready)
 */

/**
 * Check if token should be refreshed
 * @param {string} token - JWT token string
 * @param {number} minutesBeforeExpiry - Minutes before expiry to trigger refresh (default: 5)
 * @returns {boolean}
 */
export { shouldRefreshToken };

/**
 * Check if user is logged in (has valid token)
 * @param {UserType} userType - 'customer' | 'seller'
 * @returns {boolean}
 */
export const isLoggedIn = (userType) => {
  const token = getToken(userType);
  return token !== null && isTokenValid(token);
};

/**
 * Clear all authentication data for a user type (full logout)
 * @param {UserType} userType - 'customer' | 'seller'
 * @returns {boolean} - Success status
 */
export const clearAuth = (userType) => {
  return removeToken(userType) && removeUser(userType);
};

/**
 * Get all stored tokens (for debugging/migration purposes)
 * @returns {object} - Object with customer and seller tokens
 */
export const getAllTokens = () => {
  return {
    customer: safeGetItem(TOKEN_KEY.customer),
    seller: safeGetItem(TOKEN_KEY.seller),
  };
};

/**
 * Clear all authentication data (full cleanup - use with caution)
 * @returns {boolean} - Success status
 */
export const clearAllAuth = () => {
  const customerCleared = clearAuth('customer');
  const sellerCleared = clearAuth('seller');
  return customerCleared && sellerCleared;
};


