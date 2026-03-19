import { usePanelStore } from '@/stores/panel-store';
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from '../ui/resizable';
import { AssetsPanel } from './panels/assets';
import { PreviewPanel } from './panels/preview-panel';
import { PropertiesPanel } from './panels/properties-panel';
import { Timeline } from './panels/timeline';

export function EditorLayout() {
  const { panels, setPanel } = usePanelStore();

  return (
    <ResizablePanelGroup
      orientation="vertical"
      className="size-full gap-[0.18rem]"
      onLayoutChanged={(sizes) => {
        setPanel(
          'mainContent',
          sizes['main-content-panel'] ?? panels.mainContent,
        );
        setPanel('timeline', sizes['timeline-panel'] ?? panels.timeline);
      }}
    >
      <ResizablePanel
        id="main-content-panel"
        defaultSize={`${panels.mainContent}%`}
        minSize={'30%'}
        maxSize={'85%'}
        className="min-h-0"
      >
        <ResizablePanelGroup
          orientation="horizontal"
          className="size-full gap-[0.19rem] px-3"
          onLayoutChanged={(sizes) => {
            setPanel('tools', sizes['tools-panel'] ?? panels.tools);
            setPanel('preview', sizes['preview-panel'] ?? panels.preview);
            setPanel(
              'properties',
              sizes['properties-panel'] ?? panels.properties,
            );
          }}
        >
          <ResizablePanel
            id="tools-panel"
            defaultSize={`${panels.tools}%`}
            minSize={'15%'}
            maxSize={'40%'}
            className="min-w-0"
          >
            <AssetsPanel />
          </ResizablePanel>

          <ResizableHandle />

          <ResizablePanel
            id="preview-panel"
            defaultSize={`${panels.preview}%`}
            minSize={'30%'}
            maxSize={'70%'}
            className="min-h-0 min-w-0 flex-1"
          >
            <PreviewPanel />
          </ResizablePanel>

          <ResizableHandle />

          <ResizablePanel
            id="properties-panel"
            defaultSize={`%${panels.properties}%`}
            minSize={'15%'}
            maxSize={'40%'}
            className="min-w-0"
          >
            <PropertiesPanel />
          </ResizablePanel>
        </ResizablePanelGroup>
      </ResizablePanel>

      <ResizableHandle />

      <ResizablePanel
        id="timeline-panel"
        defaultSize={`${panels.timeline}%`}
        minSize={'15%'}
        maxSize={'70%'}
        className="min-h-0 px-3 pb-3"
      >
        <Timeline />
      </ResizablePanel>
    </ResizablePanelGroup>
  );
}
