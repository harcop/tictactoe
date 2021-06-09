const db = firebase.firestore()


async function addPlayerToWaitingDB(username) {
    //find if the username already exist in the db;
    if (await findAPlayer(username)) {
        console.log('hacker here')
        return false;
    }
    //add the username into the db
    return await db.collection('players').add({
       username
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
async function searchPlayer(username) {
    const response = await db.collection('players').where('username', '!=', username)
    .get();

    const { docs } = response;

    if (docs.length) {
        const foundPlayer = docs[0];
        const { id: player2Id } = foundPlayer;
        const { username: player2 } = foundPlayer.data();

        await removePlayerFromWaitingDB(player2Id);

        await pairPlayer(username, player2)
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
        player2
    })
    .then(async response => {
        console.log(response, 'user paired');
        const { id: gameRoomId } = response;

        await recordPair({username: player1, gameRoomId, playerType: 'X'});
        await recordPair({username: player2, gameRoomId, playerType: 'O'});
    })
    .catch(err => {
        console.log(err, 'err from paired')
    })
}

async function recordPair({username, gameRoomId, playerType}) {
    await db.collection('recordPair').add({
        username,
        gameRoomId,
        playerType
    })
    .then(response => {
        console.log(response, 'user paired');
    })
    .catch(err => {
        console.log(err, 'err from paired')
    })
}

async function deleteRecordPair(gameRoomId) { //unpair player
    await db.collection('recordPair').doc(gameRoomId)
    .delete()
    .then(response => {
       console.log('deleted record pair')
    })
    .catch(err => {
        console.log(err, 'this is the err from deleting record pair')
    })
}

async function listenToGameRoom(username) {
    const response = await db.collection('recordPair').where('username', '==', username)
    .get();
    const { docs } = response;
    if (docs.length) {
        const { gameRoomId } = docs[0].data();
        
        localStorage.setItem('gameRoomId', gameRoomId);
        //start listening to the room
        await autoListen(gameRoomId);
        return true;
    }
    return false;
}

async function autoListen(id) {
    await db.collection('gameRoom').doc(id)
    .onSnapshot(response => {
        console.log(response.data(), 'this is the game here lol')
    })
}

async function playGame(grid, sym) {
    //pass the username, roomId, gameRoomId;
    const gameRoomId = localStorage.getItem('gameRoomId');
    const update = {
        [`gameGrid.${grid}`] : sym
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