//#include <Wire.h>

#include <RTClib.h>
#include "ModbusRTC.h"

#include <avr/wdt.h>

#include "PHNeutralizer.h"

#include <SimpleModbusSlave.h>

#include <EZOPHMeter.h> 
#include <EZOThermometer.h>   

//#define DEBUG_SERIAL

#ifdef DEBUG_SERIAL
  #define COMMUNICATION_SETUP Serial.begin(9600)
  #define COMMUNICATION_UPDATE serial_update()
#else
  #define COMMUNICATION_SETUP modbus_configure(&Serial, 38400, SERIAL_8N1, 1, 50, holdingRegisters)
  #define COMMUNICATION_UPDATE modbus_update()
#endif

#define ACID_LOW_LEVEL_SENSOR_PIN 5
#define NEUTRALIZER_TANK_FULLSENSOR_PIN 6
#define WASTE_TANK_FULLSENSOR_PIN A0
#define WASTE_TANK_BIS_FULLSENSOR_PIN A1


/*
 * Modbus registers :
 * 
 *  Neutralizer registers
 *    0 command
 *    1 running mode
 *    2 status
 *    3-4-5 emptying tank timings (secs)
 *    6-7-8 reserved
 *    9 idleTimeBeforeNeutralization (secs)
 *    10 neutralizationTimeout
 *    11 neutralizationPeriod
 *    12 firstNeutralizationHour
 *    13 acidPulseTiming
 *    14 acidPulsePeriod
 *    15 neutralizer tank full (1 when full)
 *    16 PH target (x100)
 *    17 waste tank full (1 when full)
 *    18 Relay output status register as bit array
 *    19 waste tank bis full (1 when full)
 *    40 btnWasteSelect
 *    
 *    
 *    RTC
 *      20 command
 *      21-22 current time 
 *      23-24 register to set a new time
 *      
 *    Thermometer
 *      25 command
 *      26 temperature (x100)
 *      
 *     PH meter
 *      27 command
 *      28 PH measure (x100)
 *      29 Acid level (0 if the level is high, 1 if the level is low)
 *      30 PH calibration register (x100) (used to define the PH used by the calibration command)
 *      
 *      
 *      For debugging purpose
 *      35-38
 */

unsigned int holdingRegisters[50]; 

//PHNeutralizer neutralizer = PHNeutralizer(&holdingRegisters[0],&holdingRegisters[1],&holdingRegisters[2],(uint32_t*)&holdingRegisters[21],&holdingRegisters[28],&holdingRegisters[3],&holdingRegisters[9],&holdingRegisters[10],&holdingRegisters[11],&holdingRegisters[12],&holdingRegisters[13],&holdingRegisters[14],&holdingRegisters[29],&holdingRegisters[16],&holdingRegisters[15],&holdingRegisters[17],&holdingRegisters[19],&holdingRegisters[18],&holdingRegisters[35]) ;
PHNeutralizer neutralizer = PHNeutralizer(&holdingRegisters[0],&holdingRegisters[1],&holdingRegisters[2],(uint32_t*)&holdingRegisters[21],&holdingRegisters[28],&holdingRegisters[3],&holdingRegisters[9],&holdingRegisters[10],&holdingRegisters[11],&holdingRegisters[12],&holdingRegisters[13],&holdingRegisters[14],&holdingRegisters[29],&holdingRegisters[40],&holdingRegisters[16],&holdingRegisters[15],&holdingRegisters[17],&holdingRegisters[19],&holdingRegisters[18],&holdingRegisters[35]) ;

ModbusRTC rtc = ModbusRTC(&holdingRegisters[20],(uint32_t*)&holdingRegisters[21],(uint32_t*)&holdingRegisters[23]) ;


char commandBuffer[20] ;
char sensorDataBuffer[30] ;

EZOThermometer thermometer = EZOThermometer(102,&holdingRegisters[25],&holdingRegisters[26],commandBuffer,sensorDataBuffer) ;
EZOPHMeter pHMeter = EZOPHMeter(99,&holdingRegisters[27],&holdingRegisters[26],&holdingRegisters[28],&holdingRegisters[30],commandBuffer,sensorDataBuffer) ;

String sdata ="" ;

void setup()
{
   Wire.begin(); 
   
   COMMUNICATION_SETUP ;

   thermometer.setup() ;
   pHMeter.setup() ;
  
   rtc.setup() ;

   pinMode(ACID_LOW_LEVEL_SENSOR_PIN, INPUT_PULLUP); //Acid low level sensor
   pinMode(NEUTRALIZER_TANK_FULLSENSOR_PIN, INPUT_PULLUP); //Neutralizer tank full level sensor
   pinMode(WASTE_TANK_FULLSENSOR_PIN, INPUT_PULLUP); //Waste tank full level sensor
   pinMode(WASTE_TANK_BIS_FULLSENSOR_PIN, INPUT_PULLUP); //Waste tank full level sensor WASTE_TANK_BIS_FULLSENSOR_PIN
   neutralizer.setup() ;

   wdt_enable(WDTO_4S);     // enable the watchdog after 4 secs

}

void loop(){
  
  COMMUNICATION_UPDATE ;
  
  rtc.update() ;
  
  pHMeter.update() ;
    
  thermometer.update() ;
  
  holdingRegisters[29] = digitalRead(ACID_LOW_LEVEL_SENSOR_PIN) ;
    
  holdingRegisters[15] = digitalRead(NEUTRALIZER_TANK_FULLSENSOR_PIN) ;
  
  holdingRegisters[17] = digitalRead(WASTE_TANK_FULLSENSOR_PIN) ;
  
  holdingRegisters[19] = digitalRead(WASTE_TANK_BIS_FULLSENSOR_PIN) ;
    
  neutralizer.update() ;

  wdt_reset() ;
}

void serial_update() {
  byte ch;

   if (Serial.available()) {
      ch = Serial.read();

      sdata += (char)ch;

      if (ch=='\r') {  // Command recevied and ready.
         sdata.trim();

         switch( sdata.charAt(0) ) {
           case 'e':
              Serial.println("Empty tanks");
              holdingRegisters[0] = SET_MANUAL_MODE ;
              neutralizer.update() ;
              
              holdingRegisters[0] = EMPTY_TANKS ;
              
              break;
           case 'n':
              Serial.println("Add acid");
              holdingRegisters[0] = SET_MANUAL_MODE ;
              neutralizer.update() ;
              
              holdingRegisters[0] = ACTIVE_ACID_PUMP ;
              break;
           
           default: Serial.println(sdata);
           } 
                  
         sdata = ""; // Clear the string ready for the next command.
      }
   }
}
