class Game {
    constructor(){
        _init()
    }
    _init(){
        this._setAllMatchHandlers()
    }
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
            this._renderer.render(this._currentScene)
        }

        this._prevTime = currentTime
    }
    _reactToCollisions(collisions){
        for(let localCollisions of collisions){
            for(let i = 0; i < localCollisions.length - 1; i++){
                const obj1 = localCollisions[i]
                const obj2 = localCollisions[i + 1]
                this._classMathHandler.check(obj1, obj2)
            }
        }
    }
    set scene(nameScene){
        let isSeted = false
        const candidate = this._scenes.get(nameScene)
        if(candidate){
            this._currentScene = candidate
            isSeted = true
        }
        return isSeted
    }
    set render(renderer){
        this._renderer = render
    }
    start(){
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
    createGameObject(name, type, propertys = {}, handlers = {}){
        if(type === 'static'){
            this._gameObjectProtos[name] = class extends StaticGameObject {}
            for(let key of Object.keys(propertys)){
                this._gameObjectProtos[name].prototype[key] = propertys[key]
            }
        } else if(type === 'dynamic'){
            this._gameObjectProtos[name] = class extends DynamicGameObject {}
            for(let key of Object.keys(propertys)){
                this._gameObjectProtos[name].prototype[key] = propertys[key]
            }
        } else {
            throw new Error('Undefinde type of object')
        }
        this._gameObjectProtos[name].handlers = handlers
    }
    _setAllMatchHandlers(){
        const protos = this._gameObjectProtos
        for(let name1 of Object.keys(protos)){
            for(let name2 of Object.keys(protos[name1].handlers)){
                this.setMatchHandler(name1, name2, protos[name1].handlers[name2])
            }
        }
    }
    setMatchHandler(name1, name2, handler){
        this._classMathHandler.setMatch(
            this._gameObjectProtos[name1],
            this._gameObjectProtos[name2],
            handler
        )
    }
    _gameObjectProtos = {}
    _classMathHandler = new ClassMatchHandler()
    _prevTime = null
    _isFirstStep = true
    _scenes = new Map()
    _currentScene = null
    _timestamp = null
    _renderer = null
    _fps = 60
}