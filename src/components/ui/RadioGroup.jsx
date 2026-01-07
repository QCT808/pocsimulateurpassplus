export const RadioGroup = ({
  label,
  name,
  value,
  onChange,
  options,
  required = false,
  className = ''
}) => {
  return (
    <div className={className}>
      {label && (
        <label className="label-base mb-3">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <div className="space-y-2">
        {options.map((option) => (
          <label
            key={option.value}
            className={`
              flex items-center p-3 rounded-lg border-2 cursor-pointer transition-all
              ${value === option.value
                ? 'border-pass-plus-500 bg-pass-plus-50'
                : 'border-gray-200 hover:border-gray-300'
              }
            `}
          >
            <input
              type="radio"
              name={name}
              value={option.value}
              checked={value === option.value}
              onChange={() => onChange(option.value)}
              className="w-4 h-4 text-pass-plus-600 focus:ring-pass-plus-500"
            />
            <span className="ml-3">
              <span className="font-medium text-gray-900">{option.label}</span>
              {option.description && (
                <span className="block text-sm text-gray-500">{option.description}</span>
              )}
            </span>
          </label>
        ))}
      </div>
    </div>
  )
}
