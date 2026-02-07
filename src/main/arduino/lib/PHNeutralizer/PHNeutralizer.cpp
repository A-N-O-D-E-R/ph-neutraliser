#include "PHNeutralizer.h"

//#define DEBUG_SERIAL

#ifdef DEBUG_SERIAL
  #define DEBUG_PRINT(str) Serial.print(str)
  #define DEBUG_PRINTLN(str) Serial.println(str)
#else
  #define DEBUG_PRINT(str)
  #define DEBUG_PRINTLN(str)
#endif

void EEPROMWriteInt(int address, int value)
{
  byte two = (value & 0xFF);
  byte one = ((value >> 8) & 0xFF);
  
  EEPROM.update(address, two);
  EEPROM.update(address + 1, one);
}
 
int EEPROMReadInt(int address)
{
  long two = EEPROM.read(address);
  long one = EEPROM.read(address + 1);
 
  return ((two << 0) & 0xFFFFFF) + ((one << 8) & 0xFFFFFFFF);
}

PHNeutralizer::PHNeutralizer() {
    // for array initialization purpose
}

PHNeutralizer::PHNeutralizer(unsigned int* commandRegister, unsigned int* runningModeRegister, unsigned int* statusRegister, uint32_t* unixtimeRegister, unsigned int* phRegister, unsigned int* emptyingTankTimings, unsigned int* idleTimeBeforeNeutralization, unsigned int* neutralizationTimeout, unsigned int* neutralizationPeriod, unsigned int* firstNeutralizationHour, unsigned int* acidPulseTiming, unsigned int* acidPulsePeriod, unsigned int* acidLevel,unsigned int* btnWasteSelect, unsigned int* phTarget, unsigned int* neutralizerTankFull, unsigned int* wasteTankFull,unsigned int* wasteTankbisFull, unsigned int* outputStatusRegister, unsigned int* debugRegisters) {
	
	this->commandRegister = commandRegister ;

	this->runningModeRegister = runningModeRegister ;
	
	this->statusRegister = statusRegister ;

	this->unixtimeRegister = unixtimeRegister ;
	
	this->phRegister = phRegister ;

	this->emptyingTankTimings = emptyingTankTimings ;

	this->idleTimeBeforeNeutralization = idleTimeBeforeNeutralization ;
	
	this->neutralizationTimeout = neutralizationTimeout ;
	
	this->neutralizationPeriod = neutralizationPeriod ;
	
	this->firstNeutralizationHour = firstNeutralizationHour ;

	this->acidPulseTiming = acidPulseTiming ;
	
	this->acidPulsePeriod = acidPulsePeriod ;
	
	this->acidLevel = acidLevel ;
	
	this->btnWasteSelect = btnWasteSelect ;
	
	this->phTarget = phTarget ;
	
	this->neutralizerTankFull = neutralizerTankFull ;
	
	this->wasteTankFull = wasteTankFull ;
	
	this->wasteTankbisFull = wasteTankbisFull ;
	
	this->outputStatusRegister = outputStatusRegister ;
	
	this->debugRegisters = debugRegisters ;
}


int PHNeutralizer::setup() {
	for(int i=0;i<5;i++) {
		pinMode(relayOutputs[i], OUTPUT); 
		deactivateRelay(i) ;
	}
	
	isPhRegulating = false ;
	
	loadConfiguration() ;
	loadStatus() ;
		
	if(*runningModeRegister==AUTOMATIC)
		start() ;
	
	failover() ;
		
	return 0 ;
}
	
