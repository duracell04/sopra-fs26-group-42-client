"use client";

import { useEffect, useRef, useCallback } from "react";
import { ShipObject } from "@/utils/gameObject/ship";
import { NumberBlockObject, GameBlockState } from "@/utils/gameObject/gameBlockObject";
import { useWebSocket } from "@/hooks/useWebSocket";

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

  const handleMessage = useCallback((message: unknown) => {
    console.log("Bullet fired:", message);
    // later: add bullet to state and draw it on canvas
  }, []);

  const { sendMessage } = useWebSocket(handleMessage);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Clear
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw ship as a triangle
    ctx.fillStyle = "lime";
    ctx.beginPath();
    ctx.moveTo(ship.xPosition, ship.yPosition - 20);
    ctx.lineTo(ship.xPosition - 15, ship.yPosition + 10);
    ctx.lineTo(ship.xPosition + 15, ship.yPosition + 10);
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
    return () => window.removeEventListener("keydown", handleKeyDown);
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
