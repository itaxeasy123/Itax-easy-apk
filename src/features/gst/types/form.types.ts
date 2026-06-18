export type FormFieldType = 'text' | 'number' | 'date' | 'select' | 'checkbox';

export interface FormFieldOption {
  label: string;
  value: string;
}

export interface FormField {
  key: string;
  label: string;
  type: FormFieldType;
  placeholder?: string;
  options?: FormFieldOption[];
  required?: boolean;
}

export interface DynamicFormProps {
  schema: FormField[];
  initialData?: Record<string, any>;
  onSubmit: (data: Record<string, any>) => void;
  submitLabel?: string;
}
