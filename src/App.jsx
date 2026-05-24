import { useState, useEffect, useCallback } from "react";

// ─── SPEECH ───────────────────────────────────────────────────────────────────
const CHILD = "Anu";
function speak(text, rate = 0.82, pitch = 1.1) {
  if (!window.speechSynthesis) return;
  window.speechSynthesis.cancel();
  const utt = new SpeechSynthesisUtterance(text);
  utt.rate = rate; utt.pitch = pitch; utt.lang = "en-US";
  const vList = window.speechSynthesis.getVoices();
  const picked = vList.find(vx => /samantha|karen|moira|victoria|zira/i.test(vx.name))
    || vList.find(vx => vx.lang === "en-US");
  if (picked) utt.voice = picked;
  window.speechSynthesis.speak(utt);
}
const PRAISE_LIST = [`Amazing, ${CHILD}!`,"You got it!","Superstar!",`Brilliant, ${CHILD}!`,"Yes! That's right!","Fantastic!"];
const RETRY_LIST  = [`Good try! Let's try again.`,`Almost there, ${CHILD}!`,"Don't give up, you can do it!","That's okay, try once more!"];
const DONE_LIST   = [`Wow, you finished! I'm so proud of you, ${CHILD}!`,`You are a reading star, ${CHILD}!`,`Amazing work today, ${CHILD}!`];
const rnd = arr => arr[Math.floor(Math.random()*arr.length)];
const praise    = () => speak(rnd(PRAISE_LIST));
const retry     = () => speak(rnd(RETRY_LIST));
const doneSpeak = () => speak(rnd(DONE_LIST));

// ─── STORAGE ──────────────────────────────────────────────────────────────────
const SK = { pin:"anu_pin", startDate:"anu_start", history:"anu_history", stars:"anu_stars" };
function load(k,def){ try{ const v=localStorage.getItem(k); return v!==null?JSON.parse(v):def; }catch{ return def; } }
function save(k,v)  { try{ localStorage.setItem(k,JSON.stringify(v)); }catch{} }

// ─── DATE ─────────────────────────────────────────────────────────────────────
function todayStr(){ return new Date().toISOString().slice(0,10); }
function dayNumber(startDate){
  if(!startDate) return 1;
  const s=new Date(startDate+"T12:00:00"), t=new Date(todayStr()+"T12:00:00");
  return Math.max(1,Math.round((t-s)/86400000)+1);
}
function fmtDate(ds){ return new Date(ds+"T12:00:00").toLocaleDateString("en-US",{weekday:"long",month:"long",day:"numeric",year:"numeric"}); }

