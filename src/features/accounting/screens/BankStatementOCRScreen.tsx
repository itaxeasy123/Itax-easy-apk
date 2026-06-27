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
  ScrollView,
  Alert,
  SafeAreaView,
} from 'react-native';

import * as DocumentPicker from 'expo-document-picker';

import * as FileSystem from 'expo-file-system';

import * as Sharing from 'expo-sharing';

import { Ionicons } from '@expo/vector-icons';

import { useRouter } from 'expo-router';

import { uploadBankStatementOCR } from '../../../api/ocr.service';
import { accountingTheme } from "../../../theme/accounting";

import {
  saveBankStatement,
  getBankStatements,
  clearBankStatements,
} from '../../../store/bankStatementStorage';



interface StatementItem {
  id: string;
  fileName: string;
  createdAt: string;
  response: any;
}



const BankStatementOCRScreen = () => {
  const router = useRouter();

  const [loading, setLoading] =
    useState(false);

  const [statements, setStatements] =
    useState<StatementItem[]>([]);



  useEffect(() => {
    loadStatements();
  }, []);



  const loadStatements = () => {
    const data =
      getBankStatements();

    setStatements(data);
  };



  const pickPDF = async () => {
    try {
      const result =
        await DocumentPicker.getDocumentAsync(
          {
            type: 'application/pdf',
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
        await uploadBankStatementOCR(
          file
        );

      const statementData = {
        id: Date.now().toString(),
        fileName: file.name,
        createdAt:
          new Date().toISOString(),
        response,
      };

      saveBankStatement(
        statementData
      );

      loadStatements();

      Alert.alert(
        'Success',
        'Bank Statement OCR Completed'
      );
    } catch (error) {
      console.log(error);

      Alert.alert(
        'Error',
        'OCR Failed'
      );
    } finally {
      setLoading(false);
    }
  };



  const clearAll = () => {
    Alert.alert(
      'Clear All',
      'Delete all statements?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Clear',
          style: 'destructive',
          onPress: () => {
            clearBankStatements();

            loadStatements();
          },
        },
      ]
    );
  };

const exportData = async (
  item: StatementItem
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

    Alert.alert(
      'Export Failed'
    );
  }
};

  const renderItem = ({
    item,
  }: {
    item: StatementItem;
  }) => {
    return (
      <View style={styles.card}>
        <View
          style={styles.topRow}
        >
          <Ionicons
            name="document-text"
            size={24}
            color={accountingTheme.colors.primary}
          />

          <View
            style={{ flex: 1 }}
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
              {new Date(
                item.createdAt
              ).toLocaleString()}
            </Text>
          </View>
        </View>

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
                styles.actionText
              }
            >
              Export
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
                styles.actionText
              }
            >
              Clear
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView
      style={styles.container}
    >
      <View
        style={styles.header}
      >
        <TouchableOpacity
          onPress={() =>
            router.back()
          }
        >
          <Ionicons
            name="chevron-back"
            size={28}
            color={accountingTheme.colors.card}
          />
        </TouchableOpacity>

        <Text
          style={styles.headerTitle}
        >
          Bank Statement Import
        </Text>
      </View>

      <FlatList
        data={statements}
        keyExtractor={(
          item
        ) => item.id}
        renderItem={renderItem}
        showsVerticalScrollIndicator={
          false
        }
        contentContainerStyle={{
          padding: accountingTheme.spacing.lg,
          paddingBottom: 40,
        }}
        ListHeaderComponent={
          <View
            style={
              styles.uploadCard
            }
          >
            <Ionicons
              name="document-text-outline"
              size={70}
              color="#3b82f6"
            />

            <Text
              style={
                styles.title
              }
            >
              Upload Bank
              Statement
            </Text>

            <Text
              style={
                styles.subtitle
              }
            >
              Upload bank
              statement PDF for
              OCR extraction.
            </Text>

            <TouchableOpacity
              style={
                styles.uploadButton
              }
              onPress={pickPDF}
            >
              <Text
                style={
                  styles.uploadText
                }
              >
                {loading
                  ? 'Uploading...'
                  : 'Choose PDF'}
              </Text>
            </TouchableOpacity>
          </View>
        }
      />
    </SafeAreaView>
  );
};

export default
  BankStatementOCRScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f3f4f6',
  },

  header: {
    height: 90,
    backgroundColor: accountingTheme.colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: accountingTheme.spacing.lg,
    gap: accountingTheme.spacing.md,
    paddingTop: accountingTheme.spacing.xl,
  },

  headerTitle: {
    color: accountingTheme.colors.card,
    fontSize: 22,
    fontWeight: accountingTheme.fontWeights.bold,
  },

  uploadCard: {
    backgroundColor: accountingTheme.colors.card,
    borderRadius: 28,
    padding: accountingTheme.spacing.xxl,
    marginTop: accountingTheme.spacing.xl,
    alignItems: 'center',
  },

  title: {
    fontSize: 28,
    fontWeight: accountingTheme.fontWeights.extraBold,
    marginTop: accountingTheme.spacing.lg,
    color: '#111827',
  },

  subtitle: {
    textAlign: 'center',
    marginTop: accountingTheme.spacing.md,
    color: '#6b7280',
    lineHeight: 24,
    fontSize: accountingTheme.fontSizes.xl,
  },

  uploadButton: {
    backgroundColor: '#3b82f6',
    width: '100%',
    paddingVertical: 18,
    borderRadius: 18,
    marginTop: accountingTheme.spacing.xxl,
    alignItems: 'center',
  },

  uploadText: {
    color: accountingTheme.colors.card,
    fontWeight: accountingTheme.fontWeights.bold,
    fontSize: accountingTheme.fontSizes.xxl,
  },

  card: {
    backgroundColor: accountingTheme.colors.card,
    borderRadius: 24,
    padding: 18,
    marginTop: accountingTheme.spacing.xl,
  },

  topRow: {
    flexDirection: 'row',
    gap: accountingTheme.spacing.md,
    marginBottom: accountingTheme.spacing.lg,
  },

  fileName: {
    fontSize: accountingTheme.fontSizes.xl,
    fontWeight: accountingTheme.fontWeights.bold,
    color: '#111827',
  },

  date: {
    color: '#6b7280',
    marginTop: accountingTheme.spacing.xs,
  },

  responseBox: {
    backgroundColor: '#111827',
    borderRadius: accountingTheme.radius.xxl,
    maxHeight: 300,
    padding: 14,
  },

  responseText: {
    color: accountingTheme.colors.card,
    fontSize: accountingTheme.fontSizes.sm,
    lineHeight: 20,
  },

  actionRow: {
    flexDirection: 'row',
    gap: accountingTheme.spacing.md,
    marginTop: accountingTheme.spacing.lg,
  },

  exportButton: {
    flex: 1,
    backgroundColor: accountingTheme.colors.primary,
    paddingVertical: accountingTheme.spacing.lg,
    borderRadius: accountingTheme.radius.xxl,
    alignItems: 'center',
  },

  clearButton: {
    flex: 1,
    backgroundColor: accountingTheme.colors.danger,
    paddingVertical: accountingTheme.spacing.lg,
    borderRadius: accountingTheme.radius.xxl,
    alignItems: 'center',
  },

  actionText: {
    color: accountingTheme.colors.card,
    fontWeight: accountingTheme.fontWeights.bold,
    fontSize: accountingTheme.fontSizes.xl,
  },
});