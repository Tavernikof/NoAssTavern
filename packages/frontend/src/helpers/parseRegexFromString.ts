// credit by: https://github.com/SillyTavern/SillyTavern/blob/release/public/scripts/world-info.js#L2661
export const parseRegexFromString = (input: string) => {
  // Extracting the regex pattern and flags
  const match = input.match(/^\/([\w\W]+?)\/([gimsuy]*)$/);
  if (!match) {
    return null; // Not a valid regex format
  }

  let [, pattern, flags] = match;

  // If we find any unescaped slash delimiter, we also exit out.
  // JS doesn't care about delimiters inside regex patterns, but for this to be a valid regex outside of our implementation,
  // we have to make sure that our delimiter is correctly escaped. Or every other engine would fail.
  if (pattern.match(/(^|[^\\])\//)) {
    return null;
  }

  // Now we need to actually unescape the slash delimiters, because JS doesn't care about delimiters
  pattern = pattern.replace("\\/", "/");

  // Then we return the regex. If it fails, it was invalid syntax.
  try {
    return new RegExp(pattern, flags);
  } catch (e) {
    return null;
  }
};

export const escapeRegex = (string: string) => {
  return string.replace(/[/\-\\^$*+?.()|[\]{}]/g, "\\$&");
};
