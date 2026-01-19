export default function SelectField({ placeholder, options, value, onSelect }) {
  return (
    <select
      value={value}
      onChange={(e) => onSelect(e.target.value)}
      className="w-full p-2 bg-zinc-900 border border-zinc-700 rounded"
    >
      <option value="">{placeholder}</option>
      {options.map((opt) => (
        <option key={opt} value={opt}>
          {opt}
        </option>
      ))}
    </select>
  )
}
