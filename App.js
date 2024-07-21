import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, View, Text, StatusBar, SafeAreaView, Image, TextInput, TouchableOpacity, Alert, Dimensions, FlatList, Animated, KeyboardAvoidingView, Platform } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/Entypo';
import axios from 'axios';
import cities from './components/cities'; 
const { height } = Dimensions.get('window');


import Cloudymoony from './assets/images/cloudy-moony.png';
import Cloudysunny from './assets/images/cloudy-sunny.png';
import Clearday from './assets/images/sunny.png';
import Clearnight from './assets/images/moony.png';
import Rain from './assets/images/rainy.png';
import Thunderstorm from './assets/images/thunderstorm.png';
import Wind from './assets/images/Wind.png';
import Humidity from './assets/images/humidty.png';


const weatherIcons = {
  '01d': Clearday,
  '01n': Clearnight,
  '02d': Cloudysunny,
  '02n': Cloudymoony,
  '03d': Cloudysunny,
  '03n': Cloudymoony,
  '04d': Cloudysunny,
  '04n': Cloudymoony,
  '09d': Rain,
  '09n': Rain,
  '10d': Rain,
  '10n': Rain,
  '11d': Thunderstorm,
  '11n': Thunderstorm,
  '13d': Cloudysunny,
  '13n': Cloudymoony,
  '50d': Cloudysunny,
  '50n': Cloudymoony,
};