// ─── DATA ─────────────────────────────────────────────────────────────────────
const ALPHABET=[
  {letter:"A",sound:"aah",word:"Apple",emoji:"🍎"},{letter:"B",sound:"buh",word:"Ball",emoji:"🏀"},
  {letter:"C",sound:"kuh",word:"Cat",emoji:"🐱"},{letter:"D",sound:"duh",word:"Dog",emoji:"🐶"},
  {letter:"E",sound:"eh",word:"Egg",emoji:"🥚"},{letter:"F",sound:"fuh",word:"Fish",emoji:"🐟"},
  {letter:"G",sound:"guh",word:"Goat",emoji:"🐐"},{letter:"H",sound:"huh",word:"Hat",emoji:"🎩"},
  {letter:"I",sound:"ih",word:"Insect",emoji:"🐛"},{letter:"J",sound:"juh",word:"Jam",emoji:"🍓"},
  {letter:"K",sound:"kuh",word:"Kite",emoji:"🪁"},{letter:"L",sound:"luh",word:"Lion",emoji:"🦁"},
  {letter:"M",sound:"muh",word:"Moon",emoji:"🌙"},{letter:"N",sound:"nuh",word:"Nest",emoji:"🪺"},
  {letter:"O",sound:"oh",word:"Octopus",emoji:"🐙"},{letter:"P",sound:"puh",word:"Pig",emoji:"🐷"},
  {letter:"Q",sound:"kwuh",word:"Queen",emoji:"👑"},{letter:"R",sound:"ruh",word:"Rain",emoji:"🌧️"},
  {letter:"S",sound:"sss",word:"Sun",emoji:"☀️"},{letter:"T",sound:"tuh",word:"Tiger",emoji:"🐯"},
  {letter:"U",sound:"uh",word:"Umbrella",emoji:"☂️"},{letter:"V",sound:"vuh",word:"Van",emoji:"🚐"},
  {letter:"W",sound:"wuh",word:"Worm",emoji:"🪱"},{letter:"X",sound:"ks",word:"Box",emoji:"📦"},
  {letter:"Y",sound:"yuh",word:"Yak",emoji:"🦬"},{letter:"Z",sound:"zzz",word:"Zebra",emoji:"🦓"},
];
const CVC_BANK=[
  {word:"cat",emoji:"🐱",family:"-at"},{word:"bat",emoji:"🦇",family:"-at"},{word:"hat",emoji:"🎩",family:"-at"},
  {word:"mat",emoji:"🪣",family:"-at"},{word:"rat",emoji:"🐭",family:"-at"},{word:"sat",emoji:"🪑",family:"-at"},
  {word:"can",emoji:"🥫",family:"-an"},{word:"man",emoji:"🧑",family:"-an"},{word:"fan",emoji:"🌀",family:"-an"},
  {word:"pan",emoji:"🍳",family:"-an"},{word:"ran",emoji:"🏃",family:"-an"},{word:"van",emoji:"🚐",family:"-an"},
  {word:"cap",emoji:"🧢",family:"-ap"},{word:"map",emoji:"🗺️",family:"-ap"},{word:"nap",emoji:"😴",family:"-ap"},
  {word:"tap",emoji:"🚰",family:"-ap"},{word:"zap",emoji:"⚡",family:"-ap"},
  {word:"hen",emoji:"🐔",family:"-en"},{word:"pen",emoji:"✏️",family:"-en"},{word:"ten",emoji:"🔟",family:"-en"},
  {word:"men",emoji:"👥",family:"-en"},{word:"den",emoji:"🏠",family:"-en"},
  {word:"jet",emoji:"✈️",family:"-et"},{word:"net",emoji:"🥅",family:"-et"},{word:"pet",emoji:"🐾",family:"-et"},
  {word:"set",emoji:"🎮",family:"-et"},{word:"wet",emoji:"💧",family:"-et"},
  {word:"bit",emoji:"🦷",family:"-it"},{word:"hit",emoji:"⚾",family:"-it"},{word:"sit",emoji:"🪑",family:"-it"},
  {word:"kit",emoji:"🧰",family:"-it"},{word:"fit",emoji:"🏋️",family:"-it"},
  {word:"bin",emoji:"🗑️",family:"-in"},{word:"fin",emoji:"🐬",family:"-in"},{word:"pin",emoji:"📌",family:"-in"},
  {word:"tin",emoji:"🥫",family:"-in"},{word:"win",emoji:"🏆",family:"-in"},
  {word:"hot",emoji:"🔥",family:"-ot"},{word:"dot",emoji:"🔵",family:"-ot"},{word:"pot",emoji:"🍯",family:"-ot"},
  {word:"lot",emoji:"🅿️",family:"-ot"},{word:"cot",emoji:"🛏️",family:"-ot"},
  {word:"hop",emoji:"🐰",family:"-op"},{word:"mop",emoji:"🧹",family:"-op"},{word:"pop",emoji:"🍿",family:"-op"},
  {word:"top",emoji:"🌀",family:"-op"},{word:"cop",emoji:"👮",family:"-op"},
  {word:"bug",emoji:"🐛",family:"-ug"},{word:"hug",emoji:"🤗",family:"-ug"},{word:"mug",emoji:"☕",family:"-ug"},
  {word:"rug",emoji:"🪣",family:"-ug"},{word:"tug",emoji:"⛵",family:"-ug"},
  {word:"fun",emoji:"🎉",family:"-un"},{word:"run",emoji:"🏃",family:"-un"},{word:"sun",emoji:"☀️",family:"-un"},
  {word:"bun",emoji:"🍞",family:"-un"},{word:"gun",emoji:"🎯",family:"-un"},
  {word:"cut",emoji:"✂️",family:"-ut"},{word:"hut",emoji:"🛖",family:"-ut"},{word:"nut",emoji:"🥜",family:"-ut"},
  {word:"but",emoji:"↩️",family:"-ut"},{word:"put",emoji:"📥",family:"-ut"},
];
const SIGHT_WORDS=[
  {word:"a",sentence:"I see a cat."},{word:"and",sentence:"A dog and a cat."},
  {word:"away",sentence:"The bird flew away."},{word:"big",sentence:"That is a big dog!"},
  {word:"blue",sentence:"The sky is blue."},{word:"can",sentence:"I can run fast."},
  {word:"come",sentence:"Come here please!"},{word:"down",sentence:"The ball fell down."},
  {word:"find",sentence:"Can you find it?"},{word:"for",sentence:"This is for you."},
  {word:"funny",sentence:"The clown is funny!"},{word:"go",sentence:"Let us go now."},
  {word:"help",sentence:"I need your help."},{word:"here",sentence:"Come over here!"},
  {word:"I",sentence:"I love to read."},{word:"in",sentence:"The cat is in the box."},
  {word:"is",sentence:"The sun is hot."},{word:"it",sentence:"It is a big hat."},
  {word:"jump",sentence:"I can jump high!"},{word:"little",sentence:"A little bug sat."},
  {word:"look",sentence:"Look at the moon!"},{word:"make",sentence:"Let us make a cake."},
  {word:"me",sentence:"Give it to me."},{word:"my",sentence:"This is my book."},
  {word:"not",sentence:"I can not fly."},{word:"one",sentence:"I have one pet."},
  {word:"play",sentence:"Let us play outside!"},{word:"red",sentence:"The apple is red."},
  {word:"run",sentence:"I like to run."},{word:"said",sentence:"She said hello."},
  {word:"see",sentence:"I can see stars!"},{word:"the",sentence:"The dog runs fast."},
  {word:"three",sentence:"I have three cats."},{word:"to",sentence:"I go to school."},
  {word:"two",sentence:"I have two dogs."},{word:"up",sentence:"Look up at the sky!"},
  {word:"we",sentence:"We love to read!"},{word:"where",sentence:"Where is my hat?"},
  {word:"yellow",sentence:"The sun is yellow."},{word:"you",sentence:"Can you read this?"},
  {word:"all",sentence:"We all had fun."},{word:"am",sentence:"I am five years old."},
  {word:"are",sentence:"You are my friend."},{word:"at",sentence:"I am at school."},
  {word:"ate",sentence:"I ate my lunch."},{word:"be",sentence:"I want to be a star."},
  {word:"black",sentence:"The cat is black."},{word:"brown",sentence:"A brown dog ran."},
  {word:"but",sentence:"I tried but fell."},{word:"came",sentence:"She came to play."},
  {word:"did",sentence:"Did you see that?"},{word:"do",sentence:"Do you like cats?"},
  {word:"eat",sentence:"Let us eat now."},{word:"four",sentence:"I have four books."},
  {word:"get",sentence:"Go get your bag."},{word:"good",sentence:"You did a good job!"},
  {word:"have",sentence:"I have a pet fish."},{word:"he",sentence:"He runs very fast."},
  {word:"into",sentence:"Jump into the pool!"},{word:"like",sentence:"I like sunny days."},
  {word:"must",sentence:"You must eat well."},{word:"new",sentence:"I got a new book!"},
  {word:"no",sentence:"No that is wrong."},{word:"now",sentence:"Let us go now."},
  {word:"on",sentence:"The hat is on top."},{word:"our",sentence:"This is our school."},
  {word:"out",sentence:"Go out and play!"},{word:"please",sentence:"Please be kind."},
  {word:"pretty",sentence:"What a pretty flower!"},{word:"ran",sentence:"The dog ran away."},
  {word:"ride",sentence:"I can ride a bike."},{word:"saw",sentence:"I saw a big bird."},
  {word:"say",sentence:"What did you say?"},{word:"she",sentence:"She is my friend."},
  {word:"so",sentence:"I was so happy!"},{word:"soon",sentence:"We will eat soon."},
  {word:"that",sentence:"That is my bag."},{word:"there",sentence:"Look over there!"},
  {word:"they",sentence:"They are playing."},{word:"this",sentence:"This is my book."},
  {word:"too",sentence:"Me too! I love it!"},{word:"under",sentence:"The cat hid under the bed."},
  {word:"want",sentence:"I want to read more."},{word:"was",sentence:"It was a sunny day."},
  {word:"well",sentence:"You did very well!"},{word:"went",sentence:"We went to the park."},
  {word:"what",sentence:"What is that?"},{word:"white",sentence:"Snow is white."},
  {word:"who",sentence:"Who has my book?"},{word:"will",sentence:"I will read today."},
  {word:"with",sentence:"Come play with me."},{word:"yes",sentence:"Yes I can do it!"},
  {word:"your",sentence:"Is this your hat?"},
];
const SENTENCES=[
  {text:"The cat sat on a mat.",emoji:"🐱"},{text:"I can see a big red bug.",emoji:"🐛"},
  {text:"The dog ran to me.",emoji:"🐶"},{text:"I am a good reader!",emoji:"📚"},
  {text:"The sun is hot and yellow.",emoji:"☀️"},{text:"A little hen sat in the pen.",emoji:"🐔"},
  {text:"Can you see the big map?",emoji:"🗺️"},{text:"The fat rat sat on the hat.",emoji:"🐭"},
  {text:"We can run and jump.",emoji:"🏃"},{text:"I like my new red hat.",emoji:"🎩"},
  {text:"The pig went into the hut.",emoji:"🐷"},{text:"She can hit the ball.",emoji:"⚾"},
  {text:"Look at the big blue bus.",emoji:"🚌"},{text:"I am so happy to read!",emoji:"😊"},
  {text:"The black cat ran away.",emoji:"🐱"},{text:"My little dog can sit.",emoji:"🐶"},
  {text:"I will play with you now.",emoji:"🎉"},{text:"Go get the red cup please.",emoji:"☕"},
  {text:"Did you see the funny bug?",emoji:"🐛"},{text:"The brown hen sat on top.",emoji:"🐔"},
];

// ─── UTILS ────────────────────────────────────────────────────────────────────
function shuffle(arr){ return [...arr].sort(()=>Math.random()-.5); }
function buildDayPlan(dayNum){
  const seed=dayNum-1;
  const alphaStart=(seed*5)%26;
  const alphaLetters=Array.from({length:5},(_,i)=>ALPHABET[(alphaStart+i)%26]);
  const families=[...new Set(CVC_BANK.map(w=>w.family))];
  const family=families[seed%families.length];
  const familyWords=shuffle(CVC_BANK.filter(w=>w.family===family)).slice(0,6);
  const swStart=(seed*10)%SIGHT_WORDS.length;
  const sightWords=Array.from({length:10},(_,i)=>SIGHT_WORDS[(swStart+i)%SIGHT_WORDS.length]);
  const sentStart=(seed*5)%SENTENCES.length;
  const sentences=Array.from({length:5},(_,i)=>SENTENCES[(sentStart+i)%SENTENCES.length]);
  const quizLetters=shuffle([...ALPHABET]).slice(0,8).map(L=>{
    const wrong=shuffle(ALPHABET.filter(x=>x.letter!==L.letter)).slice(0,3).map(x=>x.letter);
    return{...L,options:shuffle([L.letter,...wrong])};
  });
  const typingPool=shuffle([
    ...shuffle(CVC_BANK).slice(0,6).map(w=>({word:w.word,emoji:w.emoji})),
    ...shuffle(SIGHT_WORDS.filter(w=>w.word.length<=4)).slice(0,4).map(w=>({word:w.word,emoji:"⭐"})),
  ]);
  return{alphaLetters,family,familyWords,sightWords,sentences,quizLetters,typingPool};
}

// ─── COLORS ───────────────────────────────────────────────────────────────────
const C={coral:"#FF6B6B",orange:"#FF922B",green:"#20C997",blue:"#4D96FF",purple:"#845EF7",yellow:"#FFD43B",pink:"#F06595",teal:"#12B886",dark:"#2D3436"};

