import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ImageBackground, Image, Dimensions, StatusBar } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../context/ThemeContext';

const { width } = Dimensions.get('window');

interface PrayerStep {
  id: string;
  title: string;
  image: any;
  description: string;
  boldDescription: string;
}

// Prayer steps data
const prayerSteps: PrayerStep[] = [
  {
    id: '1',
    title: 'Niyyat (Intention)',
    image: require('../assets/namazWay/1.png'),
    boldDescription: 'Before starting, make the intention in your heart that you are praying 2 Rakat Salah for Allah. You can also say',
    description: 'I intend to pray 2 Rakat Salah for Allah, facing the Qibla, Allahu Akbar.',
  },
  {
    id: '2',
    title: 'Takbeer-e-Tahreema (Opening Takbeer)',
    image: require('../assets/namazWay/2.png'),
    boldDescription: 'Raise both hands and say "Allahu Akbar"',
    description: 'Place your hands on your chest (Men: below the navel, Women: on the chest).',
  },
  {
    id: '3',
    title: 'Recite Thanaa (Opening Supplication)',
    image: require('../assets/namazWay/3.png'),
    boldDescription: 'Subhanaka Allahumma wa bihamdika, wa tabarakasmuka, wa ta\'ala jadduka, wa la ilaha ghairuk.',
    description: '',
  },
  {
    id: '4',
    title: 'Recite Ta\'awwuz and Tasmiyah',
    image: require('../assets/namazWay/3.png'),
    boldDescription: 'A\'udhu billahi minash shaytanir rajeem\nBismillahir Rahmanir Raheem',
    description: '',
  },
  {
    id: '5',
    title: 'Recite Surah Al-Fatiha',
    image: require('../assets/namazWay/3.png'),
    boldDescription: ' Alhamdu lillahi Rabbil ‘aalameen, Ar-Rahmaanir-Raheem, Maaliki Yawmid-Deen, Iyyaaka na’budu wa iyyaaka nasta’een, Ihdinas-Siraatal-Mustaqeem, Siraatal-lazeena an’amta ‘alayhim ghayril-maghdoobi ‘alayhim walad-daalleen. Ameen',
    description: '',
  },
  {
    id: '6',
    title: 'Recite Any Surah',
    image: require('../assets/namazWay/3.png'),
    boldDescription: 'Example: Surah Ikhlas (Qul Huwa Allahu Ahad...) or any short Surah.',
    description: '',
  },
  {
    id: '7',
    title: 'Go to Ruku (Bowing)',
    image: require('../assets/namazWay/4.png'),
    boldDescription: 'Say "Allahu Akbar" and bow down.\nRecite "Subhana Rabbiyal Azeem" (3 times)',
    description: '',
  },
  {
    id: '8',
    title: 'Stand Up from Ruku (Qawmah)',
    image: require('../assets/namazWay/1.png'),
    boldDescription: 'Say "Sami’ Allahu liman hamidah, Rabbana lakal hamd."',
    description: '',
  },
  {
    id: '9',
    title: 'Go to Sujood (Prostration)',
    image: require('../assets/namazWay/5.png'),
    boldDescription: 'Say "Allahu Akbar" and prostrate.\nRecite "Subhana Rabbiyal A\'la" (3 times).',
    description: '',
  },
  {
    id: '10',
    title: 'Sit between the two Sujood (Jalsa)',
    image: require('../assets/namazWay/6.png'),
    boldDescription: 'Sit for a moment, then perform the second Sujood.',
    description: '',
  }, 
  {
    id: '11',
    title: 'Second Rakat',
    image: require('../assets/namazWay/3.png'),
    boldDescription: ' Recite Bismillah and Surah Al-Fatiha \n Recite any Surah \n Perform Ruku, Qawmah, and Sujood like the first Rakat \n After the second Sujood, sit for the final sitting (Qa\'dah Akhirah).',
    description: '',
  },  
  {
    id: '12',
    title: 'Final Sitting (Tashahhud) Recite',
    image: require('../assets/namazWay/6.png'),
    boldDescription: 'At-tahiyyatu lillahi was-salawatu wat-tayyibat, as-salamu ‘alayka ayyuhan-nabiyyu wa rahmatullahi wa barakatuh, as-salamu ‘alayna wa ‘ala ‘ibadillahis-saliheen. Ashhadu alla ilaha illallah wa ashhadu anna Muhammadan ‘abduhu wa rasooluh.',
    description: '',
  },
  {
    id: '13',
    title: 'Tashahhud (At-Tahiyyat) & Finger Movement',
    image: require('../assets/namazWay/7.png'),
    boldDescription: 'When reciting "Ashhadu an la ilaha", raise the index finger of your right hand.\n When you say "illallah", lower it back down or keep it raised until the end of Tashahhud (depending on different opinions in Hanafi fiqh).',
    description: '',
  },
  {
    id: '14',
    title: 'Durood (Salawat on the Prophet ﷺ)',
    image: require('../assets/namazWay/6.png'),
    boldDescription: 'Allahumma salli ‘ala Muhammadin wa ‘ala aali Muhammadin, kamaa sallayta ‘ala Ibraheema wa ‘ala aali Ibraheema, innaka hameedum majeed. Allahumma baarik ‘ala Muhammadin wa ‘ala aali Muhammadin, kamaa baarakta ‘ala Ibraheema wa ‘ala aali Ibraheema, innaka hameedum majeed.',
    description: '',
  },
  {
    id: '15',
    title: 'Dua after Durood',
    image: require('../assets/namazWay/6.png'),
    boldDescription: 'Allahumma Rabbij‘alni muqeema as-salati wa min dhurriyyati, Rabbana wa taqabbal du‘a. Rabbana ighfir li wa liwalidayya wa lil-mu’mineena yawma yaqoomul-hisab.',
    description: '',
  },
  {
    id: '16',
    title: 'Ending the Salah (Salam)',
    image: require('../assets/namazWay/8.png'),
    boldDescription: 'Turn your head to the right and say: "Assalamu Alaikum wa Rahmatullah"\nTurn your head to the left and say:"Assalamu Alaikum wa Rahmatullah"',
    description: '',
  },
  // More steps will be added later
];
export default function NamazGuidePage() {
  const router = useRouter();
  const { colors } = useTheme();

  const renderPrayerCard = (item: PrayerStep) => {
    return (
      <View key={item.id} style={styles.card}>
        <View style={styles.imageContainer}>
          <Image source={item.image} style={styles.stepImage} resizeMode="contain" />
        </View>
        <View style={styles.stepContent}>
          <Text style={[styles.stepTitle, { color: colors.primary }]}>{item.title}</Text>
          <View style={[styles.stepDivider, { backgroundColor: colors.primary }]} />
          <View>
            <Text style={styles.boldDescription}>{item.boldDescription}</Text>
            <Text style={styles.stepDescription}>{item.description}</Text>
          </View>
        </View>
      </View>
    );
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: '#121212',
    },
    safeArea: {
      backgroundColor: colors.primary,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingVertical: 16,
      paddingHorizontal: 16,
      backgroundColor: colors.primary,
    },
    backButton: {
      padding: 8,
    },
    headerTitle: {
      fontSize: 18,
      fontWeight: 'bold',
      color: '#FFFFFF',
    },
    emptyView: {
      width: 40,
    },
    content: {
      flex: 1,
    },
    bannerImage: {
      width: '100%',
      height: 150,
    },
    bannerOverlay: {
      width: '100%',
      height: '100%',
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      justifyContent: 'center',
      alignItems: 'center',
      padding: 20,
    },
    bannerTitle: {
      fontSize: 24,
      fontWeight: 'bold',
      color: '#FFFFFF',
      textAlign: 'center',
      marginBottom: 8,
    },
    bannerSubtitle: {
      fontSize: 16,
      color: '#FFFFFF',
      textAlign: 'center',
      opacity: 0.8,
    },
    section: {
      padding: 16,
      marginBottom: 16,
      alignItems: 'center',
    },
    sectionTitle: {
      fontSize: 20,
      fontWeight: 'bold',
      color: colors.primary,
      marginBottom: 20,
      textAlign: 'center',
    },
    // Card styles
    card: {
      backgroundColor: '#1E1E1E',
      borderRadius: 12,
      overflow: 'hidden',
      width: '90%',
      marginBottom: 20,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.3,
      shadowRadius: 4,
      elevation: 5,
    },
    imageContainer: {
      width: '100%',
      height: 220,
      backgroundColor: '#F5F5EE', // Light creamy background color
      alignItems: 'center',
      justifyContent: 'center',
      borderBottomWidth: 2,
      borderBottomColor: colors.primary,
    },
    stepImage: {
      width: '80%',
      height: 200,
    },
    stepContent: {
      padding: 20,
    },
    stepTitle: {
      fontSize: 22,
      fontWeight: 'bold',
      marginBottom: 12,
      textAlign: 'center',
    },
    stepDivider: {
      height: 2,
      width: 60,
      marginBottom: 16,
      alignSelf: 'center',
    },
    descriptionContainer: {
      marginTop: 8,
    },
    stepDescription: {
      fontSize: 16,
      color: '#E0E0E0',
      lineHeight: 24,
      textAlign: 'center',
      marginTop: 8,
    },
    boldDescription: {
      fontSize: 16,
      color: '#FFFFFF',
      lineHeight: 24,
      textAlign: 'center',
      fontWeight: 'bold',
    },
  });

  return (
    <View style={styles.container}>
      <StatusBar backgroundColor={colors.primary} barStyle="light-content" />
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back" size={24} color="#FFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Prayer Guide</Text>
          <View style={styles.emptyView} />
        </View>
      </SafeAreaView>

      <ScrollView style={styles.content}>
        <ImageBackground
          source={require('../assets/img/homeBG.jpg')}
          style={styles.bannerImage}
          resizeMode="cover"
        >
          <View style={styles.bannerOverlay}>
            <Text style={styles.bannerTitle}>How to Pray Namaz</Text>
            <Text style={styles.bannerSubtitle}>Step-by-step guide with visuals</Text>
          </View>
        </ImageBackground>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Step-by-Step Prayer Guide</Text>
          
          {/* Vertical prayer cards */}
          {prayerSteps.map(step => renderPrayerCard(step))}
        </View>
        
        {/* Added bottom padding for better scrolling */}
        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
} 