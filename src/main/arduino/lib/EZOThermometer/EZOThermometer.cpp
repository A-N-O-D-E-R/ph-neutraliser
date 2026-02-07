#include "EZOThermometer.h"

//#define DEBUG_SERIAL

#ifdef DEBUG_SERIAL
  #define DEBUG_PRINT(str) Serial.print(str)
  #define DEBUG_PRINTLN(str) Serial.println(str)
#else
  #define DEBUG_PRINT(str)
  #define DEBUG_PRINTLN(str)
#endif


EZOThermometer::EZOThermometer() {
    // for array initialization purpose
}

EZOThermometer::EZOThermometer(byte I2CAddress, unsigned int* commandRegister, unsigned int* temperatureRegister,char* sharedCommandBuffer, char* sharedSensorData) {
    
	this->I2CAddress = I2CAddress ;
	
	this->commandRegister = commandRegister ;

	this->temperatureRegister = temperatureRegister ;
	
	this->commandBuffer = sharedCommandBuffer ;
	this->sensordata = sharedSensorData ;
	
	setIdle() ;
}


int EZOThermometer::update() {
	if (isBusy())
		return 0 ;
	
	if (status==WAITING_MEASURE)
		return updateMeasure() ;
	 
	if (status==SETTING_CALIBRATION)
		setIdle() ;
	
	if (*commandRegister == CALIBRATION_REQUEST)
		calibrate() ;
    else 
		requestMeasure() ;
        
	return 0 ;
}



void EZOThermometer::setup() {
	
}


void EZOThermometer::calibrate() {
	 
	int integerTemperaturePart = *temperatureRegister/100 ;
	int floatTemperaturePart = *temperatureRegister - integerTemperaturePart*100 ;
	
	snprintf(commandBuffer,20,"%s%d.%d","Cal,",integerTemperaturePart,floatTemperaturePart) ;
		
	Wire.beginTransmission(I2CAddress);    
	Wire.write(commandBuffer);
	Wire.endTransmission();
	
	setBusy(1000,SETTING_CALIBRATION) ;
	
	*commandRegister = 0 ;
}

void EZOThermometer::requestMeasure() {	
	
	Wire.beginTransmission(I2CAddress);    
	Wire.write('R');
	Wire.endTransmission(); 
	
	setBusy(600,WAITING_MEASURE) ;
}


int EZOThermometer::updateMeasure() {
	
	sensor_bytes_received = 0;                        // reset data counter
	memset(sensordata, 0, sizeof(sensordata));        // clear sensordata array;

	Wire.requestFrom((int)I2CAddress, 30, 1);    // call the circuit and request 48 bytes (this is more than we need).
	
	code = Wire.read();

	while (Wire.available()) {          // are there bytes to receive?
	      in_char = Wire.read();            // receive a byte.

	      if (in_char == 0) {               // null character indicates end of command
	        Wire.endTransmission();         // end the I2C data transmission.
	        break;                          // exit the while loop, we're done here
	      }
	      else {
	        sensordata[sensor_bytes_received] = in_char;      // append this byte to the sensor data array.
	        sensor_bytes_received++;
	      }
	 }
	
 	setIdle() ;
	 
	switch (code) {                  	    
	       case 1:                       	    // decimal 1  means the command was successful.
	         sensordata[sensor_bytes_received]='\0' ;     
	         break;                        	    
	       case 2:                        	    // decimal 2 means the command has failed.
	         return 2 ;
	       case 254:                      	    // decimal 254  means the command has not yet been finished calculating.
	         return 254 ;
	       case 255:                      	    // decimal 255 means there is no further data to send.
	         return 255 ;                         	    // exits the switch case.
	     }
	 
	 *temperatureRegister = ((int)(atof(sensordata)*100)) ;
	
    return 1 ;
}

boolean EZOThermometer::isBusy() {
	return ((unsigned long)(millis() - previousMillis) < busyInterval) ;
}

void EZOThermometer::setBusy(unsigned int busyTime, byte status) {
	previousMillis = millis() ;
	busyInterval = busyTime ;
	this->status = status ;
}

void EZOThermometer::setIdle() {
	busyInterval = 0 ;
	previousMillis = 0 ;
	
	status = IDLE ;
}