void PHNeutralizer::failover() {
	switch(*statusRegister) {
		case NEUTRALIZING :
			startNeutralizationStep() ;
			break ;
		
		case EMPTYING_WASTE_TANKS :
			startWaitingBeforeNeutralizationStep() ;
			break ;
			
		case EMPTYING_NEUTRALIZER :
			startEmptyingNeutralizer() ;
			break ;
		
		case WAITING_BEFORE_NEUTRALIZATION :
			startWaitingBeforeNeutralizationStep() ;
			break ;
			
		case MANUALLY_EMPTYING_TANKS :
			emptyTanks(emptyingTankTimings,MANUALLY_EMPTYING_TANKS) ;
			break ;
		
		case MANUALLY_PUMPING_ACID :
		//TODO stop ??
			activeAcidPump(MANUALLY_PUMPING_ACID) ;
			break ;
			
		case MANUALLY_BULLING :
		//TODO stop ??
			activeAgitation(MANUALLY_BULLING) ;
			break ;
		
		case IDLE :
			break ;
		
	}
	
}
	
int PHNeutralizer::update() {

	//handling of full tanks situation
	if (*neutralizerTankFull == NEUTRALIZER_TANK_FULL && *statusRegister != FORCING_EMPTYING_NEUTRALIZER) {
		stop() ;
		DEBUG_PRINTLN(defaultTankTimings[2]);
		emptyTank(2,defaultTankTimings[2],FORCING_EMPTYING_NEUTRALIZER) ;
		saveStatus() ;
	} 
	
	if (*wasteTankFull == WASTE_TANK_FULL && *neutralizerTankFull != NEUTRALIZER_TANK_FULL && *statusRegister != EMPTYING_WASTE_TANKS) {
		stop() ;
		startNeutralizationProcessone() ;
		//startNeutralizationProcess() ;
	}
	
	 if (*wasteTankbisFull == WASTE_TANK_FULL && *neutralizerTankFull != NEUTRALIZER_TANK_FULL && *statusRegister != EMPTYING_WASTE_TANKS) {
		 stop() ;
		 startNeutralizationProcesstwo() ;
	 }
		
	updatePhRegulation() ;
	
	switch(*commandRegister) {
		case SET_MANUAL_MODE :
			stop() ;
			*runningModeRegister = MANUAL ;
			*commandRegister = 0 ;
			saveStatus() ;
			break ;

		case UPDATE_CONFIGURATION :
			*commandRegister = 0 ;
			saveConfiguration() ;
			break ;

		case SET_AUTOMATIC_MODE :
			*commandRegister = 0 ;
			start() ;
			*runningModeRegister = AUTOMATIC ;
			saveStatus() ;
			break ;

		case EMPTY_TANKS :
			*commandRegister = 0 ;
			if (*runningModeRegister==MANUAL && *statusRegister==IDLE && *statusRegister != FORCING_EMPTYING_NEUTRALIZER)
				emptyTanks(emptyingTankTimings,MANUALLY_EMPTYING_TANKS) ;
			
			break ;
	
		case ACTIVE_ACID_PUMP :
			*commandRegister = 0 ;
			if (*runningModeRegister==MANUAL && *statusRegister==IDLE && *statusRegister != FORCING_EMPTYING_NEUTRALIZER)
				activeAcidPump(MANUALLY_PUMPING_ACID) ;
			
			break ;
		
		case ACTIVE_AGITATION :
			*commandRegister = 0 ;
			if (*runningModeRegister==MANUAL && *statusRegister==IDLE && *statusRegister != FORCING_EMPTYING_NEUTRALIZER)
				activeAgitation(MANUALLY_BULLING) ;
			
			break ;
	
		case TRIGGER_NEUTRALIZATION :
			*commandRegister = 0 ;
			if (*runningModeRegister==MANUAL && *statusRegister==IDLE && *statusRegister != FORCING_EMPTYING_NEUTRALIZER)
				startNeutralizationProcess() ;
				//startNeutralizationProcessone() ;
				//startNeutralizationProcesstwo() ;
		
			break ;
	}
	
	switch(*statusRegister) {
		case NEUTRALIZING :
			updateNeutralizationStep() ;
			break ;
		
		case EMPTYING_WASTE_TANKS :
			updateEmptyingTanksStep() ;
			break ;
			
		case FORCING_EMPTYING_NEUTRALIZER :
			updateEmptyingTanksStep() ;
			break ;
			
		case EMPTYING_NEUTRALIZER :
			updateEmptyingTanksStep() ;
			break ;
			
		case MANUALLY_EMPTYING_TANKS :
			updateEmptyingTanksStep() ;
			break ;
			
		case MANUALLY_PUMPING_ACID :
			updatePumpingAcidStep() ;
			break ;
			
		case MANUALLY_BULLING :
			updateBullingStep() ;
			break ;
		
		case WAITING_BEFORE_NEUTRALIZATION :
			updateWaitingBeforeNeutralizationStep() ;
			break ;
		
		case IDLE :
			if (*runningModeRegister==AUTOMATIC && *statusRegister==IDLE && isTimeToNeutralize()) //&& acidLevel==1)///////////
				startNeutralizationProcess() ;
			break ;
			
		//////////////
		//case MAINTENANCE :
			//if (acidLevel==0)
			//	stop() ;
			//break ;
		//////////////
	}
	
	return 0 ;
}

