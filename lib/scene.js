class Scene {
    update(deltaTime){
        this._gameObjects.forEach(go=>go.update(deltaTime))
    }
    _gameObjects = []
}