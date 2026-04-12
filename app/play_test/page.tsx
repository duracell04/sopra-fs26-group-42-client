"use client";

import { useEffect, useRef, useCallback } from "react";
import { ShipObject } from "@/utils/gameObject/ship";
import { NumberBlockObject, GameBlockState } from "@/utils/gameObject/gameBlockObject";
import { useWebSocket } from "@/hooks/useWebSocket";
import { BulletObject } from "@/utils/gameObject/bullet";

// helper functions for collision detection
type HitResult = {
  playerId: number;
  blockId: number;
};

function getBulletRect(bullet: BulletObject) {
  const halfW = BLOCK_STYLE.bullet.width / 2;
  return {
    left: bullet.x - halfW,
    right: bullet.x + halfW,
    top: bullet.y - BLOCK_STYLE.bullet.height,
    bottom: bullet.y,
  };
}

function getBlockRect(block: NumberBlockObject) {
  return {
    left: block.xPosition - BLOCK_STYLE.block.halfSize,
    right: block.xPosition + BLOCK_STYLE.block.halfSize,
    top: block.yPosition - BLOCK_STYLE.block.halfSize,
    bottom: block.yPosition + BLOCK_STYLE.block.halfSize,
  };
}

function isOverlapping(
  a: { left: number; right: number; top: number; bottom: number },
  b: { left: number; right: number; top: number; bottom: number }
) {
  return !(
    a.right < b.left ||
    a.left > b.right ||
    a.bottom < b.top ||
    a.top > b.bottom
  );
}

function detectBulletHit(
  bullet: BulletObject,
  blocks: NumberBlockObject[]
): HitResult | null {
  const bulletRect = getBulletRect(bullet);

  for (const block of blocks) {
    if (block.state === GameBlockState.ELIMINATED) continue;

    const blockRect = getBlockRect(block);
    if (isOverlapping(bulletRect, blockRect)) {
      return {
        playerId: bullet.playerId,
        blockId: block.id,
      };
    }
  }

  return null;
}


// global styling
const BLOCK_STYLE = {
  ship: {
    fillStyle: "lime",
  },
  block: {
    size: 50,
    halfSize: 25,
    fillByState: {
      [GameBlockState.DEFAULT]: "#2980b9",
      [GameBlockState.SELECTED]: "#f39c12",
      [GameBlockState.INCORRECT]: "#e74c3c",
      [GameBlockState.ELIMINATED]: "transparent",
    } satisfies Record<GameBlockState, string>, // to index the status
    text: {
      fillStyle: "white",
      font: "18px Arial",
      textAlign: "center" as const,
      textBaseline: "middle" as const,
    },
  },
  bullet: {
    fillStyle: "yellow",
    width: 4,
    height: 8,
  },
};

const ship = new ShipObject({
  uuid: "ship-1",
  name: "Player Ship",
  playerId: 1,
  xPosition: 400,
  yPosition: 550,
});

const block = new NumberBlockObject({
  uuid: "block-1",
  name: "Block 1",
  id: 1,
  value: 42,
  xPosition: 200,
  yPosition: 100,
  state: GameBlockState.DEFAULT,
});


export default function PlayTest() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const bulletsRef = useRef<BulletObject[]>([]);


  const handleMessage = useCallback((message: unknown) => {
    console.log("Bullet fired:", message);
    const data = message as { playerId: number; x: number; y: number };
    bulletsRef.current.push(new BulletObject({ x: data.x, y: data.y, playerId: data.playerId }));
    
  }, []);

  const { sendMessage } = useWebSocket(handleMessage);

  // draw blocks by colors
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationId: number;

    const drawBlock = (block: NumberBlockObject) => {
      if (block.state === GameBlockState.ELIMINATED) return; // vanish

      ctx.fillStyle = BLOCK_STYLE.block.fillByState[block.state];

      let x = block.xPosition;
      let y = block.yPosition;

      ctx.fillRect(
        x - BLOCK_STYLE.block.halfSize,
        y - BLOCK_STYLE.block.halfSize,
        BLOCK_STYLE.block.size,
        BLOCK_STYLE.block.size
      );

      ctx.fillStyle = BLOCK_STYLE.block.text.fillStyle;
      ctx.font = BLOCK_STYLE.block.text.font;
      ctx.textAlign = BLOCK_STYLE.block.text.textAlign;
      ctx.textBaseline = BLOCK_STYLE.block.text.textBaseline;
      ctx.fillText(String(block.value), x, y);
    };

    const gameLoop = () => {
      // Clear
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Draw ship as a triangle
      ctx.fillStyle = BLOCK_STYLE.ship.fillStyle;
      ctx.beginPath();
      ctx.moveTo(ship.xPosition, ship.yPosition - 20);
      ctx.lineTo(ship.xPosition - 15, ship.yPosition + 10);
      ctx.lineTo(ship.xPosition + 15, ship.yPosition + 10);
      ctx.closePath();
      ctx.fill();

      // Draw number block as a rectangle with its value
      drawBlock(block);
      // ctx.fillStyle = "steelblue";
      // ctx.fillRect(block.xPosition - 25, block.yPosition - 25, 50, 50);
      // ctx.fillStyle = "white";
      // ctx.font = "20px Arial";
      // ctx.textAlign = "center";
      // ctx.textBaseline = "middle";
      // ctx.fillText(String(block.value), block.xPosition, block.yPosition);

      // Update and draw bullets
      const blocksOnScreen = [block]; // TODO: replace with real block array later
      const nextBullets: BulletObject[] = [];

      bulletsRef.current = bulletsRef.current.filter(b => !b.isOffScreen());
      for (const bullet of bulletsRef.current) {
        bullet.update();

        // collision detection
        const hitInfo = detectBulletHit(bullet, blocksOnScreen);
        if (hitInfo) {
          console.log("HIT", hitInfo.playerId, hitInfo.blockId);

          // send to backend
          sendMessage("/app/shoot", {
            playerId: hitInfo.playerId,
            blockId: hitInfo.blockId,
          });

          // do not keep bullet after collision
          continue;
        }

        // render on-screen bullets only
        if (!bullet.isOffScreen()) {
          nextBullets.push(bullet);

          ctx.fillStyle = BLOCK_STYLE.bullet.fillStyle;
          ctx.fillRect(
            bullet.x - BLOCK_STYLE.bullet.width / 2,
            bullet.y - BLOCK_STYLE.bullet.height,
            BLOCK_STYLE.bullet.width,
            BLOCK_STYLE.bullet.height
          );
        }
      }

      bulletsRef.current = nextBullets; // update bullets for the next iteration
      animationId = requestAnimationFrame(gameLoop);
    };

    animationId = requestAnimationFrame(gameLoop);

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === "Space") {
        sendMessage("/app/shoot", {
          playerId: ship.playerId,
          x: ship.xPosition,
          y: ship.yPosition,
        });
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      cancelAnimationFrame(animationId);
    };
  }, [sendMessage]);

  return (
    <div style={{ width: "100vw", height: "100vh", backgroundColor: "black", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <canvas
        ref={canvasRef}
        width={800}
        height={600}
        style={{ border: "1px solid white" }}
      />
    </div>
  );
}
