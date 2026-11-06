const AGENTS = [
  { initials: 'MS', name: 'Mark Scout', color: '#5381EB' },
  { initials: 'HR', name: 'Helly Riggs', color: '#8B5CF6' },
  { initials: 'DG', name: 'Dylan George', color: '#0D9488' },
  { initials: 'IB', name: 'Irving Bailiff', color: '#FC9105' },
]

const TABLE_ROWS = [
  { nameWidth: 84, city: 'Denver', agent: AGENTS[0] },
  { nameWidth: 104, city: 'Austin', agent: AGENTS[1] },
  { nameWidth: 68, city: 'Seattle', agent: null },
  { nameWidth: 92, city: 'Atlanta', agent: AGENTS[3] },
  { nameWidth: 78, city: 'Boston', agent: null },
]

function Avatar({ initials, color, size = 16 }) {
  return (
    <div style={{
      width: size,
      height: size,
      borderRadius: '50%',
      backgroundColor: color,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      flexShrink: 0,
    }}>
      <span style={{ fontSize: size * 0.4, fontWeight: 600, color: '#FFFFFF', letterSpacing: -0.3 }}>{initials}</span>
    </div>
  )
}

function AgentBadge({ agent }) {
  if (!agent) {
    return <span style={{ fontSize: 7.5, color: '#BFBFBF', fontWeight: 500 }}>Unassigned</span>
  }
  return (
    <div style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: 4,
      padding: '2px 6px 2px 2px',
      borderRadius: 10,
      backgroundColor: '#F3F3F3',
    }}>
      <Avatar initials={agent.initials} color={agent.color} size={14} />
      <span style={{ fontSize: 7, color: '#363636', fontWeight: 500, whiteSpace: 'nowrap' }}>{agent.name}</span>
    </div>
  )
}

function TableHeader() {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      padding: '8px 12px',
      borderBottom: '1px solid #E5E5E5',
      gap: 6,
    }}>
      <div style={{ width: 12, height: 12, borderRadius: 3, border: '1.5px solid #D9D9D9', flexShrink: 0 }} />
      <span style={{ fontSize: 8, fontWeight: 600, color: '#A6A6A6', letterSpacing: 0.3, width: 140 }}>Name</span>
      <span style={{ fontSize: 8, fontWeight: 600, color: '#A6A6A6', letterSpacing: 0.3, width: 56 }}>City</span>
      <span style={{ fontSize: 8, fontWeight: 600, color: '#A6A6A6', letterSpacing: 0.3, flex: 1 }}>Assigned To</span>
    </div>
  )
}

function TableRow({ nameWidth, city, agent }) {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      padding: '9px 12px',
      borderBottom: '1px solid #F3F3F3',
      gap: 6,
    }}>
      <div style={{ width: 12, height: 12, borderRadius: 3, border: '1.5px solid #E5E5E5', flexShrink: 0 }} />
      <div style={{ width: 18, height: 18, borderRadius: '50%', backgroundColor: '#E8E8E8', flexShrink: 0 }} />
      <div style={{ width: nameWidth, height: 6, borderRadius: 3, backgroundColor: '#E5E5E5', flexShrink: 0 }} />
      <div style={{ width: 140 - nameWidth - 24, flexShrink: 0 }} />
      <span style={{ fontSize: 7.5, color: '#5C5C5C', fontWeight: 500, width: 56, flexShrink: 0 }}>{city}</span>
      <div style={{ flex: 1 }}>
        <AgentBadge agent={agent} />
      </div>
    </div>
  )
}

function DropdownItem({ agent, highlighted }) {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      padding: '6px 10px',
      gap: 7,
      backgroundColor: highlighted ? '#F7F7F7' : 'transparent',
      borderRadius: 6,
      margin: '0 4px',
    }}>
      <Avatar initials={agent.initials} color={agent.color} size={18} />
      <span style={{ fontSize: 9, color: '#363636', fontWeight: 500 }}>{agent.name}</span>
    </div>
  )
}

export default function AssignLeads({ settings = {} }) {
  const { frameAX = 0, frameAY = 0, frameBX = 0, frameBY = 0 } = settings

  return (
    <div style={{
      position: 'absolute',
      inset: 0,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: "'Inter', sans-serif",
    }}>
      <div style={{ position: 'relative', width: 520, height: 270 }}>

        {/* Background: Pipeline Table */}
        <div data-frame="a" style={{
          position: 'absolute',
          left: -10 + frameAX,
          top: 10 + frameAY,
          width: 420,
          backgroundColor: '#FFFFFF',
          borderRadius: 10,
          boxShadow: '0 1px 4px rgba(0,0,0,0.05), 0 0 0 1px rgba(0,0,0,0.03)',
          overflow: 'hidden',
          opacity: 0.55,
        }}>
          <TableHeader />
          {TABLE_ROWS.map((row, i) => (
            <TableRow key={i} {...row} />
          ))}
        </div>

        {/* Foreground: Agent Assignment Dropdown */}
        <div data-frame="b" style={{
          position: 'absolute',
          left: 300 + frameBX,
          top: 52 + frameBY,
          width: 180,
          backgroundColor: '#FFFFFF',
          borderRadius: 12,
          boxShadow: '0 12px 40px rgba(0,0,0,0.12), 0 4px 12px rgba(0,0,0,0.06), 0 0 0 1px rgba(0,0,0,0.04)',
          overflow: 'hidden',
          zIndex: 2,
        }}>
          {/* Unassigned header */}
          <div style={{
            padding: '8px 14px 5px',
            borderBottom: '1px solid #F0F0F0',
          }}>
            <span style={{ fontSize: 8, color: '#A6A6A6', fontWeight: 500 }}>Unassigned</span>
          </div>

          {/* Agent list */}
          <div style={{ padding: '4px 0' }}>
            {AGENTS.map((agent, i) => (
              <DropdownItem
                key={i}
                agent={agent}
                highlighted={i === 0}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
