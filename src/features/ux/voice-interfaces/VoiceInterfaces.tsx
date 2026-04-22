'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { cn } from '@/lib/utils';

// Voice Interface Types
export type VoiceCommand =
  | 'navigate'
  | 'search'
  | 'create'
  | 'edit'
  | 'delete'
  | 'show'
  | 'hide'
  | 'open'
  | 'close'
  | 'help'
  | 'settings'
  | 'dashboard'
  | 'analytics'
  | 'reports';

export type VoiceIntent =
  | 'navigation'
  | 'information'
  | 'action'
  | 'query'
  | 'command'
  | 'help'
  | 'confirmation'
  | 'correction';

export type SpeechRecognitionState =
  | 'inactive'
  | 'listening'
  | 'processing'
  | 'speaking'
  | 'error';

export interface VoiceSession {
  id: string;
  userId: string;
  startTime: string;
  endTime?: string;
  commands: VoiceCommand[];
  accuracy: number;
  duration: number;
  interactions: VoiceInteraction[];
  status: 'active' | 'completed' | 'error';
}

export interface VoiceInteraction {
  id: string;
  timestamp: string;
  userInput: string;
  recognizedText: string;
  intent: VoiceIntent;
  command: VoiceCommand;
  confidence: number;
  response: string;
  actionTaken: string;
  success: boolean;
}

export interface VoiceProfile {
  id: string;
  userId: string;
  voiceModel: string;
  accent: string;
  language: string;
  speed: number;
  pitch: number;
  volume: number;
  customCommands: Record<string, VoiceCommand>;
  wakeWords: string[];
  preferences: {
    autoStart: boolean;
    continuousListening: boolean;
    voiceFeedback: boolean;
    hapticFeedback: boolean;
  };
  accuracy: number;
  lastUsed: string;
}

export interface ConversationalContext {
  currentTopic: string;
  previousIntents: VoiceIntent[];
  userPreferences: Record<string, any>;
  sessionState: Record<string, any>;
  conversationHistory: VoiceInteraction[];
}

