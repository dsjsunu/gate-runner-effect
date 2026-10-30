@component()
export class FencingGame extends APJS.BasicScriptComponent {
 @serializeProperty player:APJS.SceneObject;
 @serializeProperty enemy:APJS.SceneObject;
 @serializeProperty avatar:APJS.SceneObject;
 @serializeProperty friendName:APJS.SceneObject;
 @serializeProperty hud:APJS.SceneObject;
 @serializeProperty dialogue:APJS.SceneObject;
 @serializeProperty referee:APJS.SceneObject;
 @serializeProperty lamps:APJS.SceneObject[]=[];
 @serializeProperty buttons:APJS.SceneObject[]=[];
 @serializeProperty sounds:APJS.SceneObject[]=[];
 @serializeProperty replies:APJS.SceneObject[]=[];
 @serializeProperty verificationEnemy:number=-1;
 @serializeProperty verificationState:number=0;
 private ready=false;private phase='idle';private stage=0;private pscore=0;private escore=0;
 private clock=3;private timer=0;private pa=0;private ea=0;private hit=false;private dead=false;
 private profiles:({profileTexture?:APJS.Texture,userName?:string}|null)[]=[null,null,null];
 private names=['冲刺','下蹲反击','格挡还击'];private npc=['试探型选手','反击型选手','冠军守门员'];
 private begin=()=>{if(!this.ready)return;this.stage=0;this.pscore=0;this.escore=0;this.next();this.say('第一位选手：准备好了吗？',-1);this.audio(this.sounds,2);console.log('[state] fencing record-start');};
 private end=()=>{this.phase='idle';this.lights(0,0);this.say('重剑三剑制 · 开拍挑战三位选手\n单灯得分 / 双灯各一分',-1);};
 private touch=(ev:APJS.IEvent)=>{if(!this.ready||this.phase!=='choose')return;const t=ev.args[0] as APJS.TouchData;if(t.phase!==APJS.TouchPhase.Began)return;for(let i=0;i<3;i++){const im=this.buttons[i].getComponent('Image') as APJS.Image;if(APJS.TouchUtils.isScreenPointOnImage(t.position,im)){this.choose(i);break;}}};
 onStart():void{const e=APJS.EventManager.getGlobalEmitter();e.on(APJS.EventType.RecordStart,this.begin,this);e.on(APJS.EventType.RecordEnd,this.end,this);e.on(APJS.EventType.Touch,this.touch,this);}
 private text(o:APJS.SceneObject,s:string):void{const t=o.getComponent('Text') as APJS.Text;if(t)t.text=s;}
 private audio(list:APJS.SceneObject[],i:number):void{if(i<0||!list[i])return;const a=list[i].getComponent('AudioComponent') as APJS.AudioComponent;if(a){a.play();console.log('[audio] '+list[i].name);}}
 private say(s:string,reply:number):void{this.text(this.dialogue,s);this.audio(this.replies,reply);}
 private lights(a:number,b:number):void{for(let i=0;i<this.lamps.length;i++){const im=this.lamps[i].getComponent('Image') as APJS.Image;im.opacity=(i===0?a:b)?1:.18;}}
 private applyAvatar():void{const p=this.profiles[this.stage];this.avatar.setEnabledInHierarchy(!!(p&&p.profileTexture));this.text(this.friendName,p&&p.userName?'@'+p.userName:this.npc[this.stage]);if(p&&p.profileTexture){const im=this.avatar.getComponent('Image') as APJS.Image;im.texture=p.profileTexture;console.log('[social] avatar and nickname bound stage='+this.stage);}}
 private probe():void{try{const C=(APJS as any).SocialService;const F=(APJS as any).FriendAvatars;console.log('[social] FriendAvatars class='+!!F);if(F&&F.prototype)console.log('[social] FriendAvatars members='+Object.getOwnPropertyNames(F.prototype).join(','));if(!C){console.log('[social] class unavailable');return;}const service=new C(this.getSceneObject().scene);if(typeof service.getFriendProfileAtIndex!=='function'){console.log('[social] getFriendProfileAtIndex unavailable in this host');return;}for(let i=0;i<3;i++){const ix=i;service.getFriendProfileAtIndex(i+1,(p:{profileTexture?:APJS.Texture,userName?:string}|null)=>{if(this.dead)return;this.profiles[ix]=p;console.log('[social] friend slot='+ix+' texture='+!!(p&&p.profileTexture));if(this.stage===ix)this.applyAvatar();},(err:string)=>console.log('[social] failed '+err));}}catch(e){console.log('[social] unavailable '+e);}}
 private next():void{this.phase='choose';this.clock=3-this.stage*.45;this.timer=0;this.lights(0,0);const im=this.enemy.getComponent('Image') as APJS.Image;im.opacity=1;this.applyAvatar();}
 private choose(a:number):void{this.pa=a;this.ea=this.verificationEnemy>=0?this.verificationEnemy:Math.floor(Math.random()*3);this.phase='clash';this.timer=0;this.hit=false;this.say(a<0?'对手：你迟疑了，我先抢攻！':'你：'+this.names[a]+'，接招！',-1);this.audio(this.sounds,2);console.log('[choice] player='+a+' enemy='+this.ea+' stage='+this.stage);}
 private resolve():void{this.hit=true;this.audio(this.sounds,0);
 if(this.pa===this.ea){this.lights(1,1);if(this.pscore===2&&this.escore===2){this.say('对手：决胜双灯不算！\n下一剑见真章！',3);console.log('[epee] deciding-double no score');}else{this.pscore++;this.escore++;this.say('对手：咱俩也太默契了！\n同时亮灯，各得一分！',2);console.log('[epee] double both score');}}
 else if(this.pa>=0&&(this.pa+2)%3===this.ea){this.pscore++;this.lights(1,0);this.say('对手：你速度这么快！\n我都没反应过来！',0);console.log('[epee] player-single');}
 else{this.escore++;this.lights(0,1);this.audio(this.sounds,4);this.say('对手：专项这么强？\n这次让我抓到破绽啦！',1);console.log('[epee] opponent-single');}
 console.log('[score] '+this.pscore+':'+this.escore);}
 private pose(o:APJS.SceneObject,a:number,x:number,dir:number,t:number):void{const st=o.getComponent('ScreenTransform') as APJS.ScreenTransform;const q=Math.max(0,Math.sin(Math.min(1,t/.8)*Math.PI));st.anchoredPosition=new APJS.Vector2f(x+dir*q*(a===0?100:35),20-(a===1?q*28:0));st.rotation=dir*q*(a===2?-15:8);st.scale=new APJS.Vector2f(1,a===1?1-q*.2:1);}
 onUpdate(dt:number):void{
 if(!this.ready){if(!this.player||!this.enemy||!this.avatar||!this.hud||!this.dialogue||!this.referee||this.buttons.length!==3||this.lamps.length!==2)return;this.ready=true;this.avatar.setEnabledInHierarchy(false);this.applyAvatar();this.probe();console.log('[state] fencing ready');}
 dt=Math.max(0,Math.min(dt,1));
 if(this.verificationState>0){const v=this.verificationState;this.verificationState=0;if(v===1){this.pscore=2;this.escore=0;this.next();}if(v===2){this.stage=2;this.pscore=2;this.escore=0;this.next();}if(v===3){this.pscore=2;this.escore=2;this.next();}if(v===4){this.pscore=0;this.escore=2;this.next();this.clock=.01;}}
 for(let i=0;i<3;i++){const im=this.buttons[i].getComponent('Image') as APJS.Image;im.opacity=this.phase==='choose'?1:.48;}
 const ps=this.player.getComponent('ScreenTransform') as APJS.ScreenTransform;const es=this.enemy.getComponent('ScreenTransform') as APJS.ScreenTransform;
 if(this.phase==='choose'){this.clock-=dt;this.pose(this.player,2,-190,1,0);this.pose(this.enemy,2,100,-1,0);if(this.clock<=0){console.log('[timeout] opponent attacks');this.choose(-1);}}
 else if(this.phase==='clash'){this.timer+=dt;this.pose(this.player,this.pa,-190,1,this.timer);this.pose(this.enemy,this.ea,100,-1,this.timer);if(this.timer>=.8&&!this.hit)this.resolve();if(this.timer>=4.2){this.timer=0;if(this.pscore>=3&&this.pscore>this.escore){this.phase='walk';this.say('对手：这局你赢了！下一位等你！',-1);console.log('[state] walk-right stage='+this.stage);}else if(this.escore>=3&&this.escore>this.pscore){this.phase='result';this.say('对手：这一场我先拿下啦！\n闯到第'+(this.stage+1)+'位 · 重新开拍挑战',-1);console.log('[result] defeat');}else{this.next();this.say('对手：下一剑，你会怎么选？',-1);}}}
 else if(this.phase==='walk'){this.timer+=dt;const q=Math.min(1,this.timer/1.5);ps.anchoredPosition=new APJS.Vector2f(-190+q*450,20+Math.sin(q*Math.PI*10)*8);es.anchoredPosition=new APJS.Vector2f(100-q*500,20);const im=this.enemy.getComponent('Image') as APJS.Image;im.opacity=1-q;if(q>=1){if(this.stage>=2){this.phase='result';this.say('三连胜！你是今天的重剑冠军！\n重新开拍再挑战',-1);console.log('[result] champion');}else{this.stage++;this.pscore=0;this.escore=0;this.next();this.say('第'+(this.stage+1)+'位：让我见识你的专项！',-1);console.log('[stage] '+this.stage);}}}
 if(this.phase==='idle'){this.pose(this.player,2,-190,1,0);this.pose(this.enemy,2,100,-1,0);}
 const av=this.avatar.getComponent('ScreenTransform') as APJS.ScreenTransform;av.anchoredPosition=new APJS.Vector2f(es.anchoredPosition.x,es.anchoredPosition.y+65);
 this.text(this.hud,'重剑挑战 · 第'+(this.stage+1)+' / 3位\n'+(this.stage===0?'● ○ ○':this.stage===1?'● ● ○':'● ● ●')+(this.phase==='choose'?'  反应 '+Math.max(0,this.clock).toFixed(1)+'秒':'')+'\n冲刺 > 格挡 > 下蹲 > 冲刺');
 this.text(this.referee,'重剑 · 三剑制\n'+this.pscore+' : '+this.escore);
 }
 onDestroy():void{this.dead=true;const e=APJS.EventManager.getGlobalEmitter();e.off(APJS.EventType.RecordStart,this.begin,this);e.off(APJS.EventType.RecordEnd,this.end,this);e.off(APJS.EventType.Touch,this.touch,this);}
}