// tabuleiro
const main = document.getElementById('main');
let board = null;
let abstractBoard = null;
// array para faciliar o acesso às células
const cells = [];
// array para estipular quais células são jogaveis, ou seja, podem armazenar uma peça
const playableCells = range(11, 89).filter(i => 1 <= i % 10 && i % 10 <= 8);

// placar
const blackScore = document.getElementById('black');
const whiteScore = document.getElementById('white');
const turnStr = document.getElementById('turn');
// array para guardar toda a sequencia de movimentos executados por ambos os jogadores
const gameMoves = [];

// jogadores
const BLACK = 'black';
const WHITE = 'white';
let playerHuman = BLACK;
let playerAI = WHITE;
let turn = playerHuman; // determina qual jogador deve jogar nesta rodada
// contagem de peças para cada jogador
let blackCount = 0;
let whiteCount = 0;

// constantes auxiliares de direção
const UP = -10;
const DOWN = 10;
const LEFT = -1;
const RIGHT = 1;
const UP_RIGHT = -9;
const DOWN_RIGHT = 11;
const DOWN_LEFT = 9;
const UP_LEFT = -11;
const DIRECTIONS = [UP, UP_RIGHT, RIGHT, DOWN_RIGHT, DOWN, DOWN_LEFT, LEFT, UP_LEFT];

// botões
const btnstart = document.getElementById('btnstart');
const btnrules = document.getElementById('btnrules');
const btnrestart = document.getElementById('btnrestart');
const closerules = document.getElementById('closerules');

// atribuindo eventos aos botões
btnstart.addEventListener("click", startGame);
btnrestart.addEventListener("click", resetGame);
btnrules.addEventListener("click", () => {displayRules(true);});
closerules.addEventListener("click", () => {displayRules(false);});

const chooseDifficulty = minimaxStrat(3, scoreAI);

function makeAbstractBoard() {
    abstractBoard = new Array(100);
    for (let i = 0; i < abstractBoard.length; i++) {
        abstractBoard[i] = "?";
        if(i >= 11 && i <= 88) {
            if(1 <= i % 10 && i % 10 <= 8) {
                abstractBoard[i] = '.';
            }
        }
    }
    //return abstractBoard;
}
// função encarregada de iniciar o jogo
function startGame() {
    // criando elemento tabuleiro e adicionando a página
    if (!board) {
        board = createBoard(10);
        main.appendChild(board);
    }

    makeAbstractBoard();
    setStartingPosition(cells, abstractBoard, false); // construindo estado inicial do jogo
    setScoreText(); // mostrando placar inicial

    // redefinindo objetos visiveis e invisíveis na página
    main.style.display = 'block';
    btnrestart.style.display = 'block';
    btnstart.style.display = 'none';
}

// função para voltar o jogo ao estado inicial
function resetGame() {
    blackCount = 0;
    whiteCount = 0;
    setStartingPosition(cells, abstractBoard, true);
    setScoreText();
}

// função para criar o tabuleiro de jogo
// o tabuleiro é basicamente uma grade NxN
// separada em linhas, onde a primeira e última linha
// são invisíveis e inacessíveis ao jogador, 
// criadas apenas para utilizar referência direta.
// O mesmo pode ser dito para a primeira e última coluna.
function createBoard(size) {
    const board = document.createElement('div');
    board.id = 'board';

    // criando as linhas
    for (let i = 0; i < size; i++) {
        let row;

        row = document.createElement('div');
        row.classList.add('row');
        // bloqueando linhas inúteis
        if (i == 0 || i == size - 1) {
            row.classList.add('blocked');
        }
        board.appendChild(row);
    }

    const rows = board.getElementsByClassName('row');
    let i = 0;

    // criando as células
    for (let row of rows) {
        for (let j = 0; j < size; j++) {
            let cell = createCell(i + j);

            // bloqueando células inúteis
            if (j == 0 || j == size - 1 || row == board.firstChild || row == board.lastChild) {
                cell.classList.add('blocked');
            }
            cells.push(cell);
            row.appendChild(cell);
        }
        i += 10;
    }
    
    return board;
}

