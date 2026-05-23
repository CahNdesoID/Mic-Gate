// @ts-nocheck
import { useState, useEffect, useRef, useCallback } from 'react'
declare const Hls: any

const ic = (d, opt?) => (p: any) => (
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
const Mic       = ic("M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3z",{p2:"M19 10v2a7 7 0 0 1-14 0v-2M12 19v4M8 23h8"})
const X         = ic("M18 6 6 18M6 6l12 12")
const Wifi      = ic("M5 12.55a11 11 0 0 1 14.08 0M1.42 9a16 16 0 0 1 21.16 0M8.53 16.11a6 6 0 0 1 6.95 0M12 20h.01")
const WifiOff   = ic("M1 1l22 22M16.72 11.06A10.94 10.94 0 0 1 19 12.55M5 12.55a10.94 10.94 0 0 1 5.17-2.39M10.71 5.05A16 16 0 0 1 22.56 9M1.42 9a15.91 15.91 0 0 1 4.7-2.88M8.53 16.11a6 6 0 0 1 6.95 0M12 20h.01")
const Monitor   = ic("M8 21h8M12 17v4",{p2:"M2 3h20a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H2a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1z"})
const Tablet    = ic("M12 18h.01",{p2:"M5 2h14a2 2 0 0 1 2 2v16a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2z"})
const Smartphone= ic("M12 18h.01",{p2:"M5 2h14a2 2 0 0 1 2 2v16a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2z"})
const RefreshCw = ic("M23 4v6h-6M1 20v-6h6M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15")
const Maximize2 = ic("M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7")
const Cpu       = ic("M12 12m-3 0a3 3 0 1 0 6 0a3 3 0 1 0-6 0",{p2:"M2 12h3M19 12h3M12 2v3M12 19v3M6.34 6.34l2.12 2.12M15.54 15.54l2.12 2.12M6.34 17.66l2.12-2.12M15.54 8.46l2.12-2.12"})
const Volume2   = ic("M11 5 6 9H2v6h4l5 4V5zM19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07")

// ── STYLES ──────────────────────────────────────────────────────
const GlobalStyles = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,700;12..96,800&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
    *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
    html{height:100%}
    body{height:100%;min-height:100dvh;background:#E8E8E8;font-family:'Plus Jakarta Sans',sans-serif;-webkit-font-smoothing:antialiased;overflow-x:hidden}
    #root{min-height:100dvh}
    .fd{font-family:'Bricolage Grotesque',sans-serif}
    ::-webkit-scrollbar{width:4px}
    ::-webkit-scrollbar-track{background:transparent}
    ::-webkit-scrollbar-thumb{background:#CCCCCC;border-radius:99px}
    input,textarea{font-family:'Plus Jakarta Sans',sans-serif}
    @keyframes live-blink{0%,100%{opacity:1}50%{opacity:.3}}
    @keyframes conn-blink{0%,100%{opacity:1}50%{opacity:.45}}
    @keyframes slide-up{from{transform:translateY(48px);opacity:0}to{transform:translateY(0);opacity:1}}
    @keyframes fade-bg{from{opacity:0}to{opacity:1}}
    @keyframes fade-in{from{opacity:0;transform:scale(.96)}to{opacity:1;transform:scale(1)}}
    @keyframes spin{to{transform:rotate(360deg)}}
    @keyframes ai-pulse{0%,100%{opacity:.4;transform:scale(1)}50%{opacity:1;transform:scale(1.08)}}
    @keyframes eq1{0%,100%{height:4px}50%{height:16px}}
    @keyframes eq2{0%,100%{height:12px}50%{height:4px}}
    @keyframes eq3{0%,100%{height:8px}50%{height:20px}}
  `}</style>
)

// ── TOKENS ──────────────────────────────────────────────────────
const T = {
  bg:'#E8E8E8',surf:'#FFFFFF',surfD:'#F5F5F5',
  dark:'#111111',mid:'#555555',muted:'#999999',
  border:'#E2E2E2',borderD:'#C8C8C8',chip:'#F3F3F3',
  live:'#16A34A',liveBg:'#DCFCE7',
  offline:'#DC2626',offBg:'#FEE2E2',
  conn:'#D97706',connBg:'#FEF3C7',
  idle:'#888888',idleBg:'#F3F3F3',
  ai:'#6366F1',aiBg:'#EEF2FF',
}

// ── RESPONSIVE HOOK ─────────────────────────────────────────────
const getVP = () => {
  const w=window.innerWidth,h=window.innerHeight
  let bp
  if(w<480)bp='xs';else if(w<768)bp='sm';else if(w<1024)bp='md';else if(w<1280)bp='lg';else bp='xl'
  return{
    w,h,bp,landscape:w>h,isPhone:w<768,isTablet:w>=768&&w<1024,isDesktop:w>=1024,
    cols:w<600?1:2,gap:w<600?12:w<1024?16:20,pad:w<600?14:w<1024?18:24,
    cardP:w<480?14:w<768?16:20,headFS:w<480?15:w<768?17:20,
    labelFS:w<480?13:w<768?14:16,metaFS:w<480?10:11,
    cardR:w<480?18:22,modalR:w<768?'20px 20px 0 0':'22px',
  }
}
const useVP = () => {
  const [vp,setVP]=useState(getVP)
  useEffect(()=>{
    const fn=()=>setVP(getVP())
    window.addEventListener('resize',fn)
    window.addEventListener('orientationchange',fn)
    return()=>{window.removeEventListener('resize',fn);window.removeEventListener('orientationchange',fn)}
  },[])
  return vp
}

// ── HLS AUDIO HOOK WITH AI DENOISER ─────────────────────────────
const useHlsAudio = (url) => {
  const [streamStatus,setStreamStatus]=useState('idle')
  const [analyser,setAnalyser]=useState(null)
  const [aiMode,setAiMode]=useState('loading') // 'loading' | 'active' | 'fallback'
  const hlsRef=useRef(null),audioRef=useRef(null),audioCtxRef=useRef(null),retryRef=useRef(null)

  const cleanup=useCallback(()=>{
    clearTimeout(retryRef.current)
    hlsRef.current?.destroy();hlsRef.current=null
    if(audioRef.current){audioRef.current.pause();audioRef.current.src='';audioRef.current=null}
    audioCtxRef.current?.close().catch(()=>{});audioCtxRef.current=null
    setAnalyser(null)
  },[])

  const resumeCtx=async(audio)=>{
    try{
      const ctx=new(window.AudioContext||window.webkitAudioContext)()
      const src=ctx.createMediaElementSource(audio)

      // Pre-filter sebelum AI
      const highPass=ctx.createBiquadFilter()
      highPass.type='highpass'
      highPass.frequency.value=300
      highPass.Q.value=1.0

      const lowPass=ctx.createBiquadFilter()
      lowPass.type='lowpass'
      lowPass.frequency.value=4500
      lowPass.Q.value=0.8

      // Post gain + analyser
      const gain=ctx.createGain()
      gain.gain.value=2.0

      const node=ctx.createAnalyser()
      node.fftSize=2048
      node.smoothingTimeConstant=0.82

      // ── COBA LOAD RNNOISE AI ──────────────────────────────────
      let denoiseState=null
      try{
        const { Rnnoise }=await import('@shiguredo/rnnoise-wasm')
        const rnnoise=await Rnnoise.load()
        denoiseState=rnnoise.createDenoiseState()
        setAiMode('active')
        console.log('[Audio] ✅ RNNoise AI loaded — neural noise suppression aktif!')
      }catch(e){
        setAiMode('fallback')
        console.warn('[Audio] RNNoise tidak tersedia, pakai fallback filters')
      }

      if(denoiseState){
        // ── AI PATH: RNNoise neural network ──────────────────────
        // RNNoise: 480 samples per frame, 48kHz, float32 range ±1.0
        const FRAME_SIZE=480
        const processor=ctx.createScriptProcessor(FRAME_SIZE,1,1)
        const frameBuffer=new Float32Array(FRAME_SIZE)

        processor.onaudioprocess=(e)=>{
          const input=e.inputBuffer.getChannelData(0)
          const output=e.outputBuffer.getChannelData(0)
          frameBuffer.set(input)
          // Neural network process — denoises in-place
          denoiseState.processFrame(frameBuffer)
          output.set(frameBuffer)
        }

        // Chain AI: src → HP → LP → RNNoise → gain → analyser → out
        src.connect(highPass)
        highPass.connect(lowPass)
        lowPass.connect(processor)
        processor.connect(gain)
        gain.connect(node)
        node.connect(ctx.destination)

      }else{
        // ── FALLBACK PATH: Noise gate + EQ ───────────────────────
        // Voice boost
        const vowel=ctx.createBiquadFilter()
        vowel.type='peaking';vowel.frequency.value=1000;vowel.gain.value=8;vowel.Q.value=0.9

        const presence=ctx.createBiquadFilter()
        presence.type='peaking';presence.frequency.value=2800;presence.gain.value=10;presence.Q.value=1.0

        // Noise gate
        const gate=ctx.createScriptProcessor(2048,1,1)
        let gateGain=0
        gate.onaudioprocess=(e)=>{
          const inp=e.inputBuffer.getChannelData(0)
          const out=e.outputBuffer.getChannelData(0)
          let sum=0
          for(let i=0;i<inp.length;i++) sum+=inp[i]*inp[i]
          const rms=Math.sqrt(sum/inp.length)
          const target=rms>0.012?1.0:0.0
          gateGain+=(target-gateGain)*(target>gateGain?0.15:0.06)
          for(let i=0;i<inp.length;i++) out[i]=inp[i]*gateGain
        }

        gain.gain.value=2.5

        // Chain fallback: src → HP → LP → vowel → presence → gate → gain → analyser → out
        src.connect(highPass)
        highPass.connect(lowPass)
        lowPass.connect(vowel)
        vowel.connect(presence)
        presence.connect(gate)
        gate.connect(gain)
        gain.connect(node)
        node.connect(ctx.destination)
      }

      audioCtxRef.current=ctx;setAnalyser(node)
    }catch(e){console.warn('[HLS] AudioContext failed:',e)}
  }

  const connect=useCallback(()=>{
    if(!url){setStreamStatus('idle');return}
    cleanup();setStreamStatus('connecting')
    const audio=new Audio();audio.crossOrigin='anonymous';audio.volume=1;audioRef.current=audio
    if(Hls.isSupported()){
      const hls=new Hls({lowLatencyMode:true,backBufferLength:10,maxBufferLength:10,liveSyncDurationCount:2,enableWorker:true})
      hlsRef.current=hls;hls.loadSource(url);hls.attachMedia(audio)
      hls.on(Hls.Events.MANIFEST_PARSED,()=>{resumeCtx(audio).then(()=>audio.play().catch(()=>{}));setStreamStatus('live')})
      hls.on(Hls.Events.ERROR,(_,data)=>{if(data.fatal){setStreamStatus('offline');retryRef.current=setTimeout(connect,5000)}})
    }else if(audio.canPlayType('application/vnd.apple.mpegurl')){
      audio.src=url
      audio.addEventListener('loadedmetadata',()=>{resumeCtx(audio).then(()=>audio.play().catch(()=>{}));setStreamStatus('live')},{once:true})
      audio.addEventListener('error',()=>{setStreamStatus('offline');retryRef.current=setTimeout(connect,5000)},{once:true})
    }else{setStreamStatus('offline')}
  },[url,cleanup])

  useEffect(()=>{connect();return cleanup},[connect])
  return{streamStatus,analyser,reconnect:connect,aiMode}
}

// ── SOUNDWAVE ───────────────────────────────────────────────────
const SoundwaveArea = ({status,analyser}) => {
  const canvasRef=useRef(null),animRef=useRef(null),tRef=useRef(0),sizeRef=useRef({w:0,h:0})
  useEffect(()=>{
    const canvas=canvasRef.current;if(!canvas)return
    const dpr=window.devicePixelRatio||1
    const ro=new ResizeObserver(entries=>{
      const{width,height}=entries[0].contentRect
      canvas.width=Math.round(width*dpr);canvas.height=Math.round(height*dpr)
      sizeRef.current={w:width,h:height}
    })
    ro.observe(canvas)
    const ctx=canvas.getContext('2d')
    const drawGrid=(W,H)=>{
      ctx.save();ctx.strokeStyle='rgba(255,255,255,0.045)';ctx.lineWidth=1
      for(let i=1;i<4;i++){ctx.beginPath();ctx.moveTo(0,H*i/4);ctx.lineTo(W,H*i/4);ctx.stroke()}
      for(let i=1;i<8;i++){ctx.beginPath();ctx.moveTo(W*i/8,0);ctx.lineTo(W*i/8,H);ctx.stroke()}
      ctx.restore();ctx.save();ctx.strokeStyle='rgba(255,255,255,0.07)';ctx.lineWidth=1
      ctx.setLineDash([4,6]);ctx.beginPath();ctx.moveTo(0,H/2);ctx.lineTo(W,H/2);ctx.stroke()
      ctx.setLineDash([]);ctx.restore()
    }
    const draw=()=>{
      const{w:W,h:H}=sizeRef.current
      if(!W||!H){animRef.current=requestAnimationFrame(draw);return}
      ctx.setTransform(dpr,0,0,dpr,0,0);ctx.clearRect(0,0,W,H)
      const cy=H/2,t=tRef.current
      drawGrid(W,H);ctx.save();ctx.lineCap='round';ctx.lineJoin='round'
      if(status==='offline'||status==='idle'||status==='connecting'){
        ctx.strokeStyle=status==='connecting'?'rgba(255,255,255,0.22)':'rgba(255,255,255,0.17)';ctx.lineWidth=1.5
        if(status==='connecting'){
          const scanX=((t*60)%W),grad=ctx.createLinearGradient(0,0,W,0)
          grad.addColorStop(Math.max(0,(scanX-60)/W),'rgba(255,255,255,0.08)')
          grad.addColorStop(Math.min(1,scanX/W),'rgba(255,255,255,0.55)')
          grad.addColorStop(Math.min(1,(scanX+20)/W),'rgba(255,255,255,0.08)')
          ctx.strokeStyle=grad
        }
        ctx.beginPath();ctx.moveTo(0,cy)
        for(let x=1;x<W;x++){const noise=(Math.random()-.5)*(status==='offline'?1.8:.4);ctx.lineTo(x,cy+noise)}
        ctx.stroke();tRef.current+=.04
      }else if(analyser){
        const buf=analyser.frequencyBinCount,data=new Uint8Array(buf)
        analyser.getByteTimeDomainData(data)
        ctx.strokeStyle='rgba(255,255,255,0.92)';ctx.lineWidth=2.2
        ctx.shadowColor='rgba(255,255,255,0.45)';ctx.shadowBlur=10
        ctx.beginPath()
        for(let i=0;i<buf;i++){
          const x=(i/buf)*W,v=(data[i]/128)-1,y=cy+v*(H*.44)
          i===0?ctx.moveTo(x,y):ctx.lineTo(x,y)
        }
        ctx.stroke();tRef.current+=.005
      }else{
        ctx.strokeStyle='rgba(255,255,255,0.55)';ctx.lineWidth=1.8
        ctx.beginPath()
        for(let x=0;x<W;x++){
          const p=x/W
          const y=cy+Math.sin(p*Math.PI*6+t)*(H*.13)+Math.sin(p*Math.PI*14+t*1.55)*(H*.07)+Math.sin(p*Math.PI*3+t*.52)*(H*.10)
          x===0?ctx.moveTo(x,y):ctx.lineTo(x,y)
        }
        ctx.stroke();tRef.current+=.028
      }
      ctx.restore();animRef.current=requestAnimationFrame(draw)
    }
    draw()
    return()=>{cancelAnimationFrame(animRef.current);ro.disconnect()}
  },[status,analyser])

  const isLive=status==='live'
  return(
    <div style={{width:'100%',aspectRatio:'16/9',borderRadius:14,overflow:'hidden',position:'relative',background:isLive?'#161616':'#1e1e1e'}}>
      <div style={{position:'absolute',inset:0,zIndex:3,pointerEvents:'none',background:'repeating-linear-gradient(to bottom,transparent 0,transparent 3px,rgba(0,0,0,.055) 3px,rgba(0,0,0,.055) 4px)'}}/>
      <div style={{position:'absolute',inset:0,zIndex:4,pointerEvents:'none',background:'radial-gradient(ellipse at center,transparent 45%,rgba(0,0,0,.55) 100%)'}}/>
      <canvas ref={canvasRef} style={{position:'absolute',inset:0,zIndex:2,width:'100%',height:'100%'}}/>
      {status==='connecting'&&(
        <div style={{position:'absolute',top:'50%',left:'50%',transform:'translate(-50%,-50%)',zIndex:5,display:'flex',flexDirection:'column',alignItems:'center',gap:8}}>
          <div style={{width:18,height:18,borderRadius:'50%',border:'2px solid rgba(255,255,255,.15)',borderTopColor:'rgba(255,255,255,.6)',animation:'spin .8s linear infinite'}}/>
          <span style={{fontFamily:'monospace',fontSize:9,letterSpacing:'.2em',color:'rgba(255,255,255,.3)',textTransform:'uppercase'}}>CONNECTING</span>
        </div>
      )}
      {(status==='offline'||status==='idle')&&(
        <div style={{position:'absolute',top:'50%',left:'50%',transform:'translate(-50%,-50%)',zIndex:5}}>
          <span style={{fontFamily:'monospace',fontSize:9,letterSpacing:'.2em',color:'rgba(255,255,255,.2)',textTransform:'uppercase'}}>{status==='offline'?'NO SIGNAL':'IDLE'}</span>
        </div>
      )}
      {isLive&&(
        <div style={{position:'absolute',bottom:8,left:10,zIndex:5,display:'flex',alignItems:'center',gap:6}}>
          <div style={{display:'flex',alignItems:'flex-end',gap:2,height:16}}>
            {['eq1','eq2','eq3','eq2','eq1'].map((a,i)=>(
              <div key={i} style={{width:3,borderRadius:2,background:'rgba(255,255,255,0.6)',animation:`${a} ${0.6+i*0.1}s ease-in-out infinite`,animationDelay:`${i*0.08}s`}}/>
            ))}
          </div>
          <span style={{fontFamily:'monospace',fontSize:9,letterSpacing:'.1em',color:'rgba(255,255,255,.5)'}}>RX · RECEIVING</span>
        </div>
      )}
      <div style={{position:'absolute',top:8,right:10,zIndex:5,fontFamily:'monospace',fontSize:8,letterSpacing:'.12em',color:'rgba(255,255,255,.18)'}}>OSCILLOSCOPE</div>
    </div>
  )
}

// ── AI MODE BADGE ────────────────────────────────────────────────
const AIBadge = ({aiMode,status}) => {
  if(status!=='live')return null
  if(aiMode==='loading') return(
    <div style={{display:'flex',alignItems:'center',gap:7,padding:'6px 10px',background:T.chip,borderRadius:10}}>
      <div style={{width:10,height:10,borderRadius:'50%',border:`1.5px solid ${T.ai}`,borderTopColor:'transparent',animation:'spin .7s linear infinite'}}/>
      <span style={{fontSize:9,fontWeight:700,color:T.muted,letterSpacing:'.08em',fontFamily:'monospace'}}>LOADING AI MODEL...</span>
    </div>
  )
  if(aiMode==='active') return(
    <div style={{display:'flex',alignItems:'center',gap:7,padding:'6px 10px',background:T.aiBg,borderRadius:10,border:`1px solid ${T.ai}30`}}>
      <Cpu size={11} color={T.ai} strokeWidth={2} style={{animation:'ai-pulse 2s infinite'}}/>
      <span style={{fontSize:9,fontWeight:800,color:T.ai,letterSpacing:'.08em',fontFamily:'monospace'}}>RNNoise AI · NEURAL DENOISER ACTIVE</span>
    </div>
  )
  return(
    <div style={{display:'flex',alignItems:'center',gap:7,padding:'6px 10px',background:T.chip,borderRadius:10}}>
      <Volume2 size={11} color={T.live} strokeWidth={2}/>
      <span style={{fontSize:9,fontWeight:700,color:T.live,letterSpacing:'.08em',fontFamily:'monospace'}}>NOISE GATE + EQ ACTIVE</span>
    </div>
  )
}

// ── UI ATOMS ─────────────────────────────────────────────────────
const Card = ({children,style={},onClick,p=20,radius=22}) => {
  const [hov,setHov]=useState(false)
  return(
    <div onClick={onClick} onMouseEnter={()=>setHov(true)} onMouseLeave={()=>setHov(false)}
      style={{background:T.surf,borderRadius:radius,padding:p,
        boxShadow:hov?'0 14px 44px rgba(0,0,0,.11), 0 3px 10px rgba(0,0,0,.06)':'0 2px 16px rgba(0,0,0,.07), 0 1px 3px rgba(0,0,0,.04)',
        transition:'box-shadow .25s, transform .25s',transform:hov&&onClick?'translateY(-2px)':'none',
        cursor:onClick?'pointer':'default',...style}}>
      {children}
    </div>
  )
}

const StatusBadge = ({status,fs=10}) => {
  const map={
    live:{label:'● LIVE',bg:T.liveBg,color:T.live,anim:'live-blink 2s infinite'},
    connecting:{label:'◌ CONNECTING',bg:T.connBg,color:T.conn,anim:'conn-blink .8s infinite'},
    offline:{label:'✕ OFFLINE',bg:T.offBg,color:T.offline,anim:'none'},
    idle:{label:'— IDLE',bg:T.idleBg,color:T.idle,anim:'none'},
  }
  const s=map[status]||map.idle
  return <span style={{background:s.bg,color:s.color,fontSize:fs,fontWeight:800,letterSpacing:'.1em',padding:'3px 9px',borderRadius:99,animation:s.anim,fontFamily:'monospace',whiteSpace:'nowrap'}}>{s.label}</span>
}

const IconBtn = ({icon:Icon,onClick,danger=false,sz=32,title=''}) => {
  const [hov,setHov]=useState(false)
  return(
    <button onClick={onClick} title={title} onMouseEnter={()=>setHov(true)} onMouseLeave={()=>setHov(false)}
      style={{width:sz,height:sz,borderRadius:sz*.32,flexShrink:0,
        border:`1.5px solid ${hov&&danger?'#FECACA':hov?T.borderD:T.border}`,
        background:hov&&danger?'#FEE2E2':hov?T.chip:'transparent',
        color:hov&&danger?T.offline:hov?T.dark:T.mid,
        display:'flex',alignItems:'center',justifyContent:'center',
        cursor:'pointer',transition:'all .15s',outline:'none',WebkitTapHighlightColor:'transparent'}}>
      <Icon size={sz*.43} strokeWidth={2}/>
    </button>
  )
}

// ── CAMERA CARD ──────────────────────────────────────────────────
const CameraCard = ({cam,vp,onEdit,onDelete,onReconnect,analyser,aiMode}) => {
  const{cardP,cardR,labelFS,metaFS,isPhone}=vp
  const handleFullscreen=()=>{
    const el=document.getElementById(`card-${cam.id}`)
    if(!el)return
    if(document.fullscreenElement)document.exitFullscreen()
    else el.requestFullscreen?.()
  }
  return(
    <div id={`card-${cam.id}`} style={{background:T.surf,borderRadius:cardR,overflow:'hidden',display:'flex',flexDirection:'column',boxShadow:'0 2px 16px rgba(0,0,0,.07), 0 1px 3px rgba(0,0,0,.04)'}}>
      <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:`${cardP*.7}px ${cardP}px`,borderBottom:`1px solid ${T.border}`}}>
        <div style={{display:'flex',flexDirection:'column',gap:4,minWidth:0,flex:1,marginRight:8}}>
          <span className="fd" style={{fontSize:labelFS,fontWeight:800,color:T.dark,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{cam.label}</span>
          <div style={{display:'flex',alignItems:'center',gap:7,flexWrap:'wrap'}}>
            <StatusBadge status={cam.status} fs={metaFS}/>
            <span style={{fontFamily:'monospace',fontSize:metaFS,color:T.muted,letterSpacing:'.06em'}}>{cam.id}</span>
          </div>
        </div>
        <div style={{display:'flex',gap:5,flexShrink:0}}>
          {cam.status==='offline'&&<IconBtn icon={RefreshCw} onClick={onReconnect} sz={isPhone?34:30} title="Reconnect"/>}
          <IconBtn icon={Maximize2} onClick={handleFullscreen} sz={isPhone?34:30} title="Fullscreen"/>
          <IconBtn icon={Pencil} onClick={onEdit} sz={isPhone?34:30} title="Edit"/>
          <IconBtn icon={Trash2} onClick={onDelete} danger sz={isPhone?34:30} title="Delete"/>
        </div>
      </div>
      <div style={{padding:`${cardP*.6}px ${cardP}px 0`}}>
        <SoundwaveArea status={cam.status} analyser={analyser}/>
      </div>
      <div style={{padding:`${cardP*.45}px ${cardP}px 0`}}>
        <div style={{background:T.chip,borderRadius:10,padding:'6px 10px',display:'flex',alignItems:'center',gap:6}}>
          {cam.url?<Wifi size={10} color={T.muted} strokeWidth={2} style={{flexShrink:0}}/>:<WifiOff size={10} color={T.muted} strokeWidth={2} style={{flexShrink:0}}/>}
          <span style={{fontFamily:'monospace',fontSize:9,color:T.muted,whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis',flex:1}}>{cam.url||'— no stream configured —'}</span>
        </div>
      </div>
      <div style={{padding:`${cardP*.4}px ${cardP}px ${cardP}px`}}>
        <AIBadge aiMode={aiMode} status={cam.status}/>
      </div>
    </div>
  )
}

// ── CAMERA STREAM WRAPPER ────────────────────────────────────────
const CameraStream = ({cam,vp,onEdit,onDelete}) => {
  const{streamStatus,analyser,reconnect,aiMode}=useHlsAudio(cam.url)
  const effectiveStatus=cam.url?streamStatus:'idle'
  const effectiveCam={...cam,status:effectiveStatus}
  return(
    <CameraCard cam={effectiveCam} vp={vp} onEdit={onEdit} onDelete={onDelete}
      onReconnect={reconnect} analyser={analyser} aiMode={aiMode}/>
  )
}

// ── MODALS ───────────────────────────────────────────────────────
const CamModal = ({show,cam,onClose,onSave,vp}) => {
  const [label,setLabel]=useState(''),[url,setUrl]=useState(''),[rtspWarn,setRtspWarn]=useState(false)
  useEffect(()=>{if(show){setLabel(cam?.label||'');setUrl(cam?.url||'');setRtspWarn(false)}},[show])
  if(!show)return null
  const{pad,headFS,isPhone,modalR}=vp
  const handleUrl=v=>{setUrl(v);setRtspWarn(v.trim().toLowerCase().startsWith('rtsp://'))}
  return(
    <div onClick={e=>{if(e.target===e.currentTarget)onClose()}}
      style={{position:'fixed',inset:0,zIndex:200,background:'rgba(0,0,0,.4)',backdropFilter:'blur(6px)',
        display:'flex',alignItems:isPhone?'flex-end':'center',justifyContent:'center',
        padding:isPhone?0:20,animation:'fade-bg .2s ease'}}>
      <div style={{width:'100%',maxWidth:isPhone?'100%':500,background:T.surf,borderRadius:modalR,
        padding:`${pad+8}px ${pad+4}px ${isPhone?40:pad+8}px`,
        animation:'slide-up .28s cubic-bezier(.34,1.3,.64,1)',maxHeight:isPhone?'92dvh':'auto',overflowY:'auto'}}>
        {isPhone&&<div style={{width:38,height:4,borderRadius:99,background:T.border,margin:'0 auto 20px'}}/>}
        <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:20}}>
          <span className="fd" style={{fontSize:headFS,fontWeight:800,color:T.dark}}>{cam?'Edit Camera':'Add Camera'}</span>
          {!isPhone&&<button onClick={onClose} style={{background:T.chip,border:`1px solid ${T.border}`,borderRadius:99,width:30,height:30,display:'flex',alignItems:'center',justifyContent:'center',cursor:'pointer',color:T.mid}}><X size={14} strokeWidth={2}/></button>}
        </div>
        <label style={{fontSize:11,fontWeight:700,color:T.muted,letterSpacing:'.08em',textTransform:'uppercase',display:'block',marginBottom:6}}>Camera Label</label>
        <input value={label} onChange={e=>setLabel(e.target.value)} placeholder="e.g. GATE KASIR"
          style={{width:'100%',padding:'12px 14px',borderRadius:14,marginBottom:16,border:`1.5px solid ${T.border}`,background:T.chip,fontSize:14,fontWeight:600,color:T.dark,outline:'none'}}
          onFocus={e=>e.target.style.borderColor=T.dark} onBlur={e=>e.target.style.borderColor=T.border}/>
        <label style={{fontSize:11,fontWeight:700,color:T.muted,letterSpacing:'.08em',textTransform:'uppercase',display:'block',marginBottom:6}}>HLS Stream URL (.m3u8)</label>
        <input value={url} onChange={e=>handleUrl(e.target.value)} placeholder="http://192.168.x.x:1984/api/stream.m3u8?src=gate_kasir"
          style={{width:'100%',padding:'12px 14px',borderRadius:14,marginBottom:8,
            border:`1.5px solid ${rtspWarn?'#FCD34D':T.border}`,background:T.chip,fontSize:11,fontWeight:500,color:T.dark,outline:'none',fontFamily:'monospace'}}
          onFocus={e=>e.target.style.borderColor=rtspWarn?'#FCD34D':T.dark}
          onBlur={e=>e.target.style.borderColor=rtspWarn?'#FCD34D':T.border}/>
        {rtspWarn?(
          <div style={{background:'#FFFBEB',border:'1px solid #FCD34D',borderRadius:12,padding:'10px 12px',marginBottom:16}}>
            <p style={{fontSize:11,fontWeight:700,color:'#92400E',marginBottom:4}}>⚠ RTSP tidak bisa diputar langsung di browser</p>
            <p style={{fontSize:11,color:'#B45309',lineHeight:1.65}}>Masukkan ke go2rtc.yaml, lalu gunakan URL HLS:<br/><code style={{fontFamily:'monospace',fontSize:10}}>http://[IP]:1984/api/stream.m3u8?src=[nama]</code></p>
          </div>
        ):(
          <p style={{fontSize:11,color:T.muted,marginBottom:22,lineHeight:1.65}}>Butuh <strong style={{color:T.dark}}>go2rtc</strong> running di PC lokal.</p>
        )}
        <div style={{display:'flex',gap:10}}>
          <button onClick={onClose} style={{flex:1,padding:'13px 0',borderRadius:14,border:`1.5px solid ${T.border}`,background:'transparent',fontSize:14,fontWeight:700,color:T.mid,cursor:'pointer'}}>Cancel</button>
          <button onClick={()=>{if(label.trim()||url.trim())onSave({label,url})}}
            style={{flex:2,padding:'13px 0',borderRadius:14,border:'none',background:T.dark,color:'#fff',fontSize:14,fontWeight:700,cursor:'pointer',boxShadow:'0 4px 16px rgba(0,0,0,.2)'}}>
            {cam?'Save Changes':'Add Camera'}
          </button>
        </div>
      </div>
    </div>
  )
}

const DeleteConfirm = ({cam,onConfirm,onCancel}) => (
  <div onClick={e=>{if(e.target===e.currentTarget)onCancel()}}
    style={{position:'fixed',inset:0,zIndex:200,background:'rgba(0,0,0,.4)',backdropFilter:'blur(6px)',
      display:'flex',alignItems:'center',justifyContent:'center',padding:20,animation:'fade-bg .15s ease'}}>
    <Card p={28} radius={22} style={{width:'100%',maxWidth:340,animation:'fade-in .2s ease'}}>
      <div style={{textAlign:'center',marginBottom:22}}>
        <div style={{width:52,height:52,borderRadius:16,background:'#FEE2E2',display:'flex',alignItems:'center',justifyContent:'center',margin:'0 auto 14px'}}>
          <Trash2 size={22} color={T.offline} strokeWidth={2}/>
        </div>
        <p className="fd" style={{fontSize:18,fontWeight:800,color:T.dark,marginBottom:6}}>Hapus Kamera?</p>
        <p style={{fontSize:13,color:T.mid,lineHeight:1.6}}><strong>{cam?.label}</strong> akan dihapus dari dashboard.</p>
      </div>
      <div style={{display:'flex',gap:10}}>
        <button onClick={onCancel} style={{flex:1,padding:'12px 0',borderRadius:14,border:`1.5px solid ${T.border}`,background:'transparent',fontSize:14,fontWeight:700,color:T.mid,cursor:'pointer'}}>Batal</button>
        <button onClick={onConfirm} style={{flex:1,padding:'12px 0',borderRadius:14,border:'none',background:T.offline,color:'#fff',fontSize:14,fontWeight:700,cursor:'pointer'}}>Hapus</button>
      </div>
    </Card>
  </div>
)

const EmptyState = ({onAdd}) => (
  <Card p={48} radius={22} style={{textAlign:'center',gridColumn:'1/-1'}}>
    <div style={{width:64,height:64,borderRadius:20,background:T.chip,display:'flex',alignItems:'center',justifyContent:'center',margin:'0 auto 18px'}}>
      <Mic size={28} color={T.muted} strokeWidth={1.5}/>
    </div>
    <p className="fd" style={{fontSize:20,fontWeight:800,color:T.dark,marginBottom:7}}>Belum Ada Kamera</p>
    <p style={{fontSize:13,color:T.muted,lineHeight:1.65,maxWidth:280,margin:'0 auto 22px'}}>Tambahkan kamera untuk mulai monitoring audio gate hotel.</p>
    <button onClick={onAdd} style={{padding:'12px 28px',borderRadius:14,border:'none',background:T.dark,color:'#fff',fontSize:14,fontWeight:700,cursor:'pointer',boxShadow:'0 4px 16px rgba(0,0,0,.18)'}}>+ Add Camera</button>
  </Card>
)

const DeviceChip = ({vp}) => {
  const map={xs:{label:'Phone · Portrait',Icon:Smartphone},sm:{label:'Phone · Landscape',Icon:Smartphone},md:{label:'Tablet',Icon:Tablet},lg:{label:'Laptop',Icon:Monitor},xl:{label:'Desktop',Icon:Monitor}}
  const{label,Icon}=map[vp.bp]||map.xl
  return(
    <div style={{display:'inline-flex',alignItems:'center',gap:6,background:'rgba(0,0,0,.07)',borderRadius:99,padding:'4px 10px 4px 7px'}}>
      <Icon size={11} color={T.mid} strokeWidth={2}/>
      <span style={{fontSize:10,fontWeight:700,color:T.mid,letterSpacing:'.06em'}}>{label} · {vp.w}×{vp.h}</span>
    </div>
  )
}

const InfoBar = ({cameras}) => {
  const live=cameras.filter(c=>c.url).length
  const items=[['Active',`${live}/${cameras.length}`,T.live],['Protocol','HLS',T.dark],['AI','RNNoise',T.ai],['Denoiser','Neural Net',T.ai]]
  return(
    <Card p={12} radius={14} style={{background:T.surfD,boxShadow:'none',border:`1px solid ${T.border}`}}>
      <div style={{display:'flex',flexWrap:'wrap',gap:'8px 24px'}}>
        {items.map(([k,v,c])=>(
          <div key={k} style={{display:'flex',gap:5,alignItems:'center'}}>
            <span style={{fontSize:10,color:T.muted,fontWeight:600}}>{k}:</span>
            <span style={{fontSize:10,color:c,fontWeight:800,fontFamily:'monospace'}}>{v}</span>
          </div>
        ))}
      </div>
    </Card>
  )
}

// ── APP ROOT ─────────────────────────────────────────────────────
let _id=2
const nextId=()=>`CAM-${String(++_id).padStart(2,'0')}`
const STORAGE_KEY='kedaton_cameras_v2'
const loadCameras=()=>{
  try{const raw=localStorage.getItem(STORAGE_KEY);if(raw)return JSON.parse(raw)}catch{}
  return[{id:'CAM-01',label:'GATE KASIR',url:''},{id:'CAM-02',label:'GATE NON-KASIR',url:''}]
}

export default function App() {
  const vp=useVP()
  const [cameras,setCameras]=useState(loadCameras)
  const [modal,setModal]=useState(null)
  const{pad,gap,cols,headFS,isPhone}=vp

  useEffect(()=>{try{localStorage.setItem(STORAGE_KEY,JSON.stringify(cameras))}catch{}},[cameras])

  const addCam=({label,url})=>{const id=nextId();setCameras(cs=>[...cs,{id,label:label.toUpperCase()||id,url:url.trim()}]);setModal(null)}
  const editCam=({label,url})=>{setCameras(cs=>cs.map(c=>c.id===modal.cam.id?{...c,label:label.toUpperCase(),url:url.trim()}:c));setModal(null)}
  const deleteCam=(id)=>{setCameras(cs=>cs.filter(c=>c.id!==id));setModal(null)}

  return(
    <>
      <GlobalStyles/>
      <div style={{minHeight:'100dvh',background:T.bg,fontFamily:"'Plus Jakarta Sans',sans-serif"}}>
        <div style={{background:T.surf,borderBottom:`1px solid ${T.border}`,boxShadow:'0 2px 16px rgba(0,0,0,.05)',padding:`${isPhone?12:16}px ${pad+4}px`,position:'sticky',top:0,zIndex:100}}>
          <div style={{maxWidth:1200,margin:'0 auto',display:'flex',alignItems:'center',justifyContent:'space-between',gap:12}}>
            <div style={{display:'flex',alignItems:'center',gap:10,minWidth:0}}>
              <div style={{width:isPhone?32:38,height:isPhone?32:38,borderRadius:isPhone?10:12,background:T.dark,flexShrink:0,display:'flex',alignItems:'center',justifyContent:'center'}}>
                <Mic size={isPhone?14:17} color="#fff" strokeWidth={2}/>
              </div>
              <div style={{minWidth:0}}>
                <div className="fd" style={{fontSize:isPhone?15:headFS,fontWeight:800,color:T.dark,whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis'}}>Gate Monitor</div>
                {!isPhone&&<p style={{fontSize:11,color:T.muted,fontWeight:500}}>Hotel Kedaton 8 · {cameras.length} camera{cameras.length!==1?'s':''}</p>}
              </div>
            </div>
            {!isPhone&&<DeviceChip vp={vp}/>}
            <button onClick={()=>setModal('add')}
              style={{display:'flex',alignItems:'center',gap:isPhone?0:7,background:T.dark,color:'#fff',border:'none',
                borderRadius:isPhone?10:12,padding:isPhone?'9px 12px':'9px 18px',cursor:'pointer',
                fontSize:13,fontWeight:700,flexShrink:0,boxShadow:'0 3px 12px rgba(0,0,0,.18)',WebkitTapHighlightColor:'transparent'}}>
              <Plus size={16} strokeWidth={2.5}/>
              {!isPhone&&'Add Camera'}
            </button>
          </div>
        </div>
        <div style={{maxWidth:1200,margin:'0 auto',padding:`${pad}px ${pad+4}px ${pad+24}px`}}>
          {isPhone&&cameras.length>0&&(
            <div style={{display:'flex',gap:8,marginBottom:gap}}>
              {[['Cams',String(cameras.length),T.dark],['Protocol','HLS',T.dark],['AI','RNNoise ✓',T.ai]].map(([k,v,c])=>(
                <div key={k} style={{flex:1,background:T.surf,borderRadius:12,padding:'10px 0',textAlign:'center',boxShadow:'0 1px 6px rgba(0,0,0,.06)'}}>
                  <div style={{fontSize:14,fontWeight:800,color:c,fontFamily:'monospace'}}>{v}</div>
                  <div style={{fontSize:9,color:T.muted,fontWeight:700,marginTop:2,letterSpacing:'.06em'}}>{k}</div>
                </div>
              ))}
            </div>
          )}
          <div style={{display:'grid',gridTemplateColumns:`repeat(${cols},1fr)`,gap}}>
            {cameras.length===0
              ?<EmptyState onAdd={()=>setModal('add')}/>
              :cameras.map(cam=>(
                <CameraStream key={cam.id} cam={cam} vp={vp}
                  onEdit={()=>setModal({type:'edit',cam})}
                  onDelete={()=>setModal({type:'delete',cam})}/>
              ))
            }
          </div>
          {!isPhone&&cameras.length>0&&<div style={{marginTop:gap}}><InfoBar cameras={cameras}/></div>}
          {isPhone&&<div style={{marginTop:gap,display:'flex',justifyContent:'center'}}><DeviceChip vp={vp}/></div>}
        </div>
      </div>
      <CamModal show={modal==='add'||modal?.type==='edit'} cam={modal?.type==='edit'?modal.cam:null}
        onClose={()=>setModal(null)} onSave={modal?.type==='edit'?editCam:addCam} vp={vp}/>
      {modal?.type==='delete'&&<DeleteConfirm cam={modal.cam} onConfirm={()=>deleteCam(modal.cam.id)} onCancel={()=>setModal(null)}/>}
    </>
  )
}