///////////// Détermination de l'heure du démarrage de la neutralisation
boolean PHNeutralizer::isTimeToNeutralize() {
	if (*unixtimeRegister==0) //hour not read from the RTC
		return false ;
	
	DateTime now = DateTime(*unixtimeRegister) ;
	
	/*
	DEBUG_PRINT(now.hour()) ;
	DEBUG_PRINT(" : ") ;
	DEBUG_PRINTLN(now.minute()) ;
	*/
	
	debug(DEBUG_IS_TIME_TO_NEUTRALIZE,now.hour(),now.minute()) ;
	
	if (now.minute()!=0)
		return false ;
	
	int hourSpread = abs(now.hour()-*firstNeutralizationHour) ;
		
	if (*neutralizationPeriod == 0)
		return hourSpread == 0 ;
		
	return (hourSpread % *neutralizationPeriod) == 0 ;
}

///////////// Fin du Process de neutralisation
void PHNeutralizer::endNeutralizationProcess() {
	DEBUG_PRINTLN("endNeutralizationProcess") ;
	stop();
}

///////////// Vidange de tanks
void PHNeutralizer::updateEmptyingTanksStep() {
	DEBUG_PRINTLN("updateEmptyingTanksStep") ;
	
	unsigned int emptyingDuration = (unsigned int)((millis() - stepStartMillis)/1000) ;
	
	boolean emptyingDone = true ;
		
	for(int i=0;i<3;i++)
		if (currentTankTimings[i]>0)
		 if (emptyingDuration >= currentTankTimings[i]) { // Comparaison du temps relevé et du temps associer au temps de vidange du tank
			currentTankTimings[i]=0 ; // Remise à zéro du temps du relai correspondant au tank à vider
			deactivateRelay(i) ; // Activation du relai pour faire la vidange
		}else
			emptyingDone = false ;
	
		
	if (emptyingDone) {	// Si la vidange est finie :		
		DEBUG_PRINTLN("Emptying done ") ;
		DEBUG_PRINT("Status ") ;
		DEBUG_PRINTLN(*statusRegister) ;
		
		switch(*statusRegister) {
				
			case EMPTYING_WASTE_TANKS : 
				startWaitingBeforeNeutralizationStep() ;
				break ;
			
			case EMPTYING_NEUTRALIZER :
				endNeutralizationProcess() ;
				break ;
			
			case FORCING_EMPTYING_NEUTRALIZER :
				*statusRegister = IDLE ;
				saveStatus() ;
				break ;
				
			case FORCING_EMPTYING_WASTE :
				*statusRegister = IDLE ;
				saveStatus() ;
				break ;
				
			case MANUALLY_EMPTYING_TANKS :
				*statusRegister = IDLE ;
				saveStatus() ;
				break ;
		}
	}
}

