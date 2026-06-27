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
import { accountingTheme } from "../../../theme/accounting";

import {
  uploadGSTOCR,
} from '../../../api/ocr.service';

import {
  saveGST,
  getGSTs,
  deleteGST,
  clearGSTs,
  GSTItem,
} from '../../../store/gstStorage';

const GSTOCRScreen = () => {
  const router = useRouter();

  const [loading, setLoading] =
    useState(false);

  const [gstList, setGSTList] =
    useState<GSTItem[]>([]);

  useEffect(() => {
    loadGSTs();
  }, []);

  const loadGSTs = () => {
    const data = getGSTs();

    setGSTList(data);
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
        await uploadGSTOCR(file);

      const gstData: GSTItem =
        {
          id:
            Date.now().toString(),
          fileName:
            file.name,
          createdAt:
            new Date().toISOString(),
          response,
        };

      saveGST(gstData);

      loadGSTs();

      Alert.alert(
        'Success',
        'GST OCR Completed'
      );
    } catch (error) {
      console.log(error);

      Alert.alert(
        'Error',
        'GST OCR Failed'
      );
    } finally {
      setLoading(false);
    }
  };

  const removeGST = (
    id: string
  ) => {
    deleteGST(id);

    loadGSTs();
  };

  const clearAll = () => {
    Alert.alert(
      'Clear All',
      'Delete all GST records?',
      [
        {
          text: 'Cancel',
        },
        {
          text: 'Delete',
          style:
            'destructive',
          onPress: () => {
            clearGSTs();

            loadGSTs();
          },
        },
      ]
    );
  };

  const exportData = async (
    item: GSTItem
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
      console.log(error);
    }
  };

  return (
    <View style={styles.container}>
      {/* HEADER */}

      <View style={styles.header}>
        <TouchableOpacity
          onPress={() =>
            router.back()
          }
        >
          <Ionicons
            name="arrow-back"
            size={24}
            color={accountingTheme.colors.card}
          />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>
          GST Import
        </Text>
      </View>

      {/* UPLOAD CARD */}

      <View style={styles.uploadCard}>
        <Ionicons
          name="document-text-outline"
          size={70}
          color="#3b82f6"
        />

        <Text style={styles.title}>
          Upload GST PDF
        </Text>

        <Text
          style={styles.subtitle}
        >
          Upload GST certificate
          PDF for OCR extraction.
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

      {/* GST LIST */}

      <FlatList
        data={gstList}
        keyExtractor={(item) =>
          item.id
        }
        renderItem={({ item }) => (
          <View
            style={styles.card}
          >
            <Text
              style={
                styles.fileName
              }
            >
              {item.fileName}
            </Text>

            <Text
              style={styles.date}
            >
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
                styles.actionRow
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
                  removeGST(
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
        )}
      />
    </View>
  );
};

export default GSTOCRScreen;

const styles =
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor:
        '#f3f4f6',
      padding: accountingTheme.spacing.lg,
    },

    header: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor:
        accountingTheme.colors.primary,
      padding: 14,
      borderRadius: accountingTheme.radius.lg,
      marginBottom: accountingTheme.spacing.lg,
    },

    headerTitle: {
      color: accountingTheme.colors.card,
      fontSize: accountingTheme.fontSizes.xxl,
      fontWeight: accountingTheme.fontWeights.bold,
      marginLeft: accountingTheme.spacing.md,
    },

    uploadCard: {
      backgroundColor:
        accountingTheme.colors.card,
      borderRadius: 20,
      padding: accountingTheme.spacing.xxl,
      alignItems: 'center',
      marginBottom: accountingTheme.spacing.xl,
    },

    title: {
      fontSize: accountingTheme.fontSizes.display,
      fontWeight: accountingTheme.fontWeights.bold,
      marginTop: accountingTheme.spacing.lg,
      color: '#111827',
    },

    subtitle: {
      fontSize: accountingTheme.fontSizes.lg,
      color: '#6b7280',
      textAlign: 'center',
      marginTop: 10,
      marginBottom: accountingTheme.spacing.xl,
    },

    uploadButton: {
      backgroundColor:
        '#3b82f6',
      width: '100%',
      padding: accountingTheme.spacing.lg,
      borderRadius: accountingTheme.radius.xl,
      marginBottom: accountingTheme.spacing.md,
    },

    clearButton: {
      backgroundColor:
        accountingTheme.colors.danger,
      width: '100%',
      padding: accountingTheme.spacing.lg,
      borderRadius: accountingTheme.radius.xl,
    },

    buttonText: {
      color: accountingTheme.colors.card,
      textAlign: 'center',
      fontWeight: accountingTheme.fontWeights.bold,
    },

    card: {
      backgroundColor:
        accountingTheme.colors.card,
      padding: accountingTheme.spacing.lg,
      borderRadius: accountingTheme.radius.xxl,
      marginBottom: accountingTheme.spacing.xl,
    },

    fileName: {
      fontSize: accountingTheme.fontSizes.xl,
      fontWeight: accountingTheme.fontWeights.bold,
      color: '#111827',
    },

    date: {
      color: '#6b7280',
      marginTop: accountingTheme.spacing.xs,
      marginBottom: accountingTheme.spacing.md,
    },

    responseBox: {
      maxHeight: 300,
      backgroundColor:
        '#111827',
      borderRadius: accountingTheme.radius.lg,
      padding: accountingTheme.spacing.md,
    },

    responseText: {
      color: accountingTheme.colors.card,
      fontSize: accountingTheme.fontSizes.sm,
    },

    actionRow: {
      flexDirection: 'row',
      marginTop: accountingTheme.spacing.lg,
      gap: 10,
    },

    exportButton: {
      flex: 1,
      backgroundColor:
        accountingTheme.colors.primary,
      padding: 14,
      borderRadius: accountingTheme.radius.lg,
    },

    deleteButton: {
      flex: 1,
      backgroundColor:
        accountingTheme.colors.danger,
      padding: 14,
      borderRadius: accountingTheme.radius.lg,
    },
  });