"use client";
import React, { useState, useRef } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMusic, faUser, faEnvelope, faLock, faEye, faEyeSlash, faCamera, faPlay, faPause, faArrowLeft} from "@fortawesome/free-solid-svg-icons";

function MainComponent() {
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

  const languages = [
    
    "Kannada",
    "Telugu",
    "Tamil",
    "Malayalam",
    "Hindi",
    "English",
  ];
  const topHits = {
    Kannada: [
      { title: "Singara Siriye", artist: "Vijay Prakash, Ananya Bhat" , url: "/songs/Kannada/Singara-Siriye.mp3"},
      { title: "Cotton Candy", artist: "Chandan Shetty, Sushmitha", url: "/songs/Kannada/Cotton-Candy.mp3"},
      { title: "Nenne Tanaka", artist: "Sanjith Hegde", url: "/songs/Kannada/Nenne-Tanaka.mp3"},
      { title: "Naa Ninage Nee Nanage", artist: "Vasuki Vaibhav", url: "/songs/Kannada/Naa-Ninage-Nee-Nanage.mp3"},
      { title: "Bombe Helutaite", artist: "Vijay Prakash", url: "/songs/Kannada/Bombe-Helutaite.mp3"},
      { title: "Summane Heege Ninnane", artist: "Sonu Nigam, Shreya Ghoshal", url: "/songs/Kannada/Summane-Heege-Ninnane.mp3"},
      { title: "Karaabu", artist: "Chandan Shetty", url: "/songs/Kannada/Karaabu.mp3"},
      { title: "Sanchariyagu Nee", artist: "Vijay Prakash, Rakshitha Suresh", url: "/songs/Kannada/Sanchariyagu-Nee.mp3"},
      { title: "Vajrakaya", artist: "Shankar Mahadevan", url: "/songs/Kannada/Vajrakaya.mp3"},
      { title: "Neeralli Sanna", artist: "Sonu Nigam, Sunitha Gopuraj", url: "/songs/Kannada/Neeralli-Sanna.mp3"},
    ],

    Hindi: [
      { title: "Tum Hi Ho", artist: "Arijit Singh", url: "/songs/Hindi/Tum-Hi-Ho.mp3" },
      { title: "Kal Ho Naa Ho", artist: "Sonu Nigam", url: "/songs/Hindi/Kal-Ho-Naa-Ho.mp3" },
      { title: "Ae Dil Hai Mushkil", artist: "Sukhwinder Singh", url: "/songs/Hindi/Ae-Dil-Hai-Mushkil.mp3" },
      { title: "Jugnu", artist: "JBadshah", url: "/songs/Hindi/Jugnu.mp3" },
      { title: "The Humma Song", artist: "A.R. Rahman", url: "/songs/Hindi/The-Humma-Song.mp3" },
      { title: "Akhiyaan Gulaab", artist: "Mitraz", url: "/songs/Hindi/Akhiyaan-Gulaab.mp3" },
      { title: "Pukarta Chala Hoon Main", artist: "Mohammed Rafi", url: "/songs/Hindi/Pukarta-Chala-Hoon-Main.mp3" },
      { title: "Bulleya", artist: "Amit Mishra, Shilpa Rao", url: "/songs/Hindi/Bulleya.mp3" },
      { title: "Ilahi", artist: "Arijit Singh", url: "/songs/Hindi/Ilahi.mp3" },
      { title: "Bekhayali", artist: "Arijit Singh", url: "/songs/Hindi/Bekhayali.mp3" },
    ],
       
    Telugu: [
      { title: "Kadhale Kalagaa", artist: "Anurag Kulkarni", url: "/songs/Telugu/Kadhale-Kalagaa.mp3" },
      { title: "Manasu Palike", artist: "Rakendu Mouli", url: "/songs/Telugu/Manasu-Palike.mp3" },
      { title: "Kurchi Madathapetti", artist: "Sahiti Chaganti, Sri Krishna", url: "/songs/Telugu/Kurchi-Madathapetti.mp3" },
      { title: "Oo Antava", artist: "Indravathi Chauhan", url: "/songs/Telugu/Oo-Antava-oo-Oo-Antava.mp3" },
      { title: "O Priya Priya", artist: "K.S. Chitra", url: "/songs/Telugu/O-Priya-Priya.mp3" },
      { title: "Kadalalle", artist: "Sid Sriram", url: "/songs/Telugu/Kadalalle.mp3" },
      { title: "Oh Sita Hey Rama", artist: "S.P. Charan, Ramya Behara", url: "/songs/Telugu/Oh-Sita-Hey-Rama.mp3" },
      { title: "NaaNaa Hyraanaa", artist: "Shreya Ghoshal", url: "/songs/Telugu/NaaNaa-Hyraanaa.mp3" },
      { title: "Naatu Naatu", artist: "Rahul Sipligunj, Kaala Bhairava", url: "/songs/Telugu/Naatu-Naatu.mp3" },
      { title: "Inkem Inkem Inkem Kaavaale", artist: "Sid Sriram", url: "/songs/Telugu/Inkem-Inkem-Inkem-Kaavaale.mp3" },
    ],

    Tamil: [
      { title: "Kaavaalaa", artist: "Shilpa Rao & Anirudh Ravichander", url: "/songs/Tamil/Kaavaalaa.mp3" },
      { title: "Manasilaayo", artist: "Anirudh Ravichander", url: "/songs/Tamil/Manasilaayo.mp3" },
      { title: "Vaa Kanamma", artist: "Hesham Abdul Wahab, Uthara Unnikrishnan", url: "/songs/Tamil/Vaa-Kanamma.mp3" },
      { title: "Golden Sparrow", artist: "Sublahshini, G.V. Prakash Kumar, Dhanush, Arivu", url: "/songs/Tamil/Golden-Sparrow.mp3" },
      { title: "Urugi Urugi", artist: "Anand Aravindakshan", url: "/songs/Tamil/Urugi-Urugi.mp3" },
      { title: "Kanave Kanave", artist: "Anirudh Ravichander", url: "/songs/Tamil/Kanave-Kanave.mp3" },
      { title: "Idhuvum Kadandhu Pogum", artist: "Sid Sriram", url: "/songs/Tamil/Idhuvum-Kadandu-Poogum.mp3" },
      { title: "Dheema Dheema", artist: "Anirudh Ravichander", url: "/songs/Tamil/Dheema.mp3" },
      { title: "Uyirey", artist: "Anand Aravindakshan", url: "/songs/Tamil/Uyirey.mp3" },
      { title: "Kannazhaga", artist: "Dhanush, Shruti Haasan", url: "/songs/Tamil/Kannazhaga.mp3" },
    ],
    
    Malayalam: [
      { title: "Vaanam Chaayum", artist: "K.S. Harisankar", url: "/songs/Malayalam/Vaanum-Chaayum.mp3" },
      { title: "Illuminati", artist: "Dabzee, Sushin Shyam", url: "/songs/Malayalam/Illuminati.mp3" },
      { title: "Kaanthaa", artist: "Sooraj Santhosh, Varun Sunil", url: "/songs/Malayalam/Kaantha-Thrissur-Pooram.mp3" },
      { title: "Angu Vaana Konilu", artist: "Vaikom Vijayalakshmi", url: "/songs/Malayalam/Angu-Vaana-Konilu.mp3" },
      { title: "Pathiye Pathiye", artist: "Harisankar, Swetha Mohan", url: "/songs/Malayalam/Pathiye-Pathiye.mp3" },
      { title: "Darshana", artist: "Hesham Abdul Wahab, Darshana Rajendran", url: "/songs/Malayalam/Darshana.mp3" },
      { title: "Pavizha Mazha", artist: "K.S. Harisankar", url: "/songs/Malayalam/Pavizha-Mazha.mp3" },
      { title: "Neela Nilave", artist: "Kapil Kapilan", url: "/songs/Malayalam/Neela-Nilave.mp3" },
      { title: "Jeevamshamayi", artist: "Shreya Ghoshal, Harisankar", url: "/songs/Malayalam/Jeevamshamayi.mp3" },
      { title: "Maangalyam", artist: "Vijay Yesudas, Sachin Warrier, Divya", url: "/songs/Malayalam/Maangalyam.mp3" },
    ],

    English: [
      { title: "Happy", artist: "Pharrell Williams" },
      { title: "Dynamite", artist: "Taio Cruz" },
      { title: "Levitating", artist: "Dua Lipa" },
      { title: "Another Love", artist: "Tom Odell" },
      { title: "Atlantis", artist: "SeaFret" },
      { title: "Touch", artist: "Sleeping At Last" },
      { title: "No Body, No Crime", artist: "Taylor Swift" },
      { title: "Riptide", artist: "Vance Joy" },
      { title: "Fireflies", artist: "Owl City" },
      { title: "Love Yourself", artist: "Justin Bieber" },
    ]

  };
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
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: true,
      });
      videoRef.current.srcObject = mediaStream;
      setIsCameraOn(true);
    } catch (err) {
      console.error("Error accessing camera:", err);
      alert(
        "Unable to access camera. Please make sure you've granted camera permissions."
      );
    }
  };
  const validateForm = () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d).{8,}$/;

    if (!formData.username.trim()) {
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

  const submitForm = async () => {
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
          setStep(3);
          setMessage("");
        }, 1500);
      } else {
        setMessage(`❗ ${data.message}`);
      }
    } catch (error) {
      setMessage("Something went wrong. Try again.");
      console.error("Submit error:", error);
    } finally {
      setLoading(false);
    }
  };

  const playSong = (song) => {
    setCurrentSong(song); // Set the current song
    setIsPlaying(true); // Set play state to true
    if (audioRef.current) {
      audioRef.current.src = song.url; // Update the audio source
      audioRef.current.play(); // Play the song
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
      const duration = audioRef.current.duration;
      setProgress((currentTime / duration) * 100); // Update progress as a percentage
    }
  };

  const handleSeek = (e) => {
    if (audioRef.current) {
      const progressBar = e.currentTarget; // Use the currentTarget to ensure the correct element
      const rect = progressBar.getBoundingClientRect(); // Get the bounding rectangle of the progress bar
      const clickX = e.clientX - rect.left; // Calculate the click position relative to the progress bar
      const newTime = (clickX / rect.width) * audioRef.current.duration; // Calculate the new time based on the click position
      audioRef.current.currentTime = newTime; // Set the audio's current time to the new time
    }
  };

  if (step === 1) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#1a1a1a] to-[#121212] flex flex-col">
        <div className="flex-1 flex flex-col p-6 max-w-md mx-auto w-full">
          <div className="flex justify-center mt-12 mb-8">
            <div className="relative">
              <div className="absolute -inset-1 bg-gradient-to-r from-[#1DB954] to-[#1ed760] rounded-full blur-lg opacity-75 animate-pulse"></div>
              <div className="h-[100px] w-[100px] rounded-full bg-[#1DB954] flex items-center justify-center relative">
               <FontAwesomeIcon icon={faMusic} className="text-4xl text-white" />
              </div>
            </div>
          </div>
          <h1 className="text-3xl font-bold text-white text-center mb-3 font-roboto">
            Create Account
          </h1>
          <form className="space-y-6 backdrop-blur-lg bg-[#ffffff0a] p-8 rounded-3xl shadow-xl">
            <div className="relative group">
              <FontAwesomeIcon 
                icon={faUser} 
                className="absolute left-4 top-3 text-gray-400 group-focus-within:text-[#1DB954] transition-colors"
              />
              <input
                type="text"
                name="username"
                placeholder="Username"
                value={formData.username}
                onChange={handleInputChange}
                className="w-full pl-12 pr-4 py-3 rounded-xl bg-[#ffffff0a] text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#1DB954] text-sm border border-[#ffffff1a] focus:border-transparent transition-all"
                required
              />
            </div>
            <div className="relative group">
              <FontAwesomeIcon 
                icon={faEnvelope} 
                className="absolute left-4 top-3 text-gray-400 group-focus-within:text-[#1DB954] transition-colors"
              />
              <input
                type="email"
                name="email"
                placeholder="Email"
                value={formData.email}
                onChange={handleInputChange}
                className="w-full pl-12 pr-4 py-3 rounded-xl bg-[#ffffff0a] text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#1DB954] text-sm border border-[#ffffff1a] focus:border-transparent transition-all"
                required
              />
            </div>
            <div className="relative group">
              <FontAwesomeIcon 
                icon={faLock} 
                className="absolute left-4 top-3 text-gray-400 group-focus-within:text-[#1DB954] transition-colors"
              />
              <input
                type="password"
                name="password"
                placeholder="Password"
                value={formData.password}
                onChange={handleInputChange}
                className="w-full pl-12 pr-4 py-3 rounded-xl bg-[#ffffff0a] text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#1DB954] text-sm border border-[#ffffff1a] focus:border-transparent transition-all"
                required
              />
            </div>
            <button
              type="button"
              onClick={() => {
                if (validateForm()) {
                  setStep(2);
                }
              }}
              className="w-full py-3 px-4 bg-gradient-to-r from-[#1DB954] to-[#1ed760] text-white rounded-xl font-semibold text-sm active:scale-[0.98] transition-all duration-200 transform hover:shadow-lg hover:shadow-[#1DB95444]"
            >
              Continue
            </button>
          </form>
        </div>
      </div>
    );
  }

  if (step === 2) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#1a1a1a] to-[#121212] flex flex-col">
        <div className="flex-1 flex flex-col p-6 max-w-md mx-auto w-full">
          <h1 className="text-3xl font-bold text-white text-center mb-8 font-roboto">
            Choose Your Languages
          </h1>
          <div className="backdrop-blur-lg bg-[#ffffff0a] p-8 rounded-3xl shadow-xl">
            <p className="text-white mb-6 text-center">
              Select your favorite Indian languages for music recommendations
            </p>
            <div className="grid grid-cols-2 gap-4">
              {languages.map((language) => (
                <label
                  key={language}
                  className="flex items-center space-x-3 p-3 bg-[#ffffff0a] rounded-xl hover:bg-[#ffffff15] transition-colors cursor-pointer"
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
                onClick={submitForm}
                disabled={loading}
                className={`w-full py-3 px-4 bg-gradient-to-r from-[#1DB954] to-[#1ed760] text-white rounded-xl font-semibold text-sm active:scale-[0.98] transition-all duration-200 transform hover:shadow-lg hover:shadow-[#1DB95444] mt-8 ${
                loading ? "opacity-70 cursor-not-allowed" : ""
              }`}
            >
              {loading ? "Submitting..." : "Continue to Music"}
            </button>

            {message && (
              <p className="text-center mt-4 text-white">{message}</p>
            )}
          </div>
        </div>
      </div>
    );
  }

  if (step === 4) {
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
                  <p className="text-gray-400">{song.artist}</p>
                </div>
                <button
                  onClick={() => playSong(song)}
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
              className="py-3 px-6 bg-[#ffffff0a] text-white rounded-xl hover:bg-[#ffffff15] transition-colors w-full"
            >
              <FontAwesomeIcon icon={faArrowLeft} className="mr-2" />
              Back to Playlists
            </button>
          </div>
        </div>
  
        {/* Audio Player Fixed at Bottom */}
        {currentSong && (
          <div className="fixed bottom-0 left-0 right-0 bg-[#1a1a1a] p-4 flex flex-col space-y-2">
            <div className="flex items-center space-x-4">
              <div className="flex-1">
                <h3 className="text-white text-lg font-medium">{currentSong.title}</h3>
                <p className="text-gray-400">{currentSong.artist}</p>
              </div>
              <button
                onClick={togglePlayPause}
                className="text-[#1DB954] text-2xl hover:scale-110 transition-transform"
              >
                <FontAwesomeIcon icon={isPlaying ? faPause : faPlay} />
              </button>
            </div>
  
            {/* Progress Bar */}
            <div
              className="w-full h-2 bg-gray-600 rounded-full cursor-pointer"
              onClick={handleSeek}
            >
              <div
                className="h-full bg-[#1DB954] rounded-full"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
  
            <audio
              ref={audioRef}
              onTimeUpdate={handleTimeUpdate}
              onEnded={() => setIsPlaying(false)}
              className="hidden"
            />
          </div>
        )}
      </div>
    );
  }
  

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
            <div className="animate-pulse">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                className="w-full max-w-2xl mx-auto h-[300px] object-cover rounded-xl mb-4"
              />
              <p className="text-white">Detecting your mood...</p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {formData.languages.map((lang) => (
            <div
              key={lang}
              onClick={() => {
                setSelectedLanguage(lang);
                setStep(4);
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

export default MainComponent;