import { GameObject } from "./gameObject";

export enum GameBlockState {
    DEFAULT,
    SELECTED,
    ELIMINATED,
    INCORRECT,
}


export class NumberBlockObject extends GameObject {
    public id: number;
    public value: number;
    public state: GameBlockState;

    // Optional: user who selected this block.
    public selectedByUserId?: number;

    // Optional: selection timeout.
    public selectedUntil?: Date;

    // Position used for frontend rendering.
    public xPosition: number;
    public yPosition: number;

    constructor(params: {
        uuid: string;
        name: string;
        id: number;
        value: number;
        xPosition: number;
        yPosition: number;
        state?: GameBlockState;
        selectedByUserId?: number;
        selectedUntil?: Date;
    }) {
        super(params.uuid, params.name);
        this.id = params.id;
        this.value = params.value;
        this.xPosition = params.xPosition;
        this.yPosition = params.yPosition;
        this.state = params.state ?? GameBlockState.DEFAULT;
        this.selectedByUserId = params.selectedByUserId;
        this.selectedUntil = params.selectedUntil;
    }

    public select(userId: number, durationMs: number = 5000): void {
        this.state = GameBlockState.SELECTED;
        this.selectedByUserId = userId;
        this.selectedUntil = new Date(Date.now() + durationMs);
    }

    public reset(): void {
        this.state = GameBlockState.DEFAULT;
        this.selectedByUserId = undefined;
        this.selectedUntil = undefined;
    }

    public eliminate(): void {
        this.state = GameBlockState.ELIMINATED;
        this.selectedByUserId = undefined;
        this.selectedUntil = undefined;
    }

    public markIncorrect(): void {
        this.state = GameBlockState.INCORRECT;
        this.selectedByUserId = undefined;
        this.selectedUntil = undefined;
    }

    public isSelectionExpired(now: Date = new Date()): boolean {
        return (
            this.state === GameBlockState.SELECTED &&
            this.selectedUntil !== undefined &&
            this.selectedUntil.getTime() <= now.getTime()
        );
    }

    public isSelectable(): boolean {
        return this.state === GameBlockState.DEFAULT;
    }

    public matchesWith(other: NumberBlockObject, target: number): boolean {
        return this.value * other.value === target;
    }
    
}

//test

// const block = new NumberBlockObject({
// uuid: "u-1",
// name: "gameBlock 1",
// id: 1,
// value: 42,
// xPosition: 120,
// yPosition: 340,
// state: GameBlockState.SELECTED,
// selectedByUserId: 99,
// selectedUntil: new Date(Date.now() + 5000),
// });