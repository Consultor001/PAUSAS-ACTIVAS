import { useState, useEffect, useRef } from "react";
import { supabase } from "./supabase";
const COMPANIES = [
  { id: 1, name: "TechCorp",    color: "#7EB8D4", employees: 120 },
  { id: 2, name: "Salud Plus",  color: "#A8C8DC", employees: 85  },
  { id: 3, name: "InnovaGroup", color: "#5A9AB5", employees: 200 },
  { id: 4, name: "DataMind",    color: "#8FBFCF", employees: 60  },
  { id: 5, name: "FutureLabs",  color: "#6AAEC5", employees: 150 },
  { id: 6, name: "BizSmart",    color: "#9DCAD8", employees: 95  },
];

const EXERCISES = [
  { id:1, name:"Estiramiento de cuello",    duration:60,  category:"Cuello",      emoji:"🔄", points:10,
    steps:["Inclina la cabeza hacia la derecha","Mantén 10 segundos","Repite al lado izquierdo","Lleva la barbilla al pecho","Mantén 10 segundos"] },
  { id:2, name:"Rotación de hombros",       duration:45,  category:"Hombros",     emoji:"💪", points:10,
    steps:["Sube ambos hombros hacia las orejas","Rota hacia atrás 5 veces","Rota hacia adelante 5 veces","Sacude los brazos relajando"] },
  { id:3, name:"Estiramiento de espalda",   duration:90,  category:"Espalda",     emoji:"🧘", points:15,
    steps:["Entrelaza los dedos y estira los brazos al frente","Dobla el tronco hacia adelante suavemente","Mantén 15 segundos","Lleva los brazos arriba y estira","Mantén 10 segundos"] },
  { id:4, name:"Ejercicio de ojos",         duration:60,  category:"Ojos",        emoji:"👁️", points:10,
    steps:["Cierra los ojos 10 segundos","Mira al punto más lejano disponible","Mueve los ojos: arriba, abajo, izquierda, derecha","Dibuja círculos con los ojos lentamente","Parpadea rápido 20 veces"] },
  { id:5, name:"Respiración profunda",      duration:120, category:"Respiración", emoji:"🌬️", points:20,
    steps:["Siéntate erguido","Inhala por la nariz 4 segundos","Sostén el aire 4 segundos","Exhala por la boca 6 segundos","Repite 5 veces"] },
  { id:6, name:"Sentadillas de escritorio", duration:90,  category:"Piernas",     emoji:"🦵", points:15,
    steps:["Párate frente a tu silla","Pies al ancho de hombros","Baja como si fueras a sentarte","Sostén antes de tocar la silla","Repite 10 veces"] },
];

const USERS_DATA = [
  { id:1, name:"Ana García",    company:"TechCorp",    points:340, streak:7,  pauses:34 },
  { id:2, name:"Carlos López",  company:"Salud Plus",  points:290, streak:5,  pauses:29 },
  { id:3, name:"María Torres",  company:"InnovaGroup", points:410, streak:12, pauses:41 },
  { id:4, name:"Pedro Ruiz",    company:"DataMind",    points:180, streak:3,  pauses:18 },
  { id:5, name:"Sofía Mora",    company:"FutureLabs",  points:520, streak:15, pauses:52 },
  { id:6, name:"Luis Herrera",  company:"BizSmart",    points:260, streak:4,  pauses:26 },
  { id:7, name:"Valeria Díaz",  company:"TechCorp",    points:380, streak:9,  pauses:38 },
  { id:8, name:"Andrés Silva",  company:"InnovaGroup", points:440, streak:11, pauses:44 },
];

const COMPANY_STATS = COMPANIES.map((c) => ({
  ...c,
  totalPauses:   Math.floor(Math.random() * 500) + 200,
  participation: Math.floor(Math.random() * 40)  + 60,
  avgPoints:     Math.floor(Math.random() * 200) + 150,
}));

// Logo Regis Colombia — recreado fiel al original
function RegisLogo({ height = 36 }) {
  return (
    <svg height={height} viewBox="0 0 170 46" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Cuadro exterior */}
      <rect x="1" y="1" width="42" height="42" rx="3" fill="none" stroke="white" strokeWidth="2.5"/>
      {/* Columna izquierda */}
      <rect x="7"  y="8"  width="9" height="27" rx="1.5" fill="white"/>
      {/* Columna derecha superior */}
      <rect x="20" y="8"  width="16" height="12" rx="1.5" fill="white"/>
      {/* Barra horizontal media */}
      <rect x="7"  y="20" width="29" height="4"  rx="1.5" fill="white"/>
      {/* Columna derecha inferior (pata de la R) */}
      <rect x="27" y="25" width="9"  height="10" rx="1.5" fill="white"/>
      {/* Texto REGIS */}
      <text x="52" y="27" fontFamily="'Arial Narrow','Arial',sans-serif" fontSize="23" fontWeight="700" fill="white" letterSpacing="3.5">REGIS</text>
      {/* Texto COLOMBIA */}
      <text x="55" y="40" fontFamily="'Arial','sans-serif'" fontSize="10.5" fontWeight="400" fill="rgba(255,255,255,0.72)" letterSpacing="4.5">COLOMBIA</text>
    </svg>
  );
}

