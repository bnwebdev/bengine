class Game {
    constructor(){}
    _process(){
        const currentTime = Date.now()
        const prevTime = this._prevTime

        if(this._isFirstStep){
            this._isFirstStep = false
        } else if(this._currentScene){
            this._currentScene.update(currentTime - prevTime)
            const collisions = this._currentScene.findCollision()
            this._reactToCollisions(collisions)
        }
        if(this._currentScene){
            this._renderer.clear()
            this._renderer.render(this._currentScene)
        }

        this._prevTime = currentTime
    }
    _reactToCollisions(collisions){
        const reacted = {}
        for(let localCollisions of collisions){
            for(let i = 0; i < localCollisions.length - 1; i++){
                const obj1 = localCollisions[i]
                for(let j = i + 1; j < localCollisions.length; j++){
                    const obj2 = localCollisions[j]
                    if(!obj1.intersect(obj2)) continue;
                    if(!reacted[obj1]) reacted[obj1] = []
                    if(!reacted[obj2]) reacted[obj2] = []
                    if(!reacted[obj1].find(obj=>obj === obj2)){
                        this._classMathHandler.check(obj1.target, obj2.target)
                        reacted[obj1].push(obj2)
                        reacted[obj2].push(obj1)
                    }
                }
            }
        }
    }
    set scene(nameScene){
        let isSeted = false
        const candidate = this._scenes.get(nameScene)
        if(candidate){
            this._currentNameScene = nameScene
            isSeted = true
        }
        return isSeted
    }
    get scene(){
        return this._currentNameScene
    }
    set renderer(renderer){
        this._renderer = renderer
    }
    start(){
        this._setAllMatchHandlers()
        if(!this._timestamp){
            this._timestamp = setInterval(this._process.bind(this), 1000 / this._fps)
        }
    }
    stop(){
        if(this._timestamp){
            clearInterval(this._timestamp)
            this._timestamp = null
        }
    }
    getProtos(prototypeName){
        return this._gameObjectProtos[prototypeName]
    }
    createGameObject(name, type, propertys = {}, handlers = {}){
        if(!propertys.constructor){
            propertys.constructor = ()=>{}
        }
        if(type === 'static'){
            this._gameObjectProtos[name] = class extends StaticGameObject {
                constructor(...args){
                    super()
                    propertys.constructor.apply(this, args)
                }
            }
        } else if(type === 'dynamic'){
            this._gameObjectProtos[name] = class extends DynamicGameObject {
                constructor(...args){
                    super()
                    propertys.constructor.apply(this, args)
                }
            }
        } else {
            throw new Error('Undefinde type of object')
        }
        const ProtosObject = this.getProtos(name)
        for(let key of Object.keys(propertys)){
            if(key === 'constructor') continue;
            Object.defineProperty(ProtosObject.prototype, key, {
                value: propertys[key],
                enumerable: true,
                writable: true,
                configurable: true
            })
            ProtosObject.prototype[key] = propertys[key]
        }
        ProtosObject.handlers = handlers
        return ProtosObject
    }
    _setAllMatchHandlers(){
        if(this._isAllMatchHandlersInited) return;
        const protos = this._gameObjectProtos
        for(let name1 of Object.keys(protos)){
            for(let name2 of Object.keys(protos[name1].handlers)){
                this._setMatchHandler(name1, name2, protos[name1].handlers[name2])
            }
        }
        this._isAllMatchHandlersInited = true
    }
    _setMatchHandler(name1, name2, handler){
        this._classMathHandler.setMatch(
            this._gameObjectProtos[name1],
            this._gameObjectProtos[name2],
            handler
        )
    }
    addScene(name, scene){
        this._scenes.set(name, scene)
    }
    get _currentScene(){
        return this._currentNameScene? this._scenes.get(this._currentNameScene): null
    }
    _gameObjectProtos = {}
    _classMathHandler = new ClassMatchHandler()
    _prevTime = null
    _isFirstStep = true
    _scenes = new Map()
    _currentNameScene = null
    _timestamp = null
    _renderer = null
    _fps = 120
    _isAllMatchHandlersInited = false
}