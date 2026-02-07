#include "EZOPHMeter.h"

//#define DEBUG_SERIAL

#ifdef DEBUG_SERIAL
  #define DEBUG_PRINT(str) Serial.print(str)
  #define DEBUG_PRINTLN(str) Serial.println(str)
#else
  #define DEBUG_PRINT(str)
  #define DEBUG_PRINTLN(str)
#endif


EZOPHMeter::EZOPHMeter() {
    // for array initialization purpose
}

EZOPHMeter::EZOPHMeter(byte I2CAddress, unsigned int* commandRegister, unsigned int* currentTemperatureRegister,unsigned int* pHRegister,unsigned int* pHCalibrationRegister,char* sharedCommandBuffer, char* sharedSensorData) {
    
	this->I2CAddress = I2CAddress ;
	
	this->commandRegister = commandRegister ;

	this->currentTemperatureRegister = currentTemperatureRegister ;
	
	this->pHRegister = pHRegister ;
	
	this->pHCalibrationRegister = pHCalibrationRegister ;
	
	this->commandBuffer = sharedCommandBuffer ;
	this->sensordata = sharedSensorData ;
	
	lastTemperature = 2500 ; //default to 25 degres
	
	setIdle() ;
}


int EZOPHMeter::update() {
	if (isBusy())
		return 0 ;
	
	if (status==WAITING_MEASURE)
		return updateMeasure() ;
	 
	if (status==SETTING_CALIBRATION)
		setIdle() ;
	
	if (status==SETTING_TEMPERATURE_COMPENSATION)
		setIdle() ;
	
	if (*commandRegister > 0)
		calibrate() ;
    else 
		if (abs(*currentTemperatureRegister-lastTemperature)>200 && *currentTemperatureRegister>0&&*currentTemperatureRegister<10000) {
			lastTemperature = *currentTemperatureRegister ;
			compensateTemperature() ;
		}else
			requestMeasure() ;
        
	return 0 ;
}



void EZOPHMeter::setup() {
	
}


void EZOPHMeter::calibrate() {
	 
	int integerPhPart = *pHCalibrationRegister/100 ;
	int floatPhPart = *pHCalibrationRegister - integerPhPart*100 ;
	
	switch (*commandRegister) {
	    case CALIBRATION_LOW_REQUEST :
	      snprintf(commandBuffer,20,"%s%d.%d","Cal,low,",integerPhPart,floatPhPart) ;
	      break;
	    case CALIBRATION_MID_REQUEST:
	      snprintf(commandBuffer,20,"%s%d.%d","Cal,mid,",integerPhPart,floatPhPart) ;
	      break;
  	    case CALIBRATION_HIGH_REQUEST:
  	      snprintf(commandBuffer,20,"%s%d.%d","Cal,high,",integerPhPart,floatPhPart) ;
  	      break;
	    default: 
			return ;
	  }
		
	Wire.beginTransmission(I2CAddress);    
	Wire.write(commandBuffer);
	Wire.endTransmission();
	
	setBusy(900,SETTING_CALIBRATION) ;
	
	*commandRegister = 0 ;
}

void EZOPHMeter::requestMeasure() {	
	
	Wire.beginTransmission(I2CAddress);    
	Wire.write('R');
	Wire.endTransmission(); 
	
	setBusy(900,WAITING_MEASURE) ;
}

void EZOPHMeter::compensateTemperature() {	
	
	int integerTemperaturePart = *currentTemperatureRegister/100 ;
	int floatTemperaturePart = *currentTemperatureRegister - integerTemperaturePart*100 ;
		
	snprintf(commandBuffer,20,"%s%d.%d","T,",integerTemperaturePart,floatTemperaturePart) ;     
	
	Wire.beginTransmission(I2CAddress);    
	Wire.write(commandBuffer);
	Wire.endTransmission(); 
	
	setBusy(300,SETTING_TEMPERATURE_COMPENSATION) ;
}

int EZOPHMeter::updateMeasure() {
	
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
	 
	 *pHRegister = ((int)(atof(sensordata)*100)) ;
	
    return 1 ;
}

boolean EZOPHMeter::isBusy() {
	return ((unsigned int)(millis() - previousMillis) < busyInterval) ;
}

void EZOPHMeter::setBusy(unsigned int busyTime, byte status) {
	previousMillis = millis() ;
	busyInterval = busyTime ;
	this->status = status ;
}

void EZOPHMeter::setIdle() {
	busyInterval = 0 ;
	previousMillis = 0 ;
	
	status = IDLE ;
}

