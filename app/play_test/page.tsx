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

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    canvas.width = CANVAS_WIDTH;
    canvas.height = CANVAS_HEIGHT;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationId: number;

    const gameLoop = () => {
      // Clear
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Draw ship as a triangle
      ctx.fillStyle = "lime";
      ctx.beginPath();
      ctx.moveTo(ship.xPosition, ship.yPosition - 20);
      ctx.lineTo(ship.xPosition - SHIP_HALF_WIDTH, ship.yPosition + 10);
      ctx.lineTo(ship.xPosition + SHIP_HALF_WIDTH, ship.yPosition + 10);
      ctx.closePath();
      ctx.fill();

      // Draw number block as a rectangle with its value
      ctx.fillStyle = "steelblue";
      ctx.fillRect(block.xPosition - 25, block.yPosition - 25, 50, 50);
      ctx.fillStyle = "white";
      ctx.font = "20px Arial";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(String(block.value), block.xPosition, block.yPosition);

      // Update and draw bullets
      bulletsRef.current = bulletsRef.current.filter(b => !b.isOffScreen());
      for (const bullet of bulletsRef.current) {
        bullet.update();
        ctx.fillStyle = "yellow";
        ctx.fillRect(bullet.x - 2, bullet.y - 8, 4, 8);
      }

      animationId = requestAnimationFrame(gameLoop);
    };

    animationId = requestAnimationFrame(gameLoop);

    const handleKeyDown = (e: KeyboardEvent) => {
      const minShipX = SHIP_HALF_WIDTH;
      const maxShipX = canvas.width - SHIP_HALF_WIDTH;
      
      if (e.code === "KeyA" || e.code === "ArrowLeft") {
        ship.moveLeft(SHIP_MOVE_STEP, minShipX);
      }

      if (e.code === "KeyD" || e.code === "ArrowRight") {
        ship.moveRight(SHIP_MOVE_STEP, maxShipX);
      }
      
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
        width={CANVAS_WIDTH}
        height={CANVAS_HEIGHT}
        style={{ border: "1px solid white" }}
      />
    </div>
  );
}
