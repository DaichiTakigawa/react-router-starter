import type { Meta, StoryObj } from '@storybook/react-vite';
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from './resizable';

type T = typeof ResizablePanelGroup;

export default {
  component: ResizablePanelGroup,
} satisfies Meta<T>;

type Story = StoryObj<T>;

export const Default: Story = {
  render: () => (
    <div className="h-48 w-full max-w-lg rounded-lg border">
      <ResizablePanelGroup orientation="horizontal">
        <ResizablePanel defaultSize={50}>
          <div className="flex h-full items-center justify-center p-4">
            <span className="text-muted-foreground text-sm">Panel 1</span>
          </div>
        </ResizablePanel>
        <ResizableHandle />
        <ResizablePanel defaultSize={50}>
          <div className="flex h-full items-center justify-center p-4">
            <span className="text-muted-foreground text-sm">Panel 2</span>
          </div>
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  ),
};

export const Showcase: Story = {
  tags: ['!test'],
  render: () => (
    <div className="flex flex-col gap-8">
      <div>
        <h3 className="mb-3 text-sm font-semibold">
          Horizontal — without handle
        </h3>
        <div className="h-48 w-full max-w-lg rounded-lg border">
          <ResizablePanelGroup orientation="horizontal">
            <ResizablePanel defaultSize={30}>
              <div className="flex h-full items-center justify-center p-4">
                <span className="text-muted-foreground text-sm">Sidebar</span>
              </div>
            </ResizablePanel>
            <ResizableHandle />
            <ResizablePanel defaultSize={70}>
              <div className="flex h-full items-center justify-center p-4">
                <span className="text-muted-foreground text-sm">Content</span>
              </div>
            </ResizablePanel>
          </ResizablePanelGroup>
        </div>
      </div>

      <div>
        <h3 className="mb-3 text-sm font-semibold">Horizontal — with handle</h3>
        <div className="h-48 w-full max-w-lg rounded-lg border">
          <ResizablePanelGroup orientation="horizontal">
            <ResizablePanel defaultSize={30}>
              <div className="flex h-full items-center justify-center p-4">
                <span className="text-muted-foreground text-sm">Sidebar</span>
              </div>
            </ResizablePanel>
            <ResizableHandle withHandle />
            <ResizablePanel defaultSize={70}>
              <div className="flex h-full items-center justify-center p-4">
                <span className="text-muted-foreground text-sm">Content</span>
              </div>
            </ResizablePanel>
          </ResizablePanelGroup>
        </div>
      </div>

      <div>
        <h3 className="mb-3 text-sm font-semibold">Vertical Layout</h3>
        <div className="h-64 w-full max-w-lg rounded-lg border">
          <ResizablePanelGroup orientation="vertical">
            <ResizablePanel defaultSize={40}>
              <div className="flex h-full items-center justify-center p-4">
                <span className="text-muted-foreground text-sm">Top</span>
              </div>
            </ResizablePanel>
            <ResizableHandle withHandle />
            <ResizablePanel defaultSize={60}>
              <div className="flex h-full items-center justify-center p-4">
                <span className="text-muted-foreground text-sm">Bottom</span>
              </div>
            </ResizablePanel>
          </ResizablePanelGroup>
        </div>
      </div>

      <div>
        <h3 className="mb-3 text-sm font-semibold">Three Panels</h3>
        <div className="h-48 w-full max-w-lg rounded-lg border">
          <ResizablePanelGroup orientation="horizontal">
            <ResizablePanel defaultSize={25}>
              <div className="flex h-full items-center justify-center p-4">
                <span className="text-muted-foreground text-sm">Left</span>
              </div>
            </ResizablePanel>
            <ResizableHandle withHandle />
            <ResizablePanel defaultSize={50}>
              <div className="flex h-full items-center justify-center p-4">
                <span className="text-muted-foreground text-sm">Center</span>
              </div>
            </ResizablePanel>
            <ResizableHandle withHandle />
            <ResizablePanel defaultSize={25}>
              <div className="flex h-full items-center justify-center p-4">
                <span className="text-muted-foreground text-sm">Right</span>
              </div>
            </ResizablePanel>
          </ResizablePanelGroup>
        </div>
      </div>
    </div>
  ),
};
