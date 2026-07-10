/* ---------------- model parameters ---------------- */
const clone=o=>JSON.parse(JSON.stringify(o));
/* ===== The ONLY value you change after deployment ===== */
/* Your Vercel backend URL, no trailing slash. The app calls `${API_BASE_URL}/api/research`. */
const API_BASE_URL="https://REPLACE-WITH-YOUR-VERCEL-APP.vercel.app";
const W0 = {
  a:{scale:.25,intensity:.30,gov:.20,channel:.25},
  b:{seed:.30,cp:.30,overlap:.25,white:.15},
  t:{cash:.40,cost:.30,margin:.30},
  stratA:.50, stratB:.50, ovS:.55, ovT:.45,
  thr:60, weak:2, pHi:50, pMed:10, mHi:1.2, mMed:1.0, mLo:.8
};
let W = clone(W0);

/* ---------------- seed data (mirrors the workbook) ---------------- */
const SEED = [
 {n:"SMSP / Seed Village & minikits",lvl:"Central",st:"All-India",g:[1,1,1,1],
  A:{scale:4,intensity:4,gov:3,channel:4},B:{seed:5,cp:2,overlap:4,white:3},
  T:{cash:4,cost:3,margin:3},lag:30,costL:40,mpct:.18,base:800,spend:2500,share:.08,
  mode:"Empanel as seed agency; supply for minikits & Seed Village",
  sp:"DEKALB corn, Arize rice, veg",cp:"Seed treatment (limited)",
  risk:"Seed certification; minikit price caps squeeze margin"},
 {n:"National Food Security Mission (NFSM)",lvl:"Central",st:"All-India",g:[1,1,1,1],
  A:{scale:4,intensity:4,gov:3,channel:3},B:{seed:4,cp:4,overlap:4,white:3},
  T:{cash:4,cost:3,margin:4},lag:45,costL:60,mpct:.20,base:1500,spend:3500,share:.07,
  mode:"Supply demo/minikits; lead IPM & seed-treatment demos",
  sp:"Hybrid rice/corn, pulses",cp:"Herbicides, fungicides, seed treatment",
  risk:"Restricted-AI exposure in IPM demos; demo→paid conversion"},
 {n:"NMEO – Oilseeds",lvl:"Central",st:"Oilseed states",g:[1,1,1,1],
  A:{scale:4,intensity:3,gov:3,channel:3},B:{seed:4,cp:4,overlap:3,white:4},
  T:{cash:4,cost:3,margin:4},lag:45,costL:50,mpct:.19,base:900,spend:3000,share:.06,
  mode:"Seed supply + oilseed agronomy/CP package",
  sp:"Mustard, soybean",cp:"Fungicides, herbicides",
  risk:"Bayer oilseed seed depth; oilseed crop economics"},
 {n:"PM-RKVY – IPM/INM components",lvl:"Central",st:"All-India",g:[1,1,1,1],
  A:{scale:5,intensity:3,gov:3,channel:3},B:{seed:3,cp:3,overlap:3,white:3},
  T:{cash:4,cost:3,margin:3},lag:40,costL:50,mpct:.17,base:1000,spend:2000,share:.05,
  mode:"Plug into IPM/INM/diversification components",
  sp:"Diversification crops",cp:"IPM, biologicals",
  risk:"Cafeteria — component availability varies by state AAP"},
 {n:"National Mission on Natural Farming (NMNF)",lvl:"Central",st:"All-India",g:[0,1,1,1],
  A:{scale:3,intensity:3,gov:2,channel:3},B:{seed:1,cp:1,overlap:2,white:4},
  T:{cash:4,cost:2,margin:2},lag:30,costL:20,mpct:.10,base:300,spend:500,share:.03,
  mode:"EXCLUDED for CP — monitor seed angle only",
  sp:"Limited",cp:"None",
  risk:"Chemical-free narrative structurally excludes CP"},
 {n:"PM Fasal Bima Yojana (PMFBY)",lvl:"Central",st:"All-India",g:[1,1,1,1],
  A:{scale:5,intensity:3,gov:3,channel:3},B:{seed:1,cp:1,overlap:3,white:4},
  T:{cash:3,cost:3,margin:2},lag:75,costL:15,mpct:.10,base:100,spend:200,share:.02,
  mode:"Low priority — no direct seed/CP channel",
  sp:"None direct",cp:"None direct",
  risk:"Insurance is not a product-sale route; claim delays"},
 {n:"iKhedut – Input & Seed DBT (Gujarat)",lvl:"State",st:"Gujarat",g:[1,1,1,1],
  A:{scale:4,intensity:4,gov:4,channel:4},B:{seed:4,cp:4,overlap:4,white:3},
  T:{cash:4,cost:4,margin:4},lag:30,costL:45,mpct:.20,base:1200,spend:4000,share:.09,
  mode:"Empanel Bayer SKUs for DBT subsidy; retail pull-through",
  sp:"Cotton, veg, castor",cp:"Cotton CP, fungicides",
  risk:"Empanelment SKU caps; GST on net realisation"},
 {n:"MahaDBT – Agri Input (Maharashtra)",lvl:"State",st:"Maharashtra",g:[1,1,1,1],
  A:{scale:4,intensity:4,gov:4,channel:4},B:{seed:4,cp:4,overlap:4,white:3},
  T:{cash:3,cost:4,margin:4},lag:60,costL:50,mpct:.18,base:1400,spend:3800,share:.08,
  mode:"Empanel + fulfil; cotton/soybean focus",
  sp:"Cotton, soybean, tur",cp:"Cotton insecticides, herbicides",
  risk:"MahaDBT disbursal lag (~60d) strains Cash leg"},
 {n:"State Hybrid Paddy Seed (CG/Odisha)",lvl:"State",st:"CG / Odisha",g:[1,1,1,1],
  A:{scale:3,intensity:4,gov:3,channel:3},B:{seed:5,cp:2,overlap:3,white:3},
  T:{cash:4,cost:3,margin:3},lag:35,costL:35,mpct:.17,base:1000,spend:2200,share:.10,
  mode:"Hybrid paddy seed supply into state distribution",
  sp:"Arize / hybrid rice",cp:"Minimal",
  risk:"Hybrid uptake vs subsidised public varieties; price cap"},
 {n:"State Bt-Cotton Seed & IPM (MH/TG)",lvl:"State",st:"MH / Telangana",g:[1,1,1,1],
  A:{scale:4,intensity:4,gov:3,channel:4},B:{seed:5,cp:5,overlap:5,white:3},
  T:{cash:4,cost:4,margin:3},lag:40,costL:50,mpct:.20,base:900,spend:6000,share:.12,
  mode:"Bt cotton seed + cotton CP/IPM bundle",
  sp:"Cotton hybrids",cp:"Cotton insecticides, herbicides, seed treatment",
  risk:"Bt-seed MRP price control caps Margin leg; pink-bollworm optics"},
 {n:"MIDH – Horticulture / veg seed",lvl:"Central",st:"All-India",g:[1,1,1,1],
  A:{scale:4,intensity:3,gov:3,channel:3},B:{seed:4,cp:2,overlap:4,white:4},
  T:{cash:4,cost:3,margin:5},lag:40,costL:40,mpct:.22,base:400,spend:5000,share:.07,
  mode:"Veg seed supply + protected-cultivation CP",
  sp:"Tomato, okra, chilli",cp:"Fungicides, insecticides",
  risk:"Veg seed quality/cold-chain; scattered geography raises Cost"},
 {n:"Rythu Bharosa (Telangana)",lvl:"State",st:"Telangana",g:[1,1,1,1],
  A:{scale:3,intensity:4,gov:4,channel:3},B:{seed:1,cp:1,overlap:4,white:4},
  T:{cash:4,cost:2,margin:2},lag:30,costL:10,mpct:.10,base:200,spend:300,share:.02,
  mode:"Indirect only — not a Seeds+CP entry route",
  sp:"None direct",cp:"None direct",
  risk:"Cash to farmer; no channel; political-fiscal sustainability"},
];
let DATA = clone(SEED);
let cur = 9; // start on Bt-cotton

