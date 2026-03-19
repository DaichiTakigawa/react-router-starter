import type { Meta, StoryObj } from '@storybook/react-vite';
import { Button } from './button';

type T = typeof Button;

export default {
  component: Button,
  argTypes: {
    variant: {
      control: 'select',
      options: [
        'default',
        'outline',
        'secondary',
        'ghost',
        'destructive',
        'link',
        'skeleton',
      ],
      description: 'ボタンのスタイルを指定できます',
    },
    size: {
      control: 'select',
      options: [
        'default',
        'xs',
        'sm',
        'lg',
        'xl',
        'icon',
        'icon-xs',
        'icon-sm',
        'icon-lg',
      ],
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

type Story = StoryObj<T>;

export const Default: Story = {
  args: {
    variant: 'default',
    size: 'default',
    className: '',
    asChild: false,
    children: 'Button',
  },
};

const textVariants = [
  'default',
  'outline',
  'secondary',
  'ghost',
  'destructive',
  'link',
  'skeleton',
] as const;

const textSizes = ['default', 'xs', 'sm', 'lg', 'xl'] as const;
const iconSizes = ['icon', 'icon-xs', 'icon-sm', 'icon-lg'] as const;

export const Showcase: Story = {
  tags: ['!test'],
  render: () => (
    <div className="flex flex-col gap-8">
      <div>
        <h3 className="mb-3 text-sm font-semibold">Text Buttons</h3>
        <div className="grid gap-4">
          <div className="grid grid-cols-[7rem_repeat(5,1fr)] items-center justify-items-start gap-2">
            <div />
            {textSizes.map((size) => (
              <span key={size} className="text-muted-foreground text-xs">
                {size}
              </span>
            ))}
          </div>
          {textVariants.map((variant) => (
            <div
              key={variant}
              className="grid grid-cols-[7rem_repeat(5,1fr)] items-center justify-items-start gap-2"
            >
              <span className="text-muted-foreground text-xs">{variant}</span>
              {textSizes.map((size) => (
                <Button key={size} variant={variant} size={size}>
                  Button
                </Button>
              ))}
            </div>
          ))}
        </div>
      </div>

      <div>
        <h3 className="mb-3 text-sm font-semibold">Icon Buttons</h3>
        <div className="grid gap-4">
          <div className="grid grid-cols-[7rem_repeat(4,1fr)] items-center justify-items-start gap-2">
            <div />
            {iconSizes.map((size) => (
              <span key={size} className="text-muted-foreground text-xs">
                {size}
              </span>
            ))}
          </div>
          {textVariants.map((variant) => (
            <div
              key={variant}
              className="grid grid-cols-[7rem_repeat(4,1fr)] items-center justify-items-start gap-2"
            >
              <span className="text-muted-foreground text-xs">{variant}</span>
              {iconSizes.map((size) => (
                <Button key={size} variant={variant} size={size}>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={2}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M5 12h14" />
                    <path d="M12 5v14" />
                  </svg>
                </Button>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  ),
};
