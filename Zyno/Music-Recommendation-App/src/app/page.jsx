"use client";
import React, { useState, useRef, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMusic, faUser, faEnvelope, faLock, faEye, faEyeSlash, faCamera, faPlay, faPause, faArrowLeft, faBackward, faForward, faRandom, faRedo, faVolumeUp, faRepeat, faRepeat1} from "@fortawesome/free-solid-svg-icons";

// Separate loading component to avoid hook ordering issues
function LoadingScreen() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#1a1a1a] to-[#121212] flex items-center justify-center">
      <div className="text-center">
        <div className="mb-4">
          <FontAwesomeIcon 
            icon={faMusic} 
            className="text-[#1DB954] text-4xl animate-custom-pulse"
          />
        </div>
        <h1 className="text-6xl font-bold zyno-title mb-2">ZYNO</h1>
        <p className="text-2xl text-[#1DB954] zyno-subtitle mb-6">Mood2Music</p>
        <div className="w-12 h-12 border-3 border-[#1DB954] border-t-transparent rounded-full animate-spin mx-auto"></div>
      </div>
    </div>
  );
}

function MainComponent() {
  const [isLoading, setIsLoading] = useState(true);
  
  // Use effect to simulate loading and hide the loading screen after a short delay
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 2500); // 2.5 seconds loading screen to show the wave animation
    
    return () => clearTimeout(timer);
  }, []);
  
  const [step, setStep] = useState(1);
  const [isSignup, setIsSignup] = useState(true); // State to toggle between Signup and Login
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    username: "",
    languages: [],
  });
  const [selectedLanguage, setSelectedLanguage] = useState(null);
  const [storedLanguages, setStoredLanguages] = useState([]); // Languages fetched after login
  const [isPasswordVisible, setIsPasswordVisible] = useState(false); // Toggle password visibility
  const [isCameraOn, setIsCameraOn] = useState(false);
  const videoRef = useRef(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [currentSong, setCurrentSong] = useState(null);
  const audioRef = useRef(null); // Ref for the audio element
  const [isPlaying, setIsPlaying] = useState(false); // State to track play/pause
  const [progress, setProgress] = useState(0); // State for the progress bar
  const [topHits, setTopHits] = useState({});
  const [currentTime, setCurrentTime] = useState(0); // Current time of the song
  const [duration, setDuration] = useState(0); // Total duration of the song
  const [currentSongIndex, setCurrentSongIndex] = useState(0);
  const [volume, setVolume] = useState(1); // Volume state (1 = 100%)
  const [isVolumeOn, setIsVolumeOn] = useState(true); // State for volume on/off
  const [playlistMode, setPlaylistMode] = useState("loopAll"); // Modes: "loopAll", "loopOne", "shuffle"
  const [detectedEmotion, setDetectedEmotion] = useState(null);

  const languages = [
    "Kannada",
    "Telugu",
    "Tamil",
    "Malayalam",
    "Hindi",
    "English",
  ];

  // ⚠️ Using file 1's camera implementation for better control
  useEffect(() => {
    if (isCameraOn && videoRef.current) {
      navigator.mediaDevices.getUserMedia({ video: true })
      .then((stream) => {
        videoRef.current.srcObject = stream;
        videoRef.current.onloadedmetadata = () => {
          videoRef.current.play();
          console.log("✅ Camera stream started.");
        };
      })
      .catch((err) => {
        console.error("Camera access denied:", err);
        alert("Camera access denied. Please check permissions.");
        setIsCameraOn(false);
      });

      // Cleanup function
      return () => {
        if (videoRef.current && videoRef.current.srcObject) {
          const tracks = videoRef.current.srcObject.getTracks();
          tracks.forEach(track => track.stop());
          console.log('Camera tracks stopped');
        }
      };
    }
  }, [isCameraOn]);

  // Simulate loading screen
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 2500);
    
    return () => clearTimeout(timer);
  }, []);
  
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (type === "checkbox") {
      const updatedLanguages = checked
        ? [...formData.languages, value]
        : formData.languages.filter((lang) => lang !== value);
      setFormData((prev) => ({ ...prev, languages: updatedLanguages }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleCameraClick = async () => {
    console.log('Camera button clicked');
    
    // First, set the camera state to on immediately to show the video element
    setIsCameraOn(true);
    
    // Use a small timeout to ensure the video element is rendered
    setTimeout(async () => {
      try {
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
          throw new Error('Your browser does not support camera access');
        }
        
        if (!videoRef.current) {
          console.error("Video reference is not available");
          return;
        }
        
        console.log('Requesting camera access...');
        const stream = await navigator.mediaDevices.getUserMedia({ 
          video: true,
          audio: false
        });
        
        console.log('Camera access granted, setting up video stream');
        videoRef.current.srcObject = stream;
        
        // Force a play attempt
        try {
          await videoRef.current.play();
          console.log('Video is now playing');
        } catch (playError) {
          console.error('Error playing video:', playError);
        }
      } catch (err) {
        console.error("Error accessing camera:", err);
        
        if (err.name === 'NotAllowedError') {
          alert("Camera access was denied. Please allow camera access in your browser settings.");
        } else if (err.name === 'NotFoundError') {
          alert("No camera found on your device.");
        } else {
          alert("Camera error: " + err.message);
        }
        
        // Reset camera state if there was an error
        setIsCameraOn(false);
      }
    }, 100);
  };

  
  const captureAndDetectEmotion = async () => {
    if (!videoRef.current) return;
    const canvas = document.createElement("canvas");
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    const ctx = canvas.getContext("2d");
    ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
    const imageData = canvas.toDataURL("image/jpeg");
    try {
      const detectRes = await fetch("http://localhost:5000/detect_emotion", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image: imageData }),
      });
      const detectData = await detectRes.json();
      if (detectData.emotion) {
        setDetectedEmotion(detectData.emotion); // Update the detected emotion state
      setMessage(`🎯 Detected Emotion: ${detectData.emotion}`);
        const playRes = await fetch("http://localhost:5000/play_category", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ category: detectData.emotion }),
        });
        const playData = await playRes.json();
        alert(playData.message || "Song played.");
      } else {
        alert("Emotion detection failed.");
      }
    } catch (err) {
      console.error("Detection error:", err);
      alert("Failed to detect or play song.");
    }
  };


  const validateForm = () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d).{8,}$/;

    if (isSignup && !formData.username.trim()) {
      alert("Please enter a username");
      return false;
    }

    if (!emailRegex.test(formData.email)) {
      alert("Please enter a valid email address");
      return false;
    }

    if (!passwordRegex.test(formData.password)) {
      alert("Please enter a valid password");
      return false;
    }

    return true;
  };

  const handleSignup = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (res.status === 201) {
        setMessage("🎉 Signup successful!");
        setTimeout(() => {
          setStep(3); // Move to the camera and playlist step
          setMessage("");
        }, 1500);
      } else {
        setMessage(`❗ ${data.message}`);
      }
    } catch (error) {
      setMessage("Something went wrong. Try again.");
      console.error("Signup error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: formData.email, password: formData.password }),
      });

      const data = await res.json();
      if (res.status === 200) {
        setMessage("🎉 Login successful!");
        setStoredLanguages(data.languages); // Store the user's languages
        setTimeout(() => {
          setStep(3); // Move to the camera and playlist step
          setMessage("");
        }, 1500);
      } else if (res.status === 404) {
        setMessage("❗ User does not exist. Please sign up.");
      } else if (res.status === 401) {
        setMessage("❗ Incorrect password. Please try again.");
      } else {
        setMessage("❗ Something went wrong. Please try again.");
      }
    } catch (error) {
      setMessage("❗ Unable to connect to the server. Please try again later.");
      console.error("Login error:", error);
    } finally {
      setLoading(false);
    }
  };

  const playSong = (song, index) => {
    if (!song || !song.url) {
      console.error("Invalid song or missing URL");
      return;
    }
  
    console.log("Playing song:", song.title, "at index:", index); // Debugging
    
    // Fix the URL path to ensure it starts with a proper path
    let songUrl = song.url.startsWith('/') ? song.url : `/${song.url}`;
    
    // Special handling for specific songs
    if (song.title === "Ae Dil Hai Mushkil") {
      songUrl = "/songs/Hindi/Ae-Dil-Hai-Mushkil.mp3";
      console.log("Special handling for Ae Dil Hai Mushkil, using URL:", songUrl);
    }
    
    // Special handling for English songs with spaces and parentheses
    if (song.url && song.url.includes('English') && (song.url.includes(' ') || song.url.includes('('))) {
      // The URL is already properly formatted from the API
      console.log("Using pre-formatted URL for English song:", songUrl);
    }
    
    // Create a complete song object with the fixed URL
    const songWithFixedUrl = {
      ...song,
      url: songUrl
    };
    
    setCurrentSong(songWithFixedUrl); // Set the current song with fixed URL
    setCurrentSongIndex(index); // Update the current song index
    setIsPlaying(true); // Set play state to true
  
    if (audioRef.current) {
      console.log("Setting audio source to:", songUrl);
      audioRef.current.src = songUrl; // Update the audio source
      audioRef.current
        .play()
        .catch((error) => {
          console.error("Error playing audio:", error, "for song:", song.title);
          setIsPlaying(false);
        });
    }
  };

  const togglePlayPause = () => {
    if (audioRef.current) {
      if (audioRef.current.paused) {
        audioRef.current.play();
        setIsPlaying(true);
      } else {
        audioRef.current.pause();
        setIsPlaying(false);
      }
    }
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      const currentTime = audioRef.current.currentTime;
      const duration = audioRef.current.duration || 0;

      setCurrentTime(currentTime); // Update current time
      setDuration(duration); // Update total duration

      // Calculate the progress percentage
      const progressPercentage = (currentTime / duration) * 100;
      setProgress(progressPercentage || 0); // Update progress state
    }
  };

  const handleSeek = (e) => {
    if (audioRef.current) {
      const progressBar = e.currentTarget; // Use the currentTarget to ensure the correct element
      const rect = progressBar.getBoundingClientRect(); // Get the bounding rectangle of the progress bar
      const clickX = e.clientX - rect.left; // Calculate the click position relative to the progress bar
      const newTime = (clickX / rect.width) * audioRef.current.duration; // Calculate the new time based on the click position
      if (isFinite(newTime) && newTime >= 0) {
        audioRef.current.currentTime = newTime; // Set the audio's current time to the new time
      }
    }
  };

  const fetchSongs = async () => {
    try {
      const res = await fetch('/api/top-songs'); // Fetch songs from the backend
      if (!res.ok) {
        throw new Error(`Failed to fetch songs: ${res.status}`);
      }
      const data = await res.json();
      console.log("Fetched songs data:", data); // Log the fetched data
      setTopHits(data); // Store the fetched songs grouped by language
    } catch (error) {
      console.error('Error fetching songs:', error);
      alert('Unable to fetch songs. Please try again later.');
    }
  };

  const formatTime = (time) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
  };

  const playNext = () => {
    if (topHits[selectedLanguage] && topHits[selectedLanguage].length > 0) {
      let nextIndex;
  
      if (playlistMode === "shuffle") {
        do {
          nextIndex = Math.floor(Math.random() * topHits[selectedLanguage].length);
        } while (nextIndex === currentSongIndex); // Avoid repeating the same song
        console.log("Shuffle Mode: Playing random song at index:", nextIndex);
      } else {
        nextIndex = (currentSongIndex + 1) % topHits[selectedLanguage].length;
        console.log("Loop Mode: Playing next song at index:", nextIndex);
      }
  
      playSong(topHits[selectedLanguage][nextIndex], nextIndex); // Play the next song
    } else {
      console.log("No songs available for the selected language.");
    }
  };
  
  const playPrevious = () => {
    if (topHits[selectedLanguage] && topHits[selectedLanguage].length > 0) {
      const prevIndex =
        (currentSongIndex - 1 + topHits[selectedLanguage].length) % topHits[selectedLanguage].length; // Loop back to the last song
      console.log("Previous Index:", prevIndex); // Debugging
      playSong(topHits[selectedLanguage][prevIndex], prevIndex); // Play the previous song
    } else {
      console.log("No songs available for the selected language.");
    }
  };


  

  const toggleVolume = () => {
    if (audioRef.current) {
      if (isVolumeOn) {
        setVolume(audioRef.current.volume); // Save the current volume
        audioRef.current.volume = 0; // Mute the audio
      } else {
        audioRef.current.volume = volume; // Restore the previous volume
      }
      setIsVolumeOn(!isVolumeOn); // Toggle the volume state
    }
  };

  const togglePlaylistMode = () => {
    if (playlistMode === "loopAll") {
      setPlaylistMode("loopOne");
    } else if (playlistMode === "loopOne") {
      setPlaylistMode("shuffle");
    } else {
      setPlaylistMode("loopAll");
    }
    console.log("Playlist mode is now:", playlistMode);
  };

  useEffect(() => {
    if (isCameraOn && videoRef.current) {
      console.log('Camera state changed to ON, setting up camera');
      const setupCamera = async () => {
        try {
          const stream = await navigator.mediaDevices.getUserMedia({ 
            video: true,
            audio: false
          });
          videoRef.current.srcObject = stream;
          console.log('Camera stream attached to video element');
        } catch (err) {
          console.error('Error in camera setup effect:', err);
          setIsCameraOn(false);
        }
      };
      
      setupCamera();
      
      // Cleanup function to stop camera when component unmounts or camera is turned off
      return () => {
        if (videoRef.current && videoRef.current.srcObject) {
          const tracks = videoRef.current.srcObject.getTracks();
          tracks.forEach(track => track.stop());
          console.log('Camera tracks stopped');
        }
      };
    }
  }, [isCameraOn]);

  useEffect(() => {
    console.log("Current Song Index:", currentSongIndex);
  }, [currentSongIndex]);

  useEffect(() => {
    fetchSongs(); // Fetch songs when the component mounts
  }, []);

  useEffect(() => {
    console.log("Current topHits for selectedLanguage:", topHits[selectedLanguage]);
  }, [topHits, selectedLanguage]);

  useEffect(() => {
    console.log("Selected language:", selectedLanguage);
  }, [selectedLanguage]);

  // Render loading screen if isLoading is true
  if (isLoading) {
    return <LoadingScreen />;
  }
  
  if (step === 1) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#1a1a1a] to-[#121212] flex flex-col">
        <div className="flex-1 flex flex-col p-6 max-w-md mx-auto w-full">
          <div className="text-center mb-3">
            <h1 className="text-4xl font-bold zyno-title mb-1">ZYNO</h1>
            <p className="text-xl text-[#1DB954] zyno-subtitle mb-4">Mood2Music</p>
            <h2 className="text-2xl font-bold text-white">
              {isSignup ? "Create Account" : "Login"}
            </h2>
          </div>
          <form className="space-y-6 backdrop-blur-lg bg-[#ffffff0a] p-8 rounded-3xl shadow-xl">
            {isSignup && (
              <div className="relative group">
                <FontAwesomeIcon icon={faUser} className="absolute left-4 top-3 text-gray-400" />
                <input
                  type="text"
                  name="username"
                  placeholder="Username"
                  value={formData.username}
                  onChange={handleInputChange}
                  className="w-full pl-12 pr-4 py-3 rounded-xl bg-[#ffffff0a] text-white placeholder-gray-400"
                  required
                />
              </div>
            )}
            <div className="relative group">
              <FontAwesomeIcon icon={faEnvelope} className="absolute left-4 top-3 text-gray-400" />
              <input
                type="email"
                name="email"
                placeholder="Email"
                value={formData.email}
                onChange={handleInputChange}
                className="w-full pl-12 pr-4 py-3 rounded-xl bg-[#ffffff0a] text-white placeholder-gray-400"
                required
              />
            </div>
            <div className="relative group">
              <FontAwesomeIcon
                icon={faLock}
                className="absolute left-4 top-3 text-gray-400 group-focus-within:text-[#1DB954] transition-colors"
              />
              <input
                type={isPasswordVisible ? "text" : "password"} // Toggle between text and password
                name="password"
                placeholder="Password"
                value={formData.password}
                onChange={handleInputChange}
                className="w-full pl-12 pr-12 py-3 rounded-xl bg-[#ffffff0a] text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#1DB954] text-sm border border-[#ffffff1a] focus:border-transparent transition-all"
                required
              />
              <FontAwesomeIcon
                icon={isPasswordVisible ? faEyeSlash : faEye} // Toggle icon
                onClick={() => setIsPasswordVisible(!isPasswordVisible)} // Toggle visibility
                className="absolute right-4 top-3 text-gray-400 cursor-pointer hover:text-[#1DB954] transition-colors"
              />
            </div>
            <button
              type="button"
              onClick={() => {
                if (validateForm()) {
                  isSignup ? setStep(2) : handleLogin();
                }
              }}
              className="w-full py-3 px-4 bg-gradient-to-r from-[#1DB954] to-[#1ed760] text-white rounded-xl"
            >
              {loading ? "Submitting..." : isSignup ? "Next" : "Log In"}
            </button>
            {message && (
              <p
                className={`text-center mt-4 ${
                  message.includes("🎉") ? "text-white" : "text-red-500"
                }`}
              >
                {message}
              </p>
            )}
          </form>
          <p className="text-center text-white mt-4">
            {isSignup ? "Already have an account?" : "Don't have an account?"}{" "}
            <button
              onClick={() => setIsSignup(!isSignup)}
              className="text-[#1DB954] underline"
            >
              {isSignup ? "Log In" : "Sign Up"}
            </button>
          </p>
        </div>
      </div>
    );
  }

  if (step === 2) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#1a1a1a] to-[#121212] flex flex-col">
        <div className="flex-1 flex flex-col p-6 max-w-md mx-auto w-full">
          <h1 className="text-3xl font-bold text-white text-center mb-8">Choose Your Languages</h1>
          <div className="backdrop-blur-lg bg-[#ffffff0a] p-8 rounded-3xl shadow-xl">
            <p className="text-white mb-4">
              Select your favorite languages for music recommendations
            </p>
            <div className="grid grid-cols-2 gap-4">
              {languages.map((language) => (
                <label
                  key={language}
                  className="flex items-center space-x-3 p-3 bg-[#ffffff0a] rounded-xl"
                >
                  <input
                    type="checkbox"
                    name="languages"
                    value={language}
                    checked={formData.languages.includes(language)}
                    onChange={handleInputChange}
                    className="form-checkbox text-[#1DB954] rounded"
                  />
                  <span className="text-white">{language}</span>
                </label>
              ))}
            </div>
            <button
              onClick={handleSignup}
              disabled={loading}
              className={`w-full py-3 px-4 bg-gradient-to-r from-[#1DB954] to-[#1ed760] text-white rounded-xl mt-8 ${
                loading ? "opacity-70 cursor-not-allowed" : ""
              }`}
            >
              {loading ? "Submitting..." : "Sign Up"}
            </button>
            {message && <p className="text-center mt-4 text-white">{message}</p>}
          </div>
        </div>
      </div>
    );  
  }

  if (step === 3) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#1a1a1a] to-[#121212] p-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <button
              onClick={handleCameraClick}
              className="p-6 rounded-full bg-[#1DB954] hover:bg-[#1ed760] transition-colors mx-auto mb-4"
            >
              <FontAwesomeIcon 
                icon={faCamera} 
                className="text-white text-3xl"
              />
            </button>
            <p className="text-gray-300 max-w-md mx-auto">
              Click the camera to detect your mood and get personalized music
              recommendations
            </p>
          </div>
  
          {isCameraOn && (
  <div className="text-center py-10 bg-[#ffffff0a] rounded-xl mb-6">
    <div>
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        style={{ display: 'block' }}
        className="w-full max-w-2xl mx-auto h-[300px] object-cover rounded-xl mb-4"
      />
      {/* Display detected emotion prominently */}
      {detectedEmotion && (
        <div className="mb-4 p-3 bg-[#1DB95420] rounded-xl inline-block">
          <h3 className="text-[#1DB954] text-xl font-bold">
            Detected Emotion: {detectedEmotion}
          </h3>
        </div>
      )}
      <button
        onClick={captureAndDetectEmotion}
        className="bg-[#1DB954] px-6 py-2 rounded-full text-white hover:bg-[#1ed760] mt-4"
      >
        Detect Emotion & Play Song
      </button>
    </div>
  </div>
)}
          
  
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {(storedLanguages.length > 0 ? storedLanguages : formData.languages).map((lang) => (
              <div
                key={lang}
                onClick={() => {
                  setSelectedLanguage(lang); // Set the selected language
                  setStep(4); // Move to Step 4
                }}
                className="relative rounded-xl overflow-hidden cursor-pointer group"
              >
                <div className="w-full h-[200px] relative">
                  <div className="absolute inset-0 grid grid-cols-2 grid-rows-2 gap-1">
                    {lang === "Hindi" && (
                      <>
                        <img
                          src="https://m.media-amazon.com/images/M/MV5BMWQyNjNhZDEtODQyMi00M2I0LWI0ZjUtMzhkYTA0Mjg4NDVkXkEyXkFqcGc@._V1_.jpg"
                          alt="Tum Hi Ho song poster"
                          className="w-full h-full object-cover"
                        />
                        <img
                          src="https://lastfm.freetls.fastly.net/i/u/770x0/7532a43fcfe002a221dfac9d9cbf0bae.jpg#7532a43fcfe002a221dfac9d9cbf0bae"
                          alt="Akhiyaan Gulaab song poster"
                          className="w-full h-full object-cover"
                        />
                        <img
                          src="https://i.ytimg.com/vi/oq5Ocx_rEv8/hqdefault.jpg"
                          alt="Kal Ho Naa Ho song poster"
                          className="w-full h-full object-cover"
                        />
                        <img
                          src="https://lh3.googleusercontent.com/tSHQUEXZbL_IbIcFfdtLUOkW7Ka93o1DyZhs97fy2HsUmdPZYwPz8q268O6jh8omDnQBx2xAlQATqOzk=w544-h544-l90-rj"
                          alt="Ae Dil Hai Mushkil song poster"
                          className="w-full h-full object-cover"
                        />
                      </>
                    )}
                    {lang === "Telugu" && (
                      <>
                        <img
                          src="https://www.naasongs.co/wp-content/uploads/2015/07/Andala-Rakshasi-2012-250x250.jpg"
                          alt="Manasu Palike song poster"
                          className="w-full h-full object-cover"
                        />
                        <img
                          src="https://i.ytimg.com/vi/tqLLe821DvU/mqdefault.jpg"
                          alt="Oo priya priya song poster"
                          className="w-full h-full object-cover"
                        />
                        <img
                          src="https://media.tenor.com/Lzhjb7tYvIcAAAAe/kurchi-madatha-petti.png"
                          alt="Kurchi Marthapetti song poster"
                          className="w-full h-full object-cover"
                        />
                        <img
                          src="https://i.ytimg.com/vi/sqlr1j4udAk/hqdefault.jpg"
                          alt="Oh Sita Hey Rama song poster"
                          className="w-full h-full object-cover"
                        />
                      </>
                    )}
                    {lang === "Tamil" && (
                      <>
                        <img
                          src="https://www.hindustantimes.com/ht-img/img/2023/07/06/550x309/kaavaala_jailer_1688650740269_1688650740552.png"
                          alt="Kaavaalaa song poster"
                          className="w-full h-full object-cover"
                        />
                        <img
                          src="https://i.ytimg.com/vi/U-GrjnbNP6g/hqdefault.jpg?sqp=-oaymwEmCOADEOgC8quKqQMa8AEB-AHUBoAC4AOKAgwIABABGH8gOigTMA8=&rs=AOn4CLCQZw1ndsNzi0PxSZ30OFyCfyj5QA"
                          alt="Urugi Urugi song poster"
                          className="w-full h-full object-cover"
                        />
                        <img
                          src="https://i.ytimg.com/vi/9QOfd7XmQ6U/hqdefault.jpg"
                          alt="Kannazhaga song poster"
                          className="w-full h-full object-cover"
                        />
                        <img
                          src="https://www.tamil2lyrics.com/wp-content/uploads/2024/11/Uyirey-Song.jpg"
                          alt="Uyirey song poster"
                          className="w-full h-full object-cover"
                        />
                      </>
                    )}
                    {lang === "Kannada" && (
                      <>
                        <img
                          src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcShQkQPJ1ef1K9uUH2X-4ExmkeeDmdrOvpwEw&s"
                          alt="Singara Siriye song poster"
                          className="w-full h-full object-cover"
                        />
                        <img
                          src="https://c.saavncdn.com/570/Naa-Ninage-Nee-Nanage-From-Maryade-Prashne-Kannada-2024-20241030171142-500x500.jpg"
                          alt="Naa Ninage Nee Nanage song poster"
                          className="w-full h-full object-cover"
                        />
                        <img
                          src="https://i.ytimg.com/vi/BWhfhG16XBU/maxresdefault.jpg"
                          alt="Bombe Helutaithe song poster"
                          className="w-full h-full object-cover"
                        />
                        <img
                          src="https://c.saavncdn.com/974/Nenne-Tanaka-From-Trivikrama-Kannada-2022-20240321064338-500x500.jpg"
                          alt="Nenne Tanaka song poster"
                          className="w-full h-full object-cover"
                        />
                      </>
                    )}
                    {lang === "Malayalam" && (
                      <>
                        <img
                          src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSoymd4VV-9N98gpDJ1gESbvO6fO0WBWC-77Q&s"
                          alt="Angu Vaana Konilu song poster"
                          className="w-full h-full object-cover"
                        />
                        <img
                          src="https://i.ytimg.com/vi/tOM-nWPcR4U/maxresdefault.jpg"
                          alt="Illuminati song poster"
                          className="w-full h-full object-cover"
                        />
                        <img
                          src="https://i.ytimg.com/vi/epAFDEJImrU/sddefault.jpg"
                          alt="Darshana song poster"
                          className="w-full h-full object-cover"
                        />
                        <img
                          src="https://i.ytimg.com/vi/3GyOnsGDeqY/maxresdefault.jpg"
                          alt="Neela Nilave song poster"
                          className="w-full h-full object-cover"
                        />
                      </>
                    )}
                    
                    {lang === "English" && (
                      <>
                        <img
                          src="https://i.ytimg.com/vi/eoDE4PzxFvE/hqdefault.jpg"
                          alt="Happy song poster"
                          className="w-full h-full object-cover"
                        />
                        <img
                          src="https://i.ytimg.com/vi/9UrsjRc4fgs/hqdefault.jpg"
                          alt="Dynamite song poster"
                          className="w-full h-full object-cover"
                        />
                        <img
                          src="https://i.ytimg.com/vi/5JUeWYdWYBg/mqdefault.jpg"
                          alt="Levitating song poster"
                          className="w-full h-full object-cover"
                        />
                        <img
                          src="https://i.scdn.co/image/ab67616d00001e0210ad514ee50f7529c1173071"
                          alt="Love Yourself song poster"
                          className="w-full h-full object-cover"
                        />
                      </>
                    )}
                    
                  </div>
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex items-end p-6">
                  <h2 className="text-xl text-white font-bold">
                    Top 10 in {lang}
                  </h2>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (step === 4) {
    console.log("Playlist for selected language:", topHits[selectedLanguage]);
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#1a1a1a] to-[#121212] p-6 pb-32"> {/* Increased bottom padding */}
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl text-white font-bold mb-8 font-roboto">
            Top 10 in {selectedLanguage}
          </h2>
          <div className="space-y-4">
            {topHits[selectedLanguage]?.map((song, index) => (
              <div
                key={index}
                className="flex items-center space-x-6 bg-[#ffffff0a] p-6 rounded-xl hover:bg-[#ffffff15] transition-colors cursor-pointer"
              >
                <span className="text-[#1DB954] font-bold text-xl min-w-[30px]">
                  {index + 1}
                </span>
                <div className="flex-1">
                  <h3 className="text-white text-lg font-medium">{song.title}</h3>
                  <p className="text-gray-400">
                    {Array.isArray(song.artist) ? song.artist.join(", ") : song.artist}
                  </p>
                </div>
                <button
                  onClick={() => playSong(song, index)}
                  className="text-[#1DB954] text-xl hover:scale-110 transition-transform"
                >
                  <FontAwesomeIcon icon={faPlay} />
                </button>
              </div>
            ))}
          </div>
  
          {/* Back to Playlists Button */}
          <div className="mt-8">
            <button
              onClick={() => setStep(3)}
              className="py-3 px-6 bg-[#1DB954] text-white rounded-xl hover:bg-[#1ed760] transition-opacity w-full shadow-md"
            >
              <FontAwesomeIcon icon={faArrowLeft} className="mr-2" />
              Back to Playlists
            </button>
          </div>
        </div>
  
        {/* Audio Player Fixed at Bottom */}
        {currentSong && (
          <div className="fixed bottom-0 left-0 right-0 bg-gradient-to-r from-[#1a1a1a] to-[#2a2a2a] p-4 shadow-lg border-t border-gray-700">
            <div className="flex items-center justify-between">
              {/* Left Section: Current Song Info */}
<div className="flex items-center space-x-4">
  <div className="flex flex-col" style={{ minWidth: "200px", maxWidth: "200px" }}> {/* Fixed width */}
    <h3 className="text-[#1DB954] text-sm font-semibold truncate">{currentSong.title}</h3>
    <p className="text-gray-400 text-xs truncate">
      {Array.isArray(currentSong.artist) ? currentSong.artist.join(", ") : currentSong.artist}
    </p>
  </div>
              </div>
        
              {/* Center Section: Playback Controls */}
              <div className="flex items-center justify-center space-x-6">
                <button
                  onClick={playPrevious}
                  className="text-gray-400 hover:text-white text-xl transition-transform hover:scale-110"
                >
                  <FontAwesomeIcon icon={faBackward} />
                </button>
                <button
                  onClick={togglePlayPause}
                  className="text-white bg-gray-800 p-2 rounded-full text-2xl hover:scale-125 transition-transform"
                >
                  <FontAwesomeIcon icon={isPlaying ? faPause : faPlay} />
                </button>
                <button
                  onClick={playNext}
                  className="text-gray-400 hover:text-white text-xl transition-transform hover:scale-110"
                >
                  <FontAwesomeIcon icon={faForward} />
                </button>
              </div>
        
              {/* Right Section: Playlist Mode and Volume Controls */}
              <div className="flex items-center space-x-6 pr-6"> {/* Adjusted spacing */}
                {/* Playlist Mode Button */}
                <button
                  onClick={togglePlaylistMode}
                  className="text-lg hover:text-white"
                >
                  {playlistMode === "loopAll" && (
                    <FontAwesomeIcon icon={faRepeat} className="text-gray-400" title="Loop All" />
                  )}
                  {playlistMode === "loopOne" && (
                    <span className="relative">
                      <FontAwesomeIcon icon={faRepeat} className="text-white" title="Loop One" />
                      <span
                        className="absolute top-0 right-0 text-xs font-bold text-white bg-gray-800 rounded-full px-1"
                        style={{ transform: "translate(50%, -50%)" }}
                      >
                        1
                      </span>
                    </span>
                  )}
                  {playlistMode === "shuffle" && (
                    <FontAwesomeIcon icon={faRandom} className="text-gray-400" title="Shuffle" />
                  )}
                </button>
          
                {/* Volume Control */}
                <div className="flex items-center space-x-2"> {/* Adjusted spacing */}
                  {/* Volume Icon */}
                  <FontAwesomeIcon
                    icon={faVolumeUp}
                    onClick={toggleVolume}
                    className={`text-lg ${isVolumeOn ? "text-white" : "text-gray-400"} hover:text-white cursor-pointer`}
                  />
          
                  {/* Volume Slider */}
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.01"
                    value={audioRef.current?.volume || volume}
                    onChange={(e) => {
                      const newVolume = parseFloat(e.target.value);
                      setVolume(newVolume);
                      if (audioRef.current) {
                        audioRef.current.volume = newVolume;
                      }
                      setIsVolumeOn(newVolume > 0); // Update volume state
                    }}
                    className="w-24 bg-gray-700 rounded-full"
                  />
                </div>
              </div>
            </div>
        
            {/* Progress Bar */}
            <div className="mt-4">
              <div className="flex items-center justify-between text-gray-400 text-xs mb-1">
                <span className="mr-2">{formatTime(currentTime)}</span> {/* Current Time */}
                <div
                  className="w-full h-1 bg-gray-700 rounded-full cursor-pointer relative group mx-2" // Centered progress bar
                  onClick={handleSeek}
                >
                  <div
                    className="h-full bg-[#1DB954] rounded-full transition-all"
                    style={{ width: `${progress}%` }}
                  ></div>
                </div>
                <span className="ml-2">{formatTime(duration)}</span> {/* Total Duration */}
              </div>
            </div>
        
            {/* Audio Element */}
            <audio
              ref={audioRef}
              onTimeUpdate={handleTimeUpdate}
              onLoadedMetadata={handleTimeUpdate}
              onError={(e) => {
                console.error("Audio error:", e, "Current song:", currentSong?.title);
                if (currentSong?.title === "Ae Dil Hai Mushkil") {
                  console.log("Attempting to fix Ae Dil Hai Mushkil playback issue");
                  if (audioRef.current) {
                    audioRef.current.src = "/songs/Hindi/Ae-Dil-Hai-Mushkil.mp3";
                    audioRef.current.play().catch(err => {
                      console.error("Still failed to play after fix:", err);
                      alert("Error playing Ae Dil Hai Mushkil. The file might be missing or corrupted.");
                    });
                  }
                } else {
                  alert("Error playing this song. The file might be missing or corrupted.");
                }
                setIsPlaying(false);
              }}
              onEnded={() => {
                if (playlistMode === "loopOne") {
                  audioRef.current.currentTime = 0; // Restart the current song
                  audioRef.current.play();
                } else if (playlistMode === "shuffle") {
                  playNext(); // Play a random song
                } else {
                  playNext(); // Play the next song in the playlist
                }
              }}
              className="hidden"
            />
          </div>
        )}
      </div>
    );
  }
  

  
}

export default MainComponent;