// Voice Interface Hook
export function useVoiceInterface(userId?: string) {
  const [recognitionState, setRecognitionState] = useState<SpeechRecognitionState>('inactive');
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [response, setResponse] = useState('');
  const [voiceProfile, setVoiceProfile] = useState<VoiceProfile | null>(null);
  const [conversationalContext, setConversationalContext] = useState<ConversationalContext>({
    currentTopic: '',
    previousIntents: [],
    userPreferences: {},
    sessionState: {},
    conversationHistory: []
  });

  const recognitionRef = useRef<any>(null);
  const synthRef = useRef<SpeechSynthesis | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);

  // Mock voice profile
  const mockVoiceProfile: VoiceProfile = {
    id: `voice_${userId || 'default'}`,
    userId: userId || 'default',
    voiceModel: 'en-US-Neural2-F',
    accent: 'American English',
    language: 'en-US',
    speed: 1.0,
    pitch: 1.0,
    volume: 0.8,
    customCommands: {
      'show me the money': 'analytics',
      'take me home': 'dashboard'
    },
    wakeWords: ['hey garlaws', 'ok garlaws', 'hello garlaws'],
    preferences: {
      autoStart: true,
      continuousListening: false,
      voiceFeedback: true,
      hapticFeedback: true
    },
    accuracy: 96.2,
    lastUsed: new Date().toISOString()
  };

  const initializeVoiceInterface = useCallback(async () => {
    // Check for browser support
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      console.error('Speech recognition not supported');
      return false;
    }

    if (!('speechSynthesis' in window)) {
      console.error('Speech synthesis not supported');
      return false;
    }

    // Initialize speech recognition
    const SpeechRecognitionAPI = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const recognition = new SpeechRecognitionAPI();

    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = 'en-US';
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      setRecognitionState('listening');
      setIsListening(true);
    };

    recognition.onresult = (event: any) => {
      setRecognitionState('processing');
      const result = event.results[event.results.length - 1];

      if (result.isFinal) {
        const recognizedText = result[0].transcript;
        setTranscript(recognizedText);
        processVoiceCommand(recognizedText);
      } else {
        setTranscript(result[0].transcript);
      }
    };

    recognition.onerror = (event: any) => {
      console.error('Speech recognition error:', event.error);
      setRecognitionState('error');
      setIsListening(false);
    };

    recognition.onend = () => {
      setRecognitionState('inactive');
      setIsListening(false);
    };

    recognitionRef.current = recognition;
    synthRef.current = window.speechSynthesis;

    // Load voice profile
    setVoiceProfile(mockVoiceProfile);

    return true;
  }, []);

  const startListening = useCallback(() => {
    if (recognitionRef.current && !isListening) {
      try {
        recognitionRef.current.start();
      } catch (error) {
        console.error('Failed to start speech recognition:', error);
      }
    }
  }, [isListening]);

  const stopListening = useCallback(() => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop();
    }
  }, [isListening]);

  const processVoiceCommand = useCallback(async (text: string) => {
    const lowerText = text.toLowerCase().trim();

    // Check for wake words
    const hasWakeWord = voiceProfile?.wakeWords.some(word =>
      lowerText.includes(word.toLowerCase())
    );

    if (!hasWakeWord && !isListening) {
      return; // Ignore if no wake word and not actively listening
    }

    // Clean the text (remove wake words)
    let cleanText = lowerText;
    voiceProfile?.wakeWords.forEach(word => {
      cleanText = cleanText.replace(word.toLowerCase(), '').trim();
    });

    if (!cleanText) return;

    // Analyze intent and extract command
    const analysis = analyzeVoiceIntent(cleanText);
    const interaction: VoiceInteraction = {
      id: `interaction_${Date.now()}`,
      timestamp: new Date().toISOString(),
      userInput: text,
      recognizedText: cleanText,
      intent: analysis.intent,
      command: analysis.command,
      confidence: analysis.confidence,
      response: '',
      actionTaken: '',
      success: false
    };

    // Generate response
    const responseText = generateVoiceResponse(analysis.intent, analysis.command, analysis.entities);
    interaction.response = responseText;
    interaction.actionTaken = `Executed ${analysis.command} command`;
    interaction.success = true;

    // Speak response
    speakText(responseText);

    // Update context
    setConversationalContext(prev => ({
      ...prev,
      previousIntents: [...prev.previousIntents.slice(-4), analysis.intent],
      conversationHistory: [...prev.conversationHistory.slice(-9), interaction]
    }));

    setResponse(responseText);

    // Execute the command
    executeVoiceCommand(analysis.command, analysis.entities);
  }, [voiceProfile, isListening]);

  const analyzeVoiceIntent = (text: string): {
    intent: VoiceIntent;
    command: VoiceCommand;
    confidence: number;
    entities: Record<string, any>;
  } => {
    // Mock intent analysis - in real implementation, use NLP model
    const lowerText = text.toLowerCase();

    if (lowerText.includes('navigate') || lowerText.includes('go to') || lowerText.includes('show me')) {
      return {
        intent: 'navigation',
        command: 'navigate',
        confidence: 0.95,
        entities: { destination: extractDestination(text) }
      };
    }

    if (lowerText.includes('search') || lowerText.includes('find') || lowerText.includes('look for')) {
      return {
        intent: 'query',
        command: 'search',
        confidence: 0.92,
        entities: { query: extractQuery(text) }
      };
    }

    if (lowerText.includes('create') || lowerText.includes('new') || lowerText.includes('add')) {
      return {
        intent: 'action',
        command: 'create',
        confidence: 0.88,
        entities: { type: extractType(text) }
      };
    }

    if (lowerText.includes('help') || lowerText.includes('assist') || lowerText.includes('support')) {
      return {
        intent: 'help',
        command: 'help',
        confidence: 0.98,
        entities: {}
      };
    }

    if (lowerText.includes('settings') || lowerText.includes('preferences') || lowerText.includes('config')) {
      return {
        intent: 'navigation',
        command: 'settings',
        confidence: 0.94,
        entities: {}
      };
    }

    if (lowerText.includes('dashboard') || lowerText.includes('home') || lowerText.includes('overview')) {
      return {
        intent: 'navigation',
        command: 'dashboard',
        confidence: 0.96,
        entities: {}
      };
    }

    return {
      intent: 'command',
      command: 'help',
      confidence: 0.5,
      entities: {}
    };
  };

  const extractDestination = (text: string): string => {
    // Mock extraction - in real implementation, use entity recognition
    if (text.includes('dashboard')) return 'dashboard';
    if (text.includes('analytics')) return 'analytics';
    if (text.includes('reports')) return 'reports';
    if (text.includes('settings')) return 'settings';
    return 'dashboard';
  };

  const extractQuery = (text: string): string => {
    // Mock extraction
    return text.replace(/search|find|look for/gi, '').trim();
  };

  const extractType = (text: string): string => {
    // Mock extraction
    if (text.includes('report')) return 'report';
    if (text.includes('chart')) return 'chart';
    if (text.includes('dashboard')) return 'dashboard';
    return 'item';
  };

  const generateVoiceResponse = (
    intent: VoiceIntent,
    command: VoiceCommand,
    entities: Record<string, any>
  ): string => {
    // Mock response generation
    switch (command) {
      case 'navigate':
        return `Navigating to ${entities.destination || 'dashboard'}.`;
      case 'search':
        return `Searching for ${entities.query || 'your request'}.`;
      case 'create':
        return `Creating a new ${entities.type || 'item'}.`;
      case 'help':
        return 'I can help you navigate, search, create items, and access various features. What would you like to do?';
      case 'dashboard':
        return 'Opening your dashboard.';
      case 'settings':
        return 'Opening settings.';
      default:
        return 'Command executed successfully.';
    }
  };

  const executeVoiceCommand = useCallback((command: VoiceCommand, entities: Record<string, any>) => {
    // Mock command execution - in real implementation, trigger actual UI actions
    console.log(`Executing voice command: ${command}`, entities);

    switch (command) {
      case 'navigate':
        // Trigger navigation
        console.log(`Navigate to: ${entities.destination}`);
        break;
      case 'search':
        // Trigger search
        console.log(`Search for: ${entities.query}`);
        break;
      case 'create':
        // Trigger creation
        console.log(`Create: ${entities.type}`);
        break;
      case 'help':
        // Show help
        console.log('Show help');
        break;
      default:
        console.log(`Unknown command: ${command}`);
    }
  }, []);

  const speakText = useCallback((text: string) => {
    if (!synthRef.current || !voiceProfile) return;

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = voiceProfile.language;
    utterance.rate = voiceProfile.speed;
    utterance.pitch = voiceProfile.pitch;
    utterance.volume = voiceProfile.volume;

    // Try to find a suitable voice
    const voices = synthRef.current.getVoices();
    const preferredVoice = voices.find(voice =>
      voice.name.includes(voiceProfile.voiceModel.split('-')[0]) ||
      voice.lang === voiceProfile.language
    );

    if (preferredVoice) {
      utterance.voice = preferredVoice;
    }

    synthRef.current.speak(utterance);
  }, [voiceProfile]);

  const getSupportedLanguages = useCallback(() => {
    return [
      'en-US', 'en-GB', 'es-ES', 'fr-FR', 'de-DE', 'it-IT', 'pt-BR', 'ja-JP', 'ko-KR', 'zh-CN'
    ];
  }, []);

  const getAvailableVoices = useCallback(() => {
    if (!synthRef.current) return [];
    return synthRef.current.getVoices();
  }, []);

  useEffect(() => {
    initializeVoiceInterface();
  }, [initializeVoiceInterface]);

  return {
    recognitionState,
    isListening,
    transcript,
    response,
    voiceProfile,
    conversationalContext,
    startListening,
    stopListening,
    speakText,
    getSupportedLanguages,
    getAvailableVoices,
    processVoiceCommand,
  };
}

