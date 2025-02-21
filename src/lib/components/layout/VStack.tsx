import type { StackProps } from './Stack';
import { Stack } from './Stack';

type Props = Omit<StackProps, 'direction' | 'height'>;

export function VStack(props: Props) {
  return <Stack direction="vertical" {...props} />;
}
