import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, MapPin, Loader2, X } from 'lucide-react';

interface AutocompleteInputProps {
  value: string;
  onChange: (val: string) => void;
  options: string[];
  placeholder?: string;
  disabled?: boolean;
  required?: boolean;
  emptyHint?: string;
  id?: string;
  isLoading?: boolean;
  maxDisplayCount?: number;
}

export const AutocompleteInput: React.FC<AutocompleteInputProps> = ({
  value,
  onChange,
  options,
  placeholder = '',
  disabled = false,
  required = false,
  emptyHint = 'Nenhuma sugestão encontrada (você pode digitar livremente)',
  id,
  isLoading = false,
  maxDisplayCount = 80
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState<number>(-1);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Filter options based on typed input
  const trimmed = value.toLowerCase().trim();
  const filteredOptions = trimmed
    ? options.filter((item) => item.toLowerCase().includes(trimmed))
    : options;

  // Limit rendering for butter-smooth performance with large city lists (800+ cities)
  const displayedOptions = filteredOptions.slice(0, maxDisplayCount);
  const hiddenCount = filteredOptions.length - displayedOptions.length;

  // Close when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (option: string) => {
    onChange(option);
    setIsOpen(false);
    setHighlightedIndex(-1);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (disabled) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (!isOpen) {
        setIsOpen(true);
      } else {
        setHighlightedIndex((prev) =>
          prev < displayedOptions.length - 1 ? prev + 1 : 0
        );
      }
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlightedIndex((prev) =>
        prev > 0 ? prev - 1 : displayedOptions.length - 1
      );
    } else if (e.key === 'Enter') {
      if (isOpen && highlightedIndex >= 0 && displayedOptions[highlightedIndex]) {
        e.preventDefault();
        handleSelect(displayedOptions[highlightedIndex]);
      }
    } else if (e.key === 'Escape') {
      setIsOpen(false);
    }
  };

  return (
    <div ref={containerRef} className="relative w-full">
      <div className="relative">
        <input
          ref={inputRef}
          id={id}
          type="text"
          required={required}
          disabled={disabled}
          value={value}
          onChange={(e) => {
            onChange(e.target.value);
            setIsOpen(true);
            setHighlightedIndex(-1);
          }}
          onFocus={() => {
            if (options.length > 0) setIsOpen(true);
          }}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          autoComplete="off"
          className={`w-full px-3 py-2 pr-14 border border-gray-300 text-gray-900 text-sm focus:outline-none focus:border-[#0098d9] ${
            disabled ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-white'
          }`}
        />

        {/* Right Action Icons (Loading / Clear / Dropdown) */}
        <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
          {isLoading && (
            <Loader2 className="w-4 h-4 text-[#0098d9] animate-spin shrink-0" />
          )}

          {value && !disabled && (
            <button
              type="button"
              tabIndex={-1}
              onClick={() => {
                onChange('');
                setIsOpen(true);
                inputRef.current?.focus();
              }}
              className="text-gray-300 hover:text-gray-500 p-0.5 cursor-pointer"
              title="Limpar campo"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}

          {!disabled && (
            <button
              type="button"
              tabIndex={-1}
              onClick={() => setIsOpen((prev) => !prev)}
              className="text-gray-400 hover:text-gray-600 p-0.5 cursor-pointer"
            >
              <ChevronDown className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Autocomplete Dropdown */}
      {isOpen && !disabled && (
        <div className="absolute z-50 left-0 right-0 top-full mt-1 bg-white border border-gray-300 shadow-lg max-h-60 overflow-y-auto text-xs rounded-xs">
          {isLoading ? (
            <div className="p-3 text-center text-gray-500 flex items-center justify-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin text-[#0098d9]" />
              <span>Carregando dados oficiais do IBGE...</span>
            </div>
          ) : displayedOptions.length > 0 ? (
            <div>
              <ul className="py-1 divide-y divide-gray-50">
                {displayedOptions.map((opt, idx) => {
                  const isExact =
                    value.trim() && opt.toLowerCase() === value.toLowerCase().trim();
                  return (
                    <li
                      key={opt}
                      onMouseDown={(e) => {
                        e.preventDefault();
                        handleSelect(opt);
                      }}
                      onMouseEnter={() => setHighlightedIndex(idx)}
                      className={`px-3 py-2 cursor-pointer flex items-center justify-between transition-colors ${
                        highlightedIndex === idx
                          ? 'bg-[#0098d9] text-white font-medium'
                          : isExact
                          ? 'bg-sky-50 text-[#0098d9] font-semibold'
                          : 'text-gray-800 hover:bg-gray-50'
                      }`}
                    >
                      <span className="flex items-center gap-2 truncate">
                        <MapPin
                          className={`w-3.5 h-3.5 shrink-0 ${
                            highlightedIndex === idx
                              ? 'text-white'
                              : isExact
                              ? 'text-[#0098d9]'
                              : 'text-gray-400'
                          }`}
                        />
                        <span className="truncate">{opt}</span>
                      </span>
                      {isExact && (
                        <span
                          className={`text-[10px] font-bold px-1.5 py-0.2 rounded ${
                            highlightedIndex === idx
                              ? 'bg-white/20 text-white'
                              : 'bg-[#0098d9]/10 text-[#0098d9]'
                          }`}
                        >
                          Selecionado
                        </span>
                      )}
                    </li>
                  );
                })}
              </ul>

              {hiddenCount > 0 && (
                <div className="px-3 py-2 bg-gray-50 border-t border-gray-100 text-[11px] text-gray-500 text-center font-medium">
                  + {hiddenCount} outras opções encontradas. Digite mais letras para refinar.
                </div>
              )}
            </div>
          ) : (
            <div className="p-3 text-gray-400 italic text-[11px] leading-tight">
              {emptyHint}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
