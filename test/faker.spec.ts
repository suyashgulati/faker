import type { SpyInstance } from 'vitest';
import { describe, expect, it, vi } from 'vitest';
import { faker, Faker } from '../src';
import { FakerError } from '../src/errors/faker-error';

describe('faker', () => {
  it('should throw error if no locales passed', () => {
    expect(() => new Faker({ locale: [] })).toThrow(
      new FakerError(
        'The locale option must contain at least one locale definition.'
      )
    );
  });

  it('should not log anything on startup', () => {
    const spies: SpyInstance[] = Object.keys(console)
      .filter((key) => typeof console[key] === 'function')
      .map((methodName) =>
        vi.spyOn(console, methodName as keyof typeof console)
      );

    // eslint-disable-next-line @typescript-eslint/no-var-requires
    require('..').faker;

    new Faker({ locale: { metadata: { title: '' } } });

    for (const spy of spies) {
      expect(spy).not.toHaveBeenCalled();
      spy.mockRestore();
    }
  });

  describe('definitions', () => {
    it('locale definition accessability', () => {
      // Metadata
      expect(faker.definitions.metadata.title).toBeDefined();
      // Standard modules
      expect(faker.definitions.location.city_name).toBeDefined();
      // Non-existing module
      expect(faker.definitions.missing).toBeUndefined();
      // Non-existing definition in an existing module
      expect(faker.definitions.location.missing).toBeUndefined();
    });
  });

  // This is only here for coverage
  // The actual test is in mersenne.spec.ts
  describe('seed()', () => {
    it('seed()', () => {
      const seed = faker.seed();

      expect(seed).toBeDefined();
      expect(seed).toBeTypeOf('number');
    });

    it('should reset the sequence when calling `seed`', () => {
      const seed = faker.seed();

      const num1 = faker.number.int();

      const newSeed = faker.seed(seed);
      const num2 = faker.number.int();

      expect(num1).toBe(num2);
      expect(newSeed).toBe(seed);

      const num3 = faker.number.int();
      expect(num1).not.toBe(num3);
    });

    it('seed(number)', () => {
      faker.seed(1);

      const actual = faker.animal.cat();
      expect(actual).toBe('Korat');
    });

    it('seed(number[])', () => {
      faker.seed([1, 2, 3]);

      const actual = faker.animal.cat();
      expect(actual).toBe('Oriental');
    });
  });

  describe('fork', () => {
    it('should create a fork that returns the same values as the original', () => {
      const fork1 = faker.fork();
      const fork2 = faker.fork();
      const fork3 = fork1.fork();

      expect(fork1).not.toBe(faker);
      expect(fork2).not.toBe(faker);
      expect(fork3).not.toBe(faker);
      expect(fork1).not.toBe(fork2);
      expect(fork1).not.toBe(fork3);
      expect(fork2).not.toBe(fork3);

      const valueOrg = faker.number.int();
      expect(fork1.number.int()).toBe(valueOrg);
      expect(fork2.number.int()).toBe(valueOrg);
      expect(fork3.number.int()).toBe(valueOrg);

      const value1 = fork1.number.int();
      expect(faker.number.int()).toBe(value1);
      expect(fork2.number.int()).toBe(value1);
      expect(fork3.number.int()).toBe(value1);

      const value2 = fork2.number.int();
      expect(fork1.number.int()).toBe(value2);
      expect(faker.number.int()).toBe(value2);
      expect(fork3.number.int()).toBe(value2);

      const value3 = fork3.number.int();
      expect(fork1.number.int()).toBe(value3);
      expect(fork2.number.int()).toBe(value3);
      expect(faker.number.int()).toBe(value3);
    });
  });

  describe('derive', () => {
    it("should create a derived faker, that doesn't affect the original", () => {
      const seed = faker.seed();
      faker.number.int();
      const value = faker.number.int();

      faker.seed(seed);
      const derived = faker.derive();

      expect(derived).not.toBe(faker);

      for (let i = 0; i < derived.number.int(100); i++) {
        derived.number.int();
      }

      expect(faker.number.int()).toBe(value);
    });
  });

  describe('defaultRefDate', () => {
    it('should be a defined', () => {
      expect(faker.defaultRefDate).toBeDefined();
    });

    it('should be a date in the very recent past', () => {
      const start = Date.now();
      const refDate = faker.defaultRefDate().getTime();
      const end = Date.now();
      expect(refDate).toBeGreaterThanOrEqual(start);
      expect(refDate).toBeLessThanOrEqual(end);
    });
  });
});
