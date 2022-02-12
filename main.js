const grid = document.querySelector('.grid');
let width = 10;
let squares = [];
let bombamount = 20;
let isGameover = 0;
let flag =0;

let colorsbomb = ['red','green','blue','orange', 'yellow', 'pink'];

function createBoard() {

    const bombs = Array(bombamount).fill('bomb');
    const empty = Array(width * width - bombamount).fill('empty');

    const totarray = (empty.concat(bombs)).sort(() => Math.random() - 0.5);

    for (let i = 0; i < width * width; i++) {
        const square = document.createElement('div'); // creating 100 square div

        square.setAttribute('id', i); // setting id numerically
        square.classList.add(totarray[i]);
        

        grid.appendChild(square); // adding sq to grid
        squares.push(square);


        square.addEventListener('click', function (e) {
            click(square);
        })

        square.oncontextmenu = function(e)
        {
            e.preventDefault();
            addFlag(square);
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
            console.log(squares[i]);
        }
    }
}

createBoard();

function click(square) {
    if (isGameover==1) return;
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
            //console.log(square);
            square.innerHTML = tot;
            return;
        }
       checkSquare(square,parseInt(id));
    }
    square.classList.add('checked');
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

    setTimeout(()=> 
    {
        if(leftborder==0)
        {
            //let newid = squares[parseInt(id)-1].id;
            let newid = id-1;
            let newsq = document.getElementById(newid);
            //console.log(newsq);
            click(newsq);
        }
        if(rightborder==0)
        {
            //let newid = squares[parseInt(id)+1].id;
            let newid = id + 1;
            //alert(newid);
            let newsq = document.getElementById(newid);
            click(newsq);
        }
        if(id-width>=0)
        {
            //let newid = squares[parseInt(id-width)].id;
            let newid = id-width;
            let newsq = document.getElementById(newid);
            click(newsq);
        }
        if(id+width<width*width)
        {
            //let newid = squares[parseInt(id-width)].id;
            let newid = id+width;
            let newsq = document.getElementById(newid);
            console.log(newid +" "+ newsq);
            click(newsq);
        }
        if(id-width>=0 && leftborder==0)
        {
            //let newid = squares[parseInt(id-width-1)].id;
            let newid = id-width-1;
            let newsq = document.getElementById(newid);
            click(newsq);
        }
        if(id-width>=0 && rightborder==0)
        {
            //let newid = squares[parseInt(id-width+1)].id;
            let newid = id-width+1;
            let newsq = document.getElementById(newid);
            click(newsq);
        }
        if(id+width < width*width && rightborder==0)
        {
            //let newid = squares[parseInt(id+width+1)].id;
            let newid = id+width+1;
            let newsq = document.getElementById(newid);
            click(newsq);
        }
        if(id+width < width*width && leftborder==0)
        {
            //let newid = squares[parseInt(id+width-1)].id;
            let newid = id+width-1;
            let newsq = document.getElementById(newid);
            click(newsq);
        }
    },10)
}


function gameOver(square)
{
    isGameover=1;
    alert("game over");
    for(let i=0;i<squares.length;i++)
    {
        if(squares[i].classList.contains('bomb'))
        {
            squares[i].innerHTML = '💣';

            let ind = Math.floor(Math.random()*6);

            document.getElementById(squares[i].getAttribute('id')).style.backgroundColor = colorsbomb[ind];
        }
    }
}

function addFlag(square)
{
    if(isGameover) return;
    if(!square.classList.contains('checked') && flag<bombamount)
    {
        if(!square.classList.contains('flag'))
        {
            square.classList.add('flag');
            square.innerHTML = '🚩';
            flag++;
            checkWin();
        }
        else
        {
            square.classList.remove('flag');
            square.innerHTML = '';
            flag--;
        }
    }
}

function checkWin()
{
    let match=0;
    for(let i=0;i<squares.length;i++)
    {
        if(squares[i].classList.contains('flag') && squares[i].classList.contains('bomb'))
        {
            match++;
        }
        if(match==bombamount)
        {
            alert('Won'); 
            isGameover=1;
        }
    }
}
