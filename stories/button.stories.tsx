import type { Meta, StoryObj } from '@storybook/react-vite';

import { Button } from '@/components/ui/button';

type T = typeof Button;

export default {
  component: Button,
  argTypes: {
    variant: {
      control: 'select',
      options: [
        'default',
        'destructive',
        'outline',
        'secondary',
        'ghost',
        'link',
      ],
      description: 'ボタンのスタイルを指定できます',
    },
    size: {
      control: 'select',
      options: ['default', 'sm', 'lg', 'icon'],
      description: 'ボタンのサイズを指定できます',
    },
    className: {
      control: 'text',
      description: 'カスタムクラスを追加できます',
    },
    asChild: {
      control: 'boolean',
      description: '`true` の場合、`Slot` コンポーネントを使用します',
    },
    children: {
      control: 'text',
      description: 'ボタンのテキストを指定できます',
    },
  },
} satisfies Meta<T>;

export const Default: StoryObj<T> = {
  args: {
    variant: 'default',
    size: 'default',
    className: '',
    asChild: false,
    children: 'Button',
  },
};
