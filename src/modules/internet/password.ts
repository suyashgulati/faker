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

    const requiredLowercaseCount = getCharCountFromOptions(
      options.includeLowercase
    );
    const requiredNumberCount = getCharCountFromOptions(options.includeNumber);
    const requiredSymbolCout = getCharCountFromOptions(options.includeSymbol);
    const requiredUppercaseCount = getCharCountFromOptions(
      options.includeUppercase
    );
    let totalAdditionalCharCount =
      options.length -
      (requiredLowercaseCount +
        requiredNumberCount +
        requiredSymbolCout +
        requiredUppercaseCount);

    const charGroups = [
      {
        requireCount: requiredLowercaseCount,
        generatorFn: () => faker.random.alpha({ casing: 'lower' }),
      },
      {
        requireCount: requiredUppercaseCount,
        generatorFn: () => faker.random.alpha({ casing: 'upper' }),
      },
      {
        requireCount: requiredNumberCount,
        generatorFn: () =>
          faker.datatype
            .number({
              min: 0,
              max: 9,
            })
            .toString(),
      },
      {
        requireCount: requiredSymbolCout,
        generatorFn: () =>
          faker.helpers.arrayElement(
            '-#!$@%^&*()_+|~=`{}[]:";\'<>?,.\\/ '.split('')
          ),
      },
    ];

    const chars: string[] = [];
    for (const [index, group] of charGroups.entries()) {
      const { generatorFn, requireCount } = group;

      // if we are at the last entry, we fill up for desired length
      // otherwise generate a random number for additioLan char count besides the required one
      const additionalCharCount =
        index === charGroups.length - 1
          ? totalAdditionalCharCount
          : faker.datatype.number({
              min: 0,
              max: totalAdditionalCharCount,
            });
      totalAdditionalCharCount = totalAdditionalCharCount - additionalCharCount;

      let charCount = additionalCharCount + requireCount;
      while (charCount > 0) {
        chars.push(generatorFn());
        charCount--;
      }
    }

    const password = faker.helpers.shuffle(chars).join('');

    return password;
  };
}
