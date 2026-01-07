export const NumberInput = ({
  label,
  value,
  onChange,
  min = 0,
  max,
  step = 1,
  placeholder = '',
  required = false,
  disabled = false,
  suffix = '',
  className = ''
}) => {
  return (
    <div className={className}>
      {label && (
        <label className="label-base">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <div className="relative">
        <input
          type="number"
          value={value ?? ''}
          onChange={(e) => {
            const val = e.target.value
            onChange(val === '' ? null : Number(val))
          }}
          min={min}
          max={max}
          step={step}
          placeholder={placeholder}
          disabled={disabled}
          className={`input-base ${suffix ? 'pr-12' : ''}`}
        />
        {suffix && (
          <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500">
            {suffix}
          </span>
        )}
      </div>
    </div>
  )
}
