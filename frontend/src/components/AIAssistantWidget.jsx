import { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { NavLink } from 'react-router-dom';
import api from '../api/client';
import {
  IconSparkleTech,
  IconAIBot,
  IconAcademicDocs,
  IconSupportHeadset,
  IconUnionEmblem,
  IconTransitVehicle,
  IconTrashTech,
  IconUserTech,
} from './TechIcons';
import './AIAssistantWidget.css';

export default function AIAssistantWidget() {
  const { t, i18n } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState([]);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const currentLang = i18n.language === 'or' ? 'or' : 'en';

  // Initialize welcome message based on language
  useEffect(() => {
    const initialGreeting =
      currentLang === 'or'
        ? {
            id: 'welcome',
            sender: 'ai',
            text: "Akkam! Ani Gargaaraa AI Gamtaa Barattoota Shanan Gibee ti. Waa'ee barnootaa, qormaatawwan darban, doormii, ykn tajaajila gamtaa maal isin gargaaruu danda'a?",
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          }
        : {
            id: 'welcome',
            sender: 'ai',
            text: 'Hello! I am the GBSG AI Student Assistant. I can help you with campus guides, past exams & handbooks, union bylaws, or student support. How can I help you today?',
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          };

    setMessages([initialGreeting]);
  }, [currentLang]);

  // Auto-scroll to bottom when messages update
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isLoading, isOpen]);

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 150);
    }
  }, [isOpen]);

  const starterSuggestions =
    currentLang === 'or'
      ? [
          { text: 'Sanadoota barnootaa eessan argadha?', label: 'Qormaatawwan Darban', icon: IconAcademicDocs },
          { text: 'Rakkoo doormiitiif gargaarsa akkamiin gaafadha?', label: 'Gargaarsa Gaafadhu', icon: IconSupportHeadset },
          { text: 'Hoggansa gamtaa akkamiin qunnama?', label: 'Hoggansa Gamtaa', icon: IconUserTech },
          { text: 'Geejjiba boqonnaa akkamiin qindeessina?', label: 'Geejjiba Boqonnaa', icon: IconTransitVehicle },
        ]
      : [
          { text: 'Where can I find past exams & handbooks?', label: 'Past Exams & Notes', icon: IconAcademicDocs },
          { text: 'How do I submit a student support request?', label: 'Get Support', icon: IconSupportHeadset },
          { text: 'Tell me about the Shanan Gibe Union mission.', label: 'Union Mission', icon: IconUnionEmblem },
          { text: 'How does break rideshare work?', label: 'Break Rideshare', icon: IconTransitVehicle },
        ];

  const handleSendMessage = async (textToSend) => {
    const userQuery = (textToSend || inputMessage).trim();
    if (!userQuery || isLoading) return;

    const userMessageObj = {
      id: Date.now().toString(),
      sender: 'user',
      text: userQuery,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMessageObj]);
    setInputMessage('');
    setIsLoading(true);

    try {
      // Build previous message history for conversational context
      const chatHistory = messages
        .filter((m) => m.id !== 'welcome')
        .slice(-6)
        .map((m) => ({ sender: m.sender, text: m.text }));

      const res = await api.post('/ai/chat', {
        message: userQuery,
        history: chatHistory,
        language: currentLang,
      });

      const aiReplyObj = {
        id: (Date.now() + 1).toString(),
        sender: 'ai',
        text: res.data.reply || 'Thank you for your message.',
        isFallback: res.data.isFallback,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, aiReplyObj]);
    } catch (err) {
      const errorReply = {
        id: (Date.now() + 1).toString(),
        sender: 'ai',
        text:
          currentLang === 'or'
            ? 'Dogoggorri uumameera. Maaloo daqiiqaa muraasa booda irra deebi\'aa yaalaa.'
            : 'I encountered an issue reaching the AI network. Please try again in a moment.',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, errorReply]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleClearChat = () => {
    const greeting =
      currentLang === 'or'
        ? {
            id: 'welcome',
            sender: 'ai',
            text: "Seenaan marii haqameera. Gaaffii biraa yoo qabaattan na gaafachuu dandeessu!",
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          }
        : {
            id: 'welcome',
            sender: 'ai',
            text: 'Chat history cleared. Feel free to ask another question!',
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          };
    setMessages([greeting]);
  };

  // Convert simple markdown links into formatted text
  const formatAIText = (content) => {
    if (!content) return '';
    const parts = content.split('\n');
    return parts.map((line, idx) => {
      const isBullet = line.trim().startsWith('- ') || line.trim().startsWith('* ');
      const cleanLine = isBullet ? line.trim().substring(2) : line;

      return (
        <div key={idx} className={isBullet ? 'ai-bullet-item' : 'ai-text-line'}>
          {isBullet && <span className="ai-bullet-bullet">•</span>}
          <span>
            {cleanLine.split(/(\*\*.*?\*\*)/g).map((chunk, cIdx) => {
              if (chunk.startsWith('**') && chunk.endsWith('**')) {
                return <strong key={cIdx}>{chunk.slice(2, -2)}</strong>;
              }
              return chunk;
            })}
          </span>
        </div>
      );
    });
  };

  return (
    <div className="ai-widget-root">
      {/* Floating Action Trigger Button */}
      {!isOpen && (
        <button
          type="button"
          className="ai-widget-fab"
          onClick={() => setIsOpen(true)}
          aria-label="Open AI Student Assistant"
        >
          <span className="ai-fab-sparkle">
            <IconSparkleTech size={18} color="var(--color-star-gold)" />
          </span>
          <span className="ai-fab-label">
            {currentLang === 'or' ? 'Gargaaraa AI' : 'AI Assistant'}
          </span>
          <span className="ai-fab-badge" />
        </button>
      )}

      {/* Expanded AI Chat Modal / Drawer */}
      {isOpen && (
        <div className="ai-chat-window">
          {/* Header */}
          <div className="ai-chat-header">
            <div className="ai-header-info">
              <div className="ai-header-avatar">
                <IconAIBot size={18} color="var(--color-star-gold)" />
              </div>
              <div>
                <strong className="ai-header-title">
                  {currentLang === 'or' ? 'Gargaaraa AI Gamtaa' : 'GBSG AI Assistant'}
                </strong>
                <span className="ai-header-status">
                  <span className="status-dot" /> Powered by Gemini
                </span>
              </div>
            </div>

            <div className="ai-header-actions">
              <button
                type="button"
                className="ai-header-btn"
                onClick={handleClearChat}
                title="Clear conversation"
                aria-label="Clear conversation"
              >
                <IconTrashTech size={15} />
              </button>
              <button
                type="button"
                className="ai-header-btn"
                onClick={() => setIsOpen(false)}
                title="Close chat"
                aria-label="Close chat"
              >
                ✕
              </button>
            </div>
          </div>

          {/* Quick Starter Suggestion Chips (when 1 message) */}
          {messages.length <= 1 && (
            <div className="ai-starter-chips">
              <span className="chips-label">
                {currentLang === 'or' ? 'Gaaffiiwwan Dhiyaatan:' : 'Suggested Questions:'}
              </span>
              <div className="chips-container">
                {starterSuggestions.map((chip, idx) => {
                  const ChipIcon = chip.icon;
                  return (
                    <button
                      key={idx}
                      type="button"
                      className="ai-chip-btn"
                      onClick={() => handleSendMessage(chip.text)}
                    >
                      {ChipIcon && <ChipIcon size={13} style={{ marginRight: 4 }} />}
                      <span>{chip.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Message Stream */}
          <div className="ai-messages-stream">
            {messages.map((msg) => (
              <div key={msg.id} className={`ai-message-row ai-message-row--${msg.sender}`}>
                {msg.sender === 'ai' && (
                  <div className="ai-msg-avatar">
                    <IconAIBot size={15} color="var(--color-star-gold)" />
                  </div>
                )}
                <div className="ai-message-bubble">
                  <div className="ai-message-text">{formatAIText(msg.text)}</div>
                  <div className="ai-message-time">{msg.time}</div>
                </div>
              </div>
            ))}

            {/* Live Typing Indicator */}
            {isLoading && (
              <div className="ai-message-row ai-message-row--ai">
                <div className="ai-msg-avatar">
                  <IconAIBot size={15} color="var(--color-star-gold)" />
                </div>
                <div className="ai-message-bubble ai-typing-bubble">
                  <span className="ai-dot" />
                  <span className="ai-dot" />
                  <span className="ai-dot" />
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Quick Hub Navigation Shortcuts */}
          <div className="ai-quick-shortcuts">
            <NavLink to="/resources" onClick={() => setIsOpen(false)} className="ai-quick-link">
              <IconAcademicDocs size={13} style={{ marginRight: 4 }} /> Past Exams & Notes
            </NavLink>
            <NavLink to="/support" onClick={() => setIsOpen(false)} className="ai-quick-link">
              <IconSupportHeadset size={13} style={{ marginRight: 4 }} /> Human Support Ticket
            </NavLink>
          </div>

          {/* Input Bar */}
          <div className="ai-input-bar">
            <input
              ref={inputRef}
              type="text"
              className="ai-chat-input"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={
                currentLang === 'or'
                  ? 'Gaaffii keessan asitti barreessaa...'
                  : 'Ask about courses, exams, union info...'
              }
              disabled={isLoading}
            />
            <button
              type="button"
              className="ai-send-btn"
              onClick={() => handleSendMessage()}
              disabled={!inputMessage.trim() || isLoading}
              aria-label="Send message"
            >
              ➤
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

