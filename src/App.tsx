import { useState, useRef, useEffect, createContext, useContext, useCallback } from 'react';
import type { ReactNode } from 'react';
import { 
  Heart, 
  Calendar, 
  MapPin, 
  Clock, 
  Check, 
  Camera,
  Utensils,
  ChevronDown,
  User,
  Music,
  Volume2,
  VolumeX
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Toaster, toast } from 'sonner';
import emailjs from '@emailjs/browser';
import './App.css';

// Wedding configuration - Edit these details
const WEDDING_CONFIG = {
  coupleNames: {
    partner1: 'Yi Heng',
    partner2: 'Siew Tin'
  },
  date: 'Saturday, 12 December 2026',
  time: '5:45 PM',
  venue: '满漢城酒家 The Han Room @ The Garden Mall, KL',
  address: 'T-216A, The Gardens Mall, Lingkaran Syed Putra, Mid Valley City, 59200 Kuala Lumpur, Wilayah Persekutuan Kuala Lumpur',
  rsvpDeadline: '15 June 2026',
  weddingDate: new Date(2026, 11, 12, 16, 0),
  googleSheetsUrl: 'https://script.google.com/macros/s/AKfycbxJNYRGmQHMXXzu2gAODAalAeh8WwnRYPUN2o4iZM6bwWxOK48D2-K2-OeLWy3mvtEUzw/exec',
  emailjs: {
    serviceId: 'service_2oxqvts',
    templateId: 'template_prwfnrp',
    publicKey: 'zOech7IZ7gPgfjaTH',
  }
};

const publicAsset = (path: string) => `${import.meta.env.BASE_URL}${path.replace(/^\//, '')}`;

interface RSVPData {
  name: string;
  email: string;
  attending: 'yes' | 'no';
  guests: string;
  relationship: 'groom' | 'bride';
  message: string;
}

interface Photo {
  id: string;
  url: string;
  name: string;
}

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

interface AudioContextType {
  isPlaying: boolean;
  hasEnded: boolean;
  togglePlay: () => void;
  play: () => void;
  pause: () => void;
}

const AudioContext = createContext<AudioContextType>({
  isPlaying: false,
  hasEnded: false,
  togglePlay: () => {},
  play: () => {},
  pause: () => {},
});

function AudioProvider({ children }: { children: ReactNode }) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [hasEnded, setHasEnded] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const audio = new Audio(publicAsset('wedding-music.mp3'));
    audio.loop = false;
    audio.volume = 0.7;
    audioRef.current = audio;

    const handleEnded = () => {
      setHasEnded(true);
      setIsPlaying(false);
    };

    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);
    const handleCanPlay = () => setIsLoaded(true);

    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('play', handlePlay);
    audio.addEventListener('pause', handlePause);
    audio.addEventListener('canplaythrough', handleCanPlay);

    audio.load();

    return () => {
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('play', handlePlay);
      audio.removeEventListener('pause', handlePause);
      audio.removeEventListener('canplaythrough', handleCanPlay);
      audio.pause();
      audio.src = '';
    };
  }, []);

  const play = useCallback(async () => {
    if (audioRef.current && !hasEnded && isLoaded) {
      try {
        await audioRef.current.play();
      } catch (error) {
        console.log('Playback failed:', error);
      }
    }
  }, [hasEnded, isLoaded]);

  const pause = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
    }
  }, []);

  const togglePlay = useCallback(() => {
    if (!audioRef.current || hasEnded) return;
    
    if (audioRef.current.paused) {
      play();
    } else {
      pause();
    }
  }, [hasEnded, play, pause]);

  return (
    <AudioContext.Provider value={{
      isPlaying,
      hasEnded,
      togglePlay,
      play,
      pause
    }}>
      {children}
    </AudioContext.Provider>
  );
}

function useAudio() {
  return useContext(AudioContext);
}

