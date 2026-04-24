import { GameObject } from "./gameObject";

export class BulletObject extends GameObject {
    public x: number;
    public y: number;
    public playerId: number;
    private speed: number = 336;

    constructor(params: { x: number; y: number; playerId: number }) {
        super(`bullet-${Date.now()}-${Math.random().toString(36).slice(2)}`, "bullet");
        this.x = params.x;
        this.y = params.y;
        this.playerId = params.playerId;
    }

    public update(deltaSeconds: number = 1 / 60): void {
        this.y -= this.speed * deltaSeconds;
    }

    public isOffScreen(): boolean {
        return this.y < 0;
    }
}
