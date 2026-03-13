export default function Frosted({ image, settings }) {
  const { scale, positionX, positionY, blurAmount, gradientOpacity, gradientDirection, bgColor } = settings

  const gradientAngle = {
    top: '0deg',
    bottom: '180deg',
    left: '270deg',
    right: '90deg',
  }[gradientDirection] || '180deg'

  const opacity = gradientOpacity / 100

  return (
    <div className="absolute inset-0">
      <div
        className="absolute inset-0 flex items-center justify-center"
        style={{ transform: `translate(${positionX}px, ${positionY}px)` }}
      >
        <img
          src={image}
          alt=""
          draggable={false}
          style={{
            maxWidth: `${scale}%`,
            maxHeight: `${scale}%`,
            objectFit: 'contain',
            borderRadius: '8px',
          }}
        />
      </div>

      <div
        className="absolute inset-0"
        style={{
          background: `linear-gradient(${gradientAngle}, transparent 30%, ${bgColor} 100%)`,
          opacity,
        }}
      />

      <div
        className="absolute inset-0"
        style={{
          boxShadow: `inset 0 0 ${blurAmount * 4}px ${blurAmount * 2}px ${bgColor}`,
        }}
      />
    </div>
  )
}
