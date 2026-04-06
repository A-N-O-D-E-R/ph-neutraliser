-- ========================
-- USERS
-- ========================
INSERT OR IGNORE INTO app_user(id, username, password_hash, role, created_at) VALUES
('00000000-0000-0000-0000-000000000001','admin','admin','admin','2024-01-01T00:00:00Z');

-- ========================
-- SUPPLIERS
-- ========================
INSERT OR REPLACE INTO supplier(id, name, type) VALUES
('a1b2c3d4-0000-0000-0000-000000000001','Atlas Scientific','SHOP'),
('a1b2c3d4-0000-0000-0000-000000000002','Raspberry Pi','SHOP'),
('a1b2c3d4-0000-0000-0000-000000000003','Arduino','SHOP');

-- ========================
-- MODELS
-- ========================
INSERT OR REPLACE INTO model (id, name, supplier_reference, supplier_id) VALUES
-- Atlas
('b1b2c3d4-0000-0000-0000-000000000001','EZO-pH','EZO-PH','a1b2c3d4-0000-0000-0000-000000000001'),
('b1b2c3d4-0000-0000-0000-000000000002','EZO-RTD','EZO-RTD','a1b2c3d4-0000-0000-0000-000000000001'),

-- Raspberry
('b1b2c3d4-0000-0000-0000-000000000003','Raspberry Pi 4B','RPI-4B','a1b2c3d4-0000-0000-0000-000000000002'),
('b1b2c3d4-0000-0000-0000-000000000004','CPU Thermometer','RPI-THERMO','a1b2c3d4-0000-0000-0000-000000000002'),
('b1b2c3d4-0000-0000-0000-000000000005','Memory Meter','RPI-MEM','a1b2c3d4-0000-0000-0000-000000000002'),

-- Arduino
('b1b2c3d4-0000-0000-0000-000000000006','Neutralizer Controller','ARD-UNO-R3','a1b2c3d4-0000-0000-0000-000000000003'),
('b1b2c3d4-0000-0000-0000-000000000007','DS3231 RTC','DS3231','a1b2c3d4-0000-0000-0000-000000000003'),
('b1b2c3d4-0000-0000-0000-000000000008','Liquid Level Switch','FLOAT-SWITCH','a1b2c3d4-0000-0000-0000-000000000003');

-- ========================
-- CONNECTION PARAMETERS
-- ========================
INSERT OR REPLACE INTO connection_parameters
(id, connection_type, update_frequency_seconds, managed, name, slave_id, offset)
VALUES
('c1b2c3d4-0000-0000-0000-000000000001','MODBUS',5,true,'neutralizer',1,0),
('c1b2c3d4-0000-0000-0000-000000000002','MODBUS',10,true,'neutralizer',1,1),
('c1b2c3d4-0000-0000-0000-000000000007','MODBUS',10,false,'neutralizer',1,0),
('c1b2c3d4-0000-0000-0000-000000000008','MODBUS',60,false,'neutralizer',1,20),
-- Level sensors (Arduino Modbus registers 15, 17, 19, 29)
('c1b2c3d4-0000-0000-0000-000000000009','MODBUS',5,false,'neutralizer',1,15),
('c1b2c3d4-0000-0000-0000-000000000010','MODBUS',5,false,'neutralizer',1,17),
('c1b2c3d4-0000-0000-0000-000000000011','MODBUS',5,false,'neutralizer',1,19),
('c1b2c3d4-0000-0000-0000-000000000012','MODBUS',5,false,'neutralizer',1,29);

INSERT OR REPLACE INTO connection_parameters
(id, connection_type, update_frequency_seconds, managed, pool_name, metric_name)
VALUES
('c1b2c3d4-0000-0000-0000-000000000003','SYSTEM',30,false,'cpu','system.cpu.temperature'),
('c1b2c3d4-0000-0000-0000-000000000004','SYSTEM',30,false,'memory','jvm.memory.used'),
('c1b2c3d4-0000-0000-0000-000000000005','SYSTEM',60,false,'disk','disk.total'),
('c1b2c3d4-0000-0000-0000-000000000006','SYSTEM',30,false,'heap','jvm.memory.max');

