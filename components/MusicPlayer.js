import React, {useState, useEffect, useRef} from 'react';

import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  Dimensions,
  TouchableOpacity,
  Image,
  Animated,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Slider from '@react-native-community/slider';

import songs from '../models/data';

const {width} = Dimensions.get('window');

const MusicPlayer = () => {
  const [songIdx, setSongIdx] = useState(0);

  const scrollX = useRef(new Animated.Value(0)).current;
  const songSlider = useRef(0);

  useEffect(() => {
    scrollX.addListener(({value}) => {
      //   console.log('SCROLL', scrollX);
      //   console.log('WIDTH', width);

      const idx = Math.round(value / width);
      setSongIdx(idx);

      //   console.log('INDEX', idx);
    });

    return () => {
      scrollX.removeAllListeners();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const skipToNext = () => {
    songSlider.current.scrollToOffset({
      offset: (songIdx + 1) * width,
    });
  };
  const skipToPrevious = () => {
    songSlider.current.scrollToOffset({
      offset: (songIdx - 1) * width,
    });
  };

  const renderSongs = ({item}) => {
    return (
      <Animated.View style={styles.slideContainer}>
        <View style={styles.imgWrapper}>
          <Image source={item.image} style={styles.img} />
        </View>
      </Animated.View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.mainContainer}>
        <View style={{width: width}}>
          <Animated.FlatList
            ref={songSlider}
            data={songs}
            renderItem={renderSongs}
            keyExtractor={i => i.id}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            scrollEventThrottle={16}
            onScroll={Animated.event(
              [
                {
                  nativeEvent: {
                    contentOffset: {x: scrollX},
                  },
                },
              ],
              {useNativeDriver: true},
            )}
          />
        </View>
        <View>
          <Text style={styles.title}>{songs[songIdx].title}</Text>
          <Text style={styles.artist}>{songs[songIdx].artist}</Text>
        </View>

        <View>
          <Slider
            style={styles.progressContainer}
            value={30}
            minimumValue={0}
            maximumValue={100}
            thumbTintColor="#ffd369"
            minimumTrackTintColor="#ffd369"
            maximumTrackTintColor="#fff"
            onSlidingComplete={() => {}}
          />
          <View style={styles.progressLabelContainer}>
            <Text style={styles.progressLabelTxt}>0:00</Text>
            <Text style={styles.progressLabelTxt}>4:40</Text>
          </View>
        </View>

        <View style={styles.musicControlls}>
          <TouchableOpacity activeOpacity={0.8} onPress={skipToPrevious}>
            <Ionicons
              name="play-skip-back-outline"
              size={30}
              color="#ffd369"
              style={styles.mrt}
            />
          </TouchableOpacity>
          <TouchableOpacity activeOpacity={0.8}>
            <Ionicons name="ios-pause-circle" size={60} color="#ffd369" />
          </TouchableOpacity>
          <TouchableOpacity activeOpacity={0.8} onPress={skipToNext}>
            <Ionicons
              name="play-skip-forward-outline"
              size={30}
              color="#ffd369"
              style={styles.mrt}
            />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.bottomContainer}>
        <View style={styles.bottomControls}>
          <TouchableOpacity activeOpacity={0.8}>
            <Ionicons name="heart-outline" size={30} color="#777777" />
          </TouchableOpacity>
          <TouchableOpacity activeOpacity={0.8}>
            <Ionicons name="repeat" size={30} color="#777777" />
          </TouchableOpacity>
          <TouchableOpacity activeOpacity={0.8}>
            <Ionicons name="share-outline" size={30} color="#777777" />
          </TouchableOpacity>
          <TouchableOpacity activeOpacity={0.8}>
            <Ionicons name="ellipsis-horizontal" size={30} color="#777777" />
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#222831',
  },
  mainContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  slideContainer: {
    width: width,
    justifyContent: 'center',
    alignItems: 'center',
  },
  imgWrapper: {
    width: 300,
    height: 340,
    marginBottom: 25,

    shadowColor: '#ccc',
    shadowOffset: {
      width: 5,
      height: 5,
    },
    shadowOpacity: 0.5,
    shadowRadius: 3.84,

    elevation: 5,
  },
  img: {
    width: '100%',
    height: '100%',
    borderRadius: 15,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
    color: '#eeeeee',
  },
  artist: {
    fontSize: 16,
    fontWeight: '200',
    textAlign: 'center',
    color: '#eeeeee',
  },
  progressContainer: {
    width: 350,
    height: 40,
    marginTop: 25,
    flexDirection: 'row',
  },
  progressLabelContainer: {
    width: 340,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  progressLabelTxt: {
    color: '#fff',
  },
  musicControlls: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 15,
    width: '50%',
  },
  mrt: {marginTop: 15},
  bottomContainer: {
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomColor: '#393E46',
    borderTopWidth: 1,
    width: width,
  },
  bottomControls: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '80%',
  },
});

export default MusicPlayer;
