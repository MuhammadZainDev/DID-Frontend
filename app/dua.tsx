import { View, StyleSheet, ScrollView, TouchableOpacity, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import subcategoriesData from '@/constants/subcategories.json';
import duasData from '@/constants/duas.json';

export default function DuaScreen() {
  const router = useRouter();
  const { subcategoryId } = useLocalSearchParams();
  
  // Find the subcategory details
  const subcategory = subcategoriesData.subcategories.find(subcat => subcat.id === subcategoryId);
  
  // Filter duas by subcategory
  const subcategoryDuas = duasData.duas.filter(dua => dua.subcategory_id === subcategoryId);

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <SafeAreaView>
          <View style={styles.headerTop}>
            <TouchableOpacity 
              style={styles.backButton} 
              onPress={() => router.back()}
            >
              <Ionicons name="arrow-back" size={24} color="white" />
            </TouchableOpacity>
            <ThemedText style={styles.title}>{subcategory?.name || 'Duas'}</ThemedText>
            <TouchableOpacity style={styles.iconButton}>
              <Ionicons name="bookmark-outline" size={24} color="white" />
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </View>

      {/* Content */}
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {subcategoryDuas.map((dua) => (
          <View key={dua.id} style={styles.duaCard}>
            <View style={styles.duaHeader}>
              <ThemedText style={styles.duaTitle}>{dua.title}</ThemedText>
              <TouchableOpacity style={styles.bookmarkButton}>
                <Ionicons name="bookmark-outline" size={20} color="#0E8A3E" />
              </TouchableOpacity>
            </View>
            
            <View style={styles.arabicContainer}>
              <ThemedText style={styles.arabicText}>{dua.arabic_text}</ThemedText>
            </View>
            
            <View style={styles.divider} />
            
            <View style={styles.translationContainer}>
              <ThemedText style={styles.translationText}>{dua.translation}</ThemedText>
            </View>
            
            <View style={styles.referenceContainer}>
              <ThemedText style={styles.referenceText}>Reference: {dua.reference}</ThemedText>
            </View>
            
            <View style={styles.actionButtons}>
              <TouchableOpacity style={styles.actionButton}>
                <Ionicons name="copy-outline" size={20} color="#0E8A3E" />
                <ThemedText style={styles.actionButtonText}>Copy</ThemedText>
              </TouchableOpacity>
              <TouchableOpacity style={styles.actionButton}>
                <Ionicons name="share-social-outline" size={20} color="#0E8A3E" />
                <ThemedText style={styles.actionButtonText}>Share</ThemedText>
              </TouchableOpacity>
              <TouchableOpacity style={styles.actionButton}>
                <Ionicons name="play-outline" size={20} color="#0E8A3E" />
                <ThemedText style={styles.actionButtonText}>Play</ThemedText>
              </TouchableOpacity>
            </View>
          </View>
        ))}
        <View style={styles.bottomPadding} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  header: {
    backgroundColor: '#0E8A3E',
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: Platform.OS === 'android' ? 40 : 0,
  },
  backButton: {
    padding: 8,
  },
  title: {
    color: 'white',
    fontSize: 20,
    fontWeight: '600',
  },
  iconButton: {
    padding: 8,
  },
  scrollView: {
    flex: 1,
    padding: 16,
  },
  duaCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 3,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  duaHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  duaTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#0E8A3E',
  },
  bookmarkButton: {
    padding: 4,
  },
  arabicContainer: {
    alignItems: 'center',
    paddingVertical: 16,
  },
  arabicText: {
    fontSize: 24,
    lineHeight: 36,
    textAlign: 'center',
    color: '#2C3E50',
  },
  divider: {
    height: 1,
    backgroundColor: '#E8F5ED',
    marginVertical: 12,
  },
  translationContainer: {
    paddingVertical: 8,
  },
  translationText: {
    fontSize: 16,
    lineHeight: 24,
    color: '#2C3E50',
  },
  referenceContainer: {
    marginTop: 8,
  },
  referenceText: {
    fontSize: 14,
    color: '#88A398',
    fontStyle: 'italic',
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 16,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#E8F5ED',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
  },
  actionButtonText: {
    marginLeft: 4,
    fontSize: 14,
    color: '#0E8A3E',
  },
  bottomPadding: {
    height: 20,
  },
}); 