-- Supplier
INSERT OR REPLACE INTO supplier (id, name, type) VALUES
    ('a1b2c3d4-0000-0000-0000-000000000001', 'Atlas Scientific', 'SHOP');

-- Models
INSERT OR REPLACE INTO model (id, name, supplier_reference, supplier_id) VALUES
    ('b1b2c3d4-0000-0000-0000-000000000001', 'EZO-pH', 'EZO-PH', 'a1b2c3d4-0000-0000-0000-000000000001'),
    ('b1b2c3d4-0000-0000-0000-000000000002', 'EZO-RTD', 'EZO-RTD', 'a1b2c3d4-0000-0000-0000-000000000001');

-- Sensors
INSERT OR REPLACE INTO sensor (id, model_id, type, serial_number, version, sensibility, unit) VALUES
    ('c1b2c3d4-0000-0000-0000-000000000001', 'b1b2c3d4-0000-0000-0000-000000000001', 'PHMETER', 'PH-001', 1, 0.01, 'pH'),
    ('c1b2c3d4-0000-0000-0000-000000000002', 'b1b2c3d4-0000-0000-0000-000000000002', 'THERMOMETER', 'RTD-001', 1, 0.1, '°C');

-- SensorUsage (single-table inheritance, discriminator column: usage_type)
INSERT OR REPLACE INTO sensor_usage (id, usage_type, sensor_id, installed, name, slave_id, offset, update_frequency_seconds, managed, metric_name) VALUES
    ('d1b2c3d4-0000-0000-0000-000000000001', 'PHMETER', 'c1b2c3d4-0000-0000-0000-000000000001', true, 'neutralizer', 1, 0, 5, true, 'ph'),
    ('d1b2c3d4-0000-0000-0000-000000000002', 'THERMOMETER', 'c1b2c3d4-0000-0000-0000-000000000002', true, 'neutralizer', 1, 1, 10, true, 'degree');