// ─── SHARED UI ────────────────────────────────────────────────────────────────
function Btn({color=C.coral,children,onClick,small,outline,disabled,full}){
  return(
    <button disabled={disabled} onClick={onClick} style={{
      fontFamily:"'Fredoka One',cursive",fontSize:small?13:16,borderRadius:40,
      padding:small?"7px 16px":"12px 28px",cursor:disabled?"not-allowed":"pointer",
      border:outline?`2.5px solid ${color}`:"none",
      background:outline?"transparent":disabled?"#ccc":color,
      color:outline?color:"#fff",boxShadow:outline||disabled?"none":`0 4px 0 ${color}88`,
      opacity:disabled?.55:1,transition:"transform .1s",width:full?"100%":"auto",display:"inline-block",
    }}
    onMouseDown={e=>{ if(!outline&&!disabled) e.currentTarget.style.transform="translateY(3px)"; }}
    onMouseUp={e=>{ e.currentTarget.style.transform=""; }}
    >{children}</button>
  );
}
function SpeakBtn({text,label,color=C.blue}){
  const [on,setOn]=useState(false);
  return(
    <button onClick={()=>{ setOn(true); speak(text); setTimeout(()=>setOn(false),1400); }} style={{
      background:on?color:`${color}18`,border:`2px solid ${color}`,borderRadius:40,padding:"5px 14px",
      cursor:"pointer",fontFamily:"'Nunito',sans-serif",fontWeight:700,fontSize:13,
      color:on?"#fff":color,transition:"all .2s",display:"inline-flex",alignItems:"center",gap:5,
    }}>🔊 {label||"Hear it"}</button>
  );
}
function ProgressBar({value,max,color=C.green}){
  return(
    <div style={{background:"#eee",borderRadius:20,height:10,overflow:"hidden",margin:"6px 0"}}>
      <div style={{width:`${Math.min(100,Math.round(value/max*100))}%`,height:"100%",background:color,borderRadius:20,transition:"width .4s"}}/>
    </div>
  );
}
function Confetti(){
  const cols=[C.coral,C.yellow,C.green,C.blue,C.orange,C.purple,C.pink];
  return(
    <div style={{position:"fixed",top:0,left:0,width:"100%",height:"100%",pointerEvents:"none",zIndex:9999}}>
      {Array.from({length:34}).map((_,i)=>(
        <div key={i} style={{position:"absolute",left:`${Math.random()*100}%`,top:"-16px",
          width:8+Math.random()*10,height:8+Math.random()*10,borderRadius:Math.random()>.5?"50%":3,
          background:cols[i%cols.length],animation:`cffall ${1+Math.random()*.8}s linear forwards`,
          animationDelay:`${Math.random()*.6}s`}}/>
      ))}
      <style>{`@keyframes cffall{to{transform:translateY(110vh) rotate(720deg);opacity:0;}}`}</style>
    </div>
  );
}
function Card({children,color=C.coral,style={}}){
  return <div style={{background:"#fff",border:`3px solid ${color}`,borderRadius:24,padding:"20px 18px",boxShadow:`0 6px 0 ${color}44`,...style}}>{children}</div>;
}
function BackBtn({onBack}){
  return <button onClick={onBack} style={{background:"none",border:"2px solid #ddd",borderRadius:20,padding:"6px 16px",fontFamily:"'Nunito',sans-serif",color:"#888",cursor:"pointer",fontSize:13,marginBottom:6}}>← Back</button>;
}
const PS={padding:"14px 16px",maxWidth:480,margin:"0 auto"};
const ST={fontFamily:"'Nunito',sans-serif",color:"#888",fontSize:13,margin:"3px 0"};
const MT=c=>({fontFamily:"'Fredoka One',cursive",color:c,fontSize:21,margin:"6px 0 2px"});

// ─── KEYBOARD ─────────────────────────────────────────────────────────────────
const KB_ROWS=[["Q","W","E","R","T","Y","U","I","O","P"],["A","S","D","F","G","H","J","K","L"],["Z","X","C","V","B","N","M","⌫"]];
function Keyboard({onKey}){
  return(
    <div style={{display:"flex",flexDirection:"column",gap:5,alignItems:"center",marginTop:10}}>
      {KB_ROWS.map((row,ri)=>(
        <div key={ri} style={{display:"flex",gap:4,justifyContent:"center"}}>
          {row.map(k=>(
            <button key={k} onClick={()=>onKey(k)} style={{
              width:k==="⌫"?46:33,height:38,background:k==="⌫"?C.coral:"#fff",
              border:`2px solid ${k==="⌫"?C.coral:"#ddd"}`,borderRadius:8,
              fontFamily:"'Fredoka One',cursive",fontSize:14,color:k==="⌫"?"#fff":"#444",cursor:"pointer",
            }}>{k}</button>
          ))}
        </div>
      ))}
    </div>
  );
}

// ─── TASK: ALPHABET ───────────────────────────────────────────────────────────
function AlphaWarmup({letters,onDone}){
  const [idx,setIdx]=useState(0);
  const [revealed,setRevealed]=useState(false);
  const L=letters[idx];
  useEffect(()=>{ speak(`${L.letter} says ${L.sound}. ${L.letter} for ${L.word}.`); },[idx]);
  const next=()=>{ setRevealed(false); if(idx<letters.length-1) setIdx(i=>i+1); else{ doneSpeak(); setTimeout(()=>onDone({correct:letters.length,total:letters.length}),500); } };
  return(
    <div style={PS}>
      <h3 style={MT(C.orange)}>🔤 Alphabet Warm-Up</h3>
      <p style={ST}>Letter {idx+1} of {letters.length}</p>
      <ProgressBar value={idx+1} max={letters.length} color={C.orange}/>
      <Card color={C.orange} style={{textAlign:"center",marginTop:14}}>
        <div style={{fontSize:64}}>{L.emoji}</div>
        <div style={{fontFamily:"'Fredoka One',cursive",fontSize:80,color:C.orange,lineHeight:1}}>{L.letter}</div>
        <div style={{display:"flex",gap:8,justifyContent:"center",marginTop:10,flexWrap:"wrap"}}>
          <SpeakBtn text={`${L.letter} says ${L.sound}`} label={`"${L.sound}"`} color={C.orange}/>
          <SpeakBtn text={L.word} label={L.word} color={C.coral}/>
        </div>
        {!revealed
          ?<><p style={{...ST,marginTop:12}}>Say the sound out loud, then tap 👇</p><div style={{marginTop:8}}><Btn color={C.orange} onClick={()=>setRevealed(true)}>Show Word 👀</Btn></div></>
          :<><div style={{fontFamily:"'Fredoka One',cursive",fontSize:30,color:C.purple,marginTop:10}}>{L.word}</div>
             <p style={ST}><strong>{L.letter}</strong> is for <strong>{L.word}</strong>!</p>
             <div style={{marginTop:10}}><Btn color={C.green} onClick={next}>{idx<letters.length-1?"Next →":"Done! ✅"}</Btn></div></>
        }
      </Card>
    </div>
  );
}