/* ---------------- engine ---------------- */
const wavg=(o,w)=>{let n=0,d=0;for(const k in w){n+=o[k]*w[k];d+=w[k]}return d?n/d*20:0;};
function compute(s){
  const gateNames=["chemical-free / CP-excluded","seed not eligible","compliance risk","payment default"];
  let gateFail=-1; for(let i=0;i<4;i++) if(!s.g[i]){gateFail=i;break;}
  const axisA=wavg(s.A,W.a), axisB=wavg(s.B,W.b);
  const strategic=(axisA*W.stratA+axisB*W.stratB)/(W.stratA+W.stratB);
  const triangle=wavg(s.T,W.t);
  const overall=(strategic*W.ovS+triangle*W.ovT)/(W.ovS+W.ovT);
  const minLeg=Math.min(s.T.cash,s.T.cost,s.T.margin);
  const weakLegs=[]; if(s.T.cash<=W.weak)weakLegs.push("Cash");
  if(s.T.cost<=W.weak)weakLegs.push("Cost"); if(s.T.margin<=W.weak)weakLegs.push("Margin");
  const addr=s.base*s.spend*s.share/10000, gm=addr*s.mpct;
  const tier= addr>=W.pHi?"High": addr>=W.pMed?"Med":"Low";
  const mult= tier==="High"?W.mHi: tier==="Med"?W.mMed:W.mLo;
  const passed=gateFail<0;
  const priority= passed? overall*mult : 0;
  let quad;
  if(strategic>=W.thr&&triangle>=W.thr) quad="Prioritise / Lead";
  else if(strategic>=W.thr&&triangle<W.thr) quad="Re-engineer commercials";
  else if(strategic<W.thr&&triangle>=W.thr) quad="Opportunistic / Tactical";
  else quad="Monitor / Avoid";
  let rec;
  if(!passed) rec="EXCLUDED — "+gateNames[gateFail];
  else if(quad==="Prioritise / Lead") rec="LEAD — commit budget & empanel";
  else if(quad==="Re-engineer commercials") rec="RE-ENGINEER commercials ["+(weakLegs.length?weakLegs.join(", "):"tighten cash/cost/margin")+"]";
  else if(quad==="Opportunistic / Tactical") rec="Take opportunistically; weak strategic fit";
  else rec="Monitor only";
  rec += " · Prize "+tier;
  return {axisA,axisB,strategic,triangle,overall,minLeg,weakLegs,addr,gm,tier,mult,passed,gateFail,priority,quad,rec};
}
const QCOL={"Prioritise / Lead":getC("teal"),"Re-engineer commercials":getC("gold"),
  "Opportunistic / Tactical":getC("steel"),"Monitor / Avoid":getC("slate")};
function getC(n){return getComputedStyle(document.documentElement).getPropertyValue("--"+n).trim();}
const legColor=v=>v<=2?getC("red"):v===3?getC("gold"):getC("teal");
const scoreColor=v=>v<60?getC("red"):v<75?getC("gold"):getC("teal");

