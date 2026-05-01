import { useState, useEffect } from 'react';
import { MdSkipPrevious, MdSkipNext, MdPlayArrow, MdPause, MdVolumeUp, MdVolumeDown } from 'react-icons/md';


const track = {
  name: "",
  album: {
    images: [
      { url: "" }
    ]
  },
  artists: [
    { name: "" }
  ]
}

function WebPlayback(props: { token: string }) {

  const [player, setPlayer] = useState<any>(undefined);
  const [is_paused, setPaused] = useState(false);
  const [is_active, setActive] = useState(false);
  const [current_track, setTrack] = useState(track);

useEffect(() => {
  
  if (!document.getElementById('spotify-sdk')) {
    const script = document.createElement("script");
    script.id = 'spotify-sdk';  // give it an id so we can check for it
    script.src = "https://sdk.scdn.co/spotify-player.js";
    script.async = true;
    document.body.appendChild(script);
  }

  (window as any).onSpotifyWebPlaybackSDKReady = () => {
    const player = new (window as any).Spotify.Player({
      name: 'Web Playback SDK',
      getOAuthToken: (cb: (token: string) => void) => { cb(props.token); },
      volume: 0.5
    });

    setPlayer(player);

    player.addListener('ready', ({ device_id }: { device_id: string }) => {
      console.log('Ready with Device ID', device_id);
    });

    player.addListener('not_ready', ({ device_id }: { device_id: string }) => {
      console.log('Device ID has gone offline', device_id);
    });

    player.addListener('player_state_changed', (state: any) => {
      if (!state) return;
      setTrack(state.track_window.current_track);
      setPaused(state.paused);
      player.getCurrentState().then((state: any) => {
        if (!state) { setActive(false) } else { setActive(true) }
      });
    });

    player.connect();
  };
}, []);

  if (!is_active) {
    return (
      <div className="container">
        <div className="main-wrapper">
          <b style={{color: '#555'}}>Instance not active. Transfer your playback using your Spotify app</b>
        </div>
      </div>
    )
  } else {
    return (
    <div className="container">
      <div className="main-wrapper" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
        <img
          src={current_track.album.images[0].url}
          className="now-playing__cover"
          alt=""
          style={{ width: 245, height: 245, borderRadius: 4, objectFit: 'cover' }}
        />

        <div className="now-playing__name" style={{ color: '#555', fontWeight: 600, fontSize: 16 }}>
          {current_track.name}
        </div>
        <div className="now-playing__artist" style={{ color: '#555', fontSize: 14 }}>
          {current_track.artists[0].name}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 16 }}>
          <button className="btn-spotify" onClick={() => { player.previousTrack() }}
            style={{ background: 'rgba(0,0,0,0.4)', border: 'none', cursor: 'pointer', borderRadius: '50%', padding: 8 }}>
            <MdSkipPrevious size={24} color="white" />
          </button>

          <button className="btn-spotify" onClick={() => { player.togglePlay() }}
            style={{ background: 'rgba(0,0,0,0.4)', border: 'none', cursor: 'pointer', borderRadius: '50%', padding: 8 }}>
            {is_paused ? <MdPlayArrow size={24} color="white" /> : <MdPause size={24} color="white" />}
          </button>

          <button className="btn-spotify" onClick={() => { player.nextTrack() }}
            style={{ background: 'rgba(0,0,0,0.4)', border: 'none', cursor: 'pointer', borderRadius: '50%', padding: 8 }}>
            <MdSkipNext size={24} color="white" />
          </button>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <MdVolumeDown size={16} color='#555' />
          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            defaultValue="0.5"
            onChange={(e) => player.setVolume(parseFloat(e.target.value))}
            style={{ width: 80, accentColor: '#555', height: 3, cursor: 'pointer' }}
          />
        </div>
      </div>
    </div>
    );
  }
}

export default function Music() {
  const [token, setToken] = useState('');

  useEffect(() => {
    async function getToken() {
      const response = await fetch('/spotify/token');
      const json = await response.json();
      setToken(json.access_token);
    }
    getToken();
  }, []);

  return (
    <>
      { (token === '') ? <a href="/spotify/login">Login with Spotify</a> : <WebPlayback token={token} /> }
    </>
  );
}