import React from 'react';

interface SelectFieldProps<T> {
  label: string;
  value?: T;
  options: T[];
  onChange: (value: T) => void;
  getOptionLabel: (option: T) => string;
  getOptionValue: (option: T) => string;
  placeholder?: string;
}

function SelectField<T>({
  label,
  value,
  options,
  onChange,
  getOptionLabel,
  getOptionValue,
  placeholder = 'Select...'
}: SelectFieldProps<T>) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {label}
      </label>
      <select
        value={value ? getOptionValue(value) : ''}
        onChange={(e) => {
          const selected = options.find(opt => getOptionValue(opt) === e.target.value);
          if (selected) onChange(selected);
        }}
        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        <option value="">{placeholder}</option>
        {options.map((option) => (
          <option key={getOptionValue(option)} value={getOptionValue(option)}>
            {getOptionLabel(option)}
          </option>
        ))}
      </select>
    </div>
  );
}

export default SelectField;