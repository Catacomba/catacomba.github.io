import React, { useState, useEffect, useRef } from 'react';

const App = () => {
    // State for the sudoku board
    const [board, setBoard] = useState(Array(9).fill().map(() => Array(9).fill(0)));
    const [solution, setSolution] = useState(Array(9).fill().map(() => Array(9).fill(0)));
    const [initial, setInitial] = useState(Array(9).fill().map(() => Array(9).fill(false)));
    const [selectedCell, setSelectedCell] = useState(null);
    const [isComplete, setIsComplete] = useState(false);
    const [difficulty, setDifficulty] = useState('medium');
    const [cellStates, setCellStates] = useState(Array(9).fill().map(() => Array(9).fill('neutral')));
    const [showValidation, setShowValidation] = useState(true);
    const [animations, setAnimations] = useState(Array(9).fill().map(() => Array(9).fill({ x: 0, y: 0 })));
    const animationFrameRef = useRef(null);
    
    // Animation control sliders
    const [animationSpeed, setAnimationSpeed] = useState(50); // 0-100 scale
    const [animationDistance, setAnimationDistance] = useState(50); // 0-100 scale
  
    // Calculate actual values from slider settings
    const getAnimationSpeedFactor = () => animationSpeed / 100 * 0.2; // Max 0.2 (20% movement per frame)
    const getAnimationDistanceFactor = () => animationDistance / 100 * 10; // Max 10px displacement
  
    // Generate a valid Sudoku board
    const generateSudoku = (difficulty) => {
      // Reset states
      setIsComplete(false);
      setSelectedCell(null);
      setCellStates(Array(9).fill().map(() => Array(9).fill('neutral')));
      
      // Create a solved board
      const solvedBoard = Array(9).fill().map(() => Array(9).fill(0));
      solveSudoku(solvedBoard);
      setSolution([...solvedBoard.map(row => [...row])]);
      
      // Create a puzzle by removing numbers
      const puzzle = solvedBoard.map(row => [...row]);
      const initialCells = Array(9).fill().map(() => Array(9).fill(true));
      
      // Remove cells based on difficulty
      let cellsToRemove;
      switch(difficulty) {
        case 'easy':
          cellsToRemove = 30;
          break;
        case 'medium':
          cellsToRemove = 40;
          break;
        case 'hard':
          cellsToRemove = 50;
          break;
        default:
          cellsToRemove = 40;
      }
      
      let removed = 0;
      while (removed < cellsToRemove) {
        const row = Math.floor(Math.random() * 9);
        const col = Math.floor(Math.random() * 9);
        
        if (puzzle[row][col] !== 0) {
          puzzle[row][col] = 0;
          initialCells[row][col] = false;
          removed++;
        }
      }
      
      setBoard(puzzle);
      setInitial(initialCells);
      
      // Reset animations
      setAnimations(Array(9).fill().map(() => Array(9).fill({ x: 0, y: 0 })));
    };
  
    // Check if the current board is valid and complete
    const checkCompletion = () => {
      // Check if board is filled
      for (let row = 0; row < 9; row++) {
        for (let col = 0; col < 9; col++) {
          if (board[row][col] === 0) return false;
        }
      }
      
      // Check if board matches solution
      for (let row = 0; row < 9; row++) {
        for (let col = 0; col < 9; col++) {
          if (board[row][col] !== solution[row][col]) return false;
        }
      }
      
      return true;
    };
  
    // Solve sudoku using backtracking
    const solveSudoku = (board) => {
      for (let row = 0; row < 9; row++) {
        for (let col = 0; col < 9; col++) {
          if (board[row][col] === 0) {
            // Try digits 1-9
            const shuffledDigits = shuffleArray([1, 2, 3, 4, 5, 6, 7, 8, 9]);
            for (const num of shuffledDigits) {
              if (isValid(board, row, col, num)) {
                board[row][col] = num;
                
                if (solveSudoku(board)) {
                  return true;
                }
                
                board[row][col] = 0;
              }
            }
            return false;
          }
        }
      }
      return true;
    };
  
    // Shuffle array helper
    const shuffleArray = (array) => {
      for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
      }
      return array;
    };
  
    // Check if placing a number is valid
    const isValid = (board, row, col, num) => {
      // Check row
      for (let x = 0; x < 9; x++) {
        if (board[row][x] === num) return false;
      }
      
      // Check column
      for (let x = 0; x < 9; x++) {
        if (board[x][col] === num) return false;
      }
      
      // Check 3x3 box
      const boxRow = Math.floor(row / 3) * 3;
      const boxCol = Math.floor(col / 3) * 3;
      
      for (let r = 0; r < 3; r++) {
        for (let c = 0; c < 3; c++) {
          if (board[boxRow + r][boxCol + c] === num) return false;
        }
      }
      
      return true;
    };
  
    // Handle cell clicks
    const handleCellClick = (row, col) => {
      if (!initial[row][col] && !isComplete) {
        setSelectedCell({ row, col });
      }
    };
  
    // Check if the number matches the solution
    const validateMove = (row, col, num) => {
      if (num === 0) return 'neutral';
      return num === solution[row][col] ? 'correct' : 'incorrect';  
    };
  
    // Handle number input
    const handleNumberInput = (num) => {
      if (selectedCell && !initial[selectedCell.row][selectedCell.col] && !isComplete) {
        const { row, col } = selectedCell;
        
        // Update the board
        const newBoard = [...board];
        newBoard[row][col] = num;
        setBoard(newBoard);
        
        // Update cell validation state
        if (showValidation) {
          const newCellStates = [...cellStates];
          newCellStates[row][col] = validateMove(row, col, num);
          setCellStates(newCellStates);
        }
        
        // Check for completion
        const completion = checkCompletion();
        if (completion) {
          setIsComplete(true);
        }
      }
    };
  
    // Handle difficulty change
    const handleDifficultyChange = (event) => {
      setDifficulty(event.target.value);
    };
  
    // Toggle validation
    const toggleValidation = () => {
      setShowValidation(!showValidation);
      
      // Reset cell states if turning off validation
      if (showValidation) {
        setCellStates(Array(9).fill().map(() => Array(9).fill('neutral')));
      } else {
        // Update all cells when turning validation back on
        const newCellStates = Array(9).fill().map(() => Array(9).fill('neutral'));
        for (let row = 0; row < 9; row++) {
          for (let col = 0; col < 9; col++) {
            if (!initial[row][col] && board[row][col] !== 0) {
              newCellStates[row][col] = validateMove(row, col, board[row][col]);
            }
          }
        }
        setCellStates(newCellStates);
      }
    };
  
    // Animation function
    const animateNumbers = () => {
      const distanceFactor = getAnimationDistanceFactor();
      const speedFactor = getAnimationSpeedFactor();
      
      const newAnimations = Array(9).fill().map(() => Array(9).fill(null));
      
      for (let row = 0; row < 9; row++) {
        for (let col = 0; col < 9; col++) {
          if (board[row][col] !== 0) {
            // Get current position
            const current = animations[row][col];
            
            // Calculate new target position with some randomness
            // Scale based on distance slider
            const targetX = (Math.random() - 0.5) * 2 * distanceFactor;
            const targetY = (Math.random() - 0.5) * 2 * distanceFactor;
            
            // Move slightly towards the target, speed adjusted by slider
            const newX = current.x + (targetX - current.x) * speedFactor;
            const newY = current.y + (targetY - current.y) * speedFactor;
            
            newAnimations[row][col] = { x: newX, y: newY };
          } else {
            newAnimations[row][col] = { x: 0, y: 0 };
          }
        }
      }
      
      setAnimations(newAnimations);
      animationFrameRef.current = requestAnimationFrame(animateNumbers);
    };
  
    // Generate initial sudoku
    useEffect(() => {
      generateSudoku(difficulty);
      return () => {
        if (animationFrameRef.current) {
          cancelAnimationFrame(animationFrameRef.current);
        }
      };
    }, []);
  
    // Start animation loop
    useEffect(() => {
      animationFrameRef.current = requestAnimationFrame(animateNumbers);
      
      return () => {
        if (animationFrameRef.current) {
          cancelAnimationFrame(animationFrameRef.current);
        }
      };
    }, [animations, animationSpeed, animationDistance]);
  
    // Handle animation speed slider change
    const handleSpeedChange = (e) => {
      setAnimationSpeed(parseInt(e.target.value));
    };
  
    // Handle animation distance slider change
    const handleDistanceChange = (e) => {
      setAnimationDistance(parseInt(e.target.value));
    };
  
    // Get cell background color based on state
    const getCellBackground = (rowIndex, colIndex, baseColor) => {
      if (selectedCell && selectedCell.row === rowIndex && selectedCell.col === colIndex) {
        return 'bg-blue-200';
      }
      
      if (showValidation) {
        switch (cellStates[rowIndex][colIndex]) {
          case 'correct':
            return 'bg-green-100';
          case 'incorrect':
            return 'bg-red-100';
          default:
            return baseColor;
        }
      }
      
      return baseColor;
    };
  
    return (
      <div className="flex flex-col items-center max-w-lg mx-auto p-4 bg-gray-50 rounded-lg shadow-lg">
        <h1 className="text-2xl font-bold mb-4">Sudoku Game</h1>
        
        <div className="mb-4 flex items-center flex-wrap justify-center gap-2">
          <select 
            value={difficulty} 
            onChange={handleDifficultyChange}
            className="p-2 border rounded"
          >
            <option value="easy">Easy</option>
            <option value="medium">Medium</option>
            <option value="hard">Hard</option>
          </select>
          <button 
            onClick={() => generateSudoku(difficulty)}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            New Game
          </button>
          <button 
            onClick={toggleValidation}
            className={`px-4 py-2 rounded ${showValidation ? 'bg-green-500 text-white' : 'bg-gray-300'}`}
          >
            {showValidation ? 'Validation: ON' : 'Validation: OFF'}
          </button>
        </div>
        
        <div className="w-full mb-4 px-2">
          <div className="flex items-center mb-2">
            <span className="w-24 text-sm">Animation Speed:</span>
            <input 
              type="range" 
              min="0" 
              max="100" 
              value={animationSpeed} 
              onChange={handleSpeedChange}
              className="flex-grow mx-2"
            />
            <span className="w-8 text-center">{animationSpeed}</span>
          </div>
          <div className="flex items-center">
            <span className="w-24 text-sm">Wiggle Distance:</span>
            <input 
              type="range" 
              min="0" 
              max="100" 
              value={animationDistance} 
              onChange={handleDistanceChange}
              className="flex-grow mx-2"
            />
            <span className="w-8 text-center">{animationDistance}</span>
          </div>
        </div>
        
        <div className="grid grid-cols-9 gap-0 border-2 border-black mb-4">
          {board.map((row, rowIndex) => (
            row.map((cell, colIndex) => {
              const baseColor = (Math.floor(rowIndex/3) + Math.floor(colIndex/3)) % 2 === 0 ? 'bg-gray-100' : 'bg-white';
              const bgColor = getCellBackground(rowIndex, colIndex, baseColor);
              const animation = animations[rowIndex][colIndex];
              
              return (
                <div 
                  key={`${rowIndex}-${colIndex}`}
                  className={`w-8 h-8 flex items-center justify-center 
                    ${bgColor}
                    ${rowIndex % 3 === 2 && rowIndex !== 8 ? 'border-b border-black' : 'border-b border-gray-300'} 
                    ${colIndex % 3 === 2 && colIndex !== 8 ? 'border-r border-black' : 'border-r border-gray-300'}
                    cursor-pointer relative overflow-hidden`}
                  onClick={() => handleCellClick(rowIndex, colIndex)}
                >
                  {cell !== 0 && (
                    <span 
                      className={`${initial[rowIndex][colIndex] ? 'font-bold' : 'text-blue-600'} absolute`}
                      style={{ 
                        transform: `translate(${animation.x}px, ${animation.y}px)`,
                        transition: 'transform 0.1s ease-out'
                      }}
                    >
                      {cell}
                    </span>
                  )}
                </div>
              );
            })
          ))}
        </div>
        
        <div className="grid grid-cols-3 gap-2 mb-4">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(num => (
            <button 
              key={num}
              className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center hover:bg-gray-300"
              onClick={() => handleNumberInput(num)}
            >
              {num}
            </button>
          ))}
        </div>
        
        <button 
          className="w-10 h-10 bg-red-200 rounded-full flex items-center justify-center hover:bg-red-300 mb-4"
          onClick={() => handleNumberInput(0)}
        >
          X
        </button>
        
        {isComplete && (
          <div className="mt-4 p-2 bg-green-100 border border-green-500 rounded text-green-700">
            Congratulations! You've solved the puzzle!
          </div>
        )}
      </div>
    );
  };

export default App
