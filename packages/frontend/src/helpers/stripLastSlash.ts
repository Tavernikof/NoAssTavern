export const stripLastSlash = (str?: string | null) => {
  // Handle non-string inputs or empty strings gracefully
  if (typeof str !== 'string' || !str) {
    return '';
  }

  // Regex explanation:
  // ^/+ : Matches one or more slashes (/) at the beginning (^) of the string.
  // |   : OR
  // /+$ : Matches one or more slashes (/) at the end ($) of the string.
  // g   : Global flag, ensures all matches (i.e., both beginning and end if present) are replaced.
  return str.trim().replace(/^[/]+|[/]+$/g, '').trim();
};