const App = () => {
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [city, setCity] = useState('');
  const [weatherData, setWeatherData] = useState(null);
  const [forecastData, setForecastData] = useState([]);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const translateYAnim = useRef(new Animated.Value(50)).current;
  const fadeHeaderAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 2000,
      useNativeDriver: true,
    }).start();

    Animated.spring(translateYAnim, {
      toValue: 0,
      friction: 5,
      useNativeDriver: true,
    }).start();

    Animated.timing(fadeHeaderAnim, {
      toValue: 1,
      duration: 2000,
      useNativeDriver: true,
    }).start();
  }, [fadeAnim, translateYAnim, fadeHeaderAnim]);

  const handlePress = () => {
    setShowSearch(!showSearch);
  };

  const handleSearchChange = (text) => {
    
    const formattedText = text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
    setSearchQuery(formattedText);
  };

  const fetchWeatherData = async (cityName) => {
    const apiKey = '1063d48df4b64814e60f9f952963e5b1'; 
    const apiUrl = `https://api.openweathermap.org/data/2.5/weather?q=${cityName}&appid=${apiKey}&units=metric`;
    const forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?q=${cityName}&appid=${apiKey}&units=metric`;

    try {
      const response = await axios.get(apiUrl);
      setWeatherData(response.data);

      const forecastResponse = await axios.get(forecastUrl);
      const forecastList = forecastResponse.data.list;

   
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(today.getDate() + 1);

      
      const filteredData = forecastList.filter(item => {
        const forecastDate = new Date(item.dt_txt);
        forecastDate.setHours(0, 0, 0, 0);
        return forecastDate >= tomorrow;
      }).filter((_, index) => index % 8 === 0).slice(0, 5); 

      setForecastData(filteredData);
    } catch (error) {
      Alert.alert('Error', 'Failed to fetch weather data');
      console.error(error);
    }
  };

  const handleSearchSubmit = () => {
    const formattedQuery = searchQuery.trim();
    if (cities.includes(formattedQuery)) {
      setCity(formattedQuery);
      fetchWeatherData(formattedQuery);
    } else {
      Alert.alert('City not found', `City "${formattedQuery}" not found!`);
    }
    setShowSearch(false);
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : null}
    >
      <SafeAreaView style={styles.container}>
        <StatusBar translucent backgroundColor="transparent" />
        <LinearGradient colors={['#0082c8', '#4A00E0']} style={styles.gradientBackground}>
          <Animated.View style={[styles.header, { opacity: fadeHeaderAnim }]}>
            <TouchableOpacity onPress={handlePress}>
              <Icon name="location" size={29} color="white" style={styles.icon} />
            </TouchableOpacity>
            {showSearch ? (
              <View style={styles.searchContainer}>
                <TextInput
                  style={styles.searchInput}
                  placeholder="Search City"
                  placeholderTextColor="#aaa"
                  value={searchQuery}
                  onChangeText={handleSearchChange}
                  onSubmitEditing={handleSearchSubmit}
                />
              </View>
            ) : (
              <Text style={styles.text}>{city}</Text>
            )}
          </Animated.View>
          {weatherData ? (
            <Animated.View style={[styles.weatherContainer, { top: height / 2 - 150, opacity: fadeAnim, transform: [{ translateY: translateYAnim }] }]}>
              <Image source={weatherIcons[weatherData.weather[0].icon]} style={styles.image} />
              <Text style={styles.temperature}>{Math.round(weatherData.main.temp)}°C</Text>
              <Text style={styles.prediction}>{weatherData.weather[0].description}</Text>
              <View style={styles.horizontalDetails}>
                <View style={styles.detailItem}>
                  <Image source={Wind} style={styles.detailImage} />
                  <Text style={styles.details}>Wind: {weatherData.wind.speed} m/s</Text>
                </View>
                <View style={styles.detailItem}>
                  <Image source={Humidity} style={styles.detailImage} />
                  <Text style={styles.details}>Humidity: {weatherData.main.humidity}%</Text>
                </View>
              </View>
            </Animated.View>
          ) : (
            <Text style={styles.noData}>Enter a city name to get temperature</Text>
          )}
          {forecastData.length > 0 && (
            <Animated.View style={[styles.forecastContainer, { opacity: fadeAnim, transform: [{ translateY: translateYAnim }] }]}>
              <FlatList
                data={forecastData}
                horizontal
                renderItem={({ item }) => (
                  <View style={styles.forecastItem}>
                    <Text style={styles.forecastText}>{new Date(item.dt_txt).toLocaleDateString('en-US', { weekday: 'long' })}</Text>
                    <Image source={weatherIcons[item.weather[0].icon]} style={styles.forecastImage} />
                    <Text style={styles.forecastTemp}>{Math.round(item.main.temp)}°C</Text>
                  </View>
                )}
                keyExtractor={(item) => item.dt_txt}
                showsHorizontalScrollIndicator={false}
              />
            </Animated.View>
          )}
        </LinearGradient>
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradientBackground: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    position: 'absolute',
    top: 80,
    left: 20,
    right: 20,
  },
  searchContainer: {
    flex: 1,
  },
  searchInput: {
    height: 40,
    borderColor: '#fff',
    borderBottomWidth: 1,
    backgroundColor: '#fff',
    color: '#000',
    paddingHorizontal: 20,
    borderRadius: 15,
  },
  icon: {
    marginRight: 10,
  },
  text: {
    color: 'white',
    fontSize: 29,
  },
  weatherContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
  },
  image: {
    width: 270,
    height: 270,
    top: -170,
    resizeMode: 'contain',
    marginBottom: 10,
  },
  temperature: {
    color: 'white',
    fontSize: 88,
    top: -200,
  },
  prediction: {
    color: 'white',
    fontSize: 24,
    top: -210,
    textTransform: 'capitalize',
  },
  horizontalDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    paddingHorizontal: 30,
    top: -140,
  },
  detailItem: {
    alignItems: 'center',
    top:-40
  },
  detailImage: {
    width: 70,
    height: 70,
    resizeMode: 'contain',
    marginBottom: 5,
  },
  details: {
    color: 'white',
    fontSize: 22,
  },
  noData: {
    color: 'white',
    fontSize: 24,
    
  },
  forecastContainer: {
    backgroundColor:"#F5F5F5",
    top:780,
    borderRadius:20
  },
  forecastItem: {
    alignItems: 'center',
    marginHorizontal: 20,
    marginTop:20,
    
  },
  forecastText: {
    color: 'black',
    fontSize: 18,
  },
  forecastImage: {
    width: 50,
    height: 50,
    resizeMode: 'contain',
    marginVertical: 5,
  },
  forecastTemp: {
    color: 'black',
    fontSize: 20,
  },
});

export default App;
