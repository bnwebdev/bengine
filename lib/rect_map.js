const RectMap = (function(){

const NullNode = null

function getDeepRects({point, width, height}){
    width /= 2
    height /= 2
    const upLhsRect = new Rect({width, height, point})
    const downLhsRect = new Rect({
        width, height, point: point.add({x: 0, y: height})
    })
    const upRhsRect = new Rect({
        width, height, point: point.add({x: width, y: 0})
    })
    const downRhsRect = new Rect({
        width, height, point: point.add({x: width, y: height})
    })
    return {
        upLhsRect,
        downLhsRect,
        upRhsRect,
        downRhsRect
    }
}

return class RectNode {
    constructor(Rect, deepLength){
        this.Rect = ()=>Rect
        this.deepLength = ()=>deepLength
    }
    initialized = false
    upLhsNode = NullNode
    downLhsNode = NullNode
    upRhsNode = NullNode
    downRhsNode = NullNode
    data = []
    initialize(){
        const deep = this.deepLength() - 1
        const {
            upLhsRect, downLhsRect, upRhsRect, downRhsRect
        } = getDeepRects(this.Rect()) 
        this.upLhsNode = new RectNode(upLhsRect, deep)
        this.downLhsNode = new RectNode(downLhsRect, deep)
        this.upRhsNode = new RectNode(upRhsRect, deep)
        this.downRhsNode = new RectNode(downRhsRect, deep)
        this.initialized = true
    }
    get deepNodes(){
        return [
            this.upLhsNode,
            this.downLhsNode,
            this.upRhsNode,
            this.downRhsNode
        ]
    }
    check(Rect, handler){
        if(this.Rect().intersect(Rect)){
            handler(this, this.data)
        }
    }
    deepCheck(Rect, handler){
        this.check(Rect, function(node, data){
            if(node.initialized){
                node.deepNodes.forEach(deepNode=>deepNode.deepCheck(Rect, handler))
            } else {
                handler(node, data)
            }
        })
    }
    insert(Rect, handler = ()=>{}){
        this.deepCheck(Rect, function(node, data){
            if(data.length === 0){
                data.push(Rect)
            } else if(node.deepLength() === 0){
                data.push(Rect)
                handler(node, data)
            } else {
                node.initialize()
                node.data.forEach(el=>node.insert(el))
                node.data.length = 0
                node.insert(Rect, handler)
            }
        })
    }
    erase(Rect, equalFn = candidate=>candidate === Rect, prev = null){
        this.check(Rect, function(node, data){
            if(node.initialized){
                node.deepNodes.forEach(n=>n.erase(Rect, equalFn, prev))
            } else {
                node.data = data.filter(candidate=>!equalFn(candidate))
                if(node.data.length === 0 && prev){
                    const count = prev.deepNodes.reduce((total, n)=>total += n.data.length, 0)
                    if(count === 0){
                        prev.upLhsNode = NullNode
                        prev.downLhsNode = NullNode
                        prev.upRhsNode = NullNode
                        prev.downRhsNode = NullNode
                        prev.initialized = false
                    }
                }
            }
        })
    }
}

})()