
import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader } from "@/components/ui/card";
import { 
  Send, 
  Paperclip, 
  Smile, 
  Mic, 
  MicOff, 
  Bot,
  FileText,
  MessageSquare,
  Clock,
  Calendar
} from "lucide-react";
import { toast } from "sonner";
import { useHybridSpeechRecognition } from "@/hooks/today/useHybridSpeechRecognition";
import VoiceAssistantButton from "@/components/today/VoiceAssistantButton";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { 
  Tooltip, 
  TooltipContent, 
  TooltipProvider, 
  TooltipTrigger 
} from "@/components/ui/tooltip";
import { 
  Popover,
  PopoverContent,
  PopoverTrigger
} from "@/components/ui/popover";

interface Chat {
  id: number | string;
  name: string;
  lastMessage: string;
  time: string;
  unread: number;
}

interface ChatWindowProps {
  chat: Chat;
}

interface Message {
  id: number;
  text: string;
  sender: 'me' | 'them' | 'system' | 'ai';
  time: string;
  isVoice?: boolean;
  voiceUrl?: string;
  attachment?: {
    name: string;
    type: string;
    url: string;
  };
}

const ChatWindow = ({ chat }: ChatWindowProps) => {
  const [message, setMessage] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { id: 1, text: "Hallo! Wie kann ich dir helfen?", sender: "them", time: "10:30" },
    { id: 2, text: "Ich habe eine Frage zu meinem Urlaubsantrag", sender: "me", time: "10:31" },
    { id: 3, text: "Natürlich, was möchtest du wissen?", sender: "them", time: "10:32" },
  ]);
  const [isMultiline, setIsMultiline] = useState(false);
  const [isWriting, setIsWriting] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [recording, setRecording] = useState<MediaRecorder | null>(null);
  const [audioChunks, setAudioChunks] = useState<Blob[]>([]);
  const { isListening, toggleListening, transcript, resetTranscript, currentMethod } = useHybridSpeechRecognition();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (transcript) {
      const command = transcript.toLowerCase();
      console.log('Sprachbefehl im Chat erkannt:', command);
      
      // Chat-spezifische Sprachbefehle
      if (command.includes('nachricht senden') && message.trim()) {
        handleSend();
        toast.success("Nachricht gesendet");
      } 
      else if (command.includes('nachricht aufnehmen') || command.includes('sprachnachricht')) {
        toggleRecording();
      }
      else if (command.includes('zusammenfassung erstellen') || command.includes('zusammenfassen')) {
        createAISummary();
      }
      else if (command.includes('projekt status') || command.includes('projektstand')) {
        sendProjectStatusRequest();
      }
      else if (command.includes('nächstes meeting') || command.includes('nächster termin')) {
        showNextMeeting();
      }
      else if ((command.includes('schreib') || command.includes('nachricht')) && command.length > 10) {
        // Extrahiere den Text nach "schreib" oder "nachricht"
        let text = "";
        if (command.includes('schreib')) {
          text = command.substring(command.indexOf('schreib') + 7);
        } else if (command.includes('nachricht')) {
          text = command.substring(command.indexOf('nachricht') + 10);
        }
        
        if (text.trim()) {
          setMessage(text.trim());
          toast.info("Text durch Spracherkennung eingefügt");
        }
      }
      
      resetTranscript();
    }
  }, [transcript, resetTranscript, message]);

  const handleSend = () => {
    if (!message.trim()) return;
    
    const newMessage: Message = {
      id: Date.now(),
      text: message,
      sender: "me",
      time: new Date().toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' })
    };
    
    setMessages([...messages, newMessage]);
    setMessage("");
    
    // Simuliere Antwort vom Empfänger
    setIsWriting(true);
    
    setTimeout(() => {
      const responseMessage: Message = {
        id: Date.now() + 1,
        text: "Danke für deine Nachricht. Ich werde mich darum kümmern.",
        sender: "them",
        time: new Date().toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' })
      };
      
      setMessages(prev => [...prev, responseMessage]);
      setIsWriting(false);
    }, 2000);
  };

  // Bestimme das beste unterstützte Audio-Format
  const getSupportedMimeType = (): string => {
    const mimeTypes = [
      'audio/mp4',
      'audio/mpeg',
      'audio/ogg;codecs=opus',
      'audio/webm;codecs=opus',
      'audio/webm',
    ];
    
    for (const mimeType of mimeTypes) {
      if (MediaRecorder.isTypeSupported(mimeType)) {
        console.log('🎤 Verwende Audio-Format:', mimeType);
        return mimeType;
      }
    }
    
    console.log('🎤 Fallback auf Standard-Format');
    return '';
  };

  const toggleRecording = async () => {
    try {
      if (isRecording) {
        // Beende Aufnahme
        recording?.stop();
        setIsRecording(false);
        toast.info("Sprachaufnahme beendet");
      } else {
        // Starte Aufnahme mit kompatiblem Format
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        
        const mimeType = getSupportedMimeType();
        const options: MediaRecorderOptions = mimeType ? { mimeType } : {};
        
        const mediaRecorder = new MediaRecorder(stream, options);
        const actualMimeType = mediaRecorder.mimeType || 'audio/webm';
        console.log('🎤 MediaRecorder verwendet:', actualMimeType);
        
        setRecording(mediaRecorder);
        
        const chunks: Blob[] = [];
        mediaRecorder.ondataavailable = (e) => {
          chunks.push(e.data);
          setAudioChunks(chunks);
        };
        
        mediaRecorder.onstop = () => {
          // Verwende das tatsächliche MIME-Type des Recorders
          const audioBlob = new Blob(chunks, { type: actualMimeType });
          const audioUrl = URL.createObjectURL(audioBlob);
          
          console.log('🎤 Audio aufgenommen:', { 
            mimeType: actualMimeType, 
            size: audioBlob.size,
            chunks: chunks.length 
          });
          
          // Füge Sprachnachricht hinzu
          const voiceMessage: Message = {
            id: Date.now(),
            text: "Sprachnachricht",
            sender: "me",
            time: new Date().toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' }),
            isVoice: true,
            voiceUrl: audioUrl
          };
          
          setMessages(prev => [...prev, voiceMessage]);
          
          // Streams schließen
          stream.getTracks().forEach(track => track.stop());
        };
        
        mediaRecorder.start();
        setIsRecording(true);
        toast.info("Sprachaufnahme gestartet");
      }
    } catch (error) {
      console.error("Fehler bei der Aufnahme:", error);
      toast.error("Mikrofon konnte nicht aktiviert werden");
    }
  };

  const createAISummary = () => {
    toast.info("KI erstellt eine Zusammenfassung...");
    
    setTimeout(() => {
      const summaryMessage: Message = {
        id: Date.now(),
        text: "📝 **Zusammenfassung des Gesprächs:**\n\n- Thema: Urlaubsantrag\n- Offene Fragen: Status des Antrags, Genehmigungsprozess\n- Nächste Schritte: Vorgesetzte/r prüft den Antrag bis spätestens Donnerstag\n\nSoll ich diese Zusammenfassung als Dokument speichern?",
        sender: "ai",
        time: new Date().toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' })
      };
      
      setMessages(prev => [...prev, summaryMessage]);
    }, 1500);
  };

  const sendProjectStatusRequest = () => {
    toast.info("Projektdaten werden abgerufen...");
    
    setTimeout(() => {
      const statusMessage: Message = {
        id: Date.now(),
        text: "🚀 **Projektstatus: Website-Relaunch**\n\n- Fortschritt: 68%\n- Deadline: 15.06.2025\n- Offene Aufgaben: 12\n- Letzte Aktivität: vor 2 Stunden\n- Team: Lisa, Thomas, Jana\n\nSoll ich mehr Details anzeigen?",
        sender: "ai",
        time: new Date().toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' })
      };
      
      setMessages(prev => [...prev, statusMessage]);
    }, 1000);
  };

  const showNextMeeting = () => {
    toast.info("Kalenderdaten werden abgerufen...");
    
    setTimeout(() => {
      const meetingMessage: Message = {
        id: Date.now(),
        text: "📅 **Nächster Termin**\n\n- Projektbesprechung: Website-Relaunch\n- Morgen, 10:00 - 11:00 Uhr\n- Teilnehmer: Du, Thomas, Lisa, Jana\n- Ort: Konferenzraum 2\n\nZum Kalender hinzufügen?",
        sender: "ai",
        time: new Date().toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' })
      };
      
      setMessages(prev => [...prev, meetingMessage]);
    }, 800);
  };

  return (
    <div className="h-full flex flex-col bg-gray-50 dark:bg-gray-900">
      {/* Chat Header */}
      <div className="p-3 border-b border-primary/20 bg-white dark:bg-gray-800 shadow-sm">
        <div className="flex items-center gap-3">
          <Avatar>
            <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${chat.name}`} />
            <AvatarFallback>{chat.name.charAt(0)}</AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h2 className="font-medium">{chat.name}</h2>
              <Badge variant="outline" className="text-xs bg-green-50 text-green-600 border-green-200">
                Online
              </Badge>
            </div>
            <p className="text-xs text-gray-500">Zuletzt aktiv vor 5 Minuten</p>
          </div>
          <div className="flex gap-1">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" onClick={() => toast.info("Kalender wird geöffnet")}>
                    <Calendar className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Meeting planen</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Bot className="h-4 w-4" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-80">
                <div className="space-y-2">
                  <h3 className="font-medium">KI-Assistent</h3>
                  <p className="text-sm text-gray-500">Wie kann ich dir helfen?</p>
                  <div className="grid gap-1">
                    <Button variant="outline" size="sm" className="justify-start" onClick={createAISummary}>
                      <FileText className="h-3.5 w-3.5 mr-2" />
                      Zusammenfassung erstellen
                    </Button>
                    <Button variant="outline" size="sm" className="justify-start" onClick={sendProjectStatusRequest}>
                      <MessageSquare className="h-3.5 w-3.5 mr-2" />
                      Projektstatus anzeigen
                    </Button>
                    <Button variant="outline" size="sm" className="justify-start" onClick={showNextMeeting}>
                      <Clock className="h-3.5 w-3.5 mr-2" />
                      Nächstes Meeting anzeigen
                    </Button>
                  </div>
                </div>
              </PopoverContent>
            </Popover>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${msg.sender === "me" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[70%] rounded-lg p-3 shadow-sm ${
                msg.sender === "me"
                  ? "bg-primary text-white"
                  : msg.sender === "ai"
                  ? "bg-purple-100 border border-purple-300 text-gray-900"
                  : "bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border border-primary/20"
              }`}
            >
              {msg.isVoice ? (
                <div className="flex flex-col">
                  <span className="text-xs opacity-70 mb-1">Sprachnachricht</span>
                  <audio src={msg.voiceUrl} controls className="w-full max-w-[200px] h-10" />
                </div>
              ) : (
                <div>
                  <p className="whitespace-pre-line">{msg.text}</p>
                  <span className="text-xs opacity-70 mt-1 block">{msg.time}</span>
                </div>
              )}
              
              {msg.attachment && (
                <div className="mt-2 p-2 bg-gray-100 dark:bg-gray-700 rounded">
                  <div className="flex items-center">
                    <FileText className="h-4 w-4 mr-2" />
                    <span className="text-sm">{msg.attachment.name}</span>
                  </div>
                  <Button variant="link" size="sm" className="h-auto p-0 mt-1">
                    Öffnen
                  </Button>
                </div>
              )}
            </div>
          </div>
        ))}
        {isWriting && (
          <div className="flex justify-start">
            <div className="bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 rounded-lg p-3 shadow-sm max-w-[70%]">
              <div className="flex items-center space-x-1">
                <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '0ms' }}></div>
                <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '150ms' }}></div>
                <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '300ms' }}></div>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-3 border-t border-primary/20 bg-white dark:bg-gray-800 shadow-sm">
        <div className="flex flex-col space-y-2">
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={() => toast.info("Datei-Upload kommt bald")}>
              <Paperclip className="h-5 w-5" />
            </Button>
            
            {isMultiline ? (
              <Textarea
                placeholder="Nachricht schreiben..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSend();
                  }
                }}
                className="flex-1 border-primary/30 min-h-[80px]"
              />
            ) : (
              <Input
                placeholder="Nachricht schreiben..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleSend()}
                className="flex-1 border-primary/30"
              />
            )}
            
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => setIsMultiline(!isMultiline)}
              className="text-gray-500"
            >
              {isMultiline ? (
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3 6h18M3 12h18M3 18h9" />
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 6H3M21 12H3M21 18H3" />
                </svg>
              )}
            </Button>
            
            <Button variant="ghost" size="icon" onClick={() => toast.info("Emojis kommen bald")}>
              <Smile className="h-5 w-5" />
            </Button>
            
            <Button variant="ghost" size="icon" onClick={toggleRecording}>
              {isRecording ? (
                <MicOff className="h-5 w-5 text-red-500" />
              ) : (
                <Mic className="h-5 w-5" />
              )}
            </Button>
            
            <VoiceAssistantButton
              isListening={isListening}
              toggleListening={toggleListening}
              currentMethod={currentMethod}
            />
            
            <Button onClick={handleSend} disabled={!message.trim()} className="shadow-sm">
              <Send className="h-5 w-5" />
            </Button>
          </div>
          
          {/* KI-Assistent-Vorschläge */}
          <div className="flex gap-2 overflow-x-auto py-1 px-1">
            <Button variant="outline" size="sm" className="whitespace-nowrap" onClick={sendProjectStatusRequest}>
              Projektstand anzeigen
            </Button>
            <Button variant="outline" size="sm" className="whitespace-nowrap" onClick={createAISummary}>
              Gespräch zusammenfassen
            </Button>
            <Button variant="outline" size="sm" className="whitespace-nowrap" onClick={showNextMeeting}>
              Meeting planen
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatWindow;
