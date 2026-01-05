/**
 * Utility functions for handling Bangla text, especially যুক্তবর্ণ (conjunct characters)
 */

/**
 * Split a Bangla string into grapheme clusters, properly preserving:
 * - যুক্তবর্ণ (conjuncts like ক্ষ, ত্র, স্ত্র)
 * - কার (vowel signs like া, ি, ী)
 * - Other combining marks (চন্দ্রবিন্দু, অনুস্বার, বিসর্গ)
 */
export function splitIntoGraphemes(str: string): string[] {
  // Use Unicode segmentation to properly handle Bangla conjuncts
  // The Intl.Segmenter API properly handles grapheme clusters including যুক্তবর্ণ
  if (typeof Intl !== 'undefined' && Intl.Segmenter) {
    const segmenter = new Intl.Segmenter('bn', { granularity: 'grapheme' });
    const segments = Array.from(segmenter.segment(str));
    return segments.map(s => s.segment);
  }

  // Fallback: Manual splitting for environments without Intl.Segmenter
  const result: string[] = [];
  const vowelSigns = new Set(['া', 'ি', 'ী', 'ু', 'ূ', 'ৃ', 'ে', 'ৈ', 'ো', 'ৌ', 'ৗ']);
  const hasanta = '্'; // Bangla virama/hasanta

  let i = 0;
  while (i < str.length) {
    let cluster = str[i];
    i++;

    // Keep consuming characters that form conjuncts or add modifiers
    while (i < str.length) {
      const nextChar = str[i];

      // If current cluster ends with hasanta, the next consonant is part of conjunct
      if (cluster.endsWith(hasanta)) {
        cluster += nextChar;
        i++;
        continue;
      }

      // If next char is hasanta, it continues the conjunct
      if (nextChar === hasanta) {
        cluster += nextChar;
        i++;
        continue;
      }

      // If next char is a vowel sign, add it to current cluster
      if (vowelSigns.has(nextChar)) {
        cluster += nextChar;
        i++;
        continue;
      }

      // Check for other combining marks (nukta, chandrabindu, etc.)
      const code = nextChar.charCodeAt(0);
      if (code >= 0x0981 && code <= 0x0983) { // Chandrabindu, Anusvara, Visarga
        cluster += nextChar;
        i++;
        continue;
      }

      // If next char is ং, ঃ, or ঁ as part of the syllable
      if (nextChar === 'ং' || nextChar === 'ঃ' || nextChar === 'ঁ') {
        cluster += nextChar;
        i++;
        continue;
      }

      break;
    }

    result.push(cluster);
  }

  return result;
}