/* ---------------- render: KPIs + verdict ---------------- */
function renderTop(s,c){
  const chip=document.getElementById("quadChip");
  const col = c.passed? QCOL[c.quad] : getC("red");
  const label = c.passed? c.quad : "Excluded";
  chip.textContent=label; chip.style.color=col; chip.style.borderColor=col;
  chip.style.background=hexA(col,.12);
  document.getElementById("recLine").innerHTML=esc(c.rec)+(s.added&&s.provenance?` <span class="prov ${s.provenance}">${provLabel(s.provenance)}</span>`:"");

  const k=[
    ["Strategic fit",c.strategic,"Axis A × Axis B",scoreColor(c.strategic)],
    ["Golden triangle",c.triangle,"Cash·Cost·Margin",scoreColor(c.triangle)],
    ["Overall",c.overall,"blended score",scoreColor(c.overall)],
    ["Prize",c.addr,"₹ Cr addressable · "+c.tier,getC("gold"),true],
    ["Priority",c.priority,"rank driver",scoreColor(Math.min(c.priority,100))],
  ];
  document.getElementById("kpis").innerHTML=k.map(([lab,val,sub,col,rupee])=>`
    <div class="kpi">
      <div class="lab">${lab}</div>
      <div class="val mono" style="color:${col}">${rupee?("₹"+val.toFixed(1)):val.toFixed(1)}</div>
      <div class="sub">${sub}</div>
      <div class="spark"><i style="width:${Math.min(rupee?val:val,100)}%;background:${col}"></i></div>
    </div>`).join("");
}

/* ---------------- render: triangle signature ---------------- */
function renderTriangle(s,c){
  const sv=document.getElementById("triSvg");
  const V=[{x:116,y:24,k:"cash",lab:"CASH"},{x:30,y:182,k:"cost",lab:"COST"},{x:202,y:182,k:"margin",lab:"MARGIN"}];
  const edgeCol=(a,b)=> (Math.min(a,b)<=W.weak)?getC("red"):(Math.min(a,b)>=4?getC("gold"):getC("gold-d"));
  const broken = c.weakLegs.length>0;
  let h=`<defs><filter id="glow"><feGaussianBlur stdDeviation="3.2" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter></defs>`;
  // fill
  h+=`<polygon points="116,24 30,182 202,182" fill="${hexA(broken?getC("red"):getC("gold"),.07)}" stroke="none"/>`;
  // edges
  const pairs=[[0,1],[1,2],[2,0]];
  pairs.forEach(([i,j])=>{
    const a=s.T[V[i].k], b=s.T[V[j].k], col=edgeCol(a,b);
    const wk=Math.min(a,b)<=W.weak;
    h+=`<line x1="${V[i].x}" y1="${V[i].y}" x2="${V[j].x}" y2="${V[j].y}" stroke="${col}" stroke-width="${wk?3.4:2.4}" filter="url(#glow)" ${wk?'class="pulse"':''} stroke-linecap="round"/>`;
  });
  // centroid score
  h+=`<text x="116" y="132" text-anchor="middle" font-family="Space Grotesk" font-weight="700" font-size="30" fill="${scoreColor(c.triangle)}">${c.triangle.toFixed(0)}</text>`;
  h+=`<text x="116" y="148" text-anchor="middle" font-family="IBM Plex Mono" font-size="8" letter-spacing="1.5" fill="${getC('faint')}">TRIANGLE</text>`;
  // vertices
  V.forEach(v=>{const sc=s.T[v.k],col=legColor(sc);
    h+=`<circle cx="${v.x}" cy="${v.y}" r="15" fill="${getC('panel2')}" stroke="${col}" stroke-width="2.4"/>`;
    h+=`<text x="${v.x}" y="${v.y+4}" text-anchor="middle" font-family="IBM Plex Mono" font-weight="600" font-size="13" fill="${col}">${sc}</text>`;
    const ly=v.y<100? v.y-22 : v.y+30;
    h+=`<text x="${v.x}" y="${ly}" text-anchor="middle" font-family="IBM Plex Mono" font-size="9" letter-spacing="1" fill="${getC('muted')}">${v.lab}</text>`;
  });
  sv.innerHTML=h;

  const legMeta={cash:s.lag+"d lag",cost:"₹"+s.costL+"L",margin:(s.mpct*100).toFixed(0)+"%"};
  document.getElementById("legs").innerHTML=[["cash","Cash"],["cost","Cost"],["margin","Margin"]].map(([k,nm])=>{
    const v=s.T[k],col=legColor(v);
    return `<div class="leg"><span class="nm">${nm}</span>
      <div class="bar"><i style="width:${v/5*100}%;background:${col}"></i></div>
      <span class="sc" style="color:${col}">${v}/5</span><span class="meta">${legMeta[k]}</span></div>`;
  }).join("");
}

