'use client'

import * as React from 'react'

interface SelectProps {
    value?: string
    onValueChange?: (value: string) => void
    placeholder?: string
}

export function Select({ value, onValueChange, placeholder }: SelectProps) {
    return (
        <div className="relative">
            <select
                value={value}
                onChange={(e) => onValueChange?.(e.target.value)}
                className="flex h-10 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 disabled:cursor-not-allowed disabled:opacity-50"
            >
                {placeholder && <option value="">{placeholder}</option>}
            </select>
        </div>
    )
}

export function SelectTrigger({ children, className }: { children: React.ReactNode, className?: string }) {
    return (
        <div className={`flex h-10 w-full items-center justify-between rounded-md border border-slate-300 bg-white px-3 py-2 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 disabled:cursor-not-allowed disabled:opacity-50 ${className || ''}`}>
            {children}
        </div>
    )
}

export function SelectValue({ placeholder }: { placeholder?: string }) {
    return <span className="text-slate-400">{placeholder || 'Select...'}</span>
}

export function SelectLabel({ children }: { children: React.ReactNode }) {
    return <span className="text-sm font-medium text-slate-700">{children}</span>
}

export function SelectContent({ children }: { children: React.ReactNode }) {
    return <div className="absolute z-50 min-w-[80px] overflow-hidden rounded-md border bg-popover text-popover-foreground shadow-md">{children}</div>
}

export function SelectItem({ value, children, onSelect }: { value: string, children: React.ReactNode, onSelect?: (value: string) => void }) {
    return (
        <div
            className="relative flex flex-col gap-2 rounded-none bg-popover p-2 text-sm hover:bg-accent hover:text-accent-foreground cursor-pointer focus:outline-none focus:bg-accent focus:text-accent-foreground"
            onClick={() => onSelect?.(value)}
        >
            {children}
        </div>
    )
}