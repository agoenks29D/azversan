type RandomNumberOptions = {
  min?: number;
  max?: number;
  length?: number;
};

/**
 * Generates a random number or a random string of numbers.
 *
 * If `length` is provided, it returns a random string of numbers with the specified length.
 * If `length` is not provided, it returns a random number between `min` and `max`.
 *
 * @param {RandomNumberOptions} options - Configuration for generating the random value
 * @param {number} options.min - Minimum value (default: 1)
 * @param {number} options.max - Maximum value (default: 10)
 * @param {number} options.length - Length of the random string (optional)
 */
export const randomNumber = ({
  min = 1,
  max = 10,
  length,
}: RandomNumberOptions = {}): number | string => {
  let i = 0;
  let code = '';
  const characters = '0123456789';
  const random = Math.floor(Math.random() * (max - min + 1)) + min;

  if (!length) {
    return random;
  }

  while (i < length) {
    const randomIndex = Math.floor(Math.random() * random);
    code += characters.charAt(randomIndex);
    i += 1;
  }

  return code;
};
