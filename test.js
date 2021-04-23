const rand = (min, max)=>min + Math.floor(Math.random() * (max + 1 - min))
function getRandPoint(){
    return new Point({
        x: rand(0, $canvas.width()-width),
        y: rand(0, $canvas.height()-height)
    })
}
const levelOneMap = `
# # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # #
# . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . #
# . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . #
# . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . f
# . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . = . . . . . . . . . . f
# . . . . . . . . . . . . = . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . f
# . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . = . . . . = = = . . . . . . . . . . . #
# . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . #
# . . @ . . . = . . = . . . . . . . . . . . = . . . = = = . . . . . = . . . . . . . . . . . . . . . . . . . . . #
# = = = = = . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . = . . . = . . . . #
# . . . . . . . . . . . . . . . = . . = . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . #
# # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # 
`
const winMap = `
= = = = = = = = = = = = = = = = = = = = = = = = = =
= . . . . . . . . . . . . . . . . . . . . . . . . =
= . = . . . . . . . = . . = . = . . . . . . . . . =
= . = . . . . . . . = . . . . = = = = = . . . . . =
= . = . . . @ . . . = . . = . = . . . = . . . . . =
= . = . . . = . . . = . . = . = . . . = . . . . . =
= . = . . = . = . . = . . = . = . . . = . . . . . =
= . = . . = . = . . = . . = . = . . . = . . . . . =
= . . = . = . = . = . . . = . = . . . = . . . . . =
= . . . = . . . = . . . . = . = . . . = . . = . . =
= . . . . . . . . . . . . . . . . . . . . . . . . =
= = = = = = = = = = = = = = = = = = = = = = = = = = 
`
const loseMap = `
= = = = = = = = = = = = = = = = = = = = = = = = = =
= . . . . . . . . . . . . . . . . . . . . . . . . =
= . = . . . = = = = . . = = = . . . = = = = . . . =
= . = . . . = . . = . = . . . = . . = . . . . . . =
= . = . . . = . . = . = . . . . . . = . . . . . . =
= . = . . . = . . = . . = = . . . . = = = = . . . =
= . = . . . = @ . = . . . = = . . . = . . . . . . =
= . = . . . = . . = . . . . . = . . = . . . . . . =
= . = . . . = . . = . = . . . = . . = . . . . . . =
= . = = = . = = = = . . = = = . . . = = = = . . . =
= . . . . . . . . . . . . . . . . . . . . . . . . =
= = = = = = = = = = = = = = = = = = = = = = = = = = 
`

const $canvas = $('#canvas')
const ctx = $canvas[0].getContext('2d')
const width = 30, height = 30

const game = new Game()
let player

const Player = game.createGameObject('player', 'dynamic', 
    {
        constructor(x, y){
            this.point = new Point({x, y})
            this.startPoint = new Point({x, y})
        },
        countJump: 0,
        speedX: 0,
        speedY: 0,
        g: 980,
        life: 3,
        color: 'blue',
        width: width - 4, height: height - 4,
        update(dt){
            this.prevDeltaTime = dt
            let speedX = this.speedX
            const dspeed = this.g * dt / 1000
            let speedY = this.speedY
            this.speedY = this.speedY + dspeed
            this.point.x = this.point.x + dt / 1000 * speedX
            this.point.y = this.point.y + dt / 1000 * speedY
        },
        getOutlineRect(){
            const {width, height, point} = this
            return new TargetRect(this, {width, height, point: new Point(point)})
        }
    }, 
    {
        'wall': (pl, wall)=>{
            function saveSpeeds(fn, obj){
                const prevDT = obj.prevDeltaTime
                const prevSpeedX = obj.speedX
                const prevSpeedY = obj.speedY
                const prevG = obj.g
                fn(obj)
                obj.g = prevG
                obj.speedX = prevSpeedX
                obj.speedY = prevSpeedY
                obj.prevDeltaTime = prevDT
            }
            function step(obj){
                obj.update(obj.prevDeltaTime)
            }
            function stepY(obj){
                obj.speedX = 0
                obj.g = 0
                step(obj)
            }
            function stepX(obj){
                obj.speedY = 0
                obj.g = 0
                step(obj)
            }
            function stepXBack(obj){
                obj.speedX = -obj.speedX
                stepX(obj)
            }
            function stepYBack(obj){
                obj.speedY = -obj.speedY
                stepY(obj)
            }
            function intersect(obj1, obj2){
                return obj1.getOutlineRect().intersect(obj2.getOutlineRect())
            }
            let isYIntersect = false
            let isXIntersect = false
            
            saveSpeeds(obj=>{
                obj.speedY *= 0.5
                obj.speedX *= 0.5
                
                while(intersect(obj, wall)){
                    saveSpeeds(stepYBack, obj) // try y intersect
                    if(!intersect(obj, wall)){
                        isYIntersect = true
                        return;
                    }

                    saveSpeeds(stepY, obj) // return prev position

                    saveSpeeds(stepXBack, obj) // try x intersect
                    if(!isYIntersect && !intersect(obj, wall)){
                        isXIntersect = true
                        return;
                    }

                    saveSpeeds(stepYBack, obj) // UB
                } 
            }, pl)
            
            
            if(isYIntersect){
                if(pl.speedY > 0){
                    pl.countJump = 0
                }
                pl.speedY = 0
            }
            if(isXIntersect){
                pl.speedX = 0
            }
        },
        'game_over': (pl)=>{
            pl.life--
            if(pl.life === 0){
                pl.point.x = $canvas.width() / 2
                pl.point.y = $canvas.height() / 2
                game.scene = 'game_over'
            } else {
                pl.point.x = pl.startPoint.x
                pl.point.y = pl.startPoint.y
            }
        },
        'finish': (pl)=>{
            pl.point.x = $canvas.width() / 2
            pl.point.y = $canvas.height() / 2
            game.scene = 'win'
        }
    }
)

