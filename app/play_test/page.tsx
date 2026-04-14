"use client";

import { useEffect, useRef, useCallback } from "react";
import { ShipObject } from "@/utils/gameObject/ship";
import { NumberBlockObject, GameBlockState } from "@/utils/gameObject/gameBlockObject";
import { useWebSocket } from "@/hooks/useWebSocket";
import { BulletObject } from "@/utils/gameObject/bullet";

const CANVAS_WIDTH = 800;
const CANVAS_HEIGHT = 600;
const SHIP_HALF_WIDTH = 15;
const SHIP_MOVE_STEP = 10;

const FALLING_BLOCK_COUNT = 10;
const FALLING_BLOCK_SPEED = 1; // Move down 2 pixels per frame

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

const localShip = new ShipObject({
  uuid: "ship-1",
  name: "Player Ship",
  playerId: 1,
  xPosition: 400,
  yPosition: 550,
});

const remoteShip = new ShipObject({
  uuid: "ship-2",
  name: "Partner Ship",
  playerId: 2,
  xPosition: 250,
  yPosition: 520,
});

// const block = new NumberBlockObject({
//   uuid: "block-1",
//   name: "Block 1",
//   id: 1,
//   value: 42,
//   xPosition: 200,
//   yPosition: 100,
//   state: GameBlockState.DEFAULT,
// });



type RealtimeMessage = {
  type: "move" | "shoot";
  playerId: number;
  x: number;
  y: number;
};


export default function PlayTest() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const bulletsRef = useRef<BulletObject[]>([]);
  const pressedKeysRef = useRef({
    left: false,
    right: false,
  });

// the bolock moving ; TODO: change to real numberBlocks
  const blocksRef = useRef<NumberBlockObject[]>(
    Array.from({ length: FALLING_BLOCK_COUNT }, (_, index) =>
      new NumberBlockObject({
        uuid: `block-${index + 1}`,
        name: `Block ${index + 1}`,
        id: index + 1,
        value: index + 1,
        xPosition: 70 + index * 70,
        yPosition: -50,
        state: GameBlockState.DEFAULT,
      })
    )
  );

  const handleMessage = useCallback((message: unknown) => {
    const data = message as Partial<RealtimeMessage>;

    if (
      (data.type !== "move" && data.type !== "shoot") ||
      typeof data.playerId !== "number" ||
      typeof data.x !== "number" ||
      typeof data.y !== "number"
    ) {
      return;
    }

    if (data.type === "move" && data.playerId === remoteShip.playerId) {
      remoteShip.xPosition = data.x;
      remoteShip.yPosition = data.y;
      return;
    }

    if (data.type === "shoot") {
      bulletsRef.current.push(new BulletObject({ x: data.x, y: data.y, playerId: data.playerId }));
    }
  }, []);

  const { sendMessage } = useWebSocket(handleMessage);

  // draw blocks by colors
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    canvas.width = CANVAS_WIDTH;
    canvas.height = CANVAS_HEIGHT;

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

    const drawShip = (ship: ShipObject, color: string) => {
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.moveTo(ship.xPosition, ship.yPosition - 20);
      ctx.lineTo(ship.xPosition - SHIP_HALF_WIDTH, ship.yPosition + 10);
      ctx.lineTo(ship.xPosition + SHIP_HALF_WIDTH, ship.yPosition + 10);
      ctx.closePath();
      ctx.fill();
    };

    const gameLoop = () => {
      const minShipX = SHIP_HALF_WIDTH;
      const maxShipX = canvas.width - SHIP_HALF_WIDTH;

      let moved = false;

      if (pressedKeysRef.current.left && !pressedKeysRef.current.right) {
        localShip.moveLeft(SHIP_MOVE_STEP, minShipX);
        moved = true;
      } else if (pressedKeysRef.current.right && !pressedKeysRef.current.left) {
        localShip.moveRight(SHIP_MOVE_STEP, maxShipX);
        moved = true;
      } else {
        localShip.idle();
      }

      if (moved) {
        sendMessage("/app/move", {
          type: "move",
          playerId: localShip.playerId,
          x: localShip.xPosition,
          y: localShip.yPosition,
        });
      }
      
      // Clear
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // drawShip(localShip, "lime");
      drawShip(localShip, "red"); //for testing page
      drawShip(remoteShip, "cyan");
      
      // Update the position of the falling blocks and remove blocks that have reached the bottom of the screen.
      blocksRef.current = blocksRef.current.filter((block) => {
        block.yPosition += FALLING_BLOCK_SPEED;
        return block.yPosition - BLOCK_STYLE.block.halfSize <= canvas.height;
      });

      for (const block of blocksRef.current) {
        drawBlock(block);
      }
      
      // Update and draw bullets
      const blocksOnScreen = blocksRef.current; // TODO: replace with real block array later
      const nextBullets: BulletObject[] = [];

      bulletsRef.current = bulletsRef.current.filter(b => !b.isOffScreen());
      for (const bullet of bulletsRef.current) {
        bullet.update();

        // collision detection
        const hitInfo = detectBulletHit(bullet, blocksOnScreen);
        if (hitInfo) {
          sendMessage("/app/shoot", {
            playerId: hitInfo.playerId,
            blockId: hitInfo.blockId,
          });

          // initiate into default
          for (const block of blocksRef.current) {
            block.state = GameBlockState.DEFAULT;
          }

          // set the hit one into 'selected'
          const targetBlock = blocksRef.current.find(
            (block) => block.id === hitInfo.blockId
          );

          if (targetBlock) {
            targetBlock.state = GameBlockState.SELECTED;
          }

          continue;
        }
        
        
        
        // if (hitInfo) {
        //   console.log("HIT", hitInfo.playerId, hitInfo.blockId);

        //   // send to backend
        //   sendMessage("/app/shoot", {
        //     playerId: hitInfo.playerId,
        //     blockId: hitInfo.blockId,
        //   });

        //   // do not keep bullet after collision
        //   continue;
        // }




        

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
      if (e.code === "KeyA" || e.code === "ArrowLeft") {
        pressedKeysRef.current.left = true;
      }

      if (e.code === "KeyD" || e.code === "ArrowRight") {
        pressedKeysRef.current.right = true;
      }
      
      if (e.code === "Space") {
        sendMessage("/app/shoot", {
          type: "shoot",
          playerId: localShip.playerId,
          x: localShip.xPosition,
          y: localShip.yPosition,
        });
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code === "KeyA" || e.code === "ArrowLeft") {
        pressedKeysRef.current.left = false;
      }

      if (e.code === "KeyD" || e.code === "ArrowRight") {
        pressedKeysRef.current.right = false;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
      cancelAnimationFrame(animationId);
    };
  }, [sendMessage]);

  return (
    <div style={{ width: "100vw", height: "100vh", backgroundColor: "black", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <canvas
        ref={canvasRef}
        width={CANVAS_WIDTH}
        height={CANVAS_HEIGHT}
        style={{ border: "1px solid white" }}
      />
    </div>
  );
}
