class TicTacToe {
    constructor() {
        this.board = ['', '', '', '', '', '', '', '', ''];
        this.currentPlayer = 'X';
        this.gameActive = true;
        this.gameMode = 'human';
        this.scores = {
            X: 0,
            O: 0,
            draws: 0
        };
        
        this.winningConditions = [
            [0, 1, 2],
            [3, 4, 5],
            [6, 7, 8],
            [0, 3, 6],
            [1, 4, 7],
            [2, 5, 8],
            [0, 4, 8],
            [2, 4, 6]
        ];
        
        this.init();
    }
    
    init() {
        this.bindEvents();
        this.updateDisplay();
        this.loadScores();
    }
    
    bindEvents() {
        document.querySelectorAll('.cell').forEach(cell => {
            cell.addEventListener('click', (e) => this.handleCellClick(e));
        });
        
        document.getElementById('reset-game').addEventListener('click', () => this.resetGame());
        document.getElementById('reset-scores').addEventListener('click', () => this.resetScores());
        document.getElementById('play-again').addEventListener('click', () => this.playAgain());
        
        document.querySelectorAll('input[name="gameMode"]').forEach(radio => {
            radio.addEventListener('change', (e) => this.changeGameMode(e.target.value));
        });
        
        document.getElementById('winner-modal').addEventListener('click', (e) => {
            if (e.target.id === 'winner-modal') {
                this.closeModal();
            }
        });
    }
    
    handleCellClick(e) {
        const cell = e.target;
        const index = parseInt(cell.dataset.index);
        
        if (this.board[index] !== '' || !this.gameActive) {
            return;
        }
        
        this.makeMove(index, this.currentPlayer);
        
        if (this.checkWinner()) {
            this.endGame(this.currentPlayer);
            return;
        }
        
        if (this.checkDraw()) {
            this.endGame('draw');
            return;
        }
        
        this.switchPlayer();
        
        if (this.gameMode === 'ai' && this.currentPlayer === 'O' && this.gameActive) {
            this.makeAIMove();
        }
    }
    
    makeMove(index, player) {
        this.board[index] = player;
        const cell = document.querySelector(`[data-index="${index}"]`);
        cell.textContent = player;
        cell.classList.add(player.toLowerCase());
        
        cell.style.animation = 'bounceIn 0.5s ease';
    }
    
    makeAIMove() {
        if (!this.gameActive) return;
        
        document.querySelector('.game-info').classList.add('ai-thinking');
        document.querySelector('.game-board').classList.add('disabled');
        
        setTimeout(() => {
            const bestMove = this.getBestMove();
            this.makeMove(bestMove, 'O');
            
            document.querySelector('.game-info').classList.remove('ai-thinking');
            document.querySelector('.game-board').classList.remove('disabled');
            
            if (this.checkWinner()) {
                this.endGame('O');
                return;
            }
            
            if (this.checkDraw()) {
                this.endGame('draw');
                return;
            }
            
            this.switchPlayer();
        }, 800 + Math.random() * 1200);
    }
    
    getBestMove() {
        for (let i = 0; i < 9; i++) {
            if (this.board[i] === '') {
                this.board[i] = 'O';
                if (this.checkWinner()) {
                    this.board[i] = '';
                    return i;
                }
                this.board[i] = '';
            }
        }
        
        for (let i = 0; i < 9; i++) {
            if (this.board[i] === '') {
                this.board[i] = 'X';
                if (this.checkWinner()) {
                    this.board[i] = '';
                    return i;
                }
                this.board[i] = '';
            }
        }
        
        if (this.board[4] === '') {
            return 4;
        }
        
        const corners = [0, 2, 6, 8];
        const availableCorners = corners.filter(i => this.board[i] === '');
        if (availableCorners.length > 0) {
            return availableCorners[Math.floor(Math.random() * availableCorners.length)];
        }
        
        const availableSpots = this.board.map((spot, index) => spot === '' ? index : null).filter(spot => spot !== null);
        return availableSpots[Math.floor(Math.random() * availableSpots.length)];
    }
    
    checkWinner() {
        return this.winningConditions.some(condition => {
            const [a, b, c] = condition;
            if (this.board[a] && this.board[a] === this.board[b] && this.board[a] === this.board[c]) {
                this.highlightWinningCells(condition);
                return true;
            }
            return false;
        });
    }
    
    highlightWinningCells(condition) {
        condition.forEach(index => {
            document.querySelector(`[data-index="${index}"]`).classList.add('winning');
        });
    }
    
    checkDraw() {
        return this.board.every(cell => cell !== '');
    }
    
    endGame(result) {
        this.gameActive = false;
        
        if (result === 'draw') {
            this.scores.draws++;
            this.showModal('It\'s a Draw!', '🤝');
        } else {
            this.scores[result]++;
            const winner = result === 'X' ? 'X' : (this.gameMode === 'ai' ? 'AI' : 'O');
            this.showModal(`${winner} Wins!`, result === 'X' ? '🎉' : '🤖');
        }
        
        this.updateScores();
        this.saveScores();
    }
    
