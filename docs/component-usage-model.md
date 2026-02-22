# Component – Usage Model

## Core idea

The model splits hardware representation from application logic into two parallel hierarchies.

- **Component** — *what the hardware is* (physical identity, connection config, model/serial).
- **Usage** — *how the hardware is used* (business methods, role in the installation).

This decouples the hardware catalogue from its application-level behaviour.

---

## Component hierarchy

```
Component  (id, model, serialNumber, version)
└── NetworkingComponent  (+ connectionParameters)
    ├── Sensor  (sensorType, sensibility, unit)
    └── Actuator  (actuatorType, state)
        └── NeutralizerActuatorComponent  (register map via offsets)
```

`Component` is a single-table JPA entity. Every subtype adds hardware-specific fields.
`NetworkingComponent` adds `ConnectionParameters`, which carries the address/protocol details and polling frequency.

`NeutralizerActuatorComponent` is concrete: it exposes typed `getXxxConnectionParameters()` helpers that compute register addresses as offsets from a base register.

---

## Usage hierarchy

```
ComponantUsage  (id, name, component → Component, version)
└── NetworkingComponantUsage  (+ accessible)
    ├── SensorUsage<T>  (installed, metricName, abstract getMesure(reader))
    │   ├── PhMeterUsage
    │   ├── ThermoMeterUsage
    │   ├── TankLevelSensorUsage
    │   └── MemorymeterUsage
    └── ActuatorUsage
        └── PhNeutraliserUsage  (commands + reads + configuration)
```

Each `Usage` holds a reference to its `Component` and contains the business methods.
`SensorUsage<T>` declares the `getMesure(RawValueReader)` contract; concrete subclasses implement the raw→domain conversion (e.g. divide by 100 for pH).

`PhNeutraliserUsage` is the richest usage: it exposes every command (`startAutomatic`, `emptyTank1`, `calibratePh`, …) and delegates to `NeutralizerActuatorComponent` for the exact register address.

---

## How reads and writes work

`RawValueReader` and `ValueWriter` are injected **at call time**, not stored in the model. This keeps the model persistence-friendly and makes mock/real switching trivial.

```java
// caller decides which reader to inject
double ph = phMeterUsage.getMesure(reader);
neutraliserUsage.startAutomatic(writer);
```

The `ConnectionParameters` (address, slave ID, offset…) come from the `Component` side. The `Usage` just delegates:

```java
// inside PhNeutraliserUsage
public void startAutomatic(ValueWriter writer) {
    writer.write(CMD_START_AUTO, getNeutralizer().getCommandConnectionParameters());
}
```

---

## Summary

| Concern | Where it lives |
|---|---|
| Physical identity (model, serial, version) | `Component` |
| Protocol/address | `ConnectionParameters` (on `NetworkingComponent`) |
| Application role & business logic | `Usage` |
| I/O implementation (mock vs real) | `RawValueReader` / `ValueWriter` (injected) |