// ─── TASK: LETTER QUIZ ────────────────────────────────────────────────────────
function LetterQuiz({questions,onDone}){
  const [qi,setQi]=useState(0);
  const [sel,setSel]=useState(null);
  const [score,setScore]=useState(0);
  const [burst,setBurst]=useState(false);
  const Q=questions[qi];
  useEffect(()=>{ speak(`What letter does ${Q.word} start with?`); },[qi]);
  const choose=opt=>{ if(sel) return; setSel(opt); if(opt===Q.letter){ setScore(s=>s+1); setBurst(true); setTimeout(()=>setBurst(false),1200); praise(); } else speak(`The answer is ${Q.letter}. ${Q.letter} for ${Q.word}.`); };
  const next=()=>{ setSel(null); if(qi<questions.length-1) setQi(q=>q+1); else{ doneSpeak(); setTimeout(()=>onDone({correct:score+(sel===Q.letter?1:0),total:questions.length}),500); } };
  return(
    <div style={PS}>
      {burst&&<Confetti/>}
      <h3 style={MT(C.coral)}>🎯 Letter Quiz</h3>
      <p style={ST}>Question {qi+1} of {questions.length} · Score: {score}</p>
      <ProgressBar value={qi+1} max={questions.length} color={C.coral}/>
      <Card color={C.coral} style={{textAlign:"center",marginTop:14}}>
        <div style={{fontSize:68}}>{Q.emoji}</div>
        <p style={{fontFamily:"'Nunito',sans-serif",fontWeight:800,fontSize:15,color:C.dark,margin:"8px 0"}}>What letter does <em>{Q.word}</em> start with?</p>
        <SpeakBtn text={Q.word} label={Q.word} color={C.coral}/>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginTop:14}}>
          {Q.options.map(opt=>{ let bg="#fff",border="#ddd",col="#333"; if(sel){ if(opt===Q.letter){bg="#D3F9D8";border=C.green;col="#0f5132";} else if(opt===sel){bg="#FFE3E3";border=C.coral;col="#c0392b";} } return(<button key={opt} onClick={()=>choose(opt)} style={{background:bg,border:`2.5px solid ${border}`,borderRadius:16,padding:"14px 8px",fontSize:28,fontFamily:"'Fredoka One',cursive",color:col,cursor:sel?"default":"pointer",transition:"all .2s",boxShadow:sel?"none":"0 3px 0 #eee"}}>{opt}</button>); })}
        </div>
        {sel&&<div style={{marginTop:12}}><p style={{fontFamily:"'Nunito',sans-serif",fontWeight:700,fontSize:14,color:sel===Q.letter?C.green:C.coral}}>{sel===Q.letter?"✅ Correct! Amazing!":`❌ It's "${Q.letter}" — ${Q.letter} for ${Q.word}`}</p><Btn color={C.blue} onClick={next}>{qi<questions.length-1?"Next →":"Finish! 🏆"}</Btn></div>}
      </Card>
    </div>
  );
}

// ─── TASK: WORD FAMILY ────────────────────────────────────────────────────────
function WordFamilyTask({family,words,onDone}){
  const [wi,setWi]=useState(0);
  const [built,setBuilt]=useState([]);
  const [correct,setCorrect]=useState(false);
  const [burst,setBurst]=useState(false);
  const [score,setScore]=useState(0);
  const W=words[wi];
  const letters=W.word.toUpperCase().split("");
  const extras=shuffle(["X","Q","Z","J","V","K","W"].filter(l=>!letters.includes(l))).slice(0,3);
  const pool=shuffle([...letters,...extras]);
  useEffect(()=>{ speak(W.word); },[wi]);
  const pick=l=>{ if(correct||built.length>=letters.length) return; const nx=[...built,l]; setBuilt(nx); if(nx.length===letters.length){ const ok=nx.join("")===W.word.toUpperCase(); setCorrect(ok); if(ok){ setScore(s=>s+1); setBurst(true); setTimeout(()=>setBurst(false),1200); speak(`Great! ${W.word}!`); praise(); } else retry(); } };
  const nextWord=()=>{ setBuilt([]); setCorrect(false); if(wi<words.length-1) setWi(w=>w+1); else{ doneSpeak(); setTimeout(()=>onDone({correct:score,total:words.length}),500); } };
  return(
    <div style={PS}>
      {burst&&<Confetti/>}
      <h3 style={MT(C.green)}>🧩 Word Family <span style={{color:C.orange}}>{family}</span></h3>
      <p style={ST}>Word {wi+1} of {words.length}</p>
      <ProgressBar value={wi+1} max={words.length} color={C.green}/>
      <Card color={C.green} style={{textAlign:"center",marginTop:14}}>
        <div style={{fontSize:60}}>{W.emoji}</div>
        <SpeakBtn text={W.word} label={`Hear "${W.word}"`} color={C.green}/>
        <div style={{display:"flex",justifyContent:"center",gap:8,marginTop:14,marginBottom:16}}>
          {letters.map((_,i)=><div key={i} style={{width:48,height:52,border:`3px solid ${built[i]?(correct?C.green:C.blue):"#ddd"}`,borderRadius:14,display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"'Fredoka One',cursive",fontSize:24,color:correct?"#0f5132":"#333",background:built[i]?(correct?"#D3F9D8":"#EEF5FF"):"#fafafa",transition:"all .2s"}}>{built[i]||""}</div>)}
        </div>
        {!correct&&<div style={{display:"flex",flexWrap:"wrap",gap:8,justifyContent:"center",marginBottom:10}}>{pool.map((l,i)=><button key={i} onClick={()=>pick(l)} style={{width:46,height:46,background:"#fff",border:`2.5px solid ${C.blue}`,borderRadius:12,fontFamily:"'Fredoka One',cursive",fontSize:22,color:C.blue,cursor:"pointer",boxShadow:`0 3px 0 ${C.blue}44`}}>{l}</button>)}</div>}
        {built.length>0&&!correct&&built.length<letters.length&&<Btn small color={C.coral} outline onClick={()=>setBuilt([])}>↩ Reset</Btn>}
        {built.length===letters.length&&!correct&&<div><p style={{fontFamily:"'Nunito',sans-serif",color:C.coral,fontWeight:700}}>❌ Not quite! Try again.</p><Btn color={C.coral} onClick={()=>setBuilt([])}>Try Again 🔄</Btn></div>}
        {correct&&<div><p style={{fontFamily:"'Nunito',sans-serif",color:C.green,fontWeight:800,fontSize:18}}>✅ {W.word.toUpperCase()}! 🎉</p><Btn color={C.green} onClick={nextWord}>{wi<words.length-1?"Next Word →":"Done! ✅"}</Btn></div>}
      </Card>
    </div>
  );
}

