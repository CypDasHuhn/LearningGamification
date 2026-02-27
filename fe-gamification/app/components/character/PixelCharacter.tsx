const PIXEL_SIZE = 3;

const SPRITE_COLORS = {
  skin: "#f5c89a",
  hair: "#3d2b1f",
  shirt: "#e63946",
  pants: "#1d3557",
  boot: "#3a2010",
  eye: "#1c1917",
  belt: "#8b6914",
};

type PixelBlockProps = {
  column: number;
  row: number;
  color: string;
  width?: number;
  height?: number;
};

function PixelBlock({
  column,
  row,
  color,
  width = 1,
  height = 1,
}: PixelBlockProps) {
  return (
    <div
      style={{
        position: "absolute",
        left: column * PIXEL_SIZE,
        top: row * PIXEL_SIZE,
        width: width * PIXEL_SIZE,
        height: height * PIXEL_SIZE,
        background: color,
      }}
    />
  );
}

type PixelCharacterProps = {
  facingLeft: boolean;
  isWalking: boolean;
};

export function PixelCharacter({ facingLeft, isWalking }: PixelCharacterProps) {
  const { skin, hair, shirt, pants, boot, eye, belt } = SPRITE_COLORS;

  return (
    <div
      style={{
        position: "relative",
        width: 8 * PIXEL_SIZE,
        height: 18 * PIXEL_SIZE,
        transform: facingLeft ? "scaleX(-1)" : "scaleX(1)",
        imageRendering: "pixelated",
        filter: "drop-shadow(1px 3px 0 rgba(0,0,0,0.55))",
      }}
    >
      <PixelBlock column={1} row={0} color={hair} width={6} />
      <PixelBlock column={0} row={1} color={hair} />
      <PixelBlock column={7} row={1} color={hair} />
      <PixelBlock column={1} row={1} color={skin} width={6} />
      <PixelBlock column={0} row={2} color={skin} width={8} />
      <PixelBlock column={0} row={3} color={skin} width={8} />
      <PixelBlock column={2} row={2} color={eye} />
      <PixelBlock column={5} row={2} color={eye} />
      <PixelBlock column={1} row={4} color={shirt} width={6} height={4} />
      <PixelBlock column={0} row={4} color={skin} height={3} />
      <PixelBlock column={7} row={4} color={skin} height={3} />
      <PixelBlock column={1} row={8} color={belt} width={6} />

      {isWalking ? (
        <>
          <PixelBlock column={1} row={9} color={pants} width={3} height={3} />
          <PixelBlock column={1} row={12} color={pants} width={3} height={1} />
          <PixelBlock column={1} row={13} color={boot} width={3} height={2} />
          <PixelBlock column={4} row={9} color={pants} width={3} height={3} />
          <PixelBlock column={4} row={12} color={pants} width={3} height={1} />
          <PixelBlock column={4} row={13} color={boot} width={3} height={2} />
        </>
      ) : (
        <>
          <PixelBlock column={1} row={9} color={pants} width={6} height={4} />
          <PixelBlock column={1} row={13} color={boot} width={3} height={2} />
          <PixelBlock column={4} row={13} color={boot} width={3} height={2} />
        </>
      )}
    </div>
  );
}

export const CHARACTER_KEYFRAMES = `
@keyframes charBob {
  0%,100% { transform: translateY(0px) translateX(-50%); }
  50%      { transform: translateY(-3px) translateX(-50%); }
}
@keyframes charIdle {
  0%,100% { transform: translateY(0px) translateX(-50%); }
  50%      { transform: translateY(-1px) translateX(-50%); }
}
`;
