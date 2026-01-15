# Video (expo-video)

_A library that provides an API to implement video playback in apps._

Available on platforms android, ios, web, tvos, expo-go

`expo-video` is a cross-platform, performant video component for React Native and Expo with Web support.

#### Known issues&ensp;<PlatformTags platforms={['android']} />

When two [`VideoView`](#videoview) components are overlapping and have the [`contentFit`](#contentfit) prop set to [`cover`](#videocontentfit), one of the videos may be displayed out of bounds. This is a [known upstream issue](https://github.com/androidx/media/issues/1107). To work around this issue, use the [`surfaceType`](#surfacetype) prop and set it to [`textureView`](#surfacetype-1).

## Installation

```bash
npx expo install expo-video
```

If you are installing this in an existing React Native app, make sure to install `expo` in your project.

## Configuration in app config

You can configure `expo-video` using its built-in [config plugin](https://docs.expo.dev/config-plugins/introduction/) if you use config plugins in your project ([Continuous Native Generation (CNG)](https://docs.expo.dev/workflow/continuous-native-generation/)). The plugin allows you to configure various properties that cannot be set at runtime and require building a new app binary to take effect. If your app does **not** use CNG, then you'll need to manually configure the library.

```json app.json
{
  "expo": {
    "plugins": [
      [
        "expo-video",
        {
          "supportsBackgroundPlayback": true,
          "supportsPictureInPicture": true
        }
      ]
    ],
  }
}
```

### Configurable properties

| Name | Default | Description |
| --- | --- | --- |
| `supportsBackgroundPlayback` | `undefined` | A boolean value to enable background playback support. If `true`, on iOS, the `audio` key is added to the `UIBackgroundModes` array in the **Info.plist** file. If `false`, the key is removed. When `undefined`, the key is not modified. On Android, when `true` adds foreground service permissions and creates a expo-video foreground service in AndroidManifest.xml. |
| `supportsPictureInPicture` | `undefined` | A boolean value to enable Picture-in-Picture on Android and iOS. If `true`, enables the `android:supportsPictureInPicture` property on Android and adds the `audio` key to the `UIBackgroundModes` array in the **Info.plist** file on iOS. If `false`, the key is removed. When `undefined`, the configuration is not modified. |

## Usage

Here's a simple example of a video with a play and pause button.

```jsx
import { useEvent } from 'expo';
import { useVideoPlayer, VideoView } from 'expo-video';
import { StyleSheet, View, Button } from 'react-native';

const videoSource =
  'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4';

export default function VideoScreen() {
  const player = useVideoPlayer(videoSource, player => {
    player.loop = true;
    player.play();
  });

  const { isPlaying } = useEvent(player, 'playingChange', { isPlaying: player.playing });

  return (
    <View style={styles.contentContainer}>
      <VideoView
        style={styles.video}
        player={player}
        fullScreenOptions={{ allowsFullscreen: true }}
        allowsPictureInPicture
      />
      <View style={styles.controlsContainer}>
        <Button
          title={isPlaying ? 'Pause' : 'Play'}
          onPress={() => {
            if (isPlaying) {
              player.pause();
            } else {
              player.play();
            }
          }}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  contentContainer: {
    flex: 1,
    padding: 10,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 50,
  },
  video: {
    width: 350,
    height: 275,
  },
  controlsContainer: {
    padding: 10,
  },
});
```

### Receiving events

The changes in properties of the [`VideoPlayer`](#videoplayer) do not update the React state. Therefore, to display the information about the current state of the `VideoPlayer`, it is necessary to listen to the [events](#videoplayerevents) it emits.
The event system is based on the [`EventEmitter`](../sdk/expo/#eventemitter) class and [hooks](../sdk/expo/#hooks) from the [`expo`](../sdk/expo) package. There are a few ways to listen to events:

#### `useEvent` hook

Creates a listener that will return a stateful value that can be used in a component. It also cleans up automatically when the component unmounts.

```tsx useEvent
import { useEvent } from 'expo';
// ... Other imports, definition of the component, creating the player etc.

const { status, error } = useEvent(player, 'statusChange', { status: player.status });
// Rest of the component...
```

#### `useEventListener` hook

Built around the `Player.addListener` and `Player.removeListener` methods, creates an event listener with automatic cleanup.

```tsx useEventListener
import { useEventListener } from 'expo';
// ...Other imports, definition of the component, creating the player etc.

useEventListener(player, 'statusChange', ({ status, error }) => {
  setPlayerStatus(status);
  setPlayerError(error);
  console.log('Player status changed: ', status);
});
// Rest of the component...
```

#### `Player.addListener` method

Most flexible way to listen to events, but requires manual cleanup and more boilerplate code.

```tsx Player.addListener
// ...Imports, definition of the component, creating the player etc.

useEffect(() => {
  const subscription = player.addListener('statusChange', ({ status, error }) => {
    setPlayerStatus(status);
    setPlayerError(error);
    console.log('Player status changed: ', status);
  });

  return () => {
    subscription.remove();
  };
}, []);
// Rest of the component...
```

### Playing local media from the assets directory

`expo-video` supports playing local media loaded using the `require` function. You can use the result as a source directly, or assign it to the `assetId` parameter of a [`VideoSource`](#videosource) if you also want to configure other properties.

```tsx Playing local media
import { VideoSource } from 'expo-video';

const assetId = require('./assets/bigbuckbunny.mp4');

const videoSource: VideoSource = {
  assetId,
  metadata: {
    title: 'Big Buck Bunny',
    artist: 'The Open Movie Project',
  },
};

const player1 = useVideoPlayer(assetId); // You can use the `asset` directly as a video source
const player2 = useVideoPlayer(videoSource);
```

### Playing media from the media library

`expo-video` supports playing videos picked from user's media library using [`expo-media-library`](../sdk/media-library/) or any valid `PHAsset` URI with appropriate permissions.

To play a video from the media library, you should obtain an [`Asset`](../sdk/asset/#asset) object with [`MediaLibrary.getAssetsAsync()`](../sdk/media-library/#medialibrarygetassetsasyncassetsoptions) and use its [`uri`](../sdk/asset/#uri) property as the [`uri`](#videosource) of the video source.
Before playing, make sure to request the necessary permissions using [`MediaLibrary.requestPermissionsAsync()`](../sdk/media-library/#medialibraryrequestpermissionsasyncwriteonly-granularpermissions).

On iOS make sure **not** to use the `localUri` property of the asset info, as it does not contain the necessary permissions to read the asset.

```tsx Playing media from media library
import * as MediaLibrary from 'expo-media-library';
import { VideoSource, useVideoPlayer, VideoView } from 'expo-video';

// ...Definition of the component, creating the player etc.

const loadAssetAndReplace = async () => {
  const { granted } = await MediaLibrary.requestPermissionsAsync(false, ['video']);
  if (!granted) {
    return;
  }

  const pagedAssets = await MediaLibrary.getAssetsAsync({
    mediaType: 'video',
  });

  if (pagedAssets.assets.length > 0) {
    const [asset] = pagedAssets.assets;
    const videoSource: VideoSource = {
      uri: asset.uri,
      metadata: {
        title: asset.filename,
      },
    };

    await player.replaceAsync(videoSource);
    await player.replaceAsync(asset.uri); // Alternatively you can use the asset uri directly
    player.play();
  }
};

// You can now use loadAssetAndReplace to load and play the first video from the media library
```

### Preloading videos

While another video is playing, a video can be loaded before showing it in the view. This allows for quicker transitions between subsequent videos and a better user experience.

To preload a video, you have to create a `VideoPlayer` with a video source. Even when the player is not connected to a `VideoView`, it will fill the buffers. Once it is connected to the `VideoView`, it will be able to start playing without buffering.

In some cases, it is beneficial to preload a video later in the screen lifecycle. In that case, a `VideoPlayer` with a `null` source should be created. To start preloading, replace the player source with a video source using the `replace()` function.

Here is an example of how to preload a video:

```tsx
import { useVideoPlayer, VideoView, VideoSource } from 'expo-video';
import { useState, useCallback } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const bigBuckBunnySource: VideoSource =
  'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4';

const elephantsDreamSource: VideoSource =
  'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4';

export default function PreloadingVideoPlayerScreen() {
  const player1 = useVideoPlayer(bigBuckBunnySource, player => {
    player.play();
  });

  const player2 = useVideoPlayer(elephantsDreamSource, player => {
    player.currentTime = 20;
  });

  const [currentPlayer, setCurrentPlayer] = useState(player1);

  const replacePlayer = useCallback(async () => {
    currentPlayer.pause();
    if (currentPlayer === player1) {
      setCurrentPlayer(player2);
      player1.pause();
      player2.play();
    } else {
      setCurrentPlayer(player1);
      player2.pause();
      player1.play();
    }
  }, [player1, currentPlayer]);

  return (
    <View style={styles.contentContainer}>
      <VideoView player={currentPlayer} style={styles.video} nativeControls={false} />
      <TouchableOpacity style={styles.button} onPress={replacePlayer}>
        <Text style={styles.buttonText}>Replace Player</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  contentContainer: {
    flex: 1,
    padding: 10,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 50,
  },
  button: {
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 3,
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: '#4630ec',
  },
  buttonText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#eeeeee',
    textAlign: 'center',
  },
  video: {
    width: 300,
    height: 168.75,
    marginVertical: 20,
  },
});
```

### Using the VideoPlayer directly

In most cases, the [`useVideoPlayer`](#usevideoplayersource-setup) hook should be used to create a `VideoPlayer` instance. It manages the player's lifecycle and ensures that it is properly disposed of when the component is unmounted. However, in some advanced use cases, it might be necessary to create a `VideoPlayer` that does not get automatically destroyed when the component is unmounted.
In those cases, the `VideoPlayer` can be created using the [`createVideoPlayer`](#videocreatevideoplayersource) function. You need be aware of the risks that come with this approach, as it is your responsibility to call the [`release()`](../sdk/expo/#release) method when the player is no longer needed. If not handled properly, this approach may lead to memory leaks.

```tsx Creating player instance
import { createVideoPlayer } from 'expo-video';
const player = createVideoPlayer(videoSource);
```

> **warning** On Android, mounting multiple `VideoView` components at the same time with the same `VideoPlayer` instance will not work due to a [platform limitation](https://github.com/expo/expo/issues/35012).

### Caching videos

If your app frequently replays the same video, caching can be utilized to minimize network usage and enhance user experience, albeit at the cost of increased device storage usage. `expo-video` supports video caching on `Android` and `iOS` platforms. This feature can be activated by setting the [`useCaching`](#videosource) property of a [`VideoSource`](#videosource) object to `true`.

The cache is persistent and will be cleared on a least-recently-used basis once the preferred size is exceeded. Furthermore, the system can clear the cache due to low storage availability, so it's not advisable to depend on the cache to store critical data.

The cache functions offline. If a portion or the entirety of a video is cached, it can be played from the cache even when the device is offline until the cached data is exhausted.

> Due to platform limitations, the cache cannot be used with HLS video sources on iOS. Caching DRM-protected videos is not supported on Android and iOS.

### Managing the cache

- The preferred cache size in bytes can be defined using the [`setVideoCacheSizeAsync`](#videosetvideocachesizeasyncsizebytes) function. The default cache size is 1GB.
- The [`getCurrentVideoCacheSize`](#videogetcurrentvideocachesize) can be used to get the current storage occupied by the cache in bytes.
- All cached videos can be cleared using the [`clearVideoCacheAsync`](#videoclearvideocacheasync) function.

## API

```js
import { VideoView, useVideoPlayer } from 'expo-video';
```

## API: expo-video

### VideoPlayer (_Class_)

A class that represents an instance of the video player.

#### Properties

- `allowsExternalPlayback` (boolean)
  Determines whether the player should allow external playback.
  Available on platform: ios
- `audioMixingMode` (AudioMixingMode)
  Determines how the player will interact with other audio playing in the system.
  Available on platforms: android, ios
- `audioTrack` (null | AudioTrack)
  Specifies the audio track currently played by the player. `null` when no audio is played.
  Available on platforms: android, ios
- `availableAudioTracks` (AudioTrack[])
  An array of audio tracks available for the current video.
  Available on platforms: android, ios
- `availableSubtitleTracks` (SubtitleTrack[])
  An array of subtitle tracks available for the current video.
  Available on platforms: android, ios
- `availableVideoTracks` (VideoTrack[])
  An array of video tracks available for the current video.

  > On iOS, when using a HLS source, make sure that the uri contains `.m3u8` extension or that the [`contentType`](#contenttype) property of the [`VideoSource`](#videosource) has been set to `'hls'`. Otherwise, the video tracks will not be available.
  Available on platforms: android, ios
- `bufferedPosition` (number)
  Float value indicating how far the player has buffered the video in seconds.

  This value is 0 when the player has not buffered up to the current playback time.
  When it's impossible to determine the buffer state (for example, when the player isn't playing any media), this value is -1.
- `bufferOptions` (BufferOptions)
  Specifies buffer options which will be used by the player when buffering the video.

  > You should provide a `BufferOptions` object when setting this property. Setting individual buffer properties is not supported.
  Available on platforms: android, ios
- `currentLiveTimestamp` (null | number)
  The exact timestamp when the currently displayed video frame was sent from the server,
  based on the `EXT-X-PROGRAM-DATE-TIME` tag in the livestream metadata.
  If this metadata is missing, this property will return `null`.
  Available on platforms: android, ios
- `currentOffsetFromLive` (null | number)
  Float value indicating the latency of the live stream in seconds.
  If a livestream doesn't have the required metadata, this will return `null`.
  Available on platforms: android, ios
- `currentTime` (number)
  Float value indicating the current playback time in seconds.

  If the player is not yet playing, this value indicates the time position
  at which playback will begin once the `play()` method is called.

  Setting `currentTime` to a new value seeks the player to the given time.
  Note that frame accurate seeking may incur additional decoding delay which can impact seeking performance.
  Consider using the [`seekBy`](#seekbyseconds) function if the time does not have to be set precisely.
- `duration` (number)
  Float value indicating the duration of the current video in seconds.
- `isExternalPlaybackActive` (boolean)
  Indicates whether the player is currently playing back the media to an external device via AirPlay.
  Available on platform: ios
- `isLive` (boolean)
  Boolean value indicating whether the player is currently playing a live stream.
- `loop` (boolean)
  Determines whether the player should automatically replay after reaching the end of the video.
- `muted` (boolean)
  Boolean value whether the player is currently muted.
  Setting this property to `true`/`false` will mute/unmute the player.
- `playbackRate` (number)
  Float value between `0` and `16.0` indicating the current playback speed of the player.
- `playing` (boolean)
  Boolean value whether the player is currently playing.
  > Use `play` and `pause` methods to control the playback.
- `preservesPitch` (boolean)
  Boolean value indicating if the player should correct audio pitch when the playback speed changes.
- `showNowPlayingNotification` (boolean)
  Boolean value determining whether the player should show the now playing notification.
  Available on platforms: android, ios
- `status` (VideoPlayerStatus)
  Indicates the current status of the player.
- `staysActiveInBackground` (boolean)
  Determines whether the player should continue playing after the app enters the background.
  Available on platforms: ios, android
- `subtitleTrack` (null | SubtitleTrack)
  Specifies the subtitle track which is currently displayed by the player. `null` when no subtitles are displayed.

  > To ensure a valid subtitle track, always assign one of the subtitle tracks from the [`availableSubtitleTracks`](#availablesubtitletracks) array.
  Available on platforms: android, ios
- `targetOffsetFromLive` (number)
  Float value indicating the time offset from the live in seconds.
  Available on platform: ios
- `timeUpdateEventInterval` (number)
  Float value indicating the interval in seconds at which the player will emit the [`timeUpdate`](#videoplayerevents) event.
  When the value is equal to `0`, the event will not be emitted.
- `videoTrack` (null | VideoTrack)
  Specifies the video track currently played by the player. `null` when no video is displayed.
  Available on platforms: android, ios
- `volume` (number)
  Float value between `0` and `1.0` representing the current volume.
  Muting the player doesn't affect the volume. In other words, when the player is muted, the volume is the same as
  when unmuted. Similarly, setting the volume doesn't unmute the player.

#### Methods

- `addListener(eventName: EventName, listener: indexedAccess): EventSubscription`
  Adds a listener for the given event name.

  | Parameter | Type | Description |
  | --- | --- | --- |
  | `eventName` | EventName | - |
  | `listener` | indexedAccess | - |

- `emit(eventName: EventName, args: Parameters<indexedAccess>)`
  Synchronously calls all the listeners attached to that specific event.
  The event can include any number of arguments that will be passed to the listeners.

  | Parameter | Type | Description |
  | --- | --- | --- |
  | `eventName` | EventName | - |
  | `args` | Parameters<indexedAccess> | - |

- `generateThumbnailsAsync(times: number | number[], options?: VideoThumbnailOptions): Promise<VideoThumbnail[]>`
  Generates thumbnails from the currently played asset. The thumbnails are references to native images,
  thus they can be used as a source of the `Image` component from `expo-image`.
  Available on platforms: android, ios

  | Parameter | Type | Description |
  | --- | --- | --- |
  | `times` | number \| number[] | - |
  | `options` _(optional)_ | VideoThumbnailOptions | - |

- `listenerCount(eventName: EventName): number`
  Returns a number of listeners added to the given event.

  | Parameter | Type | Description |
  | --- | --- | --- |
  | `eventName` | EventName | - |

- `pause()`
  Pauses the player.

- `play()`
  Resumes the player.

- `release()`
  A function that detaches the JS and native objects to let the native object deallocate
  before the JS object gets deallocated by the JS garbage collector. Any subsequent calls to native
  functions of the object will throw an error as it is no longer associated with its native counterpart.

  In most cases, you should never need to use this function, except some specific performance-critical cases when
  manual memory management makes sense and the native object is known to exclusively retain some native memory
  (such as binary data or image bitmap). Before calling this function, you should ensure that nothing else will use
  this object later on. Shared objects created by React hooks are usually automatically released in the effect's cleanup phase,
  for example: `useVideoPlayer()` from `expo-video` and `useImage()` from `expo-image`.

- `removeAllListeners(eventName: typeOperator)`
  Removes all listeners for the given event name.

  | Parameter | Type | Description |
  | --- | --- | --- |
  | `eventName` | typeOperator | - |

- `removeListener(eventName: EventName, listener: indexedAccess)`
  Removes a listener for the given event name.

  | Parameter | Type | Description |
  | --- | --- | --- |
  | `eventName` | EventName | - |
  | `listener` | indexedAccess | - |

- `replace(source: VideoSource, disableWarning?: boolean)`
  Replaces the current source with a new one.

  > On iOS, this method loads the asset data synchronously on the UI thread and can block it for extended periods of time.
  > Use `replaceAsync` to load the asset asynchronously and avoid UI lags.

  > This method will be deprecated in the future.
  | Parameter | Type | Description |
  | --- | --- | --- |
  | `source` | VideoSource | - |
  | `disableWarning` _(optional)_ | boolean | - |

- `replaceAsync(source: VideoSource): Promise<void>`
  Replaces the current source with a new one, while offloading loading of the asset to a different thread.

  > On Android and Web, this method is equivalent to `replace`.
  | Parameter | Type | Description |
  | --- | --- | --- |
  | `source` | VideoSource | - |

- `replay()`
  Seeks the playback to the beginning.

- `seekBy(seconds: number)`
  Seeks the playback by the given number of seconds. The time to which the player seeks may differ from the specified requested time for efficiency,
  depending on the encoding and what is currently buffered by the player. Use this function to implement playback controls that seek by specific amount of time,
  in which case, the actual time usually does not have to be precise. For frame accurate seeking, use the [`currentTime`](#currenttime) property.

  | Parameter | Type | Description |
  | --- | --- | --- |
  | `seconds` | number | - |

- `startObserving(eventName: EventName)`
  Function that is automatically invoked when the first listener for an event with the given name is added.
  Override it in a subclass to perform some additional setup once the event started being observed.

  | Parameter | Type | Description |
  | --- | --- | --- |
  | `eventName` | EventName | - |

- `stopObserving(eventName: EventName)`
  Function that is automatically invoked when the last listener for an event with the given name is removed.
  Override it in a subclass to perform some additional cleanup once the event is no longer observed.

  | Parameter | Type | Description |
  | --- | --- | --- |
  | `eventName` | EventName | - |

### VideoThumbnail (_Class_)

Represents a video thumbnail that references a native image.
Instances of this class can be passed as a source to the `Image` component from `expo-image`.
Available on platforms: android, ios

#### Properties

- `actualTime` (number)
  The time in seconds at which the thumbnail was actually generated.
  Available on platform: ios
- `height` (number)
  Height of the created thumbnail.
- `nativeRefType` (string)
  The type of the native reference.
- `requestedTime` (number)
  The time in seconds at which the thumbnail was to be created.
- `width` (number)
  Width of the created thumbnail.

#### Methods

- `addListener(eventName: EventName, listener: indexedAccess): EventSubscription`
  Adds a listener for the given event name.

  | Parameter | Type | Description |
  | --- | --- | --- |
  | `eventName` | EventName | - |
  | `listener` | indexedAccess | - |

- `emit(eventName: EventName, args: Parameters<indexedAccess>)`
  Synchronously calls all the listeners attached to that specific event.
  The event can include any number of arguments that will be passed to the listeners.

  | Parameter | Type | Description |
  | --- | --- | --- |
  | `eventName` | EventName | - |
  | `args` | Parameters<indexedAccess> | - |

- `listenerCount(eventName: EventName): number`
  Returns a number of listeners added to the given event.

  | Parameter | Type | Description |
  | --- | --- | --- |
  | `eventName` | EventName | - |

- `release()`
  A function that detaches the JS and native objects to let the native object deallocate
  before the JS object gets deallocated by the JS garbage collector. Any subsequent calls to native
  functions of the object will throw an error as it is no longer associated with its native counterpart.

  In most cases, you should never need to use this function, except some specific performance-critical cases when
  manual memory management makes sense and the native object is known to exclusively retain some native memory
  (such as binary data or image bitmap). Before calling this function, you should ensure that nothing else will use
  this object later on. Shared objects created by React hooks are usually automatically released in the effect's cleanup phase,
  for example: `useVideoPlayer()` from `expo-video` and `useImage()` from `expo-image`.

- `removeAllListeners(eventName: never)`
  Removes all listeners for the given event name.

  | Parameter | Type | Description |
  | --- | --- | --- |
  | `eventName` | never | - |

- `removeListener(eventName: EventName, listener: indexedAccess)`
  Removes a listener for the given event name.

  | Parameter | Type | Description |
  | --- | --- | --- |
  | `eventName` | EventName | - |
  | `listener` | indexedAccess | - |

- `startObserving(eventName: EventName)`
  Function that is automatically invoked when the first listener for an event with the given name is added.
  Override it in a subclass to perform some additional setup once the event started being observed.

  | Parameter | Type | Description |
  | --- | --- | --- |
  | `eventName` | EventName | - |

- `stopObserving(eventName: EventName)`
  Function that is automatically invoked when the last listener for an event with the given name is removed.
  Override it in a subclass to perform some additional cleanup once the event is no longer observed.

  | Parameter | Type | Description |
  | --- | --- | --- |
  | `eventName` | EventName | - |

### VideoView (_Class_)

#### Properties

- `nativeRef` (React.RefObject<any>)
  Default: `...`

#### Methods

- `enterFullscreen(): Promise<void>`
  Enters fullscreen mode.

- `exitFullscreen(): Promise<void>`
  Exits fullscreen mode.

- `render(): React.ReactNode`

- `startPictureInPicture(): Promise<void>`
  Enters Picture in Picture (PiP) mode. Throws an exception if the device does not support PiP.
  > **Note:** Only one player can be in Picture in Picture (PiP) mode at a time.

  > **Note:** The `supportsPictureInPicture` property of the [config plugin](#configuration-in-app-config)
  > has to be configured for the PiP to work.
  Available on platforms: android, ios, web

- `stopPictureInPicture(): Promise<void>`
  Exits Picture in Picture (PiP) mode.
  Available on platforms: android, ios, web

### Hooks

#### useVideoPlayer (_Function_)

- `useVideoPlayer(source: VideoSource, setup?: (player: VideoPlayer) => void): VideoPlayer`
  Creates a `VideoPlayer`, which will be automatically cleaned up when the component is unmounted.

  | Parameter | Type | Description |
  | --- | --- | --- |
  | `source` | VideoSource | A video source that is used to initialize the player. |
  | `setup` _(optional)_ | (player: VideoPlayer) => void | A function that allows setting up the player. It will run after the player is created. |

### Video Methods

#### clearVideoCacheAsync (_Function_)

- `clearVideoCacheAsync(): Promise<void>`
  Clears all video cache.
  > This function can be called only if there are no existing `VideoPlayer` instances.
  Available on platforms: android, ios
  Returns: A promise that fulfills after the cache has been cleaned.

#### createVideoPlayer (_Function_)

- `createVideoPlayer(source: VideoSource): VideoPlayer`
  Creates a direct instance of `VideoPlayer` that doesn't release automatically.

  > **info** For most use cases you should use the [`useVideoPlayer`](#usevideoplayer) hook instead. See the [Using the VideoPlayer Directly](#using-the-videoplayer-directly) section for more details.
  | Parameter | Type | Description |
  | --- | --- | --- |
  | `source` | VideoSource | - |

#### getCurrentVideoCacheSize (_Function_)

- `getCurrentVideoCacheSize(): number`
  Returns the space currently occupied by the video cache in bytes.
  Available on platforms: android, ios

#### isPictureInPictureSupported (_Function_)

- `isPictureInPictureSupported(): boolean`
  Returns whether the current device supports Picture in Picture (PiP) mode.
  Available on platforms: android, ios
  Returns: A `boolean` which is `true` if the device supports PiP mode, and `false` otherwise.

#### setVideoCacheSizeAsync (_Function_)

- `setVideoCacheSizeAsync(sizeBytes: number): Promise<void>`
  Sets desired video cache size in bytes. The default video cache size is 1GB. Value set by this function is persistent.
  The cache size is not guaranteed to be exact and the actual cache size may be slightly larger. The cache is evicted on a least-recently-used basis.
  > This function can be called only if there are no existing `VideoPlayer` instances.
  Available on platforms: android, ios
  | Parameter | Type | Description |
  | --- | --- | --- |
  | `sizeBytes` | number | - |
  Returns: A promise that fulfills after the cache size has been set.

#### VideoAirPlayButton (_Function_)

- `VideoAirPlayButton(props: VideoAirPlayButtonProps): React.JSX.Element`
  A view displaying the [`AVRoutePickerView`](https://developer.apple.com/documentation/avkit/avroutepickerview). Shows a button, when pressed, an AirPlay device picker shows up, allowing users to stream the currently playing video
  to any available AirPlay sink.

  > When using this view, make sure that the [`allowsExternalPlayback`](#allowsexternalplayback) player property is set to `true`.
  Available on platform: ios
  | Parameter | Type | Description |
  | --- | --- | --- |
  | `props` | VideoAirPlayButtonProps | - |

### Props

#### VideoAirPlayButtonProps (_Interface_)

##### Properties

- `activeTint?` (ColorValue)
  The color of the button icon while AirPlay sharing is active.
  Available on platform: ios
- `onBeginPresentingRoutes?` (() => void)
  A callback called when the AirPlay route selection popup is about to show.
  Available on platform: ios
- `onEndPresentingRoutes?` (() => void)
  A callback called when the AirPlay route selection popup has disappeared.
  Available on platform: ios
- `prioritizeVideoDevices?` (boolean)
  Determines whether the AirPlay device selection popup should show video outputs first.
  Available on platform: ios
- `tint?` (ColorValue)
  The color of the button icon while AirPlay sharing is not active.
  Available on platform: ios

#### VideoViewProps (_Interface_)

##### Properties

- `allowsFullscreen?` (boolean)
  Determines whether fullscreen mode is allowed or not.

  > Note: This option has been deprecated in favor of the `fullscreenOptions` prop and will be disabled in the future.
- `allowsPictureInPicture?` (boolean)
  Determines whether the player allows Picture in Picture (PiP) mode.
  > **Note:** The `supportsPictureInPicture` property of the [config plugin](#configuration-in-app-config)
  > has to be configured for the PiP to work.
  Available on platforms: android, ios, web
- `allowsVideoFrameAnalysis?` (boolean)
  Specifies whether to perform video frame analysis (Live Text in videos).
  Check official [Apple documentation](https://developer.apple.com/documentation/avkit/avplayerviewcontroller/allowsvideoframeanalysis) for more details.
  Available on platform: ios 16.0+
- `contentFit?` (VideoContentFit)
  Describes how the video should be scaled to fit in the container.
  Options are `'contain'`, `'cover'`, and `'fill'`.
- `contentPosition?` ({ dx: number; dy: number })
  Determines the position offset of the video inside the container.
  Available on platform: ios
- `crossOrigin?` ('anonymous' | 'use-credentials')
  Determines the [cross origin policy](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Attributes/crossorigin) used by the underlying native view on web.
  If `undefined` (default), does not use CORS at all. If set to `'anonymous'`, the video will be loaded with CORS enabled.
  Note that some videos may not play if CORS is enabled, depending on the CDN settings.
  If you encounter issues, consider adjusting the `crossOrigin` property.
  Available on platform: web
- `fullscreenOptions?` (FullscreenOptions)
  Determines the fullscreen mode options.
- `nativeControls?` (boolean)
  Determines whether native controls should be displayed or not.
- `onFirstFrameRender?` (() => void)
  A callback to call after the mounted `VideoPlayer` has rendered the first frame into the `VideoView`.
  This event can be used to hide any cover images that conceal the initial loading of the player.
  > **Note:** This event may also be called during playback when the current video track changes (for example when the player switches video quality).
- `onFullscreenEnter?` (() => void)
  A callback to call after the video player enters fullscreen mode.
- `onFullscreenExit?` (() => void)
  A callback to call after the video player exits fullscreen mode.
- `onPictureInPictureStart?` (() => void)
  A callback to call after the video player enters Picture in Picture (PiP) mode.
  Available on platforms: android, ios, web
- `onPictureInPictureStop?` (() => void)
  A callback to call after the video player exits Picture in Picture (PiP) mode.
  Available on platforms: android, ios, web
- `player` (VideoPlayer)
  A video player instance. Use [`useVideoPlayer()`](#usevideoplayersource-setup) hook to create one.
- `playsInline?` (boolean)
  Determines whether a video should be played "inline", that is, within the element's playback area.
  Available on platform: web
- `requiresLinearPlayback?` (boolean)
  Determines whether the player allows the user to skip media content.
  Available on platforms: android, ios
- `showsTimecodes?` (boolean)
  Determines whether the timecodes should be displayed or not.
  Available on platform: ios
- `startsPictureInPictureAutomatically?` (boolean)
  Determines whether the player should start Picture in Picture (PiP) automatically when the app is in the background.
  > **Note:** Only one player can be in Picture in Picture (PiP) mode at a time.

  > **Note:** The `supportsPictureInPicture` property of the [config plugin](#configuration-in-app-config)
  > has to be configured for the PiP to work.
  Available on platforms: android 12+, ios
- `surfaceType?` (SurfaceType)
  Determines the type of the surface used to render the video.
  > This prop should not be changed at runtime.
  Available on platform: android
- `useExoShutter?` (boolean)
  Determines whether the player should use the default ExoPlayer shutter that covers the `VideoView` before the first video frame is rendered.
  Setting this property to `false` makes the Android behavior the same as iOS.
  Available on platform: android

### Types

#### AudioMixingMode (_Type_)

Specifies the audio mode that the player should use. Audio mode is set on per-app basis, if there are multiple players playing and
have different a `AudioMode` specified, the highest priority mode will be used. Priority order: 'doNotMix' > 'auto' > 'duckOthers' > 'mixWithOthers'.

- `mixWithOthers`: The player will mix its audio output with other apps.
- `duckOthers`: The player will lower the volume of other apps if any of the active players is outputting audio.
- `auto`: The player will allow other apps to keep playing audio only when it is muted. On iOS it will always interrupt other apps when `showNowPlayingNotification` is `true` due to system requirements.
- `doNotMix`: The player will pause playback in other apps, even when it's muted.

> On iOS, the Now Playing notification is dependent on the audio mode. If the audio mode is different from `doNotMix` or `auto` this feature will not work.
Type: 'mixWithOthers' | 'duckOthers' | 'auto' | 'doNotMix'

#### AudioTrack (_Type_)

| Property | Type | Description |
| --- | --- | --- |
| `id` | string | A string used by expo-video to identify the audio track. Available on platform: android |
| `label` | string | Label of the audio track in the language of the device. |
| `language` | string | Language of the audio track. For example, 'en', 'pl', 'de'. |

#### BufferOptions (_Type_)

Specifies buffer options which will be used by the player when buffering the video.
Available on platforms: android, ios

| Property | Type | Description |
| --- | --- | --- |
| `maxBufferBytes` _(optional)_ | number \| null | The maximum number of bytes that the player can buffer from the network.<br>When 0 the player will automatically decide appropriate buffer size. Default: `0` Available on platform: android |
| `minBufferForPlayback` _(optional)_ | number | Minimum duration of the buffer in seconds required to continue playing after the player has been paused or started buffering.<br><br>> This property will be ignored if `preferredForwardBufferDuration` is lower. Default: `2` Available on platform: android |
| `preferredForwardBufferDuration` _(optional)_ | number | The duration in seconds which determines how much media the player should buffer ahead of the current playback time.<br><br>On iOS when set to `0` the player will automatically decide appropriate buffer duration.<br><br>Equivalent to [`AVPlayerItem.preferredForwardBufferDuration`](https://developer.apple.com/documentation/avfoundation/avplayeritem/1643630-preferredforwardbufferduration). Default: `Android: 20, iOS: 0` Available on platforms: android, ios |
| `prioritizeTimeOverSizeThreshold` _(optional)_ | boolean | A Boolean value which determines whether the player should prioritize time over size when buffering media. Default: `false` Available on platform: android |
| `waitsToMinimizeStalling` _(optional)_ | boolean | A Boolean value that indicates whether the player should automatically delay playback in order to minimize stalling.<br><br>Equivalent to [`AVPlayer.automaticallyWaitsToMinimizeStalling`](https://developer.apple.com/documentation/avfoundation/avplayer/1643482-automaticallywaitstominimizestal). Default: `true` Available on platform: ios |

#### ContentType (_Type_)

Specifies the content type of the source.

- `auto`: The player will automatically determine the content type of the video.
- `progressive`: The player will use progressive download content type. This is the default `ContentType` when the uri does not contain an extension.
- `hls`: The player will use HLS content type.
- `dash`: The player will use DASH content type (Android-only).
- `smoothStreaming`: The player will use SmoothStreaming content type (Android-only).
Type: 'auto' | 'progressive' | 'hls' | 'dash' | 'smoothStreaming'

#### DRMOptions (_Type_)

Specifies DRM options which will be used by the player while loading the video.

| Property | Type | Description |
| --- | --- | --- |
| `base64CertificateData` _(optional)_ | string | Specifies the base64 encoded certificate data for the FairPlay DRM.<br>When this property is set, the `certificateUrl` property is ignored. Available on platform: ios |
| `certificateUrl` _(optional)_ | string | Specifies the certificate URL for the FairPlay DRM. Available on platform: ios |
| `contentId` _(optional)_ | string | Specifies the content ID of the stream. Available on platform: ios |
| `headers` _(optional)_ | Record<string, string> | Determines headers sent to the license server on license requests. |
| `licenseServer` | string | Determines the license server URL. |
| `multiKey` _(optional)_ | boolean | Specifies whether the DRM is a multi-key DRM. Available on platform: android |
| `type` | DRMType | Determines which type of DRM to use. |

#### DRMType (_Type_)

Specifies which type of DRM to use:

- Android supports ClearKey, PlayReady and Widevine.
- iOS supports FairPlay.
Type: 'clearkey' | 'fairplay' | 'playready' | 'widevine'

#### IsExternalPlaybackActiveChangeEventPayload (_Type_)

| Property | Type | Description |
| --- | --- | --- |
| `isExternalPlaybackActive` | boolean | The current external playback status. |
| `oldIsExternalPlaybackActive` _(optional)_ | boolean | The previous external playback status. |

#### MutedChangeEventPayload (_Type_)

Data delivered with the [`mutedChange`](#videoplayerevents) event.

| Property | Type | Description |
| --- | --- | --- |
| `muted` | boolean | Boolean value whether the player is currently muted. |
| `oldMuted` _(optional)_ | boolean | Previous value of the `isMuted` property. |

#### PlaybackRateChangeEventPayload (_Type_)

Data delivered with the [`playbackRateChange`](#videoplayerevents) event.

| Property | Type | Description |
| --- | --- | --- |
| `oldPlaybackRate` _(optional)_ | number | Previous value of the `playbackRate` property. |
| `playbackRate` | number | Float value indicating the current playback speed of the player. |

#### PlayerError (_Type_)

Contains information about any errors that the player encountered during the playback

| Property | Type | Description |
| --- | --- | --- |
| `message` | string | - |

#### PlayingChangeEventPayload (_Type_)

Data delivered with the [`playingChange`](#videoplayerevents) event.

| Property | Type | Description |
| --- | --- | --- |
| `isPlaying` | boolean | Boolean value whether the player is currently playing. |
| `oldIsPlaying` _(optional)_ | boolean | Previous value of the `isPlaying` property. |

#### SourceChangeEventPayload (_Type_)

Data delivered with the [`sourceChange`](#videoplayerevents) event.

| Property | Type | Description |
| --- | --- | --- |
| `oldSource` _(optional)_ | VideoSource | Previous source of the player. |
| `source` | VideoSource | New source of the player. |

#### SourceLoadEventPayload (_Type_)

Data delivered with the [`sourceLoad`](#videoplayerevents) event, contains information about the video source that has finished loading.

| Property | Type | Description |
| --- | --- | --- |
| `availableAudioTracks` | AudioTrack[] | Audio tracks available for the loaded video source. |
| `availableSubtitleTracks` | SubtitleTrack[] | Subtitle tracks available for the loaded video source. |
| `availableVideoTracks` | VideoTrack[] | Video tracks available for the loaded video source.<br><br>> On iOS, when using a HLS source, make sure that the uri contains `.m3u8` extension or that the [`contentType`](#contenttype) property of the [`VideoSource`](#videosource) has been set to `'hls'`. Otherwise, the video tracks will not be available. |
| `duration` | number | Duration of the video source in seconds. |
| `videoSource` | VideoSource \| null | The video source that has been loaded. |

#### StatusChangeEventPayload (_Type_)

Data delivered with the [`statusChange`](#videoplayerevents) event.

| Property | Type | Description |
| --- | --- | --- |
| `error` _(optional)_ | PlayerError | Error object containing information about the error that occurred. |
| `oldStatus` _(optional)_ | VideoPlayerStatus | Previous status of the player. |
| `status` | VideoPlayerStatus | New status of the player. |

#### SubtitleTrack (_Type_)

| Property | Type | Description |
| --- | --- | --- |
| `id` | string | A string used by `expo-video` to identify the subtitle track. Available on platform: android |
| `label` | string | Label of the subtitle track in the language of the device. |
| `language` | string | Language of the subtitle track. For example, `en`, `pl`, `de`. |

#### SubtitleTrackChangeEventPayload (_Type_)

| Property | Type | Description |
| --- | --- | --- |
| `oldSubtitleTrack` _(optional)_ | SubtitleTrack \| null | Previous subtitle track of the player. |
| `subtitleTrack` | SubtitleTrack \| null | New subtitle track of the player. |

#### SurfaceType (_Type_)

Describes the type of the surface used to render the video.

- `surfaceView`: Uses the `SurfaceView` to render the video. This value should be used in the majority of cases. Provides significantly lower power consumption, better performance, and more features.
- `textureView`: Uses the `TextureView` to render the video. Should be used in cases where the SurfaceView is not supported or causes issues (for example, overlapping video views).

You can learn more about surface types in the official [ExoPlayer documentation](https://developer.android.com/media/media3/ui/playerview#surfacetype).
Available on platform: android
Type: 'textureView' | 'surfaceView'

#### TimeUpdateEventPayload (_Type_)

Data delivered with the [`timeUpdate`](#videoplayerevents) event, contains information about the current playback progress.

| Property | Type | Description |
| --- | --- | --- |
| `bufferedPosition` | number | Float value indicating how far the player has buffered the video in seconds.<br>Same as the [`bufferedPosition`](#bufferedPosition) property. Available on platforms: android, ios |
| `currentLiveTimestamp` | number \| null | The exact timestamp when the currently displayed video frame was sent from the server,<br>based on the `EXT-X-PROGRAM-DATE-TIME` tag in the livestream metadata.<br>Same as the [`currentLiveTimestamp`](#currentlivetimestamp) property. Available on platforms: android, ios |
| `currentOffsetFromLive` | number \| null | Float value indicating the latency of the live stream in seconds.<br>Same as the [`currentOffsetFromLive`](#currentoffsetfromlive) property. Available on platforms: android, ios |
| `currentTime` | number | Float value indicating the current playback time in seconds. Same as the [`currentTime`](#currenttime) property. |

#### VideoContentFit (_Type_)

Describes how a video should be scaled to fit in a container.

- `contain`: The video maintains its aspect ratio and fits inside the container, with possible letterboxing/pillarboxing.
- `cover`: The video maintains its aspect ratio and covers the entire container, potentially cropping some portions.
- `fill`: The video stretches/squeezes to completely fill the container, potentially causing distortion.
Type: 'contain' | 'cover' | 'fill'

#### VideoMetadata (_Type_)

Contains information that will be displayed in the now playing notification when the video is playing.
Available on platforms: android, ios

| Property | Type | Description |
| --- | --- | --- |
| `artist` _(optional)_ | string | Secondary text that will be displayed under the title. Available on platforms: android, ios |
| `artwork` _(optional)_ | string | The uri of the video artwork. Available on platforms: android, ios |
| `title` _(optional)_ | string | The title of the video. Available on platforms: android, ios |

#### VideoPlayerEvents (_Type_)

Handlers for events which can be emitted by the player.

| Property | Type | Description |
| --- | --- | --- |
| `audioTrackChange` | - | - |
| `availableAudioTracksChange` | - | - |
| `availableSubtitleTracksChange` | - | - |
| `isExternalPlaybackActiveChange` | - | - |
| `mutedChange` | - | - |
| `playbackRateChange` | - | - |
| `playingChange` | - | - |
| `playToEnd` | - | - |
| `sourceChange` | - | - |
| `sourceLoad` | - | - |
| `statusChange` | - | - |
| `subtitleTrackChange` | - | - |
| `timeUpdate` | - | - |
| `videoTrackChange` | - | - |
| `volumeChange` | - | - |

#### VideoPlayerStatus (_Type_)

Describes the current status of the player.

- `idle`: The player is not playing or loading any videos.
- `loading`: The player is loading video data from the provided source
- `readyToPlay`: The player has loaded enough data to start playing or to continue playback.
- `error`: The player has encountered an error while loading or playing the video.
Type: 'idle' | 'loading' | 'readyToPlay' | 'error'

#### VideoSize (_Type_)

Specifies the size of a video track.

| Property | Type | Description |
| --- | --- | --- |
| `height` | number | Height of the video track in pixels. |
| `width` | number | Width of the video track in pixels. |

#### VideoSource (_Type_)

| Property | Type | Description |
| --- | --- | --- |
| `assetId` _(optional)_ | number | The asset ID of a local video asset, acquired with the `require` function.<br>This property is exclusive with the `uri` property. When both are present, the `assetId` will be ignored. |
| `contentType` _(optional)_ | ContentType | Specifies the content type of the video source. When set to `'auto'`, the player will try to automatically determine the content type.<br><br>You should use this property when playing HLS, SmoothStreaming or DASH videos from an uri, which does not contain a standardized extension for the corresponding media type. Default: `'auto'` Available on platforms: android, ios |
| `drm` _(optional)_ | DRMOptions | Specifies the DRM options which will be used by the player while loading the video. |
| `headers` _(optional)_ | Record<string, string> | Specifies headers sent with the video request.<br>> For DRM license headers use the `headers` field of [`DRMOptions`](#drmoptions). Available on platforms: android, ios |
| `metadata` _(optional)_ | VideoMetadata | Specifies information which will be displayed in the now playing notification.<br>When undefined the player will display information contained in the video metadata. Available on platforms: android, ios |
| `uri` _(optional)_ | string | The URI of the video.<br><br>This property is exclusive with the `assetId` property. When both are present, the `assetId` will be ignored. |
| `useCaching` _(optional)_ | boolean | Specifies whether the player should use caching for the video.<br>> Due to platform limitations, the cache cannot be used with HLS video sources on iOS. Caching DRM-protected videos is not supported on Android and iOS. Default: `false` Available on platforms: android, ios |

#### VideoThumbnailOptions (_Type_)

Additional options for video thumbnails generation.

| Property | Type | Description |
| --- | --- | --- |
| `maxHeight` _(optional)_ | number | If provided, the generated thumbnail will not exceed this height in pixels, preserving its aspect ratio. Available on platforms: android, ios |
| `maxWidth` _(optional)_ | number | If provided, the generated thumbnail will not exceed this width in pixels, preserving its aspect ratio. Available on platforms: android, ios |

#### VideoTrack (_Type_)

Specifies a VideoTrack loaded from a [`VideoSource`](#videosource).

| Property | Type | Description |
| --- | --- | --- |
| `bitrate` | number \| null | Specifies the bitrate in bits per second. This is the peak bitrate if known, or else the average bitrate if known, or else null. |
| `frameRate` | number \| null | Specifies the frame rate of the video track in frames per second. |
| `id` | string | The id of the video track.<br><br>> This field is platform-specific and may return different depending on the operating system. |
| `isSupported` | boolean | Indicates whether the video track format is supported by the device. Available on platform: android |
| `mimeType` | string \| null | MimeType of the video track or null if unknown. |
| `size` | VideoSize | Size of the video track. |

#### VideoTrackChangeEventPayload (_Type_)

Data delivered with the [`videoTrackChange`](#videoplayerevents) event, contains information about the video track which is currently being played.

| Property | Type | Description |
| --- | --- | --- |
| `oldVideoTrack` _(optional)_ | VideoTrack \| null | Previous video track of the player. |
| `videoTrack` | VideoTrack \| null | New video track of the player. |

#### VolumeChangeEventPayload (_Type_)

Data delivered with the [`volumeChange`](#videoplayerevents) event.

| Property | Type | Description |
| --- | --- | --- |
| `oldVolume` _(optional)_ | number | Previous value of the `volume` property. |
| `volume` | number | Float value indicating the current volume of the player. |