// ─── TASK: SIGHT WORDS ────────────────────────────────────────────────────────
function SightTask({words,onDone}){
  const [wi,setWi]=useState(0);
  const [flipped,setFlipped]=useState(false);
  const [score,setScore]=useState(0);
  const W=words[wi];
  useEffect(()=>{ speak(W.word); },[wi]);
  const next=knew=>{ if(knew) setScore(s=>s+1); setFlipped(false); if(wi<words.length-1) setWi(w=>w+1); else{ doneSpeak(); setTimeout(()=>onDone({correct:score+(knew?1:0),total:words.length}),500); } };
  return(
    <div style={PS}>
      <h3 style={MT(C.blue)}>⭐ Sight Words</h3>
      <p style={ST}>Word {wi+1} of {words.length}</p>
      <ProgressBar value={wi+1} max={words.length} color={C.blue}/>
      <div onClick={()=>{ setFlipped(true); speak(W.sentence); }} style={{background:flipped?"linear-gradient(135deg,#f0f5ff,#f5f0ff)":`linear-gradient(135deg,${C.blue},${C.purple})`,border:`3px solid ${flipped?C.blue:C.purple}`,borderRadius:28,padding:"40px 20px",marginTop:16,cursor:"pointer",boxShadow:`0 8px 0 ${C.blue}33`,textAlign:"center",minHeight:160,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",transition:"all .3s"}}>
        <div style={{fontFamily:"'Fredoka One',cursive",fontSize:50,letterSpacing:4,color:flipped?C.blue:"#fff"}}>{W.word}</div>
        {!flipped&&<p style={{color:"rgba(255,255,255,.75)",fontFamily:"'Nunito',sans-serif",fontSize:13,marginTop:8}}>Tap to hear it in a sentence 👇</p>}
        {flipped&&<p style={{color:C.purple,fontFamily:"'Nunito',sans-serif",fontSize:16,fontWeight:700,marginTop:8}}>{W.sentence}</p>}
      </div>
      {flipped&&<div style={{display:"flex",gap:10,justifyContent:"center",marginTop:14}}><Btn color={C.green} onClick={()=>next(true)}>✅ I know it!</Btn><Btn color={C.coral} onClick={()=>next(false)}>🔄 Practice more</Btn></div>}
      {!flipped&&<p style={{...ST,textAlign:"center",marginTop:10}}>Say the word out loud first!</p>}
      <div style={{textAlign:"center",marginTop:8}}><SpeakBtn text={W.word} label="Hear word" color={C.blue}/></div>
    </div>
  );
}

// ─── TASK: SENTENCES ─────────────────────────────────────────────────────────
function SentenceTask({sentences,onDone}){
  const [si,setSi]=useState(0);
  const [revealed,setRevealed]=useState(false);
  const [rating,setRating]=useState(null);
  const [score,setScore]=useState(0);
  const S=sentences[si];
  useEffect(()=>{ speak(S.text,0.7); },[si]);
  const next=r=>{ if(r===2) setScore(s=>s+1); setRevealed(false); setRating(null); if(si<sentences.length-1) setSi(s=>s+1); else{ doneSpeak(); setTimeout(()=>onDone({correct:score+(r===2?1:0),total:sentences.length}),500); } };
  const words=S.text.replace(/[.!?]/g,"").split(" ");
  return(
    <div style={PS}>
      <h3 style={MT(C.purple)}>📖 Read a Sentence</h3>
      <p style={ST}>Sentence {si+1} of {sentences.length}</p>
      <ProgressBar value={si+1} max={sentences.length} color={C.purple}/>
      <Card color={C.purple} style={{textAlign:"center",marginTop:14}}>
        <div style={{fontSize:52,marginBottom:10}}>{S.emoji}</div>
        <div style={{display:"flex",flexWrap:"wrap",gap:8,justifyContent:"center",marginBottom:12}}>
          {words.map((w,i)=><button key={i} onClick={()=>speak(w)} style={{fontFamily:"'Fredoka One',cursive",fontSize:20,color:"#fff",background:C.purple,border:"none",borderRadius:10,padding:"8px 12px",cursor:"pointer",boxShadow:`0 3px 0 ${C.purple}66`}}>{w}</button>)}
        </div>
        <SpeakBtn text={S.text} label="Read whole sentence" color={C.purple}/>
        {!revealed?<div style={{marginTop:14}}><Btn color={C.purple} onClick={()=>setRevealed(true)}>I read it! ✅</Btn></div>
          :<div style={{marginTop:14}}>
            <p style={{fontFamily:"'Nunito',sans-serif",fontWeight:800,color:C.dark,fontSize:14}}>How did it go?</p>
            <div style={{display:"flex",gap:8,justifyContent:"center",marginTop:8,flexWrap:"wrap"}}>
              {["😕 Hard","🙂 OK","😄 Easy!"].map((r,i)=><button key={r} onClick={()=>{ setRating(i); speak([`That's okay ${CHILD}, keep trying!`,"Good job! Keep reading!",`Excellent! You are a star, ${CHILD}!`][i]); }} style={{fontFamily:"'Nunito',sans-serif",fontWeight:700,fontSize:13,padding:"7px 13px",borderRadius:20,background:rating===i?[C.coral,C.orange,C.green][i]:"#f0f0f0",color:rating===i?"#fff":"#555",border:"none",cursor:"pointer"}}>{r}</button>)}
            </div>
            {rating!==null&&<div style={{marginTop:12}}><Btn color={C.purple} onClick={()=>next(rating)}>{si<sentences.length-1?"Next →":"Done! ✅"}</Btn></div>}
          </div>
        }
      </Card>
    </div>
  );
}

// ─── TASK: SPELL IT ───────────────────────────────────────────────────────────
function SpellIt({words,onDone}){
  const [wi,setWi]=useState(0);
  const [typed,setTyped]=useState("");
  const [result,setResult]=useState(null);
  const [burst,setBurst]=useState(false);
  const [score,setScore]=useState(0);
  const W=words[wi]; const target=W.word.toUpperCase();
  useEffect(()=>{ speak(`Spell the word: ${W.word}`); setTyped(""); setResult(null); },[wi]);
  const pressKey=k=>{ if(result) return; if(k==="⌫"){ setTyped(t=>t.slice(0,-1)); return; } const nx=typed+k; setTyped(nx); if(nx.length===target.length){ const ok=nx===target; setResult(ok?"correct":"wrong"); if(ok){ setScore(s=>s+1); setBurst(true); setTimeout(()=>setBurst(false),1200); praise(); } else speak(`Not quite. The word is ${W.word}.`); } };
  const next=()=>{ if(wi<words.length-1) setWi(w=>w+1); else{ doneSpeak(); setTimeout(()=>onDone({correct:score+(result==="correct"?1:0),total:words.length}),500); } };
  return(
    <div style={PS}>
      {burst&&<Confetti/>}
      <h3 style={MT(C.pink)}>⌨️ Spell It!</h3>
      <p style={ST}>Word {wi+1} of {words.length} · Score: {score}</p>
      <ProgressBar value={wi+1} max={words.length} color={C.pink}/>
      <Card color={C.pink} style={{textAlign:"center",marginTop:14}}>
        <div style={{fontSize:56}}>{W.emoji}</div>
        <SpeakBtn text={W.word} label={`Hear "${W.word}"`} color={C.pink}/>
        <div style={{display:"flex",justifyContent:"center",gap:8,margin:"16px 0"}}>
          {target.split("").map((_,i)=><div key={i} style={{width:46,height:50,border:`3px solid ${result==="correct"?C.green:result==="wrong"?C.coral:typed[i]?C.pink:"#ddd"}`,borderRadius:12,display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"'Fredoka One',cursive",fontSize:24,color:result==="correct"?"#0f5132":result==="wrong"?C.coral:"#333",background:result==="correct"?"#D3F9D8":result==="wrong"?"#FFE3E3":typed[i]?"#FFF0F5":"#fafafa",transition:"all .2s"}}>{typed[i]||""}</div>)}
        </div>
        {result==="correct"&&<p style={{fontFamily:"'Nunito',sans-serif",color:C.green,fontWeight:800,fontSize:16}}>✅ Correct! Great spelling!</p>}
        {result==="wrong"&&<p style={{fontFamily:"'Nunito',sans-serif",color:C.coral,fontWeight:700,fontSize:14}}>❌ The word is <strong>{target}</strong></p>}
        {result?<Btn color={C.pink} onClick={next}>{wi<words.length-1?"Next Word →":"Done! 🏆"}</Btn>:<Keyboard onKey={pressKey}/>}
      </Card>
    </div>
  );
}

// ─── TASK: MISSING LETTER ─────────────────────────────────────────────────────
function MissingLetter({words,onDone}){
  const [questions]=useState(()=>words.map(w=>{ const arr=w.word.toUpperCase().split(""); const pos=Math.floor(Math.random()*arr.length); return{...w,arr,pos,answer:arr[pos]}; }));
  const [qi,setQi]=useState(0);
  const [typed,setTyped]=useState("");
  const [result,setResult]=useState(null);
  const [burst,setBurst]=useState(false);
  const [score,setScore]=useState(0);
  const Q=questions[qi];
  useEffect(()=>{ speak(`Fill in the missing letter. ${Q.word}`); setTyped(""); setResult(null); },[qi]);
  const pressKey=k=>{ if(result||typed.length>=1) return; if(k==="⌫"){ setTyped(""); return; } setTyped(k); const ok=k===Q.answer; setResult(ok?"correct":"wrong"); if(ok){ setScore(s=>s+1); setBurst(true); setTimeout(()=>setBurst(false),1200); speak(`Yes! The letter is ${Q.answer}. ${Q.word}!`); } else speak(`Not quite! The missing letter is ${Q.answer}. ${Q.word}.`); };
  const next=()=>{ if(qi<questions.length-1) setQi(q=>q+1); else{ doneSpeak(); setTimeout(()=>onDone({correct:score,total:questions.length}),500); } };
  const display=Q.arr.map((l,i)=>i===Q.pos?"_":l);
  return(
    <div style={PS}>
      {burst&&<Confetti/>}
      <h3 style={MT(C.teal)}>🔍 Missing Letter</h3>
      <p style={ST}>Question {qi+1} of {questions.length} · Score: {score}</p>
      <ProgressBar value={qi+1} max={questions.length} color={C.teal}/>
      <Card color={C.teal} style={{textAlign:"center",marginTop:14}}>
        <div style={{fontSize:56}}>{Q.emoji}</div>
        <SpeakBtn text={Q.word} label={`Hear "${Q.word}"`} color={C.teal}/>
        <div style={{display:"flex",justifyContent:"center",gap:8,margin:"16px 0"}}>
          {display.map((l,i)=><div key={i} style={{width:46,height:50,border:`3px solid ${i===Q.pos?(result==="correct"?C.green:result==="wrong"?C.coral:C.teal):"#ddd"}`,borderRadius:12,display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"'Fredoka One',cursive",fontSize:24,color:i===Q.pos&&result==="correct"?"#0f5132":i===Q.pos&&result==="wrong"?C.coral:"#333",background:i===Q.pos?(result==="correct"?"#D3F9D8":result==="wrong"?"#FFE3E3":"#E8FDF5"):"#fafafa",transition:"all .2s"}}>{i===Q.pos?(typed||"?"):l}</div>)}
        </div>
        {result==="correct"&&<p style={{fontFamily:"'Nunito',sans-serif",color:C.green,fontWeight:800,fontSize:16}}>✅ {Q.answer} — {Q.word}!</p>}
        {result==="wrong"&&<p style={{fontFamily:"'Nunito',sans-serif",color:C.coral,fontWeight:700,fontSize:14}}>❌ It was <strong>{Q.answer}</strong> — {Q.word}</p>}
        {result?<Btn color={C.teal} onClick={next}>{qi<questions.length-1?"Next →":"Done! 🏆"}</Btn>:<Keyboard onKey={pressKey}/>}
      </Card>
    </div>
  );
}

// ─── TASK: SIGHT WORD RACE ────────────────────────────────────────────────────
function SightWordRace({words,onDone}){
  const [wi,setWi]=useState(0);
  const [typed,setTyped]=useState("");
  const [result,setResult]=useState(null);
  const [burst,setBurst]=useState(false);
  const [score,setScore]=useState(0);
  const [hint,setHint]=useState(false);
  const W=words[wi]; const target=W.word.toUpperCase();
  useEffect(()=>{ speak(`Listen carefully. Type the word: ${W.word}`); setTyped(""); setResult(null); setHint(false); },[wi]);
  const pressKey=k=>{ if(result) return; if(k==="⌫"){ setTyped(t=>t.slice(0,-1)); return; } const nx=typed+k; setTyped(nx); if(nx.length===target.length){ const ok=nx===target; setResult(ok?"correct":"wrong"); if(ok){ setScore(s=>s+1); setBurst(true); setTimeout(()=>setBurst(false),1200); praise(); } else speak(`Almost! The word is ${W.word}.`); } };
  const next=()=>{ if(wi<words.length-1) setWi(w=>w+1); else{ doneSpeak(); setTimeout(()=>onDone({correct:score+(result==="correct"?1:0),total:words.length}),500); } };
  return(
    <div style={PS}>
      {burst&&<Confetti/>}
      <h3 style={MT(C.yellow)}>🏁 Sight Word Race</h3>
      <p style={{...ST,color:C.dark}}>Word {wi+1} of {words.length} · Score: {score}</p>
      <ProgressBar value={wi+1} max={words.length} color={C.yellow}/>
      <Card color={C.yellow} style={{textAlign:"center",marginTop:14}}>
        <div style={{display:"flex",gap:8,justifyContent:"center",marginBottom:14,flexWrap:"wrap"}}>
          <SpeakBtn text={W.word} label="🔊 Hear again" color={C.orange}/>
          <button onClick={()=>setHint(h=>!h)} style={{background:"#fff",border:`2px solid ${C.yellow}`,borderRadius:40,padding:"5px 14px",cursor:"pointer",fontFamily:"'Nunito',sans-serif",fontWeight:700,fontSize:13,color:C.orange}}>{hint?"Hide 🙈":"Show hint 👀"}</button>
        </div>
        {hint&&<div style={{fontFamily:"'Fredoka One',cursive",fontSize:36,color:C.orange,marginBottom:10}}>{W.word}</div>}
        <div style={{display:"flex",justifyContent:"center",gap:8,margin:"12px 0"}}>
          {target.split("").map((_,i)=><div key={i} style={{width:42,height:46,border:`3px solid ${result==="correct"?C.green:result==="wrong"?C.coral:typed[i]?C.orange:"#ddd"}`,borderRadius:12,display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"'Fredoka One',cursive",fontSize:22,color:result==="correct"?"#0f5132":result==="wrong"?C.coral:"#333",background:result==="correct"?"#D3F9D8":result==="wrong"?"#FFE3E3":typed[i]?"#FFFAEB":"#fafafa",transition:"all .2s"}}>{typed[i]||""}</div>)}
        </div>
        {result==="correct"&&<p style={{fontFamily:"'Nunito',sans-serif",color:C.green,fontWeight:800,fontSize:16}}>✅ Perfect!</p>}
        {result==="wrong"&&<p style={{fontFamily:"'Nunito',sans-serif",color:C.coral,fontWeight:700,fontSize:14}}>❌ The word is <strong>{target}</strong></p>}
        {result?<Btn color={C.orange} onClick={next}>{wi<words.length-1?"Next →":"Done! 🏆"}</Btn>:<Keyboard onKey={pressKey}/>}
      </Card>
    </div>
  );
}

// ─── SESSION SUMMARY ──────────────────────────────────────────────────────────
function SessionSummary({dayNum,dateStr,results,starsEarned,totalStars,onReplay,onHome}){
  useEffect(()=>{ setTimeout(()=>speak(`Amazing work today, ${CHILD}! You finished Day ${dayNum}! I am so proud of you!`),400); },[]);
  const labels={alpha:"🔤 Alphabet",quiz:"🎯 Letter Quiz",family:"🧩 Word Family",sight:"⭐ Sight Words",sentences:"📖 Sentences",spellIt:"⌨️ Spell It",missingLetter:"🔍 Missing Letter",sightRace:"🏁 Sight Race"};
  return(
    <div style={{...PS,textAlign:"center"}}>
      <Confetti/>
      <div style={{fontSize:68,marginTop:24}}>🎉</div>
      <h2 style={{fontFamily:"'Fredoka One',cursive",fontSize:28,color:C.coral,margin:"6px 0"}}>Day {dayNum} Complete!</h2>
      <p style={{fontFamily:"'Nunito',sans-serif",color:"#777",fontSize:14}}>{fmtDate(dateStr)}</p>
      <div style={{background:"#fff",border:`3px solid ${C.orange}`,borderRadius:20,padding:"16px",margin:"16px 0",boxShadow:`0 6px 0 ${C.orange}44`}}>
        <p style={{fontFamily:"'Fredoka One',cursive",color:C.orange,fontSize:17,margin:"0 0 10px"}}>Today's Scores</p>
        {Object.entries(results).map(([k,v])=>(
          <div key={k} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"5px 0",borderBottom:"1px solid #f5f5f5",fontFamily:"'Nunito',sans-serif",fontSize:13}}>
            <span style={{color:"#444"}}>{labels[k]||k}</span>
            <span style={{fontWeight:700,color:v.correct/v.total>=0.7?C.green:C.orange}}>{v.correct}/{v.total}</span>
          </div>
        ))}
        <p style={{fontFamily:"'Fredoka One',cursive",fontSize:18,color:C.purple,marginTop:10}}>⭐ Today: +{starsEarned} · Total: {totalStars}</p>
      </div>
      <div style={{display:"flex",gap:10,justifyContent:"center",flexWrap:"wrap"}}>
        <Btn color={C.green} onClick={onReplay}>🔄 Play Again!</Btn>
        <Btn color={C.blue} outline onClick={onHome}>🏠 Home</Btn>
      </div>
    </div>
  );
}