/* ---------------- render: insights ---------------- */
function biggestLever(s){
  const base=compute(s).priority; let best=null;
  const cand=[["Cash leg","T","cash"],["Cost leg","T","cost"],["Margin leg","T","margin"],
    ["Seed relevancy","B","seed"],["CP relevancy","B","cp"],["Crop overlap","B","overlap"],
    ["Whitespace","B","white"],["Crop/input intensity","A","intensity"],["Channel readiness","A","channel"],
    ["Scale & continuity","A","scale"],["Governance","A","gov"]];
  for(const [lab,grp,key] of cand){
    if(s[grp][key]>=5) continue;
    const t=clone(s); t[grp][key]+=1;
    const d=compute(t).priority-base;
    if(d>0 && (!best||d>best.d)) best={lab,d};
  }
  return best;
}
function renderInsights(s,c){
  const I=[];
  const mk=(col,ic,html)=>I.push({col,ic,html});
  if(!c.passed){
    mk(getC("red"),"⛔",`<b>Gate failure.</b> ${c.rec.split(" · ")[0].replace("EXCLUDED — ","")}. No score can override this — the scheme is out for Seeds &amp; CP. <span class="q">${s.risk}</span>`);
  } else {
    // constraint
    const gap=c.strategic-c.triangle;
    if(c.weakLegs.length){
      mk(getC("gold"),"△",`<b>Triangle has a weak leg:</b> ${c.weakLegs.join(" & ")}. Covering the triangle is all-or-nothing, so this caps the scheme regardless of a ${c.strategic.toFixed(0)} strategic score. <span class="q">${s.risk}</span>`);
    } else if(Math.abs(gap)>8){
      const lo=gap>0?"the commercial model (triangle)":"strategic fit";
      mk(getC("steel"),"↔",`<b>Binding constraint is ${lo}.</b> Strategic ${c.strategic.toFixed(0)} vs triangle ${c.triangle.toFixed(0)} — improving the lower side is where the decision moves.`);
    } else {
      mk(getC("teal"),"✓",`<b>Balanced.</b> Strategic ${c.strategic.toFixed(0)} and triangle ${c.triangle.toFixed(0)} are aligned — no single side is dragging it.`);
    }
    // verdict meaning
    const meaning={
      "Prioritise / Lead":"Strategically attractive and commercially sound — commit budget and empanel.",
      "Re-engineer commercials":"Strategically worth it but the commercial model breaks — fix cash/cost/margin <i>before</i> scaling, don't walk away.",
      "Opportunistic / Tactical":"The money works but the strategic fit is thin — take it only where it's cheap to participate.",
      "Monitor / Avoid":"Neither side clears the bar — track, don't invest."
    };
    mk(QCOL[c.quad],"➜",`<b>${c.quad}.</b> ${meaning[c.quad]}`);
  }
  // prize
  mk(getC("gold"),"₹",`<b>₹${c.addr.toFixed(1)} Cr addressable</b> (${c.tier} prize) → ~₹${c.gm.toFixed(1)} Cr gross margin at ${(s.mpct*100).toFixed(0)}%. Cash cycle ~${s.lag} days; cost-to-serve ₹${s.costL} L.`);
  // lever
  const lev=biggestLever(s);
  if(lev && c.passed) mk(getC("teal"),"↑",`<b>Biggest lever:</b> +1 on <b>${lev.lab}</b> raises priority by ${lev.d.toFixed(1)} — the fastest way to move this scheme up the stack.`);
  // route
  mk(getC("steel"),"◆",`<b>Route:</b> ${s.mode}.`);

  let research="";
  if(s.added && (s.notes || (s.sources&&s.sources.length))){
    const src=(s.sources&&s.sources.length)?`<div class="srcs">${s.sources.map(x=>`<a href="${esc(x.url)}" target="_blank" rel="noopener">${esc((x.title||x.url)).slice(0,46)}</a>`).join("")}</div>`:"";
    research=`<div class="research"><div class="rh">Research notes <span class="prov ${s.provenance}">${provLabel(s.provenance)}</span></div>
      <div class="rt">${esc(s.notes)||"No narrative returned."}</div>${src}</div>`;
  }
  document.getElementById("insights").innerHTML=I.map(x=>`
    <div class="row"><div class="mk" style="background:${hexA(x.col,.16)};color:${x.col}">${x.ic}</div>
    <div class="tx">${x.html}</div></div>`).join("")
    + `<div class="outprods">
        <div class="op"><b>Focus seed</b>${esc(s.sp)}</div>
        <div class="op"><b>Focus CP</b>${esc(s.cp)}</div></div>`
    + research;
}

/* ---------------- render: controls ---------------- */
function slider(grp,key,label,teal){
  const v=DATA[cur][grp][key];
  return `<div class="slider ${teal?'teal':''}">
    <label>${label}</label>
    <input type="range" min="1" max="5" step="1" value="${v}" data-g="${grp}" data-k="${key}">
    <output>${v}/5</output></div>`;
}
function renderControls(){
  const s=DATA[cur];
  const gateLab=["CP / seed permissible","Seed eligibility OK","Compliance clear","Payment solvent"];
  const gates=`<div class="ctl-group"><div class="gt">Gates <span class="agg">any “off” excludes</span></div>
    <div class="gates">${gateLab.map((l,i)=>`
      <div class="gate"><span>${l}</span>
        <div class="toggle ${s.g[i]?'on':''}" data-gate="${i}"></div></div>`).join("")}</div></div>`;
  const aLab={scale:"Scale & continuity",intensity:"Crop / input intensity",gov:"Governance",channel:"Channel readiness"};
  const bLab={seed:"Seed relevancy",cp:"CP relevancy",overlap:"Crop overlap",white:"Competitive whitespace"};
  const axisA=`<div class="ctl-group teal"><div class="gt">Axis A · scheme quality</div>
    ${Object.keys(aLab).map(k=>slider("A",k,aLab[k],true)).join("")}</div>`;
  const axisB=`<div class="ctl-group teal"><div class="gt">Axis B · seeds &amp; CP fit</div>
    ${Object.keys(bLab).map(k=>slider("B",k,bLab[k],true)).join("")}</div>`;
  const tri=`<div class="ctl-group"><div class="gt">Golden triangle · cash · cost · margin</div>
    ${slider("T","cash","Cash (working cap.)")}
    <div class="numrow"><label>· Payment lag</label><div class="ipt"><input type="number" min="0" step="5" value="${s.lag}" data-num="lag"><span class="u">days</span></div></div>
    ${slider("T","cost","Cost-to-serve")}
    <div class="numrow"><label>· Cost to serve</label><div class="ipt"><input type="number" min="0" step="5" value="${s.costL}" data-num="costL"><span class="u">₹ L</span></div></div>
    ${slider("T","margin","Margins")}
    <div class="numrow"><label>· Net margin</label><div class="ipt"><input type="number" min="0" max="100" step="1" value="${(s.mpct*100).toFixed(0)}" data-num="mpct"><span class="u">%</span></div></div>
    </div>`;
  const prize=`<div class="ctl-group"><div class="gt">Prize sizing</div>
    <div class="numrow"><label>Eligible base</label><div class="ipt"><input type="number" min="0" step="50" value="${s.base}" data-num="base"><span class="u">’000</span></div></div>
    <div class="numrow"><label>Spend / unit</label><div class="ipt"><input type="number" min="0" step="100" value="${s.spend}" data-num="spend"><span class="u">₹</span></div></div>
    <div class="numrow"><label>Bayer share</label><div class="ipt"><input type="number" min="0" max="100" step="1" value="${(s.share*100).toFixed(0)}" data-num="share"><span class="u">%</span></div></div>
    </div>`;
  const bmsg={web:"Researched live — review the sources in the insights panel and confirm Cash (PFMS) & Margin (price-control / GST).",
    model:"Model estimate — no live web data. Treat as a starting hypothesis and verify before use.",
    heuristic:"Rule-based estimate — not researched. Replace with real data before any decision."}[s.provenance||"heuristic"];
  const banner = s.added? `<div class="banner">${bmsg}</div>`:"";
  document.getElementById("controls").innerHTML=banner+gates+axisA+axisB+tri+prize;
  const rb=document.getElementById("removeBtn"); if(rb) rb.style.display=s.added?"inline-block":"none";
  wireControls();
}
function wireControls(){
  document.querySelectorAll('#controls input[type=range]').forEach(el=>{
    el.addEventListener('input',e=>{
      DATA[cur][el.dataset.g][el.dataset.k]=+el.value;
      el.nextElementSibling.textContent=el.value+"/5";
      renderOutputs();
    });
  });
  document.querySelectorAll('#controls .toggle').forEach(el=>{
    el.addEventListener('click',()=>{
      const i=+el.dataset.gate; DATA[cur].g[i]=DATA[cur].g[i]?0:1;
      el.classList.toggle('on'); renderOutputs();
    });
  });
  document.querySelectorAll('#controls input[type=number]').forEach(el=>{
    el.addEventListener('input',e=>{
      const k=el.dataset.num, v=+el.value;
      if(k==="mpct"||k==="share") DATA[cur][k]=v/100; else DATA[cur][k]=v;
      renderOutputs();
    });
  });
}

