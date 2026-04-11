import { GameObject } from "./gameObject";

export class BulletObject extends GameObject {
    public x: number;
    public y: number;
    public playerId: number;
    private speed: number = 8;

    constructor(params: { x: number; y: number; playerId: number }) {
        super(crypto.randomUUID(), "bullet");
        this.x = params.x;
        this.y = params.y;
        this.playerId = params.playerId;
    }

    public update(): void {
        this.y -= this.speed;
    }

    public isOffScreen(): boolean {
        return this.y < 0;
    }
}