void PHNeutralizer::updatePumpingAcidStep() {
	DEBUG_PRINTLN("updatePumpingAcidStep") ;
	
	unsigned int emptyingDuration = (unsigned int)((millis() - stepStartMillis)/1000) ;
	
	boolean emptyingDone = true ;
		
	if (*acidPulseTiming>0)
		if (emptyingDuration >= *acidPulseTiming) { 
			deactivateRelay(3) ; 
		}else
			emptyingDone = false ;
	
		
	if (emptyingDone) {	// Si la vidange est finie :		
		DEBUG_PRINTLN("Emptying acid done ") ;
		DEBUG_PRINT("Status ") ;
		DEBUG_PRINTLN(*statusRegister) ;
		
		switch(*statusRegister) {
							
			case MANUALLY_PUMPING_ACID :
				*statusRegister = IDLE ;
				saveStatus() ;
				break ;
		}
	}
}

void PHNeutralizer::updateBullingStep() {
	DEBUG_PRINT("agitating for  ") ;
	DEBUG_PRINTLN(*acidPulsePeriod) ;
	
	DEBUG_PRINT("updateBullingStep ") ;
	
	unsigned int emptyingDuration = (unsigned int)((millis() - stepStartMillis)/1000) ;
	
	DEBUG_PRINTLN(emptyingDuration) ;
	
	boolean emptyingDone = true ;
		
	if (*acidPulsePeriod>0) {
		if (emptyingDuration >= *acidPulsePeriod) { 
			deactivateRelay(4) ; 
		}else
			emptyingDone = false ;
	}
				
	if (emptyingDone) {	// Si la vidange est finie :		
		DEBUG_PRINTLN("Agitating done ") ;
		DEBUG_PRINT("Status ") ;
		DEBUG_PRINTLN(*statusRegister) ;
		
		switch(*statusRegister) {
							
			case MANUALLY_BULLING :
				*statusRegister = IDLE ;
				saveStatus() ;
				break ;
		}
	}
}

///////////// Début de l'attente avant la neutralisation
void PHNeutralizer::startWaitingBeforeNeutralizationStep() {
	DEBUG_PRINTLN("startWaitingBeforeNeutralizationStep") ;
	
	stepStartMillis = millis() ;
	*statusRegister = WAITING_BEFORE_NEUTRALIZATION ;
	
	saveStatus() ;
}

void PHNeutralizer::updateWaitingBeforeNeutralizationStep() {
	
	
	DEBUG_PRINT("updateWaitingBeforeNeutralizationStep remaining ") ;
	DEBUG_PRINT((millis() - stepStartMillis)/1000) ;
	DEBUG_PRINT(" ") ;
	DEBUG_PRINTLN(*idleTimeBeforeNeutralization) ;
	
	
	debug(DEBUG_UPDATE_WAITING_BEFORE_NEUTRALIZATION,(unsigned int)((millis() - stepStartMillis)/1000),*idleTimeBeforeNeutralization) ;
	
	if (((unsigned int)((millis() - stepStartMillis)/1000))>=*idleTimeBeforeNeutralization)
		startNeutralizationStep() ;
}
	
///////////// Démarrage de la neutralisation
void PHNeutralizer::startNeutralizationStep() {
	DEBUG_PRINTLN("startNeutralizationStep") ;
	
	stepStartMillis = millis() ;
	*statusRegister = NEUTRALIZING ;
		
	startPhRegulation() ;
	
	saveStatus() ;
}	

void PHNeutralizer::startPhRegulation() {
	DEBUG_PRINTLN("startPhRegulation") ;
	
	isPhRegulating = true ;
	startRegulationCycleMillis = millis() ;
}

void PHNeutralizer::stopPhRegulation() {
	DEBUG_PRINTLN("stopPhRegulation") ;
	
	deactivateRelay(3) ;
	deactivateRelay(4) ;
		
	isPhRegulating = false ;
}

