class InvertPoint {
    constructor(point){
        this.point = point
    }
    get x(){
        return -this.point.x
    }
    set x(v){
        this.point.x = -v
        return true
    }
    get y(){
        return -this.point.y
    }
    set y(v){
        this.point.y = -v
        return true
    }

}
class Scene extends Rect {
    constructor(options){
        super(options)
    }
    get corrector(){ return new InvertPoint(this.point) }
    addGameObjects(...gameObjects){
        this.gameObjects.push(...gameObjects)
    }
    update(deltaTime){
        this.gameObjects.forEach(go=>go.update(deltaTime))
    }
    findCollision(){
        const collisions = []
        const map = new RectMap(this, 5)
        const statics = this._gameObjects.filter(go=>go.type === 'static_game_object')
        const dynamics = this._gameObjects.filter(go=>go.type === 'dynamic_game_object')
        statics.forEach(go=>map.insert(go.getOutlineRect(), ()=>{}))
        dynamics.forEach(go=>map.insert(go.getOutlineRect(), (node, data)=>{
            collisions.push(data)
        }))
        return collisions
    }
    get gameObjects(){return this._gameObjects}
    _gameObjects = []
}