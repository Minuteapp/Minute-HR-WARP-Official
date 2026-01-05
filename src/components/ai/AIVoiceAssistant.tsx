import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/use-toast';
import { 
  Mic, 
  MicOff, 
  Bot, 
  Zap, 
  Clock, 
  Calendar,
  Settings,
  Volume2,
  VolumeX
} from 'lucide-react';
import { encodeAudioForAPI, AudioRecorder } from '@/utils/RealtimeAudio';

interface AIVoiceAssistantProps {
  onFunctionCall?: (functionName: string, args: any, result: any) => void;
}

const AIVoiceAssistant: React.FC<AIVoiceAssistantProps> = ({ onFunctionCall }) => {
  const { toast } = useToast();
  const [isConnected, setIsConnected] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [currentTranscript, setCurrentTranscript] = useState('');
  const [conversation, setConversation] = useState<Array<{
    role: 'user' | 'assistant' | 'system';
    content: string;
    timestamp: Date;
  }>>([]);
  const [recentActions, setRecentActions] = useState<Array<{
    action: string;
    result: string;
    timestamp: Date;
  }>>([]);

  const wsRef = useRef<WebSocket | null>(null);
  const audioRecorderRef = useRef<AudioRecorder | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const audioQueueRef = useRef<Array<Uint8Array>>([]);
  const isPlayingRef = useRef(false);

  useEffect(() => {
    return () => {
      disconnect();
    };
  }, []);

  const connect = async () => {
    try {
      console.log('🎤 Connecting to AI Voice Assistant...');
      
      // Request microphone access
      await navigator.mediaDevices.getUserMedia({ audio: true });
      
      // Initialize audio context
      audioContextRef.current = new AudioContext({ sampleRate: 24000 });
      
      // Connect WebSocket
      const wsUrl = 'wss://teydpbqficbdgqovoqlo.functions.supabase.co/ai-voice-assistant';
      wsRef.current = new WebSocket(wsUrl);

      wsRef.current.onopen = () => {
        console.log('✅ Connected to AI Voice Assistant');
        setIsConnected(true);
        toast({
          title: "ALEX ist bereit!",
          description: "Ihr AI-Assistent hört zu. Sprechen Sie einfach los.",
        });
        startListening();
      };

      wsRef.current.onmessage = async (event) => {
        const data = JSON.parse(event.data);
        await handleMessage(data);
      };

      wsRef.current.onclose = () => {
        console.log('🔌 Disconnected from AI Voice Assistant');
        setIsConnected(false);
        setIsListening(false);
        setIsSpeaking(false);
      };

      wsRef.current.onerror = (error) => {
        console.error('❌ WebSocket error:', error);
        toast({
          title: "Verbindungsfehler",
          description: "ALEX ist momentan nicht erreichbar.",
          variant: "destructive",
        });
      };

    } catch (error) {
      console.error('❌ Failed to connect:', error);
      toast({
        title: "Mikrofonzugriff erforderlich",
        description: "Bitte erlauben Sie den Mikrofonzugriff für ALEX.",
        variant: "destructive",
      });
    }
  };

  const disconnect = () => {
    console.log('🔌 Disconnecting AI Voice Assistant');
    
    audioRecorderRef.current?.stop();
    audioRecorderRef.current = null;
    
    wsRef.current?.close();
    wsRef.current = null;
    
    audioContextRef.current?.close();
    audioContextRef.current = null;
    
    setIsConnected(false);
    setIsListening(false);
    setIsSpeaking(false);
  };

  const startListening = async () => {
    if (!audioContextRef.current || !wsRef.current) return;

    try {
      audioRecorderRef.current = new AudioRecorder((audioData: Float32Array) => {
        if (wsRef.current?.readyState === WebSocket.OPEN) {
          const encodedAudio = encodeAudioForAPI(audioData);
          wsRef.current.send(JSON.stringify({
            type: 'input_audio_buffer.append',
            audio: encodedAudio
          }));
        }
      });

      await audioRecorderRef.current.start();
      setIsListening(true);
      console.log('🎙️ Started listening');
    } catch (error) {
      console.error('❌ Failed to start listening:', error);
    }
  };

  const handleMessage = async (data: any) => {
    console.log('📨 Received message:', data.type);

    switch (data.type) {
      case 'session.created':
        console.log('🤖 Session created');
        break;

      case 'input_audio_buffer.speech_started':
        console.log('🗣️ User started speaking');
        setCurrentTranscript('');
        break;

      case 'input_audio_buffer.speech_stopped':
        console.log('🤐 User stopped speaking');
        break;

      case 'response.audio.delta':
        await playAudioDelta(data.delta);
        setIsSpeaking(true);
        break;

      case 'response.audio.done':
        setIsSpeaking(false);
        console.log('🔊 Audio response complete');
        break;

      case 'response.audio_transcript.delta':
        setCurrentTranscript(prev => prev + data.delta);
        break;

      case 'response.audio_transcript.done':
        if (data.transcript) {
          addToConversation('assistant', data.transcript);
          setCurrentTranscript('');
        }
        break;

      case 'conversation.item.input_audio_transcription.completed':
        if (data.transcript) {
          addToConversation('user', data.transcript);
        }
        break;

      case 'response.function_call_arguments.done':
        handleFunctionCall(data.name, JSON.parse(data.arguments));
        break;

      case 'error':
        toast({
          title: "ALEX Fehler",
          description: data.message,
          variant: "destructive",
        });
        break;
    }
  };

  const playAudioDelta = async (base64Audio: string) => {
    if (!audioContextRef.current) return;

    try {
      // Convert base64 to Uint8Array
      const binaryString = atob(base64Audio);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }

      // Add to queue
      audioQueueRef.current.push(bytes);
      
      // Start playing if not already playing
      if (!isPlayingRef.current) {
        playNextAudioChunk();
      }
    } catch (error) {
      console.error('❌ Error playing audio:', error);
    }
  };

  const playNextAudioChunk = async () => {
    if (audioQueueRef.current.length === 0) {
      isPlayingRef.current = false;
      return;
    }

    isPlayingRef.current = true;
    const audioData = audioQueueRef.current.shift()!;

    try {
      // Create WAV from PCM data
      const wavData = createWavFromPCM(audioData);
      const audioBuffer = await audioContextRef.current!.decodeAudioData(wavData.buffer.slice(0) as ArrayBuffer);
      
      const source = audioContextRef.current!.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(audioContextRef.current!.destination);
      
      source.onended = () => playNextAudioChunk();
      source.start(0);
    } catch (error) {
      console.error('❌ Error playing audio chunk:', error);
      playNextAudioChunk(); // Continue with next chunk
    }
  };

  const createWavFromPCM = (pcmData: Uint8Array): Uint8Array => {
    const sampleRate = 24000;
    const numChannels = 1;
    const bitsPerSample = 16;
    const blockAlign = (numChannels * bitsPerSample) / 8;
    const byteRate = sampleRate * blockAlign;

    const wavHeader = new ArrayBuffer(44);
    const view = new DataView(wavHeader);

    const writeString = (offset: number, string: string) => {
      for (let i = 0; i < string.length; i++) {
        view.setUint8(offset + i, string.charCodeAt(i));
      }
    };

    writeString(0, 'RIFF');
    view.setUint32(4, 36 + pcmData.length, true);
    writeString(8, 'WAVE');
    writeString(12, 'fmt ');
    view.setUint32(16, 16, true);
    view.setUint16(20, 1, true);
    view.setUint16(22, numChannels, true);
    view.setUint32(24, sampleRate, true);
    view.setUint32(28, byteRate, true);
    view.setUint16(32, blockAlign, true);
    view.setUint16(34, bitsPerSample, true);
    writeString(36, 'data');
    view.setUint32(40, pcmData.length, true);

    const wavArray = new Uint8Array(wavHeader.byteLength + pcmData.length);
    wavArray.set(new Uint8Array(wavHeader), 0);
    wavArray.set(pcmData, wavHeader.byteLength);

    return wavArray;
  };

  const addToConversation = (role: 'user' | 'assistant', content: string) => {
    setConversation(prev => [...prev, {
      role,
      content,
      timestamp: new Date()
    }]);
  };

  const handleFunctionCall = (functionName: string, args: any) => {
    console.log('🎯 Function called:', functionName, args);
    
    let actionText = '';
    let resultText = '';

    switch (functionName) {
      case 'create_absence_request':
        actionText = `Abwesenheitsantrag: ${args.type}`;
        resultText = `${args.start_date} bis ${args.end_date}`;
        break;
      case 'start_time_tracking':
        actionText = 'Zeiterfassung gestartet';
        resultText = args.activity;
        break;
      case 'get_project_status':
        actionText = 'Projektstatus abgerufen';
        resultText = args.project_name;
        break;
      case 'schedule_meeting':
        actionText = 'Meeting geplant';
        resultText = args.title;
        break;
    }

    const action = {
      action: actionText,
      result: resultText,
      timestamp: new Date()
    };

    setRecentActions(prev => [action, ...prev.slice(0, 4)]);
    
    if (onFunctionCall) {
      onFunctionCall(functionName, args, { success: true });
    }
  };

  return (
    <div className="space-y-6">
      {/* Main Control Panel */}
      <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-2 border-blue-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-3">
            <div className="p-2 bg-blue-600 text-white rounded-lg">
              <Bot className="h-6 w-6" />
            </div>
            <div>
              <h3 className="text-xl font-bold">ALEX - AI Voice Assistant</h3>
              <p className="text-sm text-gray-600">Ihr intelligenter HR-Assistent</p>
            </div>
            <div className="ml-auto flex items-center gap-2">
              {isConnected && (
                <Badge variant={isSpeaking ? "destructive" : isListening ? "default" : "secondary"}>
                  {isSpeaking ? "Spricht" : isListening ? "Hört zu" : "Bereit"}
                </Badge>
              )}
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center gap-4">
            {!isConnected ? (
              <Button
                onClick={connect}
                size="lg"
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-4 text-lg"
              >
                <Zap className="h-5 w-5 mr-2" />
                ALEX aktivieren
              </Button>
            ) : (
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 p-4 bg-white rounded-lg border">
                  {isListening ? (
                    <Mic className="h-6 w-6 text-blue-600 animate-pulse" />
                  ) : (
                    <MicOff className="h-6 w-6 text-gray-400" />
                  )}
                  <span className="text-sm font-medium">
                    {isListening ? "Bereit zum Sprechen" : "Mikrofon aus"}
                  </span>
                </div>
                
                <div className="flex items-center gap-2 p-4 bg-white rounded-lg border">
                  {isSpeaking ? (
                    <Volume2 className="h-6 w-6 text-green-600 animate-pulse" />
                  ) : (
                    <VolumeX className="h-6 w-6 text-gray-400" />
                  )}
                  <span className="text-sm font-medium">
                    {isSpeaking ? "ALEX spricht" : "Stumm"}
                  </span>
                </div>

                <Button
                  onClick={disconnect}
                  variant="outline"
                  size="lg"
                >
                  <Settings className="h-4 w-4 mr-2" />
                  Trennen
                </Button>
              </div>
            )}
          </div>

          {/* Current Transcript */}
          {currentTranscript && (
            <div className="mt-4 p-3 bg-white rounded-lg border">
              <p className="text-sm text-gray-600 mb-1">ALEX antwortet:</p>
              <p className="text-blue-700 font-medium">{currentTranscript}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recent Actions */}
      {recentActions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Letzte Aktionen
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentActions.map((action, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">{action.action}</p>
                    <p className="text-sm text-gray-600">{action.result}</p>
                  </div>
                  <Badge variant="outline">
                    {action.timestamp.toLocaleTimeString('de-DE', { 
                      hour: '2-digit', 
                      minute: '2-digit' 
                    })}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Conversation History */}
      {conversation.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Unterhaltung
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {conversation.slice(-10).map((msg, index) => (
                <div
                  key={index}
                  className={`p-3 rounded-lg ${
                    msg.role === 'user' 
                      ? 'bg-blue-50 border-l-4 border-blue-500 ml-4' 
                      : 'bg-green-50 border-l-4 border-green-500 mr-4'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-medium text-gray-500">
                      {msg.role === 'user' ? 'Sie' : 'ALEX'}
                    </span>
                    <span className="text-xs text-gray-400">
                      {msg.timestamp.toLocaleTimeString('de-DE', { 
                        hour: '2-digit', 
                        minute: '2-digit' 
                      })}
                    </span>
                  </div>
                  <p className="text-sm text-gray-800">{msg.content}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Voice Commands Help */}
      <Card>
        <CardHeader>
          <CardTitle>Voice Commands</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <h4 className="font-medium mb-2">🏖️ Abwesenheiten</h4>
              <ul className="space-y-1 text-gray-600">
                <li>"Trage mich morgen als krank ein"</li>
                <li>"Beantrage Urlaub für nächste Woche"</li>
                <li>"Zeige meine Urlaubstage"</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-2">⏰ Zeiterfassung</h4>
              <ul className="space-y-1 text-gray-600">
                <li>"Starte Zeiterfassung für Meeting"</li>
                <li>"Stoppe die Zeit"</li>
                <li>"Wie viele Stunden heute?"</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-2">📋 Projekte</h4>
              <ul className="space-y-1 text-gray-600">
                <li>"Wie läuft Projekt Alpha?"</li>
                <li>"Zeige offene Aufgaben"</li>
                <li>"Erstelle neues Projekt"</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-2">📅 Termine</h4>
              <ul className="space-y-1 text-gray-600">
                <li>"Plane Meeting mit Marketing"</li>
                <li>"Was steht heute an?"</li>
                <li>"Verschiebe Termin auf morgen"</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AIVoiceAssistant;