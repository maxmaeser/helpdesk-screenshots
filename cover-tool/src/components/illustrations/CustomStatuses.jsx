const STATUSES = [
  { label: 'New Lead', color: '#5381EB', custom: false },
  { label: 'Contacted', color: '#FC9105', custom: true },
  { label: 'Discovery Day', color: '#8B5CF6', custom: true },
  { label: 'FDD Issued', color: '#3FC128', custom: true },
  { label: 'Awarded', color: '#0D9488', custom: true },
  { label: 'Lost', color: '#FF3720', custom: false },
]

const TABLE_ROWS = [
  { nameWidth: 88, status: 'Contacted', color: '#FC9105' },
  { nameWidth: 108, status: 'FDD Issued', color: '#3FC128' },
  { nameWidth: 72, status: 'Lost', color: '#FF3720' },
  { nameWidth: 96, status: 'Discovery Day', color: '#8B5CF6' },
]

function ThreeDots() {
  return (
    <div style={{ display: 'flex', gap: 1.5, alignItems: 'center' }}>
      {[0, 1, 2].map(i => (
        <div key={i} style={{ width: 2.5, height: 2.5, borderRadius: '50%', backgroundColor: '#BFBFBF' }} />
      ))}
    </div>
  )
}

function TableHeader() {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      padding: '8px 14px',
      borderBottom: '1px solid #E5E5E5',
      gap: 10,
    }}>
      <div style={{ width: 12, height: 12, borderRadius: 3, border: '1.5px solid #D9D9D9', flexShrink: 0 }} />
      <span style={{ fontSize: 8, fontWeight: 600, color: '#A6A6A6', letterSpacing: 0.3, flex: 1 }}>Name</span>
      <span style={{ fontSize: 8, fontWeight: 600, color: '#A6A6A6', letterSpacing: 0.3, width: 80 }}>Status</span>
      <span style={{ fontSize: 8, fontWeight: 600, color: '#A6A6A6', letterSpacing: 0.3, width: 48 }}>Date</span>
    </div>
  )
}

function TableRow({ nameWidth, status, color }) {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      padding: '9px 14px',
      borderBottom: '1px solid #F3F3F3',
      gap: 10,
    }}>
      <div style={{ width: 12, height: 12, borderRadius: 3, border: '1.5px solid #E5E5E5', flexShrink: 0 }} />
      <div style={{ width: 18, height: 18, borderRadius: '50%', backgroundColor: '#E8E8E8', flexShrink: 0 }} />
      <div style={{ width: nameWidth, height: 6, borderRadius: 3, backgroundColor: '#E5E5E5', flexShrink: 0 }} />
      <div style={{ flex: 1 }} />
      <div style={{ width: 80, display: 'flex', alignItems: 'center', gap: 5 }}>
        <div style={{ width: 7, height: 7, borderRadius: '50%', backgroundColor: color, flexShrink: 0 }} />
        <span style={{ fontSize: 7.5, color: '#363636', fontWeight: 500, whiteSpace: 'nowrap' }}>{status}</span>
      </div>
      <div style={{ width: 36, height: 5, borderRadius: 3, backgroundColor: '#F0F0F0' }} />
    </div>
  )
}

function DropdownItem({ color, label, custom, highlighted }) {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      padding: '7px 12px',
      gap: 8,
      backgroundColor: highlighted ? '#F7F7F7' : 'transparent',
      borderRadius: 6,
      margin: '0 4px',
    }}>
      <div style={{
        width: 13,
        height: 13,
        borderRadius: '50%',
        border: highlighted ? '2px solid #1F54DE' : '1.5px solid #D9D9D9',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
      }}>
        {highlighted && (
          <div style={{ width: 5, height: 5, borderRadius: '50%', backgroundColor: '#1F54DE' }} />
        )}
      </div>
      <div style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: color, flexShrink: 0 }} />
      <span style={{ fontSize: 9, color: '#363636', fontWeight: 500, flex: 1 }}>{label}</span>
      {custom && <ThreeDots />}
    </div>
  )
}

export default function CustomStatuses({ settings = {} }) {
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
      {/* Centered composition container */}
      <div style={{ position: 'relative', width: 520, height: 270 }}>

        {/* Background: Pipeline Table */}
        <div data-frame="a" style={{
          position: 'absolute',
          left: 0 + frameAX,
          top: 20 + frameAY,
          width: 380,
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

        {/* Foreground: Change Status Dropdown */}
        <div data-frame="b" style={{
          position: 'absolute',
          left: 300 + frameBX,
          top: 0 + frameBY,
          width: 220,
          backgroundColor: '#FFFFFF',
          borderRadius: 12,
          boxShadow: '0 12px 40px rgba(0,0,0,0.12), 0 4px 12px rgba(0,0,0,0.06), 0 0 0 1px rgba(0,0,0,0.04)',
          overflow: 'hidden',
          zIndex: 2,
        }}>
          {/* Header */}
          <div style={{
            padding: '10px 14px 6px',
            display: 'flex',
            alignItems: 'center',
            gap: 7,
            borderBottom: '1px solid #F0F0F0',
          }}>
            <div style={{
              width: 14,
              height: 14,
              borderRadius: '50%',
              border: '2px solid #363636',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <div style={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: '#363636' }} />
            </div>
            <span style={{ fontSize: 11, fontWeight: 600, color: '#1a1a1a' }}>Change Status</span>
          </div>

          {/* Search input */}
          <div style={{ padding: '4px 12px 0' }}>
            <div style={{
              width: '100%',
              padding: '1px 6px',
              backgroundColor: '#F7F7F7',
              borderRadius: 3,
              border: '1px solid #E5E5E5',
              display: 'flex',
              alignItems: 'center',
              height: 16,
            }}>
              <span style={{ fontSize: 6.5, color: '#BFBFBF' }}>Search statuses</span>
            </div>
          </div>

          {/* Helper text */}
          <div style={{ padding: '1px 14px 2px' }}>
            <span style={{ fontSize: 7, color: '#A6A6A6' }}>Select a status or create a new one</span>
          </div>

          {/* Status list */}
          <div style={{ padding: '0 4px 4px' }}>
            {STATUSES.map((s, i) => (
              <DropdownItem
                key={i}
                color={s.color}
                label={s.label}
                custom={s.custom}
                highlighted={i === 0}
              />
            ))}
          </div>

          {/* Create new footer */}
          <div style={{
            padding: '8px 14px',
            borderTop: '1px solid #F0F0F0',
            display: 'flex',
            alignItems: 'center',
            gap: 5,
          }}>
            <span style={{ fontSize: 10, color: '#A6A6A6', fontWeight: 500 }}>+</span>
            <span style={{ fontSize: 9, color: '#5C5C5C', fontWeight: 500 }}>Create New Status</span>
          </div>
        </div>
      </div>
    </div>
  )
}