// ─── DAILY SESSION ────────────────────────────────────────────────────────────
const TASK_ORDER=["alpha","quiz","family","sight","sentences","spellIt","missingLetter","sightRace"];
function DailySession({dayNum,plan,onFinish}){
  const [taskIdx,setTaskIdx]=useState(0);
  const [results,setResults]=useState({});
  const task=TASK_ORDER[taskIdx];
  const taskDone=(key,data)=>{ const nr={...results,[key]:data}; setResults(nr); if(taskIdx<TASK_ORDER.length-1) setTaskIdx(t=>t+1); else onFinish(nr); };
  const strip=(
    <div style={{display:"flex",gap:4,justifyContent:"center",flexWrap:"wrap",padding:"8px 16px",background:"#fff",borderBottom:"2px solid #f0f0f0",position:"sticky",top:52,zIndex:90}}>
      {TASK_ORDER.map((t,i)=><div key={t} style={{width:26,height:8,borderRadius:10,transition:"background .3s",background:results[t]?C.green:i===taskIdx?C.orange:"#eee"}}/>)}
    </div>
  );
  return(
    <div>
      {strip}
      {task==="alpha"        &&<AlphaWarmup    letters={plan.alphaLetters}                                          onDone={d=>taskDone("alpha",d)}/>}
      {task==="quiz"         &&<LetterQuiz      questions={plan.quizLetters}                                         onDone={d=>taskDone("quiz",d)}/>}
      {task==="family"       &&<WordFamilyTask  family={plan.family} words={plan.familyWords}                        onDone={d=>taskDone("family",d)}/>}
      {task==="sight"        &&<SightTask       words={plan.sightWords}                                              onDone={d=>taskDone("sight",d)}/>}
      {task==="sentences"    &&<SentenceTask    sentences={plan.sentences}                                           onDone={d=>taskDone("sentences",d)}/>}
      {task==="spellIt"      &&<SpellIt         words={plan.typingPool.slice(0,5)}                                   onDone={d=>taskDone("spellIt",d)}/>}
      {task==="missingLetter"&&<MissingLetter   words={plan.typingPool.slice(5,10)}                                  onDone={d=>taskDone("missingLetter",d)}/>}
      {task==="sightRace"    &&<SightWordRace   words={shuffle(SIGHT_WORDS.filter(w=>w.word.length<=5)).slice(0,6)}  onDone={d=>taskDone("sightRace",d)}/>}
    </div>
  );
}

