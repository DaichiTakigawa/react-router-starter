import { Player } from '@remotion/player';
import { MyVideo } from '@/components/remotion/MyVideo';

export function PreviewPanel() {
  return (
    <div className="panel bg-background flex h-full overflow-hidden rounded-sm border">
      <div className="flex size-full flex-col items-center justify-center">
        <Player
          component={MyVideo}
          durationInFrames={120}
          compositionWidth={1920}
          compositionHeight={1080}
          fps={30}
          controls
          style={{
            width: '100%',
          }}
        />
      </div>
    </div>
  );
}
