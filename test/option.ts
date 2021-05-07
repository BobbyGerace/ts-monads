import { Option, some, none} from '../src/option';

describe('Option', () => {
  it('happy path', () => {
    const maybeSome: Option<number> = some(6);
    const maybeNone: Option<number> = none;

    // map
    const negativeSome = maybeSome.map(x => -x);
    const negativeNone = maybeNone.map(x => -x);
    expect(negativeSome.get()).toBe(-6);
    expect(() => negativeNone.get()).toThrow();

    // match
    const format = (opt: Option<number>) => opt.match(
      n => 'here is a number: ' + n,
      () => 'whoops'
    );
    expect(format(maybeSome)).toBe('here is a number: 6');
    expect(format(maybeNone)).toBe('whoops');

    // getOrElse
    expect(maybeSome.getOrElse(100)).toBe(6);
    expect(maybeNone.getOrElse(100)).toBe(100);

    const safeDivide = (n: number, d: number): Option<number> => d === 0 ? none : some(n / d);

    // flatmap
    expect(maybeSome.flatMap(n => safeDivide(3, n)).get()).toBe(0.5);
    expect(maybeNone.flatMap(n => safeDivide(3, n))).toBe(none);

    // flatmap with inner none
    expect(maybeSome.flatMap(n => safeDivide(3, 0))).toBe(none);
    expect(maybeNone.flatMap(n => safeDivide(3, 0))).toBe(none);
  });
});