// Voice Interface Dashboard Component
interface VoiceInterfaceDashboardProps {
  className?: string;
  userId?: string;
}

export const VoiceInterfaceDashboard: React.FC<VoiceInterfaceDashboardProps> = ({
  className,
  userId = 'demo-user'
}) => {
  const {
    recognitionState,
    isListening,
    transcript,
    response,
    voiceProfile,
    conversationalContext,
    startListening,
    stopListening,
    speakText,
    getSupportedLanguages,
    getAvailableVoices
  } = useVoiceInterface(userId);

  const [testText, setTestText] = useState('Hello Garlaws, show me the dashboard');
  const [selectedLanguage, setSelectedLanguage] = useState('en-US');

  const handleSpeakTest = () => {
    speakText(testText);
  };

  const getStateColor = (state: SpeechRecognitionState) => {
    switch (state) {
      case 'listening': return 'bg-blue-500';
      case 'processing': return 'bg-yellow-500';
      case 'speaking': return 'bg-green-500';
      case 'error': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getStateIcon = (state: SpeechRecognitionState) => {
    switch (state) {
      case 'listening': return '🎤';
      case 'processing': return '⚙️';
      case 'speaking': return '🔊';
      case 'error': return '❌';
      default: return '🔇';
    }
  };

  return (
    <div className={cn('space-y-6', className)}>
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Voice Interfaces</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Conversational AI and voice-controlled interactions
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <div className={`flex items-center space-x-2 px-3 py-1 rounded-full text-sm font-medium ${
            recognitionState === 'listening' ? 'bg-blue-100 text-blue-800' :
            recognitionState === 'processing' ? 'bg-yellow-100 text-yellow-800' :
            recognitionState === 'speaking' ? 'bg-green-100 text-green-800' :
            recognitionState === 'error' ? 'bg-red-100 text-red-800' :
            'bg-gray-100 text-gray-800'
          }`}>
            <span className="text-lg mr-2">{getStateIcon(recognitionState)}</span>
            <span className="capitalize">{recognitionState}</span>
          </div>
        </div>
      </div>

      {/* Voice Profile */}
      {voiceProfile && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white p-4 rounded-lg border">
            <h3 className="font-semibold mb-2">Voice Settings</h3>
            <div className="space-y-1 text-sm">
              <div>Language: {voiceProfile.language}</div>
              <div>Accent: {voiceProfile.accent}</div>
              <div>Voice Model: {voiceProfile.voiceModel}</div>
            </div>
          </div>

          <div className="bg-white p-4 rounded-lg border">
            <h3 className="font-semibold mb-2">Performance</h3>
            <div className="space-y-1 text-sm">
              <div>Accuracy: {voiceProfile.accuracy.toFixed(1)}%</div>
              <div>Speed: {voiceProfile.speed}x</div>
              <div>Volume: {Math.round(voiceProfile.volume * 100)}%</div>
            </div>
          </div>

          <div className="bg-white p-4 rounded-lg border">
            <h3 className="font-semibold mb-2">Wake Words</h3>
            <div className="flex flex-wrap gap-1">
              {voiceProfile.wakeWords.map(word => (
                <span key={word} className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">
                  "{word}"
                </span>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Voice Interaction */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Speech Recognition */}
        <div className="bg-white p-6 rounded-lg border">
          <h3 className="text-lg font-semibold mb-4">Speech Recognition</h3>

          <div className="space-y-4">
            <div className="flex justify-center">
              <button
                onClick={isListening ? stopListening : startListening}
                className={cn(
                  'w-20 h-20 rounded-full flex items-center justify-center text-2xl font-bold transition-all',
                  isListening
                    ? 'bg-red-500 text-white animate-pulse'
                    : 'bg-blue-500 text-white hover:bg-blue-600'
                )}
              >
                {isListening ? '⏹️' : '🎤'}
              </button>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Transcript</label>
              <div className="p-3 bg-gray-50 rounded border min-h-[60px]">
                {transcript || 'Start speaking or click the microphone...'}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Response</label>
              <div className="p-3 bg-green-50 rounded border min-h-[60px]">
                {response || 'AI response will appear here...'}
              </div>
            </div>
          </div>
        </div>

        {/* Text-to-Speech */}
        <div className="bg-white p-6 rounded-lg border">
          <h3 className="text-lg font-semibold mb-4">Text-to-Speech</h3>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Test Text</label>
              <textarea
                value={testText}
                onChange={(e) => setTestText(e.target.value)}
                className="w-full h-20 p-3 border border-border rounded resize-none"
                placeholder="Enter text to speak..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Language</label>
              <select
                value={selectedLanguage}
                onChange={(e) => setSelectedLanguage(e.target.value)}
                className="w-full px-3 py-2 border border-border rounded"
              >
                {getSupportedLanguages().map(lang => (
                  <option key={lang} value={lang}>
                    {lang}
                  </option>
                ))}
              </select>
            </div>

            <button
              onClick={handleSpeakTest}
              className="w-full px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
            >
              🔊 Speak Text
            </button>
          </div>
        </div>
      </div>

      {/* Voice Commands */}
      <div className="bg-white p-6 rounded-lg border">
        <h3 className="text-lg font-semibold mb-4">Supported Voice Commands</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[
            { command: 'Navigate', examples: ['"Go to dashboard"', '"Show analytics"', '"Open settings"'] },
            { command: 'Search', examples: ['"Search for reports"', '"Find customer data"', '"Look for invoices"'] },
            { command: 'Create', examples: ['"Create new report"', '"Add customer"', '"New dashboard"'] },
            { command: 'Help', examples: ['"Help"', '"What can you do?"', '"Show commands"'] },
            { command: 'Actions', examples: ['"Delete item"', '"Edit report"', '"Save changes"'] },
            { command: 'Navigation', examples: ['"Go back"', '"Next page"', '"Previous"'] }
          ].map(({ command, examples }) => (
            <div key={command} className="border rounded-lg p-4">
              <h4 className="font-medium mb-2">{command}</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                {examples.map(example => (
                  <li key={example} className="font-mono text-xs">{example}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* Conversation History */}
      <div className="bg-white p-6 rounded-lg border">
        <h3 className="text-lg font-semibold mb-4">Recent Conversations ({conversationalContext.conversationHistory.length})</h3>
        <div className="space-y-3 max-h-60 overflow-y-auto">
          {conversationalContext.conversationHistory.slice(-5).map(interaction => (
            <div key={interaction.id} className="border rounded p-3">
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center space-x-2">
                  <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                    {interaction.intent}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {new Date(interaction.timestamp).toLocaleTimeString()}
                  </span>
                </div>
                <span className="text-xs text-muted-foreground">
                  {(interaction.confidence * 100).toFixed(0)}% confidence
                </span>
              </div>
              <div className="text-sm mb-1">
                <strong>You:</strong> {interaction.recognizedText}
              </div>
              <div className="text-sm text-muted-foreground">
                <strong>AI:</strong> {interaction.response}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Performance Metrics */}
      <div className="bg-white p-6 rounded-lg border">
        <h3 className="text-lg font-semibold mb-4">Performance Metrics</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600 mb-1">96.2%</div>
            <div className="text-sm text-muted-foreground">Recognition Accuracy</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600 mb-1">45ms</div>
            <div className="text-sm text-muted-foreground">Response Time</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600 mb-1">98.5%</div>
            <div className="text-sm text-muted-foreground">Intent Detection</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-600 mb-1">12</div>
            <div className="text-sm text-muted-foreground">Active Sessions</div>
          </div>
        </div>
      </div>
    </div>
  );
};