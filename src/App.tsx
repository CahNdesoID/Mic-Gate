// @ts-nocheck
// ════════════════════════════════════════════════════════════════
//  Gate Monitor — Hotel Kedaton 8
//  Full Production Build v1.0
//  Stack : React 18 + Vite + HLS.js + Web Audio API + WebRTC
//  Deploy: StackBlitz → Vercel
// ════════════════════════════════════════════════════════════════

// ════ SECTION 1: IMPORTS ════════════════════════════════════════
import { useState, useEffect, useRef, useCallback } from 'react'
declare const Hls: any
const ic = (d:string, opt?:any) => (p:any) => (
  <svg width={p.size||16} height={p.size||16} viewBox="0 0 24 24"
    fill="none" stroke={p.color||"currentColor"}
    strokeWidth={p.strokeWidth||2} strokeLinecap="round" strokeLinejoin="round"
    style={p.style}>
    {opt?.p2 && <path d={opt.p2}/>}<path d={d}/>
  </svg>
)
const Plus      = ic("M12 5v14M5 12h14")
const Pencil    = ic("M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z")
const Trash2    = ic("M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6")
const Mic       = ic("M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3z", {p2:"M19 10v2a7 7 0 0 1-14 0v-2M12 19v4M8 23h8"})
const X         = ic("M18 6 6 18M6 6l12 12")
const AlertCircle = ic("M12 8v4M12 16h.01", {p2:"M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"})
const Wifi      = ic("M5 12.55a11 11 0 0 1 14.08 0M1.42 9a16 16 0 0 1 21.16 0M8.53 16.11a6 6 0 0 1 6.95 0M12 20h.01")
const WifiOff   = ic("M1 1l22 22M16.72 11.06A10.94 10.94 0 0 1 19 12.55M5 12.55a10.94 10.94 0 0 1 5.17-2.39M10.71 5.05A16 16 0 0 1 22.56 9M1.42 9a15.91 15.91 0 0 1 4.7-2.88M8.53 16.11a6 6 0 0 1 6.95 0M12 20h.01")
const Monitor   = ic("M8 21h8M12 17v4", {p2:"M2 3h20a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H2a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1z"})
const Tablet    = ic("M12 18h.01", {p2:"M5 2h14a2 2 0 0 1 2 2v16a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2z"})
const Smartphone= ic("M12 18h.01", {p2:"M5 2h14a2 2 0 0 1 2 2v16a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2z"})
const RefreshCw = ic("M23 4v6h-6M1 20v-6h6M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15")
const Maximize2 = ic("M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7")
const Volume2   = ic("M11 5 6 9H2v6h4l5 4V5zM19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07")
const VolumeX   = ic("M11 5 6 9H2v6h4l5 4V5zM23 9l-6 6M17 9l6 6")

