export function Input({ value, onChange, placeholder, className = '' }) {
  return (
    <input
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      className={\`border rounded w-full p-2 \${className}\`}
    />
  );
}