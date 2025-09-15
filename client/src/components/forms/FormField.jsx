import {
  TextField,
  Checkbox,
  FormHelperText,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";
import React from "react"; // Import React for React.memo

const FormField = React.memo(function FormField({

  type = "text",
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
  variant = "outlined",
  className = "",
  unit,
  ...props
}) {
  if (type === "checkbox") {
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
  } else if (type === "select") {
    return (
      <div className={className}>
        <FormControl fullWidth size="small">
          <InputLabel id="demo-simple-select-label ">{label}</InputLabel>
          <Select
            name={name}
            value={value || ""}
            onChange={onChange}
            disabled={disabled}
            required={required}
            {...props}

          >
            {props.options.map((option) => (
              <MenuItem key={option.value} value={option.value}>
                {option.label || option.value}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </div>
    );
  }

  return (
    <div className={className}>
      <TextField
        type={type}
        name={name}
        label={label}
        value={
          type === "date" && typeof value === "string"
            ? value.split("T")[0]
            : value || ""
        }
        onChange={onChange}
        error={!!error}
        helperText={error || helperText}
        required={required}
        disabled={disabled}
        placeholder={placeholder}
        fullWidth={fullWidth}
        size="small"
        variant={variant}
        InputLabelProps={type === "date" ? { shrink: true } : undefined}
        InputProps={{
          onWheel:
            type === "number"
              ? (e) => e.target.blur() // 👈 disables scroll-change
              : undefined,
          endAdornment: <InputAdornment position="end">{unit}</InputAdornment>,
        }}
        inputProps={{

          list: type === "list" ? name : undefined,
          ...props.inputProps
        }}
        {...props}
        
      />

      {type === "list" && (
        <datalist id={name}>
          {props.labels?.map((label) => (
            <option key={label} value={label} />
          ))}
        </datalist>
      )}
    </div>
  );
});

export default FormField;
