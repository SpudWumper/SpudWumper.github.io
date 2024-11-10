//handle all the game logic with javascript
//and use DOM factory methods, etc for basic menu structure and stuff like that

const instructions = "long instructions text here";

var menuTextCont = null;
var gridCont = null;
var endCont = null;

var instrText = null;

document.addEventListener("DOMContentLoaded", function() {
    menuTextCont = document.getElementById("menuTextContainer");
    gridCont = document.getElementById("gridContainer");
    endCont = document.getElementById("endContainer");
    
    instrText = document.createTextNode(instructions);

})

function startGame() {
    //changes menu text to game instructions, display lives, maybe say grid size
    menuTextCont.replaceChild(instrText, menuTextCont.childNodes[1]);

    let gridSize = document.getElementById("gridSize");
    let failNum = document.getElementById("failNum");

    let gs = document.createTextNode("Grid size: " + gridSize);
    let fn = document.createTextNode("Lives left: " + failNum);

    menuTextCont.appendChild(gs);
    menuTextCont.appendChild(fn);

    //creates grid and appends it to grid container
    //make an end game button - if they press it, add some stuff to end cont, freeze the grid
}