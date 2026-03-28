import React, { useState } from 'react';
import { GoogleGenAI } from '@google/genai';
import { Play, Clipboard, Loader2, Code2, Check } from 'lucide-react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import * as Config from '../config';

interface CodeGenerationResult {
    language: string;
    code: string;
}

interface CodeEditorAppProps {
    setGeneratedHtml: (html: string) => void;
}

const CodeEditorApp: React.FC<CodeEditorAppProps> = ({ setGeneratedHtml }) => {
    const [prompt, setPrompt] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [result, setResult] = useState<CodeGenerationResult | null>(null);
    const [copySuccess, setCopySuccess] = useState(false);

    const handleGenerate = async () => {
        if (!prompt.trim()) return;
        setIsLoading(true);
        setResult(null);
        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            const response = await ai.models.generateContent({
                model: Config.CODE_GENERATION_MODEL,
                contents: `
                    Analyze the following request and generate only the code.
                    Detect the language. If it is a runnable HTML/JS/CSS snippet, make it a single self-contained HTML file.
                    Your output MUST be in a markdown code block.

                    Request: "${prompt}"
                `,
            });

            const text = response.text || '';
            const match = /```(\w+)?\n([\s\S]+?)```/.exec(text);
            if (match) {
                setResult({ language: match[1] || 'plaintext', code: match[2].trim() });
            } else {
                setResult({ language: 'plaintext', code: text });
            }
        } catch (error) {
            console.error(error);
            setResult({ language: 'plaintext', code: 'Error generating code.' });
        } finally {
            setIsLoading(false);
        }
    };

    const handleCopy = () => {
        if (result?.code) {
            navigator.clipboard.writeText(result.code);
            setCopySuccess(true);
            setTimeout(() => setCopySuccess(false), 2000);
        }
    };

    const handleRun = () => {
        if(result?.language === 'html' && result.code) {
            setGeneratedHtml(result.code);
        }
    };

    return (
        <div className="app-window w-full h-full">
             <div className="app-header flex items-center justify-center gap-2">
                <Code2 size={14}/>
                <span>Code Studio</span>
            </div>
            <div className="app-content flex gap-4 p-4">
                {/* Left Panel */}
                <div className="w-1/3 flex flex-col gap-4">
                    <h3 className="font-medium text-text-secondary text-sm">PROMPT</h3>
                    <textarea
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        placeholder="e.g., 'Create a simple portfolio website with a contact form'"
                        className="flex-1 bg-bg-primary border border-border-color p-3 text-sm rounded-md focus:outline-none focus:ring-2 focus:ring-accent-blue resize-none"
                    />
                    <button onClick={handleGenerate} disabled={isLoading} className="flex items-center justify-center gap-2 bg-accent-blue text-black font-bold py-2.5 rounded-md hover:opacity-90 disabled:opacity-50 transition-opacity">
                        {isLoading ? <Loader2 size={20} className="animate-spin" /> : 'GENERATE'}
                    </button>
                </div>
                {/* Right Panel */}
                <div className="w-2/3 flex flex-col">
                    <div className="flex justify-between items-center mb-2">
                        <h3 className="font-medium text-text-secondary text-sm">OUTPUT</h3>
                        {result && (
                            <div className="flex gap-2">
                                {result.language === 'html' && <button onClick={handleRun} className="flex items-center gap-1.5 text-xs px-3 py-1.5 bg-green-500/20 text-green-300 rounded-md hover:bg-green-500/30 transition-colors"><Play size={14}/> RUN</button>}
                                <button onClick={handleCopy} className="flex items-center gap-1.5 text-xs px-3 py-1.5 bg-bg-tertiary rounded-md text-text-secondary hover:bg-opacity-80 transition-colors">
                                    {copySuccess ? <Check size={14} className="text-green-400" /> : <Clipboard size={14}/>}
                                    {copySuccess ? 'COPIED!' : 'COPY'}
                                </button>
                            </div>
                        )}
                    </div>
                    <div className="flex-1 bg-bg-primary border border-border-color rounded-md overflow-auto relative">
                        {result ? (
                             <SyntaxHighlighter language={result.language} style={oneDark} customStyle={{background: 'transparent', height: '100%', margin: 0, fontSize: '0.8rem'}} codeTagProps={{style: {fontFamily: "monospace"}}}>
                                {result.code}
                            </SyntaxHighlighter>
                        ) : (
                            <div className="flex items-center justify-center h-full text-text-secondary">
                                {isLoading ? <Loader2 size={32} className="animate-spin text-accent-blue"/> : 'Awaiting prompt...'}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CodeEditorApp;