const Wall = game.createGameObject('wall', 'static',
    {
        constructor(x, y){
            this.point = new Point({x, y})
        },
        width, height,
        color: 'black',
        getOutlineRect(){
            const {width, height, point} = this
            return new TargetRect(this, {width, height, point: new Point(point)})
        }
    }
)
const GameOver = game.createGameObject('game_over', 'static',
    {
        constructor(x, y){
            this.point = new Point({x, y})
        },
        color: 'red',
        width, height,
        getOutlineRect(){
            const {width, height, point} = this
            return new TargetRect(this, {width, height, point: new Point(point)})
        }
    }
)
const Finish = game.createGameObject('finish', 'static',
    {
        constructor(x, y){
            this.point = new Point({x, y})
        },
        color: 'green',
        width, height,
        getOutlineRect(){
            const {width, height, point} = this
            return new TargetRect(this, {width, height, point: new Point(point)})
        }
    }
)
const GAME_OBJECTS = {
    '#': GameOver,
    '@': Player,
    '=': Wall,
    'f': Finish,
    '.': null
}


const gameOverScene = new Scene({
    width: $canvas.width(), 
    height: $canvas.height(), 
    point: new Point({x: 0, y: 0})
})
const winScene = new Scene({
    width: $canvas.width(), 
    height: $canvas.height(), 
    point: new Point({x: 0, y: 0})
})
const scene = new Scene({
    width: $canvas.width(), 
    height: $canvas.height(), 
    point: new Point({x: 0, y: 0})
})

scene.addGameObjects(...createGameObjectsFromMap(levelOneMap))
player = scene.gameObjects.find(obj=>obj instanceof Player)

winScene.addGameObjects(...createGameObjectsFromMap(winMap))
gameOverScene.addGameObjects(...createGameObjectsFromMap(loseMap))

game.addScene('level1', scene)
game.addScene('game_over', gameOverScene)
game.addScene('win', winScene)
game.scene = 'level1'

game.renderer = {
    render(scene){
        const corrector = scene.corrector
        const {x, y} = player.point
        if(corrector.x + x < 200 || corrector.x + x > $canvas.width() - 200){
            corrector.x = (corrector.x + x < 200? 200 - x: $canvas.width() - 200 - x) 
        }
        scene.gameObjects.forEach(getDrawCell(corrector))
    },
    clear(){
        ctx.clearRect(0, 0, $canvas.width(), $canvas.height())
    }
}
game.start()


function getDrawCell(corrector){
    return function drawCell(cell){
        if(cell === player){
            ctx.fillStyle = '#333'
            ctx.fillRect(7, 4, 55, 23)
            new Array(3).fill(0).forEach((_, i)=>{
                ctx.fillStyle = 'white'
                ctx.fillRect(10 + i * 15 + 3, 8, 14, 14)
                if(i < cell.life){
                    ctx.fillStyle = '#f00'    
                } else {
                    ctx.fillStyle = '#000'
                }
                ctx.fillRect(10 + i * 15 + 5, 10, 10, 10)
            })
        }
        ctx.fillStyle = cell.color
        ctx.fillRect(cell.point.x + corrector.x, cell.point.y + corrector.y, cell.width, cell.height)
    }
}

let isUnPressed = true
window.addEventListener('keydown', e=>{
    const speed = 150
    switch(e.keyCode){
        case 37:
            player.speedX = -speed
            break;
        case 38:
        case 32:
            if(isUnPressed && player.countJump < 2){
                player.speedY = -5/2 * speed
                player.countJump++
                isUnPressed = false
            }
            break;
        case 39:
            player.speedX = speed
            break;
        case 40:
            break;
    }
    if( (game.scene === 'game_over' || 
        game.scene === 'win') && e.keyCode === 13){
            player.point.x = player.startPoint.x
            player.point.y = player.startPoint.y
            player.life = 3
            player.speedY = 0
            player.speedX = 0
            game.scene = 'level1'
    }
})
window.addEventListener('keyup', e=>{
    switch(e.keyCode){
        case 37:
            player.speedX = 0
            break;
        case 38:
        case 32:
            isUnPressed = true
            break;
        case 39:
            player.speedX = 0
            break;
        case 40:
            break;
    }
})



function createGameObjectsFromMap(map){
    const objects = []
    map = map.trim().split('\n').map(row=>row.split(' '))
    map.forEach((row, y)=>{
        row.forEach((symb, x)=>{
            if(symb === '@' && player){
                objects.push(player)
            } else if(symb !== '.'){
                objects.push(new GAME_OBJECTS[symb](x * width, y * height))
            }
        })
    })
    return objects
}

window.onblur = document.onblur = ()=>{
    game.stop()
}
window.onfocus = document.onfocus = ()=>{
    game.start()
}