// função para atualizar o placar e mensagem de turnos
function setScoreText() {
    whiteScore.innerHTML = `Brancas: ${whiteCount}`;
    blackScore.innerHTML = `Pretas: ${blackCount}`;
    turnStr.innerHTML = turn ? `Jogam as ${turn == BLACK ? 'Pretas' : 'Brancas'}` : 'Fim de Jogo';
}

// função para estabelecer estado inicial do jogo
function setStartingPosition(brd, absBoard, isReset) {
    turn = playerHuman; // o jogador sempre terá o primeiro movimento

    // se a função é chamada com o intuito de redefinir o tabuleiro
    // precisamos remover todas as peças antes de prosseguir
    if (isReset) {
        playableCells.forEach((id) => {
            let cell = brd[id];

            if (cell.firstChild) {
                cell.firstChild.remove();
            }
        })
    };

    insertPiece(44, WHITE, brd, absBoard);
    insertPiece(55, WHITE, brd, absBoard);
    insertPiece(54, BLACK, brd, absBoard);
    insertPiece(45, BLACK, brd, absBoard);
}

function printBoard(b) {
    if(arguments.length > 0) {
        var cat = [];
        for(let i = 0; i < 10; i++) {
            cat.push(b.slice(i*10, i*10 + 10));
        }
        console.table(cat);
        return;
    }
    for(let i = 0; i < 10; i++) {
        console.log(abstractBoard.slice(i*10, i*10 + 10));
    }
}
// função para criar células
function createCell(id) {
    const newCell = document.createElement('div');

    newCell.classList.add('cell');
    newCell.id = `${id}`;
    newCell.onclick = () => {
        // tenta fazer uma jogada para o jogador
        play(playerHuman, id, cells, abstractBoard);

        // pede que o computador realize sua(s) jogada(s)
        // precisamos verificar múltiplas vezes se ainda é turno
        // do computador pois pode acontecer de não haver movimentos 
        // legais para o jogador, neste caso o computador
        // realiza movimentos até que o jogador tenha jogadas,
        //  ou até que o jogo acabe quando as jogadas legais
        // do computador também se esgotarem
        while (turn == playerAI) {
            aiPlay(chooseDifficulty);
        }
        //while (turn == playerAI) aiPlay(newbieStrategy);
    };

    return newCell;
}

// função responsável por tentar realizar um movimento para um jogador
function play(player, id, brd, absBoard) {
    // um movimento só deve ser feito se forem verdadeiras as condições:
    //   -> o turno é do jogador
    //   -> a célula é válida
    //   -> o movimento é legal
    if (isPlayerTurn(player) && isValidCell(id) && isLegalMove(id, player, brd)) {
        makeMove(id, player, brd, absBoard);
        turn = nextPlayer(brd, player); // determina qual jogador terá o próximo turno
    }
    setScoreText(); // atualiza placar

    //return [brd, score(playerHuman, brd)];
}

// função para determinar qual jogador deve executar a próxima jogada
function nextPlayer(brd, previous) {
    const opp = opponent(previous);

    // se o oponento do jogador atual possui 
    // jogadas disponíveis, o próximo turno é dele
    if(hasAvailableMoves(opp, brd)) return opp;
    // caso contrário, se o jogador atual ainda 
    // possui movimentos disponíveis, o próximo turno é dele
    if(hasAvailableMoves(previous, brd)) return previous;
    
    // se nenhum jogador possui jogadas, fim do jogo
    return null;
}

function range(first, last) {
    return [...Array(last - first + 1).keys()].map(i => i + first);
}

// função para criar uma peça baseado
// na cor recebida como parâmetro
function createPiece(color) {
    const newPiece = document.createElement('div');

    newPiece.classList.add('piece', color);

    return newPiece;
}

