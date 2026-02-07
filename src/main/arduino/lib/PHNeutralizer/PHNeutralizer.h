#ifndef PHNeutralizer_h
#define PHNeutralizer_h

#include <Arduino.h>
#include <EEPROM.h>
#include <RTClib.h>

//Commands
#define UPDATE_CONFIGURATION 1 //save parameters in NVRAM
#define SET_MANUAL_MODE 2 //stop any running task
#define SET_AUTOMATIC_MODE 3 //start automatic neutralization
#define EMPTY_TANKS 4 //Empty at the same time all tanks where timings set in emptyingTankTimings are > 0
#define TRIGGER_NEUTRALIZATION 5 //manually start a neutralization 
#define ACTIVE_ACID_PUMP 6
#define ACTIVE_AGITATION 7

//Running mode
#define MANUAL 1
#define AUTOMATIC 2

//Status
#define IDLE 1
#define NEUTRALIZING 3
#define EMPTYING_WASTE_TANKS 4
#define WAITING_BEFORE_NEUTRALIZATION 5
#define EMPTYING_NEUTRALIZER 6
#define MANUALLY_EMPTYING_TANKS 7
#define FORCING_EMPTYING_NEUTRALIZER 8
#define FORCING_EMPTYING_WASTE 9
#define MANUALLY_PUMPING_ACID 10
#define MANUALLY_BULLING 11

#define PUMP_WASTE 2//RELAY1 4                     
#define PUMP_WASTE_BIS 3//RELAY2 7
#define PUMP_NEUTRALIZER 4//RELAY3 8
#define PUMP_ACID 7//RELAY4 12
#define PUMP_AGIT 8//RELAY5 10

//#define ACID_PUMP 3

#define WASTE_TANK_FULL 1
#define WASTE_TANK_LOW 0

#define NEUTRALIZER_TANK_FULL 1
#define NEUTRALIZER_TANK_LOW 0

#define ONE_TANK 1
#define TWO_TANKS 2

/////////////////////////////////////
//#define ACID_LOW_LEVEL 0
//#define ACID_HIGH_LEVEL 1
/////////////////////////////////////

//debug
#define DEBUG_IS_TIME_TO_NEUTRALIZE 1
#define DEBUG_UPDATE_WAITING_BEFORE_NEUTRALIZATION 2


class PHNeutralizer {
public:
    PHNeutralizer() ;

	/*
	
	commandRegister :
		where to write commands
	
	runningModeRegister :
		automatic or manual
	
	statusRegister :
		idle or action in progress
	
	unixtimeRegister :
		current unix time in seconds 
	
	phRegister :
		ph value x100
	
	All timings in seconds
	
	emptyingTankTimings : 
		array of 3 times -> 0 & 1 for the waste tanks 1 et 2, 2 for the neutralizer tank
		The timings are saved in nvram using the UPDATE_CONFIGURATION command. This timings can be set also when forcing the emptying of the tanks.
	
	idleTimeBeforeNeutralization :
		Time duration before the tranferred wastes are neutralized
	
	neutralizationTimeout :
		if > 0 time after which wastes are discharged whatsoever
		if == 0 ph must reach the threshold (7-8) before discharge
	
	neutralizationPeriod :
		time between neutralization cycles. Cannot be less that the sum of tank emptying, idle time before neutralization and neutralization timeout.	
	
	firstNeutralizationHour :
		 hour of the day (24h format) when the first neutralization cycle occurs
	
	acidPulseTiming :
		opening time of the acid pump
	
	acidPulsePeriod :
		time between two pulses of acid
	
	
	acidLevel Register:
		0 if the level is high, 1 if the level is low or undected
		
	btnWasteSelect Register:
		0 WasteTank, 1 WasteTank + WasteTankBis
		
	phTarget:
		pH (x100) to reach during regulation 
	
	neutralizeTankFull register:
		1 if the level is high, 0 if the level is low 
	
	wasteTankFull register: 
		1 if the level is high, 0 if the level is low 
		
	wasteTankbisFull register: 
		1 if the level is high, 0 if the level is low 
	*/
	