-- ========================
-- COMPONENTS
-- ========================
INSERT OR REPLACE INTO component
(id, component_type, model_id, serial_number, version, connection_parameters_id, sensor_type, sensibility, unit)
VALUES
-- Neutralizer sensors
('d1b2c3d4-0000-0000-0000-000000000001','SENSOR','b1b2c3d4-0000-0000-0000-000000000001','PH-001',1,'c1b2c3d4-0000-0000-0000-000000000001','PHMETER',0.01,'pH'),
('d1b2c3d4-0000-0000-0000-000000000002','SENSOR','b1b2c3d4-0000-0000-0000-000000000002','RTD-001',1,'c1b2c3d4-0000-0000-0000-000000000002','THERMOMETER',0.1,'°C'),

-- Level sensors (Arduino)
('d1b2c3d4-0000-0000-0000-000000000013','SENSOR','b1b2c3d4-0000-0000-0000-000000000008','LEVEL-NEUT-001',1,'c1b2c3d4-0000-0000-0000-000000000009','TANKLEVEL',1.0,'bool'),
('d1b2c3d4-0000-0000-0000-000000000014','SENSOR','b1b2c3d4-0000-0000-0000-000000000008','LEVEL-WASTE-001',1,'c1b2c3d4-0000-0000-0000-000000000010','TANKLEVEL',1.0,'bool'),
('d1b2c3d4-0000-0000-0000-000000000015','SENSOR','b1b2c3d4-0000-0000-0000-000000000008','LEVEL-WASTE-BIS-001',1,'c1b2c3d4-0000-0000-0000-000000000011','TANKLEVEL',1.0,'bool'),
('d1b2c3d4-0000-0000-0000-000000000016','SENSOR','b1b2c3d4-0000-0000-0000-000000000008','LEVEL-ACID-001',1,'c1b2c3d4-0000-0000-0000-000000000012','TANKLEVEL',1.0,'bool'),

-- RPi internal sensors
('d1b2c3d4-0000-0000-0000-000000000003','SENSOR','b1b2c3d4-0000-0000-0000-000000000004','RPI4-THERMO',1,'c1b2c3d4-0000-0000-0000-000000000003','THERMOMETER',1.0,'°C'),
('d1b2c3d4-0000-0000-0000-000000000004','SENSOR','b1b2c3d4-0000-0000-0000-000000000005','RPI4-RAM',1,'c1b2c3d4-0000-0000-0000-000000000004','MEMORYMETER',1.0,'MB'),
('d1b2c3d4-0000-0000-0000-000000000005','SENSOR','b1b2c3d4-0000-0000-0000-000000000005','RPI4-DISK',1,'c1b2c3d4-0000-0000-0000-000000000005','MEMORYMETER',1.0,'MB'),
('d1b2c3d4-0000-0000-0000-000000000006','SENSOR','b1b2c3d4-0000-0000-0000-000000000005','RPI4-HEAP',1,'c1b2c3d4-0000-0000-0000-000000000006','MEMORYMETER',1.0,'MB');

INSERT OR REPLACE INTO component
(id, component_type, model_id, serial_number, version, connection_parameters_id, arch, os)
VALUES
('d1b2c3d4-0000-0000-0000-000000000010','EMBEDED_COMPUTE','b1b2c3d4-0000-0000-0000-000000000003','RPI4-001',1,'c1b2c3d4-0000-0000-0000-000000000003','ARM','UNIX');

