const db = firebase.firestore()


async function addPlayerToWaitingDB(username) {
    //find if the username already exist in the db;
    if (await findAPlayer(username)) {
        console.log('hacker here')
        return false;
    }
    //add the username into the db
    return await db.collection('players').add({
       username,
       timestamp: new Date().toISOString()
    })
}

async function getAPlayer(id) {
    await db.collection('players').doc(id)
    .get()
    .then(response => {
       console.log(response.data(), 'this is the data')
    })
    .catch(err => {
        console.log(err, 'this is the err from get')
    })
}

async function findAPlayer(username) {
    const response = await db.collection('players').where('username', '==', username)
    .get();
    const { docs } = response;
    if (docs.length) {
        return true;
    }
    return false;
}

//search the player
// if not found, keep searching until found
async function searchPlayer(player1) {
    const response = await db.collection('players').where('username', '!=', player1)
    .get();

    const { docs } = response;

    if (docs.length) {
        const foundPlayer = docs[0];
        const { id: player2Id } = foundPlayer;
        const { username: player2 } = foundPlayer.data();

        await removePlayerFromWaitingDB(player2Id);

        await pairPlayer(player1, player2)
        return foundPlayer;
    }
    return {
        error: true
    }
}


async function removePlayerFromWaitingDB(id) {
    await db.collection('players').doc(id)
    .delete()
    .then(response => {
       console.log('deleted')
    })
    .catch(err => {
        console.log(err, 'this is the err from get')
    })
}

async function pairPlayer(player1, player2) {
    await db.collection('gameRoom').add({
        player1,
        player2,
        whoToPlay: symX,
        timestamp: new Date().toISOString()
    })
    .then(async response => {
        const { id: gameRoomId } = response;

        await recordPair({username: player1, otherPlayer: player2, gameRoomId, playerSym: symX});
        await recordPair({username: player2, otherPlayer: player1, gameRoomId, playerSym: symO});
    })
    .catch(err => {
        console.log(err, 'err from paired')
    })
}

async function recordPair({username, otherPlayer, gameRoomId, playerSym}) {
    await db.collection('recordPair').add({
        username,
        otherPlayer,
        gameRoomId,
        playerSym,
        timestamp: new Date().toISOString()
    })
    .then(response => {
        console.log(response, 'user paired');
    })
    .catch(err => {
        console.log(err, 'err from paired')
    })
}


async function deleteRecordPair(username) { //unpair player
    await db.collection('recordPair').where('username', '==', username)
    .delete()
    .then(response => {
       console.log('deleted game play')
    })
    .catch(err => {
        console.log(err, 'error deleting game play')
    })
}

async function deleteGamePlayed(username) { //unpair player
    await db.collection('gameRoom').where('username', '==', username)
    .delete()
    .then(response => {
       console.log('deleted game play')
    })
    .catch(err => {
        console.log(err, 'error deleting game play')
    })
}

async function listenToGameRoom(username) {
    const response = await db.collection('recordPair').where('username', '==', username)
    .get();
    const { docs } = response;
    if (docs.length) {

        isHumanToHuman = true;
        isHumanToComputer = false;
        
        const { gameRoomId, playerSym, username, otherPlayer } = docs[0].data();
        
        currentSym = playerSym;
        otherSym = currentSym === symX ? symO : symX;

        $(`.player${currentSym}SymName`)[0].innerHTML = username;
        $(`.player${otherSym}SymName`)[0].innerHTML = otherPlayer;


        //select the player
        playerBorderSelectMe()

        localStorage.setItem('gameRoomId', gameRoomId);
        //start listening to the room
        await autoListen(gameRoomId);
        return true;
    }
    return false;
}

//this is the listening part of the game to the backend
async function autoListen(id) {
    await db.collection('gameRoom').doc(id)
    .onSnapshot(response => {

        const { whoToPlay: _whoToPlay, gameGrid } = response.data();
        whoToPlay = _whoToPlay; //set global whoToPlay
        for(const tile in gameGrid) {
            const _sym = gameGrid[tile];
            addSymToUIGrid(tile, _sym)
        }
        switchPlayerColor()
    })
}

//this is called when the player clicks on the grid
async function playGame(grid, currentSym) {
    //pass the username, roomId, gameRoomId;
    const gameRoomId = localStorage.getItem('gameRoomId');
    whoToPlay = currentSym === symX ? symO : symX
    const update = {
        [`gameGrid.${grid}`] : currentSym,
        whoToPlay
    }
    await db.collection('gameRoom').doc(gameRoomId)
    .update(update)
    .then(response => {
        console.log('game updated')
    })
    .catch(err => {
        console.log('error in game update');
    })
}