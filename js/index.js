
const grid = 3;
const withComputer = true;
let sym = 'X'
const grids = {} //using hash instead of array for easy fetch
const visitedGrid = [];
init();
rule();
const xGrids = [];
const oGrids = [];
function init() {
    for (let y = 0; y<grid; y++) {
        const rowChild = `<div class="row" id="grid_${y}"></div>`
        $('#grid-parent').append(rowChild)
        for (let x = 0; x<grid; x++) {
            const colChild = `<div class="col" id="grid_${y}${x}"></div>`;
            $(`#grid_${y}`).append(colChild);
            const grid = new GRID(y, x); 
            grids[`${y}${x}`] = grid; //using hash
        }
    }    
}

function playWithComputer() {
    //implement random position
    if (withComputer) {
        for(const grid in grids) {
            if (visitedGrid.includes(grid)) {
                continue;
            }
            const [y, x] = grid.split('');
            $(`#grid_${y}${x}`)[0].innerHTML = sym;
            visitedGrid.push(grid);
            grids[grid].insertValue(sym);
            const tile = `${y}${x}`;
            popChkSwit(tile, sym)
            break;
        }
    }
}

function rule() {
    $('.col').click(function() {
        const txt = this.innerHTML;
        const id = this.id;
        const yx = id.split('_')[1].split('');
        const [y, x] = yx
        if(txt === '') {
            this.innerHTML = sym;
            visitedGrid.push(`${y}${x}`)
            grids[`${y}${x}`].insertValue(sym);
            const tile = `${y}${x}`;
            popChkSwit(tile, sym)
            playWithComputer()
        }
    })
}

function switchSym() {
    if (sym === 'X') {
        sym = 'O'
    } else {
        sym = 'X'
    }
}

function GRID(y,x) {
    this.x = x;
    this.y = y;
    
    this.insertValue = (value) => {
        this.value = value;
    }
    
    this.getValue = () => {
        return this.value;
    }
    
    this.isEmpty = () => {
        return this.value
    }
}

function checkWin(grid, sym) {
    //looplkn
    //yx
    wins = {
            //first layer
        '00': ['00-01-02', '00-10-20', '00-11-22'],
        '01': ['00-01-02', '01-11-21'],
        '02': ['00-01-02', '02-11-20', '02-12-22'],
            //middele layer
        '10': ['00-10-20', '10-11-12'],
        '11': ['10-11-12', '00-11-22', '02-11-20', '01-11-21'],
        '12': ['10-11-12','02-12-22'],
            //last layer
        '20': ['00-10-20', '02-11-20', '20-21-22'],
        '21': ['01-11-21', '20-21-22'],
        '22': ['00-11-22', '02-12-22', '20-21-22'],
    }
        
    const win = wins[grid];  //position
    const tiles = getXorOGrid(sym);
    console.log(tiles);
    if (tiles.length >= 3) {
        console.log('am in', grid);
        for(const pos of win) {
            const [a, b, c] = pos.split('-');
            
            console.log(a, b, c, 'war');
            if (tiles.includes(a) && tiles.includes(b) && tiles.includes(c)) {
                alert(pos);
                return;
            }
        }
    }
}

function getXorOGrid(sym) {
    return sym === 'X' ? xGrids : oGrids;
}

function populateGrid(tile, sym) {
    const gridArray = getXorOGrid(sym);
    gridArray.push(tile);
}

function popChkSwit(tile, sym) {
    populateGrid(tile, sym)
    checkWin(tile, sym)
    switchSym()
}