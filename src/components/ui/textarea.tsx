import { TextareaHTMLAttributes, forwardRef } from 'react'

const Textarea = forwardRef<HTMLTextAreaElement, TextareaHTMLAttributes<HTMLTextAreaElement>>(
    ({ className = '', ...props }, ref) => {
        return (
            <textarea
                ref={ref}
                className={`
                    w-full px-4 py-2.5 rounded-lg border
                    bg-white text-slate-900
                    placeholder:text-slate-400
                    focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent
                    transition-all duration-200
                    border-slate-300
                    ${className}
                `}
                {...props}
            />
        )
    }
)

Textarea.displayName = 'Textarea'

export { Textarea }