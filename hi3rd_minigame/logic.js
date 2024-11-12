//handle all the game logic with javascript
//and use DOM factory methods, etc for basic menu structure and stuff like that

const instructions = `The game is like sudoku and minesweeper combined.
You are given a n x n grid, and some cells are bad, some are good. 
You have to click on the good ones and avoid the bad ones. 
You are given some numbers on each row and column which give you information about that row and column. 
The numbers tell you how many good ones are in the row/column, and in some cases, their ordering.
For example: grid is 5 x 5. On the left of row 1, you are given these numbers: "1 2".
This means row 1 has 3 good cells, and from left to right, there is one good cell that is not adjacent to any other good cells
and there are two adjacent good cells after the one good cell.`;


//for div containers
var menuTextCont = null;
var gridCont = null;
var endCont = null;

//for text node with instructions
var instrText = null;

//to keep track of grid size and fail num globally
var grid = 0;
var fails = 0;

document.addEventListener("DOMContentLoaded", function() {
    //everything below is just setting up the initial menu screen
    menuTextCont = document.getElementById("menuTextContainer");
    gridCont = document.getElementById("gridContainer");
    endCont = document.getElementById("endContainer");
    
    instrText = document.createTextNode(instructions);

    menu();
})

//create initial menu stuff
function menu() {
    while (menuTextCont.hasChildNodes()) {
        menuTextCont.removeChild(menuTextCont.firstChild);
    }
    while(gridCont.hasChildNodes()) {
        gridCont.removeChild(gridCont.firstChild);
    }
    while(endCont.hasChildNodes()) {
        endCont.removeChild(endCont.firstChild);
    }

    let gridInput = document.createElement("input");
    gridInput.setAttribute("type", "number");
    gridInput.id = "gridSize";
    gridInput.value = "2";
    let l = document.createElement("label");
    l.textContent = "Choose a grid size (must be at least 2): ";
    menuTextCont.appendChild(l);
    menuTextCont.appendChild(gridInput);

    menuTextCont.appendChild(document.createElement("br"));

    let failInput = document.createElement("input");
    failInput.setAttribute("type", "number");
    failInput.id = "failNum";
    failInput.value = "0";
    l = document.createElement("label");
    l.textContent = "Choose how many lives you have (i.e. number of fails allowed) 0 - 3: ";
    menuTextCont.appendChild(l);
    menuTextCont.appendChild(failInput);

    menuTextCont.appendChild(document.createElement("br"));

    let startButton = document.createElement("button");
    startButton.innerHTML = "Start";
    startButton.id = "startBut";
    startButton.addEventListener("click", startGame);
    menuTextCont.appendChild(startButton);
}

