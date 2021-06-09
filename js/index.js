const grid = 3;
let isHumanToHuman = false;
let isHumanToComputer = isHumanToHuman ? false: true;
const symX = 'X';
const symO = 'O';
let currentSym = symX
const grids = {} //using hash instead of array for easy fetch
const visitedGrid = [];
const xGrids = [];
const oGrids = [];
let whoToPlay = symX
init();
humanPlay();
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



function humanPlay() {
    humanTurnToPlay()
}

function humanTurnToPlay() {
    $('.col').click(function() {
        if(!checkHumanToPlay()) {
            return false;
        }
        const txt = this.innerHTML;
        const id = this.id;
        const yx = id.split('_')[1].split('');
        const [y, x] = yx
        if(txt === '') {
            const tile = `${y}${x}`;

            this.innerHTML = currentSym;

            $(`#grid_${y}${x}`).addClass(currentSym);
            visitedGrid.push(`${y}${x}`)
            grids[`${y}${x}`].insertValue(currentSym);

            popChkSwit(tile, currentSym);

            if (isHumanToComputer) {
                console.log('computer playing')
                computerTurnToPlay()
            } else {
                //human to human
                playGame(tile, currentSym);
            }
        }
    })
}

function checkHumanToPlay() {
    if (isHumanToHuman) {
        if (whoToPlay === currentSym) {
            return true;
        }
        return false;
    }
    return true;
}

function computerTurnToPlay() {
    //implement random position
    if (isHumanToComputer) {
       setTimeout(computerPlay, 300);
    }
}

function computerPlay() {
    for(const grid in grids) {
        if (visitedGrid.includes(grid)) {
            continue;
        }
        const [y, x] = grid.split('');
        $(`#grid_${y}${x}`)[0].innerHTML = currentSym;
        $(`#grid_${y}${x}`).addClass(currentSym);
        visitedGrid.push(grid);
        grids[grid].insertValue(currentSym);
        const tile = `${y}${x}`;
        popChkSwit(tile, currentSym)
        break;
    }
}

function switchSym() {
    if(isHumanToComputer) {
        currentSym = currentSym === symX ? symO : symX
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

function checkWin(grid, currentSym) {
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
    const tiles = getXorOGrid(currentSym);
    console.log(tiles);
    if (tiles.length >= 3) {
        console.log('am in', grid);
        for(const pos of win) {
            const [a, b, c] = pos.split('-');
            
            console.log(a, b, c, 'war');
            if (tiles.includes(a) && tiles.includes(b) && tiles.includes(c)) {
                return;
            }
        }
    }
}

function getXorOGrid(currentSym) {
    return currentSym === symX ? xGrids : oGrids;
}

function populateGrid(tile, currentSym) {
    const gridArray = getXorOGrid(currentSym);
    gridArray.push(tile);
}

function addSymToUIGrid(tile) {

}

function popChkSwit(tile, currentSym) {
    //populate, checkWin and SwitchPlayer()
    populateGrid(tile, currentSym)
    checkWin(tile, currentSym)
    switchSym()
}

function playWithComputer() {
    isHumanToComputer = true;
    isHumanToHuman = false;
}