export default function PausasActivasApp() {
  const [view, setView]                     = useState("home");
  const [activeExercise, setActiveExercise] = useState(null);
  const [timer, setTimer]                   = useState(0);
  const [timerRunning, setTimerRunning]     = useState(false);
  const [currentStep, setCurrentStep]       = useState(0);
  const [userPoints, setUserPoints]         = useState(1240);
  const [userStreak]                        = useState(8);
  const [completedToday, setCompletedToday] = useState(2);
  const [notification, setNotification]     = useState(null);
  const [selectedCompany, setSelectedCompany] = useState("Todos");
  const [reminderSet, setReminderSet]       = useState(false);
  const intervalRef = useRef(null);

  // ── Paleta azul Regis ──
  const C = {
    bgDeep:  "#0E1A30",
    bgDark:  "#162240",
    bg:      "#1E2D50",
    primary: "#3B7FC4",
    accent:  "#6DBBDF",
    light:   "#B2D8EA",
    border:  "rgba(109,187,223,0.18)",
    surface: "rgba(59,127,196,0.10)",
  };

  useEffect(() => {
    if (timerRunning && timer > 0) {
      intervalRef.current = setInterval(() => {
        setTimer((t) => {
          if (t <= 1) { clearInterval(intervalRef.current); setTimerRunning(false); handleComplete(); return 0; }
          return t - 1;
        });
      }, 1000);
    }
    return () => clearInterval(intervalRef.current);
  }, [timerRunning]);

  const handleComplete = () => {
    const pts = activeExercise?.points || 10;
    setUserPoints(p => p + pts);
    setCompletedToday(c => c + 1);
    notify(`¡+${pts} puntos! Ejercicio completado 🎉`);
    setCurrentStep(0);
  };

  const notify = (msg) => { setNotification(msg); setTimeout(() => setNotification(null), 3000); };

  const startExercise = (ex) => {
    setActiveExercise(ex); setTimer(ex.duration); setCurrentStep(0);
    setTimerRunning(false); setView("exercise");
  };

  const toggleTimer = () => {
    if (timer === 0) { setTimer(activeExercise.duration); setTimerRunning(true); }
    else setTimerRunning(r => !r);
  };

  const fmt = s => `${String(Math.floor(s/60)).padStart(2,"0")}:${String(s%60).padStart(2,"0")}`;
  const progress = activeExercise ? ((activeExercise.duration - timer) / activeExercise.duration) * 100 : 0;
  const myRank = [...USERS_DATA].sort((a,b)=>b.points-a.points).findIndex(u=>u.name==="Sofía Mora")+1;

  const css = `
    @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800;900&family=Barlow+Condensed:wght@600;700;800&display=swap');
    *{box-sizing:border-box;margin:0;padding:0;}
    ::-webkit-scrollbar{width:3px;}
    ::-webkit-scrollbar-thumb{background:#3B7FC4;border-radius:2px;}
    .card{background:rgba(255,255,255,0.045);border:1px solid rgba(109,187,223,0.14);border-radius:18px;}
    .btn-p{background:linear-gradient(135deg,#2B6FA8,#3B7FC4);border:none;color:#fff;padding:13px 26px;border-radius:50px;font-size:14px;font-weight:800;cursor:pointer;transition:all .2s;font-family:'Nunito',sans-serif;}
    .btn-p:hover{transform:scale(1.03);box-shadow:0 8px 28px rgba(59,127,196,0.45);}
    .btn-g{background:rgba(59,127,196,0.13);border:1px solid rgba(109,187,223,0.22);color:rgba(255,255,255,0.85);padding:8px 16px;border-radius:50px;font-size:12px;font-weight:800;cursor:pointer;transition:all .2s;font-family:'Nunito',sans-serif;}
    .btn-g:hover{background:rgba(59,127,196,0.22);}
    .nav-btn{display:flex;flex-direction:column;align-items:center;gap:3px;cursor:pointer;padding:7px 14px;border-radius:12px;transition:all .2s;font-size:10px;font-weight:800;color:rgba(255,255,255,0.32);font-family:'Nunito',sans-serif;border:none;background:none;letter-spacing:.3px;}
    .nav-btn.active{color:#6DBBDF;background:rgba(59,127,196,0.16);}
    .ex-card{background:rgba(255,255,255,0.04);border:1px solid rgba(109,187,223,0.11);border-radius:16px;padding:14px 16px;cursor:pointer;transition:all .2s;}
    .ex-card:hover{background:rgba(59,127,196,0.13);border-color:rgba(109,187,223,0.32);transform:translateY(-2px);}
    .badge{display:inline-flex;align-items:center;background:rgba(59,127,196,0.2);color:#6DBBDF;padding:3px 9px;border-radius:20px;font-size:10px;font-weight:900;border:1px solid rgba(109,187,223,0.22);}
    .rrow{display:flex;align-items:center;gap:11px;padding:10px 10px;border-radius:12px;transition:background .15s;}
    .rrow:hover{background:rgba(59,127,196,0.09);}
    .pill{padding:5px 13px;border-radius:20px;font-size:11px;font-weight:800;cursor:pointer;border:2px solid transparent;transition:all .2s;font-family:'Nunito',sans-serif;}
    @keyframes slideUp{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:translateY(0)}}
    @keyframes fadeIn{from{opacity:0}to{opacity:1}}
    .su{animation:slideUp .35s ease both;}
    .fi{animation:fadeIn .4s ease;}
  `;

  // Shared header
  const Header = ({ title, sub }) => (
    <div style={{background:`linear-gradient(165deg,${C.bg} 0%,${C.bgDark} 100%)`,padding:"26px 22px 22px",borderBottom:`1px solid ${C.border}`,marginBottom:20}}>
      <RegisLogo height={36}/>
      {title && <>
        <h1 style={{fontFamily:"'Barlow Condensed',sans-serif",fontSize:26,fontWeight:800,marginTop:16,letterSpacing:.4}}>{title}</h1>
        {sub && <p style={{color:"rgba(255,255,255,0.42)",fontSize:13,marginTop:2}}>{sub}</p>}
      </>}
    </div>
  );

  return (
    <div style={{fontFamily:"'Nunito',sans-serif",background:C.bgDeep,minHeight:"100vh",color:"#fff",maxWidth:430,margin:"0 auto",position:"relative",overflow:"hidden"}}>
      <style>{css}</style>

      {/* BG glows */}
      <div style={{position:"fixed",top:-100,right:-80,width:300,height:300,background:"radial-gradient(circle,rgba(59,127,196,0.18) 0%,transparent 68%)",pointerEvents:"none",zIndex:0}}/>
      <div style={{position:"fixed",bottom:-60,left:-50,width:220,height:220,background:"radial-gradient(circle,rgba(30,45,80,0.6) 0%,transparent 70%)",pointerEvents:"none",zIndex:0}}/>

      {/* Toast */}
      {notification && (
        <div style={{position:"fixed",top:18,left:"50%",transform:"translateX(-50%)",zIndex:1000,background:"linear-gradient(135deg,#2B6FA8,#3B7FC4)",padding:"10px 22px",borderRadius:"50px",fontWeight:800,fontSize:13,boxShadow:"0 8px 28px rgba(59,127,196,0.55)",animation:"slideUp .3s ease",whiteSpace:"nowrap"}}>
          {notification}
        </div>
      )}

      {/* ═══════════ HOME ═══════════ */}
      {view === "home" && (
        <div style={{paddingBottom:100}} className="fi">
          <Header/>
          <div style={{padding:"0 20px"}}>

            {/* User card */}
            <div className="card" style={{padding:"18px 20px",marginBottom:18,background:"rgba(30,45,80,0.6)",borderColor:"rgba(109,187,223,0.2)"}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
                <div>
                  <p style={{color:"rgba(255,255,255,0.45)",fontSize:12,marginBottom:3}}>Bienvenida 👋</p>
                  <h2 style={{fontFamily:"'Barlow Condensed',sans-serif",fontSize:26,fontWeight:800,letterSpacing:.3,lineHeight:1}}>Sofía Mora</h2>
                  <p style={{color:C.accent,fontSize:12,fontWeight:700,marginTop:4}}>FutureLabs · Nivel Pro</p>
                </div>
                <div style={{textAlign:"center",background:"rgba(255,255,255,0.07)",border:"1px solid rgba(255,255,255,0.12)",borderRadius:14,padding:"10px 14px"}}>
                  <p style={{fontSize:22,fontWeight:900,color:"#FFD166",lineHeight:1}}>🔥{userStreak}</p>
                  <p style={{fontSize:9,color:"rgba(255,255,255,0.42)",fontWeight:800,letterSpacing:1,marginTop:4}}>RACHA</p>
                </div>
              </div>
            </div>

            {/* Stats row */}
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:10,marginBottom:18}}>
              {[
                {label:"Puntos",  value:userPoints.toLocaleString(), icon:"⚡", color:"#FFD166"},
                {label:"Hoy",     value:`${completedToday} pausas`,  icon:"✅", color:"#5EE8C2"},
                {label:"Ranking", value:`#${myRank}`,                 icon:"🏆", color:C.accent},
              ].map(s=>(
                <div key={s.label} className="card" style={{padding:"13px 8px",textAlign:"center"}}>
                  <div style={{fontSize:18,marginBottom:4}}>{s.icon}</div>
                  <div style={{fontSize:15,fontWeight:900,color:s.color,lineHeight:1}}>{s.value}</div>
                  <div style={{fontSize:9,color:"rgba(255,255,255,0.38)",fontWeight:800,marginTop:3,letterSpacing:.5}}>{s.label.toUpperCase()}</div>
                </div>
              ))}
            </div>

            {/* Reminder */}
            <div className="card" style={{padding:"14px 18px",marginBottom:20,display:"flex",alignItems:"center",justifyContent:"space-between",background:reminderSet?"rgba(94,232,194,0.06)":"rgba(59,127,196,0.08)",borderColor:reminderSet?"rgba(94,232,194,0.22)":C.border}}>
              <div>
                <p style={{fontWeight:800,fontSize:13,marginBottom:2}}>{reminderSet?"⏰ Recordatorios activos":"⏰ Configura recordatorios"}</p>
                <p style={{fontSize:11,color:"rgba(255,255,255,0.4)"}}>{reminderSet?"Cada 2 horas recibirás tu pausa":"Nunca olvides tu pausa activa"}</p>
              </div>
              <button className="btn-g" onClick={()=>{setReminderSet(!reminderSet);notify(reminderSet?"Recordatorios desactivados":"¡Recordatorios activos cada 2h! ⏰");}}>
                {reminderSet?"Desact.":"Activar"}
              </button>
            </div>

            {/* Quick start */}
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
              <h2 style={{fontFamily:"'Barlow Condensed',sans-serif",fontSize:20,fontWeight:800,letterSpacing:.4}}>Pausa rápida 🚀</h2>
              <button className="btn-g" style={{fontSize:11}} onClick={()=>setView("exercises")}>Ver todas</button>
            </div>
            <div style={{display:"grid",gap:10}}>
              {EXERCISES.slice(0,3).map((ex,i)=>(
                <div key={ex.id} className={`ex-card su`} style={{animationDelay:`${i*.08}s`,display:"flex",alignItems:"center",justifyContent:"space-between"}} onClick={()=>startExercise(ex)}>
                  <div style={{display:"flex",alignItems:"center",gap:13}}>
                    <div style={{width:44,height:44,background:"rgba(59,127,196,0.15)",borderRadius:12,display:"flex",alignItems:"center",justifyContent:"center",fontSize:20,border:`1px solid rgba(109,187,223,0.18)`}}>{ex.emoji}</div>
                    <div>
                      <p style={{fontWeight:800,fontSize:14,marginBottom:3}}>{ex.name}</p>
                      <div style={{display:"flex",gap:6,alignItems:"center"}}>
                        <span style={{fontSize:10,color:"rgba(255,255,255,0.38)"}}>⏱ {ex.duration}s</span>
                        <span className="badge">+{ex.points} pts</span>
                      </div>
                    </div>
                  </div>
                  <span style={{color:C.accent,fontSize:20,fontWeight:700}}>›</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ═══════════ EXERCISES ═══════════ */}
      {view === "exercises" && (
        <div style={{paddingBottom:100}} className="fi">
          <Header title="Ejercicios 💪" sub="Elige tu pausa activa"/>
          <div style={{padding:"0 20px",display:"grid",gap:11}}>
            {EXERCISES.map((ex,i)=>(
              <div key={ex.id} className={`ex-card su`} style={{animationDelay:`${i*.07}s`}} onClick={()=>startExercise(ex)}>
                <div style={{display:"flex",alignItems:"center",justifyContent:"space-between"}}>
                  <div style={{display:"flex",alignItems:"center",gap:14}}>
                    <div style={{width:50,height:50,background:"rgba(59,127,196,0.14)",borderRadius:13,display:"flex",alignItems:"center",justifyContent:"center",fontSize:22,border:`1px solid rgba(109,187,223,0.17)`}}>{ex.emoji}</div>
                    <div>
                      <p style={{fontWeight:800,fontSize:15,marginBottom:5}}>{ex.name}</p>
                      <div style={{display:"flex",gap:7,flexWrap:"wrap",alignItems:"center"}}>
                        <span style={{fontSize:10,color:"rgba(255,255,255,0.38)",background:"rgba(255,255,255,0.06)",padding:"2px 8px",borderRadius:10}}>{ex.category}</span>
                        <span style={{fontSize:10,color:"rgba(255,255,255,0.38)"}}>⏱ {ex.duration}s</span>
                        <span className="badge">+{ex.points} pts</span>
                      </div>
                    </div>
                  </div>
                  <span style={{color:C.accent,fontSize:20}}>›</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ═══════════ EXERCISE PLAYER ═══════════ */}
      {view === "exercise" && activeExercise && (
        <div style={{padding:"24px 20px 100px",position:"relative",zIndex:1}} className="fi">
          <button className="btn-g" style={{marginBottom:22}} onClick={()=>{setView("exercises");setTimerRunning(false);clearInterval(intervalRef.current);}}>← Volver</button>

          <div style={{textAlign:"center",marginBottom:28}}>
            <div style={{fontSize:52,marginBottom:10}}>{activeExercise.emoji}</div>
            <h1 style={{fontFamily:"'Barlow Condensed',sans-serif",fontSize:24,fontWeight:800,letterSpacing:.3,marginBottom:8}}>{activeExercise.name}</h1>
            <span className="badge">{activeExercise.category}</span>
          </div>

          {/* Ring timer */}
          <div style={{display:"flex",justifyContent:"center",marginBottom:26}}>
            <div style={{position:"relative",width:164,height:164}}>
              <svg width="164" height="164" style={{position:"absolute"}}>
                <defs>
                  <linearGradient id="rg" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#2B6FA8"/>
                    <stop offset="100%" stopColor="#6DBBDF"/>
                  </linearGradient>
                </defs>
                <circle cx="82" cy="82" r="72" fill="none" stroke="rgba(59,127,196,0.12)" strokeWidth="8"/>
                <circle cx="82" cy="82" r="72" fill="none" stroke="url(#rg)" strokeWidth="8"
                  strokeLinecap="round"
                  strokeDasharray={`${2*Math.PI*72}`}
                  strokeDashoffset={`${2*Math.PI*72*(1-progress/100)}`}
                  transform="rotate(-90 82 82)"
                  style={{transition:"stroke-dashoffset .5s ease"}}/>
              </svg>
              <div style={{position:"absolute",inset:0,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center"}}>
                <span style={{fontFamily:"'Barlow Condensed',sans-serif",fontSize:40,fontWeight:800,color:C.accent,lineHeight:1}}>{fmt(timer)}</span>
                <span style={{fontSize:9,color:"rgba(255,255,255,0.32)",fontWeight:800,letterSpacing:1.5,marginTop:3}}>SEGUNDOS</span>
              </div>
            </div>
          </div>

          {/* Steps */}
          <div className="card" style={{padding:"16px 18px",marginBottom:22}}>
            <p style={{fontSize:9,color:"rgba(255,255,255,0.32)",fontWeight:800,letterSpacing:1.8,marginBottom:10}}>PASOS</p>
            {activeExercise.steps.map((step,i)=>(
              <div key={i} style={{display:"flex",gap:12,alignItems:"flex-start",padding:"8px 0",borderBottom:i<activeExercise.steps.length-1?"1px solid rgba(255,255,255,0.05)":"none",cursor:"pointer"}} onClick={()=>setCurrentStep(i)}>
                <div style={{width:24,height:24,borderRadius:"50%",background:i===currentStep?"#3B7FC4":i<currentStep?"rgba(94,232,194,0.4)":"rgba(255,255,255,0.07)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:10,fontWeight:900,flexShrink:0,color:"#fff"}}>
                  {i<currentStep?"✓":i+1}
                </div>
                <p style={{fontSize:13,color:i===currentStep?"#fff":"rgba(255,255,255,0.43)",fontWeight:i===currentStep?700:400,paddingTop:3}}>{step}</p>
              </div>
            ))}
          </div>

          <div style={{display:"flex",gap:10}}>
            <button className="btn-p" style={{flex:1}} onClick={toggleTimer}>
              {timerRunning?"⏸ Pausar":timer===0?"🔄 Reiniciar":"▶ Iniciar"}
            </button>
            {currentStep < activeExercise.steps.length-1 && (
              <button className="btn-g" onClick={()=>setCurrentStep(s=>s+1)}>Siguiente →</button>
            )}
          </div>
        </div>
      )}

      {/* ═══════════ RANKING ═══════════ */}
      {view === "ranking" && (
        <div style={{paddingBottom:100}} className="fi">
          <Header title="Ranking 🏆" sub="Competencia entre empresas"/>
          <div style={{padding:"0 20px"}}>
            {/* Filter pills */}
            <div style={{display:"flex",gap:7,overflowX:"auto",paddingBottom:14,marginBottom:16,scrollbarWidth:"none"}}>
              {["Todos",...COMPANIES.map(c=>c.name)].map(c=>(
                <button key={c} className="pill" onClick={()=>setSelectedCompany(c)}
                  style={{background:selectedCompany===c?"#3B7FC4":"rgba(255,255,255,0.06)",borderColor:selectedCompany===c?"#3B7FC4":"transparent",color:selectedCompany===c?"#fff":"rgba(255,255,255,0.5)",whiteSpace:"nowrap"}}>
                  {c}
                </button>
              ))}
            </div>

            <p style={{fontSize:9,color:"rgba(255,255,255,0.32)",fontWeight:800,letterSpacing:1.8,marginBottom:10}}>RANKING EMPRESAS</p>
            {[...COMPANY_STATS].sort((a,b)=>b.totalPauses-a.totalPauses).map((co,i)=>(
              <div key={co.id} className="rrow" style={{marginBottom:4}}>
                <div style={{width:30,textAlign:"center",fontWeight:900,fontSize:15,color:i===0?"#FFD166":i===1?"#C8C8C8":i===2?"#CD9B32":"rgba(255,255,255,0.22)"}}>
                  {i===0?"🥇":i===1?"🥈":i===2?"🥉":`#${i+1}`}
                </div>
                <div style={{width:9,height:9,borderRadius:"50%",background:co.color,flexShrink:0}}/>
                <div style={{flex:1}}>
                  <p style={{fontWeight:800,fontSize:13}}>{co.name}</p>
                  <div style={{height:3,background:"rgba(255,255,255,0.06)",borderRadius:2,marginTop:5,overflow:"hidden"}}>
                    <div style={{height:"100%",width:`${co.participation}%`,background:`linear-gradient(90deg,#2B6FA8,#6DBBDF)`,borderRadius:2}}/>
                  </div>
                </div>
                <div style={{textAlign:"right"}}>
                  <p style={{fontWeight:900,fontSize:13,color:C.accent}}>{co.totalPauses}</p>
                  <p style={{fontSize:9,color:"rgba(255,255,255,0.28)"}}>pausas</p>
                </div>
              </div>
            ))}

            <p style={{fontSize:9,color:"rgba(255,255,255,0.32)",fontWeight:800,letterSpacing:1.8,marginTop:22,marginBottom:10}}>TOP PERSONAS</p>
            {[...USERS_DATA].sort((a,b)=>b.points-a.points).filter(u=>selectedCompany==="Todos"||u.company===selectedCompany).map((u,i)=>(
              <div key={u.id} className="rrow" style={{background:u.name==="Sofía Mora"?"rgba(59,127,196,0.1)":"transparent",marginBottom:4}}>
                <div style={{width:26,textAlign:"center",fontWeight:900,fontSize:12,color:i<3?"#FFD166":"rgba(255,255,255,0.22)"}}>#{i+1}</div>
                <div style={{width:34,height:34,background:`hsl(${210+u.id*15},50%,42%)`,borderRadius:"50%",display:"flex",alignItems:"center",justifyContent:"center",fontWeight:900,fontSize:13}}>{u.name[0]}</div>
                <div style={{flex:1}}>
                  <p style={{fontWeight:800,fontSize:13}}>{u.name}{u.name==="Sofía Mora"&&<span style={{color:C.accent,fontSize:10,marginLeft:5}}>(Tú)</span>}</p>
                  <p style={{fontSize:10,color:"rgba(255,255,255,0.32)"}}>{u.company} · 🔥{u.streak} días</p>
                </div>
                <div style={{textAlign:"right"}}>
                  <p style={{fontWeight:900,fontSize:13,color:"#FFD166"}}>⚡{u.points}</p>
                  <p style={{fontSize:9,color:"rgba(255,255,255,0.28)"}}>{u.pauses} pausas</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ═══════════ DASHBOARD ═══════════ */}
      {view === "dashboard" && (
        <div style={{paddingBottom:100}} className="fi">
          <Header title="Dashboard 📊" sub="Visión global · 14+ empresas"/>
          <div style={{padding:"0 20px"}}>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:11,marginBottom:22}}>
              {[
                {label:"Total empresas",    value:"14+",   icon:"🏢", color:C.accent},
                {label:"Empleados activos", value:"1,240", icon:"👥", color:"#5EE8C2"},
                {label:"Pausas este mes",   value:"8,340", icon:"✅", color:"#FFD166"},
                {label:"Participación",     value:"73%",   icon:"📈", color:"#A78BFA"},
              ].map(s=>(
                <div key={s.label} className="card" style={{padding:"18px 16px"}}>
                  <div style={{fontSize:22,marginBottom:8}}>{s.icon}</div>
                  <div style={{fontSize:26,fontWeight:900,color:s.color,fontFamily:"'Barlow Condensed',sans-serif",letterSpacing:.4,lineHeight:1,marginBottom:4}}>{s.value}</div>
                  <div style={{fontSize:11,color:"rgba(255,255,255,0.38)",fontWeight:700}}>{s.label}</div>
                </div>
              ))}
            </div>

            <p style={{fontSize:9,color:"rgba(255,255,255,0.32)",fontWeight:800,letterSpacing:1.8,marginBottom:12}}>POR EMPRESA</p>
            <div style={{display:"grid",gap:10}}>
              {COMPANY_STATS.map(co=>(
                <div key={co.id} className="card" style={{padding:"15px 17px"}}>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
                    <div style={{display:"flex",alignItems:"center",gap:10}}>
                      <div style={{width:36,height:36,borderRadius:10,background:co.color+"22",border:`2px solid ${co.color}44`,display:"flex",alignItems:"center",justifyContent:"center",fontWeight:900,fontSize:12,color:co.color}}>
                        {co.name.slice(0,2).toUpperCase()}
                      </div>
                      <div>
                        <p style={{fontWeight:800,fontSize:14}}>{co.name}</p>
                        <p style={{fontSize:10,color:"rgba(255,255,255,0.32)"}}>{co.employees} empleados</p>
                      </div>
                    </div>
                    <div style={{textAlign:"right"}}>
                      <p style={{fontWeight:900,color:co.color,fontSize:18,fontFamily:"'Barlow Condensed',sans-serif"}}>{co.participation}%</p>
                      <p style={{fontSize:9,color:"rgba(255,255,255,0.28)"}}>participación</p>
                    </div>
                  </div>
                  <div style={{height:5,background:"rgba(255,255,255,0.05)",borderRadius:3,overflow:"hidden"}}>
                    <div style={{height:"100%",width:`${co.participation}%`,background:`linear-gradient(90deg,#2B6FA8,${co.color})`,borderRadius:3}}/>
                  </div>
                  <div style={{display:"flex",justifyContent:"space-between",marginTop:8}}>
                    <span style={{fontSize:10,color:"rgba(255,255,255,0.32)"}}>📋 {co.totalPauses} pausas</span>
                    <span style={{fontSize:10,color:"rgba(255,255,255,0.32)"}}>⚡ {co.avgPoints} pts prom.</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ═══════════ BOTTOM NAV ═══════════ */}
      <div style={{position:"fixed",bottom:0,left:"50%",transform:"translateX(-50%)",width:"100%",maxWidth:430,background:"rgba(14,26,48,0.97)",backdropFilter:"blur(20px)",borderTop:`1px solid rgba(59,127,196,0.22)`,padding:"10px 16px 18px",display:"flex",justifyContent:"space-around",zIndex:100}}>
        {[
          {id:"home",      icon:"🏠", label:"INICIO"},
          {id:"exercises", icon:"💪", label:"EJERCICIOS"},
          {id:"ranking",   icon:"🏆", label:"RANKING"},
          {id:"dashboard", icon:"📊", label:"DASHBOARD"},
        ].map(n=>(
          <button key={n.id} className={`nav-btn${(view===n.id||(view==="exercise"&&n.id==="exercises"))?" active":""}`}
            onClick={()=>{setView(n.id);setTimerRunning(false);clearInterval(intervalRef.current);}}>
            <span style={{fontSize:18}}>{n.icon}</span>
            {n.label}
          </button>
        ))}
      </div>
    </div>
  );
}
