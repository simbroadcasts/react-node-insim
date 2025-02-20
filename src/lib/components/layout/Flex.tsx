import { createElement } from 'react';

import type { Styles } from '../../renderer/inSim/styles';
import type { ButtonChild } from '../types';

export type NewFlexProps = Styles & {
  children: ButtonChild | ButtonChild[];
};

export function Flex(props: NewFlexProps) {
  return createElement<NewFlexProps>('flex', props);
}
