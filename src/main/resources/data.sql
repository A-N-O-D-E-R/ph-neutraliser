-- Supplier
INSERT OR REPLACE INTO supplier (id, name, type) VALUES
    ('a1b2c3d4-0000-0000-0000-000000000001', 'Atlas Scientific', 'SHOP'),
    ('a1b2c3d4-0000-0000-0000-000000000002', 'Raspberry Pi', 'SHOP');

-- Models
INSERT OR REPLACE INTO model (id, name, supplier_reference, supplier_id) VALUES
    ('b1b2c3d4-0000-0000-0000-000000000001', 'EZO-pH', 'EZO-PH', 'a1b2c3d4-0000-0000-0000-000000000001'),
    ('b1b2c3d4-0000-0000-0000-000000000002', 'EZO-RTD', 'EZO-RTD', 'a1b2c3d4-0000-0000-0000-000000000001'),
    ('b1b2c3d4-0000-0000-0000-000000000003', 'Raspberry Pi 4B', 'RPI-4B', 'a1b2c3d4-0000-0000-0000-000000000002'),
    ('b1b2c3d4-0000-0000-0000-000000000004', 'CPU Thermometer', 'RPI-THERMO', 'a1b2c3d4-0000-0000-0000-000000000002'),
    ('b1b2c3d4-0000-0000-0000-000000000005', 'Memory Meter', 'RPI-MEM', 'a1b2c3d4-0000-0000-0000-000000000002');

-- Connection Parameters (single-table inheritance, discriminator: connection_type)
-- Modbus connections for pH and thermometer sensors
INSERT OR REPLACE INTO connection_parameters (id, connection_type, update_frequency_seconds, managed, name, slave_id, offset) VALUES
    ('e1b2c3d4-0000-0000-0000-000000000001', 'MODBUS', 5, true, 'neutralizer', 1, 0),
    ('e1b2c3d4-0000-0000-0000-000000000002', 'MODBUS', 10, true, 'neutralizer', 1, 1);
-- System connections for embedded compute sensors
INSERT OR REPLACE INTO connection_parameters (id, connection_type, update_frequency_seconds, managed, pool_name, metric_name) VALUES
    ('e1b2c3d4-0000-0000-0000-000000000003', 'SYSTEM', 30, false, 'cpu', 'system.cpu.temperature'),
    ('e1b2c3d4-0000-0000-0000-000000000004', 'SYSTEM', 30, false, 'memory', 'jvm.memory.used'),
    ('e1b2c3d4-0000-0000-0000-000000000005', 'SYSTEM', 60, false, 'disk', 'disk.total'),
    ('e1b2c3d4-0000-0000-0000-000000000006', 'SYSTEM', 30, false, 'heap', 'jvm.memory.max');

-- Components (single-table inheritance, discriminator: component_type)
-- Neutralizer sensors
INSERT OR REPLACE INTO component (id, component_type, model_id, serial_number, version, connection_parameters_id, type, sensibility, unit) VALUES
    ('c1b2c3d4-0000-0000-0000-000000000001', 'SENSOR', 'b1b2c3d4-0000-0000-0000-000000000001', 'PH-001', 1, 'e1b2c3d4-0000-0000-0000-000000000001', 'PHMETER', 0.01, 'pH'),
    ('c1b2c3d4-0000-0000-0000-000000000002', 'SENSOR', 'b1b2c3d4-0000-0000-0000-000000000002', 'RTD-001', 1, 'e1b2c3d4-0000-0000-0000-000000000002', 'THERMOMETER', 0.1, '°C');
-- Embedded compute internal sensors
INSERT OR REPLACE INTO component (id, component_type, model_id, serial_number, version, connection_parameters_id, type, sensibility, unit) VALUES
    ('c1b2c3d4-0000-0000-0000-000000000003', 'SENSOR', 'b1b2c3d4-0000-0000-0000-000000000004', 'RPI4-THERMO', 1, 'e1b2c3d4-0000-0000-0000-000000000003', 'THERMOMETER', 1.0, '°C'),
    ('c1b2c3d4-0000-0000-0000-000000000004', 'SENSOR', 'b1b2c3d4-0000-0000-0000-000000000005', 'RPI4-RAM', 1, 'e1b2c3d4-0000-0000-0000-000000000004', 'MEMORYMETER', 1.0, 'MB'),
    ('c1b2c3d4-0000-0000-0000-000000000005', 'SENSOR', 'b1b2c3d4-0000-0000-0000-000000000005', 'RPI4-DISK', 1, 'e1b2c3d4-0000-0000-0000-000000000005', 'MEMORYMETER', 1.0, 'MB'),
    ('c1b2c3d4-0000-0000-0000-000000000006', 'SENSOR', 'b1b2c3d4-0000-0000-0000-000000000005', 'RPI4-HEAP', 1, 'e1b2c3d4-0000-0000-0000-000000000006', 'MEMORYMETER', 1.0, 'MB');
-- Embedded compute component
INSERT OR REPLACE INTO component (id, component_type, model_id, serial_number, version, connection_parameters_id, arch, os) VALUES
    ('c1b2c3d4-0000-0000-0000-000000000010', 'EMBEDED_COMPUTE', 'b1b2c3d4-0000-0000-0000-000000000003', 'RPI4-001', 1, 'e1b2c3d4-0000-0000-0000-000000000003', 'ARM', 'UNIX');

-- SensorUsage (single-table inheritance, discriminator: usage_type)
INSERT OR REPLACE INTO sensor_usage (id, usage_type, component_id, installed, accessible, name, metric_name, version) VALUES
    ('d1b2c3d4-0000-0000-0000-000000000001', 'PHMETER', 'c1b2c3d4-0000-0000-0000-000000000001', true, true, 'neutralizer', 'ph', 1),
    ('d1b2c3d4-0000-0000-0000-000000000002', 'THERMOMETER', 'c1b2c3d4-0000-0000-0000-000000000002', true, true, 'neutralizer', 'degree', 1),
    ('d1b2c3d4-0000-0000-0000-000000000003', 'THERMOMETER', 'c1b2c3d4-0000-0000-0000-000000000003', true, true, 'rpi4-cpu-temp', 'cpu_temperature', 1),
    ('d1b2c3d4-0000-0000-0000-000000000004', 'MEMORYMETER', 'c1b2c3d4-0000-0000-0000-000000000004', true, true, 'rpi4-ram', 'ram_used', 1),
    ('d1b2c3d4-0000-0000-0000-000000000005', 'MEMORYMETER', 'c1b2c3d4-0000-0000-0000-000000000005', true, true, 'rpi4-disk', 'disk_used', 1),
    ('d1b2c3d4-0000-0000-0000-000000000006', 'MEMORYMETER', 'c1b2c3d4-0000-0000-0000-000000000006', true, true, 'rpi4-heap', 'heap_used', 1);

-- EmbededComputeUsage
INSERT OR REPLACE INTO embeded_compute_usage (id, component_id, accessible, name, version, thermometer_cpu_usage_id, memorymetre_ram_usage_id, memorymetre_disque_usage_id, memorymetre_heap_usage_id) VALUES
    ('f1b2c3d4-0000-0000-0000-000000000001', 'c1b2c3d4-0000-0000-0000-000000000010', true, 'rpi4', 1, 'd1b2c3d4-0000-0000-0000-000000000003', 'd1b2c3d4-0000-0000-0000-000000000004', 'd1b2c3d4-0000-0000-0000-000000000005', 'd1b2c3d4-0000-0000-0000-000000000006');
