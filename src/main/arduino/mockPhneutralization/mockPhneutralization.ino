// ============================================================
//  mockPhneutralization.ino
//
//  Mock version of PhNeutralisation.ino for testing without hardware.
//
//  What is simulated:
//    - EZO pH meter  → pH decreases when acid pump relay is on,
//                       drifts up slowly otherwise.
//                       Resets to MOCK_WASTE_PH when waste enters
//                       the neutralizer (WAITING_BEFORE_NEUTRALIZATION).
//    - EZO thermometer → fixed temperature (MOCK_TEMPERATURE_C).
//    - RTC             → millis()-based unix timestamp starting at
//                        MOCK_INITIAL_UNIXTIME.
//    - Waste level sensors → tank 1 fills after MOCK_WASTE_FILL_INTERVAL_MS,
//                            empties once the pump relay deactivates.
//    - Neutralizer tank sensor → always not-full (no overflow).
//    - Acid level sensor       → always available.
//
//  Communication:
//    - Comment out DEBUG_SERIAL to use Modbus (same as production).
//    - With DEBUG_SERIAL, status is printed to Serial on every state change.
//
//  Relay outputs still toggle real digital pins (2–8), but nothing
//  needs to be connected.
// ============================================================


// ---- Mock configuration ------------------------------------

// Uncomment to use plain Serial output instead of Modbus.
#define DEBUG_SERIAL

// Uncomment to force AUTOMATIC mode on startup (ignores EEPROM).
//#define MOCK_AUTO_START

// Simulated unix timestamp at boot (2024-01-01 11:00:00 UTC).
// Aligns with the default firstNeutralizationHour (11) so AUTO mode
// triggers neutralization immediately.
#define MOCK_INITIAL_UNIXTIME  1704106800UL

// How long (ms) before an empty waste tank refills.
#define MOCK_WASTE_FILL_INTERVAL_MS  30000UL

// pH value set when waste enters the neutralizer tank.
#define MOCK_WASTE_PH  12.0f

// pH drop per second while acid pump relay is on.
#define MOCK_ACID_EFFECT_PER_SEC  0.08f

// Natural pH drift up per second (no pump active).
#define MOCK_PH_DRIFT_PER_SEC  0.002f

// Fixed simulated temperature (degrees C x100 → register value).
#define MOCK_TEMPERATURE_REG  2000   // 20.00 °C

// ---- Communication -----------------------------------------

#ifdef DEBUG_SERIAL
  #define COMMUNICATION_SETUP  Serial.begin(9600)
  #define COMMUNICATION_UPDATE // nothing — Modbus not used
#else
  #include <SimpleModbusSlave.h>
  #define COMMUNICATION_SETUP  modbus_configure(&Serial, 38400, SERIAL_8N1, 1, 50, holdingRegisters)
  #define COMMUNICATION_UPDATE modbus_update()
#endif

// ---- Includes ----------------------------------------------

#include <RTClib.h>       // DateTime class used inside PHNeutralizer
#include "PHNeutralizer.h"
#include <avr/wdt.h>

// ---- Modbus holding registers (same layout as production) ---
//
//  0  command          9  idleTimeBeforeNeutralization  18 relay output bits
//  1  runningMode     10  neutralizationTimeout         19 wasteTankBisFull
//  2  status          11  neutralizationPeriod          20 RTC command
//  3  emptyTiming[0]  12  firstNeutralizationHour    21-22 unixtime (uint32)
//  4  emptyTiming[1]  13  acidPulseTiming            23-24 newtime  (uint32)
//  5  emptyTiming[2]  14  acidPulsePeriod               25 thermo command
//  6  reserved        15  neutralizerTankFull           26 temperature x100
//  7  reserved        16  phTarget x100                 27 pH command
//  8  reserved        17  wasteTankFull                 28 pH x100
//                                                        29 acidLevel
//                                                        30 pH calibration
//                                                     35-37 debug regs
//                                                        40 btnWasteSelect

unsigned int holdingRegisters[50];

PHNeutralizer neutralizer = PHNeutralizer(
  &holdingRegisters[0],             // commandRegister
  &holdingRegisters[1],             // runningModeRegister
  &holdingRegisters[2],             // statusRegister
  (uint32_t*)&holdingRegisters[21], // unixtimeRegister (2 x uint16)
  &holdingRegisters[28],            // phRegister
  &holdingRegisters[3],             // emptyingTankTimings[3]
  &holdingRegisters[9],             // idleTimeBeforeNeutralization
  &holdingRegisters[10],            // neutralizationTimeout
  &holdingRegisters[11],            // neutralizationPeriod
  &holdingRegisters[12],            // firstNeutralizationHour
  &holdingRegisters[13],            // acidPulseTiming
  &holdingRegisters[14],            // acidPulsePeriod
  &holdingRegisters[29],            // acidLevel
  &holdingRegisters[40],            // btnWasteSelect
  &holdingRegisters[16],            // phTarget
  &holdingRegisters[15],            // neutralizerTankFull
  &holdingRegisters[17],            // wasteTankFull
  &holdingRegisters[19],            // wasteTankbisFull
  &holdingRegisters[18],            // outputStatusRegister (relay bit-field)
  &holdingRegisters[35]             // debugRegisters
);

