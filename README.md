# OpenNeutralizer

This project aim to create a simple OpenSource and OpenHardware ph-neutralizer, this can help future open lab initiative and create a simple fundation for a larger ecosystem. 

## How 

This neutralizer aim to neutralize high PH liquid with acid to be able to send to the waste within the specs of the french regulation. It keep history of all the neutralization and the ph/temp measure locally. 

The functionment of this Hardware is straight forward. it is composed of 4 receipient : 
- WASTE 1
- WASTE 2
- ACID 
- MAIN TANK

All the High ph Liquid arrive in one of the waste tank, and depending on the configuration it will trigger a Neutralization cycle : 
1. put the Waste in the Main Tank,
2. start the air mixing 
3. will send acid pulse until the ph goes below a certain value - given by the config
4. stop the air mixing
5. send the Neutralize liquid to the waste. 

Want to build your own ph-neutralizer go to [build instruction](./docs/BUILD_INSTRUCTION.md)

## Features & Technologies

- **Modbus RTU** - Hardware communication via serial port
- **Event Logging** - JSON/XML structured logs with daily rotation
- **Auto Archive** - Gzip compression of old logs (7+ days)
- **B2 Backup** - Cloud backup to Backblaze B2
- **React Frontend** - Dashboard with TanStack Query
- **Mock Mode** - Development without hardware

## Requirements

- Java 25+
- Maven 4+
- Bun 1.1+ (frontend)

## Quick Start

```bash
# Run with mock (no hardware)
mvn spring-boot:run -Dspring-boot.run.profiles=local

# Run with hardware
mvn spring-boot:run

# Build with frontend
mvn clean package
```

## Configuration

### application.yml

```yaml
# Modbus
modbus:
  connections:
    - name: neutralizer
      host: rtu:///dev/ttyACM0:38400
      timeout: 2000

# Neutralizer
neutralizer:
  connection-name: neutralizer
  slave-id: 1

# Scheduler
scheduler:
  watcher:
    status-rate: 10000          # Poll status every 10s
  archive:
    cron: "0 0 2 * * *"         # Archive at 2 AM
  backup:
    cron: "0 30 2 * * *"        # Backup at 2:30 AM

# Logging
logging:
  event:
    path: ./logs
    retention-days: 30

# B2 Backup (optional)
b2:
  enabled: ${B2_ENABLED:false}
  application-key-id: ${B2_KEY_ID:}
  application-key: ${B2_KEY:}
  default-bucket-name: ${B2_BUCKET:ph-neutralizer-backup}
```

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/neutralizer/status` | Get current status |
| GET | `/api/neutralizer/configuration` | Get configuration |
| PUT | `/api/neutralizer/configuration` | Update configuration |
| POST | `/api/neutralizer/mode/automatic` | Start automatic mode |
| POST | `/api/neutralizer/mode/manual` | Stop automatic mode |
| POST | `/api/neutralizer/neutralize` | Trigger neutralization |
| POST | `/api/neutralizer/manual/empty-tank1` | Empty tank 1 |
| POST | `/api/neutralizer/manual/empty-tank2` | Empty tank 2 |
| POST | `/api/neutralizer/manual/empty-neutralizer` | Empty neutralizer |
| POST | `/api/neutralizer/manual/acid-pump` | Activate acid pump |
| POST | `/api/neutralizer/manual/agitation` | Activate agitation |
| POST | `/api/neutralizer/calibrate` | Calibrate pH sensor |
| GET | `/api/neutralizer/hardware` | Get hardware status |
| POST | `/api/neutralizer/sync-time` | Synchronize device time |

Swagger UI: http://localhost:8080/api/swagger-ui.html

## Docker

```bash
# Build
docker build -t ph-neutralizer .

# Run with serial port
docker run -p 8080:8080 --device=/dev/ttyACM0 ph-neutralizer

# Docker Compose
docker-compose up -d
```

## Frontend Development

```bash
cd src/main/ts
bun install
bun run dev
```

## Event Logs

**JSON** (`logs/events.json`):
```json
{"type":"MeasureEvent","metricName":"PH","value":7.2,"unit":"pH","timestamp":"2024-01-15T10:30:00"}
```

**XML** (`logs/events.xml`):
```xml
<MeasureEvent metricName="PH" value="7.2" unit="pH" timestamp="2024-01-15T10:30:00"/>
```

## Modbus Register Map

See [docs/MODBUS.md](docs/MODBUS.md)

## Profiles

| Profile | Description |
|---------|-------------|
| (default) | Production with real hardware |
| `local` | Mock services, no hardware |
| `test` | Test configuration |

## Environment Variables

| Variable | Description |
|----------|-------------|
| `B2_ENABLED` | Enable B2 backup |
| `B2_KEY_ID` | B2 application key ID |
| `B2_KEY` | B2 application key |
| `B2_BUCKET` | B2 bucket name |




```bash 
curl https://localhost:8443  --cert certs/client.crt  --key certs/client.key  --cacert certs/ca.crt
```