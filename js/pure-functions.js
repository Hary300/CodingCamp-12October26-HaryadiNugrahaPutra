/**
 * pure-functions.js
 * Pure utility functions extracted from app.js for testability.
 */

export function getGreeting(hour) {
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  if (hour < 21) return "Good evening";
  return "Good night";
}
