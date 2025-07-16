import React, { useState, useRef, useEffect } from 'react';
import { Box, useToast } from '@chakra-ui/react';
import './GoldCoin.css';

// Import sound files
const clickSoundUrl = new URL('/sounds/click.mp3', import.meta.url).href;
const coinSoundUrl = new URL('/sounds/coin.mp3', import.meta.url).href;

const GoldCoin = ({ onEarn, dailyClicks, maxClicks }) => {
  const [isAnimating, setIsAnimating] = useState(false);
  const toast = useToast();
  const [coins, setCoins] = useState([]);
  const coinSound = useRef(null);
  const clickSound = useRef(null);
  const goldCoinAreaRef = useRef(null);

  useEffect(() => {
    // Initialize audio elements
    const initAudio = async () => {
      try {
        // Create and configure audio elements
        coinSound.current = new Audio(coinSoundUrl);
        clickSound.current = new Audio(clickSoundUrl);
        
        // Set volume and preload
        coinSound.current.volume = 0.5;
        clickSound.current.volume = 0.5;
        
        // Preload sounds
        await Promise.all([
          coinSound.current.load(),
          clickSound.current.load()
        ]);
        
        console.log('Audio files loaded successfully');
      } catch (error) {
        console.error('Error loading audio:', error);
      }
    };
    
    initAudio();
    
    // Cleanup function
    return () => {
      if (coinSound.current) {
        coinSound.current.pause();
        coinSound.current = null;
      }
      if (clickSound.current) {
        clickSound.current.pause();
        clickSound.current = null;
      }
    };
  }, []);

  const handleCoinClick = async () => {
    // Check if user has reached daily limit
    if (dailyClicks >= maxClicks) {
      toast({
        title: "Daily Limit Reached",
        description: "You've reached your daily limit for click tasks.",
        status: "warning",
        duration: 5000,
        isClosable: true,
      });
      return;
    }

    if (isAnimating || !goldCoinAreaRef.current) {
      return;
    }
    
    setIsAnimating(true);
    
    // Get the main coin's position relative to the viewport
    const rect = goldCoinAreaRef.current.getBoundingClientRect();
    const startX = rect.left + rect.width / 2;
    const startY = rect.top + rect.height / 2;

    try {
      // Play sounds
      const playSound = async (sound) => {
        if (sound && sound.current) {
          try {
            sound.current.currentTime = 0;
            await sound.current.play();
          } catch (error) {
            console.error('Error playing sound:', error);
          }
        }
      };

      // Play both sounds
      await Promise.all([
        playSound(clickSound),
        playSound(coinSound)
      ]);
      
      await onEarn();
      
      // Create coins for full-screen splash effect
      const newCoins = Array.from({ length: 40 }, (_, i) => { // Increased coin count
        const angle = Math.random() * 2 * Math.PI;
        // Calculate distance needed to potentially reach edge of screen
        const maxDist = Math.max(window.innerWidth, window.innerHeight) * 0.7;
        const distance = 100 + Math.random() * maxDist;
        
        // Calculate end position relative to the start position (center of main coin)
        const endX = Math.cos(angle) * distance;
        const endY = Math.sin(angle) * distance;
        
        const splashRotate = `${Math.random() * 720 - 360}deg`;
        const delay = Math.random() * 0.2;
        const speed = 0.8 + Math.random() * 0.5; // Slightly increased speed

        return {
          id: Date.now() + i,
          startX: `${startX}px`, // Starting X position (center of main coin)
          startY: `${startY}px`, // Starting Y position (center of main coin)
          splashX: `${endX}px`, // End X offset from start
          splashY: `${endY}px`, // End Y offset from start
          splashRotate,
          delay,
          speed
        };
      });
      setCoins(newCoins);
    } catch (error) {
      console.error('Error:', error);
    }
    
    setTimeout(() => {
      setIsAnimating(false);
      setCoins([]);
    }, 1300); // Adjust timeout to match animation duration
  };

  return (
    <>
      <div className="gold-coin-area" ref={goldCoinAreaRef} onClick={handleCoinClick}>
        <div className={`gold-coin ${isAnimating ? 'pulse' : ''}`}>
          <div className="coin-content">
            <div className="coin-text">
              <span className="wealth">Wealth</span>
              <span className="clicks">CLICKS</span>
            </div>
          </div>
        </div>
      </div>

      {/* Splashing coins rendered outside the area, positioned fixed */}
      {coins.map((coin) => (
        <div
          key={coin.id}
          className="coin"
          style={{
            top: coin.startY, // Use specific start position
            left: coin.startX, // Use specific start position
            '--splash-x': coin.splashX,
            '--splash-y': coin.splashY,
            '--splash-rotate': coin.splashRotate,
            '--delay': `${coin.delay}s`,
            '--speed': `${coin.speed}s`,
          }}
        >
          <div className="coin-content">
            <div className="coin-text">
              <span className="wealth">Wealth</span>
              <span className="clicks">CLICKS</span>
            </div>
          </div>
        </div>
      ))}
    </>
  );
};

export default GoldCoin; 