// ════ SECTION 2: GLOBAL STYLES ══════════════════════════════════
const GlobalStyles = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,700;12..96,800&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
    *, *::before, *::after { box-sizing:border-box; margin:0; padding:0; }
    html { height:100%; }
    body {
      height:100%; min-height:100dvh;
      background:#E8E8E8;
      font-family:'Plus Jakarta Sans',sans-serif;
      -webkit-font-smoothing:antialiased;
      overflow-x:hidden;
    }
    #root { min-height:100dvh; }
    .fd { font-family:'Bricolage Grotesque',sans-serif; }
    ::-webkit-scrollbar { width:4px; }
    ::-webkit-scrollbar-track { background:transparent; }
    ::-webkit-scrollbar-thumb { background:#CCCCCC; border-radius:99px; }
    input, textarea { font-family:'Plus Jakarta Sans',sans-serif; }

    @keyframes pulse-ring {
      0%   { transform:translate(-50%,-50%) scale(1);   opacity:.55; }
      100% { transform:translate(-50%,-50%) scale(2.2); opacity:0;   }
    }
    @keyframes live-blink  { 0%,100%{opacity:1} 50%{opacity:.3}  }
    @keyframes conn-blink  { 0%,100%{opacity:1} 50%{opacity:.45} }
    @keyframes slide-up    { from{transform:translateY(48px);opacity:0} to{transform:translateY(0);opacity:1} }
    @keyframes fade-bg     { from{opacity:0} to{opacity:1} }
    @keyframes fade-in     { from{opacity:0;transform:scale(.96)} to{opacity:1;transform:scale(1)} }
    @keyframes tx-dot      { 0%,100%{opacity:1} 50%{opacity:.4} }
    @keyframes spin        { to{transform:rotate(360deg)} }
  `}</style>
)

// ════ SECTION 3: DESIGN TOKENS ══════════════════════════════════
const T = {
  bg:'#E8E8E8', surf:'#FFFFFF', surfD:'#F5F5F5',
  dark:'#111111', mid:'#555555', muted:'#999999',
  border:'#E2E2E2', borderD:'#C8C8C8', chip:'#F3F3F3',
  live:'#16A34A',  liveBg:'#DCFCE7',
  offline:'#DC2626', offBg:'#FEE2E2',
  conn:'#D97706',  connBg:'#FEF3C7',
  idle:'#888888',  idleBg:'#F3F3F3',
}

// ════ SECTION 4: RESPONSIVE HOOK ════════════════════════════════
const getVP = () => {
  const w = window.innerWidth, h = window.innerHeight
  let bp
  if      (w < 480)  bp = 'xs'
  else if (w < 768)  bp = 'sm'
  else if (w < 1024) bp = 'md'
  else if (w < 1280) bp = 'lg'
  else               bp = 'xl'
  return {
    w, h, bp,
    landscape:  w > h,
    isPhone:    w < 768,
    isTablet:   w >= 768 && w < 1024,
    isDesktop:  w >= 1024,
    cols:       w < 600 ? 1 : 2,
    gap:        w < 600 ? 12 : w < 1024 ? 16 : 20,
    pad:        w < 600 ? 14 : w < 1024 ? 18 : 24,
    cardP:      w < 480 ? 14 : w < 768 ? 16 : 20,
    headFS:     w < 480 ? 15 : w < 768 ? 17 : 20,
    labelFS:    w < 480 ? 13 : w < 768 ? 14 : 16,
    metaFS:     w < 480 ? 10 : 11,
    micSz:      w < 480 ? 54 : 48,
    micIcon:    w < 480 ? 22 : 18,
    cardR:      w < 480 ? 18 : 22,
    modalR:     w < 768  ? '20px 20px 0 0' : '22px',
  }
}

const useVP = () => {
  const [vp, setVP] = useState(getVP)
  useEffect(() => {
    const fn = () => setVP(getVP())
    window.addEventListener('resize', fn)
    window.addEventListener('orientationchange', fn)
    return () => {
      window.removeEventListener('resize', fn)
      window.removeEventListener('orientationchange', fn)
    }
  }, [])
  return vp
}

// ════ SECTION 5: HLS AUDIO HOOK ═════════════════════════════════
// Plays the HLS audio stream + creates an AnalyserNode for
// real-time incoming audio visualization on the oscilloscope.
const useHlsAudio = (url) => {
  const [streamStatus, setStreamStatus] = useState('idle')
  const [analyser,     setAnalyser]     = useState(null)
  const hlsRef      = useRef(null)
  const audioRef    = useRef(null)
  const audioCtxRef = useRef(null)
  const retryRef    = useRef(null)

  const cleanup = useCallback(() => {
    clearTimeout(retryRef.current)
    hlsRef.current?.destroy()
    hlsRef.current = null
    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current.src = ''
      audioRef.current = null
    }
    audioCtxRef.current?.close().catch(() => {})
    audioCtxRef.current = null
    setAnalyser(null)
  }, [])

  const connect = useCallback(() => {
    if (!url) { setStreamStatus('idle'); return }
    cleanup()
    setStreamStatus('connecting')

    const audio = new Audio()
    audio.crossOrigin = 'anonymous'
    audio.volume = 1
    audioRef.current = audio

    // Web Audio pipeline: audio element → analyser → speakers
    const resumeCtx = () => {
      try {
        const ctx  = new (window.AudioContext || window.webkitAudioContext)()
        const node = ctx.createAnalyser()
        node.fftSize = 2048
        node.smoothingTimeConstant = 0.82
        const src = ctx.createMediaElementSource(audio)
        src.connect(node)
        node.connect(ctx.destination)
        audioCtxRef.current = ctx
        setAnalyser(node)
      } catch (e) {
        console.warn('[HLS] AudioContext failed:', e)
      }
    }

    if (Hls.isSupported()) {
      const hls = new Hls({
        lowLatencyMode: true,
        backBufferLength: 10,
        maxBufferLength: 10,
        liveSyncDurationCount: 2,
        enableWorker: true,
      })
      hlsRef.current = hls
      hls.loadSource(url)
      hls.attachMedia(audio)

      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        resumeCtx()
        audio.play().catch(() => {})
        setStreamStatus('live')
      })

      hls.on(Hls.Events.ERROR, (_, data) => {
        if (data.fatal) {
          setStreamStatus('offline')
          // auto-retry after 5s
          retryRef.current = setTimeout(connect, 5000)
        }
      })
    } else if (audio.canPlayType('application/vnd.apple.mpegurl')) {
      // Safari native HLS
      audio.src = url
      audio.addEventListener('loadedmetadata', () => {
        resumeCtx()
        audio.play().catch(() => {})
        setStreamStatus('live')
      }, { once: true })
      audio.addEventListener('error', () => {
        setStreamStatus('offline')
        retryRef.current = setTimeout(connect, 5000)
      }, { once: true })
    } else {
      setStreamStatus('offline')
    }
  }, [url, cleanup])

  useEffect(() => {
    connect()
    return cleanup
  }, [connect])

  return { streamStatus, analyser, reconnect: connect }
}

// ════ SECTION 6: WEBRTC PUSH-TO-TALK HOOK ═══════════════════════
// Sends microphone audio TO the camera via go2rtc WebRTC endpoint.
// go2rtc then forwards the audio to the camera via RTSP backchannel.
const useWebRTCTalk = () => {
  const pcRef = useRef(null)

  // Extract go2rtc base URL + stream name from HLS URL
  const parseGo2rtc = (hlsUrl) => {
    try {
      const u   = new URL(hlsUrl)
      const base = `${u.protocol}//${u.host}`
      const src  = u.searchParams.get('src') || 'stream'
      return { base, src }
    } catch { return null }
  }

  const startTalk = useCallback(async (hlsUrl, micStream) => {
    const info = parseGo2rtc(hlsUrl)
    if (!info || !micStream) return

    try {
      // Close any existing connection
      pcRef.current?.close()

      const pc = new RTCPeerConnection({ iceServers: [] })
      pcRef.current = pc

      // Add microphone audio tracks
      micStream.getAudioTracks().forEach(track => {
        pc.addTrack(track, micStream)
      })

      // Create SDP offer (audio-only transmit)
      const offer = await pc.createOffer({
        offerToReceiveAudio: false,
        offerToReceiveVideo: false,
      })
      await pc.setLocalDescription(offer)

      // Wait for ICE gathering (max 3 seconds)
      await new Promise((resolve) => {
        if (pc.iceGatheringState === 'complete') { resolve(); return }
        const check = () => {
          if (pc.iceGatheringState === 'complete') resolve()
        }
        pc.addEventListener('icegatheringstatechange', check)
        setTimeout(resolve, 3000)
      })

      // POST SDP offer to go2rtc WebRTC endpoint
      const endpoint = `${info.base}/api/webrtc?src=${info.src}`
      const res = await fetch(endpoint, {
        method:  'POST',
        headers: { 'Content-Type': 'application/sdp' },
        body:    pc.localDescription.sdp,
      })

      if (!res.ok) throw new Error(`go2rtc returned HTTP ${res.status}`)

      const answerSdp = await res.text()
      await pc.setRemoteDescription({ type: 'answer', sdp: answerSdp })

      console.log('[WebRTC] PTT connected to', info.src)
    } catch (err) {
      console.error('[WebRTC] PTT failed:', err)
      pcRef.current?.close()
      pcRef.current = null
    }
  }, [])

  const stopTalk = useCallback(() => {
    pcRef.current?.close()
    pcRef.current = null
    console.log('[WebRTC] PTT stopped')
  }, [])

  useEffect(() => () => { pcRef.current?.close() }, [])

  return { startTalk, stopTalk }
}

