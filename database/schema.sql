-- FARMERS
CREATE TABLE IF NOT EXISTS farmers(
    id VARCHAR(50) PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(50) NOT NULL,
    phone VARCHAR(20)
);

-- PARCELS
CREATE TABLE IF NOT EXISTS parcels(
    id VARCHAR(50) PRIMARY KEY,
    farmer_id VARCHAR(50) NOT NULL,
    name VARCHAR(50) NOT NULL,
    area_ha DECIMAL(10, 2) NOT NULL,
    crop VARCHAR(50) NOT NULL,

    FOREIGN KEY (farmer_id) REFERENCES farmers(id) ON DELETE CASCADE
);

-- PARCEL INDICES/MEASUREMENTS
CREATE TABLE IF NOT EXISTS parcel_indices(
    id SERIAL PRIMARY KEY,
    parcel_id VARCHAR(50) NOT NULL,
    date DATE NOT NULL,
    ndvi DECIMAL(5, 2),
    ndmi DECIMAL(5, 2),
    ndwi DECIMAL(5, 2),
    soc DECIMAL(5, 2) NOT NULL,
    nitrogen DECIMAL(5, 2) NOT NULL,
    phosphorus DECIMAL(5, 2) NOT NULL,
    potassium DECIMAL(5, 2) NOT NULL,
    ph DECIMAL(4, 2) NOT NULL,
    FOREIGN KEY (parcel_id) REFERENCES parcels(id) ON DELETE CASCADE, UNIQUE(parcel_id, date)
);

-- REPORT FREQUENCY
CREATE TABLE IF NOT EXISTS report_frequency(
    farmer_id VARCHAR(50) PRIMARY KEY,
    frequency INTEGER NOT NULL,
    next_report DATE NOT NULL,
    FOREIGN KEY (farmer_id) REFERENCES farmers(id) ON DELETE CASCADE  -- ensures valid id farmer is provided
);

-- Indexes for queries
CREATE INDEX IF NOT EXISTS idx_parcels_farmer_id ON parcels(farmer_id);
CREATE INDEX IF NOT EXISTS idx_parcel_indices_parcel_id ON parcel_indices(parcel_id);
CREATE INDEX IF NOT EXISTS idx_parcel_indices_date ON parcel_indices(date);