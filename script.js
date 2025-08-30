
        class SlidingPuzzle {
            constructor() {
                this.puzzle = document.getElementById('puzzle');
                this.movesDisplay = document.getElementById('movesnum');
                this.newGameBtn = document.getElementById('newgame');
                this.solveBtn = document.getElementById('solveit');
                this.successMessage = document.getElementById('successMessage');
                this.trackingBody = document.getElementById('trackingBody');
                this.solutionBody = document.getElementById('solutionBody');
                this.movableTilesDisplay = document.getElementById('movableTiles');
                this.solutionStepsDisplay = document.getElementById('solutionSteps');
                
                this.moves = 0;
                this.tiles = [];
                this.emptyIndex = 6; // Position of empty tile (0-8)
                this.goalState = [1, 2, 3, 4, 5, 6, 7, 8, 0];
                this.isSolving = false;
                this.previousState = null;
                this.fixedInitialState = [1, 2, 3, 7, 4, 6, 0, 5, 8]; // Fixed initial state from image
                
                this.init();
            }

            init() {
                this.createTiles();
                this.addEventListeners();
                this.newGame();
            }

            createTiles() {
                // Clear existing tiles
                this.puzzle.innerHTML = '';
                this.tiles = [];

                // Create 9 tiles (8 numbered + 1 empty)
                for (let i = 0; i < 9; i++) {
                    const tile = document.createElement('li');
                    if (i < 8) {
                        tile.className = `Tile Tile${i + 1}`;
                        tile.textContent = i + 1;
                        tile.dataset.value = i + 1;
                    } else {
                        tile.className = 'EmptyTile';
                        tile.dataset.value = 0;
                    }
                    tile.dataset.index = i;
                    this.puzzle.appendChild(tile);
                    this.tiles.push(tile);
                }
            }

            addEventListeners() {
                this.puzzle.addEventListener('click', (e) => {
                    if (e.target.classList.contains('Tile') && !this.isSolving) {
                        this.handleTileClick(parseInt(e.target.dataset.index));
                    }
                });

                this.newGameBtn.addEventListener('click', () => {
                    this.newGame();
                });

                this.solveBtn.addEventListener('click', () => {
                    this.solveGame();
                });
            }

            getCurrentState() {
                return this.tiles.map(tile => parseInt(tile.dataset.value));
            }

            setState(state) {
                for (let i = 0; i < 9; i++) {
                    const value = state[i];
                    this.tiles[i].dataset.value = value;
                    
                    if (value === 0) {
                        this.tiles[i].className = 'EmptyTile';
                        this.tiles[i].textContent = '';
                        this.emptyIndex = i;
                    } else {
                        this.tiles[i].className = `Tile Tile${value}`;
                        this.tiles[i].textContent = value;
                    }
                }
                this.updateMovableTiles();
            }

            updateMovableTiles() {
                // Remove movable class from all tiles
                this.tiles.forEach(tile => tile.classList.remove('movable'));
                
                // Add movable class to tiles adjacent to empty space
                const adjacentIndices = this.getAdjacentIndices(this.emptyIndex);
                const movableTileNumbers = [];
                
                adjacentIndices.forEach(index => {
                    if (this.tiles[index].dataset.value !== '0') {
                        this.tiles[index].classList.add('movable');
                        movableTileNumbers.push(this.tiles[index].dataset.value);
                    }
                });
                
                // Update movable tiles display
                if (this.movableTilesDisplay) {
                    this.movableTilesDisplay.textContent = movableTileNumbers.join(', ');
                }
            }

            getAdjacentIndices(index) {
                const row = Math.floor(index / 3);
                const col = index % 3;
                const adjacent = [];

                // Up
                if (row > 0) adjacent.push(index - 3);
                // Down
                if (row < 2) adjacent.push(index + 3);
                // Left
                if (col > 0) adjacent.push(index - 1);
                // Right
                if (col < 2) adjacent.push(index + 1);

                return adjacent;
            }

            handleTileClick(clickedIndex) {
                const adjacentIndices = this.getAdjacentIndices(this.emptyIndex);
                
                if (adjacentIndices.includes(clickedIndex)) {
                    this.moveTile(clickedIndex);
                }
            }

            moveTile(tileIndex) {
                // Store previous state for tracking
                const previousState = this.getCurrentState();
                
                // Swap tile with empty space
                const currentState = this.getCurrentState();
                [currentState[tileIndex], currentState[this.emptyIndex]] = 
                [currentState[this.emptyIndex], currentState[tileIndex]];
                
                this.setState(currentState);
                this.moves++;
                this.movesDisplay.textContent = this.moves;
                
                // Add to tracking table
                this.addToTrackingTable(previousState, currentState, tileIndex);
                
                // Check if puzzle is solved
                if (this.isSolved()) {
                    this.showSuccess();
                    this.addGoalReachedRow();
                }
            }

            isSolved() {
                const currentState = this.getCurrentState();
                return JSON.stringify(currentState) === JSON.stringify(this.goalState);
            }

            showSuccess() {
                this.successMessage.classList.add('show');
                setTimeout(() => {
                    this.successMessage.classList.remove('show');
                }, 3000);
            }

            // Generate a solvable random state
            generateSolvableState() {
                let state = [...this.goalState];
                
                // Perform 1000 random valid moves to ensure solvability
                let emptyPos = 8;
                for (let i = 0; i < 1000; i++) {
                    const adjacent = this.getAdjacentIndices(emptyPos);
                    const randomAdjacent = adjacent[Math.floor(Math.random() * adjacent.length)];
                    
                    // Swap empty with random adjacent tile
                    [state[emptyPos], state[randomAdjacent]] = [state[randomAdjacent], state[emptyPos]];
                    emptyPos = randomAdjacent;
                }
                
                return state;
            }

            newGame() {
                this.isSolving = false;
                this.moves = 0;
                this.movesDisplay.textContent = '0';
                this.successMessage.classList.remove('show');
                this.clearTrackingTable();
                this.clearSolutionTable();
                
                // Set fixed initial state from image
                this.setState(this.fixedInitialState);
                
                // Add initial state to tracking table
                this.addInitialStateToTable(this.fixedInitialState);
                
                // Reset solution display
                if (this.solutionStepsDisplay) {
                    this.solutionStepsDisplay.textContent = 'Klik tombol "Solve It!" untuk menampilkan langkah-langkah solusi optimal menggunakan algoritma A* Search';
                }
            }

            clearSolutionTable() {
                if (this.solutionBody) {
                    this.solutionBody.innerHTML = `
                        <tr>
                            <td colspan="3" style="text-align: center; padding: 20px; color: #666;">
                                Klik "Solve It!" untuk menampilkan solusi optimal
                            </td>
                        </tr>
                    `;
                }
            }

            clearTrackingTable() {
                this.trackingBody.innerHTML = '';
            }

            addInitialStateToTable(initialState) {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td class="state-display">${this.formatState(initialState)}</td>
                    <td class="state-display">${this.formatState(this.goalState)}</td>
                    <td class="rule-display">START</td>
                `;
                this.trackingBody.appendChild(row);
            }

            addToTrackingTable(previousState, currentState, movedTileIndex) {
                const movedTileValue = previousState[movedTileIndex];
                
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td class="state-display">${this.formatState(previousState)}</td>
                    <td class="state-display">${this.formatState(this.goalState)}</td>
                    <td class="rule-display">${movedTileValue}</td>
                `;
                this.trackingBody.appendChild(row);
                
                // Auto-scroll to bottom
                const tableContainer = document.querySelector('.tracking-table');
                tableContainer.scrollTop = tableContainer.scrollHeight;
            }

            addGoalReachedRow() {
                const row = document.createElement('tr');
                row.className = 'goal-reached';
                row.innerHTML = `
                    <td class="state-display">${this.formatState(this.goalState)}</td>
                    <td class="state-display">${this.formatState(this.goalState)}</td>
                    <td class="rule-display">GOAL!</td>
                `;
                this.trackingBody.appendChild(row);
                
                // Auto-scroll to bottom
                const tableContainer = document.querySelector('.tracking-table');
                tableContainer.scrollTop = tableContainer.scrollHeight;
            }

            formatState(state) {
                // Convert array to display format like (1,0,1,0)
                return `(${state.join(',')})`;
            }

            // Simple solving algorithm using A* search
            solveGame() {
                if (this.isSolved()) return;
                
                this.isSolving = true;
                const solution = this.findSolution();
                
                if (solution) {
                    // Display solution steps
                    this.displaySolutionSteps(solution);
                    this.animateSolution(solution);
                } else {
                    this.isSolving = false;
                    alert('Could not find solution!');
                }
            }

            displaySolutionSteps(solution) {
                let currentState = [...this.getCurrentState()];
                let stepsText = `Solusi Optimal (${solution.length} langkah):\n\n`;
                
                stepsText += `Langkah 0 (Initial): ${this.formatState(currentState)}\n`;
                
                // Clear solution table
                this.solutionBody.innerHTML = '';
                
                // Add initial state to solution table
                this.addSolutionRow(this.formatState(currentState), this.formatState(currentState), 'START');
                
                for (let i = 0; i < solution.length; i++) {
                    const tileIndex = solution[i];
                    const emptyPos = currentState.indexOf(0);
                    const movedTile = currentState[tileIndex];
                    const previousState = [...currentState];
                    
                    // Perform the move
                    [currentState[tileIndex], currentState[emptyPos]] = 
                    [currentState[emptyPos], currentState[tileIndex]];
                    
                    stepsText += `Langkah ${i + 1}: Pindahkan tile ${movedTile} → ${this.formatState(currentState)}\n`;
                    
                    // Add to solution table
                    this.addSolutionRow(
                        this.formatState(previousState), 
                        this.formatState(currentState), 
                        `Pindahkan tile ${movedTile}`
                    );
                }
                
                // Add final row
                if (JSON.stringify(currentState) === JSON.stringify(this.goalState)) {
                    this.addSolutionRow(
                        this.formatState(currentState), 
                        this.formatState(this.goalState), 
                        'SOLUSI TERCAPAI',
                        true
                    );
                }
                
                this.solutionStepsDisplay.textContent = stepsText;
            }

            addSolutionRow(stateBefore, stateAfter, rule, isGoal = false) {
                const row = document.createElement('tr');
                if (isGoal) {
                    row.className = 'goal-reached';
                }
                row.innerHTML = `
                    <td class="state-display">${stateBefore}</td>
                    <td class="state-display">${stateAfter}</td>
                    <td class="rule-display">${rule}</td>
                `;
                this.solutionBody.appendChild(row);
            }

            findSolution() {
                const start = this.getCurrentState();
                const goal = this.goalState;
                
                if (JSON.stringify(start) === JSON.stringify(goal)) return [];
                
                const openSet = [{state: start, path: [], cost: 0, heuristic: this.calculateHeuristic(start)}];
                const closedSet = new Set();
                
                while (openSet.length > 0) {
                    // Sort by f-score (cost + heuristic)
                    openSet.sort((a, b) => (a.cost + a.heuristic) - (b.cost + b.heuristic));
                    const current = openSet.shift();
                    
                    const stateStr = JSON.stringify(current.state);
                    if (closedSet.has(stateStr)) continue;
                    closedSet.add(stateStr);
                    
                    if (JSON.stringify(current.state) === JSON.stringify(goal)) {
                        return current.path;
                    }
                    
                    // Limit search depth to prevent infinite loops
                    if (current.path.length > 50) continue;
                    
                    const emptyPos = current.state.indexOf(0);
                    const adjacent = this.getAdjacentIndices(emptyPos);
                    
                    for (const adjIndex of adjacent) {
                        const newState = [...current.state];
                        [newState[emptyPos], newState[adjIndex]] = [newState[adjIndex], newState[emptyPos]];
                        
                        const newStateStr = JSON.stringify(newState);
                        if (!closedSet.has(newStateStr)) {
                            openSet.push({
                                state: newState,
                                path: [...current.path, adjIndex],
                                cost: current.cost + 1,
                                heuristic: this.calculateHeuristic(newState)
                            });
                        }
                    }
                }
                
                return null; // No solution found
            }

            calculateHeuristic(state) {
                let distance = 0;
                for (let i = 0; i < 9; i++) {
                    const value = state[i];
                    if (value !== 0) {
                        const goalIndex = value - 1;
                        const currentRow = Math.floor(i / 3);
                        const currentCol = i % 3;
                        const goalRow = Math.floor(goalIndex / 3);
                        const goalCol = goalIndex % 3;
                        
                        distance += Math.abs(currentRow - goalRow) + Math.abs(currentCol - goalCol);
                    }
                }
                return distance;
            }

            animateSolution(solution) {
                let step = 0;
                
                const animate = () => {
                    if (step < solution.length) {
                        const tileIndex = solution[step];
                        this.moveTile(tileIndex);
                        step++;
                        setTimeout(animate, 500);
                    } else {
                        this.isSolving = false;
                    }
                };
                
                animate();
            }
        }

        // Initialize the game when DOM is loaded
        document.addEventListener('DOMContentLoaded', () => {
            new SlidingPuzzle();
        });