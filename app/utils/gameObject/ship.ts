import { GameObject } from "./gameObject";

export enum ShipState {
    IDLE,
    MOVING,
    SHOOTING,
    DESTROYED,
}

export class ShipObject extends GameObject {
    public playerId: number;
    public xPosition: number;
    public yPosition: number;
    public state: ShipState;

    constructor(params: {
        uuid: string;
        name: string;
        playerId: number;
        xPosition: number;
        yPosition: number;
        state?: ShipState;
    }) {
        super(params.uuid, params.name);
        this.playerId = params.playerId;
        this.xPosition = params.xPosition;
        this.yPosition = params.yPosition;
        this.state = params.state ?? ShipState.IDLE;
    }

    public moveLeft(step: number = 10, minX: number = 0): void {
        this.xPosition = Math.max(minX, this.xPosition - step);
        this.state = ShipState.MOVING;
    }

    public moveRight(step: number = 10, maxX: number = Number.POSITIVE_INFINITY): void {
        this.xPosition = Math.min(maxX, this.xPosition + step);
        this.state = ShipState.MOVING;
    }

    public shoot(): void {
        this.state = ShipState.SHOOTING;
    }

    public idle(): void {
        this.state = ShipState.IDLE;
    }

    public destroy(): void {
        this.state = ShipState.DESTROYED;
    }

    public isDestroyed(): boolean {
        return this.state === ShipState.DESTROYED;
    }
}
