class Cell extends Rect {
    checks = []
    speed = 0
    direction = 'right'
    update(){
        let speedX = 0
        let speedY = 0
        switch(this.direction){
            case 'left':
                speedX = -this.speed
                break;
            case 'right':
                speedX = this.speed
                break;
            case 'up':
                speedY = -this.speed
                break;
            case 'down':
                speedY = this.speed
                break;
        }
        this.point.x = this.point.x + speedX
        this.point.y = this.point.y + speedY
    }
}
class Red extends Cell {
    color = 'red'
}
class Blue extends Cell {
    color = 'blue'
}
const rand = (min, max)=>min + Math.floor(Math.random() * (max + 1 - min))
function getRandPoint(){
    return new Point({
        x: rand(0, $canvas.width()-width),
        y: rand(0, $canvas.height()-height)
    })
}

const $canvas = $('#canvas')
const ctx = $canvas[0].getContext('2d')
const width = 30, height = 30

const player = new Blue({width, height, point: new Point({x: 30, y: 40})})
let objects = [player, new Red({width, height, point: getRandPoint()})]
const matcher = new ClassMatchHandler()
matcher.setMatch(Red, Blue, (red)=>{
    objects = objects.filter(cell=>cell !== red)
    objects.push(new Red({width, height, point: getRandPoint()}))
})
matcher.setMatch(Blue, Red, (blue)=>{
    console.log('GREAT')
})
function drawCell(cell){
    ctx.fillStyle = cell.color
    ctx.fillRect(cell.point.x, cell.point.y, cell.width, cell.height)
}

const draw = function(){
    objects.forEach(drawCell)
}

function lups(){
    ctx.clearRect(0, 0, $canvas.width(), $canvas.height())
    draw()
    objects.forEach(cell=>cell.update())
    const map = new RectMap(new Rect({point: new Point({}), width: $canvas.width(), height: $canvas.height()}), 5)
    objects.forEach(cell=>cell.checks.length = 0)
    objects.forEach(cell=>map.insert(cell, checkCollision))
}
setInterval(lups, 60)
function checkCollision(node, data){
    for(let i = 0; i < data.length - 1; i++){
        if(!data[i].intersect(data[i + 1])) return;
        if(data[i].checks.findIndex(el=>el === data[i + 1]) !== -1) continue;
        matcher.check(data[i], data[i + 1])
        data[i].checks.push(data[i + 1])
        data[i + 1].checks.push(data[i])
    }
}
window.addEventListener('keydown', e=>{
    player.speed = 5
    switch(e.keyCode){
        case 37:
            player.direction = 'left'
            break;
        case 38:
            player.direction = 'up'
            break;
        case 39:
            player.direction = 'right'
            break;
        case 40:
            player.direction = 'down'
            break;
    }
})