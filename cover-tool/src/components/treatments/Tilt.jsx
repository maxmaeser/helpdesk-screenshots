export default function Tilt({ image, settings }) {
  const { tiltX, tiltY, perspective, scale, positionX, positionY, shadowIntensity, shadowSpread } = settings

  const shadowOpacity = shadowIntensity / 100
  const shadowBlur = shadowSpread * 1.5
  const shadowY = shadowSpread * 0.3

  return (
    <div
      className="absolute inset-0 flex items-center justify-center"
      style={{ perspective: `${perspective}px` }}
    >
      <img
        src={image}
        alt=""
        draggable={false}
        className="rounded-lg"
        style={{
          maxWidth: `${scale}%`,
          maxHeight: `${scale}%`,
          objectFit: 'contain',
          transform: `rotateX(${tiltX}deg) rotateY(${tiltY}deg) translate(${positionX}px, ${positionY}px)`,
          boxShadow: `0 ${shadowY}px ${shadowBlur}px rgba(0,0,0,${shadowOpacity})`,
          borderRadius: '12px',
        }}
      />
    </div>
  )
}
