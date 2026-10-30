@component()
export class GateRunner extends APJS.BasicScriptComponent {
 @serializeProperty cube!:APJS.SceneObject; @serializeProperty sphere!:APJS.SceneObject;
 @serializeProperty camera!:APJS.SceneObject; @serializeProperty hud!:APJS.SceneObject; @serializeProperty hudText!:APJS.SceneObject;
 @serializeProperty hintPlate!:APJS.SceneObject; @serializeProperty hint!:APJS.SceneObject;
 @serializeProperty blue!:APJS.Material; @serializeProperty red!:APJS.Material; @serializeProperty dark!:APJS.Material;
 @serializeProperty white!:APJS.Material; @serializeProperty cyan!:APJS.Material; @serializeProperty gold!:APJS.Material;
 @serializeProperty roadMat!:APJS.Material; @serializeProperty purple!:APJS.Material;
 @serializeProperty shotAudio!:APJS.SceneObject; @serializeProperty hitAudio!:APJS.SceneObject; @serializeProperty goodAudio!:APJS.SceneObject;
 @serializeProperty blueBody!:APJS.Prefab;
 @serializeProperty blueLeg!:APJS.Prefab;
 @serializeProperty redBody!:APJS.Prefab;
 @serializeProperty redLeg!:APJS.Prefab;
 @serializeProperty eliteBody!:APJS.Prefab;
 @serializeProperty eliteLeg!:APJS.Prefab;
 @serializeProperty bossBody!:APJS.Prefab;
 @serializeProperty bossLeg!:APJS.Prefab;
 @serializeProperty verificationState:number=0;
 private pressure=1;private enemyZ=-48;private wave=1;private ready=false;private active=false;private state='idle';private time=0;private level=1;private count=5;private shield=0;private weapon=0;
 private x=0;private targetX=0;private finger=-1;private startTouch=0;private startX=0;private gateIndex=0;private gateZ=-38;
 private enemyHP=0;private enemyMax=1;private enemyN=0;private boss=false;private battleTime=0;private shotClock=0;private damageClock=0;private pulse=0;private laserClock=0;private laserX=0;private laserPhase=0;
 private runChoices:string[][]=[];private waveHits=0;private shakeCooldown=0;private bossRounds=0;private bossFired=0;private bestChoices=0;
 private deadA:number[]=[];private deadE:number[]=[];private impact=0;private enemyFire=0;private grenadeTime=0;private grenadeX=0;private grenade!:APJS.SceneObject;private blast!:APJS.SceneObject;private blastLife=0;
 private flashes:APJS.SceneObject[]=[];
 private elites:APJS.SceneObject[]=[];private bodies:APJS.SceneObject[]=[];private bossFeet:APJS.SceneObject[]=[];
 private allies:APJS.SceneObject[]=[];private enemies:APJS.SceneObject[]=[];private feet:APJS.SceneObject[][]=[];private enemyFeet:APJS.SceneObject[][]=[];
 private gates:APJS.SceneObject[]=[];private gateText:APJS.SceneObject[]=[];private stripes:APJS.SceneObject[]=[];private bullets:APJS.SceneObject[]=[];private bulletAge:number[]=[];private bulletSide:number[]=[];
 private sparks:APJS.SceneObject[]=[];private sparkAge:number[]=[];private sparkX:number[]=[];private sparkZ:number[]=[];
 private panel!:APJS.SceneObject;private panelText!:APJS.SceneObject;private notice!:APJS.SceneObject;private noticeLife=0;private beam!:APJS.SceneObject;private bossRoot!:APJS.SceneObject;private bossCore!:APJS.SceneObject;private gateOps:string[]=[];
 private readonly choices=[['+3','×2'],['×2','+4'],['+5','×2']];
 private pos(o:APJS.SceneObject,x:number,y:number,z:number):void{o.getTransform().localPosition=new APJS.Vector3f(x,y,z);}
 private scale(o:APJS.SceneObject,x:number,y:number,z:number):void{o.getTransform().localScale=new APJS.Vector3f(x,y,z);}
 private ui(o:APJS.SceneObject,x:number,y:number,w:number,h:number):void{const s=o.getComponent('ScreenTransform') as APJS.ScreenTransform;s.anchoredPosition=new APJS.Vector2f(x,y);s.sizeDelta=new APJS.Vector2f(w,h);}
 private text(o:APJS.SceneObject,t:string):void{(o.getComponent('Text') as APJS.Text).text=t;}
 private order(o:APJS.SceneObject,n:number):void{const r=(o.getComponent('Image')||o.getComponent('Text')) as any;r.autoSortingOrder=false;r.sortingOrder=n;}
 private shape(sphere:boolean,parent:APJS.SceneObject|null,x:number,y:number,z:number,w:number,h:number,d:number,mat:APJS.Material):APJS.SceneObject{
 const o=(sphere?this.sphere:this.cube).clone();o.parent=parent||this.getSceneObject();this.pos(o,x,y,z);this.scale(o,w/8,h/8,d/8);(o.getComponent('MeshRenderer') as APJS.MeshRenderer).materials=[mat];o.setEnabledInHierarchy(true);return o;}
 private root(name:string):APJS.SceneObject{const r=this.getSceneObject().scene.createSceneObject(name);r.parent=this.cube.parent;return r;}
 private label(parent:APJS.SceneObject|null,x:number,y:number,w:number,h:number,size:number):APJS.SceneObject{const o=this.hint.clone();o.parent=parent;this.ui(o,x,y,w,h);(o.getComponent('Text') as APJS.Text).fontSize=size;this.order(o,45);o.setEnabledInHierarchy(true);return o;}
 private sound(o:APJS.SceneObject):void{const a=o.getComponent('AudioComponent') as APJS.AudioComponent;if(a)a.play();}
 private say(t:string):void{this.text(this.notice,t);this.noticeLife=1.4;}
 private unit(kind:string):APJS.SceneObject{const enemy=kind!=='blue',boss=kind==='boss';const r=this.root(kind);const body=(kind==='blue'?this.blueBody:kind==='red'?this.redBody:kind==='elite'?this.eliteBody:this.bossBody).instantiate(r)!;this.pos(body,0,0,0);this.bodies.push(body);
 const leg=kind==='blue'?this.blueLeg:kind==='red'?this.redLeg:kind==='elite'?this.eliteLeg:this.bossLeg;const fs:APJS.SceneObject[]=[];
 for(let k=-1;k<=1;k+=2){const o=leg.instantiate(r)!;this.pos(o,k*(boss?.24:.105),boss?.62:.5,0);fs.push(o);}
 if(enemy)r.getTransform().localEulerAngles=new APJS.Vector3f(0,180,0);
 if(kind==='blue'){this.feet.push(fs);this.flashes.push(this.shape(true,r,.63,.97,-.88,.16,.16,.3,this.gold));}else if(boss)this.bossFeet=fs;else this.enemyFeet.push(fs);return r;}
 private start=()=>{this.active=true;this.pressure=1.147916667*(.75+Math.random()*.5);this.level=1;this.count=5;this.shield=0;this.weapon=0;if(this.ready)this.beginLevel();console.log('[state] record reset level1 count5');};
 private stop=()=>{this.active=false;this.state='idle';this.finger=-1;if(this.ready){this.panel.setEnabledInHierarchy(false);this.beam.setEnabledInHierarchy(false);this.text(this.hint,'开拍出发 · 左右拖动选门 · 遇敌自动攻击');}};
 private touch=(e:APJS.IEvent)=>{if(!this.ready||!this.active)return;const t=e.args[0] as APJS.TouchData;
 if(this.state!=='run'&&this.state!=='battle'&&this.state!=='approach')return;
 if(t.phase===APJS.TouchPhase.Began){this.finger=t.touchId;this.startTouch=t.position.x;this.startX=this.targetX;}
 else if(t.touchId===this.finger){if(t.phase===APJS.TouchPhase.Moved)this.targetX=Math.max(-2.7,Math.min(2.7,this.startX+(t.position.x-this.startTouch)*12));else{this.finger=-1;console.log('[input] drag target='+this.targetX.toFixed(2));}}};
 onStart():void{const e=APJS.EventManager.getGlobalEmitter();e.on(APJS.EventType.RecordStart,this.start,this);e.on(APJS.EventType.RecordEnd,this.stop,this);e.on(APJS.EventType.Touch,this.touch,this);}
 private init():void{
 this.ui(this.hud,0,490,620,115);this.ui(this.hudText,0,0,565,100);this.order(this.hud,40);this.order(this.hudText,45);
 this.ui(this.hintPlate,0,360,600,76);this.ui(this.hint,0,0,560,75);this.order(this.hintPlate,40);this.order(this.hint,45);
 this.panel=this.hud.clone();this.ui(this.panel,0,25,620,570);this.order(this.panel,60);
 this.panelText=this.label(this.panel,0,0,550,500,27);this.order(this.panelText,65);this.panel.setEnabledInHierarchy(false);
 this.notice=this.label(this.hud.parent,0,-350,610,80,30);(this.notice.getComponent('Text') as APJS.Text).color=new APJS.Color(.08,.18,.28,1);
 this.shape(false,null,0,-.65,-40,180,1,180,this.white);const road=this.shape(false,null,0,-.08,-40,8.4,.2,110,this.roadMat);(road.getComponent('MeshRenderer') as any).shadowMode=APJS.ShadowMode.Receiver;
 for(const x of [-4.15,4.15]){this.shape(false,null,x,.1,-40,.13,.2,110,this.cyan);this.shape(false,null,x,.18,-40,.18,.2,110,this.white);}
 for(let i=0;i<20;i++){const o=this.shape(false,null,0,.05,-i*5,.09,.03,1.7,this.white);this.stripes.push(o);}
 for(let i=0;i<24;i++)this.allies.push(this.unit('blue'));
 for(let i=0;i<12;i++)this.enemies.push(this.unit('red'));for(let i=0;i<5;i++)this.elites.push(this.unit('elite'));
 for(let side=0;side<2;side++){const r=this.root('数值能量门');const x=side===0?-2.05:2.05;this.pos(r,x,0,-38);
 for(const xx of [-1.86,1.86])this.shape(false,r,xx,1.8,0,.16,3.6,.24,side===0?this.cyan:this.gold);
 this.shape(false,r,0,3.55,0,3.85,.18,.24,side===0?this.cyan:this.gold);this.shape(false,r,0,1.8,0,3.55,3.35,.24,side===0?this.cyan:this.gold);
 this.shape(false,r,0,.15,0,3.8,.18,.65,side===0?this.cyan:this.gold);this.gates.push(r);this.gateText.push(this.label(this.hud.parent,0,0,160,75,42));}
 this.bossRoot=this.unit('boss');this.scale(this.bossRoot,1.8,1.8,1.8);this.pos(this.bossRoot,0,0,-14);
 this.bossCore=this.shape(true,this.bossRoot,0,1.30,-.46,.31,.31,.12,this.gold);
 this.beam=this.shape(false,null,0,.13,-7,1.7,.08,19,this.red);this.beam.setEnabledInHierarchy(false);
 for(let i=0;i<18;i++){this.bullets.push(this.shape(false,null,0,1,0,.09,.09,.85,i%2?this.gold:this.cyan));this.bulletAge.push(0);this.bulletSide.push(0);}
 for(let i=0;i<20;i++){this.sparks.push(this.shape(true,null,0,1,0,.22,.22,.22,i%3===0?this.white:this.gold));this.sparkAge.push(0);this.sparkX.push(0);this.sparkZ.push(0);}
 this.grenade=this.shape(true,null,0,1,-10,.36,.36,.36,this.gold);this.blast=this.shape(true,null,0,.2,0,1,.1,1,this.gold);this.grenade.setEnabledInHierarchy(false);this.blast.setEnabledInHierarchy(false);
 this.cube.setEnabledInHierarchy(false);this.sphere.setEnabledInHierarchy(false);this.ready=true;this.beginLevel();if(!this.active)this.stop();console.log('[state] 3D pools allies24 enemies12 bullets18 initialized');
 }
 private beginLevel():void{this.runChoices=[[["÷2","+3 ×2"],["-1","×3"],["×2 -3","-1"]],[["×3","+2 ×2"],["÷2","+6 ÷2"],["×3","+5"]],[["×2","+6 ÷2"],["+4","-1"],["+6","-3"]],[["×3","+4"],["×3","+6"],["+6","-3"]],[["-1","×2"],["-1","×3"],["+2","-2"]],[["+3 ×2","÷2"],["÷2","+6"],["-2","+5"]],[["+3 ×2","×3"],["+6 ÷2","÷2"],["+3","-2"]],[["-3","+5"],["÷2","-1"],["÷2","×2 -3"]],[["×2 -3","÷2"],["+6","-3"],["-3","+3"]],[["+3","×2 -3"],["×2 -3","-3"],["-2","+4"]],[["÷2","+6 ÷2"],["÷2","+4"],["+5","÷2"]],[["+6 ÷2","-3"],["+2","-1"],["×3","+2 ×2"]]][Math.floor(Math.random()*12)];this.runChoices=this.runChoices.map(p=>Math.random()<.5?[p[1],p[0]]:p);this.bestChoices=0;this.shakeCooldown=0;this.impact=0;this.deadA=[];this.deadE=[];this.grenadeTime=0;this.blastLife=0;this.wave=1;this.gateIndex=0;this.x=0;this.targetX=0;this.panel.setEnabledInHierarchy(false);this.finger=-1;for(let i=0;i<this.sparkAge.length;i++)this.sparkAge[i]=0;for(let i=0;i<this.bulletAge.length;i++)this.bulletAge[i]=0;this.prepareWave();}
 private prepareWave():void{this.state='run';this.panel.setEnabledInHierarchy(false);this.enemyFire=0;this.gateZ=-26;this.enemyZ=-48;this.boss=this.wave===3;this.enemyN=this.boss?0:this.wave===1?8:5;this.deadE=[];this.enemyMax=this.boss?1:this.enemyN;this.enemyHP=this.enemyMax;this.gateOps=(this.runChoices.length?this.runChoices:this.choices)[this.wave-1];this.beam.setEnabledInHierarchy(false);this.bossRoot.setEnabledInHierarchy(this.boss);this.say(['普通小队','精英守卫','最终首领'][this.wave-1]+' · 前方接敌');this.text(this.hint,'左右拖动选门 · 遇敌自动攻击');}
 private burst(x:number,z:number):void{for(let i=0;i<20;i++){this.sparkAge[i]=.45;this.sparkX[i]=x;this.sparkZ[i]=z;this.pos(this.sparks[i],x,1,z);}}
 private shake(strength:number):void{if(this.wave===1||this.shakeCooldown>0||this.state!=='battle')return;this.impact=strength;this.shakeCooldown=1.2;console.log('[feedback] shake wave='+this.wave+' time='+this.time.toFixed(2));}
 private loseUnits(n:number):void{const before=this.count;this.count=Math.max(0,this.count-n);for(let i=this.count;i<before;i++)this.deadA[i]=.28;this.burst(this.x,.6);this.shake(.3);this.sound(this.hitAudio);console.log('[combat] one-hit casualties='+(before-this.count));}
 private explode(x:number,z:number):void{this.blastLife=.32;this.pos(this.blast,x,.35,z);this.burst(x,z);this.shake(.4);this.sound(this.hitAudio);}
 private applyGate(n:number,op:string):number{for(const token of op.split(' ')){const v=parseInt(token.substring(1),10);n=token[0]==='+'?n+v:token[0]==='-'?n-v:token[0]==='×'?n*v:Math.floor(n/v);n=Math.max(0,Math.min(24,n));}return n;}
 private passGate():void{const side=this.x<0?0:1,op=this.gateOps[side],before=this.count;const values=this.gateOps.map(t=>this.applyGate(before,t));this.count=values[side];if(this.count===Math.max(values[0],values[1]))this.bestChoices++;this.say(op+'  '+before+' → '+this.count);this.sound(this.goodAudio);console.log('[gate] '+op+' before='+before+' after='+this.count);this.gateIndex++;if(this.count<=0){this.finish(false);return;}this.state='approach';this.text(this.hint,'敌人正在接近 · 准备攻击');}
 private beginBattle(boss:boolean):void{this.panel.setEnabledInHierarchy(false);this.state='battle';this.boss=boss;this.battleTime=0;this.waveHits=0;this.shotClock=boss?1.15:.72;this.bossRounds=12;this.bossFired=0;this.enemyFire=0;this.damageClock=0;this.laserClock=0;this.laserPhase=0;this.grenadeTime=0;
 this.bossRoot.setEnabledInHierarchy(boss);this.say(boss?'首领出现 · 注意红色预警':'敌方小队来袭');this.text(this.hint,boss?'首领固定齐射 12 发 · 兵力超过12人可反击':'自动交火 · 本波固定损失2人');console.log('[state] battle boss='+boss+' hp='+this.enemyHP+' count='+this.count);}
 private finish(win:boolean):void{
 this.state=win?'win':'lose';this.noticeLife=0;this.impact=0;this.grenadeTime=0;this.beam.setEnabledInHierarchy(false);this.panel.setEnabledInHierarchy(true);
 const pick=(xs:string[])=>xs[Math.floor(Math.random()*xs.length)];
 const stars=win?(this.count>=10?5:this.count>=7?4:this.count>=4?3:this.count>=2?2:1):0;
 const titles=[['极限翻盘王','独苗战神','命硬指挥官'],['绝地求生官','逆风操盘手','残局收割者'],['决策大师','战术鬼才','破局专家'],['王牌指挥官','选门预言家','精算突击手'],['满星战略家','天选决策王','全场统治者']];
 let title='',line='';
 if(win){title=pick(titles[stars-1]);line=this.count>=10?'带着大部队凯旋，这波赢麻了！':this.count>=7?'兵力留得住，决策有点东西！':this.count>=4?'门选得漂亮，胜利稳稳拿下！':this.count>=2?'差点团灭，但赢了就是赢了！':'就剩你一个，也把全场拿下了！';}
 else if(this.wave===3){title=pick(['最后一步挑战者','差一枪封神','惜败终局']);line=pick(['都到Boss面前了，就差最后一口气！','可惜！胜利已经近在眼前。','不是不强，是这次差一点运气。']);}
 else if(this.wave===2){title=pick(['嘴强指挥官','战术迷路人','精英劝退体验官']);line=pick(['普通兵：还以为你多厉害呢。','这操作，精英怪都看笑了。','人是带来了，战术落家里了？']);}
 else{title=pick(['新手村常驻嘉宾','反向决策大师','开局即谢幕']);line=pick(['刚出门就下班？这班上得够快。','门都替你算好了，你还真敢选！','敌人：啊？这就结束了？']);}
 const rating=win?'★'.repeat(stars)+'☆'.repeat(5-stars):'☆☆☆☆☆';
 this.text(this.panelText,(win?'突击成功！':'挑战结束')+'\n'+rating+'\n\n「'+title+'」\n\n'+(win?'剩余 '+this.count+' 人 · '+stars+' 星通关':'倒在第 '+this.wave+' / 3 波')+'\n'+line+'\n\n重新开拍 · 换个称号');
 this.text(this.hint,win?'这次的称号，你配得上':'再来一次，把结局改写');this.sound(this.goodAudio);
 console.log('[result] win='+win+' wave='+this.wave+' survivors='+this.count+' stars='+stars+' title='+title+' bestChoices='+this.bestChoices);
 }

