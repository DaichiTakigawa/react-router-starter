import type { Meta, StoryObj } from '@storybook/react-vite';
import { Button } from './button';
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from './card';

type T = typeof Card;

export default {
  component: Card,
  argTypes: {
    size: {
      control: 'select',
      options: ['default', 'sm'],
      description: 'カードのサイズを指定できます',
    },
    className: {
      control: 'text',
      description: 'カスタムクラスを追加できます',
    },
  },
} satisfies Meta<T>;

type Story = StoryObj<T>;

export const Default: Story = {
  args: {
    size: 'default',
    className: 'w-80',
  },
  render: (args) => (
    <Card {...args}>
      <CardHeader>
        <CardTitle>Card Title</CardTitle>
        <CardDescription>Card description goes here.</CardDescription>
      </CardHeader>
      <CardContent>
        <p>Card content with some example text.</p>
      </CardContent>
      <CardFooter>
        <Button size="sm">Action</Button>
      </CardFooter>
    </Card>
  ),
};

const sizes = ['default', 'sm'] as const;

export const Showcase: Story = {
  tags: ['!test'],
  render: () => (
    <div className="flex flex-col gap-8">
      <div>
        <h3 className="mb-3 text-sm font-semibold">Size Comparison</h3>
        <div className="flex gap-4">
          {sizes.map((size) => (
            <Card key={size} size={size} className="w-80">
              <CardHeader>
                <CardTitle>size=&quot;{size}&quot;</CardTitle>
                <CardDescription>
                  Card with {size} size variant.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p>Content area with example text.</p>
              </CardContent>
              <CardFooter>
                <Button size="sm">Action</Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>

      <div>
        <h3 className="mb-3 text-sm font-semibold">With CardAction</h3>
        <Card className="w-80">
          <CardHeader>
            <CardTitle>Card with Action</CardTitle>
            <CardDescription>
              This card has an action button in the header.
            </CardDescription>
            <CardAction>
              <Button variant="outline" size="icon-sm">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <circle cx="12" cy="12" r="1" />
                  <circle cx="19" cy="12" r="1" />
                  <circle cx="5" cy="12" r="1" />
                </svg>
              </Button>
            </CardAction>
          </CardHeader>
          <CardContent>
            <p>Content area with example text.</p>
          </CardContent>
        </Card>
      </div>
    </div>
  ),
};
