import React, { useContext, useEffect, useRef, useState } from 'react'
import { userDataContext } from '../context/UserContext'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import aiImg from "../assets/ai.gif"
import userImg from "../assets/user.gif"

function Home() {
  const {userData, serverUrl, setUserData, getGeminiResponse} = useContext(userDataContext)
  const navigate = useNavigate()
  const [listening, setListening] = useState(false)

  const [userText, setUserText] = useState("")
  const [aiText, setAiText] = useState("")
  const [pendingRedirect, setPendingRedirect] = useState(null)

  const safeOpen = (url, name) => {
    try {
      const newTab = window.open(url, '_blank')
      if (!newTab || newTab.closed || typeof newTab.closed === 'undefined') {
        setPendingRedirect({ url, name })
      }
    } catch (e) {
      console.error("Popup blocked:", e)
      setPendingRedirect({ url, name })
    }
  }

  const isSpeakingRef = useRef(false)
  const recognitionRef = useRef(null)
  const isRecognizingRef = useRef(false)
  const synth = window.speechSynthesis

  const handleLogOut = async () => {
    try {
      const result = await axios.get(`${serverUrl}/api/auth/logout`, {withCredentials: true})
      setUserData(null)
      navigate("/signin")
    } catch (error) {
      setUserData(null)
      navigate("/signin")
      console.log(error)
    }
  }

  const startRecognition = () => {
    try {
      if (!isSpeakingRef.current && !isRecognizingRef.current) {
        recognitionRef.current?.start();
        setListening(true);
      }
    } catch (error) {
      if (error.message && !error.message.includes("start")) {
        console.error("Recognition error:", error);
      }
    }
  };

  const speak = (text) => {
    const utterance = new SpeechSynthesisUtterance(text)
    
    // Find the best female English voice
    const voices = synth.getVoices()
    const preferredVoices = [
      "Google US English",
      "Samantha",
      "Microsoft Zira",
      "Tessa",
      "Karen",
      "Moira",
      "Veena",
      "Fiona"
    ]
    
    let selectedVoice = null
    for (const name of preferredVoices) {
      selectedVoice = voices.find(v => v.name.toLowerCase().includes(name.toLowerCase()))
      if (selectedVoice) break
    }
    
    if (!selectedVoice) {
      // Fallback to any English voice containing female indicators
      selectedVoice = voices.find(v => 
        v.lang.startsWith('en') && 
        (v.name.toLowerCase().includes('female') || 
         v.name.toLowerCase().includes('samantha') || 
         v.name.toLowerCase().includes('zira') || 
         v.name.toLowerCase().includes('karen'))
      )
    }
    
    if (!selectedVoice) {
      // Last resort: any English voice
      selectedVoice = voices.find(v => v.lang.startsWith('en'))
    }
    
    if (selectedVoice) {
      utterance.voice = selectedVoice
    }

    utterance.lang = 'en-US'
    isSpeakingRef.current = true
    utterance.onend = () => {
      setAiText("")
      isSpeakingRef.current = false
      startRecognition()
    }
    synth.speak(utterance)
  }

  const handleCommand = (data) => {
    const { type, userInput, response, url } = data;
    
    speak(response);

    if (type === 'google_search') {
      const query = encodeURIComponent(userInput);
      safeOpen(`https://www.google.com/search?q=${query}`, 'Google');
    }

    if (type === 'calculator_open') {
      safeOpen('https://www.google.com/search?q=calculator', 'Calculator');
    }

    if (type === "instagram_open") {
      safeOpen(url || 'https://www.instagram.com/', 'Instagram');
    }

    if (type === "facebook_open") {
      safeOpen(url || 'https://www.facebook.com/', 'Facebook');
    }

    if (type === "open_website") {
      let siteName = 'Website';
      try {
        if (url) {
          const parsed = new URL(url);
          siteName = parsed.hostname.replace('www.', '');
          // capitalize first letter
          siteName = siteName.charAt(0).toUpperCase() + siteName.slice(1);
        }
      } catch (e) {}
      
      if (url) {
        safeOpen(url, siteName);
      } else {
        safeOpen(`https://www.google.com/search?q=${encodeURIComponent(userInput)}`, siteName);
      }
    }

    if (type === "weather-show") {
      safeOpen('https://www.google.com/search?q=weather', 'Weather');
    }

    if (type === 'youtube_search' || type === 'youtube_play') {
      const query = encodeURIComponent(userInput);
      safeOpen(`https://www.youtube.com/results?search_query=${query}`, 'YouTube');
    }
  }




  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    if (!SpeechRecognition) {
      console.warn("Speech recognition not supported in this browser.");
      return;
    }
    
    const recognition = new SpeechRecognition()
    recognition.continuous = true;
    recognition.lang = 'en-US'

    recognitionRef.current = recognition

    recognition.onstart = () => {
      console.log("Recognition started");
      isRecognizingRef.current = true;
      setListening(true);
    };

    recognition.onend = () => {
      console.log("Recognition ended");
      isRecognizingRef.current = false;
      setListening(false);
    };

    recognition.onerror = (event) => {
      console.warn("Recognition error:", event.error);
      isRecognizingRef.current = false;
      setListening(false);
      
      if (event.error !== "aborted" && !isSpeakingRef.current) {
        setTimeout(() => {
          startRecognition();
        }, 1000);
      }
    };

    recognition.onresult = async (e) => {
      const transcript = e.results[e.results.length - 1][0].transcript.trim()
      console.log("heard : " + transcript)
      if (userData?.assistantName && transcript.toLowerCase().includes(userData.assistantName.toLowerCase())) {
        setAiText("")
        setUserText(transcript)
        recognition.stop()
        isRecognizingRef.current = false;
        setListening(false)
        const data = await getGeminiResponse(transcript)
        if (data) {
          handleCommand(data)
          setAiText(data.response)
          setUserText("")
        }
      }
    }

    const fallback = setInterval(() => {
      if (!isSpeakingRef.current && !isRecognizingRef.current) {
        startRecognition(); 
      }
    }, 10000);

    setTimeout(() => {
      startRecognition();
    }, 1000);

    return () => {
      recognition.stop();
      setListening(false);
      isRecognizingRef.current = false;
      clearInterval(fallback);
    };
  }, [userData])


  return (
    <div className='w-full h-[100vh] bg-gradient-to-t from-[black] to-[#02023d] flex justify-center items-center flex-col gap-[15px]'>
      
      <button 
        className='min-w-[150px] h-[60px] mt-[30px] text-black font-semibold absolute top-[20px] right-[20px] bg-white rounded-full cursor-pointer text-[19px]' 
        onClick={handleLogOut}
      >
        Log Out
      </button>

      <button 
        className='min-w-[150px] h-[60px] mt-[30px] text-black font-semibold bg-white absolute top-[100px] right-[20px] rounded-full cursor-pointer text-[19px] px-[20px] py-[10px]' 
        onClick={() => navigate("/customize")}
      >
        Customize your Assistant
      </button>

      <div className='w-[280px] h-[380px] flex justify-center items-center overflow-hidden rounded-xl shadow-[0_0_20px_rgba(0,0,0,0.5)]'>
        <img src={userData?.assistantImage} alt="" className='w-full h-full object-cover'/>
      </div>

      <h1 className='text-white text-[22px] font-semibold tracking-wide'>
        I'm {userData?.assistantName}
      </h1>
      {aiText ? (
        <img src={aiImg} alt="AI speaking" className='w-[200px]'/>
      ) : (
        <img src={userImg} alt="User listening" className='w-[200px]'/>
      )}
      <h1 className='text-white text-[18px] font-bold text-wrap'>{userText ? userText : aiText ? aiText : null}</h1>

      {pendingRedirect && (
        <div className='fixed bottom-10 left-1/2 transform -translate-x-1/2 bg-[#0b0c16e6] backdrop-blur-lg border border-[#3b82f644] px-6 py-4 rounded-2xl flex items-center gap-4 shadow-[0_0_30px_rgba(59,130,246,0.3)] z-50 animate-fade-in'>
          <div className='flex flex-col gap-1'>
            <span className='text-white font-semibold text-[17px]'>Popup Blocked</span>
            <span className='text-gray-300 text-[14px]'>Click below to open {pendingRedirect.name}</span>
          </div>
          <button 
            onClick={() => {
              window.open(pendingRedirect.url, '_blank');
              setPendingRedirect(null);
            }}
            className='bg-blue-600 hover:bg-blue-700 text-white font-bold px-4 py-2.5 rounded-xl transition-all shadow-lg cursor-pointer text-[15px]'
          >
            Open Link
          </button>
          <button 
            onClick={() => setPendingRedirect(null)}
            className='text-gray-400 hover:text-white text-sm font-semibold cursor-pointer px-2 py-1'
          >
            Dismiss
          </button>
        </div>
      )}
    </div>
  )
}

export default Home