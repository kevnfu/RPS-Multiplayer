// Initialize Firebase
var config = {
    apiKey: "AIzaSyAPwtEF0I9E7Qvl_VhkgyGGEdHz4_0V4Is",
    authDomain: "bootcamp-rps.firebaseapp.com",
    databaseURL: "https://bootcamp-rps.firebaseio.com",
    projectId: "bootcamp-rps",
    storageBucket: "",
    messagingSenderId: "463225969889"
};

firebase.initializeApp(config);
let db = firebase.database();
db.ref(".info/connected").on("value", function(snap) {
    if(snap.val()) {
        let con = db.ref("/connected").push(true);
        con.onDisconnect().remove();
    }
});

let msg = $("#msg");
let selectBtn = $("#select");
let chatbox = $("#chatbox");

let isPlayer = false;
let inGame = false;
let playerId = null;
let myChoice = null, theirChoice = null;
let wins = 0, losses = 0;

function renderScoreboard() {
    $("#wins").html(wins);
    $("#losses").html(losses);
}

// select player button
$(document).on("click", "#player-select > button", function() {
    playerId = $(this).data("p");
    let refPlayer = db.ref("/players/" + playerId);
    // setting player connected state
    refPlayer.transaction(function(player) {
        console.log("Current: " + player);
        if(player === null) {
            return "whydoesthiswork";
        } else if(player === true) {
            msg.html("Player already chosen");
            return player;
        } else if(player === false) {
            msg.html("Waiting for other player");
            isPlayer = true;

            // cleanup on disconnect
            refPlayer.onDisconnect().set(false);
            $("#player-select").hide();
            return true;
        }
    });
});

// monitor connections
db.ref("/players").on("value", function(snap) {
    if(snap && isPlayer) {
        // if both connected, start game
        let bothConnected = snap.val()[0] && snap.val()[1];
        if(bothConnected && !inGame) {
            console.log("game start");
            // clear chat
            db.ref("/chat").remove();
            // clear chat on disconnect
            db.ref("/chat").onDisconnect().remove();
            db.ref("/rps/" + playerId).remove().then(function() {
                inGame = true;
                renderScoreboard();
                $("#rps-select").show();
                $("#scoreboard").show();
                msg.html("Play Game");
            });

        // if disconnected midgame 
        } else if(!(bothConnected) && inGame) {
            msg.html("Opponent disconnected");
            inGame = false;
            setTimeout(() => location.reload(1), 5000);
        }
    }
});

// choose r, p, or s
$(document).on("click", "#select", function() {
    if(!inGame) return;
    selectBtn.prop("disabled", true);
    myChoice = $("input[name=rps]:checked", "#rps-select").val();
    console.log("selected: " + myChoice);
    db.ref("/rps/" + playerId).push(myChoice);
    determineWinner();
});

function determineWinner() {
    if(!inGame) return;
    if(myChoice === null || theirChoice === null) return;
    let diff = (parseInt(theirChoice) + 3 - parseInt(myChoice)) % 3;
    if(diff === 0) {
        // tie
        msg.html("Tie");
    } else if(diff === 1) {
        // i win
        wins++;
        renderScoreboard();
        msg.html("You win!");
    } else {
        // they win
        losses++;
        renderScoreboard();
        msg.html("You Lose!");
    }

    // reset for next round;
    myChoice = null;
    theirChoice = null;
    selectBtn.prop("disabled", false);
}


function choiceListener(dbId) {
    return function(snap) {
        if(!inGame) return;
        // ignore self changes
        if(playerId === dbId || snap.val() === null) return;
        theirChoice = snap.val();
        console.log("opponent selected " + theirChoice);
        determineWinner();
    }
}

db.ref("/rps/0").on("child_added", choiceListener(0));

db.ref("/rps/1").on("child_added", choiceListener(1));

$(document).on("click", "#send-btn", function(e) {
    e.preventDefault();
    let sendTxt = $("#send-input").val().trim();
    $("#send-input").val("");
    if(sendTxt !== "") {
        db.ref("/chat").push(playerId + ": " + sendTxt + "\n");
    }
})

db.ref("/chat").on("child_added", function(snap) {
    if(!inGame) return;
    chatbox.append(snap.val());
    chatbox.scrollTop(chatbox[0].scrollHeight);
})

$(document).ready(function() {

});