# Modbus Register Documentation

## Neutralizer Registers

| Addr | Name | R/W | Description |
|------|------|-----|-------------|
| 0 | COMMAND | W | Command register |
| 1 | RUNNING_MODE | R | 0=Manual, 1=Automatic |
| 2 | STATUS | R | Current status (see Status enum) |
| 3 | EMPTYING_TANK1 | R/W | Tank 1 emptying duration (secs) |
| 4 | EMPTYING_TANK2 | R/W | Tank 2 emptying duration (secs) |
| 5 | EMPTYING_NEUTRALIZER | R/W | Neutralizer emptying duration (secs) |
| 6-8 | - | - | Reserved |
| 9 | IDLE_TIME | R/W | Idle time before neutralization (secs) |
| 10 | NEUTRALIZATION_TIMEOUT | R/W | Neutralization timeout |
| 11 | NEUTRALIZATION_PERIOD | R/W | Neutralization period |
| 12 | FIRST_HOUR | R/W | First neutralization hour (0-23) |
| 13 | ACID_PULSE_TIMING | R/W | Acid pulse timing (secs) |
| 14 | ACID_PULSE_PERIOD | R/W | Acid pulse period |
| 15 | NEUTRALIZER_FULL | R | 0=Not full, 1=Full |
| 16 | PH_TARGET | R/W | Target pH (x100) |
| 17 | WASTE_FULL | R | 0=Not full, 1=Full |
| 18 | RELAY_STATUS | R | Relay outputs (bit array) |
| 19 | WASTE_BIS_FULL | R | 0=Not full, 1=Full |
| 40 | WASTE_SELECT | R/W | Waste tank selection |

## RTC Registers

| Addr | Name | R/W | Description |
|------|------|-----|-------------|
| 20 | RTC_COMMAND | W | RTC command register |
| 21 | RTC_TIME_H | R | Current time (high word) |
| 22 | RTC_TIME_L | R | Current time (low word) |
| 23 | RTC_SET_H | W | Set time (high word) |
| 24 | RTC_SET_L | W | Set time (low word) |

> Time format: Unix epoch seconds split into 2x16-bit registers

## Thermometer Registers

| Addr | Name | R/W | Description |
|------|------|-----|-------------|
| 25 | THERMO_COMMAND | W | Thermometer command |
| 26 | TEMPERATURE | R | Temperature (x100) °C |

## pH Meter Registers

| Addr | Name | R/W | Description |
|------|------|-----|-------------|
| 27 | PH_COMMAND | W | pH meter command |
| 28 | PH_MEASURE | R | Current pH (x100) |
| 29 | ACID_LEVEL | R | 0=OK, 1=Low |
| 30 | PH_CALIBRATION | W | Calibration value (x100) |

## Debug Registers

| Addr | Name | R/W | Description |
|------|------|-----|-------------|
| 35-38 | DEBUG | R | Debug data |

---

## Commands

### Main Command (Addr 0)

| Value | Command |
|-------|---------|
| 1 | Start automatic mode |
| 2 | Stop automatic mode |
| 3 | Trigger neutralization |
| 4 | Empty tank 1 |
| 5 | Empty tank 2 |
| 6 | Empty neutralizer |
| 7 | Activate acid pump |
| 8 | Activate agitation |

### RTC Command (Addr 20)

| Value | Command |
|-------|---------|
| 1 | Sync time from registers 23-24 |

### pH Command (Addr 27)

| Value | Command |
|-------|---------|
| 1 | Calibrate LOW point |
| 2 | Calibrate MID point |
| 3 | Calibrate HIGH point |

> Set calibration value in register 30 before sending command

---

## Enums

### Status (Addr 2)

| Value | Status |
|-------|--------|
| 0 | IDLE |
| 1 | NEUTRALIZING |
| 2 | MANUALLY_EMPTYING_WASTE |
| 3 | FORCING_EMPTYING_NEUTRALIZER |
| 4 | MANUALLY_PUMPING_ACID |
| 5 | MANUALLY_BULLING |

### Running Mode (Addr 1)

| Value | Mode |
|-------|------|
| 0 | MANUAL |
| 1 | AUTOMATIC |