function FullScreenEnvelope({ onOpen, isOpen }: { onOpen: () => void; isOpen: boolean }) {
  const [sealBroken, setSealBroken] = useState(false);
  const [showLetter, setShowLetter] = useState(false);
  const { play } = useAudio();
  const hasAttemptedPlay = useRef(false);

  useEffect(() => {
    if (!hasAttemptedPlay.current && !isOpen) {
      hasAttemptedPlay.current = true;
      const timer = setTimeout(() => {
        play();
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [play, isOpen]);

  const handleOpen = useCallback(() => {
    if (isOpen) return;
    
    play();
    
    setSealBroken(true);
    
    setTimeout(() => {
      setShowLetter(true);
    }, 300);

    setTimeout(() => {
      onOpen();
    }, 1800);
  }, [isOpen, onOpen, play]);

  useEffect(() => {
    const handleScroll = () => {
      if (!isOpen && window.scrollY > 30) {
        handleOpen();
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [isOpen, handleOpen]);

  if (isOpen) return null;

  return (
    <div className="fixed inset-0 z-[200] envelope-overlay">
      <div className="absolute inset-0 bg-gradient-to-br from-[#e8d5b7] via-[#d4c4a8] to-[#c9b896]">
        <div className="absolute inset-0 opacity-30" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='4' /%3E%3C/filter%3E%3Crect width='100' height='100' filter='url(%23noise)' opacity='0.5'/%3E%3C/svg%3E")`,
        }} />
      </div>

      <div 
        className={`absolute top-0 left-0 right-0 h-[55vh] origin-top transition-all duration-700 ease-in-out z-20 ${
          sealBroken ? 'opacity-0' : 'opacity-100'
        }`}
        style={{
          transform: sealBroken ? 'rotateX(180deg)' : 'rotateX(0deg)',
          transformOrigin: 'top',
          clipPath: 'polygon(0 0, 50% 100%, 100% 0)',
          background: 'linear-gradient(135deg, #e8d5b7 0%, #d4c4a8 100%)',
          boxShadow: '0 10px 40px rgba(0,0,0,0.2)',
          perspective: '1000px'
        }}
      />

      <div 
        className="absolute bottom-0 left-0 right-0 h-[55vh] z-10"
        style={{
          clipPath: 'polygon(0 100%, 50% 0, 100% 100%)',
          background: 'linear-gradient(135deg, #c9b896 0%, #b8a885 100%)'
        }}
      />

      <div 
        className="absolute top-0 left-0 w-1/2 h-full z-10"
        style={{
          clipPath: 'polygon(0 0, 100% 50%, 0 100%)',
          background: 'linear-gradient(135deg, #d4c4a8 0%, #c9b896 100%)'
        }}
      />

      <div 
        className="absolute top-0 right-0 w-1/2 h-full z-10"
        style={{
          clipPath: 'polygon(100% 0, 0 50%, 100% 100%)',
          background: 'linear-gradient(135deg, #d4c4a8 0%, #c9b896 100%)'
        }}
      />

      <div 
        className={`absolute inset-0 flex items-center justify-center z-15 transition-all duration-500 ${
          showLetter ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
        }`}
      >
        <div className="bg-gradient-to-b from-white to-rose-50 p-8 md:p-12 rounded-lg shadow-2xl max-w-md text-center mx-4 border-4 border-[#e8d5b7]">
          <Heart className="w-10 h-10 mx-auto text-rose-500 mb-4 animate-pulse" fill="currentColor" />
          <h2 className="font-script text-3xl md:text-4xl text-stone-800 mb-3">
            You're Invited
          </h2>
          <p className="text-stone-600 mb-2">To the wedding of</p>
          <h3 className="font-script text-2xl md:text-3xl text-rose-600 mb-4">
            ...
          </h3>
          <h4 className="font-script text-2xl md:text-3xl text-rose-600 mb-4">
            ...
          </h4>
          <h5 className="font-script text-2xl md:text-3xl text-rose-600 mb-4">
            ...
          </h5>
          <h6 className="font-script text-2xl md:text-3xl text-rose-600 mb-4">
            ...
          </h6>
          <h6 className="font-script text-2xl md:text-3xl text-rose-600 mb-4">
            ...
          </h6>
          <div className="border-t border-b border-rose-200 py-3 my-4">
            <p className="text-stone-700 font-medium">{WEDDING_CONFIG.date}</p>
            <p className="text-stone-500 text-sm mt-1">{WEDDING_CONFIG.venue}</p>
          </div>
        </div>
      </div>

      <div 
        onClick={handleOpen}
        className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-30 cursor-pointer transition-all duration-500 ${
          sealBroken ? 'scale-0 opacity-0 rotate-45' : 'scale-100 opacity-100 hover:scale-110'
        }`}
      >
        <div className="w-28 h-28 md:w-36 md:h-36 rounded-full bg-gradient-to-br from-rose-600 to-rose-800 shadow-2xl flex items-center justify-center relative overflow-hidden border-4 border-rose-700">
          <div className="absolute inset-0 bg-gradient-to-tr from-rose-700/50 to-transparent" />
          <div className="w-20 h-20 md:w-28 md:h-28 rounded-full border-2 border-rose-400/50 flex items-center justify-center relative">
            <Heart className="w-10 h-10 md:w-14 md:h-14 text-rose-200" fill="currentColor" />
            <div className="absolute top-1 left-1 w-4 h-4 bg-white/30 rounded-full blur-sm" />
          </div>
        </div>
        <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-20 h-4 bg-black/20 rounded-full blur-md" />
        <div className="absolute inset-0 rounded-full border-4 border-rose-400/30 animate-ping" />
      </div>

      {sealBroken && (
        <>
          <div className="absolute top-1/2 left-1/2 w-6 h-6 bg-rose-700 rounded-full animate-fly-out-1 z-40" />
          <div className="absolute top-1/2 left-1/2 w-5 h-5 bg-rose-600 rounded-full animate-fly-out-2 z-40" />
          <div className="absolute top-1/2 left-1/2 w-7 h-7 bg-rose-800 rounded-full animate-fly-out-3 z-40" />
          <div className="absolute top-1/2 left-1/2 w-4 h-4 bg-rose-500 rounded-full animate-fly-out-4 z-40" />
        </>
      )}

      <div className={`absolute bottom-16 left-0 right-0 text-center transition-opacity duration-300 ${sealBroken ? 'opacity-0' : 'opacity-100'}`}>
        <p className="text-stone-600 text-lg font-light tracking-widest animate-bounce">
          Click the seal to open
        </p>
      </div>
    </div>
  );
}

function BackgroundMusic() {
  const { isPlaying, hasEnded, togglePlay } = useAudio();

  if (hasEnded) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <button
        onClick={togglePlay}
        className="w-12 h-12 bg-white/90 backdrop-blur-sm rounded-full shadow-lg flex items-center justify-center hover:bg-rose-50 transition-all border border-rose-100 active:scale-95"
        aria-label={isPlaying ? 'Pause music' : 'Play music'}
        type="button"
      >
        {isPlaying ? (
          <Volume2 className="w-5 h-5 text-rose-500" />
        ) : (
          <VolumeX className="w-5 h-5 text-stone-400" />
        )}
      </button>
      {isPlaying && (
        <div className="absolute -top-8 left-1/2 -translate-x-1/2 whitespace-nowrap">
          <span className="text-xs text-stone-500 bg-white/80 px-2 py-1 rounded-full">
            <Music className="w-3 h-3 inline mr-1" />
            Playing
          </span>
        </div>
      )}
    </div>
  );
}

function CountdownTimer() {
  const [timeLeft, setTimeLeft] = useState<TimeLeft>({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date().getTime();
      const weddingTime = WEDDING_CONFIG.weddingDate.getTime();
      const difference = weddingTime - now;

      if (difference > 0) {
        return {
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
          minutes: Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60)),
          seconds: Math.floor((difference % (1000 * 60)) / 1000)
        };
      }
      return { days: 0, hours: 0, minutes: 0, seconds: 0 };
    };

    setTimeLeft(calculateTimeLeft());

    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const TimeUnit = ({ value, label }: { value: number; label: string }) => (
    <div className="flex flex-col items-center">
      <div className="w-16 h-16 md:w-20 md:h-20 bg-white/90 backdrop-blur-sm rounded-xl shadow-lg flex items-center justify-center mb-2">
        <span className="text-2xl md:text-3xl font-bold text-rose-600">
          {value.toString().padStart(2, '0')}
        </span>
      </div>
      <span className="text-xs md:text-sm text-white-600 font-medium">{label}</span>
    </div>
  );

  return (
    <div className="flex items-center justify-center gap-3 md:gap-6">
      <TimeUnit value={timeLeft.days} label="Days" />
      <span className="text-2xl md:text-4xl text-rose-400 font-bold">:</span>
      <TimeUnit value={timeLeft.hours} label="Hours" />
      <span className="text-2xl md:text-4xl text-rose-400 font-bold">:</span>
      <TimeUnit value={timeLeft.minutes} label="Minutes" />
      <span className="text-2xl md:text-4xl text-rose-400 font-bold">:</span>
      <TimeUnit value={timeLeft.seconds} label="Seconds" />
    </div>
  );
}

function AppContent() {
  const [rsvpData, setRsvpData] = useState<RSVPData>({
    name: '',
    email: '',
    attending: 'yes',
    guests: '1',
    relationship: 'groom',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadedPhotos, setUploadedPhotos] = useState<Photo[]>([]);
  const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null);
  const [envelopeOpened, setEnvelopeOpened] = useState(false);
  const [showMainContent, setShowMainContent] = useState(false);

  useEffect(() => {
    emailjs.init(WEDDING_CONFIG.emailjs.publicKey);
  }, []);

  useEffect(() => {
    const savedPhotos = localStorage.getItem('weddingPhotos');
    if (savedPhotos) {
      setUploadedPhotos(JSON.parse(savedPhotos));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('weddingPhotos', JSON.stringify(uploadedPhotos));
  }, [uploadedPhotos]);

  const handleEnvelopeOpen = () => {
    setEnvelopeOpened(true);
    setShowMainContent(true);
  };

  const handleRSVPSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    let emailSent = 'No'; // Track email status for Google Sheets
    let emailError = ''; // Track error message if any

    try {
      const timestamp = new Date().toISOString();
      
      const formData = new FormData();
      formData.append('name', rsvpData.name);
      formData.append('email', rsvpData.email || ''); // Empty string if no email
      formData.append('attending', rsvpData.attending);
      formData.append('guests', rsvpData.guests);
      formData.append('relationship', rsvpData.relationship);
      formData.append('message', rsvpData.message);
      formData.append('timestamp', timestamp);

      // Only send email if email is provided
      if (rsvpData.email && rsvpData.email.trim() !== '') {
        const templateParams = {
          to_name: rsvpData.name,
          to_email: rsvpData.email,
          couple_names: `${WEDDING_CONFIG.coupleNames.partner1} & ${WEDDING_CONFIG.coupleNames.partner2}`,
          wedding_date: WEDDING_CONFIG.date,
          wedding_time: WEDDING_CONFIG.time,
          wedding_venue: WEDDING_CONFIG.venue,
          wedding_address: WEDDING_CONFIG.address,
          attending_status: rsvpData.attending === 'yes' ? 'Yes' : 'No',
          number_of_guests: rsvpData.attending === 'yes' ? rsvpData.guests : '0',
          relationship: rsvpData.relationship === 'groom' ? "Groom's Side" : "Bride's Side",
          guest_message: rsvpData.message || 'No message provided',
          reply_to: rsvpData.email,
        };

        try {
          await emailjs.send(
            WEDDING_CONFIG.emailjs.serviceId,
            WEDDING_CONFIG.emailjs.templateId,
            templateParams
          );
          emailSent = 'Yes';
        } catch (emailError) {
          console.error('Email sending failed:', emailError);
          emailSent = 'Failed';
          emailError = 'Email sending failed';
        }
      }

      // Add email status to form data
      formData.append('emailSent', emailSent);
      if (emailError) {
        formData.append('emailError', emailError);
      }

      await fetch(WEDDING_CONFIG.googleSheetsUrl, {
        method: 'POST',
        body: formData,
        mode: 'no-cors'
      });

      // Always show success message regardless of email status
      toast.success('RSVP submitted successfully! ' + rsvpData.email, {
        duration: 5000,
        richColors: true,
      });

      setRsvpData({
        name: '',
        email: '',
        attending: 'yes',
        guests: '1',
        relationship: 'groom',
        message: ''
      });
    } catch (error) {
      console.error('RSVP submission error:', error);
      toast.error('Something went wrong. Please try again.', {
        duration: 5000,
        richColors: true,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const scrollToSection = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <>
      <Toaster position="top-center" richColors closeButton />
      
      <main className={`transition-all duration-1000 ${showMainContent ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
        {/* Navigation */}
        <nav className="fixed top-0 left-0 right-0 z-50 glass border-b border-rose-100/50">
          <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
            <div className="flex items-center gap-4 text-sm">
              <button onClick={() => scrollToSection('details')} className="text-stone-600 hover:text-rose-600 transition-colors">Details</button>
              <button onClick={() => scrollToSection('gallery')} className="text-stone-600 hover:text-rose-600 transition-colors">Gallery</button>
              <button onClick={() => scrollToSection('rsvp')} className="text-stone-600 hover:text-rose-600 transition-colors">RSVP</button>
            </div>
          </div>
        </nav>

        {/* Hero Section */}
        <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
          <div 
            className="absolute inset-0 bg-cover bg-center bg-no-repeat"
            style={{ backgroundImage: `url(${publicAsset('photo1.jpg')})` }}
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/20 to-black/50" />
          
          <div className="relative z-10 text-center text-white px-4">
            <div className="mb-6">
              <Heart className="w-8 h-8 mx-auto text-rose-300 animate-float" fill="currentColor" />
            </div>
            <p className="text-lg md:text-xl font-light tracking-widest mb-4 text-rose-100">
              WE'RE GETTING MARRIED
            </p>
            <h1 className="font-script text-5xl md:text-7xl lg:text-8xl mb-6 text-shadow">
              {WEDDING_CONFIG.coupleNames.partner1} & {WEDDING_CONFIG.coupleNames.partner2}
            </h1>
            <div className="flex items-center justify-center gap-4 text-lg md:text-xl mb-8">
              <span className="w-12 h-px bg-white/50" />
              <span className="font-light">{WEDDING_CONFIG.date}</span>
              <span className="w-12 h-px bg-white/50" />
            </div>
            
            <div className="mb-10">
              <p className="text-sm text-rose-100 mb-4 tracking-wider">COUNTDOWN TO OUR SPECIAL DAY</p>
              <CountdownTimer />
            </div>

            <Button 
              onClick={() => scrollToSection('rsvp')}
              className="bg-rose-500 hover:bg-rose-600 text-white px-8 py-6 text-lg rounded-full shadow-lg hover:shadow-xl transition-all"
            >
              RSVP Now
            </Button>
          </div>

          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 text-white/70 animate-bounce">
            <ChevronDown className="w-8 h-8" />
          </div>
        </section>

        {/* Our Story Section */}
        <section className="py-20 md:py-32 px-4">
          <div className="max-w-4xl mx-auto text-center">
            <Heart className="w-6 h-6 mx-auto text-rose-400 mb-6" />
            <h2 className="text-4xl md:text-5xl font-script text-stone-800 mb-8">
              Our Love Story
            </h2>
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div className="relative">
                <img 
                  src={publicAsset('photo2.jpg')} 
                  alt="Couple" 
                  className="rounded-2xl shadow-2xl w-full h-96 object-cover"
                />
                <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-rose-100 rounded-full -z-10" />
                <div className="absolute -top-4 -left-4 w-16 h-16 bg-amber-100 rounded-full -z-10" />
              </div>
              <div className="text-left">
                <p className="text-stone-600 leading-relaxed mb-6 text-lg">
                  Every love story is unique, and ours has been filled with beautiful moments,
                  building memories, and supporting each other.
                </p>
                <p className="text-stone-600 leading-relaxed mb-6 text-lg">
                  What began as two separate journeys has now become one shared path that was built with love, 
                  laughter, and the promise of a lifetime together.
                </p>
                <p className="text-stone-600 leading-relaxed text-lg italic">
                  As we begin a new chapter, we are thankful to have our family and friends with 
                  us to celebrate a love that continues to grow stronger with time.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Wedding Details Section */}
        <section id="details" className="py-20 md:py-32 px-4 bg-white/50">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-script text-stone-800 mb-4">
                Wedding Details
              </h2>
              <p className="text-stone-500">We can't wait to celebrate with you</p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              <div className="bg-white rounded-2xl p-8 shadow-lg text-center hover:shadow-xl transition-shadow">
                <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <MapPin className="w-8 h-8 text-amber-600" />
                </div>
                <h3 className="text-xl font-semibold text-stone-800 mb-3">Venue</h3>
                <p className="text-stone-600 mb-1">{WEDDING_CONFIG.venue}</p>
                <p className="text-stone-500 text-sm">{WEDDING_CONFIG.address}</p>
              </div>

              <div className="bg-white rounded-2xl p-8 shadow-lg text-center hover:shadow-xl transition-shadow">
                <div className="w-16 h-16 bg-rose-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Clock className="w-8 h-8 text-rose-500" />
                </div>
                <h3 className="text-xl font-semibold text-stone-800 mb-3">Reception</h3>
                <p className="text-stone-600 mb-2">{WEDDING_CONFIG.time}</p>
                <p className="text-stone-500 text-sm">There will be photobooth available</p>
              </div>

              <div className="bg-white rounded-2xl p-8 shadow-lg text-center hover:shadow-xl transition-shadow">
                <div className="w-16 h-16 bg-rose-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Utensils className="w-8 h-8 text-rose-500" />
                </div>
                <h3 className="text-xl font-semibold text-stone-800 mb-3">Dinner</h3>
                <p className="text-stone-600 mb-2">6:30 PM</p>
                <p className="text-stone-500 text-sm">Please arrive earlier</p>
              </div>
            </div>

            <div className="mt-12">
              <div className="flex items-start gap-4 bg-rose-50/50 rounded-xl p-6 max-w-xl mx-auto">
                <User className="w-6 h-6 text-rose-500 mt-1" />
                <div>
                  <h4 className="font-semibold text-stone-800 mb-2">Dress Code</h4>
                  <p className="text-stone-600 text-sm">Smart Casual Attire</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Photo Gallery Section */}
        <section id="gallery" className="py-20 md:py-32 px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <Camera className="w-6 h-6 mx-auto text-rose-400 mb-4" />
              <h2 className="text-4xl md:text-5xl font-script text-stone-800 mb-4">
                Photo Gallery
              </h2>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              <div 
                className="aspect-square rounded-xl overflow-hidden cursor-pointer hover:opacity-90 transition-opacity"
                onClick={() => setSelectedPhoto({ id: 'default1', url: publicAsset('photo1.jpg'), name: 'photo1' })}
              >
                <img src={publicAsset('photo1.jpg')} alt="Venue" className="w-full h-full object-cover" />
              </div>
              <div 
                className="aspect-square rounded-xl overflow-hidden cursor-pointer hover:opacity-90 transition-opacity"
                onClick={() => setSelectedPhoto({ id: 'default2', url: publicAsset('photo2.jpg'), name: 'photo2' })}
              >
                <img src={publicAsset('photo2.jpg')} alt="Flowers" className="w-full h-full object-cover" />
              </div>
              <div 
                className="aspect-square rounded-xl overflow-hidden cursor-pointer hover:opacity-90 transition-opacity"
                onClick={() => setSelectedPhoto({ id: 'default3', url: publicAsset('photo3.jpg'), name: 'photo3' })}
              >
                <img src={publicAsset('photo3.jpg')} alt="Rings" className="w-full h-full object-cover" />
              </div>
              <div 
                className="aspect-square rounded-xl overflow-hidden cursor-pointer hover:opacity-90 transition-opacity"
                onClick={() => setSelectedPhoto({ id: 'default4', url: publicAsset('photo4.jpg'), name: 'photo4' })}
              >
                <img src={publicAsset('photo4.jpg')} alt="Couple" className="w-full h-full object-cover" />
              </div>
              <div 
                className="aspect-square rounded-xl overflow-hidden cursor-pointer hover:opacity-90 transition-opacity"
                onClick={() => setSelectedPhoto({ id: 'default5', url: publicAsset('photo5.jpg'), name: 'photo5' })}
              >
                <img src={publicAsset('photo5.jpg')} alt="Beach" className="w-full h-full object-cover" />
              </div>    
              <div 
                className="aspect-square rounded-xl overflow-hidden cursor-pointer hover:opacity-90 transition-opacity"
                onClick={() => setSelectedPhoto({ id: 'default6', url: publicAsset('photo6.jpg'), name: 'photo6' })}
              >
                <img src={publicAsset('photo6.jpg')} alt="Beach" className="w-full h-full object-cover" />
              </div>   
              <div 
                className="aspect-square rounded-xl overflow-hidden cursor-pointer hover:opacity-90 transition-opacity"
                onClick={() => setSelectedPhoto({ id: 'default7', url: publicAsset('photo7.jpg'), name: 'photo7' })}
              >
                <img src={publicAsset('photo7.jpg')} alt="Beach" className="w-full h-full object-cover" />
              </div>    
              <div 
                className="aspect-square rounded-xl overflow-hidden cursor-pointer hover:opacity-90 transition-opacity"
                onClick={() => setSelectedPhoto({ id: 'default8', url: publicAsset('photo8.jpg'), name: 'photo8' })}
              >
                <img src={publicAsset('photo8.jpg')} alt="Beach" className="w-full h-full object-cover" />
              </div>                      
            </div>
          </div>
        </section>

        {/* RSVP Section */}
        <section id="rsvp" className="py-20 md:py-32 px-4 bg-white/50">
          <div className="max-w-2xl mx-auto">
            <div className="text-center mb-12">
              <Calendar className="w-6 h-6 mx-auto text-rose-400 mb-4" />
              <h2 className="text-4xl md:text-5xl font-script text-stone-800 mb-4">
                RSVP
              </h2>
              <p className="text-stone-500">
                Please respond by {WEDDING_CONFIG.rsvpDeadline}
              </p>
            </div>

            <form onSubmit={handleRSVPSubmit} className="bg-white rounded-2xl shadow-xl p-8 md:p-12">
              <div className="space-y-6">
                <div>
                  <Label htmlFor="name" className="text-stone-700">Full Name *</Label>
                  <Input
                    id="name"
                    value={rsvpData.name}
                    onChange={(e) => setRsvpData({ ...rsvpData, name: e.target.value })}
                    placeholder="Enter your full name"
                    required
                    className="mt-2"
                  />
                </div>

                <div>
                  <Label htmlFor="email" className="text-stone-700">Email (Optional)</Label>
                  <Input
                    id="email"
                    type="email"
                    value={rsvpData.email}
                    onChange={(e) => setRsvpData({ ...rsvpData, email: e.target.value })}
                    placeholder="Enter your email for confirmation"
                    className="mt-2"
                  />
                  <p className="text-xs text-stone-500 mt-1">Leave blank if you don't want email confirmation</p>
                </div>

                <div>
                  <Label className="text-stone-700 mb-3 block">Relationship *</Label>
                  <RadioGroup
                    value={rsvpData.relationship}
                    onValueChange={(value: 'groom' | 'bride') => setRsvpData({ ...rsvpData, relationship: value })}
                    className="flex flex-col sm:flex-row gap-4"
                    required
                  >
                    <div className="flex items-center space-x-2 bg-blue-50 px-4 py-3 rounded-lg border border-blue-100">
                      <RadioGroupItem value="groom" id="groom" />
                      <Label htmlFor="groom" className="cursor-pointer text-stone-700">
                        <span className="font-medium">Groom's / Male Side</span>
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2 bg-rose-50 px-4 py-3 rounded-lg border border-rose-100">
                      <RadioGroupItem value="bride" id="bride" />
                      <Label htmlFor="bride" className="cursor-pointer text-stone-700">
                        <span className="font-medium">Bride's / Female Side</span>
                      </Label>
                    </div>
                  </RadioGroup>
                </div>

                <div>
                  <Label className="text-stone-700 mb-3 block">Will you be attending? *</Label>
                  <RadioGroup
                    value={rsvpData.attending}
                    onValueChange={(value: 'yes' | 'no') => setRsvpData({ ...rsvpData, attending: value })}
                    className="flex gap-6"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="yes" id="yes" />
                      <Label htmlFor="yes" className="cursor-pointer">Joyfully Accept</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="no" id="no" />
                      <Label htmlFor="no" className="cursor-pointer">Regretfully Decline</Label>
                    </div>
                  </RadioGroup>
                </div>

                {rsvpData.attending === 'yes' && (
                  <div>
                    <Label htmlFor="guests" className="text-stone-700">Number of Guests *</Label>
                    <select
                      id="guests"
                      value={rsvpData.guests}
                      onChange={(e) => setRsvpData({ ...rsvpData, guests: e.target.value })}
                      className="w-full mt-2 px-4 py-2 border border-stone-200 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                    >
                      <option value="1">1 Guest</option>
                      <option value="2">2 Guests</option>
                      <option value="3">3 Guests</option>
                      <option value="4">4 Guests</option>
                    </select>
                  </div>
                )}

                <div>
                  <Label htmlFor="message" className="text-stone-700">Message for the Couple</Label>
                  <Textarea
                    id="message"
                    value={rsvpData.message}
                    onChange={(e) => setRsvpData({ ...rsvpData, message: e.target.value })}
                    placeholder="Share your well wishes..."
                    rows={4}
                    className="mt-2"
                  />
                </div>

                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-rose-500 hover:bg-rose-600 text-white py-6 text-lg rounded-xl"
                >
                  {isSubmitting ? (
                    <span className="flex items-center gap-2">
                      <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Submitting...
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      <Check className="w-5 h-5" />
                      Submit RSVP
                    </span>
                  )}
                </Button>
              </div>
            </form>
          </div>
        </section>

        {/* Footer */}
        <footer className="py-12 px-4 bg-stone-900 text-white">
          <div className="max-w-4xl mx-auto text-center">
            <Heart className="w-8 h-8 mx-auto text-rose-400 mb-4" fill="currentColor" />
            <h3 className="font-script text-3xl mb-4">
              {WEDDING_CONFIG.coupleNames.partner1} & {WEDDING_CONFIG.coupleNames.partner2}
            </h3>
            <p className="text-stone-400 mb-2">{WEDDING_CONFIG.date}</p>
            <p className="text-stone-500 text-sm">
              Made with love for our special day
            </p>
          </div>
        </footer>

        {/* Photo Lightbox */}
        <Dialog open={!!selectedPhoto} onOpenChange={() => setSelectedPhoto(null)}>
          <DialogContent className="max-w-4xl p-0 overflow-hidden bg-black/90 border-none">
            {selectedPhoto && (
              <img 
                src={selectedPhoto.url} 
                alt={selectedPhoto.name}
                className="w-full h-auto max-h-[80vh] object-contain"
              />
            )}
          </DialogContent>
        </Dialog>
      </main>

      <FullScreenEnvelope onOpen={handleEnvelopeOpen} isOpen={envelopeOpened} />
      <BackgroundMusic />
    </>
  );
}

function App() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-rose-50 via-amber-50 to-rose-50">
      <AudioProvider>
        <AppContent />
      </AudioProvider>
    </div>
  );
}

export default App;