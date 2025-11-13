"use client";

import { useState, useEffect, useRef } from "react";
import { Search, X } from "lucide-react";

interface AutocompleteOption {
  value: string;
  label: string;
  subLabel?: string;
  data?: any;
}

interface AutocompleteProps {
  options: AutocompleteOption[];
  value: string;
  onChange: (value: string, option?: AutocompleteOption) => void;
  onSearch?: (query: string) => void;
  placeholder?: string;
  displayValue?: string;
  required?: boolean;
  disabled?: boolean;
  className?: string;
  loading?: boolean;
}

export function Autocomplete({
  options,
  value,
  onChange,
  onSearch,
  placeholder = "Търсене...",
  displayValue,
  required = false,
  disabled = false,
  className = "",
  loading = false
}: AutocompleteProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [highlightedIndex, setHighlightedIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Filter options based on search query
  const filteredOptions = options.filter((option) =>
    option.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
    option.subLabel?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Handle search query change
  useEffect(() => {
    if (onSearch && searchQuery) {
      const timer = setTimeout(() => {
        onSearch(searchQuery);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [searchQuery, onSearch]);

  const handleSelect = (option: AutocompleteOption) => {
    onChange(option.value, option);
    setSearchQuery("");
    setIsOpen(false);
  };

  const handleClear = () => {
    onChange("", undefined);
    setSearchQuery("");
    setIsOpen(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlightedIndex((prev) =>
        prev < filteredOptions.length - 1 ? prev + 1 : prev
      );
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlightedIndex((prev) => (prev > 0 ? prev - 1 : prev));
    } else if (e.key === "Enter" && filteredOptions.length > 0) {
      e.preventDefault();
      handleSelect(filteredOptions[highlightedIndex]);
    } else if (e.key === "Escape") {
      setIsOpen(false);
    }
  };

  const selectedOption = options.find((opt) => opt.value === value);

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={isOpen ? searchQuery : (displayValue || selectedOption?.label || "")}
          onChange={(e) => {
            setSearchQuery(e.target.value);
            setIsOpen(true);
            setHighlightedIndex(0);
          }}
          onFocus={() => setIsOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          required={required}
          disabled={disabled}
          className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 pr-20 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 disabled:bg-gray-100 dark:border-white/[0.08] dark:bg-white/[0.05] dark:text-white dark:disabled:bg-white/[0.02]"
        />
        <div className="absolute inset-y-0 right-0 flex items-center gap-1 pr-2">
          {loading && (
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-gray-300 border-t-indigo-600"></div>
          )}
          {value && !disabled && (
            <button
              type="button"
              onClick={handleClear}
              className="rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-white/[0.05]"
            >
              <X className="h-4 w-4" />
            </button>
          )}
          <Search className="h-4 w-4 text-gray-400" />
        </div>
      </div>

      {/* Dropdown */}
      {isOpen && !disabled && (
        <div className="absolute z-50 mt-1 max-h-60 w-full overflow-auto rounded-md border border-gray-200 bg-white shadow-lg dark:border-white/[0.08] dark:bg-[#1a1a1a]">
          {filteredOptions.length === 0 ? (
            <div className="px-3 py-2 text-sm text-gray-500 dark:text-gray-400">
              Няма резултати
            </div>
          ) : (
            filteredOptions.map((option, index) => (
              <button
                key={option.value}
                type="button"
                onClick={() => handleSelect(option)}
                className={`w-full px-3 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-white/[0.05] ${
                  index === highlightedIndex
                    ? "bg-gray-100 dark:bg-white/[0.05]"
                    : ""
                } ${value === option.value ? "bg-indigo-50 dark:bg-indigo-900/20" : ""}`}
              >
                <div className="font-medium text-gray-900 dark:text-white">
                  {option.label}
                </div>
                {option.subLabel && (
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    {option.subLabel}
                  </div>
                )}
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
}
