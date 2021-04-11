class Point {
    constructor({x = 0, y = 0, z = 0}){
        this.x = x
        this.y = y
        this.z = z
    }
    sub(other){
        return new Point({
            x: this.x - other.x,
            y: this.y - other.y,
            z: this.z - other.z
        })
    }
    add(other){
        return new Point({
            x: this.x + other.x,
            y: this.y + other.y,
            z: this.z + other.z
        })
    }
    multValue(value){
        return new Point({
            x: this.x * value,
            y: this.y * value,
            z: this.z * value
        })
    }
    modify(fn){
        const {x, y, z} = fn(this)
        this.x = x
        this.y = y
        this.z = z
        return this
    }
    assign(other){
        this.x = other.x
        this.y = other.y
        this.z = other.z
    }

}