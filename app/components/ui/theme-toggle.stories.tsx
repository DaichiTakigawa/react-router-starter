import type { Meta, StoryObj } from '@storybook/react-vite';
import { ThemeToggle } from './theme-toggle';

type T = typeof ThemeToggle;

export default {
  component: ThemeToggle,
  argTypes: {
    className: {
      control: 'text',
      description: 'カスタムクラスを追加できます',
    },
  },
} satisfies Meta<T>;

type Story = StoryObj<T>;

export const Default: Story = {
  args: {
    className: '',
  },
};
