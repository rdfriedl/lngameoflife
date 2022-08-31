export class Emitter extends Set {
  add(fn) {
    super.add(fn);
    return () => super.delete(fn);
  }

  emit(data) {
    for (const fn of this) {
      fn(data);
    }
  }
}
