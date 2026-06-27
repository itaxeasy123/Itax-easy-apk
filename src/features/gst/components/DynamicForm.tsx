import React, { useState } from 'react';

const parseDateString = (val: string | undefined) => {
  if (!val) return undefined;
  let d = new Date(val);
  if (isNaN(d.getTime()) && typeof val === 'string') {
    const parts = val.split(/[\/\-]/);
    if (parts.length === 3) {
      d = new Date(`${parts[2]}-${parts[1]}-${parts[0]}`);
    }
  }
  return isNaN(d.getTime()) ? undefined : d;
};

import { View, StyleSheet, TouchableOpacity, Text, Modal, FlatList, Platform } from 'react-native';
import { Datepicker } from '@ui-kitten/components';
import { FormControl, FormControlLabel, FormControlLabelText, FormControlError, FormControlErrorText, FormControlErrorIcon } from '../../../components/ui/form-control';
import { Input, InputField, InputIcon, InputSlot } from '../../../components/ui/input';
import { Button, ButtonText } from '../../../components/ui/button';
import { VStack } from '../../../components/ui/vstack';
import { AlertCircleIcon, ChevronDownIcon, CalendarIcon } from '../../../components/ui/icon';
import { DynamicFormProps, FormField } from '../types/form.types';

import { fontSizes, fontWeights } from "../../../theme/typography";
export default function DynamicForm({ schema, initialData = {}, onSubmit, submitLabel = 'Add Record' }: DynamicFormProps) {
  const [formData, setFormData] = useState<Record<string, any>>(initialData);
  const [errors, setErrors] = useState<Record<string, string>>({});

  React.useEffect(() => {
    if (Object.keys(initialData).length > 0) {
      setFormData(initialData);
    }
  }, [initialData]);
  
  // State for Select Modal
  const [activeSelect, setActiveSelect] = useState<FormField | null>(null);

  const handleChange = (key: string, value: any) => {
    setFormData(prev => ({ ...prev, [key]: value }));
    if (errors[key]) {
      setErrors(prev => ({ ...prev, [key]: '' }));
    }
  };

  const handleSubmit = () => {
    // Basic validation
    const newErrors: Record<string, string> = {};
    schema.forEach(field => {
      if (field.required && !formData[field.key]) {
        newErrors[field.key] = `${field.label} is required`;
      }
    });

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    onSubmit(formData);
  };

  const renderField = (field: FormField) => {
    const isInvalid = !!errors[field.key];
    const value = formData[field.key] || '';

    let FieldComponent = null;

    if (field.type === 'text' || field.type === 'number') {
      FieldComponent = (
        <Input>
          <InputField
            placeholder={field.placeholder || `Enter ${field.label}`}
            value={value}
            onChangeText={(text: string) => handleChange(field.key, text)}
            keyboardType={field.type === 'number' ? 'numeric' : 'default'}
          />
        </Input>
      );
      // using UI Kitten Datepicker for native, standard input for web
    } else if (field.type === 'date') {
      if (Platform.OS === 'web') {
        FieldComponent = (
          <Input>
            {/* @ts-ignore */}
            <input
              type="date"
              value={value ? value.substring(0, 10) : ''}
              onChange={(e: any) => handleChange(field.key, new Date(e.target.value).toISOString())}
              style={{ width: '100%', height: '100%', border: 'none', outline: 'none', backgroundColor: 'transparent', color: '#111827', fontSize: fontSizes.md, fontFamily: 'System', padding: '0 12px' }}
            />
          </Input>
        );
      } else {
        FieldComponent = (
                    <Datepicker
            date={parseDateString(value)}
            onSelect={nextDate => handleChange(field.key, nextDate.toISOString())}
            placeholder={field.placeholder || `Select ${field.label}`}
            style={styles.datepicker}
            min={new Date(1990, 0, 1)}
            max={new Date(2050, 11, 31)}
            accessoryRight={() => (
              <View style={{ paddingRight: 8 }}>
                <CalendarIcon size={20} color="#64748b" />
              </View>
            )}
          />
        );
      }
    } else if (field.type === 'select') {
      const selectedOption = field.options?.find(opt => opt.value === value);
      FieldComponent = (
        <TouchableOpacity
          activeOpacity={0.8}
          style={[styles.selectBox, isInvalid && { borderColor: '#EF4444' }]}
          onPress={() => setActiveSelect(field)}
        >
          <Text style={[styles.selectText, !value && { color: '#7B8190' }]}>
            {selectedOption ? selectedOption.label : (field.placeholder || `Select ${field.label}`)}
          </Text>
          <ChevronDownIcon size={16} color="#6B7280" />
        </TouchableOpacity>
      );
    } else if (field.type === 'checkbox') {
      const { Check } = require('lucide-react-native');
      FieldComponent = (
        <TouchableOpacity
          activeOpacity={0.8}
          style={styles.checkboxRow}
          onPress={() => handleChange(field.key, !value)}
        >
          <View style={[styles.checkbox, value && styles.checkboxActive]}>
            {value && <Check size={10} color="#ffffff" strokeWidth={3} />}
          </View>
        </TouchableOpacity>
      );
    }

    return (
      <FormControl key={field.key} isInvalid={isInvalid} isRequired={field.required}>
        {field.type !== 'checkbox' && (
          <FormControlLabel>
            <FormControlLabelText>{field.label}</FormControlLabelText>
          </FormControlLabel>
        )}
        
        {field.type === 'checkbox' ? (
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            {FieldComponent}
            <Text style={{ marginLeft: 8, fontSize: fontSizes.md, color: '#374151' }}>{field.label}</Text>
          </View>
        ) : (
          FieldComponent
        )}
      </FormControl>
    );
  };

  return (
    <VStack space={2}>
      {schema.map(renderField)}

      <TouchableOpacity activeOpacity={0.8} onPress={handleSubmit} style={styles.submitBtn}>
        <Text style={styles.submitBtnText}>{submitLabel}</Text>
      </TouchableOpacity>

      {/* Select Modal */}
      <Modal visible={!!activeSelect} transparent animationType="fade">
        <TouchableOpacity
          activeOpacity={1}
          style={styles.modalOverlay}
          onPress={() => setActiveSelect(null)}
        >
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>Select {activeSelect?.label}</Text>
            <FlatList
              data={activeSelect?.options || []}
              keyExtractor={item => item.value}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.optionItem}
                  onPress={() => {
                    if (activeSelect) {
                      handleChange(activeSelect.key, item.value);
                      setActiveSelect(null);
                    }
                  }}
                >
                  <Text style={styles.optionText}>{item.label}</Text>
                </TouchableOpacity>
              )}
            />
          </View>
        </TouchableOpacity>
      </Modal>
    </VStack>
  );
}

const styles = StyleSheet.create({
  submitBtn: {
    height: 42,
    backgroundColor: "#4d84dc",
    borderRadius: 4,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 12,
  },
  submitBtnText: {
    color: "#ffffff",
    fontSize: 13,
    fontWeight: "600",
  },
  datepicker: {
    flex: 1,
  },
  selectBox: {
    height: 42,
    borderWidth: 1,
    borderColor: '#C9D2E3',
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  selectText: {
    fontSize: fontSizes.sm,
    color: '#111827',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  modalBox: {
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    overflow: 'hidden',
    maxHeight: 300,
    paddingVertical: 10,
  },
  modalTitle: {
    fontSize: fontSizes.md,
    fontWeight: fontWeights.semibold,
    color: '#374151',
    paddingHorizontal: 16,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  optionItem: {
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderColor: '#E5E7EB',
  },
  optionText: {
    fontSize: fontSizes.md,
    color: '#111827',
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkbox: {
    width: 14,
    height: 14,
    borderWidth: 1,
    borderColor: '#777',
    backgroundColor: '#ffffff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxActive: {
    backgroundColor: '#4d84dc',
    borderColor: '#4d84dc',
  },
});
