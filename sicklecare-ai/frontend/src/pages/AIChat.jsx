import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { sendChat } from '../lib/api';
import BottomNav from '../components/BottomNav';

export default function AIChat() {
  const navigate = useNavigate();
  const [messages, setMessages] = useState([
    { role: 'assistant', text: 'Hi! I\'m your SickleCare AI assistant. Ask me anything about sickle cell disease, symptoms, or daily care. 🩸' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  async function handleSend() {
    if (!input.trim()) return;
    const userMsg = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setLoading(true);
    try {
      const { data } = await sendChat(userMsg);
      setMessages(prev => [...prev, { role: 'assistant', text: data.reply }]);
    } catch {
      setMessages(prev => [...prev, { role: 'assistant', text: 'Sorry, I\'m offline right now. Please try again later.' }]);
    }
    setLoading(false);
  }

  const suggestions = ['What triggers a crisis?', 'How much water should I drink?', 'What foods help?'];

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 pb-24">
      <div className="bg-brand text-white px-6 pt-10 pb-5 rounded-b-3xl">
        <button onClick={() => navigate('/dashboard')} className="text-white opacity-80 mb-2">← Back</button>
        <h2 className="text-2xl font-extrabold">🤖 AI Health Chat</h2>
        <p className="text-sm opacity-80">Ask about sickle cell care</p>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-xs px-4 py-3 rounded-2xl text-sm leading-relaxed ${m.role === 'user' ? 'bg-brand text-white rounded-br-sm' : 'bg-white text-gray-800 shadow rounded-bl-sm'}`}>
              {m.text}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-white px-4 py-3 rounded-2xl shadow text-gray-400 text-sm animate-pulse">Thinking...</div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Suggestions */}
      <div className="px-4 flex gap-2 overflow-x-auto pb-2">
        {suggestions.map(s => (
          <button key={s} onClick={() => setInput(s)}
            className="whitespace-nowrap px-3 py-2 rounded-full bg-white border border-gray-200 text-xs text-gray-600 shadow-sm">
            {s}
          </button>
        ))}
      </div>

      <div className="px-4 pb-4 flex gap-2 bg-gray-50">
        <input className="input-field flex-1" placeholder="Type your question..." value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleSend()} />
        <button onClick={handleSend} disabled={loading}
          className="px-5 py-3 rounded-xl bg-brand text-white font-bold text-lg active:scale-95 transition-transform">
          ➤
        </button>
      </div>

      <BottomNav />
    </div>
  );
}
