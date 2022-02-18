const grid = document.querySelector('.gridgg');
let width = 10;
let squares = [];
let bombamount = 15;
let isGameover = 0;
let flag = 0;

let colorsbomb = ['red', 'green', 'blue', 'orange', 'yellow', 'purple','cyan'];

let isStarted=0;
let startTime;
let curTime;


function createBoard() {

    const bombs = Array(bombamount).fill('bomb');
    const empty = Array(width * width - bombamount).fill('empty');

    const totarray = (empty.concat(bombs)).sort(() => Math.random() - 0.5);

    for (let i = 0; i < width * width; i++) {
        const square = document.createElement('div'); // creating 100 square div

        square.setAttribute('id', i); // setting id numerically
        square.classList.add(totarray[i]);
        square.classList.add('cell');


        let row = Math.floor(i / 10);
        let col = i % 10;
        if ((row + col) % 2 == 1) square.classList.add('odd');
        else square.classList.add('even');


        grid.appendChild(square); // adding sq to grid
        squares.push(square);


        square.addEventListener('click', function (e) {
            click(square);
            if(isStarted==0)
            {
                isStarted=1;
                timeStart();
            }
        })

        square.oncontextmenu = function (e) {
            e.preventDefault();
            addFlag(square);
            if(isStarted==0)
            {
                isStarted=1;
                timeStart();
            }
        }


    }

    for (let i = 0; i < squares.length; i++) {
        let leftborder = 0;
        let rightborder = 0;
        if (i % width == 0) {
            leftborder = 1;
        }
        if ((i % width) == width - 1) {
            rightborder = 1;
        }

        let total = 0;

        if (squares[i].classList.contains('empty')) {
            if (leftborder == 0 && squares[i - 1].classList.contains('bomb')) total++;
            if (rightborder == 0 && squares[i + 1].classList.contains('bomb')) total++;
            if (i - width >= 0 && squares[i - width].classList.contains('bomb')) total++;
            if (i + width < width * width && squares[i + width].classList.contains('bomb')) total++;
            if (i - width >= 0 && leftborder == 0 && squares[i - width - 1].classList.contains('bomb')) total++;
            if (i - width >= 0 && rightborder == 0 && squares[i - width + 1].classList.contains('bomb')) total++;
            if (i + width < width * width && leftborder == 0 && squares[i + width - 1].classList.contains('bomb')) total++;
            if (i + width < width * width && rightborder == 0 && squares[i + width + 1].classList.contains('bomb')) total++;


            squares[i].setAttribute('data', total);
            //console.log(squares[i]);
        }
    }
}

createBoard();

let clock;

function timeStart()
{
    const dateobj = new Date();
    startTime = dateobj.getTime();
    
    clock = setInterval(timeUpdate,10);
}

function timeUpdate()
{
    if(isGameover) clearInterval(clock);
    const dateobj2 = new Date();
    curTime = dateobj2.getTime();
    //console.log(curTime+' aaaa');
    let timeInt = Math.floor((curTime-startTime)/1000);
    let timeString = timeInt.toString();
    if(timeInt<10) timeString = "00"+timeString;
    else if(timeInt<100) timeString = '0'+timeString;
    document.getElementById('timer').innerHTML = timeString; 
}


function click(square) {
    if (isGameover == 1) return;
    if (square.classList.contains('checked') || square.classList.contains('flag')) return;

    let id = square.id;

    if (square.classList.contains('bomb')) {
        gameOver(square);
    }
    else {
        let tot = square.getAttribute('data');
        //alert(tot);
        if (tot != 0) {
            square.classList.add('checked');
            checkWin();
            //console.log(square);
            square.innerHTML = tot;
            if (tot == 1) document.getElementById(square.id).style.color = 'blue';
            else if (tot == 2) document.getElementById(square.id).style.color = 'darkgreen';
            else if (tot == 3) document.getElementById(square.id).style.color = 'red';
            else if (tot == 4) document.getElementById(square.id).style.color = 'purple';
            else if (tot == 5) document.getElementById(square.id).style.color = 'maroon';
            else if (tot == 6) document.getElementById(square.id).style.color = 'turquoise';
            else if (tot == 7) document.getElementById(square.id).style.color = 'black';
            else document.getElementById(square.id).style.color = 'gray';
            return;
        }
        checkSquare(square, parseInt(id));
    }
    square.classList.add('checked');
    checkWin();
}