// ════ SECTION 7: OSCILLOSCOPE SOUNDWAVE ═════════════════════════
const SoundwaveArea = ({ status, micActive, analyser }) => {
  const canvasRef = useRef(null)
  const animRef   = useRef(null)
  const tRef      = useRef(0)
  const sizeRef   = useRef({ w: 0, h: 0 })

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const dpr = window.devicePixelRatio || 1
    const ro  = new ResizeObserver(entries => {
      const { width, height } = entries[0].contentRect
      canvas.width  = Math.round(width  * dpr)
      canvas.height = Math.round(height * dpr)
      sizeRef.current = { w: width, h: height }
    })
    ro.observe(canvas)

    const ctx = canvas.getContext('2d')

    const drawGrid = (W, H) => {
      ctx.save()
      ctx.strokeStyle = 'rgba(255,255,255,0.045)'
      ctx.lineWidth = 1
      for (let i = 1; i < 4; i++) {
        ctx.beginPath()
        ctx.moveTo(0, H * i / 4)
        ctx.lineTo(W, H * i / 4)
        ctx.stroke()
      }
      for (let i = 1; i < 8; i++) {
        ctx.beginPath()
        ctx.moveTo(W * i / 8, 0)
        ctx.lineTo(W * i / 8, H)
        ctx.stroke()
      }
      ctx.restore()

      // centre axis dashed
      ctx.save()
      ctx.strokeStyle = 'rgba(255,255,255,0.07)'
      ctx.lineWidth = 1
      ctx.setLineDash([4, 6])
      ctx.beginPath()
      ctx.moveTo(0, H / 2)
      ctx.lineTo(W, H / 2)
      ctx.stroke()
      ctx.setLineDash([])
      ctx.restore()
    }

    const draw = () => {
      const { w: W, h: H } = sizeRef.current
      if (!W || !H) { animRef.current = requestAnimationFrame(draw); return }

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      ctx.clearRect(0, 0, W, H)

      const cy = H / 2
      const t  = tRef.current

      drawGrid(W, H)

      ctx.save()
      ctx.lineCap  = 'round'
      ctx.lineJoin = 'round'

      if (status === 'offline' || status === 'idle' || status === 'connecting') {
        // ── FLATLINE + static noise ──
        ctx.strokeStyle = status === 'connecting'
          ? 'rgba(255,255,255,0.22)'
          : 'rgba(255,255,255,0.17)'
        ctx.lineWidth = 1.5

        if (status === 'connecting') {
          // scanning line effect
          const scanX = ((t * 60) % W)
          const grad = ctx.createLinearGradient(0, 0, W, 0)
          grad.addColorStop(Math.max(0, (scanX - 60) / W), 'rgba(255,255,255,0.08)')
          grad.addColorStop(Math.min(1, scanX / W),        'rgba(255,255,255,0.55)')
          grad.addColorStop(Math.min(1, (scanX + 20) / W), 'rgba(255,255,255,0.08)')
          ctx.strokeStyle = grad
        }

        ctx.beginPath()
        ctx.moveTo(0, cy)
        for (let x = 1; x < W; x++) {
          const noise = (Math.random() - 0.5) * (status === 'offline' ? 1.8 : 0.4)
          ctx.lineTo(x, cy + noise)
        }
        ctx.stroke()

      } else if (micActive && analyser) {
        // ── REAL MIC INPUT via AnalyserNode ──
        const buf  = analyser.frequencyBinCount
        const data = new Uint8Array(buf)
        analyser.getByteTimeDomainData(data)

        ctx.strokeStyle = 'rgba(255,255,255,0.95)'
        ctx.lineWidth   = 2.2
        ctx.shadowColor = 'rgba(255,255,255,0.5)'
        ctx.shadowBlur  = 12

        ctx.beginPath()
        for (let i = 0; i < buf; i++) {
          const x = (i / buf) * W
          const v = (data[i] / 128.0) - 1.0
          const y = cy + v * (H * 0.42)
          i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y)
        }
        ctx.stroke()

      } else if (micActive) {
        // ── SYNTHETIC "TALKING" WAVE (fallback) ──
        ctx.strokeStyle = 'rgba(255,255,255,0.9)'
        ctx.lineWidth   = 2.2
        ctx.shadowColor = 'rgba(255,255,255,0.4)'
        ctx.shadowBlur  = 10

        ctx.beginPath()
        for (let x = 0; x < W; x++) {
          const p = x / W
          const y = cy
            + Math.sin(p * Math.PI * 9  + t * 3.8) * (H * 0.26)
            + Math.sin(p * Math.PI * 22 + t * 5.5) * (H * 0.10)
            + Math.sin(p * Math.PI * 4  + t * 1.9) * (H * 0.17)
            + Math.sin(p * Math.PI * 40 + t * 7.2) * (H * 0.04)
          x === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y)
        }
        ctx.stroke()
        tRef.current += 0.09

      } else if (analyser) {
        // ── REAL INCOMING AUDIO (HLS stream) ──
        const buf  = analyser.frequencyBinCount
        const data = new Uint8Array(buf)
        analyser.getByteTimeDomainData(data)

        ctx.strokeStyle = 'rgba(255,255,255,0.68)'
        ctx.lineWidth   = 1.8
        ctx.shadowColor = 'rgba(255,255,255,0.2)'
        ctx.shadowBlur  = 6

        ctx.beginPath()
        for (let i = 0; i < buf; i++) {
          const x = (i / buf) * W
          const v = (data[i] / 128.0) - 1.0
          const y = cy + v * (H * 0.40)
          i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y)
        }
        ctx.stroke()
        tRef.current += 0.005

      } else {
        // ── LIVE — synthetic calm receiving wave ──
        ctx.strokeStyle = 'rgba(255,255,255,0.55)'
        ctx.lineWidth   = 1.8
        ctx.shadowColor = 'rgba(255,255,255,0.15)'
        ctx.shadowBlur  = 5

        ctx.beginPath()
        for (let x = 0; x < W; x++) {
          const p = x / W
          const y = cy
            + Math.sin(p * Math.PI * 6   + t)         * (H * 0.13)
            + Math.sin(p * Math.PI * 14  + t * 1.55)  * (H * 0.07)
            + Math.sin(p * Math.PI * 3   + t * 0.52)  * (H * 0.10)
            + Math.sin(p * Math.PI * 24  + t * 2.4)   * (H * 0.03)
            + Math.sin(p * Math.PI * 1.5 + t * 0.28)  * (H * 0.06)
          x === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y)
        }
        ctx.stroke()
        tRef.current += 0.028
      }

      ctx.restore()
      animRef.current = requestAnimationFrame(draw)
    }

    draw()
    return () => {
      cancelAnimationFrame(animRef.current)
      ro.disconnect()
    }
  }, [status, micActive, analyser])

  const isLive = status === 'live'

  return (
    <div style={{
      width: '100%', aspectRatio: '16/9', borderRadius: 14,
      overflow: 'hidden', position: 'relative',
      background: isLive ? '#161616' : '#1e1e1e',
    }}>
      {/* scanlines */}
      <div style={{
        position: 'absolute', inset: 0, zIndex: 3, pointerEvents: 'none',
        background: 'repeating-linear-gradient(to bottom,transparent 0,transparent 3px,rgba(0,0,0,.055) 3px,rgba(0,0,0,.055) 4px)',
      }}/>
      {/* vignette */}
      <div style={{
        position: 'absolute', inset: 0, zIndex: 4, pointerEvents: 'none',
        background: 'radial-gradient(ellipse at center,transparent 45%,rgba(0,0,0,.55) 100%)',
      }}/>
      {/* canvas */}
      <canvas ref={canvasRef} style={{
        position: 'absolute', inset: 0, zIndex: 2,
        width: '100%', height: '100%',
      }}/>

      {/* connecting label */}
      {status === 'connecting' && (
        <div style={{
          position: 'absolute', top: '50%', left: '50%',
          transform: 'translate(-50%,-50%)', zIndex: 5,
          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8,
        }}>
          <div style={{ width: 18, height: 18, borderRadius: '50%',
            border: '2px solid rgba(255,255,255,.15)',
            borderTopColor: 'rgba(255,255,255,.6)',
            animation: 'spin .8s linear infinite',
          }}/>
          <span style={{ fontFamily: 'monospace', fontSize: 9, letterSpacing: '.2em',
            color: 'rgba(255,255,255,.3)', textTransform: 'uppercase' }}>
            CONNECTING
          </span>
        </div>
      )}

      {/* offline / idle label */}
      {(status === 'offline' || status === 'idle') && (
        <div style={{
          position: 'absolute', top: '50%', left: '50%',
          transform: 'translate(-50%,-50%)', zIndex: 5,
        }}>
          <span style={{ fontFamily: 'monospace', fontSize: 9, letterSpacing: '.2em',
            color: 'rgba(255,255,255,.2)', textTransform: 'uppercase' }}>
            {status === 'offline' ? 'NO SIGNAL' : 'IDLE'}
          </span>
        </div>
      )}

      {/* bottom-left TX/RX tag */}
      {isLive && (
        <div style={{
          position: 'absolute', bottom: 8, left: 10, zIndex: 5,
          display: 'flex', alignItems: 'center', gap: 5,
        }}>
          <div style={{
            width: 5, height: 5, borderRadius: '50%',
            background: micActive ? '#ffffff' : 'rgba(255,255,255,.35)',
            animation: micActive ? 'tx-dot .55s infinite' : 'none',
          }}/>
          <span style={{
            fontFamily: 'monospace', fontSize: 9, letterSpacing: '.1em',
            color: micActive ? 'rgba(255,255,255,.75)' : 'rgba(255,255,255,.32)',
          }}>
            {micActive ? 'TX · TRANSMITTING' : 'RX · RECEIVING'}
          </span>
        </div>
      )}

      {/* top-right scope label */}
      <div style={{
        position: 'absolute', top: 8, right: 10, zIndex: 5,
        fontFamily: 'monospace', fontSize: 8, letterSpacing: '.12em',
        color: 'rgba(255,255,255,.18)',
      }}>
        OSCILLOSCOPE
      </div>
    </div>
  )
}

