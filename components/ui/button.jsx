export function Button({ children, onClick, variant = 'default', size = 'base', className = '' }) {
  const base = 'rounded px-3 py-1';
  const sizes = {
    sm: 'text-sm py-1',
    base: 'text-base py-2',
  };
  const variants = {
    default: 'bg-blue-600 text-white',
    outline: 'border border-gray-400',
    destructive: 'bg-red-600 text-white',
  };
  return (
    <button onClick={onClick} className={\`\${base} \${sizes[size]} \${variants[variant]} \${className}\`}>
      {children}
    </button>
  );
}