INSERT OR REPLACE INTO component
(id, component_type, model_id, serial_number, version, connection_parameters_id, actuator_type)
VALUES
('d1b2c3d4-0000-0000-0000-000000000011','NEUTRALIZER_ACTUATOR','b1b2c3d4-0000-0000-0000-000000000006','ARD-001',1,'c1b2c3d4-0000-0000-0000-000000000007','AUTOMATA'),
('d1b2c3d4-0000-0000-0000-000000000012','CLOCK_RTC','b1b2c3d4-0000-0000-0000-000000000007','DS3231-001',1,'c1b2c3d4-0000-0000-0000-000000000008',NULL);

-- ========================
-- SENSOR USAGE
-- ========================
INSERT OR REPLACE INTO sensor_usage
(id, usage_type, component_id, installed, accessible, name, metric_name, version)
VALUES
('e1b2c3d4-0000-0000-0000-000000000001','PHMETER','d1b2c3d4-0000-0000-0000-000000000001',true,true,'neutralizer','ph',1),
('e1b2c3d4-0000-0000-0000-000000000002','THERMOMETER','d1b2c3d4-0000-0000-0000-000000000002',true,true,'neutralizer','degree',1),
('e1b2c3d4-0000-0000-0000-000000000003','THERMOMETER','d1b2c3d4-0000-0000-0000-000000000003',true,true,'rpi4-cpu-temp','cpu_temperature',1),
('e1b2c3d4-0000-0000-0000-000000000004','MEMORYMETER','d1b2c3d4-0000-0000-0000-000000000004',true,true,'rpi4-ram','ram_used',1),
('e1b2c3d4-0000-0000-0000-000000000005','MEMORYMETER','d1b2c3d4-0000-0000-0000-000000000005',true,true,'rpi4-disk','disk_used',1),
('e1b2c3d4-0000-0000-0000-000000000006','MEMORYMETER','d1b2c3d4-0000-0000-0000-000000000006',true,true,'rpi4-heap','heap_used',1),
('e1b2c3d4-0000-0000-0000-000000000007','TANKLEVEL','d1b2c3d4-0000-0000-0000-000000000013',true,true,'neutralizer','neutralizer_tank_level',1),
('e1b2c3d4-0000-0000-0000-000000000008','TANKLEVEL','d1b2c3d4-0000-0000-0000-000000000014',true,true,'neutralizer','waste_tank_level',1),
('e1b2c3d4-0000-0000-0000-000000000009','TANKLEVEL','d1b2c3d4-0000-0000-0000-000000000015',true,true,'neutralizer','waste_bis_tank_level',1),
('e1b2c3d4-0000-0000-0000-000000000010','TANKLEVEL','d1b2c3d4-0000-0000-0000-000000000016',true,true,'neutralizer','acid_tank_level',1);

-- ========================
-- EMBEDDED COMPUTE USAGE
-- ========================
INSERT OR REPLACE INTO embeded_compute_usage
(id, component_id, accessible, name, version,
 thermometer_cpu_usage_id,
 memorymetre_ram_usage_id,
 memorymetre_disque_usage_id,
 memorymetre_heap_usage_id)
VALUES
('f1b2c3d4-0000-0000-0000-000000000001',
 'd1b2c3d4-0000-0000-0000-000000000010',
 true,'rpi4',1,
 'e1b2c3d4-0000-0000-0000-000000000003',
 'e1b2c3d4-0000-0000-0000-000000000004',
 'e1b2c3d4-0000-0000-0000-000000000005',
 'e1b2c3d4-0000-0000-0000-000000000006');

-- ========================
-- ACTUATOR & RTC USAGE
-- ========================
INSERT OR REPLACE INTO ph_neutraliser_usage
(id, component_id, accessible, name, version)
VALUES
('a2b2c3d4-0000-0000-0000-000000000001',
 'd1b2c3d4-0000-0000-0000-000000000011',
 true,'neutralizer-actuator',1);

INSERT OR REPLACE INTO clock_rtc_component_usage
(id, component_id, accessible, name, version, installed)
VALUES
('a2b2c3d4-0000-0000-0000-000000000002',
 'd1b2c3d4-0000-0000-0000-000000000012',
 true,'neutralizer-clock',1,true);