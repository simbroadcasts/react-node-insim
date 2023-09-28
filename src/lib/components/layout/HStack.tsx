import type { StackProps } from './Stack';
import { Stack } from './Stack';

type Props = Omit<StackProps, 'direction'>;

export function HStack(props: Props) {
  return <Stack direction="horizontal" {...props} />;
}
