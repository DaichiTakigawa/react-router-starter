import type { Meta, StoryObj } from '@storybook/react-vite';
import { toast } from 'sonner';
import { Button } from './button';
import { Toaster } from './sonner';

type T = typeof Toaster;

export default {
  component: Toaster,
  decorators: [
    (Story) => (
      <>
        <Story />
        <Toaster />
      </>
    ),
  ],
} satisfies Meta<T>;

type Story = StoryObj<T>;

export const Default: Story = {
  render: () => (
    <Button
      variant="outline"
      onClick={() => toast('This is a toast notification.')}
    >
      Show Toast
    </Button>
  ),
};

const toastTypes = [
  { label: 'Success', fn: () => toast.success('Operation completed.') },
  { label: 'Error', fn: () => toast.error('Something went wrong.') },
  { label: 'Warning', fn: () => toast.warning('Please check your input.') },
  { label: 'Info', fn: () => toast.info('Here is some information.') },
  {
    label: 'Loading',
    fn: () => toast.loading('Loading data...'),
  },
] as const;

export const Showcase: Story = {
  tags: ['!test'],
  render: () => (
    <div className="flex flex-col gap-4">
      <h3 className="text-sm font-semibold">Toast Variants</h3>
      <div className="flex flex-wrap gap-2">
        {toastTypes.map(({ label, fn }) => (
          <Button key={label} variant="outline" onClick={fn}>
            {label}
          </Button>
        ))}
      </div>
    </div>
  ),
};
