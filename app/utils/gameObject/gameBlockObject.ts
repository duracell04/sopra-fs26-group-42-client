import { GameObject } from "./gameObject";

export enum NumberBlockState {
    DEFAULT,
    SELECTED,
    ELIMINATED,
    INCORRECT,
}


export class NumberBlockObject extends GameObject {
    public id: number;
    public value: number;
    public state: NumberBlockState;

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
        state?: NumberBlockState;
        selectedByUserId?: number;
        selectedUntil?: Date;
    }) {
        super(params.uuid, params.name);
        this.id = params.id;
        this.value = params.value;
        this.xPosition = params.xPosition;
        this.yPosition = params.yPosition;
        this.state = params.state ?? NumberBlockState.DEFAULT;
        this.selectedByUserId = params.selectedByUserId;
        this.selectedUntil = params.selectedUntil;
    }
}

//test
const block = new NumberBlockObject({
uuid: "u-1",
name: "Block 1",
id: 1,
value: 42,
xPosition: 120,
yPosition: 340,
state: NumberBlockState.SELECTED,
selectedByUserId: 99,
selectedUntil: new Date(Date.now() + 5000),
});