// ---- Simulation state --------------------------------------

float  simPH               = 7.0f;   // current simulated pH
bool   simWaste1Full       = false;   // waste tank 1 level
bool   simWaste2Full       = false;   // waste tank 2 level (unused, always LOW)
bool   simWaste1WasActive  = false;   // tracks pump-relay rising edge

unsigned long lastSimMillis      = 0;
unsigned long waste1RefillStart  = 0;  // 0 = timer not running
unsigned int  prevStatus         = 0;
unsigned int  prevRelayBits      = 0;

// ---- Helpers -----------------------------------------------

#ifdef DEBUG_SERIAL
static const char* statusName(unsigned int s) {
  switch (s) {
    case 1:  return "IDLE";
    case 3:  return "NEUTRALIZING";
    case 4:  return "EMPTYING_WASTE_TANKS";
    case 5:  return "WAITING_BEFORE_NEUTRALIZATION";
    case 6:  return "EMPTYING_NEUTRALIZER";
    case 7:  return "MANUALLY_EMPTYING_TANKS";
    case 8:  return "FORCING_EMPTYING_NEUTRALIZER";
    case 9:  return "FORCING_EMPTYING_WASTE";
    case 10: return "MANUALLY_PUMPING_ACID";
    case 11: return "MANUALLY_BULLING";
    default: return "UNKNOWN";
  }
}

void printMockStatus() {
  Serial.print("[MOCK] mode=");       Serial.print(holdingRegisters[1]);
  Serial.print(" status=");           Serial.print(statusName(holdingRegisters[2]));
  Serial.print(" pH=");               Serial.print(holdingRegisters[28] / 100.0f, 2);
  Serial.print(" temp=");             Serial.print(holdingRegisters[26] / 100.0f, 1);
  Serial.print("C acidLvl=");         Serial.print(holdingRegisters[29]);
  Serial.print(" ntrlzrFull=");       Serial.print(holdingRegisters[15]);
  Serial.print(" waste1Full=");       Serial.print(holdingRegisters[17]);
  Serial.print(" waste2Full=");       Serial.print(holdingRegisters[19]);
  Serial.print(" relays=0b");         Serial.println(holdingRegisters[18], BIN);
}
#endif

// ---- Simulation update -------------------------------------

void updateSimulation() {
  unsigned long now = millis();
  float dt = (now - lastSimMillis) / 1000.0f;
  lastSimMillis = now;

  // -- pH simulation --
  bool acidPumpOn    = (holdingRegisters[18] >> 3) & 1;  // relay index 3 = PUMP_ACID
  bool agitationOn   = (holdingRegisters[18] >> 4) & 1;  // relay index 4 = PUMP_AGIT

  if (acidPumpOn) {
    simPH -= MOCK_ACID_EFFECT_PER_SEC * dt;
  } else {
    simPH += MOCK_PH_DRIFT_PER_SEC * dt;
  }
  simPH = constrain(simPH, 2.0f, 14.0f);

  // -- Waste tank 1 refill simulation --
  // Start timer when both tanks are empty and no timer is running.
  if (!simWaste1Full && waste1RefillStart == 0) {
    waste1RefillStart = now;
  }
  if (!simWaste1Full && waste1RefillStart != 0 &&
      (now - waste1RefillStart) >= MOCK_WASTE_FILL_INTERVAL_MS) {
    simWaste1Full     = true;
    waste1RefillStart = 0;
#ifdef DEBUG_SERIAL
    Serial.println("[SIM] Waste tank 1 is now FULL");
#endif
  }

  // Drain waste tank 1 once the pump relay deactivates (after having been on).
  bool wasteRelay1On = (holdingRegisters[18] >> 0) & 1;
  if (simWaste1WasActive && !wasteRelay1On && simWaste1Full) {
    simWaste1Full = false;
#ifdef DEBUG_SERIAL
    Serial.println("[SIM] Waste tank 1 drained (pump relay off)");
#endif
  }
  simWaste1WasActive = wasteRelay1On;

  // -- Write simulated sensor values to registers --
  holdingRegisters[28] = (unsigned int)(simPH * 100.0f);
  holdingRegisters[26] = MOCK_TEMPERATURE_REG;
  holdingRegisters[29] = 0;                    // acid level: always available
  holdingRegisters[15] = 0;                    // neutralizer tank: never full
  holdingRegisters[17] = simWaste1Full ? 1 : 0;
  holdingRegisters[19] = simWaste2Full ? 1 : 0;
}

