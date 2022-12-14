import type { Faker } from '../..';

export type PasswordMode = 'secure' | 'memorable' | 'simple';

/**
 * Generates a function to generate passwords.
 *
 * @internal
 *
 * @param faker A faker instance.
 *
 */
export function passwordFnFactory(faker: Faker) {
  /**
   * Generates a random password.
   *
   * @param options An options opbject.
   * @param options.length The specific length of the password.
   * @param options.includeLowercase Whether lowercase letters should be included. If a number is provided the final result will at least have this many lowercase letters.
   * @param options.includeNumber Whether numbers should be included. If a number is provided the final result will at least have this many number.
   * @param options.includeSymbol Whether symbols should be included. If a number is provided the final result will at least have this many symbols.
   * @param options.includeUppercase Whether uppercase letters should be included. If a number is provided the final result will at least have this many uppercase letters.
   */
  return function password(options: {
    length: number;
    includeLowercase: boolean | number;
    includeNumber: boolean | number;
    includeSymbol: boolean | number;
    includeUppercase: boolean | number;
  }): string {
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
        generatorFn: () =>
          faker.helpers.arrayElement(
            '-#!$@%^&*()_+|~=`{}[]:";\'<>?,.\\/ '.split('')
          ),
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

    const password = faker.helpers.shuffle(chars).join('');

    return password;
  };
}
