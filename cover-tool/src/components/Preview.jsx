import { useRef } from 'react'
import { toPng } from 'html-to-image'
import { brand } from '../config/brand'
import Tilt from './treatments/Tilt'
import Frosted from './treatments/Frosted'
import Framed from './treatments/Framed'
import CroppedFocus from './treatments/CroppedFocus'

export default function Preview({ image, treatment, settings, onMouseDown, onMouseMove, onMouseUp, isDragging }) {
  const canvasRef = useRef(null)

  const handleExport = async () => {
    if (!canvasRef.current) return
    try {
      const dataUrl = await toPng(canvasRef.current, {
        width: brand.cover.width,
        height: brand.cover.height,
        pixelRatio: 2,
        style: {
          transform: 'scale(2)',
          transformOrigin: 'top left',
        },
      })
      const link = document.createElement('a')
      const timestamp = new Date().toISOString().slice(0, 10)
      link.download = `cover-${timestamp}.png`
      link.href = dataUrl
      link.click()
    } catch (err) {
      console.error('Export failed:', err)
    }
  }

  const renderTreatment = () => {
    if (!image) {
      return (
        <div className="absolute inset-0 flex items-center justify-center">
          <p className="text-gray-500 text-sm">Pick an image to start</p>
        </div>
      )
    }
    switch (treatment) {
      case 'tilt':
        return <Tilt image={image} settings={settings} />
      case 'frosted':
        return <Frosted image={image} settings={settings} />
      case 'framed':
        return <Framed image={image} settings={settings} />
      case 'croppedFocus':
        return <CroppedFocus image={image} settings={settings} />
      default:
        return <Tilt image={image} settings={settings} />
    }
  }

  const renderTitle = () => {
    if (!settings.titleText) return null
    const positionClasses = {
      top: 'top-6 left-0 right-0',
      center: 'top-1/2 left-0 right-0 -translate-y-1/2',
      bottom: 'bottom-6 left-0 right-0',
    }
    return (
      <div
        className={`absolute text-center px-8 ${positionClasses[settings.titlePosition] || positionClasses.bottom}`}
        style={{
          fontFamily: brand.fonts.sans,
          fontSize: `${settings.titleSize / 2}px`,
          fontWeight: 600,
          color: settings.titleColor,
          textShadow: '0 2px 8px rgba(0,0,0,0.3)',
          zIndex: 10,
        }}
      >
        {settings.titleText}
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center gap-4">
      <div
        ref={canvasRef}
        className="relative overflow-hidden"
        onMouseDown={onMouseDown}
        onMouseMove={onMouseMove}
        onMouseUp={onMouseUp}
        onMouseLeave={onMouseUp}
        style={{
          width: brand.cover.width / 2,
          height: brand.cover.height / 2,
          backgroundColor: settings.bgColor,
          borderRadius: '8px',
          cursor: isDragging ? 'grabbing' : 'grab',
        }}
      >
        {renderTreatment()}
        {renderTitle()}
      </div>

      <button
        onClick={handleExport}
        disabled={!image}
        className="px-6 py-2 bg-blue-600 text-white text-sm font-medium rounded hover:bg-blue-500 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
      >
        Export PNG
      </button>
    </div>
  )
}