// ════ SECTION 8: UI ATOMS ═══════════════════════════════════════
const Card = ({ children, style = {}, onClick, p = 20, radius = 22 }) => {
  const [hov, setHov] = useState(false)
  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        background: T.surf, borderRadius: radius, padding: p,
        boxShadow: hov
          ? '0 14px 44px rgba(0,0,0,.11), 0 3px 10px rgba(0,0,0,.06)'
          : '0 2px 16px rgba(0,0,0,.07), 0 1px 3px rgba(0,0,0,.04)',
        transition: 'box-shadow .25s, transform .25s',
        transform: hov && onClick ? 'translateY(-2px)' : 'none',
        cursor: onClick ? 'pointer' : 'default',
        ...style,
      }}
    >
      {children}
    </div>
  )
}

const StatusBadge = ({ status, fs = 10 }) => {
  const map = {
    live:       { label: '● LIVE',       bg: T.liveBg, color: T.live,    anim: 'live-blink 2s infinite' },
    connecting: { label: '◌ CONNECTING', bg: T.connBg, color: T.conn,    anim: 'conn-blink .8s infinite' },
    offline:    { label: '✕ OFFLINE',    bg: T.offBg,  color: T.offline, anim: 'none' },
    idle:       { label: '— IDLE',       bg: T.idleBg, color: T.idle,    anim: 'none' },
  }
  const s = map[status] || map.idle
  return (
    <span style={{
      background: s.bg, color: s.color, fontSize: fs, fontWeight: 800,
      letterSpacing: '.1em', padding: '3px 9px', borderRadius: 99,
      animation: s.anim, fontFamily: 'monospace', whiteSpace: 'nowrap',
    }}>
      {s.label}
    </span>
  )
}

const MicButton = ({ active, onStart, onEnd, disabled, sz = 48, iconSz = 18 }) => (
  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, position: 'relative' }}>
    {active && (
      <div style={{
        position: 'absolute', top: '50%', left: '50%',
        width: sz, height: sz, borderRadius: '50%',
        background: 'rgba(17,17,17,.13)',
        animation: 'pulse-ring .9s ease-out infinite',
        pointerEvents: 'none',
      }}/>
    )}
    <button
      onMouseDown={onStart}
      onMouseUp={onEnd}
      onTouchStart={e => { e.preventDefault(); onStart() }}
      onTouchEnd={e   => { e.preventDefault(); onEnd()   }}
      onMouseLeave={e => { if (active) onEnd() }}
      disabled={disabled}
      style={{
        width: sz, height: sz, borderRadius: '50%',
        border: active ? 'none' : `2px solid ${T.borderD}`,
        background: active ? T.dark : T.surf,
        color: active ? '#fff' : T.mid,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        cursor: disabled ? 'not-allowed' : 'pointer',
        transition: 'all .15s', outline: 'none', flexShrink: 0,
        boxShadow: active ? '0 4px 22px rgba(0,0,0,.28)' : '0 1px 4px rgba(0,0,0,.08)',
        opacity: disabled ? .35 : 1,
        WebkitTapHighlightColor: 'transparent',
        userSelect: 'none',
      }}
    >
      <Mic size={iconSz} strokeWidth={active ? 2.5 : 1.8}/>
    </button>
    <span style={{
      fontSize: 9, fontWeight: 700, letterSpacing: '.1em', textTransform: 'uppercase',
      color: active ? T.dark : T.muted, userSelect: 'none',
    }}>
      {active ? 'TALKING…' : disabled ? 'OFFLINE' : 'HOLD MIC'}
    </span>
  </div>
)

const IconBtn = ({ icon: Icon, onClick, danger = false, sz = 32, title = '' }) => {
  const [hov, setHov] = useState(false)
  return (
    <button
      onClick={onClick}
      title={title}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        width: sz, height: sz, borderRadius: sz * 0.32, flexShrink: 0,
        border: `1.5px solid ${hov && danger ? '#FECACA' : hov ? T.borderD : T.border}`,
        background: hov && danger ? '#FEE2E2' : hov ? T.chip : 'transparent',
        color: hov && danger ? T.offline : hov ? T.dark : T.mid,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        cursor: 'pointer', transition: 'all .15s', outline: 'none',
        WebkitTapHighlightColor: 'transparent',
      }}
    >
      <Icon size={sz * 0.43} strokeWidth={2}/>
    </button>
  )
}