//callback for the start button
// - replaces menu text with instructions
// - generated a grid with chosen size
// - displays grid size and number of lives/fails left
// - end game button in case player wants to go back/restart
function startGame() {
    let gridSize = document.getElementById("gridSize").value;
    grid = gridSize;
    let failNum = document.getElementById("failNum").value;
    fails = failNum;

    //some validation/constraints on grid size and fail num
    if(gridSize < 2 || gridSize > 20) {
        alert("Grid size must be at least 2, max 20 (2 by 2)");
        return;
    }
    if(failNum < 0 || failNum > 3) {
        alert("Can only have 0, 1, 2, or 3 lives");
        return;
    }

    //empty the container
    while (menuTextCont.hasChildNodes()) {
        menuTextCont.removeChild(menuTextCont.firstChild);
    }

    //replace with new text
    menuTextCont.appendChild(instrText);
    menuTextCont.appendChild(document.createElement("br"));
    menuTextCont.appendChild(document.createElement("br"));

    let gs = document.createTextNode("Grid size: " + gridSize);
    var fn = document.createTextNode("Fails made: " + failNum);

    menuTextCont.appendChild(gs);
    menuTextCont.appendChild(document.createElement("br"));
    menuTextCont.appendChild(fn);

    //creates grid and appends it to grid container
    // - generate random pairs of numbers corresponding to grid cell good, and then create clues using that

    // - use a table to hold the grid + clues
    let gridT = document.createElement("table");
    gridT.className = "grid";
    let r = document.createElement("tr");
    r.className = "grid";
    insertHeader("", r); // dummy cell top left

    //top row of clues
    for (let i = 0; i < grid; i++) {
        insertHeader("", r, "c");
    }

    gridT.appendChild(r);

    //creating rows after top, has form [clue] [n tiles]
    for (let i = 0; i < grid; i++) {
        insertRow(gridT);
    }
    gridCont.appendChild(gridT);

    //loop over table by row and count good tiles
    let rows = Array.from(gridT.childNodes);
    rows.shift(); // so we don't loop over clue cells

    //use an array to keep count for column clues, and array to hold finished clue strings
    let col = [];
    let clueCA = [];
    for (let i = 0; i < grid; i++) {
        col.push(0);
        clueCA.push("");
    }

    let rCount = 0; // tells us what row we are on
    for (let x of rows) { //loop over rows
        rCount++;
        let rowCount = 0; // tells us which cell we are looking at in this row

        let columns = Array.from(x.childNodes); //grab array of cells in this row
        columns.shift(); // remove clue cell 

        let cCount = 0; //tells us what "row" we are on, i.e. if we were counting columns then rows
        let colCopy = col.slice(); //copy the column count array before we change it, so we can check if we finish a section of good tiles

        let clueR = ""; //clue string for row

        for (let y of columns) { //loop over each cell in row (looping over columns)
            cCount++;

            //if good cell, just up the count
            if (y.childNodes[0].getAttribute("data-tile") == "good") {
                rowCount++;
                
                col[cCount-1] += 1;
            }
            //if not good, edit clue text for corresponding row + col header
            else if (y.childNodes[0].getAttribute("data-tile") != "good") {
                if (rowCount != 0) {
                    clueR += rowCount + " ";
                    rowCount = 0;
                }

                if (col[cCount-1] == colCopy[cCount-1]) {
                    if (col[cCount-1] != 0) {
                        clueCA[cCount-1] += col[cCount-1] + "<br>";
                        col[cCount-1] = 0;
                    }
                }
            }

            if (cCount == grid) { //check if in last column
                if (rowCount != 0) {
                    clueR += rowCount + " ";
                }
                else if (clueR == "") {
                    clueR += "0";
                }
            }

            if (rCount == grid) { //check if in last row
                if (col[cCount-1] != 0) {
                    clueCA[cCount-1] += col[cCount-1] + " ";
                }
                else if (clueCA[cCount-1] == "") {
                    clueCA[cCount-1] += "0";
                }
            }

            //add clue to row header
            y.parentElement.childNodes[0].innerHTML = clueR;
        }

    }


    //fill in clues of columns
    let top = Array.from(gridT.childNodes[0].childNodes);
    top.shift();
    let x1 = 0;
    for (let x of top) {
        x.innerHTML = clueCA[x1];
        x1++;
    }

    //make an end game button - if they press it, add some stuff to end cont? freeze the grid?
    endCont.appendChild(document.createElement("br"));
    endCont.appendChild(document.createElement("br"));

    let endButton = document.createElement("button");
    endButton.innerHTML = "End game";
    endButton.id = "endBut";
    endButton.addEventListener("click", endGame);
    endCont.appendChild(endButton);
}

//small function to ask player and confirm end game
function endGame() {
    let end = confirm("Are you sure you want to end the game early?");

    if (end) {
        menu();
    }
}

function check(event) {
    //if tile has good attribute, highlight it with temp color, like blue
    //if not good, change color to red and remove event listener
    let tile = event.target;
    
    if(tile.getAttribute("data-tile") == "good") {
        tile.style.backgroundColor = "rgb(66, 167, 245)";
        //detecting if a section has been completely selected will be difficult...
    }
    else {
        tile.style.backgroundColor = "rgb(176, 35, 35)";
        //update fails counter
    }
}

//inserts a row with format [clue] [n tiles], where n is grid size
//also randomly generates good tiles by generating 0 or 1, if 1 assign good attribute to tile
// - parent: the table to be inserted into
function insertRow(parent) {
    let r = document.createElement("tr");
    r.className = "grid";

    insertHeader("", r, "r");

    for (let i = 0; i < grid; i++) {
        let cell = document.createElement("td");
        let tile = document.createElement("div");
        tile.className = "tiles";
        tile.addEventListener("click", check, {once: true});
        
        let z = Math.floor(Math.random() * 2);
        if (z == 1) {
            tile.setAttribute("data-tile", "good");
            //tile.style.backgroundColor = "green";
        }
        
        cell.appendChild(tile);
        r.appendChild(cell);
    }

    parent.appendChild(r);
}

//inserts a header row of form [n column clues], where n is grid size
// - info: text of the cell
// - parent: table to be inserted into
function insertHeader(info, parent, rowCol) { 
    let h = document.createElement("th");
    h.innerHTML = info;
    if (rowCol == "r") { 
        h.className = "gridR";
    }
    if (rowCol == "c") {
        h.className = "gridC";
    }

    parent.appendChild(h);
}