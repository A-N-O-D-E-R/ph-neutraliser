#ifndef EZOThermometer_h
#define EZOThermometer_h

#include <Arduino.h>
#include <Wire.h> 

#define CALIBRATION_REQUEST 1

#define SETTING_CALIBRATION 3

#define IDLE 1
#define WAITING_MEASURE 2


class EZOThermometer {
public:
    EZOThermometer() ;

	EZOThermometer(byte I2CAdress, unsigned int* commandRegister, unsigned int* temperatureRegister,char* sharedCommandBuffer, char* sharedSensorData);
  
	void setup() ;

	//Performs measure update and command processing based on the command registers
	int update() ;	
    
    
private:

	unsigned int* commandRegister ;
 
	unsigned int* temperatureRegister; 

	unsigned long previousMillis ;	
	unsigned int busyInterval ;
	byte status ;
		
	char* commandBuffer ;				  // A shared character array to build the command to send to the sensor

    byte I2CAddress ;	
	
	char* sensordata;                     // A shared character array to hold incoming data from the sensors
	byte sensor_bytes_received = 0;       // We need to know how many characters bytes have been received

	byte code = 0;                        // used to hold the I2C response code.
	byte in_char = 0;                     // used as a 1 byte buffer to store in bound bytes from the I2C Circuit.
	
	
	void setBusy(unsigned int busyTime, byte status) ;
	
	boolean isBusy() ;
	
	void setIdle() ;
	
	void calibrate() ;
	
	int updateMeasure() ;
	
	void requestMeasure() ;
    
};

#endif