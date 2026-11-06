// Lumon: white "L" monogram
const lumonLogo = (
  <span style={{ fontSize: 10, fontWeight: 700, color: '#FFFFFF', letterSpacing: -0.5 }}>L</span>
)

// Sunrise: abstract sun rays (half circle + rays)
const sunriseLogo = (
  <div style={{ position: 'relative', width: 12, height: 12 }}>
    <div style={{ position: 'absolute', bottom: 2, left: 2, width: 8, height: 4, borderRadius: '8px 8px 0 0', backgroundColor: '#FFFFFF' }} />
    {[-30, 0, 30].map((deg, i) => (
      <div key={i} style={{
        position: 'absolute', bottom: 6, left: 5, width: 1.5, height: 4,
        backgroundColor: '#FFFFFF', borderRadius: 1,
        transform: `rotate(${deg}deg)`, transformOrigin: 'bottom center', opacity: 0.8,
      }} />
    ))}
  </div>
)

// Peak: abstract mountain triangle
const peakLogo = (
  <div style={{ position: 'relative', width: 12, height: 10 }}>
    <div style={{
      width: 0, height: 0,
      borderLeft: '6px solid transparent', borderRight: '6px solid transparent',
      borderBottom: '10px solid #FFFFFF',
    }} />
    <div style={{
      position: 'absolute', top: 3, left: 4, width: 0, height: 0,
      borderLeft: '3px solid transparent', borderRight: '3px solid transparent',
      borderBottom: '5px solid #0D9488', opacity: 0.5,
    }} />
  </div>
)

const BRANDS = [
  { name: 'Lumon Fresh', color: '#1F54DE', selected: 'automatic', logo: lumonLogo },
  { name: 'Sunrise Bagels', color: '#FC9105', selected: 'manual', logo: sunriseLogo },
  { name: 'Peak Fitness', color: '#0D9488', selected: 'not-assignable', logo: peakLogo },
]

const SIDEBAR_ITEMS = [
  'Profile Details',
  'Scheduling Events',
  'Associated Organisations',
  'Agent Sales Assignability',
  'Preferences',
  'API Key',
]

function Radio({ selected }) {
  return (
    <div style={{
      width: 11,
      height: 11,
      borderRadius: '50%',
      border: selected ? '2px solid #1F54DE' : '1.5px solid #D9D9D9',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      flexShrink: 0,
    }}>
      {selected && <div style={{ width: 5, height: 5, borderRadius: '50%', backgroundColor: '#1F54DE' }} />}
    </div>
  )
}

function RadioOption({ label, selected }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
      <Radio selected={selected} />
      <span style={{ fontSize: 7, color: selected ? '#1F54DE' : '#828282', fontWeight: selected ? 600 : 400 }}>{label}</span>
    </div>
  )
}

function BrandRow({ name, color, selected, logo }) {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      padding: '8px 12px',
      borderBottom: '1px solid #F3F3F3',
      gap: 8,
    }}>
      {/* Brand logo */}
      <div style={{
        width: 18,
        height: 18,
        borderRadius: 4,
        backgroundColor: color,
        flexShrink: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        overflow: 'hidden',
      }}>
        {logo}
      </div>
      <span style={{ fontSize: 8, color: '#363636', fontWeight: 500, flex: 1 }}>{name}</span>
      <div style={{ display: 'flex', gap: 12 }}>
        <RadioOption label="Automatic" selected={selected === 'automatic'} />
        <RadioOption label="Manual" selected={selected === 'manual'} />
        <RadioOption label="Not Assignable" selected={selected === 'not-assignable'} />
      </div>
    </div>
  )
}

export default function AutoAssignment({ settings = {} }) {
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

        {/* Background: Settings Sidebar */}
        <div data-frame="a" style={{
          position: 'absolute',
          left: 0 + frameAX,
          top: 15 + frameAY,
          width: 140,
          backgroundColor: '#FFFFFF',
          borderRadius: 10,
          boxShadow: '0 1px 4px rgba(0,0,0,0.05), 0 0 0 1px rgba(0,0,0,0.03)',
          overflow: 'hidden',
          opacity: 0.55,
        }}>
          {/* Profile header */}
          <div style={{
            padding: '8px 12px 6px',
            borderBottom: '1px solid #F0F0F0',
            display: 'flex',
            alignItems: 'center',
            gap: 5,
          }}>
            <div style={{ width: 10, height: 10, borderRadius: '50%', border: '1.5px solid #828282' }} />
            <span style={{ fontSize: 8, fontWeight: 600, color: '#363636' }}>Profile</span>
          </div>
          {/* Nav items */}
          <div style={{ padding: '4px 0' }}>
            {SIDEBAR_ITEMS.map((item, i) => (
              <div
                key={i}
                style={{
                  padding: '5px 12px',
                  backgroundColor: item === 'Agent Sales Assignability' ? '#E8EFFB' : 'transparent',
                  borderRadius: item === 'Agent Sales Assignability' ? 4 : 0,
                  margin: item === 'Agent Sales Assignability' ? '0 4px' : 0,
                }}
              >
                <span style={{
                  fontSize: 7,
                  color: item === 'Agent Sales Assignability' ? '#1F54DE' : '#828282',
                  fontWeight: item === 'Agent Sales Assignability' ? 600 : 400,
                }}>{item}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Foreground: Assignability Settings Panel */}
        <div data-frame="b" style={{
          position: 'absolute',
          left: 120 + frameBX,
          top: 5 + frameBY,
          width: 380,
          backgroundColor: '#FFFFFF',
          borderRadius: 12,
          boxShadow: '0 12px 40px rgba(0,0,0,0.12), 0 4px 12px rgba(0,0,0,0.06), 0 0 0 1px rgba(0,0,0,0.04)',
          overflow: 'hidden',
          zIndex: 2,
        }}>
          {/* Section header */}
          <div style={{ padding: '10px 14px 8px' }}>
            <span style={{ fontSize: 10, fontWeight: 600, color: '#1a1a1a' }}>Assignable To Applicant Portal Leads</span>
          </div>

          {/* Brand rows */}
          {BRANDS.map((brand, i) => (
            <BrandRow key={i} {...brand} />
          ))}
        </div>
      </div>
    </div>
  )
}