// função para inserir uma peça de
// determinada cor em uma célula específica
function insertPiece(id, color, brd, absBoard) {
    absBoard[id] = getColor(color);
    const cell = brd[id];
    const piece = createPiece(color);

    // atualizando contagem de peças
    if (color == BLACK) blackCount++;
    else whiteCount++;

    cell.appendChild(piece);
}

function getColor(player) {
   if(player == BLACK){return "b"};
   if(player == WHITE){return "w"};
}
function insertPieceAI(id, color, brd, absBoard) {
    absBoard[id] = getColor(color);
}

// função para controlar a exibição 
// do painel de regras
function displayRules(displayRules) {
    rules.style.display = displayRules ? 'block' : 'none';
}

// função para verifical se uma célula é jogável
function isValidCell(move) {
    return playableCells.includes(move);
}

// função para verificar se um movimento
// é válido para determinado jogador
function isLegalMove(move, player, brd) {
    // o movimento é legal se a nova peça está sendo
    // inserida em uma célula válida vazia, e envolve
    // uma ou mais peças do oponente com alguma outra peça 
    // do jogador já posicionada no tabuleiro
    function formsBracket(direction) {
        // retorna se é possivel encontrar outra peça 
        // do jogador na direção recebida
        const it = move + direction;
        return findBracket(move, player, brd, direction);
    }

    // retorna:
    // true (celula escolhida esta vazia e movimento captura pelo menos 1 peça em pelo menos 1 direção)
    // false (celula escolhida não esta vazia ou movimento não captura nenhuma peça em nenhuma direção)
    return !cells[move].firstChild && DIRECTIONS.map(formsBracket).some((cell) => cell != null);
}

function isLegalMoveAI(move, player, brd, absBoard) {
    // o movimento é legal se a nova peça está sendo
    // inserida em uma célula válida vazia, e envolve
    // uma ou mais peças do oponente com alguma outra peça 
    // do jogador já posicionada no tabuleiro
    function formsBracket(direction) {
        // retorna se é possivel encontrar outra peça 
        // do jogador na direção recebida
        return findBracketAI(move, player, brd, absBoard, direction);
    }
    let ret;
    // retorna:
    // true (celula escolhida esta vazia e movimento captura pelo menos 1 peça em pelo menos 1 direção)
    // false (celula escolhida não esta vazia ou movimento não captura nenhuma peça em nenhuma direção)
    ret = (absBoard[move] == '.') && (DIRECTIONS.map(formsBracket).some((cell) => cell != null));
    return ret;
    //return !cells[move].firstChild && DIRECTIONS.map(formsBracket).some((cell) => cell != null);
}

// função para percorrer as células 
// em uma direção até encontrar uma 
// peça da cor do jogador, ou até
// chegar a uma borda
function findBracket(cell, player, brd, direction) {
    let bracket = cell + direction;
    const opp = opponent(player);

    // se a primeira celula nesta direção possuir uma peça do mesmo jogador, retorne nulo
    if (cellHoldsPieceOfColor(bracket, player, brd)) return null;
    // ande na direção até encontrar uma célula que não contenha uma peça do oponente
    while (cellHoldsPieceOfColor(bracket, opp, brd)) bracket += direction;

    // retorne:
    // id da celula, caso contenha uma peça (obrigatoriamente do jogador)
    // nulo, caso a celula não contenha peça
    return brd[bracket].firstChild ? bracket : null;
}

function findBracketAI(cell, player, brd, absBoard, direction) {
    let bracket = cell + direction;
    const opp = opponent(player);

    // se a primeira celula nesta direção possuir uma peça do mesmo jogador, retorne nulo
    if(absBoard[bracket] == getColor(player)) return null;
    //if (cellHoldsPieceOfColor(bracket, player, brd)) return null;
    // ande na direção até encontrar uma célula que não contenha uma peça do oponente
    //while (cellHoldsPieceOfColor(bracket, opp, brd)) bracket += direction;
    while (absBoard[bracket] == getColor(opp)) bracket += direction;

    // retorne:
    // id da celula, caso contenha uma peça (obrigatoriamente do jogador)
    // nulo, caso a celula não contenha peça
    return (absBoard[bracket] == "w" || absBoard[bracket] == "b")? bracket : null;
    //return brd[bracket].firstChild ? bracket : null;
}


