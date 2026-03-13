import { useState } from 'react'
import Controls from './components/Controls'
import Preview from './components/Preview'

function App() {
  const [image, setImage] = useState(null)
  const [treatment, setTreatment] = useState('tilt')
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
  const [settings, setSettings] = useState({
    bgColor: '#191919',
    shadowIntensity: 50,
    shadowSpread: 30,
    scale: 80,
    positionX: 0,
    positionY: 0,
    titleText: '',
    titleSize: 32,
    titleColor: '#FFFFFF',
    titlePosition: 'bottom',
    tiltX: 10,
    tiltY: -5,
    perspective: 1200,
    blurAmount: 8,
    gradientOpacity: 60,
    gradientDirection: 'bottom',
    frameStyle: 'browser',
    focusBlur: 12,
    focusX: 50,
    focusY: 50,
    focusSize: 60,
  })

  const handleImageUpload = (e) => {
    const file = e.target.files[0]
    if (file) {
      const url = URL.createObjectURL(file)
      setImage(url)
    }
  }

  const updateSetting = (key, value) => {
    setSettings(prev => ({ ...prev, [key]: value }))
  }

  const handleMouseDown = (e) => {
    setIsDragging(true)
    setDragStart({ x: e.clientX - settings.positionX, y: e.clientY - settings.positionY })
  }

  const handleMouseMove = (e) => {
    if (!isDragging) return
    updateSetting('positionX', e.clientX - dragStart.x)
    updateSetting('positionY', e.clientY - dragStart.y)
  }

  const handleMouseUp = () => setIsDragging(false)

  return (
    <div className="h-screen bg-gray-950 text-gray-200 flex overflow-hidden"
         style={{ fontFamily: "'Inter', sans-serif" }}>
      <div className="w-64 border-r border-gray-800 flex flex-col overflow-y-auto p-4 gap-4 shrink-0">
        <Controls
          image={image}
          onImageUpload={handleImageUpload}
          treatment={treatment}
          onTreatmentChange={setTreatment}
          settings={settings}
          onSettingChange={updateSetting}
        />
      </div>

      <div className="flex-1 flex items-center justify-center p-8 bg-gray-900">
        <Preview
          image={image}
          treatment={treatment}
          settings={settings}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          isDragging={isDragging}
        />
      </div>
    </div>
  )
}

export default App
