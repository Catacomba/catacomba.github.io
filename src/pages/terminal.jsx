import { useState, useEffect, useRef } from 'react';

const Terminal = () => {
    const [input, setInput] = useState('');
    const [history, setHistory] = useState([]);
    const [commandHistory, setCommandHistory] = useState([]);
    const [historyIndex, setHistoryIndex] = useState(-1);
    const inputRef = useRef(null);
    const terminalRef = useRef(null);

    // Command configurations - easily customizable
    const commands = {
        books: {
            description: 'Display recommended books',
            output: [
                '┌─────────────────────────────────────────┐',
                '│              📚 BOOK.DB                 │',
                '├─────────────────────────────────────────┤',
                '│ [TECH] The Pragmatic Programmer         │',
                '│ [CODE] Clean Code - R.C. Martin         │',
                '│ [LIFE] Atomic Habits - James Clear      │',
                '│ [PSYC] Psychology of Prog - Weinberg    │',
                '│ [SYS]  Designing Data Apps - Kleppmann  │',
                '└─────────────────────────────────────────┘',
                '',
                '➤ books --fiction for fiction recs',
                ''
            ]
        },
        'books --fiction': {
            description: 'Display fiction book recommendations',
            output: [
                '┌─────────────────────────────────────────┐',
                '│            📖 FICTION.DB               │',
                '├─────────────────────────────────────────┤',
                '│ [SCI-FI] Left Hand of Darkness - LeGuin│',
                '│ [CYBER]  Neuromancer - William Gibson   │',
                '│ [DYSTO]  The Handmaid\'s Tale - Atwood   │',
                '│ [CLASS]  1984 - George Orwell          │',
                '│ [SPACE]  Dune - Frank Herbert          │',
                '└─────────────────────────────────────────┘',
                ''
            ]
        },
        'shower thoughts': {
            description: 'Random shower thoughts',
            output: [
                '╔══════════════════════════════════════════╗',
                '║         🧠 MIND.DUMP() EXECUTED         ║',
                '╚══════════════════════════════════════════╝',
                '',
                '→ Replace "W" with "T": What→That, Where→There, When→Then',
                '→ The word "bed" looks like a bed 🛏️',
                '→ Your age = Earth orbits around Sun',
                '→ We\'re closer to T-Rex than T-Rex to Stegosaurus',
                '→ Fire isn\'t ON things, things are IN fire',
                '→ Every odd number has the letter "e" in it',
                '',
                '[Process completed with exit code: enlightenment]',
                ''
            ]
        },
        quotes: {
            description: 'Inspirational quotes',
            output: [
                '╭─────────────────────────────────────────╮',
                '│           💭 WISDOM.SH LOADED           │',
                '╰─────────────────────────────────────────╯',
                '',
                '» "The only way to do great work is to love what you do."',
                '  └─ Steve Jobs',
                '',
                '» "In the middle of difficulty lies opportunity."',
                '  └─ Albert Einstein',
                '',
                '» "Life is what happens while you\'re making other plans."',
                '  └─ John Lennon',
                '',
                '» "The future belongs to those who believe in their dreams."',
                '  └─ Eleanor Roosevelt',
                '',
                '[Inspiration buffer loaded successfully]',
                ''
            ]
        },
        neofetch: {
            description: 'System information',
            output: [
                '                   -`                    user@terminal',
                '                  .o+`                   ──────────────',
                '                 `ooo/                   OS: Arch Linux x86_64',
                '                `+oooo:                  Host: Terminal Interface',
                '               `+oooooo:                 Kernel: 6.1.0-terminal',
                '               -+oooooo+:                Uptime: ∞',
                '             `/:-:++oooo+:               Packages: ∞ (pacman)',
                '            `/++++/+++++++:              Shell: zsh 5.9',
                '           `/++++++++++++++:             Resolution: Responsive',
                '          `/+++ooooooooo+++/             Terminal: st',
                '         ./ooosssso++osssssso+`          CPU: JavaScript Engine',
                '        .oossssso-````/ossssss+`         Memory: React State',
                '       -osssssso.      :ssssssso.             ',
                '      :osssssss/        osssso+++.       ████████████████████████',
                '     /ossssssss/        +ssssooo/-       ████████████████████████',
                '   `/ossssso+/:-        -:/+osssso+-     ████████████████████████',
                '  `+sso+:-`                 `.-/+oso:    ████████████████████████',
                ' `++:.                           `-/+/   ████████████████████████',
                ' .`                                 `/   ████████████████████████',
                ''
            ]
        },
        help: {
            description: 'Show available commands',
            output: [
                '╔══════════════════════════════════════════╗',
                '║              COMMAND INDEX               ║',
                '╠══════════════════════════════════════════╣',
                '║ books          │ Literary database       ║',
                '║ books --fiction │ Fiction archive        ║',
                '║ shower thoughts │ Random.exe output      ║',
                '║ quotes         │ Wisdom buffer          ║',
                '║ neofetch       │ System information     ║',
                '║ clear          │ Clear terminal         ║',
                '║ help           │ This menu              ║',
                '╚══════════════════════════════════════════╝',
                '',
                '⚡ Pro tip: Use ↑/↓ to navigate command history',
                '🔥 Arch Linux vibes activated',
                ''
            ]
        },
        clear: {
            description: 'Clear terminal',
            output: []
        }
    };

    useEffect(() => {
        if (inputRef.current) {
            inputRef.current.focus();
        }
    }, []);

    useEffect(() => {
        if (terminalRef.current) {
            terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
        }
    }, [history]);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!input.trim()) return;

        const command = input.trim().toLowerCase();
        const newEntry = { command: input, output: [] };

        // Add to command history
        setCommandHistory(prev => [...prev, input]);
        setHistoryIndex(-1);

        if (command === 'clear') {
            setHistory([]);
            setInput('');
            return;
        }

        if (commands[command]) {
            if (command === 'clear') {
                setHistory([]);
            } else {
                newEntry.output = commands[command].output;
                setHistory(prev => [...prev, newEntry]);
            }
        } else {
            newEntry.output = [
                `zsh: command not found: ${input}`,
                '',
                '🔍 Did you mean one of these?',
                '   • help (show available commands)',
                '   • neofetch (system info)',
                '   • books (reading list)',
                ''
            ];
            setHistory(prev => [...prev, newEntry]);
        }

        setInput('');
    };

    const handleKeyDown = (e) => {
        if (e.key === 'ArrowUp') {
            e.preventDefault();
            if (commandHistory.length > 0) {
                const newIndex = historyIndex === -1
                    ? commandHistory.length - 1
                    : Math.max(0, historyIndex - 1);
                setHistoryIndex(newIndex);
                setInput(commandHistory[newIndex] || '');
            }
        } else if (e.key === 'ArrowDown') {
            e.preventDefault();
            if (historyIndex >= 0) {
                const newIndex = historyIndex + 1;
                if (newIndex >= commandHistory.length) {
                    setHistoryIndex(-1);
                    setInput('');
                } else {
                    setHistoryIndex(newIndex);
                    setInput(commandHistory[newIndex] || '');
                }
            }
        }
    };

    const handleTerminalClick = () => {
        if (inputRef.current) {
            inputRef.current.focus();
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-800 p-4 font-mono">
            <div className="max-w-5xl mx-auto">
                {/* Terminal Window */}
                <div className="bg-black rounded-none shadow-2xl border-2 border-cyan-500/30 overflow-hidden backdrop-blur-sm">
                    {/* Terminal Header - Linux style */}
                    <div className="flex items-center justify-between bg-gradient-to-r from-gray-800 to-gray-700 px-4 py-2 border-b border-cyan-500/50">
                        <div className="flex items-center space-x-3">
                            <div className="text-cyan-400 text-sm">●</div>
                            <span className="text-cyan-300 text-sm font-bold">Kevin's terminal</span>
                        </div>
                        <div className="text-gray-300 text-xs">
                            kevin@public:~
                        </div>
                        <div className="flex space-x-1">
                            <div className="w-4 h-4 bg-yellow-500 rounded-full opacity-80"></div>
                            <div className="w-4 h-4 bg-red-500 rounded-full opacity-80"></div>
                        </div>
                    </div>

                    {/* Terminal Content */}
                    <div
                        ref={terminalRef}
                        className="bg-black text-cyan-400 font-mono text-sm p-4 h-[600px] overflow-y-auto cursor-text relative"
                        onClick={handleTerminalClick}
                        style={{
                            backgroundImage: `radial-gradient(circle at 25% 25%, rgba(6, 182, 212, 0.03) 0%, transparent 50%), 
                               radial-gradient(circle at 75% 75%, rgba(6, 182, 212, 0.03) 0%, transparent 50%)`
                        }}
                    >
                        {/* Scanlines effect */}
                        <div className="absolute inset-0 pointer-events-none opacity-5">
                            <div className="h-full w-full bg-gradient-to-b from-transparent via-cyan-500 to-transparent bg-repeat"
                                style={{ backgroundSize: '100% 4px' }}></div>
                        </div>

                        {/* Welcome Message */}
                        {history.length === 0 && (
                            <div className="mb-4 relative z-10">
                                <div className="text-cyan-300 font-bold">╔═══════════════════════════════════════╗</div>
                                <div className="text-cyan-300 font-bold whitespace-pre">║     🏴‍☠️ ARCH TERMINAL INTERFACE        ║</div>
                                <div className="text-cyan-300 font-bold">╚═══════════════════════════════════════╝</div>
                                <div className="text-gray-400 mt-2">Last login: {new Date().toLocaleString()}</div>
                                <div className="text-yellow-400 mt-1">⚡ Type "help" to see available commands</div>
                                <div className="text-yellow-400">🔥 Type "neofetch" for system info</div>
                                <div className="text-gray-500 mb-2">💀 Welcome to the matrix, user</div>
                            </div>
                        )}

                        {/* Command History */}
                        <div className="relative z-10">
                            {history.map((entry, index) => (
                                <div key={index} className="mb-2">
                                    <div className="flex items-center">
                                        <span className="text-green-400 font-bold">┌─[</span>
                                        <span className="text-cyan-300 font-bold">user</span>
                                        <span className="text-white">@</span>
                                        <span className="text-purple-400 font-bold">arch</span>
                                        <span className="text-green-400 font-bold">]─[</span>
                                        <span className="text-yellow-400">~</span>
                                        <span className="text-green-400 font-bold">]</span>
                                    </div>
                                    <div className="flex items-center mb-1">
                                        <span className="text-green-400 font-bold">└─</span>
                                        <span className="text-red-400">$</span>
                                        <span className="ml-2 text-white">{entry.command}</span>
                                    </div>
                                    {entry.output.map((line, lineIndex) => (
                                        <pre key={lineIndex} className="text-cyan-400 ml-0 leading-relaxed text-left">
                                            {line}
                                        </pre>
                                    ))}
                                </div>
                            ))}

                            {/* Current Input Line */}
                            <div>
                                <div className="flex items-center">
                                    <span className="text-green-400 font-bold">┌─[</span>
                                    <span className="text-cyan-300 font-bold">user</span>
                                    <span className="text-white">@</span>
                                    <span className="text-purple-400 font-bold">arch</span>
                                    <span className="text-green-400 font-bold">]─[</span>
                                    <span className="text-yellow-400">~</span>
                                    <span className="text-green-400 font-bold">]</span>
                                </div>
                                <div className="flex items-center">
                                    <span className="text-green-400 font-bold">└─</span>
                                    <span className="text-red-400">$</span>
                                    <input
                                        ref={inputRef}
                                        type="text"
                                        value={input}
                                        onChange={(e) => setInput(e.target.value)}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter') {
                                                handleSubmit(e);
                                            } else {
                                                handleKeyDown(e);
                                            }
                                        }}
                                        className="ml-2 bg-transparent text-white outline-none flex-1 font-mono caret-cyan-400"
                                        placeholder="Enter command..."
                                        autoComplete="off"
                                    />
                                    <span className="text-cyan-400 animate-pulse text-lg">▊</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Status Bar */}
                <div className="mt-4 bg-gray-800 border border-cyan-500/30 rounded-none p-3">
                    <div className="flex justify-between items-center text-sm">
                        <div className="flex space-x-4">
                            <span className="text-cyan-400">🏴‍☠️ Arch Linux Terminal</span>
                            <span className="text-green-400">● Online</span>
                            <span className="text-yellow-400">⚡ Commands: {Object.keys(commands).length}</span>
                        </div>
                        <div className="text-gray-400">
                            Press Ctrl+C to exit | Use ↑↓ for history
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Terminal;