void PHNeutralizer::updatePhRegulation() {
	if (!isPhRegulating) 
		return ;
	
	unsigned int pulseTiming=0;
	
	if (*phRegister > 1170){
		pulseTiming = *acidPulseTiming;
	}else if ((*phRegister <= 1170) && (*phRegister > 950)){
		pulseTiming = 2;
	}else if (*phRegister <= 950){
		pulseTiming = 1;
	}
		
	if(((millis() - startRegulationCycleMillis)/1000) <= pulseTiming){
		if(*neutralizerTankFull == NEUTRALIZER_TANK_LOW){
			activateRelay(3) ;
			deactivateRelay(4) ;
		}	
	}else if((((millis() - startRegulationCycleMillis)/1000) > pulseTiming) && (((millis() - startRegulationCycleMillis)/1000) <= (pulseTiming+*acidPulsePeriod))){
		deactivateRelay(3) ;
		activateRelay(4) ;	
	}
	
	if (((millis() - startRegulationCycleMillis)/1000) >= (pulseTiming+*acidPulsePeriod)) {
		if(*phRegister < *phTarget){
			stopPhRegulation();
			startEmptyingNeutralizer();
		}else{
			startRegulationCycleMillis = millis() ;
		}		
	}	
}
	
void PHNeutralizer::updateNeutralizationStep() {
	DEBUG_PRINTLN("updateNeutralizationStep") ;
	
	if(((unsigned int)((millis() - stepStartMillis)/1000))>=*neutralizationTimeout){
		stopPhRegulation() ;
		startForcingEmptyingNeutralizer() ;
	}	
}		
void PHNeutralizer::startForcingEmptyingNeutralizer() {
	DEBUG_PRINTLN("startEmptyingNeutralizer") ;
	
	emptyTank(2,defaultTankTimings[2],FORCING_EMPTYING_NEUTRALIZER) ;	
	
	saveStatus() ;
}

void PHNeutralizer::startEmptyingNeutralizer() {
	DEBUG_PRINTLN("startEmptyingNeutralizer") ;
	
	emptyTank(2,defaultTankTimings[2],EMPTYING_NEUTRALIZER) ;	
	
	saveStatus() ;
}
		
void PHNeutralizer::startNeutralizationProcess() {
	DEBUG_PRINTLN("startNeutralizationProcess") ;
	
	if(*btnWasteSelect==ONE_TANK){
		emptyTank(0,defaultTankTimings[0],EMPTYING_WASTE_TANKS) ;
	}
	if(*btnWasteSelect==TWO_TANKS){
		emptyTank(0,defaultTankTimings[0],EMPTYING_WASTE_TANKS) ;
		emptyTank(1,defaultTankTimings[1],EMPTYING_WASTE_TANKS) ;
	}
		
	saveStatus() ;
}
		
void PHNeutralizer::startNeutralizationProcessone() {
	DEBUG_PRINTLN("startNeutralizationProcessone") ;
	
	emptyTank(0,defaultTankTimings[0],EMPTYING_WASTE_TANKS) ;
	
	saveStatus() ;
}
		
void PHNeutralizer::startNeutralizationProcesstwo() {
	DEBUG_PRINTLN("startNeutralizationProcesstwo") ;
	
	emptyTank(1,defaultTankTimings[1],EMPTYING_WASTE_TANKS) ;
	
	saveStatus() ;
}

void PHNeutralizer::loadEmptyingTimings(unsigned int tank, byte eepromAddress, unsigned int maximumTiming) {
	emptyingTankTimings[tank] = EEPROMReadInt(eepromAddress) ;
	
	if (emptyingTankTimings[tank]<0 || emptyingTankTimings[tank]>maximumTiming) {
		DEBUG_PRINT("Setting default emptying timings for tank ") ;
		DEBUG_PRINTLN(tank) ;
		emptyingTankTimings[tank] = 0 ;
	}
		
	defaultTankTimings[tank] = emptyingTankTimings[tank] ;
	
	DEBUG_PRINT("Emptying timings ") ;
	DEBUG_PRINT(tank) ;
	DEBUG_PRINT(" : ") ;
	DEBUG_PRINTLN(emptyingTankTimings[tank]) ;
}

