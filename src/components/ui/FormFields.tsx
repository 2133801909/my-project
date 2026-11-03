import type { InputHTMLAttributes, SelectHTMLAttributes, TextareaHTMLAttributes } from 'react';

interface FieldShellProps {
  label: string;
  htmlFor: string;
  hint?: string;
  children: React.ReactNode;
}

function FieldShell({ label, htmlFor, hint, children }: FieldShellProps) {
  return (
    <div className="field">
      <label className="field__label" htmlFor={htmlFor}>
        {label}
      </label>
      {children}
      {hint ? <span className="field__hint">{hint}</span> : null}
    </div>
  );
}

interface TextFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  hint?: string;
}

export function TextField({ label, hint, id, name, ...props }: TextFieldProps) {
  const inputId = id ?? `field-${name ?? label}`;
  return (
    <FieldShell label={label} htmlFor={inputId} hint={hint}>
      <input id={inputId} name={name} className="input" {...props} />
    </FieldShell>
  );
}

interface SelectFieldProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
  hint?: string;
  children: React.ReactNode;
}

export function SelectField({ label, hint, id, name, children, ...props }: SelectFieldProps) {
  const selectId = id ?? `field-${name ?? label}`;
  return (
    <FieldShell label={label} htmlFor={selectId} hint={hint}>
      <select id={selectId} name={name} className="input" {...props}>
        {children}
      </select>
    </FieldShell>
  );
}

interface TextAreaFieldProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string;
  hint?: string;
}

export function TextAreaField({ label, hint, id, name, ...props }: TextAreaFieldProps) {
  const inputId = id ?? `field-${name ?? label}`;
  return (
    <FieldShell label={label} htmlFor={inputId} hint={hint}>
      <textarea id={inputId} name={name} className="input textarea" {...props} />
    </FieldShell>
  );
}
