import { InputHTMLAttributes, forwardRef } from 'react'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
    label?: string
    error?: string
}

const Input = forwardRef<HTMLInputElement, InputProps>(
    ({ className = '', label, error, id, ...props }, ref) => {
        return (
            <div className="w-full">
                {label && (
                    <label htmlFor={id} className="block text-sm font-medium text-slate-700 mb-1.5">
                        {label}
                    </label>
                )}
                <input
                    ref={ref}
                    id={id}
                    className={`
            w-full px-4 py-2.5 rounded-lg border 
            bg-white text-slate-900
            placeholder:text-slate-400
            focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent
            transition-all duration-200
            ${error ? 'border-red-500' : 'border-slate-300'}
            ${className}
          `}
                    {...props}
                />
                {error && (
                    <p className="mt-1.5 text-sm text-red-500">{error}</p>
                )}
            </div>
        )
    }
)

Input.displayName = 'Input'

export { Input }
