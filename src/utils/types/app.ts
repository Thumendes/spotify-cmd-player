export interface App<T = any> {
  run(props: T): void | Promise<void>;
}
