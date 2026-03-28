export enum ConnectionState {
  IDLE = 'LISTENING',
  DISCONNECTED = 'OFFLINE',
  CONNECTING = 'BOOTING_QUANTUM_CORE',
  CONNECTED = 'SYNCHRONIZED',
  STABILIZING = 'RECALIBRATING_MATRIX',
  REBALANCING = 'REBALANCING_CORES',
  ERROR = 'SYSTEM_FAILURE',
}

export enum AppType {
  NONE = 'NONE',
  TERMINAL = 'TERMINAL',
  CODE_EDITOR = 'CODE_EDITOR',
  CAMERA = 'CAMERA',
  SETTINGS = 'SYSTEM_SETTINGS',
  PHONE = 'PHONE_DIALER',
  GALLERY = 'GALLERY',
  DIAGNOSTICS = 'DIAGNOSTICS',
  CONTACTS = 'CONTACTS',
}

export interface Contact {
  id: string;
  name: string;
  phone: string;
  email?: string;
}

export interface SystemStatus {
  battery: number | null;
  charging: boolean;
  location: string | null;
  brightness: number;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system' | 'quantum';
  text: string;
  timestamp?: Date;
  sources?: GroundingChunk[];
}

export interface CapturedMedia {
  id: string;
  type: 'photo' | 'video';
  dataUrl: string;
  timestamp: number;
  isVaulted: boolean;
}

export type CameraAction = 'take-photo' | 'start-video' | 'stop-video' | 'flip-camera';
export type CameraMode = 'photo' | 'video' | 'qr';


// Web Speech API Types
export interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start(): void;
  stop(): void;
  abort(): void;
  onresult: (event: SpeechRecognitionEvent) => void;
  onerror: (event: SpeechRecognitionErrorEvent) => void;
  onend: () => void;
}

export interface SpeechRecognitionEvent {
  results: SpeechRecognitionResultList;
  resultIndex: number;
}

export interface SpeechRecognitionResultList {
  length: number;
  item(index: number): SpeechRecognitionResult;
  [index: number]: SpeechRecognitionResult;
}

export interface SpeechRecognitionResult {
  isFinal: boolean;
  length: number;
  item(index: number): SpeechRecognitionAlternative;
  [index: number]: SpeechRecognitionAlternative;
}

export interface SpeechRecognitionAlternative {
  transcript: string;
  confidence: number;
}

export interface SpeechRecognitionErrorEvent extends Event {
  error: string;
  message: string;
}

// Google Search Grounding Types
export interface WebSource {
  uri?: string;
  title?: string;
}

export interface GroundingChunk {
  web?: WebSource;
}

// Uploaded file type for multimodal input
export interface UploadedFile {
    name: string;
    type: string; // e.g., 'image/png'
    base64: string;
}

// Text Chat message with optional file
export interface TextChatMessage extends ChatMessage {
  file?: UploadedFile;
}
