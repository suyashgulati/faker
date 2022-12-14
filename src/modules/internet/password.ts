import type { Faker } from '../../faker';

export type PasswordMode = 'secure' | 'simple';

export type PasswordOptions = {
  /**
   * The specific length of the password.
   */
  length: number;
  /**
   * Whether lowercase letters should be included.
   * If a number is provided the final result will have at least this many lowercase letters.
   */
  includeLowercase: boolean | number;
  /**
   * Whether numbers should be included.
   * If a number is provided the final result will have at least this many numeric characters.
   */
  includeNumber: boolean | number;
  /**
   * Whether symbols should be included.
   * If a number is provided the final result have will at least this many special characters.
   */
  includeSymbol: boolean | number;
  /**
   * Whether uppercase letters should be included.
   * If a number is provided the final result will have at least this many uppercase letters.
   */
  includeUppercase: boolean | number;
};

/**
 * Generates a function to generate passwords.
 *
 * @internal
 *
 * @param faker A faker instance.
 *
 */
export function passwordFnFactory(faker: Faker): {
  (mode: PasswordMode): string;
  (options: PasswordOptions): string;
} {
  /**
   * Generates a random password.
   *
   * @param mode The mode in which the password will be generated.
   * - 'secure': A string with a length between 24 and 64
   * and all character types required.
   * - 'simple': A string with a length between 4 and 8,
   * where characters can be upper **OR** lowercase, and numbers.
   */
  function password(mode: PasswordMode): string;
  /**
   * Generates a random password.
   *
   * @param options An options opbject.
   * @param options.length The specific length of the password.
   * @param options.includeLowercase Whether lowercase letters should be included.
   * If a number is provided the final result will have at least this many lowercase letters.
   * @param options.includeNumber Whether numbers should be included.
   * If a number is provided the final result will have at least this many numeric characters.
   * @param options.includeSymbol Whether symbols should be included.
   * If a number is provided the final result have will at least this many special characters.
   * @param options.includeUppercase Whether uppercase letters should be included.
   * If a number is provided the final result will have at least this many uppercase letters.
   */
  function password(options: PasswordOptions): string;
  /**
   * Generates a random password.
   *
   * @param options A password generation mode or an options opbject.
   * @param options.length The specific length of the password.
   * @param options.includeLowercase Whether lowercase letters should be included.
   * If a number is provided the final result will have at least this many lowercase letters.
   * @param options.includeNumber Whether numbers should be included.
   * If a number is provided the final result will have at least this many numeric characters.
   * @param options.includeSymbol Whether symbols should be included.
   * If a number is provided the final result have will at least this many special characters.
   * @param options.includeUppercase Whether uppercase letters should be included.
   * If a number is provided the final result will have at least this many uppercase letters.
   */
  function password(
    options: PasswordMode | PasswordOptions = 'secure'
  ): string {
    if (typeof options === 'string') {
      switch (options) {
        case 'secure': {
          options = {
            includeLowercase: true,
            includeNumber: true,
            includeSymbol: true,
            includeUppercase: true,
            length: faker.number.int({
              min: 24,
              max: 64,
            }),
          };
          break;
        }
        case 'simple':
        default: {
          const useLower = faker.datatype.boolean();
          options = {
            includeLowercase: useLower,
            includeNumber: true,
            includeSymbol: false,
            includeUppercase: !useLower,
            length: faker.number.int({
              min: 4,
              max: 8,
            }),
          };
          break;
        }
      }
    }

    const getCharCountFromOptions = (opt: boolean | number) => {
      if (typeof opt === 'boolean') {
        return opt ? 1 : 0;
      } else {
        return opt >= 0 ? opt : 0;
      }
    };

    const charGroups = [
      {
        requireCount: getCharCountFromOptions(options.includeLowercase),
        generatorFn: () => faker.string.alpha({ casing: 'lower' }),
      },
      {
        requireCount: getCharCountFromOptions(options.includeUppercase),
        generatorFn: () => faker.string.alpha({ casing: 'upper' }),
      },
      {
        requireCount: getCharCountFromOptions(options.includeNumber),
        generatorFn: () => faker.string.numeric(),
      },
      {
        requireCount: getCharCountFromOptions(options.includeSymbol),
        generatorFn: () => faker.string.special(),
      },
    ];

    const chars: string[] = [];
    for (const groupOptions of charGroups) {
      const { generatorFn } = groupOptions;
      let { requireCount } = groupOptions;
      while (requireCount > 0) {
        chars.push(generatorFn());
        requireCount--;
      }
    }

    while (chars.length < options.length) {
      const groupIndex = faker.number.int(charGroups.length - 1);
      const nextChar = charGroups[groupIndex].generatorFn();
      chars.push(nextChar);
    }

    return faker.helpers.shuffle(chars).join('');
  }

  return password;
}