/* ---------------- render: map ---------------- */
function renderMap(){
  const sv=document.getElementById("mapSvg");
  const P={l:46,r:18,t:14,b:34}, w=480,h=360, iw=w-P.l-P.r, ih=h-P.t-P.b;
  const X=v=>P.l+v/100*iw, Y=v=>P.t+ih-v/100*ih;
  const tx=X(W.thr),ty=Y(W.thr);
  let g=`<rect x="${P.l}" y="${P.t}" width="${iw}" height="${ih}" fill="#0c1219" stroke="${getC('line')}"/>`;
  // quadrant tints
  g+=`<rect x="${tx}" y="${P.t}" width="${X(100)-tx}" height="${ty-P.t}" fill="${hexA(getC('teal'),.06)}"/>`;
  g+=`<rect x="${tx}" y="${ty}" width="${X(100)-tx}" height="${Y(0)-ty}" fill="${hexA(getC('gold'),.06)}"/>`;
  g+=`<rect x="${P.l}" y="${P.t}" width="${tx-P.l}" height="${ty-P.t}" fill="${hexA(getC('steel'),.05)}"/>`;
  // threshold lines
  g+=`<line x1="${tx}" y1="${P.t}" x2="${tx}" y2="${P.t+ih}" stroke="${getC('faint')}" stroke-dasharray="3 3"/>`;
  g+=`<line x1="${P.l}" y1="${ty}" x2="${P.l+iw}" y2="${ty}" stroke="${getC('faint')}" stroke-dasharray="3 3"/>`;
  // axis labels
  g+=`<text x="${P.l+iw/2}" y="${h-8}" text-anchor="middle" font-family="IBM Plex Mono" font-size="10" fill="${getC('muted')}">Strategic fit →</text>`;
  g+=`<text transform="translate(13,${P.t+ih/2}) rotate(-90)" text-anchor="middle" font-family="IBM Plex Mono" font-size="10" fill="${getC('muted')}">Golden triangle →</text>`;
  [0,50,100].forEach(t=>{g+=`<text x="${X(t)}" y="${P.t+ih+13}" text-anchor="middle" font-size="8" fill="${getC('faint')}" font-family="IBM Plex Mono">${t}</text>`;
    g+=`<text x="${P.l-7}" y="${Y(t)+3}" text-anchor="end" font-size="8" fill="${getC('faint')}" font-family="IBM Plex Mono">${t}</text>`;});
  // bubbles
  const comp=DATA.map(s=>({s,c:compute(s)}));
  const maxAddr=Math.max(...comp.map(o=>o.c.addr),1);
  comp.forEach((o,i)=>{
    const passed=o.c.passed;
    const col= passed? QCOL[o.c.quad] : getC("red");
    const rr=6+Math.sqrt(o.c.addr/maxAddr)*16;
    const cx=X(o.c.strategic), cy=Y(o.c.triangle);
    const isSel=i===cur;
    g+=`<circle class="bub" data-i="${i}" cx="${cx}" cy="${cy}" r="${rr}" fill="${hexA(col,passed?.55:.4)}" stroke="${col}" stroke-width="${isSel?3:1.3}" style="cursor:pointer"><title>${o.s.n} — strat ${o.c.strategic.toFixed(0)}, tri ${o.c.triangle.toFixed(0)}, ₹${o.c.addr.toFixed(1)}Cr</title></circle>`;
    if(isSel) g+=`<circle cx="${cx}" cy="${cy}" r="${rr+5}" fill="none" stroke="${getC('gold')}" stroke-width="1.4" stroke-dasharray="2 3"/>`;
  });
  sv.innerHTML=g;
  sv.querySelectorAll('.bub').forEach(b=>b.addEventListener('click',()=>{cur=+b.dataset.i;document.getElementById("scheme").value=cur;renderAll();}));
}

