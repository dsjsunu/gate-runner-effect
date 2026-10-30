@component()
export class MarbleGame extends APJS.BasicScriptComponent {
 @serializeProperty ball!: APJS.SceneObject;
 @serializeProperty pegTemplate!: APJS.SceneObject;
 @serializeProperty slotTemplate!: APJS.SceneObject;
 @serializeProperty wallTemplate!: APJS.SceneObject;
 @serializeProperty trailTemplate!: APJS.SceneObject;
 @serializeProperty board!: APJS.SceneObject;
 @serializeProperty hud!: APJS.SceneObject;
 @serializeProperty launch!: APJS.SceneObject;
 @serializeProperty powerPlate!: APJS.SceneObject;
 @serializeProperty fill!: APJS.SceneObject;
 @serializeProperty hintPlate!: APJS.SceneObject;
 @serializeProperty hint!: APJS.SceneObject;
 @serializeProperty card!: APJS.SceneObject;
 @serializeProperty cardText!: APJS.SceneObject;
 @serializeProperty scoreText!: APJS.SceneObject;
 @serializeProperty powerText!: APJS.SceneObject;
 @serializeProperty launchText!: APJS.SceneObject;
 @serializeProperty launchAudio!: APJS.SceneObject;
 @serializeProperty hitAudio!: APJS.SceneObject;
 @serializeProperty scoreAudio!: APJS.SceneObject;
 @serializeProperty revealAudio!: APJS.SceneObject;
 @serializeProperty spring!: APJS.SceneObject;
 @serializeProperty plungerGrip!: APJS.SceneObject;
 @serializeProperty verificationState:number=0;
 private ready=false;private active=false;private state='idle';private restoreFrames=0;
 private rb!:APJS.RigidBody2D;private collider!:APJS.CircleCollider2D;
 private ramp!:APJS.SceneObject;private rampVisual!:APJS.SceneObject;private pegX:number[]=[];private pegY:number[]=[];private pegR:number[]=[];private bumperStart=0;private bumperEnd=0;private pegs:APJS.SceneObject[]=[];private slots:APJS.SceneObject[]=[];private labels:APJS.SceneObject[]=[];private walls:APJS.SceneObject[]=[];
 private trails:APJS.SceneObject[]=[];private ages:number[]=[];private sparks:APJS.SceneObject[]=[];
 private sx:number[]=[];private sy:number[]=[];private svx:number[]=[];private svy:number[]=[];private life:number[]=[];
 private pegFlash:number[]=[];private slotFlash:number[]=[];private resultText!:APJS.SceneObject;
 private lit:boolean[]=[];private mult=2;private litCount=6;private round=0;private marbles=0;private coins=20;private energy=0;private cards=0;private awardCard=false;
 private cardNames=['流萤','石语','纸舟','波猫','星轨兔','霓虹水母','月面车','脉冲狐','彗星骑士','机械鲸','引力法师','极光龙','银河王冠','黑洞歌姬','星云巨兽','永恒弹珠'];
 private owned:number[]=[];private power=0;private held=0;private owner=-1;private dragMode=false;private startY=0;private canceled=false;private pull=0;
 private outcome!:APJS.SceneObject;private outcomeTitle!:APJS.SceneObject;private outcomeBody!:APJS.SceneObject;private outcomeFace!:APJS.SceneObject;private outcomeAge=0;private sessionNet=0;private sessionShots=0;private hitTwenty=false;
 private portalCooldown=0;private portalPending=-1;
 private timer=0;private flight=0;private elapsed=0;private cooldown=0;private trailClock=0;private ti=0;private pending=-1;private prevY=0;private stuck=0;private px=0;private py=0;private spinClock=0;
 private st(o:APJS.SceneObject):APJS.ScreenTransform{return o.getComponent('ScreenTransform') as APJS.ScreenTransform;}
 private im(o:APJS.SceneObject):APJS.Image{return o.getComponent('Image') as APJS.Image;}
 private txt(o:APJS.SceneObject,s:string):void{const t=o.getComponent('Text') as APJS.Text;if(t)t.text=s;}
 private order(o:APJS.SceneObject,n:number):void{const r=this.im(o)||o.getComponent('Text');if(r){(r as any).autoSortingOrder=false;(r as any).sortingOrder=n;}}
 private pos(o:APJS.SceneObject,x:number,y:number):void{this.st(o).anchoredPosition=new APJS.Vector2f(x,y);}
 private size(o:APJS.SceneObject,x:number,y:number):void{this.st(o).sizeDelta=new APJS.Vector2f(x,y);}
 private physicalPos(o:APJS.SceneObject,x:number,y:number):void{this.pos(o,x,y);const b=o.getComponent('RigidBody2D') as APJS.RigidBody2D;if(b)b.position=new APJS.Vector2f(x/32,y/32);}
 private sound(o:APJS.SceneObject):void{const a=o.getComponent('AudioComponent') as APJS.AudioComponent;if(a)a.play();}
 private slotX(i:number):number{return -236+i*40;}
 private start=()=>{this.active=true;this.marbles=0;this.coins=20;this.energy=0;this.sessionNet=0;this.sessionShots=0;this.hitTwenty=false;this.cards=0;this.round=0;this.owned=[];this.owner=-1;this.pending=-1;this.restoreFrames=3;APJS.Physics2D.timeSpeed=1;if(this.ready)this.needCoin();console.log('[original] record reset coins=20 marbles=0');};
 private stop=()=>{this.active=false;this.state='idle';this.owner=-1;if(this.rb){this.rb.static=true;this.rb.velocity=new APJS.Vector2f(0,0);}if(this.ready){this.restoreWorld();if(this.outcome)this.outcome.setEnabledInHierarchy(false);this.card.setEnabledInHierarchy(false);this.ball.setEnabledInHierarchy(true);this.launch.setEnabledInHierarchy(true);this.powerPlate.setEnabledInHierarchy(true);this.physicalPos(this.ball,245,-240);this.txt(this.hint,'开拍开始 · 下拉金属弹簧杆控力');this.txt(this.launchText,'开拍\n开始');this.power=0;}};
 private touch=(e:APJS.IEvent)=>{if(!this.ready||!this.active)return;const t=e.args[0] as APJS.TouchData;const x=t.position.x*720-360,y=640-t.position.y*1280;
 if(t.phase===APJS.TouchPhase.Began){
 if(this.state==='title'){if(this.outcomeAge>.8&&(APJS.TouchUtils.isScreenPointOnImage(t.position,this.im(this.outcome))||APJS.TouchUtils.isScreenPointOnImage(t.position,this.im(this.launch)))){this.sessionShots=0;this.sessionNet=0;this.hitTwenty=false;this.outcome.setEnabledInHierarchy(false);this.nextRound();console.log('[title] replay reset');}return;}
 if(this.state==='card'){if(APJS.TouchUtils.isScreenPointOnImage(t.position,this.im(this.card))){this.card.setEnabledInHierarchy(false);this.nextRound();}return;}
 if(this.state==='needCoin'){if((x>190&&x<325&&y>-125&&y<120)||APJS.TouchUtils.isScreenPointOnImage(t.position,this.im(this.launch))){if(this.coins<=0)this.coins=1;this.coins--;this.marbles+=20;this.nextRound();console.log('[original] coin +20 marbles='+this.marbles);}return;}
 if(this.state!=='ready')return;
 const isRod=!!this.plungerGrip&&x>=195&&x<=325&&y>=-125&&y<=120;
 const isButton=APJS.TouchUtils.isScreenPointOnImage(t.position,this.im(this.launch));
 if(!isRod&&!isButton)return;
 this.owner=t.touchId;this.dragMode=!!isRod;this.startY=t.position.y*1280;this.state='charge';this.held=0;this.power=0;this.canceled=false;console.log('[original] charge mode='+(isRod?'drag':'hold'));
 }else if(this.state==='charge'&&t.touchId===this.owner){
 if(t.phase===APJS.TouchPhase.Moved){if(this.dragMode){this.power=Math.max(0,Math.min(1,(t.position.y*1280-this.startY)/150));this.canceled=Math.abs(x-258)>130;}else this.canceled=Math.abs(x-205)>100||Math.abs(y+470)>85;}
 if(t.phase===APJS.TouchPhase.Canceled||t.phase===APJS.TouchPhase.Ended){if(this.dragMode&&t.phase===APJS.TouchPhase.Ended)this.power=Math.max(0,Math.min(1,(t.position.y*1280-this.startY)/150));console.log('[plunger] release drag='+this.dragMode+' power='+this.power.toFixed(2));this.owner=-1;if(t.phase===APJS.TouchPhase.Canceled||this.canceled||this.power<.035){this.state='ready';this.power=0;this.txt(this.hint,'力度太小或已取消 · 未消耗弹珠');console.log('[original] canceled no cost');}else this.fire();}}
 };
 private contact=(e:APJS.IEvent)=>{if(this.state!=='flight')return;const infos=e.args[0] as APJS.CollisionInfo2D[];for(const info of infos){if(!info.otherObject)continue;const name=info.otherObject.name;if(name==='左上斜跳板'){console.log('[route] ramp collision');this.sound(this.hitAudio);}if(name.indexOf('星钉_')===0){const i=parseInt(name.substring(3),10);this.pegFlash[i]=.22;if(i>=this.bumperStart&&i<this.bumperEnd){if(this.portalCooldown<=0&&this.portalPending<0){this.portalPending=i===this.bumperStart?this.bumperStart+1:this.bumperStart;this.portalCooldown=1;console.log('[portal] enter='+i+' exit='+this.portalPending);}}if(this.cooldown<=0){this.cooldown=.065;this.sound(this.hitAudio);console.log('[original] peg '+i);}}}};
 onStart():void{const e=APJS.EventManager.getGlobalEmitter();e.on(APJS.EventType.RecordStart,this.start,this);e.on(APJS.EventType.RecordEnd,this.stop,this);e.on(APJS.EventType.Touch,this.touch,this);}
 private init():void{
 this.rb=this.ball.getComponent('RigidBody2D') as APJS.RigidBody2D;this.collider=this.ball.getComponent('CircleCollider2D') as APJS.CircleCollider2D;this.collider.emitCollisionEvent=true;APJS.EventManager.getObjectEmitter(this.collider).on(APJS.CollisionEvent2D.Enter,this.contact,this);
 this.pos(this.board,0,0);this.size(this.board,840,820);this.order(this.board,0);
 this.pos(this.hud,0,490);this.size(this.hud,620,115);this.order(this.hud,30);
 this.pos(this.hintPlate,0,-365);this.size(this.hintPlate,610,60);this.order(this.hintPlate,30);
 this.pos(this.powerPlate,-115,-470);this.size(this.powerPlate,350,85);this.order(this.powerPlate,30);
 this.pos(this.launch,205,-470);this.size(this.launch,180,180);this.order(this.launch,30);this.order(this.fill,31);
 for(const o of [this.scoreText,this.powerText,this.launchText,this.hint])this.order(o,35);
 this.size(this.scoreText,565,105);(this.scoreText.getComponent('Text') as APJS.Text).fontSize=28;
 this.pos(this.card,0,0);this.size(this.card,620,790);this.order(this.card,80);this.size(this.cardText,360,80);this.pos(this.cardText,0,165);this.order(this.cardText,90);
 this.resultText=this.cardText.clone();this.resultText.parent=this.card;this.pos(this.resultText,0,-190);this.size(this.resultText,360,150);this.order(this.resultText,90);(this.resultText.getComponent('Text') as APJS.Text).fontSize=27;
 this.pegTemplate.setEnabledInHierarchy(false);this.slotTemplate.setEnabledInHierarchy(false);this.wallTemplate.setEnabledInHierarchy(false);this.trailTemplate.setEnabledInHierarchy(false);
 const bumpers=[[205,360,13],[390,475,13]];
 for(let row=0;row<5;row++){const odd=row%2===1;for(let col=0;col<(odd?6:5);col++){const x=(odd?100:140)+col*76,y=244+row*66;if(bumpers.some(b=>Math.sqrt((x-b[0])*(x-b[0])+(y-b[1])*(y-b[1]))<b[2]+13))continue;this.pegX.push(x-316);this.pegY.push(350-y);this.pegR.push(5.7);}}
 this.bumperStart=this.pegX.length;for(const b of bumpers){this.pegX.push(b[0]-316);this.pegY.push(350-b[1]);this.pegR.push(b[2]);}this.bumperEnd=this.pegX.length;


 for(let i=1;i<12;i++){this.pegX.push(-256+i*40);this.pegY.push(-246);this.pegR.push(3.6);}
 for(let i=0;i<this.pegX.length;i++){const o=this.pegTemplate.clone();o.name='星钉_'+i;this.size(o,this.pegR[i]*2/.78,this.pegR[i]*2/.78);const cc=o.getComponent('CircleCollider2D') as APJS.CircleCollider2D;cc.radius=this.pegR[i]/32;this.order(o,8);if(i>=this.bumperStart&&i<this.bumperEnd)this.im(o).color=i===this.bumperStart?new APJS.Color(.6,1,1,1):new APJS.Color(1,.55,.9,1);o.setEnabledInHierarchy(true);this.pegs.push(o);this.pegFlash.push(0);}
 this.size(this.ball,34,34);this.collider.radius=.31;
 for(let i=0;i<12;i++){const o=this.slotTemplate.clone();o.name='灯道_'+i;this.pos(o,this.slotX(i),-280);this.size(o,38,90);this.order(o,7);const collider=o.getComponent('BoxCollider2D') as APJS.BoxCollider2D;collider.size=new APJS.Vector2f(1.05,.4);collider.isTangible=false;
 for(const src of this.slotTemplate.getChildren()){const child=src.clone();child.parent=o;this.pos(child,0,-4);this.size(child,34,35);this.txt(child,''+(i+1));(child.getComponent('Text') as APJS.Text).fontSize=20;child.setEnabledInHierarchy(true);this.order(child,10);this.labels.push(child);}o.setEnabledInHierarchy(true);this.slots.push(o);this.slotFlash.push(0);this.lit.push(false);}
 const ws=[[-265,0,16,660],[225,0,16,660],[-20,330,500,14],[-20,-335,500,14]];
 for(let i=0;i<4;i++){const o=this.wallTemplate.clone();const c=o.getComponent('BoxCollider2D') as APJS.BoxCollider2D;c.size=new APJS.Vector2f(ws[i][2]/32,ws[i][3]/32);o.setEnabledInHierarchy(true);this.walls.push(o);}
 for(let i=0;i<12;i++){const o=this.trailTemplate.clone();this.order(o,15);o.setEnabledInHierarchy(false);this.trails.push(o);this.ages.push(0);}
 for(let i=0;i<16;i++){const o=this.trailTemplate.clone();this.order(o,40);o.setEnabledInHierarchy(false);this.sparks.push(o);this.sx.push(0);this.sy.push(0);this.svx.push(0);this.svy.push(0);this.life.push(0);}
 // Separate slim launch rail and top guide, behind moving steel ball.
 for(const a of [[235,-10,7,460],[-10,220,500,7]]){const o=this.powerPlate.clone();this.pos(o,a[0],a[1]);this.size(o,a[2],a[3]);this.order(o,3);o.setEnabledInHierarchy(true);}
 this.ramp=this.wallTemplate.clone();this.ramp.name='左上斜跳板';const rc=this.ramp.getComponent('BoxCollider2D') as APJS.BoxCollider2D;rc.size=new APJS.Vector2f(92/32,13/32);this.ramp.setEnabledInHierarchy(true);this.rampVisual=this.launch.clone();this.rampVisual.name='绿色斜跳板';this.size(this.rampVisual,105,23);this.st(this.rampVisual).rotation=35;this.im(this.rampVisual).color=new APJS.Color(.08,1,.22,1);this.order(this.rampVisual,11);this.rampVisual.setEnabledInHierarchy(true);this.order(this.ball,20);if(this.spring){this.order(this.spring,12);this.pos(this.spring,258,10);}if(this.plungerGrip){this.order(this.plungerGrip,22);this.pos(this.plungerGrip,258,-70);}
 this.outcome=this.hud.clone();this.outcome.name='落袋结局弹窗';this.pos(this.outcome,0,25);this.size(this.outcome,580,330);this.order(this.outcome,60);
 this.outcomeTitle=this.hint.clone();this.outcomeTitle.parent=this.outcome;this.pos(this.outcomeTitle,0,48);this.size(this.outcomeTitle,530,70);this.order(this.outcomeTitle,65);(this.outcomeTitle.getComponent('Text') as APJS.Text).fontSize=38;
 this.outcomeFace=this.hint.clone();this.outcomeFace.parent=this.outcome;this.pos(this.outcomeFace,0,112);this.size(this.outcomeFace,500,65);this.order(this.outcomeFace,65);(this.outcomeFace.getComponent('Text') as APJS.Text).fontSize=40;
 this.outcomeBody=this.hint.clone();this.outcomeBody.parent=this.outcome;this.pos(this.outcomeBody,0,-62);this.size(this.outcomeBody,530,145);this.order(this.outcomeBody,65);(this.outcomeBody.getComponent('Text') as APJS.Text).fontSize=26;this.outcome.setEnabledInHierarchy(false);
 const rule=this.hint.clone();rule.name='传送玩法说明';rule.parent=this.pegTemplate.parent;this.pos(rule,0,397);this.size(rule,560,50);this.txt(rule,'彩球碰到传送');(rule.getComponent('Text') as APJS.Text).fontSize=26;(rule.getComponent('Text') as APJS.Text).color=new APJS.Color(.65,1,1,1);this.order(rule,35);rule.setEnabledInHierarchy(true);
 this.ready=true;this.restoreWorld();this.rb.static=true;this.card.setEnabledInHierarchy(false);this.active?this.needCoin():this.stop();console.log('[original] initialized pegs='+this.pegs.length+' bumpers=2 lanes=12 centered');
 }
 private restoreWorld():void{if(this.ramp){this.physicalPos(this.ramp,-225,215);(this.ramp.getComponent('RigidBody2D') as APJS.RigidBody2D).rotation=35*Math.PI/180;this.pos(this.rampVisual,-225,215);}for(let i=0;i<this.pegs.length;i++)this.physicalPos(this.pegs[i],this.pegX[i],this.pegY[i]);const ws=[[-265,0],[225,0],[-20,330],[-20,-335]];for(let j=0;j<4;j++)this.physicalPos(this.walls[j],ws[j][0],ws[j][1]);}
 private needCoin():void{for(let i=0;i<12;i++)this.lit[i]=false;this.mult=0;this.litCount=0;if(this.outcome)this.outcome.setEnabledInHierarchy(false);this.state='needCoin';this.power=0;this.rb.static=true;this.rb.velocity=new APJS.Vector2f(0,0);this.physicalPos(this.ball,245,-240);this.card.setEnabledInHierarchy(false);this.ball.setEnabledInHierarchy(true);this.txt(this.launchText,'投币\n20珠');this.txt(this.hint,'1枚虚拟币换20珠 · 每次发射消耗5珠');}
 private nextRound():void{if(this.sessionShots>=5){this.finishSession();return;}if(this.marbles<5){this.needCoin();return;}this.outcome.setEnabledInHierarchy(false);this.round++;this.state='spin';this.timer=1.05;this.power=0;this.pending=-1;this.owner=-1;this.awardCard=false;this.rb.static=true;this.rb.velocity=new APJS.Vector2f(0,0);this.physicalPos(this.ball,245,-240);this.ball.setEnabledInHierarchy(true);this.card.setEnabledInHierarchy(false);this.restoreWorld();
 const weights=[30,27,20,13,8,2],ms=[2,4,6,8,10,20],counts=[6,4,3,2,1,1];let r=Math.random()*100,idx=0;for(;idx<5;idx++){r-=weights[idx];if(r<0)break;}this.mult=ms[idx];this.litCount=counts[idx];const ids:number[]=[];for(let i=0;i<12;i++){ids.push(i);this.lit[i]=false;}for(let i=11;i>0;i--){const j=Math.floor(Math.random()*(i+1));const t=ids[i];ids[i]=ids[j];ids[j]=t;}for(let i=0;i<this.litCount;i++)this.lit[ids[i]]=true;
 for(let i=0;i<this.trails.length;i++){this.ages[i]=0;this.trails[i].setEnabledInHierarchy(false);}this.txt(this.launchText,'锁定\n倍率');this.txt(this.hint,'本轮倍率与亮灯道正在锁定…');console.log('[original] round='+this.round+' multiplier='+this.mult+' lit='+ids.slice(0,this.litCount).map(n=>n+1).join(','));}
 private fire():void{if(this.state!=='charge'||this.marbles<5)return;this.marbles-=5;this.sessionShots++;this.state='rail';this.flight=0;this.stuck=0;this.pending=-1;this.portalPending=-1;this.portalCooldown=0;this.rb.static=true;this.sound(this.launchAudio);this.txt(this.launchText,'钢珠\n运行中');this.txt(this.hint,'只命中亮灯道返'+(5*this.mult)+'珠 · 暗道返1珠');console.log('[original] fire power='+this.power.toFixed(2)+' cost=5 marbles='+this.marbles);}
 private burst(x:number,y:number):void{for(let i=0;i<16;i++){const a=i*Math.PI/8;this.sx[i]=x;this.sy[i]=y;this.svx[i]=Math.cos(a)*(70+i%3*20);this.svy[i]=Math.sin(a)*90+65;this.life[i]=.65;this.pos(this.sparks[i],x,y);this.sparks[i].setEnabledInHierarchy(true);}}
 private finishSession():void{
 this.state='title';this.owner=-1;this.portalPending=-1;this.rb.static=true;this.rb.velocity=new APJS.Vector2f(0,0);this.card.setEnabledInHierarchy(false);this.outcomeAge=0;this.outcome.setEnabledInHierarchy(true);
 const n=this.sessionNet;let title='',line='',face='';
 if(this.hitTwenty){title='银河赌圣';line='这一球，值得全场起立。';face='＼(★▽★)／';}
 else if(n>=80){title='赌神接班人';line='这局，机台都得叫你一声哥。';face='(★▽★)';}
 else if(n>=35){title='陈刀仔体验卡';line='小本入场，带着战绩离开。';face='(≧▽≦)';}
 else if(n>=5){title='旺角小福星';line='今天这手气，有点东西。';face='(^▽^)';}
 else if(n>=-4){title='不输就是赢';line='江湖险恶，你全身而退。';face='(￣▽￣)';}
 else if(n>=-12){title='差一口气的阿星';line='手感到了，运气还在路上。';face='(>_<)';}
 else{title='散财童子';line='你负责投币，机台负责开心。';face='(￣▽￣;)';}
 this.txt(this.outcomeFace,face);this.txt(this.outcomeTitle,title);(this.outcomeTitle.getComponent('Text') as APJS.Text).color=new APJS.Color(1,.88,.46,1);
 this.txt(this.outcomeBody,'5次挑战完成 · '+(n>=0?'净赢 ':'净亏 ')+Math.abs(n)+' 珠\n'+line+'\n点击弹窗 · 再来一场');
 this.txt(this.hint,'本场称号已揭晓 · 留下你的银河战绩');this.txt(this.launchText,'再来\n一场');console.log('[title] '+title+' shots='+this.sessionShots+' net='+n+' twenty='+this.hitTwenty);
 }
 private showOutcome(i:number,hit:boolean,reward:number):void{
 if(hit&&this.mult===20)this.hitTwenty=true;let distance=12;for(let k=0;k<12;k++)if(this.lit[k])distance=Math.min(distance,Math.abs(k-i));
 const ms=[2,4,6,8,10,20],titles=['恭喜！双倍小确幸','恭喜！四倍好手气','恭喜！六倍稳稳拿下','恭喜！八倍大丰收','恭喜！十倍高光时刻','恭喜！二十倍银河大奖'];
 const faces=['(^▽^)','(≧▽≦)','(＾ワ＾)','ヽ(^o^)ノ','(★▽★)','＼(★▽★)／'];
 const idx=Math.max(0,ms.indexOf(this.mult)),net=reward-5;this.sessionNet+=net;this.outcomeAge=0;
 this.txt(this.outcomeTitle,hit?titles[idx]:distance<=1?'可惜，差一点！':'差远了，再瞄准点！');
 this.txt(this.outcomeFace,hit?faces[idx]:distance<=1?'(>_<)':'(￣▽￣;)');
 const signed=(n:number)=>n>0?'净赢 '+n+' 珠':n<0?'净亏 '+(-n)+' 珠':'不赚不亏';
 this.txt(this.outcomeBody,(hit?'亮道命中 ×'+this.mult+' · 返 '+reward+' 珠':'离最近亮道 '+distance+' 格 · 返 1 珠')+'\n本次'+signed(net)+'（消耗 5 珠）\n本场累计'+signed(this.sessionNet));
 (this.outcomeTitle.getComponent('Text') as APJS.Text).color=hit?new APJS.Color(1,.88,.46,1):new APJS.Color(.65,.88,1,1);
 this.outcome.setEnabledInHierarchy(true);console.log('[outcome] hit='+hit+' mult='+this.mult+' distance='+distance+' net='+net+' session='+this.sessionNet);
 }
 private land(i:number):void{if(this.state!=='flight')return;i=Math.max(0,Math.min(11,i));const hit=this.lit[i];const reward=hit?5*this.mult:1;this.marbles+=reward;this.energy=Math.min(100,this.energy+(hit?18+2*this.mult:6));this.awardCard=this.energy>=100||(hit&&this.mult===20);this.pending=-1;this.state='feedback';this.timer=3.1;this.showOutcome(i,hit,reward);this.rb.static=true;this.rb.velocity=new APJS.Vector2f(0,0);this.physicalPos(this.ball,this.slotX(i),-294);this.slotFlash[i]=1;if(hit){this.burst(this.slotX(i),-255);this.sound(this.scoreAudio);}this.txt(this.hint,hit?'亮道命中 ×'+this.mult+' · +'+reward+'珠':'落入暗道 · +1颗安慰珠');console.log('[original] land lane='+(i+1)+' hit='+hit+' multiplier='+this.mult+' reward='+reward+' marbles='+this.marbles+' energy='+this.energy);}
 private reveal():void{this.state='card';this.energy=0;this.cards++;this.ball.setEnabledInHierarchy(false);this.card.setEnabledInHierarchy(true);const r=Math.random()*100;const rarity=r<46?0:r<76?1:r<92?2:3;const id=rarity*4+Math.floor(Math.random()*4);const dup=this.owned.indexOf(id)>=0;if(dup){this.marbles+=[6,12,24,48][rarity];this.sessionNet+=[6,12,24,48][rarity];}else this.owned.push(id);this.txt(this.cardText,['N','R','SR','SSR'][rarity]+' · '+this.cardNames[id]);this.txt(this.resultText,(dup?'重复星卡 · +'+[6,12,24,48][rarity]+'珠':'NEW · 星卡入册')+'\n当前 '+this.marbles+'珠 · 本场'+(this.sessionNet>=0?'净赢':'净亏')+Math.abs(this.sessionNet)+'珠\n点击卡片继续');this.txt(this.hint,'能量满格或20倍命中 · 星卡吐出');this.sound(this.revealAudio);console.log('[original] card '+this.cardNames[id]+' duplicate='+dup);}
 onUpdate(dt:number):void{
 if(!this.ready){if(!this.ball||!this.pegTemplate||!this.slotTemplate||!this.card||!this.launchAudio||!this.wallTemplate||!this.trailTemplate)return;this.init();}
 dt=Math.max(0,Math.min(.1,dt));this.elapsed+=dt;this.cooldown=Math.max(0,this.cooldown-dt);this.portalCooldown=Math.max(0,this.portalCooldown-dt);
 if(this.portalPending>=0&&this.state==='flight'){const i=this.portalPending;this.portalPending=-1;const x=this.pegX[i],y=this.pegY[i]-40;const vx=this.rb.velocity.x;this.physicalPos(this.ball,x,y);this.rb.velocity=new APJS.Vector2f(Math.max(-3,Math.min(3,vx)),-3.5);this.prevY=y;this.px=x;this.py=y;this.stuck=0;this.burst(x,y);for(let k=0;k<this.trails.length;k++){this.ages[k]=0;this.trails[k].setEnabledInHierarchy(false);}this.txt(this.hint,'传送成功 · 双星互通');console.log('[portal] emerged x='+x+' y='+y);}
 if(this.restoreFrames>0){this.restoreWorld();this.physicalPos(this.ball,245,-240);this.restoreFrames--;}
 if(this.verificationState>0){const v=this.verificationState;this.verificationState=0;if(v===1)this.reveal();else if(v>=30&&v<=36){this.sessionShots=5;this.sessionNet=[-20,-8,0,15,45,90,95][v-30];this.hitTwenty=v===36;this.finishSession();}else if(v>=20&&v<=27){this.mult=[2,4,6,8,10,20][Math.min(5,v-20)];for(let k=0;k<12;k++)this.lit[k]=k===5;this.state='flight';this.land(v<26?5:v===26?6:10);}else if(v===4||v===5){if(this.state==='flight'){const i=this.bumperStart+(v-4);this.physicalPos(this.ball,this.pegX[i],this.pegY[i]+45);this.rb.velocity=new APJS.Vector2f(0,-4);this.prevY=this.pegY[i]+45;}}else if(v===2||v===3){if(this.state==='flight'){let i=0;while(i<11&&this.lit[i] !== (v===2))i++;this.physicalPos(this.ball,this.slotX(i),-260);this.rb.velocity=new APJS.Vector2f(0,-3);this.prevY=-260;}}else if(v>=10&&v<=15){this.mult=[2,4,6,8,10,20][v-10];this.litCount=[6,4,3,2,1,1][v-10];for(let i=0;i<12;i++)this.lit[i]=i<this.litCount;}console.log('[original] verify='+v);}
 if(this.state==='spin'){this.timer-=dt;this.spinClock+=dt;if(this.spinClock>.09){this.spinClock=0;this.txt(this.powerText,'倍率 ×'+[2,4,6,8,10,20][Math.floor(Math.random()*6)]+'\n随机锁定中');}if(this.timer<=0){this.state='ready';this.txt(this.launchText,'按住\n发射');this.txt(this.hint,'×'+this.mult+' · '+this.litCount+'/12道亮灯 · 大球互传 · 下拉右侧拉杆');}}
 if(this.state==='charge'){if(!this.dragMode){this.held+=dt;this.power=Math.min(1,this.held/1.3);}this.txt(this.hint,this.canceled?'松手取消 · 不消耗弹珠':'下拉力度 '+Math.round(this.power*100)+'% · 松手发射');}
 if(this.state==='rail'){this.flight+=dt;const drop=170-this.power*335;const vertical=430,arc=47.12,horizontal=215-drop;const distance=Math.min(vertical+arc+horizontal,this.flight*780);
 let x=245,y=-240;if(distance<vertical)y+=distance;else if(distance<vertical+arc){const angle=(distance-vertical)/30;x=215+30*Math.cos(angle);y=190+30*Math.sin(angle);}else{x=215-(distance-vertical-arc);y=220;}
 this.physicalPos(this.ball,x,y);
 if(distance>=vertical+arc+horizontal){this.state='flight';this.flight=0;this.prevY=220;this.rb.static=false;this.rb.velocity=new APJS.Vector2f(-2-this.power*7,-.6);this.rb.angularVelocity=0;console.log('[route] smooth release x='+x.toFixed(1)+' vx='+this.rb.velocity.x.toFixed(1));}}

 if(this.state==='flight'){this.flight+=dt;const p=this.st(this.ball).localPosition;const x=p.x*32,y=p.y*32;
 this.trailClock-=dt;if(this.trailClock<=0){this.trailClock=.035;const i=this.ti++%12;this.pos(this.trails[i],x,y);this.ages[i]=.32;this.trails[i].setEnabledInHierarchy(true);}
 // Commit only after crossing the pocket mouth downward, never on a side overlap.
 if(this.prevY> -268&&y<=-268&&this.rb.velocity.y<0)this.land(Math.round((x+236)/40));
 else if(y< -310)this.land(Math.round((x+236)/40));
 else {if(Math.abs(x-this.px)+Math.abs(y-this.py)<.2)this.stuck+=dt;else this.stuck=0;if(this.stuck>.7||this.flight>7){this.rb.velocity=new APJS.Vector2f((this.round%2?1:-1)*2,-7);this.stuck=0;this.flight=0;}this.px=x;this.py=y;}this.prevY=y;}
 if(this.state==='title'){this.outcomeAge+=dt;const t=Math.min(1,this.outcomeAge/.4),s=.8+.2*(1-Math.pow(1-t,3));this.st(this.outcome).scale=new APJS.Vector2f(s,s);}
 if(this.state==='feedback'){this.outcomeAge+=dt;const t=Math.min(1,this.outcomeAge/.36),s=1+Math.pow(1-t,3)*(.16*Math.sin(t*9)-.28);this.st(this.outcome).scale=new APJS.Vector2f(s,s);this.timer-=dt;if(this.timer<=0){if(this.awardCard)this.reveal();else this.nextRound();}}
 this.pull=this.state==='charge'?this.power:Math.max(0,this.pull-dt*7);if(this.spring){this.size(this.spring,64,150+this.pull*150);this.pos(this.spring,258,10-this.pull*75);}if(this.plungerGrip)this.pos(this.plungerGrip,258,-70-this.pull*150);
 for(let i=0;i<12;i++){if(this.ages[i]>0){this.ages[i]-=dt;this.im(this.trails[i]).opacity=Math.max(0,this.ages[i]/.32)*.55;if(this.ages[i]<=0)this.trails[i].setEnabledInHierarchy(false);}}
 for(let i=0;i<16;i++){if(this.life[i]<=0)continue;this.life[i]-=dt;this.svy[i]-=250*dt;this.sx[i]+=this.svx[i]*dt;this.sy[i]+=this.svy[i]*dt;this.pos(this.sparks[i],this.sx[i],this.sy[i]);this.im(this.sparks[i]).opacity=Math.max(0,this.life[i]/.65);if(this.life[i]<=0)this.sparks[i].setEnabledInHierarchy(false);}
 for(let i=0;i<this.pegs.length;i++){this.pegFlash[i]=Math.max(0,this.pegFlash[i]-dt);}
 for(let i=0;i<12;i++){this.slotFlash[i]=Math.max(0,this.slotFlash[i]-dt);this.im(this.slots[i]).color=this.slotFlash[i]>0?new APJS.Color(1,.75,.3,1):this.lit[i]?new APJS.Color(.6,1,1,1):new APJS.Color(.15,.22,.32,1);if(this.labels[i]){const t=this.labels[i].getComponent('Text') as APJS.Text;t.color=this.lit[i]?new APJS.Color(1,.94,.65,1):new APJS.Color(.42,.48,.56,1);}}
 this.txt(this.scoreText,'传送门弹珠 · '+this.marbles+'珠  / '+this.coins+'币\n第'+this.round+'轮  '+this.sessionShots+'/5发  ×'+this.mult+'  亮灯'+this.litCount+'/12  星卡'+this.cards);
 if(this.state!=='spin')this.txt(this.powerText,'力度 '+Math.round(this.power*100)+'% · ×'+this.mult+'\n出卡能量 '+this.energy+'/100');
 const fs=this.st(this.fill);fs.sizeDelta=new APJS.Vector2f(Math.max(4,260*this.energy/100),8);fs.anchoredPosition=new APJS.Vector2f(-130+130*this.energy/100,-32);
 this.st(this.launch).scale=new APJS.Vector2f(this.state==='charge'&&!this.dragMode?.94:1,this.state==='charge'&&!this.dragMode?.94:1);
 }
 onDestroy():void{const e=APJS.EventManager.getGlobalEmitter();e.off(APJS.EventType.RecordStart,this.start,this);e.off(APJS.EventType.RecordEnd,this.stop,this);e.off(APJS.EventType.Touch,this.touch,this);if(this.collider)APJS.EventManager.getObjectEmitter(this.collider).off(APJS.CollisionEvent2D.Enter,this.contact,this);}
}