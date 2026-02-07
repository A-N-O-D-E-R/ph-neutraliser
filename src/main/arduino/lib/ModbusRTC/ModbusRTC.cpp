#include "ModbusRTC.h"

//#define DEBUG_SERIAL

#ifdef DEBUG_SERIAL
  #define DEBUG_PRINT(str) Serial.print(str)
  #define DEBUG_PRINTLN(str) Serial.println(str)
#else
  #define DEBUG_PRINT(str)
  #define DEBUG_PRINTLN(str)
#endif


ModbusRTC::ModbusRTC() {
    // for array initialization purpose
}

ModbusRTC::ModbusRTC(unsigned int* commandRegister, uint32_t* timeRegister, uint32_t* newtimeRegister) {
	
	this->commandRegister = commandRegister ;

	this->timeRegister = timeRegister ;
	
	this->newtimeRegister = newtimeRegister ;
}


int ModbusRTC::update() {
	
	switch (*commandRegister) {
		case SET_TIME :
			setTime() ;
			break ;
		default :
			readTime() ;
        	break ;
		}
		
	*commandRegister = 0 ;
	
	return 0 ;
}



int ModbusRTC::setup() {	
	return rtc.begin() ;
}

DateTime ModbusRTC::readTime() {
	DateTime now = rtc.now() ;
	
	*timeRegister = now.unixtime() ;
	
	return now ;
}

void ModbusRTC::setTime() {
	rtc.adjust(*newtimeRegister) ;
}



