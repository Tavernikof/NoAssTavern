export const sliceFromEnd = <I>(array: I[], userStartParam?: number | null, userEndParam?: number | null): I[] => {
  const len = array.length;

  // Normalize null/undefined to make checks simpler
  const userStart = userStartParam == null ? null : userStartParam;
  const userEnd = userEndParam == null ? null : userEndParam;

  const startProvided = userStart !== null;
  const endProvided = userEnd !== null;

  let actualSliceStartIdx; // 0-based, inclusive for JS slice
  let actualSliceEndIdx;   // 0-based, exclusive for JS slice

  if (startProvided && endProvided) {
    // Both start and end are given.
    // `userEnd` defines the Nth item from end to start slicing FROM (inclusive).
    // `userStart` defines the Nth item from end to slice UP TO (inclusive).
    // Example: sliceFromEnd([1...10], 2, 5) -> elements from 5th-from-end up to 2nd-from-end
    // 5th-from-end (value 6) is at 0-based index: len - userEnd (10 - 5 = 5)
    // 2nd-from-end (value 9) is at 0-based index: len - userStart (10 - 2 = 8)
    // Slice needs to include element at (len - userStart), so JS slice end is (len - userStart) + 1.

    // Handle invalid 1-based indices if they are non-positive
    if (userStart <= 0 || userEnd <= 0) return [];

    actualSliceStartIdx = len - userEnd;
    actualSliceEndIdx = len - userStart + 1;

  } else if (startProvided) { // Only start is provided
    // Example: sliceFromEnd([1...10], 5) -> [1,2,3,4,5,6]
    // Slice from array beginning up to and including the 'userStart'-th element from the end.
    // 'userStart'-th element from end is at 0-based index (len - userStart).
    // JS slice end index needs to be (len - userStart) + 1 to include it.
    if (userStart <= 0) return [];

    actualSliceStartIdx = 0;
    actualSliceEndIdx = len - userStart + 1;

  } else if (endProvided) { // Only end is provided
    // Example: sliceFromEnd([1...10], undefined, 5) -> [6,7,8,9,10]
    // Slice from 'userEnd'-th element from end, up to the physical end of the array.
    // 'userEnd'-th element from end is at 0-based index (len - userEnd).
    if (userEnd <= 0) return [];

    actualSliceStartIdx = len - userEnd;
    actualSliceEndIdx = len;

  } else { // Neither start nor end is provided
    return [...array]; // Return a shallow copy of the whole array
  }

  // Clamp indices to be valid for array.slice().
  // A 0-based index `idx` must be `0 <= idx <= len`.
  // `actualSliceStartIdx` can range from negative (if userEnd > len) up to `len`.
  // `actualSliceEndIdx` can range from negative (if userStart > len+1) up to `len+1` (then clamped to len).

  actualSliceStartIdx = Math.max(0, actualSliceStartIdx);
  actualSliceEndIdx = Math.max(0, actualSliceEndIdx); // Ensure end is not negative before min

  actualSliceStartIdx = Math.min(len, actualSliceStartIdx); // Start cannot exceed len
  actualSliceEndIdx = Math.min(len, actualSliceEndIdx);   // End cannot exceed len

  // If actualSliceStartIdx > actualSliceEndIdx, array.slice will correctly return an empty array.
  return array.slice(actualSliceStartIdx, actualSliceEndIdx);
};

// Test cases:

// console.log("sliceFromEnd([1,2,3,4,5,6,7,8,9,10], 2, 5)    // Expected: [6,7,8,9]");
// console.log(sliceFromEnd([1, 2, 3, 4, 5, 6, 7, 8, 9, 10], 2, 5));
//
// console.log("sliceFromEnd([1,2,3,4,5,6,7,8,9,10], 1, 5)    // Expected: [6,7,8,9,10]");
// console.log(sliceFromEnd([1, 2, 3, 4, 5, 6, 7, 8, 9, 10], 1, 5));
//
// console.log("sliceFromEnd([1,2,3,4,5,6,7,8,9,10], 5)       // Expected: [1,2,3,4,5,6]");
// console.log(sliceFromEnd([1, 2, 3, 4, 5, 6, 7, 8, 9, 10], 5));
//
// console.log("sliceFromEnd([1,2,3,4,5,6,7,8,9,10])          // Expected: [1,2,3,4,5,6,7,8,9,10]");
// console.log(sliceFromEnd([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]));
//
// console.log("sliceFromEnd([1,2,3,4,5,6,7,8,9,10], 11)      // Expected: []");
// console.log(sliceFromEnd([1, 2, 3, 4, 5, 6, 7, 8, 9, 10], 11));
//
// console.log("sliceFromEnd([1,2,3,4,5,6,7,8,9,10], 10)      // Expected: [1]");
// console.log(sliceFromEnd([1, 2, 3, 4, 5, 6, 7, 8, 9, 10], 10));
//
// console.log("sliceFromEnd([1,2,3,4,5,6,7,8,9,10], undefined, 5) // Expected: [6,7,8,9,10]");
// console.log(sliceFromEnd([1, 2, 3, 4, 5, 6, 7, 8, 9, 10], undefined, 5));
//
// console.log("sliceFromEnd([1,2,3,4,5,6,7,8,9,10], null, 5) // Expected: [6,7,8,9,10]");
// console.log(sliceFromEnd([1, 2, 3, 4, 5, 6, 7, 8, 9, 10], null, 5));
//
// console.log("sliceFromEnd([], 2, 5)                       // Expected: []");
// console.log(sliceFromEnd([], 2, 5));
//
// console.log("sliceFromEnd([1,2,3], 1, 4)                  // Expected: [1,2,3] (4th from end is before start)");
// console.log(sliceFromEnd([1, 2, 3], 1, 4)); // start=1, end=4. sliceStartIdx = 3-4 = -1 -> 0. sliceEndIdx = 3-1+1 = 3. slice(0,3)
//
// console.log("sliceFromEnd([1,2,3], 4, 1)                  // Expected: [] (start from 1st-from-end up to 4th-from-end, invalid order)");
// console.log(sliceFromEnd([1, 2, 3], 4, 1)); // start=4, end=1. sliceStartIdx = 3-1 = 2. sliceEndIdx = 3-4+1 = 0. slice(2,0) -> []
//
// console.log("sliceFromEnd([1,2,3], 0, 1)                  // Expected: [] (invalid 1-based index 0)");
// console.log(sliceFromEnd([1, 2, 3], 0, 1));
//
// console.log("sliceFromEnd([1,2,3], 1, 0)                  // Expected: [] (invalid 1-based index 0)");
// console.log(sliceFromEnd([1, 2, 3], 1, 0));
//
// console.log("sliceFromEnd([1,2,3], -1, 1)                 // Expected: [] (invalid 1-based index -1)");
// console.log(sliceFromEnd([1, 2, 3], -1, 1));
