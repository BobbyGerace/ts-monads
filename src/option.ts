import { Either, left, right } from "./either";

export abstract class Option<T> {
  abstract get(): T;
  readonly abstract isEmpty: boolean;

  match<U>(ifSome: (t: T) => U, ifNone: () => U): U {
    return this.isEmpty ? ifNone() : ifSome(this.get());
  }

  map<U>(mapper: (t: T) => U): Option<U> {
      return this.isEmpty ? none : some(mapper(this.get()));
  }

  replace<U>(val: U) {
      return this.map(() => val);
  }

  getOrElse<U>(valIfEmpty: U) {
      return this.isEmpty ? valIfEmpty : this.get();
  }

  fold<U>(folder: (t: T) => U, ifEmpty: U) {
      return this.map(folder).getOrElse(ifEmpty);
  }

  flatMap<U>(mapper: (t: T) => Option<U>): Option<U> {
    return this.fold(mapper, none);
  }

  flatten() {
    return this.getOrElse(none);
  }
  
  orNull() {
    return this.getOrElse(null);
  }

  filter(pred: (t: T) => boolean): Option<T> {
    return !this.isEmpty && pred(this.get()) ? this : none;
  }

  filterNot(pred: (t: T) => boolean): Option<T> {
    return this.filter(t => !pred(t));
  }

  forEach(fn: (t: T) => void) {
    if (!this.isEmpty) {
      fn(this.get());
    }
  }

  exists(pred: (t: T) => boolean): boolean {
    return this.isEmpty ? false : pred(this.get());
  }

  forall(pred: (t: T) => boolean): boolean {
    return this.isEmpty ? true : pred(this.get());
  }

  contains(value: T) {
    return this.exists(t => t === value);
  }

  toEither<L>(leftValue: L): Either<L, T>{
    return this.match<Either<L, T>>(
      t => right(t),
      () => left(leftValue),
    );
  }

  toString() {
      return this.fold(t => `Some(${String(t)})`, 'None');
  }

  print() {
      console.log(this.toString());
  }

  static empty = () => none
  static when = <T>(cond: boolean, value: T): Option<T> => cond ? some(value) : none; 
  static unless = <T>(cond: boolean, value: T): Option<T> => Option.when(!cond, value);
}

export class Some<T> extends Option<T> {
  protected readonly value: T;
  constructor(value: T) {
      super();
      this.value = value;
  }

  readonly isEmpty = false;

  get() {
    return this.value;
  }
}

export class None extends Option<never> {
  readonly isEmpty = true;

  get(): never {
    throw new Error('Tried to get value of None');
  }
}

export const some = <T>(t: T) => new Some(t);
export const none = new None();