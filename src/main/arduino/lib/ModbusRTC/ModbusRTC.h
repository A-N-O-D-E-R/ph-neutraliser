#ifndef ModbusRTC_h
#define ModbusRTC_h

#include <Arduino.h>
#include <Wire.h> 
#include <RTClib.h>

#define SET_TIME 1

class ModbusRTC {
public:
    ModbusRTC() ;

	ModbusRTC(unsigned int* commandRegister, uint32_t* timeRegister, uint32_t* newtimeRegister);
  
	int setup() ;

	//Performs measure update and command processing based on the command registers
	int update() ;	
    
    DateTime readTime() ;
	
	void setTime() ;
	
private:
	
	RTC_DS3231 rtc;

	unsigned int* commandRegister ;
	
	uint32_t* timeRegister ;	
	
	uint32_t* newtimeRegister ;	
    
};

#endif