export { swap, pairWise, getStrides };

function swap(arr: number[], ix1: number, ix2: number) {
    let t = arr[ix1];
    arr[ix1] = arr[ix2];
    arr[ix2] = t;
}

function pairWise(
    arr1: any[] | number[],
    arr2: any[] | number[],
    func: {
        (x: number, y: number): number;
        (x: number, y: number): number;
        (x: number, y: number): number;
        (arg0: any, arg1: any): void;
    }
) {
    let buff = new Array(Math.min(arr1.length, arr2.length));
    for (let i = 0; i < buff.length; i++) {
        buff[i] = func(arr1[i], arr2[i]);
    }
    return buff;
}

function getStrides(shape: number[]) {
    let N = shape.length;
    let init = 1;
    let strides = new Array(N).fill(0);
    strides[0] = init;
    for (let i = 0; i < N - 1; i++) {
        init *= shape[i];
        strides[i + 1] = init;
    }
    return strides;
}
