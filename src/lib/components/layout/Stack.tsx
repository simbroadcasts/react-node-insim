import type { ReactElement } from 'react';
import { createContext, useContext } from 'react';

import type { StyleProps } from '../../renderer/inSim/styleProps';
import type { ButtonProps } from '../Button';
import { Flex } from './Flex';

type ButtonChild = ReactElement<ButtonProps>;

// TODO decide if to implement these
type StackCommonButtonProps = Pick<
  ButtonProps,
  'width' | 'height' | 'variant' | 'background' | 'color' | 'UCID'
>;

export type StackProps = Omit<StyleProps, 'flexDirection'> &
  StackCommonButtonProps & {
    direction: 'horizontal' | 'vertical';
    children: ButtonChild | ButtonChild[];
  };

export function Stack({ children, direction, ...props }: StackProps) {
  return (
    <Flex
      flexDirection={direction === 'vertical' ? 'column' : 'row'}
      {...props}
    >
      <StackContext.Provider
        value={
          {
            // TODO
          }
        }
      >
        {children}
      </StackContext.Provider>
    </Flex>
  );
}

const StackContext = createContext<StackCommonButtonProps | null>(null);

export function useStackContext() {
  return useContext(StackContext);
}
