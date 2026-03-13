export default function Framed({ image, settings }) {
  const { scale, positionX, positionY, shadowIntensity, shadowSpread } = settings

  const shadowOpacity = shadowIntensity / 100
  const shadowBlur = shadowSpread * 1.5

  return (
    <div
      className="absolute inset-0 flex items-center justify-center"
      style={{ transform: `translate(${positionX}px, ${positionY}px)` }}
    >
      <div
        className="flex flex-col overflow-hidden"
        style={{
          maxWidth: `${scale}%`,
          maxHeight: `${scale}%`,
          borderRadius: '8px',
          boxShadow: `0 4px ${shadowBlur}px rgba(0,0,0,${shadowOpacity})`,
        }}
      >
        <div
          className="flex items-center gap-1.5 px-3 py-2"
          style={{ backgroundColor: '#E5E5E5' }}
        >
          <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: '#FF5F57' }} />
          <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: '#FEBC2E' }} />
          <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: '#28C840' }} />
          <div
            className="flex-1 mx-3 py-0.5 px-3 rounded text-center"
            style={{ backgroundColor: '#F3F3F3', fontSize: '8px', color: '#828282' }}
          >
            app.franchisesystems.ai
          </div>
        </div>

        <img
          src={image}
          alt=""
          draggable={false}
          style={{
            width: '100%',
            display: 'block',
          }}
        />
      </div>
    </div>
  )
}
