import React from 'react';
import { View, SafeAreaView, StyleSheet, Text } from 'react-native';
import { useRouter } from 'expo-router';
import DynamicForm from '../../src/features/gst/components/DynamicForm';
import { FormField } from '../../src/features/gst/types/form.types';

export default function TestDatePickerScreen() {
  const router = useRouter();

  const testSchema: FormField[] = [
    {
      key: 'invoiceDate',
      label: 'Invoice Date',
      type: 'date',
      required: true,
      placeholder: 'Select Invoice Date',
    },
    {
      key: 'customerName',
      label: 'Customer Name',
      type: 'text',
      required: true,
      placeholder: 'Enter customer name',
    }
  ];

  const handleSubmit = (data: any) => {
    console.log('Submitted Data:', data);
    alert('Form Submitted: ' + JSON.stringify(data, null, 2));
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Test DatePicker & DynamicForm</Text>
        </View>
        <View style={styles.body}>
          <DynamicForm 
            schema={testSchema} 
            onSubmit={handleSubmit} 
            submitLabel="Save Data" 
          />
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f3f3f3',
  },
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#4B7BE5',
    padding: 16,
    paddingTop: 40,
    alignItems: 'center',
  },
  headerTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  body: {
    padding: 20,
  }
});
