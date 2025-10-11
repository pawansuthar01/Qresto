interface SelectInputProps {
  label: string;
  max?: number;
  value?: string;
  onChange: (value: string) => void;
  options: any;
}
export const SelectInput = ({
  label,
  value,
  onChange,
  options,
}: SelectInputProps) => (
  <div className="space-y-2">
    <label className="text-sm font-medium text-gray-700">{label}</label>
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full px-3 py-2 border rounded-lg bg-white text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
    >
      {options.map((opt: any) => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
  </div>
);
