import { useState, useCallback, useRef, useEffect } from "react"
import { Search, User, Loader2 } from "lucide-react"
import { usePatientList, useDebouncedValue } from "@/hooks"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import type { Patient } from "@/types"

interface PatientAutocompleteProps {
  value: string
  onChange: (value: string) => void
  onPatientSelect: (patient: Patient) => void
  placeholder?: string
  disabled?: boolean
  className?: string
}

export function PatientAutocomplete({
  value,
  onChange,
  onPatientSelect,
  placeholder = "Cari atau ketik nama pasien...",
  disabled = false,
  className,
}: PatientAutocompleteProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [inputValue, setInputValue] = useState(value)
  const inputRef = useRef<HTMLInputElement>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Debounce search to avoid too many API calls
  const debouncedSearch = useDebouncedValue(inputValue, 300)

  // Search patients when input has at least 2 characters
  const { data: patientData, isLoading } = usePatientList(
    debouncedSearch.length >= 2 ? { search: debouncedSearch, per_page: 10 } : undefined
  )

  const patients = patientData?.data?.data || []

  // Sync external value changes
  useEffect(() => {
    setInputValue(value)
  }, [value])

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = e.target.value
      setInputValue(newValue)
      onChange(newValue)
      setIsOpen(newValue.length >= 2)
    },
    [onChange]
  )

  const handlePatientSelect = useCallback(
    (patient: Patient) => {
      setInputValue(patient.patient_name)
      onChange(patient.patient_name)
      onPatientSelect(patient)
      setIsOpen(false)
    },
    [onChange, onPatientSelect]
  )

  const handleFocus = useCallback(() => {
    if (inputValue.length >= 2) {
      setIsOpen(true)
    }
  }, [inputValue])

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsOpen(false)
      }
    },
    []
  )

  const showDropdown = isOpen && (patients.length > 0 || isLoading)

  return (
    <div className="relative">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          ref={inputRef}
          value={inputValue}
          onChange={handleInputChange}
          onFocus={handleFocus}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={disabled}
          className={cn("pl-9", className)}
          autoComplete="off"
        />
        {isLoading && (
          <Loader2 className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-muted-foreground" />
        )}
      </div>

      {showDropdown && (
        <div
          ref={dropdownRef}
          className="absolute z-50 mt-1 w-full rounded-md border bg-popover shadow-lg"
        >
          {isLoading ? (
            <div className="flex items-center justify-center py-4">
              <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
              <span className="ml-2 text-sm text-muted-foreground">Mencari...</span>
            </div>
          ) : patients.length > 0 ? (
            <ul className="max-h-60 overflow-auto py-1">
              {patients.map((patient) => (
                <li
                  key={patient.id}
                  onClick={() => handlePatientSelect(patient)}
                  className="group/patient flex cursor-pointer items-start gap-3 px-3 py-2.5 hover:bg-accent transition-colors duration-150"
                >
                  <div className="mt-0.5 rounded-full bg-primary/10 p-1.5 transition-colors duration-150 group-hover/patient:bg-accent-foreground/20">
                    <User className="h-4 w-4 text-primary transition-colors duration-150 group-hover/patient:text-accent-foreground" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate transition-colors duration-150 group-hover/patient:text-accent-foreground">
                      {patient.patient_name}
                    </p>
                    <div className="flex flex-wrap gap-x-3 gap-y-0.5 text-xs text-muted-foreground mt-0.5 transition-colors duration-150 group-hover/patient:text-accent-foreground/70">
                      {patient.whatsapp_number && (
                        <span className="inline-flex items-center gap-1">
                          <span className="opacity-60">WA:</span> {patient.whatsapp_number}
                        </span>
                      )}
                      {patient.no_bpjs && (
                        <span className="inline-flex items-center gap-1">
                          <span className="opacity-60">BPJS:</span> {patient.no_bpjs}
                        </span>
                      )}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <div className="py-3 px-3 text-center text-sm text-muted-foreground">
              Tidak ditemukan. Lanjutkan mengisi data baru.
            </div>
          )}
        </div>
      )}
    </div>
  )
}
