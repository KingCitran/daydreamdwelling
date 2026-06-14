// Quick-insert message templates for sellers. Renders pill buttons above the
// message input; clicking one inserts the text into the message field.

const TEMPLATES = [
  { label: 'Delay apology',    text: "Hi there — I wanted to let you know your order is taking a bit longer than expected. I'm making sure everything is just right before it ships. Thank you for your patience." },
  { label: 'Shipped today',    text: "Great news — your order shipped today! You should receive tracking information shortly. Let me know if you have any questions." },
  { label: 'Custom request',   text: "Thanks for reaching out about customization! I'd be happy to help. Could you share a bit more about what you have in mind?" },
  { label: 'Back in stock',    text: "Good news — the item you were interested in is back in stock! Let me know if you'd like to go ahead with the order." },
  { label: 'Damage follow-up', text: "I'm so sorry to hear about the damage. Could you send me a photo? I'll get a replacement or refund sorted out for you right away." },
]

export default function QuickReplyTemplates({ onInsert, t }) {
  return (
    <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', marginBottom: 6 }}>
      {TEMPLATES.map(tmpl => (
        <button
          key={tmpl.label}
          onClick={() => onInsert(tmpl.text)}
          title={tmpl.text}
          style={{
            padding: '3px 8px', borderRadius: 12,
            border: `1px solid ${t.surfaceBorder}`,
            background: 'transparent', color: t.textSoft,
            fontSize: 10, cursor: 'pointer',
            fontFamily: "'Outfit', system-ui, sans-serif",
          }}
        >
          {tmpl.label}
        </button>
      ))}
    </div>
  )
}
