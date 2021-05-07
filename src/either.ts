export abstract class Either<L, R> {
  abstract isRight(): this is Right<L, R>;
  protected abstract get(): R;
  abstract asInstanceOfLeft<T = R>(): Left<L, T>;
  abstract asInstanceOfRight<T = L>(): Right<T, R>;
  protected abstract leftGet(): L;

  left: LeftProjection<L, R> = new LeftProjection(this);

  isLeft(): this is Left<L, R> {
    return !this.isRight();
  }

  match<RT>(ifLeft: (l: L) => RT, ifRight: (r: R) => RT) {
    return this.isRight() ? ifRight(this.get()) : ifLeft(this.leftGet());
  }

  map<U>(mapper: (t: R) => U): Either<L, U> {
      return this.isRight() ? new Right(mapper(this.get())) : this.asInstanceOfLeft<U>();
  }

  replace<U>(val: U) {
      return this.map(() => val);
  }

  getOrElse<U>(valIfLeft: U) {
      return this.isLeft() ? valIfLeft : this.get();
  }

  fold<U>(fa: (r: R) => U, fb: (l: L) => U): U {
      return this.isRight() ? fa(this.get()) : fb(this.leftGet());
  }

  flatMap<U>(mapper: (t: R) => Either<L, U>): Either<L, U> {
    return this.isRight() ? mapper(this.get()) : new Left(this.leftGet()); 
  }

  flatten() {
    return this.isRight() ? this.get() : this.asInstanceOfLeft<R extends Either<L, infer U> ? U : R>();
  }
  
  orNull() {
    return this.getOrElse(null);
  }

  filterOrElse(pred: (t: R) => boolean, orElse: L): Either<L, R> {
    if (this.isRight() && pred(this.get())) return this;
    else if (this.isRight()) return new Left(orElse);
    else return this.asInstanceOfLeft();
  }

  forEach(fn: (t: R) => void) {
    if (this.isRight()) {
      fn(this.get());
    }
  }

  exists(pred: (t: R) => boolean): boolean {
    return this.isLeft() ? false : pred(this.get());
  }

  forall(pred: (t: R) => boolean): boolean {
    return this.isLeft() ? true : pred(this.get());
  }

  contains(value: R) {
    return this.exists(t => t === value);
  }

  toString() {
      return this.fold(r => `Right(${String(r)})`, l => `Left(${String(l)})`);
  }

  print() {
      console.log(this.toString());
  }

  static when = <L, R>(cond: boolean, right: R, left: L): Either<L, R> => cond ? new Right(right) : new Left(left); 
  static unless = <L, R>(cond: boolean, right: R, left: L): Either<L, R> => Either.when(!cond, right, left);
}

export class Right<L, R> extends Either<L, R> {
  protected readonly value: R;
  constructor(value: R) {
      super();
      this.value = value;
  }

  readonly isRight = () => true;

  public get() {
    return this.value;
  }

  leftGet(): never {
    throw new Error('Tried to get value of a Left')
  }

  asInstanceOfLeft(): never {
    throw new Error('Tried to get Right as an instance of Left')
  }

  asInstanceOfRight<T = L>(): Right<T, R> {
    return this as Right<unknown, R> as Right<T, R>;
  }
}

export class Left<L, R> extends Either<L, R> {
  protected readonly value: L;
  constructor(value: L) {
      super();
      this.value = value;
  }

  readonly isRight = () => false;

  protected get(): never {
    throw new Error('Tried to get value of Left');
  }

  leftGet() {
    return this.value;
  }

  asInstanceOfLeft<T = R>() {
    return this as Left<L, T>;
  }

  asInstanceOfRight(): never {
    throw new Error('Tried to get Left as an instance of Right')
  }
}

class LeftProjection<L, R> {
  either: Either<L, R>;
  constructor(either: Either<L, R>) {
    this.either = either;
  }

  get() {
    return this.either.match(
      l => l,
      r => { throw new Error('Tried to call left-projected Right') }
    );
  }

  map<U>(mapper: (t: L) => U): Either<U, R> {
    return this.either.match<Either<U, R>>(
      l => new Left<U, R>(mapper(l)),
      () => this.either.asInstanceOfRight()
    );
  }

  replace<U>(val: U) {
    return this.map(() => val);
  }

  getOrElse<U>(valIfRight: U) {
    return this.either.match<L | U>(
      l => l,
      () => valIfRight
    );
  }

  flatMap<U>(mapper: (t: L) => Either<U, R>): Either<U, R> {
    return this.either.match<Either<U, R>>(
      l => mapper(l),
      () => this.either.asInstanceOfRight<U>()
    );
  }

  flatten() {
    return this.either.match<L | Right<L, R>>(
      l => l,
      () => this.either.asInstanceOfRight()
    );
  }
  
  orNull() {
    return this.getOrElse(null);
  }

  filterOrElse(pred: (t: L) => boolean, orElse: R): Either<L, R> {
    return this.either.match<Either<L, R>>(
      l => pred(l) ? this.either.asInstanceOfLeft() : new Right(orElse),
      () => this.either.asInstanceOfRight()
    );
  }

  forEach(fn: (t: L) => void) {
    this.either.match(
      l => fn(l),
      () => {}
    );
  }

  exists(pred: (t: L) => boolean): boolean {
    return this.either.match(
      l => pred(l),
      () => false
    );
  }

  forall(pred: (t: L) => boolean): boolean {
    return this.either.match(
      l => pred(l),
      () => true
    );
  }

  contains(value: L) {
    return this.exists(t => t === value);
  }

}

export const right = <L, R>(t: R) => new Right<L, R>(t);
export const left = <L, R>(t: L) => new Left<L, R>(t);