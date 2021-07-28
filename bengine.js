const bengine = (function(){
    const {
        SquerMap, Squer, Point
    } = (function(){
    
    const NullNode = null
    
    class Point {
        constructor({x = 0, y = 0, z = 0} = {}){
            this.x = x
            this.y = y
            this.z = z
        }
        add(other){
            return new Point({
                x: this.x + other.x,
                y: this.y + other.y,
                z: this.z + other.z
            })
        }
        equal(o){
            return this.x === o.x || this.y === o.y || this.z === o.z
        }
    }
    
    class Squer {
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
    function getDeepSquers({point, width, height}){
        width /= 2
        height /= 2
        const upLhsSquer = new Squer({width, height, point})
        const downLhsSquer = new Squer({
            width, height, point: point.add({x: 0, y: height})
        })
        const upRhsSquer = new Squer({
            width, height, point: point.add({x: width, y: 0})
        })
        const downRhsSquer = new Squer({
            width, height, point: point.add({x: width, y: height})
        })
        return {
            upLhsSquer,
            downLhsSquer,
            upRhsSquer,
            downRhsSquer
        }
    }
    class SquerNode {
        constructor(squer, deepLength){
            this.squer = ()=>squer
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
                upLhsSquer, downLhsSquer, upRhsSquer, downRhsSquer
            } = getDeepSquers(this.squer()) 
            this.upLhsNode = new SquerNode(upLhsSquer, deep)
            this.downLhsNode = new SquerNode(downLhsSquer, deep)
            this.upRhsNode = new SquerNode(upRhsSquer, deep)
            this.downRhsNode = new SquerNode(downRhsSquer, deep)
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
        check(squer, handler){
            if(this.squer().intersect(squer)){
                handler(this, this.data)
            }
        }
        insert(squer, handler = ()=>{}){
            this.check(squer, function(node, data){
                if(node.initialized){
                    node.deepNodes.forEach(deepNode=>deepNode.insert(squer, handler))
                } else {
                    if(data.length === 0){
                        data.push(squer)
                    } else {
                        if(node.deepLength() === 0){
                            data.push(squer)
                            handler(node, data)
                        } else {
                            node.initialize()
                            node.data.forEach(el=>node.insert(el))
                            node.data.length = 0
                            node.insert(squer, handler)
                        }
                    }
                }
            })
        }
        erase(squer){
            this.check(squer, function(node, data){
                if(node.initialized){
                    node.deepNodes.forEach(n=>n.erase(squer))
                } else {
                    node.data = data.filter(candidate=>candidate !== squer)
                }
            })
        }
    }
    
    return {SquerMap: SquerNode, Squer, Point}
    
    })()

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
    
    function createGameProcess(renderer, collisioner, collideReactor, clearPlace = async function(){}){
        let timestamp = Date.now() - 1
        return async function multiplyGameProcess(...scenes){
            const dt = Date.now() - timestamp
            timestamp = Date.now()
            await Promise.all(scenes.map(scene=>scene.update(dt)))
            await Promise.all(scenes.map(async scene=>{
                const collisions = await collisioner.checkCollision(scene)
                await collideReactor.react(...collisions)
            }))
            await clearPlace()
            await Promise.all(scenes.map(scene=>renderer.render(scene)))
        }
    }
    return { Renderer, GameObject, Scene, Collisioner, CollideReactor, createGameProcess, Squer, Point }
})()