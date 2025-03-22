import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Video, Paperclip, X } from 'lucide-react';
import { Codechatbot } from '../../components/api/courseDataApi';
import "../../index.css";
const CodeChatBot = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [attachment, setAttachment] = useState(null);
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);

  // Scroll to bottom of messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim() && !attachment) return;

    // Add user message
    const userMessage = { 
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
      // Call chatbot function
      const response = await Codechatbot(input);
      
      if (response) {
        // Add bot response
        const botMessage = { text: response, sender: 'bot', timestamp: new Date() };
        setMessages(prev => [...prev, botMessage]);
      } else {
        // Handle error
        const errorMessage = { 
          text: "Sorry, I couldn't process your request at the moment.", 
          sender: 'bot', 
          timestamp: new Date(),
          isError: true 
        };
        setMessages(prev => [...prev, errorMessage]);
      }
    } catch (error) {
      console.error("Error in chat:", error);
      const errorMessage = { 
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

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Check if it's a video file
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

  const formatTime = (date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <>
    <div className="flex flex-col h-96 md:h-[32rem] w-full max-w-2xl mx-auto border border-gray-700 rounded-lg shadow-lg bg-gray-900">
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
            <p className="text-sm text-gray-500">You can also share videos or images for help</p>
          </div>
        ) : (
          messages.map((message, index) => (
            <div 
              key={index} 
              className={`flex mb-4 ${message.sender === 'user' ? 'justify-end' : 'justify-start'} transition-all duration-300 transform`}
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
                  {message.attachment && message.attachment.type === 'video' && (
                    <div className="mt-2 rounded-md overflow-hidden border border-gray-600">
                      <video 
                        src={message.attachment.url} 
                        controls 
                        className="w-full max-h-64 object-contain rounded"
                      />
                    </div>
                  )}
                  
                  {message.attachment && message.attachment.type === 'image' && (
                    <div className="mt-2 rounded-md overflow-hidden border border-gray-600">
                      <img 
                        src={message.attachment.url} 
                        alt="Attached image"
                        className="w-full max-h-64 object-contain rounded"
                      />
                    </div>
                  )}
                  
                  <div className="text-xs mt-1 opacity-70 text-right text-gray-400">
                    {formatTime(message.timestamp)}
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
            ) : attachment.type === 'image' ? (
              <img src={attachment.url} alt="Preview" className="w-8 h-8 object-cover mr-2 rounded border border-gray-600" />
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
            onClick={() => fileInputRef.current.click()}
            className="p-2 text-gray-400 hover:text-yellow-400 focus:outline-none transition-colors duration-200"
          >
            <Paperclip className="w-5 h-5" />
          </button>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            className="hidden"
            accept="video/*,image/*"
          />
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask a coding question..."
            className="flex-1 p-2 bg-gray-700 border border-gray-600 text-gray-100 rounded-l-md focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent placeholder-gray-500"
            disabled={isLoading}
          />
          <button
            type="submit"
            className="bg-green-600 hover:bg-green-700 text-white p-2 rounded-r-md focus:outline-none focus:ring-2 focus:ring-green-500 transition-colors duration-200 disabled:bg-gray-600 disabled:text-gray-400"
            disabled={isLoading || (!input.trim() && !attachment)}
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </form>
    </div>
</>
  );
};

export default CodeChatBot;