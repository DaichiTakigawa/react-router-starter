import type { Meta, StoryObj } from '@storybook/react-vite';
import { Skeleton } from './skeleton';

type T = typeof Skeleton;

export default {
  component: Skeleton,
  argTypes: {
    className: {
      control: 'text',
      description: 'サイズや形状をクラスで指定できます',
    },
  },
} satisfies Meta<T>;

type Story = StoryObj<T>;

export const Default: Story = {
  args: {
    className: 'h-4 w-48',
  },
};

export const Showcase: Story = {
  tags: ['!test'],
  render: () => (
    <div className="flex flex-col gap-8">
      <div>
        <h3 className="mb-3 text-sm font-semibold">Text Lines</h3>
        <div className="flex flex-col gap-2">
          <Skeleton className="h-4 w-64" />
          <Skeleton className="h-4 w-48" />
          <Skeleton className="h-4 w-56" />
        </div>
      </div>

      <div>
        <h3 className="mb-3 text-sm font-semibold">Avatar</h3>
        <div className="flex items-center gap-3">
          <Skeleton className="size-10 rounded-full" />
          <div className="flex flex-col gap-2">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-3 w-24" />
          </div>
        </div>
      </div>

      <div>
        <h3 className="mb-3 text-sm font-semibold">Card Skeleton</h3>
        <div className="flex w-80 flex-col gap-3 rounded-lg border p-4">
          <Skeleton className="h-32 w-full rounded-md" />
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
          <div className="flex gap-2 pt-2">
            <Skeleton className="h-8 w-20 rounded-md" />
            <Skeleton className="h-8 w-20 rounded-md" />
          </div>
        </div>
      </div>
    </div>
  ),
};
