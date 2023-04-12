import type { TextChildren } from '../types';

/** @internal */
export function childrenToString(children?: TextChildren): string {
  if (children === null || children === undefined) {
    return '';
  }

  if (Array.isArray(children)) {
    return children.join('');
  }

  if (typeof children === 'number') {
    return children.toString(10);
  }

  return children;
}
