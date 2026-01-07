export const Checkbox = ({
  label,
  checked,
  onChange,
  disabled = false,
  className = ''
}) => {
  return (
    <label className={`flex items-center cursor-pointer ${className}`}>
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        disabled={disabled}
        className="w-5 h-5 text-pass-plus-600 rounded border-gray-300 focus:ring-pass-plus-500"
      />
      <span className="ml-3 text-gray-700">{label}</span>
    </label>
  )
}