    showModal(text, emoji) {
        document.getElementById('winner-text').textContent = text;
        document.querySelector('.celebration').textContent = emoji;
        document.getElementById('winner-modal').classList.add('show');
    }
    
    closeModal() {
        document.getElementById('winner-modal').classList.remove('show');
    }
    
    playAgain() {
        this.closeModal();
        this.resetGame();
    }
    
    resetGame() {
        this.board = ['', '', '', '', '', '', '', '', ''];
        this.currentPlayer = 'X';
        this.gameActive = true;
        
        document.querySelectorAll('.cell').forEach(cell => {
            cell.textContent = '';
            cell.className = 'cell';
            cell.style.animation = '';
            cell.style.background = '';
        });
        
        document.querySelector('.game-board').classList.remove('disabled');
        document.querySelector('.game-info').classList.remove('ai-thinking');
        
        this.updateDisplay();
    }
    
    resetScores() {
        this.scores = { X: 0, O: 0, draws: 0 };
        this.updateScores();
        this.saveScores();
    }
    
    switchPlayer() {
        this.currentPlayer = this.currentPlayer === 'X' ? 'O' : 'X';
        this.updateDisplay();
    }
    
    updateDisplay() {
        const playerText = this.currentPlayer === 'X' ? 'X\'s Turn' : 
                          (this.gameMode === 'ai' && this.currentPlayer === 'O') ? 'Bot\'s Turn' : 'O\'s Turn';
        document.getElementById('current-player-text').textContent = playerText;
    }
    
    updateScores() {
        document.getElementById('score-x').textContent = this.scores.X;
        document.getElementById('score-o').textContent = this.scores.O;
        document.getElementById('score-draw').textContent = this.scores.draws;
    }
    
    changeGameMode(mode) {
        this.gameMode = mode;
        this.resetGame();
    }
    
    saveScores() {
        localStorage.setItem('xo-scores', JSON.stringify(this.scores));
    }
    
    loadScores() {
        const saved = localStorage.getItem('xo-scores');
        if (saved) {
            this.scores = JSON.parse(saved);
            this.updateScores();
        }
    }
}

class GameEffects {
    static addClickEffect(element) {
        element.addEventListener('click', function(e) {
            const ripple = document.createElement('div');
            ripple.style.cssText = `
                position: absolute;
                border-radius: 50%;
                background: rgba(255, 255, 255, 0.6);
                transform: scale(0);
                animation: ripple 0.6s linear;
                pointer-events: none;
            `;
            
            const rect = this.getBoundingClientRect();
            const size = Math.max(rect.width, rect.height);
            ripple.style.width = ripple.style.height = size + 'px';
            ripple.style.left = (e.clientX - rect.left - size / 2) + 'px';
            ripple.style.top = (e.clientY - rect.top - size / 2) + 'px';
            
            this.style.position = 'relative';
            this.appendChild(ripple);
            
            setTimeout(() => ripple.remove(), 600);
        });
    }
    
    static addHoverEffect() {
        document.querySelectorAll('.cell').forEach(cell => {
            cell.addEventListener('mouseenter', function() {
                if (!this.textContent) {
                    this.style.background = 'linear-gradient(135deg, #eee, #eff)';
                }
            });
            
            cell.addEventListener('mouseleave', function() {
                if (!this.textContent) {
                    this.style.background = '#333';
                }
            });
        });
    }
    
    static addParticleEffect() {
        const container = document.querySelector('.container');
        
        for (let i = 0; i < 20; i++) {
            const particle = document.createElement('div');
            particle.className = 'particle';
            particle.style.cssText = `
                position: fixed;
                width: 4px;
                height: 4px;
                background: rgba(255, 255, 255, 0.3);
                border-radius: 50%;
                pointer-events: none;
                z-index: -1;
                left: ${Math.random() * 100}vw;
                top: ${Math.random() * 100}vh;
                animation: float ${3 + Math.random() * 4}s ease-in-out infinite;
                animation-delay: ${Math.random() * 2}s;
            `;
            
            document.body.appendChild(particle);
        }
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const game = new TicTacToe();
    
    GameEffects.addHoverEffect();
    GameEffects.addParticleEffect();
    
    document.querySelectorAll('.btn').forEach(btn => {
        GameEffects.addClickEffect(btn);
    });
    
    setTimeout(() => {
        console.log('🎮 XO Game loaded successfully!');
        console.log('💡 Try playing against the AI for a challenge!');
    }, 1000);
});

const style = document.createElement('style');
style.textContent = `
    @keyframes ripple {
        to {
            transform: scale(4);
            opacity: 0;
        }
    }
    
    @keyframes float {
        0%, 100% { transform: translateY(0px) rotate(0deg); }
        33% { transform: translateY(-20px) rotate(120deg); }
        66% { transform: translateY(10px) rotate(240deg); }
    }
`;
document.head.appendChild(style);