	PHNeutralizer(unsigned int* commandRegister, unsigned int* runningModeRegister, unsigned int* statusRegister, uint32_t* unixtimeRegister,unsigned int* phRegister, unsigned int* emptyingTankTimings, unsigned int* idleTimeBeforeNeutralization, unsigned int* neutralizationTimeout, unsigned int* neutralizationPeriod, unsigned int* firstNeutralizationHour, unsigned int* acidPulseTiming, unsigned int* acidPulsePeriod, unsigned int* acidLevel,unsigned int* btnWasteSelect, unsigned int* phTarget, unsigned int* neutralizerTankFull, unsigned int* wasteTankFull, unsigned int* wasteTankbisFull, unsigned int* outputStatusRegister, unsigned int* debugRegisters);
  
	int setup() ;

	//Performs measure update and command processing based on the command registers
	int update() ;	
    
	void start() ;
	
	void stop() ;
	
	//Tank 2 is the neutralization tank
	void emptyTanks(unsigned int* emptyingTankTimings, int status) ;
	
	void emptyTank(int tankNumber, int seconds, int status) ;
	
	//acid pump
	void activeAcidPump(int status) ;
		
	//agitation
	void activeAgitation(int status) ;
	
	
private:

	//byte relayOutputs[4] = {RELAY1,RELAY2,RELAY3,RELAY4} ; //1: waste tank 1, 2: waste tank 2, 3: neutralizer tank, 4: acid pump

	byte relayOutputs[5] = {PUMP_WASTE,PUMP_WASTE_BIS,PUMP_NEUTRALIZER,PUMP_ACID,PUMP_AGIT} ; //0: waste tank 1, 1: waste tank 2, 2: neutralizer tank, 3: acid pump , 4: agitation  

	unsigned int defaultTankTimings[3] ;
	
	unsigned int currentTankTimings[3] ;
	
	 
	unsigned int* commandRegister ;
	
	unsigned int* runningModeRegister ;
	
	unsigned int* statusRegister ;
	
	uint32_t* unixtimeRegister ;
	
	unsigned int* phRegister ;

	unsigned int* emptyingTankTimings ;

	unsigned int* idleTimeBeforeNeutralization ;
	
	unsigned int* neutralizationTimeout ;
	
	unsigned int* neutralizationPeriod ;
	
	unsigned int* firstNeutralizationHour ;

	unsigned int* acidPulseTiming ;
	
	unsigned int* acidPulsePeriod ;
	
	unsigned int* acidLevel ;
	
	unsigned int* btnWasteSelect ;
	
	unsigned int* phTarget ;
	
	unsigned int* neutralizerTankFull ;
	
	unsigned int* wasteTankFull ;
	
	unsigned int* wasteTankbisFull ;
	
	unsigned int* outputStatusRegister ;
	
	unsigned int* debugRegisters ;
		
	
	boolean isPhRegulating ;
	
	void loadConfiguration() ;
	
	void saveConfiguration() ;
	
	void saveStatus() ;
	
	void loadStatus() ;
    
	
	unsigned long stepStartMillis ;
	
	unsigned long startRegulationCycleMillis ;
	
	void updateEmptyingTanksStep() ;
	
	void updatePumpingAcidStep() ;
	
	void updateBullingStep() ;
	
	void startWaitingBeforeNeutralizationStep() ;
	void updateWaitingBeforeNeutralizationStep() ;
	
	void startNeutralizationStep() ;
	void updateNeutralizationStep() ;
	
	void startNeutralizationProcess() ;
	void startNeutralizationProcessone() ;
	void startNeutralizationProcesstwo() ;
	
	void endNeutralizationProcess() ;
	
	void startForcingEmptyingNeutralizer() ; 
	void startEmptyingNeutralizer() ;
	
	boolean isTimeToNeutralize() ;
	
	void failover() ;
	
	void startPhRegulation() ;
	void updatePhRegulation() ;
	void stopPhRegulation() ;
	
	void loadEmptyingTimings(unsigned int tank, byte eepromAddress, unsigned int defaultTiming) ;
	
	void debug(unsigned int a, unsigned int b, unsigned int c) ;
	
	void activateRelay(int relay) ;
	
	void deactivateRelay(int relay) ;
	
};

#endif