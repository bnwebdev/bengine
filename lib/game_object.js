class GameObject {
    constructor(type = 'game_object'){
        this.type = type
    }
    update(dt){
        throw new Error(`Method dont overriden`)
    }
    getOutlineRect(){
        throw new Error(`Method dont overriden`)
    }
}

class StaticGameObject extends GameObject {
    constructor(){
        super('static_game_object')
    }
    update(dt){}
}

class DynamicGameObject extends GameObject {
    constructor(){
        super('dynamic_game_object')
    }
}
