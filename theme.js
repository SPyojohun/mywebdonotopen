(function(){
const FONTS={sans:'ui-sans-serif,"SF Pro Display","Segoe UI Variable Display","Helvetica Neue",system-ui,sans-serif',rounded:'ui-rounded,"SF Pro Rounded",Nunito,system-ui,sans-serif',mono:'ui-monospace,"SF Mono",Menlo,Consolas,monospace',serif:'ui-serif,Georgia,"Times New Roman",serif'};
const PRESETS={
 orange:{n:'Orange',accent:'#ff7a1a',bg:'#0b0b0b',surface:'#151515',text:'#f4f1ec'},
 green:{n:'Green',accent:'#3dff7a',bg:'#050a06',surface:'#0d150f',text:'#d7f5de'},
 blue:{n:'Blue',accent:'#4da3ff',bg:'#070b14',surface:'#101828',text:'#e6edf7'},
 purple:{n:'Purple',accent:'#c05cff',bg:'#0c0615',surface:'#170d26',text:'#f1e8ff'},
 mono:{n:'Mono',accent:'#e8e8e8',bg:'#000000',surface:'#111111',text:'#ffffff'},
 paper:{n:'Paper',accent:'#d9480f',bg:'#f6f2ec',surface:'#ffffff',text:'#141210'}};
const DEF={...PRESETS.orange,radius:14,minw:270,zoom:100,font:'sans',ar:'4/3'};delete DEF.n;
const lum=h=>{const n=parseInt(h.slice(1),16),f=c=>{c/=255;return c<=.03928?c/12.92:((c+.055)/1.055)**2.4};return .2126*f(n>>16)+.7152*f((n>>8)&255)+.0722*f(n&255)};
function get(){try{return{...DEF,...JSON.parse(localStorage.getItem('nnn-theme2'))}}catch{return{...DEF}}}
function apply(t){const r=document.documentElement,s=r.style;
 s.setProperty('--gold',t.accent);s.setProperty('--bg',t.bg);s.setProperty('--glass',t.surface);s.setProperty('--tx',t.text);
 s.setProperty('--glass2','color-mix(in srgb,'+t.surface+' 86%,'+t.text+' 14%)');
 s.setProperty('--line','color-mix(in srgb,'+t.surface+' 78%,'+t.text+' 22%)');
 s.setProperty('--mut','color-mix(in srgb,'+t.text+' 58%,'+t.bg+')');
 s.setProperty('--on',lum(t.accent)>.45?'#111111':'#ffffff');s.setProperty('--r',t.radius+'px');s.setProperty('--minw',t.minw+'px');
 s.setProperty('--ar',t.ar);s.zoom=(t.zoom||100)/100;s.setProperty('--z',(t.zoom||100)/100);s.setProperty('--font',FONTS[t.font]||FONTS.sans);
 r.dataset.theme=lum(t.bg)>.4?'light':'dark';
 const m=document.querySelector('meta[name=theme-color]');if(m)m.content=t.bg}
function save(t){try{localStorage.setItem('nnn-theme2',JSON.stringify(t))}catch{}}
window.NNN_THEME={get,apply,save,PRESETS,DEF};
apply(get());
try{const b=JSON.parse(localStorage.getItem('nnn-blur')||'{}');document.documentElement.classList.toggle('blurcov',!!b.on);document.documentElement.classList.toggle('blurpeek',!!b.peek);if(b.px)document.documentElement.style.setProperty('--blurpx',b.px+'px')}catch(e){}
})();