/* ---------------- render: ranked table ---------------- */
function renderTable(){
  const comp=DATA.map((s,i)=>({s,i,c:compute(s)}));
  comp.sort((a,b)=> b.c.priority-a.c.priority || b.c.overall-a.c.overall);
  const maxPri=Math.max(...comp.map(o=>o.c.priority),1);
  document.getElementById("rankBody").innerHTML=comp.map((o,rank)=>{
    const col= o.c.passed? QCOL[o.c.quad] : getC("red");
    const ql= o.c.passed? o.c.quad : "Excluded";
    return `<tr class="cur ${o.i===cur?'sel':''}" data-i="${o.i}">
      <td>${rank+1}</td>
      <td>${o.s.n}</td>
      <td>${o.c.strategic.toFixed(0)}</td>
      <td style="color:${scoreColor(o.c.triangle)}">${o.c.triangle.toFixed(0)}</td>
      <td>${o.c.overall.toFixed(0)}</td>
      <td>${o.c.addr.toFixed(1)}</td>
      <td><span class="bar-rank" style="width:${o.c.priority/maxPri*46}px;background:${col}"></span>${o.c.priority.toFixed(1)}</td>
      <td style="text-align:left"><span class="qd" style="background:${hexA(col,.16)};color:${col}">${ql}</span></td>
    </tr>`;
  }).join("");
  document.querySelectorAll('#rankBody tr').forEach(tr=>tr.addEventListener('click',()=>{
    cur=+tr.dataset.i; document.getElementById("scheme").value=cur; renderAll();
  }));
}

/* ---------------- weights panel ---------------- */
function renderWeights(){
  const defs=[
    ["Axis A · scale",["a","scale"],0,1,.05],["Axis A · crop/input",["a","intensity"],0,1,.05],
    ["Axis A · governance",["a","gov"],0,1,.05],["Axis A · channel",["a","channel"],0,1,.05],
    ["Axis B · seed",["b","seed"],0,1,.05],["Axis B · CP",["b","cp"],0,1,.05],
    ["Axis B · crop overlap",["b","overlap"],0,1,.05],["Axis B · whitespace",["b","white"],0,1,.05],
    ["Triangle · cash",["t","cash"],0,1,.05],["Triangle · cost",["t","cost"],0,1,.05],
    ["Triangle · margin",["t","margin"],0,1,.05],
    ["Strategic in overall",["ovS"],0,1,.05],["Triangle in overall",["ovT"],0,1,.05],
    ["Decision threshold",["thr"],0,100,5],["Weak-leg threshold",["weak"],1,5,1],
    ["Prize High ≥ (₹Cr)",["pHi"],0,200,5],["Prize Med ≥ (₹Cr)",["pMed"],0,100,5],
  ];
  document.getElementById("weights").innerHTML=defs.map(([lab,path,mn,mx,st])=>{
    const v= path.length===2? W[path[0]][path[1]] : W[path[0]];
    const disp= mx<=1? (v*100).toFixed(0)+"%": v;
    return `<div class="slider"><label>${lab}</label>
      <input type="range" min="${mn}" max="${mx}" step="${st}" value="${v}" data-wp="${path.join('.')}">
      <output>${disp}</output></div>`;
  }).join("");
  document.querySelectorAll('#weights input').forEach(el=>el.addEventListener('input',()=>{
    const p=el.dataset.wp.split('.'), v=+el.value;
    if(p.length===2) W[p[0]][p[1]]=v; else W[p[0]]=v;
    const mx=+el.max; el.nextElementSibling.textContent= mx<=1?(v*100).toFixed(0)+"%":v;
    renderOutputs(); renderMap(); renderTable();
  }));
}

/* ---------------- orchestration ---------------- */
function renderOutputs(){ const s=DATA[cur],c=compute(s); renderTop(s,c); renderTriangle(s,c); renderInsights(s,c); renderMap(); renderTable(); }
function renderAll(){ renderControls(); renderOutputs(); }

function hexA(hex,a){hex=hex.replace('#','');if(hex.length===3)hex=hex.split('').map(x=>x+x).join('');
  const n=parseInt(hex,16);return `rgba(${n>>16&255},${n>>8&255},${n&255},${a})`;}

// scheme select
const sel=document.getElementById("scheme");
function rebuildSelector(){sel.innerHTML="";DATA.forEach((s,i)=>{const o=document.createElement("option");o.value=i;o.textContent=s.n+(s.added?" •":"");sel.appendChild(o);});sel.value=cur;}
rebuildSelector();
sel.addEventListener("change",()=>{cur=+sel.value;renderAll();});

document.getElementById("resetBtn").addEventListener("click",()=>{
  const base = SEED[cur] || DATA[cur]._seed;
  if(base){ const keep=DATA[cur]._seed; DATA[cur]=clone(base); if(!DATA[cur]._seed&&keep)DATA[cur]._seed=keep; }
  renderAll();
});
document.getElementById("removeBtn").addEventListener("click",()=>{
  if(!DATA[cur].added) return;
  DATA.splice(cur,1); cur=Math.max(0,cur-1); rebuildSelector(); renderAll();
});

/* ---------------- add-scheme flow ---------------- */
const overlay=document.getElementById("overlay");
const $=id=>document.getElementById(id);
function openAdd(){
  ["f_name","f_st","f_crops","f_notes","f_base","f_spend","f_share"].forEach(id=>$(id).value="");
  $("f_chem").classList.remove("on"); $("f_chem").dataset.on="0";
  $("f_seed").classList.add("on"); $("f_seed").dataset.on="1";
  $("genState").textContent=""; overlay.classList.add("show");
}
function closeAdd(){overlay.classList.remove("show");}
$("newBtn").addEventListener("click",openAdd);
$("cancelAdd").addEventListener("click",closeAdd);
overlay.addEventListener("click",e=>{if(e.target===overlay)closeAdd();});
["f_chem","f_seed"].forEach(id=>{const t=$(id);
  t.addEventListener("click",()=>{const on=t.dataset.on==="1";t.dataset.on=on?"0":"1";t.classList.toggle("on",!on);});});