// ════ SECTION 9: CAMERA CARD ═════════════════════════════════════
const CameraCard = ({
  cam, vp, onEdit, onDelete, onReconnect,
  analyser, micActive, onMicStart, onMicEnd,
}) => {
  const { cardP, cardR, labelFS, metaFS, micSz, micIcon, isPhone } = vp

  const handleFullscreen = () => {
    const el = document.getElementById(`card-${cam.id}`)
    if (!el) return
    if (document.fullscreenElement) document.exitFullscreen()
    else el.requestFullscreen?.()
  }

  return (
    <div
      id={`card-${cam.id}`}
      style={{
        background: T.surf,
        borderRadius: cardR,
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: '0 2px 16px rgba(0,0,0,.07), 0 1px 3px rgba(0,0,0,.04)',
      }}
    >
      {/* ── top bar ── */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: `${cardP * 0.7}px ${cardP}px`,
        borderBottom: `1px solid ${T.border}`,
      }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4, minWidth: 0, flex: 1, marginRight: 8 }}>
          <span className="fd" style={{
            fontSize: labelFS, fontWeight: 800, color: T.dark,
            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
          }}>
            {cam.label}
          </span>
          <div style={{ display: 'flex', alignItems: 'center', gap: 7, flexWrap: 'wrap' }}>
            <StatusBadge status={cam.status} fs={metaFS}/>
            <span style={{ fontFamily: 'monospace', fontSize: metaFS, color: T.muted, letterSpacing: '.06em' }}>
              {cam.id}
            </span>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 5, flexShrink: 0 }}>
          {cam.status === 'offline' && (
            <IconBtn icon={RefreshCw} onClick={onReconnect} sz={isPhone ? 34 : 30} title="Reconnect"/>
          )}
          <IconBtn icon={Maximize2} onClick={handleFullscreen} sz={isPhone ? 34 : 30} title="Fullscreen"/>
          <IconBtn icon={Pencil}    onClick={onEdit}          sz={isPhone ? 34 : 30} title="Edit"/>
          <IconBtn icon={Trash2}    onClick={onDelete}  danger sz={isPhone ? 34 : 30} title="Delete"/>
        </div>
      </div>

      {/* ── oscilloscope ── */}
      <div style={{ padding: `${cardP * 0.6}px ${cardP}px 0` }}>
        <SoundwaveArea
          status={cam.status}
          micActive={micActive}
          analyser={analyser}
        />
      </div>

      {/* ── stream url pill ── */}
      <div style={{ padding: `${cardP * 0.45}px ${cardP}px 0` }}>
        <div style={{
          background: T.chip, borderRadius: 10, padding: '6px 10px',
          display: 'flex', alignItems: 'center', gap: 6,
        }}>
          {cam.url
            ? <Wifi    size={10} color={T.muted} strokeWidth={2} style={{ flexShrink: 0 }}/>
            : <WifiOff size={10} color={T.muted} strokeWidth={2} style={{ flexShrink: 0 }}/>
          }
          <span style={{
            fontFamily: 'monospace', fontSize: 9, color: T.muted,
            whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', flex: 1,
          }}>
            {cam.url || '— no stream configured —'}
          </span>
        </div>
      </div>

      {/* ── divider + mic ── */}
      <div style={{
        borderTop: `1px solid ${T.border}`,
        margin: `${cardP * 0.7}px 0 0`,
        padding: `${cardP * 0.8}px ${cardP}px ${cardP}px`,
        display: 'flex', justifyContent: 'center',
      }}>
        <MicButton
          active={micActive}
          onStart={onMicStart}
          onEnd={onMicEnd}
          disabled={cam.status !== 'live'}
          sz={micSz}
          iconSz={micIcon}
        />
      </div>
    </div>
  )
}

// ════ SECTION 10: CAMERA STREAM WRAPPER ═════════════════════════
// Each camera manages its own HLS instance via this wrapper.
// This is the correct pattern for per-item React hooks.
const CameraStream = ({ cam, vp, onEdit, onDelete, micActive, micAnalyser, onMicStart, onMicEnd }) => {
  const { streamStatus, analyser: incomingAnalyser, reconnect } = useHlsAudio(cam.url)

  const effectiveStatus = cam.url ? streamStatus : 'idle'
  const effectiveCam    = { ...cam, status: effectiveStatus }

  // When talking: show mic analyser; otherwise show incoming audio analyser
  const activeAnalyser  = micActive ? micAnalyser : incomingAnalyser

  return (
    <CameraCard
      cam={effectiveCam}
      vp={vp}
      onEdit={onEdit}
      onDelete={onDelete}
      onReconnect={reconnect}
      analyser={activeAnalyser}
      micActive={micActive}
      onMicStart={() => onMicStart(cam.id, cam.url)}
      onMicEnd={onMicEnd}
    />
  )
}

