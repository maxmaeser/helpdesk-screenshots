export default function CroppedFocus({ image, settings }) {
  const { scale, positionX, positionY, focusBlur, focusX, focusY, focusSize } = settings

  const maskPosition = `${focusX}% ${focusY}%`
  const maskSize = `${focusSize}%`

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
            filter: `blur(${focusBlur}px)`,
            borderRadius: '12px',
          }}
        />
      </div>

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
            borderRadius: '12px',
            maskImage: `radial-gradient(ellipse ${maskSize} ${maskSize} at ${maskPosition}, black 40%, transparent 100%)`,
            WebkitMaskImage: `radial-gradient(ellipse ${maskSize} ${maskSize} at ${maskPosition}, black 40%, transparent 100%)`,
          }}
        />
      </div>
    </div>
  )
}
