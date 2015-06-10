$(document).ready(function(){
	
//document.body.onmousedown = function() {return false; } //so page is unselectable

	//Canvas stuff
	var canvas = $("#canvas")[0];
	var ctx = canvas.getContext("2d");
	var w = $("#canvas").width();
	var h = $("#canvas").height();
	var mx, my;
	var numObjects = 0;
	var numObjectsLoaded =0;
	
	
	var mapD = 10
	var mapW = Math.round((w * 2)/(100/mapD));
	var mapH = Math.round((h * 2)/(100/mapD));
	var mapX = w - mapW;
	var mapY = h - mapH;
	
	var terminalVel = 20
	
	var screen = 0;
	var cS = 0;
	var playerCharacter;
	var allies = []
	var ctxOx = 0;
	var ctxOy = 0;
	var dPx, dPy;
	
	var aniDelay = 1;
	var ani = 0;
	
	var pans =1

	var parax = 0//(creature[0].x - w/2)*0.1 + ctxOx*5
	var paray = 0//(creature[0].y - h/2)*0.1 + ctxOy*5
	
	var firing = 0;
	var recoil = false;
	var mDown = false;
	
	var cLevel = 0;
	var level = [];
	var levelName = "";
	var scene = 0
	
	var rLights = [];
	var dLights = [];
	var pulseLights = [];
	var lamps = [];
	var wall = [];
	var wallPanels = [];
	var creature = [];
	var items = [];
	var foreGround = [];
	var foreGroundDark = [];
	var elevators = [];
	var exits = [];
	
	var cutscene = [];
	
	
	//UI stuff
	var ridingElevator = false;
	var transit = false;
	
	
	//Prompt stuff
	var talking = false;
	var prompting = false;
	var promptMessage = [];
	var promptTitle = []
	var promptIndex = -1;
	var promptAni = 0;

	function makePrompt(t, m){
		promptIndex = 0;
		promptMessage.push(m);
		promptTitle.push(t);
		prompting = true;
		

	}
	
	
	function speak(m){
		if ('speechSynthesis' in window) {
		// Synthesis support. 
			var speaker = ""
			for(var i=0; i < m.length;i++){
				if(m[i] != '~'){
					speaker += m[i]
				
				}
			}
		
			msg.text = speaker
			speechSynthesis.speak(msg);
			
		}
	}
	
	//Test prompt
	
	var nPanel = 0
	var mapGrid = []
	for(var i =0; i < Math.floor(w*2/50); i++){
		mapGrid[i] = [];
		for(var j =0; j < Math.floor(w*2/50); j++){
			mapGrid[i][j] = new tile(i,j);
		}
	}
	
	function resetMapGrid(){
		for(var i= 0; i < mapGrid.length; i++){
			for(var j =0; j < mapGrid[i].length; j++){
				//mapGrid[i][j].panels = []
				mapGrid[i][j].wall = false;
			}
		}
	}
	
	
	var lightGrid = []
	var lightRes = 15
	for(var i =0; i < Math.floor(w + lightRes); i++){
		lightGrid[i] = [];
		for(var j =0; j < Math.floor(h + lightRes); j++){
			lightGrid[i][j] = 0;
		}
	}
	
	//Map editor stuff
	var snapSize = 10
	var selEdit = 1;
	var lastEdit = [];
	var PI = 0;
	var pX, pY;
	var header = "";
	var levelEdit = ""
	var lighting = false;
	
	
	function output(t){
		document.getElementById("output").value += t + "\n";
	}
	
	////////////////////////////////////
	//Sounds
	//////////////////////////////////
	var buttonSound1 = addSound('Sounds/metalButton.ogg', false);
	buttonSound1.setVolume(0.5);
	
	var backHum = addSound('Sounds/backHum.ogg',true);

	var doorSound = []
	for(var i=0; i < 5; i = i + 1)doorSound.push(addSound('Sounds/door.ogg', false));

	var pistolSound = []
	for(var i=0; i < 10; i = i + 1)pistolSound.push(addSound('Sounds/pistol1.ogg', false));
	var smgSound = []
	for(var i=0; i < 10; i = i + 1)smgSound.push(addSound('Sounds/smg1.ogg', false));
	var rifleSound = []
	for(var i=0; i < 10; i = i + 1){
		if(i%2 == 0) rifleSound.push(addSound('Sounds/rifle1.ogg', false));
		else rifleSound.push(addSound('Sounds/rifle2.ogg', false));
	}

	var alarmSound = []
	for(var i=0; i < 10; i = i + 1)alarmSound.push(addSound('Sounds/alarm1.ogg', true));

	
	var steamSound = []
	for(var i=0; i < 10; i = i + 1)steamSound.push(addSound('Sounds/steam1.ogg', false));

	var pulseLightSound = []
	for(var i=0; i < 15; i++)pulseLightSound.push(addSound('Sounds/pulseLight4.ogg', false));
	
	var florSound = []
	for(var i=0; i < 15; i++)florSound.push(addSound('Sounds/florLight.ogg', false));
	
	var spinSound = []
	for(var i=0; i < 15; i++)spinSound.push(addSound('Sounds/spinLight.ogg', false));
	
	
	
	var sparkSound = []
	for(var i=0; i < 10; i++)sparkSound.push(addSound('Sounds/sparks.ogg', false));
	
	var flickerSound = []
	for(var i=0; i < 15; i++)flickerSound.push(addSound('Sounds/flickerLight2.ogg', false));
	
	function stopSound(){
	for(var i=0; i < alarmSound.length; i++) alarmSound[i].stop();
	for(var i=0; i < doorSound.length; i++) doorSound[i].stop();
		for(var i=0; i < flickerSound.length; i++) flickerSound[i].stop();
		for(var i=0; i < steamSound.length; i++) steamSound[i].stop();
		for(var i=0; i < spinSound.length; i++) spinSound[i].stop();
		for(var i=0; i < florSound.length; i++) florSound[i].stop();
		for(var i=0; i < pulseLightSound.length; i++) pulseLightSound[i].stop();
		for(var i=0; i < sparkSound.length; i++) sparkSound[i].stop();
			//for(var i=0; i < Sound.length; i++) Sound[i].stop();
			
			
		
	}
	
	
	
	function getSound(arr){
		var result = -1;
		for(var i=0; i < arr.length; i++){
			if(!arr[i].claimed) return i;
		}
		return result;
	}
	
	
	var msg = new SpeechSynthesisUtterance();
	var voices = speechSynthesis.getVoices();
	msg.text = "Proceed."
	msg.lang = 'en-EN'
	
 //msg.voice = voices.filter(function(voice) { return voice.name == 'Google UK English Male'; })[0];
	//msg.voice = voices[6];
	// Note: some voices don't support altering params

	msg.volume = 0.1; // 0 to 1
	msg.rate = 1; // 0.1 to 10
	msg.pitch = 5; 

	msg.onend = function(){
		talking = false;
	}
	window.speechSynthesis.onvoiceschanged = function() {
    //window.speechSynthesis.getVoices();
    
	voices = window.speechSynthesis.getVoices();
	//voices[0].localService = true
	//voices[0].default = false
	
	msg.pitch = 8
	msg.rate = 0.5
	msg.volume = 0.1
	//msg.voice = voices.filter(function(voice) { return voice.name == 'Google UK English Female'; })[0];
	/*msg.voice.localService = true;
	msg.voice.default = true
	for(var i=0;i < voices.length; i++){
		console.log(i + " " + voices[i].default + " " + voices[i].localService);
	}
	console.log(voices[10])*/
	
	console.log(msg.volume)
};
	//1 - Male direct voice
	//2- decnt computer female voice
	
	
	
	//////////////////////////////////
	//Images
	/////////////////////////////////
	var fanBlades= makePicture("Animations/Objects/Features/fanBlades.png");//blac siloette
	var fanFrame= makePicture("Animations/Objects/Features/fanFrame.png");//unlit
	var fanBlades2= makePicture("Animations/Objects/Features/fanBlades2.png");//no grate
	var fanFrame2= makePicture("Animations/Objects/Features/fanFrame2.png");//w grate
	var fanFrame3= makePicture("Animations/Objects/Features/fanFrame3.png");//black w grate
	
	
	var lampLit= makePicture("Animations/Objects/LampLit.png");
	var lampOut= makePicture("Animations/Objects/LampOut.png");
	
	var biglampLit= makePicture("Animations/Objects/Features/bigLampLit.png");
	var biglampOut= makePicture("Animations/Objects/Features/bigLampOut.png");
	
	var spinLightPic= makePicture("Animations/Objects/spinLight.png");
	
	var largeItem = [];
	
	var pipes = []
	pipes.push(makePicture("Animations/Objects/Features/Pipe1.png"));
	pipes.push(makePicture("Animations/Objects/Features/Pipe2.png"));
	pipes.push(makePicture("Animations/Objects/Features/Pipe3.png"));
	pipes.push(makePicture("Animations/Objects/Features/Pipe4.png"));
	pipes.push(makePicture("Animations/Objects/Features/Pipe5.png"));
	
	
	var BloodSmear = [];
	BloodSmear.push(makePicture("Animations/Objects/Features/bs1.png"));
	BloodSmear.push(makePicture("Animations/Objects/Features/bs2.png"));
	BloodSmear.push(makePicture("Animations/Objects/Features/bs3.png"));
	
	var GreaseSmear = []
	GreaseSmear.push(makePicture("Animations/Objects/Features/gs1.png"));
	
	var crack = []
	crack.push(makePicture("Animations/Objects/Features/crack1.png"));
	crack.push(makePicture("Animations/Objects/Features/crack2.png"));
	crack.push(makePicture("Animations/Objects/Features/crack3.png"));
	
	var panelHall = [] 
	//panelHall.push(makePicture('Animations/Objects/WallPanel1.png'));
	//panelHall.push(makePicture('Animations/Objects/Features/panel4.png'));
	//panelHall.push(makePicture('Animations/Objects/Features/panel5.png'));
	panelHall.push(makePicture('Animations/Objects/Features/panelDense.png'));
	panelHall.push(makePicture('Animations/Objects/Features/panelOpen.png'));
	panelHall.push(makePicture('Animations/Objects/Features/panelHalf.png'));
	
	var panelHallClean = [] 
	//panelHallClean.push(makePicture('Animations/Objects/WallPanel1Clean.png'));
	//panelHallClean.push(makePicture('Animations/Objects/Features/panel2.png'));
	//panelHallClean.push(makePicture('Animations/Objects/Features/panel3.png'));
	
	var wallFeatures = [];
	wallFeatures.push(makePicture('Animations/Objects/Features/grate.png'));
	wallFeatures.push(makePicture('Animations/Objects/Features/grateLeft.png'));
	wallFeatures.push(makePicture('Animations/Objects/Features/grateRight.png'));
	wallFeatures.push(makePicture('Animations/Objects/Features/logo.png'));
	wallFeatures.push(makePicture('Animations/Objects/Features/sign1.png'));
	wallFeatures.push(makePicture('Animations/Objects/Features/sign2.png'));
	wallFeatures.push(makePicture('Animations/Objects/Features/sign3.png'));
	wallFeatures.push(makePicture('Animations/Objects/Features/Bloodsign1.png'));
	wallFeatures.push(makePicture('Animations/Objects/Features/Bloodsign2.png'));
	wallFeatures.push(makePicture('Animations/Objects/Features/wallTexture1.png'));
	wallFeatures.push(makePicture('Animations/Objects/Features/wallTexture2.png'));
	wallFeatures.push(makePicture('Animations/Objects/WallPanelPipe.png'));
	wallFeatures.push(makePicture('Animations/Objects/WallPanelPipeNoGrate.png'));
	wallFeatures.push(makePicture('Animations/Objects/Features/Bloodsign3.png'));
	wallFeatures.push(makePicture('Animations/Objects/Features/bed1.png'));
	wallFeatures.push(makePicture('Animations/Objects/Features/toilet.png'));
	wallFeatures.push(makePicture('Animations/Objects/Features/switch.png'));
	wallFeatures.push(makePicture('Animations/Objects/Features/tank1.png'));
	wallFeatures.push(makePicture('Animations/Objects/Features/tank2.png'));
	wallFeatures.push(makePicture('Animations/Objects/Features/tank3.png'));
	wallFeatures.push(makePicture('Animations/Objects/Features/tank4.png'));
	wallFeatures.push(makePicture('Animations/Objects/Features/tank5.png'));
	wallFeatures.push(makePicture('Animations/Objects/Features/terminal1.png'));
	wallFeatures.push(makePicture('Animations/Objects/Features/bed2.png'));
	wallFeatures.push(makePicture('Animations/Objects/Features/monitor2.png'));
	wallFeatures.push(makePicture('Animations/Objects/Features/computer1.png'));
	wallFeatures.push(makePicture('Animations/Objects/Features/computer2.png'));
	wallFeatures.push(makePicture('Animations/Objects/Features/computer3.png'));
	wallFeatures.push(makePicture('Animations/Objects/Features/vent1.png'));
	wallFeatures.push(makePicture('Animations/Objects/Features/trashCan.png'));
	wallFeatures.push(makePicture('Animations/Objects/Features/server.png'));//index 30
	wallFeatures.push(makePicture('Animations/Objects/Features/sneezeGuard.png'));
	wallFeatures.push(makePicture('Animations/Objects/Features/table.png'));
	
	
	
	var floor = [];
	floor.push(makePicture('Animations/Objects/floor1.png'));
	floor.push(makePicture('Animations/Objects/crateMed1.png'));
	floor.push(makePicture('Animations/Objects/crateSmall1.png'));
	floor.push(makePicture('Animations/Objects/floor2.png'));
	
	
	
	var doorFrame = makePicture('Animations/Objects/Features/hatch2.png')
	var doorHatch = makePicture('Animations/Objects/Features/hatch.png')
	var floorHole = [];
	floorHole.push(makePicture('Animations/Objects/Features/floor1Hole.png'));
	
	var crate = [];
	crate.push(makePicture('Animations/Objects/crateMed1.png'));
	
	var ceiling = []
	ceiling.push(makePicture('Animations/Objects/ceiling1.png'));
	
	var ceilingHole = [];
	ceilingHole.push(makePicture('Animations/Objects/Features/ceiling1Hole.png'));
	
	var vPipe = makePicture('Animations/Objects/VPipe.png')
	var hPipe = makePicture('Animations/Objects/HPipe.png')
	var TRPipe = makePicture('Animations/Objects/PipeTR.png')
	var TLPipe = makePicture('Animations/Objects/PipeTL.png')
	var BRPipe = makePicture('Animations/Objects/PipeBR.png')
	var BLPipe = makePicture('Animations/Objects/PipeBL.png')
		
	var foreGPic = [];
	foreGPic[0] = makePicture('Animations/Objects/Foreground/DeskLeft.png')
	foreGPic[1] = makePicture('Animations/Objects/Foreground/DeskRight.png')
	foreGPic[2] = makePicture('Animations/Objects/Foreground/MonitorOnRight.png')
	foreGPic[3] = makePicture('Animations/Objects/Foreground/MonitorOffRight.png')
	foreGPic[4] = makePicture('Animations/Objects/Foreground/MonitorOnLeft.png')
	foreGPic[5] = makePicture('Animations/Objects/Foreground/MonitorOffLeft.png')
	foreGPic.push(makePicture('Animations/Objects/sideWallDebris.png'));
	foreGPic.push(makePicture('Animations/Objects/sideWallDebris2.png'));
	foreGPic.push(makePicture('Animations/Objects/Foreground/Med1.png'));
	foreGPic.push(makePicture('Animations/Objects/Foreground/lamp.png'));
	foreGPic.push(makePicture('Animations/Objects/Foreground/DeskCenter.png'));
	
	var sideWall = []
	sideWall.push(makePicture('Animations/Objects/sideWall1.png'));
	sideWall.push(makePicture('Animations/Objects/sideWall2.png'));
	sideWall.push(makePicture('Animations/Objects/sideWall3.png'));
	sideWall.push(makePicture('Animations/Objects/sideWall4.png'));
	sideWall.push(makePicture('Animations/Objects/sideWall5.png'));
	sideWall.push(makePicture('Animations/Objects/sideWall6.png'));
	sideWall.push(makePicture('Animations/Objects/sideWall7.png'));
	var sideWallDebris = []
	//sideWallDebris.push(makePicture('Animations/Objects/sideWallDebris.png'));
	//sideWallDebris.push(makePicture('Animations/Objects/sideWallDebris2.png'));
	
	var door = []
	door.push(makePicture('Animations/Objects/Features/door.png'))
	door.push(makePicture('Animations/Objects/Features/door2.png'))
	/////////////////////////////
	////	WEAPON PICUTURES  & Data
	var rifleID = 2 
	var SMGID = 1
	var pistolID = 0
	
	var iconRifle = makePicture("Animations/Objects/Weapons/IconRifle.png");
	var iconSMG = makePicture("Animations/Objects/Weapons/IconSMG.png");
	var iconPistol = makePicture("Animations/Objects/Weapons/IconPistol.png");
	var blankPic = makePicture("Animations/Objects/Weapons/blank.png");
	var iconMed = makePicture("Animations/Objects/Items/medKit.png");
	var recorder = makePicture("Animations/Objects/Items/recorder.png");
	var iconArmor = makePicture("Animations/Objects/Items/armor.png");
	var HumanArmor = makePicture("Animations/People/HumanArmor.png");
	
	var riflePic = makePicture("Animations/Objects/Weapons/RIFLE.png");
	var rifleFlash = []
	rifleFlash.push(makePicture("Animations/Objects/Weapons/RIFLEFlash3.png"));
	rifleFlash.push(makePicture("Animations/Objects/Weapons/RIFLEFlash2.png"));
	rifleFlash.push(makePicture("Animations/Objects/Weapons/RIFLEFlash1.png"));
	
	var riflePicMarine = makePicture("Animations/Objects/Weapons/MarineRIFLE.png");
	var rifleFlashMarine = []
	rifleFlashMarine.push(makePicture("Animations/Objects/Weapons/MarineRIFLEFlash3.png"));
	rifleFlashMarine.push(makePicture("Animations/Objects/Weapons/MarineRIFLEFlash2.png"));
	rifleFlashMarine.push(makePicture("Animations/Objects/Weapons/MarineRIFLEFlash1.png"));
	
	var pistolPic = makePicture("Animations/Objects/Weapons/l0Pistol.png");
	var pistolFlash = [];
	pistolFlash.push(makePicture("Animations/Objects/Weapons/l0PistolFire2.png"));
	pistolFlash.push(makePicture("Animations/Objects/Weapons/l0PistolFire1.png"));
	
	var pistolPicMarine = makePicture("Animations/Objects/Weapons/MarinePistol.png");
	var pistolFlashMarine = [];
	pistolFlashMarine.push(makePicture("Animations/Objects/Weapons/MarinePistolFire2.png"));
	pistolFlashMarine.push(makePicture("Animations/Objects/Weapons/MarinePistolFire1.png"));
	
	
	var SMGPic = makePicture("Animations/Objects/Weapons/SMG.png");
	var SMGFlash = [];
	SMGFlash.push(makePicture("Animations/Objects/Weapons/SMGFlash2.png"));
	SMGFlash.push(makePicture("Animations/Objects/Weapons/SMGFlash1.png"));
	
	var SMGPicMarine = makePicture("Animations/Objects/Weapons/MarineSMG.png");
	var SMGFlashMarine = [];
	SMGFlashMarine.push(makePicture("Animations/Objects/Weapons/MarineSMGFlash2.png"));
	SMGFlashMarine.push(makePicture("Animations/Objects/Weapons/MarineSMGFlash1.png"));
	
	var iHealPic = [];
	iHealPic.push(makePicture("Animations/Objects/Weapons/iHealF6.png"))
	iHealPic.push(makePicture("Animations/Objects/Weapons/iHealF5.png"))
	iHealPic.push(makePicture("Animations/Objects/Weapons/iHealF4.png"))
	iHealPic.push(makePicture("Animations/Objects/Weapons/iHealF3.png"))
	iHealPic.push(makePicture("Animations/Objects/Weapons/iHealF2.png"))
	iHealPic.push(makePicture("Animations/Objects/Weapons/iHealF1.png"))
	var acidPic = []
	acidPic.push(makePicture("Animations/Objects/Weapons/acidSpray7.png"))
	acidPic.push(makePicture("Animations/Objects/Weapons/acidSpray6.png"))
	acidPic.push(makePicture("Animations/Objects/Weapons/acidSpray5.png"))
	acidPic.push(makePicture("Animations/Objects/Weapons/acidSpray4.png"))
	acidPic.push(makePicture("Animations/Objects/Weapons/acidSpray3.png"))
	acidPic.push(makePicture("Animations/Objects/Weapons/acidSpray2.png"))
	acidPic.push(makePicture("Animations/Objects/Weapons/acidSpray1.png"))
	var mHeadPics = []
	mHeadPics.push(makePicture("Animations/Objects/Weapons/MaggotHead.png"))
	mHeadPics.push(makePicture("Animations/Objects/Weapons/MaggotHead2.png"))
	mHeadPics.push(makePicture("Animations/Objects/Weapons/MaggotHead1.png"))
	var mPunchPics = []
	mPunchPics.push(makePicture("Animations/Objects/Weapons/Monster1Punch1.png"))
	mPunchPics.push(makePicture("Animations/Objects/Weapons/Monster1Punch2.png"))
	mPunchPics.push(makePicture("Animations/Objects/Weapons/Monster1Punch3.png"))
	var mPunchPics2 = []
	mPunchPics2.push(makePicture("Animations/Objects/Weapons/Monster2Punch1.png"))
	mPunchPics2.push(makePicture("Animations/Objects/Weapons/Monster2Punch2.png"))
	mPunchPics2.push(makePicture("Animations/Objects/Weapons/Monster2Punch3.png"))
	mPunchPics2.push(makePicture("Animations/Objects/Weapons/Monster2Punch4.png"))
	var punchPics = [];
	punchPics.push(makePicture("Animations/Objects/Weapons/l0Melee.png"))
	punchPics.push(makePicture("Animations/Objects/Weapons/l0Melee1.png"))
	punchPics.push(makePicture("Animations/Objects/Weapons/l0Melee2.png"))
	punchPics.push(makePicture("Animations/Objects/Weapons/l0Melee3.png"))
	var punchInsectPics = [];
	punchInsectPics.push(makePicture("Animations/Objects/Weapons/l4Melee.png"))
	punchInsectPics.push(makePicture("Animations/Objects/Weapons/l4Melee1.png"))
	punchInsectPics.push(makePicture("Animations/Objects/Weapons/l4Melee2.png"))
	punchInsectPics.push(makePicture("Animations/Objects/Weapons/l4Melee3.png"))
	
	
	
	//Character Images
	
	
	
	var ReptileWing = [];
	ReptileWing.push(makePicture('Animations/People/R3Wing.png'));
	
	var ReptileTorso = [];
	ReptileTorso.push(makePicture('Animations/People/R0Torso.png'));
	ReptileTorso.push(makePicture('Animations/People/R1Torso.png'));
	ReptileTorso.push(makePicture('Animations/People/R2Torso.png'));
	ReptileTorso.push(makePicture('Animations/People/R3Torso.png'));
	
	var ReptileLeg = [];
	ReptileLeg.push(makePicture('Animations/People/R0Legs.png'));
	ReptileLeg.push(makePicture('Animations/People/R1Legs.png'));
	ReptileLeg.push(makePicture('Animations/People/R1BLegs.png'));
	ReptileLeg.push(makePicture('Animations/People/R2Legs.png'));
	ReptileLeg.push(makePicture('Animations/People/R3Legs.png'));
	ReptileLeg.push(makePicture('Animations/People/R4Legs.png'));
		ReptileLeg.push(makePicture('Animations/People/R5Legs.png'));
	
	var ReptileHair =[] 
	ReptileHair.push(makePicture('Animations/People/I0Hair.png'));
	ReptileHair.push(makePicture('Animations/People/Hair2.png'));
	ReptileHair.push(makePicture('Animations/People/RHair.png'));
	ReptileHair.push(makePicture('Animations/People/RHair.png'));
	
	var InsectTorso = [];
	InsectTorso.push(makePicture('Animations/People/I0Torso.png'));
	InsectTorso.push(makePicture('Animations/People/I1Torso.png'));
	InsectTorso.push(makePicture('Animations/People/I2Torso.png'));
	InsectTorso.push(makePicture('Animations/People/I3Torso.png'));
	
	
	InsectTorso.push(makePicture('Animations/People/MaggotTorso.png'));
	InsectTorso.push(makePicture('Animations/People/Bug1Torso.png'));
	
	var InsectWing = [];
	InsectWing.push(makePicture('Animations/People/InsectWing.png'));
	
	
	
	var InsectLeg = [];
	InsectLeg.push(makePicture('Animations/People/I0Legs.png'));
	InsectLeg.push(makePicture('Animations/People/I1Legs.png'));
	InsectLeg.push(makePicture('Animations/People/I2Legs.png'));
	InsectLeg.push(makePicture('Animations/People/I3Legs.png'));
	InsectLeg.push(makePicture('Animations/People/I4Legs.png'));
	var hair = []
	/*hair.push(makePicture('Animations/People/I0Hair.png'));
	hair.push(makePicture('Animations/People/I1Hair.png'));
	hair.push(makePicture('Animations/People/I2Hair.png'));
	hair.push(makePicture('Animations/People/I3Hair.png'));
	*/
	hair.push(blankPic);
	hair.push(makePicture('Animations/People/Hair1.png'));
	hair.push(makePicture('Animations/People/Hair2.png'));
	hair.push(makePicture('Animations/People/Hair3.png'));
	hair.push(makePicture('Animations/People/Hair4.png'));
	hair.push(makePicture('Animations/People/Hair5.png'));
	hair.push(makePicture('Animations/People/Hair6.png'));
	hair.push(makePicture("Animations/People/MarineHelmet.png"));
	var leftArm = []
	leftArm.push(makePicture('Animations/People/I0LeftArm.png'));
	leftArm.push(makePicture('Animations/People/MarineLeftArm.png'));
	var InsectAb = []
	InsectAb.push(makePicture('Animations/People/IAbdomen.png'));
	InsectAb.push(makePicture('Animations/People/IAbdomen.png'));
	InsectAb.push(makePicture('Animations/People/IAbdomen2.png'));
	
	
	
	var HumanTorso = [];
	HumanTorso.push(makePicture("Animations/People/MarineTorso1.png"));
	HumanTorso.push(makePicture("Animations/People/MarineTorso2.png"));
	HumanTorso.push(makePicture("Animations/People/MarineTorso3.png"));
	HumanTorso.push(makePicture("Animations/People/MarineTorso4.png"));
	HumanTorso.push(makePicture("Animations/People/ScientistTorso1.png"));//Male
	HumanTorso.push(makePicture("Animations/People/ScientistTorso2.png"));//Female
	HumanTorso.push(makePicture("Animations/People/ScientistTorso3.png"));//Female
	
	var HumanLeg = [];
	HumanLeg.push(makePicture("Animations/People/MarineLegs1.png"));
	HumanLeg.push(makePicture("Animations/People/ScientistLegs1.png"));
	
	
	//Buttons
var lighter = new Button(60, 0, 50,50, "Lights");
	lighter.job = function() {lighting = !lighting;}
	
		var OKButton = new ButtonGraphic(w/2 - 100, h/2 + 150, 200, 100, "OK");
	OKButton.job = function(){
		buttonSound1.play();
		promptIndex++
		promptAni = 0;
		if(promptIndex >= promptMessage.length){
		//Reached the end of the messages
			promptIndex = -1
			promptMessage = []
			promptTitle = []
			prompting = false;
		}
	}
	
	//MAin menu
	var mainMenuLevel = new Level("Main Menu");
	mainMenuLevel.wallPanels.push(new Panel(400,100, panelHall[1], 0,0.5));
	mainMenuLevel.wallPanels.push(new Panel(300,100, panelHall[1], 0,0.5));
	mainMenuLevel.wallPanels.push(new Panel(200,100, panelHall[1], 0,0.5));
	mainMenuLevel.wallPanels.push(new Panel(100,100, panelHall[1], 0,0.5));
	mainMenuLevel.wallPanels.push(new Panel(500,100, panelHall[1], 0,0.5));
	mainMenuLevel.wallPanels.push(new Panel(600,100, panelHall[1], 0,0.5));
	mainMenuLevel.wallPanels.push(new Panel(700,100, panelHall[1], 0,0.5));
	mainMenuLevel.wallPanels.push(new Panel(800,100, panelHall[1], 0,0.5));
	mainMenuLevel.wallPanels.push(new Panel(400,0, panelHall[1], 1,0.5));
	mainMenuLevel.wallPanels.push(new Panel(300,0, panelHall[1], 1,0.5));
	mainMenuLevel.wallPanels.push(new Panel(200,0, panelHall[1], 1,0.5));
	mainMenuLevel.wallPanels.push(new Panel(100,0, panelHall[1], 1,0.5));
	mainMenuLevel.wallPanels.push(new Panel(500,0, panelHall[1], 1,0.5));
	mainMenuLevel.wallPanels.push(new Panel(600,0, panelHall[1], 1,0.5));
	mainMenuLevel.wallPanels.push(new Panel(700,0, panelHall[1], 1,0.5));
	mainMenuLevel.wallPanels.push(new Panel(800,0, panelHall[1], 1,0.5));
	mainMenuLevel.wallPanels.push(new wordWall(260,80, 'PROJECT',40));mainMenuLevel.wallPanels.push(new wordWall(270,180, '6TH DAY',40));
mainMenuLevel.lamps.push(new BigLamp(410,0));
mainMenuLevel.lamps.push(new BigLamp(510,0));
mainMenuLevel.lamps.push(new FlickerLamp(240,10));
mainMenuLevel.lamps.push(new FlickerLamp(750,10));
mainMenuLevel.wall.push(createWall(200,-10, 100,50,ceiling[0]));
mainMenuLevel.wall.push(createWall(300,-10, 100,50,ceiling[0]));mainMenuLevel.wall.push(createWall(600,-10, 100,50,ceiling[0]));
mainMenuLevel.wall.push(createWall(700,-10, 100,50,ceiling[0]));
mainMenuLevel.wall.push(createWall(400,-10, 100,30,floor[3]));
mainMenuLevel.wall.push(createWall(500,-10, 100,30,floor[3]));
mainMenuLevel.wall.push(createWall(800,-10, 100,30,floor[3]));
mainMenuLevel.wall.push(createWall(100,-10, 100,30,floor[3]));
mainMenuLevel.wall.push(createWall(70,0, 30,100,sideWall[2]));
mainMenuLevel.wall.push(createWall(70,100, 30,100,sideWall[2]));
mainMenuLevel.wall.push(createWall(900,100, 30,100,sideWall[2]));
mainMenuLevel.wall.push(createWall(900,0, 30,100,sideWall[2]));
mainMenuLevel.wall.push(createWall(70,-10, 30,100,sideWall[5]));
mainMenuLevel.wall.push(createWall(900,-10, 30,100,sideWall[5]));
mainMenuLevel.wallPanels.push(new Panel(300,200, panelHall[2], 0,0.5));
mainMenuLevel.wallPanels.push(new Panel(300,300, panelHall[2], 0,0.5));
mainMenuLevel.wallPanels.push(new Panel(300,400, panelHall[2], 0,0.5));
mainMenuLevel.wallPanels.push(new Panel(600,200, panelHall[2], 0,0.5));
mainMenuLevel.wallPanels.push(new Panel(600,300, panelHall[2], 0,0.5));
mainMenuLevel.wallPanels.push(new Panel(600,400, panelHall[2], 0,0.5));
mainMenuLevel.wallPanels.push(new Panel(600,500, panelHall[2], 0,0.5));
mainMenuLevel.wallPanels.push(new Panel(300,500, panelHall[2], 0,0.5));mainMenuLevel.wallPanels.push(new ForeGround(300,300, wallFeatures[12]));
mainMenuLevel.wallPanels.push(new ForeGround(600,300, wallFeatures[12]));
mainMenuLevel.wallPanels.push(new ForeGround(300,400, wallFeatures[12]));
mainMenuLevel.wallPanels.push(new ForeGround(600,400, wallFeatures[12]));
mainMenuLevel.wallPanels.push(new ForeGround(600,500, wallFeatures[12]));
mainMenuLevel.wallPanels.push(new ForeGround(300,500, wallFeatures[12]));mainMenuLevel.wall.push(createWall(200,200, 100,50,ceiling[0]));
mainMenuLevel.wall.push(createWall(700,200, 100,50,ceiling[0]));
mainMenuLevel.wall.push(createWall(100,200, 100,30,floor[3]));
mainMenuLevel.wall.push(createWall(800,200, 100,30,floor[3]));
mainMenuLevel.wall.push(createWall(70,190, 30,100,sideWall[5]));
mainMenuLevel.wall.push(createWall(900,190, 30,100,sideWall[5]));
mainMenuLevel.wallPanels.push(new ForeGround(100,0, wallFeatures[12]));
mainMenuLevel.wallPanels.push(new ForeGround(800,0, wallFeatures[12]));
mainMenuLevel.wallPanels.push(new ForeGround(800,100, wallFeatures[12]));
mainMenuLevel.wallPanels.push(new ForeGround(100,100, wallFeatures[12]));
mainMenuLevel.wallPanels.push(new ForeGround(100,200, pipes[3]));
mainMenuLevel.wallPanels.push(new ForeGround(300,200, pipes[1]));
mainMenuLevel.wallPanels.push(new ForeGround(800,200, pipes[2]));
mainMenuLevel.wallPanels.push(new ForeGround(600,200, pipes[0]));
mainMenuLevel.wallPanels.push(new ForeGround(700,200, pipes[4]));
mainMenuLevel.wallPanels.push(new ForeGround(200,200, pipes[4]));
mainMenuLevel.lamps.push(new pulseLight(150,0));
mainMenuLevel.lamps[4].addPLight(150, 50);
mainMenuLevel.lamps[4].addPLight(150, 100);
mainMenuLevel.lamps[4].addPLight(150, 150);
mainMenuLevel.lamps[4].addPLight(150, 200);
mainMenuLevel.lamps[4].addPLight(150, 250);
mainMenuLevel.lamps[4].addPLight(200, 250);
mainMenuLevel.lamps[4].addPLight(250, 250);
mainMenuLevel.lamps[4].addPLight(300, 250);
mainMenuLevel.lamps[4].addPLight(350, 250);
mainMenuLevel.lamps[4].addPLight(350, 300);
mainMenuLevel.lamps[4].addPLight(350, 350);
mainMenuLevel.lamps[4].addPLight(350, 400);
mainMenuLevel.lamps[4].addPLight(350, 450);
mainMenuLevel.lamps[4].addPLight(350, 500);
mainMenuLevel.lamps[4].addPLight(350, 500);
mainMenuLevel.lamps[4].addPLight(350, 550);
mainMenuLevel.lamps[4].addPLight(350, 600);

mainMenuLevel.lamps.push(new pulseLight(850,0));
mainMenuLevel.lamps[5].addPLight(850, 50);
mainMenuLevel.lamps[5].addPLight(850, 100);
mainMenuLevel.lamps[5].addPLight(850, 150);
mainMenuLevel.lamps[5].addPLight(850, 200);
mainMenuLevel.lamps[5].addPLight(850, 250);
mainMenuLevel.lamps[5].addPLight(800, 250);
mainMenuLevel.lamps[5].addPLight(750, 250);
mainMenuLevel.lamps[5].addPLight(700, 250);
mainMenuLevel.lamps[5].addPLight(650, 250);
mainMenuLevel.lamps[5].addPLight(650, 300);
mainMenuLevel.lamps[5].addPLight(650, 350);
mainMenuLevel.lamps[5].addPLight(650, 400);
mainMenuLevel.lamps[5].addPLight(650, 450);
mainMenuLevel.lamps[5].addPLight(650, 500);
mainMenuLevel.lamps[5].addPLight(650, 550);
mainMenuLevel.lamps[5].addPLight(650, 600);

mainMenuLevel.wallPanels.push(new Panel(200,500, panelHall[0], 0,0.5));
mainMenuLevel.wallPanels.push(new Panel(100,500, panelHall[0], 0,0.5));
mainMenuLevel.wallPanels.push(new Panel(700,500, panelHall[0], 0,0.5));
mainMenuLevel.wallPanels.push(new Panel(800,500, panelHall[0], 0,0.5));
mainMenuLevel.wallPanels.push(new Panel(100,400, panelHall[1], 0,0.5));
mainMenuLevel.wallPanels.push(new Panel(200,400, panelHall[1], 0,0.5));
mainMenuLevel.wallPanels.push(new Panel(700,400, panelHall[1], 0,0.5));
mainMenuLevel.wallPanels.push(new Panel(800,400, panelHall[1], 0,0.5));
mainMenuLevel.wallPanels.push(new ForeGround(100,400, wallFeatures[19]));
mainMenuLevel.wallPanels.push(new ForeGround(700,400, wallFeatures[20]));
mainMenuLevel.rLights.push(new staticLight(120,570, 20));
mainMenuLevel.rLights.push(new staticLight(180,570, 20));
mainMenuLevel.rLights.push(new staticLight(220,570, 20));
mainMenuLevel.rLights.push(new staticLight(280,570, 20));
mainMenuLevel.rLights.push(new staticLight(720,570, 20));
mainMenuLevel.rLights.push(new staticLight(780,570, 20));
mainMenuLevel.rLights.push(new staticLight(820,570, 20));
mainMenuLevel.rLights.push(new staticLight(880,570, 20));

mainMenuLevel.wallPanels.push(new ForeGround(100,300, pipes[0]));
mainMenuLevel.wallPanels.push(new ForeGround(800,300, pipes[1]));
mainMenuLevel.wallPanels.push(new ForeGround(700,300, pipes[4]));
mainMenuLevel.wallPanels.push(new ForeGround(200,300, pipes[4]));
mainMenuLevel.wallPanels.push(new ForeGround(20,300, wallFeatures[2]));
mainMenuLevel.wallPanels.push(new ForeGround(20,210, wallFeatures[2]));
mainMenuLevel.wallPanels.push(new ForeGround(880,300, wallFeatures[1]));
mainMenuLevel.wallPanels.push(new ForeGround(880,200, wallFeatures[1]));
mainMenuLevel.wallPanels.push(new wordWall(750,560, 'BY ADAM GUZY',5));

	
	function loadMainMenu(){
		levelName = mainMenuLevel.name
		elevators = mainMenuLevel.elevators
		exits = mainMenuLevel.exits
	
		wall = mainMenuLevel.wall;
		for(var i =0; i < elevators.length; i++) elevators[i].initialize();
		rLights = mainMenuLevel.rLights;
		pulseLights = mainMenuLevel.pulseLights
		dLights = mainMenuLevel.dLights;
		lamps = mainMenuLevel.lamps
		wallPanels = mainMenuLevel.wallPanels
		creature = mainMenuLevel.creature
		items = mainMenuLevel.items
		foreGround = mainMenuLevel.foreGround
	}
	
	
	
	var mainMenuButtons = [];
	mainMenuButtons.push(new ButtonGraphic(w/2-100,200, 200,100,"New Game"));
	mainMenuButtons.push(new ButtonGraphic(w/2-100,500, 200,100,"Map Editor"));
	mainMenuButtons.push(new ButtonGraphic(w/2-100,300, 200,100,"Load Game"));
	mainMenuButtons.push(new ButtonGraphic(w/2-100,400, 200,100,"Credits"));
	
	mainMenuButtons[0].job = function(){
		buttonSound1.play();
		backHum.play();
		screen = 4;
		cutscene[0].load();
		stopSound();
	}
	
	mainMenuButtons[1].job = function(){
		screen = 6;
		buttonSound1.play();
		var ind = -1;
		var levelList = ""
		for(var i=0; i < level.length; i++){
			if(level[i] != null){
				levelList+= i + "- " + level[i].name
			}else{
				levelList += i + "- Unused."
			}
			levelList+= " \r\n "
		}

		var choice = prompt("Level (L) or Cutscene (C)? or MainMenu? (M)", "C")
		
		if(choice == "L"){
		//level selected
			while(ind < 0)ind = Number(prompt(levelList + "\n Level Index?",""))
			if(ind >= level.length){
				var temp = prompt("Level Name?", "Title");
				//level.push(new Level(temp));
				//loadLevel(level.length-1);
				//output("level.push(new Level('" + temp + "'))")
				level[ind] = new Level(temp)
				loadLevel(ind);
				output("level[" + ind + "] = new Level('" + temp + "')")
			}else{
				loadLevel(ind);
				cLevel = ind;
			}
			header = "level[" + ind + "]."
			levelEdit = true;
			//output(header)
		}else if(choice == 'M'){
			header = "mainMenuLevel."
			levelEdit = true;
			loadMainMenu()
			
		}else{
		//cutscene selected
			while(ind < 0) ind = Number(prompt("Cutscene Index?","" + cutscene.length))
			if(ind >= cutscene.length){
				var temp = prompt("New Cutscene", "Title")
				cutscene.push(new Cutscene(temp));
				cutscene[cutscene.length-1].load();
				scene = cutscene.length-1
				output("cutscene.push(new Cutscene('" + temp + "'))");
			}else{
				cutscene[ind].load();
				scene = ind;
			}
			levelEdit = false;
			header = "cutscene[" + ind + "].lev."
		}
	}
	
	mainMenuButtons[2].job = function(){
		buttonSound1.play();
		makePrompt("Not done yet", "Sorry this feature is still super TBA. ~~Try again in 6 - 8 months.")
		};
	
	mainMenuButtons[3].job = function(){
		buttonSound1.play();
		makePrompt("CREDITS","Game Design & Development~     Adam 'The Programmer' Guzy ~~Sound Effects & Music~     James Paugh ~~Level Design~     Adam Guzy~     Connor Smiley~     Jaeden MacIsaac ~~~Special Thanks to all my dedicated and free testers!  You know who you are!");
		};
	
	
	
	//Editor options (based on images)
	
	//config button
	var config = new Button(0, 0, 50,50, "CONFIG");
	var leftSlide = new Button(0, h - 125, 24,10, "<<");
	leftSlide.job = function(){
		if(selEdit == 1){
			for(var i=0; i < bgOptions.length; i++)	bgOptions[i].b.x -= 50
		}else if (selEdit == 2){
			for(var i=0; i < wOptions.length; i++)	wOptions[i].b.x -= 50
		}else if (selEdit == 3){
			for(var i=0; i < lOptions.length; i++)	iOptions[i].b.x -= 50
		}else if (selEdit == 4){
			for(var i=0; i < iOptions.length; i++)	iOptions[i].b.x -= 50
		}else if (selEdit == 5){
			for(var i=0; i < fOptions.length; i++)	fOptions[i].b.x -= 50
		}else if (selEdit == 6){
			for(var i=0; i < cOptions.length; i++)	cOptions[i].b.x -= 50
		}else if (selEdit == 7){
			for(var i=0; i < sOptions.length; i++)	sOptions[i].b.x -= 50
		}
	}
	var rightSlide = new Button(25, h - 125, 24,10, ">>");
	rightSlide.job = function(){
		if(selEdit == 1){
			for(var i=0; i < bgOptions.length; i++)	bgOptions[i].b.x += 50
		}else if (selEdit == 2){
			for(var i=0; i < wOptions.length; i++)	wOptions[i].b.x += 50
		}else if (selEdit == 3){
			for(var i=0; i < lOptions.length; i++)	iOptions[i].b.x += 50
		}else if (selEdit == 4){
			for(var i=0; i < iOptions.length; i++)	iOptions[i].b.x += 50
		}else if (selEdit == 5){
			for(var i=0; i < fOptions.length; i++)	fOptions[i].b.x += 50
		}else if (selEdit == 6){
			for(var i=0; i < cOptions.length; i++)	cOptions[i].b.x += 50
		}else if (selEdit == 7){
			for(var i=0; i < sOptions.length; i++)	sOptions[i].b.x += 50
		}
	}
	var fOptions = []
	var pOptions = [];
	var bgOptions = [];
	var cOptions = [];
	//Background wall panels
	for(var i=0; i < panelHall.length; i++) {
		bgOptions.push(new editOption(100 + i * 60, h - 100, panelHall[i]));
		bgOptions[bgOptions.length-1].imageText = "panelHall[" + i + "]"
		bgOptions[bgOptions.length-1].insert = function(){
			this.text = "wallPanels.push(new Panel(" + Math.floor((mx-ctxOx) / snapSize)*snapSize + "," + Math.floor((my-ctxOy) / snapSize)*snapSize + ", " + this.imageText + ", " + this.spec + "," + this.spec2 + "));"
			wallPanels.push(new Panel( Math.floor((mx-ctxOx) / snapSize)*snapSize, Math.floor((my- ctxOy) / snapSize)*snapSize,this.pic, this.spec, this.spec2))
		
			lastEdit.push(4)
		}
		bgOptions[bgOptions.length-1].spec = 0 //top1, bottom2
		bgOptions[bgOptions.length-1].spec2 = 0.5; //Cleanliness
		bgOptions[bgOptions.length-1].config = function(){
			this.spec = prompt("Top (T) Bottom (B) else regular (any key)", "");
			if(this.spec == "T") this.spec = 1
			else if(this.spec == "B") this.spec = 2
			else this.spec = 0
			this.spec2 = Number(prompt("How clean and dank?  0 - very dank, 1 - very clean, 0.5 - No effect", ""));
		}
	
	}
	
		bgOptions.push(new editOption(100 + i * 60, h - 100, null));
		bgOptions[bgOptions.length-1].imageText = "ceiling[0]"
		bgOptions[bgOptions.length-1].name = "Elevator"
		bgOptions[bgOptions.length-1].insert = function(){
			this.text = "elevators.push(new elevator(" + Math.floor((mx-ctxOx) / snapSize)*snapSize + "," + Math.floor((my-ctxOy) / snapSize)*snapSize + ", " + this.spec + "," + this.spec2 + "));" + header+"wall.push(createWall(" + Math.floor((mx-ctxOx) / snapSize)*snapSize + "," + Math.floor((my-ctxOy) / snapSize)*snapSize + ", 100,30," + this.imageText + "));"
			elevators.push(new elevator( Math.floor((mx-ctxOx) / snapSize)*snapSize, Math.floor((my- ctxOy) / snapSize)*snapSize, this.spec, this.spec2))
			//wall.push(createWall( Math.floor((mx-ctxOx) / snapSize)*snapSize, Math.floor((my- ctxOy) / snapSize)*snapSize,100,30,ceiling[0]))
			elevators[elevators.length-1].initialize();
			lastEdit.push(9)
		}
		bgOptions[bgOptions.length-1].spec = 0 //position
		bgOptions[bgOptions.length-1].spec2 = 100; //max height
		bgOptions[bgOptions.length-1].config = function(){
			this.spec = Number (prompt("initial position? 0= bottom units in pixels", ""));
			this.spec2 = Number(prompt("max height? 100 , 200, etc", ""));
		}
	
	bgOptions.push(new editOption(100 + i * 60, h - 100, null));
		bgOptions[bgOptions.length-1].imageText = "ceiling[0]"
		bgOptions[bgOptions.length-1].name = "W Elev"
		bgOptions[bgOptions.length-1].insert = function(){
			this.text = "elevators.push(new CargoElevator(" + Math.floor((mx-ctxOx) / snapSize)*snapSize + "," + Math.floor((my-ctxOy) / snapSize)*snapSize + ", " + this.spec + "," + this.spec2 + "));"
			elevators.push(new CargoElevator( Math.floor((mx-ctxOx) / snapSize)*snapSize, Math.floor((my- ctxOy) / snapSize)*snapSize, this.spec, this.spec2))
			elevators[elevators.length-1].initialize();
			lastEdit.push(9)
		}
		bgOptions[bgOptions.length-1].spec = 0 //position
		bgOptions[bgOptions.length-1].spec2 = 100; //max height
		bgOptions[bgOptions.length-1].config = function(){
			this.spec = Number (prompt("Initial position? 0= bottom units in pixels", ""));
			this.spec2 = Number(prompt("Max height? 100 , 200, etc", ""));
		}
	
		
	bgOptions.push(new editOption(100 + i * 60, h - 100, null));
	bgOptions[bgOptions.length-1].imageText = ""
	bgOptions[bgOptions.length-1].name = "AniDoor"
	bgOptions[bgOptions.length-1].insert = function(){
		this.text = "wallPanels.push(new AniDoor(" + Math.floor((mx-ctxOx) / snapSize)*snapSize + "," + Math.floor((my-ctxOy) / snapSize)*snapSize + ", " + this.spec + "," + this.spec2 + "));"
		wallPanels.push(new AniDoor( Math.floor((mx-ctxOx) / snapSize)*snapSize, Math.floor((my- ctxOy) / snapSize)*snapSize, this.spec, this.spec2))
		
		lastEdit.push(4)
	}
	bgOptions[bgOptions.length-1].spec = 1 //position
	bgOptions[bgOptions.length-1].spec2 = 0; //max height
	bgOptions[bgOptions.length-1].config = function(){
		this.spec = Number (prompt("User interactive?  0- Opens for player    1- Just stutters on random", "1"));
		this.spec2 = Number(prompt("Lit behind? 0- Nope   1- Yes Please", "0"));
	}
	
	
	bgOptions.push(new editOption(100 + i * 60, h - 100, null));
	bgOptions[bgOptions.length-1].imageText = ""
	bgOptions[bgOptions.length-1].name = "Fan"
	bgOptions[bgOptions.length-1].insert = function(){
		this.text = "wallPanels.push(new fan(" + Math.floor((mx-ctxOx) / snapSize)*snapSize + "," + Math.floor((my-ctxOy) / snapSize)*snapSize + ", " + this.spec + "," + this.spec2 + "," + this.spec3 + "));"
		wallPanels.push(new fan( Math.floor((mx-ctxOx) / snapSize)*snapSize, Math.floor((my- ctxOy) / snapSize)*snapSize, this.spec, this.spec2, this.spec3))
		
		lastEdit.push(4)
	}
	bgOptions[bgOptions.length-1].spec = 0.2 //position
	bgOptions[bgOptions.length-1].spec2 = 0; //max height
	bgOptions[bgOptions.length-1].spec3 = 1; //yes grate!
	bgOptions[bgOptions.length-1].config = function(){
		this.spec = Number (prompt("Speed?   0.1 = slow 0.8 fast", "0.1"));
		this.spec2 = Number(prompt("Lit behind? 0- Nope   1- Yes Please", "0"));
		this.spec3 = Number(prompt("Grate or no grate? YESY = 1, NO = 0", "1"))
	}
	
		bgOptions.push(new editOption(100 + i * 60, h - 100, null));
	bgOptions[bgOptions.length-1].imageText = ""
	bgOptions[bgOptions.length-1].name = "Monitor"
	bgOptions[bgOptions.length-1].insert = function(){
		this.text = "wallPanels.push(new Monitor(" + Math.floor((mx-ctxOx) / snapSize)*snapSize + "," + Math.floor((my-ctxOy) / snapSize)*snapSize + ", '" + this.spec + "'," + this.spec2 + "));"
		wallPanels.push(new Monitor( Math.floor((mx-ctxOx) / snapSize)*snapSize, Math.floor((my- ctxOy) / snapSize)*snapSize, this.spec, this.spec2))
		
		lastEdit.push(4)
	}
	bgOptions[bgOptions.length-1].spec = "ALERT" //position
	bgOptions[bgOptions.length-1].spec2 = 0; //max height
	bgOptions[bgOptions.length-1].config = function(){
		this.spec = prompt("Message?  Keep it short, these monitors are small", "ALERT");
		//this.spec2 = Number(prompt("Lit behind? 0- Nope   1- Yes Please", "0"));
	}
	
	
		bgOptions.push(new editOption(100 + i * 60, h - 100, null));
	bgOptions[bgOptions.length-1].imageText = ""
	bgOptions[bgOptions.length-1].name = "Server"
	bgOptions[bgOptions.length-1].insert = function(){
		this.text = "wallPanels.push(new Server(" + Math.floor((mx-ctxOx) / snapSize)*snapSize + "," + Math.floor((my-ctxOy) / snapSize)*snapSize + ", '" + this.spec + "'," + this.spec2 + "));"
		wallPanels.push(new Server( Math.floor((mx-ctxOx) / snapSize)*snapSize, Math.floor((my- ctxOy) / snapSize)*snapSize, this.spec, this.spec2))
		
		lastEdit.push(4)
	}
	bgOptions[bgOptions.length-1].spec = 1 //1- on 0 off
	bgOptions[bgOptions.length-1].spec2 = 0; //max height
	bgOptions[bgOptions.length-1].config = function(){
		this.spec = prompt("0- OFF		1- ON", "ALERT");
		//this.spec2 = Number(prompt("Lit behind? 0- Nope   1- Yes Please", "0"));
	}
	
	
	
	for(var i=0; i < wallFeatures.length; i++) {
		fOptions.push(new editOption(100 + i * 60, h - 100, wallFeatures[i]));
		fOptions[fOptions.length-1].imageText = "wallFeatures[" + i + "]"
		fOptions[fOptions.length-1].insert = function(){
			if(this.spec == 1){
				this.text = "foreGround.push(new ForeGround(" + Math.floor((mx-ctxOx) / snapSize)*snapSize + "," + Math.floor((my-ctxOy) / snapSize)*snapSize + ", " + this.imageText + "));"
				foreGround.push(new ForeGround( Math.floor((mx-ctxOx) / snapSize)*snapSize, Math.floor((my- ctxOy) / snapSize)*snapSize,this.pic))
				lastEdit.push(7)
			}else{
				this.text = "wallPanels.push(new ForeGround(" + Math.floor((mx-ctxOx) / snapSize)*snapSize + "," + Math.floor((my-ctxOy) / snapSize)*snapSize + ", " + this.imageText + "));"
				wallPanels.push(new ForeGround( Math.floor((mx-ctxOx) / snapSize)*snapSize, Math.floor((my- ctxOy) / snapSize)*snapSize,this.pic))
				lastEdit.push(4)
			}
		}
		fOptions[fOptions.length-1].spec = 0
		fOptions[fOptions.length-1].config = function(){
			this.spec = prompt("Foreground (F) Background (B)  Background is default", "");
			if(this.spec == "F") this.spec = 1
			else this.spec = 0
		}
	}
	
	for(var i=0; i < pipes.length; i++) {
		fOptions.push(new editOption(100 + i * 60, h - 100, pipes[i]));
		fOptions[fOptions.length-1].imageText = "pipes[" + i + "]"
		fOptions[fOptions.length-1].insert = function(){
			if(this.spec == 0){
				this.text = "wallPanels.push(new ForeGround(" + Math.floor((mx-ctxOx) / snapSize)*snapSize + "," + Math.floor((my-ctxOy) / snapSize)*snapSize + ", " + this.imageText + "));"
				wallPanels.push(new ForeGround( Math.floor((mx-ctxOx) / snapSize)*snapSize, Math.floor((my- ctxOy) / snapSize)*snapSize,this.pic))
				lastEdit.push(4)
			}else{
				this.text = "foreGround.push(new ForeGround(" + Math.floor((mx-ctxOx) / snapSize)*snapSize + "," + Math.floor((my-ctxOy) / snapSize)*snapSize + ", " + this.imageText + "));"
				foreGround.push(new ForeGround( Math.floor((mx-ctxOx) / snapSize)*snapSize, Math.floor((my- ctxOy) / snapSize)*snapSize,this.pic))
				lastEdit.push(7)
			}
		}
		fOptions[fOptions.length-1].spec = 0
		fOptions[fOptions.length-1].config = function(){
			this.spec = prompt("Foreground (F) Background (B)  Background is default", "");
			if(this.spec == "F") this.spec = 1
			else this.spec = 0
		}
	}
	
	
	for(var i=0; i < panelHallClean.length; i++) {
		bgOptions.push(new editOption(100 + i * 60, h - 100, panelHallClean[i]));
		bgOptions[bgOptions.length-1].imageText = "panelHallClean[" + i + "]"
		bgOptions[bgOptions.length-1].insert = function(){
			this.text = "wallPanels.push(new Panel(" + Math.floor((mx-ctxOx) / snapSize)*snapSize + "," + Math.floor((my-ctxOy) / snapSize)*snapSize + ", " + this.imageText + ", " + this.spec + "," + this.spec2 + "));"
			wallPanels.push(new Panel( Math.floor((mx-ctxOx) / snapSize)*snapSize, Math.floor((my- ctxOy) / snapSize)*snapSize,this.pic, this.spec, this.spec2))
			lastEdit.push(4)
		}
		bgOptions[bgOptions.length-1].spec = 0 //top, bottom
		bgOptions[bgOptions.length-1].spec2 = 0.5; //Cleanliness
		bgOptions[bgOptions.length-1].config = function(){
			this.spec = prompt("Top (T) Bottom (B) else regular (any key)", "");
			if(this.spec == "T") this.spec = 1
			else if(this.spec == "B") this.spec = 2
			else this.spec = 0
			this.spec2 = Number(prompt("How clean and dank?  0 - very dank, 1 - very clean, 0.5 - No effect", ""));
		}
	}
	bgOptions.push(new editOption(100 + i * 60, h - 100, null));
	bgOptions[bgOptions.length-1].imageText = "WordWall"
	bgOptions[bgOptions.length-1].name = "Word Wall"
	bgOptions[bgOptions.length-1].insert = function(){
		this.text = "wallPanels.push(new wordWall(" + Math.floor((mx-ctxOx) / snapSize)*snapSize + "," + Math.floor((my-ctxOy) / snapSize)*snapSize + ", '" + this.spec + "'," + this.spec2 + "));"
		wallPanels.push(new wordWall( Math.floor((mx-ctxOx) / snapSize)*snapSize, Math.floor((my- ctxOy) / snapSize)*snapSize, this.spec, this.spec2))
		lastEdit.push(4);
	}
	bgOptions[bgOptions.length-1].spec = "ALERT" //Message
	bgOptions[bgOptions.length-1].spec2 = 20; //Size
	bgOptions[bgOptions.length-1].config = function(){
		this.spec = prompt("Wall Message?", "");
			
		this.spec2 = Number(prompt("Font Size? 30 Huge, 20 Big 10 Small", ""));
		ctx.font = 'bold ' + this.spec2 + 'pt wallFont';
		alert("Message will be " + ctx.measureText(this.spec).width + " wide, " + this.spec2 + " high.");
	}
	
	
	
	
	var wOptions = []
	
	//Floors
	for(var i=0; i < floor.length; i++) {
		wOptions.push(new editOption(100 + i * 60, h - 100, floor[i]));
		wOptions[wOptions.length-1].imageText = "floor[" + i + "]"
		wOptions[wOptions.length-1].insert = function(){
			this.text = "wall.push(createWall(" + Math.floor((mx-ctxOx) / snapSize)*snapSize + "," + Math.floor((my-ctxOy) / snapSize)*snapSize + ", 100,30," + this.imageText + "));"
			wall.push(createWall( Math.floor((mx-ctxOx) / snapSize)*snapSize, Math.floor((my- ctxOy) / snapSize)*snapSize,100,30,this.pic))
			lastEdit.push(3)
		}
	}
	for(var i=0; i < floorHole.length; i++) {
		fOptions.push(new editOption(100 + i * 60, h - 100, floorHole[i]));
		fOptions[fOptions.length-1].imageText = "floorHole[" + i + "]"
		fOptions[fOptions.length-1].insert = function(){
			this.text = "wallPanels.push(new ForeGround(" + Math.floor((mx-ctxOx) / snapSize)*snapSize + "," + Math.floor((my-ctxOy) / snapSize)*snapSize + ", " + this.imageText + "));"
			wallPanels.push(new ForeGround( Math.floor((mx-ctxOx) / snapSize)*snapSize, Math.floor((my- ctxOy) / snapSize)*snapSize,this.pic))
			lastEdit.push(4)
		}
	}
	
	//Sidewalls
	for(var i=0; i < sideWall.length; i++) {
		wOptions.push(new editOption(100 + i * 60, h - 100, sideWall[i]));
		wOptions[wOptions.length-1].imageText = "sideWall[" + i + "]"
		wOptions[wOptions.length-1].insert = function(){
			this.text = "wall.push(createWall(" + Math.floor((mx-ctxOx) / snapSize)*snapSize + "," + Math.floor((my-ctxOy) / snapSize)*snapSize + ", 30,100," + this.imageText + "));"
			wall.push(createWall( Math.floor((mx-ctxOx) / snapSize)*snapSize, Math.floor((my- ctxOy) / snapSize)*snapSize, 30, 100,this.pic))
			lastEdit.push(3)
		}
	}
	//Sidewall debris
	for(var i=0; i < sideWallDebris.length; i++) {
		fOptions.push(new editOption(100 + i * 60, h - 100, sideWallDebris[i]));
		fOptions[fOptions.length-1].imageText = "sideWallDebris[" + i + "]"
		fOptions[fOptions.length-1].insert = function(){
			if(this.spec == 1){
				this.text = "foreGround.push(createWall(" + Math.floor((mx-ctxOx) / snapSize)*snapSize + "," + Math.floor((my-ctxOy) / snapSize)*snapSize + ", 30,100," + this.imageText + "));"
				foreGround.push(createWall( Math.floor((mx-ctxOx) / snapSize)*snapSize, Math.floor((my- ctxOy) / snapSize)*snapSize,30,100,this.pic))
				lastEdit.push(7)
			}else{
				this.text = "wallPanels.push(createWall(" + Math.floor((mx-ctxOx) / snapSize)*snapSize + "," + Math.floor((my-ctxOy) / snapSize)*snapSize + ", 30,100," + this.imageText + "));"
				wallPanels.push(createWall( Math.floor((mx-ctxOx) / snapSize)*snapSize, Math.floor((my- ctxOy) / snapSize)*snapSize,30,100,this.pic))
				lastEdit.push(4)
			}
		}
		fOptions[fOptions.length-1].spec = 0
		fOptions[fOptions.length-1].config = function(){
			this.spec = prompt("Foreground (F) Background (B)  Background is default", "");
			if(this.spec == "F") this.spec = 1
			else this.spec = 0
		}
	}
	
	for(var i=0; i < ceiling.length; i++) {
		wOptions.push(new editOption(100 + i * 60, h - 100, ceiling[i]));
		wOptions[wOptions.length-1].imageText = "ceiling[" + i + "]"
		wOptions[wOptions.length-1].insert = function(){
			this.text = "wall.push(createWall(" + Math.floor((mx-ctxOx) / snapSize)*snapSize + "," + Math.floor((my-ctxOy) / snapSize)*snapSize + ", 100,50," + this.imageText + "));"
			wall.push(createWall( Math.floor((mx-ctxOx) / snapSize)*snapSize, Math.floor((my- ctxOy) / snapSize)*snapSize,100,50,this.pic))
			lastEdit.push(3)
		}
	}
	for(var i=0; i < ceilingHole.length; i++) {
		fOptions.push(new editOption(100 + i * 60, h - 100, ceilingHole[i]));
		fOptions[fOptions.length-1].imageText = "ceilingHole[" + i + "]"
		fOptions[fOptions.length-1].insert = function(){
			this.text = "wallPanels.push(new ForeGround(" + Math.floor((mx-ctxOx) / snapSize)*snapSize + "," + Math.floor((my-ctxOy) / snapSize)*snapSize + ", " + this.imageText + ", " + this.spec + "," + this.spec2 + "));"
			wallPanels.push(new ForeGround( Math.floor((mx-ctxOx) / snapSize)*snapSize, Math.floor((my- ctxOy) / snapSize)*snapSize,this.pic, this.spec, this.spec2))
			lastEdit.push(4)
		}/*
		bgOptions[bgOptions.length-1].spec = 0 //top, bottom
		bgOptions[bgOptions.length-1].spec2 = 0.5; //Cleanliness
		bgOptions[bgOptions.length-1].config = function(){
			this.spec = prompt("Top (T) Bottom (B) else regular (any key)", "");
			if(this.spec == "T") this.spec = 1
			else if(this.spec == "B") this.spec = 2
			else this.spec = 0
			this.spec2 = Number(prompt("How clean and dank?  0 - very dank, 1 - very clean, 0.5 - No effect", ""));
		}
		*/
	}
	
	for(var i=0; i < door.length; i++) {
		bgOptions.push(new editOption(100 + i * 60, h - 100, door[i]));
		bgOptions[bgOptions.length-1].imageText = "door[" + i + "]"
		bgOptions[bgOptions.length-1].insert = function(){
			this.text = "wallPanels.push(new ForeGround(" + Math.floor((mx-ctxOx) / snapSize)*snapSize + "," + Math.floor((my-ctxOy) / snapSize)*snapSize + ", " + this.imageText + ", '', 0.5));"
			wallPanels.push(new ForeGround( Math.floor((mx-ctxOx) / snapSize)*snapSize, Math.floor((my- ctxOy) / snapSize)*snapSize,this.pic, "", 0.5))
			lastEdit.push(4)
		}
	}
	
	//Foreground
	
	for(var i=0; i < foreGPic.length; i++) {
		fOptions.push(new editOption(100 + i * 60, h - 100, foreGPic[i]));
		fOptions[fOptions.length-1].imageText = "foreGPic[" + i + "]"
		fOptions[fOptions.length-1].insert = function(){
			if(this.spec == 1){
				this.text = "foreGround.push(new ForeGround(" + Math.floor((mx-ctxOx) / snapSize)*snapSize + "," + Math.floor((my-ctxOy) / snapSize)*snapSize + ", " + this.imageText + "));"
				foreGround.push(new ForeGround( Math.floor((mx-ctxOx) / snapSize)*snapSize, Math.floor((my- ctxOy) / snapSize)*snapSize,this.pic))
				lastEdit.push(7)
			}else{
				this.text = "wallPanels.push(new ForeGround(" + Math.floor((mx-ctxOx) / snapSize)*snapSize + "," + Math.floor((my-ctxOy) / snapSize)*snapSize + ", " + this.imageText + "));"
				wallPanels.push(new ForeGround( Math.floor((mx-ctxOx) / snapSize)*snapSize, Math.floor((my- ctxOy) / snapSize)*snapSize,this.pic))
				lastEdit.push(4)
			}
		}
		fOptions[fOptions.length-1].spec = 0
		fOptions[fOptions.length-1].config = function(){
			this.spec = prompt("Foreground (F) Background (B)  Background is default", "");
			if(this.spec == "F") this.spec = 1
			else this.spec = 0
		}
	}
	
	//Lights
	var lOptions = []
	lOptions.push(new editOption(50, h - 100, null));
	lOptions[0].imageText = "panelHallClean[" + i + "]"
	lOptions[0].name = "RoundLight";
	lOptions[0].insert = function(){
		this.text = "rLights.push(new staticLight(" + Math.floor((mx-ctxOx) / snapSize)*snapSize + "," + Math.floor((my-ctxOy) / snapSize)*snapSize + ", 20));"
		rLights.push(new staticLight( Math.floor((mx-ctxOx) / snapSize)*snapSize, Math.floor((my- ctxOy) / snapSize)*snapSize,20))
		lastEdit.push(8)
	}
	
	lOptions.push(new editOption(110, h - 100, null));
	lOptions[1].imageText = ""
	lOptions[1].name = "Lamp";
	lOptions[1].insert = function(){
		this.text = "lamps.push(new Lamp(" + Math.floor((mx-ctxOx) / snapSize)*snapSize + "," + Math.floor((my-ctxOy) / snapSize)*snapSize + "));"
		lamps.push(new Lamp(Math.floor((mx-ctxOx) / snapSize)*snapSize,Math.floor((my-ctxOy) / snapSize)*snapSize));
		lastEdit.push(2)
	}
	
	lOptions.push(new editOption(170, h - 100, null));
	lOptions[2].imageText = ""
	lOptions[2].name = "SpinLight";
	lOptions[2].insert = function(){
		this.text = "dLights.push(new spinLight(" + Math.floor((mx-ctxOx) / snapSize)*snapSize + "," + Math.floor((my-ctxOy) / snapSize)*snapSize + ",50,0));"
		dLights.push(new spinLight(Math.floor((mx- ctxOx) / snapSize)*snapSize,Math.floor((my-ctxOy) / snapSize)*snapSize, 50,0));
		lastEdit.push(0)
	}
	
	lOptions.push(new editOption(230, h - 100, null));
	lOptions[3].imageText = ""
	lOptions[3].name = "FlikrLight";
	lOptions[3].insert = function(){
		this.text = "lamps.push(new FlickerLamp(" + Math.floor((mx-ctxOx) / snapSize)*snapSize + "," + Math.floor((my-ctxOy) / snapSize)*snapSize + "));"
		lamps.push(new FlickerLamp(Math.floor((mx - ctxOx) / snapSize)*snapSize,Math.floor((my-ctxOy) / snapSize)*snapSize));
		lastEdit.push(2)
	}
	
	
	lOptions.push(new editOption(290, h - 100, null));
	lOptions[4].imageText = ""
	lOptions[4].name = "AngledLight";
	lOptions[4].insert = function(){
		this.text = "dLights.push(new angledLight(" + Math.floor((mx-ctxOx) / snapSize)*snapSize + "," + Math.floor((my-ctxOy) / snapSize)*snapSize + "," +  this.spec2 + ", "+ this.spec + "));"
		dLights.push(new angledLight( Math.floor((mx-ctxOx) / snapSize)*snapSize, Math.floor((my- ctxOy) / snapSize)*snapSize, this.spec2, this.spec))
		lastEdit.push(0)
	}
	lOptions[4].spec = 0;
	lOptions[4].spec2 = 150;
	lOptions[4].config = function(){
		this.spec = Number(prompt("State the desired angle.", ""));
		this.spec2 = Number(prompt("State the desired length.", ""));
	}
	
	lOptions.push(new editOption(210, h - 100, null));
	lOptions[5].imageText = ""
	lOptions[5].name = "GlowLamp";
	lOptions[5].insert = function(){
		this.text = "lamps.push(new glowLamp(" + Math.floor((mx-ctxOx) / snapSize)*snapSize + "," + Math.floor((my-ctxOy) / snapSize)*snapSize + "));"
		lamps.push(new glowLamp(Math.floor((mx-ctxOx) / snapSize)*snapSize,Math.floor((my-ctxOy) / snapSize)*snapSize));
		lastEdit.push(2)
	}
	
	lOptions.push(new editOption(270, h - 100, null));
	lOptions[6].imageText = ""
	lOptions[6].name = "DeadLamp";
	lOptions[6].insert = function(){
		this.text = "lamps.push(new deadLamp(" + Math.floor((mx-ctxOx) / snapSize)*snapSize + "," + Math.floor((my-ctxOy) / snapSize)*snapSize + "));"
		lamps.push(new deadLamp(Math.floor((mx-ctxOx) / snapSize)*snapSize,Math.floor((my-ctxOy) / snapSize)*snapSize));
		lastEdit.push(2)
	}
	
	lOptions.push(new editOption(270, h - 100, null));
	lOptions[7].imageText = ""
	lOptions[7].name = "Sparks";
	lOptions[7].insert = function(){
		this.text = "lamps.push(new sparker(" + Math.floor((mx-ctxOx) / snapSize)*snapSize + "," + Math.floor((my-ctxOy) / snapSize)*snapSize + "));"
		lamps.push(new sparker(Math.floor((mx-ctxOx) / snapSize)*snapSize,Math.floor((my-ctxOy) / snapSize)*snapSize));
		lastEdit.push(2)
	}
	
	lOptions.push(new editOption(270, h - 100, null));
	lOptions[8].imageText = ""
	lOptions[8].name = "Water Leak";
	lOptions[8].insert = function(){
		this.text = "lamps.push(new waterDrop(" + Math.floor((mx-ctxOx) / snapSize)*snapSize + "," + Math.floor((my-ctxOy) / snapSize)*snapSize + "));"
		lamps.push(new waterDrop(Math.floor((mx-ctxOx) / snapSize)*snapSize,Math.floor((my-ctxOy) / snapSize)*snapSize));
		lastEdit.push(2)
	}
	
	
	
		lOptions.push(new editOption(100 + i * 60, h - 100, ceilingHole[i]));
		lOptions[lOptions.length-1].imageText = "WordTicker"
		lOptions[lOptions.length-1].insert = function(){
			this.text = "wallPanels.push(new wordTicker(" + Math.floor((mx-ctxOx) / snapSize)*snapSize + "," + Math.floor((my-ctxOy) / snapSize)*snapSize + ", '" + this.spec + "'));"
			wallPanels.push(new wordTicker( Math.floor((mx-ctxOx) / snapSize)*snapSize, Math.floor((my- ctxOy) / snapSize)*snapSize, this.spec))
			lastEdit.push(4);
		}
		lOptions[lOptions.length-1].spec = "ALERT" //top, bottom
		lOptions[lOptions.length-1].spec2 = 0; //Cleanliness
		lOptions[lOptions.length-1].config = function(){
			this.spec = prompt("Warning message?", "");
			
			//this.spec2 = Number(prompt("How clean and dank?  0 - very dank, 1 - very clean, 0.5 - No effect", ""));
		}
	
	
	lOptions.push(new editOption(110, h - 100, biglampLit));
	lOptions[10].imageText = ""
	lOptions[10].name = "Big Lamp";
	lOptions[10].insert = function(){
		this.text = "lamps.push(new BigLamp(" + Math.floor((mx-ctxOx) / snapSize)*snapSize + "," + Math.floor((my-ctxOy) / snapSize)*snapSize + "));"
		lamps.push(new BigLamp(Math.floor((mx-ctxOx) / snapSize)*snapSize,Math.floor((my-ctxOy) / snapSize)*snapSize));
		lastEdit.push(2)
	}
	
	lOptions.push(new editOption(110, h - 100, biglampOut));
	lOptions[11].imageText = ""
	lOptions[11].name = "Big Lamp Dead";
	lOptions[11].insert = function(){
		this.text = "lamps.push(new BigLampDead(" + Math.floor((mx-ctxOx) / snapSize)*snapSize + "," + Math.floor((my-ctxOy) / snapSize)*snapSize + "));"
		lamps.push(new BigLampDead(Math.floor((mx-ctxOx) / snapSize)*snapSize,Math.floor((my-ctxOy) / snapSize)*snapSize));
		lastEdit.push(2)
	}
	
	lOptions.push(new editOption(110, h - 100, null));
	lOptions[12].imageText = ""
	lOptions[12].name = "BL Flicker";
	lOptions[12].insert = function(){
		this.text = "lamps.push(new BigLampFlicker(" + Math.floor((mx-ctxOx) / snapSize)*snapSize + "," + Math.floor((my-ctxOy) / snapSize)*snapSize + "));"
		lamps.push(new BigLampFlicker(Math.floor((mx-ctxOx) / snapSize)*snapSize,Math.floor((my-ctxOy) / snapSize)*snapSize));
		lastEdit.push(2)
	}
	
	lOptions.push(new editOption(110, h - 100, null));
	lOptions[13].imageText = ""
	lOptions[13].name = "PulseLight";
	lOptions[13].insert = function(){
		this.text = "lamps.push(new pulseLight(" + Math.floor((mx-ctxOx) / snapSize)*snapSize + "," + Math.floor((my-ctxOy) / snapSize)*snapSize + "));"
		lamps.push(new pulseLight(Math.floor((mx-ctxOx) / snapSize)*snapSize,Math.floor((my-ctxOy) / snapSize)*snapSize));
		lastEdit.push(2)
	}
	
	lOptions.push(new editOption(110, h - 100, null));
	lOptions[14].imageText = ""
	lOptions[14].name = "Add PLight";
	lOptions[14].insert = function(){
		var lastL = -1;
		for(var i=0; i < lamps.length; i++){
			if(lamps[i].type == "PLight") lastL = i
		}
		if(lastL >= 0){
			if(lamps[lastL].type == "PLight"){
				this.text = "lamps[" + lastL + "].addPLight(" + Math.floor((mx-ctxOx) / snapSize)*snapSize + ", " + Math.floor((my-ctxOy) / snapSize)*snapSize + ");"
				lamps[lastL].addPLight(Math.floor((mx-ctxOx) / snapSize)*snapSize, Math.floor((my-ctxOy) / snapSize)*snapSize);
				lastEdit.push(2)
			}else{
				this.text = ""
				alert("I found a pulse light strip that isn't a pulse light strip.  Whaaaat?");
			}
		}else {
			alert("No pulse light strips on the map yet.  MAKE ONE BEFORE YOU ADD TO IT!!");
			this.text = "";
		}
	}
	
	lOptions.push(new editOption(290, h - 100, null));
	lOptions[15].imageText = ""
	lOptions[15].name = "Gen Light";
	lOptions[15].insert = function(){
		this.text = "dLights.push(new GenLight(" + Math.floor((mx-ctxOx) / snapSize)*snapSize + "," + Math.floor((my-ctxOy) / snapSize)*snapSize + "," +  this.spec + ", "+ this.spec2 + "));"
		dLights.push(new GenLight( Math.floor((mx-ctxOx) / snapSize)*snapSize, Math.floor((my- ctxOy) / snapSize)*snapSize, this.spec, this.spec2))
		lastEdit.push(0)
	}
	lOptions[15].spec = 10;
	lOptions[15].spec2 = 0.2;
	lOptions[15].config = function(){
		this.spec = Number(prompt("State the desired radius.", this.spec));
		this.spec2 = Number(prompt("State the desired intensity.", this.spec2));
	}
	
	lOptions.push(new editOption(270, h - 100, null));
	lOptions[16].imageText = ""
	lOptions[16].name = "Up Lamp";
	lOptions[16].insert = function(){
		this.text = "lamps.push(new UpLamp(" + Math.floor((mx-ctxOx) / snapSize)*snapSize + "," + Math.floor((my-ctxOy) / snapSize)*snapSize + "));"
		lamps.push(new UpLamp(Math.floor((mx-ctxOx) / snapSize)*snapSize,Math.floor((my-ctxOy) / snapSize)*snapSize));
		lastEdit.push(2)
	}
	
	lOptions.push(new editOption(170, h - 100, null));
	lOptions[17].imageText = ""
	lOptions[17].name = "SteamJet";
	lOptions[17].insert = function(){
		this.text = "dLights.push(new steamJet(" + Math.floor((mx-ctxOx) / snapSize)*snapSize + "," + Math.floor((my-ctxOy) / snapSize)*snapSize + "));"
		dLights.push(new steamJet(Math.floor((mx- ctxOx) / snapSize)*snapSize,Math.floor((my-ctxOy) / snapSize)*snapSize));
		lastEdit.push(0)
	}
	
	
	//Items
	var iOptions = []
	iOptions.push(new editOption(50, h - 100, null));
	iOptions[0].imageText = "iconPistol"
	iOptions[0].name = "Pistol";
	iOptions[0].pic = iconPistol;
	iOptions[0].insert = function(){
		this.text = "items.push(pistolItem(" + Math.floor((mx-ctxOx) / snapSize)*snapSize + "," + Math.floor((my-ctxOy) / snapSize)*snapSize + "));"
		items.push(pistolItem( Math.floor((mx-ctxOx) / snapSize)*snapSize, Math.floor((my- ctxOy) / snapSize)*snapSize))
		lastEdit.push(6)
	}
	
	iOptions.push(new editOption(110, h - 100, null));
	iOptions[1].imageText = "iconSMG"
	iOptions[1].name = "SMG";
	iOptions[1].pic = iconSMG;
	iOptions[1].insert = function(){
		this.text = "items.push(smgItem(" + Math.floor((mx-ctxOx) / snapSize)*snapSize + "," + Math.floor((my-ctxOy) / snapSize)*snapSize + "));"
		items.push(smgItem( Math.floor((mx-ctxOx) / snapSize)*snapSize, Math.floor((my- ctxOy) / snapSize)*snapSize))
		lastEdit.push(6)
	}
	
	iOptions.push(new editOption(170, h - 100, null));
	iOptions[2].imageText = "iconPistol"
	iOptions[2].name = "Rifle";
	iOptions[2].pic = iconRifle;
	iOptions[2].insert = function(){
		this.text = "items.push(rifleItem(" + Math.floor((mx-ctxOx) / snapSize)*snapSize + "," + Math.floor((my-ctxOy) / snapSize)*snapSize + "));"
		items.push(rifleItem( Math.floor((mx-ctxOx) / snapSize)*snapSize, Math.floor((my- ctxOy) / snapSize)*snapSize))
		lastEdit.push(6)
	}
	
	
	iOptions.push(new editOption(230, h - 100, null));
	iOptions[3].imageText = "iconPistol"
	iOptions[3].name = "MedKit";
	iOptions[3].pic = iconMed;
	iOptions[3].insert = function(){
		this.text = "items.push(medItem(" + Math.floor((mx-ctxOx) / snapSize)*snapSize + "," + Math.floor((my-ctxOy) / snapSize)*snapSize + "));"
		items.push(medItem( Math.floor((mx-ctxOx) / snapSize)*snapSize, Math.floor((my- ctxOy) / snapSize)*snapSize))
		lastEdit.push(6)
	}
	
	iOptions.push(new editOption(230, h - 100, null));
	iOptions[3].imageText = "iconArmor"
	iOptions[3].name = "Armor";
	iOptions[3].pic = iconArmor;
	iOptions[3].insert = function(){
		this.text = "items.push(armorItem(" + Math.floor((mx-ctxOx) / snapSize)*snapSize + "," + Math.floor((my-ctxOy) / snapSize)*snapSize + "));"
		items.push(armorItem( Math.floor((mx-ctxOx) / snapSize)*snapSize, Math.floor((my- ctxOy) / snapSize)*snapSize))
		lastEdit.push(6)
	}
	
	iOptions.push(new editOption(230, h - 100, null));
	iOptions[4].imageText = ""
	iOptions[4].name = "Steam Trap";
	iOptions[4].pic = null;
	iOptions[4].insert = function(){
		this.text = "items.push(steamTrap(" + Math.floor((mx-ctxOx) / snapSize)*snapSize + "," + Math.floor((my-ctxOy) / snapSize)*snapSize + "));"
		items.push(steamTrap( Math.floor((mx-ctxOx) / snapSize)*snapSize, Math.floor((my- ctxOy) / snapSize)*snapSize))
		lastEdit.push(6)
	}
	
	
	iOptions.push(new editOption(230, h - 100, null));
	iOptions[iOptions.length-1].imageText = "recorder"
	iOptions[iOptions.length-1].name = "Message";
	iOptions[iOptions.length-1].pic = recorder;
	iOptions[iOptions.length-1].insert = function(){
		this.text = "items.push(messageTrap(" + Math.floor((mx-ctxOx) / snapSize)*snapSize + "," + Math.floor((my-ctxOy) / snapSize)*snapSize + ", " + this.imageText + ", '" + this.spec + "', '" + this.spec2 + "'));"
		items.push(messageTrap( Math.floor((mx-ctxOx) / snapSize)*snapSize, Math.floor((my- ctxOy) / snapSize)*snapSize, this.pic, this.spec, this.spec2))
		lastEdit.push(6)
	}
	
	iOptions[iOptions.length-1].config = function(){
		this.spec = prompt("Message title?", "Default title!");
		this.spec2 = prompt("Full Message?", "");
	}
	
	
	iOptions.push(new editOption(230, h - 100, null));
	iOptions[iOptions.length-1].imageText = "blankPic"
	iOptions[iOptions.length-1].name = "Message";
	iOptions[iOptions.length-1].pic = blankPic;
	iOptions[iOptions.length-1].insert = function(){
		this.text = "items.push(messageTrap(" + Math.floor((mx-ctxOx) / snapSize)*snapSize + "," + Math.floor((my-ctxOy) / snapSize)*snapSize + ", " + this.imageText + ", '" + this.spec + "', '" + this.spec2 + "'));"
		items.push(messageTrap( Math.floor((mx-ctxOx) / snapSize)*snapSize, Math.floor((my- ctxOy) / snapSize)*snapSize, this.pic, this.spec, this.spec2))
		lastEdit.push(6)
	}
	
	iOptions[iOptions.length-1].config = function(){
		this.spec = prompt("Message title?", "Default title!");
		this.spec2 = prompt("Full Message?", "");
	}
	
	var sOptions = [];
	sOptions.push(new editOption(230, h - 100, null));
	sOptions[sOptions.length-1].imageText = "wallFeatures[16]"
	sOptions[sOptions.length-1].name = "Alarm";
	sOptions[sOptions.length-1].pic = wallFeatures[16];
	sOptions[sOptions.length-1].insert = function(){
		this.text = "wallPanels.push(new Alarm(" + Math.floor((mx-ctxOx) / snapSize)*snapSize + "," + Math.floor((my-ctxOy) / snapSize)*snapSize + "));"
		wallPanels.push(new Alarm( Math.floor((mx-ctxOx) / snapSize)*snapSize, Math.floor((my- ctxOy) / snapSize)*snapSize))
		lastEdit.push(10)
	}
	
	
	sOptions.push(new editOption(230, h - 100, null));
	sOptions[sOptions.length-1].imageText = ""
	sOptions[sOptions.length-1].name = "Speaker";
	sOptions[sOptions.length-1].pic = null;
	sOptions[sOptions.length-1].insert = function(){
		this.text = "wallPanels.push(new talker(" + Math.floor((mx-ctxOx) / snapSize)*snapSize + "," + Math.floor((my-ctxOy) / snapSize)*snapSize + ",'" + this.spec + "','" + this.spec2 + "'));"
		wallPanels.push(new talker( Math.floor((mx-ctxOx) / snapSize)*snapSize, Math.floor((my- ctxOy) / snapSize)*snapSize, this.spec, this.spec2))
		lastEdit.push(10)
	}
	sOptions[sOptions.length-1].spec = "alarm"
	sOptions[sOptions.length-1].spec2 = "test"
	
	sOptions[sOptions.length-1].config = function(){
		this.spec = prompt("Message?", "Default title!");
		//this.spec2 = prompt("unsed!?", "");
	}
	
	
	cOptions.push(new editOption(50, h - 100, null));
	cOptions[cOptions.length-1].imageText = ""
	cOptions[cOptions.length-1].name = "Marine";
	cOptions[cOptions.length-1].pic = null;
	cOptions[cOptions.length-1].insert = function(){
		this.text = "creature.push(Marine(" + Math.floor((mx-ctxOx) / snapSize)*snapSize + "," + Math.floor((my-ctxOy) / snapSize)*snapSize + ",3));"
		creature.push(Marine( Math.floor((mx-ctxOx) / snapSize)*snapSize, Math.floor((my- ctxOy) / snapSize)*snapSize,3))
		lastEdit.push(5)
	}
	
	cOptions.push(new editOption(50, h - 100, null));
	cOptions[cOptions.length-1].imageText = ""
	cOptions[cOptions.length-1].name = "Scientist";
	cOptions[cOptions.length-1].pic = null;
	cOptions[cOptions.length-1].insert = function(){
		this.text = "creature.push(Scientist(" + Math.floor((mx-ctxOx) / snapSize)*snapSize + "," + Math.floor((my-ctxOy) / snapSize)*snapSize + ",3));"
		creature.push(Scientist( Math.floor((mx-ctxOx) / snapSize)*snapSize, Math.floor((my- ctxOy) / snapSize)*snapSize,3))
		lastEdit.push(5)
	}
	
	cOptions.push(new editOption(50, h - 100, null));
	cOptions[cOptions.length-1].imageText = ""
	cOptions[cOptions.length-1].name = "EntryInsect";
	cOptions[cOptions.length-1].pic = null;
	cOptions[cOptions.length-1].insert = function(){
		this.text = "creature.push(baseLineMutant(" + Math.floor((mx-ctxOx) / snapSize)*snapSize + "," + Math.floor((my-ctxOy) / snapSize)*snapSize + ",0));"
		creature.push(baseLineMutant( Math.floor((mx-ctxOx) / snapSize)*snapSize, Math.floor((my- ctxOy) / snapSize)*snapSize,0))
		lastEdit.push(5)
	}
	
	cOptions.push(new editOption(50, h - 100, null));
	cOptions[cOptions.length-1].imageText = ""
	cOptions[cOptions.length-1].name = "EntryRept";
	cOptions[cOptions.length-1].pic = null;
	cOptions[cOptions.length-1].insert = function(){
		this.text = "creature.push(baseLineMutant(" + Math.floor((mx-ctxOx) / snapSize)*snapSize + "," + Math.floor((my-ctxOy) / snapSize)*snapSize + ",1));"
		creature.push(baseLineMutant( Math.floor((mx-ctxOx) / snapSize)*snapSize, Math.floor((my- ctxOy) / snapSize)*snapSize,1))
		lastEdit.push(5)
	}
	
		cOptions.push(new editOption(50, h - 100, null));
	cOptions[cOptions.length-1].imageText = ""
	cOptions[cOptions.length-1].name = "MaggotMan";
	cOptions[cOptions.length-1].pic = null;
	cOptions[cOptions.length-1].insert = function(){
		this.text = "creature.push(Maggot(" + Math.floor((mx-ctxOx) / snapSize)*snapSize + "," + Math.floor((my-ctxOy) / snapSize)*snapSize + ",0));"
		creature.push(Maggot( Math.floor((mx-ctxOx) / snapSize)*snapSize, Math.floor((my- ctxOy) / snapSize)*snapSize,0))
		lastEdit.push(5)
	}
	
		cOptions.push(new editOption(50, h - 100, null));
	cOptions[cOptions.length-1].imageText = ""
	cOptions[cOptions.length-1].name = "Bug";
	cOptions[cOptions.length-1].pic = null;
	cOptions[cOptions.length-1].insert = function(){
		this.text = "creature.push(Bug(" + Math.floor((mx-ctxOx) / snapSize)*snapSize + "," + Math.floor((my-ctxOy) / snapSize)*snapSize + ",0));"
		creature.push(Bug( Math.floor((mx-ctxOx) / snapSize)*snapSize, Math.floor((my- ctxOy) / snapSize)*snapSize,0))
		lastEdit.push(5)
	}
	
	cOptions.push(new editOption(50, h - 100, null));
	cOptions[cOptions.length-1].imageText = ""
	cOptions[cOptions.length-1].name = "LowInsect";
	cOptions[cOptions.length-1].pic = null;
	cOptions[cOptions.length-1].insert = function(){
		this.text = "creature.push(LowInsect(" + Math.floor((mx-ctxOx) / snapSize)*snapSize + "," + Math.floor((my-ctxOy) / snapSize)*snapSize + ",0));"
		creature.push(LowInsect( Math.floor((mx-ctxOx) / snapSize)*snapSize, Math.floor((my- ctxOy) / snapSize)*snapSize,0))
		lastEdit.push(5)
	}
	
	cOptions.push(new editOption(50, h - 100, null));
	cOptions[cOptions.length-1].imageText = ""
	cOptions[cOptions.length-1].name = "MedInsect";
	cOptions[cOptions.length-1].pic = null;
	cOptions[cOptions.length-1].insert = function(){
		this.text = "creature.push(MedInsect(" + Math.floor((mx-ctxOx) / snapSize)*snapSize + "," + Math.floor((my-ctxOy) / snapSize)*snapSize + ",0));"
		creature.push(MedInsect( Math.floor((mx-ctxOx) / snapSize)*snapSize, Math.floor((my- ctxOy) / snapSize)*snapSize,0))
		lastEdit.push(5)
	}
	
	cOptions.push(new editOption(50, h - 100, null));
	cOptions[cOptions.length-1].imageText = ""
	cOptions[cOptions.length-1].name = "HighInsect";
	cOptions[cOptions.length-1].pic = null;
	cOptions[cOptions.length-1].insert = function(){
		this.text = "creature.push(HighInsect(" + Math.floor((mx-ctxOx) / snapSize)*snapSize + "," + Math.floor((my-ctxOy) / snapSize)*snapSize + ",0));"
		creature.push(HighInsect( Math.floor((mx-ctxOx) / snapSize)*snapSize, Math.floor((my- ctxOy) / snapSize)*snapSize,0))
		lastEdit.push(5)
	}
	
	cOptions.push(new editOption(50, h - 100, null));
	cOptions[cOptions.length-1].imageText = ""
	cOptions[cOptions.length-1].name = "LowReptile";
	cOptions[cOptions.length-1].pic = null;
	cOptions[cOptions.length-1].insert = function(){
		this.text = "creature.push(LowReptile(" + Math.floor((mx-ctxOx) / snapSize)*snapSize + "," + Math.floor((my-ctxOy) / snapSize)*snapSize + ",1));"
		creature.push(LowReptile( Math.floor((mx-ctxOx) / snapSize)*snapSize, Math.floor((my- ctxOy) / snapSize)*snapSize,1))
		lastEdit.push(5)
	}
	
	cOptions.push(new editOption(50, h - 100, null));
	cOptions[cOptions.length-1].imageText = ""
	cOptions[cOptions.length-1].name = "MedReptile";
	cOptions[cOptions.length-1].pic = null;
	cOptions[cOptions.length-1].insert = function(){
		this.text = "creature.push(MedReptile(" + Math.floor((mx-ctxOx) / snapSize)*snapSize + "," + Math.floor((my-ctxOy) / snapSize)*snapSize + ",1));"
		creature.push(MedReptile( Math.floor((mx-ctxOx) / snapSize)*snapSize, Math.floor((my- ctxOy) / snapSize)*snapSize,1))
		lastEdit.push(5)
	}
	
	cOptions.push(new editOption(50, h - 100, null));
	cOptions[cOptions.length-1].imageText = ""
	cOptions[cOptions.length-1].name = "HighReptile";
	cOptions[cOptions.length-1].pic = null;
	cOptions[cOptions.length-1].insert = function(){
		this.text = "creature.push(HighReptile(" + Math.floor((mx-ctxOx) / snapSize)*snapSize + "," + Math.floor((my-ctxOy) / snapSize)*snapSize + ",1));"
		creature.push(HighReptile( Math.floor((mx-ctxOx) / snapSize)*snapSize, Math.floor((my- ctxOy) / snapSize)*snapSize,1))
		lastEdit.push(5)
	}

	cOptions.push(new editOption(230, h - 100, null));
	cOptions[cOptions.length-1].imageText = "recorder"
	cOptions[cOptions.length-1].name = "Spawner";
	cOptions[cOptions.length-1].pic = null;
	cOptions[cOptions.length-1].insert = function(){
		this.text = "items.push(spawnTrap(" + Math.floor((mx-ctxOx) / snapSize)*snapSize + "," + Math.floor((my-ctxOy) / snapSize)*snapSize + ", " + this.imageText + ", '" + this.spec + "', '" + this.spec2 + "'));"
		items.push(spawnTrap( Math.floor((mx-ctxOx) / snapSize)*snapSize, Math.floor((my- ctxOy) / snapSize)*snapSize, this.pic, this.spec, this.spec2))
		lastEdit.push(6)
	}
	
	cOptions[cOptions.length-1].config = function(){
		this.spec = prompt("Creature type? 0- Insect 1- Reptile 2- Human", "0");
		if(this.spec == 0) this.spec2 = prompt("Insect Level? 0- Low 1-Med 2-High 3- Bug 4- Maggot", "0");
		else this.spec2 = prompt("Level? 0- Low 1-Med 2-High", "0");
	}

	
	
	for(var i=0; i < bgOptions.length; i++) {
		if(i%2 == 0) {
			bgOptions[i].b.x = 50 + i * 30
			bgOptions[i].b.y = h - 110
		}else{
			bgOptions[i].b.x = 50 + (i-1) * 30
			bgOptions[i].b.y = h - 50
		}
	}
	
	for(var i=0; i < wOptions.length; i++) {
		if(i%2 == 0) {
			wOptions[i].b.x = 50 + i * 30
			wOptions[i].b.y = h - 110
		}else{
			wOptions[i].b.x = 50 + (i-1) * 30
			wOptions[i].b.y = h - 50
		}
	}
	for(var i=0; i < sOptions.length; i++) {
		if(i%2 == 0) {
			sOptions[i].b.x = 50 + i * 30
			sOptions[i].b.y = h - 110
		}else{
			sOptions[i].b.x = 50 + (i-1) * 30
			sOptions[i].b.y = h - 50
		}
	}
	
	for(var i=0; i < cOptions.length; i++) {
		if(i%2 == 0) {
			cOptions[i].b.x = 50 + i * 30
			cOptions[i].b.y = h - 110
		}else{
			cOptions[i].b.x = 50 + (i-1) * 30
			cOptions[i].b.y = h - 50
		}
	}
	for(var i=0; i < iOptions.length; i++) {
		if(i%2 == 0) {
			iOptions[i].b.x = 50 + i * 30
			iOptions[i].b.y = h - 110
		}else{
			iOptions[i].b.x = 50 + (i-1) * 30
			iOptions[i].b.y = h - 50
		}
	}
	
	for(var i=0; i < fOptions.length; i++) {
		if(i%2 == 0) {
			fOptions[i].b.x = 50 + i * 30
			fOptions[i].b.y = h - 110
		}else{
			fOptions[i].b.x = 50 + (i-1) * 30
			fOptions[i].b.y = h - 50
		}
	}
	
	for(var i=0; i < lOptions.length; i++) {
		if(i%2 == 0) {
			lOptions[i].b.x = 50 + i * 30
			lOptions[i].b.y = h - 110
		}else{
			lOptions[i].b.x = 50 + (i-1) * 30
			lOptions[i].b.y = h - 50
		}
	}
	
	function tile(a,b){
		this.x = a //index values
		this.y = b
		this.panels = [];
		this.wall = false;
	
	}
	
	function Exit(a,b, Index, direct, dx, dy){
		this.x = a;
		this.y = b;
		this.next = Index;
		this.skip = direct //boolean is goto scene or level T=level, F= scene then level
		this.spawnx = dx;
		this.spawny = dy;
		this.load = function(){
			if(cLevel >= 0 && cLevel < level.length) level[cLevel].endLevel()
			if(this.skip){
				//go to level direct
				
				loadLevel(this.next);
				
				creature[cS].x = this.spawnx
				creature[cS].y = this.spawny
				for(var i=0; i < allies.length; i++){
					allies[i].x = this.spawnx + i * 20
					allies[i].y = this.spawny
				}
				screen = 5;
			}else{
				//load the cutscene
				cutscene[this.next].load();
			}
		
		}
	}
	//Level constructors
	function Level(n){
		this.name = n;
		this.elevators = [];
		this.wall = [];
		this.items = [];
		this.wallPanels =[]
		this.dLights = []
		this.rLights = []
		this.pulseLights = []
		this.lamps = []
		this.creature = []
		this.foreGround = []
		this.nextScene = 0;
		this.start = {x:0,y:0}
		this.end = {x:0,y:0}
		this.exits = [];  //Object type
		this.endLevel = function(){
			screen = 4
			scene = this.nextScene;
			playerCharacter = creature[cS];
			this.creature.splice(cS,1);
			//Select nearby allies
			allies = [];
			for(var i=0; i < this.creature.length; i++){
				if (dist(playerCharacter.x, playerCharacter.y, this.creature[i].x, this.creature[i].y) < 200){
					allies.push(this.creature[i])
					this.creature.splice(i,1)
					i--;
				}
			}
			cutscene[scene].frame = 0
			cutscene[scene].load();
		}
	}
	
	function loadLevel(n){
		stopSound();
		levelName = level[n].name
		elevators = level[n].elevators
		exits = level[n].exits
		
		wall = level[n].wall;
		for(var i =0; i < elevators.length; i++) elevators[i].initialize();
		
		resetMapGrid();
		
		rLights = level[n].rLights;
		pulseLights = level[n].pulseLights
		dLights = level[n].dLights;
		lamps = level[n].lamps
		wallPanels = level[n].wallPanels
		
		items = level[n].items
		foreGround = level[n].foreGround
		generateForeGround();
		
		
		var tx = 0;
		var ty = 0;
		/*for(var i= 0 ; i < wallPanels.length; i++){
			tx = (wallPanels[i].x+50)/50
			ty = (wallPanels[i].y+50)/50
			mapGrid[Math.floor(tx)][Math.floor(ty)].panels.push(i)		
		}*/
		
		for(var i= 0 ; i < wall.length; i++){
			tx = Math.floor((wall[i].x)/50)
			ty = Math.floor((wall[i].y)/50)
			if(tx >= 0 && tx < mapGrid.length && ty >=0 && ty < mapGrid[0].length){
				mapGrid[Math.floor(tx)][Math.floor(ty)].wall = true
			}
			
			tx = Math.floor((wall[i].x + wall[i].width - 1)/50)
			ty = Math.floor((wall[i].y)/50)
			if(tx >= 0 && tx < mapGrid.length && ty >=0 && ty < mapGrid[0].length){
				mapGrid[Math.floor(tx)][Math.floor(ty)].wall = true
			}
			
			tx = Math.floor((wall[i].x)/50)
			ty = Math.floor((wall[i].y + wall[i].height - 1)/50)
			if(tx >= 0 && tx < mapGrid.length && ty >=0 && ty < mapGrid[0].length){
				mapGrid[Math.floor(tx)][Math.floor(ty)].wall = true
			}
			
			tx = Math.floor((wall[i].x + wall[i].width - 1)/50)
			ty = Math.floor((wall[i].y + wall[i].height - 1)/50)
			if(tx >= 0 && tx < mapGrid.length && ty >=0 && ty < mapGrid[0].length){
				mapGrid[Math.floor(tx)][Math.floor(ty)].wall = true
			}
		}
		
		creature = level[n].creature
		for(var i=0;i < creature.length;i++)creature[i].getEnemies();
		
		if(playerCharacter != null){
			creature.push(playerCharacter);
			cS = creature.length-1;
			creature[cS].x = level[n].start.x
			creature[cS].y = level[n].start.y
		}
		
		
		
		if(allies.length >0){	
			for(var i=0; i < allies.length; i++){
				allies[i].x = level[n].startx + i * 20;
				allies[i].y = level[n].starty;
				creature.push(allies[i])
			}
		}
		
		for(var i=0; i < creature.length; i++){
			creature[i].state = 0
			creature[i].sx = 0
		}
		start = level[n].start
		end = level[n].end
		cLevel = n
		
		//speak(level[n].title);
		//msg.voice = voices[3]
		//msg.rate = 0.5
		//msg.pitch = 5
		//msg.volume = 0.5
		//msg.volume = 0.1
		//speak(levelName);
	}
	
	
	///////////////////////
	/// 	ACTIVE ENVIRONMENTAL CONSTRUCTORS
	
	function elevator(a,b,c,d){
		this.light = new spinLight(a + 45, b - 140-c, 50, 0)
		this.light2 = new Lamp(a + 45, b - 140-c);
		this.x = a;
		this.y = b - d;
		this.tx = a;
		this.ty = b - c;
		this.gx = a
		this.gy = b - c;
		
		this.maxH = d
		this.maxW = 0
		this.lifter = createWall(a,b-c, 100,30, floor[3])
		this.blocker = createWall(a,b-c, 100,100, panelHall[0])
		
		this.initialize = function(){	
			wall.push(this.lifter);
			this.blocker.setHeight(100);
			wall.push(this.blocker);
			this.blocker.draw = function(){
				//ctx.fillStyle = 'red'
				//ctx.fillRect(this.x,this.y, this.width,this.height)
			}

			this.blocker.setWidth(130)
			this.blocker.x = this.tx - 15
		}
		this.goDown = function(){
			if(this.gy + 10 <= this.y + this.maxH) this.gy += 10
		}
		this.goUp = function(){
			if(this.gy - 10 >= this.y) this.gy -= 10
			//this.ty -= 10
		}
		this.instructions = ""
		this.remove = function(){
			wall.splice(this.wallInd,2);
		}
		this.inUse = false;
		this.draw = function(){
			
			//Force Creatures into a safe position
			if(this.ty != this.gy){
				for(var i =0; i < creature.length; i++){
					if(Math.abs(creature[i].x + 100 - this.tx - 50) < 70 && Math.abs(creature[i].y + 200 - this.ty) < 20 ) {
						creature[i].x = this.tx - 50 + i*5
						creature[i].y = this.ty - 200
					}
				}
			}
			
			ctx.globalAlpha = 0.8
			for(var i=0; i < this.maxH; i+= 10){
				ctx.fillStyle = '#202020'
				ctx.fillRect(this.x + 40, this.y + i, 20, 9);
				ctx.fillStyle = '#101010'
				ctx.fillRect(this.x + 45, this.y + i + 2, 10, 5);
			}

			ctx.globalAlpha = 1;
			
			this.lifter.y = this.ty;
			this.lifter.x = this.tx
	
			this.lifter.draw();
			this.blocker.y = this.ty + 30
			this.blocker.setHeight(this.y + this.maxH - this.ty);
			
			this.speed = 3;
			
			if (this.ty < this.gy) {
				this.ty+=this.speed;
				this.light.y+=this.speed
				this.light2.ly+=this.speed
				this.light.draw();
			}else if(this.ty > this.gy) {
				this.ty-=this.speed;
				this.light.y-=this.speed
				this.light2.ly-=this.speed
				this.light.draw();
			}else this.light2.draw();
			
			if(Math.abs(this.ty - this.gy) < this.speed) this.ty = this.gy
			
			if(this.inUse) ctx.fillText(this.instructions, this.tx + 100 - ctx.measureText(this.instructions).width/2, this.ty - 150);
				
			
			if(this.ty < this.y + this.maxH - 10){//Evelator in full swing
				ctx.drawImage(wallFeatures[1], this.x - 10, this.y + this.maxH - 100);
				ctx.drawImage(wallFeatures[2], this.x + 10, this.y + this.maxH - 100);
			}else if(this.ty < this.y + this.maxH){//animate!
				ctx.drawImage(wallFeatures[1], this.x - 10, this.y + this.maxH - 100 * (this.y + this.maxH - this.ty)/10, 100, 100 * (this.y + this.maxH - this.ty)/10);
				ctx.drawImage(wallFeatures[2], this.x + 10, this.y + this.maxH - 100 * (this.y + this.maxH - this.ty)/10, 100, 100 * (this.y + this.maxH - this.ty)/10);
			}
			
		
			ctx.drawImage(wallFeatures[4], this.tx + 25, this.ty - 120);
			
			
		}
		this.draw2 = function(){
			ctx.drawImage(wallFeatures[0], this.tx, this.ty - 100);
			ctx.drawImage(wallFeatures[2], this.tx, this.ty - 100);
			ctx.drawImage(wallFeatures[1], this.tx, this.ty - 100);
			ctx.drawImage(wallFeatures[0], this.tx, this.ty - 200);
			ctx.drawImage(wallFeatures[2], this.tx, this.ty - 200);
			ctx.drawImage(wallFeatures[1], this.tx, this.ty - 200);
		}
		this.playerOn = function(){
			return ((creature[cS].x + creature[cS].hitBox.x + creature[cS].hitBox.width/2) - this.tx - 50) < 30 && (creature[cS].y + creature[cS].hitBox.y + creature[cS].hitBox.height - this.ty < 10);
		}
		
	
	}
	
	
	function CargoElevator(a,b,c,d){
		this.wallInd = wall.length
		this.blockInd = wall.length + 1;
		this.lights = []
		this.lights.push(new BigLamp(a + 60,b - c -200));
		//this.lights.push(new staticLight(a,b - c -200,20));
		//this.lights.push(new staticLight(a + 100,b - c -200,20));
		//this.lights.push(new staticLight(a + 200,b - c -200,20));
		this.light1 = new UpLamp(a + 95,b - 20 - c)
		this.light2 = new wordTicker(a + 50, b - 150 - c, "Test");
		
		this.panels = []
		this.panels.push(new Panel(a,b - 200 - c, panelHall[1], 0, 0.2))
		this.panels.push(new Panel(a + 100,b - 200 - c, panelHall[1], 0, 0.2))
		this.panels.push(new Panel(a,b - 100 - c, panelHall[0], 2, 0.2))
		this.panels.push(new Panel(a + 100,b - 100 -c , panelHall[0], 2, 0.2))
		this.x = a;
		this.y = b - d;
		this.tx = a;
		this.ty = b - c;
		this.gx = a
		this.gy = b - c;
		this.speed = 3
		this.maxH = d
		this.maxW = 0
		this.lifter = createWall(a,b-c, 100,30, floor[3])
		this.lifter2 = createWall(a + 100,b-c, 100,30, floor[3])
		this.blocker = createWall(a,b-c, 200,100, panelHall[0])
		this.initialize = function(){
			
			wall.push(this.lifter);
			
			wall.push(this.lifter2);
			this.blocker.setHeight(100);
			wall.push(this.blocker);
			
			this.blocker.draw = function(){
				//ctx.fillStyle = 'red'
				//ctx.fillRect(this.x,this.y, this.width,this.height)
			}
			
			this.blocker.setWidth(230)
			this.blocker.x = this.tx - 15
		}
		this.goDown = function(){
			if(this.gy + 10 <= this.y + this.maxH) this.gy += 10
		}
		this.goUp = function(){
			if(this.gy - 10 >= this.y) this.gy -= 10
			//this.ty -= 10
		}
		this.instructions = "UP/DOWN"
		this.remove = function(){
			wall.splice(this.wallInd,3);
		}
		this.inUse = false;
		this.draw = function(){
			//Force Creatures into a safe position
			if(this.ty != this.gy){
				for(var i =0; i < creature.length; i++){
					if(Math.abs(creature[i].x + 100 - this.tx - 100) < 120 && Math.abs(creature[i].y + 200 - this.ty) < 20 ) {
						creature[i].x = this.tx - 30 + i * 10;
						creature[i].y = this.ty - 200;
					}
				}
			}
			
			ctx.globalAlpha = 0.8
			for(var i=0; i < this.maxH; i+= 10){
				ctx.fillStyle = '#202020'
				ctx.fillRect(this.x + 40, this.y + i, 20, 9);
				ctx.fillRect(this.x + 140, this.y + i, 20, 9);
				ctx.fillStyle = '#101010'
				ctx.fillRect(this.x + 45, this.y + i + 2, 10, 5);
				ctx.fillRect(this.x + 145, this.y + i + 2, 10, 5);
			}

			ctx.globalAlpha = 1;
			for(var i=0; i < this.panels.length; i++) this.panels[i].draw();
			
			this.light2.draw()
			
			
			this.lifter.y = this.ty;
			this.lifter.x = this.tx
			this.lifter2.y = this.ty;
			this.lifter2.x = this.tx + 100
			
			this.blocker.y = this.ty + 30
			this.blocker.setHeight(this.y + this.maxH - this.ty);
			
			if (this.ty < this.gy) {
				this.ty+=this.speed;
				this.light1.ly+=this.speed;
				this.light2.y+=this.speed;
				for(var i=0; i < this.lights.length; i++) this.lights[i].ly+=this.speed;
				for(var i=0; i < this.panels.length; i++) this.panels[i].y+=this.speed
				this.light2.message = "DOWN"
			}else if(this.ty > this.gy) {
				this.ty-=this.speed;
				this.light1.ly-=this.speed;
				this.light2.y-=this.speed;
				for(var i=0; i < this.lights.length; i++) this.lights[i].ly-=this.speed;
				for(var i=0; i < this.panels.length; i++) this.panels[i].y-=this.speed
				this.light2.message = "UP"
			}else this.light2.message = "STOP"
			
			if(Math.abs(this.ty - this.gy) < this.speed) this.ty = this.gy
			
			
			if(this.inUse) {
				ctx.fillText(this.instructions, this.tx + 100 - ctx.measureText(this.instructions).width/2, this.ty - 150);
				//this.light1.draw()
				//for(var i=0; i < this.lights.length; i++) this.lights[i].draw();
				this.lights[0].on = true
			}else this.lights[0].on = false
			
		
			for(var i=0; i < this.lights.length; i++) this.lights[i].draw()
			
			if(this.ty < this.y + this.maxH - 10){
				ctx.drawImage(wallFeatures[1], this.x - 10, this.y + this.maxH - 100);
				ctx.drawImage(wallFeatures[2], this.x + 110, this.y + this.maxH - 100);
			}else if(this.ty < this.y + this.maxH){//animate!
				ctx.drawImage(wallFeatures[1], this.x - 10, this.y + this.maxH - 100 * (this.y + this.maxH - this.ty)/10, 100, 100 * (this.y + this.maxH - this.ty)/10);
				ctx.drawImage(wallFeatures[2], this.x + 110, this.y + this.maxH - 100 * (this.y + this.maxH - this.ty)/10, 100, 100 * (this.y + this.maxH - this.ty)/10);
			}

			ctx.drawImage(wallFeatures[4], this.tx + 75, this.ty - 120);
		
		}
		this.draw2 = function(){
			ctx.drawImage(wallFeatures[0], this.tx, this.ty - 100);
			ctx.drawImage(wallFeatures[0], this.tx + 100, this.ty - 100);
			ctx.drawImage(wallFeatures[2], this.tx + 100, this.ty - 100);
			ctx.drawImage(wallFeatures[1], this.tx, this.ty - 100);
			ctx.drawImage(wallFeatures[0], this.tx, this.ty - 200);
			ctx.drawImage(wallFeatures[0], this.tx + 100, this.ty - 200);
			ctx.drawImage(wallFeatures[2], this.tx + 100, this.ty - 200);
			ctx.drawImage(wallFeatures[1], this.tx, this.ty - 200);
		}
		this.playerOn = function(){
			return Math.abs((creature[cS].x + creature[cS].hitBox.x + creature[cS].hitBox.width/2) - this.tx - 100) < 80 && Math.abs(creature[cS].y + creature[cS].hitBox.y + creature[cS].hitBox.height - this.ty) < 10;
		}
		
	
	}
	
	
	////////////////////////////////
	///////		Animated Items
	/////
	function fan(a,b,s, l, g){
		this.x = a
		this.y = b
		this.grate = g
		this.speed = s
		this.lit = l
		this.angle = 0;
		this.draw = function(){
			if(this.lit == 0){ //unlit
				ctx.fillStyle = 'black'
				ctx.beginPath()
				ctx.arc(this.x + 30,this.y+30, 30, 0, Math.PI *2);
				ctx.fill()
				ctx.closePath;
				
				ctx.translate(this.x + 30,this.y + 30);
				ctx.rotate(this.angle);
				ctx.drawImage(fanBlades2, -30, -30);
				ctx.rotate(-this.angle);
				ctx.translate(-this.x - 30, -this.y - 30);
			
				if(this.grate == 0) ctx.drawImage(fanFrame, this.x, this.y);
				else ctx.drawImage(fanFrame2, this.x, this.y);
			}else{ //lit fan!
				ctx.fillStyle = 'white'
				ctx.beginPath()
				ctx.arc(this.x + 30,this.y+30, 30, 0, Math.PI *2);
				ctx.fill()
				ctx.closePath;
				
				ctx.translate(this.x + 30,this.y + 30);
				ctx.rotate(this.angle);
				ctx.drawImage(fanBlades, -30, -30);
				ctx.rotate(-this.angle);
				ctx.translate(-this.x - 30, -this.y - 30);
			
				if(this.grate == 0) {
					ctx.drawImage(fanFrame, this.x, this.y);
					//lightRegion(this.x+30,this.y+30, 3, 1);
					
					//lightRegion(this.x+30, this.y + 130, Math.floor(5*Math.sin(this.angle) + 2.5), 1);
					for(var i= 30; i < 90; i+= 30){
					lightRegion(this.x + 30 + i*Math.cos(this.angle+0.5+Math.PI/1.5), this.y + i*Math.sin(this.angle + 0.5 + Math.PI/1.5) + 30, i/10, 15/i);
					lightRegion(this.x + 30 + i*Math.cos(this.angle+0.5+2*Math.PI/1.5), this.y + i*Math.sin(this.angle + 0.5 + 2*Math.PI/1.5) + 30, i/10, 15/i);
					lightRegion(this.x + 30 + i*Math.cos(this.angle+0.5+3*Math.PI/1.5), this.y + i*Math.sin(this.angle + 0.5 + 3*Math.PI/1.5) + 30, i/10, 15/i);
					}
				}else {
					ctx.drawImage(fanFrame3, this.x, this.y);
					lightRegion(this.x+30,this.y+30, 5, 0.5);
					for(var i= 20; i < 50; i+= 20){
					lightRegion(this.x + 30 + i*Math.cos(this.angle+0.5+Math.PI/1.5), this.y + i*Math.sin(this.angle + 0.5 + Math.PI/1.5) + 30, i/10, 10/i);
					lightRegion(this.x + 30 + i*Math.cos(this.angle+0.5+2*Math.PI/1.5), this.y + i*Math.sin(this.angle + 0.5 + 2*Math.PI/1.5) + 30, i/10, 10/i);
					lightRegion(this.x + 30 + i*Math.cos(this.angle+0.5+3*Math.PI/1.5), this.y + i*Math.sin(this.angle + 0.5 + 3*Math.PI/1.5) + 30, i/10, 10/i);
					}
				}
				//ctx.fillStyle = 'red'
				//ctx.fillRect(this.x + 30 + 30*Math.cos(this.angle+0.5+Math.PI/1.5), this.y + 30*Math.sin(this.angle +0.5 + Math.PI/1.5) + 30,10,10)
				//ctx.fillRect(this.x + 30 + 30*Math.cos(this.angle+1+3*Math.PI/1.5), this.y + 30*Math.sin(this.angle + 1+ 3*Math.PI/1.5) + 30,10,10)
				//ctx.fillRect(this.x + 30 + 30*Math.cos(this.angle+1+2*Math.PI/1.5), this.y + 30*Math.sin(this.angle + 1 + 2*Math.PI/1.5) + 30,10,10)
			
			}
			
			
			
			
		
			this.angle -= this.speed;
			if(this.angle < 0) this.angle = 2*Math.PI
		}
	
	}
	
	
	
	function AniDoor(a,b, inter, l){
		this.x = a;
		this.y = b;
		this.functional = inter==0;
		this.lit = l == 1
		this.opening = false;
		this.doorx = 0
		this.speed = 5;
		this.sound = null
		this.temp = -1;
		if(!this.functional){
			this.spark1 = new sparker(this.x + 45,this.y + 60)
			this.spark2 = new sparker(this.x + 45,this.y + 180)
			this.edge = 30 + rand(30);
		}
		
		this.draw = function(){			
			
			
			if(this.doorx < 0) this.doorx = 0
			else if(this.doorx > 100) this.doorx = 100
			//ctx.drawImage(doorHatch, this.x, this.y);
			//ctx.globalAlpha = 0.2
			if(this.lit)ctx.fillStyle = 'white'
			else ctx.fillStyle = 'black'
			
			ctx.fillRect(this.x + 50,this.y + 40, 100,160);
			ctx.drawImage(doorHatch, this.doorx + 50,0, 200 - this.doorx,200, this.x + 50, this.y, 200-this.doorx,200);
			
			if(this.doorx <= 90){
				//left edge
				ctx.fillStyle = 'black'
				ctx.globalAlpha = 0.6
				ctx.fillRect(this.x+50, this.y+40, 15, 160);
				ctx.globalAlpha = 1;
			}
			//ctx.fillRect(this.x + 60, this.y + 40,70-70*(this.doorx/70), 10)//attempt at top shadow
			
			
			ctx.drawImage(doorFrame, this.x, this.y);
			
			//Door sound control
			this.distance = dist(this.x, this.y, -ctxOx + w/2, -ctxOy + h/2)
				if(this.distance < 400) {
					if(this.sound == null){
						this.temp = getSound(doorSound)
						if(this.temp != -1) {
							this.sound = doorSound[this.temp]
							this.sound.claimed = true
						}
					}
				}else {
					if(this.sound != null){
						this.sound.stop();
						this.sound.claimed = false;
						this.sound = null
					}
				}
			
			
			
			
			//Door control
			
			if(this.functional) {
				this.opening = dist(mx - ctxOx,my - ctxOy, this.x+100, this.y+100) < 70;
				
				if((this.opening && this.doorx < 90) || (!this.opening && this.doorx <98 && this.doorx > 10)){ 
					if(this.sound!= null /*&& this.oldOpening != this.opening && (this.doorx == 0 || this.doorx > 90)*/){
						this.sound.play();
						this.sound.setVolume (1- this.distance / 400); //has a 50% drop in volume
						if(this.sound.soundVar.currentTime > this.sound.soundVar.duration - 0.5) this.sound.soundVar.currentTime = 0.1
					}
				}
				
			
			}
			if(this.opening){
				this.doorx+=this.speed
				if(this.doorx >= 100) this.opening = false;
				roundLight(this.x + 170,this.y + 110,10, 1.5)
			}else{
			
				this.doorx-=this.speed
				//if(this.doorx <=0) this.opening = true;
			}

			if(this.lit){
				if(this.doorx > 20){
					lightRegion(this.x + 100,this.y+100, 5 + Math.floor(this.doorx/100 * 7), 1);
				}else{
					lightRegion(this.x + 100,this.y+80, 4, 0.8);
					lightRegion(this.x + 100,this.y+155, 4, 0.8);
				}
			}
			
			if(!this.functional){
				this.speed = rand(5)
				this.spark1.draw();
				this.spark2.draw();
				if(Math.random() > 0.9){
					//this.opening = !this.opening;
				}
				if(this.doorx > this.edge) this.opening = false;
				else if(this.doorx < 10) this.opening = true
			}
			

		}
	
	
	}
	
	
	/////////////////////////////
	/////	Noise Makers
	
	function talker(a,b, themessage, v){
		
		this.x = a
		this.y = b
		this.words = themessage
		this.draw = function(){
			this.distance = dist(this.x, this.y, -ctxOx + w/2, -ctxOy + h/2)
			if(!talking && this.distance < 100){
				msg.volume = (1-(this.distance / 200))/2
				speak(this.words);
				talking = true
			}else if(this.distance < 100){	
				msg.volume = (1-(this.distance / 200))/2
				console.log(msg.volume)
			}
		
		}
	}
	
	function Alarm(a,b){
		this.x = a;
		this.y = b;
		this.sound = null;
		this.temp = -1;
		this.words = "Proceed to nearest safe zone."
		this.draw = function(){
			ctx.drawImage(wallFeatures[16], this.x,this.y)
			
			this.distance = dist(this.x, this.y, -ctxOx + w/2, -ctxOy + h/2)
			
			if(this.distance < 500) {
				if(this.sound == null){
					this.temp = getSound(alarmSound)
					if(this.temp != -1) {
						this.sound = alarmSound[this.temp]
						this.sound.claimed = true
					}
				}
				if(this.sound!= null){
					this.sound.play();
					this.sound.setVolume (1- this.distance / 500); //has a 50% drop in volume
					if(this.sound.soundVar.currentTime > this.sound.soundVar.duration - 0.5) this.sound.soundVar.currentTime = 0.1
				}
			}else {
				if(this.sound != null){
					this.sound.stop();
					this.sound.claimed = false;
					this.sound = null
				}
			}
		
		}
	
	}
	
	
	///////////////////////
	////	LIGHTING CONSTRUCTORS
	
	function BigLamp(a,b){
		this.lx = a
		this.ly = b
		this.on = true
		this.distance = 0
		this.temp = -1;
		this.sound = null// florSound[rand(florSound.length)]
		this.temp = -1
		this.draw = function(){
			if(this.on){
				ctx.drawImage(biglampLit, this.lx,this.ly);
				lightRegion(this.lx + 40, this.ly + 100, 12, 1.5);
				
				this.distance = dist(this.lx, this.ly, -ctxOx + w/2, -ctxOy + h/2)
				if(this.distance < 400) {
					if(this.sound == null){
						this.temp = getSound(florSound)
						if(this.temp != -1) {
							this.sound = florSound[this.temp]
							this.sound.claimed = true
						}
					}
					if(this.sound!= null){
						this.sound.play();
						this.sound.setVolume (1- this.distance / 400); //has a 50% drop in volume
						if(this.sound.soundVar.currentTime > this.sound.soundVar.duration - 0.5) this.sound.soundVar.currentTime = 0.1
					}
				}else {
					if(this.sound != null){
						this.sound.stop();
						this.sound.claimed = false;
						this.sound = null
					}
				}
			}else {
				ctx.drawImage(biglampOut, this.lx,this.ly);
				if(this.sound != null){
					this.sound.claimed = false
					this.sound.stop()
					this.sound = null
				}
			}
		}
	}
	
	function BigLampFlicker(a,b){
		this.lx = a
		this.ly = b
		this.on = true
		this.sound = null//florSound[rand(florSound.length)]
		this.distance = 0
		this.draw = function(){
			if(rand(65) == 1) this.on = !this.on;
			if(this.on){
				ctx.drawImage(biglampLit, this.lx,this.ly);
				lightRegion(this.lx + 40, this.ly + 100, 12, 1.5);
				this.distance = dist(this.lx, this.ly, -ctxOx + w/2, -ctxOy + h/2)
				this.distance = dist(this.lx, this.ly, -ctxOx + w/2, -ctxOy + h/2)
				if(this.distance < 400) {
					if(this.sound == null){
						this.temp = getSound(florSound)
						if(this.temp != -1) {
							this.sound = florSound[this.temp]
							this.sound.claimed = true
						}
					}
					if(this.sound!= null){
						this.sound.play();
						this.sound.setVolume (1- this.distance / 400); //has a 50% drop in volume
						if(this.sound.soundVar.currentTime > this.sound.soundVar.duration - 0.5) this.sound.soundVar.currentTime = 0.1
					}
				}else {
					if(this.sound != null){
						this.sound.stop();
						this.sound.claimed = false;
						this.sound = null
					}
				}
				
			}else {
				ctx.drawImage(biglampOut, this.lx,this.ly);
				if(this.sound != null) {
					this.sound.stop();
					this.sound.claimed = false;
				}
			}
		}
	}
	
	function BigLampDead(a,b){
		this.lx = a
		this.ly = b
		this.draw = function(){
			ctx.drawImage(biglampOut, this.lx,this.ly);
		}
	}

	function Server(a,b, o, op2){
		this.x = a
		this.y = b
		
		if(o == 0){
			this.draw = function(){
				ctx.drawImage(wallFeatures[30], this.x,this.y)
			}
		
		}else{
			this.draw = function(){
				ctx.drawImage(wallFeatures[30], this.x,this.y)
				fuzz2(this.x + 35, this.y + 5, 30,65); 
			}
		
		}
	
	
	}
	
	function Monitor(a,b, m, op2){//opt2 is so far completely unused
		this.x = a
		this.y = b
		this.message = []
		this.ani = 0
		this.maxAni = 20 + rand(10);
		this.on = true
		this.mIndex = 0;
		this.multiLine = false;
		this.cycler = 0
		var temp = ""
		var i=0;
		while(i < m.length){
			if(m[i] != ' '){
				temp += m[i];
			}else{
				this.message.push(temp);
				temp = ""
			}
			i++;
		}
		this.message.push(temp);
		
		if(this.message.length > 3) this.multiLine = true;
		this.draw = function(){
			ctx.drawImage(wallFeatures[24], this.x, this.y);
			ctx.font= '4pt wallFont'
			ctx.fillStyle = 'white'
			
			this.ani++
			if(this.ani > this.maxAni){
				this.on = !this.on
				this.ani = 0
			}
			
			if(this.message[0].length == 0 || !this.on) {
				fuzz(this.x + 20, this.y + 20, 60,33); 
				if(Math.random() < 0.2) this.on = true
			}else if(this.on){
				if(this.message.length > 5){
					for(var i = 0; i < 5; i++) ctx.fillText(this.message[i + this.mIndex], this.x + 50 - ctx.measureText(this.message[i + this.mIndex]).width/2, this.y + 25 + i*6);
					this.cycler++
					if(this.cycler > 5) {
						this.mIndex++
						this.cycler = 0;
					}
					if(this.mIndex >= this.message.length-5) this.mIndex = 0;
				}else for(var i = 0; i < this.message.length; i++) ctx.fillText(this.message[i], this.x + 50 - ctx.measureText(this.message[i]).width/2, this.y + 25 + i*6);
			}
			fuzz(this.x + 15, this.y + 70, 22,12); 
			
			//Lighting
			lightRegion(this.x + 45, this.y +45, 5, 0.7);
		}
	
	}
	
	function fuzz(x,y,w,h){
		ctx.fillStyle = 'white'
		for(var i=x; i < x+w; i+= 2){
			for(var j = y; j < y + h; j+=2){
				ctx.globalAlpha = Math.random();
				if(Math.random() < 0.3) ctx.fillRect(i,j,2,2);
			}
		}
		ctx.globalAlpha = 1;
	}
	
	function fuzz2(x,y,w,h){
		ctx.fillStyle = 'white'
		for(var i=x; i < x+w; i+= 2){
			for(var j = y; j < y + h; j+=2){
				ctx.globalAlpha = Math.random();
				if(Math.random() < 0.05) ctx.fillRect(i,j,2,2);
			}
		}
		ctx.globalAlpha = 1;
	}
	
	function Lamp(a,b){
		this.sL = new staticLight(a+5,b+10,20)
		this.aL = new angledLight(a+5,b+10,150, 90)
		this.lx = a
		this.ly = b
		this.draw = function(){
			ctx.drawImage(lampLit, this.lx,this.ly);
			this.sL.draw();
			this.aL.draw();
			lightRegion(this.lx,this.ly, 8, 0.2);
			lightRegion(this.lx, this.ly + 130, 12, 0.2);	
		}
	}
	
	function UpLamp(a,b){
		this.sL = new staticLight(a+5,b+10,20)
		this.aL = new angledLight(a+5,b+10,150, -90)
		this.lx = a
		this.ly = b
		this.draw = function(){
			ctx.drawImage(lampLit, this.lx,this.ly);
			this.sL.draw();
			this.aL.draw();
			lightRegion(this.lx,this.ly, 8, 0.2);
			lightRegion(this.lx, this.ly - 130, 12, 0.2);	
		}
	}
	
	function GenLight(a,b,c,d){
		this.lx = a
		this.ly = b
		this.rad = c
		this.intensity = d
		this.draw = function(){
			lightRegion(this.lx,this.ly, this.rad, this.intensity);
		}
	}
	
	function deadLamp(a,b){
		this.lx = a
		this.ly = b
		this.draw = function(){
			ctx.drawImage(lampOut, this.lx,this.ly);
		}
	}
	
	function glowLamp(a,b){
		this.lx = a
		this.ly = b
		this.on = true
		this.draw = function(){
			if(this.on){
				ctx.drawImage(lampLit, this.lx,this.ly);
				lightRegion(this.lx,this.ly, 8,0.2);
			}else ctx.drawImage(lampOut, this.lx,this.ly);
		}
	}
	
	
	function FlickerLamp(a,b){
		this.sL = new staticLight(a+5,b+10,20);
		this.aL = new angledLight(a+5,b+10,150, 90);
		this.lx = a;
		this.ly = b;
		this.gX = Math.floor(a/100);
		this.gY = Math.floor(b/100);
		this.on = true;
		this.distance = 0;
		this.sound = null;//flickerSound[rand(flickerSound.length)]
		this.temp = -1;
		this.draw = function(){
			if(this.on){
				ctx.drawImage(lampLit, this.lx,this.ly);
				this.sL.draw();
				this.aL.draw();

				lightRegion(this.lx,this.ly, 8, 0.2);
				lightRegion(this.lx,this.ly + 100, 12, 0.2);
				for(var i=1; i < 5; i++) lightRegion(this.lx,this.ly + i * lightRes, i, 0.5 * 5/i);
				
				//Sound control
				this.distance = dist(this.lx, this.ly, -ctxOx + w/2, -ctxOy + h/2)
				if(this.distance < 300) {
					if(this.sound == null){
						this.temp = getSound(flickerSound)
						if(this.temp != -1) {
							this.sound = flickerSound[this.temp]
							this.sound.claimed = true
						}
					}
					if(this.sound!= null){
						this.sound.play();
						this.sound.setVolume (1- this.distance / 300); //has a 50% drop in volume
						if(this.sound.soundVar.currentTime > this.sound.soundVar.duration - 0.5) this.sound.soundVar.currentTime = 0.1
					}
				}else {
					if(this.sound != null){
						this.sound.stop();
						this.sound.claimed = false;
						this.sound = null
					}
				}
			}else {
				ctx.drawImage(lampOut, this.lx,this.ly);
				if(this.sound != null){
					this.sound.stop();
					this.sound.claimed = false;
					this.sound = null;
				}
			}
			
			if(Math.random() < 0.5){
				if(Math.random() > 0.5) this.on = !this.on
			}
		}
	}
	
	
	
	
	
	
	function generateForeGround(){
		var start = {x:-100, y: -100};
		var end = {x:w * 2, y:h * 2};
		var cPos = {x:0,y:0};
		var n = 4;
		var dir = 0; //0- UP 1-RIGHT 2-LEFT 3-DOWN
		var seedx = [];
		foreGroundDark = [];
		
		//Assumes a tile size of 100 x 100
		//Vertical seeds for pipe network
		for(var i = 0; i < n; i++) {
			seedx[i] = i * Math.round((start.x-end.x)/n);
		
			cPos = {x:start.x + i * Math.round((end.x-start.x)/n), y: start.y}
			
			while(cPos.y <= end.y && cPos.x >= start.x && cPos.x <= end.x){
			//Never goes back down to make silly loops, thus bottom edge excluded from condition
				if(dir == 0){//Go up
					foreGroundDark.push(new ForeGround(cPos.x,cPos.y, vPipe));
					cPos.y += 100;
				}else if(dir == 1){//Right
					foreGroundDark.push(new ForeGround(cPos.x,cPos.y, hPipe));
					cPos.x += 100;
				}else if(dir == 2){//Left
					foreGroundDark.push(new ForeGround(cPos.x,cPos.y, hPipe));
					cPos.x -= 100;
				}else if(dir == 3){//Down, should never happen
					foreGroundDark.push(new ForeGround(cPos.x,cPos.y, vPipe));
					cPos.y -= 100;
				}
			
			//Direction change
				if(Math.random() < 0.5){
					if(dir == 0){
					//was going upwards
						if(Math.random() < 0.5){//Go left
							foreGroundDark.push(new ForeGround(cPos.x,cPos.y, TLPipe));
							cPos.x -= 100
							dir = 2; 
						}else{ //go right
							foreGroundDark.push(new ForeGround(cPos.x,cPos.y, TRPipe));
							cPos.x += 100
							dir = 1; 
						}
					}else if( dir == 3){
					//was going downwards
						console.log("I wnet down?");
					
					
					}else if( dir == 1){
					//was headed right
						foreGroundDark.push(new ForeGround(cPos.x,cPos.y, BLPipe));
						cPos.y += 100
						dir = 0; //Set tp up
					}else{
						//was headed left
						foreGroundDark.push(new ForeGround(cPos.x,cPos.y, BRPipe));
						cPos.y += 100
						dir = 0; //set to up
					}
				}
			}
		
		}
		
	}
	
	
	
	function ForeGround(a,b,p){
		this.x = a;
		this.y = b;
		this.pic = p;//makePicture(p);
	//parax = 0
	//paray = 0
		this.draw = function(){	
			//ctx.globalAlpha = 0.8
			/*if(this.x + ctxOx - parax > -100 && this.x + ctxOx - parax < w){
				if(this.y + ctxOy - paray > -100 && this.y + ctxOy - paray < h){
					//ctx.drawImage(this.pic, this.x - parax,this.y - paray);
					ctx.drawImage(this.pic, this.x,this.y);
				}
			}*/
			if(this.x + ctxOx > -200 && this.x + ctxOx < w + 200){
				if(this.y + ctxOy > -200 && this.y + ctxOy < h + 200){
					ctx.drawImage(this.pic, this.x,this.y);
				}
			}
			//ctx.globalAlpha =1;
		}
		this.shade = function(){}
	}
	
	
	

	////////////
		function wordWall(a,b,m,s){
		this.x = a
		this.y = b
		this.message = m
		this.size = s
		this.draw = function(){
			ctx.fillStyle = '#202020'
			ctx.globalAlpha = 0.8
			ctx.font = 'bold ' + this.size + 'pt wallFont';
			
			ctx.fillText(this.message, this.x, this.y);
			ctx.globalAlpha = 1;
		}
		this.shade = function(){}
	}
	
	
	function Panel(a,b, p, s, clean){
		this.gX = Math.floor(a/100)
		this.gY = Math.floor(b/100)
		this.x = a;
		this.y = b;
		this.width = p.width;
		this.height = p.height;
		this.pic = p;
		this.shadow = s;
		this.c = clean;
		this.bright = clean
		if(s == 2){
			this.feature = BloodSmear[rand(BloodSmear.length)];
		}else{
			if(Math.random() < 0.5) this.feature = crack[rand(crack.length)];
			else this.feature = GreaseSmear[rand(GreaseSmear.length)];
		
		}
		if(Math.random() < 0.5 || clean > 0.7) this.feature = null
		this.fX = rand(100);
		this.fY = rand(100);
		var t = 255
		this.col = '#' + (Math.floor(t*clean)).toString(16)+ (Math.floor(t*clean)).toString(16)+ (Math.floor(t*clean)).toString(16)
		
		this.draw = function(){
				if(this.x + ctxOx > -200 && this.x + ctxOx < w + 200){
				if(this.y + ctxOy > -200 && this.y + ctxOy < h + 200){
			//Back color
			if(this.c >= 0 && this.c <= 1){
				ctx.fillStyle = this.col
				ctx.fillRect(this.x,this.y, 100, 100);
			}
			ctx.drawImage(this.pic, this.x,this.y);
			if(this.feature != null) ctx.drawImage(this.feature, this.x + this.fX, this.y + this.fY);
			ctx.fillStyle = 'black'
			ctx.globalAlpha = 0.1
			if(this.shadow == 1){
				for(var i=0; i < 10; i++) ctx.fillRect(this.x, this.y, this.pic.width, i*6); 
			}else if(this.shadow == 2){
				for(var i=0; i < 10; i++) ctx.fillRect(this.x, this.y + this.pic.height - i*6, this.pic.width, i*6); 
			}
				
			ctx.globalAlpha = 1;
			
			}
			}
		}
		this.light = 0;
		this.shade = function(){
			ctx.globalAlpha = 1- (this.bright /*+ this.light*/)
			//if(this.bright /*+ this.light*/ > 1) ctx.globalAlpha = 0
			ctx.fillStyle = 'black'
			ctx.fillRect(this.x,this.y, 100,100)
			ctx.globalAlpha = 1;
			this.light = 0; //Reset lighting effect
		}
	}
	
	
	
	
	
	
	function loadObjects(){
		numObjectsLoaded++;
	}
	function addSound(path, loop){
		var sv = new Audio(path);
		
		numObjects++;
	
		sv.addEventListener('canplaythrough', loadObjects, false);
		if(loop){
		sv.addEventListener('ended', function (){
			this.currentTime = 0;
			this.play();
			}, false);
		}else{
			sv.addEventListener('ended', function (){
				this.currentTime = 0;
				this.pause();
			}, false);
		
		}
		var result = {
			soundVar:sv,
			claimed:false,
			play:function(){
				this.soundVar.play();
			},
			pause:function(){this.soundVar.pause();},
			setVolume:function(v){this.soundVar.volume = v;},
			stop:function(){
				this.soundVar.pause();
				this.soundVar.currentTime = 0;
				this.claimed = false;
			}
		}
		return result;
	}
	
	function makePicture(path){
		var newPic = new Image();
		newPic.src= path;
		newPic.onload = loadObjects;
		numObjects++;
		return newPic;
	}
	

	/////////////////////////////////
	////////////////////////////////
	////////	GAME INIT
	///////	Runs this code right away, as soon as the page loads.
	//////	Use this code to get everything in order before your game starts 
	//////////////////////////////
	/////////////////////////////
	function init()
	{
		
		
	//////////
	///STATE VARIABLES
	loadMainMenu();
	//////////////////////
	///GAME ENGINE START
	//	This starts your game/program
	//	"paint is the piece of code that runs over and over again, so put all the stuff you want to draw in here
	//	"60" sets how fast things should go
	//	Once you choose a good speed for your program, you will never need to update this file ever again.

	if(typeof game_loop != "undefined") clearInterval(game_loop);
		game_loop = setInterval(paint, 60); //old value 130
	}

	init();	
	

	function drawPromptBox(){
		var x = w/2-300
		var y = h/2 - 160
		ctx.fillStyle = '#202020'
		ctx.fillRect(x,y, 600,300);
		
		//ctx.drawImage(floor[3], x,y);
		
		/*ctx.drawImage(wallFeatures[12], x - 50,y);
		ctx.drawImage(wallFeatures[12], x - 50,y+100);
		ctx.drawImage(wallFeatures[12], x - 50,y+200);
		
		ctx.drawImage(wallFeatures[12], x + 550,y);
		ctx.drawImage(wallFeatures[12], x + 550,y+100);
		ctx.drawImage(wallFeatures[12], x + 550,y+200);*/
		
		ctx.drawImage(pipes[0], x-50,y-50);
		ctx.drawImage(pipes[1], x + 550,y-50);
		ctx.drawImage(wallFeatures[12], x - 50,y+50);
		ctx.drawImage(wallFeatures[12], x - 50,y+150);
		ctx.drawImage(pipes[3], x - 50,y+250);
		
		ctx.drawImage(wallFeatures[12], x + 550,y+50);
		ctx.drawImage(wallFeatures[12], x + 550,y+150);
		ctx.drawImage(pipes[2], x + 550,y+250);
		
		ctx.drawImage(pipes[4], x + 50, y - 50)
		ctx.drawImage(pipes[4], x + 150, y - 50)
		ctx.drawImage(pipes[4], x + 250, y - 50)
		ctx.drawImage(pipes[4], x + 350, y - 50)
		ctx.drawImage(pipes[4], x + 450, y - 50)
		
		ctx.drawImage(pipes[4], x + 50, y + 250)
		ctx.drawImage(pipes[4], x + 150, y + 250)
		ctx.drawImage(pipes[4], x + 250, y + 250)
		ctx.drawImage(pipes[4], x + 350, y + 250)
		ctx.drawImage(pipes[4], x + 450, y + 250)
	}
	
	
	
	///////////////////////////////////////////////////////
	//////////////////////////////////////////////////////
	////////	Main Game Engine
	////////////////////////////////////////////////////
	///////////////////////////////////////////////////
	function paint()
	{
		
		ctx.fillStyle = 'black';
		ctx.fillRect(0,0, w, h);	
		
		
	//	parax = (creature[0].x - w/2)*0.1 + ctxOx*5
	//	paray = (creature[0].y - h/2)*0.1 + ctxOy*5
		if(screen == 0){
		//Splash screen
			ctx.fillStyle = 'red'
			ctx.fillRect(200,200, 200, 20);
		
			if(numObjectsLoaded >= numObjects) screen = 1;
		}else if(screen == 1){
		//Main menu
			for(var i = 0; i < wallPanels.length; i++) wallPanels[i].draw();
		for(var i = 0; i < wall.length; i++) wall[i].draw();
		for(var i = 0; i < creature.length; i++) creature[i].draw();
		
		
		for(var i = 0; i < lamps.length; i++) lamps[i].draw()//ctx.drawImage(lampLit, lamps[i].x, lamps[i].y);
		for(var i=0; i < rLights.length; i++)rLights[i].draw();
		for(var i=0; i < dLights.length; i++)dLights[i].draw();
		for(var i=0; i < pulseLights.length; i++)pulseLights[i].draw();
		
		
			for(var i=0; i < mainMenuButtons.length; i++) mainMenuButtons[i].draw();
			
			lightRegion(mx,my, 10, 0.5);
			shade();
		
		if(prompting){
			drawPromptBox();
			ctx.font = '15pt wallFont'
			ctx.fillStyle = 'white'
			if(promptAni < 100) promptAni++
			
			textBox(promptTitle[promptIndex], w/2 - ctx.measureText(promptTitle[promptIndex]).width/2, h/2 - 120, 380);
			ctx.font = '8pt wallFont'
			textBox(promptMessage[promptIndex].slice(0,Math.floor(promptAni/100*promptMessage[promptIndex].length)), w/2 -  280, h/2 - 90, 540);
		
			OKButton.draw();
		}
		}else if(screen == 2){
		//Instructions
		
		}else if(screen == 3){
		//Options
		
		}else if(screen == 4){
		//cutscenes
			
			ctx.save();
		ctx.translate(ctxOx, ctxOy);	
			cutscene[scene].draw();
			cutscene[scene].frame++;
		
		
				//Level
		for(var i = 0; i < wallPanels.length; i++) wallPanels[i].draw();
		for(var i = 0; i < wall.length; i++) wall[i].draw();
		for(var i = 0; i < creature.length; i++) creature[i].draw();
		
		
		for(var i = 0; i < lamps.length; i++) lamps[i].draw()//ctx.drawImage(lampLit, lamps[i].x, lamps[i].y);
		for(var i=0; i < rLights.length; i++)rLights[i].draw();
		for(var i=0; i < dLights.length; i++)dLights[i].draw();
		for(var i=0; i < pulseLights.length; i++)pulseLights[i].draw();
		//for(var i=0; i < items.length; i++)items[i].draw();
		ctx.fillStyle = 'white'
		
		//Draw Foreground
		for(var i = 0; i < foreGround.length; i++) foreGround[i].draw();
		ctx.globalAlpha = 0.8;
		if(cutscene[scene].darkForeground) for(var i = 0; i < foreGroundDark.length; i++) foreGroundDark[i].draw();
		ctx.globalAlpha =1;
		
		//for(var i = 0; i < wallPanels.length; i++) wallPanels[i].shade();
		for(var i = 0; i < creature.length; i++) creature[i].sayWords();
		//Bullet Sparks
		for(var i=0; i < sparks.length;i++) sparks[i].draw();
		for(var i=0; i < sparks.length;i++){
			if(sparks[i].f > 2){
				sparks.splice(i,1);
				i--;
			}
		}
		
		//Blood Splatters
		for(var i=0; i < bloodSplat.length;i++) bloodSplat[i].draw();
		for(var i=0; i < bloodSplat.length;i++){
			if(bloodSplat[i].f > 2){
				bloodSplat.splice(i,1);
				i--;
			}
		}
		
		ctx.restore();
		
		if(cutscene[scene].shaded) shade();
			if(cutscene[scene].frame < 10){
				ctx.globalAlpha = 0.1 * (10 - cutscene[scene].frame)
				ctx.fillStyle = 'black'
				ctx.fillRect(0,0,w,h);
				ctx.globalAlpha = 1;
			}
			
			if(cutscene[scene].frame >= cutscene[scene].endFrame - 10){
				ctx.globalAlpha = 1-(0.1 * (cutscene[scene].endFrame - cutscene[scene].frame))
				ctx.fillStyle = 'black'
				ctx.fillRect(0,0,w,h);
				ctx.globalAlpha = 1;
			}
			ctx.fillStyle = 'white'
			ctx.fillText(cutscene[scene].frame + " " + cutscene[scene].endFrame, 100, 60);
		
			if(cutscene[scene].frame >= cutscene[scene].endFrame) {
				screen = 5;
				cutscene[scene].endScene();
			}
			
		}else if(screen == 5){
		parax = ctxOx*0.5
		paray = ctxOy*0.5
		ctx.save();
		
		/*
		if(mx > w - 20) ctxOx-= pans;
		else if (mx < 20)ctxOx += pans;
		
		if(my > h - 20) ctxOy-= pans;
		else if (my < 20)ctxOy += pans;
		*/
		
		if(!mDown){
			dPx = creature[cS].x + 100 + ctxOx - w/2;
			dPy = creature[cS].y + 100 + ctxOy - h/2;
			if(dPx < -10){
				ctxOx += pans - dPx/10
			}else if(dPx > 10)	ctxOx -= pans + dPx/10
	
			if(dPy < -10){
				ctxOy += pans - dPy/10
			}else if(dPy > 10)	ctxOy -= pans + dPy/10
	
		}	
		if(ctxOx > 0) ctxOx = 0
		if(ctxOy > 0) ctxOy = 0
		if(ctxOx < w * -1) ctxOx = w * -1
		if(ctxOy < h * -1) ctxOy = h * -1
		
		ctx.translate(ctxOx, ctxOy);
		
		for(var i=0; i < creature.length; i++) if(i != cS && creature[i].stats.health >0)creature[i].move();
		
		//Level
		for(var i = 0; i < wallPanels.length; i++) wallPanels[i].draw();
		for(var i = 0; i < elevators.length; i++) {
			elevators[i].inUse= elevators[i].playerOn();
			elevators[i].draw();
		}
		for(var i = 0; i < wall.length; i++) wall[i].draw();
		for(var i = 0; i < creature.length; i++) if(creature[i].deathF != 10 && !prompting){
			creature[i].draw();	
			}else{//Creature is done death sequence
				if(creature[i].stats.health <= 0){
				if(i == cS){
					ctx.fillText("Game Over!", 100 - ctxOx,100 - ctxOy)
				}else{
					creature[i].die();
				}
				}
			}
		for(var i = 0; i < elevators.length; i++) elevators[i].draw2();
		
		for(var i = 0; i < lamps.length; i++) lamps[i].draw()//ctx.drawImage(lampLit, lamps[i].x, lamps[i].y);
		for(var i=0; i < rLights.length; i++)rLights[i].draw();
		for(var i=0; i < dLights.length; i++)dLights[i].draw();
		for(var i=0; i < pulseLights.length; i++)pulseLights[i].draw();
		
		for(var i=0; i < items.length; i++)items[i].draw();
		//Draw Foreground
		for(var i = 0; i < foreGround.length; i++) foreGround[i].draw();
		
		//lightArea(creature[cS].x + 100, creature[cS].y+ 100, 3, 0.08);
		//lightArea(creature[cS].x + 150, creature[cS].y+ 100, 1, 0.08);
		lightRegion(creature[cS].x + 100, creature[cS].y+ 100, 12, 0.5);
		
		
		//for(var i = 0; i < wallPanels.length; i++) wallPanels[i].shade();
		
		//for(var i = 0; i < creature.length; i++) if(creature[i].deathF != 10) creature[i].draw();
		/*
		ctx.fillStyle = 'yellow'
		ctx.globalAlpha = 0.5
		
		for(var i=0; i < mapGrid.length; i++){
			for(var j=0; j < mapGrid[i].length; j++){
				if(mapGrid[i][j].wall) ctx.fillStyle = 'red'
				else ctx.fillStyle = 'green'
				ctx.fillRect(i*50,j*50,48,48);
			}
		}
		*/

		ctx.globalAlpha = 0.8
		ctx.translate(-ctxOx/10, -ctxOy/10);
		for(var i = 0; i < foreGroundDark.length; i++) foreGroundDark[i].draw();
		ctx.translate(ctxOx/10, ctxOy/10);
		ctx.globalAlpha = 1;
		for(var i = 0; i < creature.length; i++) creature[i].sayWords();
		//antiLight();
		
		//Bullet Sparks
		for(var i=0; i < sparks.length;i++) sparks[i].draw();
		for(var i=0; i < sparks.length;i++){
			if(sparks[i].f > 2){
				sparks.splice(i,1);
				i--;
			}
		}
		
		//Blood Splatters
		for(var i=0; i < bloodSplat.length;i++) bloodSplat[i].draw();
		for(var i=0; i < bloodSplat.length;i++){
			if(bloodSplat[i].f > 2){
				bloodSplat.splice(i,1);
				i--;
			}
		}
		
		
		
		ctx.restore()
		shade();
		
		
		
		
		
		//UI Stuff goes here
		ctx.fillStyle = 'white'
		ctx.font = "15pt Orbitron" 
		for(var i = 0; i < exits.length; i++){
			if(dist(creature[cS].x + 100, creature[cS].y + 100, exits[i].x, exits[i].y) < 80){
				//ctx.fillText("Transit Point!", 100,100);
				if(exits[i].skip){
					ctx.fillText("(ENTER) to Exit", creature[cS].x + ctxOx + 100 - ctx.measureText("(ENTER) to Exit").width/2, creature[cS].y + ctxOy);
				}else{
					ctx.fillText("(ENTER) to Exit", creature[cS].x + ctxOx + 100 - ctx.measureText("(ENTER) to Exit").width/2, creature[cS].y + ctxOy);
				}
			}
		}
		ctx.fillStyle = 'white'
		ctx.globalAlpha = 0.4
		ctx.fillRect(10, h - 80, 180, 70);
		ctx.fillRect(200, h - 80, 180, 70);
		ctx.fillRect(390, h - 80, 180, 70);
		ctx.fillRect(580, h - 80, 180, 70);
		ctx.globalAlpha = 1;
		
		ctx.fillStyle = 'black'
		ctx.font = "10pt Courier"
		for(var i=0; i < 4; i++){
			if(creature[cS].weapon[i] != null){
				ctx.fillText(creature[cS].weapon[i].name, 10 + 190 * i, h - 70);
				if(creature[cS].sw == i){
					ctx.globalAlpha = 0.2
					ctx.fillStyle = 'white'
					ctx.fillRect(10 + i *190, h - 80, 180, 70);
					ctx.fillStyle = 'black'
					ctx.globalAlpha = 1;
				}
				if(creature[cS].weapon[i].type == 1){//Projectile Weapon
					ctx.drawImage(creature[cS].weapon[i].IconPic, 10 + 190 * i, h - 60);
					ctx.fillText("MAG: " + creature[cS].weapon[i].clip + "/" + creature[cS].weapon[i].capacity, 90 + 190 * i, h - 70);
					ctx.fillText("AMMO: " + creature[cS].weapon[i].ammo, 90 + 190 * i, h - 20);
				
				}else{
					if(creature[cS].weapon[i].firePic.length >0) ctx.drawImage(creature[cS].weapon[i].firePic[1], 10 + 190 * i, h - 60);
				}
				ctx.fillText("DAM: " + creature[cS].weapon[i].stats.damage, 120 + 190 * i, h - 60);
					
			}
		}
		
	
		
		//Mini Map
		ctx.fillStyle = 'white'
		ctx.fillText(levelName, mapX,mapY);
		ctx.globalAlpha = 0.5
		
		ctx.fillRect(mapX, mapY, mapW, mapH);
		
		
		//Selected character stats
		ctx.fillText("Health: ", 10, h - 100);
		ctx.fillStyle = '#DD0000'
		ctx.fillRect(78, h - 112, 204, 14);
		ctx.fillStyle = '#FF0000'
		ctx.fillRect(80, h - 110, 200 * creature[cS].stats.health/creature[cS].stats.maxHealth, 10);
		//Available characters
		
		//Map contents
		//Walls
		ctx.globalAlpha = 1;
		ctx.fillStyle = 'white'
		for(var i=0; i < wall.length;i++) ctx.fillRect(wall[i].x/mapD + mapX, wall[i].y/mapD + mapY, (wall[i].width/100)*mapD-1,(wall[i].height/100)*mapD-1);
		
		//ForeGRound for testing
		ctx.fillStyle = 'blue'
		//for(var i=0; i < foreGround.length;i++) ctx.fillRect(foreGround[i].x/mapD + mapX, foreGround[i].y/mapD + mapY, mapD,mapD);
		
		
		//Creatures
		ctx.fillStyle = 'red'
		for(var i=0; i < creature.length;i++) {
			if(creature[i].stats.type != creature[cS].stats.type) ctx.fillStyle = 'red'
			else if(i != cS) ctx.fillStyle = 'green'
			else ctx.fillStyle = 'blue'
			ctx.fillRect(creature[i].x/mapD + mapX, (creature[i].y + 100)/mapD + mapY, mapD-1,mapD-1);
		
		}
		
		ctx.globalAlpha = 0.3
		ctx.fillStyle = 'black'
		ctx.fillRect(mapX - ctxOx/mapD, mapY-ctxOy/mapD, mapW/2, mapH/2)
		ctx.globalAlpha = 1;
		
		//Player fire control
		if(mDown){
			if(mx > mapX && mx < mapX + mapW && my > mapY && my < mapY + mapH){
				ctxOx = ((mx - mapX)/mapD)* -100 + w/2;
				ctxOy = ((my - mapY)/mapD)* -100 + h/2;
			}else if(false){//UI button system
			
			}else{
				if(creature[cS].fireCool <= 0 && creature[cS].canFire && creature[cS].recoil == 0 && creature[cS].reloading < 0) {
					creature[cS].fire(mx,my);
				}
			}
			
		}
			//Check for victory conditions
		if(creature[cS].collidePoint(end.x, end.y)) {
			//alert("level ended proceeding to scene: " + level[cLevel].nextScene);
			level[cLevel].endLevel()
		}
		
		if(prompting){
			drawPromptBox();
			ctx.font = '15pt wallFont'
			ctx.fillStyle = 'white'
			if(promptAni < 100) promptAni++
			
			textBox(promptTitle[promptIndex], w/2 - ctx.measureText(promptTitle[promptIndex]).width/2, h/2 - 120, 380);
			ctx.font = '8pt wallFont'
			textBox(promptMessage[promptIndex].slice(0,Math.floor(promptAni/100*promptMessage[promptIndex].length)), w/2 -  280, h/2 - 90, 540);
		
			OKButton.draw();
		}
		//End main game
		}else if (screen == 6){
		//level maker
			ctx.save();
			if(ctxOx > w/2) ctxOx = w/2
			if(ctxOy > h/2) ctxOy = h/2
			if(ctxOx < w * -1.5) ctxOx = w * -1.5
			if(ctxOy < h * -1.5) ctxOy = h * -1.5
			//if(mx > w - 20) ctxOx-= 100;
			//else if (mx < 20)ctxOx += 100;
		
			//if(my > h - 20) ctxOy-= 100;
			//else if (my < 20)ctxOy += 100;
			ctx.fillStyle = 'white'
			ctx.fillText("Offset: " + ctxOx + " " + ctxOy, 20,20);
			ctx.translate(ctxOx, ctxOy);
		
		
			//Level edge borders
			ctx.fillStyle = 'red';
			ctx.fillRect(0, 0, w*2, 5);
			ctx.fillRect(0, 0, 5, h*2);
			ctx.fillRect(w*2, 0, 5, h*2);
			ctx.fillRect(0, h*2 - 5, w*2, 5);
		
		
			for(var i = 0; i < wallPanels.length; i++) wallPanels[i].draw();
			for(var i = 0; i < elevators.length; i++) {
				//elevators[i].inUse= elevators[i].playerOn();
				elevators[i].draw();
			}	
			for(var i = 0; i < wall.length; i++) wall[i].draw();
			for(var i=0; i < items.length; i++)items[i].draw();
			for(var i = 0; i < creature.length; i++) if(creature[i].deathF != 10) creature[i].draw();
			
			for(var i = 0; i < elevators.length; i++) elevators[i].draw2();
				
			
			
			for(var i = 0; i < lamps.length; i++) lamps[i].draw()//ctx.drawImage(lampLit, lamps[i].x, lamps[i].y);
			for(var i=0; i < rLights.length; i++)rLights[i].draw();
			for(var i=0; i < dLights.length; i++)dLights[i].draw();
			for(var i=0; i < pulseLights.length; i++)pulseLights[i].draw();
			for(var i=0; i < foreGround.length; i++)foreGround[i].draw();
			
			
	
			ctx.restore()
			if(lighting) shade()
			
			
			ctx.fillStyle = 'black'
			ctx.globalAlpha = 0.5
			ctx.fillRect(mx,my-10, 50, 10);
			ctx.fillStyle = 'white'
			ctx.fillText("(" + (mx - ctxOx) + ", " + (my - ctxOy) + ")", mx, my);
		
			ctx.font = 'bold 15pt Orbitron'
			ctx.globalAlpha =1
			ctx.fillStyle = 'green'
			for(var i=0; i < exits.length;i++){
				ctx.fillRect(exits[i].x + ctxOx, exits[i].y + ctxOy, 10,10);
				if(exits[i].skip){
					ctx.fillText("Level: " + exits[i].next,exits[i].x + ctxOx, exits[i].y + ctxOy);
				}else{
					ctx.fillText("Level: " + cutscene[exits[i].next].nextLevel,exits[i].x + ctxOx, exits[i].y + ctxOy);
				}
			}
			
			ctx.font = '8pt Orbitron'
			ctx.fillStyle = 'white'
			ctx.fillText("1 - Panels", w - 150, 50);
			ctx.fillText("2 - Wall/Obstacles", w - 150, 60);
			ctx.fillText("3 - Lamps / Lights", w - 150, 70);
			ctx.fillText("4 - Items", w - 150, 80);
			ctx.fillText("5 - Foreground Items", w - 150, 90);
			ctx.fillText("6 - Creatures", w - 150, 100);
			ctx.fillText("7 - Sounds Objects", w - 150, 110);
			
			ctx.globalAlpha = 0.5
			ctx.fillRect(10,h - 110, 600, 120);
			ctx.globalAlpha = 1;
			ctx.fillStyle = 'white'
			config.draw();
			lighter.draw();
			rightSlide.draw();
			leftSlide.draw();
			
			if(selEdit == 1){
				ctx.fillText("Panels", 20, h - 120);
				for(var i=0; i < bgOptions.length; i++) {
					bgOptions[i].draw();
				}
			}else if (selEdit == 2){
				ctx.fillText("Walls & Obstacles", 20, h - 120);
				for(var i=0; i < wOptions.length; i++) {
					wOptions[i].draw();
				}
			}else if (selEdit == 3){
				ctx.fillText("Lighting", 20, h - 120);
				for(var i=0; i < lOptions.length; i++) {
					lOptions[i].draw();
				}
			}else if (selEdit == 4){
				ctx.fillText("Items", 20, h - 120);
				for(var i=0; i < iOptions.length; i++) {
					iOptions[i].draw();
				}
			}else if (selEdit == 5){
				ctx.fillText("Foreground", 20, h - 120);
				for(var i=0; i < fOptions.length; i++) {
					fOptions[i].draw();
				}
			}else if (selEdit == 6){
				ctx.fillText("Creatures", 20, h - 120);
				for(var i=0; i < cOptions.length; i++) {
					cOptions[i].draw();
				}
			}else if (selEdit == 7){
				ctx.fillText("Sound Objects", 20, h - 120);
				for(var i=0; i < sOptions.length; i++) {
					sOptions[i].draw();
				}
			}
			
			//Mini Map
		ctx.fillStyle = 'white'
		ctx.fillText(levelName, mapX,mapY);
		ctx.globalAlpha = 0.5
		
		ctx.fillRect(mapX, mapY, mapW, mapH);
		
		//Map contents
		//Walls
		ctx.globalAlpha = 1;
		ctx.fillStyle = 'white'
		for(var i=0; i < wall.length;i++) ctx.fillRect(wall[i].x/mapD + mapX, wall[i].y/mapD + mapY, (wall[i].width/100)*mapD-1,(wall[i].height/100)*mapD-1);
		
		//ForeGRound for testing
		ctx.fillStyle = 'blue'
		//for(var i=0; i < foreGround.length;i++) ctx.fillRect(foreGround[i].x/mapD + mapX, foreGround[i].y/mapD + mapY, mapD,mapD);
		
		
		//Creatures
		ctx.fillStyle = 'red'
		for(var i=0; i < creature.length;i++) {
			if(creature[i].stats.type != creature[cS].stats.type) ctx.fillStyle = 'red'
			else if(i != cS) ctx.fillStyle = 'green'
			else ctx.fillStyle = 'blue'
			ctx.fillRect(creature[i].x/mapD + mapX, (creature[i].y + 100)/mapD + mapY, mapD-1,mapD-1);
		
		}
		
		ctx.globalAlpha = 0.3
		ctx.fillStyle = 'black'
		ctx.fillRect(mapX - ctxOx/mapD, mapY-ctxOy/mapD, mapW/2, mapH/2)
		ctx.globalAlpha = 1;
			
			
		//Grid lines
		ctx.strokeStyle = 'white'
		ctx.globalAlpha = 0.2
		for(var i=0; i < h; i+= 10){
			if(i%100 == 0) ctx.globalAlpha = 0.6
			else ctx.globalAlpha = 0.2
			ctx.beginPath();
			ctx.moveTo(0, i);
			ctx.lineTo(w, i);
			ctx.stroke();
			ctx.closePath();
		}
		for(var i=0; i < w; i+= 10){
			if(i%100 == 0) ctx.globalAlpha = 0.6
			else ctx.globalAlpha = 0.2
			ctx.beginPath();
			ctx.moveTo(i, 0);
			ctx.lineTo(i, h);
			ctx.stroke();
			ctx.closePath();
		}
		ctx.strokeStyle = 'black';
		ctx.globalAlpha = 1;
			
		}
		ani--;
		if(ani < 0) ani = aniDelay;
		
		
		
		
	}////////////////////////////////////////////////////////////////////////////////END PAINT/ GAME ENGINE
	
	
	function shade(){
		var minX = Math.abs(Math.floor(ctxOx/lightRes));
		var minY = Math.abs(Math.floor(ctxOy/lightRes));

		var Ox = Math.floor(ctxOx - Math.floor(ctxOx/lightRes)*lightRes)
		var Oy = Math.floor(ctxOy - Math.floor(ctxOy/lightRes)*lightRes)
		var t1, t2;
		
		ctx.fillStyle = 'black'
		for(var i = -lightRes; i < w + lightRes; i+=lightRes){
			for(var j = 0; j < h; j+=lightRes){
				t1 = Math.floor(i/lightRes) + minX
				t2 = Math.floor(j/lightRes) + minY
				if(t1 >= 0 /*&& t1 < lightGrid.length*/ && t2 >= 0 /*&& t2 < lightGrid[0].length*/){
					if(1- lightGrid[t1][t2] < 0) ctx.globalAlpha = 0
					else ctx.globalAlpha = 1 - lightGrid[t1][t2]
				
					ctx.globalAlpha = ctx.globalAlpha * 0.85
					lightGrid[t1][t2] = 0
					ctx.fillRect(i + Ox,j + Oy,lightRes,lightRes);
				}
			}
		}
		
	}
	/*
	function shade(){
		var minX = Math.abs(Math.floor(ctxOx/lightRes));
	//	var maxX = minX + Math.floor(w/10);
		var minY = Math.abs(Math.floor(ctxOy/lightRes));
	//	var maxY = minY + Math.floor(h/10);
		
		var Ox = ctxOx - Math.floor(ctxOx/lightRes)*lightRes
		var Oy = ctxOy - Math.floor(ctxOy/lightRes)*lightRes
		var t1, t2;
		
		ctx.fillStyle = 'black'
		for(var i = -lightRes; i < w + lightRes; i+=lightRes){
			for(var j = 0; j < h; j+=lightRes){
				t1 = Math.floor(i/lightRes) + minX
				t2 = Math.floor(j/lightRes) + minY
				if(t1 >= 0 && t1 < lightGrid.length && t2 >= 0 && t2 < lightGrid[0].length){
					if(1- lightGrid[t1][t2] < 0) ctx.globalAlpha = 0
					else ctx.globalAlpha = 1 - lightGrid[t1][t2]
				
					ctx.globalAlpha = ctx.globalAlpha * 0.95
					lightGrid[t1][t2] = 0
					ctx.fillRect(i + Ox,j + Oy,lightRes,lightRes);
				}
			}
		}
		
	}*/
	/////////////////////
	/////	CURSCENES
	///////////////////
	
	
	
	function Cutscene(n){
		this.title = n
		this.frame = 0;
		this.endFrame = 50;
		this.nextLevel = 0;
		
		this.sc = cutscene.length
		
		this.lev = new Level(n);
		this.Rlev = new Level(n);
		this.darkForeground = true;
		this.shaded = false;
		this.draw = function(){
			ctx.fillStyle = 'black'
			ctx.fillRect(0,0,w,h);
			ctx.fillStyle = 'white'
			ctx.font = '18pt Orbitron'
			
			ctx.fillText(this.title, w/2 - ctx.measureText(this.title).width /2,h/2);
			ctx.fillText(this.frame + "/" + this.endFrame, 50,50);
		}
		this.load = function(){
			stopSound();
			wallPanels = this.lev.wallPanels
			wall = this.lev.wall
			creature = this.lev.creature
			lamps = this.lev.lamps
			dLights = this.lev.dLights
			rLights = this.lev.rLights
			pulseLights = this.lev.pulseLights
			foreGround = this.lev.foreGround
			elevators = this.lev.elevators
			for(var i =0; i < elevators.length; i++) elevators[i].initialize();
		resetMapGrid();
		var tx = 0;
		var ty = 0;
		for(var i= 0 ; i < wallPanels.length; i++){
			tx = (wallPanels[i].x+50)/100
			ty = (wallPanels[i].y+50)/100
			mapGrid[Math.floor(tx)][Math.floor(ty)].panels.push(i)
		}
		
		for(var i= 0 ; i < wall.length; i++){
			tx = (wall[i].x+50)/100
			ty = (wall[i].y+50)/100
			if(tx >= 0 && tx < mapGrid.length && ty >=0 && ty < mapGrid[0].length){
				mapGrid[Math.floor(tx)][Math.floor(ty)].wall = true
			}
		}
		scene = this.sc
		}
		this.endScene = function(){
			loadLevel(this.nextLevel);
		}
	}
	
	//Intro Level
	cutscene.push(new Cutscene("Prototype"));
	
	cutscene[0].lev.wallPanels.push(new Panel(200,200, panelHall[1], 1,0.8));
cutscene[0].lev.wallPanels.push(new Panel(300,200, panelHall[1], 1,0.8));
cutscene[0].lev.wallPanels.push(new Panel(400,200, panelHall[1], 1,0.8));
cutscene[0].lev.wallPanels.push(new Panel(500,200, panelHall[0], 1,0.8));
cutscene[0].lev.wallPanels.push(new Panel(600,200, panelHall[1], 1,0.8));
cutscene[0].lev.wallPanels.push(new Panel(700,200, panelHall[1], 1,0.8));
cutscene[0].lev.wallPanels.push(new Panel(200,300, panelHall[1], 2,0.8));
cutscene[0].lev.wallPanels.push(new Panel(300,300, panelHall[1], 2,0.8));
cutscene[0].lev.wallPanels.push(new Panel(400,300, panelHall[1], 2,0.8));
cutscene[0].lev.wallPanels.push(new Panel(500,300, panelHall[1], 2,0.8));
cutscene[0].lev.wallPanels.push(new Panel(700,300, panelHall[1], 2,0.8));
cutscene[0].lev.wallPanels.push(new Panel(600,300, panelHall[0], 2,0.8));
cutscene[0].lev.wallPanels.push(new ForeGround(700,300, wallFeatures[9], 0,0.5));
cutscene[0].lev.wallPanels.push(new ForeGround(270,210, wallFeatures[3], 0,0.5));
cutscene[0].lev.wallPanels.push(new ForeGround(500,250, wallFeatures[10], 0,0.5));
cutscene[0].lev.wallPanels.push(new ForeGround(600,300, wallFeatures[10], 0,0.5));

	cutscene[0].lev.wallPanels.push(new ForeGround(200,200,door[0], 2, 0.5));
	//Floor
	for(var i=200; i <= 700; i+=100) cutscene[0].lev.wall.push(createWall(i,400,100,30,floor[0]));
	
	//Ceiling
	for(var i=200; i <= 700; i+=100) cutscene[0].lev.wall.push(createWall(i,200,100,30,ceiling[0]));

	
	
	cutscene[0].lev.foreGround.push(new ForeGround(460,300, foreGPic[0]));
	cutscene[0].lev.foreGround.push(new ForeGround(450,300, foreGPic[0]));
	cutscene[0].lev.foreGround.push(new ForeGround(440,300, foreGPic[0]));
	cutscene[0].lev.foreGround.push(new ForeGround(430,300, foreGPic[0]));
	cutscene[0].lev.foreGround.push(new ForeGround(510,280, foreGPic[4]));
	//cutscene[0].lev.foreGround.push(new Panel(560,300, wallFeatures[0]));
	
	cutscene[0].lev.foreGround.push(new ForeGround(560,300, foreGPic[1]));
	cutscene[0].lev.lamps.push(new BigLamp(260,220));
	cutscene[0].lev.lamps.push(new Lamp(470,240));
	cutscene[0].lev.lamps.push(new Lamp(620,240));
	cutscene[0].lev.lamps.push(new Lamp(720,240));

	cutscene[0].lev.foreGround.push(new ForeGround(550,280, foreGPic[8]));
	//cutscene[0].lev.wallPanels.push(new Panel(400,200, panelHall[5], 0,0.5));
	
	//Characters
	cutscene[0].lev.creature.push(baseLineMutant(500, 200, 0)); //type 0= insect, 1- reptile
	cutscene[0].lev.creature.push(Scientist(200, 200, 3)); //type 0= insect, 1- reptile
	cutscene[0].lev.creature[1].taimer = {x:w, y:200} 
	
	cutscene[0].lev.creature.push(Marine(670, 200, 3));
	cutscene[0].lev.creature[2].aimer= {x:w/2 + 100, y: 280}
	cutscene[0].lev.creature[2].taimer = cutscene[0].lev.creature[2].aimer
	cutscene[0].lev.wallPanels.push(new wordWall(410,280, 'ROOM 21-B',5));
cutscene[0].lev.wallPanels.push(new wordWall(410,270, 'EXAM',5));

	cutscene[0].draw = function(){
	
		
		if(this.frame == 5){
			creature[1].speak("Monitor, begin recording.");
			cutscene[0].lev.creature[1].state = 2
			cutscene[0].lev.creature[1].sx = 5
		}else if(this.frame == 10) {
			cutscene[0].lev.creature[0].state = 4
			//creature[0].sw = 1; // select stringer!
			cutscene[0].lev.creature[2].taimer= {x:w/2 + 100, y: 320}
		}else if(this.frame == 20) {
			
		}else if(this.frame == 35) {
			
		}else if(this.frame == 42) {
			creature[1].state = 0;
			creature[1].sx=0;
		}else if(this.frame == 55) {
			creature[1].state = 4;
			
			//creature[1].speak("Administering neural test.");
		}else if(this.frame == 60){
			
		creature[0].speak("Hello Doctor.");
			creature[0].taimer = {x:w/2, y:h-200};
			
		}else if(this.frame == 70){
			creature[2].taimer= {x:w/2, y: h}
			creature[2].light = false;
			
		}else if(this.frame == 75){
			
		}else if(this.frame == 80){
			//creature[1].speak("NOTE: Subject's mood seems to have improved.")
	
		}else if(this.frame == 90){
			creature[0].speak("I'm sorry about our last session.")
		}else if(this.frame == 110){
			
		}else if(this.frame == 160) {
			creature[1].speak("T-927, I would like to ask you some questions.")	
		}else if(this.frame == 220) {
			creature[1].speak("");
			creature[0].speak("Of course Doctor...");
		}else if(this.frame == 250) {
			creature[0].speak("We're friends.  I trust you.");
		}else if(this.frame == 290) {
			creature[0].speak("");
			creature[1].speak("That's good.");
		}else if(this.frame == 315) {
			creature[1].speak("Lets begin shall we?");
			
		}else if(this.frame == 335) {
			creature[0].taimer = {x: creature[1].x + 100, y: creature[1].y + 90}
			creature[0].aimer = creature[0].taimer;
			creature[0].sw = 1;
			creature[0].fire();
			creature[1].stats.health = 0;
			creature[1].speak("");
			bloodSplat.push(createBlood(creature[0].aimer.x, creature[0].aimer.y));
			//Add some wall splatters
			wallPanels.push(new Panel( w/2 - 30, h/2 - 20,BloodSmear[0], 0, 2))
		}else if(this.frame == 336){
			wallPanels.push(new Panel( w/2 - 35, h/2 - 20 + rand(5),BloodSmear[0], 0, 2))
			bloodSplat.push(createBlood(creature[0].aimer.x + rand(10), creature[0].aimer.y+ rand(10)));
		}else if(this.frame == 337){
			wallPanels.push(new Panel( w/2 - 45, h/2 - 20 + rand(10),BloodSmear[0], 0, 2))
			bloodSplat.push(createBlood(creature[0].aimer.x+ rand(10), creature[0].aimer.y+ rand(10)));
		}else if(this.frame == 338){
			wallPanels.push(new Panel( w/2 - 55, h/2 - 20 + rand(15),BloodSmear[0], 0, 2))
			bloodSplat.push(createBlood(creature[0].aimer.x+ rand(10), creature[0].aimer.y+ rand(10)));
		}else if(this.frame == 339){
			bloodSplat.push(createBlood(creature[0].aimer.x+ rand(10), creature[0].aimer.y+ rand(10)));
		}else if(this.frame == 340){
			bloodSplat.push(createBlood(creature[0].aimer.x, creature[0].aimer.y+ rand(10)));
		}else if(this.frame == 350){
			//lamps.push(new spinLight(520,220,50,0));
			lamps.splice(1,3)
			lamps.push(new spinLight(470,240,50,0));
			lamps.push(new spinLight(620,240,50,0));
			lamps.push(new spinLight(720,240,50,0));
		
	
			//creature[0].jump();
		}else if(this.frame == 355){
			creature[2].light = true;
			creature[0].move();
			creature[0].state = 2;
			creature[0].sx = 10
			creature[2].taimer = {x:creature[0].x+100, y: creature[0].y + 70};
			creature[0].sy = -10
			creature[0].y -= 5
			creature[2].state = 4
		}else if(this.frame == 360){
			creature[0].fire();
			//creature[0].state = 0
			creature[0].sx = 10
			creature[0].sy = -10
			creature[0].y -= 5
			//creature[2].move();
			creature[2].fire();
		}
		
	}
	
	cutscene[0].nextLevel = 1;
	cutscene[0].darkForeground = false;
	cutscene[0].shaded = true;
	cutscene[0].endFrame = 365
	
	
	cutscene.push(new Cutscene('The Air is Better Outside'))

	cutscene[1].endFrame = 50;
	cutscene[1].nextLevel = 2;
	cutscene[1].darkForeground = false;
	
	cutscene.push(new Cutscene('It smells too clean in here'))

	cutscene[2].endFrame = 50;
	cutscene[2].nextLevel = 3;
	cutscene[2].darkForeground = false;
	
	
	//////////////
	/////////////
	
	function baseLineMutant(x,y, t){
		var result = createCreature(80,45,40,155);
		result.x = x
		result.y = y
		result.stats.health = 100
		result.weapon.push(Punch0());
		if(t == 0) result.weapon.push(insectHeal());
		else result.weapon.push(acidSpray());
		result.weapon.push(blank());
		result.weapon.push(blank());
	
		result.stats.torso = 0
		result.stats.type = t;
		result.stats.abdomen = 0;
		result.stats.armorPlate = false
		if(t == 0)result.stats.legs= 0
		else result.stats.legs = 0;
		result.stats.hair = rand(4) + 1;
		result.stats.wing = 0;
		result.speak("");
	
		return result
	}
	
	function Marine(x,y, t){
		var result = createCreature(80,45,40,155);
		result.x = x
		result.y = y
		result.stats.health = 100
		result.sw = 0;
		result.greets.push("Like white on rice.");
		result.greets.push("Moving on target.");
		result.greets.push("Clearing sector.");
		result.greets.push("Hostile sighted!");
		result.greets.push("Cleaning house!");
		result.greets.push("Here we go.");
		if(Math.random() < 0.5) {//Male
			if(Math.random() < 0.5) {
				result.stats.torso = 0
			}else {
				result.stats.torso = 1
			}
		}else {//Female
			if(Math.random() < 0.5) {
				result.stats.torso = 2
			}else {
				result.stats.torso = 3
			}
		}
		result.stats.type = t;
		result.stats.abdomen = 0;
		result.stats.legs= 0
		result.stats.hair = 0;
		result.stats.wing = 0;
		result.speak("");
		result.weapon.push(Punch0());
		result.weapon.push(Punch0());
		if(Math.random() > 0.5)result.giveGun(SMG(), 0);
		else result.giveGun(RIFLE(), 0);
		//result.weapon.push(PISTOL());
		
		result.giveGun(PISTOL(), 3);
		
		//result.weapon.push(null);
	//	if(t == 0) result.weapon.push(MarinePISTOL());
	//	else result.weapon.push(MarinePISTOL());

	//result.weapon.push(RIFLE());
		return result
	}
	
	
	function Scientist(x,y, t){
		var result = createCreature(80,45,40,155);
		result.x = x
		result.y = y
		result.stats.health = 100
		result.sw = 0;
		result.greets.push("Please no more!");
		result.greets.push("We're sorry!");
		result.greets.push("Please!");
		var temp = 0
		if(Math.random() < 0.5) {//male
			result.stats.torso = 4
			result.stats.hair = 0;
		}else {//Female
			temp = rand(2)
			if(temp == 0) result.stats.torso = 5
			else result.stats.torso = 6
			
			temp = rand(3)
			if(temp == 0)result.stats.hair = 1;
			else if (temp == 1) result.stats.hair = 2;
			else result.stats.hair = 6;
		}
		result.stats.type = t;
		result.stats.abdomen = 0;
		result.stats.legs= 1
		
		result.stats.wing = 0;
		result.speak("");
		//result.giveGun(blank(), 0);
		//result.weapon.push(PISTOL());
		result.weapon.push(blank());
		//result.giveGun(PISTOL(), 3);
		
		//result.weapon.push(null);
	//	if(t == 0) result.weapon.push(MarinePISTOL());
	//	else result.weapon.push(MarinePISTOL());

	//result.weapon.push(RIFLE());
		return result
	}
	
	
	function Weapon(){
		this.oX;//Marks center of rotation
		this.oY;
		this.pX = 0;//Default poistion is on shoulder, this poistion is relative to that
		this.pY = 0;
		this.type;	//0- melee, 1-bullet
		this.pic;
		this.IconPic = null;
		this.name = "DNE";
		this.firePic = [];
		this.clip = 0;
		this.ammo = 0;
		this.capacity = 0;
		this.id = -1; 
		this.result//no idea what this does?
		this.stats = {damage:0, range:-1, coolDown:10, burst:1}
		this.accuracy = 10
		this.useless = false;
		this.drop = function(){
		
		}
		this.sound = null;
	}
	
	
	/////////////////////////////////////////////////
	////////////////////////////////	WEAPON LIBRARY
	////////////////////////////////////////
	
	function updateWeapon(w,t){
		w.firePic = []
		if(t == 0 || t == 1){//mutant
			if(w.id == pistolID){
				w.IconPic = iconPistol;
				w.pic = pistolPic
				w.firePic.push(pistolFlash[0]);
				w.firePic.push(pistolFlash[1]);
			}else if(w.id == SMGID){
				w.IconPic = iconSMG;
				w.pic = SMGPic
				w.firePic.push(SMGFlash[0]);
				w.firePic.push(SMGFlash[1]);
			}else if(w.id == rifleID){
				w.IconPic = iconRifle;
				w.pic = riflePic
				w.firePic.push(rifleFlash[0]);
				w.firePic.push(rifleFlash[1]);
				w.firePic.push(rifleFlash[2]);
			}
		
		}else if(t == 3){//marine	
			if(w.id == pistolID){
				w.IconPic = iconPistol;
				w.pic = pistolPicMarine
				w.firePic.push(pistolFlashMarine[0]);
				w.firePic.push(pistolFlashMarine[1]);
			}else if(w.id == SMGID){
				w.IconPic = iconSMG;
				w.pic = SMGPicMarine
				w.firePic.push(SMGFlashMarine[0]);
				w.firePic.push(SMGFlashMarine[1]);
			}else if(w.id == rifleID){
				w.IconPic = iconRifle;
				w.pic = riflePicMarine
				w.firePic.push(rifleFlashMarine[0]);
				w.firePic.push(rifleFlashMarine[1]);
				w.firePic.push(rifleFlashMarine[2]);
			}
		
		}
	
	
	}
	
	function RIFLE(){
		var result = new Weapon();
		result.name = "Rifle";
		result.oX = -10
		result.oY = -10
		result.type = 1;
		result.IconPic = iconRifle
		result.pic = riflePic
		result.firePic.push(rifleFlash[0]);
		result.firePic.push(rifleFlash[1]);
		result.firePic.push(rifleFlash[2]);
		result.stats = {damage:30, range:-1, coolDown:20, burst:3,singleHand:false}
		result.ammo = 100;
		result.capacity = 30;
		result.clip = 15;
		result.id = rifleID
		result.accuracy = 70
		result.drop = function(a,b){
			items.push(rifleItem(a,b));
			items[items.length-1].ammo = result.clip + result.ammo
		}
		result.sound = rifleSound;
		return result;
	}
	
	function SMG(){
		var result = new Weapon();
		result.name = "SMG";
		result.oX = -10
		result.oY = -10
		result.type = 1;
		result.IconPic = iconSMG;
		result.pic = SMGPic
		result.firePic.push(SMGFlash[0]);
		result.firePic.push(SMGFlash[1]);
		result.stats = {damage:15, range:-1, coolDown:6, burst:2,singleHand:false}
		result.ammo = 40;
		result.capacity = 30;
		result.clip = 5;
		result.id = SMGID
		result.accuracy = 10
		result.drop = function(a,b){
			items.push(smgItem(a,b));
			items[items.length-1].ammo = result.clip + result.ammo
		}
		result.sound = smgSound;
		return result;
	}
	
	function blank(){
		var result = new Weapon();
		result.name = "N/A";
		result.useless = true;
		result.oX = -10
		result.oY = -10
		result.type = 0;
		result.IconPic = blankPic;
		result.pic = blankPic
		//result.firePic.push(SMGFlash[0]);
		//result.firePic.push(SMGFlash[1]);
		result.stats = {damage:15, range:-1, coolDown:6, burst:2,singleHand:false}
		result.ammo = 40;
		result.capacity = 30;
		result.clip = 5;
		result.id = SMGID
		result.accuracy = 10
		return result;
	}
	

	function PISTOL(){
		var result = new Weapon();
		result.name = "Pistol";
		result.id = pistolID
		result.oX = -10
		result.oY = -10
		result.type = 1;
		result.IconPic = iconPistol
		result.pic = pistolPic
		result.firePic.push(pistolFlash[0]);
		result.firePic.push(pistolFlash[1]);
		result.stats = {damage:15, range:-1, coolDown:10, burst:1,singleHand:true}
		result.ammo = 40;
		result.capacity = 10;
		result.clip = 5;
		result.accuracy = 10
		result.drop = function(a,b){
			items.push(pistolItem(a,b));
			items[items.length-1].ammo = result.clip + result.ammo
		}
		result.sound = pistolSound;
		return result;
	}
	
	

	function insectHeal(){
		var result = new Weapon();
		result.name = "Proboscis (Heal)";
		result.oX = -10
		result.oY = -10
		result.pX = 13
		result.pY = -10
		result.type = 3;
		result.id = 3
		result.pic = null;//makePicture("Animations/Objects/Weapons/iHeal.png");
		result.firePic.push(iHealPic[0]);
		result.firePic.push(iHealPic[1]);
		result.firePic.push(iHealPic[2]);
		result.firePic.push(iHealPic[3]);
		result.firePic.push(iHealPic[4]);
		result.firePic.push(iHealPic[5]);
		result.stats = {damage:5, range:150, coolDown:30, burst:1,singleHand:true}
		result.ammo = 0;
		result.capacity = 0;
		result.clip = 0;
		return result;
	}
	
	
	function acidSpray(){
		var result = new Weapon();
		result.name = "Acid Spray";
		result.oX = -10
		result.oY = -10
		result.pX = 13
		result.pY = -10
		result.type = 3;
		result.id = 3
		result.pic = null;
		result.firePic.push(acidPic[0]);
		result.firePic.push(acidPic[1]);
		result.firePic.push(acidPic[2]);
		result.firePic.push(acidPic[3]);
		result.firePic.push(acidPic[4]);
		result.firePic.push(acidPic[5]);
		result.firePic.push(acidPic[6]);
		result.stats = {damage:20, range:150, coolDown:30, burst:1,singleHand:true}
		result.ammo = 0;
		result.capacity = 0;
		result.clip = 0;
		return result;
	}
	
	
	
	function MaggotHead(){
		var result = new Weapon();
		result.name = "Mandibles";
		result.oX = -10
		result.oY = -10
		result.pX = 15
		result.pY = -20
		result.type = 0;
		result.pic = mHeadPics[0]
		result.firePic.push(mHeadPics[1]);
		result.firePic.push(mHeadPics[1]);
		result.firePic.push(mHeadPics[2]);
		result.stats = {damage:5, range:80, coolDown:30, burst:1,singleHand:true}
		result.ammo = 0;
		result.capacity = 0;
		result.clip = 0;
		result.id = 4
		return result;
	}
	
	
	function Monster1Punch(){
		var result = new Weapon();
		result.name = "Claw";
		result.oX = -10
		result.oY = -10
		result.type = 0;
		result.pic = mPunchPics[0]
		result.firePic.push(mPunchPics[1]);
		result.firePic.push(mPunchPics[2]);
		result.stats = {damage:10, range:80, coolDown:20, burst:1,singleHand:false}
		result.ammo = 0;
		result.capacity = 0;
		result.clip = 0;
		result.id = 5
		return result;
	}
	
		function Monster2Punch(){
		var result = new Weapon();
		result.name = "Claw";
		result.oX = -10
		result.oY = -10
		result.type = 0;
		result.pic = mPunchPics2[0]
		result.firePic.push(mPunchPics2[1]);
		result.firePic.push(mPunchPics2[2]);
		result.firePic.push(mPunchPics2[3]);
		
		result.stats = {damage:8, range:80, coolDown:25, burst:1,singleHand:false}
		result.ammo = 0;
		result.capacity = 0;
		result.clip = 0;
		result.id = 5
		return result;
	}
	
	
	function Punch0(){
		var result = new Weapon();
		result.name = "Fists";
		result.oX = -10
		result.oY = -10
		result.type = 0;
		result.pic = punchPics[0]
		result.firePic.push(punchPics[1]);
		result.firePic.push(punchPics[2]);
		result.firePic.push(punchPics[3]);
		result.stats = {damage:10, range:80, coolDown:10, burst:3,singleHand:false}
		result.ammo = 0;
		result.capacity = 0;
		result.clip = 0;
		result.id = 6
		return result;
	}
	
	
	function PunchInsect(){
		var result = new Weapon();
		result.name = "Insect Fists";
		result.oX = -10
		result.oY = -10
		result.type = 0;
		result.pic = punchInsectPics[0];
		result.firePic.push(punchInsectPics[1]);
		result.firePic.push(punchInsectPics[2]);
		result.firePic.push(punchInsectPics[3]);
		result.stats = {damage:15, range:80, coolDown:10, burst:1,singleHand:false}
		result.ammo = 0;
		result.capacity = 0;
		result.clip = 0;
		result.id = 7
		return result;
	}
	
	
	function Item(a,b,p){
		this.id = -1 // if not -1 then is an ammo to be matched
		this.x = a
		this.y = b
		this.pic = p //dimensions are 100 x 30 (same as for floors)
		this.draw = function(){
			ctx.drawImage(this.pic, this.x, this.y);
		}
		this.collideCreature = function(c){
			return c.collidePoint(this.x,this.y) || c.collidePoint(this.x + 100,this.y) || c.collidePoint(this.x,this.y+ 30) || c.collidePoint(this.x + 100,this.y + 30)
		}
		this.collect = function(c){
			if(c.stats.health + this.health < c.stats.maxHealth){
				c.stats.health += this.health;
				this.health = -1;
			}else{
				this.health -= c.stats.maxHealth - c.stats.health;
				c.stats.health = c.stats.maxHealth;
			}
			if(this.health < 0 && this.weapon == null) this.x = -1000

			
			
			var pickupWeapon = -1;
			var alreadyPresent = false;
			for(var i =0; i < c.weapon.length; i++){
				if(c.weapon[i] == null || c.weapon[i].useless) pickupWeapon = i; //a slot is available
				else if(c.weapon[i].id == this.id) alreadyPresent = true;//Weapon is already present
			}
			
			for(var i=0; i < c.weapon.length; i++){
				
				if(c.weapon[i] != null){
					if(c.weapon[i].id == this.id) {
						c.weapon[i].ammo += this.ammo
						if(this.weapon != null){//Has a weapon attached
							if(this.weapon.clip + this.weapon.ammo + this.ammo > 0) c.speak((this.weapon.clip + this.weapon.ammo + this.ammo) + " " + this.weapon.name + " rounds.");
							c.weapon[i].ammo += this.weapon.clip + this.weapon.ammo
							this.weapon.clip = 0
							this.weapon.ammo = 0
						}
						
						this.ammo = 0;
						pickupWeapon = -1;//Ammo harvested, in matching weapon
					}
				}
			}
			
			//Ammo not harvested
			//empty slot is available
		
			if(pickupWeapon != -1 && this.weapon != null && !alreadyPresent){
				updateWeapon(this.weapon, c.stats.type);
				c.weapon[pickupWeapon] = this.weapon;
				c.speak("A " + this.weapon.name + "!");
				if(c.sw == 0 || c.sw == 1) c.sw = pickupWeapon;
				this.x = -1000
			}
				
			
			this.specialCollect();
		}
		this.health = 0
		this.ammo = 0
		this.weapon = null
		this.specialCollect = function(){
		//This space left intentionally blank
		
		}
	
	}
	function armorItem(a,b){
		var result = new Item(a,b, iconArmor);
		result.id = -1;
		result.health = 0;
		result.weapon = null;
		
		result.collect = function(c){
			if(c.stats.armorPlate == false && c.stats.torso < 4){
				c.stats.armorPlate = true
				this.x = -1000
			}
		}
		return result;
	}
	
	function medItem(a,b){
		var result = new Item(a,b, iconMed);
		result.id = -1;
		result.health = 20;
		result.weapon = null;
		return result;
	}
	
	function pistolItem(a,b){
		var result = new Item(a,b, iconPistol);
		result.id = pistolID;
		result.ammo = 25;
		result.weapon = PISTOL();
		return result;
	}
	
	function smgItem(a,b){
		var result = new Item(a,b, iconSMG);
		result.id = SMGID;
		result.ammo = 25;
		result.weapon = SMG();
		return result;
	}
	
	function rifleItem(a,b){
		var result = new Item(a,b, iconRifle);
		result.id = rifleID;
		result.ammo = 25;
		result.weapon = RIFLE();
		return result;
	}
	
	///////////////
	//// Traps - On collision with a player, spring and perform verbs!
	
	function Trap(a,b,p, play){
		var result = new Item(a,b,p);

		if(play){//Trap is for player eyes only
			result.collideCreature = function(c){
				return c == creature[cS] && (c.collidePoint(this.x-20,this.y) || c.collidePoint(this.x + 20,this.y) || c.collidePoint(this.x-20,this.y+ 30) || c.collidePoint(this.x + 20,this.y + 30))
			}
		}
		result.collect = function(){
			makePrompt("This is a trap.", "Boom. .. Boom.... Boom?");
			this.collect = function(){};
		}
		return result;
	}
	
	function steamTrap(a,b){
		var result = new Trap(a,b, blankPic, true)
		
		result.collect = function(){
			dLights.push(new steamJet(this.x,this.y));
			this.x = -1000
	
		}
		return result
	}
	
	function messageTrap(a,b,p, messt, mess){
		var result = Trap(a,b,p, true);
		result.message = mess
		result.title = messt
		result.collect = function(){
			makePrompt(this.title, this.message);
			this.x = -1000
		}
		
		return result;
	}
	
	
		function spawnTrap(a,b,p, type, lev){
		var result = Trap(a,b,p, true);
		result.message = ""
		result.title = ""
		result.pic = blankPic
		result.type = type
		result.lev = lev
		result.collect = function(){
			if(this.type == 0){//spawn insect
				if(this.lev == 0)creature.push(LowInsect(this.x - 120 + rand(40),this.y-100,0));
				else if(this.lev == 1)creature.push(MedInsect(this.x - 120 + rand(40),this.y-100,0));
				else if(this.lev == 2)creature.push(HighInsect(this.x - 120 + rand(40),this.y-100,0));
				else if(this.lev == 3)creature.push(Bug(this.x - 120 + rand(40),this.y-100,0));
				else if(this.lev == 4)creature.push(Maggot(this.x - 120 + rand(40),this.y-100,0));
			}else if(this.type == 1){//spawn reptile
				if(this.lev == 0)creature.push(LowReptile(this.x - 120 + rand(40),this.y-100,1));
				else if(this.lev == 1)creature.push(MedReptile(this.x - 120 + rand(40),this.y-100,1));
				else creature.push(HighReptile(this.x - 100,this.y-120 + rand(40),1));
			}else if(this.type == 2){//spawn scientist
				if(this.lev == 0)creature.push(Scientist(this.x - 120 + rand(40),this.y-100,2));
				else if(this.lev == 1)creature.push(Scientist(this.x - 120 + rand(40),this.y-100,2));
				else creature.push(Scientist(this.x - 100,this.y-120 + rand(40),2));
			}else if(this.type == 3){//spawn marine
				if(this.lev == 0)creature.push(Marine(this.x - 120 + rand(40),this.y-100,2));
				else if(this.lev == 1)creature.push(Marine(this.x - 120 + rand(40),this.y-100,2));
				else creature.push(Marine(this.x - 120 + rand(40),this.y-100,2));
			}
			this.x = -1000
		}
		
		return result;
	}
	
	/////////////////////////////////////////////////
	////////////////////////////////////////////////
	///////////////////////////////////////////////
	
	
	function Maggot(a,b,t){
		var result = createCreature(80,45,40,155);
		result.x = a;
		result.y = b;
		result.greeting = addSound('Sounds/maggotGreeting.ogg');
		result.weapon.push(MaggotHead());
		result.weapon.push(insectHeal());
		result.stats.health = 100;
		result.stats.torso = 4;
		result.stats.legs= 2;
		result.stats.abdomen = 1;
		result.stats.hasArms = false;
		result.stats.wing = 1
		result.stats.hair = -1
		result.stats.type = t
		result.sw = 1
		return result
	}
	
	function Bug(a,b,t){
		var result = createCreature(80,45,40,155);
		result.x = a;
		result.y = b;
		result.greeting = addSound('Sounds/bugGreeting.ogg');
		result.weapon.push(Monster2Punch());
		result.weapon.push(insectHeal());
		result.stats.health = 50;
		result.stats.maxHealth = 50;
		result.stats.torso = 5;
		
			result.stats.legs= 2 + rand(1);
			result.stats.abdomen = rand(3);
		
		
		result.stats.hasArms = false;
		if(Math.random() < 0.5) result.stats.wing = 1
		else result.stats.wing = 0
		result.stats.hair = -1
		result.stats.type = t
		result.sw = 0
		return result
	}
	
	
	function BugHigh(a,b,t){
		var result = createCreature(80,45,40,155);
		result.x = a;
		result.y = b;
		result.weapon.push(Monster2Punch());
		result.weapon.push(insectHeal());
		result.stats.health = 100;
		result.stats.torso = 5;
		if(Math.random() < 0.5){
			result.stats.legs= 2 + rand(2);
			result.stats.abdomen = 1 + rand(2);
		}else{
			result.stats.legs= 4;
			result.stats.abdomen = 0;
		}
		
		result.stats.hasArms = false;
		if(Math.random() < 0.5) result.stats.wing = 1
		else result.stats.wing = 0
		result.stats.hair = -1
		result.stats.type = t
		result.sw = 0
		return result
	}
	
	
	function LowInsect(a,b,t){
		var result = createCreature(80,45,40,155);
		result.x = a;
		result.y = b;
		result.greets.push("Another one!");
		result.greets.push("Kill it!");
		result.greets.push("It's mine!");
		if(Math.random() > 0.5) result.greeting = addSound('Sounds/greeting2.ogg');
		else result.greeting = addSound('Sounds/greeting1.ogg')
		
		if(Math.random() < 0.5){
			result.weapon.push(PunchInsect());
			result.weapon.push(insectHeal());
		}else{
			result.weapon.push(Punch0());
			result.weapon.push(insectHeal());
			//result.giveGun(PISTOL(), 1);
		}
		result.weapon.push(blank());
		
		//result.sw = 1
		result.stats.health = 100;
		result.stats.torso = rand(2);
		result.stats.legs= rand(2);
		result.stats.abdomen = 0;
		result.stats.hasArms = true;
		result.stats.wing = 0
		result.stats.hair = rand(5)+1
		result.stats.type = t
		return result
	}
	
	function MedInsect(a,b,t){
		var result = createCreature(80,45,40,155);
		result.x = a;
		result.y = b;
		result.greets.push("Time to die!");
		result.greets.push("Kill it!");
		result.greets.push("No More!");
		if(Math.random() > 0.5) result.greeting = addSound('Sounds/greeting2.ogg');
		else result.greeting = addSound('Sounds/greeting1.ogg')
	if(Math.random() > 0.5){	
			result.weapon.push(PunchInsect());
			result.weapon.push(insectHeal());
			result.weapon.push(blank());
		}else{
			result.weapon.push(Punch0());
			result.weapon.push(insectHeal());
			if(Math.random() < 0.2) result.giveGun(SMG(), 2)
			else result.giveGun(PISTOL(),2)
			
		}
		
		if(Math.random() > 0.95) result.stats.armorPlate = true
		result.stats.health = 180;
		result.stats.torso = rand(2) + 1;
		result.stats.legs= 1 + rand(2);
		result.stats.abdomen = rand(2);
		result.stats.hasArms = true;
		result.stats.wing = rand(2)
		result.stats.hair = rand(5) + 1
		result.stats.type = t
		return result
	}
	
	function HighInsect(a,b,t){
		var result = createCreature(80,45,40,155);
		result.x = a;
		result.y = b;
		result.greets.push("Time to feast!");
		result.greets.push("More prey!");
		result.greets.push("Easy meat.");
		if(Math.random() > 0.5) result.greeting = addSound('Sounds/greeting2.ogg');
		else result.greeting = addSound('Sounds/greeting1.ogg')
		if(Math.random() > 0.5){	
			result.weapon.push(PunchInsect());
			result.weapon.push(insectHeal());
			result.weapon.push(blank());
		}else{
			result.weapon.push(Punch0());
			result.weapon.push(insectHeal());
			if(Math.random() < 0.5) result.giveGun(SMG(), 2)
			else result.giveGun(RIFLE(),2)
			
		}
		result.weapon.push(blank());
		result.stats.health = 250;
		result.stats.torso = 3;
		if(Math.random() < 0.5){
			result.stats.legs= 2 + rand(2);
			result.stats.abdomen = 1 + rand(2);
		}else{
			result.stats.legs= 4;
			result.stats.abdomen = 0;
		}
			if(Math.random() > 0.8) result.stats.armorPlate = true
		result.stats.hasArms = true;
		result.stats.wing = rand(2)
		result.stats.hair = rand(6)
		result.stats.type = t
		return result
	}
	
	function LowReptile(a,b,t){
		var result = createCreature(80,45,40,155);
		result.x = a;
		result.y = b;
		result.greets.push("Kill it!");
		result.greets.push("Another one!");
		result.greets.push("I'm on it!");
		result.weapon.push(Punch0());
		result.weapon.push(acidSpray());
		/*
		if(Math.random() < 0.2){
			result.giveGun(SMG(), 2);
		}else{
			result.giveGun(PISTOL(), 2);
		}*/
		
		result.sw = 0
		result.weapon.push(blank());
		
		result.stats.health = 100;
		result.stats.torso = rand(2);
		result.stats.legs= 0;
		result.stats.abdomen = 0;
		result.stats.hasArms = true;
		result.stats.wing = 0
		result.stats.hair = rand(5)+1
		result.stats.type = 1
		return result
	}
	
	function MedReptile(a,b,t){
		var result = createCreature(80,45,40,155);
		result.x = a;
		result.y = b;
		result.weapon.push(Punch0());
		result.weapon.push(acidSpray());
		result.greets.push("Not another one");
		result.greets.push("Kill it quick!");
		result.greets.push("Putrid creature!");
		if(Math.random() < 0.4){
			result.giveGun(SMG(), 2);
		}else{
			result.giveGun(RIFLE(), 2);
		}
		
		result.sw = 0
		result.stats.health = 150;
		result.stats.torso = rand(2) + 1;
		result.stats.legs= rand(2) + 1;
		result.stats.abdomen = 0;
		
		if(Math.random() > 0.9) result.stats.armorPlate = true
		result.stats.hasArms = true;
		result.stats.wing = rand(2)
		result.stats.hair = rand(5)+1
		result.stats.type = 1
		return result
	}
	
	function HighReptile(a,b,t){
		var result = createCreature(80,45,40,155);
		result.x = a;
		result.y = b;
		result.weapon.push(Punch0());
		result.weapon.push(acidSpray());
		result.greets.push("Break its bones!");
		result.greets.push("Make it bleed");
		result.greets.push("More prey meat.");
		if(Math.random() < 0.4){
			result.giveGun(SMG(), 2);
			result.giveGun(PISTOL(), 3);
		}else{
			result.giveGun(RIFLE(), 2);
			result.giveGun(SMG(), 3);
		}
		
		result.sw = 1 +rand(2)
		result.stats.health = 200;
		result.stats.torso = rand(2) + 1;
		result.stats.legs= 4 + rand(2);
		if(Math.random() > 0.65) {
			result.stats.legs = 6;
			result.stats.speed += 1
		}
		result.stats.abdomen = 0;
		result.stats.hasArms = true;
		
		if(Math.random() > 0.5) result.stats.armorPlate = true
		
		if(Math.random() > 0.6) result.stats.wing = 1
		else result.stats.wing = 0
		result.stats.hair = rand(5)+1
		result.stats.type = 1
		return result
	}

	
	
	function hitWall(x,y){
		var result = false;
		for(var i=0; i < wall.length;i++){
			if(wall[i].collidePoint(x,y)) return true
		}
		return false;
	}
	function createCreature(a,b,c,d){
		var wArray = [];
		var tPath = [];
		var eArray = [];
		var ga = [];
		
		var result = {
			homeRange:50+rand(100),
			x:300,
			y:-150,
			sx:0,
			sy:0,
			state:0,
			recoil:0,
			hasGun:true,
			fireCool:0,
			walkSpeed:5,
			aniFrame:1,
			reloading:-1,
			retarget:20,
			facing:0, 	//0 right, 1- left: based on mouse position
			cFloor:0,
			hitBox:{x:a,y:b,width:c,height:d},
			stats:{armorPlate:false, speed:5+Math.random(), jump:10, health:100, maxHealth:100, armor:0, arm:0, torso:0, legs:0, hair:1, abdomen:0, hasArms:true, wings:0, type:0}, //type 0- Insect, 1-Reptile
			weapon:wArray, 
			sw:0,
			light:true,
			aimer:{x:0,y:0},
			taimer:{x:0,y:0},
			aimerD:{x:rand(10) - 5,y: rand(10) - 5},
			canFire:true,
			deathF:0, //goes to 10
			speakAni:0,
			speech:"",
			greets:ga,
			greeting:null,
			target:-1,
			path: tPath,
			giveGun:function(w,i){
				updateWeapon(w, this.stats.type);
				this.weapon[i] = w;
			
			},
			enemies: eArray,
			targeter:200,
			getEnemies: function(){
				this.enemies = [];
				for(var i=0; i < creature.length; i++) if(this.stats.type != creature[i].stats.type && creature[i].stats.health > 0) this.enemies.push(creature[i]);
			},
			move:function(){
			
				this.targeter++
				
				if(this.targeter > 200) {
					//console.log("Refreshing target list...");
					this.getEnemies();
					this.targeter = 0;
					if(this.enemies.length > 0 && this.greeting != null){
						this.greeting.play();
					}
					if(this.greets.length > 0) this.speak(this.greets[rand(this.greets.length)]);
				
				}
				
				
				//Confirm target is valid
				if(this.target >= this.enemies.length || this.retarget == 0) this.target = -1;
				
				this.retarget--
				if(this.retarget <0) this.retarget = 20
				
				
				var eExist = this.enemies.length > 0;
				
				
				if(this.stats.health <= 0) eExist = false;
				
				//Find a target
				if(this.target == -1 && eExist){
					var bestInd = -1;
					var bestD = -1;
					
					for(var i=0; i < this.enemies.length;i++){
					
						if(dist(this.enemies[i].x, this.enemies[i].y, this.x, this.y) < bestD || bestD < 0){
							bestD = dist(this.enemies[i].x, this.enemies[i].y, this.x, this.y)
							bestInd = i
						}
					}
					
					this.target = bestInd;
					if(this.target != -1) {
						//In future paly sound here for when target 
					
					
					}
				}else if(eExist){
				//Confirm target is not allied
					if(this.enemies[this.target].stats.type == this.stats.type) {
						this.target = -1;
						this.enemies.splice(this.target,1);
						alert("error 59 this has no way to happen any more, ir does it?");
					}
					
					//Confirm enemy is not already dead
					if(this.enemies[this.target].stats.health <= 0){
						this.enemies.splice(this.target,1);
						this.target = -1
						this.speak("Target Down!");
						this.path = [];
					}
				}else this.target = -1;
				
				
				
				//If a useless character, stop targettting
				if(this.weapon[this.sw].useless) this.target = -1;
				
				
				if(this.target != -1){
				//Target is valid
					this.taimer.x = this.enemies[this.target].x + 100
					this.taimer.y = this.enemies[this.target].y + 100
					
				
					
					if(this.stats.type == 0){
					//Insect, switch to heal if needed
						if (this.stats.health < 40 && Math.abs(this.x + 100 - this.taimer.x) < 200) this.sw = 1;
					}
					
					if(this.stats.wing > 0){
						
					
					}
					
					if(this.path.length == 0){
							if(this.x - this.enemies[this.target].x < -50) {
								this.state = 2;
								this.sx = this.stats.speed;
							}else if(this.x - this.enemies[this.target].x > 50){
								this.state = 3;
								this.sx = this.stats.speed * -1;
							}
							
							if(dist(this.x, this.y, this.enemies[this.target].x, this.enemies[this.target].y) > 50){
								var start = {x:Math.floor((this.x + 100)/50), y: Math.floor((this.y + 100)/50)}
								var end = {x:Math.floor((this.enemies[this.target].x + 100)/50), y: Math.floor((this.enemies[this.target].y + 100)/50)}
								
								if(mapGrid[start.x][start.y].wall ) start = this.getCorner();
								if(mapGrid[end.x][end.y].wall ) end = this.enemies[this.target].getCorner();
								
								/*
								if(start.x < 0){
									console.log("Unable to find a clear corner, left or right.");
								}else console.log("Start position: " + mapGrid[start.x][start.y].wall);
								
								if(end.x < 0){
									console.log("Unable to find a clear corner on target, left or right.");
								}else console.log("End position: " + mapGrid[end.x][end.y].wall);
								*/
								if(start.x >= 0 && end.x >= 0){
									if(!mapGrid[start.x][start.y].wall && !mapGrid[end.x][end.y].wall) {
										this.path = aStar(start, end, this.stats.wing>0);
										this.path = smoothPath(this.path);
										}
									
								}else{//Either start pt or end point is absorbing walls, thus unreachable
									//console.log("Positions unreachable.. Aborting.");
									this.enemies.splice(this.target,1);
									this.path = []
									this.target = -1;
									
								}
							}
						}else{//Path exists, move along it
							if(dist(this.x + 100, this.y + 100, this.path[0].x*50 + 25, this.path[0].y*50 + 25) < 50) this.path.splice(0,1);
							else{//Move to path 0
								if(this.WillFire() != this.target && this.target >= 0 || this.weapon[this.sw].type != 1){
								
								if(this.x + 100 - this.path[0].x*50 -25< -30){
									this.state = 2;
									this.sx = this.stats.speed;
								}else if(this.x + 100 - this.path[0].x*50 -25 > 30){
									this.state = 3;
									this.sx = this.stats.speed * -1;
								}else if(this.falling()){
									this.sx = 2;
								
								}
								
								if(this.y + 100 - this.path[0].y*50 - 25 > -20)	this.jump();
								//There is no plan for down motion!	
									//this.speak("jump!");
								}else {
									if(this.weapon[this.sw] != null){
										if(this.weapon[this.sw].type == 1){
											this.sx = 0
											this.state = 0;
										}
									}
								}
								
							
								if(dist(this.x + 100, this.y + 100, this.path[0].x*50 + 50, this.path[0].y*50 + 50) > 100){
									var start = {x:Math.floor((this.x + 100)/50), y: Math.floor((this.y + 100)/50)}
									var end = {x:Math.floor((this.enemies[this.target].x + 100)/50), y: Math.floor((this.enemies[this.target].y + 100)/50)}
								
									if(mapGrid[start.x][start.y].wall ) start = this.getCorner();
									if(mapGrid[end.x][end.y].wall ) end = this.enemies[this.target].getCorner();
									if(start.x >= 0 && end.x >= 0){
										if(!mapGrid[start.x][start.y].wall && !mapGrid[end.x][end.y].wall){
											this.path = aStar(start, end, this.stats.wing>0);
											this.path = smoothPath(this.path);
										}
									}else{
										//console.log("Target Unreachable!  Removing from target list.")
										this.enemies.splice(this.target,1);
										this.path = []
										this.target = -1;
									}
								}
							}
						
						}
				
				
				//wierd gun problem
				if(this.weapon[this.sw].useless || this.weapon[this.sw] == null) this.sw = 0;//default punch!
				
				
					if((this.weapon[this.sw].type == 0 || this.weapon[this.sw].type ==3) && this.target>= 0){//melee selected
					
						//console.log(dist(this.x+100, this.y+100, creature[this.target].x+100, creature[this.target].y + 100));
						if(dist(this.x+100, this.y+100, this.enemies[this.target].x+100, this.enemies[this.target].y + 100) <= this.weapon[this.sw].stats.range) {
							if(this.fireCool <= 0 && this.canFire && this.recoil == 0)this.fire();
							
							if(dist(this.x+100, this.y+100, this.enemies[this.target].x+100, this.enemies[this.target].y + 100) <= 30) {
							//Too close, back up!
								if(this.facing == 0){
									this.state = 3;
									this.sx = this.stats.speed * -1;
								}else{
									this.state = 2;
									this.sx = this.stats.speed;
								}
								
								this.path = [];
							}else{
								this.sx = 0;
								this.state = 0;
							}
						
						}else if(this.path.length == 0){//Move to target
						
						
							//If hit obstacle
							for(var i=0; i < wall.length; i++) {
								if(wall[i].collidePoint(this.x +this.hitBox.x + this.sx, this.y +this.hitBox.y + this.hitBox.height - 5) ||wall[i].collidePoint(this.x +this.hitBox.x+ this.sx, this.y +this.hitBox.y + 5) || wall[i].collidePoint(this.x +this.hitBox.x + this.sx, this.y +this.hitBox.y + this.hitBox.height /2)){
								//left side has hit a wall.
								this.sx = 0;
								this.jump();
							}else if(wall[i].collidePoint(this.x +this.hitBox.x + this.hitBox.width+ this.sx, this.y +this.hitBox.y + this.hitBox.height - 5) || wall[i].collidePoint(this.x +this.hitBox.x + this.hitBox.width+ this.sx, this.y +this.hitBox.y + 5) || wall[i].collidePoint(this.x +this.hitBox.x + this.hitBox.width+ this.sx, this.y +this.hitBox.y + this.hitBox.height /2)){
								//right wall collision

								this.sx = 0;
								this.jump();
							}
						}
							
							
						}
						
						//Switch to other gun if possible
						if(this.weapon.length >= 4){
							if(!this.weapon[2].useless && this.weapon[2] != null && this.weapon[3] != null && !this.weapon[3].useless){
								if(Math.random() > 0.5){
									if(this.weapon[3].ammo + this.weapon[3].clip > 0) this.sw = 3
								}else{
									if(this.weapon[2].ammo + this.weapon[2].clip > 0) this.sw = 2
								}
							}else if((this.weapon[2].useless||this.weapon[2] == null) && this.weapon[3] != null && !this.weapon[3].useless) {
								if(this.weapon[3].ammo + this.weapon[3].clip > 0) this.sw = 3
							}
							else if(!this.weapon[2].useless && !this.weapon[3].useless && this.weapon[2] != null && this.weapon[3] == null){
								if(this.weapon[2].ammo + this.weapon[2].clip > 0) this.sw = 2
							}
						}else if(this.weapon.length == 3){
						//Have only 1 spare gun slot, the other two are melee by definition
							if(this.weapon[2] != null){
								if(!this.weapon[2].useless && this.weapon[2].ammo + this.weapon[2].clip > 0) this.sw = 2
							
							}
						}
					}else if(this.weapon[this.sw].type == 1){//Gun selected
					if(this.enemies[this.target] == null) this.target = -1
					if(this.path.length == 0 && this.target != -1){
				
						if(dist(this.x, this.y, this.enemies[this.target].x, this.enemies[this.target].y) < 250){//too close
							if(this.enemies[this.target].x < this.x){
							//target creature is on the left, so walk right
								this.sx = this.stats.speed;
								this.state = 2;
							}else{
							//target creature is on the right, so walk left
								this.sx = -this.stats.speed;
								this.state = 3
							}
						}else if(dist(this.x, this.y, this.enemies[this.target].x, this.enemies[this.target].y) > 400 /*&& this.stats.type == this.creature[cS].stats.type*/){//too close
							if(this.enemies[this.target].x < this.x){
							//target creature is on the left, so walk left
								this.sx = -this.stats.speed;
								this.state = 3;
							}else{
							//target creature is on the right, so walk right
								this.sx = this.stats.speed;
								this.state = 2
							}
						}
						
						if(Math.abs(this.x - this.enemies[this.target].x) < 50 && Math.abs(this.y - this.enemies[this.target].y) > 250){
							this.enemies.splice(this.target,1);
							this.target = -1;
						}
						
						
						}
						if(this.weapon[this.sw].ammo <= 0 && this.weapon[this.sw].clip <= 0 && this.weapon[this.sw].type == 1) {
							if(this.weapon[0] != null) this.sw = 0;
							this.speak("Ammo Out!");
							//alert("I'm out of ammo, switching to another gun ifpossilbe")
							///alert(this.weapon.length);
							for(var i=0; i < this.weapon.length; i++){
								if(this.weapon[i] != null && !this.weapon[i].useless){
									if(this.weapon[i].type == 1) {
										if(this.weapon[i].ammo > 0) this.sw = i;
									}
								}
							}
						}else if(this.fireCool <= 0 && this.canFire && this.recoil == 0 && this.reloading < 0){
							//Fire ranged weapon
							
							if(this.target != -1){
								if(dist(this.x, this.y, this.enemies[this.target].x, this.enemies[this.target].y) < w/2 && this.WillFireGeneral()){
								this.fire();
								}
							}
						}
					}
				}
			
				if(this.target == -1){
					this.taimer.x += this.aimerD.x
					this.taimer.y += this.aimerD.y
					this.sx = 0
					this.state = 0;
					
					if(this.taimer.x < this.x - 350 ) {
						this.aimerD.x = 2
						this.taimer.x = this.x - 340;
					}else if(this.taimer.x > this.x + 450) {
						this.aimerD.x = -2
						this.taimer.x = this.x + 440;
					}
					if(this.taimer.y < this.y - 50 ) {
						this.aimerD.y = 2
						this.taimer.y = this.y - 40;
					}else if(this.taimer.y > this.y + 200) {
						this.aimerD.y = -2
						this.taimer.y = this.y + 190;
					}
					//if(this.aimerD.y < this.y - 100 || this.aimerD.y > this.y + 150) this.aimerD.y *= -1
					if(this.retarget == 20 && rand(30) == 1){
						if(Math.random() > 0.5){
							this.sx = this.stats.speed;
							this.state = 2;								
						}else{
							this.sx = -this.stats.speed;
							this.state = 3
						}
					}
					
					//I near player and is of the same type, try to tag along
					 if( this.stats.type == creature[cS].stats.type){
						if(dist(creature[cS].x, creature[cS].y, this.x,this.y) < 250){	
							if(this.x < creature[cS].x - this.homeRange){
								this.sx = this.stats.speed;
								this.state = 2;
							}else if(this.x > creature[cS].x + this.homeRange){
								this.sx = -this.stats.speed;
								this.state = 3;
							}
							this.taimer.x = creature[cS].aimer.x
							this.taimer.y = creature[cS].aimer.y
						}
					}
					
				}
				
				if(!(this.x >= 0 && this.x < w*2) && this.stats.health > 0){
					
					this.stats.health = 0
					this.x = -100
					this.y = -100
				}
				
				//wierd gun problem
				if(this.weapon[this.sw].useless || this.weapon[this.sw] == null) this.sw = 0;//default punch!
				
			},
			jump:function(){
				if(this.sy == 0 && !this.falling() && this.stats.health > 0) {
					this.sy = -1.5 * this.stats.jump
					this.y -= 5
				}
				
				if(this.falling() && this.stats.wing > 0){
					this.sy -= this.stats.jump*2;
					//this.sy = -4
					if(this.sy < -1 * this.stats.jump) this.sy = this.stats.jump * -1
				}
			},
			lGun:-1,
			rGun:-1,
			drawBody:function(fNum, x,y){
				var off = 0;
				if(this.state != 0) off = 10;
				
				if(this.stats.type == 0){	//Insect
					if(this.stats.health > 0){
						//hip gun!
						ctx.translate(x+100,y + 120 + off)
						ctx.rotate(degRad(35))
						
						if(this.facing == 1){
							if(this.weapon[2]!= null && this.sw != 2)ctx.drawImage(this.weapon[2].IconPic, -50, -20)
						}else {
							if(this.weapon[3]!= null && this.sw != 3) ctx.drawImage(this.weapon[3].IconPic, -50, -20)
						}
						ctx.rotate(-degRad(35));
						ctx.translate(-x - 100, -120 - y - off)
					
						if(this.weapon[this.sw].stats.singleHand && this.stats.hasArms) ctx.drawImage(leftArm[0], fNum*200, 0, 200,200, x, y, 200,200);
						ctx.drawImage(InsectTorso[this.stats.torso], fNum*200, 0, 200,200, x, y, 200,200);
						if(this.stats.hair != -1) ctx.drawImage(hair[this.stats.hair], fNum*200, 0, 200,200, x, y, 200,200);

						if(this.stats.wing > 0) {
							if(this.falling() ){	
								ctx.drawImage(InsectLeg[this.stats.legs], (10+this.aniFrame%2)*200, 0, 200,200, x, y, 200,200);
								if(this.stats.armorPlate) ctx.drawImage(HumanArmor, fNum*200, 0, 200,200, x, y, 200,200);
						
								if(this.stats.abdomen > 0) ctx.drawImage(InsectAb[this.stats.abdomen], (10+this.aniFrame%2)*200, 0, 200,200, x, y, 200,200);
								ctx.drawImage(InsectWing[0], (this.aniFrame+9)*200, 0, 200,200, x, y, 200,200);
							}else {
								ctx.drawImage(InsectLeg[this.stats.legs], fNum*200, 0, 200,200, x, y, 200,200);
								if(this.stats.armorPlate) ctx.drawImage(HumanArmor, fNum*200, 0, 200,200, x, y, 200,200);
						
								if(this.stats.abdomen > 0) ctx.drawImage(InsectAb[this.stats.abdomen], fNum*200, 0, 200,200, x, y, 200,200);
								ctx.drawImage(InsectWing[0], fNum*200, 0, 200,200, x, y, 200,200);
							}
						}else{
							ctx.drawImage(InsectLeg[this.stats.legs], fNum*200, 0, 200,200, x, y, 200,200);
							if(this.stats.armorPlate) ctx.drawImage(HumanArmor, fNum*200, 0, 200,200, x, y, 200,200);
						
							if(this.stats.abdomen > 0) ctx.drawImage(InsectAb[this.stats.abdomen], fNum*200, 0, 200,200, x, y, 200,200);
						}
						if (this.weapon[this.sw].pic == null) ctx.drawImage(this.weapon[0].pic, x+ 95 + this.weapon[0].pX + this.weapon[0].oX,y+80 + this.weapon[0].pY + this.weapon[0].oY + off)//ctx.drawImage(this.weapon[0].pic, x+ 85 + this.weapon[0].oX,y+80 + this.weapon[0].oY + off)
						//hip guns!
						//Is always 3 and 4
						ctx.translate(x+100,y + 120 + off)
						ctx.rotate(degRad(30))
						
						if(this.facing == 0){
							if(this.weapon[2]!= null && this.sw != 2)ctx.drawImage(this.weapon[2].IconPic, -50, -20)
						}else {
							if(this.weapon[3]!= null && this.sw != 3) ctx.drawImage(this.weapon[3].IconPic, -50, -20)
						}
						ctx.rotate(-degRad(30));
						ctx.translate(-x - 100, -120 - y - off)
					}else{
						ctx.globalAlpha = (10-this.deathF)/10
						//ctx.save();
						ctx.translate(x+100,y+100+ this.deathF*9);
						ctx.rotate(degRad(-90 * this.deathF/10));
						ctx.drawImage(InsectTorso[this.stats.torso], 3*200, 0, 200,200,-100,-100, 200,200);
						ctx.drawImage(InsectLeg[this.stats.legs], 3*200, 0, 200,200, -100, -100, 200,200);
						if(this.stats.armorPlate) ctx.drawImage(HumanArmor, 600, 0, 200,200, x, y, 200,200);
						
						if(this.stats.abdomen > 0) ctx.drawImage(InsectAb[this.stats.abdomen], 3*200, 0, 200,200, -100, -100, 200,200);
						if(this.stats.hair != -1)ctx.drawImage(hair[this.stats.hair/*this.stats.torso*/], 3*200, 0, 200,200, -100, -100, 200,200);
						if(this.stats.wing >0) ctx.drawImage(InsectWing[0], 3*200, 0, 200,200, -100, -100, 200,200);
						
						if(this.weapon[this.sw].pic != null) ctx.drawImage(this.weapon[this.sw].pic, 0,0,150,40,this.weapon[this.sw].oX, this.weapon[this.sw].oY - 5, 150,40)
						else ctx.drawImage(this.weapon[0].pic, 0,0,150,40,this.weapon[0].oX, this.weapon[0].oY - 5, 150,40)
						
						ctx.rotate(degRad(90 * this.deathF/10));
						ctx.translate(-x-100,-y-100- this.deathF*9);
						
						//ctx.restore();
						if(ani == 0)this.deathF += 2;
						if(this.deathF > 10) {
							this.deathF = 10;
							this.stats.health = 0;
						}else{//Extra blood splatters for death sequence, not working quite right yet
							//bloodSplat.push(createBlood(this.x  +this.hitBox.x + rand(this.hitBox.width), this.y + this.hitBox.y + rand(this.hitBox.height) + this.deathF*9));
						
						}
						ctx.globalAlpha = 1;
					}
				}else if (this.stats.type == 1){	//Reptile
					if(this.stats.health > 0){
						ctx.translate(x+100,y + 120 + off)
						ctx.rotate(degRad(35))
						
						if(this.facing == 1){
							if(this.weapon[2]!= null && this.sw != 2)ctx.drawImage(this.weapon[2].IconPic, -50, -20)
						}else {
							if(this.weapon[3]!= null && this.sw != 3) ctx.drawImage(this.weapon[3].IconPic, -50, -20)
						}
						ctx.rotate(-degRad(35));
						ctx.translate(-x - 100, -120 - y - off)
					
						if(this.weapon[this.sw].stats.singleHand && this.stats.hasArms) ctx.drawImage(leftArm[0], fNum*200, 0, 200,200, x, y, 200,200);
						
					

						ctx.drawImage(ReptileTorso[this.stats.torso], fNum*200, 0, 200,200, x, y, 200,200);
						if(this.stats.hair != -1)ctx.drawImage(hair[this.stats.hair], fNum*200, 0, 200,200, x, y, 200,200)
							
						if(this.stats.wing > 0) {
							if(this.falling() ){
								ctx.drawImage(ReptileLeg[this.stats.legs], (10+this.aniFrame%2)*200, 0, 200,200, x, y, 200,200);
								if(this.stats.armorPlate) ctx.drawImage(HumanArmor, fNum*200, 0, 200,200, x, y, 200,200);
						
								ctx.drawImage(ReptileWing[0], (this.aniFrame+9)*200, 0, 200,200, x, y, 200,200);
							}else {
								ctx.drawImage(ReptileLeg[this.stats.legs], fNum*200, 0, 200,200, x, y, 200,200);
								if(this.stats.armorPlate) ctx.drawImage(HumanArmor, fNum*200, 0, 200,200, x, y, 200,200);
						
								ctx.drawImage(ReptileWing[0], fNum*200, 0, 200,200, x, y, 200,200);
							}
						}else{	
							ctx.drawImage(ReptileLeg[this.stats.legs], fNum*200, 0, 200,200, x, y, 200,200);
							if(this.stats.armorPlate) ctx.drawImage(HumanArmor, fNum*200, 0, 200,200, x, y, 200,200);
						}
						//if(this.stats.abdomen > 0) ctx.drawImage(InsectAb, fNum*200, 0, 200,200, x, y, 200,200);
						ctx.translate(x+100,y + 120 + off)
						ctx.rotate(degRad(30))
						
						if(this.facing == 0){
							if(this.weapon[2]!= null && this.sw != 2)ctx.drawImage(this.weapon[2].IconPic, -50, -20)
						}else {
							if(this.weapon[3]!= null && this.sw != 3) ctx.drawImage(this.weapon[3].IconPic, -50, -20)
						}
						ctx.rotate(-degRad(30));
						ctx.translate(-x - 100, -120 - y - off)
						if (this.weapon[this.sw].pic == null) ctx.drawImage(this.weapon[0].pic, x+ 85,y+70 + off)
						
					}else{
						ctx.globalAlpha = (10-this.deathF)/10
						//ctx.save();
						ctx.translate(x+100,y+100+ this.deathF*9);
						ctx.rotate(degRad(-90 * this.deathF/10));
						ctx.drawImage(ReptileTorso[this.stats.torso], 3*200, 0, 200,200,-100,-100, 200,200);
						ctx.drawImage(ReptileLeg[this.stats.legs], 3*200, 0, 200,200, -100, -100, 200,200);
						if(this.stats.armorPlate) ctx.drawImage(HumanArmor, 600, 0, 200,200, x, y, 200,200);
						
						//if(this.stats.abdomen > 0) ctx.drawImage(InsectAb, 3*200, 0, 200,200, -100, -100, 200,200);
						if(this.stats.hair != -1)ctx.drawImage(hair[this.stats.hair], 3*200, 0, 200,200, -100, -100, 200,200);
						if(this.stats.wing >0) ctx.drawImage(ReptileWing[0], 3*200, 0, 200,200, -100, -100, 200,200);
						
						
						if(this.weapon[this.sw].pic != null) ctx.drawImage(this.weapon[this.sw].pic, 0,0,150,40,this.weapon[this.sw].oX, this.weapon[this.sw].oY - 5, 150,40)
						else ctx.drawImage(this.weapon[0].pic, 0,0,150,40,this.weapon[0].oX, this.weapon[0].oY - 5, 150,40)
						
						
						ctx.rotate(degRad(90 * this.deathF/10));
						ctx.translate(-x-100,-y-100- this.deathF*9);
						
						//ctx.restore();
						if(ani == 0) this.deathF += 2;
						if(this.deathF > 10) {
							this.deathF = 10;
							this.stats.health = 0;
						}else{//Extra blood splatters for death sequence, not working quite right yet
							//bloodSplat.push(createBlood(this.x  +this.hitBox.x + rand(this.hitBox.width), this.y + this.hitBox.y + rand(this.hitBox.height) + this.deathF*9));
						
						}
						ctx.globalAlpha = 1;
					}
				}else if(this.stats.type == 3){ 
				
					if(this.stats.health > 0){
						//hip gun!
						ctx.translate(x+100,y + 120 + off)
						ctx.rotate(degRad(35))
						
						if(this.facing == 1){
							if(this.weapon[2]!= null && this.sw != 2)ctx.drawImage(this.weapon[2].IconPic, -50, -20)
						}else {
							if(this.weapon[3]!= null && this.sw != 3) ctx.drawImage(this.weapon[3].IconPic, -50, -20)
						}
						ctx.rotate(-degRad(35));
						ctx.translate(-x - 100, -120 - y - off)
					
						if(this.weapon[this.sw].stats.singleHand && this.stats.hasArms) ctx.drawImage(leftArm[1], fNum*200, 0, 200,200, x, y, 200,200);
						ctx.drawImage(HumanTorso[this.stats.torso], fNum*200, 0, 200,200, x, y, 200,200);
						
						if(this.stats.hair != -1) ctx.drawImage(hair[this.stats.hair], fNum*200, 0, 200,200, x, y, 200,200);

						if(this.stats.wing > 0) {
							if(this.falling() ){	
								ctx.drawImage(HumanLeg[this.stats.legs], (10+this.aniFrame%2)*200, 0, 200,200, x, y, 200,200);
								//if(this.stats.abdomen > 0) ctx.drawImage(InsectAb[this.stats.abdomen], (10+this.aniFrame%2)*200, 0, 200,200, x, y, 200,200);
								//ctx.drawImage(InsectWing[0], (this.aniFrame+9)*200, 0, 200,200, x, y, 200,200);
							}else {
								ctx.drawImage(HumanLeg[this.stats.legs], fNum*200, 0, 200,200, x, y, 200,200);
								//if(this.stats.abdomen > 0) ctx.drawImage(InsectAb[this.stats.abdomen], fNum*200, 0, 200,200, x, y, 200,200);
								//ctx.drawImage(InsectWing[0], fNum*200, 0, 200,200, x, y, 200,200);
							}
						}else{
							ctx.drawImage(HumanLeg[this.stats.legs], fNum*200, 0, 200,200, x, y, 200,200);
							//if(this.stats.abdomen > 0) ctx.drawImage(InsectAb[this.stats.abdomen], fNum*200, 0, 200,200, x, y, 200,200);
						}
						if (this.weapon[this.sw].pic == null) ctx.drawImage(this.weapon[0].pic, x+ 85,y+70 + off)
						//hip guns!
						//Is always 3 and 4
						ctx.translate(x+100,y + 120 + off)
						ctx.rotate(degRad(30))
						
						if(this.facing == 0){
							if(this.weapon[2]!= null && this.sw != 2)ctx.drawImage(this.weapon[2].IconPic, -50, -20)
						}else {
							if(this.weapon[3]!= null && this.sw != 3) ctx.drawImage(this.weapon[3].IconPic, -50, -20)
						}
						ctx.rotate(-degRad(30));
						ctx.translate(-x - 100, -120 - y - off)
					}else{
						ctx.globalAlpha = (10-this.deathF)/10
						//ctx.save();
						ctx.translate(x+100,y+100+ this.deathF*9);
						ctx.rotate(degRad(-90 * this.deathF/10));
						ctx.drawImage(HumanTorso[this.stats.torso], 3*200, 0, 200,200,-100,-100, 200,200);
						ctx.drawImage(HumanLeg[this.stats.legs], 3*200, 0, 200,200, -100, -100, 200,200);
						//if(this.stats.abdomen > 0) ctx.drawImage(InsectAb[this.stats.abdomen], 3*200, 0, 200,200, -100, -100, 200,200);
						if(this.stats.hair != -1)ctx.drawImage(hair[this.stats.hair/*this.stats.torso*/], 3*200, 0, 200,200, -100, -100, 200,200);
						//if(this.stats.wing >0) ctx.drawImage(InsectWing[0], 3*200, 0, 200,200, -100, -100, 200,200);
						
						if(this.weapon[this.sw].pic != null) ctx.drawImage(this.weapon[this.sw].pic, 0,0,150,40,this.weapon[this.sw].oX, this.weapon[this.sw].oY - 5, 150,40)
						else ctx.drawImage(this.weapon[0].pic, 0,0,150,40,this.weapon[0].oX, this.weapon[0].oY - 5, 150,40)
						
						
						
					
						ctx.rotate(degRad(90 * this.deathF/10));
						ctx.translate(-x-100,-y-100- this.deathF*9);
						
						//ctx.restore();
						if(ani == 0)this.deathF += 2;
						if(this.deathF > 10) {
							this.deathF = 10;
							this.stats.health = 0;
						}else{//Extra blood splatters for death sequence, not working quite right yet
							//bloodSplat.push(createBlood(this.x  +this.hitBox.x + rand(this.hitBox.width), this.y + this.hitBox.y + rand(this.hitBox.height) + this.deathF*9));
						
						}
						ctx.globalAlpha = 1;
					}
				}
			},
			die:function(){
				for(var i=2; i < this.weapon.length; i++) this.dropWeapon(i);
			},
			dropWeapon:function(i){
				if(i >= 2 && i < this.weapon.length && this.weapon[i] != null){
					this.weapon[i].drop(this.x + 50, this.y + 150);
					this.weapon[i] = blank();
					this.sw = 0
				}
			},
			speak:function(words){
				this.speech = words;
				this.speakAni = 0;// words.length * 2;
			},
			sayWords:function(){
				//Speech
				if(this.speech != ""){
					ctx.fillStyle = 'white'
					if(this.speakAni < this.speech.length && this.speakAni > 0) {
						ctx.fillStyle = 'black'
						ctx.fillText(this.speech.slice(0,this.speakAni), this.x + 99 - ctx.measureText(this.speech.slice(0,this.speakAni)).width/2, this.y+ 46)
						ctx.fillStyle = 'white'
						ctx.fillText(this.speech.slice(0,this.speakAni), this.x + 100 - ctx.measureText(this.speech.slice(0,this.speakAni)).width/2, this.y+ 45)
				
					}else if(this.speakAni >= this.speech.length) {
						ctx.fillStyle = 'black'
					ctx.fillText(this.speech, this.x + 100 - ctx.measureText(this.speech).width/2 - 1, this.y+ 46)
						ctx.fillStyle = 'white'
						ctx.fillText(this.speech, this.x + 100 - ctx.measureText(this.speech).width/2, this.y+ 45)
					}
					if(ani == 0) this.speakAni+=2;
				
					if(this.speakAni > this.speech.length * 2) {
						this.speakAni = 0;
						this.speech = "";
					}
				}
			
			
			},
			fall:false,
			stepped:false,
			draw:function(){
				//ctx.fillStyle = 'yellow'
				//ctx.fillText(this.weapon[this.sw].clip + " / " + this.weapon[this.sw].ammo, this.x, this.y);
				//ctx.fillText(this.weapon[this.sw].name + " " + this.sw, this.x, this.y);
				ctx.font = "11pt Orbitron"
				fall = this.falling();
				this.stepped = false;
				//Check horizontals
				//ctx.fillStyle = 'green'
				//ctx.fillRect(this.x + this.hitBox.x, this.y + this.hitBox.y, this.hitBox.width, this.hitBox.height);
				for(var i=0; i < wall.length; i++) {
					//if(wall[i].collidePoint(this.x +this.hitBox.x + this.sx, this.y +this.hitBox.y + this.hitBox.height - 5) ||wall[i].collidePoint(this.x +this.hitBox.x+ this.sx, this.y +this.hitBox.y + 5) || wall[i].collidePoint(this.x +this.hitBox.x + this.sx, this.y +this.hitBox.y + this.hitBox.height /2)){
					if(this.collideLeft(wall[i])){
					//left side has hit a wall.
						
						//Check for stairs
						if(!wall[i].collidePoint(this.x +this.hitBox.x + this.sx, this.y +this.hitBox.y + this.hitBox.height - 35) && !fall){
							this.sy = 0;
							this.x += this.sx
							this.falling();
							if(!hitWall(this.x + this.hitBox.x, this.cFloor + this.hitBox.y)){
								this.y = this.cFloor;
								this.stepped = true;
							}else{
								this.x -= this.sx
								this.sx = 0
								this.state = 0;
							}
						}else{
							this.x += Math.abs((wall[i].x + wall[i].width) - (this.x + this.hitBox.x)) + 1
							this.sx = 0;
						}
					//}else if(wall[i].collidePoint(this.x +this.hitBox.x + this.hitBox.width+ this.sx, this.y +this.hitBox.y + this.hitBox.height - 5) || wall[i].collidePoint(this.x +this.hitBox.x + this.hitBox.width+ this.sx, this.y +this.hitBox.y + 5) || wall[i].collidePoint(this.x +this.hitBox.x + this.hitBox.width+ this.sx, this.y +this.hitBox.y + this.hitBox.height /2)){
					}else if(this.collideRight(wall[i])){
					//right wall collision
						
						//Check for stair step
						if(!wall[i].collidePoint(this.x +this.hitBox.x + this.hitBox.width+ this.sx, this.y +this.hitBox.y + this.hitBox.height - 35) && !fall){
							this.sy = 0;
							this.x += this.sx
							this.falling();
							if(!hitWall(this.x + this.hitBox.x + this.hitBox.width, this.cFloor + this.hitBox.y)){
								this.y = this.cFloor;
								this.stepped = true;
							}else{
								this.x -= this.sx
								this.sx = 0
								this.state = 0;
							}
						}else{
							this.x -= Math.abs((wall[i].x) - (this.x +this.hitBox.x + this.hitBox.width)) + 1
							this.sx = 0;
						}
					}
				}
				if(!this.stepped) this.x += this.sx;
			
				
				//	ctx.fillStyle = 'green'
				//ctx.fillRect(this.x + this.hitBox.x, this.y + this.hitBox.y, this.hitBox.width, this.hitBox.height)
				ctx.save()
				
				//ctx.fillText(this.aimer.x + " " + this.aimer.y + " - " + this.taimer.x + " " + this.taimer.y, this.x, this.y+10); 
				
				//Process aiming
				dA = {x:Math.abs(this.taimer.x - this.aimer.x), y: Math.abs(this.taimer.y - this.aimer.y)}
				
				if(this.aimer.x < this.taimer.x - 100) this.aimer.x+=dA.x/5
				else if(this.aimer.x > this.taimer.x + 100) this.aimer.x-=dA.x/5;
				else this.aimer.x = this.taimer.x
				
				if(this.aimer.y < this.taimer.y - 100) this.aimer.y+=dA.y/5
				else if(this.aimer.y > this.taimer.y + 100) this.aimer.y-=dA.y/5;
				else this.aimer.y = this.taimer.y
				
				
				//if(this.aimer.x >= this.x + 100){
				if((this.aimer.x > (90+this.weapon[this.sw].pX+this.x))){
					//facing right
					this.facing = 0
				}else{
					//facing left
					ctx.translate(this.x,this.y);
					ctx.scale(-1,1);
					this.facing = 1;
				}
				
		
				if(this.falling()){
				//fall
					this.sy += 2;
					this.state = 1;
					
					if(this.stats.wing > 0){
						//This is the reptile wing
						this.sy -= 1;
					}
					
					if(this.y > h*2 - 300) {
						this.sy = 0;
						this.y = h*2 - 300;
					}
				}
				
				
				if(this.state == 1 && !this.falling()) {//Airborne, collision with ground detected
					this.hitBox.y = 45
					this.hitBox.height = 155
				
					if(this.sy > 0){
						this.state = 0;
						this.y = this.cFloor;
						this.sy = 0;	
					}
				}
					
				//Fallen into floor
				if (this.y + this.sy > this.cFloor && !this.falling()){
					this.sy = this.cFloor - this.y;
					this.state = 0
				}
				
				//hit head on ceiling
				if(this.hitHead() && this.sy <= 0)this.sy = 0;
				
				
				if(this.sy > terminalVel) this.sy = terminalVel;
				else if(this.sy < -terminalVel) this.sy = -terminalVel;
				
				this.y += this.sy;
				
				
				if(this.state == 0){//Standing Still
					if(this.facing==0)	{
						this.drawBody(0, this.x,this.y);
					}else {
						this.drawBody(0, -200,0);
					}
					this.sx = 0;
					this.aimArm(0);
					this.hitBox.y = 45
					this.hitBox.height = 155
				}else if(this.state == 1){//Jumping 
					if(this.facing == 0) this.drawBody(10, this.x,this.y);
					else this.drawBody(10, -200, 0);
					
					this.aimArm(-1)
					this.hitBox.y = 45 //aborting jump hitbox resize
					this.hitBox.height = 155
					if(ani == 0)this.aniFrame++;
					if(this.aniFrame > 2) this.aniFrame = 0;
				}else if(this.state == 2){//walking right
					if(this.facing == 0){
						this.drawBody(this.aniFrame, this.x,this.y);
					}else {
						this.drawBody(9 - this.aniFrame, -200, 0);
					}
					
					this.aimArm(2);
					this.hitBox.y = 45
					this.hitBox.height = 155
					if(ani == 0)this.aniFrame++;
					if(this.aniFrame > 8) this.aniFrame = 1;
					
					
					
					//Check horizontal collisions.
				//	for(var i=0; i < wall.length; i++) if(this.collideWallMove(wall[i])) this.sx = 0;
				}else if(this.state == 3){//walking left
					//this.sx = -1 * this.stats.speed;
					
					if(this.facing == 0) {
						this.drawBody(9 - this.aniFrame, this.x,this.y);
					}else {
						this.drawBody(this.aniFrame, -200, 0);
					}
					this.hitBox.y = 45
					this.hitBox.height = 155
					this.aimArm(2);
					if(ani == 0) this.aniFrame++;
					if(this.aniFrame > 8) this.aniFrame = 1;
	
				}else if(this.state == 4){//crouch
					
						if(this.facing == 0) {
							this.drawBody(9, this.x,this.y + 25);
						}else {
							this.drawBody(9, -200, 25);
						}
				//be sure to fix the hair, a regular hair from frame 1 (The second frame) has the same hair height as the jump frame
					this.hitBox.y = 80
					this.hitBox.height = 120
					this.aimArm(0);
					this.sx = 0;
				}else if(this.state == 5){
				//Death Animation
				//After animation remove creature from list in game engine, prevent shooting dead creature
					if(this.facing == 0) {
						this.drawBody(9, this.x,this.y);
					}else {
						this.drawBody(9, -200, 0);
					}
				}else{//Just in case something crazy happens
					this.hitBox.y = 45
					this.hitBox.height = 155
				}
		
				ctx.restore();
				
				
				//Check collisions with items
				for(var i=0; i < items.length; i++){
					if(items[i].collideCreature(this))items[i].collect(this)
				}
				
				//Health bar
				if(this.stats.health > 0){
					ctx.fillStyle = '#220000'
					//ctx.fillRect(this.x + 40, this.y + 50, 2, 10);
					ctx.fillStyle = '#FF0000'
					//ctx.fillRect(this.x + 40, this.y + 60 - this.stats.health/10, 2, this.stats.health/10)
				}else {
					this.state = 0;
					this.die()
				}
				
				//Cool lights!
				if(this.weapon[this.sw].type == 1 && this.light){
					var dc = dist(this.x+100, this.y+100, this.aimer.x,this.aimer.y)
					//if(dc > 130) roundLight(this.aimer.x,this.aimer.y, dc/2, 200/dc);
					//else roundLight(this.aimer.x,this.aimer.y, 70, 1);
					/*
					if(Math.floor(this.aimer.x/100) >= 0 && Math.floor(this.aimer.x/100) < mapGrid.length && Math.floor(this.aimer.y/100) >= 0 && Math.floor(this.aimer.y/100) < mapGrid[0].length){
						for(var i=0; i< mapGrid[Math.floor(this.aimer.x/100)][Math.floor(this.aimer.y/100)].panels.length; i++){
							wallPanels[mapGrid[Math.floor(this.aimer.x/100)][Math.floor(this.aimer.y/100)].panels[i]].light += 0.2
						}
					}
					*/
					//lightArea(this.aimer.x, this.aimer.y,1,0.1);
					//ctx.fillStyle = 'yellow'
					//ctx.fillText(Math.floor(dc) + " " + (1-dc/1200)/10, this.x, this.y);
					if(dc > 50 && dc < 1200) lightRegion(this.aimer.x,this.aimer.y, Math.floor((dc/2)/lightRes), (1- dc/1200)/3);
					else if(dc <= 50) lightRegion(this.aimer.x,this.aimer.y, 5, 0.2);
				}
				//	Path stuff
				/*
				ctx.fillStyle = 'red'
				ctx.fillText(this.path.length, this.x + 100, this.y + 100, 10,10);
				ctx.beginPath()
				ctx.moveTo(this.x+100, this.y+100);
				ctx.strokeStyle = 'yellow'
				for(var i=0; i < this.path.length; i++){
					ctx.lineTo(this.path[i].x*50 + 25, this.path[i].y*50 + 25);
				
				}
				ctx.stroke()
				ctx.closePath();
				ctx.strokeStyle = 'black'*/
				
			},
			aimArm:function(x){
				var angle = Math.atan((this.aimer.y - (this.y + 80 + this.weapon[this.sw].pY)) / (this.aimer.x-(90+this.weapon[this.sw].pX+this.x)))
				var off = 0 
				
			
				
				if(x == 0) off = 10
				if(this.state == 4) off -= 35
				this.canFire = true;
				if(this.facing == 0){
					
				}else angle*= -1
				
				
				
				//if(this.reloading != -1) angle = 0;  //Some kind of forced reloading holding angle
	
				if(this.stats.health <= 0){
					if(this.facing == 0) angle = -1.1;
					else angle = 1.1
					off -= this.deathF*8;
					this.recoil = 0;
					this.canFire = false
					this.fireCool = 0;
					
				}
				if(this.stats.health >0){
				//ctx.save();
				
					if(this.facing == 0) ctx.translate(95+this.x+ this.weapon[this.sw].pX, 90 + this.y - off+ this.weapon[this.sw].pY);
					else ctx.translate(95 - 200 + rand(0)+ this.weapon[this.sw].pX, 90 + rand(0) - off+ this.weapon[this.sw].pY);
				
				if(this.recoil > 0)	angle -= degRad(rand(5));
				ctx.rotate(angle);
		
				if(this.recoil > 0) {
					if(this.weapon[this.sw].firePic[this.recoil-1] == null){
						this.recoil = 1
					}
					if(this.weapon[this.sw].type == 1 && this.light) directedLight(50, 0, 100);
					if(this.weapon[this.sw].firePic.length > 0)ctx.drawImage(this.weapon[this.sw].firePic[this.recoil - 1], this.weapon[this.sw].oX - 1, this.weapon[this.sw].oY)
					
					//if (this.weapon[this.sw].type == 3) ctx.drawImage(this.weapon[0].firePic[this.recoil - 1], this.weapon[0].oX - 1, this.weapon[0].oY)
				
					 this.recoil--;
				}else {
				
					if(this.reloading == -1) {
						if(this.weapon[this.sw].type == 1 &&this.light)directedLight(50, 0, 100);
						if(this.weapon[this.sw].pic != null) ctx.drawImage(this.weapon[this.sw].pic, 0,0,150,40,this.weapon[this.sw].oX, this.weapon[this.sw].oY, 150,40)
						//if (this.weapon[this.sw].type == 3)ctx.drawImage(this.weapon[0].pic, 0,0,150,40,this.weapon[0].oX-13, this.weapon[0].oY+10, 150,40)
					}else{
						if(this.weapon[this.sw].type == 1 && this.light)directedLight(50, 0, 100);
						if(this.weapon[this.sw].pic!= null) ctx.drawImage(this.weapon[this.sw].pic, 0,this.reloading * 40 + 40,150,40,this.weapon[this.sw].oX, this.weapon[this.sw].oY, 150,40)
						//if (this.weapon[this.sw].type == 3) ctx.drawImage(this.weapon[0].pic, 0,this.reloading * 40 + 40,150,40,this.weapon[0].oX -13, this.weapon[0].oY+10, 150,40)
					
						if(ani == 0) this.reloading += 1;
						if(this.reloading > 2) this.reloading = -1;
					}
						
				}
				//ctx.restore();
				ctx.rotate(-angle);
				}
				if(this.fireCool > 0) this.fireCool--;
				
			},
			falling:function(){
				//this.cFloor = 0;
				//return this.y < 0
				this.cFloor = -1;
				var result = true;
				for(var i=0; i < wall.length; i++) if(this.collideBottom(wall[i])) {result = false; this.cFloor = wall[i].y - 200;}
				
				return result;
			},
			hitHead:function(){
				
				var result = false;
				for(var i=0; i < wall.length; i++) if(this.collideTop(wall[i])) {result = true;}
				
				return result;
			},
			collideCreature:function(obj){
			
			
			},
			collidePoint:function(x,y){
				return (x >= this.x + this.hitBox.x && x <= this.x+this.hitBox.x + this.hitBox.width && y >= this.y + this.hitBox.y && y <= this.y + this.hitBox.y + this.hitBox.height)
			},
			collideLeft: function(obj){
				var result = false;
				for(var i = this.y + this.hitBox.y + 5;i < this.y + this.hitBox.y + this.hitBox.height - 5; i+=10){
					if(obj.collidePoint(this.x + this.hitBox.x + this.sx, i)) return true
				}
				
				return result;
			},
			collideRight:function(obj){
				var result = false;
				for(var i = this.y + this.hitBox.y + 5; i < this.y + this.hitBox.y + this.hitBox.height - 5; i+=10){
					if(obj.collidePoint(this.x + this.hitBox.x + this.hitBox.width + this.sx, i)) return true
				}
				
				return result;
			},
			collideWall:function(obj){
				var result = false;
				
				if(this.collidePoint(obj.x,obj.y)) result = true;
				else if(this.collidePoint(obj.x + obj.width,obj.y)) result = true;
				else if(this.collidePoint(obj.x,obj.y + obj.height)) result = true;
				else if(this.collidePoint(obj.x + obj.width,obj.y + obj.height)) result = true;
				
				if(obj.collidePoint(this.x + this.hitBox.x, this.y + this.hitBox.y)) result = true;
				else if(obj.collidePoint(this.x + this.hitBox.x + this.hitBox.width, this.y + this.hitBox.y)) result = true;
				else if(obj.collidePoint(this.x + this.hitBox.x, this.y + this.hitBox.y + this.hitBox.height)) result = true;
				else if(obj.collidePoint(this.x + this.hitBox.x + this.hitBox.width, this.y + this.hitBox.y + this.hitBox.height)) result = true;
				
				return result;
			},
			collideBottom:function(obj){
				var result = false;
				
				//if(this.collidePoint(obj.x,obj.y)) result = true;
				//else if(this.collidePoint(obj.x + obj.width,obj.y)) result = true;
				if(this.collidePoint(obj.x,obj.y + obj.height)) result = true;
				else if(this.collidePoint(obj.x + obj.width/2,obj.y + obj.height)) result = true;
				else if(this.collidePoint(obj.x + obj.width,obj.y + obj.height)) result = true;
				
				//if(obj.collidePoint(this.x + this.hitBox.x, this.y + this.hitBox.y)) result = true;
				//else if(obj.collidePoint(this.x + this.hitBox.x + this.hitBox.width, this.y + this.hitBox.y)) result = true;
				if(obj.collidePoint(this.x + this.hitBox.x, this.y + this.hitBox.y + this.hitBox.height + this.sy)) result = true;
				else if(obj.collidePoint(this.x + this.hitBox.x + this.hitBox.width/2, this.y + this.sy + this.hitBox.y + this.hitBox.height)) result = true;
				else if(obj.collidePoint(this.x + this.hitBox.x + this.hitBox.width, this.y + this.sy + this.hitBox.y + this.hitBox.height)) result = true;
				
				return result;
			},
			collideTop:function(obj){
				var result = false;
				
				//if(this.collidePoint(obj.x,obj.y)) result = true;
				//else if(this.collidePoint(obj.x + obj.width,obj.y)) result = true;
				//if(this.collidePoint(obj.x,obj.y + obj.height)) result = true;
				//else if(this.collidePoint(obj.x + obj.width,obj.y + obj.height)) result = true;
				
				if(obj.collidePoint(this.x + this.hitBox.x, this.y + this.hitBox.y + this.sy)) result = true;
				else if(obj.collidePoint(this.x + this.hitBox.x + this.hitBox.width, this.y + this.hitBox.y + this.sy)) result = true;
				else if(obj.collidePoint(this.x + this.hitBox.x + this.hitBox.width/3, this.y + this.hitBox.y + this.sy)) result = true;
				else if(obj.collidePoint(this.x + this.hitBox.x + this.hitBox.width*2/3, this.y + this.hitBox.y + this.sy)) result = true;
				//if(obj.collidePoint(this.x + this.hitBox.x, this.y + this.hitBox.y + this.hitBox.height)) result = true;
				//else if(obj.collidePoint(this.x + this.hitBox.x + this.hitBox.width, this.y + this.hitBox.y + this.hitBox.height)) result = true;
				
				return result;
			},
			getCorner:function(){
			//Returns a corner on the hitbox not currently impacting any walls or stuck in mapGrid
				var result = {x:-1,y:-1}
				
				//console.log("getCorner report.");
				//console.log("Left coordinates: " + Math.floor((this.x + this.hitBox.x)/100) + ", " + Math.floor((this.y + this.hitBox.y)/100) + "--> " + mapGrid[Math.floor((this.x + this.hitBox.x)/100)][Math.floor((this.y + this.hitBox.y)/100)]);
				//console.log("Right coordinates: " + Math.floor((this.x + this.hitBox.x + this.hitBox.width)/100) + ", " + Math.floor((this.y + this.hitBox.y)/100));
				if(mapGrid[Math.floor((this.x + this.hitBox.x)/50)][Math.floor((this.y + this.hitBox.y)/50)].wall == false) {
					result = {x:Math.floor((this.x + this.hitBox.x)/50), y:Math.floor((this.y + this.hitBox.y)/50)};
					//console.log("Top left corner is fine.");
			}else if(mapGrid[Math.floor((this.x + this.hitBox.x + this.hitBox.width)/50)][Math.floor((this.y + this.hitBox.y)/50)].wall == false) result = {x:Math.floor((this.x + this.hitBox.x + this.hitBox.width)/50), y:Math.floor((this.y + this.hitBox.y)/50)};
				
				
				return result;
			},
			collideWallMove:function(obj){//Allows a 1 pixel slippery area
				var result = false;
				
				if(this.collidePoint(obj.x+1,obj.y+1)) result = true;
				else if(this.collidePoint(obj.x + obj.width - 1,obj.y+1)) result = true;
				else if(this.collidePoint(obj.x + 1,obj.y + obj.height + 1)) result = true;
				else if(this.collidePoint(obj.x + obj.width-1,obj.y + obj.height - 1)) result = true;
				
				if(obj.collidePointNoEdge(this.x + this.hitBox.x, this.y + this.hitBox.y)) result = true;
				else if(obj.collidePointNoEdge(this.x + this.hitBox.x + this.hitBox.width, this.y + this.hitBox.y)) result = true;
				else if(obj.collidePointNoEdge(this.x + this.hitBox.x, this.y + this.hitBox.y + this.hitBox.height)) result = true;
				else if(obj.collidePointNoEdge(this.x + this.hitBox.x + this.hitBox.width, this.y + this.hitBox.y + this.hitBox.height)) result = true;
				
				return result;
			},
			td:0,//Used for distance sound calculations
			fire:function(){ //x and y are the destination of the projectile
				if(this.weapon[this.sw].sound != null){
					this.td = dist(this.x+100, this.y +100, -ctxOx + w/2, -ctxOy + h/2)
					if(this.td < 500){
						for(var i=0; i < this.weapon[this.sw].sound.length; i++){
							if(this.weapon[this.sw].sound[i].soundVar.currentTime == 0){
							
								this.weapon[this.sw].sound[i].setVolume(1-this.td/500);
								this.weapon[this.sw].sound[i].play();
								break;
							
							}
						}
					}
				}
				var sx = this.x + this.weapon[this.sw].pX + 95
				var sy = this.y + this.weapon[this.sw].pY + 90
				
				var dc = dist(this.aimer.x, this.aimer.y, sx,sy);
				var x = this.aimer.x + rand(dc/this.weapon[this.sw].accuracy)//rand(this.weapon[this.sw].accuracy)-this.weapon[this.sw].accuracy/2
				var y = this.aimer.y + rand(dc/this.weapon[this.sw].accuracy)//rand(this.weapon[this.sw].accuracy)-this.weapon[this.sw].accuracy/2
				
				
				
				var ta, tb;
				
				var results = [];
				
				
				//t:0 means is a wall
				for(var i=0; i < wall.length; i++){
					ta = slope(sx,sy,x,y) * (wall[i].x - sx) + sy;
					tb = slope(sx,sy,x,y) * (wall[i].x +wall[i].width- sx) + sy;
					
					if(x > sx && ta >= wall[i].y && ta <= wall[i].y + wall[i].height) results.push({x:wall[i].x,y: ta, t:-1});
					else if(sx > x && tb >= wall[i].y && tb <= wall[i].y + wall[i].height) results.push({x:wall[i].x + wall[i].width,y: tb, t:-1});
					
					ta = (wall[i].y - sy) / slope(sx,sy,x,y)  + sx;
					tb = (wall[i].y + wall[i].height - sy) / slope(sx,sy,x,y)  + sx;
					
					if(y > sy && ta >= wall[i].x && ta <= wall[i].x + wall[i].width) results.push({x: ta, y:wall[i].y, t:-1});
					else if(y < sy && tb >= wall[i].x && tb <= wall[i].x + wall[i].width) results.push({x: tb, y:wall[i].y + wall[i].height, t:-1});
				}
				//replicate for all creatures
				for(var i=0; i < creature.length;i++){
				//Same as above
				//Add provision with id numbers so that creature doesn't shoot itself
					if(creature[i].stats.health > 0 && creature[i].stats.type != this.stats.type){
						ta = slope(sx,sy,x,y) * (creature[i].x + creature[i].hitBox.x - sx) + sy;
						tb = slope(sx,sy,x,y) * (creature[i].x +creature[i].hitBox.x + creature[i].hitBox.width- sx) + sy;
					
						if(x > sx && ta >= creature[i].y + creature[i].hitBox.y && ta <= creature[i].y + creature[i].hitBox.y + creature[i].hitBox.height) results.push({x:creature[i].x + creature[i].hitBox.x,y: ta, t:i});
						else if(sx > x && tb >= creature[i].y + creature[i].hitBox.y && tb <= creature[i].y + creature[i].hitBox.y + creature[i].hitBox.height) results.push({x:creature[i].x + creature[i].hitBox.x + creature[i].hitBox.width,y: tb, t:i});
					
						ta = (creature[i].y + creature[i].hitBox.y - sy) / slope(sx,sy,x,y)  + sx;
						tb = (creature[i].y + creature[i].hitBox.y + creature[i].hitBox.height - sy) / slope(sx,sy,x,y)  + sx;
					
						if(y > sy && ta >= creature[i].x + creature[i].hitBox.x && ta <=creature[i].x +creature[i].hitBox.x + creature[i].hitBox.width) results.push({x: ta, y:creature[i].y + creature[i].hitBox.y, t:i});
						else if(y < sy && tb >= creature[i].x +creature[i].hitBox.x && tb <= creature[i].x + creature[i].hitBox.x + creature[i].hitBox.width) results.push({x: tb, y:creature[i].y + creature[i].hitBox.y + creature[i].hitBox.height, t:i});
					}
				}
				
				//sift out the horizontal sides not needed
				for(var i=0; i < results.length; i++){
					if(x > sx){ //firing to the right
						if(results[i].x < sx){//Is on the left
							results.splice(i,1);
							i--;
						}
					}else{//Firing left
						if(results[i].x > sx){//Is on the right
							results.splice(i,1);
							i--;
						}
					}
				}
				//Splice out the verticals
				for(var i=0; i < results.length; i++){
					if(y > sy){ //
						if(results[i].y < sy){//
							results.splice(i,1);
							i--;
						}
					}else{//
						if(results[i].y > sy){//
							results.splice(i,1);
							i--;
						}
					}
				}
				
				if(this.weapon[this.sw].type == 1){//Ranged projectile weapon
				//Check ammo counts, clear results if no ammo
				
				if(this.reloading != -1 || this.fireCool > 0){//Weapon currently reloading
					results = []; 
					
				}else{
				if(this.weapon[this.sw].clip <= 0){ //Magazine has no ammo
					results = [];
					if(this.weapon[this.sw].ammo >= this.weapon[this.sw].capacity){
						this.weapon[this.sw].ammo -= this.weapon[this.sw].capacity;
						this.weapon[this.sw].clip = this.weapon[this.sw].capacity;
						this.reloading = 0;
					}else if(this.weapon[this.sw].ammo > 0){
						this.weapon[this.sw].clip = this.weapon[this.sw].ammo;
						this.weapon[this.sw].ammo = 0;
						this.reloading = 0;
					}
				
				}else if(this.fireCool <= 0) {
					this.weapon[this.sw].clip--;
					//lightArea(sx,sy, 2, 0.5);
					lightRegion(sx,sy, 16, 0.4);
				}
				}
				
				
				//Find the closest one to the source
				if(results.length > 0){
					var bestI = 0;
					var bestV = dist(sx,sy, results[0].x,results[0].y);
				
					for(var c=1; c < results.length; c++){
						if(dist(sx,sy, results[c].x,results[c].y) < bestV){
							bestV = dist(sx,sy, results[c].x,results[c].y);
							bestI = c;
						}
					}
					
					if(results[bestI].t >= 0){
						results[bestI].x = creature[results[bestI].t].x + creature[results[bestI].t].hitBox.x + rand(creature[results[bestI].t].hitBox.width)
						
						
						if(creature[results[bestI].t].stats.armorPlate) creature[results[bestI].t].stats.health -= this.weapon[this.sw].stats.damage * (Math.random() /10 + 0.5);
						else creature[results[bestI].t].stats.health -= this.weapon[this.sw].stats.damage;
						
						//Make creature just hit target this one
						
						
						creature[results[bestI].t].enemies[0] = this
						creature[results[bestI].t].target = 0
						
						
						bloodSplat.push(createBlood(results[bestI].x,results[bestI].y));
						if(this.weapon[this.sw].stats.burst > 1) bloodSplat.push(createBlood(results[bestI].x - rand(14) + 7,results[bestI].y - rand(14) + 7));
						if(this.weapon[this.sw].stats.burst > 2) bloodSplat.push(createBlood(results[bestI].x + rand(14) - 7,results[bestI].y + rand(14) - 7));
					}else{
						sparks.push(createSpark(results[bestI].x,results[bestI].y));
						if(this.weapon[this.sw].stats.burst > 1) sparks.push(createSpark(results[bestI].x - rand(14) + 7,results[bestI].y - rand(14) + 7));
						if(this.weapon[this.sw].stats.burst > 2) sparks.push(createSpark(results[bestI].x + rand(14) - 7,results[bestI].y + rand(14) - 7));
					}
				}
				
				if(this.stats.health > 0 && this.reloading == -1 && this.weapon[this.sw].clip > 0){
					this.fireCool = this.weapon[this.sw].stats.coolDown;
					this.recoil = this.weapon[this.sw].firePic.length
				}
				
				}else if (this.weapon[this.sw].type == 0 || this.weapon[this.sw].type == 3){
					//Melee Weapons
					
					for(var i=0; i < results.length;i++){
						if(dist(this.x+100, this.y+100, results[i].x, results[i].y) > this.weapon[this.sw].stats.range || results[i].t < 0){
							results.splice(i,1);
							i--;
						}
					}
					
					for(var i=0; i < results.length;i++){
						if(results[i].t >= 0) {
							creature[results[i].t].stats.health -= this.weapon[this.sw].stats.damage
							if(this.weapon[this.sw].type == 3) this.stats.health += this.weapon[this.sw].stats.damage
						}
					}
					
					if(this.stats.health > 0){
						this.fireCool = this.weapon[this.sw].stats.coolDown;
						this.recoil = this.weapon[this.sw].firePic.length
					}
				}
				
				
			},
			WillFire:function(){ //x and y are the destination of the projectile
				var sx = this.x //+ this.weapon[this.sw].pX + 95
				var sy = this.y //+ this.weapon[this.sw].pY + 90
				
				var dc = dist(this.aimer.x, this.aimer.y, sx,sy);
				var x = this.aimer.x //+ rand(dc/this.weapon[this.sw].accuracy)//rand(this.weapon[this.sw].accuracy)-this.weapon[this.sw].accuracy/2
				var y = this.aimer.y //+ rand(dc/this.weapon[this.sw].accuracy)//rand(this.weapon[this.sw].accuracy)-this.weapon[this.sw].accuracy/2
				
				
				
				var ta, tb;
				
				var results = [];
				
				
				//t:0 means is a wall
				for(var i=0; i < wall.length; i++){
					ta = slope(sx,sy,x,y) * (wall[i].x - sx) + sy;
					tb = slope(sx,sy,x,y) * (wall[i].x +wall[i].width- sx) + sy;
					
					if(x > sx && ta >= wall[i].y && ta <= wall[i].y + wall[i].height) results.push({x:wall[i].x,y: ta, t:-1});
					else if(sx > x && tb >= wall[i].y && tb <= wall[i].y + wall[i].height) results.push({x:wall[i].x + wall[i].width,y: tb, t:-1});
					
					ta = (wall[i].y - sy) / slope(sx,sy,x,y)  + sx;
					tb = (wall[i].y + wall[i].height - sy) / slope(sx,sy,x,y)  + sx;
					
					if(y > sy && ta >= wall[i].x && ta <= wall[i].x + wall[i].width) results.push({x: ta, y:wall[i].y, t:-1});
					else if(y < sy && tb >= wall[i].x && tb <= wall[i].x + wall[i].width) results.push({x: tb, y:wall[i].y + wall[i].height, t:-1});
				}
				//replicate for all creatures
				for(var i=0; i < creature.length;i++){
				//Same as above
				//Add provision with id numbers so that creature doesn't shoot itself
					if(creature[i].stats.health > 0 && creature[i].stats.type != this.stats.type){
						ta = slope(sx,sy,x,y) * (creature[i].x + creature[i].hitBox.x - sx) + sy;
						tb = slope(sx,sy,x,y) * (creature[i].x +creature[i].hitBox.x + creature[i].hitBox.width- sx) + sy;
					
						if(x > sx && ta >= creature[i].y + creature[i].hitBox.y && ta <= creature[i].y + creature[i].hitBox.y + creature[i].hitBox.height) results.push({x:creature[i].x + creature[i].hitBox.x,y: ta, t:i});
						else if(sx > x && tb >= creature[i].y + creature[i].hitBox.y && tb <= creature[i].y + creature[i].hitBox.y + creature[i].hitBox.height) results.push({x:creature[i].x + creature[i].hitBox.x + creature[i].hitBox.width,y: tb, t:i});
					
						ta = (creature[i].y + creature[i].hitBox.y - sy) / slope(sx,sy,x,y)  + sx;
						tb = (creature[i].y + creature[i].hitBox.y + creature[i].hitBox.height - sy) / slope(sx,sy,x,y)  + sx;
					
						if(y > sy && ta >= creature[i].x + creature[i].hitBox.x && ta <=creature[i].x +creature[i].hitBox.x + creature[i].hitBox.width) results.push({x: ta, y:creature[i].y + creature[i].hitBox.y, t:i});
						else if(y < sy && tb >= creature[i].x +creature[i].hitBox.x && tb <= creature[i].x + creature[i].hitBox.x + creature[i].hitBox.width) results.push({x: tb, y:creature[i].y + creature[i].hitBox.y + creature[i].hitBox.height, t:i});
					}
				}
				
				//sift out the horizontal sides not needed
				for(var i=0; i < results.length; i++){
					if(x > sx){ //firing to the right
						if(results[i].x < sx){//Is on the left
							results.splice(i,1);
							i--;
						}
					}else{//Firing left
						if(results[i].x > sx){//Is on the right
							results.splice(i,1);
							i--;
						}
					}
				}
				//Splice out the verticals
				for(var i=0; i < results.length; i++){
					if(y > sy){ //
						if(results[i].y < sy){//
							results.splice(i,1);
							i--;
						}
					}else{//
						if(results[i].y > sy){//
							results.splice(i,1);
							i--;
						}
					}
				}
				

				
				//Find the closest one to the source
				if(results.length > 0){
					var bestI = 0;
					var bestV = dist(sx,sy, results[0].x,results[0].y);
				
					for(var c=1; c < results.length; c++){
						if(dist(sx,sy, results[c].x,results[c].y) < bestV){
							bestV = dist(sx,sy, results[c].x,results[c].y);
							bestI = c;
						}
					}
					
					if(results[bestI].t >= 0){
						results[bestI].x = creature[results[bestI].t].x + creature[results[bestI].t].hitBox.x + rand(creature[results[bestI].t].hitBox.width)
						//creature[results[bestI].t].stats.health -= this.weapon[this.sw].stats.damage;
						return results[bestI].t
					}else return -1;
				}
				
				
				
				
				
				
			},
			WillFireGeneral:function(){ //x and y are the destination of the projectile
				var sx = this.x +100//+ this.weapon[this.sw].pX + 95
				var sy = this.y +100//+ this.weapon[this.sw].pY + 90
				
				var dc = dist(this.aimer.x, this.aimer.y, sx,sy);
				var x = this.aimer.x //+ rand(dc/this.weapon[this.sw].accuracy)//rand(this.weapon[this.sw].accuracy)-this.weapon[this.sw].accuracy/2
				var y = this.aimer.y //+ rand(dc/this.weapon[this.sw].accuracy)//rand(this.weapon[this.sw].accuracy)-this.weapon[this.sw].accuracy/2
				
				var ta, tb;
				
				var results = [];
				
				
				//t:-1 means is a wall
				for(var i=0; i < wall.length; i++){
					ta = slope(sx,sy,x,y) * (wall[i].x - sx) + sy;
					tb = slope(sx,sy,x,y) * (wall[i].x +wall[i].width- sx) + sy;
					
					if(x > sx && ta >= wall[i].y && ta <= wall[i].y + wall[i].height) results.push({x:wall[i].x,y: ta, t:-1});
					else if(sx > x && tb >= wall[i].y && tb <= wall[i].y + wall[i].height) results.push({x:wall[i].x + wall[i].width,y: tb, t:-1});
					
					ta = (wall[i].y - sy) / slope(sx,sy,x,y)  + sx;
					tb = (wall[i].y + wall[i].height - sy) / slope(sx,sy,x,y)  + sx;
					
					if(y > sy && ta >= wall[i].x && ta <= wall[i].x + wall[i].width) results.push({x: ta, y:wall[i].y, t:-1});
					else if(y < sy && tb >= wall[i].x && tb <= wall[i].x + wall[i].width) results.push({x: tb, y:wall[i].y + wall[i].height, t:-1});
				}
				
				//replicate for all creatures
				for(var i=0; i < creature.length;i++){
				//Same as above
				//Add provision with id numbers so that creature doesn't shoot itself
					if(creature[i].stats.health > 0 && creature[i].stats.type != this.stats.type){
						ta = slope(sx,sy,x,y) * (creature[i].x + creature[i].hitBox.x - sx) + sy;
						tb = slope(sx,sy,x,y) * (creature[i].x +creature[i].hitBox.x + creature[i].hitBox.width- sx) + sy;
					
						if(x > sx && ta >= creature[i].y + creature[i].hitBox.y && ta <= creature[i].y + creature[i].hitBox.y + creature[i].hitBox.height) results.push({x:creature[i].x + creature[i].hitBox.x,y: ta, t:i});
						else if(sx > x && tb >= creature[i].y + creature[i].hitBox.y && tb <= creature[i].y + creature[i].hitBox.y + creature[i].hitBox.height) results.push({x:creature[i].x + creature[i].hitBox.x + creature[i].hitBox.width,y: tb, t:i});
					
						ta = (creature[i].y + creature[i].hitBox.y - sy) / slope(sx,sy,x,y)  + sx;
						tb = (creature[i].y + creature[i].hitBox.y + creature[i].hitBox.height - sy) / slope(sx,sy,x,y)  + sx;
					
						if(y > sy && ta >= creature[i].x + creature[i].hitBox.x && ta <=creature[i].x +creature[i].hitBox.x + creature[i].hitBox.width) results.push({x: ta, y:creature[i].y + creature[i].hitBox.y, t:i});
						else if(y < sy && tb >= creature[i].x +creature[i].hitBox.x && tb <= creature[i].x + creature[i].hitBox.x + creature[i].hitBox.width) results.push({x: tb, y:creature[i].y + creature[i].hitBox.y + creature[i].hitBox.height, t:i});
					}
				}
				//sift out the horizontal sides not needed
				for(var i=0; i < results.length; i++){
					if(x > sx){ //firing to the right
						if(results[i].x < sx){//Is on the left
							results.splice(i,1);
							i--;
						}
					}else{//Firing left
						if(results[i].x > sx){//Is on the right
							results.splice(i,1);
							i--;
						}
					}
				}
				//Splice out the verticals
				for(var i=0; i < results.length; i++){
					if(y > sy){ //
						if(results[i].y < sy){//
							results.splice(i,1);
							i--;
						}
					}else{//
						if(results[i].y > sy){//
							results.splice(i,1);
							i--;
						}
					}
				}
				
				
				//Find the closest one to the source
				if(results.length > 0){
					
					var bestI = 0;
					var bestV = dist(sx,sy, results[0].x,results[0].y);
				
					for(var c=0; c < results.length; c++){
						if(dist(sx,sy, results[c].x,results[c].y) < bestV){
							bestV = dist(sx,sy, results[c].x,results[c].y);
							bestI = c;
						}
					}
					
					return results[bestI].t >= 0
						
				}
				return false;
			}
			
	
	
		}
		
		return result;
		
	}
	
	
	
	
	
	
	function rand(n){
		return Math.floor(Math.random() * n);
	}
	
	
	function staticLight(a,b,c){
		this.x = a
		this.y = b
		this.size = c
		this.draw = function(){
			roundLight(this.x,this.y,this.size + rand(4), 1)
		};
	}
	
	function pulseLight(a,b){
		this.type = "PLight"
		this.x = []
		this.y = []
		this.x.push(a)
		this.y.push(b)
		this.addPLight = function (i,j){
			this.x.push(i);
			this.y.push(j);
		}
		this.size = 15
		this.on = 0;
		this.timer = 0
		this.rTime = 40
		this.distance = 0
		this.sound = null//pulseLightSound[rand(pulseLightSound.length)]
		this.temp = -1;
		this.draw = function(){
			if(this.timer <= 0) {
				roundLight(this.x[this.on],this.y[this.on],this.size, 1)
				this.on++
			}else this.timer--;
			
			if(this.on >= this.x.length){
				this.timer = this.rTime;
				this.on = 0;
			}
			
			this.distance = dist(this.x[this.on], this.y[this.on], -ctxOx + w/2, -ctxOy + h/2)
				if(this.distance < 300 && this.timer == 0) {
					if(this.sound == null){
						this.temp = getSound(pulseLightSound)
						if(this.temp != -1) {
							this.sound = pulseLightSound[this.temp]
							this.sound.claimed = true
						}
					}
					if(this.sound != null){
						this.sound.play();
						this.sound.setVolume ((1- this.distance / 300)/3); //has a 50% drop in volume
						//if(this.sound.soundVar.currentTime > this.sound.soundVar.duration - 0.5) this.sound.soundVar.currentTime = 0.1
						
					}
				}else {
					if(this.sound != null){
						//this.sound.pause();
						this.sound.claimed = false;
						this.sound = null
					}
				}
			
			/*
			this.timer--;
			if(this.timer < 0) {
				this.timer = 1
				this.on++
				if(this.on > this.x.length) this.on = 0;
			}*/
			
		};
	}
	
	
	
	
	
	
	function angledLight(a,b,c,d){
		this.x = a;
		this.y = b;
		this.size = c;
		this.angle = d;
		this.draw = function(){directedAngleLight(this.x,this.y,this.size, this.angle)};
	}
	
	function spinLight(a,b,c,d){
		this.x = a;
		this.y = b;
		this.size = c;
		this.CSize = c;
		this.angle = d;
		this.sound = null;//spinSound[rand(spinSound.length)]
		this.temp = -1;
		this.distance = 0;
		this.draw = function(){
			ctx.drawImage(spinLightPic, this.x,this.y);
			if(Math.abs(this.CSize) < 40) {
				roundLight(this.x+5,this.y+10, 30, 1);	
				lightRegion(this.x+5, this.y+5, 4, 0.5);
			}else roundLight(this.x+5,this.y+10, 20, 0.5);
	
			directedAngleLight(this.x+5,this.y+10,this.CSize, this.angle)
			directedAngleLight(this.x+5,this.y+10,this.CSize* -1, this.angle)
			
			lightRegion(this.x - this.CSize, this.y + 10, 4, 0.2);
			lightRegion(this.x +this.CSize, this.y + 10, 4, 0.2);
			
			this.CSize-=15;
			
			if(this.CSize <= this.size * -1) this.CSize = this.size
			
			
			this.distance = dist(this.x, this.y, -ctxOx + w/2, -ctxOy + h/2)
				if(this.distance < 200) {
					if(this.sound == null){
						this.temp = getSound(spinSound)
						if(this.temp != -1) {
							this.sound = spinSound[this.temp]
							this.sound.claimed = true
						}
					}
					if(this.sound!= null){
					//	this.sound.play();
						this.sound.setVolume ((1- this.distance / 200 / 10)); //has a 50% drop in volume
						if(this.sound.soundVar.currentTime > this.sound.soundVar.duration - 0.5) this.sound.soundVar.currentTime = 0.1
					}
				}else {
					if(this.sound != null){
						this.sound.stop();
						this.sound.claimed = false;
						this.sound = null
					}
				}
		}
	}
	
	function roundLight(x,y,size, intensity){
		ctx.globalAplha = 0.1 * intensity;
		ctx.fillStyle = 'white'
		lightRegion(x,y, 8, 0.2 + Math.random()/50);
		for(var i=0 ; i < size; i+=size/40){
				ctx.globalAlpha = ((size - i)/size)/10 * intensity;
				ctx.beginPath();
			
				ctx.arc(x, y, i*0.5, 0, Math.PI*2);
				ctx.fill();
				ctx.closePath();
			}
		ctx.globalAlpha = 1;
	}
	
	function directedLight(x,y,size){
		ctx.globalAplha = 0.1;
		ctx.fillStyle = 'white'
		
		for(var i=0 ; i < size; i+=size/40){
				ctx.globalAlpha = ((size - i)/size)/10;
				ctx.beginPath();
			
				ctx.arc(x + i, y, i*0.2, 0, Math.PI*2);
				ctx.fill();
				ctx.closePath();
			}
		ctx.globalAlpha = 1;
	}
	
	function directedAngleLight(x,y,s, a){
		ctx.save();
		
		ctx.globalAplha = 0.1;
		ctx.fillStyle = 'white'
		var angle = a;
		var size = Math.abs(s);
		if (s < 0) angle += 180;
		
		
		
		ctx.translate(x,y);
		ctx.rotate(degRad(angle));
		for(var i=0 ; i < size; i+=size/40){
				ctx.globalAlpha = ((size - i)/size)/10;
				ctx.beginPath();
			
				ctx.arc(i, 0, i*0.2, 0, Math.PI*2);
				if(Math.random() < 0.95) ctx.fill();
				ctx.closePath();
				
				
			}
		ctx.globalAlpha = 1;
		ctx.restore();
	}
	
	
	function wordTicker(a,b,m){
		this.x = a
		this.y = b
		this.message = m
		this.ani = 0
		this.draw = function(){
			ctx.fillStyle = 'black'
			ctx.globalAlpha = 0.4
			ctx.fillRect(this.x,this.y, 100, 20);
			ctx.font = 'Bold 8pt Orbitron';
			ctx.fillStyle = 'red'
			ctx.globalAlpha = this.ani/10
			ctx.fillText(this.message, this.x + 50 - ctx.measureText(this.message).width/2, this.y + 15);
			
			ctx.fillRect(this.x +5, this.y + 2 + this.ani/10, 90, this.ani/5);
			ctx.fillRect(this.x +5, this.y + 18 - this.ani/10, 90, this.ani/5);
			ctx.globalAlpha = 1;
			this.ani++
			
			if(this.ani > 10) this.ani = 0
			//lightStrip(this.x,this.y, {x:100,y:10}, 1);
			//lightRegion(this.x,this.y, 2, 1);
			//lightRegion(this.x + 100,this.y, 2, 1);
		}
		this.shade = function(){}
	}
	
	
	function lightArea(x,y, r, intensity){
	var gX = Math.floor(x/100)
	var gY = Math.floor(y/100)

	for(var i = gX - r; i <= gX+r; i++){
		for(var j = gY - r; j <= gY+r; j++){
			if(i >= 0 && i < mapGrid.length && j >= 0 && j < mapGrid[0].length){
				for(var a=0; a< mapGrid[i][j].panels.length; a++){
					if(dist(gX,gY,i,j) > 0) wallPanels[mapGrid[i][j].panels[a]].light += intensity * r/(dist(gX,gY, i,j))
					else wallPanels[mapGrid[i][j].panels[a]].light += intensity*10
				}
			}
		}
	
	}
	
	

	}
	
	
	
	function lightRegion(x,y,r,intensity){
	
		gX = Math.floor(x/lightRes)
		gY = Math.floor(y/lightRes)
		
		for(var i = gX - r; i <= gX+r; i++){
			for(var j = gY - r; j <= gY+r; j++){
				if(i >= 0 && i < lightGrid.length && j >= 0 && j < lightGrid[0].length && dist(i,j, gX,gY) <= r){
				//lightGrid[i][j]+= intensity * r/(dist(gX,gY, i,j)*lightRes/10)
				lightGrid[i][j]+= intensity *(r/(dist(gX,gY, i,j)) -1)
				}
			}
		}
	
	
	}
	
	function lightStrip(x,y,size,intensity){
	
		gX = Math.floor(x/lightRes)
		gY = Math.floor(y/lightRes)
		
		mgX = Math.floor(size.x/lightRes)
		mgY = Math.floor(size.y/lightRes)
		
		for(var i = gX; i <= gX+ mgX; i++){
			for(var j = gY; j <= gY+mgY; j++){
				if(i >= 0 && i < lightGrid.length && j >= 0 && j < lightGrid[0].length){
				//lightGrid[i][j]+= intensity * r/(dist(gX,gY, i,j)*lightRes/10)
				lightGrid[i][j]+= intensity 
				}
			}
		}
	
	
	}
	
	
		function directedSteam(x,y,s, a){
		ctx.save();
		
		ctx.globalAplha = 0.1;
		ctx.fillStyle = 'white'
		var angle = a;
		var size = Math.abs(s);
		if (s < 0) angle += 180;
		
		ctx.translate(x,y);
		ctx.rotate(degRad(angle));
		for(var i=0 ; i < size; i+=size/40){
				ctx.globalAlpha = 0.15//((size - i)/size)/10;
				ctx.beginPath();
			
				ctx.arc(i, 0, i*0.4 * Math.random(), 0, Math.PI*2);
				if(Math.random() < 0.95) ctx.fill();
				ctx.closePath();
				
				
			}
		ctx.globalAlpha = 1;
		ctx.restore();
	}
	
	function steamJet(a,b){
		this.x = a;
		this.y = b;
		this.size = 30 + rand(30);
		this.angle = Math.random() * 360;
		this.distance = 0;
		this.sound = null
		this.temp = -1;
		this.draw = function(){
			directedSteam(this.x,this.y, this.size - rand(10), this.angle);
			
			this.distance = dist(this.x, this.y, -ctxOx + w/2, -ctxOy + h/2)
				if(this.distance < 200) {
					if(this.sound == null){
						this.temp = getSound(steamSound)
						if(this.temp != -1) {
							this.sound = steamSound[this.temp]
							this.sound.claimed = true
						}
					}
					
					if(this.sound!= null){
						this.sound.play();
						this.sound.setVolume ((1-this.distance / 200)/2); //has a 50% drop in volume
						if(this.sound.soundVar.currentTime > this.sound.soundVar.duration - 0.5) this.sound.soundVar.currentTime = 0.1
					}
				}else {
					if(this.sound != null){
						this.sound.stop();
						this.sound.claimed = false;
						this.sound = null
					}
				}
		}
		this.sound = steamSound[rand(steamSound.length)]
	}
	
	
	////////////////////////////////////////////////////////
	///////////////////////////////////////////////////////
	/////	MOUSE LISTENER 
	//////////////////////////////////////////////////////
	/////////////////////////////////////////////////////
	


	/////////////////
	// Mouse Click
	///////////////

	
	
	canvas.addEventListener('click', function (evt){
	
		if(screen == 1){
			if(!prompting){
				for(var i=0; i < mainMenuButtons.length; i++) if(mainMenuButtons[i].isMouseOver()) mainMenuButtons[i].job();
			}else {
				if(OKButton.isMouseOver()) OKButton.job();
				else promptAni = 100;
			}
		}else if(screen == 5){
			if(prompting){
				if(OKButton.isMouseOver()) OKButton.job();
				else promptAni = 100;
			}else{
			
			}
		}else if(screen == 6){
			if(lighter.isMouseOver()) lighter.job();
			
			
			if(leftSlide.isMouseOver())leftSlide.job();
			if(rightSlide.isMouseOver())rightSlide.job();
			
			if(selEdit == 1){//Background panels
				var btnd = false;
				for(var i=0; i < bgOptions.length; i++){
					if(bgOptions[i].b.isMouseOver()) {
						btnd = true;
						for(var j=0; j <bgOptions.length; j++) bgOptions[j].selected = false;
						bgOptions[i].selected = true;
					}
				}
				
				if(config.isMouseOver()){
					for(var i=0; i < bgOptions.length; i++){
						if(bgOptions[i].selected) bgOptions[i].config();
					}
					btnd = true;
				}
				
				if(!btnd && my < h - 150 && my > 50){//We have clicked on the screen to place something
					for(var i=0; i < bgOptions.length; i++){
						if(bgOptions[i].selected) bgOptions[i].job();
					}
				}
				
				
			}else if(selEdit == 2){//walls, floors, celings
				var btnd = false;
				for(var i=0; i < wOptions.length; i++){
					if(wOptions[i].b.isMouseOver()) {
						btnd = true;
						for(var j=0; j <wOptions.length; j++) wOptions[j].selected = false;
						wOptions[i].selected = true;
					}
				}
				
				if(!btnd && my < h - 150&& my > 50){//We have clicked on the screen to place something
					for(var i=0; i < wOptions.length; i++){
						if(wOptions[i].selected) wOptions[i].job();
					}
				}
			}else if(selEdit == 3){//lamps
				var btnd = false;
				for(var i=0; i < lOptions.length; i++){
					if(lOptions[i].b.isMouseOver()) {
						btnd = true;
						for(var j=0; j <lOptions.length; j++) lOptions[j].selected = false;
						lOptions[i].selected = true;
					}
				}
				if(config.isMouseOver()){
					for(var i=0; i < lOptions.length; i++){
						if(lOptions[i].selected) lOptions[i].config();
					}
					btnd = true;
				}
				if(!btnd && my < h - 150&& my > 50){//We have clicked on the screen to place something
					for(var i=0; i < lOptions.length; i++){
						if(lOptions[i].selected) lOptions[i].job();
					}
				}
			}else if(selEdit == 4){//Items
				var btnd = false;
				for(var i=0; i < iOptions.length; i++){
					if(iOptions[i].b.isMouseOver()) {
						btnd = true;
						for(var j=0; j <iOptions.length; j++) iOptions[j].selected = false;
						iOptions[i].selected = true;
					}
				}
				if(config.isMouseOver()){
					
					for(var i=0; i < iOptions.length; i++){
						if(iOptions[i].selected) iOptions[i].config();
					}
					btnd = true;
				}
				if(!btnd && my < h - 150&& my > 50){//We have clicked on the screen to place something
					for(var i=0; i < iOptions.length; i++){
						if(iOptions[i].selected) iOptions[i].job();
					}
				}
			}else if(selEdit == 5){//Foreground
				var btnd = false;
				for(var i=0; i < fOptions.length; i++){
					if(fOptions[i].b.isMouseOver()) {
						btnd = true;
						for(var j=0; j <fOptions.length; j++) fOptions[j].selected = false;
						fOptions[i].selected = true;
					}
				}
				if(config.isMouseOver()){
					
					for(var i=0; i < fOptions.length; i++){
						if(fOptions[i].selected) fOptions[i].config();
					}
					btnd = true;
				}
				if(!btnd && my < h - 150&& my > 50){//We have clicked on the screen to place something
					for(var i=0; i < fOptions.length; i++){
						if(fOptions[i].selected) fOptions[i].job();
					}
				}
			}else if(selEdit == 6){//Background panels
				var btnd = false;
				for(var i=0; i < cOptions.length; i++){
					if(cOptions[i].b.isMouseOver()) {
						btnd = true;
						for(var j=0; j <cOptions.length; j++) cOptions[j].selected = false;
						cOptions[i].selected = true;
					}
				}
				
				if(config.isMouseOver()){
					for(var i=0; i < cOptions.length; i++){
						if(cOptions[i].selected) cOptions[i].config();
					}
					btnd = true;
				}
				
				if(!btnd && my < h - 150&& my > 50){//We have clicked on the screen to place something
					for(var i=0; i < cOptions.length; i++){
						if(cOptions[i].selected) cOptions[i].job();
					}
				}
				
				
			}else if(selEdit == 7){//Sound objects
				var btnd = false;
				for(var i=0; i < sOptions.length; i++){
					if(sOptions[i].b.isMouseOver()) {
						btnd = true;
						for(var j=0; j <sOptions.length; j++) sOptions[j].selected = false;
						sOptions[i].selected = true;
					}
				}
				if(config.isMouseOver()){
					for(var i=0; i < sOptions.length; i++){
						if(sOptions[i].selected) sOptions[i].config();
					}
					btnd = true;
				}
				if(!btnd && my < h - 150&& my > 50){//We have clicked on the screen to place something
					for(var i=0; i < sOptions.length; i++){
						if(sOptions[i].selected) sOptions[i].job();
					}
				}
			}
	      
		}
	}, false);

	
	canvas.addEventListener('mousedown', function (evt){
		
		mDown = true;
	      
	}, false);
	
	canvas.addEventListener('mouseup', function (evt){
		mDown = false;
		
	      
	}, false);
	
	

	canvas.addEventListener ('mouseout', function(){pause = true;}, false);
	canvas.addEventListener ('mouseover', function(){pause = false;}, false);

      	canvas.addEventListener('mousemove', function(evt) {
        	var mousePos = getMousePos(canvas, evt);

		mx = mousePos.x;
		my = mousePos.y;

		
		//Set player aiming
			if(screen == 5) creature[cS].taimer = {x:mx - ctxOx,y:my - ctxOy};
		
		
      	}, false);


	function getMousePos(canvas, evt) 
	{
	        var rect = canvas.getBoundingClientRect();
			
        	return {
          		x: evt.clientX - rect.left,
          		y: evt.clientY - rect.top
        		};
		
	}
      

	///////////////////////////////////
	//////////////////////////////////
	////////	KEY BOARD INPUT
	////////////////////////////////


	
window.addEventListener('keyup', function(evt){
		var key = evt.keyCode;
		
	//p 80
	//r 82
	//1 49
	//2 50
	//3 51
		if(key == 38){
		//up
			
		}else if(key == 39){
		//stop right
			if(screen == 5){
				creature[cS].state =0;
				creature[cS].aniFrame = 3;
			}
		}else if (key== 37){
			//left
			if(screen == 5){
				creature[cS].state = 0;
				creature[cS].aniFrame = 5;
			}
		}else if(key==40){
		//down
			if(screen == 5) creature[cS].state = 0;
		}
		//alert(key)
	}, false);
	
	window.addEventListener('keydown', function(evt){
		var key = evt.keyCode;
	
	//p 80
	//r 82
	//1 49
	//2 50
	//3 51
	
	
		if(key == 38){
		//up
			if(screen == 5){
				ridingElevator = false;
				for(var i=0;i<elevators.length;i++){
					if(elevators[i].inUse) {
						elevators[i].goUp();
						ridingElevator = true;
					}
				}
				if(!ridingElevator) creature[cS].jump();
			}else if(screen == 6) ctxOy += 100
		}else if(key == 39){
		//right
			if(screen == 5){
				creature[cS].state = 2
				creature[cS].sx = creature[cS].stats.speed;
			}else if (screen == 6) ctxOx-=100
		}else if (key== 37){
			//left
			if(screen == 5){
				creature[cS].state = 3;
				creature[cS].sx =-1* creature[cS].stats.speed;
			}else if(screen == 6) ctxOx += 100
		}else if(key==40 ){
		//down
			if(screen == 5){
				ridingElevator = false;
				for(var i=0;i<elevators.length;i++){
					if(elevators[i].inUse) {
						elevators[i].goDown();
						ridingElevator = true;
					}
				}
			}
				
			if(!ridingElevator && screen == 5 && !creature[cS].falling() && creature[cS].sy == 0)creature[cS].state = 4;
			else if(screen == 6) ctxOy -= 100;
		}else if(key == 49) {
			if(screen == 5 && !creature[cS].weapon[0].useless && creature[cS].weapon[0] != null)creature[cS].sw = 0;
			else if (screen == 6) selEdit = 1;
		}else if(key == 50){
			if(screen == 5){
				if(creature[cS].weapon[1] != null && !creature[cS].weapon[1].useless ) creature[cS].sw = 1;
			}else if (screen == 6) selEdit = 2;
		}else if(key == 51){
			if(screen == 5){
				if(creature[cS].weapon[2] != null&& !creature[cS].weapon[2].useless) creature[cS].sw = 2;
				
			}else if (screen == 6) selEdit = 3;
		}else if(key == 52) {
			if(screen == 5){
				if(creature[cS].weapon[3] != null&& !creature[cS].weapon[3].useless) creature[cS].sw = 3;
			}else if (screen == 6) selEdit = 4;
		}else if (key == 53){
			if (screen == 6) selEdit = 5;
		}else if (key == 54){
			if (screen == 6) selEdit = 6;
		}else if (key == 55){
			if (screen == 6) selEdit = 7;
		}else if(key == 32){
			if(screen == 4) cutscene[scene].frame = cutscene[scene].endFrame
		
		}else if(key == 8 && screen == 6){//backspace control
			if(lastEdit[lastEdit.length-1]== 0) dLights.splice(dLights.length - 1, 1);
			else if(lastEdit[lastEdit.length-1] == 1)pulseLights.splice(pulseLights.length - 1, 1);
			else if(lastEdit[lastEdit.length-1] == 2)lamps.splice(lamps.length - 1, 1);
			else if(lastEdit[lastEdit.length-1] == 3)wall.splice(wall.length - 1, 1);
			else if(lastEdit[lastEdit.length-1] == 4)wallPanels.splice(wallPanels.length - 1, 1);
			else if(lastEdit[lastEdit.length-1] == 5)creature.splice(creature.length - 1, 1);
			else if(lastEdit[lastEdit.length-1] == 6)items.splice(items.length - 1, 1);
			else if(lastEdit[lastEdit.length-1] == 7)foreGround.splice(foreGround.length - 1, 1);
			else if(lastEdit[lastEdit.length-1] == 8)rLights.splice(rLights.length - 1, 1);
			else if(lastEdit[lastEdit.length-1] == 9){
				elevators[elevators.length-1].remove();
				elevators.splice(elevators.length-1,1);
			}else if(lastEdit[lastEdit.length-1] == 10){
				if(wallPanels[wallPanels.length-1].sound!=null)wallPanels[wallPanels.length-1].sound.stop();
				wallPanels.splice(wallPanels.length - 1, 1);
			}
		
			if(lastEdit.length > 0) lastEdit.splice(lastEdit.length-1,1);
			

			//delete last line of the output box
			var cO = document.getElementById("output").value;
			var index = -1
			var foundFirst = false
			var foundSecond = false;
			//Search for ';' tag
			for(var i = cO.length-1; i > 0; i--){
				if(cO[i] == ';'){
					index = i+1;
					if(foundFirst) {
						foundSecond = true;
						break;
					}
					foundFirst = true;		
				}
			}
			
			if(index >= 0) cO = cO.slice(0,index)
			if(!foundSecond) cO = ""
			
			document.getElementById("output").value = cO
		}else if(key == 13){
		//Enter key
			if(screen == 5){
				if(prompting){
					OKButton.job();
				}else{
				//Transition to another level
					for(var i=0; i < exits.length; i++){
						if(dist(creature[cS].x + 100, creature[cS].y + 100, exits[i].x, exits[i].y) < 100){
							exits[i].load();
							break;
						}
					}
				}
				
			}
		}
	}, false);


	
	
	
	////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	////////////////					UTILITY CONSTRCTORS
	/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	var sparks = [];
	var sPics = [];
	sPics.push(makePicture('Animations/Sparks/sparks1.png'));
	sPics.push(makePicture('Animations/Sparks/sparks2.png'));
	sPics.push(makePicture('Animations/Sparks/sparks3.png'));
	function createSpark(a,b){
		return {x:a,
			y:b,
			f:0 - rand(5),
			pIndex:rand(sPics.length),
			
			draw:function(){
				ctx.drawImage(sPics[this.pIndex], this.f* 20, 0, 20,20, this.x-10,this.y-10, 20,20);
				this.f++;
				
			}
		}
	}
	
	var bloodSplat = [];
	var bloodPics = [];
	bloodPics.push(makePicture('Animations/Sparks/blood1.png'))
	bloodPics.push(makePicture('Animations/Sparks/blood2.png'))
	
	function createBlood(a,b){
		if(Math.random() > 0.7) wallPanels.push(new Panel( a + rand(40), b + rand(40),BloodSmear[rand(BloodSmear.length)], 0, 2))
		return {x:a,
			y:b,
			f:0 - rand(5),
			pIndex:rand(bloodPics.length),
			draw:function(){
				ctx.drawImage(bloodPics[this.pIndex], this.f* 20, 0, 20,20, this.x-10,this.y-10, 20,20);
				this.f++;
			}
		}
	}
	
	
	var sparkler = []
	
	
	
	function sparker(a,b){
		this.x = a + 5
		this.y = b + 5
		this.seq = 0
		this.temp = 2;
		this.yOff = [];
		this.size = 10;
		this.length = 20;
		this.pause = 0;
		this.sound = null;//sparkSound[rand(sparkSound.length)]
		this.temp = -1;
		this.distance = 0;
		for(var i=0; i < this.size; i++) this.yOff[i] = Math.random()*5//rand(5);
		this.draw = function(){
			if(this.pause <= 0){
			ctx.fillStyle = 'white'
			ctx.globalAlpha = 1 - this.seq/this.length + Math.random()/5
			for(var i=0; i < this.size; i++){
				this.temp = rand(this.seq/(this.length*2)) + 1
				ctx.fillRect(this.x + rand(4)-2, this.y + this.seq*this.yOff[i], this.temp, this.temp);
			}
			if(this.seq % 2 == 0 && this.seq < 5){
				roundLight(this.x, this.y, Math.random() * 10, 10);
			}
			ctx.globalAlpha = 1;
			this.seq++;
			if(this.seq > this.length) {
				this.seq = 0
				this.pause = rand(30);
			}
			
			this.distance = dist(this.x, this.y, -ctxOx + w/2, -ctxOy + h/2)
				
				if(this.distance < 200) {
					if(this.sound == null){
						this.temp = getSound(sparkSound)
						if(this.temp != -1) {
							this.sound = sparkSound[this.temp]
							this.sound.claimed = true
						}
					}
					if(this.sound!= null){
						this.sound.play();
						this.sound.setVolume ((1- this.distance / 200)/2); //has a 50% drop in volume
						if(this.sound.soundVar.currentTime > this.sound.soundVar.duration - 0.5) this.sound.soundVar.currentTime = 0.1
					}
				}else {
					if(this.sound != null){
						this.sound.stop();
						this.sound.claimed = false;
						this.sound = null
					}
				}
			
			
			}else{
				this.pause--;
			
			}
		}
	}
	
	function waterDrop(a,b){
		this.x = a
		this.y = b
		
		this.length = 80
		this.seq = rand(this.length);
		this.size = 3
		this.seqOff = []
		this.pause = [];
		for(var i=0; i < this.size; i++) {
			this.seqOff[i] = rand(this.length)
			this.pause[i] = 10 + rand(20);
		}
		this.draw = function(){
			ctx.fillStyle = 'white'
			
			for(var i=0; i < this.size; i++){
				if(this.pause[i] ==0){
					//ctx.fillRect(this.x + i * 1.8, this.y + this.seqOff[i]  - 10, 1, this.seqOff[i]/10);
					ctx.fillRect(this.x + i * 1.8, this.y + this.seqOff[i]  - 10, 1, 2);
					this.seqOff[i]+=5
					if(this.seqOff[i] > this.length) {
						this.seqOff[i] = 10;
						this.pause[i] = rand(20) + 10
					}
				}
				if(this.pause[i] > 0) this.pause[i]--;
			}
		}
	}
	function createWall(x,y,wi,he, p){
	
		var newObject = {
			x:x,
			y:y,
			width:wi,
			height:he,
			setWidth:function(i){
				this.width = i;
			},
			setHeight:function(i){
				this.height = i;
			},
			collideObject:function(obj){
				var result = false;
			
				if(obj.x >= this.x && obj.x <= this.x + this.width && obj.y >= this.y && obj.y <= this.y + this.height) result = true;
				
				if(obj.x + obj.width>= this.x && obj.x + obj.width <= this.x + this.width && obj.y >= this.y && obj.y <= this.y + this.height) result = true;
				
				if(obj.x >= this.x && obj.x <= this.x + this.width && obj.y + obj.height>= this.y && obj.y + obj.height <= this.y + this.height) result = true;
				
				if(obj.x + obj.width>= this.x && obj.x + obj.width <= this.x + this.width && obj.y + obj.height>= this.y && obj.y + obj.height <= this.y + this.height) result = true;
				if(obj.collideObject(this)) result = true;
			
				return result;
			},
			collidePoint:function(x,y){
				var result = false;
				if(x >= this.x && x <= this.x + this.width && y >= this.y && y <= this.y + this.height)	result = true;
				return result;
			},
			collidePointNoEdge:function(x,y){
				var result = false;
				if(x > this.x && x < this.x + this.width && y > this.y && y < this.y + this.height)	result = true;
				return result;
			},
			image:p,
			
			draw:function(){
				ctx.drawImage(this.image, this.x,this.y, this.width, this.height);
				this.setHeight (this.image.height);
				this.setWidth (this.image.width);	
			}	
		}
		
		return newObject;
	}


	function ButtonGraphic(a,b,c,d, t){
		this.x = a
		this.y = b
		this.width = c
		this.height = d
		this.text = t
		this.panelBack = [];
		this.panelBack.push(new Panel(this.x, this.y, panelHall[1], 1, 0.4))
		this.panelBack.push(new Panel(this.x + 100, this.y, panelHall[1], 1, 0.4))
		this.lights = []
		//this.lights.push(new UpLamp(this.x + 45, this.y + 80))
		//this.lights.push(new UpLamp(this.x + 145, this.y + 80))
		this.lights.push(new BigLamp(this.x + 60, this.y + 10));
		
		this.draw = function(){
			//for(var i =0; i < this.panelBack.length; i++) this.panelBack[i].draw();
			ctx.fillStyle = '#808080'
			ctx.fillRect(this.x+10, this.y+10, 180,80);
			
			ctx.drawImage(panelHall[1], this.x, this.y)
			ctx.drawImage(panelHall[1], this.x + 100, this.y)
			if(this.isMouseOver()){
				//for(var i =0; i < this.lights.length; i++) this.lights[i].draw();
				ctx.fillStyle = 'white'
				lightRegion(this.x + 50, this.y + 50, 10, 0.2);
				lightRegion(this.x + 150, this.y + 50, 10, 0.2);
			}else {
				lightRegion(this.x + 50, this.y + 50, 7, 0.1);
				lightRegion(this.x + 150, this.y + 50, 7, 0.1);
				ctx.fillStyle = 'black'
				//ctx.drawImage(biglampOut, this.x + 60, this.y + 10)
			}
			ctx.font = "10pt wallFont"
			ctx.fillText(this.text, this.x + 100 - ctx.measureText(this.text).width/2, this.y + 55);
		}
		this.isMouseOver = function (){
			return mx > this.x && mx  <this.x + this.width && my > this.y && my < this.y + this.height
		}
		
		this.job = function(){
			alert("boop!");
		}
	}

	function Button(a,b,c,d, t){
		this.x = a
		this.y = b
		this.width = c
		this.height = d
		this.text = t
		this.draw = function(){
			ctx.fillStyle = 'red'
			ctx.fillRect(this.x,this.y, this.width, this.height);
			
			if(this.isMouseOver()){
				ctx.fillStyle = 'white'
			}else {
				ctx.fillStyle = 'black'
			}
			ctx.font = "10pt Courier"
			ctx.fillText(this.text, this.x, this.y + 12);
		}
		this.isMouseOver = function (){
			return mx > this.x && mx  <this.x + this.width && my > this.y && my < this.y + this.height
		}
		
		this.job = function(){
			alert("boop!");
		}
	}

	
	function editOption(x,y,p){
		this.pic = p;
		this.text = ""
		this.b = new Button(x,y,50,50);
		this.selected = false;
		this.imageText = "--"
		this.name = ""
		this.config = function(){
			alert("This option has no configuration options, sorry.");
		}	
		this.spec = 0;
		this.spec2 = 0;
		this.draw = function(){
			ctx.globalAlpha = 1
			if(this.selected)ctx.fillStyle ='green'
			else ctx.fillStyle = 'red'
			ctx.fillRect(this.b.x-5, this.b.y - 5, 60,60);
			ctx.fillStyle = 'black'
			ctx.fillRect(this.b.x - 2, this.b.y - 2, 56, 56);
			ctx.globalAlpha = 1;
			
			if(this.pic!= null){
				if(this.selected) ctx.drawImage(this.pic, Math.floor((mx) / snapSize)*snapSize,Math.floor((my) / snapSize)*snapSize, this.pic.width,this.pic.height);
			
				if(this.pic.width <= 100)	ctx.drawImage(this.pic, this.b.x,this.b.y, this.pic.width/2,this.pic.height/2);
				else ctx.drawImage(this.pic, this.b.x,this.b.y, 50,50);
			}else{
				if(this.selected) {
					ctx.fillStyle = 'green'
					ctx.globalAlpha = 0.5;
					ctx.fillRect(Math.floor((mx) / snapSize)*snapSize,Math.floor((my) / snapSize)*snapSize, 10,10);
					ctx.globalAlpha = 1;
				}
				ctx.fillStyle = 'white'
				ctx.fillRect(this.b.x,this.b.y, 50,50);
				ctx.fillStyle = 'green'
				ctx.fillText(this.name, this.b.x, this.b.y + 25);
				ctx.fillText(this.spec, this.b.x, this.b.y + 35);
				ctx.fillText(this.spec2, this.b.x, this.b.y + 45);
			}
		}
		this.job = function(){
			this.insert()
			if(this.text != "") output(header + this.text)//Output code
		}
		this.insert = function(){}
		
	
	}
	
	function degRad(angle){
		return angle / 180 * Math.PI;
	}
	
	function slope(x1,y1,x2,y2){
		return (y2-y1)/(x2-x1);
	}

	function dist( p1x, p1y, p2x, p2y )
    {
        var xs = 0;
        var ys = 0;
 
        xs = p2x - p1x;
        xs = xs * xs;
 
        ys = p2y - p1y;
        ys = ys * ys;
 
        return Math.sqrt( xs + ys );
    }

	function rand(n){
		return Math.floor(Math.random() * n)
	}

	
	function newNode(pos){
		return {f:0,
				g:0,
				h:0,
				x:pos.x,
				y:pos.y,
				parent:null
		}
	}
	
	function aStar(s,e, flight){

		var openList = [];
		openList.push(newNode(s));
		
		var closedList = [];
		var tries = 1000;
		
		while(openList.length >0 && tries > 0){
			tries--;
			//Find best scoring node
			var bI = 0;
			
			for(var i=0; i< openList.length;i++){
				if(openList[i].f < openList[bI].f) bI = i;
			}
			
			var currentNode = openList[bI];
			
			//End case
			if(currentNode.x == e.x && currentNode.y == e.y) {
				
				var curr = currentNode;
				var ret = [];
				while(curr.parent && tries > 0) {
					ret.push(curr);
					curr = curr.parent;
					tries--;
				}
				if(tries <= 0) return [];
				
				return ret.reverse();
			}
			
			//Remove current node from openlist
			for(var a =0; a < openList.length;a++){
				if(openList[a].x == currentNode.x && openList[a].y == currentNode.y) openList.splice(a,1);
			}
			
			//Push current node onto closed list
			closedList.push(currentNode);
			
			//Load in the neighbors for checking
			var neighbors;
			if(flight) neighbors = getNeighbors(currentNode.x, currentNode.y);			
			else neighbors = getNeighborsNoFlight(currentNode.x, currentNode.y);
			
			for(var a =0; a < neighbors.length;a++){
				var neighbor = neighbors[a];
			
				//Make sure neighbor is not already processed
				var onClosed = false;
				for(var b =0; b < closedList.length;b++){
					if(closedList[b].x == neighbor.x && closedList[b].y == neighbor.y) onClosed = true 
				}
				
				if(onClosed) continue;
				
				//Find best scoring neighbor
				var gScore = currentNode.g + 1; // 1 is the distance from a node to it's neighbor
				var gScoreIsBest = false;
				
				
				//Check if this neighbor is on the list or not, if new is best so far
				var onList = false;
				for(var b =0; b < openList.length;b++){
					if(openList[b].x == neighbor.x && openList[b].y == neighbor.y) onList = true 
				}
				
				if(!onList){
				//Is new, is the best so far
					gScoreIsBest = true;
					neighbor.h = hValue(neighbor, e); 
					openList.push(neighbor);
				}else if(gScore < neighbor.g) {
					// We have already seen the node, but last time it had a worse g (distance from start)
					gScoreIsBest = true;
				}
 
				if(gScoreIsBest) {
					// Found an optimal (so far) path to this node.	 Store info on how we got here and
					//	just how good it really is...
					neighbor.parent = currentNode;
					neighbor.g = gScore;
					neighbor.f = neighbor.g + neighbor.h;
				}	
			}
		}
		
		if(tries <= 0) console.log("astar stability 4 error");
		return [];//PAth find failure.
	}
	
	function getNeighbors(x,y){
		var result = [];

		for(var i= x-1; i <= x+1; i++){
			for(var j = y-1; j <= y+1;j++){
				if(i >= 0 && i < mapGrid.length && j>=0&&j< mapGrid[0].length&& !(i==x && j==y)){
					if(mapGrid[i][j].wall == false)	result.push(newNode({x:i,y:j}));
				}
			}
		}
		return result;
	}
	
	function getNeighborsNoFlight(x,y){
		var result = [];

		for(var i= x-1; i <= x+1; i++){
			for(var j= y-1; j <= y; j++){
				if(i >= 0 && i < mapGrid.length && j>=0&&j< mapGrid[i].length&& i!=x && j != y){
					if(mapGrid[i][j].wall == false)	result.push(newNode({x:i,y:j}));
				}
			}
		}
		return result;
	}
	
	
	function hValue(pos0, pos1) {
		// This is the Manhattan distance
		var d1 = Math.abs (pos1.x - pos0.x);
		var d2 = Math.abs (pos1.y - pos0.y);
		return d1 + d2;
	}
	
	
	
	function smoothPath(p){
		var result = [];
		var newX, newY
		for(var i=0; i < p.length-1; i++){
			result.push(p[i]);
			
			if(p[i+1].x > p[i].x) newX = p[i].x + 0.5
			else newX = p[i].x - 0.5
			
			if(p[i+1].y > p[i].y) newY = p[i].y + 0.5
			else newY = p[i].y - 0.5
			
			result.push({x:newX, y:newY});
			i++;
		}
		result.push(p[p.length-1]);
		
		if(p.length > 1) return result;
		else return p
	}
	
	
	
	function textBox(message, x, y, width){
		var line = 0;
		var cursor = 0;
		var part = "";
		var cWord = "";
		var cFont = ctx.font;
		var bolding = false;
		
		for(var a = cursor; a < message.length; a++){

			if (message[a] != '@' && message[a] != '~' &&message[a] != '^')
			{
				
				cWord += message[a];
			}
			
			
			if(message[a] == "^") bolding = !bolding	
			
			if(bolding) ctx.font = "bold " + cFont
			else ctx.font = cFont
			
			
			cursor += 1;

			if (ctx.measureText(part + cWord).width >= width){
				
				ctx.fillText(part, x, y + (line * 12));
				line++;
				
				part = "";
			}
			
			if (message[a] == '^' || message[a] == ' ' || message[a] == '~' || message[a] == '@'|| cursor == message.length){part += cWord; cWord = "";}
			if (message[a] == '@'){
				ctx.fillText(part, x, y + (line * 12));
				line += 2;
				part = "";
			}else if (message[a] == '~'){
				ctx.fillText(part, x, y + (line * 12));
				line += 1;
				
				part = "";
			}
			
		}
		
		
		ctx.fillText(part, x, y + (line * 12));
		ctx.font = cFont;
	}

	
	
	
	
	
	
	
	
	
	
	
	
	
	//Level 0- Wake Up
	level.push(new Level("Is it a game yet? Yes it is."));
	//testerman
	level[0].start = {x:200, y: 400}
	//level[0].end = {x:500, y: 450}
	level[0].nextScene = 0;
	
	//level[0].creature.push(baseLineMutant(level[0].start.x, level[0].start.y, 1));
	
	level[0].creature.push(createCreature(80,45,40,155));  //Player Creature
	
	level[0].creature[0].weapon.push(Punch0());
	level[0].creature[0].weapon.push(insectHeal());
	level[0].creature[0].weapon.push(blank());
	level[0].creature[0].weapon.push(SMG());
	
	level[0].creature[0].stats.torso = 2
	level[0].creature[0].stats.type = 1;
	level[0].creature[0].stats.abdomen = 0;
	level[0].creature[0].stats.legs= 5
	level[0].creature[0].stats.hair = 3;
	level[0].creature[0].stats.wing = 0;
	level[0].creature[0].x = level[0].start.x
	level[0].creature[0].y = level[0].start.y
	level[0].creature[0].speak("Here we go!");
	level[0].creature[0].stats.health = 80
	

	//sides
	for(var i= 0; i < h * 2; i+=100) level[0].wall.push(createWall(0, i, 30, 100, sideWall[0]));
	for(var i= 0; i < h * 2; i+=100) level[0].wall.push(createWall(w*2 - 30, i, 30, 100, sideWall[0]));
	
	
	//Floors
	for(var i=0; i < w;i+=100)level[0].wall.push(createWall(i,300,100,30, floor[0]));
	for(var i=w + 100; i < w *2;i+=100)level[0].wall.push(createWall(i,300,100,30, floor[0]));
	
	
	//deck2
	for(var i=0; i < w + 200;i+=100)level[0].wall.push(createWall(i,630,100,30, floor[0]));
	for(var i=w+300; i < w *2;i+=100)level[0].wall.push(createWall(i,630,100,30, floor[0]));
	
	level[0].wall.push(createWall(200,h*2 - 100,100,30, floor[0]));
	
	
	//Ceilings
	for(var i=0; i < w*2;i+=100) level[0].wall.push(createWall(i,0,100,30, ceiling[0]));
	
	//deck2 ceiling
	for(var i=w + 100; i < w * 2;i+=100) level[0].wall.push(createWall(i,330,100,30,ceiling[0]));
	for(var i=0; i < w;i+=100) level[0].wall.push(createWall(i,330,100,30, ceiling[0]));
	
	
	
	
	
	level[0].items.push(medItem(750,500));
	level[0].items.push(medItem(750,535));
	level[0].items.push(rifleItem(650,535));
	
	
	//Editor test
level[0].creature.push(HighReptile(910,720,1));
level[0].creature.push(HighReptile(1140,730,1));
level[0].creature.push(MedReptile(1330,730,1));
level[0].creature.push(HighReptile(1520,750,1));
level[0].creature.push(Marine(800, 100, 3)); 
	
	
level[0].creature.push(Maggot(580,30, 0)); 
//	level[0].creature.push(LowInsect(500, 30, 0));
//	level[0].creature.push(MedInsect(600, 500, 0));
//	level[0].creature.push(HighInsect(800, 500, 0));

level[0].wallPanels.push(new Panel(30,0, panelHall[0], 1,0.7));
level[0].wallPanels.push(new Panel(130,0, panelHall[0], 1,0.7));
level[0].wallPanels.push(new Panel(230,0, panelHall[0], 1,0.7));
level[0].wallPanels.push(new Panel(330,0, panelHall[1], 1,0.7));
level[0].wallPanels.push(new Panel(430,0, panelHall[1], 1,0.7));
level[0].wallPanels.push(new Panel(530,0, panelHall[0], 1,0.7));
level[0].wallPanels.push(new Panel(630,0, panelHall[0], 1,0.7));
level[0].wallPanels.push(new Panel(730,0, panelHall[0], 1,0.7));
level[0].wallPanels.push(new Panel(830,0, panelHall[1], 1,0.7));
level[0].wallPanels.push(new Panel(930,0, panelHall[1], 1,0.7));
level[0].wallPanels.push(new Panel(1030,0, panelHall[0], 1,0.7));
level[0].wallPanels.push(new Panel(1130,0, panelHall[0], 1,0.7));
level[0].wallPanels.push(new Panel(1230,0, panelHall[0], 1,0.7));
level[0].wallPanels.push(new Panel(1130,100, panelHall[0], 0,0.7));
level[0].wallPanels.push(new Panel(630,100, panelHall[0], 0,0.7));
level[0].wallPanels.push(new Panel(130,100, panelHall[0], 0,0.7));
level[0].wallPanels.push(new Panel(30,100, panelHall[1], 0,0.7));
level[0].wallPanels.push(new Panel(230,100, panelHall[1], 0,0.7));
level[0].wallPanels.push(new Panel(330,100, panelHall[1], 0,0.7));
level[0].wallPanels.push(new Panel(430,100, panelHall[1], 0,0.7));
level[0].wallPanels.push(new Panel(530,100, panelHall[1], 0,0.7));
level[0].wallPanels.push(new Panel(730,100, panelHall[1], 0,0.7));
level[0].wallPanels.push(new Panel(830,100, panelHall[1], 0,0.7));
level[0].wallPanels.push(new Panel(930,100, panelHall[1], 0,0.7));
level[0].wallPanels.push(new Panel(1030,100, panelHall[1], 0,0.7));
level[0].wallPanels.push(new Panel(30,200, panelHall[1], 2,0.7));
level[0].wallPanels.push(new Panel(130,200, panelHall[1], 2,0.7));
level[0].wallPanels.push(new Panel(230,200, panelHall[1], 2,0.7));
level[0].wallPanels.push(new Panel(330,200, panelHall[1], 2,0.7));
level[0].wallPanels.push(new Panel(430,200, panelHall[1], 2,0.7));
level[0].wallPanels.push(new Panel(530,200, panelHall[1], 2,0.7));
level[0].wallPanels.push(new Panel(630,200, panelHall[1], 2,0.7));
level[0].wallPanels.push(new Panel(730,200, panelHall[1], 2,0.7));
level[0].wallPanels.push(new Panel(830,200, panelHall[1], 2,0.7));
level[0].wallPanels.push(new Panel(930,200, panelHall[1], 2,0.7));
level[0].wallPanels.push(new Panel(1030,200, panelHall[1], 2,0.7));
level[0].wallPanels.push(new Panel(1130,200, panelHall[1], 2,0.7));

level[0].wallPanels.push(new ForeGround(20,200, wallFeatures[12], 0,0.5));
level[0].wallPanels.push(new ForeGround(20,100, wallFeatures[12], 0,0.5));
level[0].wallPanels.push(new ForeGround(20,0, wallFeatures[12], 0,0.5));
level[0].wallPanels.push(new Panel(1230,200, panelHall[1], 2,0.5));
level[0].wallPanels.push(new Panel(1330,200, panelHall[1], 2,0.5));
level[0].wallPanels.push(new Panel(1430,200, panelHall[1], 2,0.5));
level[0].wallPanels.push(new Panel(1530,200, panelHall[1], 2,0.5));
level[0].wallPanels.push(new Panel(1630,200, panelHall[1], 2,0.5));
level[0].wallPanels.push(new Panel(1730,200, panelHall[1], 2,0.5));
level[0].wallPanels.push(new Panel(1830,200, panelHall[1], 2,0.5));
level[0].wallPanels.push(new Panel(1830,200, panelHall[0], 2,0.4));
level[0].wallPanels.push(new Panel(1880,200, panelHall[0], 2,0.4));

level[0].wallPanels.push(new Panel(1830,100, panelHall[0], 0,0.4));
level[0].wallPanels.push(new Panel(1880,100, panelHall[0], 0,0.4));
level[0].wallPanels.push(new Panel(1880,0, panelHall[0], 1,0.4));
level[0].wallPanels.push(new Panel(1780,0, panelHall[0], 1,0.4));
level[0].wallPanels.push(new Panel(1680,0, panelHall[0], 1,0.4));
level[0].wallPanels.push(new Panel(1580,0, panelHall[0], 1,0.4));
level[0].wallPanels.push(new Panel(1480,0, panelHall[0], 1,0.4));
level[0].wallPanels.push(new Panel(1330,0, panelHall[0], 1,0.4));
level[0].wallPanels.push(new Panel(1380,0, panelHall[0], 1,0.4));
level[0].wallPanels.push(new Panel(1230,100, panelHall[1], 0,0.4));
level[0].wallPanels.push(new Panel(1330,100, panelHall[1], 0,0.4));
level[0].wallPanels.push(new Panel(1430,100, panelHall[1], 0,0.4));
level[0].wallPanels.push(new Panel(1530,100, panelHall[1], 0,0.4));
level[0].wallPanels.push(new Panel(1630,100, panelHall[1], 0,0.4));
level[0].wallPanels.push(new Panel(1730,100, panelHall[1], 0,0.4));

level[0].wallPanels.push(new ForeGround(1030,200, wallFeatures[9], 0,0.5));
level[0].wallPanels.push(new ForeGround(730,100, wallFeatures[9], 0,0.5));
level[0].wallPanels.push(new ForeGround(330,100, wallFeatures[9], 0,0.5));
level[0].wallPanels.push(new ForeGround(30,200, wallFeatures[9], 0,0.5));
level[0].wallPanels.push(new ForeGround(80,50, wallFeatures[10], 0,0.5));
level[0].wallPanels.push(new ForeGround(680,0, wallFeatures[10], 0,0.5));
level[0].wallPanels.push(new ForeGround(1130,150, wallFeatures[10], 0,0.5));
level[0].wallPanels.push(new ForeGround(1180,50, wallFeatures[10], 0,0.5));
level[0].wallPanels.push(new ForeGround(1030,50, wallFeatures[10], 0,0.5));
level[0].wallPanels.push(new ForeGround(1580,50, wallFeatures[10], 0,0.5));
level[0].wallPanels.push(new ForeGround(1830,100, wallFeatures[10], 0,0.5));
level[0].wallPanels.push(new ForeGround(1880,250, wallFeatures[10], 0,0.5));
level[0].wallPanels.push(new ForeGround(1430,200, wallFeatures[9], 0,0.5));
level[0].wallPanels.push(new ForeGround(1440,100, door[1], '', 0.5));
level[0].wallPanels.push(new ForeGround(1230,100, wallFeatures[9], 0,0.5));
level[0].wallPanels.push(new ForeGround(1180,200, wallFeatures[12], 0,0.5));
level[0].wallPanels.push(new ForeGround(1180,100, wallFeatures[12], 0,0.5));
level[0].wallPanels.push(new ForeGround(1180,0, wallFeatures[12], 0,0.5));
level[0].wallPanels.push(new ForeGround(1830,200, wallFeatures[12], 0,0.5));
level[0].wallPanels.push(new ForeGround(1830,100, wallFeatures[12], 0,0.5));
level[0].wallPanels.push(new ForeGround(1830,0, wallFeatures[12], 0,0.5));
level[0].wallPanels.push(new ForeGround(1180,200, wallFeatures[0], 0,0.5));
level[0].wallPanels.push(new ForeGround(1180,100, wallFeatures[0], 0,0.5));
level[0].wallPanels.push(new ForeGround(1180,0, wallFeatures[0], 0,0.5));
level[0].wallPanels.push(new ForeGround(1080,200, wallFeatures[2], 0,0.5));
level[0].wallPanels.push(new ForeGround(1080,100, wallFeatures[2], 0,0.5));
level[0].wallPanels.push(new ForeGround(1080,0, wallFeatures[2], 0,0.5));
level[0].wallPanels.push(new ForeGround(1280,200, wallFeatures[1], 0,0.5));
level[0].wallPanels.push(new ForeGround(1280,100, wallFeatures[1], 0,0.5));
level[0].wallPanels.push(new ForeGround(1280,0, wallFeatures[1], 0,0.5));

level[0].wallPanels.push(new ForeGround(20,200, wallFeatures[12], 0,0.5));
level[0].wallPanels.push(new ForeGround(430,100, wallFeatures[7], 0,0.5));
level[0].wallPanels.push(new ForeGround(930,190, wallFeatures[8], 0,0.5));
level[0].wallPanels.push(new ForeGround(1510,110, wallFeatures[3], 0,0.5));
level[0].wallPanels.push(new ForeGround(1490,140, wallFeatures[8], 0,0.5));
level[0].foreGround.push(new ForeGround(1690,200, wallFeatures[7]));
level[0].wallPanels.push(new Panel(30,530, panelHall[1], 2,0.4));
level[0].wallPanels.push(new Panel(130,530, panelHall[1], 2,0.4));
level[0].wallPanels.push(new Panel(230,530, panelHall[1], 2,0.4));
level[0].wallPanels.push(new Panel(330,530, panelHall[1], 2,0.4));
level[0].wallPanels.push(new Panel(430,530, panelHall[0], 2,0.4));
level[0].wallPanels.push(new Panel(530,530, panelHall[1], 2,0.4));
level[0].wallPanels.push(new Panel(630,530, panelHall[1], 2,0.4));
level[0].wallPanels.push(new Panel(730,530, panelHall[1], 2,0.4));
level[0].wallPanels.push(new Panel(830,530, panelHall[1], 2,0.4));
level[0].wallPanels.push(new Panel(930,530, panelHall[0], 2,0.4));
level[0].wallPanels.push(new Panel(1030,530, panelHall[1], 2,0.4));
level[0].wallPanels.push(new Panel(1130,530, panelHall[1], 2,0.4));
level[0].wallPanels.push(new Panel(30,430, panelHall[0], 0,0.4));
level[0].wallPanels.push(new Panel(130,430, panelHall[0], 0,0.4));
level[0].wallPanels.push(new Panel(230,430, panelHall[0], 0,0.4));
level[0].wallPanels.push(new Panel(330,430, panelHall[0], 0,0.4));
level[0].wallPanels.push(new Panel(430,430, panelHall[0], 0,0.4));
level[0].wallPanels.push(new Panel(530,430, panelHall[0], 0,0.4));
level[0].wallPanels.push(new Panel(630,430, panelHall[0], 0,0.4));
level[0].wallPanels.push(new Panel(730,430, panelHall[0], 0,0.4));
level[0].wallPanels.push(new Panel(830,430, panelHall[0], 0,0.4));
level[0].wallPanels.push(new Panel(930,430, panelHall[0], 0,0.4));
level[0].wallPanels.push(new Panel(1030,430, panelHall[0], 0,0.4));
level[0].wallPanels.push(new Panel(1130,430, panelHall[0], 0,0.4));
level[0].wallPanels.push(new Panel(430,330, panelHall[0], 1,0.4));
level[0].wallPanels.push(new Panel(930,330, panelHall[0], 1,0.4));
level[0].wallPanels.push(new Panel(530,330, panelHall[1], 1,0.4));
level[0].wallPanels.push(new Panel(630,330, panelHall[1], 1,0.4));
level[0].wallPanels.push(new Panel(730,330, panelHall[1], 1,0.4));
level[0].wallPanels.push(new Panel(830,330, panelHall[1], 1,0.4));
level[0].wallPanels.push(new Panel(1030,330, panelHall[1], 1,0.4));
level[0].wallPanels.push(new Panel(1130,330, panelHall[1], 1,0.4));
level[0].wallPanels.push(new Panel(330,330, panelHall[1], 1,0.4));
level[0].wallPanels.push(new Panel(230,330, panelHall[1], 1,0.4));
level[0].wallPanels.push(new Panel(130,330, panelHall[1], 1,0.4));
level[0].wallPanels.push(new Panel(30,330, panelHall[1], 1,0.4));
level[0].wallPanels.push(new ForeGround(1000,300, floorHole[0]));
level[0].wallPanels.push(new ForeGround(330,430, door[0], '', 0.5));
level[0].wallPanels.push(new ForeGround(400,440, wallFeatures[3], 0,0.5));
level[0].wallPanels.push(new ForeGround(380,470, wallFeatures[7], 0,0.5));
level[0].wallPanels.push(new ForeGround(20,330, wallFeatures[12], 0,0.5));
level[0].wallPanels.push(new ForeGround(20,430, wallFeatures[12], 0,0.5));
level[0].wallPanels.push(new ForeGround(20,530, wallFeatures[12], 0,0.5));
level[0].foreGround.push(new ForeGround(220,530, wallFeatures[12]));
level[0].foreGround.push(new ForeGround(220,430, wallFeatures[12]));
level[0].foreGround.push(new ForeGround(220,330, wallFeatures[12]));
level[0].wallPanels.push(new Panel(1230,430, panelHall[0], 0,0.4));
level[0].wallPanels.push(new Panel(1330,430, panelHall[0], 0,0.4));
level[0].wallPanels.push(new Panel(1430,430, panelHall[0], 0,0.4));
level[0].wallPanels.push(new Panel(1530,430, panelHall[0], 0,0.4));
level[0].wallPanels.push(new Panel(1630,430, panelHall[0], 0,0.4));
level[0].wallPanels.push(new Panel(1730,430, panelHall[0], 0,0.4));
level[0].wallPanels.push(new Panel(1830,430, panelHall[0], 0,0.4));
level[0].wallPanels.push(new Panel(1880,430, panelHall[0], 0,0.4));
level[0].wallPanels.push(new Panel(1230,530, panelHall[1], 2,0.4));
level[0].wallPanels.push(new Panel(1330,530, panelHall[1], 2,0.4));
level[0].wallPanels.push(new Panel(1530,530, panelHall[1], 2,0.4));
level[0].wallPanels.push(new Panel(1630,530, panelHall[1], 2,0.4));
level[0].wallPanels.push(new Panel(1730,530, panelHall[1], 2,0.4));
level[0].wallPanels.push(new Panel(1430,530, panelHall[0], 2,0.4));
level[0].wallPanels.push(new Panel(1830,530, panelHall[0], 2,0.4));
level[0].wallPanels.push(new Panel(1880,530, panelHall[0], 2,0.4));
level[0].wallPanels.push(new Panel(1430,330, panelHall[0], 1,0.4));
level[0].wallPanels.push(new Panel(1830,330, panelHall[0], 1,0.4));
level[0].wallPanels.push(new Panel(1880,330, panelHall[0], 1,0.4));
level[0].wallPanels.push(new Panel(1230,330, panelHall[1], 1,0.4));
level[0].wallPanels.push(new Panel(1330,330, panelHall[1], 1,0.4));
level[0].wallPanels.push(new Panel(1530,330, panelHall[1], 1,0.4));
level[0].wallPanels.push(new Panel(1630,330, panelHall[1], 1,0.4));
level[0].wallPanels.push(new Panel(1730,330, panelHall[1], 1,0.4));
level[0].wallPanels.push(new ForeGround(1530,430, door[1], '', 0.5));
level[0].wallPanels.push(new wordTicker(1580,440, 'LOCKED'));
level[0].wallPanels.push(new wordTicker(1490,110, 'LOCKED'));
level[0].wallPanels.push(new ForeGround(1030,530, wallFeatures[9], 0,0.5));
level[0].wallPanels.push(new ForeGround(630,530, wallFeatures[9], 0,0.5));
level[0].wallPanels.push(new ForeGround(530,330, wallFeatures[9], 0,0.5));
level[0].wallPanels.push(new ForeGround(130,330, wallFeatures[9], 0,0.5));
level[0].wallPanels.push(new ForeGround(230,530, wallFeatures[9], 0,0.5));
level[0].wallPanels.push(new ForeGround(430,380, wallFeatures[10], 0,0.5));
level[0].wallPanels.push(new ForeGround(480,480, wallFeatures[10], 0,0.5));
level[0].wallPanels.push(new ForeGround(880,430, wallFeatures[10], 0,0.5));
level[0].wallPanels.push(new ForeGround(1480,480, wallFeatures[10], 0,0.5));
level[0].wallPanels.push(new ForeGround(1830,480, wallFeatures[10], 0,0.5));
level[0].wallPanels.push(new ForeGround(1930,380, wallFeatures[10], 0,0.5));
level[0].wallPanels.push(new ForeGround(1730,330, wallFeatures[9], 0,0.5));
level[0].wallPanels.push(new ForeGround(1330,430, wallFeatures[10], 0,0.5));
level[0].wallPanels.push(new ForeGround(1000,330, ceilingHole[0], 0,0.5));
level[0].foreGround.push(new ForeGround(1870,530, wallFeatures[0]));
level[0].foreGround.push(new ForeGround(1870,430, wallFeatures[0]));
level[0].foreGround.push(new ForeGround(1770,530, wallFeatures[0]));
level[0].foreGround.push(new ForeGround(1770,430, wallFeatures[0]));
level[0].foreGround.push(new ForeGround(1670,530, wallFeatures[0]));
level[0].foreGround.push(new ForeGround(1670,430, wallFeatures[0]));
level[0].foreGround.push(new ForeGround(1570,530, wallFeatures[0]));
level[0].foreGround.push(new ForeGround(1570,430, wallFeatures[0]));
level[0].foreGround.push(new ForeGround(1470,530, wallFeatures[0]));
level[0].foreGround.push(new ForeGround(1470,430, wallFeatures[0]));
level[0].foreGround.push(new ForeGround(1370,530, wallFeatures[0]));
level[0].foreGround.push(new ForeGround(1370,430, wallFeatures[0]));
level[0].foreGround.push(new ForeGround(1270,530, wallFeatures[0]));
level[0].foreGround.push(new ForeGround(1270,430, wallFeatures[0]));
level[0].foreGround.push(new ForeGround(1170,530, wallFeatures[0]));
level[0].foreGround.push(new ForeGround(1170,430, wallFeatures[0]));
level[0].foreGround.push(new ForeGround(1070,530, wallFeatures[2]));
level[0].foreGround.push(new ForeGround(1070,430, wallFeatures[2]));
level[0].foreGround.push(new ForeGround(1210,510, wallFeatures[6]));
level[0].wallPanels.push(new ForeGround(1410,500, wallFeatures[4], 0,0.5));
level[0].wallPanels.push(new ForeGround(560,470, wallFeatures[5], 0,0.5));
level[0].wallPanels.push(new ForeGround(570,470, wallFeatures[8], 0,0.5));
level[0].wallPanels.push(new ForeGround(1830,330, wallFeatures[12], 0,0.5));
level[0].wallPanels.push(new ForeGround(1830,430, wallFeatures[12], 0,0.5));
level[0].wallPanels.push(new ForeGround(1830,530, wallFeatures[12], 0,0.5));
level[0].wallPanels.push(new ForeGround(1180,330, wallFeatures[12], 0,0.5));
level[0].wallPanels.push(new ForeGround(1180,430, wallFeatures[12], 0,0.5));
level[0].wallPanels.push(new ForeGround(1180,530, wallFeatures[12], 0,0.5));
level[0].lamps.push(new sparker(180,370));
level[0].lamps.push(new sparker(780,160));
level[0].lamps.push(new sparker(1760,360));
level[0].lamps.push(new sparker(500,500));






	
level[0].wall.push(createWall(1690,200, 100,30,floor[1]));
level[0].wall.push(createWall(1360,270, 100,30,floor[2]));
level[0].wall.push(createWall(1390,270, 100,30,floor[2]));
level[0].wall.push(createWall(1380,240, 100,30,floor[2]));
level[0].wall.push(createWall(1730,170, 100,30,floor[2]));
level[0].wall.push(createWall(1790,270, 100,30,floor[2]));
level[0].wall.push(createWall(1790,240, 100,30,floor[2]));
level[0].wall.push(createWall(1640,270, 100,30,floor[2]));

level[0].wall.push(createWall(1970,200, 30,10,sideWall[1]));
level[0].wall.push(createWall(1970,100, 30,10,sideWall[1]));
level[0].wall.push(createWall(1970,0, 30,10,sideWall[1]));
level[0].wall.push(createWall(1970,0, 30,10,sideWall[5]));
level[0].wall.push(createWall(1970,300, 30,10,sideWall[6]));


level[0].wall.push(createWall(300,200, 100,30,floor[1]));
level[0].wall.push(createWall(270,270, 100,30,floor[2]));
level[0].wall.push(createWall(810,270, 100,30,floor[2]));
level[0].wall.push(createWall(780,270, 100,30,floor[2]));
level[0].wall.push(createWall(0,200, 30,10,sideWall[2]));
level[0].wall.push(createWall(0,100, 30,10,sideWall[2]));
level[0].wall.push(createWall(0,0, 30,10,sideWall[2]));
level[0].wall.push(createWall(0,0, 30,10,sideWall[5]));
level[0].wall.push(createWall(0,300, 30,10,sideWall[5]));
level[0].wall.push(createWall(30,300, 30,10,sideWall[6]));

level[0].foreGround.push(new ForeGround(850,530, foreGPic[0]));
level[0].foreGround.push(new ForeGround(950,530, foreGPic[1]));
level[0].foreGround.push(new ForeGround(30,530, foreGPic[1]));
level[0].foreGround.push(new ForeGround(40,510, foreGPic[3]));
level[0].foreGround.push(new ForeGround(960,510, foreGPic[3]));
level[0].foreGround.push(new ForeGround(910,510, foreGPic[4]));

level[0].wall.push(createWall(1530,530, 100,30,floor[1]));
level[0].wall.push(createWall(1630,600, 100,30,floor[2]));
level[0].wall.push(createWall(1630,570, 100,30,floor[2]));
level[0].wall.push(createWall(1670,600, 100,30,floor[2]));
level[0].wall.push(createWall(1660,570, 100,30,floor[2]));
level[0].wall.push(createWall(1650,540, 100,30,floor[2]));
level[0].wall.push(createWall(1560,500, 100,30,floor[2]));
level[0].wall.push(createWall(1490,600, 100,30,floor[2]));
level[0].wall.push(createWall(1420,600, 100,30,floor[2]));
level[0].wall.push(createWall(1730,530, 100,30,floor[1]));
level[0].wall.push(createWall(1830,530, 100,30,floor[1]));
level[0].wall.push(createWall(1770,500, 100,30,floor[2]));
level[0].wall.push(createWall(1800,500, 100,30,floor[2]));
level[0].wall.push(createWall(1780,470, 100,30,floor[2]));
level[0].wall.push(createWall(1880,500, 100,30,floor[2]));
level[0].wall.push(createWall(0,330, 30,10,sideWall[2]));
level[0].wall.push(createWall(0,330, 100,50,ceiling[0]));
level[0].wall.push(createWall(0,530, 30,10,sideWall[2]));
level[0].wall.push(createWall(0,430, 30,10,sideWall[1]));
level[0].wall.push(createWall(1970,330, 30,10,sideWall[1]));
level[0].wall.push(createWall(1970,430, 30,10,sideWall[1]));
level[0].wall.push(createWall(1970,530, 30,10,sideWall[2]));
level[0].wall.push(createWall(1970,660, 30,10,sideWall[2]));
level[0].wall.push(createWall(1970,630, 30,10,sideWall[5]));
level[0].wall.push(createWall(1940,630, 30,10,sideWall[6]));
level[0].wall.push(createWall(1900,330, 100,50,ceiling[0]));
level[0].foreGround.push(new ForeGround(360,200, foreGPic[0]));
level[0].foreGround.push(new ForeGround(460,200, foreGPic[1]));
level[0].dLights.push(new angledLight(80,200,50, 28));
level[0].dLights.push(new angledLight(1240,100,50, 28));
level[0].dLights.push(new angledLight(1220,200,45, 134));
level[0].dLights.push(new angledLight(1870,440,45, 134));
level[0].dLights.push(new angledLight(60,200,45, 134));
level[0].foreGround.push(new ForeGround(1500,550, foreGPic[3]));
level[0].foreGround.push(new ForeGround(1620,520, foreGPic[5]));
level[0].foreGround.push(new ForeGround(1580,480, foreGPic[5]));
level[0].items.push(pistolItem(1450,570));
level[0].items.push(medItem(1340,600));


level[0].foreGround.push(new ForeGround(1070,330, foreGPic[6]));
level[0].foreGround.push(new ForeGround(1000,330, foreGPic[7]));
level[0].foreGround.push(new ForeGround(540,20, foreGPic[7]));
level[0].foreGround.push(new ForeGround(140,20, foreGPic[7]));
level[0].foreGround.push(new ForeGround(430,20, foreGPic[6]));
level[0].foreGround.push(new ForeGround(1480,10, foreGPic[6]));
level[0].foreGround.push(new ForeGround(1340,20, foreGPic[7]));
level[0].foreGround.push(new ForeGround(420,180, foreGPic[5]));
level[0].foreGround.push(new ForeGround(1830,350, foreGPic[6]));
level[0].foreGround.push(new ForeGround(1430,350, foreGPic[7]));
level[0].foreGround.push(new ForeGround(280,340, foreGPic[7]));
level[0].foreGround.push(new ForeGround(630,350, foreGPic[6]));

level[0].lamps.push(new sparker(1460,150));
level[0].lamps.push(new sparker(1600,200));
level[0].lamps.push(new waterDrop(1870,100));
level[0].lamps.push(new waterDrop(1870,440));
level[0].lamps.push(new waterDrop(630,20));
level[0].lamps.push(new sparker(70,200));
level[0].lamps.push(new sparker(200,450));
level[0].lamps.push(new sparker(950,450));
level[0].lamps.push(new sparker(1000,380));
level[0].lamps.push(new sparker(1090,410));
level[0].lamps.push(new sparker(1080,370));
level[0].lamps.push(new sparker(1010,320));
level[0].lamps.push(new sparker(1080,310));
level[0].lamps.push(new sparker(1050,320));
level[0].lamps.push(new waterDrop(1100,340));
level[0].lamps.push(new waterDrop(650,350));
level[0].lamps.push(new waterDrop(1240,100));
level[0].lamps.push(new waterDrop(1220,200));
level[0].lamps.push(new sparker(450,50));
level[0].lamps.push(new sparker(450,20));
level[0].lamps.push(new sparker(540,50));
level[0].lamps.push(new sparker(150,80));
level[0].lamps.push(new sparker(1490,80));
level[0].lamps.push(new waterDrop(1330,20));
level[0].lamps.push(new waterDrop(1350,20));
level[0].lamps.push(new waterDrop(1340,60));
level[0].lamps.push(new sparker(1550,400));
level[0].lamps.push(new BigLampFlicker(1210,350));


////////////////

level[0].wallPanels.push(new Panel(1200,660, panelHall[1], 1,0.5));
level[0].wallPanels.push(new Panel(1300,660, panelHall[1], 1,0.2));
level[0].wallPanels.push(new Panel(1100,660, panelHall[1], 1,0.2));
level[0].wallPanels.push(new Panel(1000,660, panelHall[1], 1,0.2));
level[0].wallPanels.push(new Panel(1400,660, panelHall[1], 1,0.2));
level[0].wallPanels.push(new Panel(1500,660, panelHall[1], 1,0.2));
level[0].wallPanels.push(new Panel(900,660, panelHall[1], 1,0.2));
level[0].wallPanels.push(new ForeGround(1200,630, floorHole[0]));
level[0].wallPanels.push(new Panel(1200,760, panelHall[0], 0,0.4));
level[0].wallPanels.push(new Panel(1100,760, panelHall[0], 0,0.4));
level[0].wallPanels.push(new Panel(1300,760, panelHall[0], 0,0.4));
level[0].wallPanels.push(new Panel(1100,860, panelHall[1], 0,0.4));
level[0].wallPanels.push(new Panel(1000,860, panelHall[1], 0,0.4));
level[0].wallPanels.push(new Panel(1200,860, panelHall[1], 0,0.4));
level[0].wallPanels.push(new Panel(1300,860, panelHall[1], 0,0.4));
level[0].wallPanels.push(new Panel(1400,860, panelHall[1], 0,0.4));
level[0].wallPanels.push(new Panel(1500,860, panelHall[1], 0,0.2));
level[0].wallPanels.push(new Panel(900,860, panelHall[1], 0,0.2));
level[0].wallPanels.push(new Panel(1400,760, panelHall[0], 0,0.2));
level[0].wallPanels.push(new Panel(1500,760, panelHall[0], 0,0.2));
level[0].wallPanels.push(new Panel(1000,760, panelHall[0], 0,0.2));
level[0].wallPanels.push(new Panel(900,760, panelHall[0], 0,0.2));
level[0].wallPanels.push(new Panel(1600,760, panelHall[0], 0,0.1));
level[0].wallPanels.push(new Panel(800,760, panelHall[0], 0,0.1));
level[0].wallPanels.push(new Panel(1600,860, panelHall[1], 0,0.1));
level[0].wallPanels.push(new Panel(800,860, panelHall[1], 0,0.1));
level[0].wallPanels.push(new Panel(1600,660, panelHall[1], 1,0.1));
level[0].wallPanels.push(new Panel(1700,660, panelHall[1], 1,0.1));
level[0].wallPanels.push(new Panel(800,660, panelHall[1], 1,0.1));
level[0].wallPanels.push(new ForeGround(1180,660, wallFeatures[12], 0,0.5));
level[0].wallPanels.push(new ForeGround(1180,760, wallFeatures[12], 0,0.5));
level[0].wallPanels.push(new ForeGround(1180,860, wallFeatures[12], 0,0.5));
level[0].wall.push(createWall(1870,960, 100,30,floor[0]));
level[0].wall.push(createWall(1770,960, 100,30,floor[0]));
level[0].wall.push(createWall(1670,960, 100,30,floor[0]));
level[0].wall.push(createWall(1570,960, 100,30,floor[0]));
level[0].wall.push(createWall(1470,960, 100,30,floor[0]));
level[0].wall.push(createWall(1370,960, 100,30,floor[0]));
level[0].wall.push(createWall(1270,960, 100,30,floor[0]));
level[0].wall.push(createWall(1170,960, 100,30,floor[0]));
level[0].wall.push(createWall(1070,960, 100,30,floor[0]));
level[0].wall.push(createWall(970,960, 100,30,floor[0]));
level[0].wall.push(createWall(870,960, 100,30,floor[0]));
level[0].wall.push(createWall(770,960, 100,30,floor[0]));

level[0].rLights.push(new staticLight(1160,430, 20));
level[0].rLights.push(new staticLight(1160,530, 20));
level[0].rLights.push(new staticLight(1170,100, 20));
level[0].rLights.push(new staticLight(1170,200, 20));
level[0].rLights.push(new staticLight(1290,200, 20));
level[0].rLights.push(new staticLight(1290,100, 20));
level[0].lamps.push(new Lamp(150,120));
level[0].lamps.push(new FlickerLamp(650,120));
level[0].lamps.push(new Lamp(1910,120));
level[0].lamps.push(new FlickerLamp(1650,70));
level[0].dLights.push(new spinLight(1470,140,50,0));
level[0].dLights.push(new spinLight(1560,450,50,0));
level[0].lamps.push(new Lamp(1360,450));
level[0].lamps.push(new Lamp(1810,450));
level[0].lamps.push(new Lamp(750,450));
level[0].lamps.push(new Lamp(550,450));
level[0].lamps.push(new FlickerLamp(350,450));
level[0].lamps.push(new deadLamp(150,450));
level[0].lamps.push(new deadLamp(950,450));
level[0].lamps.push(new deadLamp(1100,450));

level[0].lamps.push(new Lamp(1050,720));
level[0].lamps.push(new Lamp(1450,720));
level[0].lamps.push(new FlickerLamp(1650,720));
level[0].lamps.push(new FlickerLamp(840,730));
level[0].rLights.push(new staticLight(1280,650, 20));
level[0].lamps.push(new sparker(1280,650));


level[0].wallPanels.push(new ForeGround(1300,850, wallFeatures[13], 0,0.5));
level[0].wallPanels.push(new ForeGround(1280,490, wallFeatures[13], 0,0.5));

level[0].wallPanels.push(new ForeGround(810,770, wallFeatures[7], 0,0.5));


level[0].wallPanels.push(new Panel(0,700, panelHall[0], 1,0.4));
level[0].wallPanels.push(new Panel(100,700, panelHall[0], 1,0.4));
level[0].wallPanels.push(new Panel(200,700, panelHall[2], 1,0.4));
level[0].wallPanels.push(new Panel(300,700, panelHall[0], 1,0.4));
level[0].wallPanels.push(new Panel(400,700, panelHall[0], 1,0.4));
level[0].wallPanels.push(new Panel(0,800, panelHall[0], 0,0.4));
level[0].wallPanels.push(new Panel(100,800, panelHall[0], 0,0.4));
level[0].wallPanels.push(new Panel(300,800, panelHall[0], 0,0.4));
level[0].wallPanels.push(new Panel(400,800, panelHall[0], 0,0.4));
level[0].wallPanels.push(new Panel(0,900, panelHall[0], 0,0.4));
level[0].wallPanels.push(new Panel(100,900, panelHall[0], 0,0.4));
level[0].wallPanels.push(new Panel(300,900, panelHall[0], 0,0.4));
level[0].wallPanels.push(new Panel(400,900, panelHall[0], 0,0.4));
level[0].wallPanels.push(new Panel(0,1000, panelHall[0], 2,0.4));
level[0].wallPanels.push(new Panel(100,1000, panelHall[0], 2,0.4));
level[0].wallPanels.push(new Panel(300,1000, panelHall[0], 2,0.4));
level[0].wallPanels.push(new Panel(400,1000, panelHall[0], 2,0.4));
level[0].wallPanels.push(new Panel(200,800, panelHall[2], 0,0.4));
level[0].wallPanels.push(new Panel(200,900, panelHall[2], 0,0.4));65
level[0].wallPanels.push(new Panel(200,1000, panelHall[2], 2,0.4));
level[0].wallPanels.push(new ForeGround(200,1000, wallFeatures[12]));
level[0].wallPanels.push(new ForeGround(200,900, wallFeatures[12]));
level[0].wallPanels.push(new ForeGround(200,800, wallFeatures[12]));
level[0].wallPanels.push(new ForeGround(200,700, wallFeatures[12]));
level[0].wall.push(createWall(300,1100, 100,30,floor[0]));
level[0].wall.push(createWall(400,1100, 100,30,floor[0]));
level[0].wall.push(createWall(100,1100, 100,30,floor[0]));
level[0].wall.push(createWall(0,1100, 100,30,floor[0]));
level[0].wall.push(createWall(0,1100, 30,100,sideWall[5]));
level[0].wall.push(createWall(0,1130, 30,100,sideWall[6]));
level[0].wall.push(createWall(0,1070, 30,100,sideWall[6]));
level[0].wallPanels.push(new ForeGround(200,1000, wallFeatures[0]));
level[0].wallPanels.push(new ForeGround(200,900, wallFeatures[0]));
level[0].wallPanels.push(new ForeGround(200,800, wallFeatures[0]));
level[0].wallPanels.push(new ForeGround(100,1000, wallFeatures[2]));
level[0].wallPanels.push(new ForeGround(100,900, wallFeatures[2]));
level[0].wallPanels.push(new ForeGround(100,800, wallFeatures[2]));
level[0].wallPanels.push(new ForeGround(300,1000, wallFeatures[1]));
level[0].wallPanels.push(new ForeGround(300,900, wallFeatures[1]));
level[0].wallPanels.push(new ForeGround(300,800, wallFeatures[1]));

level[0].lamps.push(new Lamp(70,720));
level[0].lamps.push(new FlickerLamp(420,720));
level[0].rLights.push(new staticLight(250,1050, 20));
level[0].rLights.push(new staticLight(250,950, 20));
level[0].dLights.push(new spinLight(250,810,50,0));
level[0].wall.push(createWall(740,960, 30,100,sideWall[5]));
level[0].wall.push(createWall(710,990, 100,30,floor[2]));

level[0].wall.push(createWall(500,1100, 100,30,floor[0]));
level[0].wall.push(createWall(600,1100, 100,30,floor[0]));
level[0].wall.push(createWall(700,1100, 100,30,floor[0]));
level[0].wall.push(createWall(610,1000, 100,30,floor[1]));
level[0].wall.push(createWall(570,1070, 100,30,floor[2]));
level[0].wall.push(createWall(580,1040, 100,30,floor[2]));
level[0].wall.push(createWall(580,1010, 100,30,floor[2]));
level[0].wall.push(createWall(530,1070, 100,30,floor[2]));
level[0].wall.push(createWall(550,1040, 100,30,floor[2]));
level[0].wall.push(createWall(490,1070, 100,30,floor[2]));
level[0].wall.push(createWall(0,690, 100,50,ceiling[0]));
level[0].wall.push(createWall(100,690, 100,50,ceiling[0]));
level[0].wall.push(createWall(200,690, 100,50,ceiling[0]));
level[0].wall.push(createWall(300,690, 100,50,ceiling[0]));
level[0].wall.push(createWall(400,690, 100,50,ceiling[0]));
level[0].wall.push(createWall(500,690, 100,50,ceiling[0]));
level[0].wall.push(createWall(600,690, 100,50,ceiling[0]));
level[0].wall.push(createWall(700,690, 100,50,ceiling[0]));
level[0].wall.push(createWall(770,660, 30,100,sideWall[5]));
level[0].wall.push(createWall(0,660, 30,100,sideWall[5]));
level[0].wallPanels.push(new ForeGround(0,620, pipes[4]));
level[0].wallPanels.push(new ForeGround(100,620, pipes[4]));
level[0].wallPanels.push(new ForeGround(200,620, pipes[4]));
level[0].wallPanels.push(new ForeGround(300,620, pipes[4]));
level[0].wallPanels.push(new ForeGround(400,620, pipes[4]));
level[0].wallPanels.push(new ForeGround(500,620, pipes[4]));
level[0].wallPanels.push(new ForeGround(600,620, pipes[4]));
level[0].wallPanels.push(new ForeGround(700,620, pipes[4]));
level[0].wallPanels.push(new ForeGround(800,620, pipes[4]));
level[0].wallPanels.push(new ForeGround(900,620, pipes[1]));
level[0].wall.push(createWall(0,630, 30,100,sideWall[5]));
level[0].wallPanels.push(new ForeGround(900,720, wallFeatures[12]));
level[0].wallPanels.push(new ForeGround(900,820, wallFeatures[12]));
level[0].wallPanels.push(new ForeGround(900,920, pipes[3]));
level[0].foreGround.push(new ForeGround(600,1000, wallFeatures[12]));
level[0].foreGround.push(new ForeGround(600,900, wallFeatures[12]));
level[0].foreGround.push(new ForeGround(600,800, pipes[1]));
level[0].foreGround.push(new ForeGround(500,800, pipes[4]));
level[0].foreGround.push(new ForeGround(400,800, pipes[4]));
level[0].foreGround.push(new ForeGround(300,800, pipes[4]));
level[0].foreGround.push(new ForeGround(200,800, pipes[4]));
level[0].foreGround.push(new ForeGround(100,800, pipes[4]));
level[0].foreGround.push(new ForeGround(0,800, pipes[4]));
level[0].wall.push(createWall(270,660, 30,100,sideWall[6]));
level[0].wall.push(createWall(470,660, 30,100,sideWall[6]));
level[0].wall.push(createWall(670,660, 30,100,sideWall[6]));
level[0].foreGround.push(new ForeGround(1100,660, pipes[3]));
level[0].foreGround.push(new ForeGround(1200,660, pipes[4]));
level[0].foreGround.push(new ForeGround(1300,660, pipes[4]));
level[0].foreGround.push(new ForeGround(1400,660, pipes[4]));
level[0].foreGround.push(new ForeGround(1500,660, pipes[4]));
level[0].foreGround.push(new ForeGround(1600,660, pipes[4]));
level[0].foreGround.push(new ForeGround(1700,660, pipes[4]));
level[0].foreGround.push(new ForeGround(1800,660, pipes[4]));
level[0].foreGround.push(new ForeGround(1900,660, pipes[4]));
level[0].wallPanels.push(new ForeGround(1500,660, wallFeatures[11]));
level[0].wallPanels.push(new ForeGround(1500,760, wallFeatures[11]));
level[0].wallPanels.push(new ForeGround(1500,860, wallFeatures[11]));
level[0].wall.push(createWall(70,660, 30,100,sideWall[6]));
level[0].wallPanels.push(new ForeGround(350,900, wallFeatures[10]));
level[0].wallPanels.push(new ForeGround(100,750, wallFeatures[10]));
level[0].wallPanels.push(new ForeGround(230,1010, wallFeatures[5]));
level[0].wallPanels.push(new ForeGround(70,950, wallFeatures[13]));
level[0].wallPanels.push(new ForeGround(1100,860, wallFeatures[9]));
level[0].wallPanels.push(new ForeGround(1040,820, wallFeatures[3]));
level[0].wallPanels.push(new ForeGround(350,950, wallFeatures[3]));

level[0].wallPanels.push(new Panel(700,860, panelHall[1], 2,0.2));
level[0].wallPanels.push(new Panel(700,760, panelHall[0], 0,0.2));
level[0].wallPanels.push(new Panel(600,800, panelHall[0], 0,0.3));
level[0].wallPanels.push(new Panel(500,800, panelHall[0], 0,0.3));
level[0].wallPanels.push(new Panel(600,900, panelHall[1], 0,0.3));
level[0].wallPanels.push(new Panel(500,900, panelHall[1], 0,0.3));
level[0].wallPanels.push(new Panel(700,660, panelHall[1], 1,0.2));
level[0].wallPanels.push(new Panel(600,700, panelHall[1], 1,0.3));
level[0].wallPanels.push(new Panel(500,700, panelHall[1], 1,0.3));
level[0].wallPanels.push(new Panel(500,1000, panelHall[1], 2,0.3));
level[0].wallPanels.push(new Panel(600,1000, panelHall[1], 2,0.3));
level[0].wallPanels.push(new Panel(700,1000, panelHall[0], 0,0.2));
level[0].wallPanels.push(new ForeGround(710,990, pipes[3]));
level[0].wallPanels.push(new ForeGround(810,990, pipes[4]));
level[0].wallPanels.push(new ForeGround(910,990, pipes[4]));
level[0].wallPanels.push(new ForeGround(1010,990, pipes[4]));
level[0].wallPanels.push(new ForeGround(1110,990, pipes[4]));
level[0].wallPanels.push(new ForeGround(1210,990, pipes[4]));
level[0].wallPanels.push(new Panel(800,1000, panelHall[1], 0,0.1));
level[0].wallPanels.push(new Panel(900,1000, panelHall[1], 0,0.1));
level[0].wallPanels.push(new Panel(1000,1000, panelHall[1], 0,0.1));
level[0].wallPanels.push(new Panel(1100,1000, panelHall[1], 0,0.1));
level[0].wallPanels.push(new Panel(1200,1000, panelHall[1], 0,0.1));
level[0].wallPanels.push(new ForeGround(800,990, pipes[4]));
level[0].wallPanels.push(new ForeGround(900,990, pipes[4]));
level[0].wallPanels.push(new ForeGround(1000,990, pipes[4]));
level[0].wallPanels.push(new ForeGround(1100,990, pipes[4]));
level[0].wallPanels.push(new ForeGround(1200,990, pipes[4]));




level[0].creature.push(Marine(1150,110,3));
level[0].creature.push(Marine(1360,80,3));
level[0].creature.push(Marine(1320,450,3));
level[0].creature.push(Marine(1650,360,3));

level[0].creature.push(HighInsect(250,80,0));
level[0].creature.push(HighInsect(140,80,0));
level[0].creature.push(HighInsect(120,870,0));
level[0].creature.push(HighInsect(350,860,0));
level[0].lamps.push(new BigLamp(510,910));

level[0].wallPanels.push(new ForeGround(250,900, wallFeatures[14]));


level[0].lamps.push(new BigLamp(440,70));
level[0].lamps.push(new BigLamp(840,70));
level[0].lamps.push(new BigLamp(640,70));

level[0].lamps.push(new pulseLight(650,340));
level[0].lamps[55].addPLight(750, 340);
level[0].lamps[55].addPLight(850, 340);
level[0].lamps[55].addPLight(950, 340);

level[0].lamps.push(new pulseLight(30,620));
level[0].lamps[56].addPLight(50, 620);
level[0].lamps[56].addPLight(70, 620);
level[0].lamps[56].addPLight(90, 620);
level[0].lamps[56].addPLight(110, 620);
level[0].lamps[56].addPLight(130, 630);
level[0].lamps[56].addPLight(150, 630);
level[0].lamps[56].addPLight(170, 630);
level[0].lamps[56].addPLight(190, 630);
level[0].lamps[56].addPLight(210, 630);
level[0].lamps[56].addPLight(230, 630);
level[0].lamps[56].addPLight(250, 630);
level[0].lamps[56].addPLight(270, 630);
level[0].lamps[56].addPLight(290, 630);
level[0].lamps[56].addPLight(310, 630);
level[0].lamps[56].addPLight(330, 630);
level[0].lamps[56].addPLight(350, 630);
level[0].lamps[56].addPLight(370, 630);
level[0].lamps[56].addPLight(390, 630);
level[0].lamps[56].addPLight(410, 630);
level[0].lamps[56].addPLight(430, 630);
level[0].lamps[56].addPLight(450, 630);
level[0].lamps[56].addPLight(470, 630);
level[0].lamps[56].addPLight(490, 620);
level[0].lamps[56].addPLight(490, 600);
level[0].lamps[56].addPLight(490, 590);
level[0].lamps[56].addPLight(490, 570);
level[0].lamps[56].addPLight(490, 550);
level[0].lamps[56].addPLight(490, 530);
level[0].lamps[56].addPLight(490, 510);
level[0].lamps[56].addPLight(490, 490);
level[0].lamps[56].addPLight(490, 480);
level[0].lamps[56].addPLight(480, 470);
level[0].lamps[56].addPLight(470, 460);
level[0].lamps[56].addPLight(450, 460);
level[0].lamps[56].addPLight(430, 460);
level[0].lamps[56].addPLight(410, 460);
level[0].lamps[56].addPLight(390, 460);
level[0].lamps[56].addPLight(390, 440);
level[0].lamps[56].addPLight(390, 410);
level[0].lamps[56].addPLight(390, 390);
level[0].lamps[56].addPLight(390, 370);
level[0].lamps[56].addPLight(390, 350);
level[0].lamps[56].addPLight(410, 340);
level[0].lamps[56].addPLight(430, 350);
level[0].lamps[56].addPLight(450, 350);
level[0].lamps[56].addPLight(470, 350);
level[0].lamps[56].addPLight(480, 340);
level[0].lamps[56].addPLight(500, 340);
level[0].lamps[56].addPLight(520, 340);
level[0].lamps[56].addPLight(530, 350);
level[0].lamps[56].addPLight(560, 350);
level[0].lamps[56].addPLight(580, 340);
level[0].lamps[56].addPLight(600, 340);
level[0].lamps[56].addPLight(630, 350);

generateForeGround();
	
	
	
	
level.push(new Level("They haven't come for me"))

level[1].wallPanels.push(new Panel(300,200, panelHall[1], 1,0.7));
level[1].wallPanels.push(new Panel(500,200, panelHall[1], 1,0.7));
level[1].wallPanels.push(new Panel(400,200, panelHall[0], 1,0.7));
level[1].wallPanels.push(new Panel(600,200, panelHall[1], 1,0.7));
level[1].wallPanels.push(new Panel(200,200, panelHall[1], 1,0.7));
level[1].wallPanels.push(new Panel(200,300, panelHall[1], 2,0.7));
level[1].wallPanels.push(new Panel(600,300, panelHall[1], 2,0.7));
level[1].wallPanels.push(new Panel(400,300, panelHall[0], 2,0.7));
level[1].wallPanels.push(new Panel(300,300, panelHall[0], 2,0.7));
level[1].wallPanels.push(new Panel(500,300, panelHall[0], 2,0.7));
//level[1].wallPanels.push(new ForeGround(500,200, door[0], '', 0.5));
level[1].wallPanels.push(new AniDoor(500,200, 0,1));
level[1].wallPanels.push(new ForeGround(220,200, wallFeatures[14]));
level[1].wallPanels.push(new ForeGround(440,350, wallFeatures[15]));
level[1].wallPanels.push(new ForeGround(520,270, wallFeatures[16]));
	
	level[1].wall.push(createWall(170,300, 30,100,sideWall[2]));
level[1].wall.push(createWall(170,200, 30,100,sideWall[2]));
level[1].wall.push(createWall(700,200, 30,100,sideWall[2]));
level[1].wall.push(createWall(700,300, 30,100,sideWall[2]));
level[1].wall.push(createWall(200,400, 100,30,floor[0]));
level[1].wall.push(createWall(300,400, 100,30,floor[0]));
level[1].wall.push(createWall(400,400, 100,30,floor[0]));
level[1].wall.push(createWall(500,400, 100,30,floor[0]));
level[1].wall.push(createWall(600,400, 100,30,floor[0]));
level[1].wall.push(createWall(200,190, 100,50,ceiling[0]));
level[1].wall.push(createWall(300,190, 100,50,ceiling[0]));
level[1].wall.push(createWall(400,190, 100,50,ceiling[0]));
level[1].wall.push(createWall(500,190, 100,50,ceiling[0]));
level[1].wall.push(createWall(600,190, 100,50,ceiling[0]));
level[1].wall.push(createWall(170,190, 30,100,sideWall[5]));
level[1].wall.push(createWall(700,190, 30,100,sideWall[5]));
level[1].wall.push(createWall(700,400, 30,100,sideWall[5]));
level[1].wall.push(createWall(170,400, 30,100,sideWall[5]));
level[1].wall.push(createWall(200,400, 30,100,sideWall[6]));
level[1].wall.push(createWall(670,400, 30,100,sideWall[6]));
level[1].wallPanels.push(new wordTicker(550,210, 'OPEN'));
level[1].lamps.push(new Lamp(470,220));
level[1].lamps.push(new Lamp(420,220));
level[1].lamps.push(new BigLamp(260,200));
level[1].wallPanels.push(new wordWall(210,250, 'SECTOR 95',5));
level[1].wallPanels.push(new wordWall(210,260, 'CELL 2',5));

level[1].creature.push(baseLineMutant(230,210,1)); //Player is baseline Reptile
level[1].creature[0].speak("I haven't heard anything for hours.");
//level[1].end = {x:600, y: 300}
level[1].exits.push(new Exit(600,300, 2,true, 450, 210));
level[1].nextScene = 1
	

	
	
level.push(new Level('Alone'))
level[2].start = {x:460, y:200};
level[2].dLights.push(new steamJet(1150,300));
level[2].items.push(messageTrap(330,310, recorder, 'RESEARCH LOG', 'Prototype T-927 ~~LOG 37.2 ~~Subject has continued to display serious emotional instability despite increased mental focus and high aptitude for problem solving.  ~~The insect gene base appears to be increasing attention span and mental focus at the expense of interpersonal skills and tolerance to other subjects. ~~END LOG'));
level[2].nextScene = 2;
level[2].items.push(messageTrap(1300,260, recorder, 'REMINDER', 'Note to all emplyees:~~ This message is to remind all personel that contact with the prototypes is extremely off limits.  ~~Observe all safety precautions when handling expired test subjects and related materials.'));

level[2].wallPanels.push(new Panel(200,100, panelHall[1], 1,0.8));
level[2].wallPanels.push(new Panel(300,100, panelHall[1], 1,0.8));
level[2].wallPanels.push(new Panel(400,100, panelHall[1], 1,0.8));
level[2].wallPanels.push(new Panel(500,100, panelHall[1], 1,0.8));
level[2].wallPanels.push(new Panel(700,100, panelHall[1], 1,0.8));
level[2].wallPanels.push(new Panel(800,100, panelHall[1], 1,0.8));
level[2].wallPanels.push(new Panel(900,100, panelHall[1], 1,0.8));
level[2].wallPanels.push(new Panel(1000,100, panelHall[1], 1,0.8));
level[2].wallPanels.push(new Panel(1200,100, panelHall[1], 1,0.8));
level[2].wallPanels.push(new Panel(1300,100, panelHall[1], 1,0.8));
level[2].wallPanels.push(new Panel(1400,100, panelHall[1], 1,0.8));
level[2].wallPanels.push(new Panel(1500,100, panelHall[1], 1,0.8));
level[2].wallPanels.push(new Panel(600,100, panelHall[2], 1,0.8));
level[2].wallPanels.push(new Panel(1100,100, panelHall[2], 1,0.8));
level[2].wallPanels.push(new Panel(1600,100, panelHall[2], 1,0.8));
level[2].wallPanels.push(new Panel(1700,100, panelHall[0], 1,0.8));
level[2].wallPanels.push(new Panel(1700,200, panelHall[0], 0,0.8));
level[2].wallPanels.push(new Panel(1700,300, panelHall[0], 2,0.8));
level[2].wallPanels.push(new Panel(1600,200, panelHall[2], 0,0.8));
level[2].wallPanels.push(new Panel(1100,200, panelHall[2], 0,0.8));
level[2].wallPanels.push(new Panel(600,200, panelHall[2], 0,0.8));
level[2].wallPanels.push(new Panel(1100,300, panelHall[2], 2,0.8));
level[2].wallPanels.push(new Panel(1600,300, panelHall[2], 2,0.8));
level[2].wallPanels.push(new Panel(600,300, panelHall[2], 2,0.8));
level[2].wallPanels.push(new Panel(700,200, panelHall[1], 0,0.8));
level[2].wallPanels.push(new Panel(800,200, panelHall[1], 0,0.8));
level[2].wallPanels.push(new Panel(900,200, panelHall[1], 0,0.8));
level[2].wallPanels.push(new Panel(1000,200, panelHall[1], 0,0.8));
level[2].wallPanels.push(new Panel(1200,200, panelHall[1], 0,0.8));
level[2].wallPanels.push(new Panel(1300,200, panelHall[1], 0,0.8));
level[2].wallPanels.push(new Panel(1400,200, panelHall[1], 0,0.8));
level[2].wallPanels.push(new Panel(1500,200, panelHall[1], 0,0.8));
level[2].wallPanels.push(new Panel(200,200, panelHall[1], 0,0.8));
level[2].wallPanels.push(new Panel(300,200, panelHall[1], 0,0.8));
level[2].wallPanels.push(new Panel(400,200, panelHall[1], 0,0.8));
level[2].wallPanels.push(new Panel(500,200, panelHall[1], 0,0.8));
level[2].wallPanels.push(new Panel(200,300, panelHall[1], 2,0.8));
level[2].wallPanels.push(new Panel(300,300, panelHall[1], 2,0.8));
level[2].wallPanels.push(new Panel(400,300, panelHall[1], 2,0.8));
level[2].wallPanels.push(new Panel(500,300, panelHall[1], 2,0.8));
level[2].wallPanels.push(new Panel(700,300, panelHall[1], 2,0.8));
level[2].wallPanels.push(new Panel(800,300, panelHall[1], 2,0.8));
level[2].wallPanels.push(new Panel(900,300, panelHall[1], 2,0.8));
level[2].wallPanels.push(new Panel(1000,300, panelHall[1], 2,0.8));
level[2].wallPanels.push(new Panel(1200,300, panelHall[1], 2,0.8));
level[2].wallPanels.push(new Panel(1300,300, panelHall[1], 2,0.8));
level[2].wallPanels.push(new Panel(1400,300, panelHall[1], 2,0.8));
level[2].wallPanels.push(new Panel(1500,300, panelHall[1], 2,0.8));
level[2].wallPanels.push(new Panel(100,300, panelHall[0], 2,0.8));
level[2].wallPanels.push(new Panel(100,200, panelHall[0], 0,0.8));
level[2].wallPanels.push(new Panel(100,100, panelHall[0], 1,0.8));


level[2].wallPanels.push(new ForeGround(600,100, wallFeatures[12]));
level[2].wallPanels.push(new ForeGround(600,200, wallFeatures[12]));
level[2].wallPanels.push(new ForeGround(600,300, wallFeatures[12]));
level[2].wallPanels.push(new ForeGround(1100,100, wallFeatures[12]));
level[2].wallPanels.push(new ForeGround(1100,200, wallFeatures[12]));
level[2].wallPanels.push(new ForeGround(1100,300, wallFeatures[12]));
level[2].wallPanels.push(new ForeGround(1600,100, wallFeatures[12]));
level[2].wallPanels.push(new ForeGround(1600,200, wallFeatures[12]));
level[2].wallPanels.push(new ForeGround(1600,300, wallFeatures[12]));

level[2].wallPanels.push(new ForeGround(1100,300, wallFeatures[0]));
level[2].wallPanels.push(new ForeGround(1100,200, wallFeatures[0]));
level[2].wallPanels.push(new ForeGround(1100,100, wallFeatures[0]));
level[2].wallPanels.push(new ForeGround(1000,200, wallFeatures[2]));
level[2].wallPanels.push(new ForeGround(1000,100, wallFeatures[2]));
level[2].wallPanels.push(new ForeGround(1200,300, wallFeatures[1]));
level[2].wallPanels.push(new ForeGround(1200,200, wallFeatures[1]));
level[2].wallPanels.push(new ForeGround(1200,100, wallFeatures[1]));





level[2].wallPanels.push(new ForeGround(600,300, wallFeatures[0]));
level[2].wallPanels.push(new ForeGround(600,200, wallFeatures[0]));
level[2].wallPanels.push(new ForeGround(600,100, wallFeatures[0]));
level[2].wallPanels.push(new ForeGround(500,200, wallFeatures[2]));
level[2].wallPanels.push(new ForeGround(500,100, wallFeatures[2]));
level[2].wallPanels.push(new ForeGround(700,200, wallFeatures[1]));
level[2].wallPanels.push(new ForeGround(700,100, wallFeatures[1]));

//level[2].wallPanels.push(new ForeGround(450,200, door[0], '', 0.5));
level[2].wallPanels.push(new AniDoor(450,200, 0, 1));
//level[2].wallPanels.push(new ForeGround(150,200, door[1], '', 0.5));
level[2].wallPanels.push(new AniDoor(150,200, 1,0));
level[2].wallPanels.push(new AniDoor(650,200, 0,1));
level[2].wallPanels.push(new AniDoor(950,200, 1,0));
level[2].wallPanels.push(new AniDoor(1300,200, 0,1));
level[2].wallPanels.push(new wordTicker(200,210, 'CELL 1'));
level[2].wallPanels.push(new wordTicker(500,210, 'CELL 2'));
level[2].wallPanels.push(new wordTicker(700,210, 'CELL 3'));
level[2].wallPanels.push(new wordTicker(1000,210, 'CELL 4'));
level[2].wallPanels.push(new wordTicker(1350,210, 'LAB 1'));
level[2].lamps.push(new Lamp(1340,210));
level[2].lamps.push(new Lamp(1450,210));
level[2].lamps.push(new BigLamp(510,230));
level[2].lamps.push(new BigLampFlicker(210,230));
level[2].lamps.push(new BigLampFlicker(210,230));
level[2].lamps.push(new BigLampDead(710,230));
level[2].lamps.push(new BigLampFlicker(1010,230));

level[2].lamps.push(new pulseLight(200,390));
level[2].lamps[7].addPLight(300, 390);
level[2].lamps[7].addPLight(400, 390);
level[2].lamps[7].addPLight(500, 390);
level[2].lamps[7].addPLight(600, 390);
level[2].lamps[7].addPLight(700, 390);
level[2].lamps[7].addPLight(800, 390);
level[2].lamps[7].addPLight(900, 390);
level[2].lamps[7].addPLight(1000, 390);
level[2].lamps[7].addPLight(1100, 390);
level[2].lamps[7].addPLight(1200, 390);
level[2].lamps[7].addPLight(1300, 390);
level[2].lamps[7].addPLight(1400, 390);

level[2].wall.push(createWall(70,300, 30,100,sideWall[1]));
level[2].wall.push(createWall(70,200, 30,100,sideWall[1]));
level[2].wall.push(createWall(70,100, 30,100,sideWall[1]));
level[2].wall.push(createWall(1800,100, 30,100,sideWall[4]));
level[2].wall.push(createWall(1800,300, 30,100,sideWall[3]));
level[2].wall.push(createWall(1800,200, 30,100,sideWall[2]));
level[2].wall.push(createWall(1700,100, 100,50,ceiling[0]));
level[2].wall.push(createWall(1600,100, 100,50,ceiling[0]));
level[2].wall.push(createWall(1500,100, 100,50,ceiling[0]));
level[2].wall.push(createWall(1400,100, 100,50,ceiling[0]));
level[2].wall.push(createWall(1300,100, 100,50,ceiling[0]));
level[2].wall.push(createWall(1200,100, 100,50,ceiling[0]));
level[2].wall.push(createWall(1100,100, 100,50,ceiling[0]));
level[2].wall.push(createWall(1000,100, 100,50,ceiling[0]));
level[2].wall.push(createWall(900,100, 100,50,ceiling[0]));
level[2].wall.push(createWall(800,100, 100,50,ceiling[0]));
level[2].wall.push(createWall(700,100, 100,50,ceiling[0]));
level[2].wall.push(createWall(600,100, 100,50,ceiling[0]));
level[2].wall.push(createWall(500,100, 100,50,ceiling[0]));
level[2].wall.push(createWall(400,100, 100,50,ceiling[0]));
level[2].wall.push(createWall(300,100, 100,50,ceiling[0]));
level[2].wall.push(createWall(200,100, 100,50,ceiling[0]));
level[2].wall.push(createWall(100,100, 100,50,ceiling[0]));
level[2].wall.push(createWall(100,400, 100,30,floor[0]));
level[2].wall.push(createWall(200,400, 100,30,floor[0]));
level[2].wall.push(createWall(300,400, 100,30,floor[0]));
level[2].wall.push(createWall(400,400, 100,30,floor[0]));
level[2].wall.push(createWall(500,400, 100,30,floor[0]));
level[2].wall.push(createWall(600,400, 100,30,floor[0]));
level[2].wall.push(createWall(700,400, 100,30,floor[0]));
level[2].wall.push(createWall(800,400, 100,30,floor[0]));
level[2].wall.push(createWall(900,400, 100,30,floor[0]));
level[2].wall.push(createWall(1000,400, 100,30,floor[0]));
level[2].wall.push(createWall(1100,400, 100,30,floor[0]));
level[2].wall.push(createWall(1200,400, 100,30,floor[0]));
level[2].wall.push(createWall(1300,400, 100,30,floor[0]));
level[2].wall.push(createWall(1400,400, 100,30,floor[0]));
level[2].wall.push(createWall(1500,400, 100,30,floor[0]));
level[2].wall.push(createWall(1600,400, 100,30,floor[0]));
level[2].wall.push(createWall(1700,400, 100,30,floor[0]));
level[2].wall.push(createWall(1790,400, 30,100,sideWall[5]));
level[2].wall.push(createWall(70,400, 30,100,sideWall[5]));
level[2].wall.push(createWall(100,400, 30,100,sideWall[6]));
level[2].wall.push(createWall(70,370, 30,100,sideWall[6]));

level[2].wall.push(createWall(350,370, 100,30,floor[2]));
level[2].wall.push(createWall(1680,300, 100,30,floor[1]));
level[2].wall.push(createWall(1650,370, 100,30,floor[2]));
level[2].wall.push(createWall(1550,300, 100,30,floor[1]));
level[2].wall.push(createWall(1570,200, 100,30,floor[1]));
level[2].wall.push(createWall(1580,170, 100,30,floor[2]));
level[2].wall.push(createWall(1510,370, 100,30,floor[2]));
level[2].wall.push(createWall(1520,340, 100,30,floor[2]));

level[2].foreGround.push(new ForeGround(1700,300, wallFeatures[0]));
level[2].foreGround.push(new ForeGround(1700,200, wallFeatures[0]));
level[2].foreGround.push(new ForeGround(1600,200, wallFeatures[0]));
level[2].foreGround.push(new ForeGround(1600,300, wallFeatures[0]));
level[2].foreGround.push(new ForeGround(1500,300, wallFeatures[0]));
level[2].foreGround.push(new ForeGround(1500,200, wallFeatures[0]));
level[2].foreGround.push(new ForeGround(1400,300, wallFeatures[0]));
level[2].foreGround.push(new ForeGround(1300,300, wallFeatures[0]));
level[2].foreGround.push(new ForeGround(1300,200, wallFeatures[0]));
level[2].foreGround.push(new ForeGround(1400,200, wallFeatures[0]));
level[2].foreGround.push(new ForeGround(1240,300, wallFeatures[0]));
level[2].foreGround.push(new ForeGround(1240,200, wallFeatures[0]));

level[2].foreGround.push(new ForeGround(1140,300, wallFeatures[2]));
level[2].foreGround.push(new ForeGround(1140,200, wallFeatures[2]));
level[2].foreGround.push(new ForeGround(1430,300, wallFeatures[2]));
level[2].foreGround.push(new ForeGround(1430,200, wallFeatures[2]));
level[2].rLights.push(new staticLight(1230,200, 20));
level[2].rLights.push(new staticLight(1520,200, 20));
level[2].rLights.push(new staticLight(1800,200, 20));

level[2].foreGround.push(new ForeGround(110,300, wallFeatures[12]));
level[2].foreGround.push(new ForeGround(110,200, wallFeatures[12]));
level[2].foreGround.push(new ForeGround(110,100, pipes[0]));
level[2].foreGround.push(new ForeGround(210,100, pipes[4]));
level[2].foreGround.push(new ForeGround(310,100, pipes[4]));
level[2].wallPanels.push(new ForeGround(410,100, pipes[2]));
level[2].wallPanels.push(new ForeGround(630,250, wallFeatures[4]));
level[2].foreGround.push(new ForeGround(1640,280, wallFeatures[5]));

level[2].lamps.push(new pulseLight(200,110));
level[2].lamps[8].addPLight(300, 110);
level[2].lamps[8].addPLight(400, 110);
level[2].lamps[8].addPLight(500, 110);
level[2].lamps[8].addPLight(600, 110);
level[2].lamps[8].addPLight(700, 110);
level[2].lamps[8].addPLight(800, 110);
level[2].lamps[8].addPLight(900, 110);
level[2].lamps[8].addPLight(1000, 110);
level[2].lamps[8].addPLight(1100, 110);
level[2].lamps[8].addPLight(1200, 110);
level[2].lamps[8].addPLight(1300, 110);
level[2].lamps[8].addPLight(1400, 110);
level[2].lamps[8].addPLight(1500, 110);
level[2].lamps[8].addPLight(1600, 110);
level[2].lamps[8].addPLight(1700, 110);
level[2].wallPanels.push(new wordWall(1380,290, "LAB", 1,5));
/*level[2].wallPanels.push(new wordWall(240,300, '1',25));
level[2].wallPanels.push(new wordWall(530,300, '2',25));
level[2].wallPanels.push(new wordWall(730,300, '3',25));
level[2].wallPanels.push(new wordWall(1030,300, '4',25));
*/
level[2].wallPanels.push(new wordWall(310,250, 'PROTOTYPE',5));
level[2].wallPanels.push(new wordWall(410,250, 'PROTOTYPE',5));
level[2].wallPanels.push(new wordWall(810,250, 'PROTOTYPE',5));
level[2].wallPanels.push(new wordWall(910,250, 'PROTOTYPE',5));
level[2].wallPanels.push(new wordWall(320,260, 'INSECT',5));
level[2].wallPanels.push(new wordWall(920,260, 'INSECT',5));
level[2].wallPanels.push(new wordWall(420,260, 'REPTILE',5));
level[2].wallPanels.push(new wordWall(820,260, 'REPTILE',5));
level[2].wallPanels.push(new ForeGround(800,150, wallFeatures[3]));
level[2].wallPanels.push(new ForeGround(900,150, wallFeatures[3]));
level[2].wallPanels.push(new ForeGround(400,150, wallFeatures[3]));
level[2].wallPanels.push(new ForeGround(300,150, wallFeatures[3]));level[2].wallPanels.push(new wordWall(1210,250, 'PROTOTYPE',5));
level[2].wallPanels.push(new wordWall(1220,260, 'DISPOSAL',5));
level[2].wallPanels.push(new fan(520,120, 0.2,0,1));
level[2].wallPanels.push(new fan(720,120, 0.7,0,1));
level[2].wallPanels.push(new fan(220,120, 0.08,0,1));
level[2].wallPanels.push(new fan(1020,120, 0.08,0,1));
level[2].wallPanels.push(new talker(1240,270,'warning. containment breach.','test'));
	
level[2].exits.push(new Exit(750, 310, 4, true, 500, 200));
level[2].exits.push(new Exit(550, 310, 1, true, 500, 200));	
level[2].exits.push(new Exit(1400, 310, 3, true, 350, 300));	
	
	//////////////
	// LEVEL3
	
	level.push(new Level('The Lab'))
	level[3].start = {x:400, y:300};
	level[3].dLights.push(new steamJet(1050,400));
level[3].dLights.push(new steamJet(650,700));
	level[3].items.push(messageTrap(1650,920, blankPic, 'Hello?', "I know you have no reason to help me.. but theres creatures that hate us both in the next room. ~~They've already killed the others.. but one of us had a gun.  ~~If you put down those monsters you can have the gun... just leave me out of this."));
level[3].wallPanels.push(new Panel(300,300, panelHall[1], 0,1));
level[3].wallPanels.push(new Panel(400,300, panelHall[1], 0,1));
level[3].wallPanels.push(new Panel(500,300, panelHall[1], 0,1));
level[3].wallPanels.push(new Panel(600,300, panelHall[2], 0,1));
level[3].wallPanels.push(new Panel(700,300, panelHall[1], 0,1));
level[3].wallPanels.push(new Panel(800,300, panelHall[1], 0,1));
level[3].wallPanels.push(new Panel(900,300, panelHall[1], 0,1));
level[3].wallPanels.push(new Panel(1000,300, panelHall[2], 0,1));
level[3].wallPanels.push(new Panel(1100,300, panelHall[1], 0,1));
level[3].wallPanels.push(new Panel(1200,300, panelHall[1], 0,1));
level[3].wallPanels.push(new Panel(1300,300, panelHall[1], 0,1));
level[3].wallPanels.push(new Panel(1400,300, panelHall[2], 0,1));
level[3].wallPanels.push(new Panel(600,400, panelHall[2], 2,1));
level[3].wallPanels.push(new Panel(1000,400, panelHall[2], 2,1));
level[3].wallPanels.push(new Panel(1400,400, panelHall[2], 2,1));
level[3].wallPanels.push(new Panel(1100,400, panelHall[1], 2,1));
level[3].wallPanels.push(new Panel(1200,400, panelHall[1], 2,1));
level[3].wallPanels.push(new Panel(1300,400, panelHall[1], 2,1));
level[3].wallPanels.push(new Panel(300,400, panelHall[1], 2,1));
level[3].wallPanels.push(new Panel(400,400, panelHall[1], 2,1));
level[3].wallPanels.push(new Panel(500,400, panelHall[1], 2,1));
level[3].wallPanels.push(new Panel(700,400, panelHall[1], 2,1));
level[3].wallPanels.push(new Panel(800,400, panelHall[1], 2,1));
level[3].wallPanels.push(new Panel(900,400, panelHall[1], 2,1));
level[3].wallPanels.push(new Panel(300,200, panelHall[1], 0,1));
level[3].wallPanels.push(new Panel(500,200, panelHall[1], 0,1));
level[3].wallPanels.push(new Panel(700,200, panelHall[1], 0,1));
level[3].wallPanels.push(new Panel(900,200, panelHall[1], 0,1));
level[3].wallPanels.push(new Panel(1100,200, panelHall[1], 0,1));
level[3].wallPanels.push(new Panel(1300,200, panelHall[1], 0,1));
level[3].wallPanels.push(new Panel(800,200, panelHall[0], 0,1));level[3].wallPanels.push(new Panel(400,200, panelHall[0], 0,1));
level[3].wallPanels.push(new Panel(1200,200, panelHall[0], 0,1));
level[3].wallPanels.push(new Panel(1000,200, panelHall[2], 0,1));
level[3].wallPanels.push(new Panel(1400,200, panelHall[2], 0,1));
level[3].wallPanels.push(new Panel(600,200, panelHall[2], 0,1));
level[3].wallPanels.push(new Panel(600,100, panelHall[2], 1,1));
level[3].wallPanels.push(new Panel(1000,100, panelHall[2], 1,1));
level[3].wallPanels.push(new Panel(1400,100, panelHall[2], 1,1));
level[3].wallPanels.push(new Panel(1200,100, panelHall[0], 1,1));
level[3].wallPanels.push(new Panel(1100,100, panelHall[0], 1,1));
level[3].wallPanels.push(new Panel(1300,100, panelHall[0], 1,1));
level[3].wallPanels.push(new Panel(900,100, panelHall[0], 1,1));
level[3].wallPanels.push(new Panel(800,100, panelHall[0], 1,1));
level[3].wallPanels.push(new Panel(700,100, panelHall[0], 1,1));
level[3].wallPanels.push(new Panel(300,100, panelHall[0], 1,1));
level[3].wallPanels.push(new Panel(400,100, panelHall[0], 1,1));
level[3].wallPanels.push(new Panel(500,100, panelHall[0], 1,1));

level[3].wall.push(createWall(300,500, 100,30,floor[0]));
level[3].wall.push(createWall(400,500, 100,30,floor[0]));
level[3].wall.push(createWall(500,500, 100,30,floor[0]));
level[3].wall.push(createWall(600,500, 100,30,floor[0]));
level[3].wall.push(createWall(700,500, 100,30,floor[0]));
level[3].wall.push(createWall(800,500, 100,30,floor[0]));
level[3].wall.push(createWall(900,500, 100,30,floor[0]));
level[3].wall.push(createWall(1000,500, 100,30,floor[0]));
level[3].wall.push(createWall(1100,500, 100,30,floor[0]));
level[3].wall.push(createWall(1200,500, 100,30,floor[0]));
level[3].wall.push(createWall(1300,500, 100,30,floor[0]));
level[3].wall.push(createWall(1400,500, 100,30,floor[0]));
level[3].wall.push(createWall(270,400, 30,100,sideWall[2]));
level[3].wall.push(createWall(270,300, 30,100,sideWall[2]));
level[3].wall.push(createWall(270,200, 30,100,sideWall[2]));
level[3].wall.push(createWall(270,100, 30,100,sideWall[2]));
level[3].wall.push(createWall(270,500, 30,100,sideWall[2]));
level[3].wall.push(createWall(300,500, 30,100,sideWall[5]));
level[3].wall.push(createWall(270,500, 30,100,sideWall[6]));


level[3].wallPanels.push(new ForeGround(600,400, wallFeatures[12]));
level[3].wallPanels.push(new ForeGround(600,300, wallFeatures[12]));
level[3].wallPanels.push(new ForeGround(600,200, wallFeatures[12]));
level[3].wallPanels.push(new ForeGround(600,100, wallFeatures[12]));
level[3].wallPanels.push(new ForeGround(1000,400, wallFeatures[12]));
level[3].wallPanels.push(new ForeGround(1000,300, wallFeatures[12]));
level[3].wallPanels.push(new ForeGround(1000,200, wallFeatures[12]));
level[3].wallPanels.push(new ForeGround(1000,100, wallFeatures[12]));
level[3].wallPanels.push(new ForeGround(1400,100, wallFeatures[12]));
level[3].wallPanels.push(new ForeGround(1400,200, wallFeatures[12]));
level[3].wallPanels.push(new ForeGround(1400,300, wallFeatures[12]));
level[3].wallPanels.push(new ForeGround(1400,400, wallFeatures[12]));
level[3].foreGround.push(new ForeGround(730,400, pipes[0]));
level[3].foreGround.push(new ForeGround(830,400, pipes[4]));
level[3].foreGround.push(new ForeGround(930,400, pipes[4]));
level[3].foreGround.push(new ForeGround(1030,400, pipes[4]));
level[3].foreGround.push(new ForeGround(1130,400, pipes[4]));
level[3].foreGround.push(new ForeGround(1230,400, pipes[1]));
level[3].wallPanels.push(new ForeGround(350,300, door[1], '', 0.5));

level[3].wallPanels.push(new ForeGround(900,300, wallFeatures[9]));
level[3].wallPanels.push(new ForeGround(1300,400, wallFeatures[9]));
level[3].wallPanels.push(new ForeGround(500,200, wallFeatures[9]));level[3].wallPanels.push(new ForeGround(1200,250, wallFeatures[10]));
level[3].wallPanels.push(new ForeGround(850,200, wallFeatures[10]));
level[3].wallPanels.push(new ForeGround(900,100, wallFeatures[10]));
level[3].wallPanels.push(new ForeGround(950,150, wallFeatures[10]));
level[3].wallPanels.push(new ForeGround(1150,150, wallFeatures[10]));
level[3].wallPanels.push(new ForeGround(1350,100, wallFeatures[10]));
level[3].wallPanels.push(new ForeGround(400,250, wallFeatures[10]));



level[3].wallPanels.push(new ForeGround(750,300, wallFeatures[19]));
level[3].wallPanels.push(new ForeGround(1150,290, wallFeatures[20]));

level[3].wallPanels.push(new wordTicker(400,310, 'BREACH'));
level[3].lamps.push(new BigLamp(410,330));
level[3].lamps.push(new pulseLight(640,500));level[3].lamps[1].addPLight(640, 400);
level[3].lamps[1].addPLight(640, 300);
level[3].lamps[1].addPLight(640, 200);
level[3].lamps[1].addPLight(640, 100);
level[3].lamps.push(new pulseLight(1040,500));
level[3].lamps[2].addPLight(1040, 400);
level[3].lamps[2].addPLight(1040, 300);
level[3].lamps[2].addPLight(1040, 200);
level[3].lamps[2].addPLight(1040, 100);
level[3].lamps.push(new pulseLight(1440,500));
level[3].lamps[3].addPLight(1440, 400);
level[3].lamps[3].addPLight(1440, 300);
level[3].lamps[3].addPLight(1440, 200);
level[3].lamps[3].addPLight(1440, 100);
	
level[3].lamps.push(new UpLamp(610,470));
level[3].lamps.push(new UpLamp(1010,470));
level[3].lamps.push(new UpLamp(1410,470));
level[3].rLights.push(new staticLight(930,470, 20));
level[3].rLights.push(new staticLight(870,470, 20));
level[3].rLights.push(new staticLight(830,470, 20));
level[3].rLights.push(new staticLight(770,470, 20));
level[3].rLights.push(new staticLight(1330,460, 20));
level[3].rLights.push(new staticLight(1270,460, 20));
level[3].rLights.push(new staticLight(1230,460, 20));
level[3].rLights.push(new staticLight(1170,460, 20));

level[3].wallPanels.push(new ForeGround(520,340, wallFeatures[6]));
level[3].dLights.push(new spinLight(1480,470,50,0));
level[3].dLights.push(new spinLight(1080,470,50,0));
level[3].dLights.push(new spinLight(680,470,50,0));
level[3].dLights.push(new spinLight(340,330,50,0));


//deck2
level[3].wallPanels.push(new Panel(1500,200, panelHall[2], 0,1));
level[3].wallPanels.push(new Panel(1600,200, panelHall[2], 0,1));
level[3].wallPanels.push(new Panel(1500,300, panelHall[2], 0,1));
level[3].wallPanels.push(new Panel(1600,300, panelHall[2], 0,1));
level[3].wallPanels.push(new Panel(1500,400, panelHall[2], 0,1));
level[3].wallPanels.push(new Panel(1600,400, panelHall[2], 0,1));level[3].wallPanels.push(new Panel(1500,500, panelHall[2], 0,0.9));
level[3].wallPanels.push(new Panel(1600,500, panelHall[2], 0,0.9));
level[3].wallPanels.push(new Panel(1500,600, panelHall[2], 0,0.9));
level[3].wallPanels.push(new Panel(1600,600, panelHall[2], 0,0.9));
level[3].wallPanels.push(new Panel(1500,700, panelHall[2], 2,0.8));level[3].wallPanels.push(new Panel(1600,700, panelHall[2], 2,0.8));
level[3].wallPanels.push(new Panel(1400,500, panelHall[0], 1,0.9));
level[3].wallPanels.push(new Panel(1300,500, panelHall[0], 1,0.9));
level[3].wallPanels.push(new Panel(1200,500, panelHall[0], 1,0.9));
level[3].wallPanels.push(new Panel(1100,500, panelHall[0], 1,0.9));
level[3].wallPanels.push(new Panel(700,500, panelHall[0], 1,0.9));
level[3].wallPanels.push(new Panel(800,500, panelHall[0], 1,0.9));
level[3].wallPanels.push(new Panel(900,500, panelHall[0], 1,0.9));
level[3].wallPanels.push(new Panel(1000,500, panelHall[0], 1,0.9));
level[3].wallPanels.push(new Panel(500,500, panelHall[0], 1,0.9));
level[3].wallPanels.push(new Panel(400,500, panelHall[0], 1,0.9));
level[3].wallPanels.push(new Panel(300,500, panelHall[0], 1,0.9));
level[3].wallPanels.push(new Panel(600,500, panelHall[2], 1,0.9));
level[3].wallPanels.push(new Panel(1000,500, panelHall[2], 1,0.9));
level[3].wallPanels.push(new Panel(1400,500, panelHall[2], 1,0.9));
level[3].wallPanels.push(new Panel(1400,600, panelHall[1], 0,0.9));
level[3].wallPanels.push(new Panel(1300,600, panelHall[1], 0,0.9));
level[3].wallPanels.push(new Panel(1200,600, panelHall[1], 0,0.9));
level[3].wallPanels.push(new Panel(1100,600, panelHall[1], 0,0.9));
level[3].wallPanels.push(new Panel(1000,600, panelHall[1], 0,0.9));
level[3].wallPanels.push(new Panel(900,600, panelHall[1], 0,0.9));
level[3].wallPanels.push(new Panel(700,600, panelHall[1], 0,0.9));
level[3].wallPanels.push(new Panel(600,600, panelHall[1], 0,0.9));
level[3].wallPanels.push(new Panel(500,600, panelHall[1], 0,0.9));
level[3].wallPanels.push(new Panel(400,600, panelHall[1], 0,0.9));
level[3].wallPanels.push(new Panel(300,600, panelHall[1], 0,0.9));
level[3].wallPanels.push(new Panel(1400,700, panelHall[1], 2,0.8));
level[3].wallPanels.push(new Panel(1300,700, panelHall[1], 2,0.8));
level[3].wallPanels.push(new Panel(1200,700, panelHall[1], 2,0.8));
level[3].wallPanels.push(new Panel(1100,700, panelHall[1], 2,0.8));
level[3].wallPanels.push(new Panel(1000,700, panelHall[1], 2,0.8));
level[3].wallPanels.push(new Panel(900,700, panelHall[1], 2,0.8));
level[3].wallPanels.push(new Panel(800,600, panelHall[0], 0,0.9));
level[3].wallPanels.push(new Panel(300,700, panelHall[0], 2,0.8));
level[3].wallPanels.push(new Panel(400,700, panelHall[0], 2,0.8));
level[3].wallPanels.push(new Panel(500,700, panelHall[0], 2,0.8));
level[3].wallPanels.push(new Panel(600,700, panelHall[0], 2,0.8));
level[3].wallPanels.push(new Panel(700,700, panelHall[0], 2,0.8));
level[3].wallPanels.push(new Panel(800,700, panelHall[0], 2,0.8));
level[3].wallPanels.push(new wordWall(310,320, 'SECTOR 92',5));
level[3].wallPanels.push(new wordWall(1410,620, 'SECTOR 92',5));
level[3].wallPanels.push(new wordWall(1420,630, 'DECK C',4));
level[3].wallPanels.push(new ForeGround(1400,500, wallFeatures[12]));
level[3].wallPanels.push(new ForeGround(1400,600, wallFeatures[12]));
level[3].wallPanels.push(new ForeGround(1400,700, wallFeatures[12]));
level[3].wallPanels.push(new ForeGround(1500,300, wallFeatures[12]));
level[3].wallPanels.push(new ForeGround(1500,200, wallFeatures[12]));
level[3].wallPanels.push(new ForeGround(1500,400, wallFeatures[12]));
level[3].wallPanels.push(new ForeGround(1600,200, wallFeatures[12]));
level[3].wallPanels.push(new ForeGround(1600,300, wallFeatures[12]));
level[3].wallPanels.push(new ForeGround(1600,400, wallFeatures[12]));
level[3].wallPanels.push(new ForeGround(1500,500, wallFeatures[12]));
level[3].wallPanels.push(new ForeGround(1500,600, wallFeatures[12]));
level[3].wallPanels.push(new ForeGround(1500,700, wallFeatures[12]));
level[3].wallPanels.push(new ForeGround(1600,500, wallFeatures[12]));
level[3].wallPanels.push(new ForeGround(1600,600, wallFeatures[12]));
level[3].wallPanels.push(new ForeGround(1600,700, wallFeatures[12]));
level[3].wallPanels.push(new ForeGround(1000,500, wallFeatures[12]));
level[3].wallPanels.push(new ForeGround(600,500, wallFeatures[12]));
level[3].wallPanels.push(new ForeGround(1000,600, pipes[3]));
level[3].wallPanels.push(new ForeGround(1100,600, pipes[4]));
level[3].wallPanels.push(new ForeGround(600,600, wallFeatures[12]));
level[3].wallPanels.push(new ForeGround(600,700, pipes[2]));
level[3].wallPanels.push(new ForeGround(500,700, pipes[4]));
level[3].wallPanels.push(new ForeGround(400,700, pipes[4]));
level[3].wallPanels.push(new ForeGround(300,700, pipes[0]));
level[3].wallPanels.push(new ForeGround(1200,600, pipes[1]));
level[3].wallPanels.push(new ForeGround(1200,700, wallFeatures[12]));
level[3].lamps.push(new pulseLight(340,800));
level[3].lamps[7].addPLight(340, 740);
level[3].lamps[7].addPLight(400, 740);
level[3].lamps[7].addPLight(500, 740);
level[3].lamps[7].addPLight(600, 740);
level[3].lamps[7].addPLight(640, 700);
level[3].lamps[7].addPLight(640, 600);
level[3].lamps[7].addPLight(640, 530);
level[3].lamps.push(new pulseLight(1240,800));
level[3].lamps[8].addPLight(1240, 700);
level[3].lamps[8].addPLight(1240, 660);
level[3].lamps[8].addPLight(1200, 660);
level[3].lamps[8].addPLight(1100, 660);
level[3].lamps[8].addPLight(1040, 660);
level[3].lamps[8].addPLight(1040, 600);
level[3].lamps[8].addPLight(1040, 530);

level[3].wallPanels.push(new Panel(1500,100, panelHall[2], 1,1));
level[3].wallPanels.push(new Panel(1600,100, panelHall[2], 1,1));
level[3].wallPanels.push(new ForeGround(1500,100, wallFeatures[12]));
level[3].wallPanels.push(new ForeGround(1600,100, wallFeatures[12]));
level[3].lamps.push(new pulseLight(1440,800));
level[3].lamps[9].addPLight(1440, 700);
level[3].lamps[9].addPLight(1440, 600);
level[3].lamps[9].addPLight(1440, 530);
level[3].lamps.push(new pulseLight(1540,100));
level[3].lamps[10].addPLight(1540, 200);
level[3].lamps[10].addPLight(1540, 300);
level[3].lamps[10].addPLight(1540, 400);
level[3].lamps[10].addPLight(1540, 500);
level[3].lamps[10].addPLight(1540, 600);
level[3].lamps[10].addPLight(1540, 700);
level[3].lamps[10].addPLight(1540, 800);
level[3].lamps.push(new pulseLight(1640,100));
level[3].lamps[11].addPLight(1640, 200);
level[3].lamps[11].addPLight(1640, 300);
level[3].lamps[11].addPLight(1640, 400);
level[3].lamps[11].addPLight(1640, 500);
level[3].lamps[11].addPLight(1640, 600);
level[3].lamps[11].addPLight(1640, 800);

level[3].foreGround.push(new ForeGround(1400,400, wallFeatures[0]));
level[3].foreGround.push(new ForeGround(1400,300, wallFeatures[0]));
level[3].foreGround.push(new ForeGround(1500,300, wallFeatures[0]));
level[3].foreGround.push(new ForeGround(1500,400, wallFeatures[0]));
level[3].foreGround.push(new ForeGround(1600,400, wallFeatures[0]));
level[3].foreGround.push(new ForeGround(1600,300, wallFeatures[0]));
level[3].foreGround.push(new ForeGround(1500,500, wallFeatures[0]));
level[3].foreGround.push(new ForeGround(1600,500, wallFeatures[0]));
level[3].foreGround.push(new ForeGround(1600,600, wallFeatures[0]));
level[3].foreGround.push(new ForeGround(1500,600, wallFeatures[0]));
level[3].foreGround.push(new ForeGround(1500,700, wallFeatures[0]));
level[3].foreGround.push(new ForeGround(1600,700, wallFeatures[0]));
level[3].foreGround.push(new ForeGround(1400,700, wallFeatures[2]));
level[3].foreGround.push(new ForeGround(1400,600, wallFeatures[2]));
level[3].foreGround.push(new ForeGround(1400,500, wallFeatures[2]));
level[3].foreGround.push(new ForeGround(1300,400, wallFeatures[2]));
level[3].foreGround.push(new ForeGround(1300,300, wallFeatures[2]));
level[3].foreGround.push(new ForeGround(1400,200, wallFeatures[0]));
level[3].foreGround.push(new ForeGround(1500,200, wallFeatures[0]));
level[3].foreGround.push(new ForeGround(1600,200, wallFeatures[0]));
level[3].foreGround.push(new ForeGround(1400,100, wallFeatures[0]));
level[3].foreGround.push(new ForeGround(1500,100, wallFeatures[0]));
level[3].foreGround.push(new ForeGround(1600,100, wallFeatures[0]));
level[3].foreGround.push(new ForeGround(1300,200, wallFeatures[2]));
level[3].foreGround.push(new ForeGround(1300,100, wallFeatures[2]));
level[3].foreGround.push(new ForeGround(1430,380, wallFeatures[4]));
level[3].wallPanels.push(new ForeGround(1150,600, wallFeatures[17]));
level[3].wallPanels.push(new ForeGround(750,600, wallFeatures[21]));
level[3].foreGround.push(new ForeGround(730,530, pipes[3]));
level[3].foreGround.push(new ForeGround(1230,530, pipes[2]));
level[3].foreGround.push(new ForeGround(830,530, pipes[4]));
level[3].foreGround.push(new ForeGround(1130,530, pipes[4]));
level[3].foreGround.push(new ForeGround(930,530, pipes[1]));
level[3].foreGround.push(new ForeGround(1030,530, pipes[0]));
level[3].foreGround.push(new ForeGround(930,630, wallFeatures[12]));
level[3].foreGround.push(new ForeGround(1030,630, wallFeatures[12]));
level[3].foreGround.push(new ForeGround(1030,730, wallFeatures[12]));
level[3].foreGround.push(new ForeGround(930,730, wallFeatures[12]));
level[3].wallPanels.push(new ForeGround(350,600, wallFeatures[18]));

level[3].wall.push(createWall(300,800, 100,30,floor[0]));
level[3].wall.push(createWall(400,800, 100,30,floor[0]));
level[3].wall.push(createWall(500,800, 100,30,floor[0]));level[3].wall.push(createWall(700,800, 100,30,floor[0]));
level[3].wall.push(createWall(800,800, 100,30,floor[0]));
level[3].wall.push(createWall(900,800, 100,30,floor[0]));
level[3].wall.push(createWall(1000,800, 100,30,floor[0]));
level[3].wall.push(createWall(1100,800, 100,30,floor[0]));
level[3].wall.push(createWall(1200,800, 100,30,floor[0]));
level[3].wall.push(createWall(1300,800, 100,30,floor[0]));
level[3].wall.push(createWall(1400,800, 100,30,floor[0]));
level[3].wall.push(createWall(1500,800, 100,30,floor[0]));
level[3].wall.push(createWall(1600,800, 100,30,floor[0]));
level[3].wall.push(createWall(1600,830, 100,50,ceiling[0]));
level[3].wall.push(createWall(1500,830, 100,50,ceiling[0]));
level[3].wall.push(createWall(1400,830, 100,50,ceiling[0]));
level[3].wall.push(createWall(1300,830, 100,50,ceiling[0]));
level[3].wall.push(createWall(1200,830, 100,50,ceiling[0]));
level[3].wall.push(createWall(1100,830, 100,50,ceiling[0]));
level[3].wall.push(createWall(1000,830, 100,50,ceiling[0]));
level[3].wall.push(createWall(700,830, 100,50,ceiling[0]));
level[3].wall.push(createWall(800,830, 100,50,ceiling[0]));
level[3].wall.push(createWall(900,830, 100,50,ceiling[0]));
level[3].wall.push(createWall(300,830, 100,50,ceiling[0]));
level[3].wall.push(createWall(400,830, 100,50,ceiling[0]));
level[3].wall.push(createWall(500,830, 100,50,ceiling[0]));

level[3].wall.push(createWall(1900,500, 30,100,sideWall[1]));
level[3].wall.push(createWall(1900,600, 30,100,sideWall[1]));
level[3].wall.push(createWall(1900,700, 30,100,sideWall[1]));
level[3].wall.push(createWall(1900,800, 30,100,sideWall[1]));
level[3].wallPanels.push(new Panel(1700,700, panelHall[1], 2,0.8));
level[3].wallPanels.push(new Panel(1800,700, panelHall[1], 2,0.8));
level[3].wallPanels.push(new Panel(1700,600, panelHall[1], 0,0.9));
level[3].wallPanels.push(new Panel(1800,600, panelHall[1], 0,0.9));
level[3].wallPanels.push(new Panel(1700,500, panelHall[1], 0,0.9));
level[3].wallPanels.push(new Panel(1800,500, panelHall[1], 0,0.9));
level[3].wallPanels.push(new ForeGround(1700,600, door[1], '', 0.5));
level[3].wallPanels.push(new wordTicker(1750,610, 'LOCK'));
level[3].lamps.push(new BigLampFlicker(1760,630));
level[3].wall.push(createWall(1700,800, 100,30,floor[0]));
level[3].wall.push(createWall(1800,800, 100,30,floor[0]));
level[3].wall.push(createWall(1700,830, 100,50,ceiling[0]));
level[3].wall.push(createWall(1800,830, 100,50,ceiling[0]));
level[3].wall.push(createWall(270,600, 30,100,sideWall[2]));
level[3].wall.push(createWall(270,700, 30,100,sideWall[2]));
level[3].wall.push(createWall(270,800, 30,100,sideWall[2]));
level[3].wall.push(createWall(300,800, 30,100,sideWall[5]));
level[3].wall.push(createWall(270,800, 30,100,sideWall[6]));
level[3].wall.push(createWall(1700,400, 30,100,sideWall[1]));
level[3].wall.push(createWall(1700,300, 30,100,sideWall[1]));
level[3].wall.push(createWall(1700,100, 30,100,sideWall[1]));
level[3].wall.push(createWall(1700,200, 30,100,sideWall[1]));
level[3].wall.push(createWall(1700,500, 100,30,floor[0]));
level[3].wall.push(createWall(1800,500, 100,30,floor[0]));
level[3].wall.push(createWall(1700,500, 30,100,sideWall[6]));
level[3].wall.push(createWall(1900,500, 30,100,sideWall[6]));
level[3].wall.push(createWall(1900,800, 30,100,sideWall[6]));
level[3].wall.push(createWall(1900,830, 30,100,sideWall[5]));

level[3].wallPanels.push(new Panel(600,800, panelHall[0], 1,0.7));
level[3].wallPanels.push(new Panel(700,800, panelHall[0], 1,0.7));
level[3].wallPanels.push(new Panel(800,800, panelHall[0], 1,0.7));
level[3].wallPanels.push(new Panel(900,800, panelHall[0], 1,0.7));
level[3].wallPanels.push(new Panel(1000,800, panelHall[0], 1,0.7));
level[3].wallPanels.push(new Panel(1100,800, panelHall[0], 1,0.7));
level[3].wallPanels.push(new Panel(500,800, panelHall[0], 1,0.7));
level[3].wallPanels.push(new Panel(400,800, panelHall[0], 1,0.7));
level[3].wallPanels.push(new Panel(300,800, panelHall[0], 1,0.7));
level[3].wallPanels.push(new Panel(1200,800, panelHall[0], 1,0.7));
level[3].wallPanels.push(new Panel(1300,800, panelHall[0], 1,0.7));
level[3].wallPanels.push(new Panel(1400,800, panelHall[0], 1,0.7));
level[3].wallPanels.push(new Panel(1700,800, panelHall[0], 1,0.7));
level[3].wallPanels.push(new Panel(1800,800, panelHall[0], 1,0.7));
level[3].wallPanels.push(new Panel(1500,800, panelHall[2], 1,0.7));
level[3].wallPanels.push(new Panel(1600,800, panelHall[2], 1,0.7));
level[3].wallPanels.push(new ForeGround(600,800, floorHole[0]));
level[3].wallPanels.push(new ForeGround(600,830, ceilingHole[0], 0,0));level[3].wallPanels.push(new ForeGround(680,830, foreGPic[7]));level[3].wallPanels.push(new ForeGround(610,830, foreGPic[6]));
level[3].lamps.push(new sparker(600,830));
level[3].lamps.push(new sparker(600,800));
level[3].lamps.push(new sparker(630,810));
level[3].lamps.push(new sparker(690,810));
level[3].lamps.push(new sparker(690,860));
level[3].lamps.push(new sparker(640,870));
level[3].lamps.push(new sparker(660,830));
level[3].rLights.push(new staticLight(1230,770, 20));
level[3].rLights.push(new staticLight(1270,770, 20));
level[3].rLights.push(new staticLight(1330,770, 20));
level[3].rLights.push(new staticLight(1170,770, 20));
level[3].rLights.push(new staticLight(930,770, 20));
level[3].rLights.push(new staticLight(870,770, 20));
level[3].rLights.push(new staticLight(830,770, 20));
level[3].rLights.push(new staticLight(770,770, 20));
level[3].rLights.push(new staticLight(370,770, 20));
level[3].rLights.push(new staticLight(430,770, 20));
level[3].rLights.push(new staticLight(470,770, 20));
level[3].rLights.push(new staticLight(530,770, 20));
level[3].wall.push(createWall(1720,700, 100,30,floor[1]));
level[3].wall.push(createWall(1830,770, 100,30,floor[2]));
level[3].wall.push(createWall(1820,740, 100,30,floor[2]));
level[3].wall.push(createWall(1680,770, 100,30,floor[2]));

level[3].wallPanels.push(new Panel(300,900, panelHall[0], 0,0.8));
level[3].wallPanels.push(new Panel(400,900, panelHall[0], 0,0.8));
level[3].wallPanels.push(new Panel(500,900, panelHall[0], 0,0.8));
level[3].wallPanels.push(new Panel(600,900, panelHall[0], 0,0.8));
level[3].wallPanels.push(new Panel(700,900, panelHall[0], 0,0.8));
level[3].wallPanels.push(new Panel(800,900, panelHall[0], 0,0.8));
level[3].wallPanels.push(new Panel(900,900, panelHall[0], 0,0.8));
level[3].wallPanels.push(new Panel(1000,900, panelHall[0], 0,0.8));
level[3].wallPanels.push(new Panel(1100,900, panelHall[0], 0,0.8));
level[3].wallPanels.push(new Panel(1200,900, panelHall[0], 0,0.8));
level[3].wallPanels.push(new Panel(1300,900, panelHall[0], 0,0.8));
level[3].wallPanels.push(new Panel(1400,900, panelHall[0], 0,0.8));
level[3].wallPanels.push(new Panel(1700,900, panelHall[0], 0,0.8));
level[3].wallPanels.push(new Panel(1800,900, panelHall[0], 0,0.8));level[3].wallPanels.push(new Panel(1500,900, panelHall[0], 0,0.8));
level[3].wallPanels.push(new Panel(1600,900, panelHall[0], 0,0.8));
level[3].wallPanels.push(new Panel(1500,950, panelHall[2], 2,0.8));
level[3].wallPanels.push(new Panel(1600,950, panelHall[2], 2,0.8));
level[3].wallPanels.push(new Panel(1700,950, panelHall[1], 2,0.8));
level[3].wallPanels.push(new Panel(1800,950, panelHall[1], 2,0.8));
level[3].wallPanels.push(new Panel(1400,950, panelHall[1], 2,0.8));
level[3].wallPanels.push(new Panel(1300,950, panelHall[1], 2,0.8));
level[3].wallPanels.push(new Panel(1200,950, panelHall[1], 2,0.8));
level[3].wallPanels.push(new Panel(1100,950, panelHall[1], 2,0.8));
level[3].wallPanels.push(new Panel(1000,950, panelHall[1], 2,0.8));
level[3].wallPanels.push(new Panel(900,950, panelHall[1], 2,0.8));
level[3].wallPanels.push(new Panel(800,950, panelHall[1], 2,0.8));
level[3].wallPanels.push(new Panel(700,950, panelHall[1], 2,0.8));
level[3].wallPanels.push(new Panel(600,950, panelHall[1], 2,0.8));
level[3].wallPanels.push(new Panel(500,950, panelHall[1], 2,0.8));
level[3].wallPanels.push(new Panel(400,950, panelHall[1], 2,0.8));
level[3].wallPanels.push(new Panel(300,950, panelHall[1], 2,0.8));
level[3].wall.push(createWall(270,900, 30,100,sideWall[2]));
level[3].wall.push(createWall(270,980, 30,100,sideWall[2]));
level[3].wall.push(createWall(300,1050, 100,30,floor[0]));
level[3].wall.push(createWall(400,1050, 100,30,floor[0]));
level[3].wall.push(createWall(500,1050, 100,30,floor[0]));
level[3].wall.push(createWall(600,1050, 100,30,floor[0]));
level[3].wall.push(createWall(700,1050, 100,30,floor[0]));
level[3].wall.push(createWall(800,1050, 100,30,floor[0]));
level[3].wall.push(createWall(900,1050, 100,30,floor[0]));
level[3].wall.push(createWall(1000,1050, 100,30,floor[0]));
level[3].wall.push(createWall(1100,1050, 100,30,floor[0]));
level[3].wall.push(createWall(1200,1050, 100,30,floor[0]));
level[3].wall.push(createWall(1300,1050, 100,30,floor[0]));
level[3].wall.push(createWall(1400,1050, 100,30,floor[0]));
level[3].wall.push(createWall(1500,1050, 100,30,floor[0]));
level[3].wall.push(createWall(1600,1050, 100,30,floor[0]));
level[3].wall.push(createWall(1700,1050, 100,30,floor[0]));
level[3].wall.push(createWall(1800,1050, 100,30,floor[0]));
level[3].wall.push(createWall(1900,900, 30,100,sideWall[1]));
level[3].wall.push(createWall(1900,980, 30,100,sideWall[1]));
level[3].wall.push(createWall(1870,1050, 30,100,sideWall[6]));
level[3].wall.push(createWall(300,1050, 30,100,sideWall[6]));
level[3].wall.push(createWall(270,1050, 30,100,sideWall[5]));level[3].wallPanels.push(new ForeGround(1500,950, wallFeatures[12]));
level[3].wallPanels.push(new ForeGround(1500,850, wallFeatures[12]));
level[3].wallPanels.push(new ForeGround(1600,850, wallFeatures[12]));
level[3].wallPanels.push(new ForeGround(1600,950, wallFeatures[12]));

level[3].wallPanels.push(new ForeGround(350,850, door[1], '', 0.5));
level[3].wallPanels.push(new AniDoor(1700,850, 0,1));
level[3].foreGround.push(new ForeGround(1040,950, foreGPic[0]));
level[3].foreGround.push(new ForeGround(1130,950, foreGPic[1]));
level[3].foreGround.push(new ForeGround(1150,930, foreGPic[3]));
level[3].foreGround.push(new ForeGround(1080,930, foreGPic[5]));
level[3].foreGround.push(new ForeGround(1110,930, foreGPic[9]));
level[3].foreGround.push(new ForeGround(930,830, wallFeatures[12]));
level[3].foreGround.push(new ForeGround(930,930, wallFeatures[12]));
level[3].foreGround.push(new ForeGround(1030,830, wallFeatures[12]));
level[3].foreGround.push(new ForeGround(1030,930, wallFeatures[12]));
level[3].foreGround.push(new ForeGround(1030,1030, wallFeatures[12]));
level[3].foreGround.push(new ForeGround(930,1030, wallFeatures[12]));
level[3].foreGround.push(new ForeGround(930,1100, wallFeatures[12]));
level[3].foreGround.push(new ForeGround(1030,1100, wallFeatures[12]));

level[3].wallPanels.push(new ForeGround(560,950, foreGPic[0]));
level[3].wallPanels.push(new ForeGround(650,950, foreGPic[1]));
level[3].wallPanels.push(new ForeGround(920,950, foreGPic[1]));
level[3].wallPanels.push(new ForeGround(820,950, foreGPic[0]));
level[3].wallPanels.push(new ForeGround(870,930, foreGPic[5]));
level[3].wallPanels.push(new ForeGround(610,930, foreGPic[5]));
level[3].wallPanels.push(new ForeGround(670,930, foreGPic[8]));
level[3].wallPanels.push(new ForeGround(930,930, foreGPic[2]));
level[3].wallPanels.push(new ForeGround(890,930, foreGPic[9]));level[3].dLights.push(new GenLight(960,950,4, 0.8));
level[3].rLights.push(new staticLight(1130,960, 20));
level[3].rLights.push(new staticLight(1140,960, 20));
level[3].lamps.push(new BigLampDead(460,840));
level[3].lamps.push(new BigLampDead(760,840));
level[3].lamps.push(new BigLampFlicker(360,840));
level[3].lamps.push(new BigLampFlicker(860,840));
level[3].lamps.push(new BigLampDead(960,840));
level[3].lamps.push(new BigLampFlicker(1060,840));
level[3].dLights.push(new GenLight(680,950,4, 0.8));

level[3].lamps.push(new BigLamp(1760,840));
level[3].lamps.push(new BigLamp(1660,840));
level[3].lamps.push(new BigLamp(1560,840));
level[3].lamps.push(new BigLamp(1460,840));
level[3].lamps.push(new BigLamp(1360,840));
level[3].lamps.push(new BigLampDead(1260,840));
level[3].lamps.push(new BigLampDead(1160,840));
level[3].foreGround.push(new ForeGround(1320,950, foreGPic[0]));
level[3].foreGround.push(new ForeGround(1410,950, foreGPic[1]));
level[3].foreGround.push(new ForeGround(1430,930, foreGPic[3]));
level[3].foreGround.push(new ForeGround(1360,930, foreGPic[5]));
level[3].wallPanels.push(new ForeGround(1680,960, wallFeatures[16]));
level[3].wallPanels.push(new ForeGround(360,920, wallFeatures[16]));
level[3].dLights.push(new spinLight(370,920,50,0));level[3].wallPanels.push(new wordTicker(1750,860, 'OPEN'));
level[3].wallPanels.push(new wordTicker(400,860, 'LOCK'));
level[3].wallPanels.push(new ForeGround(700,750, wallFeatures[10]));level[3].wallPanels.push(new ForeGround(310,440, wallFeatures[10]));
level[3].wallPanels.push(new ForeGround(1450,850, wallFeatures[10]));
level[3].dLights.push(new spinLight(1720,670,50,0));
level[3].wallPanels.push(new ForeGround(1710,670, wallFeatures[16]));
level[3].foreGround.push(new ForeGround(1700,700, wallFeatures[1]));
level[3].foreGround.push(new ForeGround(1700,700, wallFeatures[1]));
level[3].foreGround.push(new ForeGround(1700,600, wallFeatures[1]));
level[3].foreGround.push(new ForeGround(1700,500, wallFeatures[1]));
level[3].rLights.push(new staticLight(1490,700, 20));
level[3].rLights.push(new staticLight(1490,600, 20));
level[3].rLights.push(new staticLight(1710,600, 20));
level[3].rLights.push(new staticLight(1710,700, 20));
level[3].lamps.push(new UpLamp(1030,760));level[3].lamps.push(new UpLamp(320,760));
level[3].wallPanels.push(new ForeGround(1090,700, wallFeatures[22]));
level[3].wallPanels.push(new ForeGround(940,700, wallFeatures[22]));
level[3].wallPanels.push(new ForeGround(940,400, wallFeatures[22]));
level[3].wallPanels.push(new ForeGround(1090,400, wallFeatures[22]));
level[3].wallPanels.push(new ForeGround(540,700, wallFeatures[22]));


level[3].creature.push(Scientist(1550,860,3));

level[3].wallPanels.push(new wordWall(1710,620, 'EMERGENCY',4));level[3].wallPanels.push(new wordWall(1710,630, 'ACCESS',4));
level[3].elevators.push(new CargoElevator(1500,800, 300,300));
level[3].wallPanels.push(new wordWall(510,320, 'PROTOTYPE',5));
level[3].wallPanels.push(new wordWall(510,330, 'CONTAINMENT',4));

level[3].wallPanels.push(new Alarm(1020,920));
level[3].wallPanels.push(new Alarm(610,360));



level[4] = new Level('Cell 3')
level[4].wallPanels.push(new Panel(200,300, panelHall[1], 2,0.7));
level[4].wallPanels.push(new Panel(600,300, panelHall[1], 2,0.7));
level[4].wallPanels.push(new Panel(200,200, panelHall[1], 1,0.7));
level[4].wallPanels.push(new Panel(300,200, panelHall[1], 1,0.7));
level[4].wallPanels.push(new Panel(500,200, panelHall[1], 1,0.7));
level[4].wallPanels.push(new Panel(600,200, panelHall[1], 1,0.7));
level[4].wallPanels.push(new Panel(400,200, panelHall[0], 1,0.7));
level[4].wallPanels.push(new Panel(300,300, panelHall[0], 2,0.7));
level[4].wallPanels.push(new Panel(400,300, panelHall[0], 2,0.7));
level[4].wallPanels.push(new Panel(500,300, panelHall[0], 2,0.7));
level[4].wallPanels.push(new AniDoor(500,200, 0, 1));
level[4].lamps.push(new FlickerLamp(420,220));
level[4].lamps.push(new deadLamp(470,220));
level[4].wallPanels.push(new ForeGround(520,270, wallFeatures[16]));
level[4].wallPanels.push(new ForeGround(440,350, wallFeatures[15]));
level[4].wallPanels.push(new ForeGround(220,200, wallFeatures[14]));
level[4].wall.push(createWall(200,400, 100,30,floor[0]));
level[4].wall.push(createWall(300,400, 100,30,floor[0]));
level[4].wall.push(createWall(400,400, 100,30,floor[0]));
level[4].wall.push(createWall(500,400, 100,30,floor[0]));
level[4].wall.push(createWall(600,400, 100,30,floor[0]));
level[4].wall.push(createWall(170,300, 30,100,sideWall[2]));
level[4].wall.push(createWall(170,200, 30,100,sideWall[2]));
level[4].wall.push(createWall(700,300, 30,100,sideWall[2]));
level[4].wall.push(createWall(700,200, 30,100,sideWall[2]));
level[4].wall.push(createWall(200,200, 100,50,ceiling[0]));
level[4].wall.push(createWall(300,200, 100,50,ceiling[0]));
level[4].wall.push(createWall(400,200, 100,50,ceiling[0]));
level[4].wall.push(createWall(500,200, 100,50,ceiling[0]));
level[4].wall.push(createWall(600,200, 100,50,ceiling[0]));
level[4].wall.push(createWall(170,400, 30,100,sideWall[5]));
level[4].wall.push(createWall(700,400, 30,100,sideWall[5]));
level[4].wall.push(createWall(170,200, 30,100,sideWall[5]));
level[4].wall.push(createWall(700,200, 30,100,sideWall[5]));
level[4].wall.push(createWall(200,400, 30,100,sideWall[6]));
level[4].wall.push(createWall(670,400, 30,100,sideWall[6]));
level[4].lamps.push(new BigLampFlicker(260,210));
level[4].wallPanels.push(new ForeGround(250,240, wallFeatures[8]));
level[4].wallPanels.push(new ForeGround(450,250, wallFeatures[10]));

level[3].wallPanels.push(new talker(440,320,'welcome to: prototype disposal','test'));level[3].wallPanels.push(new talker(960,420,'prototype t-94 genotype: insect','test'));level[3].wallPanels.push(new talker(970,730,'prototype r-56. human reptyle hybrid','test'));
level[3].wallPanels.push(new fan(720,220, 0.2,0,1));
level[3].wallPanels.push(new fan(1120,220, 0.4,0,1));



level[4].exits.push(new Exit(600,300, 5, true, 650, 210));
level[3].exits.push(new Exit(1850,930, 3, false, 150, 400));


cutscene.push(new Cutscene('What did this? I need a gun.'))
cutscene[3].endFrame = 60;
	cutscene[3].nextLevel = 3;
	cutscene[3].darkForeground = true;
	cutscene[3].shaded = true
	cutscene[3].nextLevel = 5
	cutscene[3].draw = function(){
		ctxOx = -600
		ctxOy = -300
		for(var i=0; i < creature.length; i++) creature[i].move();
		
		creature[2].stats.health = 50
	}
	
	
level[5] = new Level('Encounter')
level[5].start = {x:270, y:400};
level[5].wallPanels.push(new Panel(300,100, panelHall[1], 1,0.9));
level[5].wallPanels.push(new Panel(200,100, panelHall[1], 1,0.9));
level[5].wallPanels.push(new Panel(400,100, panelHall[1], 1,0.9));
level[5].wallPanels.push(new Panel(500,100, panelHall[1], 1,0.9));
level[5].wallPanels.push(new Panel(600,100, panelHall[1], 1,0.9));
level[5].wallPanels.push(new Panel(700,100, panelHall[2], 1,0.9));
level[5].wallPanels.push(new Panel(800,100, panelHall[1], 1,0.9));
level[5].wallPanels.push(new Panel(900,100, panelHall[1], 1,0.9));
level[5].wallPanels.push(new Panel(1000,100, panelHall[1], 1,0.9));
level[5].wallPanels.push(new Panel(1100,100, panelHall[1], 1,0.9));
level[5].wallPanels.push(new Panel(1200,100, panelHall[1], 1,0.9));
level[5].wallPanels.push(new Panel(200,300, panelHall[1], 0,0.9));
level[5].wallPanels.push(new Panel(300,300, panelHall[1], 0,0.9));
level[5].wallPanels.push(new Panel(400,300, panelHall[1], 0,0.9));
level[5].wallPanels.push(new Panel(500,300, panelHall[1], 0,0.9));
level[5].wallPanels.push(new Panel(600,300, panelHall[1], 0,0.9));
level[5].wallPanels.push(new Panel(600,400, panelHall[1], 0,0.9));
level[5].wallPanels.push(new Panel(500,400, panelHall[1], 0,0.9));
level[5].wallPanels.push(new Panel(400,400, panelHall[1], 0,0.9));
level[5].wallPanels.push(new Panel(300,400, panelHall[1], 0,0.9));
level[5].wallPanels.push(new Panel(200,400, panelHall[1], 0,0.9));
level[5].wallPanels.push(new Panel(800,300, panelHall[1], 0,0.9));
level[5].wallPanels.push(new Panel(900,300, panelHall[1], 0,0.9));
level[5].wallPanels.push(new Panel(1000,300, panelHall[1], 0,0.9));
level[5].wallPanels.push(new Panel(1100,300, panelHall[1], 0,0.9));
level[5].wallPanels.push(new Panel(1200,300, panelHall[1], 0,0.9));
level[5].wallPanels.push(new Panel(800,400, panelHall[1], 0,0.9));
level[5].wallPanels.push(new Panel(900,400, panelHall[1], 0,0.9));
level[5].wallPanels.push(new Panel(1000,400, panelHall[1], 0,0.9));
level[5].wallPanels.push(new Panel(1100,400, panelHall[1], 0,0.9));
level[5].wallPanels.push(new Panel(1200,400, panelHall[1], 0,0.9));
level[5].wallPanels.push(new Panel(200,200, panelHall[0], 0,0.9));
level[5].wallPanels.push(new Panel(300,200, panelHall[0], 0,0.9));
level[5].wallPanels.push(new Panel(400,200, panelHall[0], 0,0.9));
level[5].wallPanels.push(new Panel(500,200, panelHall[0], 0,0.9));
level[5].wallPanels.push(new Panel(600,200, panelHall[0], 0,0.9));
level[5].wallPanels.push(new Panel(800,200, panelHall[0], 0,0.9));
level[5].wallPanels.push(new Panel(900,200, panelHall[0], 0,0.9));
level[5].wallPanels.push(new Panel(1000,200, panelHall[0], 0,0.9));
level[5].wallPanels.push(new Panel(1100,200, panelHall[0], 0,0.9));
level[5].wallPanels.push(new Panel(1200,200, panelHall[0], 0,0.9));
level[5].wallPanels.push(new Panel(700,200, panelHall[2], 0,0.9));
level[5].wallPanels.push(new Panel(700,300, panelHall[2], 0,0.9));
level[5].wallPanels.push(new Panel(700,400, panelHall[2], 0,0.9));
level[5].wallPanels.push(new Panel(200,500, panelHall[1], 2,0.9));
level[5].wallPanels.push(new Panel(300,500, panelHall[1], 2,0.9));
level[5].wallPanels.push(new Panel(400,500, panelHall[1], 2,0.9));
level[5].wallPanels.push(new Panel(500,500, panelHall[1], 2,0.9));
level[5].wallPanels.push(new Panel(600,500, panelHall[1], 2,0.9));
level[5].wallPanels.push(new Panel(800,500, panelHall[1], 2,0.9));
level[5].wallPanels.push(new Panel(900,500, panelHall[1], 2,0.9));
level[5].wallPanels.push(new Panel(1000,500, panelHall[1], 2,0.9));
level[5].wallPanels.push(new Panel(1100,500, panelHall[1], 2,0.9));
level[5].wallPanels.push(new Panel(1200,500, panelHall[1], 2,0.9));
level[5].wallPanels.push(new Panel(700,500, panelHall[2], 2,0.9));
	
	level[5].wall.push(createWall(200,600, 100,30,floor[0]));
level[5].wall.push(createWall(300,600, 100,30,floor[0]));
level[5].wall.push(createWall(400,600, 100,30,floor[0]));
level[5].wall.push(createWall(500,600, 100,30,floor[0]));
level[5].wall.push(createWall(600,600, 100,30,floor[0]));
level[5].wall.push(createWall(700,600, 100,30,floor[0]));
level[5].wall.push(createWall(800,600, 100,30,floor[0]));
//level[5].wall.push(createWall(900,600, 100,30,floor[0]));
level[5].wall.push(createWall(1000,600, 100,30,floor[0]));
level[5].wall.push(createWall(1100,600, 100,30,floor[0]));
level[5].wall.push(createWall(1200,600, 100,30,floor[0]));
level[5].wall.push(createWall(1200,370, 100,30,floor[0]));
level[5].wall.push(createWall(1100,370, 100,30,floor[0]));
level[5].wall.push(createWall(1000,370, 100,30,floor[0]));
level[5].wall.push(createWall(800,370, 100,30,floor[0]));
level[5].wall.push(createWall(700,370, 100,30,floor[0]));
level[5].wall.push(createWall(600,370, 100,30,floor[0]));
level[5].wall.push(createWall(500,370, 100,30,floor[0]));
level[5].wall.push(createWall(400,370, 100,30,floor[0]));
level[5].wall.push(createWall(370,300, 30,100,sideWall[1]));
level[5].wall.push(createWall(370,200, 30,100,sideWall[1]));
level[5].wall.push(createWall(370,370, 30,100,sideWall[6]));
level[5].wall.push(createWall(170,500, 30,100,sideWall[2]));
level[5].wall.push(createWall(170,400, 30,100,sideWall[2]));
level[5].wall.push(createWall(170,300, 30,100,sideWall[2]));
level[5].wall.push(createWall(170,200, 30,100,sideWall[2]));
level[5].wall.push(createWall(170,100, 30,100,sideWall[2]));
level[5].wall.push(createWall(170,600, 30,100,sideWall[5]));
level[5].wall.push(createWall(200,600, 30,100,sideWall[6]));
level[5].wall.push(createWall(870,370, 30,100,sideWall[6]));
level[5].wall.push(createWall(1000,370, 30,100,sideWall[6]));
level[5].wall.push(createWall(1300,500, 30,100,sideWall[2]));
level[5].wall.push(createWall(1300,400, 30,100,sideWall[2]));
level[5].wall.push(createWall(1300,300, 30,100,sideWall[2]));
level[5].wall.push(createWall(1300,200, 30,100,sideWall[2]));
level[5].wall.push(createWall(1300,100, 30,100,sideWall[2]));
level[5].wall.push(createWall(700,100, 100,30,floor[3]));
level[5].wall.push(createWall(800,100, 100,50,ceiling[0]));
level[5].wall.push(createWall(900,100, 100,50,ceiling[0]));
level[5].wall.push(createWall(1000,100, 100,50,ceiling[0]));
level[5].wall.push(createWall(1100,100, 100,50,ceiling[0]));
level[5].wall.push(createWall(1200,100, 100,50,ceiling[0]));
level[5].wall.push(createWall(600,100, 100,50,ceiling[0]));
level[5].wall.push(createWall(370,170, 30,100,sideWall[5]));

level[5].wall.push(createWall(500,100, 100,50,ceiling[0]));
level[5].wall.push(createWall(400,100, 100,50,ceiling[0]));
level[5].wall.push(createWall(300,100, 100,50,ceiling[0]));
level[5].wall.push(createWall(200,100, 100,50,ceiling[0]));
level[5].wall.push(createWall(170,100, 30,100,sideWall[6]));
level[5].wall.push(createWall(1180,270, 100,30,floor[1]));
level[5].wall.push(createWall(1080,270, 100,30,floor[1]));
level[5].wall.push(createWall(1050,340, 100,30,floor[2]));
level[5].wall.push(createWall(1130,240, 100,30,floor[2]));
level[5].wall.push(createWall(1200,170, 100,30,floor[1]));
level[5].wall.push(createWall(1270,140, 100,30,floor[2]));
level[5].wall.push(createWall(1240,140, 100,30,floor[2]));
level[5].wall.push(createWall(1140,210, 100,30,floor[2]));
level[5].wall.push(createWall(1300,600, 30,100,sideWall[5]));
level[5].wall.push(createWall(1270,600, 30,100,sideWall[6]));
level[5].wallPanels.push(new ForeGround(250,400, door[0], '', 0.5));
level[5].wallPanels.push(new ForeGround(700,500, wallFeatures[12]));
level[5].wallPanels.push(new ForeGround(700,400, wallFeatures[12]));
level[5].wallPanels.push(new ForeGround(700,300, wallFeatures[12]));
level[5].wallPanels.push(new ForeGround(700,200, wallFeatures[12]));
level[5].wallPanels.push(new ForeGround(700,100, wallFeatures[12]));
level[5].wallPanels.push(new ForeGround(200,500, wallFeatures[12]));
level[5].wallPanels.push(new ForeGround(200,400, wallFeatures[12]));
level[5].wallPanels.push(new ForeGround(200,300, wallFeatures[12]));
level[5].wallPanels.push(new ForeGround(200,200, wallFeatures[12]));
level[5].wallPanels.push(new ForeGround(200,100, pipes[0]));
level[5].wallPanels.push(new ForeGround(300,100, pipes[4]));
level[5].wallPanels.push(new ForeGround(400,100, pipes[4]));
level[5].wallPanels.push(new ForeGround(500,100, pipes[2]));

level[5].foreGround.push(new ForeGround(570,500, foreGPic[0]));
level[5].foreGround.push(new ForeGround(670,500, foreGPic[1]));
level[5].wallPanels.push(new Monitor(500,400, 'general alert --- evac order in effect --- proceed to nearest safe zone',0));
level[5].wallPanels.push(new Monitor(600,400,"" ,0));
level[5].wallPanels.push(new Monitor(800,400, "",0));
level[5].wallPanels.push(new ForeGround(800,500, wallFeatures[22]));
level[5].wallPanels.push(new ForeGround(400,500, wallFeatures[9]));
level[5].wallPanels.push(new ForeGround(500,300, wallFeatures[9]));
level[5].wallPanels.push(new ForeGround(1200,400, wallFeatures[9]));
level[5].wallPanels.push(new ForeGround(900,300, wallFeatures[9]));
level[5].wallPanels.push(new ForeGround(800,100, wallFeatures[9]));
level[5].wallPanels.push(new ForeGround(900,250, wallFeatures[10]));
level[5].wallPanels.push(new ForeGround(1100,200, wallFeatures[10]));
level[5].wallPanels.push(new ForeGround(650,200, wallFeatures[10]));
level[5].wallPanels.push(new ForeGround(300,250, wallFeatures[10]));
level[5].wallPanels.push(new ForeGround(450,200, wallFeatures[10]));

level[5].wallPanels.push(new ForeGround(300,460, wallFeatures[13]));
level[5].wallPanels.push(new ForeGround(700,500, wallFeatures[0]));
level[5].wallPanels.push(new ForeGround(700,400, wallFeatures[0]));
level[5].wallPanels.push(new ForeGround(700,300, wallFeatures[0]));
level[5].wallPanels.push(new ForeGround(700,200, wallFeatures[0]));
level[5].wallPanels.push(new ForeGround(700,100, wallFeatures[0]));
level[5].wallPanels.push(new ForeGround(610,100, wallFeatures[2]));
level[5].wallPanels.push(new ForeGround(610,200, wallFeatures[2]));
level[5].wallPanels.push(new ForeGround(610,300, wallFeatures[2]));
level[5].wallPanels.push(new ForeGround(610,400, wallFeatures[2]));
level[5].wallPanels.push(new ForeGround(610,500, wallFeatures[2]));level[5].wallPanels.push(new ForeGround(790,500, wallFeatures[1]));
level[5].wallPanels.push(new ForeGround(790,400, wallFeatures[1]));
level[5].wallPanels.push(new ForeGround(790,300, wallFeatures[1]));
level[5].wallPanels.push(new ForeGround(790,200, wallFeatures[1]));
level[5].wallPanels.push(new ForeGround(790,100, wallFeatures[1]));
level[5].wallPanels.push(new ForeGround(730,470, wallFeatures[6]));
level[5].wallPanels.push(new ForeGround(1000,500, wallFeatures[25]));
level[5].wallPanels.push(new ForeGround(990,400, wallFeatures[27]));
level[5].wallPanels.push(new ForeGround(1100,400, wallFeatures[27]));

level[5].wallPanels.push(new ForeGround(820,270, wallFeatures[22]));
level[5].wallPanels.push(new ForeGround(400,270, foreGPic[1]));
level[5].wallPanels.push(new ForeGround(570,270, foreGPic[0]));
level[5].wallPanels.push(new ForeGround(670,270, foreGPic[1]));
level[5].wallPanels.push(new ForeGround(410,250, foreGPic[2]));
level[5].wallPanels.push(new ForeGround(690,250, foreGPic[3]));
level[5].wallPanels.push(new ForeGround(620,250, foreGPic[5]));


level[5].lamps.push(new BigLamp(310,430));
level[5].wallPanels.push(new wordTicker(300,410, 'LOCK'));
level[5].lamps.push(new BigLamp(510,400));level[5].lamps.push(new BigLampFlicker(710,400));
level[5].lamps.push(new BigLampDead(1110,400));
level[5].lamps.push(new Lamp(420,220));
level[5].lamps.push(new FlickerLamp(620,220));
level[5].lamps.push(new FlickerLamp(1070,220));
level[5].lamps.push(new deadLamp(870,220));
level[5].dLights.push(new spinLight(270,440,50,0));
level[5].foreGround.push(new ForeGround(1000,300, wallFeatures[0]));
level[5].foreGround.push(new ForeGround(1100,300, wallFeatures[0]));
level[5].foreGround.push(new ForeGround(1200,300, wallFeatures[0]));
level[5].foreGround.push(new ForeGround(1200,200, wallFeatures[0]));
level[5].foreGround.push(new ForeGround(1100,200, wallFeatures[0]));
level[5].foreGround.push(new ForeGround(1000,200, wallFeatures[0]));
level[5].foreGround.push(new ForeGround(1000,100, wallFeatures[0]));
level[5].foreGround.push(new ForeGround(1100,100, wallFeatures[0]));
level[5].foreGround.push(new ForeGround(1200,100, wallFeatures[0]));
level[5].foreGround.push(new ForeGround(900,300, wallFeatures[2]));
level[5].foreGround.push(new ForeGround(900,200, wallFeatures[2]));
level[5].foreGround.push(new ForeGround(900,100, wallFeatures[2]));

level[5].wallPanels.push(new wordWall(410,440, 'PROTOTYPE',5));
level[5].wallPanels.push(new wordWall(420,450, 'DISPOSAL',5));
level[5].wallPanels.push(new ForeGround(410,400, wallFeatures[3]));
level[5].foreGround.push(new ForeGround(200,300, pipes[4]));
level[5].foreGround.push(new ForeGround(300,300, pipes[2]));
level[5].foreGround.push(new ForeGround(300,200, wallFeatures[12]));
level[5].foreGround.push(new ForeGround(300,100, wallFeatures[12]));
level[5].creature.push(Scientist(1020,400,3));
level[5].creature.push(Scientist(1080,400,3));

level[5].creature[0].stats.health = 20
level[5].creature[1].stats.health = 20
level[5].creature.push(LowInsect(1150,400,0));
level[5].creature[2].stats.health = 50
level[5].items.push(pistolItem(540,500));

level[5].lamps.push(new pulseLight(350,600));
level[5].lamps[8].addPLight(400, 600);
level[5].lamps[8].addPLight(450, 600);
level[5].lamps[8].addPLight(500, 600);
level[5].lamps[8].addPLight(550, 600);
level[5].lamps[8].addPLight(600, 600);
level[5].lamps[8].addPLight(650, 600);
level[5].lamps[8].addPLight(700, 600);
level[5].lamps[8].addPLight(750, 600);
level[5].lamps[8].addPLight(800, 600);
level[5].lamps[8].addPLight(850, 600);
level[5].lamps[8].addPLight(900, 600);
level[5].lamps[8].addPLight(950, 600);
level[5].lamps[8].addPLight(1000, 600);
level[5].lamps[8].addPLight(1050, 600);
level[5].lamps[8].addPLight(1100, 600);
level[5].lamps[8].addPLight(1150, 600);
level[5].lamps[8].addPLight(1200, 600);
level[5].lamps[8].addPLight(1250, 600);
level[5].lamps.push(new FlickerLamp(1070,420));
level[5].lamps.push(new FlickerLamp(1170,420));
level[5].lamps.push(new Lamp(520,220));
level[5].lamps.push(new Lamp(570,220));
level[5].dLights.push(new spinLight(920,220,50,0));
level[5].dLights.push(new spinLight(970,220,50,0));
level[5].lamps.push(new Lamp(1020,220));
level[5].lamps.push(new pulseLight(350,100));
level[5].lamps[14].addPLight(350, 150);
level[5].lamps[14].addPLight(350, 200);
level[5].lamps[14].addPLight(350, 250);
level[5].lamps[14].addPLight(350, 300);
level[5].lamps[14].addPLight(350, 350);
level[5].lamps[14].addPLight(300, 350);
level[5].lamps[14].addPLight(250, 350);
level[5].lamps[14].addPLight(200, 350);
level[5].lamps.push(new pulseLight(550,100));
level[5].lamps[15].addPLight(550, 150);
level[5].lamps[15].addPLight(500, 150);
level[5].lamps[15].addPLight(450, 150);
level[5].lamps[15].addPLight(400, 150);
level[5].lamps[15].addPLight(350, 150);
level[5].lamps[15].addPLight(300, 150);
level[5].lamps[15].addPLight(250, 150);
level[5].lamps[15].addPLight(250, 200);
level[5].lamps[15].addPLight(250, 250);
level[5].lamps[15].addPLight(250, 300);
level[5].lamps[15].addPLight(250, 350);
level[5].lamps[15].addPLight(250, 400);
level[5].lamps[15].addPLight(250, 500);
level[5].lamps[15].addPLight(250, 550);
level[5].lamps[15].addPLight(250, 600);
level[5].lamps.push(new pulseLight(750,100));
level[5].lamps[16].addPLight(750, 150);
level[5].lamps[16].addPLight(750, 200);
level[5].lamps[16].addPLight(750, 250);
level[5].lamps[16].addPLight(750, 300);
level[5].lamps[16].addPLight(750, 340);
level[5].lamps[16].addPLight(750, 400);
level[5].lamps[16].addPLight(750, 450);
level[5].lamps[16].addPLight(750, 500);
level[5].lamps[16].addPLight(750, 600);
level[5].wallPanels.push(new ForeGround(1060,450, wallFeatures[7]));
level[5].elevators.push(new elevator(900,1000, 400,630));
level[5].wall.push(createWall(870,600, 30,100,sideWall[1]));
level[5].wall.push(createWall(870,700, 30,100,sideWall[1]));
level[5].wall.push(createWall(1000,600, 30,100,sideWall[1]));
level[5].wall.push(createWall(1000,700, 30,100,sideWall[1]));
level[5].foreGround.push(new ForeGround(900,600, wallFeatures[0]));
level[5].foreGround.push(new ForeGround(900,700, wallFeatures[0]));level[5].wall.push(createWall(900,1000, 100,30,floor[0]));
level[5].wall.push(createWall(1000,1000, 100,30,floor[0]));
level[5].wall.push(createWall(1100,1000, 100,30,floor[0]));
level[5].wall.push(createWall(1200,1000, 100,30,floor[0]));
level[5].wall.push(createWall(1300,1000, 100,30,floor[0]));
level[5].wall.push(createWall(1400,1000, 100,30,floor[0]));
level[5].wall.push(createWall(1500,1000, 100,30,floor[0]));
level[5].wall.push(createWall(1600,1000, 100,30,floor[0]));
level[5].wall.push(createWall(1700,1000, 100,30,floor[0]));
level[5].wall.push(createWall(1800,1000, 100,30,floor[0]));
level[5].wall.push(createWall(1000,790, 100,50,ceiling[0]));
level[5].wall.push(createWall(1100,790, 100,50,ceiling[0]));
level[5].wall.push(createWall(1200,790, 100,50,ceiling[0]));
level[5].wall.push(createWall(1300,790, 100,50,ceiling[0]));
level[5].wall.push(createWall(1400,790, 100,50,ceiling[0]));
level[5].wall.push(createWall(1500,790, 100,50,ceiling[0]));
level[5].wall.push(createWall(1600,790, 100,50,ceiling[0]));
level[5].wall.push(createWall(1700,790, 100,50,ceiling[0]));
level[5].wall.push(createWall(1800,790, 100,50,ceiling[0]));
level[5].wall.push(createWall(1900,900, 30,100,sideWall[2]));
level[5].wall.push(createWall(1900,800, 30,100,sideWall[2]));
level[5].wall.push(createWall(1900,1000, 30,100,sideWall[5]));
level[5].wall.push(createWall(1900,790, 30,100,sideWall[5]));
level[5].wall.push(createWall(1870,1000, 30,100,sideWall[6]));
level[5].wall.push(createWall(1000,760, 30,100,sideWall[5]));

level[5].wallPanels.push(new Panel(1000,800, panelHall[1], 1,0.5));
level[5].wallPanels.push(new Panel(1100,800, panelHall[1], 1,0.5));
level[5].wallPanels.push(new Panel(1200,800, panelHall[1], 1,0.5));
level[5].wallPanels.push(new Panel(1300,800, panelHall[1], 1,0.5));
level[5].wallPanels.push(new Panel(1400,800, panelHall[1], 1,0.5));
level[5].wallPanels.push(new Panel(1500,800, panelHall[1], 1,0.5));
level[5].wallPanels.push(new Panel(1600,800, panelHall[1], 1,0.5));
level[5].wallPanels.push(new Panel(1700,800, panelHall[1], 1,0.5));
level[5].wallPanels.push(new Panel(1800,800, panelHall[1], 1,0.5));
level[5].wallPanels.push(new Panel(1800,900, panelHall[1], 2,0.5));
level[5].wallPanels.push(new Panel(1700,900, panelHall[1], 2,0.5));
level[5].wallPanels.push(new Panel(1600,900, panelHall[1], 2,0.5));
level[5].wallPanels.push(new Panel(1500,900, panelHall[1], 2,0.5));
level[5].wallPanels.push(new Panel(1400,900, panelHall[1], 2,0.5));
level[5].wallPanels.push(new Panel(1300,900, panelHall[1], 2,0.5));
level[5].wallPanels.push(new Panel(1200,900, panelHall[1], 2,0.5));
level[5].wallPanels.push(new Panel(1100,900, panelHall[1], 2,0.5));
level[5].wallPanels.push(new Panel(1000,900, panelHall[1], 2,0.5));
level[5].wallPanels.push(new Panel(900,900, panelHall[1], 2,0.5));
level[5].wallPanels.push(new Panel(900,800, panelHall[1], 0,0.5));
level[5].wallPanels.push(new Panel(900,700, panelHall[1], 0,0.5));
level[5].wallPanels.push(new Panel(900,600, panelHall[1], 0,0.5));level[5].wallPanels.push(new wordWall(1020,860, 'REPTILE',5));level[5].wallPanels.push(new wordWall(1020,870, 'SPECIMENS',4));level[5].wallPanels.push(new ForeGround(1110,900, wallFeatures[22]));
level[5].wallPanels.push(new AniDoor(1650,800, 0,1));
level[5].wallPanels.push(new AniDoor(1450,800, 0,1));
level[5].wallPanels.push(new AniDoor(1250,800, 0,1));
level[5].wallPanels.push(new wordTicker(1300,810, 'CELL 1'));
level[5].wallPanels.push(new wordTicker(1500,810, 'CELL 2'));
level[5].wallPanels.push(new wordTicker(1700,810, 'CELL 3'));
level[5].lamps.push(new BigLamp(1510,830));
level[5].lamps.push(new BigLamp(1310,830));
level[5].lamps.push(new BigLamp(1710,830));

level[5].wallPanels.push(new Panel(800,900, panelHall[1], 2,0.5));
level[5].wallPanels.push(new Panel(700,900, panelHall[1], 2,0.5));
level[5].wallPanels.push(new Panel(600,900, panelHall[1], 2,0.5));
level[5].wallPanels.push(new Panel(500,900, panelHall[1], 2,0.5));
level[5].wallPanels.push(new Panel(400,900, panelHall[1], 2,0.5));
level[5].wallPanels.push(new Panel(300,900, panelHall[1], 2,0.5));
level[5].wallPanels.push(new Panel(200,900, panelHall[1], 2,0.5));
level[5].wallPanels.push(new Panel(100,900, panelHall[1], 2,0.5));
level[5].wallPanels.push(new Panel(800,800, panelHall[1], 1,0.5));
level[5].wallPanels.push(new Panel(700,800, panelHall[1], 1,0.5));
level[5].wallPanels.push(new Panel(600,800, panelHall[1], 1,0.5));
level[5].wallPanels.push(new Panel(500,800, panelHall[1], 1,0.5));
level[5].wallPanels.push(new Panel(400,800, panelHall[1], 1,0.5));
level[5].wallPanels.push(new Panel(300,800, panelHall[1], 1,0.5));
level[5].wallPanels.push(new Panel(200,800, panelHall[1], 1,0.5));
level[5].wallPanels.push(new Panel(100,800, panelHall[1], 1,0.5));
level[5].wallPanels.push(new wordWall(820,860, 'INSECT',5));
level[5].wallPanels.push(new wordWall(820,870, 'SPECIMENS',4));
level[5].wallPanels.push(new ForeGround(720,900, wallFeatures[22]));
level[5].wallPanels.push(new AniDoor(550,800, 1, 0));
level[5].wallPanels.push(new AniDoor(350,800, 0, 0));
level[5].wallPanels.push(new AniDoor(150,800, 0, 1));
level[5].wallPanels.push(new wordTicker(400,810, 'CELL 1'));
level[5].wallPanels.push(new wordTicker(600,810, 'CELL 2'));level[5].wallPanels.push(new wordTicker(1000,830, 'SECURE'));
level[5].wallPanels.push(new wordTicker(800,830, 'BREACH'));level[5].dLights.push(new spinLight(710,810,50,0));
level[5].dLights.push(new spinLight(580,810,50,0));
level[5].dLights.push(new spinLight(510,810,50,0));
level[5].dLights.push(new spinLight(380,810,50,0));
level[5].lamps.push(new Lamp(1110,830));
level[5].lamps.push(new FlickerLamp(780,830));level[5].lamps.push(new BigLampFlicker(610,830));
level[5].lamps.push(new BigLampFlicker(410,830));
level[5].lamps.push(new BigLamp(210,830));
level[5].wallPanels.push(new wordTicker(200,810, 'OPEN'));
level[5].lamps.push(new Lamp(310,810));
level[5].lamps.push(new Lamp(180,810));
level[5].wall.push(createWall(800,1000, 100,30,floor[0]));
level[5].wall.push(createWall(700,1000, 100,30,floor[0]));
level[5].wall.push(createWall(600,1000, 100,30,floor[0]));
level[5].wall.push(createWall(500,1000, 100,30,floor[0]));
level[5].wall.push(createWall(400,1000, 100,30,floor[0]));
level[5].wall.push(createWall(300,1000, 100,30,floor[0]));
level[5].wall.push(createWall(200,1000, 100,30,floor[0]));
level[5].wall.push(createWall(100,1000, 100,30,floor[0]));
level[5].wall.push(createWall(800,790, 100,50,ceiling[0]));
level[5].wall.push(createWall(700,790, 100,50,ceiling[0]));
level[5].wall.push(createWall(600,790, 100,50,ceiling[0]));
level[5].wall.push(createWall(500,790, 100,50,ceiling[0]));
level[5].wall.push(createWall(400,790, 100,50,ceiling[0]));
level[5].wall.push(createWall(300,790, 100,50,ceiling[0]));
level[5].wall.push(createWall(200,790, 100,50,ceiling[0]));
level[5].wall.push(createWall(100,790, 100,50,ceiling[0]));
level[5].wall.push(createWall(70,900, 30,100,sideWall[2]));
level[5].wall.push(createWall(70,800, 30,100,sideWall[2]));
level[5].wall.push(createWall(70,1000, 30,100,sideWall[5]));
level[5].wall.push(createWall(70,790, 30,100,sideWall[5]));
level[5].wall.push(createWall(100,1000, 30,100,sideWall[6]));
level[5].wall.push(createWall(870,760, 30,100,sideWall[5]));

level[5].items.push(medItem(970,340));
level[5].items.push(medItem(1000,310));
level[5].items.push(pistolItem(420,270));
level[5].wallPanels.push(new wordWall(110,870, 'OBSERVATION',4));
level[5].wallPanels.push(new wordWall(120,880, 'LOUNGE',4));
level[5].wallPanels.push(new ForeGround(110,780, wallFeatures[3]));
level[5].wallPanels.push(new ForeGround(100,900, wallFeatures[9]));
level[5].wallPanels.push(new ForeGround(800,900, wallFeatures[9]));
level[5].wallPanels.push(new ForeGround(1600,900, wallFeatures[9]));

level[5].items.push(spawnTrap(1350,900, recorder, '1', '0'));
level[5].items.push(spawnTrap(1550,900, recorder, '1', '0'));
level[5].items.push(spawnTrap(1750,900, recorder, '1', '0'));
level[5].items.push(spawnTrap(450,900, recorder, '0', '3'));

level[5].items.push(messageTrap(1050,900, blankPic, 'Voices', 'There is something about this place... I can almost hear voices.  I think they are friendly, I think they need my help.'));
level[5].items.push(messageTrap(750,900, blankPic, 'This hallway...', "I don't like the smell in this place, it smells like the person who attacked me upstairs. ~~I should move cautiously here... these rooms feel wrong somehow."));

level[5].items.push(messageTrap(1350,900, blankPic, 'Help!', "Nobody came for me today, it's been a long time since anyone came to check on us. ~~I think theres two more of us in the next two cells.  ~~Maybe we can work together to find out what's going on.. I've heard horrible things outsdie my door."));
level[5].exits.push(new Exit(250,900, 6, true, 1600, 900));


cutscene[3].lev = level[5]
level[5].wallPanels.push(new talker(420,500,'containment breech. please evacuate','test'));level[5].wallPanels.push(new talker(750,920,'cell breach.  Insect prototype locations unknown','test'));
level[5].wallPanels.push(new fan(320,920, 0.2,0,1));
level[5].wallPanels.push(new fan(1820,920, 0.2,0,1));
level[5].wallPanels.push(new fan(1220,920, 0.2,0,1));



level[6] = new Level('Observation')
level[6].wallPanels.push(new Panel(1700,1000, panelHall[0], 2,0.7));
level[6].wallPanels.push(new Panel(1600,1000, panelHall[0], 2,0.7));
level[6].wallPanels.push(new Panel(1400,1000, panelHall[0], 2,0.7));
level[6].wallPanels.push(new Panel(1300,1000, panelHall[0], 2,0.7));
level[6].wallPanels.push(new Panel(1100,1000, panelHall[0], 2,0.7));
level[6].wallPanels.push(new Panel(1000,1000, panelHall[0], 2,0.7));
level[6].wallPanels.push(new Panel(800,1000, panelHall[0], 2,0.7));
level[6].wallPanels.push(new Panel(700,1000, panelHall[0], 2,0.7));
level[6].wallPanels.push(new Panel(900,1000, panelHall[2], 2,0.7));
level[6].wallPanels.push(new Panel(1200,1000, panelHall[2], 2,0.7));
level[6].wallPanels.push(new Panel(1500,1000, panelHall[2], 2,0.7));
level[6].wallPanels.push(new Panel(900,900, panelHall[2], 0,0.7));
level[6].wallPanels.push(new Panel(1200,900, panelHall[2], 0,0.7));
level[6].wallPanels.push(new Panel(1500,900, panelHall[2], 0,0.7));
level[6].wallPanels.push(new Panel(700,900, panelHall[1], 0,0.7));
level[6].wallPanels.push(new Panel(800,900, panelHall[1], 0,0.7));
level[6].wallPanels.push(new Panel(1000,900, panelHall[1], 0,0.7));
level[6].wallPanels.push(new Panel(1100,900, panelHall[1], 0,0.7));
level[6].wallPanels.push(new Panel(1300,900, panelHall[1], 0,0.7));
level[6].wallPanels.push(new Panel(1400,900, panelHall[1], 0,0.7));
level[6].wallPanels.push(new Panel(1600,900, panelHall[1], 0,0.7));
level[6].wallPanels.push(new Panel(1700,900, panelHall[1], 0,0.7));
level[6].wallPanels.push(new Panel(1700,800, panelHall[1], 1,0.7));
level[6].wallPanels.push(new Panel(1600,800, panelHall[1], 1,0.7));
level[6].wallPanels.push(new Panel(1400,800, panelHall[1], 1,0.7));
level[6].wallPanels.push(new Panel(1300,800, panelHall[1], 1,0.7));
level[6].wallPanels.push(new Panel(1100,800, panelHall[1], 1,0.7));
level[6].wallPanels.push(new Panel(1000,800, panelHall[1], 1,0.7));
level[6].wallPanels.push(new Panel(700,800, panelHall[1], 1,0.7));
level[6].wallPanels.push(new Panel(800,800, panelHall[1], 1,0.7));
level[6].wallPanels.push(new Panel(900,800, panelHall[2], 1,0.7));
level[6].wallPanels.push(new Panel(1200,800, panelHall[2], 1,0.7));
level[6].wallPanels.push(new Panel(1500,800, panelHall[2], 1,0.7));
level[6].wallPanels.push(new ForeGround(1600,900, door[1], '', 0.5));
level[6].wallPanels.push(new Monitor(1000,900, 'cell-1 signal lost',0));
level[6].wallPanels.push(new Monitor(1100,900, '',0));
level[6].wallPanels.push(new Monitor(1300,900, 'cell-3 signal lost',0));
level[6].wallPanels.push(new Monitor(1400,900, 'cell-4 signal lost',0));
level[6].wallPanels.push(new Panel(1800,900, panelHall[1], 0,0.7));
level[6].wallPanels.push(new Panel(1800,800, panelHall[1], 1,0.7));
level[6].wallPanels.push(new Panel(1800,1000, panelHall[0], 2,0.7));
level[6].wallPanels.push(new wordWall(1810,970, 'observation',4));
level[6].wallPanels.push(new wordWall(1820,980, 'lounge',4));
level[6].wallPanels.push(new ForeGround(1110,910, wallFeatures[7]));
level[6].wallPanels.push(new ForeGround(1800,870, wallFeatures[3]));
level[6].wallPanels.push(new ForeGround(1500,1000, wallFeatures[12]));
level[6].wallPanels.push(new ForeGround(1500,900, wallFeatures[12]));
level[6].wallPanels.push(new ForeGround(1500,800, wallFeatures[12]));
level[6].wallPanels.push(new ForeGround(1200,800, wallFeatures[12]));
level[6].wallPanels.push(new ForeGround(1200,900, wallFeatures[12]));
level[6].wallPanels.push(new ForeGround(1200,1000, wallFeatures[12]));
level[6].wallPanels.push(new ForeGround(900,1000, wallFeatures[12]));
level[6].wallPanels.push(new ForeGround(900,900, wallFeatures[12]));
level[6].wallPanels.push(new ForeGround(900,800, wallFeatures[12]));
level[6].wallPanels.push(new ForeGround(1600,800, wallFeatures[9]));
level[6].wallPanels.push(new ForeGround(1100,800, wallFeatures[9]));
level[6].wallPanels.push(new ForeGround(700,900, wallFeatures[9]));
level[6].wallPanels.push(new ForeGround(1000,1000, wallFeatures[10]));
level[6].wallPanels.push(new ForeGround(1300,1050, wallFeatures[10]));
level[6].wallPanels.push(new ForeGround(1850,1000, wallFeatures[10]));
level[6].wall.push(createWall(1800,1100, 100,30,floor[0]));
level[6].wall.push(createWall(1700,1100, 100,30,floor[0]));
level[6].wall.push(createWall(1600,1100, 100,30,floor[0]));
level[6].wall.push(createWall(1500,1100, 100,30,floor[0]));
level[6].wall.push(createWall(1400,1100, 100,30,floor[0]));
level[6].wall.push(createWall(1300,1100, 100,30,floor[0]));
level[6].wall.push(createWall(1200,1100, 100,30,floor[0]));
level[6].wall.push(createWall(1100,1100, 100,30,floor[0]));
level[6].wall.push(createWall(1000,1100, 100,30,floor[0]));
level[6].wall.push(createWall(900,1100, 100,30,floor[0]));
level[6].wall.push(createWall(800,1100, 100,30,floor[0]));
level[6].wall.push(createWall(700,1100, 100,30,floor[0]));
level[6].wall.push(createWall(1900,1000, 30,100,sideWall[2]));
level[6].wall.push(createWall(1900,900, 30,100,sideWall[2]));
level[6].wall.push(createWall(1900,800, 30,100,sideWall[2]));
level[6].wall.push(createWall(1900,1100, 30,100,sideWall[5]));
level[6].wall.push(createWall(1870,1100, 30,100,sideWall[6]));
level[6].wall.push(createWall(700,770, 100,30,floor[0]));
level[6].wall.push(createWall(800,770, 100,30,floor[0]));
level[6].wall.push(createWall(900,770, 100,30,floor[0]));
level[6].wall.push(createWall(1000,770, 100,30,floor[0]));
level[6].wall.push(createWall(1100,770, 100,30,floor[0]));
level[6].wall.push(createWall(1200,770, 100,30,floor[0]));
level[6].wall.push(createWall(1300,770, 100,30,floor[0]));
level[6].wall.push(createWall(1400,770, 100,30,floor[0]));
level[6].wall.push(createWall(1500,770, 100,30,floor[0]));
level[6].wall.push(createWall(1600,770, 100,30,floor[0]));
level[6].wall.push(createWall(1700,770, 100,30,floor[0]));
level[6].wall.push(createWall(1800,770, 100,30,floor[0]));
level[6].wall.push(createWall(1900,770, 30,100,sideWall[5]));
level[6].wall.push(createWall(1870,770, 30,100,sideWall[6]));



level[6].wallPanels.push(new ForeGround(800,950, wallFeatures[8]));
level[6].wallPanels.push(new Panel(600,900, panelHall[1], 0,0.7));
level[6].wallPanels.push(new Panel(500,900, panelHall[1], 0,0.7));
level[6].wallPanels.push(new Panel(400,900, panelHall[1], 0,0.7));
level[6].wallPanels.push(new Panel(400,1000, panelHall[1], 2,0.7));
level[6].wallPanels.push(new Panel(500,1000, panelHall[1], 2,0.7));
level[6].wallPanels.push(new Panel(600,1000, panelHall[1], 2,0.7));
level[6].wallPanels.push(new Panel(400,800, panelHall[1], 0,0.7));
level[6].wallPanels.push(new Panel(500,800, panelHall[1], 0,0.7));
level[6].wallPanels.push(new Panel(600,800, panelHall[1], 0,0.7));
level[6].wallPanels.push(new Panel(600,700, panelHall[1], 0,0.7));
level[6].wallPanels.push(new Panel(500,700, panelHall[1], 0,0.7));
level[6].wallPanels.push(new Panel(400,700, panelHall[1], 0,0.7));
level[6].wallPanels.push(new Panel(400,600, panelHall[1], 0,0.7));
level[6].wallPanels.push(new Panel(500,600, panelHall[1], 0,0.7));
level[6].wallPanels.push(new Panel(600,600, panelHall[1], 0,0.7));
level[6].wallPanels.push(new Panel(600,500, panelHall[1], 1,0.7));
level[6].wallPanels.push(new Panel(500,500, panelHall[1], 1,0.7));
level[6].wallPanels.push(new Panel(400,500, panelHall[1], 1,0.7));
level[6].wallPanels.push(new Panel(300,500, panelHall[1], 1,0.7));
level[6].wallPanels.push(new Panel(200,500, panelHall[1], 1,0.7));
level[6].wallPanels.push(new Panel(100,500, panelHall[1], 1,0.7));
level[6].wallPanels.push(new Panel(100,600, panelHall[0], 0,0.7));
level[6].wallPanels.push(new Panel(200,600, panelHall[0], 0,0.7));
level[6].wallPanels.push(new Panel(300,600, panelHall[0], 0,0.7));
level[6].wallPanels.push(new Panel(100,700, panelHall[0], 2,0.7));
level[6].wallPanels.push(new Panel(200,700, panelHall[0], 2,0.7));
level[6].wallPanels.push(new Panel(300,700, panelHall[0], 2,0.7));
level[6].wall.push(createWall(100,800, 100,30,floor[0]));
level[6].wall.push(createWall(200,800, 100,30,floor[0]));
level[6].wall.push(createWall(300,800, 100,30,floor[0]));
level[6].wall.push(createWall(400,1100, 100,30,floor[0]));
level[6].wall.push(createWall(500,1100, 100,30,floor[0]));
level[6].wall.push(createWall(600,1100, 100,30,floor[0]));
level[6].wall.push(createWall(370,1000, 30,100,sideWall[1]));
level[6].wall.push(createWall(370,900, 30,100,sideWall[1]));
level[6].wall.push(createWall(370,800, 30,100,sideWall[1]));
level[6].wall.push(createWall(340,800, 30,100,sideWall[6]));
level[6].wall.push(createWall(370,1100, 30,100,sideWall[6]));
level[6].wall.push(createWall(900,800, 100,30,floor[3]));
level[6].wall.push(createWall(1200,800, 100,30,floor[3]));
level[6].wall.push(createWall(1500,800, 100,30,floor[3]));
level[6].elevators.push(new CargoElevator(400,1100, 0,300));
level[6].wall.push(createWall(600,770, 100,30,floor[0]));level[6].wall.push(createWall(600,700, 30,100,sideWall[2]));
level[6].wall.push(createWall(600,600, 30,100,sideWall[2]));
level[6].wall.push(createWall(600,500, 30,100,sideWall[2]));
level[6].wall.push(createWall(600,770, 30,100,sideWall[5]));
level[6].wallPanels.push(new AniDoor(100,600, 0,1));level[6].wallPanels.push(new wordWall(170,640, 'cafeteria',4));
level[6].wall.push(createWall(70,700, 30,100,sideWall[2]));
level[6].wall.push(createWall(70,600, 30,100,sideWall[2]));
level[6].wall.push(createWall(70,800, 30,100,sideWall[5]));
level[6].wall.push(createWall(370,800, 30,100,sideWall[5]));
level[6].wallPanels.push(new ForeGround(300,600, wallFeatures[3]));
level[6].wallPanels.push(new ForeGround(500,700, wallFeatures[9]));
level[6].wallPanels.push(new ForeGround(200,500, wallFeatures[9]));
level[6].wallPanels.push(new ForeGround(300,750, wallFeatures[10]));
level[6].wall.push(createWall(70,500, 30,100,sideWall[2]));
level[6].wallPanels.push(new Panel(900,700, panelHall[2], 2,0.4));
level[6].wallPanels.push(new Panel(1200,700, panelHall[2], 2,0.4));
level[6].wallPanels.push(new Panel(1500,700, panelHall[2], 2,0.4));
level[6].wallPanels.push(new Panel(900,600, panelHall[2], 0,0.4));
level[6].wallPanels.push(new Panel(1200,600, panelHall[2], 0,0.4));
level[6].wallPanels.push(new Panel(1500,600, panelHall[2], 0,0.4));
level[6].wallPanels.push(new Panel(700,700, panelHall[0], 2,0.4));level[6].wallPanels.push(new Panel(800,700, panelHall[0], 2,0.4));
level[6].wallPanels.push(new Panel(1000,700, panelHall[0], 2,0.4));
level[6].wallPanels.push(new Panel(1100,700, panelHall[0], 2,0.4));
level[6].wallPanels.push(new Panel(1300,700, panelHall[0], 2,0.4));
level[6].wallPanels.push(new Panel(1400,700, panelHall[0], 2,0.4));
level[6].wallPanels.push(new Panel(1600,700, panelHall[0], 2,0.4));
level[6].wallPanels.push(new Panel(1700,700, panelHall[0], 2,0.4));
level[6].wallPanels.push(new Panel(1800,700, panelHall[0], 2,0.4));
level[6].wallPanels.push(new Panel(1600,600, panelHall[0], 0,0.4));
level[6].wallPanels.push(new Panel(1700,600, panelHall[0], 0,0.4));
level[6].wallPanels.push(new Panel(1800,600, panelHall[0], 0,0.4));
level[6].wallPanels.push(new Panel(1400,600, panelHall[0], 0,0.4));
level[6].wallPanels.push(new Panel(1300,600, panelHall[0], 0,0.4));
level[6].wallPanels.push(new Panel(1100,600, panelHall[0], 0,0.4));
level[6].wallPanels.push(new Panel(1000,600, panelHall[0], 0,0.4));
level[6].wallPanels.push(new Panel(700,600, panelHall[0], 0,0.4));
level[6].wallPanels.push(new Panel(800,600, panelHall[0], 0,0.4));
level[6].wallPanels.push(new Panel(700,500, panelHall[0], 1,0.4));
level[6].wallPanels.push(new Panel(800,500, panelHall[0], 1,0.4));
level[6].wallPanels.push(new Panel(1000,500, panelHall[0], 1,0.4));
level[6].wallPanels.push(new Panel(1100,500, panelHall[0], 1,0.4));
level[6].wallPanels.push(new Panel(1300,500, panelHall[0], 1,0.4));
level[6].wallPanels.push(new Panel(1400,500, panelHall[0], 1,0.4));
level[6].wallPanels.push(new Panel(1600,500, panelHall[0], 1,0.4));
level[6].wallPanels.push(new Panel(1700,500, panelHall[0], 1,0.4));
level[6].wallPanels.push(new Panel(1800,500, panelHall[0], 1,0.4));
level[6].wallPanels.push(new Panel(900,500, panelHall[2], 1,0.4));
level[6].wallPanels.push(new Panel(1200,500, panelHall[2], 1,0.4));
level[6].wallPanels.push(new Panel(1500,500, panelHall[2], 1,0.4));
level[6].wallPanels.push(new ForeGround(1500,700, wallFeatures[12]));
level[6].wallPanels.push(new ForeGround(1500,600, wallFeatures[12]));
level[6].wallPanels.push(new ForeGround(1500,500, wallFeatures[12]));
level[6].wallPanels.push(new ForeGround(1200,700, wallFeatures[12]));
level[6].wallPanels.push(new ForeGround(1200,600, wallFeatures[12]));
level[6].wallPanels.push(new ForeGround(1200,500, wallFeatures[12]));
level[6].wallPanels.push(new ForeGround(900,700, wallFeatures[12]));
level[6].wallPanels.push(new ForeGround(900,600, wallFeatures[12]));
level[6].wallPanels.push(new ForeGround(900,500, pipes[1]));
level[6].wallPanels.push(new ForeGround(800,500, pipes[4]));
level[6].wallPanels.push(new ForeGround(700,500, pipes[4]));
level[6].wallPanels.push(new ForeGround(600,500, pipes[4]));
level[6].wallPanels.push(new ForeGround(500,500, pipes[4]));
level[6].wallPanels.push(new ForeGround(400,500, pipes[4]));
level[6].wallPanels.push(new ForeGround(300,500, pipes[4]));
level[6].wallPanels.push(new ForeGround(200,500, pipes[4]));
level[6].wallPanels.push(new ForeGround(100,500, pipes[4]));
level[6].wallPanels.push(new AniDoor(1000,570, 1,0));
level[6].wallPanels.push(new ForeGround(640,570, wallFeatures[20]));
level[6].wallPanels.push(new ForeGround(840,570, wallFeatures[19]));
level[6].wallPanels.push(new ForeGround(1170,670, wallFeatures[22]));
level[6].wallPanels.push(new ForeGround(1270,570, wallFeatures[21]));
level[6].wallPanels.push(new ForeGround(1470,570, wallFeatures[17]));
level[6].wallPanels.push(new ForeGround(1670,570, wallFeatures[19]));
level[6].foreGround.push(new ForeGround(1380,1000, foreGPic[1]));
level[6].foreGround.push(new ForeGround(1280,1000, foreGPic[0]));
level[6].foreGround.push(new ForeGround(1110,1000, foreGPic[1]));
level[6].foreGround.push(new ForeGround(1010,1000, foreGPic[0]));
level[6].foreGround.push(new ForeGround(820,1000, foreGPic[1]));
level[6].foreGround.push(new ForeGround(720,1000, foreGPic[0]));
level[6].wallPanels.push(new wordWall(610,970, 'lift-3',5));
level[6].wallPanels.push(new wordWall(610,980, 'cafeteria',4));
level[6].wallPanels.push(new ForeGround(600,870, wallFeatures[3]));
level[6].foreGround.push(new ForeGround(1020,980, foreGPic[2]));
level[6].foreGround.push(new ForeGround(1050,980, foreGPic[9]));
level[6].foreGround.push(new ForeGround(1140,980, foreGPic[8]));
level[6].foreGround.push(new ForeGround(1380,980, foreGPic[2]));
level[6].foreGround.push(new ForeGround(1340,980, foreGPic[5]));
level[6].foreGround.push(new ForeGround(780,980, foreGPic[5]));
level[6].foreGround.push(new ForeGround(820,980, foreGPic[3]));
level[6].wallPanels.push(new ForeGround(610,800, foreGPic[6]));
level[6].wallPanels.push(new ForeGround(320,560, foreGPic[7]));
level[6].lamps.push(new pulseLight(1700,1100));
level[6].lamps[0].addPLight(1600, 1100);
level[6].lamps[0].addPLight(1550, 1100);
level[6].lamps[0].addPLight(1500, 1100);
level[6].lamps[0].addPLight(1450, 1100);
level[6].lamps[0].addPLight(1400, 1100);
level[6].lamps[0].addPLight(1350, 1100);
level[6].lamps[0].addPLight(1300, 1100);
level[6].lamps[0].addPLight(1250, 1100);
level[6].lamps[0].addPLight(1200, 1100);
level[6].lamps[0].addPLight(1150, 1100);
level[6].lamps[0].addPLight(1100, 1100);
level[6].lamps[0].addPLight(1050, 1100);
level[6].lamps[0].addPLight(1000, 1100);
level[6].lamps[0].addPLight(950, 1100);
level[6].lamps[0].addPLight(900, 1100);
level[6].lamps[0].addPLight(850, 1100);
level[6].lamps[0].addPLight(800, 1100);
level[6].lamps[0].addPLight(750, 1100);
level[6].lamps[0].addPLight(700, 1100);
level[6].lamps[0].addPLight(650, 1100);
level[6].lamps[0].addPLight(600, 1100);

level[6].lamps.push(new waterDrop(1250,1000));
level[6].lamps.push(new waterDrop(300,560));
level[6].lamps.push(new sparker(610,800));
level[6].lamps.push(new sparker(760,950));
level[6].lamps.push(new sparker(870,940));
level[6].lamps.push(new sparker(1760,1010));
level[6].rLights.push(new staticLight(720,740, 20));
level[6].rLights.push(new staticLight(760,740, 20));
level[6].rLights.push(new staticLight(920,740, 20));
level[6].rLights.push(new staticLight(960,740, 20));
level[6].rLights.push(new staticLight(1350,740, 20));
level[6].rLights.push(new staticLight(1390,740, 20));
level[6].rLights.push(new staticLight(1790,740, 20));
level[6].rLights.push(new staticLight(1750,750, 20));
level[6].lamps.push(new Lamp(650,930));
level[6].lamps.push(new Lamp(1850,930));
level[6].dLights.push(new spinLight(980,920,50,0));
level[6].dLights.push(new spinLight(910,920,50,0));
level[6].dLights.push(new spinLight(1210,920,50,0));
level[6].dLights.push(new spinLight(1280,920,50,0));
level[6].dLights.push(new spinLight(1510,920,50,0));
level[6].dLights.push(new spinLight(1580,920,50,0));
level[6].items.push(pistolItem(590,1070));
level[6].items.push(medItem(710,1000));
level[6].creature.push(Bug(800,900,0));
level[6].creature.push(Maggot(1010,900,0));
level[6].dLights.push(new steamJet(960,1000));
level[6].wallPanels.push(new wordTicker(1650,910, 'BREACH'));
level[6].lamps.push(new BigLamp(1660,930));
level[6].wallPanels.push(new ForeGround(800,900, wallFeatures[26]));
level[6].wallPanels.push(new ForeGround(700,800, wallFeatures[27]));
level[6].wallPanels.push(new ForeGround(800,800, wallFeatures[25]));
level[6].wallPanels.push(new Alarm(320,620));
level[6].wallPanels.push(new talker(1770,1000,'Welcome to. Observation lounge 4.','test'));
level[6].exits.push(new Exit(1700,1000, 5, true, 160, 800));
level[6].exits.push(new Exit(200,700, 7, true, 1600,100))


level[7] = new Level('Enroute to Cafeteria.')
level[7].wallPanels.push(new Panel(1700,100, panelHall[1], 1,0.4));
level[7].wallPanels.push(new Panel(1600,100, panelHall[1], 1,0.4));
level[7].wallPanels.push(new Panel(1500,100, panelHall[2], 1,0.4));
level[7].wallPanels.push(new Panel(1400,100, panelHall[0], 1,0.4));
level[7].wallPanels.push(new Panel(1300,100, panelHall[0], 1,0.4));
level[7].wallPanels.push(new Panel(1200,100, panelHall[2], 1,0.4));
level[7].wallPanels.push(new Panel(1100,100, panelHall[1], 1,0.4));
level[7].wallPanels.push(new Panel(1000,100, panelHall[1], 1,0.4));
level[7].wallPanels.push(new Panel(900,100, panelHall[1], 1,0.4));
level[7].wallPanels.push(new Panel(800,100, panelHall[1], 1,0.4));
level[7].wallPanels.push(new Panel(700,100, panelHall[1], 1,0.4));
level[7].wallPanels.push(new Panel(600,100, panelHall[2], 1,0.4));
level[7].wallPanels.push(new Panel(300,100, panelHall[2], 1,0.4));
level[7].wallPanels.push(new Panel(400,100, panelHall[0], 1,0.4));
level[7].wallPanels.push(new Panel(500,100, panelHall[0], 1,0.4));
level[7].wallPanels.push(new Panel(1300,200, panelHall[0], 2,0.4));
level[7].wallPanels.push(new Panel(1400,200, panelHall[0], 2,0.4));
level[7].wallPanels.push(new Panel(400,200, panelHall[0], 2,0.4));
level[7].wallPanels.push(new Panel(500,200, panelHall[0], 2,0.4));
level[7].wallPanels.push(new Panel(600,200, panelHall[2], 2,0.4));
level[7].wallPanels.push(new Panel(300,200, panelHall[2], 2,0.4));
level[7].wallPanels.push(new Panel(1200,200, panelHall[2], 2,0.4));
level[7].wallPanels.push(new Panel(1500,200, panelHall[2], 2,0.4));
level[7].wallPanels.push(new Panel(1600,200, panelHall[1], 2,0.4));
level[7].wallPanels.push(new Panel(1700,200, panelHall[1], 2,0.4));
level[7].wallPanels.push(new Panel(700,200, panelHall[1], 2,0.4));
level[7].wallPanels.push(new Panel(800,200, panelHall[1], 2,0.4));
level[7].wallPanels.push(new Panel(900,200, panelHall[1], 2,0.4));
level[7].wallPanels.push(new Panel(1000,200, panelHall[1], 2,0.4));
level[7].wallPanels.push(new Panel(1100,200, panelHall[1], 2,0.4));
level[7].wallPanels.push(new AniDoor(1600,100, 1,1));
level[7].wallPanels.push(new Panel(200,200, panelHall[1], 2,0.4));
level[7].wallPanels.push(new Panel(100,200, panelHall[1], 2,0.4));
level[7].wallPanels.push(new Panel(200,100, panelHall[1], 1,0.4));
level[7].wallPanels.push(new Panel(100,100, panelHall[1], 1,0.4));
level[7].wallPanels.push(new ForeGround(100,100, door[0], '', 0.5));level[7].wallPanels.push(new wordWall(170,140, 'CAFETERIA',4));
level[7].wallPanels.push(new ForeGround(250,100, wallFeatures[3]));
level[7].wallPanels.push(new ForeGround(300,200, wallFeatures[12]));
level[7].wallPanels.push(new ForeGround(300,100, wallFeatures[12]));
level[7].wallPanels.push(new ForeGround(600,200, wallFeatures[12]));
level[7].wallPanels.push(new ForeGround(600,100, wallFeatures[12]));
level[7].wallPanels.push(new ForeGround(1200,200, wallFeatures[12]));
level[7].wallPanels.push(new ForeGround(1200,100, wallFeatures[12]));
level[7].wallPanels.push(new ForeGround(1500,200, wallFeatures[12]));
level[7].wallPanels.push(new ForeGround(1500,100, wallFeatures[12]));

level[7].wallPanels.push(new ForeGround(650,100, door[1], '', 0.5));
level[7].wallPanels.push(new ForeGround(950,100, door[1], '', 0.5));level[7].wallPanels.push(new wordWall(820,160, 'advanced',4));
level[7].wallPanels.push(new wordWall(820,170, 'genomics',4));level[7].wallPanels.push(new wordWall(820,180, 'Lab L-9',4));
level[7].wallPanels.push(new wordWall(1120,170, 'sequencing ',4));
level[7].wallPanels.push(new wordWall(1120,160, 'prototype',4));
level[7].wallPanels.push(new wordWall(1120,180, 'lab l-10',4));
level[7].wallPanels.push(new fan(1120,220, 0.2,0,1));
level[7].wallPanels.push(new ForeGround(820,220, wallFeatures[28]));
level[7].wallPanels.push(new talker(1700,200,'hatch failure. caution.','test'));
level[7].wall.push(createWall(1700,300, 100,30,floor[0]));
level[7].wall.push(createWall(1600,300, 100,30,floor[0]));
level[7].wall.push(createWall(1500,300, 100,30,floor[0]));
level[7].wall.push(createWall(1400,300, 100,30,floor[0]));
level[7].wall.push(createWall(1300,300, 100,30,floor[0]));
level[7].wall.push(createWall(1200,300, 100,30,floor[0]));
level[7].wall.push(createWall(1100,300, 100,30,floor[0]));
level[7].wall.push(createWall(1000,300, 100,30,floor[0]));
level[7].wall.push(createWall(900,300, 100,30,floor[0]));
level[7].wall.push(createWall(800,300, 100,30,floor[0]));
level[7].wall.push(createWall(700,300, 100,30,floor[0]));
level[7].wall.push(createWall(600,300, 100,30,floor[0]));
level[7].wall.push(createWall(500,300, 100,30,floor[0]));
level[7].wall.push(createWall(100,300, 100,30,floor[0]));
level[7].wall.push(createWall(200,300, 100,30,floor[0]));
level[7].wall.push(createWall(300,300, 100,30,floor[0]));
level[7].wall.push(createWall(400,300, 100,30,floor[0]));
level[7].wall.push(createWall(100,70, 100,30,floor[0]));
level[7].wall.push(createWall(200,70, 100,30,floor[0]));
level[7].wall.push(createWall(300,70, 100,30,floor[0]));
level[7].wall.push(createWall(400,70, 100,30,floor[0]));
level[7].wall.push(createWall(500,70, 100,30,floor[0]));
level[7].wall.push(createWall(600,70, 100,30,floor[0]));
level[7].wall.push(createWall(700,70, 100,30,floor[0]));
level[7].wall.push(createWall(800,70, 100,30,floor[0]));
level[7].wall.push(createWall(900,70, 100,30,floor[0]));
level[7].wall.push(createWall(1000,70, 100,30,floor[0]));
level[7].wall.push(createWall(1200,70, 100,30,floor[0]));
level[7].wall.push(createWall(1300,70, 100,30,floor[0]));
level[7].wall.push(createWall(1400,70, 100,30,floor[0]));
level[7].wall.push(createWall(1500,70, 100,30,floor[0]));
level[7].wall.push(createWall(1600,70, 100,30,floor[0]));
level[7].wall.push(createWall(1700,70, 100,30,floor[0]));
level[7].wall.push(createWall(1800,200, 30,100,sideWall[2]));
level[7].wall.push(createWall(1800,100, 30,100,sideWall[2]));
level[7].wall.push(createWall(1800,300, 30,100,sideWall[5]));
level[7].wall.push(createWall(1800,70, 30,100,sideWall[5]));
level[7].wall.push(createWall(1770,300, 30,100,sideWall[6]));
level[7].wall.push(createWall(70,200, 30,100,sideWall[1]));
level[7].wall.push(createWall(70,100, 30,100,sideWall[1]));
level[7].wall.push(createWall(70,70, 30,100,sideWall[5]));
level[7].wall.push(createWall(70,300, 30,100,sideWall[5]));
level[7].wall.push(createWall(100,300, 30,100,sideWall[6]));
level[7].wall.push(createWall(100,70, 30,100,sideWall[6]));
level[7].lamps.push(new BigLamp(160,100));level[7].lamps.push(new Lamp(570,170));
level[7].lamps.push(new FlickerLamp(420,170));
level[7].lamps.push(new deadLamp(1320,170));
level[7].lamps.push(new FlickerLamp(1470,170));
level[7].wallPanels.push(new ForeGround(1100,70, floorHole[0]));
level[7].wallPanels.push(new ForeGround(1300,250, wallFeatures[10]));
level[7].wallPanels.push(new ForeGround(500,200, wallFeatures[10]));
level[7].lamps.push(new BigLampFlicker(1660,100));
level[7].lamps.push(new pulseLight(1700,300));
level[7].lamps[6].addPLight(1650, 300);
level[7].lamps[6].addPLight(1550, 300);
level[7].lamps[6].addPLight(1450, 300);
level[7].lamps[6].addPLight(1350, 300);
level[7].lamps[6].addPLight(1250, 300);
level[7].lamps[6].addPLight(1150, 300);
level[7].lamps[6].addPLight(1050, 300);
level[7].lamps[6].addPLight(950, 300);
level[7].lamps[6].addPLight(850, 300);
level[7].lamps[6].addPLight(750, 300);
level[7].lamps[6].addPLight(650, 300);
level[7].lamps[6].addPLight(550, 300);
level[7].lamps[6].addPLight(450, 300);
level[7].lamps[6].addPLight(350, 300);
level[7].lamps[6].addPLight(250, 300);
level[7].lamps[6].addPLight(200, 300);
level[7].creature.push(LowInsect(820,100,0));
level[7].wallPanels.push(new ForeGround(700,140, wallFeatures[13]));
level[7].wallPanels.push(new ForeGround(600,200, wallFeatures[0]));
level[7].wallPanels.push(new ForeGround(600,100, wallFeatures[0]));
level[7].wallPanels.push(new ForeGround(1200,200, wallFeatures[0]));
level[7].wallPanels.push(new ForeGround(1200,100, wallFeatures[0]));
level[7].wallPanels.push(new ForeGround(620,170, wallFeatures[6]));
level[7].wallPanels.push(new ForeGround(1200,100, foreGPic[6]));
level[7].wallPanels.push(new ForeGround(860,100, foreGPic[6]));
level[7].wallPanels.push(new ForeGround(1120,100, foreGPic[7]));
level[7].wallPanels.push(new ForeGround(460,100, foreGPic[7]));

level[7].items.push(steamTrap(650,220));
level[7].lamps.push(new BigLampDead(710,100));
level[7].lamps.push(new BigLampDead(1010,100));
level[7].exits.push(new Exit(200,200, 8, true, 1550,100))

level[8] = new Level('Still Enroute to Cafeteria')
level[8].wallPanels.push(new Panel(1700,100, panelHall[1], 1,0.4));
level[8].wallPanels.push(new Panel(1600,100, panelHall[1], 1,0.4));
level[8].wallPanels.push(new Panel(1500,100, panelHall[1], 1,0.4));
level[8].wallPanels.push(new Panel(1400,100, panelHall[2], 1,0.4));
level[8].wallPanels.push(new Panel(1300,100, panelHall[0], 1,0.4));
level[8].wallPanels.push(new Panel(1200,100, panelHall[0], 1,0.4));
level[8].wallPanels.push(new Panel(1100,100, panelHall[0], 1,0.4));
level[8].wallPanels.push(new Panel(1000,100, panelHall[0], 1,0.4));
level[8].wallPanels.push(new Panel(900,100, panelHall[2], 1,0.4));
level[8].wallPanels.push(new Panel(1700,200, panelHall[1], 2,0.4));
level[8].wallPanels.push(new Panel(1600,200, panelHall[1], 2,0.4));
level[8].wallPanels.push(new Panel(1500,200, panelHall[1], 2,0.4));
level[8].wallPanels.push(new Panel(1300,200, panelHall[0], 2,0.4));
level[8].wallPanels.push(new Panel(1200,200, panelHall[0], 2,0.4));
level[8].wallPanels.push(new Panel(1100,200, panelHall[0], 2,0.4));
level[8].wallPanels.push(new Panel(1000,200, panelHall[0], 2,0.4));
level[8].wallPanels.push(new Panel(1400,200, panelHall[2], 2,0.4));
level[8].wallPanels.push(new Panel(900,200, panelHall[2], 0,0.4));
level[8].wallPanels.push(new Panel(900,300, panelHall[2], 0,0.4));
level[8].wallPanels.push(new Panel(900,400, panelHall[2], 0,0.4));
level[8].wallPanels.push(new Panel(900,500, panelHall[2], 0,0.4));
level[8].wall.push(createWall(1400,300, 100,30,floor[0]));
level[8].wall.push(createWall(1500,300, 100,30,floor[0]));
level[8].wall.push(createWall(1600,300, 100,30,floor[0]));
level[8].wall.push(createWall(1700,300, 100,30,floor[0]));
level[8].wall.push(createWall(1200,300, 100,30,floor[0]));
level[8].wall.push(createWall(1300,300, 100,30,floor[0]));
level[8].wallPanels.push(new Panel(900,600, panelHall[2], 2,0.4));
level[8].wallPanels.push(new Panel(1000,600, panelHall[0], 2,0.4));
level[8].wallPanels.push(new Panel(1100,600, panelHall[0], 2,0.4));
level[8].wallPanels.push(new Panel(1000,300, panelHall[0], 0,0.4));
level[8].wallPanels.push(new Panel(1000,400, panelHall[0], 0,0.4));
level[8].wallPanels.push(new Panel(1000,500, panelHall[0], 0,0.4));
level[8].wallPanels.push(new Panel(1100,500, panelHall[0], 0,0.4));
level[8].wallPanels.push(new Panel(1100,400, panelHall[0], 0,0.4));
level[8].wallPanels.push(new Panel(1100,300, panelHall[0], 0,0.4));level[8].wallPanels.push(new Panel(1050,600, panelHall[2], 2,0.4));
level[8].wallPanels.push(new Panel(1050,500, panelHall[2], 0,0.4));
level[8].wallPanels.push(new Panel(1050,400, panelHall[2], 0,0.4));
level[8].wallPanels.push(new Panel(1050,300, panelHall[2], 0,0.4));
level[8].wallPanels.push(new Panel(1000,200, panelHall[0], 0,0.4));
level[8].wallPanels.push(new Panel(1100,200, panelHall[0], 0,0.4));
level[8].elevators.push(new CargoElevator(1000,700, 400,400));
level[8].wall.push(createWall(1100,700, 100,30,floor[0]));
level[8].wall.push(createWall(1000,700, 100,30,floor[0]));
level[8].wall.push(createWall(900,700, 100,30,floor[0]));
level[8].wall.push(createWall(800,700, 100,30,floor[0]));
level[8].wall.push(createWall(700,700, 100,30,floor[0]));
level[8].wall.push(createWall(600,700, 100,30,floor[0]));
level[8].wall.push(createWall(500,700, 100,30,floor[0]));
level[8].wall.push(createWall(400,700, 100,30,floor[0]));
level[8].wall.push(createWall(300,700, 100,30,floor[0]));
level[8].wall.push(createWall(200,700, 100,30,floor[0]));
level[8].wall.push(createWall(100,700, 100,30,floor[0]));
level[8].wall.push(createWall(70,600, 30,100,sideWall[2]));
level[8].wall.push(createWall(70,500, 30,100,sideWall[2]));
level[8].wall.push(createWall(70,400, 30,100,sideWall[2]));
level[8].wall.push(createWall(70,300, 30,100,sideWall[2]));
level[8].wall.push(createWall(70,200, 30,100,sideWall[2]));
level[8].wall.push(createWall(70,100, 30,100,sideWall[2]));
level[8].wall.push(createWall(100,90, 100,50,ceiling[0]));
level[8].wall.push(createWall(200,90, 100,50,ceiling[0]));
level[8].wall.push(createWall(300,90, 100,50,ceiling[0]));
level[8].wall.push(createWall(400,90, 100,50,ceiling[0]));
level[8].wall.push(createWall(500,90, 100,50,ceiling[0]));
level[8].wall.push(createWall(600,90, 100,50,ceiling[0]));
level[8].wall.push(createWall(700,90, 100,50,ceiling[0]));
level[8].wall.push(createWall(1000,90, 100,50,ceiling[0]));
level[8].wall.push(createWall(1100,90, 100,50,ceiling[0]));
level[8].wall.push(createWall(1200,90, 100,50,ceiling[0]));
level[8].wall.push(createWall(1400,90, 100,30,floor[3]));
level[8].wall.push(createWall(970,100, 30,100,sideWall[1]));
level[8].wall.push(createWall(970,200, 30,100,sideWall[1]));
level[8].wall.push(createWall(970,300, 30,100,sideWall[5]));level[8].wall.push(createWall(1200,300, 30,100,sideWall[2]));
level[8].wall.push(createWall(1200,400, 30,100,sideWall[2]));
level[8].wall.push(createWall(1200,500, 30,100,sideWall[2]));
level[8].wall.push(createWall(1200,600, 30,100,sideWall[2]));
level[8].wall.push(createWall(1200,300, 30,100,sideWall[5]));
level[8].wall.push(createWall(1200,700, 30,100,sideWall[5]));
level[8].wall.push(createWall(1170,700, 30,100,sideWall[6]));
level[8].wall.push(createWall(1230,300, 30,100,sideWall[6]));
level[8].wall.push(createWall(900,90, 100,30,floor[3]));
level[8].wall.push(createWall(800,90, 100,30,floor[3]));
level[8].wall.push(createWall(1300,90, 100,50,ceiling[0]));
level[8].wall.push(createWall(1500,90, 100,50,ceiling[0]));
level[8].wall.push(createWall(1600,90, 100,50,ceiling[0]));
level[8].wall.push(createWall(1700,90, 100,50,ceiling[0]));
level[8].wall.push(createWall(1800,200, 30,100,sideWall[2]));
level[8].wall.push(createWall(1800,100, 30,100,sideWall[2]));
level[8].wall.push(createWall(1800,300, 30,100,sideWall[5]));
level[8].wall.push(createWall(1800,90, 30,100,sideWall[5]));
level[8].wall.push(createWall(1770,300, 30,100,sideWall[6]));
level[8].wall.push(createWall(70,90, 30,100,sideWall[5]));
level[8].wall.push(createWall(70,700, 30,100,sideWall[5]));
level[8].wall.push(createWall(100,700, 30,100,sideWall[6]));

level[8].wall.push(createWall(100,400, 100,30,floor[0]));
level[8].wall.push(createWall(200,400, 100,30,floor[0]));
level[8].wall.push(createWall(300,400, 100,30,floor[0]));
level[8].wall.push(createWall(400,400, 100,30,floor[0]));
level[8].elevators.push(new elevator(500,700, 0,300));level[8].wall.push(createWall(500,700, 100,30,ceiling[0]));
level[8].wall.push(createWall(600,400, 30,100,sideWall[5]));level[8].wall.push(createWall(600,300, 30,100,sideWall[1]));
level[8].wall.push(createWall(600,200, 30,100,sideWall[1]));
level[8].foreGround.push(new ForeGround(490,300, wallFeatures[1]));
level[8].foreGround.push(new ForeGround(490,200, wallFeatures[1]));
level[8].foreGround.push(new ForeGround(100,300, wallFeatures[0]));
level[8].foreGround.push(new ForeGround(100,200, wallFeatures[0]));
level[8].foreGround.push(new ForeGround(200,200, wallFeatures[0]));
level[8].foreGround.push(new ForeGround(200,300, wallFeatures[0]));
level[8].foreGround.push(new ForeGround(300,300, wallFeatures[0]));
level[8].foreGround.push(new ForeGround(400,300, wallFeatures[0]));
level[8].foreGround.push(new ForeGround(500,300, wallFeatures[0]));
level[8].foreGround.push(new ForeGround(500,200, wallFeatures[0]));
level[8].foreGround.push(new ForeGround(400,200, wallFeatures[0]));
level[8].foreGround.push(new ForeGround(300,200, wallFeatures[0]));
level[8].foreGround.push(new ForeGround(420,280, wallFeatures[6]));
level[8].wallPanels.push(new Panel(100,100, panelHall[1], 1,0.4));
level[8].wallPanels.push(new Panel(200,100, panelHall[1], 1,0.4));
level[8].wallPanels.push(new Panel(300,100, panelHall[1], 1,0.4));
level[8].wallPanels.push(new Panel(400,100, panelHall[1], 1,0.4));
level[8].wallPanels.push(new Panel(500,100, panelHall[1], 1,0.4));
level[8].wallPanels.push(new Panel(100,200, panelHall[1], 0,0.4));
level[8].wallPanels.push(new Panel(300,200, panelHall[1], 0,0.4));
level[8].wallPanels.push(new Panel(500,200, panelHall[0], 0,0.4));
level[8].wallPanels.push(new Panel(500,300, panelHall[0], 0,0.4));
level[8].wallPanels.push(new Panel(500,400, panelHall[2], 0,0.4));
level[8].wallPanels.push(new Panel(500,500, panelHall[2], 0,0.4));
level[8].wallPanels.push(new Panel(500,600, panelHall[2], 2,0.4));
level[8].wallPanels.push(new Panel(200,200, panelHall[0], 0,0.4));
level[8].wallPanels.push(new Panel(400,200, panelHall[0], 0,0.4));
level[8].wallPanels.push(new Panel(200,300, panelHall[0], 2,0.4));
level[8].wallPanels.push(new Panel(400,300, panelHall[0], 2,0.4));
level[8].wallPanels.push(new Panel(100,300, panelHall[1], 2,0.4));
level[8].wallPanels.push(new Panel(300,300, panelHall[1], 2,0.4));
level[8].wall.push(createWall(120,300, 100,30,floor[1]));
level[8].wall.push(createWall(230,300, 100,30,floor[1]));
level[8].wall.push(createWall(190,200, 100,30,floor[1]));
level[8].wall.push(createWall(160,270, 100,30,floor[2]));
level[8].wall.push(createWall(130,270, 100,30,floor[2]));
level[8].wall.push(createWall(150,240, 100,30,floor[2]));
level[8].wall.push(createWall(210,170, 100,30,floor[2]));
level[8].wall.push(createWall(200,140, 100,30,floor[2]));
level[8].wall.push(createWall(290,270, 100,30,floor[2]));
level[8].wall.push(createWall(420,370, 100,30,floor[2]));
level[8].items.push(pistolItem(310,360));level[8].wallPanels.push(new AniDoor(1550,100, 0,0));
level[8].wallPanels.push(new wordWall(1720,170, 'research',4));
level[8].wallPanels.push(new wordWall(1720,180, 'wing',4));level[8].wallPanels.push(new Panel(600,100, panelHall[1], 1,0.4));
level[8].wallPanels.push(new Panel(700,500, panelHall[0], 0,0.4));
level[8].wallPanels.push(new Panel(700,400, panelHall[0], 0,0.4));
level[8].wallPanels.push(new Panel(700,300, panelHall[0], 0,0.4));
level[8].wallPanels.push(new Panel(700,200, panelHall[0], 0,0.4));level[8].wallPanels.push(new Panel(700,100, panelHall[0], 1,0.4));
level[8].wallPanels.push(new Panel(700,600, panelHall[0], 2,0.4));
level[8].wallPanels.push(new Panel(600,600, panelHall[1], 2,0.4));
level[8].wallPanels.push(new Panel(800,600, panelHall[1], 2,0.4));
level[8].wallPanels.push(new Panel(100,600, panelHall[1], 2,0.4));
level[8].wallPanels.push(new Panel(200,600, panelHall[1], 2,0.4));
level[8].wallPanels.push(new Panel(300,600, panelHall[1], 2,0.4));
level[8].wallPanels.push(new Panel(300,500, panelHall[1], 0,0.4));
level[8].wallPanels.push(new Panel(100,500, panelHall[1], 0,0.4));
level[8].wallPanels.push(new Panel(100,400, panelHall[0], 1,0.4));
level[8].wallPanels.push(new Panel(200,400, panelHall[0], 1,0.4));
level[8].wallPanels.push(new Panel(300,400, panelHall[0], 1,0.4));
level[8].wallPanels.push(new Panel(400,400, panelHall[0], 1,0.4));
level[8].wallPanels.push(new Panel(600,200, panelHall[0], 0,0.4));
level[8].wallPanels.push(new Panel(600,400, panelHall[0], 0,0.4));
level[8].wallPanels.push(new Panel(800,400, panelHall[0], 0,0.4));
level[8].wallPanels.push(new Panel(800,200, panelHall[0], 0,0.4));
level[8].wallPanels.push(new Panel(600,300, panelHall[1], 0,0.4));
level[8].wallPanels.push(new Panel(800,300, panelHall[1], 0,0.4));
level[8].wallPanels.push(new Panel(800,100, panelHall[1], 0,0.4));
level[8].wallPanels.push(new Panel(200,500, panelHall[0], 0,0.4));
level[8].wallPanels.push(new Panel(400,500, panelHall[0], 0,0.4));level[8].wallPanels.push(new Panel(400,600, panelHall[0], 2,0.4));
level[8].wallPanels.push(new Panel(600,500, panelHall[0], 0,0.4));
level[8].wallPanels.push(new Panel(800,500, panelHall[0], 0,0.4));

level[8].wallPanels.push(new fan(220,120, 0.1,1,0));
level[8].wallPanels.push(new fan(420,120, 0.2,1,0));
level[8].wallPanels.push(new AniDoor(150,500, 0,1));
level[8].wallPanels.push(new wordWall(320,570, 'cafeteria',4));
level[8].wallPanels.push(new ForeGround(800,300, wallFeatures[9]));
level[8].wallPanels.push(new ForeGround(800,600, wallFeatures[9]));
level[8].wallPanels.push(new ForeGround(100,200, wallFeatures[9]));
level[8].wallPanels.push(new ForeGround(750,450, wallFeatures[10]));
level[8].wallPanels.push(new ForeGround(600,500, wallFeatures[10]));
level[8].wallPanels.push(new ForeGround(750,200, wallFeatures[10]));
level[8].wallPanels.push(new ForeGround(450,300, wallFeatures[10]));
level[8].wallPanels.push(new ForeGround(400,650, wallFeatures[10]));
level[8].wallPanels.push(new ForeGround(860,600, wallFeatures[22]));
level[8].wallPanels.push(new ForeGround(600,600, wallFeatures[22]));
level[8].wallPanels.push(new ForeGround(900,600, wallFeatures[12]));
level[8].wallPanels.push(new ForeGround(900,500, wallFeatures[12]));
level[8].wallPanels.push(new ForeGround(900,400, wallFeatures[12]));
level[8].wallPanels.push(new ForeGround(900,300, wallFeatures[12]));
level[8].wallPanels.push(new ForeGround(900,200, wallFeatures[12]));
level[8].wallPanels.push(new ForeGround(900,100, wallFeatures[12]));
level[8].wallPanels.push(new ForeGround(800,100, pipes[2]));level[8].wallPanels.push(new ForeGround(700,100, pipes[4]));
level[8].wallPanels.push(new ForeGround(600,100, pipes[4]));
level[8].wallPanels.push(new ForeGround(500,100, pipes[4]));
level[8].wallPanels.push(new ForeGround(400,100, pipes[4]));
level[8].wallPanels.push(new ForeGround(300,100, pipes[0]));
level[8].wallPanels.push(new ForeGround(300,200, pipes[2]));
level[8].wallPanels.push(new ForeGround(200,200, pipes[4]));
level[8].wallPanels.push(new ForeGround(100,200, pipes[4]));
level[8].foreGround.push(new ForeGround(100,400, pipes[4]));
level[8].foreGround.push(new ForeGround(200,400, pipes[4]));
level[8].foreGround.push(new ForeGround(300,400, pipes[4]));
level[8].foreGround.push(new ForeGround(400,400, pipes[1]));
level[8].foreGround.push(new ForeGround(400,500, wallFeatures[12]));
level[8].foreGround.push(new ForeGround(400,600, wallFeatures[12]));
level[8].wallPanels.push(new ForeGround(1520,220, wallFeatures[28]));
level[8].wallPanels.push(new ForeGround(320,620, wallFeatures[28]));
level[8].wallPanels.push(new fan(120,520, 0.5,0,1));
level[8].wallPanels.push(new fan(120,620, 0.5,0,1));
level[8].wallPanels.push(new wordTicker(200,510, 'OPEN'));
level[8].lamps.push(new BigLamp(210,530));
level[8].lamps.push(new pulseLight(1650,300));
level[8].lamps[1].addPLight(1600, 300);
level[8].lamps[1].addPLight(1550, 300);
level[8].lamps[1].addPLight(1500, 300);
level[8].lamps[1].addPLight(1450, 300);
level[8].lamps[1].addPLight(1400, 300);
level[8].lamps[1].addPLight(1350, 300);
level[8].lamps[1].addPLight(1300, 300);
level[8].lamps[1].addPLight(1250, 300);
level[8].lamps[1].addPLight(1210, 300);
level[8].lamps.push(new pulseLight(1100,700));
level[8].lamps[2].addPLight(1050, 700);
level[8].lamps[2].addPLight(1000, 700);
level[8].lamps[2].addPLight(950, 700);
level[8].lamps[2].addPLight(900, 700);
level[8].lamps[2].addPLight(850, 700);
level[8].lamps[2].addPLight(800, 700);
level[8].lamps[2].addPLight(750, 700);
level[8].lamps[2].addPLight(700, 700);
level[8].lamps[2].addPLight(650, 700);
level[8].lamps[2].addPLight(600, 700);
level[8].lamps[2].addPLight(550, 700);
level[8].lamps[2].addPLight(500, 700);
level[8].lamps[2].addPLight(450, 700);
level[8].lamps[2].addPLight(400, 700);
level[8].lamps[2].addPLight(350, 700);
level[8].lamps[2].addPLight(300, 700);
level[8].lamps[2].addPLight(250, 700);

level[8].lamps.push(new BigLamp(1610,130));
level[8].wallPanels.push(new wordTicker(1600,110, 'OPEN'));
level[8].wallPanels.push(new ForeGround(1400,200, wallFeatures[12]));
level[8].wallPanels.push(new ForeGround(1400,100, wallFeatures[12]));
level[8].creature.push(MedReptile(1410,110,1));
level[8].items.push(messageTrap(1590,210, blankPic, 'PLEASE!', "Don't shoot!~~ I'm like you!.. I mean I used to be. ~~My legs started to change, now theyre like this.  ~~Please don't leave here like this.  Please?"));

level[8].lamps.push(new Lamp(870,520));
level[8].lamps.push(new FlickerLamp(470,520));
level[8].rLights.push(new staticLight(500,300, 20));
level[8].rLights.push(new staticLight(500,200, 20));
level[8].rLights.push(new staticLight(500,400, 20));
level[8].rLights.push(new staticLight(600,400, 20));
level[8].rLights.push(new staticLight(600,300, 20));
level[8].rLights.push(new staticLight(600,200, 20));
level[8].rLights.push(new staticLight(500,500, 20));
level[8].rLights.push(new staticLight(600,500, 20));
level[8].rLights.push(new staticLight(600,600, 20));
level[8].rLights.push(new staticLight(500,600, 20));
level[8].rLights.push(new staticLight(1200,300, 20));
level[8].rLights.push(new staticLight(1200,200, 20));
level[8].rLights.push(new staticLight(1200,100, 20));
level[8].rLights.push(new staticLight(1000,300, 20));
level[8].rLights.push(new staticLight(1000,200, 20));
level[8].rLights.push(new staticLight(1000,100, 20));
level[8].rLights.push(new staticLight(1000,700, 20));
level[8].rLights.push(new staticLight(1000,600, 20));
level[8].rLights.push(new staticLight(1000,500, 20));
level[8].rLights.push(new staticLight(1200,500, 20));
level[8].rLights.push(new staticLight(1200,600, 20));
level[8].rLights.push(new staticLight(1200,700, 20));
level[8].foreGround.push(new ForeGround(1300,200, wallFeatures[12]));
level[8].foreGround.push(new ForeGround(1300,100, wallFeatures[12]));
level[8].foreGround.push(new ForeGround(1100,400, pipes[4]));
level[8].foreGround.push(new ForeGround(1000,400, pipes[4]));
level[8].foreGround.push(new ForeGround(900,400, pipes[4]));
level[8].foreGround.push(new ForeGround(800,400, pipes[4]));
level[8].foreGround.push(new ForeGround(700,400, pipes[0]));
level[8].foreGround.push(new ForeGround(700,500, wallFeatures[12]));
level[8].foreGround.push(new ForeGround(700,600, wallFeatures[12]));
level[8].lamps.push(new waterDrop(750,600));
level[8].lamps.push(new waterDrop(1100,450));
level[8].wallPanels.push(new Monitor(1200,150, 'evac safe-zone cafeteria',0));
level[8].wallPanels.push(new ForeGround(1230,200, wallFeatures[22]));
level[8].lamps.push(new deadLamp(1320,170));
level[8].lamps.push(new deadLamp(1370,170));

level[8].exits.push(new Exit(1650,200, 7, true, 100,100))


level[9] = new Level('Cafeteria')
level[9].wallPanels.push(new Panel(800,1000, panelHall[1], 2,0.7));
level[9].wallPanels.push(new Panel(900,1000, panelHall[1], 2,0.7));
level[9].wallPanels.push(new Panel(1000,1000, panelHall[2], 2,0.7));
level[9].wallPanels.push(new Panel(700,1000, panelHall[2], 2,0.7));
level[9].wallPanels.push(new Panel(600,1000, panelHall[1], 2,0.7));
level[9].wallPanels.push(new Panel(500,1000, panelHall[1], 2,0.7));
level[9].wallPanels.push(new Panel(1100,1000, panelHall[1], 2,0.7));
level[9].wallPanels.push(new Panel(1200,1000, panelHall[1], 2,0.7));
level[9].wallPanels.push(new Panel(500,900, panelHall[1], 0,0.7));
level[9].wallPanels.push(new Panel(600,900, panelHall[1], 0,0.7));
level[9].wallPanels.push(new Panel(800,900, panelHall[1], 0,0.7));
level[9].wallPanels.push(new Panel(900,900, panelHall[1], 0,0.7));
level[9].wallPanels.push(new Panel(1100,900, panelHall[1], 0,0.7));
level[9].wallPanels.push(new Panel(1200,900, panelHall[1], 0,0.7));
level[9].wallPanels.push(new Panel(500,800, panelHall[1], 0,0.7));
level[9].wallPanels.push(new Panel(600,800, panelHall[1], 0,0.7));
level[9].wallPanels.push(new Panel(800,800, panelHall[1], 0,0.7));
level[9].wallPanels.push(new Panel(900,800, panelHall[1], 0,0.7));
level[9].wallPanels.push(new Panel(1100,800, panelHall[1], 0,0.7));
level[9].wallPanels.push(new Panel(1200,800, panelHall[1], 0,0.7));
level[9].wallPanels.push(new Panel(500,700, panelHall[0], 1,0.7));
level[9].wallPanels.push(new Panel(600,700, panelHall[0], 1,0.7));
level[9].wallPanels.push(new Panel(700,700, panelHall[0], 1,0.7));
level[9].wallPanels.push(new Panel(800,700, panelHall[0], 1,0.7));
level[9].wallPanels.push(new Panel(900,700, panelHall[0], 1,0.7));
level[9].wallPanels.push(new Panel(1000,700, panelHall[0], 1,0.7));
level[9].wallPanels.push(new Panel(1100,700, panelHall[0], 1,0.7));
level[9].wallPanels.push(new Panel(1200,700, panelHall[0], 1,0.7));
level[9].wallPanels.push(new Panel(1300,700, panelHall[0], 1,0.7));
level[9].wallPanels.push(new Panel(400,700, panelHall[0], 1,0.7));
level[9].wallPanels.push(new Panel(400,800, panelHall[0], 0,0.7));
level[9].wallPanels.push(new Panel(400,900, panelHall[0], 0,0.7));
level[9].wallPanels.push(new Panel(1300,800, panelHall[0], 0,0.7));
level[9].wallPanels.push(new Panel(1300,900, panelHall[0], 0,0.7));
level[9].wallPanels.push(new Panel(1000,800, panelHall[0], 0,0.7));
level[9].wallPanels.push(new Panel(700,800, panelHall[0], 0,0.7));
level[9].wallPanels.push(new Panel(400,1000, panelHall[0], 2,0.7));
level[9].wallPanels.push(new Panel(300,1000, panelHall[0], 2,0.7));
level[9].wallPanels.push(new Panel(1300,1000, panelHall[0], 2,0.7));
level[9].wallPanels.push(new Panel(1400,1000, panelHall[0], 2,0.7));
level[9].wallPanels.push(new Panel(1000,900, panelHall[2], 0,0.7));
level[9].wallPanels.push(new Panel(700,900, panelHall[2], 0,0.7));
level[9].wallPanels.push(new AniDoor(800,900, 0,1));
level[9].wallPanels.push(new ForeGround(700,1000, wallFeatures[12]));
level[9].wallPanels.push(new ForeGround(700,900, wallFeatures[12]));
level[9].wallPanels.push(new ForeGround(1000,1000, wallFeatures[12]));
level[9].wallPanels.push(new ForeGround(1000,900, wallFeatures[12]));
level[9].wallPanels.push(new ForeGround(600,1000, wallFeatures[9]));
level[9].wallPanels.push(new ForeGround(1100,800, wallFeatures[9]));
level[9].wallPanels.push(new ForeGround(450,950, wallFeatures[10]));
level[9].wallPanels.push(new ForeGround(900,750, wallFeatures[10]));
level[9].wallPanels.push(new ForeGround(1300,850, wallFeatures[10]));
level[9].wallPanels.push(new fan(820,820, 0.1,1,1));
level[9].wallPanels.push(new fan(920,820, 0.3,1,1));
level[9].wallPanels.push(new fan(1220,920, 0.08,1,0));
level[9].wallPanels.push(new fan(520,920, 0.15,1,0));



level[9].wallPanels.push(new ForeGround(1000,800, pipes[0]));
level[9].wallPanels.push(new ForeGround(700,800, pipes[1]));
level[9].wallPanels.push(new ForeGround(1100,800, pipes[4]));
level[9].wallPanels.push(new ForeGround(1200,800, pipes[4]));
level[9].wallPanels.push(new ForeGround(1300,800, pipes[4]));
level[9].wallPanels.push(new ForeGround(600,800, pipes[4]));
level[9].wallPanels.push(new ForeGround(500,800, pipes[4]));
level[9].wallPanels.push(new ForeGround(1120,1020, wallFeatures[28]));
level[9].wallPanels.push(new ForeGround(1220,1020, wallFeatures[29]));
level[9].wallPanels.push(new ForeGround(520,1020, wallFeatures[29]));
level[9].lamps.push(new Lamp(820,930));
level[9].lamps.push(new FlickerLamp(970,930));
level[9].wallPanels.push(new Panel(1500,1000, panelHall[1], 2,0.7));
level[9].wallPanels.push(new Panel(1600,1000, panelHall[1], 2,0.7));
level[9].wallPanels.push(new Panel(1700,1000, panelHall[1], 2,0.7));
level[9].wallPanels.push(new Panel(1800,1000, panelHall[1], 2,0.7));
level[9].wallPanels.push(new Panel(200,1000, panelHall[1], 2,0.7));
level[9].wallPanels.push(new Panel(100,1000, panelHall[1], 2,0.7));
level[9].wallPanels.push(new Panel(1400,900, panelHall[1], 0,0.7));
level[9].wallPanels.push(new Panel(1500,900, panelHall[1], 0,0.7));level[9].wallPanels.push(new Panel(1700,900, panelHall[1], 0,0.7));
level[9].wallPanels.push(new Panel(1800,900, panelHall[2], 0,0.7));
level[9].wallPanels.push(new ForeGround(1800,1000, pipes[3]));
level[9].wallPanels.push(new ForeGround(1800,900, wallFeatures[12]));
level[9].wallPanels.push(new ForeGround(1800,1000, wallFeatures[0]));
level[9].wallPanels.push(new ForeGround(1800,900, wallFeatures[0]));
level[9].wallPanels.push(new ForeGround(1700,1000, wallFeatures[2]));
level[9].wallPanels.push(new ForeGround(1700,900, wallFeatures[2]));
level[9].wallPanels.push(new ForeGround(1730,1000, foreGPic[1]));
level[9].wallPanels.push(new ForeGround(1630,1000, foreGPic[10]));
level[9].wallPanels.push(new ForeGround(1530,1000, foreGPic[10]));
level[9].wallPanels.push(new ForeGround(1430,1000, foreGPic[10]));
level[9].wallPanels.push(new ForeGround(1330,1000, foreGPic[0]));
level[9].wallPanels.push(new fan(1520,920, 0.8,0,1));
level[9].wallPanels.push(new fan(1420,920, 0.8,0,1));
level[9].wallPanels.push(new fan(1720,920, 0.05,0,1));
level[9].wallPanels.push(new ForeGround(1340,930, wallFeatures[31]));
level[9].wallPanels.push(new ForeGround(1720,930, wallFeatures[31]));
level[9].lamps.push(new BigLamp(1410,900));level[9].lamps.push(new BigLampFlicker(1710,900));
level[9].wallPanels.push(new Panel(1800,800, panelHall[2], 0,0.7));
level[9].wallPanels.push(new Panel(1800,700, panelHall[2], 1,0.7));
level[9].wallPanels.push(new Panel(1400,700, panelHall[0], 1,0.7));
level[9].wallPanels.push(new Panel(1500,700, panelHall[0], 1,0.7));
level[9].wallPanels.push(new Panel(1600,700, panelHall[0], 1,0.7));
level[9].wallPanels.push(new Panel(1700,700, panelHall[0], 1,0.7));
level[9].wallPanels.push(new Panel(1600,900, panelHall[0], 0,0.7));
level[9].wallPanels.push(new Panel(1600,800, panelHall[0], 0,0.7));
level[9].wallPanels.push(new Panel(1400,800, panelHall[1], 0,0.7));
level[9].wallPanels.push(new Panel(1500,800, panelHall[1], 0,0.7));
level[9].wallPanels.push(new Panel(1700,800, panelHall[1], 0,0.7));
level[9].wallPanels.push(new ForeGround(1400,800, pipes[4]));
level[9].wallPanels.push(new ForeGround(1500,800, pipes[4]));
level[9].wallPanels.push(new ForeGround(1600,800, pipes[4]));
level[9].wallPanels.push(new ForeGround(1700,800, pipes[4]));
level[9].wallPanels.push(new ForeGround(1800,800, pipes[1]));
level[9].lamps.push(new pulseLight(1050,1100));
level[9].lamps[4].addPLight(1050, 1000);
level[9].lamps[4].addPLight(1050, 900);
level[9].lamps[4].addPLight(1100, 850);
level[9].lamps[4].addPLight(1200, 850);
level[9].lamps[4].addPLight(1300, 850);
level[9].lamps[4].addPLight(1400, 850);
level[9].lamps[4].addPLight(1500, 850);
level[9].lamps[4].addPLight(1600, 850);
level[9].lamps[4].addPLight(1700, 850);
level[9].lamps[4].addPLight(1800, 850);
level[9].lamps[4].addPLight(1850, 900);
level[9].lamps[4].addPLight(1850, 1000);
level[9].lamps[4].addPLight(1890, 1050);

level[9].wallPanels.push(new ForeGround(1140,1000, wallFeatures[30]));
level[9].wallPanels.push(new ForeGround(1090,1000, wallFeatures[30]));
level[9].wallPanels.push(new ForeGround(1000,1000, wallFeatures[0]));
level[9].wallPanels.push(new ForeGround(1000,900, wallFeatures[0]));
level[9].wallPanels.push(new ForeGround(700,1000, wallFeatures[0]));
level[9].wallPanels.push(new ForeGround(700,900, wallFeatures[0]));
level[9].wallPanels.push(new ForeGround(1040,1000, wallFeatures[30]));
level[9].wallPanels.push(new ForeGround(1320,970, wallFeatures[16]));

level[9].foreGround.push(new ForeGround(1190,900, wallFeatures[32]));
level[9].foreGround.push(new ForeGround(930,900, wallFeatures[32]));
level[9].foreGround.push(new ForeGround(590,900, wallFeatures[32]));
level[9].foreGround.push(new ForeGround(330,900, wallFeatures[32]));
level[9].wallPanels.push(new ForeGround(1720,860, foreGPic[7]));
level[9].wallPanels.push(new ForeGround(1200,860, foreGPic[6]));
level[9].wallPanels.push(new ForeGround(1600,930, wallFeatures[7]));
level[9].wallPanels.push(new Panel(100,900, panelHall[1], 0,0.7));
level[9].wallPanels.push(new Panel(200,900, panelHall[1], 0,0.7));
level[9].wallPanels.push(new Panel(300,900, panelHall[1], 0,0.7));
level[9].wallPanels.push(new Panel(300,800, panelHall[0], 0,0.7));
level[9].wallPanels.push(new Panel(200,800, panelHall[0], 0,0.7));
level[9].wallPanels.push(new Panel(100,800, panelHall[0], 0,0.7));
level[9].wallPanels.push(new Panel(100,700, panelHall[0], 1,0.7));
level[9].wallPanels.push(new Panel(300,700, panelHall[0], 1,0.7));
level[9].wallPanels.push(new Panel(200,700, panelHall[2], 1,0.7));
level[9].wallPanels.push(new ForeGround(400,800, pipes[4]));
level[9].wallPanels.push(new ForeGround(300,800, pipes[4]));
level[9].wallPanels.push(new ForeGround(200,800, pipes[3]));
level[9].wallPanels.push(new ForeGround(200,700, wallFeatures[12]));
level[9].lamps.push(new pulseLight(750,1100));
level[9].lamps[5].addPLight(750, 1000);
level[9].lamps[5].addPLight(750, 900);
level[9].lamps[5].addPLight(700, 850);
level[9].lamps[5].addPLight(600, 850);
level[9].lamps[5].addPLight(500, 850);
level[9].lamps[5].addPLight(400, 850);
level[9].lamps[5].addPLight(300, 850);
level[9].lamps[5].addPLight(250, 800);
level[9].lamps[5].addPLight(250, 700);
level[9].wallPanels.push(new AniDoor(100,900, 0,0));
level[9].lamps.push(new waterDrop(1100,860));
level[9].lamps.push(new waterDrop(740,900));
level[9].lamps.push(new waterDrop(300,860));
level[9].lamps.push(new sparker(1750,950));
level[9].wallPanels.push(new ForeGround(320,920, wallFeatures[28]));
level[9].wallPanels.push(new ForeGround(260,910, wallFeatures[8]));
level[9].lamps.push(new BigLampDead(310,900));
level[9].lamps.push(new BigLampFlicker(610,900));
level[9].lamps.push(new Lamp(420,920));
level[9].lamps.push(new Lamp(120,930));
level[9].lamps.push(new deadLamp(270,930));
level[9].lamps.push(new sparker(270,940));
level[9].wall.push(createWall(1900,1000, 30,100,sideWall[2]));
level[9].wall.push(createWall(1900,900, 30,100,sideWall[0]));
level[9].wall.push(createWall(1900,990, 30,100,sideWall[6]));
level[9].wall.push(createWall(1900,800, 30,100,sideWall[0]));
level[9].wall.push(createWall(1900,700, 30,100,sideWall[0]));
level[9].wall.push(createWall(70,1000, 30,100,sideWall[2]));
level[9].wall.push(createWall(70,900, 30,100,sideWall[2]));
level[9].wall.push(createWall(70,800, 30,100,sideWall[2]));
level[9].wall.push(createWall(70,700, 30,100,sideWall[2]));
level[9].wall.push(createWall(200,700, 100,30,floor[3]));
level[9].wall.push(createWall(100,700, 100,50,ceiling[0]));
level[9].wall.push(createWall(300,700, 100,50,ceiling[0]));
level[9].wall.push(createWall(400,700, 100,50,ceiling[0]));
level[9].wall.push(createWall(500,700, 100,50,ceiling[0]));
level[9].wall.push(createWall(600,700, 100,50,ceiling[0]));
level[9].wall.push(createWall(700,700, 100,50,ceiling[0]));
level[9].wall.push(createWall(800,700, 100,30,floor[3]));
level[9].wall.push(createWall(900,700, 100,30,floor[3]));
level[9].wall.push(createWall(1000,700, 100,50,ceiling[0]));
level[9].wall.push(createWall(1100,700, 100,50,ceiling[0]));
level[9].wall.push(createWall(1200,700, 100,50,ceiling[0]));
level[9].wall.push(createWall(1300,700, 100,50,ceiling[0]));
level[9].wall.push(createWall(1400,700, 100,50,ceiling[0]));
level[9].wall.push(createWall(1500,700, 100,50,ceiling[0]));
level[9].wall.push(createWall(1600,700, 100,50,ceiling[0]));
level[9].wall.push(createWall(1700,700, 100,50,ceiling[0]));
level[9].wall.push(createWall(1800,700, 100,50,ceiling[0]));
level[9].wall.push(createWall(1900,700, 30,100,sideWall[5]));
level[9].wall.push(createWall(70,700, 30,100,sideWall[5]));
level[9].wall.push(createWall(70,1100, 30,100,sideWall[5]));
level[9].wall.push(createWall(100,1100, 100,30,floor[0]));
level[9].wall.push(createWall(200,1100, 100,30,floor[0]));
level[9].wall.push(createWall(300,1100, 100,30,floor[0]));
level[9].wall.push(createWall(400,1100, 100,30,floor[0]));
level[9].wall.push(createWall(500,1100, 100,30,floor[0]));
level[9].wall.push(createWall(600,1100, 100,30,floor[0]));
level[9].wall.push(createWall(700,1100, 100,30,floor[0]));
level[9].wall.push(createWall(800,1100, 100,30,floor[0]));
level[9].wall.push(createWall(900,1100, 100,30,floor[0]));
level[9].wall.push(createWall(1000,1100, 100,30,floor[0]));
level[9].wall.push(createWall(1100,1100, 100,30,floor[0]));
level[9].wall.push(createWall(1200,1100, 100,30,floor[0]));
level[9].wall.push(createWall(1300,1100, 100,30,floor[0]));
level[9].wall.push(createWall(1400,1100, 100,30,floor[0]));
level[9].wall.push(createWall(1500,1100, 100,30,floor[0]));
level[9].wall.push(createWall(1600,1100, 100,30,floor[0]));
level[9].wall.push(createWall(1700,1100, 100,30,floor[0]));
level[9].wall.push(createWall(1800,1100, 100,30,floor[0]));
level[9].wall.push(createWall(1900,1100, 30,100,sideWall[5]));
level[9].wall.push(createWall(1870,1100, 30,100,sideWall[6]));
level[9].wall.push(createWall(100,1100, 30,100,sideWall[6]));

level[9].creature.push(MedInsect(400,900,0));
level[9].creature.push(Bug(550,900,0));
level[9].creature.push(LowInsect(1440,900,0));
level[9].creature.push(Maggot(1620,900,0));
level[9].wallPanels.push(new talker(900,930,'Welcome to. cafeteria.','test'));
level[9].wallPanels.push(new Monitor(1100,900, 'MENU offline offline offline offline',0));level[9].wallPanels.push(new Monitor(600,900, 'we value our employees - help is on the way',0));level[9].wallPanels.push(new wordWall(810,920, 'cafeteria',5));
level[9].wallPanels.push(new ForeGround(950,900, wallFeatures[3]));
level[9].wallPanels.push(new ForeGround(1450,980, wallFeatures[3]));
level[9].wallPanels.push(new ForeGround(1550,980, wallFeatures[3]));
level[9].wallPanels.push(new ForeGround(1650,980, wallFeatures[3]));


})
/*
SideScroller Plan
Takes place in series of tunnels

Jump to dodge attacks
Small jumping puzzles to climb stuff, crates, levels
Find keys to progress (usually off bodies)
Find logs to discover purpose of lab, use of mutation goo

Items: health, mutation goo

All vs other monsters / zombie like characters
  --Small/med/large mutant animal
  --mutant humans
  --Live security
  --Security Bots
  
  
Extra animation objects:
  --Water drip
  --Sparks
  --Cameras
  --
  
Extra sound objects
-All based on distance to character
Vents:
  --Scratching
  --metal clanking/buckling
  --multi voice scream
  --muffled gunfire

Doors:
  --Wet Thumping

  
  
Specials
--Insect:
	-High armor, low hits
	-Stick/climb walls
	
--Reptile:
	-Medium hits & armor
	-flight
	
--Sea Creature:
	-High Hits, low armor
	-High speed, high jump

Levels:

Enemies:
3 frame for small non-composite units (spearate class? for simplness)

		Human varieties:  scientist, guard (male and female, mech suit)
			--scientist 40/40 fight or flight in terror, 20% cower
			-- if high level can kill them for health

several 3 frame torsos for all composites
-- Maggot
--snake
--insect infested human (headless?) x 5
-- human x gator


Death scenes:
Must be code based, move parts as they are standard
--torso go down
--legs fold?  could really use a legs half bend frame
--arm are weapon / melee just angle down, follow drop

Player:
Total Frames: 9 walking, 1 stand, 1 jump, 2 attack
6 frames special attack
3 x 3 frames advanced locomotion vertical
9 frames animation for insect walking

Insect: Queen Insect style
Reptile: Dragon style

Actions:
-Walk : 2 Frames with Modulo (3 frame total)
-Stand : 1 frame
-Jump : 1 Frame
-Attack
 --All are 2 frame
  -Basic : Punch
  -Advanced:
	--General Rules: Punch style animation for all, ranged attack for insect, melee for the others
     --Insect : Venom Ranged Dart
	 --Reptile : Venom Claw
	 --Sea Creature: Tentacle Lash
    --Special: 2 frames each for the attack
-Specials
	--Insect
	  --Vertical walk, just vertical legs, all else the same (3 frames)
	  
	--Reptile
	  --Wing flap (3 frames)
	
Art Layer to do list
People
Scientist
Civilian (tones various)


Character


Monsters
Maggot torso
Gangle insect torso
Gangle insect arm

Pincer arm (several)
Spider legs


General
Clothes: Lab coat, srubs, military uniform
Eliminate cround frame entirely
use sy to determine whether to draw hair falling (frame jump) or hair down (frame 1 the second)




Story
Title: Project 6th Day

UASA - United Americas Space Agency

Setting: Year 2178

 Unregistered transport : UASV Genesis		(United America Service Vessel)
Location 1.8 Light years from regulated territory

Mission: R&D of  customized slave race bound for mining operations in environments hostile to unmodified human life in tau ceti system.
Public Stance on off world resource exploitation: All operations conducted by advanced AI robotic systems.
Reality: AI based systems unable to cope with unstable environments, too much intervention required to maintain operations
Solution: Locally grown workers using native materials (basic hydrocarbons etc) provide labor at no additional cost.
	No safety requirements = max productivity
	No risk of rebellion / work stoppage as freedom is unknown concept to workers.
	
Story begins:

Scientist conducting psych test (emapthy/ personality test) to modified worker prototype.
	Result: 1 answer, second question results in scientist death and escape of prototype.
	
Player begins
Unknown subject awakens in empty lab room.  Appears to have been there for some time (blankets and food lay scattered, signs of long term neglect)


PLayer moves through various hallways of steel walls, highly technical, but highly damaged
Various creatures roam areas, clues from data logs show what has happened in a general sense (location not shown)
Sounds depict ongoing deterioration of situation
Mutations begin in player character (reptile/insect chosen at random)
After some mutations hear message from evil queen
	--> some operations type stuff
	--> later directed at player (instructions to get to places and supplies / further mutations

	**Character evil queen: Mutation provides difference from baseline humans therfore is superior destiny
	** Initially supports player and vice versa
	Mini missions from queen:
	
	-Get weapons
	-
	-Kill captured scientists
	

Eventually mid game boss (security forces), high level mutant/humans in its own environment
Win - >  Find window for first time.  Zoom out see ship get ship details

After rejection of final mission, evil queen turns on player (despite being generous forgiving species difference)
Player must kill evil queen


End boss is original test subject in full insect queen / full reptile mode
If insect armed with pistol and swarm ability
Else reptile, flight and smg

Boss defeated by destroying environment: in particular engine system components--> ship begins to crash
Escape to Escape pods battling humans and monsters alike


Awaken to crashed pod overlooking advanced city/colony in ruins with ship crashed inside.  
Current fighting in the distance as mutants swarm colony as world is reborn in violence.


Features:
Alliances between animal types that will change between / during missions
All creatures subject to alliances for target acquisition


to do list:
patch up insect healing tentacle
shotgun
laser sight on fire arms
special healing abilities

more lamps
foreground stuff
wall features

level constructor and implementation

human body type
	-type zero: scientist (armed with scalpel) and glasses!
	-type one: technician
	-type two: generic light security
	-type three: soldier

auto move for creatures

bug:

bug player get skewered on floors: this is not easlity fixable, obstaces must be
100 by 100, not the 30 that floors are, make cool picture of broken stuff as side wall 
to get the 100 dimension and mak it a part of hoels in floors if need be
====> seems to solve it just fine, test it again though

start the level creating tool

male frame: match to female positions

human class
mech class? how handle turrets? it needs to be a creature of some kind

make the ally relations matrix, implement quick via a function 2 parameters return is ally or not

make accuracy rating for weapons, use random generator to get fire: to miss a bit
--> up valeu based on distance

make function that does the firing calculation from ptA to ptB return what gets hit
--> use to determine ai behaviors (like stop firing through floors, and if y's similar enough, charge!
ai update: ability to switch from melee back to ranged weapons
--> search pattern when no target found



make acid spray do damage over time
AI update: use special weapons too



trap: large creature on wall result in spawn of matching creature

death resutls in drop of weapon
each creature need list of weapon functions for adding weapons so we have pickup pistol: marine get marine pistol, mutant get regular
various cloths for as part of final layer (legs?)

Marine melee: shock fist (non transferable)

Make dead creature drop inventory

===========================================Editor

divide panel thing into strict background / walls
add lights (edit option needs ability to draw text only on button
add random features (doors, signs etc)
--> may need a feature array layer for cutscenes and levels

ability to mark start and end

dont touch the index value in auto format (Will ruin going back and forth for levels)

make a character maker



==================================================




/////////////		LEVELS
Chapter 1
L1-Exit room
L2-hallway is not damaged, just empty
L3-exam lab, power is out, very abandoned
L4- find scientist, needs you to kill a creature blocking a door
-Player can kill scientist for a bonus medkit?
L5-In large area, many crates stacked, some doors still locked (insect queen didn't let reptiles out)
	-Scientist tries to fight creature, loses.  Player kills creature, gets keys to cells (player allies released) on next level
	
	
L6- level start with 3 allies, move through two decks find cafeteria (propaganda posters up explaining why mutants exist)
-Encounter 2 other monsters, find a pair of pistols and a med kit
 
L7- another lab, find another ally, and it is mutated (please dont shoot! message)
-Player learns of mutation
- Down a deck find another mutant or 3, watch as new mutant is more powerful
- Down another deck near exit after killing enemy find a trap triggers appearance of ally that needed help

L8- random member of group mutate a bit, player get new torso and health upgrade

L9- player gets wings
-player must fly to reach next area/escape trap, allies are left behind and are killed
-lots of insects, 1 much higher level, all armed with melee attack

L10 - 14- player starts climb up mutation ladder (legs etc)
- levels are various now, more labs, cargo areas, hallways/decks, find occasional scientists
- Insect kills are frequent, a few pistol armed insects
- various low - mid level allies arrive throughout

L15 - Find a swarm of insects charging marines and scientists 1 deck below, all are killed, get pile of weapons and meds
-Messages heard from scientists about enemy queen taking over
-at end find out game in on a ship
-Setting random decks

L16- Find a scientist talking to another about events and plan of the ship to reach colony

L17- start seeing bloody "leaving!" messages from enemy queen

L18- find the bridge of the ship, is on auto and is messy, find message from queen 
offering to join toegther to escape ship

Option A- Reject offer

L19- Blow up engineering where queen resides

L20- Get to escape pods!
Ship crashes in city, mutants swarm out and player looks out from door of landed pod


Option B- Accept offer

L19- Find and kill escaping scientists and marines

L20 - Wipe out final battalion of marines holding the cargo area with massive doors

Ship lands safely and all mutants swarm out inside an unprepared space port city
 
 Note:
 Make traps have: before and after pic, if same teleport away
 - make most story info stuff appear from memo pads left through out
 
 
 Make ally rule if no target, try to reach player if nearby?
Level function go in separate files?
Reptile upgrades include scale armor, level 1 nd 2 complete, leve 3 = lev2 legs in scal (in shorts), lev 4 crzy upgrade legs in scale
make leader attricute for creatures, all non leaders use leader targetting / try to protect the leader of same type



Make all mutant creature up max health and melee/special damages
Each kill grants experience, once experience is up, level up makes a random mutation
Experience growth level, make some creature not upgradable



features:

More general computer terminals
--> make animated like word wall
Massive monitor screens

male surgical mask copy, does not match female
gas mask

scientist stay unarmed
--> make a special class of scientist with separate leg animation to remove to walk arm
--> make hazmat helmet


Creatures need faces


need first tiny creature



make spawner object, creates units on per time basis

fix AI, if cant reach enemy, can't shoot enemy OR at x but super far y under no path avail conditions, remove enemy from list
---> in testing, most ais stop jittering, but some continue doing their best, looks like
		increase deadzone in motion left/right and make jitter look like a patrol
		
ignore deadzone fr allied followers, its fine as is.

draw: trash can
	vent cover
	server machine(use midified static screen genreator for sever lights
	tables and other cafeteria stuff-> use end peices from desks, make textured midsection
									-> make the sneeze guard buffet style
									-> dishes stack
									coffee urn
									trash piles for the floor
	posters
	otherside of door art?  general hallway with pipes etc? make a generator for the door itself? esp anidoor

	sond options configurable to make trigger on plyre proximity
		-> jump scares!
		
	corner siper webs
	200x200 giant web masses for wall panels
	large blood smear, maybe even some more writing
	1 massive 400px blood message
*/
