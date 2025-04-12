import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Video, Paperclip, X, Mic, Volume2, VolumeX } from 'lucide-react';
import { error } from 'console';
import { Codechatbot } from '../../components/api/courseDataApi';

interface Attachment {
  type: 'video' | 'image' | 'audio' | 'file';
  name: string;
  url?: string;
}

interface Message {
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
  attachment?: Attachment | null;
  isError?: boolean;
  audioBase64?: string;
}

// Available speakers for TTS
const speakers = ["meera", "pavithra", "maitreyi", "arvind", "amol", "amartya", "diya", "neel", "misha", "vian", "arjun", "maya"];

// Simple chatbot function for demo purposes
const chatWithBot = async (input: string) => {
  // Simulate API call delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Return a simple response based on input
  if (input.toLowerCase().includes('error')) {
    throw new Error('Error in processing your request');
  }

  if (input.toLowerCase().includes('hello') || input.toLowerCase().includes('hi')) {
    return "Hello! How can I help you with coding today?";
  }
  
  if (input.toLowerCase().includes('javascript') || input.toLowerCase().includes('js')) {
    return "JavaScript is a versatile programming language. What specific aspect do you need help with?";
  }
  
  if (input.toLowerCase().includes('python')) {
    return "Python is known for its readability and simplicity. Do you have a specific Python question?";
  }
  
  if (input.toLowerCase().includes('react')) {
    return "React is a popular JavaScript library for building user interfaces. What are you trying to build?";
  }
  
  return `I've analyzed your question about "${input}". Could you provide more details so I can give you a more specific answer?`;
};