void PHNeutralizer::loadConfiguration() {
	
	loadEmptyingTimings(0,4,1800) ;
	loadEmptyingTimings(1,6,1800) ;
	loadEmptyingTimings(2,8,1800) ;

	*idleTimeBeforeNeutralization = EEPROMReadInt(10) ;
	
	if (*idleTimeBeforeNeutralization==0 || *idleTimeBeforeNeutralization>7200)
		*idleTimeBeforeNeutralization = 3600 ;
	
	DEBUG_PRINT("idleTimeBeforeNeutralization: ") ;
	DEBUG_PRINTLN(*idleTimeBeforeNeutralization) ;
	
	
	*neutralizationTimeout= EEPROMReadInt(12) ;
	
	if (*neutralizationTimeout==0 || *neutralizationTimeout>25200)
		*neutralizationTimeout = 10800 ;
	
	DEBUG_PRINT("neutralizationTimeout: ") ;
	DEBUG_PRINTLN(*neutralizationTimeout) ;
	
	*neutralizationPeriod = EEPROMReadInt(14) ;
	
	if (*neutralizationPeriod>=24)
		*neutralizationPeriod = 24 ;
	
	DEBUG_PRINT("neutralizationPeriod: ") ;
	DEBUG_PRINTLN(*neutralizationPeriod) ;
	
	*firstNeutralizationHour = EEPROMReadInt(16) ;

	if (*firstNeutralizationHour < 0 || *firstNeutralizationHour > 23)
		*firstNeutralizationHour = 11 ;

	DEBUG_PRINT("firstNeutralizationHour: ") ;
	DEBUG_PRINTLN(*firstNeutralizationHour) ;

	*acidPulseTiming = EEPROMReadInt(18) ;
	
	if (*acidPulseTiming < 0 || *acidPulseTiming > 120)
		*acidPulseTiming = 25 ;
	
	DEBUG_PRINT("acidPulseTiming: ") ;
	DEBUG_PRINTLN(*acidPulseTiming) ;
	
	*acidPulsePeriod = EEPROMReadInt(20) ;	
	
	if (*acidPulsePeriod <= 0 || *acidPulsePeriod > 300)
		*acidPulsePeriod = 120 ;
	
	DEBUG_PRINT("acidPulsePeriod: ") ;
	DEBUG_PRINTLN(*acidPulsePeriod) ;
	
	
	*phTarget = EEPROMReadInt(22) ;
	
	if (*phTarget < 550 || *phTarget > 1000) 
		*phTarget = 850 ; 
	
	DEBUG_PRINT("phTarget: ") ;
	DEBUG_PRINTLN(*phTarget) ;
	
	*btnWasteSelect = EEPROMReadInt(24) ;
	
	//if (*btnWasteSelect < 0 || *btnWasteSelect > 3)
		//*btnWasteSelect = 2 ;
	
	DEBUG_PRINT("btnWasteSelect: ") ;
	DEBUG_PRINTLN(*btnWasteSelect) ;
}

void PHNeutralizer::saveConfiguration() {	
	EEPROMWriteInt(4,emptyingTankTimings[0]) ;
	EEPROMWriteInt(6,emptyingTankTimings[1]) ;
	EEPROMWriteInt(8,emptyingTankTimings[2]) ;
	
	defaultTankTimings[0] = emptyingTankTimings[0] ;
	defaultTankTimings[1] = emptyingTankTimings[1] ;
	defaultTankTimings[2] = emptyingTankTimings[2] ;

	EEPROMWriteInt(10,*idleTimeBeforeNeutralization) ;
	
	EEPROMWriteInt(12,*neutralizationTimeout) ;
	
	EEPROMWriteInt(14,*neutralizationPeriod) ;
	
	EEPROMWriteInt(16,*firstNeutralizationHour) ;

	EEPROMWriteInt(18,*acidPulseTiming) ;
	
	EEPROMWriteInt(20,*acidPulsePeriod) ;
	
	EEPROMWriteInt(22,*phTarget) ;
	
	EEPROMWriteInt(24,*btnWasteSelect) ;
	
	//loadConfiguration() ;
}

void PHNeutralizer::saveStatus() {
	DEBUG_PRINT("Saved status : ") ;
	DEBUG_PRINT(*statusRegister) ;
	DEBUG_PRINT(",running mode ") ;
	DEBUG_PRINTLN(*runningModeRegister) ;
	
	EEPROMWriteInt(0,*runningModeRegister) ;
	EEPROMWriteInt(2,*statusRegister) ;
}