function checkSquare(square, id) {
    let leftborder = 0;
    let rightborder = 0;
    if (id % width == 0) {
        leftborder = 1;
    }
    if ((id % width) == width - 1) {
        rightborder = 1;
    }

    //alert(id);

    setTimeout(() => {
        if (leftborder == 0) {
            //let newid = squares[parseInt(id)-1].id;
            let newid = id - 1;
            let newsq = document.getElementById(newid);
            //console.log(newsq);
            click(newsq);
        }
        if (rightborder == 0) {
            //let newid = squares[parseInt(id)+1].id;
            let newid = id + 1;
            //alert(newid);
            let newsq = document.getElementById(newid);
            click(newsq);
        }
        if (id - width >= 0) {
            //let newid = squares[parseInt(id-width)].id;
            let newid = id - width;
            let newsq = document.getElementById(newid);
            click(newsq);
        }
        if (id + width < width * width) {
            //let newid = squares[parseInt(id-width)].id;
            let newid = id + width;
            let newsq = document.getElementById(newid);
            click(newsq);
        }
        if (id - width >= 0 && leftborder == 0) {
            //let newid = squares[parseInt(id-width-1)].id;
            let newid = id - width - 1;
            let newsq = document.getElementById(newid);
            click(newsq);
        }
        if (id - width >= 0 && rightborder == 0) {
            //let newid = squares[parseInt(id-width+1)].id;
            let newid = id - width + 1;
            let newsq = document.getElementById(newid);
            click(newsq);
        }
        if (id + width < width * width && rightborder == 0) {
            //let newid = squares[parseInt(id+width+1)].id;
            let newid = id + width + 1;
            let newsq = document.getElementById(newid);
            click(newsq);
        }
        if (id + width < width * width && leftborder == 0) {
            //let newid = squares[parseInt(id+width-1)].id;
            let newid = id + width - 1;
            let newsq = document.getElementById(newid);
            click(newsq);
        }
    }, 50)
}


function gameOver(square) {
    isGameover = 1;
    bombind = square.id;

    square.innerHTML = '💣';
    let ind = Math.floor(Math.random() * 6);
    document.getElementById(square.getAttribute('id')).style.backgroundColor = colorsbomb[ind];

    let bn = 0;
    for (let i = 0; i < squares.length; i++) {
        if (squares[i].classList.contains('bomb') && i != bombind) {
            bn++;
            setTimeout(() => {
                squares[i].innerHTML = '💣';

                let ind = Math.floor(Math.random() * 7);

                document.getElementById(squares[i].getAttribute('id')).style.backgroundColor = colorsbomb[ind];
                // document.getElementById(squares[i].getAttribute('id')).style.borderColor = colorsbomb[ind];
            }, bn * 250);
        }
    }
    setTimeout(() => { alert("game over"); }
        , bombamount * 250);

}

function addFlag(square) {
    if (isGameover) return;
    if (!square.classList.contains('checked')) {
        if (!square.classList.contains('flag') && flag < bombamount) {
            square.classList.add('flag');
            square.innerHTML = '🚩';
            flag++;
            //checkWin();
        }
        else  if(square.classList.contains('flag'))
        {
            square.classList.remove('flag');
            square.innerHTML = '';
            flag--;
        }
        let rembomb = bombamount-flag;
        if( rembomb<10) document.getElementById('flagcounter').innerHTML = '0'+rembomb;
        else document.getElementById('flagcounter').innerHTML = rembomb;

    }
}

function checkWin() {
    let match = 0;
    for (let i = 0; i < squares.length; i++) {
        if (squares[i].classList.contains('checked') && !squares[i].classList.contains('bomb')) {
            match++;
        }
    }
    if (match == width * width - bombamount) {
        setTimeout(() => {
            alert('Win');
        }, 400);
        isGameover = 1;
        firebasestore();
    }
}



function firebasestore()
{
    firebase.database().ref('curtime/' + curTime).set({
        curTime : Math.floor((curTime-startTime)/1000)
      }, function (error) {
        if (error) {
          // The write failed...
        } else {
          console.log('done');
        }
      });
}


$('#play-tab').click(function(){
    //alert('a');
    setTimeout(()=>{
    document.getElementById('myTabContent').classList.add('d-flex');
    document.getElementById('myTabContent').classList.add('justify-content-center');
    document.getElementById('myTabContent').classList.add('align-items-center');
    },150);
});
$('#leaderboard-tab').click(function()
{
    setTimeout(()=>{
    document.getElementById('myTabContent').classList.remove('d-flex');
    document.getElementById('myTabContent').classList.remove('justify-content-center');
    document.getElementById('myTabContent').classList.remove('align-items-center');
    },150);
});