// Called once per status transition.
void onStatusChanged(unsigned int from, unsigned int to) {
  if (to == WAITING_BEFORE_NEUTRALIZATION) {
    // Waste has just been pumped into the neutralizer → raise pH.
    simPH = MOCK_WASTE_PH;
#ifdef DEBUG_SERIAL
    Serial.print("[SIM] Waste entered neutralizer, pH reset to ");
    Serial.println(simPH);
#endif
  }

#ifdef DEBUG_SERIAL
  Serial.print("[STATUS] ");
  Serial.print(statusName(from));
  Serial.print(" -> ");
  Serial.println(statusName(to));
  printMockStatus();
#endif
}

// ---- Arduino setup/loop ------------------------------------

void setup() {
  COMMUNICATION_SETUP;

  // Seed the simulated unix time (registers 21-22 store a 32-bit value).
  *((uint32_t*)&holdingRegisters[21]) = MOCK_INITIAL_UNIXTIME;

  // Pre-set sensor registers so they are valid before the first update().
  holdingRegisters[26] = MOCK_TEMPERATURE_REG;
  holdingRegisters[28] = (unsigned int)(simPH * 100.0f);
  holdingRegisters[29] = 0;  // acid available
  holdingRegisters[15] = 0;  // neutralizer not full
  holdingRegisters[17] = 0;  // waste 1 empty
  holdingRegisters[19] = 0;  // waste 2 empty

  neutralizer.setup();

#ifdef MOCK_AUTO_START
  // Override EEPROM and force automatic mode.
  holdingRegisters[1] = AUTOMATIC;
  holdingRegisters[0] = SET_AUTOMATIC_MODE;
  neutralizer.update();
  holdingRegisters[0] = 0;
#endif

  lastSimMillis  = millis();
  prevStatus     = holdingRegisters[2];
  prevRelayBits  = holdingRegisters[18];

  wdt_enable(WDTO_4S);

#ifdef DEBUG_SERIAL
  Serial.println("=== mockPhneutralization started ===");
  Serial.println("Commands (send char + CR):");
  Serial.println("  a = SET_AUTOMATIC_MODE");
  Serial.println("  m = SET_MANUAL_MODE");
  Serial.println("  n = TRIGGER_NEUTRALIZATION (manual)");
  Serial.println("  e = EMPTY_TANKS (manual)");
  Serial.println("  p = ACTIVE_ACID_PUMP (manual)");
  Serial.println("  g = ACTIVE_AGITATION (manual)");
  Serial.println("  s = print status");
  printMockStatus();
#endif
}

void loop() {
  COMMUNICATION_UPDATE;

  // -- Advance simulated clock --
  *((uint32_t*)&holdingRegisters[21]) = MOCK_INITIAL_UNIXTIME + millis() / 1000UL;

  // -- Accept (and silently ignore) RTC set commands --
  holdingRegisters[20] = 0;

  // -- Run simulation and update sensor registers --
  updateSimulation();

  // -- Run neutralizer state machine --
  neutralizer.update();

  // -- Detect status changes --
  if (holdingRegisters[2] != prevStatus) {
    onStatusChanged(prevStatus, holdingRegisters[2]);
    prevStatus = holdingRegisters[2];
  }

  wdt_reset();
}

// ---- Serial debug command handler --------------------------
// Only compiled when DEBUG_SERIAL is defined.

#ifdef DEBUG_SERIAL
String serialBuf = "";

void serialEvent() {
  while (Serial.available()) {
    char ch = (char)Serial.read();
    if (ch == '\r' || ch == '\n') {
      serialBuf.trim();
      if (serialBuf.length() > 0) {
        handleDebugCommand(serialBuf.charAt(0));
        serialBuf = "";
      }
    } else {
      serialBuf += ch;
    }
  }
}

void handleDebugCommand(char cmd) {
  switch (cmd) {
    case 'a':
      Serial.println(">> SET_AUTOMATIC_MODE");
      holdingRegisters[0] = SET_AUTOMATIC_MODE;
      break;
    case 'm':
      Serial.println(">> SET_MANUAL_MODE");
      holdingRegisters[0] = SET_MANUAL_MODE;
      break;
    case 'n':
      Serial.println(">> TRIGGER_NEUTRALIZATION");
      holdingRegisters[0] = TRIGGER_NEUTRALIZATION;
      break;
    case 'e':
      Serial.println(">> EMPTY_TANKS");
      holdingRegisters[0] = EMPTY_TANKS;
      break;
    case 'p':
      Serial.println(">> ACTIVE_ACID_PUMP");
      holdingRegisters[0] = ACTIVE_ACID_PUMP;
      break;
    case 'g':
      Serial.println(">> ACTIVE_AGITATION");
      holdingRegisters[0] = ACTIVE_AGITATION;
      break;
    case 's':
      printMockStatus();
      break;
    default:
      Serial.print("Unknown command: ");
      Serial.println(cmd);
      break;
  }
}
#endif