void PHNeutralizer::loadStatus() {
	*runningModeRegister = EEPROMReadInt(0) ;
	
	if (*runningModeRegister==0 || *runningModeRegister>2)
		*runningModeRegister = MANUAL ;
	
	*statusRegister = EEPROMReadInt(2) ;
	
	if (*statusRegister==0 || *statusRegister>6)
		*statusRegister = IDLE ;
	
	DEBUG_PRINT("Loaded status : ") ;
	DEBUG_PRINT(*statusRegister) ;
	DEBUG_PRINT(",running mode ") ;
	DEBUG_PRINTLN(*runningModeRegister) ;
}


void PHNeutralizer::start() {
	
}

void PHNeutralizer::stop() {
	DEBUG_PRINTLN("Stopping regulation") ;
		
	stopPhRegulation() ;
	
	for(int i=0;i<3;i++)
		currentTankTimings[i] = 0 ;
	
	//fermeture des relais
	for(int i=0;i<6;i++)
		deactivateRelay(i) ;
	
	stepStartMillis=0 ;
	*statusRegister = IDLE ;
	
	saveStatus() ;
}

void PHNeutralizer::emptyTanks(unsigned int* emptyingTankTimings,int status) {
	for(int i=0;i<3;i++) 
		emptyTank(i,emptyingTankTimings[i],status) ;
}

void PHNeutralizer::emptyTank(int tankNumber, int seconds, int status) {
	//If the main tank if full, it is the only one than can be emptied
	if (*neutralizerTankFull == NEUTRALIZER_TANK_FULL && tankNumber!=2)
		return ;
	
	DEBUG_PRINT("Empty tank ") ;
	DEBUG_PRINT(tankNumber) ;
	DEBUG_PRINT(" for ") ;
	DEBUG_PRINT(seconds) ;
	DEBUG_PRINT(" secs. Status ") ;
	DEBUG_PRINTLN(status) ;
	
	currentTankTimings[tankNumber] = seconds ;
	if (currentTankTimings[tankNumber]>0)
		activateRelay(tankNumber) ;
	
	stepStartMillis=millis() ;
	
	*statusRegister = status ;
}

void PHNeutralizer::activeAcidPump(int status) {
		DEBUG_PRINT("acid pump") ;
	DEBUG_PRINT(3) ;
	DEBUG_PRINT(" for ") ;
	DEBUG_PRINT(*acidPulseTiming) ;
	DEBUG_PRINT(" secs. Status ") ;
	DEBUG_PRINTLN(status) ;
	
	if (*acidPulseTiming>0)
		activateRelay(3) ;
	
	stepStartMillis=millis() ;
	
	*statusRegister = status ;
}

void PHNeutralizer::activeAgitation(int status) {
			
	DEBUG_PRINT("Agitation") ;
	DEBUG_PRINT(4) ;
	DEBUG_PRINT(" for ") ;
	DEBUG_PRINT(*acidPulsePeriod) ;
	DEBUG_PRINT(" secs. Status ") ;
	DEBUG_PRINTLN(status) ;
	
	if (*acidPulsePeriod>0)
		activateRelay(4) ;
	
	stepStartMillis=millis() ;
	
	*statusRegister = status ;
}


void PHNeutralizer::debug(unsigned int a, unsigned int b, unsigned int c) {
	*debugRegisters = a ;
	*(debugRegisters+1) = b ;
	*(debugRegisters+2) = c ;
}

void PHNeutralizer::activateRelay(int relay) {
	digitalWrite(relayOutputs[relay],HIGH) ;
	*outputStatusRegister = (*outputStatusRegister) | (1 << relay) ;
}

void PHNeutralizer::deactivateRelay(int relay) {
	digitalWrite(relayOutputs[relay],LOW) ;
	*outputStatusRegister = (*outputStatusRegister) & (~(1 << relay)) ;
}