// ─── PARENT VIEW ─────────────────────────────────────────────────────────────
function ParentView({onBack}){
  const [stage,setStage]=useState(()=>!load(SK.pin,null)?"setup":"pinEntry");
  const [inputPin,setInputPin]=useState("");
  const [newPin,setNewPin]=useState("");
  const [newDate,setNewDate]=useState(todayStr());
  const [error,setError]=useState("");

  function PinPad({value,onChange,label,onSubmit,submitLabel}){
    return(
      <div style={{textAlign:"center"}}>
        <p style={{fontFamily:"'Nunito',sans-serif",fontWeight:700,color:C.dark,fontSize:15,marginBottom:12}}>{label}</p>
        <div style={{display:"flex",gap:10,justifyContent:"center",marginBottom:16}}>
          {[0,1,2,3].map(i=><div key={i} style={{width:44,height:52,border:`3px solid ${value[i]?C.purple:"#ddd"}`,borderRadius:12,display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"'Fredoka One',cursive",fontSize:26,color:C.purple,background:value[i]?"#F3F0FF":"#fafafa"}}>{value[i]?"●":""}</div>)}
        </div>
        <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:8,maxWidth:220,margin:"0 auto"}}>
          {[1,2,3,4,5,6,7,8,9,"",0,"⌫"].map((k,i)=>(
            <button key={i} onClick={()=>{ if(k==="") return; if(k==="⌫"){ onChange(value.slice(0,-1)); return; } if(value.length<4) onChange(value+k); }} style={{height:48,background:k==="⌫"?"#FFE3E3":k===""?"transparent":"#fff",border:k===""?"none":`2px solid ${k==="⌫"?C.coral:"#ddd"}`,borderRadius:12,fontFamily:"'Fredoka One',cursive",fontSize:20,color:k==="⌫"?C.coral:"#333",cursor:k===""?"default":"pointer",boxShadow:k===""?"none":"0 2px 0 #eee"}}>{k}</button>
          ))}
        </div>
        {value.length===4&&<div style={{marginTop:16}}><Btn color={C.purple} onClick={()=>onSubmit(value)}>{submitLabel||"Confirm"}</Btn></div>}
        {error&&<p style={{color:C.coral,fontFamily:"'Nunito',sans-serif",fontSize:13,marginTop:8}}>{error}</p>}
      </div>
    );
  }

  if(stage==="setup") return(
    <div style={PS}>
      <BackBtn onBack={onBack}/>
      <h2 style={{fontFamily:"'Fredoka One',cursive",color:C.purple,fontSize:24,margin:"8px 0"}}>👩 Set Up Parent View</h2>
      <p style={{fontFamily:"'Nunito',sans-serif",color:"#666",fontSize:14,marginBottom:16}}>Set a PIN and choose {CHILD}'s start date — this will be Day 1.</p>
      <Card color={C.purple} style={{marginBottom:16}}>
        <p style={{fontFamily:"'Nunito',sans-serif",fontWeight:800,color:C.dark,fontSize:14,marginBottom:8}}>📅 Start Date (Day 1)</p>
        <input type="date" value={newDate} onChange={e=>setNewDate(e.target.value)} style={{width:"100%",padding:"10px 14px",borderRadius:12,border:`2px solid ${C.purple}`,fontFamily:"'Nunito',sans-serif",fontSize:15,color:C.dark,boxSizing:"border-box"}}/>
        <p style={{...ST,marginTop:6}}>This will be Day 1: {fmtDate(newDate)}</p>
      </Card>
      <Card color={C.purple}>
        <PinPad value={newPin} onChange={setNewPin} label="Create your 4-digit PIN" submitLabel="Save & Open →"
          onSubmit={p=>{ save(SK.pin,p); save(SK.startDate,newDate); setStage("dashboard"); }}/>
      </Card>
    </div>
  );

  if(stage==="pinEntry") return(
    <div style={PS}>
      <BackBtn onBack={onBack}/>
      <div style={{textAlign:"center",marginTop:20}}>
        <div style={{fontSize:52}}>🔒</div>
        <h2 style={{fontFamily:"'Fredoka One',cursive",color:C.purple,fontSize:24,margin:"8px 0"}}>Parent View</h2>
        <p style={{fontFamily:"'Nunito',sans-serif",color:"#666",fontSize:14,marginBottom:20}}>Enter your PIN</p>
        <PinPad value={inputPin} onChange={v=>{ setInputPin(v); setError(""); }} label="Enter your 4-digit PIN" submitLabel="Enter →"
          onSubmit={p=>{ if(p===load(SK.pin,null)) setStage("dashboard"); else{ setError("Wrong PIN. Try again."); setInputPin(""); } }}/>
      </div>
    </div>
  );

  // Dashboard
  const sd=load(SK.startDate,null);
  const dayNum=dayNumber(sd);
  const history=load(SK.history,{});
  const histEntries=Object.entries(history).sort((a,b)=>b[0].localeCompare(a[0]));
  const totalSessions=histEntries.length;
  const avgScore=totalSessions>0?Math.round(histEntries.reduce((acc,[,v])=>{ const sc=Object.values(v.results||{}); const pct=sc.length?sc.reduce((a,s)=>a+s.correct/s.total,0)/sc.length*100:0; return acc+pct; },0)/totalSessions):0;
  const stars=load(SK.stars,0);

  return(
    <div style={PS}>
      <BackBtn onBack={onBack}/>
      <h2 style={{fontFamily:"'Fredoka One',cursive",color:C.purple,fontSize:24,margin:"8px 0"}}>👩 Parent Dashboard</h2>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:14}}>
        {[{label:"Today",value:`Day ${dayNum}`,color:C.orange},{label:"Total Stars",value:`⭐ ${stars}`,color:C.yellow},{label:"Sessions Done",value:totalSessions,color:C.green},{label:"Avg Score",value:`${avgScore}%`,color:C.blue}].map(c=>(
          <div key={c.label} style={{background:"#fff",border:`2.5px solid ${c.color}`,borderRadius:16,padding:"14px 12px",textAlign:"center",boxShadow:`0 4px 0 ${c.color}44`}}>
            <div style={{fontFamily:"'Fredoka One',cursive",fontSize:22,color:c.color}}>{c.value}</div>
            <div style={{fontFamily:"'Nunito',sans-serif",fontSize:12,color:"#888",marginTop:2}}>{c.label}</div>
          </div>
        ))}
      </div>

      <Card color={C.purple} style={{marginBottom:14}}>
        <p style={{fontFamily:"'Fredoka One',cursive",color:C.purple,fontSize:16,margin:"0 0 8px"}}>📅 Programme Start Date</p>
        <p style={{fontFamily:"'Nunito',sans-serif",fontSize:14,color:"#555",marginBottom:8}}>
          Currently: <strong>{sd?fmtDate(sd):"Not set"}</strong><br/>
          <span style={{color:C.orange}}>→ Today is <strong>Day {dayNum}</strong></span>
        </p>
        <input type="date" defaultValue={sd||todayStr()} onChange={e=>{ save(SK.startDate,e.target.value); window.location.reload(); }}
          style={{width:"100%",padding:"9px 12px",borderRadius:10,border:`2px solid ${C.purple}`,fontFamily:"'Nunito',sans-serif",fontSize:14,boxSizing:"border-box"}}/>
        <p style={{...ST,marginTop:6,color:C.coral,fontSize:12}}>⚠️ Changing this resets the day count from that date.</p>
      </Card>

      <Card color={C.blue} style={{marginBottom:14}}>
        <p style={{fontFamily:"'Fredoka One',cursive",color:C.blue,fontSize:16,margin:"0 0 10px"}}>📋 Session History</p>
        {histEntries.length===0
          ?<p style={{fontFamily:"'Nunito',sans-serif",color:"#aaa",fontSize:13,textAlign:"center"}}>No sessions yet — start Day 1 today! 🌟</p>
          :histEntries.slice(0,10).map(([date,v])=>{
            const sc=Object.values(v.results||{}); const pct=sc.length?Math.round(sc.reduce((a,s)=>a+s.correct/s.total,0)/sc.length*100):0;
            return(
              <div key={date} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"7px 0",borderBottom:"1px solid #f0f0f0",fontFamily:"'Nunito',sans-serif",fontSize:13}}>
                <div><span style={{fontWeight:800,color:C.blue}}>Day {v.dayNum||"?"}</span><span style={{color:"#888",marginLeft:8,fontSize:12}}>{fmtDate(date)}</span></div>
                <div style={{display:"flex",gap:8,alignItems:"center"}}><span style={{color:C.yellow}}>⭐ {v.stars||0}</span><span style={{fontWeight:700,color:pct>=70?C.green:C.orange}}>{pct}%</span></div>
              </div>
            );
          })
        }
      </Card>

      <button onClick={()=>{ save(SK.pin,null); save(SK.startDate,null); setStage("setup"); setNewPin(""); setInputPin(""); }} style={{background:"none",border:"2px solid #ddd",borderRadius:20,padding:"8px 18px",fontFamily:"'Nunito',sans-serif",color:"#aaa",cursor:"pointer",fontSize:13,width:"100%"}}>
        🔑 Reset PIN &amp; Start Date
      </button>
    </div>
  );
}

