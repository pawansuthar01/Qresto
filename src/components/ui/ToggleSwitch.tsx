interface ToggleSwitchProps {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  description?: string;
  loading?: boolean;
}
export const ToggleSwitch = ({
  label,
  checked,
  loading = false,
  onChange,
  description,
}: ToggleSwitchProps) => (
  <div className="flex items-center justify-between py-2">
    <div className="flex-1">
      <label className="text-sm font-medium text-gray-900">{label}</label>
      {description && (
        <p className="text-xs text-gray-500 mt-0.5">{description}</p>
      )}
    </div>
    {loading ? (
      <div className="pb-4 inline-flex bg-gray-200/80 justify-center items-center rounded-full transition-colors h-6 w-11">
        {[".", ".", "."].map((dot, index) => (
          <span
            key={index}
            className="inline-block text-gray-600 text-[40px] animate-bounce"
            style={{
              animationDelay: `${index * 0.8}s`,
            }}
          >
            {dot}
          </span>
        ))}
      </div>
    ) : (
      <button
        onClick={() => onChange(!checked)}
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
          checked ? "bg-blue-600" : "bg-gray-200"
        }`}
      >
        <span
          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
            checked ? "translate-x-6" : "translate-x-1"
          }`}
        />
      </button>
    )}
  </div>
);
