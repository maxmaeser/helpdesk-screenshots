import { backgrounds } from '../config/brand'

const TREATMENT_LABELS = {
  tilt: 'Tilt',
  frosted: 'Frosted',
  framed: 'Framed',
  croppedFocus: 'Cropped Focus',
}

function Slider({ label, value, onChange, min = 0, max = 100, step = 1 }) {
  return (
    <label className="flex flex-col gap-1">
      <span className="text-xs text-gray-400 flex justify-between">
        {label} <span className="text-gray-500">{value}</span>
      </span>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full accent-blue-500"
      />
    </label>
  )
}

export default function Controls({
  image,
  onImageUpload,
  treatment,
  onTreatmentChange,
  settings,
  onSettingChange,
}) {
  return (
    <>
      <div>
        <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Image</h3>
        <label className="block w-full cursor-pointer text-center py-3 px-4 border border-dashed border-gray-700 rounded-lg text-sm text-gray-400 hover:border-gray-500 hover:text-gray-300 transition-colors">
          {image ? 'Change image' : 'Drop or pick image'}
          <input type="file" accept="image/*" onChange={onImageUpload} className="hidden" />
        </label>
      </div>

      <div>
        <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Treatment</h3>
        <div className="grid grid-cols-2 gap-1.5">
          {Object.entries(TREATMENT_LABELS).map(([key, label]) => (
            <button
              key={key}
              onClick={() => onTreatmentChange(key)}
              className={`py-1.5 px-2 text-xs rounded transition-colors ${
                treatment === key
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Background</h3>
        <div className="flex gap-1.5 flex-wrap">
          {backgrounds.map(({ name, value }) => (
            <button
              key={value}
              onClick={() => onSettingChange('bgColor', value)}
              title={name}
              className={`w-7 h-7 rounded border-2 transition-colors ${
                settings.bgColor === value ? 'border-blue-500' : 'border-gray-700'
              }`}
              style={{ backgroundColor: value }}
            />
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-3">
        <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Adjustments</h3>
        <Slider label="Scale" value={settings.scale} onChange={(v) => onSettingChange('scale', v)} min={30} max={120} />
        <Slider label="Shadow" value={settings.shadowIntensity} onChange={(v) => onSettingChange('shadowIntensity', v)} />
        <Slider label="Shadow Spread" value={settings.shadowSpread} onChange={(v) => onSettingChange('shadowSpread', v)} />
        <Slider label="Position X" value={settings.positionX} onChange={(v) => onSettingChange('positionX', v)} min={-200} max={200} />
        <Slider label="Position Y" value={settings.positionY} onChange={(v) => onSettingChange('positionY', v)} min={-200} max={200} />
      </div>

      {treatment === 'tilt' && (
        <div className="flex flex-col gap-3">
          <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Tilt</h3>
          <Slider label="Rotate X" value={settings.tiltX} onChange={(v) => onSettingChange('tiltX', v)} min={-30} max={30} />
          <Slider label="Rotate Y" value={settings.tiltY} onChange={(v) => onSettingChange('tiltY', v)} min={-30} max={30} />
          <Slider label="Perspective" value={settings.perspective} onChange={(v) => onSettingChange('perspective', v)} min={400} max={3000} step={50} />
        </div>
      )}

      {treatment === 'frosted' && (
        <div className="flex flex-col gap-3">
          <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Frosted</h3>
          <Slider label="Blur" value={settings.blurAmount} onChange={(v) => onSettingChange('blurAmount', v)} min={0} max={30} />
          <Slider label="Gradient Opacity" value={settings.gradientOpacity} onChange={(v) => onSettingChange('gradientOpacity', v)} />
        </div>
      )}

      {treatment === 'croppedFocus' && (
        <div className="flex flex-col gap-3">
          <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Focus</h3>
          <Slider label="Blur" value={settings.focusBlur} onChange={(v) => onSettingChange('focusBlur', v)} min={0} max={30} />
          <Slider label="Focus X" value={settings.focusX} onChange={(v) => onSettingChange('focusX', v)} />
          <Slider label="Focus Y" value={settings.focusY} onChange={(v) => onSettingChange('focusY', v)} />
          <Slider label="Focus Size" value={settings.focusSize} onChange={(v) => onSettingChange('focusSize', v)} min={20} max={100} />
        </div>
      )}

      <div className="flex flex-col gap-3">
        <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Title Overlay</h3>
        <input
          type="text"
          placeholder="Article title (optional)"
          value={settings.titleText}
          onChange={(e) => onSettingChange('titleText', e.target.value)}
          className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded text-sm text-gray-200 placeholder-gray-500"
        />
        <Slider label="Font Size" value={settings.titleSize} onChange={(v) => onSettingChange('titleSize', v)} min={16} max={64} />
      </div>
    </>
  )
}
