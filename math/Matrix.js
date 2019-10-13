export class Mat4
{
    constructor(arr)
    {
        this.arr = arr;
        return this;
    }

    set x(v) { this[12] = v; }

    get x() { return this[12]; }

    set y(v) { this[13] = v; }

    get y() { return this[13]; }

    set z(v) { this[14] = v; }

    get z() { return this[14]; }

    set w(v) { this[15] = v; }

    get w() { return this[15]; }

    set(arr)
    {
        for (let [n, i] of this.arr.entries()) { this.arr[n] = arr[n]; }
        return this;
    }
}
