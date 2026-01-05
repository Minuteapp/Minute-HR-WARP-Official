import { useState, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Mic, MicOff, Loader2 } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { supabase } from '@/integrations/supabase/client'

interface ChatVoiceButtonProps {
  onTranscription: (text: string, intentData?: any) => void
  disabled?: boolean
}

export const ChatVoiceButton = ({ onTranscription, disabled }: ChatVoiceButtonProps) => {
  const [isRecording, setIsRecording] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioChunksRef = useRef<Blob[]>([])
  const { toast } = useToast()

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const mediaRecorder = new MediaRecorder(stream)
      mediaRecorderRef.current = mediaRecorder
      audioChunksRef.current = []

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data)
        }
      }

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' })
        await processAudio(audioBlob)
        
        // Stop all tracks
        stream.getTracks().forEach(track => track.stop())
      }

      mediaRecorder.start()
      setIsRecording(true)
    } catch (error) {
      console.error('Failed to start recording:', error)
      toast({
        variant: 'destructive',
        title: 'Aufnahme fehlgeschlagen',
        description: 'Mikrofon-Zugriff wurde verweigert oder ist nicht verfügbar'
      })
    }
  }

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop()
      setIsRecording(false)
    }
  }

  const processAudio = async (audioBlob: Blob) => {
    setIsProcessing(true)
    console.log('🎤 Processing audio, blob size:', audioBlob.size, 'bytes')
    
    try {
      // Promise-basierte Base64-Konvertierung
      const base64Audio = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader()
        reader.onloadend = () => {
          const result = reader.result as string
          // Extrahiere nur den reinen Base64-Teil ohne "data:audio/webm;base64," Prefix
          const base64 = result.split(',')[1]
          if (base64) {
            console.log('🎤 Base64 extracted, length:', base64.length)
            resolve(base64)
          } else {
            reject(new Error('Failed to convert audio to base64'))
          }
        }
        reader.onerror = () => reject(new Error('FileReader error'))
        reader.readAsDataURL(audioBlob)
      })

      console.log('🎤 Rufe chat-voice-to-text Edge Function auf...')
      
      // Edge Function mit supabase.functions.invoke aufrufen
      const { data: result, error: fnError } = await supabase.functions.invoke('chat-voice-to-text', {
        body: {
          audio: base64Audio,
          detect_intent: true
        }
      })

      if (fnError) {
        console.error('🎤 Edge function error:', fnError)
        throw new Error(fnError.message || 'Voice processing failed')
      }

      console.log('🎤 Transcription result:', result)
      
      if (result.text) {
        onTranscription(result.text, result.intent)
        toast({
          title: 'Sprachnachricht erkannt',
          description: result.text,
        })
      } else {
        toast({
          variant: 'destructive',
          title: 'Keine Sprache erkannt',
          description: 'Bitte sprechen Sie deutlicher'
        })
      }
    } catch (error) {
      console.error('🎤 Failed to process audio:', error)
      toast({
        variant: 'destructive',
        title: 'Verarbeitung fehlgeschlagen',
        description: error instanceof Error ? error.message : 'Sprachnachricht konnte nicht verarbeitet werden'
      })
    } finally {
      setIsProcessing(false)
    }
  }

  const handleClick = () => {
    if (isRecording) {
      stopRecording()
    } else {
      startRecording()
    }
  }

  return (
    <Button
      type="button"
      variant={isRecording ? 'destructive' : 'ghost'}
      size="icon"
      onClick={handleClick}
      disabled={disabled || isProcessing}
      className="shrink-0"
    >
      {isProcessing ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : isRecording ? (
        <MicOff className="h-4 w-4 animate-pulse" />
      ) : (
        <Mic className="h-4 w-4" />
      )}
    </Button>
  )
}