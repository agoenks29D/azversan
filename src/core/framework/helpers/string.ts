/**
 * Generates a random string of a specified length.
 *
 * The function generates a string using random characters from the provided `chars` string.
 * If no `chars` string is provided, it defaults to a mix of letters and numbers.
 * If no `length` is specified, a random length is chosen.
 *
 * @param {number} length - The length of the random string to generate (default: 10)
 * @param {string} chars - The string of characters to choose from (default: '0123456789ABCDEFGHIJKLMNOPQRSTUVWXTZabcdefghiklmnopqrstuvwxyz')
 */
export const randomString = (
  length: number = 10,
  chars: string = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXTZabcdefghiklmnopqrstuvwxyz',
): string => {
  let str = '';
  const charsArray = chars.split('');

  if (!length) {
    length = Math.floor(Math.random() * charsArray.length);
  }

  for (let i = 0; i < length; i += 1) {
    str += charsArray[Math.floor(Math.random() * charsArray.length)];
  }

  return str;
};
