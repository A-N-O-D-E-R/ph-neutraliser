# Build Instructions — OpenNeutralizer

> **Status:** Work in progress. Sections marked `[TODO]` need additional details.

---

## Table of Contents

1. [Overview](#1-overview)
2. [Bill of Materials](#2-bill-of-materials)
3. [Wiring & Schematic](#3-wiring--schematic)
4. [Assembly Steps](#4-assembly-steps)
5. [Software Setup](#5-software-setup)

---

## 1. Overview

The OpenNeutralizer is built around two compute boards:

- A **Raspberry Pi 4B** that runs the Java application and serves the web UI.
- An **Arduino Uno R3** that acts as the Modbus RTU slave, directly driving sensors, relays, and actuators.

The Pi communicates with the Arduino over a USB serial link (Modbus RTU, `/dev/ttyACM0`, 38400 baud).
<p align="center">
<img src="./diagram-ph-neutralizer.svg">
</p>
**Fluid circuit — 4 tanks:**

| Tank | Role |
|------|------|
| Waste 1 | Receives high-pH effluent |
| Waste 2 | Receives high-pH effluent (alternate) |
| Acid | Stores dosing acid |
| Main / Neutralizer | Neutralization takes place here |

---

## 2. Bill of Materials

### Compute

| Qty | Component | Reference | Supplier |
|-----|-----------|-----------|---------|
| 1 | Single-board computer | Raspberry Pi 4B | Raspberry Pi |
| 1 | Micro-SD card (≥ 16 GB, class 10) | — | — |
| 1 | Microcontroller | Arduino Uno R3 | Arduino |
| 1 | USB-A to USB-B cable (Pi → Arduino) | — | — |

### Sensors

| Qty | Component | Reference | Supplier |
|-----|-----------|-----------|---------|
| 1 | pH circuit | EZO-pH | Atlas Scientific |
| 1 | pH probe | ENV-40-pH | Atlas Scientific |
| 1 | Temperature circuit | EZO-RTD | Atlas Scientific |
| 1 | RTD temperature probe | ENV-10-TMP  | Atlas Scientific |
| 1 | Real-time clock module | DS3231 | — |
| 4 | Liquid level float switch | — | — |

> The four float switches monitor: Neutralizer tank, Waste tank 1, Waste tank 2, Acid tank.

### Actuators

| Qty | Component | Notes |
|-----|-----------|-------|
| 1 | Relay board | [TODO: number of channels, model] |
| 1 | Waste pump 1 | Transfers Waste 1 → Main tank |
| 1 | Waste pump 2 | Transfers Waste 2 → Main tank |
| 1 | Acid dosing pump (peristaltic) | Injects acid into Main tank |
| 1 | Neutralizer output pump | Empties Main tank to drain |
| 1 | Air pump / agitator | Mixes liquid during neutralization |

### Tanks & Plumbing

| Qty | Item | Notes |
|-----|------|-------|
| 4 | Tanks | [TODO: material (HDPE recommended), volume] |
| — | Tubing | [TODO: diameter, material] |
| — | Fittings, check valves, clamps | [TODO] |

### Power

| Item | Notes |
|------|-------|
| 5 V / 3 A power supply | For Raspberry Pi 4B (USB-C) |
| [TODO] | Power supply for relay board and pumps |

---

## 3. Wiring & Schematic

### 3.1 Raspberry Pi → Arduino

Connect the Arduino to any USB-A port on the Raspberry Pi. The Arduino will appear as `/dev/ttyACM0` (or `/dev/ttyACM1` if another device is already connected).

### 3.2 Arduino → Atlas Scientific EZO-pH

The EZO-pH circuit can operate in **UART** or **I2C** mode. [TODO: specify which mode is used in your build and the exact pin connections.]

Example wiring (UART mode):

| EZO-pH pin | Arduino pin |
|------------|-------------|
| TX | RX (pin 0) |
| RX | TX (pin 1) |
| GND | GND |
| VCC | 3.3 V or 5 V |

### 3.3 Arduino → Atlas Scientific EZO-RTD

[TODO: same as EZO-pH — specify UART or I2C mode and pin connections.]

### 3.4 Arduino → DS3231 RTC (I2C)

| DS3231 pin | Arduino pin |
|------------|-------------|
| SDA | A4 |
| SCL | A5 |
| GND | GND |
| VCC | 3.3 V or 5 V |

### 3.5 Arduino → Float Switches

Each float switch is wired as a normally-open (or normally-closed) digital input with a pull-up resistor.

| Switch | Arduino digital pin | Modbus register |
|--------|---------------------|-----------------|
| Neutralizer tank full | [TODO] | 15 |
| Waste tank 1 full | [TODO] | 17 |
| Waste tank 2 full | [TODO] | 19 |
| Acid tank low | [TODO] | 29 |

### 3.6 Arduino → Relay Board

The relay board is controlled by the Arduino and switches the pumps and air agitator. The relay status is reported in Modbus register 18 (bit array).

| Relay channel | Controlled device | [TODO: Arduino pin] |
|---------------|------------------|---------------------|
| 1 | Waste pump 1 | — |
| 2 | Waste pump 2 | — |
| 3 | Acid dosing pump | — |
| 4 | Neutralizer output pump | — |
| 5 | Air agitator | — |

> **Safety note:** The relay board switches mains or high-voltage DC for the pumps. Make sure all high-voltage wiring is done by a qualified electrician and protected by appropriate fuses/circuit breakers.

---

## 4. Assembly Steps

### Step 1 — Prepare the compute boards

1. Flash Raspberry Pi OS (64-bit, Lite recommended) onto the SD card.
2. Enable SSH and configure Wi-Fi if needed (via `raspi-config` or `cloud-init`).
3. Upload the Arduino firmware to the Uno R3 using the Arduino IDE. [TODO: link to firmware source or sketch location.]
4. Connect the Arduino to the Pi via USB.

### Step 2 — Mount and wire sensors

1. Install the EZO-pH circuit and probe in the Main / Neutralizer tank. The probe must be fully submerged.
2. Install the EZO-RTD circuit and probe in the Main / Neutralizer tank next to the pH probe.
3. Wire both EZO circuits to the Arduino (see §3.2 and §3.3).
4. Connect the DS3231 RTC module to the Arduino I2C bus (see §3.4).

### Step 3 — Install float switches

1. Mount one float switch in each of the four tanks at the target "full" fill level (or "low" for the acid tank).
2. Wire each switch to the corresponding Arduino digital input with a pull-up resistor (see §3.5).

### Step 4 — Wire the relay board and pumps

1. Mount the relay board in a waterproof enclosure separate from the tanks.
2. Connect the Arduino control pins to the relay input channels (see §3.6).
3. Wire each pump and the air agitator to the corresponding relay output.
4. Connect the power supply for the pumps through the relay contacts.

### Step 5 — Plumbing

1. Connect Waste tank 1 and Waste tank 2 to the Main tank via pumps 1 and 2.
2. Connect the Acid tank to the Main tank via the dosing pump.
3. Connect the Main tank outlet to the drain via the output pump.
4. Install the air diffuser at the bottom of the Main tank and connect it to the air pump.
5. [TODO: check-valve placement to prevent backflow.]

### Step 6 — Power on and verify

1. Power the Raspberry Pi and verify it boots correctly.
2. Verify the Arduino is detected: `ls /dev/ttyACM*`
3. Run the application in mock mode first to confirm the software stack works:
   ```bash
   mvn spring-boot:run -Dspring-boot.run.profiles=local
   ```
4. Switch to real hardware mode and check the `/api/neutralizer/hardware` endpoint for sensor readings.

---

## 5. Software Setup

### 5.1 Prerequisites (Raspberry Pi)

First install java 25 on your pi (or other compute)
```bash
# Java 25+
ssh <user>@<raspberry-pi-ip> 
# --- WAITING FOR CONNECTION ---
sudo apt install -y wget

wget -qO - https://packages.adoptium.net/artifactory/api/gpg/key/public | sudo gpg --dearmor -o /usr/share/keyrings/adoptium.gpg

echo "deb [signed-by=/usr/share/keyrings/adoptium.gpg] https://packages.adoptium.net/artifactory/deb $(lsb_release -cs) main" | sudo tee /etc/apt/sources.list.d/adoptium.list

sudo apt update
sudo apt search temurin-25
sudo apt install temurin-25-jre
```
### 5.2 Clone and build

on your laptop build the project, to check that evrything is ok:

```bash
git clone https://github.com/A-N-O-D-E-R/ph-neutraliser.git
cd ph-neutraliser

# Build with bundled frontend
mvn clean compile
```

### 5.2 Configure

Edit or create `src/main/resources/application-prod.yml` to match your hardware:

```yaml
spring:
  datasource:
    url: jdbc:sqlite:/var/lib/ph-neutralizer/hardware.db
    driver-class-name: org.sqlite.JDBC

  jpa:
    database-platform: org.hibernate.community.dialect.SQLiteDialect
    hibernate:
      ddl-auto: validate
    show-sql: false
    open-in-view: false

  sql:
    init:
      mode: never

modbus:
  connections:
    - name: neutralizer
      host: rtu:///dev/ttyACM0:38400   # adjust port if needed
      timeout: 2000

neutralizer:
  connection-name: neutralizer
  slave-id: 1
```




### 5.4 build

```bash
mvn clean package
```


### 5.4 run (locally)

```bash 
# Production (real hardware)
java -jar target/ph-neutralizer-*.jar
# Or with Maven
mvn spring-boot:run
```

Access the dashboard at: `http://localhost:8080`

### 5.5 (Optional) mTLS

To enable mutual TLS on port 8443 run the below command before packaging, but if you have the infra prefer reverse-proxy.

```bash
sudo apt install -y openssl
bash generate-mtls.sh
```

Then import `certs/client.p12` into your browser. See the main [README](../README.md#mtls-optional) for details.


### 5.6 Run as a systemd service on the production device
make sure that user have root privilege on the targeted device.

```bash
ssh <user>@<raspberry-pi-ip> mkdir -p /opt/ph-neutralizer/releases
scp target/ph-neutralizer-*.jar <user>@<raspberry-pi-ip>:/opt/ph-neutralizer/releases/app-X.X.X.jar

ssh <user>@<raspberry-pi-ip> 
# after connection 
sudo useradd -r -s /bin/false phuser
sudo chown -R phuser:phuser /opt/ph-neutralizer
cd /opt/ph-neutralizer
ln -sfn releases/app-X.X.X.jar current

sudo mkdir -p /var/lib/ph-neutralizer
sudo chown -R phuser:phuser /var/lib/ph-neutralizer
sudo chmod 750 /var/lib/ph-neutralizer

```

create the file /etc/udev/rules.d/99-arduino.rules (this aim at created robust usb configuration)

```bash 
SUBSYSTEM=="tty", ATTRS{idVendor}=="2341", ATTRS{idProduct}=="0043", SYMLINK+="ph-arduino"
```
then reload : 

```bash
sudo udevadm control --reload-rules
sudo udevadm trigger
```

go to `/etc/systemd/system/ph-neutralizer.service`

```toml
# /etc/systemd/system/ph-neutralizer.service
[Unit]
Description=PH Neutralizer Industrial Gateway
After=network.target dev-ph-arduino.device
Requires=dev-ph-arduino.device
BindsTo=dev-ph-arduino.device

[Service]
Type=simple
User=phuser
Group=phuser

WorkingDirectory=/opt/ph-neutralizer

# WARNING : you may change the java path depending on how you install it.
ExecStart=/usr/bin/java \ 
  -Xms256m \
  -Xmx512m \
  -Dspring.profiles.active=prod \
  -Djava.security.egd=file:/dev/urandom \
  -jar /opt/ph-neutralizer/current

SuccessExitStatus=143

Restart=always
RestartSec=5

TimeoutStartSec=60
TimeoutStopSec=30

# ================= HARDENING =================
NoNewPrivileges=true
PrivateTmp=true
ProtectSystem=strict
ProtectHome=true
ProtectKernelTunables=true
ProtectKernelModules=true
ProtectControlGroups=true
MemoryDenyWriteExecute=true
RestrictRealtime=true
RestrictSUIDSGID=true
LockPersonality=true

# Allow write ONLY where needed
ReadWritePaths=/var/lib/ph-neutralizer

# Resource control
LimitNOFILE=4096
MemoryMax=700M
CPUQuota=80%

[Install]
WantedBy=multi-user.target

```

Then reload and enable service

```bash
sudo systemctl daemon-reload
sudo systemctl enable ph-neutralizer
```

#### Live update 

I do not have a release server (for now), but you can either build one or wait for my lazyness to go away. Either case when the time will come you could update by using this kind of script : 

```bash 
#!/usr/bin/env bash
set -euo pipefail

APP_DIR="/opt/ph-neutralizer"
RELEASES="$APP_DIR/releases"
SERVICE="ph-neutralizer"

VERSION="$1"
ORIGINAL-JAR="ph-neutralizer-$VERSION.jar"
JAR="app-$VERSION.jar"

echo "Downloading version $VERSION..."

curl -fL -o "$RELEASES/$JAR" \
  "https://<A-N-O-D-E-R_SERVER>/releases/$ORIGINAL"

echo "Switching version..."

ln -sfn "$RELEASES/$JAR" "$APP_DIR/current"

echo "Restarting service..."

systemctl restart "$SERVICE"

sleep 5

if systemctl is-active --quiet "$SERVICE"; then
  echo "Update successful"
else
  echo "Update failed — rolling back"
  systemctl stop "$SERVICE"
  ln -sfn "$(ls -t $RELEASES | sed -n 2p)" "$APP_DIR/current"
  systemctl start "$SERVICE"
fi
```

---



## Notes & Safety

- Always verify the pH target threshold matches local regulations before deploying in production.
- The acid dosing system handles corrosive chemicals. Wear appropriate PPE during assembly and maintenance.
- Use acid-resistant materials (HDPE, PVDF, or similar) for all tanks and tubing in contact with the acid.
- Keep all electronics in sealed, splash-proof enclosures.