function readForm(){
  const v=id=>$(id).value.trim();
  return {name:v("f_name")||"Untitled scheme",lvl:$("f_lvl").value,st:v("f_st"),
    type:$("f_type").value,pay:$("f_pay").value,crops:v("f_crops"),
    chemfree:$("f_chem").dataset.on==="1",privseed:$("f_seed").dataset.on==="1",
    base:v("f_base"),spend:v("f_spend"),sharePct:v("f_share"),notes:v("f_notes")};
}
function commitScheme(s){
  s._seed=clone(s); DATA.push(s); cur=DATA.length-1;
  rebuildSelector(); renderAll(); closeAdd();
}
function toast(msg){const t=$("toast");t.textContent=msg;t.classList.add("show");
  clearTimeout(t._t);t._t=setTimeout(()=>t.classList.remove("show"),3400);}

$("genHeur").addEventListener("click",()=>{commitScheme(genHeuristic(readForm()));toast("Added a rule-based estimate — not researched. Replace with real data before deciding.");});
$("genAI").addEventListener("click",async()=>{
  const f=readForm(); if(!f.name||f.name==="Untitled scheme"){toast("Enter a scheme name first.");return;}
  $("genState").textContent="Researching live data… (up to ~20s)"; $("genAI").disabled=true; $("genHeur").disabled=true;
  try{
    const s=await researchScheme(f); commitScheme(s);
    toast(s.provenance==='web' ? "Researched live — review the sources in the insights panel."
        : s.provenance==='model' ? "Web search unavailable — used model knowledge. Verify before use."
        : "AI unavailable — used a rule-based estimate.");
  }catch(e){ commitScheme(genHeuristic(f)); toast("AI unavailable — used a rule-based estimate."); }
  finally{ $("genAI").disabled=false; $("genHeur").disabled=false; $("genState").textContent=""; }
});

/* heuristic generator: infers a full scorecard from the descriptive inputs */
function genHeuristic(f){
  const crops=(f.crops||'').toLowerCase(), has=re=>re.test(crops);
  const strongKeys=['cotton','maize','corn','rice','paddy','veg','tomato','okra','chilli','mustard','soy','oilseed','sunflower'];
  const strongCount=strongKeys.filter(k=>crops.includes(k)).length;
  const overlap = strongCount>=2?5 : strongCount===1?4 : 3;
  const intensity = has(/cotton|veg|tomato|okra|chilli/)?4 : has(/oilseed|mustard|soy|maize|corn/)?4 : has(/pulse|millet|gram/)?3 : 3;
  const arch={
    'Seed supply / minikit':{B:{seed:5,cp:2,white:3},cost:3,margin:3,mpct:.18},
    'Input subsidy (DBT)':{B:{seed:4,cp:4,white:3},cost:4,margin:4,mpct:.20},
    'Crop insurance':{B:{seed:1,cp:1,white:4},cost:3,margin:2,mpct:.10},
    'Cash transfer':{B:{seed:1,cp:1,white:4},cost:2,margin:2,mpct:.10},
    'Mechanization':{B:{seed:2,cp:2,white:3},cost:3,margin:3,mpct:.15},
    'Natural / Organic':{B:{seed:1,cp:1,white:4},cost:2,margin:2,mpct:.10},
    'Horticulture / Veg':{B:{seed:4,cp:3,white:4},cost:3,margin:5,mpct:.22},
    'IPM / Demo':{B:{seed:3,cp:4,white:3},cost:3,margin:3,mpct:.17},
    'Price support':{B:{seed:2,cp:2,white:3},cost:3,margin:3,mpct:.15},
    'Digital / Other':{B:{seed:2,cp:2,white:4},cost:3,margin:3,mpct:.15},
  }[f.type] || {B:{seed:3,cp:3,white:3},cost:3,margin:3,mpct:.15};
  const pay={'DBT / e-RUPI':{cash:4,lag:30,gov:4},'Reimbursement':{cash:3,lag:60,gov:3},
             'Mixed':{cash:3,lag:45,gov:3},'Cash to farmer':{cash:4,lag:30,gov:4}}[f.pay]||{cash:3,lag:45,gov:3};
  const scale=f.lvl==='Central'?5:4;
  const g=[ f.chemfree?0:1, f.privseed?1:0, 1, 1 ];
  const base=+f.base || (f.lvl==='Central'?1000:800);
  const spend=+f.spend || ((arch.B.seed>=4&&arch.B.cp>=4)?3500:2500);
  const share=(f.sharePct!=='')? +f.sharePct/100 : .06;
  const sp=[]; if(has(/maize|corn/))sp.push('DEKALB corn'); if(has(/rice|paddy/))sp.push('Arize rice');
  if(has(/cotton/))sp.push('cotton hybrids'); if(has(/veg|tomato|okra|chilli/))sp.push('veg seed');
  if(has(/mustard|soy|oilseed/))sp.push('mustard/soybean');
  const cpp=[]; if(arch.B.cp>=4)cpp.push('herbicides','fungicides'); if(has(/cotton/))cpp.push('cotton insecticides'); if(arch.B.seed>=4)cpp.push('seed treatment');
  const risks=[]; if(f.chemfree)risks.push('chemical-free narrative excludes CP');
  if(has(/cotton/))risks.push('Bt-seed MRP price control caps margin');
  if(f.type==='Cash transfer')risks.push('no product channel; indirect only');
  if(f.pay==='Reimbursement')risks.push('reimbursement float strains cash');
  const mode={'Seed supply / minikit':'Empanel as seed agency; supply minikits',
    'Input subsidy (DBT)':'Empanel Bayer SKUs for DBT; retail pull-through',
    'Horticulture / Veg':'Veg seed + protected-cultivation CP','IPM / Demo':'Demo plots + IPM module supply',
    'Natural / Organic':'Excluded for CP — monitor seed angle','Crop insurance':'No direct seed/CP channel',
    'Cash transfer':'Indirect demand capture only'}[f.type] || 'Assess empanelment / supply route';
  return {n:f.name,lvl:f.lvl,st:f.st||(f.lvl==='Central'?'All-India':'—'),g,
    A:{scale,intensity,gov:pay.gov,channel:3},
    B:{seed:arch.B.seed,cp:arch.B.cp,overlap,white:arch.B.white},
    T:{cash:pay.cash,cost:arch.cost,margin:arch.margin},
    lag:pay.lag,costL:f.lvl==='Central'?50:45,mpct:arch.mpct,
    base,spend,share,mode,sp:sp.join(', ')||'—',cp:cpp.join(', ')||'—',
    risk:risks.join('; ')||'Confirm payment lag, margin and competitor set',provenance:'heuristic',added:true};
}

