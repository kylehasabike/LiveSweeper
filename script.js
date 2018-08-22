$(document).ready(()=>{
 
  
  
  let unRevealed = 0,
      totalMines = 0,
      gameOver = false;
  
  
  
  const fnNewGame = (rows,cols,mines)=>{
    
    gameOver = false;
    unRevealed = rows*cols;
    totalMines = mines;
    $('#new_game').addClass('disabled')
      .val('Play On!');
    
    fnNewBoard('#board', rows, cols, mines);
    
  }
  fnNewGame(10, 10, 10);
  
  
  
  $('form').submit(function(e){
    
    e.preventDefault();
    let inputCols = parseInt( $('#input_cols').val() ),
        inputRows = parseInt( $('#input_rows').val() ),
        inputMines = parseInt( $('#input_mines').val() );
    
    fnNewGame( inputRows, inputCols, inputMines);
    
  })
    .find('input')
    .on('change keyup',()=>{
    
    let maxMines = parseInt($('#input_cols').val()) * parseInt($('#input_rows').val());
    $('#input_mines').attr('max', (maxMines-1) );
    
    if ( $('#input_mines').val() > maxMines ) {
      $('#input_mines').val( maxMines-1 );
    }
    
    $('#new_game').val('Reset').removeClass('disabled');
    
  });

  
  
  function fnNewBoard(boardElement, rows, cols, mines) {
    
    
    // ----- prepare/resize the board element ----- //
    let $board = $(board);
    $board.empty();
    $board.css({
      width: 50+(cols*30),
      height: 50+(rows*30),
    });
    
    
    // ----- define newBoard and Square constructor ----- //
    let newBoard = [],
        Square = (()=>{
          let squareCounter = 0;
          return class Square {
            constructor(isMine=false) {
              this.unClicked = true;
              this.isMine = isMine;
              this.adjacentMines = 0;
              this.adjacentOpen = [];
              this.id = squareCounter++;
            }
          }
        })();
    
    
    // ----- contruct the squares ----- //
    let squares = [],
        squareTotal = rows*cols;
    for (let i=0; i<squareTotal; i++) {
      squares.push( new Square() )
    }
    
    
    // ----- assign mines at random ----- //
    let minesLeft = mines;
    while ( minesLeft > 0 ) {
      let randomSquare = Math.floor(Math.random()*squareTotal);
      
      if (squares[randomSquare].isMine) {
        continue;
      } else {
        squares[randomSquare].isMine = true;
        minesLeft--;
      }
    }

        
    // ----- add squares to the newBoard ----- //
    for (let i=0; i<rows; i++) {
      let newRow = [];
      for (let j=0; j<cols; j++) {        
        newRow.push(squares.shift());
      } 
      newBoard.push(newRow);
    }
    
    
    // ----- set "adjacentMines" and "adjacentOpen" values ----- //
    newBoard.forEach((row,i)=>{
      row.forEach((square,j)=>{    
        
        let adjacentSquares = [ [i,j-1], [i,j+1], [i-1,j], [i+1,j], [i-1,j-1], [i-1,j+1], [i+1,j-1], [i+1,j+1] ];
        
        adjacentSquares.forEach(v=>{
          if ( newBoard[v[0]] && newBoard[v[0]][v[1]] ) {
            
            if ( newBoard[v[0]][v[1]].isMine ) { 
              square.adjacentMines++;
            } else {
              square.adjacentOpen.push(newBoard[v[0]][v[1]].id);
            }
            
          }
        });
        
      });
    });
    
    
    // ----- append to DOM ----- //
    newBoard.forEach((row,i)=>{
      row.forEach((square,j)=>{
        
        let content = square.isMine ? '&#128163;' : square.adjacentMines;
        $board.append(`<div class="square unClicked" id="square-${square.id}" data-near="${square.adjacentMines}" data-mine="${square.isMine}" data-adjacent="${square.adjacentOpen}">${content}</div>`);
        
      });
    });
    
    
  }

  

  $('body').on('click', '.square', function(){    
    
    
    if (gameOver) return;
    
    
    $('#new_game').removeClass('disabled');
    
    
    let $clickedSquare = $(this);
    
    
    if ( $clickedSquare.data('mine') === true ) {
      $('.square[data-mine="true"]').removeClass('unClicked').addClass('clicked');
      $('#new_game').val('You Lost... Play Again?');
      gameOver = true;
      return;
    }
    
    
    if ( $clickedSquare.hasClass('unClicked') ) {
      unRevealed--;
      if (unRevealed === totalMines) {
      $('.square[data-mine="true"]').removeClass('unClicked').addClass('clicked').html('&#128513;');
        gameOver = true;
        setTimeout(()=>{
          $('#new_game').val('You Won!!! Play Again?');
          return;
        },0);
      }
    }
    
    
    $clickedSquare.removeClass('unClicked').addClass('clicked');
    $('#new_game').val('Reset');

    
    if ( $clickedSquare.data('near') === 0 ) {
      let adjacentOpen = $clickedSquare.data('adjacent');
      adjacentOpen = (adjacentOpen + '').split(',');
      adjacentOpen.forEach((v,i)=>{
        if ( $(`#square-${adjacentOpen[i]}`).hasClass('unClicked') ) {
          setTimeout(()=>{
            $(`#square-${adjacentOpen[i]}`).trigger('click').addClass('spin');
          },(i*15));          
        }
      });
    }

    
  });
  
  
  
});


