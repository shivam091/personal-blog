/*
 * Generates a fast, non-cryptographic hash for content change detection.
 *
 * This implementation uses a variant of the Fowler-Noll-Vo (FNV) algorithm,
 * specifically optimized for speed using 32-bit integer arithmetic (hash | 0).
 * It's suitable for determining if the combined code (HTML, CSS, JS) has changed
 * between runs to decide whether a full reload can be skipped.
 */
export function hashString(str) {
  // FNV_OFFSET_32 initialization value
  let hash = 2166136261;

  for (let i = 0; i < str.length; i++) {
    // XOR the current hash with the character code
    hash ^= str.charCodeAt(i);

    // Perform FNV-like multiplication using bitwise shifts (optimized for modern JS engines)
    // This is equivalent to multiplying by a large prime number (like FNV_PRIME)
    hash += (hash << 1) + (hash << 4) + (hash << 7) + (hash << 8) + (hash << 24);
  }

  // Ensure the final result is a 32-bit signed integer
  return hash | 0;
}
