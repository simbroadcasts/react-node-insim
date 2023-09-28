export type WithRequired<T, K extends keyof T> = T & { [P in K]-?: T[P] };

export type WithPartial<T, K extends keyof T> = Omit<T, K> & {
  [P in K]?: T[P];
};