/* ---------------- live research pipeline ---------------- */
const provLabel=p=>({web:"Researched · web",model:"Model estimate",heuristic:"Heuristic · not researched"}[p]||"");
const esc=s=>String(s||"").replace(/[<>&]/g,c=>({"<":"&lt;",">":"&gt;","&":"&amp;"}[c]));
function clampScheme(j,f,provenance){
  const cl=(x,d)=>{x=Math.round(+x);return isFinite(x)?Math.max(1,Math.min(5,x)):d;};
  const lvl=(j.lvl==="Central"||j.lvl==="State")?j.lvl:(f.lvl||"State");
  const o={n:f.name,lvl,st:j.st||f.st||(lvl==="Central"?"All-India":"—"),
    g:(Array.isArray(j.g)?j.g:[1,1,1,1]).slice(0,4).map(x=>x?1:0),
    A:{scale:cl(j.A&&j.A.scale,4),intensity:cl(j.A&&j.A.intensity,3),gov:cl(j.A&&j.A.gov,3),channel:cl(j.A&&j.A.channel,3)},
    B:{seed:cl(j.B&&j.B.seed,3),cp:cl(j.B&&j.B.cp,3),overlap:cl(j.B&&j.B.overlap,3),white:cl(j.B&&j.B.white,3)},
    T:{cash:cl(j.T&&j.T.cash,3),cost:cl(j.T&&j.T.cost,3),margin:cl(j.T&&j.T.margin,3)},
    lag:Math.max(0,Math.round(+j.lag||45)),costL:Math.max(0,Math.round(+j.costL||45)),
    mpct:Math.min(1,Math.max(0,+j.mpct||.15)),
    base:Math.max(0,Math.round(+j.base||(lvl==="Central"?1000:800))),
    spend:Math.max(0,Math.round(+j.spend||2800)),share:Math.min(1,Math.max(0,+j.share||.06)),
    mode:(j.mode||"Assess empanelment / supply route").slice(0,100),
    sp:(j.sp||"—").slice(0,90),cp:(j.cp||"—").slice(0,90),
    risk:(j.risk||"Confirm payment lag, margin and competitor set").slice(0,150),
    notes:(j.notes||"").slice(0,700),
    sources:Array.isArray(j.sources)?j.sources.slice(0,6).filter(s=>s&&s.url):[],
    provenance,added:true};
  if(f.base)o.base=+f.base; if(f.spend)o.spend=+f.spend; if(f.sharePct!=="")o.share=+f.sharePct/100;
  return o;
}
async function researchScheme(f){
  const base=API_BASE_URL.replace(/\/+$/,"");
  const ctrl=new AbortController();
  const t=setTimeout(()=>ctrl.abort(),35000);
  try{
    const res=await fetch(base+"/api/research",{
      method:"POST",
      headers:{"Content-Type":"application/json"},
      body:JSON.stringify({name:f.name,st:f.st,lvl:f.lvl,type:f.type,pay:f.pay,crops:f.crops,
        chemfree:f.chemfree,privseed:f.privseed,base:f.base,spend:f.spend,sharePct:f.sharePct,notes:f.notes}),
      signal:ctrl.signal
    });
    if(!res.ok) throw new Error("backend "+res.status);
    const data=await res.json();
    if(!data||!data.ok||!data.result) throw new Error((data&&data.error)||"no result");
    const o=clampScheme(data.result,f,data.provenance==="model"?"model":"web");
    if(Array.isArray(data.sources)&&data.sources.length) o.sources=data.sources.slice(0,6).filter(s=>s&&s.url);
    return o;
  }catch(e){
    return genHeuristic(f); // backend unreachable/failed -> Quick Estimate (rule-based)
  }finally{ clearTimeout(t); }
}
document.getElementById("exportBtn").addEventListener("click",()=>{
  const head=["Scheme","Level","State","Strategic","Triangle","Overall","Prize_Cr","Tier","Priority","Quadrant","Cash","Cost","Margin","Recommendation"];
  const rows=DATA.map(s=>{const c=compute(s);return [s.n,s.lvl,s.st,c.strategic.toFixed(1),c.triangle.toFixed(1),
    c.overall.toFixed(1),c.addr.toFixed(1),c.tier,c.priority.toFixed(1),c.passed?c.quad:"Excluded",
    s.T.cash,s.T.cost,s.T.margin,c.rec].map(x=>`"${x}"`).join(",");});
  const blob=new Blob([head.join(",")+"\n"+rows.join("\n")],{type:"text/csv"});
  const a=document.createElement("a");a.href=URL.createObjectURL(blob);a.download="scheme_scorecard.csv";a.click();
});

renderWeights(); renderAll();
