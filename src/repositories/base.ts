import { Env } from "../types";

export abstract class BaseRepository<_T> {
  constructor(protected env: Env) {}

  // Common D1 methods if needed, but since D1 doesn't have a strict ORM,
  // we'll mostly use this to hold the Env reference.
}
