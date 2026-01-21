import React, { useEffect, useRef } from 'react'
import './VideoBackground.css'

const VideoBackground = () => {
  const videoRef = useRef(null)

  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    // Auto-play video with multiple fallback attempts
    const startVideo = () => {
      video.muted = true
      video.play().catch(() => {
        // Silent fail - video will start on user interaction
      })
    }

    // Try to start video immediately
    startVideo()

    // Fallback event listeners for user interaction
    const events = ['mousedown', 'keydown', 'touchstart']
    const handleUserInteraction = () => {
      startVideo()
      events.forEach(event => 
        document.removeEventListener(event, handleUserInteraction)
      )
    }

    events.forEach(event => 
      document.addEventListener(event, handleUserInteraction, { once: true })
    )

    return () => {
      events.forEach(event => 
        document.removeEventListener(event, handleUserInteraction)
      )
    }
  }, [])

  return (
    <>
      <video
        ref={videoRef}
        className="bg-video"
        autoPlay
        muted
        loop
        playsInline
        preload="auto"
      >
        <source src="/5452-183788682_small.mp4" type="video/mp4" />
      </video>
      <div className="video-overlay"></div>
      <div className="video-fallback"></div>
    </>
  )
}

export default VideoBackground