// função para verificar se uma celula contém
// uma peça de determinada cor
function cellHoldsPieceOfColor(id, color, brd) {
    if (!brd[id].firstChild) return false;
    return brd[id].firstChild.classList.contains(color);
}

// função para determinar o oponente
// de um jogador
function opponent(player) {
    return player == WHITE ? BLACK : WHITE;
}

// função para verificar se o turno pertence ao jogador
function isPlayerTurn(player) {
    return player == turn;
}

// função para inverter a cor de peças capturadas
function swapPieces(move, player, brd, absBoard, direction) {
    // procura o id da celula que forma a captura nesta direção
    const bracket = findBracket(move, player, brd, direction);
    let cell = move + direction;
    const mine = (player == BLACK)? "b" : "w";
    const opp = (opponent(player) == BLACK)? "b" : "w";
    // se o id é nulo, retorne
    if(!bracket) return;

    // ande na direção até chegar a célula de captura
    while (cell != bracket) {
        // troca de cor
        absBoard[cell] = mine;
        brd[cell].firstChild.classList.remove(opponent(player));
        brd[cell].firstChild.classList.add(player);
        // muda placar
        if (player == BLACK) {
            blackCount++;
            whiteCount--;
        }
        else {
            blackCount--;
            whiteCount++;
        }
        cell += direction;
    }
}

function swapPiecesAI(move, player, brd, absBoard, direction) {
    // procura o id da celula que forma a captura nesta direção
    const bracket = findBracketAI(move, player, brd, absBoard, direction);
    let cell = move + direction;
    const mine = getColor(player);
    const opp = getColor(opponent(player));
    // se o id é nulo, retorne
    if(!bracket) return;

    // ande na direção até chegar a célula de captura
    while (cell != bracket) {
        // troca de cor
        absBoard[cell] = mine;
        cell += direction;
    }
}

// função para calcular os possiveis movimentos de um jogador
function legalMoves(player, brd) {
    // retorna o id de todas as céculas que formam movimentos legais
    return playableCells.filter(move => isLegalMove(move, player, brd));
}
function legalMovesAI(player, brd, absBoard) {
    // retorna o id de todas as céculas que formam movimentos legais
    return playableCells.filter(move => isLegalMoveAI(move, player, brd, absBoard));
}

// função para verificar se o jogador possui movimentos
function hasAvailableMoves(player, brd) {
    return legalMoves(player, brd).length > 0;
}
function hasAvailableMovesAI(player, brd, absBoard) {
    return legalMoves(player, brd, absBoard).length > 0;
}

// função para avaliar vantagem de um jogador sobre outro
function score(player, brd) {
    let playerScore = 0;
    let oppScore = 0;

    playableCells.forEach ((cell) => {
        let piece = brd[cell].firstChild;

        if(piece && piece.classList.contains(player)) playerScore++;
        else if(piece) oppScore++;
    });

    return playerScore - oppScore;
}

function scoreAI(player, brd, absBoard) {
    let playerScore = 0;
    let oppScore = 0;

    playableCells.forEach ((cell) => {
        let piece = absBoard[cell];
        if(piece == getColor(player)){
            playerScore++;
        }
        else if(piece == getColor(opponent(player))) {
            oppScore++;
        }
    });

    return playerScore - oppScore;
}

// função para realizar um movimento de um jogador
function makeMove(move, player, brd, absBoard) {
    insertPiece(move, player, brd, absBoard);
    DIRECTIONS.forEach(direction => {
        swapPieces(move, player, brd, absBoard, direction);
    });

    return brd;
}

