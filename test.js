const rand = (min, max)=>min + Math.floor(Math.random() * (max + 1 - min))
function getRandPoint(){
    return new Point({
        x: rand(0, $canvas.width()-width),
        y: rand(0, $canvas.height()-height)
    })
}
const levelOneMap = `
# # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # #
# . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . f
# . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . f
# . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . f
# . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . = . . . . . . . . . . f
# . . . . . . . . . . . . = . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . f
# . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . = . . . . = = = . . . . . . . . . . . f
# . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . f
# . . @ . . . = . . = . . . . . . . . . . . = . . . = = = . . . . . = . . . . . . . . . . . . . . . . . . . . . f
# = = = = = . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . = . . . = . . . . f
# . . . . . . . . . . . . . . . = . . = . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . f
# # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # 
`
const winMap = `
= = = = = = = = = = = = = = = = = = = = = = = = = =
= . . . . . . . . . . . . . . . . . . . . . . . . =
= . = . . . . . . . = . . = . = . . . . . . . . . =
= . = . . . . . . . = . . . . = = = = = . . . . . =
= . = . . . . . . . = . . = . = . . . = . . . . . =
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
= . = . . . = . . = . . . = = . . . = . . . . . . =
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

const Player = game.createGameObject('player', 'dynamic', 
    {
        constructor(x, y){
            this.point = new Point({x, y})
            this.startPoint = new Point({x, y})
        },
        countJump: 0,
        speedX: 0,
        speedY: 0,
        g: 80,
        life: 3,
        color: 'blue',
        width, height,
        update(dt){
            this.prevDeltaTime = dt
            let speedX = this.speedX
            this.speedY += this.g * dt / 100
            let speedY = this.speedY
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
            const prevSpeedX = pl.speedX
            const prevSpeedY = pl.speedY
            const prevG = pl.g
            pl.speedX = 0
            pl.speedY = -prevSpeedY
            pl.g = -prevG
            pl.update(pl.prevDeltaTime)
            if(pl.getOutlineRect().intersect(wall.getOutlineRect())){
                pl.speedY = prevSpeedY
                pl.g = prevG
                pl.speedX = -prevSpeedX
                pl.update(pl.prevDeltaTime)
            } else {
                pl.speedY = 0
                pl.g = prevG
                if(prevSpeedY > 0)
                pl.countJump = 0
            }
            pl.speedX = prevSpeedX
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


const scene = new Scene({
    width: $canvas.width(), 
    height: $canvas.height(), 
    point: new Point({x: 0, y: 0})
})
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

let player
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
            new Array(cell.life).fill(0).forEach((_, i)=>{
                ctx.fillStyle = 'white'
                ctx.fillRect(10 + i * 15 + 3, 8, 14, 14)
                ctx.fillStyle = 'pink'
                ctx.fillRect(10 + i * 15 + 5, 10, 10, 10)
            })
        }
        ctx.fillStyle = cell.color
        ctx.fillRect(cell.point.x + corrector.x, cell.point.y + corrector.y, cell.width, cell.height)
    }
}
let isPressUp = false
window.addEventListener('keydown', e=>{
    const speed = 150
    switch(e.keyCode){
        case 37:
            player.speedX = -speed
            break;
        case 38:
        case 32:
            if(!isPressUp && player.countJump < 2){
                player.speedY = -speed * 5/2
                isPressUp = true
                player.countJump++
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
            game.scene = 'level1'
    }
})
window.addEventListener('keyup', e=>{
    const speed = 0
    switch(e.keyCode){
        case 37:
            player.speedX = speed
            break;
        case 38:
        case 32:
            isPressUp = false;
            break;
        case 39:
            player.speedX = speed
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
            if(symb !== '.')
            objects.push(new GAME_OBJECTS[symb](x * width, y * height))
        })
    })
    return objects
}