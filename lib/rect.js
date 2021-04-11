class Rect {
    constructor({point, width, height}){
        this.point = point
        this.width = width
        this.height = height
    }
    intersect(other){
        const {width, height, point} = other
        const lox = point.x
        const rox = point.x + width
        const lmx = this.point.x
        const rmx = this.point.x + this.width

        const loy = point.y
        const roy = point.y + height
        const lmy = this.point.y
        const rmy = this.point.y + this.height
        const isXIntersect = lox < rmx && lmx < rox
        const isYIntersect = loy < rmy && lmy < roy

        return isXIntersect && isYIntersect
    }
}