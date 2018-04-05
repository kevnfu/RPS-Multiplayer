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
connected = db.ref("/connected")
db.ref(".info/connected").on("value", function(snap) {
    if(snap.val()) {
        let con = connected.push(true);
        con.onDisconnect().remove();
    }
});

let isPlayer = false;

// select player button
$(document).on("click", "#player-select > button", function() {
    let id = $(this).data("p");
    let path = "/players/" + id;
    console.log(path);
    db.ref(path).transaction(function(player) {
        console.log("Current: " + player);
        if(player === null) {
            return "whydoesthiswork";
        } else if(player === true) {
            console.log("player already chosen");
            return player;
        } else if(player === false) {
            console.log("i am player");
            isPlayer = true;
            db.ref(path).onDisconnect().set(false);
            $("#player-select").hide();
            return true;
        }
    });
});

// when two players connected, start game
db.ref("/players").on("value", function(snap) {
    console.log("other: " + snap.val());
    if(snap) {
        if(snap.val()[0] && snap.val()[1]) {
            console.log("game start");
        }
    }
})

$(document).ready(function() {

});

// open webpage

// wait for at least one other person

// start game

// 