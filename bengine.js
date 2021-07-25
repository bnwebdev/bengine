const bengine = (function(){
    function sortClassComparator(lhs, rhs){
        return lhs === rhs? 0: lhs.prototype instanceof rhs? -1 : 1
    }
    sortClassComparator.reverse = function(lhs, rhs){
        return sortClassComparator(rhs, lhs)
    }
    
    class Renderer {
        __drawFunctions = []
        async render(scene){      
            this.draw(scene, ...scene.gameObjects)
        }
        drawOne(gameObj){
            const drawFunctions = this.__drawFunctions.filter(fn=>gameObj instanceof fn.aimClass)
            const sortedDrawFunctions = drawFunctions.sort(
                (lhsFn, rhsFn)=>sortClassComparator(lhsFn.aimClass, rhsFn.aimClass)
            )
            sortedDrawFunctions.map(fn=>fn(gameObj))
        }
        draw(...objsToDraw){
            objsToDraw.forEach(this.drawOne.bind(this))
        }
        register(classToDraw, fnToDraw){
            fnToDraw.aimClass = classToDraw
            this.__drawFunctions.push(fnToDraw)
        }
        __getNext(arrFn, obj){
            let idx = 0
            function use(){
                arrFn[idx](obj, next)
            }
            return function next(){
                if(idx >= arrFn.length) return;
                use()
                idx++
            }
        }
    }
    
    class GameObject {
        type = 'game__object'
        /**
         * @returns Squere or Array<Squer>
         * Squer must be {poin: {x, y}, width, height, intersect(otherSquer)}
         */
        getCircuit(){
            throw new Error(`Don't implimintation method`)
        }
        async update(dt){
            throw new Error(`Don't implimintation method`)
        }
    }
    
    class Scene extends GameObject {
        constructor(rect){
            super()
            this.rect = rect
        }
        getCircuit(){
            return this.rect
        }
        push(...object){
            this.gameObjects.push(...object)
            return this
        }
        async update(...args){
            await Promise.all(
                this.gameObjects.map(go=>go.update(...args))
            )
        }
        gameObjects = []
    }
    
    class Collisioner {
        constructor(deepLength = 5){
            this.deepLength = deepLength
        }
        async checkCollision(scene){
            const rect = scene.getCircuit()
            const map = new SquerMap(rect, this.deepLength)
            const insert = targetRect => map.insert(targetRect, this.__registerCollides.bind(this))  
            scene.gameObjects.forEach(obj=>{
                const circuit = obj.getCircuit()
                if(circuit instanceof Array){
                    return circuit.map(insert)
                } 
                insert(circuit)
            })
            const collisions = this.__prepareCollision()
            this.__refreshValues()
            return collisions
        }
        __refreshValues(){
            this.__collides = new Map()
            this.__idByObject = new Map()
            this.__uniqueId = 0
        }
        __registerCollides(_, collideRects){
            const toTargetObject = obj => obj.target
            const collideTargetObjectIds = collideRects.map(toTargetObject).map(this.__getUniqueId.bind(this))
            collideTargetObjectIds.forEach(firstId=>{
                collideTargetObjectIds.forEach(
                    secondId=>this.__registerCollideBetweenObjects(firstId, secondId)
                )
            })
        }
        __registerCollideBetweenObjects(firstId, secondId){
            if(firstId === secondId) return;
            if( this.__hasCollidePair(firstId, secondId) || this.__hasCollidePair(secondId, firstId) ){
                return;
            }
            this.__setCollidePair(firstId, secondId)
        }
        __hasCollidePair(firstId, secondId){
            return this.__collidesPairId.has(`${firstId}:${secondId}`)
        }
        __setCollidePair(firstId, secondId){
            return this.__collidesPairId.add(`${firstId}:${secondId}`)
        }
        __getUniqueId(object){
            let result = this.__idByObject.get(object)
            if(!result && result !== 0){
                result = this.__uniqueId++
                this.__idByObject.set(object, result)
                this.__objectById.set(result, object)
            }
            return result
        }
        __getObjectById(id){
            return this.__objectById.get(id)
        }
        __prepareCollision(){
            const toPairId = str => str.split(':').map(Number)
            const toObj = id => this.__getObjectById(id)
            const multy = fn => arr => arr.map(fn)    
            const pairCollides = Array.from(this.__collidesPairId)
    
            return pairCollides.map(toPairId).map(multy(toObj))
            
        }
        __idByObject = new Map()
        __objectById = new Map()
        __collidesPairId = new Set() // string "id1:id2"
        __uniqueId = 0
    }
    
    class CollideReactor {
        register(firstClass, secondClass, collideFunction){
            this.__classes.add(firstClass)
            this.__classes.add(secondClass)
            this.__registerMatch(firstClass, secondClass, collideFunction)
            this.__registerMatch(secondClass, firstClass, collideFunction)
        }
        __registerMatch(firstClass, secondClass, collideFunction){
            if(this.__matcher.has(firstClass)){
                this.__matcher.get(firstClass).set(secondClass, collideFunction)
            } else {
                this.__matcher.set(firstClass, new Map([[secondClass, collideFunction]]))
            }
        }
        async react(collision, ...collisions){
            if(!collision) return;
            this.__reactOnCollissions(...collision)
            await this.react(...collisions)
        }
        __reactOnCollissions(firstObject, secondObject){
            const getInstanceFilter = object => Class => object instanceof Class
            const classes = Array.from(this.__classes)
            const firstClasses = classes.filter(getInstanceFilter(firstObject)).sort(sortClassComparator.reverse)
            const secondClasses = classes.filter(getInstanceFilter(secondObject)).sort(sortClassComparator.reverse)
            firstClasses.forEach(firstClass=>{
                secondClasses.forEach(secondClass=>{
                    const fn = this.__getFunctionForClasses(firstClass, secondClass)
                    if(fn) fn(firstObject, secondObject)
                })
            })
        }
        __getFunctionForClasses(firstClass, secondClass){
            if(!this.__matcher.has(firstClass)) return null;
            const fmap = this.__matcher.get(firstClass)
            if(!fmap.has(secondClass)) return null;
            return fmap.get(secondClass)
        }
        __classes = new Set()
        __matcher = new Map()
        
    }
    
    function createGameProcess(renderer, collisioner, collideReactor){
        let timestamp = Date.now() - 1
        return async function gameProcess(scene){
            const dt = Date.now() - timestamp
            timestamp = Date.now()
            await scene.update(dt)
            const collisions = await collisioner.checkCollision(scene)
            await collideReactor.react(...collisions)
            await renderer.render(scene)
        }
    }
    return { Renderer, GameObject, Scene, Collisioner, CollideReactor, createGameProcess }
})()