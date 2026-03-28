import React, { useState, useEffect, useCallback, useRef } from 'react';
import { GoogleGenAI, LiveServerMessage, Modality, GenerateContentResponse } from '@google/genai';
import { ConnectionState, AppType, ChatMessage, SpeechRecognition, CapturedMedia, CameraAction, CameraMode, Contact } from './components/types';
import { TOOLS } from './utils/tools';
import { createPcmBlob, decodeAudioData, decode } from './utils/audioUtils';
import * as Config from './config';

import TopBar from './components/TopBar';
import Dock from './components/Dock';
import TerminalApp from './components/TerminalApp';
import CodeEditorApp from './components/CodeEditorApp';
import CameraApp from './components/CameraApp';
import SettingsApp from './components/SettingsApp';
import PhoneApp from './components/PhoneApp';
import GalleryApp from './components/GalleryApp';
import DiagnosticsApp from './components/DiagnosticsApp';
import ContactsApp from './components/ContactsApp';

const App: React.FC = () => {
    const [connectionState, setConnectionState] = useState<ConnectionState>(ConnectionState.DISCONNECTED);
    const [activeApp, setActiveApp] = useState<AppType>(AppType.TERMINAL);
    const [chatHistory, setChatHistory] = useState<ChatMessage[]>([
        { id: '0', role: 'system', text: `${Config.OS_NAME} Mainframe is online. All systems transcendent.`, timestamp: new Date() }
    ]);
    const [isMicOn, setIsMicOn] = useState(false);
    const [analyser, setAnalyser] = useState<AnalyserNode | null>(null);
    const [dialNumber, setDialNumber] = useState<string | null>(null);
    const [galleryItems, setGalleryItems] = useState<CapturedMedia[]>([]);
    const [vaultPin, setVaultPin] = useState<string | null>(null);
    const [cameraAction, setCameraAction] = useState<CameraAction | null>(null);
    const [cameraMode, setCameraMode] = useState<CameraMode>('photo');
    const [contacts, setContacts] = useState<Contact[]>([]);

    // Core refs for stability and resource management
    const sessionPromiseRef = useRef<Promise<any> | null>(null);
    const inputAudioContextRef = useRef<AudioContext | null>(null);
    const outputAudioContextRef = useRef<AudioContext | null>(null);
    const mediaStreamSourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
    const scriptProcessorRef = useRef<ScriptProcessorNode | null>(null);
    const streamRef = useRef<MediaStream | null>(null);
    const nextStartTimeRef = useRef<number>(0);
    const isMicOnRef = useRef(false);
    const wakeWordRecognizerRef = useRef<SpeechRecognition | null>(null);
    const aiRef = useRef<GoogleGenAI | null>(null);
    const connectionStateRef = useRef(connectionState);

    useEffect(() => {
        connectionStateRef.current = connectionState;
    }, [connectionState]);

    useEffect(() => {
        try {
            const storedMedia = localStorage.getItem('vdb-secureos-gallery');
            if (storedMedia) setGalleryItems(JSON.parse(storedMedia));
            const storedPin = localStorage.getItem('vdb-secureos-vault-pin');
            if (storedPin) setVaultPin(storedPin);
            const storedContacts = localStorage.getItem('vdb-secureos-contacts');
            if (storedContacts) setContacts(JSON.parse(storedContacts));

            if (!process.env.API_KEY) {
                console.error("API_KEY environment variable not set!");
                addChatMessage('system', "CRITICAL ERROR: API Key is missing. Connection impossible.");
                setConnectionState(ConnectionState.ERROR);
            } else {
                 aiRef.current = new GoogleGenAI({ apiKey: process.env.API_KEY });
            }
        } catch (error) {
            console.error("Failed to load from localStorage", error);
        }
    }, []);

    const saveItems = <T,>(key: string, items: T[], setter: React.Dispatch<React.SetStateAction<T[]>>) => {
        setter(items);
        try {
            localStorage.setItem(key, JSON.stringify(items));
        } catch (error) {
            console.error(`Failed to save to localStorage key: ${key}`, error);
        }
    };

    const handleAddMedia = (media: Omit<CapturedMedia, 'id' | 'timestamp' | 'isVaulted'>) => {
        const newItem: CapturedMedia = { ...media, id: Date.now().toString(), timestamp: Date.now(), isVaulted: false };
        saveItems('vdb-secureos-gallery', [newItem, ...galleryItems], setGalleryItems);
    };

    const handleDeleteMedia = (id: string) => saveItems('vdb-secureos-gallery', galleryItems.filter(item => item.id !== id), setGalleryItems);
    const handleToggleVault = (id: string) => saveItems('vdb-secureos-gallery', galleryItems.map(item => item.id === id ? { ...item, isVaulted: !item.isVaulted } : item), setGalleryItems);
    const handleUpdateMedia = (id: string, newDataUrl: string) => saveItems('vdb-secureos-gallery', galleryItems.map(item => item.id === id ? { ...item, dataUrl: newDataUrl } : item), setGalleryItems);
    const handleSetVaultPin = (pin: string) => { setVaultPin(pin); localStorage.setItem('vdb-secureos-vault-pin', pin); };

    const saveContacts = (updatedContacts: Contact[]) => saveItems('vdb-secureos-contacts', updatedContacts, setContacts);

    const addChatMessage = useCallback((role: ChatMessage['role'], text: string, sources?: any[]) => {
        if (!text.trim()) return;
        const newMessage: ChatMessage = { id: Date.now().toString(), role, text, timestamp: new Date(), sources };
        setChatHistory(prev => [...prev, newMessage]);
    }, []);

    const disconnect = useCallback((fromCallback = false) => {
        if (connectionStateRef.current === ConnectionState.IDLE || connectionStateRef.current === ConnectionState.DISCONNECTED) return;

        wakeWordRecognizerRef.current?.stop();
        streamRef.current?.getTracks().forEach(track => track.stop());
        streamRef.current = null;

        scriptProcessorRef.current?.disconnect();
        scriptProcessorRef.current = null;
        mediaStreamSourceRef.current?.disconnect();
        mediaStreamSourceRef.current = null;

        sessionPromiseRef.current?.then(s => s.close()).catch(e => console.error("Error closing session:", e));
        sessionPromiseRef.current = null;

        if (inputAudioContextRef.current && inputAudioContextRef.current.state !== 'closed') {
            inputAudioContextRef.current.close().catch(e => {});
        }
        inputAudioContextRef.current = null;

        if (outputAudioContextRef.current && outputAudioContextRef.current.state !== 'closed') {
            outputAudioContextRef.current.close().catch(e => {});
        }
        outputAudioContextRef.current = null;

        setIsMicOn(false); isMicOnRef.current = false;
        setAnalyser(null);

        setConnectionState(ConnectionState.DISCONNECTED);

        if (!fromCallback) {
            addChatMessage('system', 'Manual disconnect. System returned to secure offline state.');
        } else {
             addChatMessage('system', 'Connection severed. System returned to secure offline state.');
        }
    }, [addChatMessage]);


    const handleServerMessage = useCallback(async (message: LiveServerMessage) => {
        const { serverContent, toolCall } = message;

        if (serverContent?.modelTurn?.parts?.[0]?.inlineData?.data && outputAudioContextRef.current && outputAudioContextRef.current.state !== 'closed') {
            const ctx = outputAudioContextRef.current;
            if (ctx.state === 'suspended') await ctx.resume();
            try {
                const buffer = await decodeAudioData(decode(serverContent.modelTurn.parts[0].inlineData.data), ctx, 24000, 1);
                const source = ctx.createBufferSource();
                source.buffer = buffer;
                if (analyser && analyser.context.state !== 'closed') {
                    source.connect(analyser);
                    analyser.connect(ctx.destination);
                } else {
                    source.connect(ctx.destination);
                }
                const start = Math.max(ctx.currentTime, nextStartTimeRef.current);
                source.start(start);
                nextStartTimeRef.current = start + buffer.duration;
            } catch (e) { console.error("Error processing audio output:", e); }
        }

        if(serverContent?.turnComplete) {
            const fullInput = (serverContent.inputTranscription?.text || '');
            const fullOutput = (serverContent.outputTranscription?.text || '');
            addChatMessage('user', fullInput);
            addChatMessage('assistant', fullOutput);
        }

        if (toolCall) {
            for (const call of toolCall.functionCalls) {
                addChatMessage('system', `Executing: ${call.name}`);
                let result: any = { status: 'ok' };
                try {
                    switch(call.name) {
                        case 'open_application':
                            const appName = (call.args as any).appName?.toLowerCase() || '';
                            if (appName.includes('terminal')) setActiveApp(AppType.TERMINAL);
                            else if (appName.includes('code')) setActiveApp(AppType.CODE_EDITOR);
                            else if (appName.includes('camera')) setActiveApp(AppType.CAMERA);
                            else if (appName.includes('gallery')) setActiveApp(AppType.GALLERY);
                            else if (appName.includes('settings')) setActiveApp(AppType.SETTINGS);
                            else if (appName.includes('phone')) setActiveApp(AppType.PHONE);
                            else if (appName.includes('diagnostics')) setActiveApp(AppType.DIAGNOSTICS);
                            else if (appName.includes('contacts')) setActiveApp(AppType.CONTACTS);
                            else result = { error: 'Unknown application' };
                            break;
                        case 'generate_website':
                            const { htmlContent, description } = call.args as any;
                            const formattedCode = `Website generated for: "${description}"\n\n\`\`\`html\n${htmlContent}\n\`\`\``;
                            addChatMessage('assistant', formattedCode);
                            break;
                        case 'make_phone_call':
                            const { phoneNumber, contactName } = call.args as any;
                            if (contactName) {
                                const contact = contacts.find(c => c.name.toLowerCase() === contactName.toLowerCase());
                                if (contact) {
                                    setDialNumber(contact.phone);
                                    setActiveApp(AppType.PHONE);
                                } else {
                                    result = { error: `Contact '${contactName}' not found.` };
                                    addChatMessage('system', `Error: Contact '${contactName}' not found.`);
                                }
                            } else if (phoneNumber) {
                                setDialNumber(phoneNumber);
                                setActiveApp(AppType.PHONE);
                            } else {
                                result = { error: 'No phone number or contact name provided.' };
                            }
                            break;
                        case 'take_photo': setCameraAction('take-photo'); break;
                        case 'start_video_recording': setCameraAction('start-video'); break;
                        case 'stop_video_recording': setCameraAction('stop-video'); break;
                        case 'flip_camera': setCameraAction('flip-camera'); break;
                        case 'switch_camera_mode':
                            const mode = (call.args as any).mode?.toLowerCase() || '';
                            if (mode.includes('photo')) setCameraMode('photo');
                            else if (mode.includes('video')) setCameraMode('video');
                            else if (mode.includes('qr')) setCameraMode('qr');
                            else result = { error: 'Unknown camera mode' };
                            setActiveApp(AppType.CAMERA);
                            break;
                    }
                } catch (e: any) { result = { error: e.message }; }
                sessionPromiseRef.current?.then(session => session.sendToolResponse({
                    functionResponses: { id: call.id, name: call.name, response: { result } }
                }));
            }
        }
    }, [addChatMessage, analyser, contacts]);

    const connectToGemini = useCallback(async () => {
        if (connectionStateRef.current !== ConnectionState.IDLE) return;
        wakeWordRecognizerRef.current?.stop();
        setConnectionState(ConnectionState.CONNECTING);
        addChatMessage('system', 'Quantum Core boot sequence initiated...');
        try {
            if (!aiRef.current) throw new Error("AI Client not initialized");

            const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
            inputAudioContextRef.current = new AudioCtx({ sampleRate: 16000 });
            outputAudioContextRef.current = new AudioCtx({ sampleRate: 24000 });

            const analyserNode = outputAudioContextRef.current.createAnalyser();
            setAnalyser(analyserNode);

            const sessionPromise = aiRef.current.live.connect({
                model: Config.VOICE_CHAT_MODEL,
                config: {
                    responseModalities: [Modality.AUDIO],
                    outputAudioTranscription: {},
                    inputAudioTranscription: {},
                    systemInstruction: Config.AI_PERSONA_INSTRUCTION,
                    tools: [{ functionDeclarations: TOOLS }],
                },
                callbacks: {
                    onopen: async () => {
                        setConnectionState(ConnectionState.CONNECTED);
                        addChatMessage('system', 'Core synchronized. VDB Singularity OS is online.');
                        setIsMicOn(true); isMicOnRef.current = true;

                        const ctx = inputAudioContextRef.current!;
                        if (ctx.state === 'suspended') await ctx.resume();
                        if (!streamRef.current) throw new Error("MediaStream is not available.");
                        mediaStreamSourceRef.current = ctx.createMediaStreamSource(streamRef.current);
                        scriptProcessorRef.current = ctx.createScriptProcessor(4096, 1, 1);
                        scriptProcessorRef.current.onaudioprocess = (e) => {
                            if (!isMicOnRef.current) return;
                            const pcmBlob = createPcmBlob(e.inputBuffer.getChannelData(0));
                            sessionPromiseRef.current?.then(s => s.sendRealtimeInput({ media: pcmBlob }));
                        };
                        mediaStreamSourceRef.current.connect(scriptProcessorRef.current);
                        scriptProcessorRef.current.connect(ctx.destination);
                    },
                    onmessage: handleServerMessage,
                    onclose: () => disconnect(true),
                    onerror: (e) => {
                        console.error("Gemini session error:", e);
                        addChatMessage('system', `CRITICAL ERROR: Mainframe connection severed. Self-healing protocol initiated.`);
                        setConnectionState(ConnectionState.REBALANCING);
                        setTimeout(() => disconnect(true), 3000); // Trigger full reset
                    },
                }
            });
            sessionPromiseRef.current = sessionPromise;
        } catch (e: any) {
            console.error("Failed to connect to Gemini:", e);
            addChatMessage('system', `Quantum Core failed to boot. Reason: ${e.message}`);
            setConnectionState(ConnectionState.ERROR);
            disconnect(true);
        }
    }, [addChatMessage, handleServerMessage, disconnect]);

    const startWakeWordListener = useCallback(() => {
        const SpeechRecognitionApi = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
        if (!SpeechRecognitionApi) return;
        if(wakeWordRecognizerRef.current) wakeWordRecognizerRef.current.stop();

        const recognizer: SpeechRecognition = new SpeechRecognitionApi();
        recognizer.continuous = true;
        recognizer.interimResults = true;
        recognizer.lang = 'en-US';

        recognizer.onresult = (event) => {
            for (let i = event.resultIndex; i < event.results.length; ++i) {
                const transcript = event.results[i][0].transcript.toLowerCase().trim();
                if (event.results[i].isFinal && (transcript.includes('hey vdb') || transcript.includes('hey v d b'))) {
                    addChatMessage('system', 'Wake word "Hey VDB" detected. Activating core systems...');
                    connectToGemini();
                }
            }
        };

        recognizer.onend = () => {
            if (connectionStateRef.current === ConnectionState.IDLE) {
                setTimeout(() => { try { recognizer.start() } catch(e){} }, 100);
            }
        };

        recognizer.onerror = (event) => {
            if (event.error === 'aborted') {
                 // Gracefully handle; onend will restart.
            } else if (event.error === 'not-allowed') {
                addChatMessage('system', 'Microphone permission denied. Voice control disabled. Please grant permission and click the power button again.');
                setConnectionState(ConnectionState.DISCONNECTED);
            }
            else { console.error(`A critical speech recognition error occurred: ${event.error}`); }
        };

        try { recognizer.start() } catch(e) { console.error("Could not start recognizer:", e); }
        wakeWordRecognizerRef.current = recognizer;
    }, [connectToGemini, addChatMessage]);

    const initializeSystems = async () => {
        if (connectionStateRef.current !== ConnectionState.DISCONNECTED) return;
        addChatMessage('system', 'User authorization received. Activating microphone...');
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            streamRef.current = stream;
            addChatMessage('system', 'Microphone activated. Initializing wake word listener...');
            setConnectionState(ConnectionState.IDLE);
            startWakeWordListener();
        } catch (err: any) {
            console.error("Microphone permission error:", err);
            addChatMessage('system', `PERMISSION DENIED: Microphone access is required. Please grant permission and click the power button again.`);
            setConnectionState(ConnectionState.DISCONNECTED);
        }
    };

    const handleMainButtonClick = () => {
        switch(connectionStateRef.current) {
            case ConnectionState.DISCONNECTED:
                initializeSystems();
                break;
            case ConnectionState.IDLE:
                connectToGemini();
                break;
            case ConnectionState.CONNECTED:
                 setIsMicOn(prev => { isMicOnRef.current = !prev; return !prev; });
                break;
        }
    };

    const handleTextQuery = async (query: string) => {
        if (!query.trim()) return;
        addChatMessage('user', query);
        try {
            if (!aiRef.current) throw new Error("AI Client not initialized.");
            const response: GenerateContentResponse = await aiRef.current.models.generateContent({
                model: Config.TEXT_CHAT_MODEL,
                contents: query,
                config: { tools: [{ googleSearch: {} }] },
            });
            const text = response.text || "No text response found.";
            const sources = response?.candidates?.[0]?.groundingMetadata?.groundingChunks;
            addChatMessage('assistant', text, sources);
        } catch (error: any) {
            console.error("Text generation error:", error);
            addChatMessage('system', `Error fetching information: ${error.message}`);
        }
    };

    const renderActiveApp = () => {
        switch (activeApp) {
            case AppType.TERMINAL:
                return <TerminalApp chatHistory={chatHistory} onTextQuery={handleTextQuery} />;
            case AppType.CODE_EDITOR:
                return <CodeEditorApp setGeneratedHtml={(html) => addChatMessage('assistant', `Website generated.\n\n\`\`\`html\n${html}\n\`\`\``)} />;
            case AppType.CAMERA:
                return <CameraApp onCapture={handleAddMedia} lastCapture={galleryItems.find(i => !i.isVaulted)} onThumbnailClick={() => setActiveApp(AppType.GALLERY)} action={cameraAction} onActionComplete={() => setCameraAction(null)} mode={cameraMode} setMode={setCameraMode} />;
            case AppType.GALLERY:
                return <GalleryApp items={galleryItems} onDelete={handleDeleteMedia} onToggleVault={handleToggleVault} onUpdateMedia={handleUpdateMedia} vaultPin={vaultPin} onSetVaultPin={handleSetVaultPin} />;
            case AppType.SETTINGS:
                 return <SettingsApp />;
            case AppType.DIAGNOSTICS:
                 return <DiagnosticsApp connectionState={connectionState} />;
            case AppType.PHONE:
                return <PhoneApp dialNumber={dialNumber} setDialNumber={setDialNumber} contacts={contacts} />;
            case AppType.CONTACTS:
                return <ContactsApp contacts={contacts} onSave={saveContacts} />;
            default:
                return <TerminalApp chatHistory={chatHistory} onTextQuery={handleTextQuery} />;
        }
    };

    return (
        <div className="w-screen h-screen flex flex-col font-body text-text-primary overflow-hidden bg-bg-primary">
            <TopBar connectionState={connectionState} />
            <main className="flex-1 flex flex-col p-0 sm:p-3 sm:pt-0 pb-24 sm:pb-20 overflow-hidden relative">
                {renderActiveApp()}
            </main>
            <Dock
                activeApp={activeApp}
                setActiveApp={setActiveApp}
                connectionState={connectionState}
                isMicOn={isMicOn}
                onMainButtonClick={handleMainButtonClick}
                disconnect={() => disconnect(false)}
                analyser={analyser}
            />
        </div>
    );
};

export default App;