function makeMoveAI(move, player, brd, absBoard) {
    insertPieceAI(move, player, brd, absBoard);
    printBoard(absBoard);
    DIRECTIONS.forEach(direction =>{
        swapPiecesAI(move, player, brd, absBoard, direction);
    });

    return absBoard;
}

// função responsável pelas decisões e movimentos do computador
function aiPlay(strategy) {
    const brd = cells;
    let ai = playerAI;
    const absBoard = abstractBoard;

    // só executa movimentos em seus turnos
    if (isPlayerTurn(ai)) {
        // escolhe um movimento de acordo com a estratégia
        let move = getMove(strategy, ai, brd, absBoard);

        // executa movimento
        makeMove(move, ai, brd, absBoard);
        gameMoves.push(`${ai}${move}`);
        //setTimeout(() => {yieldNextPlayer(brd, ai)}, 1000);
        turn = nextPlayer(brd, ai);
        
        // atualiza placar
        setScoreText();
    }
    //return [brd, scoreAI(playerHuman, brd, absBoard)];
}
function yieldNextPlayer(brd, ai){
    turn = nextPlayer(brd, ai);
    console.log('intervalo');
}

// função para escolher movimento do computador de acordo com a estrategia
function getMove(strategy, player, brd, absBoard) {
    // faz replica do tabuleiro para evitar jogadas indesejadas
    const copy = cloneBoard(brd);
    const copyAbs = [...absBoard]
    // determina movimento
    const move = strategy(player, copy, copyAbs);

    // se a celula escolhida não é valido ou o movimento não é legal, retorne nulo
    // acredito que não precise fazer checagem a mais
    if (!isValidCell(move) || !isLegalMove(move, player, brd)) return null;

    return move;
}

// função para fazer uma cópia profunda do tabuleiro
function cloneBoard(brd) {
    const clone = [];

    brd.forEach((cell)=>{
        clone.push(cell.cloneNode(true));
    });

    return clone;
}

function finalValue(player, brd) {
    const diff = score(player, brd);
    if (diff < 0) {return Number.MIN_SAFE_INTEGER/2};
    if (diff > 0) {return Number.MAX_SAFE_INTEGER/2};
    return diff;
}

function finalValueAI(player, brd) {
    const diff = scoreAI(player, brd);
    if (diff < 0) {return Number.MIN_SAFE_INTEGER/2};
    if (diff > 0) {return Number.MAX_SAFE_INTEGER/2};
    return diff;
}

function random(floor, ceiling) {
    return Math.floor(Math.random() * (ceiling - floor)) + floor;
}

function newbieStrategy(player, brd) {
    const moves = legalMoves(player, brd);

    return moves[random(0, moves.length)];
}

function minimax(player, board, absBoard, depth, evaluate) {
    const value = (brd) => -minimax(opponent(player), board, brd, depth -1, evaluate).minScore;
    let ret;
    printBoard(absBoard);
    if(depth == 0) {
        ret = {minScore: evaluate(player, board, absBoard), move: null};
        return ret;
    }
    const moves = legalMoves(player, board);
    // checar se existe algum movimento a ser feito
    if(!moves) {
        if(!hasAvailableMovesAI(opponent(player), board, absBoard)) {
            return {minScore: finalValueAI(player, board, absBoard), move: null};
        }
        // passa o turno
        ret = {minScore: value(absBoard), move: null};
        return ret;
    }
    let move = moves[0];
    let val = value(makeMoveAI(move, player, board, [...absBoard]));
    let temp = val;
    for (const m of moves) {
        //temp = value(makeMove(m, player, cloneBoard(board), [...absBoard]));
        temp = value(makeMoveAI(m, player, board, [...absBoard]));
        if(temp > val) {
            val = temp;
            move = m;
        }
    }
    ret = {minScore: value(absBoard), move: move};
    return ret;
}

function minimaxStrat(depth, evaluate) {
    return (player, brd, absBoard) => {return minimax(player, brd, absBoard, depth, evaluate).move};
}
