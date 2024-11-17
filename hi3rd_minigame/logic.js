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

//keep track of game state so we can check when they have won
var finishedR = 0;
var finishedC = 0;

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
    finishedR = 0;
    finishedC = 0;

    //grab grid size and fails to keep track globally
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
        alert("Can only have 0, 1, 2, or 3 fails allowed");
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
    let fn = document.createTextNode("Fails allowed: " + failNum);

    menuTextCont.appendChild(gs);
    menuTextCont.appendChild(document.createElement("br"));
    menuTextCont.appendChild(fn);

    //creates grid and appends it to grid container
    // - generate random pairs of numbers corresponding to grid cell good, and then create clues using that

    // - use a table to hold the grid + clues
    let gridT = document.createElement("table");
    gridT.id = "gridTable";
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

            // if we hit end of row, save the count as string
            // - if no good tiles, increment finished rows (0 row is technically already done), and disable the row
            if (cCount == grid) { //check if in last column
                if (rowCount != 0) {
                    clueR += rowCount + "";
                }
                else if (clueR == "") {
                    clueR += "0";

                    for (let k = 1; k <= grid; k++) {
                        y.parentElement.childNodes[k].firstChild.style.backgroundColor = "rgb(45, 45, 45)";
                        y.parentElement.childNodes[k].firstChild.removeEventListener("click", check);
                    }

                    finishedR++;
                }
            }

            // if we hit end of col, save the count as string
            // - if no good tiles, increment finished columns (0 col is technically already done), and disable the col
            if (rCount == grid) { //check if in last row
                if (col[cCount-1] != 0) {
                    clueCA[cCount-1] += col[cCount-1] + "";
                }
                else if (clueCA[cCount-1] == "") {
                    clueCA[cCount-1] += "0";

                    let column = y.cellIndex;
                    let g = y.parentElement.parentElement;
                    for (let k = 1; k <= grid; k++) {
                        g.childNodes[k].childNodes[column].firstChild.style.backgroundColor = "rgb(45, 45, 45)";
                        g.childNodes[k].childNodes[column].firstChild.removeEventListener("click", check);
                    }

                    finishedC++;
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

    //end game early button
    endCont.appendChild(document.createElement("br"));
    endCont.appendChild(document.createElement("br"));

    let endButton = document.createElement("button");
    endButton.innerHTML = "End game";
    endButton.id = "endBut";
    endButton.addEventListener("click", manuelEnd);
    endCont.appendChild(endButton);

    //this checks a very extreme case where every row and column is 0 on generation, so technically done, more common if grid is small, like 2x2
    if (finishedR == grid && finishedC == grid) {
        endCont.removeChild(endCont.lastChild);

        let endText = document.createTextNode("Congratulations, you won.");
        //will also eventually show them how many coins/points/whatever they got from the game
        endCont.appendChild(endText);

        endCont.appendChild(document.createElement("br"));

        let playAgainButton = document.createElement("button");
        playAgainButton.innerHTML = "Back to game settings selection";
        playAgainButton.id = "playAgainBut";
        playAgainButton.addEventListener("click", menu);
        endCont.appendChild(playAgainButton);
    }
}

//small function to ask player and confirm end game
function manuelEnd() {
    let end = confirm("Are you sure you want to end the game early?");

    if (end) {
        menu();
    }
}

// runs every time a tile is clicked
// - event: to let us grab the tile that was clicked
// if tile good, color accordingly and check if all good tiles have been clicked in corresponding row + column
// if all clicked, color accordingly and disable corresponding tiles
// and keep track of how many rows + cols finished
// otherwise, if bad, color accordingly and check if any fails still left
// if no more fails allowed, end game, freeze grid, and show good and bad
// if still more fails, keep playing, and decrement fails left
// and finally check if player has won, if so, do stuff
function check(event) {
    //if tile has good attribute, highlight it with temp color, like blue
    //if not good, change color to red and remove event listener
    let tile = event.target;
    tile.setAttribute("data-clicked", "true");
    
    if(tile.getAttribute("data-tile") == "good") {
        tile.style.backgroundColor = "rgb(66, 167, 245)";

        let row = tile.parentElement.closest('tr').rowIndex;
        let col = tile.parentElement.cellIndex;


        let g = document.getElementById('gridTable');
        let rcount = 0;
        let ccount = 0;

        for (let i = 1; i <= grid; i++) {
            if (g.childNodes[row].childNodes[i].firstChild.getAttribute("data-clicked") == "true" && g.childNodes[row].childNodes[i].firstChild.getAttribute("data-tile") == "good") {
                rcount++;
            }
        }
        for (let j = 1; j <= grid; j++) {
            if (g.childNodes[j].childNodes[col].firstChild.getAttribute("data-clicked") == "true" && g.childNodes[j].childNodes[col].firstChild.getAttribute("data-tile") == "good") {
                ccount++;
            }
        }
        
        //getting sum of clue numbers
        let rlist = g.childNodes[row].childNodes[0].innerHTML.match(/\d+/g);
        let r = 0;
        for (let i = 0; i < rlist.length; i++) {
            r += parseInt(rlist[i], 10);
        }

        let clist = g.childNodes[0].childNodes[col].innerHTML.match(/\d+/g);
        let c = 0;
        for (let i = 0; i < clist.length; i++) {
            c += parseInt(clist[i], 10);
        }

        if (r == rcount) {
            for (let i = 1; i <= grid; i++) {
                if (g.childNodes[row].childNodes[i].firstChild.getAttribute("data-tile") == "good") {
                    g.childNodes[row].childNodes[i].firstChild.style.backgroundColor = "green";
                }
                else {
                    if (g.childNodes[row].childNodes[i].firstChild.style.backgroundColor != "rgb(176, 35, 35)") {
                        g.childNodes[row].childNodes[i].firstChild.style.backgroundColor = "rgb(45, 45, 45)";
                    }
                    g.childNodes[row].childNodes[i].firstChild.removeEventListener("click", check);
                }
            }
            finishedR++;
        }
        if (c == ccount) {
            for (let j = 1; j <= grid; j++) {
                if (g.childNodes[j].childNodes[col].firstChild.getAttribute("data-tile") == "good") {
                    g.childNodes[j].childNodes[col].firstChild.style.backgroundColor = "green";
                }
                else {
                    if (g.childNodes[j].childNodes[col].firstChild.style.backgroundColor != "rgb(176, 35, 35)") {
                        g.childNodes[j].childNodes[col].firstChild.style.backgroundColor = "rgb(45, 45, 45)";
                    }
                    g.childNodes[j].childNodes[col].firstChild.removeEventListener("click", check);
                }
            }
            finishedC++;
        }
    }
    else {
        tile.style.backgroundColor = "rgb(176, 35, 35)";
        fails--;
        let fn = document.createTextNode("Fails allowed: " + fails);

        if (fails < 0) {
            fn = document.createTextNode("Fails allowed: 0");
            //freeze grid? and put stuff in end container, make a replay button
            let rows = Array.from(document.getElementById("gridTable").childNodes);
            rows.shift(); // so we don't loop over clue cells

            for (let x of rows) { //loop over rows
                let columns = Array.from(x.childNodes); //grab array of cells in this row
                columns.shift(); // remove clue cell 
        
                for (let y of columns) { //loop over each cell in row (looping over columns)
                    let t = y.childNodes[0];
                    t.removeEventListener("click", check);

                    //if (t.getAttribute("data-clicked") != "true") {
                        if (t.getAttribute("data-tile") == "good") {
                            t.style.backgroundColor = "rgb(66, 245, 126)";
                        }
                        else {
                            t.style.backgroundColor = "rgb(176, 35, 35)";
                        }
                    //}
                }
            }

            endCont.removeChild(endCont.lastChild);

            let endText = document.createTextNode("You made too many mistakes."); //tell user how many mistakes they made
            //will also eventually show them how many coins/points/whatever they got from the game
            endCont.appendChild(endText);

            endCont.appendChild(document.createElement("br"));

            let tryAgainButton = document.createElement("button");
            tryAgainButton.innerHTML = "Back to game settings selection";
            tryAgainButton.id = "tryAgainBut";
            tryAgainButton.addEventListener("click", menu);
            endCont.appendChild(tryAgainButton);
        }

        menuTextCont.removeChild(menuTextCont.lastChild);
        menuTextCont.appendChild(fn);
    }

    if (finishedR == grid && finishedC == grid) {
        endCont.removeChild(endCont.lastChild);

        let endText = document.createTextNode("Congratulations, you won.");
        //will also eventually show them how many coins/points/whatever they got from the game
        endCont.appendChild(endText);

        endCont.appendChild(document.createElement("br"));

        let playAgainButton = document.createElement("button");
        playAgainButton.innerHTML = "Back to game settings selection";
        playAgainButton.id = "playAgainBut";
        playAgainButton.addEventListener("click", menu);
        endCont.appendChild(playAgainButton);
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