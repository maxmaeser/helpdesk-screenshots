import { useRef } from 'react'
import { toPng } from 'html-to-image'
import { brand } from '../config/brand'

export default function Preview({ image, treatment, settings }) {
  const canvasRef = useRef(null)

  const handleExport = async () => {
    if (!canvasRef.current) return
    try {
      const dataUrl = await toPng(canvasRef.current, {
        width: brand.cover.width,
        height: brand.cover.height,
        pixelRatio: 2,
      })
      const link = document.createElement('a')
      link.download = 'cover.png'
      link.href = dataUrl
      link.click()
    } catch (err) {
      console.error('Export failed:', err)
    }
  }

  return (
    <div className="flex flex-col items-center gap-4">
      <div
        ref={canvasRef}
        className="relative overflow-hidden"
        style={{
          width: brand.cover.width / 2,
          height: brand.cover.height / 2,
          backgroundColor: settings.bgColor,
          borderRadius: '8px',
        }}
      >
        {image ? (
          <div className="absolute inset-0 flex items-center justify-center">
            <p className="text-gray-500 text-sm">Treatment: {treatment}</p>
          </div>
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <p className="text-gray-500 text-sm">Pick an image to start</p>
          </div>
        )}
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
