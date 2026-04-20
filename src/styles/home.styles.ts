import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0F1C',
  },

  header: {
    padding: 20,
    backgroundColor: '#111827',
  },

  logo: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
  },

  tagline: {
    color: '#9CA3AF',
    fontSize: 12,
    marginTop: 4,
  },

  card: {
    backgroundColor: '#1F2937',
    margin: 16,
    padding: 20,
    borderRadius: 16,
  },

  cardTitle: {
    color: '#9CA3AF',
  },

  balance: {
    color: '#fff',
    fontSize: 28,
    fontWeight: 'bold',
    marginTop: 10,
  },

  actionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginVertical: 10,
  },

  actionCard: {
    backgroundColor: '#1F2937',
    padding: 15,
    borderRadius: 12,
    width: 90,
    alignItems: 'center',
  },

  actionText: {
    color: '#fff',
  },

  section: {
    marginTop: 20,
    paddingHorizontal: 16,
  },

  sectionTitle: {
    color: '#fff',
    fontSize: 18,
    marginBottom: 10,
  },

  serviceCard: {
    backgroundColor: '#111827',
    padding: 15,
    borderRadius: 12,
    marginBottom: 10,
  },

  serviceText: {
    color: '#fff',
  },

  authContainer: {
    marginTop: 30,
    paddingHorizontal: 16,
  },

  loginBtn: {
    backgroundColor: '#2563EB',
    padding: 15,
    borderRadius: 12,
    marginBottom: 10,
  },

  signupBtn: {
    backgroundColor: '#10B981',
    padding: 15,
    borderRadius: 12,
  },

  btnText: {
    color: '#fff',
    textAlign: 'center',
    fontWeight: 'bold',
  },

  footer: {
    padding: 10,
    alignItems: 'center',
    backgroundColor: '#111827',
  },

  footerText: {
    color: '#6B7280',
    fontSize: 12,
  },
});