import { Either, left, right} from '../src/either';

describe('Either', () => {
  it('happy path', () => {

    const eitherRight: Either<string, number> = right(6);
    const eitherLeft: Either<string, number> = left('no number here');

    // map
    const negativeRight = eitherRight.map(x => -x);
    const negativeLeft = eitherLeft.left.map(str => str + '!!!');
    expect(negativeRight.get()).toBe(-6);
    expect(() => negativeLeft.get()).toThrow();
    expect(negativeLeft.left.get()).toBe('no number here!!!')

    // match
    const format = (opt: Either<string, number>) => opt.match(
      l => 'whoops: ' + l,
      r => 'here is a number: ' + r.toFixed(2)
    );
    expect(format(eitherRight)).toBe('here is a number: 6.00');
    expect(format(eitherLeft)).toBe('whoops: no number here');

    // getOrElse
    expect(eitherRight.getOrElse(100)).toBe(6);
    expect(eitherLeft.getOrElse(100)).toBe(100);

    expect(eitherRight.left.getOrElse('ayyy lmao')).toBe('ayyy lmao');
    expect(eitherLeft.left.getOrElse('ayyy lmao')).toBe('no number here');

    const safeDivide = (n: number, d: number): Either<string, number> => 
      d === 0 ? left('Division by zero') : right(n / d);

    const safeParseInt = (str: string): Either<string, number> => 
      isNaN(parseInt(str)) ? left('not a number') : right(parseInt(str));

    // flatmap
    expect(eitherRight.flatMap(n => safeDivide(3, n)).get()).toBe(0.5);
    expect(left('42').left.flatMap(safeParseInt).get()).toBe(42);

    // flatmap with inner none
    expect(eitherRight.flatMap(n => safeDivide(3, 0)).left.get()).toBe('Division by zero');
    expect(eitherLeft.left.flatMap(safeParseInt).left.get()).toBe('not a number');
  });
});