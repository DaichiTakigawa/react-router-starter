import { AbsoluteFill, useCurrentFrame } from 'remotion';

export function MyVideo() {
  const frame = useCurrentFrame();

  return (
    <AbsoluteFill
      style={{
        justifyContent: 'center',
        alignItems: 'center',
        fontSize: 100,
        backgroundColor: 'white',
        color: 'black',
      }}
    >
      The current frame is {frame}.
    </AbsoluteFill>
  );
}