// ════ SECTION 11: MODALS ════════════════════════════════════════
const CamModal = ({ show, cam, onClose, onSave, vp }) => {
  const [label,   setLabel]   = useState('')
  const [url,     setUrl]     = useState('')
  const [rtspWarn, setRtspWarn] = useState(false)

  useEffect(() => {
    if (show) { setLabel(cam?.label || ''); setUrl(cam?.url || ''); setRtspWarn(false) }
  }, [show])

  const handleUrlChange = (val) => {
    setUrl(val)
    setRtspWarn(val.trim().toLowerCase().startsWith('rtsp://'))
  }

  if (!show) return null
  const { pad, headFS, isPhone, modalR } = vp

  return (
    <div
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
      style={{
        position: 'fixed', inset: 0, zIndex: 200,
        background: 'rgba(0,0,0,.4)', backdropFilter: 'blur(6px)',
        display: 'flex',
        alignItems:     isPhone ? 'flex-end' : 'center',
        justifyContent: 'center',
        padding: isPhone ? 0 : 20,
        animation: 'fade-bg .2s ease',
      }}
    >
      <div style={{
        width: '100%', maxWidth: isPhone ? '100%' : 500,
        background: T.surf, borderRadius: modalR,
        padding: `${pad + 8}px ${pad + 4}px ${isPhone ? 40 : pad + 8}px`,
        animation: 'slide-up .28s cubic-bezier(.34,1.3,.64,1)',
        maxHeight: isPhone ? '92dvh' : 'auto', overflowY: 'auto',
      }}>
        {isPhone && (
          <div style={{ width: 38, height: 4, borderRadius: 99, background: T.border, margin: '0 auto 20px' }}/>
        )}
        {/* header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
          <span className="fd" style={{ fontSize: headFS, fontWeight: 800, color: T.dark }}>
            {cam ? 'Edit Camera' : 'Add Camera'}
          </span>
          {!isPhone && (
            <button onClick={onClose} style={{
              background: T.chip, border: `1px solid ${T.border}`, borderRadius: 99,
              width: 30, height: 30, display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', color: T.mid,
            }}><X size={14} strokeWidth={2}/></button>
          )}
        </div>

        {/* label */}
        <label style={{ fontSize: 11, fontWeight: 700, color: T.muted, letterSpacing: '.08em',
          textTransform: 'uppercase', display: 'block', marginBottom: 6 }}>
          Camera Label
        </label>
        <input
          value={label}
          onChange={e => setLabel(e.target.value)}
          placeholder="e.g. GATE KASIR"
          style={{
            width: '100%', padding: '12px 14px', borderRadius: 14, marginBottom: 16,
            border: `1.5px solid ${T.border}`, background: T.chip,
            fontSize: 14, fontWeight: 600, color: T.dark, outline: 'none',
          }}
          onFocus={e  => e.target.style.borderColor = T.dark}
          onBlur={e   => e.target.style.borderColor = T.border}
        />

        {/* HLS url */}
        <label style={{ fontSize: 11, fontWeight: 700, color: T.muted, letterSpacing: '.08em',
          textTransform: 'uppercase', display: 'block', marginBottom: 6 }}>
          HLS Stream URL (.m3u8)
        </label>
        <input
          value={url}
          onChange={e => handleUrlChange(e.target.value)}
          placeholder="http://192.168.x.x:1984/api/stream.m3u8?src=gate_kasir"
          style={{
            width: '100%', padding: '12px 14px', borderRadius: 14, marginBottom: 8,
            border: `1.5px solid ${rtspWarn ? '#FCD34D' : T.border}`, background: T.chip,
            fontSize: 11, fontWeight: 500, color: T.dark, outline: 'none', fontFamily: 'monospace',
          }}
          onFocus={e  => e.target.style.borderColor = rtspWarn ? '#FCD34D' : T.dark}
          onBlur={e   => e.target.style.borderColor = rtspWarn ? '#FCD34D' : T.border}
        />

        {/* RTSP warning */}
        {rtspWarn && (
          <div style={{
            background: '#FFFBEB', border: '1px solid #FCD34D', borderRadius: 12,
            padding: '10px 12px', marginBottom: 16,
          }}>
            <p style={{ fontSize: 11, fontWeight: 700, color: '#92400E', marginBottom: 4 }}>
              ⚠ RTSP terdeteksi — browser tidak bisa memutar RTSP langsung
            </p>
            <p style={{ fontSize: 11, color: '#B45309', lineHeight: 1.65 }}>
              Masukkan URL RTSP ini ke <code style={{ background: '#FEF3C7', padding: '1px 4px',
                borderRadius: 3, fontSize: 10 }}>go2rtc.yaml</code>, lalu gunakan URL HLS-nya di sini:<br/>
              <code style={{ fontFamily: 'monospace', fontSize: 10, color: '#92400E' }}>
                http://[IP_SERVER]:1984/api/stream.m3u8?src=[nama]
              </code>
            </p>
          </div>
        )}

        {!rtspWarn && (
          <p style={{ fontSize: 11, color: T.muted, marginBottom: 22, lineHeight: 1.65 }}>
            Butuh <strong style={{ color: T.dark }}>go2rtc</strong> running di PC lokal.
            {' '}Format: <code style={{ fontFamily: 'monospace', background: T.chip,
              padding: '1px 5px', borderRadius: 4, fontSize: 10 }}>
              http://[IP]:1984/api/stream.m3u8?src=[nama]
            </code>
          </p>
        )}

        {/* actions */}
        <div style={{ display: 'flex', gap: 10 }}>
          <button onClick={onClose} style={{
            flex: 1, padding: '13px 0', borderRadius: 14,
            border: `1.5px solid ${T.border}`, background: 'transparent',
            fontSize: 14, fontWeight: 700, color: T.mid, cursor: 'pointer',
          }}>
            Cancel
          </button>
          <button
            onClick={() => { if (label.trim() || url.trim()) onSave({ label, url }) }}
            style={{
              flex: 2, padding: '13px 0', borderRadius: 14, border: 'none',
              background: T.dark, color: '#fff', fontSize: 14, fontWeight: 700,
              cursor: 'pointer', boxShadow: '0 4px 16px rgba(0,0,0,.2)',
            }}
          >
            {cam ? 'Save Changes' : 'Add Camera'}
          </button>
        </div>
      </div>
    </div>
  )
}

const DeleteConfirm = ({ cam, onConfirm, onCancel }) => (
  <div
    onClick={e => { if (e.target === e.currentTarget) onCancel() }}
    style={{
      position: 'fixed', inset: 0, zIndex: 200,
      background: 'rgba(0,0,0,.4)', backdropFilter: 'blur(6px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: 20, animation: 'fade-bg .15s ease',
    }}
  >
    <Card p={28} radius={22} style={{ width: '100%', maxWidth: 340, animation: 'fade-in .2s ease' }}>
      <div style={{ textAlign: 'center', marginBottom: 22 }}>
        <div style={{
          width: 52, height: 52, borderRadius: 16, background: '#FEE2E2',
          display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px',
        }}>
          <Trash2 size={22} color={T.offline} strokeWidth={2}/>
        </div>
        <p className="fd" style={{ fontSize: 18, fontWeight: 800, color: T.dark, marginBottom: 6 }}>
          Hapus Kamera?
        </p>
        <p style={{ fontSize: 13, color: T.mid, lineHeight: 1.6 }}>
          <strong>{cam?.label}</strong> akan dihapus dari dashboard.
        </p>
      </div>
      <div style={{ display: 'flex', gap: 10 }}>
        <button onClick={onCancel} style={{
          flex: 1, padding: '12px 0', borderRadius: 14,
          border: `1.5px solid ${T.border}`, background: 'transparent',
          fontSize: 14, fontWeight: 700, color: T.mid, cursor: 'pointer',
        }}>Batal</button>
        <button onClick={onConfirm} style={{
          flex: 1, padding: '12px 0', borderRadius: 14, border: 'none',
          background: T.offline, color: '#fff', fontSize: 14, fontWeight: 700, cursor: 'pointer',
        }}>Hapus</button>
      </div>
    </Card>
  </div>
)