const CodeChatBot = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [attachment, setAttachment] = useState<Attachment | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  
  const [isRecording, setIsRecording] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<BlobPart[]>([]);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  
  useEffect(() => {
    audioRef.current = new Audio();
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  const API_KEY = "1742b802-6774-4aec-9f2f-38d9eafac98c"; 
  const STT_URL = "https://api.sarvam.ai/speech-to-text";
  const TTS_URL = "https://api.sarvam.ai/text-to-speech";

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
      
      if (mediaRecorderRef.current) {
        mediaRecorderRef.current.stop();
        mediaRecorderRef.current = null;
      }

      if (attachment && attachment.url) {
        URL.revokeObjectURL(attachment.url);
      }
    };
  }, [attachment]);

  const convertSpeechToText = async (audioBlob: Blob): Promise<string> => {
    
    const formData = new FormData();
    formData.append('file', audioBlob, 'recording.wav');
    formData.append('model', 'saarika:v2');
    formData.append('language_code', 'unknown'); 

    try {
      const response = await fetch(STT_URL, {
        method: 'POST',
        headers: {
          'api-subscription-key': API_KEY,
        },
        body: formData
      });

      if (!response.ok) {
        console.error('STT API error:', response.status);
        return 'Speech to text conversion failed: ' + response.statusText;
      }
      
      const data = await response.json();
      return data.text || 'No text recognized';
    } catch (error) {
      console.error('Speech to text error:', error);
      return 'Speech to text conversion failed'+error;
    }
  };
  const convertTextToSpeech = async (text: string): Promise<string | null> => {
    
    try {
      const speaker = speakers[Math.floor(Math.random() * speakers.length)];
      
      const response = await fetch(TTS_URL, {
        method: 'POST',
        headers: {
          'api-subscription-key': "1742b802-6774-4aec-9f2f-38d9eafac98c",
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          inputs: [text.substring(0, 1000)],
          target_language_code: 'en-IN',
          speaker: speaker,
          pace: 1.0,
          loudness: 1.2,
          speech_sample_rate: 22050,
          enable_preprocessing: true
        })
      });

      if (!response.ok) {
        console.error('TTS API error:', response.status);
        return null;
      }
      
      const data = await response.json();
      
      if (data.audios && data.audios.length > 0) {
        return data.audios[0];
      } else if (data.audio_base64) {
        return data.audio_base64;
      }
      
      return null;
    } catch (error) {
      console.error('Text to speech error:', error);
      return null;
    }
  };

  const playAudio = async (base64Audio: string) => {
    if (!base64Audio || !audioRef.current) return;

    try {
      // Convert base64 to blob
      const byteCharacters = atob(base64Audio);
      const byteNumbers = new Array(byteCharacters.length);
      
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      
      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], { type: 'audio/wav' });
      
      const audioUrl = URL.createObjectURL(blob);
      
      audioRef.current.pause();
      if (audioRef.current.src) {
        URL.revokeObjectURL(audioRef.current.src);
      }
      
      audioRef.current.src = audioUrl;
      audioRef.current.onplay = () => setIsPlaying(true);
      audioRef.current.onended = () => {
        setIsPlaying(false);
        URL.revokeObjectURL(audioUrl);
      };
      audioRef.current.play().catch(err => {
        console.error("Audio playback error:", err);
        setIsPlaying(false);
      });
    } catch (error) {
      console.error('Error playing audio:', error);
      setIsPlaying(false);
    }
  };

  const stopAudio = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      setIsPlaying(false);
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      audioChunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorderRef.current.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
        
        setInput("Converting speech to text...");
        
        const text = await convertSpeechToText(audioBlob);
        if (text) {
          setInput(text);
        }

        stream.getTracks().forEach(track => track.stop());
      };

      setIsRecording(true);
      mediaRecorderRef.current.start();
    } catch (error) {
      console.error('Error starting recording:', error);
      setIsRecording(false);
      setInput("Error accessing microphone. Please check permissions.");
    }
  };
  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() && !attachment) return;

    const userMessage: Message = { 
      text: input, 
      sender: 'user', 
      timestamp: new Date(),
      attachment: attachment
    };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setAttachment(null);
    setIsLoading(true);

    try {
      const response = await Codechatbot(input);
      
      // Add bot response
      const botMessage: Message = { 
        text: response, 
        sender: 'bot', 
        timestamp: new Date() 
      };
      setMessages(prev => [...prev, botMessage]);
      
      if (API_KEY) {
        try {
          const audioBase64 = await convertTextToSpeech(response);
          if (audioBase64) {
            setMessages(prev => 
              prev.map(msg => 
                msg === botMessage ? { ...msg, audioBase64 } : msg
              )
            );
          }
        } catch (error) {
          console.error("TTS error:", error);
        }
      }
    } catch (error) {
      console.error("Error in chat:", error);
      const errorMessage: Message = { 
        text: "An error occurred. Please try again later.", 
        sender: 'bot', 
        timestamp: new Date(),
        isError: true 
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check file type and create appropriate attachment
    if (file.type.startsWith('video/')) {
      setAttachment({
        type: 'video',
        name: file.name,
        url: URL.createObjectURL(file)
      });
    } else if (file.type.startsWith('image/')) {
      setAttachment({
        type: 'image',
        name: file.name,
        url: URL.createObjectURL(file)
      });
    } else if (file.type.startsWith('audio/')) {
      setAttachment({
        type: 'audio',
        name: file.name,
        url: URL.createObjectURL(file)
      });
    } else {
      setAttachment({
        type: 'file',
        name: file.name
      });
    }
  };

  const removeAttachment = () => {
    if (attachment && attachment.url) {
      URL.revokeObjectURL(attachment.url);
    }
    setAttachment(null);
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const TextToSpeechControl = ({ text, audioBase64 }: { text: string, audioBase64?: string }) => {
    const handleClick = () => {
      if (isPlaying) {
        stopAudio();
      } else if (audioBase64) {
        playAudio(audioBase64);
      }
    };
    
    return (
      <button 
        onClick={handleClick}
        className="flex items-center text-gray-400 hover:text-green-400 transition-colors"
      >
        {isPlaying ? (
          <VolumeX className="w-4 h-4" />
        ) : (
          <Volume2 className="w-4 h-4" />
        )}
        <span className="ml-1">{isPlaying ? 'Stop' : 'Listen'}</span>
      </button>
    );
  };

  return (
    <div className="flex flex-col h-96 md:h-96 w-full max-w-2xl mx-auto border border-gray-700 rounded-lg shadow-lg bg-gray-900">
      {/* Header */}
      <div className="flex items-center p-4 border-b border-gray-700 bg-gradient-to-r from-gray-800 to-gray-900 text-gray-100 rounded-t-lg">
        <Bot className="w-6 h-6 text-green-400 mr-2" />
        <h2 className="text-lg font-medium">AI Coding Assistant</h2>
      </div>

      {/* Messages */}
      <div className="flex-1 p-4 overflow-y-auto bg-gray-800">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-400">
            <Bot className="w-12 h-12 mb-3 text-yellow-500" />
            <p className="text-lg mb-1 text-gray-300">Ask me anything about coding!</p>
            <p className="text-sm text-gray-500">You can also use voice, share videos or images for help</p>
          </div>
        ) : (
          messages.map((message, index) => (
            <div 
              key={index} 
              className={`flex mb-4 ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div 
                className={`flex max-w-[80%] ${
                  message.sender === 'user' 
                    ? 'bg-gray-700 text-gray-100 rounded-tl-lg rounded-tr-lg rounded-bl-lg border-l-4 border-yellow-500' 
                    : message.isError 
                      ? 'bg-gray-700 text-gray-100 rounded-tl-lg rounded-tr-lg rounded-br-lg border-l-4 border-red-500'
                      : 'bg-gray-700 text-gray-100 rounded-tl-lg rounded-tr-lg rounded-br-lg border-l-4 border-green-500'
                } p-3 shadow-lg`}
              >
                {message.sender === 'bot' && (
                  <Bot className="w-5 h-5 mr-2 mt-1 flex-shrink-0 text-green-400" />
                )}
                <div className="w-full">
                  <div className="whitespace-pre-wrap">{message.text}</div>
                  
                  {/* Render attachment if exists */}
                  {message.attachment && message.attachment.type === 'video' && message.attachment.url && (
                    <div className="mt-2 rounded-md overflow-hidden border border-gray-600">
                      <video 
                        src={message.attachment.url} 
                        controls 
                        className="w-full max-h-64 object-contain rounded"
                      />
                    </div>
                  )}
                  
                  {message.attachment && message.attachment.type === 'image' && message.attachment.url && (
                    <div className="mt-2 rounded-md overflow-hidden border border-gray-600">
                      <img 
                        src={message.attachment.url} 
                        alt="Attached image"
                        className="w-full max-h-64 object-contain rounded"
                      />
                    </div>
                  )}
                  
                  {message.attachment && message.attachment.type === 'audio' && message.attachment.url && (
                    <div className="mt-2 rounded-md overflow-hidden border border-gray-600">
                      <audio 
                        src={message.attachment.url} 
                        controls 
                        className="w-full"
                      />
                    </div>
                  )}
                  
                  <div className="flex justify-between items-center text-xs mt-1 opacity-70 text-gray-400">
                    {message.sender === 'bot' && (
                      <TextToSpeechControl 
                        text={message.text} 
                        audioBase64={message.audioBase64}
                      />
                    )}
                    <span className="ml-auto">{formatTime(message.timestamp)}</span>
                  </div>
                </div>
                {message.sender === 'user' && (
                  <User className="w-5 h-5 ml-2 mt-1 flex-shrink-0 text-yellow-400" />
                )}
              </div>
            </div>
          ))
        )}
        {isLoading && (
          <div className="flex justify-start mb-4">
            <div className="bg-gray-700 text-gray-100 rounded-lg p-3 shadow-md border-l-4 border-green-500">
              <div className="flex items-center">
                <Bot className="w-5 h-5 mr-2 text-green-400" />
                <div className="flex space-x-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
                </div>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Attachment preview */}
      {attachment && (
        <div className="px-4 pt-2 bg-gray-800">
          <div className="flex items-center bg-gray-700 p-2 rounded-md border border-gray-600">
            {attachment.type === 'video' ? (
              <Video className="w-4 h-4 mr-2 text-yellow-400" />
            ) : attachment.type === 'image' && attachment.url ? (
              <img src={attachment.url} alt="Preview" className="w-8 h-8 object-cover mr-2 rounded border border-gray-600" />
            ) : attachment.type === 'audio' ? (
              <Volume2 className="w-4 h-4 mr-2 text-yellow-400" />
            ) : (
              <Paperclip className="w-4 h-4 mr-2 text-yellow-400" />
            )}
            <span className="text-sm truncate flex-1 text-gray-300">{attachment.name}</span>
            <button 
              onClick={removeAttachment}
              className="p-1 hover:bg-gray-600 rounded-full transition-colors duration-200"
            >
              <X className="w-4 h-4 text-red-400" />
            </button>
          </div>
        </div>
      )}

      {/* Input area */}
      <form onSubmit={handleSubmit} className="border-t border-gray-700 p-4 bg-gray-800 rounded-b-lg">
        <div className="flex items-center">
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="p-2 text-gray-400 hover:text-yellow-400 focus:outline-none transition-colors duration-200"
          >
            <Paperclip className="w-5 h-5" />
          </button>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            className="hidden"
            accept="video/*,image/*,audio/*"
          />
          
          {/* Voice recording button */}
          <button
            type="button"
            onMouseDown={startRecording}
            onMouseUp={stopRecording}
            onTouchStart={startRecording}
            onTouchEnd={stopRecording}
            className={`p-2 ${isRecording ? 'text-red-500' : 'text-gray-400 hover:text-yellow-400'} focus:outline-none transition-colors duration-200`}
          >
            <Mic className={`w-5 h-5 ${isRecording ? 'animate-pulse' : ''}`} />
          </button>
          
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask a coding question or speak..."
            className="flex-1 p-2 bg-gray-700 border border-gray-600 text-gray-100 rounded-l-md focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent placeholder-gray-500"
            disabled={isLoading || isRecording}
          />
          <button
            type="submit"
            className="bg-green-600 hover:bg-green-700 text-white p-2 rounded-r-md focus:outline-none focus:ring-2 focus:ring-green-500 transition-colors duration-200 disabled:bg-gray-600 disabled:text-gray-400"
            disabled={isLoading || (!input.trim() && !attachment) || isRecording}
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </form>
    </div>
  );
};

export default CodeChatBot;