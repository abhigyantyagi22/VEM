import React, { useMemo, useState } from 'react';

const ISSUE_GUIDES = [
  {
    keywords: ['engine', 'start', 'crank', 'ignition', 'not starting'],
    title: 'Engine not starting',
    steps: [
      'Check battery terminals for loose connection or white powder corrosion.',
      'If lights are dim, try jump-starting or test battery voltage.',
      'Verify fuel level and listen for fuel pump sound when ignition turns on.',
      'If starter clicks repeatedly, battery or starter motor likely needs service.',
    ],
    urgency: 'If the car still does not start after jump-start, arrange roadside assistance.',
  },
  {
    keywords: ['overheat', 'temperature', 'hot', 'coolant', 'radiator'],
    title: 'Engine overheating',
    steps: [
      'Stop safely and switch off AC immediately.',
      'Do not open radiator cap while engine is hot.',
      'Check coolant level only after engine cools down.',
      'Inspect for coolant leaks under the vehicle.',
    ],
    urgency: 'Avoid driving with high temperature gauge to prevent engine damage.',
  },
  {
    keywords: ['brake', 'squeak', 'noise', 'grinding', 'pedal'],
    title: 'Brake noise or weak braking',
    steps: [
      'Check if brake warning light is on.',
      'Inspect brake fluid level in reservoir.',
      'Squeaking can indicate worn pads; grinding needs immediate replacement.',
      'If pedal feels spongy, braking system may need bleeding.',
    ],
    urgency: 'Drive only to nearest service center if braking feels unsafe.',
  },
  {
    keywords: ['tire', 'tyre', 'puncture', 'flat', 'pressure', 'wheel'],
    title: 'Tyre pressure or puncture',
    steps: [
      'Check tyre pressure against door sticker recommendation.',
      'Inspect tread for nails, cuts, or sidewall bulges.',
      'Use spare tyre if puncture is severe or sidewall is damaged.',
      'Rotate and balance tyres every 8,000-10,000 km.',
    ],
    urgency: 'Do not continue high-speed driving on low pressure tyres.',
  },
  {
    keywords: ['battery', 'drain', 'dead', 'alternator', 'charging'],
    title: 'Battery draining quickly',
    steps: [
      'Turn off headlights, cabin lights, and accessories after parking.',
      'Check battery age; most require replacement after 3-5 years.',
      'Look for signs of alternator failure (battery light, flickering lights).',
      'Request load test at a nearby workshop.',
    ],
    urgency: 'Frequent battery drain can leave you stranded, schedule diagnostic soon.',
  },
  {
    keywords: ['mileage', 'fuel', 'consumption', 'economy'],
    title: 'Poor mileage',
    steps: [
      'Keep tyre pressure at recommended value.',
      'Clean or replace air filter if clogged.',
      'Avoid aggressive acceleration and prolonged idling.',
      'Ensure periodic service for spark plugs and engine oil.',
    ],
    urgency: 'If mileage dropped suddenly, get injector/sensor diagnostics done.',
  },
];

const QUICK_QUESTIONS = [
  'Car is not starting',
  'Engine is overheating',
  'Brake noise while driving',
  'Tyre puncture help',
  'Battery drains overnight',
  'Mileage dropped badly',
];

const defaultReply = [
  'I can help with common vehicle issues like starting trouble, overheating, brakes, tyres, battery, or mileage.',
  'Tell me what you are noticing: warning lights, sounds, smell, vibration, or when the issue happens.',
  'If you are unsure, use one of the quick options below.',
];

const generateAssistantReply = (question) => {
  const normalized = question.toLowerCase();
  const match = ISSUE_GUIDES.find((guide) => guide.keywords.some((keyword) => normalized.includes(keyword)));

  if (!match) {
    return {
      title: 'General troubleshooting',
      lines: defaultReply,
      urgency: 'For urgent safety issues, avoid driving and call service support.',
    };
  }

  return {
    title: match.title,
    lines: match.steps,
    urgency: match.urgency,
  };
};

const VehicleIssueChatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([
    {
      role: 'bot',
      title: 'Smart Vehicle Assistant',
      lines: ['Hi! Describe your vehicle issue and I will suggest immediate troubleshooting steps.'],
      urgency: '',
    },
  ]);

  const canSend = useMemo(() => input.trim().length > 0, [input]);

  const sendMessage = (question) => {
    const cleanQuestion = question.trim();
    if (!cleanQuestion) {
      return;
    }

    const reply = generateAssistantReply(cleanQuestion);

    setMessages((prev) => [
      ...prev,
      {
        role: 'user',
        title: 'You',
        lines: [cleanQuestion],
        urgency: '',
      },
      {
        role: 'bot',
        title: reply.title,
        lines: reply.lines,
        urgency: reply.urgency,
      },
    ]);

    setInput('');
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    sendMessage(input);
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        style={styles.fab}
        aria-label="Open vehicle issue assistant"
      >
        {isOpen ? 'Close Assistant' : 'Vehicle Assistant'}
      </button>

      {isOpen && (
        <section style={styles.panel} aria-label="Vehicle issue chatbot">
          <header style={styles.header}>
            <h3 style={styles.title}>Vehicle Issue Chatbot</h3>
            <p style={styles.subtitle}>Ask about breakdowns, noises, warnings, and maintenance issues.</p>
          </header>

          <div style={styles.quickList}>
            {QUICK_QUESTIONS.map((question) => (
              <button key={question} type="button" onClick={() => sendMessage(question)} style={styles.quickButton}>
                {question}
              </button>
            ))}
          </div>

          <div style={styles.messageArea}>
            {messages.map((message, index) => (
              <article key={`${message.role}-${index}`} style={message.role === 'user' ? styles.userBubble : styles.botBubble}>
                <strong style={styles.messageTitle}>{message.title}</strong>
                {message.lines.map((line) => (
                  <p key={line} style={styles.messageLine}>{line}</p>
                ))}
                {message.urgency && <p style={styles.urgency}>{message.urgency}</p>}
              </article>
            ))}
          </div>

          <form onSubmit={handleSubmit} style={styles.form}>
            <input
              type="text"
              value={input}
              onChange={(event) => setInput(event.target.value)}
              placeholder="Example: my bike is overheating in traffic"
              style={styles.input}
            />
            <button type="submit" disabled={!canSend} style={canSend ? styles.sendButton : styles.sendButtonDisabled}>
              Send
            </button>
          </form>
        </section>
      )}
    </>
  );
};

const styles = {
  fab: {
    position: 'fixed',
    right: '24px',
    bottom: '24px',
    border: 'none',
    borderRadius: '999px',
    padding: '12px 20px',
    background: 'linear-gradient(135deg, #115e59, #0f766e)',
    color: '#fff',
    fontWeight: 700,
    cursor: 'pointer',
    boxShadow: '0 14px 30px rgba(15, 118, 110, 0.35)',
    zIndex: 2100,
  },
  panel: {
    position: 'fixed',
    right: '24px',
    bottom: '78px',
    width: 'min(430px, calc(100vw - 32px))',
    maxHeight: '74vh',
    borderRadius: '18px',
    border: '1px solid #d1fae5',
    background: '#f8fffe',
    boxShadow: '0 20px 45px rgba(15, 118, 110, 0.2)',
    display: 'grid',
    gridTemplateRows: 'auto auto 1fr auto',
    overflow: 'hidden',
    zIndex: 2100,
  },
  header: {
    padding: '14px 16px 10px',
    background: 'linear-gradient(120deg, #ecfeff, #ccfbf1)',
    borderBottom: '1px solid #c2f3e6',
  },
  title: {
    margin: '0 0 4px 0',
    color: '#115e59',
    fontSize: '18px',
  },
  subtitle: {
    margin: 0,
    color: '#0f766e',
    fontSize: '12px',
  },
  quickList: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '8px',
    padding: '10px 12px',
    borderBottom: '1px solid #dcfce7',
    background: '#fff',
  },
  quickButton: {
    border: '1px solid #a7f3d0',
    background: '#ecfdf5',
    color: '#047857',
    borderRadius: '999px',
    padding: '6px 10px',
    fontSize: '12px',
    cursor: 'pointer',
  },
  messageArea: {
    overflowY: 'auto',
    padding: '12px',
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
    background: '#f0fdfa',
  },
  userBubble: {
    alignSelf: 'flex-end',
    maxWidth: '90%',
    background: '#dcfce7',
    border: '1px solid #a7f3d0',
    padding: '10px 12px',
    borderRadius: '12px 12px 2px 12px',
  },
  botBubble: {
    alignSelf: 'flex-start',
    maxWidth: '95%',
    background: '#fff',
    border: '1px solid #d1fae5',
    padding: '10px 12px',
    borderRadius: '12px 12px 12px 2px',
  },
  messageTitle: {
    display: 'block',
    fontSize: '13px',
    color: '#0f766e',
    marginBottom: '4px',
  },
  messageLine: {
    margin: '2px 0',
    fontSize: '13px',
    color: '#134e4a',
    lineHeight: 1.35,
  },
  urgency: {
    margin: '6px 0 0',
    fontSize: '12px',
    color: '#b91c1c',
    fontWeight: 700,
  },
  form: {
    display: 'grid',
    gridTemplateColumns: '1fr auto',
    gap: '8px',
    padding: '12px',
    borderTop: '1px solid #dcfce7',
    background: '#fff',
  },
  input: {
    borderRadius: '10px',
    border: '1px solid #99f6e4',
    padding: '10px',
    fontSize: '13px',
    outline: 'none',
  },
  sendButton: {
    border: 'none',
    borderRadius: '10px',
    padding: '10px 14px',
    background: '#0f766e',
    color: '#fff',
    fontWeight: 700,
    cursor: 'pointer',
  },
  sendButtonDisabled: {
    border: 'none',
    borderRadius: '10px',
    padding: '10px 14px',
    background: '#94a3b8',
    color: '#fff',
    fontWeight: 700,
    cursor: 'not-allowed',
  },
};

export default VehicleIssueChatbot;