// ════ SECTION 12: BANNERS & MISC ════════════════════════════════
const MicBanner = ({ onGrant, onDismiss }) => (
  <Card p={16} radius={16} style={{
    background: '#FFFBEB', border: '1.5px solid #E9D8A6',
    display: 'flex', gap: 12, alignItems: 'flex-start',
    animation: 'slide-up .3s ease',
  }}>
    <div style={{
      width: 36, height: 36, borderRadius: 12, background: '#FEF3C7',
      display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
    }}>
      <AlertCircle size={18} color="#D97706" strokeWidth={2}/>
    </div>
    <div style={{ flex: 1, minWidth: 0 }}>
      <p style={{ fontSize: 13, fontWeight: 700, color: '#92400E', marginBottom: 3 }}>
        Izin Mikrofon Diperlukan
      </p>
      <p style={{ fontSize: 12, color: '#B45309', lineHeight: 1.6 }}>
        Untuk Push-to-Talk ke kamera, izinkan akses mikrofon perangkat ini.
      </p>
      <div style={{ display: 'flex', gap: 8, marginTop: 10, flexWrap: 'wrap' }}>
        <button onClick={onGrant} style={{
          padding: '7px 16px', borderRadius: 99, border: 'none',
          background: '#92400E', color: '#fff', fontSize: 12, fontWeight: 700, cursor: 'pointer',
        }}>
          Izinkan Mikrofon
        </button>
        <button onClick={onDismiss} style={{
          padding: '7px 14px', borderRadius: 99, border: '1px solid #D97706',
          background: 'transparent', color: '#92400E', fontSize: 12, fontWeight: 600, cursor: 'pointer',
        }}>
          Nanti
        </button>
      </div>
    </div>
    <button onClick={onDismiss} style={{
      background: 'none', border: 'none', color: '#B45309', cursor: 'pointer', padding: 4, flexShrink: 0,
    }}>
      <X size={14}/>
    </button>
  </Card>
)

const EmptyState = ({ onAdd }) => (
  <Card p={48} radius={22} style={{ textAlign: 'center', gridColumn: '1/-1' }}>
    <div style={{
      width: 64, height: 64, borderRadius: 20, background: T.chip,
      display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 18px',
    }}>
      <Mic size={28} color={T.muted} strokeWidth={1.5}/>
    </div>
    <p className="fd" style={{ fontSize: 20, fontWeight: 800, color: T.dark, marginBottom: 7 }}>
      Belum Ada Kamera
    </p>
    <p style={{ fontSize: 13, color: T.muted, lineHeight: 1.65, maxWidth: 280, margin: '0 auto 22px' }}>
      Tambahkan kamera untuk mulai monitoring audio gate hotel.
    </p>
    <button onClick={onAdd} style={{
      padding: '12px 28px', borderRadius: 14, border: 'none',
      background: T.dark, color: '#fff', fontSize: 14, fontWeight: 700,
      cursor: 'pointer', boxShadow: '0 4px 16px rgba(0,0,0,.18)',
    }}>
      + Add Camera
    </button>
  </Card>
)

const DeviceChip = ({ vp }) => {
  const map = {
    xs: { label: 'Phone · Portrait',  Icon: Smartphone },
    sm: { label: 'Phone · Landscape', Icon: Smartphone },
    md: { label: 'Tablet',            Icon: Tablet     },
    lg: { label: 'Laptop',            Icon: Monitor    },
    xl: { label: 'Desktop',           Icon: Monitor    },
  }
  const { label, Icon } = map[vp.bp] || map.xl
  return (
    <div style={{
      display: 'inline-flex', alignItems: 'center', gap: 6,
      background: 'rgba(0,0,0,.07)', borderRadius: 99, padding: '4px 10px 4px 7px',
    }}>
      <Icon size={11} color={T.mid} strokeWidth={2}/>
      <span style={{ fontSize: 10, fontWeight: 700, color: T.mid, letterSpacing: '.06em' }}>
        {label} · {vp.w}×{vp.h}
      </span>
    </div>
  )
}

const InfoBar = ({ cameras }) => {
  const live = cameras.filter(c => c.url).length
  const items = [
    ['Active',   `${live}/${cameras.length}`, T.live  ],
    ['Protocol', 'HLS via go2rtc',            T.dark  ],
    ['Audio TX', 'WebRTC PTT',                T.dark  ],
    ['Waveform', 'Oscilloscope',              T.dark  ],
    ['Network',  'Local LAN',                 T.dark  ],
    ['Timeout',  'None',                      T.live  ],
  ]
  return (
    <Card p={12} radius={14} style={{ background: T.surfD, boxShadow: 'none', border: `1px solid ${T.border}` }}>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px 24px' }}>
        {items.map(([k, v, c]) => (
          <div key={k} style={{ display: 'flex', gap: 5, alignItems: 'center' }}>
            <span style={{ fontSize: 10, color: T.muted, fontWeight: 600 }}>{k}:</span>
            <span style={{ fontSize: 10, color: c, fontWeight: 800, fontFamily: 'monospace' }}>{v}</span>
          </div>
        ))}
      </div>
    </Card>
  )
}

// ════ SECTION 13: APP ROOT ═══════════════════════════════════════
let _camId = 2
const nextId = () => `CAM-${String(++_camId).padStart(2, '0')}`

const STORAGE_KEY = 'kedaton_cameras_v1'

const loadCameras = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) return JSON.parse(raw)
  } catch {}
  return [
    { id: 'CAM-01', label: 'GATE KASIR',     url: '' },
    { id: 'CAM-02', label: 'GATE NON-KASIR', url: '' },
  ]
}