 onUpdate(dt:number):void{
 if(!this.ready){if(!this.cube||!this.sphere||!this.hud||!this.blue||!this.blueBody||!this.blueLeg||!this.redBody||!this.redLeg||!this.eliteBody||!this.eliteLeg||!this.bossBody||!this.bossLeg){console.log('[guard] prefab '+!!this.blueBody+','+!!this.blueLeg+','+!!this.redBody+','+!!this.redLeg+','+!!this.eliteBody+','+!!this.eliteLeg+','+!!this.bossBody+','+!!this.bossLeg);return;}this.init();}
 dt=Math.min(.05,Math.max(0,dt));this.time+=dt;const depth=Math.floor((Math.max(1,this.count)-1)/Math.min(5,Math.ceil(Math.sqrt(Math.max(1,this.count)))))*.85;const ct=this.camera.getTransform();ct.localPosition=new APJS.Vector3f(this.x*.85,4.2+depth*.12,9.0+depth*.86);ct.localEulerAngles=new APJS.Vector3f(-13+Math.sin(this.time*95)*this.impact*2,0,Math.cos(this.time*80)*this.impact);this.impact=Math.max(0,this.impact-dt*4);this.shakeCooldown=Math.max(0,this.shakeCooldown-dt);if(this.wave===1)this.impact=0;
 if(this.verificationState>0){const v=this.verificationState;this.verificationState=0;if(v===1){this.count=18;this.wave=1;this.prepareWave();this.enemyZ=-10;this.beginBattle(false);}else if(v===2){this.count=18;this.wave=3;this.prepareWave();this.enemyZ=-10;this.beginBattle(true);}else if(v===3){this.wave=2;this.prepareWave();this.gateZ=-8;this.enemyZ=-30;}else if(v===4){this.count=11;this.wave=3;this.finish(true);}else if(v===5){this.count=0;this.wave=3;this.finish(false);}else if(v===8){this.count=0;this.wave=1;this.finish(false);}else if(v===9){this.count=1;this.wave=3;this.finish(true);}else if(v===10){this.count=5;this.wave=3;this.finish(true);}else if(v===7){this.wave=2;this.count=14;this.x=0;this.targetX=0;this.prepareWave();this.enemyZ=-10;this.beginBattle(false);}else if(v===11||v===12){this.wave=3;this.count=24;this.x=0;this.targetX=0;this.prepareWave();this.enemyZ=-10;this.beginBattle(true);this.count=v===11?13:12;this.bossRounds=12;this.laserX=-2.7;this.laserPhase=1;}else if(v===6){this.gateZ=-1;this.count=24;this.gateOps=['+5','×2'];}console.log('[state] verify='+v);}
 if(this.active&&(this.state==='run'||this.state==='battle'||this.state==='approach'))this.x+=(this.targetX-this.x)*(1-Math.exp(-dt*12));
 const running=this.active&&this.state==='run';
 if(running){this.gateZ+=dt*16;this.enemyZ+=dt*16;if(this.gateZ>=0)this.passGate();}if(this.active&&this.state==='approach'){this.enemyZ=Math.min(-10,this.enemyZ+dt*16);if(this.enemyZ>=-10)this.beginBattle(this.boss);}
 for(let j=0;j<2;j++){this.gates[j].setEnabledInHierarchy(this.state==='run'||this.state==='idle');this.gateText[j].setEnabledInHierarchy(this.state==='run'||this.state==='idle');this.pos(this.gates[j],j===0?-2.05:2.05,0,this.gateZ);const p=(this.camera.getComponent('Camera') as APJS.Camera).worldToViewportPoint(new APJS.Vector3f(j===0?-2.05:2.05,1.9,this.gateZ+.3));this.ui(this.gateText[j],p.x*720-360,p.y*1280-640,170,110);(this.gateText[j].getComponent('Text') as APJS.Text).fontSize=(this.gateOps[j]||'').includes(' ')?30:42;this.text(this.gateText[j],(this.gateOps[j]||'+3').replace(' ','\n再 '));}
 for(let i=0;i<24;i++){const o=this.allies[i];this.deadA[i]=Math.max(0,(this.deadA[i]||0)-dt);o.setEnabledInHierarchy(i<this.count||this.deadA[i]>0);o.getTransform().localEulerAngles=new APJS.Vector3f(i>=this.count?(1-this.deadA[i]/.28)*85:0,0,0);const cols=Math.max(1,Math.min(5,Math.ceil(Math.sqrt(Math.max(1,this.count))))),row=Math.floor(i/cols),xx=(i%cols-(cols-1)/2)*.68;this.pos(o,this.x+xx,.04+Math.abs(Math.sin(this.time*9+i))*(running?.12:0),row*.85);for(let k=0;k<2;k++)this.feet[i][k].getTransform().localEulerAngles=new APJS.Vector3f(running?Math.sin(this.time*12+i+k*3.14)*22:0,0,0);}
 const visibleEnemy=this.state==='battle'||this.state==='run'||this.state==='approach'||this.state==='idle';const alive=Math.ceil(this.enemyHP/this.enemyMax*this.enemyN);
 for(let i=0;i<12;i++){const o=this.enemies[i];o.setEnabledInHierarchy(visibleEnemy&&!this.boss&&(i<alive||(this.deadE[i]||0)>0));const elite=this.wave===2;o.setEnabledInHierarchy(visibleEnemy&&!this.boss&&!elite&&(i<alive||(this.deadE[i]||0)>0));this.deadE[i]=Math.max(0,(this.deadE[i]||0)-dt);o.getTransform().localEulerAngles=new APJS.Vector3f(i>=alive?(1-(this.deadE[i]||0)/.28)*85:0,180,0);this.scale(o,1,1,1);this.pos(o,(i%(elite?3:4)-(elite?1:1.5))*1.35,0,this.enemyZ-Math.floor(i/(elite?3:4))*1.5);}
 for(let i=0;i<5;i++){const o=this.elites[i];o.setEnabledInHierarchy(visibleEnemy&&this.wave===2&&(i<alive||(this.deadE[i]||0)>0));o.getTransform().localEulerAngles=new APJS.Vector3f(i>=alive?(1-(this.deadE[i]||0)/.28)*85:0,180,0);this.scale(o,1.45,1.45,1.45);this.pos(o,(i%3-1)*1.5,0,this.enemyZ-Math.floor(i/3)*1.8);}
 for(let i=0;i<this.enemyFeet.length;i++)for(let k=0;k<2;k++)this.enemyFeet[i][k].getTransform().localEulerAngles=new APJS.Vector3f(this.state==='approach'||running?Math.sin(this.time*11+i+k*3.14)*25:0,0,0);
 this.bossRoot.setEnabledInHierarchy(visibleEnemy&&this.boss);this.pos(this.bossRoot,0,0,this.enemyZ);
 if(running)for(let i=0;i<this.stripes.length;i++){const t=this.stripes[i].getTransform().localPosition;this.pos(this.stripes[i],0,.05,t.z+dt*16>8?-90:t.z+dt*16);}
 if(this.active&&this.state==='battle'){

 this.battleTime+=dt;this.shotClock-=dt;this.damageClock+=dt;
 // Each registered hit removes exactly one unit. No continuous HP drain.
 if(this.shotClock<=0&&this.enemyHP>0){this.shotClock=.16;this.sound(this.shotAudio);
 const kills=this.boss?1:Math.min(this.enemyHP,Math.max(1,Math.floor(this.count/5)));
 for(let k=0;k<kills;k++){const n=this.enemyHP-1;this.deadE[n]=.28;this.enemyHP--;const xx=this.boss?0:this.wave===2?(n%3-1)*1.5:(n%4-1.5)*1.35;this.burst(xx,this.enemyZ);}
 for(let j=0;j<6;j++){const i=j;this.bulletAge[i]=.2;this.bulletSide[i]=0;this.pos(this.bullets[i],this.x+(j%5-2)*.5,1.1,-1);}
 console.log('[combat] one-hit kills='+kills+' remaining='+this.enemyHP);
 }
 if(!this.boss&&this.enemyHP>0&&this.damageClock>=.3&&this.waveHits<(this.wave===1?2:1)){this.damageClock-=.3;this.waveHits++;
 if(this.wave===2&&this.grenadeTime<=0){this.grenadeTime=.32;this.grenadeX=this.x;console.log('[combat] grenade launch');}
 else if(this.wave===1){this.loseUnits(1);for(let j=8;j<12;j++){this.bulletAge[j]=.25;this.bulletSide[j]=1;this.pos(this.bullets[j],this.x+(j-10)*.25,1,-9);}}
 }
 if(this.boss){this.laserClock+=dt;
 // Short opening barrage: one projectile, one casualty; random enemy salvo strength.
 if(this.laserClock>=.52&&this.enemyHP>0){const due=Math.min(this.bossRounds,Math.floor((this.laserClock-.52)/.025)+1);while(this.bossFired<due&&this.count>0){this.bossFired++;const i=8+this.bossFired%10;this.bulletAge[i]=.2;this.bulletSide[i]=1;this.pos(this.bullets[i],this.x+((this.bossFired%5)-2)*.4,1.1,-6);this.loseUnits(1);}}

 this.bossRoot.getTransform().localEulerAngles=new APJS.Vector3f(this.enemyHP<=0?this.enemyFire*240:this.laserClock<.48?-12:8,180,0);
 this.scale(this.bossCore,.04+Math.sin(this.time*25)*.009,.04,.025);
 if(this.laserClock<.48){this.beam.setEnabledInHierarchy(true);if(this.laserPhase===0){this.laserX=this.x;this.laserPhase=1;this.say('首领蓄力！左右躲开');}this.pos(this.beam,this.laserX,.08,-5);this.scale(this.beam,1.7/8,.06/8,12/8);}
 else if(this.laserClock<.8){this.beam.setEnabledInHierarchy(true);this.pos(this.beam,this.laserX,1,-5);this.scale(this.beam,.65/8,1.8/8,12/8);if(this.laserPhase===1){this.laserPhase=2;this.explode(this.laserX,0);this.say('首领齐射！准备反击');console.log('[combat] boss beam fired');}}
 else this.beam.setEnabledInHierarchy(false);
 }
 if(this.enemyHP<=0)this.enemyFire+=dt;
 if(this.count<=0)this.finish(false);else if(this.enemyHP<=0&&this.enemyFire>.32){this.sound(this.goodAudio);if(this.boss)this.finish(true);else{this.wave++;this.prepareWave();}}
 }
 if(this.grenadeTime>0){this.grenadeTime-=dt;const p=1-Math.max(0,this.grenadeTime)/.32;this.grenade.setEnabledInHierarchy(true);this.pos(this.grenade,this.grenadeX,1+Math.sin(p*Math.PI)*3,-10+p*10);if(this.grenadeTime<=0){this.explode(this.grenadeX,0);if(this.state==='battle')this.loseUnits(2);console.log('[combat] grenade impact');}}else this.grenade.setEnabledInHierarchy(false);
 this.blastLife=Math.max(0,this.blastLife-dt);this.blast.setEnabledInHierarchy(this.blastLife>0);if(this.blastLife>0){const q=1-this.blastLife/.32;this.scale(this.blast,(.4+q*3)/8,(.5*(1-q)+.05)/8,(.4+q*3)/8);}

 for(let i=0;i<18;i++){this.bulletAge[i]-=dt;this.bullets[i].setEnabledInHierarchy(this.bulletAge[i]>0&&this.state==='battle');if(this.bulletAge[i]>0){const p=this.bullets[i].getTransform().localPosition;this.pos(this.bullets[i],p.x,p.y,p.z+dt*(this.bulletSide[i]?45:-55));}}
 for(let i=0;i<20;i++){this.sparkAge[i]-=dt;this.sparks[i].setEnabledInHierarchy(this.sparkAge[i]>0);if(this.sparkAge[i]>0){const a=i*Math.PI/10,t=.45-this.sparkAge[i];this.pos(this.sparks[i],this.sparkX[i]+Math.cos(a)*t*3,1+Math.sin(a)*t*3-t*t*5,this.sparkZ[i]+Math.sin(a)*t*2);}}
 for(let i=0;i<24;i++){this.flashes[i].setEnabledInHierarchy(this.state==='battle'&&this.shotClock>.1&&i<this.count);}
 for(let i=0;i<24;i++)this.bodies[i].getTransform().localEulerAngles=new APJS.Vector3f(this.state==='battle'?Math.max(0,1-this.shotClock/.24)*-3:running?4:0,0,0);
 this.noticeLife-=dt;this.notice.setEnabledInHierarchy(this.noticeLife>0);
 this.text(this.hudText,'数值门突击  ·  第'+this.wave+'/3波\n小队 '+this.count+'人  '+(this.state==='battle'?['普通小队','精英守卫','最终首领'][this.wave-1]+(this.boss?' · 躲避后反击':' '+Math.ceil(this.enemyHP)+'人'):this.state==='win'?'挑战成功':this.state==='lose'?'挑战结束':'选择更有利的门'));
 }
 onDestroy():void{const e=APJS.EventManager.getGlobalEmitter();e.off(APJS.EventType.RecordStart,this.start,this);e.off(APJS.EventType.RecordEnd,this.stop,this);e.off(APJS.EventType.Touch,this.touch,this);}
}