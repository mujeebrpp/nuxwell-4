import { HTMLAttributes, forwardRef } from 'react'

interface CardProps extends HTMLAttributes<HTMLDivElement> {
    hover?: boolean
}

const Card = forwardRef<HTMLDivElement, CardProps>(
    ({ className = '', hover = false, children, ...props }, ref) => {
        return (
            <div
                ref={ref}
                className={`
          bg-white rounded-xl shadow-sm border border-slate-200 
          ${hover ? 'card-hover cursor-pointer' : ''}
          ${className}
        `}
                {...props}
            >
                {children}
            </div>
        )
    }
)

Card.displayName = 'Card'

const CardHeader = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
    ({ className = '', children, ...props }, ref) => (
        <div ref={ref} className={`px-6 py-4 border-b border-slate-200 ${className}`} {...props}>
            {children}
        </div>
    )
)

CardHeader.displayName = 'CardHeader'

const CardTitle = forwardRef<HTMLHeadingElement, HTMLAttributes<HTMLHeadingElement>>(
    ({ className = '', children, ...props }, ref) => (
        <h3 ref={ref} className={`text-lg font-semibold text-slate-900 ${className}`} {...props}>
            {children}
        </h3>
    )
)

CardTitle.displayName = 'CardTitle'

const CardDescription = forwardRef<HTMLParagraphElement, HTMLAttributes<HTMLParagraphElement>>(
    ({ className = '', children, ...props }, ref) => (
        <p ref={ref} className={`text-sm text-slate-500 ${className}`} {...props}>
            {children}
        </p>
    )
)

CardDescription.displayName = 'CardDescription'

const CardContent = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
    ({ className = '', children, ...props }, ref) => (
        <div ref={ref} className={`px-6 py-4 ${className}`} {...props}>
            {children}
        </div>
    )
)

CardContent.displayName = 'CardContent'

const CardFooter = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
    ({ className = '', children, ...props }, ref) => (
        <div ref={ref} className={`px-6 py-4 border-t border-slate-200 ${className}`} {...props}>
            {children}
        </div>
    )
)

CardFooter.displayName = 'CardFooter'

export { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter }
