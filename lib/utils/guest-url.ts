/**
 * Guest URL utilities for encoding/decoding guest data in URLs
 * Used for QR code generation and data transfer between registration and room portal
 */

import { RegisteredGuestData } from '@/types/guest';

/**
 * Generates a unique guest ID
 * TODO: In production, this would be a UUID from the database
 */
export function generateGuestId(): string {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 8);
  return `g_${timestamp}_${random}`;
}

/**
 * Encodes guest data for URL query params
 * Uses base64 encoding for compact URL representation
 */
export function encodeGuestDataForUrl(data: RegisteredGuestData): string {
  try {
    const json = JSON.stringify(data);
    // Use btoa for base64 encoding, encodeURIComponent for special chars
    return btoa(encodeURIComponent(json));
  } catch (error) {
    console.error('Failed to encode guest data:', error);
    return '';
  }
}

/**
 * Decodes guest data from URL query params
 */
export function decodeGuestDataFromUrl(encoded: string): RegisteredGuestData | null {
  try {
    const json = decodeURIComponent(atob(encoded));
    return JSON.parse(json) as RegisteredGuestData;
  } catch (error) {
    console.error('Failed to decode guest data from URL:', error);
    return null;
  }
}

/**
 * Builds the guest room URL with encoded data
 * @param guestId - Unique guest identifier
 * @param data - Guest registration data
 * @returns Full URL path for guest room portal
 */
export function buildGuestRoomUrl(guestId: string, data: RegisteredGuestData): string {
  const encoded = encodeGuestDataForUrl(data);
  // Using [slug] dynamic route to match existing app/guest/[slug] structure
  return `/guest/${guestId}/room?d=${encoded}`;
}

/**
 * Builds the full absolute URL for QR code
 * @param baseUrl - The base URL (e.g., window.location.origin)
 * @param guestId - Unique guest identifier
 * @param data - Guest registration data
 * @returns Full absolute URL for QR code
 */
export function buildGuestRoomAbsoluteUrl(
  baseUrl: string,
  guestId: string,
  data: RegisteredGuestData
): string {
  return `${baseUrl}${buildGuestRoomUrl(guestId, data)}`;
}