export default function App() {
  const vp = useVP()

  const [cameras,      setCameras]      = useState(loadCameras)
  const [modal,        setModal]        = useState(null)
  const [activeMicId,  setActiveMicId]  = useState(null)
  const [showMicPerm,  setShowMicPerm]  = useState(true)
  const [micGranted,   setMicGranted]   = useState(false)
  const [micAnalyser,  setMicAnalyser]  = useState(null)

  const micStreamRef = useRef(null)
  const { startTalk, stopTalk } = useWebRTCTalk()

  // Persist camera configs
  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(cameras)) } catch {}
  }, [cameras])

  // Request microphone permission + setup AudioContext for mic analyser
  const requestMicPermission = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false })
      const ctx    = new (window.AudioContext || window.webkitAudioContext)()
      const src    = ctx.createMediaStreamSource(stream)
      const node   = ctx.createAnalyser()
      node.fftSize = 2048
      node.smoothingTimeConstant = 0.78
      src.connect(node)
      // NOTE: Do NOT connect node → ctx.destination (avoid hearing yourself)

      micStreamRef.current = stream
      setMicAnalyser(node)
      setMicGranted(true)
      setShowMicPerm(false)

      // Mute tracks until user holds PTT
      stream.getAudioTracks().forEach(t => { t.enabled = false })
    } catch {
      alert('Akses mikrofon ditolak. Cek pengaturan browser.')
    }
  }

  // PTT: start
  const handleMicStart = async (camId, hlsUrl) => {
    if (!micGranted) { setShowMicPerm(true); return }
    // Enable mic track
    micStreamRef.current?.getAudioTracks().forEach(t => { t.enabled = true })
    setActiveMicId(camId)
    // Connect WebRTC to go2rtc for this camera
    if (hlsUrl) await startTalk(hlsUrl, micStreamRef.current)
  }

  // PTT: stop
  const handleMicEnd = () => {
    micStreamRef.current?.getAudioTracks().forEach(t => { t.enabled = false })
    setActiveMicId(null)
    stopTalk()
  }

  // CRUD
  const addCam = ({ label, url }) => {
    const id = nextId()
    setCameras(cs => [...cs, { id, label: label.toUpperCase() || id, url: url.trim() }])
    setModal(null)
  }
  const editCam = ({ label, url }) => {
    setCameras(cs => cs.map(c =>
      c.id === modal.cam.id ? { ...c, label: label.toUpperCase(), url: url.trim() } : c
    ))
    setModal(null)
  }
  const deleteCam = (id) => {
    setCameras(cs => cs.filter(c => c.id !== id))
    setModal(null)
  }

  const { pad, gap, cols, headFS, isPhone } = vp

  return (
    <>
      <GlobalStyles/>
      <div style={{ minHeight: '100dvh', background: T.bg, fontFamily: "'Plus Jakarta Sans',sans-serif" }}>

        {/* ══ HEADER ══ */}
        <div style={{
          background: T.surf,
          borderBottom: `1px solid ${T.border}`,
          boxShadow: '0 2px 16px rgba(0,0,0,.05)',
          padding: `${isPhone ? 12 : 16}px ${pad + 4}px`,
          position: 'sticky', top: 0, zIndex: 100,
        }}>
          <div style={{
            maxWidth: 1200, margin: '0 auto',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12,
          }}>
            {/* logo */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
              <div style={{
                width: isPhone ? 32 : 38, height: isPhone ? 32 : 38,
                borderRadius: isPhone ? 10 : 12, background: T.dark, flexShrink: 0,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <Mic size={isPhone ? 14 : 17} color="#fff" strokeWidth={2}/>
              </div>
              <div style={{ minWidth: 0 }}>
                <div className="fd" style={{
                  fontSize: isPhone ? 15 : headFS, fontWeight: 800, color: T.dark,
                  whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                }}>
                  Gate Monitor
                </div>
                {!isPhone && (
                  <p style={{ fontSize: 11, color: T.muted, fontWeight: 500 }}>
                    Hotel Kedaton 8 · {cameras.length} camera{cameras.length !== 1 ? 's' : ''}
                  </p>
                )}
              </div>
            </div>

            {/* device chip — tablet+ only */}
            {!isPhone && <DeviceChip vp={vp}/>}

            {/* add button */}
            <button
              onClick={() => setModal('add')}
              style={{
                display: 'flex', alignItems: 'center', gap: isPhone ? 0 : 7,
                background: T.dark, color: '#fff', border: 'none',
                borderRadius: isPhone ? 10 : 12,
                padding: isPhone ? '9px 12px' : '9px 18px',
                cursor: 'pointer', fontSize: 13, fontWeight: 700, flexShrink: 0,
                boxShadow: '0 3px 12px rgba(0,0,0,.18)',
                WebkitTapHighlightColor: 'transparent',
              }}
            >
              <Plus size={16} strokeWidth={2.5}/>
              {!isPhone && 'Add Camera'}
            </button>
          </div>
        </div>

        {/* ══ BODY ══ */}
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: `${pad}px ${pad + 4}px ${pad + 24}px` }}>

          {/* mic permission banner */}
          {showMicPerm && !micGranted && (
            <div style={{ marginBottom: gap }}>
              <MicBanner onGrant={requestMicPermission} onDismiss={() => setShowMicPerm(false)}/>
            </div>
          )}

          {/* phone: compact stat pills */}
          {isPhone && cameras.length > 0 && (
            <div style={{ display: 'flex', gap: 8, marginBottom: gap }}>
              {[
                ['Cams',     String(cameras.length), T.dark],
                ['Protocol', 'HLS',                  T.dark],
                ['Audio',    micGranted ? 'PTT ✓' : 'PTT', micGranted ? T.live : T.dark],
              ].map(([k, v, c]) => (
                <div key={k} style={{
                  flex: 1, background: T.surf, borderRadius: 12, padding: '10px 0', textAlign: 'center',
                  boxShadow: '0 1px 6px rgba(0,0,0,.06)',
                }}>
                  <div style={{ fontSize: 14, fontWeight: 800, color: c, fontFamily: 'monospace' }}>{v}</div>
                  <div style={{ fontSize: 9, color: T.muted, fontWeight: 700, marginTop: 2, letterSpacing: '.06em' }}>{k}</div>
                </div>
              ))}
            </div>
          )}

          {/* camera grid */}
          <div style={{ display: 'grid', gridTemplateColumns: `repeat(${cols}, 1fr)`, gap }}>
            {cameras.length === 0
              ? <EmptyState onAdd={() => setModal('add')}/>
              : cameras.map(cam => (
                  <CameraStream
                    key={cam.id}
                    cam={cam}
                    vp={vp}
                    onEdit={() => setModal({ type: 'edit', cam })}
                    onDelete={() => setModal({ type: 'delete', cam })}
                    micActive={activeMicId === cam.id}
                    micAnalyser={activeMicId === cam.id ? micAnalyser : null}
                    onMicStart={handleMicStart}
                    onMicEnd={handleMicEnd}
                  />
                ))
            }
          </div>

          {/* info bar — desktop */}
          {!isPhone && cameras.length > 0 && (
            <div style={{ marginTop: gap }}>
              <InfoBar cameras={cameras}/>
            </div>
          )}

          {/* device chip — phone bottom */}
          {isPhone && (
            <div style={{ marginTop: gap, display: 'flex', justifyContent: 'center' }}>
              <DeviceChip vp={vp}/>
            </div>
          )}
        </div>
      </div>

      {/* ══ MODALS ══ */}
      <CamModal
        show={modal === 'add' || modal?.type === 'edit'}
        cam={modal?.type === 'edit' ? modal.cam : null}
        onClose={() => setModal(null)}
        onSave={modal?.type === 'edit' ? editCam : addCam}
        vp={vp}
      />
      {modal?.type === 'delete' && (
        <DeleteConfirm
          cam={modal.cam}
          onConfirm={() => deleteCam(modal.cam.id)}
          onCancel={() => setModal(null)}
        />
      )}
    </>
  )
}
