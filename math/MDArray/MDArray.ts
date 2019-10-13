import { swap, getStrides, pairWise } from "./helper";

class MDArray {
    shape: number[];
    size: number;
    mdim: number;
    strides: number[];
    strideShape: number[];
    axisCounter: number[];
    reptCounter: number[];
    repeats: number[];
    wasAdvanced: boolean[];
    pos: number;
    index: number;

    constructor(
        shape: number[],
        strides = null,
        mdim = null,
        size = null,
        order = null
    ) {
        if (!shape && !size) {
            throw TypeError;
        } else if (shape && !size) {
            this.shape = shape;
            this.size = shape.reduce((x: number, y: number) => {
                return x * y;
            });
        } else if (size && !shape) {
            this.size = size;
            this.shape = [size];
        }

        this.mdim = mdim || this.shape.length;
        this.strides = strides || getStrides(this.shape);
        this.strideShape = pairWise(
            this.shape,
            this.strides,
            (x: number, y: number) => {
                return x * y;
            }
        );

        this.axisCounter = new Array(this.mdim).fill(0);
        this.reptCounter = new Array(this.mdim).fill(0);
        this.repeats = new Array(this.mdim).fill(0);

        this.wasAdvanced = new Array(this.mdim).fill(false);

        this.pos = 0;
        this.index = 0;
    }

    reshape(shape: number[]) {
        let newShape = new Array(...shape);
        let newMdim = newShape.length;
        let newSize = newShape.reduce((x, y) => {
            return x * y;
        });

        if (newSize != this.size) {
            throw TypeError;
        } else {
            this.shape = newShape;
            this.mdim = newMdim;
            this.strides = getStrides(this.shape);
            this.strideShape = pairWise(
                this.shape,
                this.strides,
                (x: number, y: number) => {
                    return x * y;
                }
            );
        }
        return this;
    }

    transpose(axis1: number = 0, axis2: number = 1) {
        if (axis1 < 0) {
            axis1 += this.mdim;
        }
        if (axis2 < 0) {
            axis2 += this.mdim;
        }
        let maxis = Math.max(axis1, axis2);
        if (maxis > this.mdim - 1) {
            let paxis = maxis - (this.mdim - 1);
            //@ts-ignore
            this.reshape(this.shape + new Array(paxis).fill(1));
        }
        swap(this.strides, axis1, axis2);
        swap(this.shape, axis1, axis2);
        this.strideShape = pairWise(
            this.shape,
            this.strides,
            (x: number, y: number) => {
                return x * y;
            }
        );
        return this;
    }
}

function* MDArrayIter(mdarray: MDArray) {
    let strideShape = mdarray.strideShape;
    let strides = mdarray.strides;
    let mdim = mdarray.mdim;
    let size = mdarray.size;

    let axisCounter = mdarray.axisCounter;
    let reptCounter = mdarray.reptCounter;
    let repeats = mdarray.repeats;

    let wasAdvanced = mdarray.wasAdvanced;

    let i = 0;
    while (i < size) {
        mdarray.index = axisCounter.reduce((x: number, y: number) => {
            return x + y;
        });
        mdarray.pos++;
        yield mdarray.index;

        if (reptCounter[0] < repeats[0]) {
            reptCounter[0]++;
        } else {
            reptCounter[0] = 0;
            axisCounter[0] += strides[0];
        }

        for (let j = 1; j < mdim; j++) {
            if (axisCounter[j - 1] >= strideShape[j - 1]) {
                if (reptCounter[j] == repeats[j]) {
                    reptCounter[j] = 0;
                    axisCounter[j - 1] = 0;
                    axisCounter[j] += strides[j];
                    wasAdvanced[j] = true;
                } else {
                    reptCounter[j]++;
                    axisCounter[j - 1] = 0;
                }
            } else {
                wasAdvanced[j] = false;
            }
        }
        i++;
    }
}

let m = new MDArray([4, 4]);
m.transpose();
for (let i of MDArrayIter(m)) {
    console.log(i);
}
