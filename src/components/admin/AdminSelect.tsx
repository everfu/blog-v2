'use client'

import {
  Children,
  isValidElement,
  type ReactElement,
  type ReactNode,
  type SelectHTMLAttributes,
  useEffect,
  useMemo,
  useState,
} from 'react'
import { cn } from '@/lib/utils'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

type OptionElementProps = {
  value?: string | number
  disabled?: boolean
  children?: ReactNode
}

type AdminSelectOption = {
  value: string
  label: ReactNode
  disabled: boolean
}

type AdminSelectProps = Omit<SelectHTMLAttributes<HTMLSelectElement>, 'value' | 'onChange' | 'multiple' | 'size'>

const EMPTY_VALUE = '__admin_empty_value__'

function optionLabelToString(label: ReactNode) {
  if (typeof label === 'string' || typeof label === 'number') return String(label)
  return ''
}

function normalizeDefaultValue(value: AdminSelectProps['defaultValue']) {
  if (Array.isArray(value)) return String(value[0] ?? '')
  return value == null ? '' : String(value)
}

function getOptionValue(element: ReactElement<OptionElementProps>) {
  const explicitValue = element.props.value
  if (explicitValue != null) return String(explicitValue)
  return optionLabelToString(element.props.children)
}

function toSelectValue(value: string) {
  return value === '' ? EMPTY_VALUE : value
}

function fromSelectValue(value: string) {
  return value === EMPTY_VALUE ? '' : value
}

export function AdminSelect({
  className = '',
  children,
  defaultValue,
  disabled,
  name,
  required,
  id,
}: AdminSelectProps) {
  const options = useMemo<AdminSelectOption[]>(() => (
    Children.toArray(children)
      .filter(isValidElement)
      .map(child => {
        const option = child as ReactElement<OptionElementProps>
        return {
          value: getOptionValue(option),
          label: option.props.children,
          disabled: Boolean(option.props.disabled),
        }
      })
  ), [children])

  const firstEnabledOption = options.find(option => !option.disabled)
  const initialValue = normalizeDefaultValue(defaultValue) || firstEnabledOption?.value || ''
  const [selectedValue, setSelectedValue] = useState(initialValue)
  const selectedOption = options.find(option => option.value === selectedValue) || firstEnabledOption

  useEffect(() => {
    setSelectedValue(initialValue)
  }, [initialValue])

  return (
    <div className="min-w-0">
      <input name={name} value={selectedOption?.value || ''} required={required} type="hidden" />
      <Select
        value={toSelectValue(selectedOption?.value || '')}
        disabled={disabled}
        onValueChange={value => setSelectedValue(fromSelectValue(value))}
      >
        <SelectTrigger id={id} className={cn('h-9 w-full bg-background', className)}>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {options.map((option, index) => (
            <SelectItem
              key={`${option.value}-${index}`}
              value={toSelectValue(option.value)}
              disabled={option.disabled}
            >
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}
