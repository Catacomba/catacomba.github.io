import React, { useState, useEffect, useRef } from 'react';
import TextLink from './textLink.jsx';

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
    switch (difficulty) {
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
      <h1 className="text-2xl font-bold mb-4 mt-4">Vibedoku</h1>

      <div className="flex flex-col items-center max-w-lg mx-auto p-4 bg-gray-50 rounded-lg shadow-lg border-2 rounded-sm">
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
              const baseColor = (Math.floor(rowIndex / 3) + Math.floor(colIndex / 3)) % 2 === 0 ? 'bg-gray-100' : 'bg-white';
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

      <ul>
        <li className="text-base font-bold mb-1 mt-4">Catacomba's sudoku experiment, "vibe coded" with claude sonet in ~20 minutes</li>
        <li className="text-base font-bold mb-1">Published on github pages in ~3 hours</li>
        <li className="text-base font-bold mb-1">The numbers are <i>vibin</i> (™)</li>
      </ul>

      <h2 className="text-1xl font-bold">My thoughts on the vibe coding 'technique' experiment</h2>
      <h2 className="text-1xl font-bold mb-4 mt-4">Pros:</h2>
      <ul class="list-disc">
        <li>
          <p> Creating the game with claude sonet was incredibly fast and easy, a true <TextLink text="vibe" link="https://claude.ai/share/6dc1c34b-f99c-406f-b2e7-53435e5de382" /></p>
        </li>
        <li>The logic of the game worked with the very first version, which is impressive but I bet there are a lot of sudoku implementations on the web already</li>
        <li>Iterating was also easy and stable (it didn't break existing stuff when I wanted to add new features)</li>
        <li>I learned a bit about react components, vite, tailwind</li>
      </ul>

      <h2 className="text-1xl font-bold mb-4 mt-4">Cons:</h2>
      <ul class="list-disc">
        <li>Claude sonet would sometimes just stop working or would work at a very slow pace (1 token per few seconds)</li>
        <li>Ran out of free requests after 4 prompts, which means that if i wanted to iterate further I would need to stop <i>vibing</i></li>
        <li>I have almost no idea how the code works (I never coded with react components before), if I handed this over to a coworker and they asked me to explain it... it wouldn't matter who begins reverse engineering it, me or them</li>
        <li>When setting up the deploy pipeline and publishing on github pages other AI chats (ChatGPT) weren't that useful... I would go from one error message to another, eventually becoming stuck in a loop</li>
        <li>Even though the code worked instantly in Cloude Sonet, it took some effort to get it to run and work locally</li>
      </ul>

      <h2 className="text-1xl font-bold mb-4 mt-4">Food for thought:</h2>
      <ul class="list-disc">
        <li className='mb-4'>
          <p className="mb-4">Reproducibility issues: The same prompts don't produce the same code.</p>
          <p className="mb-4">
            If we are to use AI as a tool and potentially evaluate people based on their "expertise" when using such tools, how do we take into account the inherent randomness of the responses of LLMs.
            If you have two programmers, who input the exact same prompts and get different results, how can you evaluate their 'expertise' with the LLM?
            Can we say that either of those programmers are better than the other? I don't think so.
          </p>

          Derek Muller (Veritasium), in his video <TextLink text="The 4 things it takes to be an expert" link={"https://www.youtube.com/watch?v=5eW6Eagr9XA"} /> explains, that for people to become experts in a field, the field needs to adhere to the following 4 requirements.

          <dl>
            <dt className='font-bold'>Many repetitions 🟢</dt>
            <dd className='pl-4'>We can, more or less, spam LLMs with various questions and requests (unless Claude says that we must wait for a day 😜)</dd>

            <dt className='font-bold'>Timely feedback 🟢</dt>
            <dd className='pl-4'>LLMs do respond quite quickly, we don't need to wait days or years to get a response 🟢</dd>

            <dt className='font-bold'>Deliberate practice 🟡</dt>
            <dd className='pl-4'>This means to be able to spend time outside of using the tool, to study the tool, environment or game... which becomes harder as the size of a LLM or neural network increases and at some point becomes a 'black box'</dd>

            <dt className='font-bold'>Valid environment 🔴</dt>
            <dd className='pl-4'>A stable environment with as little randomness as possible... As Derek says: 'there are no experts in roulette'... LLM responses are inherently <TextLink text="random" link="https://en.wikipedia.org/wiki/Hallucination_(artificial_intelligence)" /> which means that we cant really say that one can become an 'expert' in this 'field' of LLM usage.</dd>
          </dl>
        </li>
        <li className='mb-4'>I assume that similar AI tools are going to be great at quickly producing "boilerplate" code, because boilerplate is usually generated by by some program or algorithm and so It's inherently a pattern. Now the question becomes, when is a piece of code "boilerplate"? If it can reproduce a sudoku game, can we say that the logic of a sudoku game is "just boilerplate", what about the other features like the (inspired by Severance) wiggly numbers? I'm not sure I'd call a feature like that 'boilerplate', or perhaps im just not as creative as I thought I was 😅.</li>
        <li className='mb-4'>Having a LLM serve as "pattern detector" and notifying us when we are actually writing patterned code and continuing writing it for us is great. But I think that we as programmers sooner or later develop a sense of what code is patterned or can be patterned and our instincts usually lead us to <TextLink text="Don't repeat our selves" link="https://en.wikipedia.org/wiki/Don%27t_repeat_yourself"/> or create abstractions. And if it doesn't, there are probably concrete reasons preventing us from doing so.</li>
      </ul>
    </div>
  );
};

export default App