// ─── WELCOME ──────────────────────────────────────────────────────────────────
function Welcome({dayNum,dateStr,totalStars,onStart,onParent}){
  useEffect(()=>{ const sd=load(SK.startDate,null); if(!sd) return; setTimeout(()=>speak(`Hi ${CHILD}! Today is Day ${dayNum}, ${fmtDate(dateStr)}. Are you ready to read?`),700); },[]);
  return(
    <div style={{...PS,textAlign:"center"}}>
      <div style={{fontSize:64,marginTop:28}}>📚</div>
      <h1 style={{fontFamily:"'Fredoka One',cursive",fontSize:30,color:C.coral,margin:"6px 0"}}>{CHILD}'s Reading World!</h1>
      <p style={{fontFamily:"'Nunito',sans-serif",color:"#666",fontSize:15}}>{fmtDate(dateStr)}</p>
      <div style={{background:"linear-gradient(135deg,#fff8f0,#f0f8ff)",border:`3px solid ${C.orange}`,borderRadius:20,padding:"20px",margin:"18px 0",boxShadow:`0 6px 0 ${C.orange}33`}}>
        <div style={{fontFamily:"'Fredoka One',cursive",fontSize:44,color:C.orange}}>Day {dayNum}</div>
        {dayNum===1&&<p style={{fontFamily:"'Nunito',sans-serif",color:C.green,fontWeight:800,fontSize:14,margin:"4px 0"}}>🌟 Your very first day! Let's go!</p>}
        <p style={{fontFamily:"'Nunito',sans-serif",color:"#888",fontSize:13,margin:"6px 0"}}>8 fun activities · about 35–45 minutes</p>
        {totalStars>0&&<p style={{fontFamily:"'Nunito',sans-serif",fontSize:13,color:C.yellow,marginTop:4}}>⭐ {totalStars} stars earned so far!</p>}
      </div>
      <div style={{background:"#fff",border:"2px solid #eee",borderRadius:16,padding:"14px",marginBottom:18,textAlign:"left"}}>
        <p style={{fontFamily:"'Fredoka One',cursive",color:C.purple,fontSize:15,margin:"0 0 8px"}}>Today you will:</p>
        {[{e:"🔤",t:"5 alphabet letters"},{e:"🎯",t:"Letter quiz"},{e:"🧩",t:"Word family"},{e:"⭐",t:"10 sight words"},{e:"📖",t:"5 sentences"},{e:"⌨️",t:"3 typing games"}].map((a,i)=>(
          <div key={i} style={{display:"flex",alignItems:"center",gap:8,padding:"3px 0",fontFamily:"'Nunito',sans-serif",fontSize:13,color:"#555"}}><span>{a.e}</span><span>{a.t}</span></div>
        ))}
      </div>
      <div style={{display:"flex",flexDirection:"column",gap:10,alignItems:"stretch"}}>
        <Btn color={C.coral} onClick={onStart} full>Start Today's Session 🚀</Btn>
        <Btn color={C.purple} outline onClick={onParent} full>👩 Parent View</Btn>
      </div>
    </div>
  );
}

// ─── APP ROOT ─────────────────────────────────────────────────────────────────
export default function App(){
  const today=todayStr();
  const startDate=load(SK.startDate,null);
  const dayNum=dayNumber(startDate);
  const [screen,setScreen]=useState("welcome");
  const [totalStars,setTotalStars]=useState(()=>load(SK.stars,0));
  const [sessionResults,setSessionResults]=useState(null);
  const [plan]=useState(()=>buildDayPlan(dayNum));

  useEffect(()=>{
    const link=document.createElement("link");
    link.href="https://fonts.googleapis.com/css2?family=Fredoka+One&family=Nunito:wght@400;600;700;800&display=swap";
    link.rel="stylesheet"; document.head.appendChild(link);
    window.speechSynthesis.getVoices();
    window.speechSynthesis.onvoiceschanged=()=>window.speechSynthesis.getVoices();
  },[]);

  const handleFinish=results=>{
    const scores=Object.values(results);
    const pct=scores.reduce((a,s)=>a+s.correct/s.total,0)/scores.length;
    const earned=Math.max(1,Math.round(pct*10));
    const newTotal=totalStars+earned;
    setTotalStars(newTotal); save(SK.stars,newTotal);
    const history=load(SK.history,{});
    history[today]={dayNum,results,stars:earned};
    save(SK.history,history);
    setSessionResults({results,starsEarned:earned});
    setScreen("summary");
  };

  const header=(
    <div style={{background:C.coral,padding:"10px 18px",display:"flex",justifyContent:"space-between",alignItems:"center",position:"sticky",top:0,zIndex:100}}>
      <span style={{fontFamily:"'Fredoka One',cursive",color:"#fff",fontSize:16}}>📚 {CHILD}'s Reading World</span>
      <div style={{display:"flex",alignItems:"center",gap:10}}>
        <span style={{fontFamily:"'Nunito',sans-serif",color:"rgba(255,255,255,.85)",fontSize:12}}>Day {dayNum}</span>
        <span style={{fontFamily:"'Nunito',sans-serif",color:"#fff",fontWeight:700,fontSize:14}}>⭐ {totalStars}</span>
      </div>
    </div>
  );

  return(
    <div style={{minHeight:"100vh",background:"linear-gradient(160deg,#fff9f0 0%,#f0f8ff 55%,#fff0fa 100%)"}}>
      {header}
      {screen==="welcome"&&<Welcome dayNum={dayNum} dateStr={today} totalStars={totalStars} onStart={()=>setScreen("session")} onParent={()=>setScreen("parent")}/>}
      {screen==="session"&&<DailySession dayNum={dayNum} plan={plan} onFinish={handleFinish}/>}
      {screen==="summary"&&sessionResults&&<SessionSummary dayNum={dayNum} dateStr={today} results={sessionResults.results} starsEarned={sessionResults.starsEarned} totalStars={totalStars} onReplay={()=>setScreen("session")} onHome={()=>setScreen("welcome")}/>}
      {screen==="parent"&&<ParentView onBack={()=>setScreen("welcome")}/>}
    </div>
  );
}
