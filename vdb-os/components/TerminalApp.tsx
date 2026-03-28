import React, { useEffect, useRef, useState } from 'react';
import { Bot, User, Code, AlertTriangle, Terminal, Link } from 'lucide-react';
import { ChatMessage } from './types';
import * as Config from '../config';

interface TerminalAppProps {
    chatHistory: ChatMessage[];
    onTextQuery: (query: string) => void;
}

const TerminalApp: React.FC<TerminalAppProps> = ({ chatHistory, onTextQuery }) => {
    const endRef = useRef<HTMLDivElement>(null);
    const [input, setInput] = useState('');

    useEffect(() => {
        endRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [chatHistory]);

    const getIcon = (role: ChatMessage['role']) => {
        switch (role) {
            case 'user': return <User size={16} className="text-accent-blue" />;
            case 'assistant': return <Bot size={16} className="text-green-400" />;
            case 'system': return <Code size={16} className="text-text-secondary" />;
            default: return <AlertTriangle size={16} className="text-yellow-400" />;
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (input.trim()) {
            onTextQuery(input.trim());
            setInput('');
        }
    };

    return (
        <div className="app-window w-full h-full">
            <div className="app-header flex items-center justify-center gap-2">
                <Terminal size={14} />
                <span>{Config.OS_NAME} Terminal</span>
            </div>
            <div className="app-content p-4 overflow-y-auto space-y-4 text-sm">
                {chatHistory.map(msg => (
                    <div key={msg.id} className="grid grid-cols-[auto,1fr] gap-x-3 items-start">
                        <div className="w-6 h-6 rounded-full bg-bg-tertiary flex items-center justify-center flex-shrink-0 mt-0.5">
                           {getIcon(msg.role)}
                        </div>
                        <div>
                           <span className={`font-bold text-sm ${
                               msg.role === 'user' ? 'text-accent-blue' :
                               msg.role === 'assistant' ? 'text-green-400' :
                               'text-text-secondary'
                           }`}>
                               {msg.role.charAt(0).toUpperCase() + msg.role.slice(1)}
                           </span>
                           <p className="whitespace-pre-wrap break-words text-text-primary leading-relaxed">{msg.text}</p>
                           {msg.sources && msg.sources.length > 0 && (
                               <div className="mt-2">
                                   <h4 className="text-xs font-semibold text-text-secondary mb-1">Sources:</h4>
                                   <div className="flex flex-wrap gap-2">
                                       {msg.sources.map((source, index) => source.web?.uri && (
                                           <a href={source.web.uri} target="_blank" rel="noopener noreferrer" key={index} className="text-xs bg-bg-tertiary px-2 py-1 rounded-md text-accent-blue hover:underline flex items-center gap-1.5">
                                               <Link size={12} />
                                               <span>{source.web.title || new URL(source.web.uri).hostname}</span>
                                           </a>
                                       ))}
                                   </div>
                               </div>
                           )}
                        </div>
                    </div>
                ))}
                <div ref={endRef} />
            </div>
             <form onSubmit={handleSubmit} className="h-10 border-t border-border-color p-2 flex items-center text-sm text-text-secondary bg-bg-tertiary">
                <label htmlFor="terminal-input" className="pr-2">user@vdb-os:~$</label>
                <input
                    id="terminal-input"
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    className="flex-1 bg-transparent focus:outline-none text-text-primary"
                    autoComplete="off"
                />
             </form>
        </div>
    );
};

export default TerminalApp;
