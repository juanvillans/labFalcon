import { TextField, Checkbox, FormHelperText, InputAdornment } from '@mui/material';

export default function FormField({
  type = 'text',
  name,
  label,
  value,
  onChange,
  error,
  helperText,
  required = false,
  disabled = false,
  placeholder,
  fullWidth = true,
  variant = 'outlined',
  className = '',
  unit,
  ...props
}) {
  if (type === 'checkbox') {
    return (
      <div className={`flex items-start gap-3 ${className}`}>
        <Checkbox
          name={name}
          checked={value || false}
          onChange={onChange}
          disabled={disabled}
          color="primary"
          className="mt-1"
          {...props}
        />
        <div className="flex flex-col">
          <label className="text-sm font-medium text-gray-700 ">
            {label || name}
          </label>
          {helperText && !error && (
            <FormHelperText className="mt-0 text-xs text-gray-500">
              {helperText}
            </FormHelperText>
          )}
          {error && (
            <FormHelperText error className="mt-0">
              {error}
            </FormHelperText>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className={className}>
      <TextField
        type={type}
        name={name}
        label={label || name}
        value={value || ''}
        onChange={onChange}
        error={!!error}
        helperText={error || helperText}
        required={required}
        disabled={disabled}
        placeholder={placeholder}
        fullWidth={fullWidth}
        variant={variant}
        InputProps={{
          endAdornment: <InputAdornment position="end">{unit}</InputAdornment>,
        }}
        {...props}
      />
    </div>
  );
}
