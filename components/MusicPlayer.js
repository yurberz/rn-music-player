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
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import Slider from '@react-native-community/slider';
import TrackPlayer, {
  Capability,
  Event,
  RepeatMode,
  State,
  usePlaybackState,
  useProgress,
  useTrackPlayerEvents,
} from 'react-native-track-player';

import songs from '../models/data';

const {width} = Dimensions.get('window');

const setupPlayer = async () => {
  await TrackPlayer.setupPlayer();

  await TrackPlayer.add(songs);

  //for Android +++++>
  await TrackPlayer.updateOptions({
    capabilities: [
      Capability.Play,
      Capability.Pause,
      Capability.SkipToNext,
      Capability.SkipToPrevious,
      Capability.Stop,
    ],
  });
  //<+++++
};

const togglePlayback = async playbackState => {
  const currentTrack = await TrackPlayer.getCurrentTrack();

  if (currentTrack !== null) {
    if (playbackState === State.Paused) {
      await TrackPlayer.play();
    } else {
      await TrackPlayer.pause();
    }
  }
};

const MusicPlayer = () => {
  const [songIdx, setSongIdx] = useState(0);
  const [repeatMode, setRepeatMode] = useState('off');
  const [trackTitle, setTrackTitle] = useState();
  const [trackArtist, setTrackArtist] = useState();
  const [trackImage, setTrackImage] = useState();

  const scrollX = useRef(new Animated.Value(0)).current;
  const songSlider = useRef(0);

  const playbackState = usePlaybackState();
  const progress = useProgress();

  useTrackPlayerEvents([Event.PlaybackTrackChanged], async evt => {
    if (evt.type === Event.PlaybackTrackChanged && evt.nextTrack !== null) {
      const track = await TrackPlayer.getTrack(evt.nextTrack);
      const {title, artist, image} = track;

      setTrackTitle(title);
      setTrackArtist(artist);
      setTrackImage(image);
    }
  });

  const repeatIcon = () => {
    if (repeatMode === 'off') {
      return 'repeat-off';
    }
    if (repeatMode === 'track') {
      return 'repeat-once';
    }
    if (repeatMode === 'repeat') {
      return 'repeat';
    }
  };

  const changeRepeatMode = () => {
    if (repeatMode === 'off') {
      TrackPlayer.setRepeatMode(RepeatMode.Track);
      setRepeatMode('track');
    }
    if (repeatMode === 'track') {
      TrackPlayer.setRepeatMode(RepeatMode.Queue);
      setRepeatMode('repeat');
    }
    if (repeatMode === 'repeat') {
      TrackPlayer.setRepeatMode(RepeatMode.Off);
      setRepeatMode('off');
    }
  };

  const skipTo = async trackId => {
    await TrackPlayer.skip(trackId);
  };

  useEffect(() => {
    setupPlayer();

    scrollX.addListener(({value}) => {
      //   console.log('SCROLL', scrollX);
      //   console.log('WIDTH', width);
      const idx = Math.round(value / width);
      skipTo(idx);
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
          <Image source={trackImage} style={styles.img} />
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
          <Text style={styles.title}>{trackTitle}</Text>
          <Text style={styles.artist}>{trackArtist}</Text>
        </View>

        <View>
          <Slider
            style={styles.progressContainer}
            value={progress.position}
            minimumValue={0}
            maximumValue={progress.duration}
            thumbTintColor="#ffd369"
            minimumTrackTintColor="#ffd369"
            maximumTrackTintColor="#fff"
            onSlidingComplete={async value => await TrackPlayer.seekTo(value)}
          />
          <View style={styles.progressLabelContainer}>
            <Text style={styles.progressLabelTxt}>
              {new Date(progress.position * 1000).toISOString().substr(14, 5)}
            </Text>
            <Text style={styles.progressLabelTxt}>
              {new Date((progress.duration - progress.position) * 1000)
                .toISOString()
                .substr(14, 5)}
            </Text>
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
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => togglePlayback(playbackState)}>
            <Ionicons
              name={
                playbackState === State.Playing
                  ? 'ios-pause-circle'
                  : 'ios-play-circle'
              }
              size={60}
              color="#ffd369"
            />
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
          <TouchableOpacity activeOpacity={0.8} onPress={changeRepeatMode}>
            <MaterialCommunityIcons
              name={`${repeatIcon()}`}
              size={30}
              color={repeatMode !== 'off' ? '#ffd369' : '#777777'}
            />
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
