import React, {
  useEffect,
  useState,
} from 'react';

import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  Alert,
  ScrollView,
} from 'react-native';

import * as DocumentPicker from 'expo-document-picker';

import * as Sharing from 'expo-sharing';

import * as FileSystem from 'expo-file-system';

import { Ionicons } from '@expo/vector-icons';

import { useRouter } from 'expo-router';

import {
  uploadInvoiceOCR,
} from '../../../api/ocr.service';

import {
  saveInvoice,
  getInvoices,
  deleteInvoice,
  clearInvoices,
  InvoiceItem,
} from '../../../store/invoiceStorage';

const InvoiceOCRScreen = () => {
  const router = useRouter();

  const [loading, setLoading] =
    useState(false);

  const [invoices, setInvoices] =
    useState<InvoiceItem[]>([]);

  useEffect(() => {
    loadInvoices();
  }, []);

  const loadInvoices = () => {
    const data = getInvoices();

    setInvoices(data);
  };

  const pickPDF = async () => {
    try {
      const result =
        await DocumentPicker.getDocumentAsync(
          {
            type:
              'application/pdf',
            copyToCacheDirectory:
              true,
          }
        );

      if (result.canceled) {
        return;
      }

      const file =
        result.assets[0];

      setLoading(true);

      const response =
        await uploadInvoiceOCR(
          file
        );

      const invoiceData: InvoiceItem =
        {
          id: Date.now().toString(),
          fileName: file.name,
          createdAt:
            new Date().toISOString(),
          response,
        };

      saveInvoice(invoiceData);

      loadInvoices();

      Alert.alert(
        'Success',
        'Invoice OCR Completed'
      );
    } catch (error) {
      console.log(error);

      Alert.alert(
        'Error',
        'Invoice OCR Failed'
      );
    } finally {
      setLoading(false);
    }
  };

const exportData = async (
  item: InvoiceItem
) => {
  try {
    const fileUri =
      `${FileSystem.Paths.cache.uri}${item.fileName}.json`;

    await FileSystem.writeAsStringAsync(
      fileUri,
      JSON.stringify(
        item.response,
        null,
        2
      )
    );

    await Sharing.shareAsync(
      fileUri
    );
  } catch (error) {
    console.log(
      'EXPORT ERROR:',
      error
    );
  }
};

  const removeInvoice = (
    id: string
  ) => {
    deleteInvoice(id);

    loadInvoices();
  };

  const clearAll = () => {
    Alert.alert(
      'Clear All',
      'Delete all invoices?',
      [
        {
          text: 'Cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            clearInvoices();

            loadInvoices();
          },
        },
      ]
    );
  };

  const renderItem = ({
    item,
  }: {
    item: InvoiceItem;
  }) => {
    return (
      <View style={styles.card}>
        <Text style={styles.fileName}>
          {item.fileName}
        </Text>

        <Text style={styles.date}>
          {item.createdAt}
        </Text>

        <ScrollView
          style={
            styles.responseBox
          }
        >
          <Text
            style={
              styles.responseText
            }
          >
            {JSON.stringify(
              item.response,
              null,
              2
            )}
          </Text>
        </ScrollView>

        <View
          style={
            styles.buttonRow
          }
        >
          <TouchableOpacity
            style={
              styles.exportButton
            }
            onPress={() =>
              exportData(item)
            }
          >
            <Text
              style={
                styles.buttonText
              }
            >
              Export
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={
              styles.deleteButton
            }
            onPress={() =>
              removeInvoice(
                item.id
              )
            }
          >
            <Text
              style={
                styles.buttonText
              }
            >
              Delete
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() =>
            router.back()
          }
        >
          <Ionicons
            name="arrow-back"
            size={24}
            color="#fff"
          />
        </TouchableOpacity>

        <Text style={styles.title}>
          Invoice Import
        </Text>
      </View>

      <View style={styles.uploadCard}>
        <Ionicons
          name="document-text"
          size={60}
          color="#3b82f6"
        />

        <Text
          style={
            styles.uploadTitle
          }
        >
          Upload Invoice
        </Text>

        <Text
          style={
            styles.uploadSubtitle
          }
        >
          Upload invoice PDF
          for OCR extraction.
        </Text>

        <TouchableOpacity
          style={
            styles.uploadButton
          }
          onPress={pickPDF}
        >
          <Text
            style={
              styles.buttonText
            }
          >
            {loading
              ? 'Uploading...'
              : 'Choose PDF'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={
            styles.clearButton
          }
          onPress={clearAll}
        >
          <Text
            style={
              styles.buttonText
            }
          >
            Clear All
          </Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={invoices}
        keyExtractor={(
          item
        ) => item.id}
        renderItem={renderItem}
      />
    </View>
  );
};

export default InvoiceOCRScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor:
      '#f3f4f6',
    padding: 16,
  },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor:
      '#2563eb',
    padding: 16,
    borderRadius: 14,
    marginBottom: 16,
  },

  title: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
    marginLeft: 12,
  },

  uploadCard: {
    backgroundColor:
      '#fff',
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    marginBottom: 20,
  },

  uploadTitle: {
    fontSize: 24,
    fontWeight: '700',
    marginTop: 16,
  },

  uploadSubtitle: {
    textAlign: 'center',
    color: '#6b7280',
    marginTop: 10,
    marginBottom: 20,
  },

  uploadButton: {
    backgroundColor:
      '#3b82f6',
    width: '100%',
    padding: 16,
    borderRadius: 14,
    alignItems: 'center',
  },

  clearButton: {
    backgroundColor:
      '#ef4444',
    width: '100%',
    padding: 16,
    borderRadius: 14,
    alignItems: 'center',
    marginTop: 12,
  },

  buttonText: {
    color: '#fff',
    fontWeight: '700',
  },

  card: {
    backgroundColor:
      '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },

  fileName: {
    fontWeight: '700',
    fontSize: 16,
  },

  date: {
    color: '#6b7280',
    marginTop: 6,
    marginBottom: 10,
  },

  responseBox: {
    backgroundColor:
      '#111827',
    borderRadius: 12,
    maxHeight: 300,
    padding: 12,
  },

  responseText: {
    color: '#fff',
    fontSize: 12,
  },

  buttonRow: {
    flexDirection: 'row',
    marginTop: 14,
    gap: 10,
  },

  exportButton: {
    flex: 1,
    backgroundColor:
      '#2563eb',
    padding: 14,
    borderRadius: 12,
    alignItems: 'center',
  },

  deleteButton: {
    flex: 1,
    backgroundColor:
      '#ef4444',
    padding: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
});