-- SQL Schema for Casa Select Management (Supabase)
-- Execute este script no SQL Editor do seu projeto Supabase para criar a estrutura do banco de dados.
-- NOTA: Os nomes das colunas usam aspas duplas para preservar o formato camelCase do TypeScript.

-- 1. Tabela de Propriedades (Properties)
CREATE TABLE IF NOT EXISTS properties (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    location TEXT NOT NULL,
    description TEXT,
    image TEXT,
    stars NUMERIC(3, 2) DEFAULT 5.0,
    rooms INTEGER DEFAULT 3,
    bathrooms INTEGER,
    guests INTEGER,
    "pricePerNight" NUMERIC(10, 2),
    "sizeSqM" INTEGER
);

-- 2. Tabela de Faturamento (Revenues)
CREATE TABLE IF NOT EXISTS revenues (
    id TEXT PRIMARY KEY,
    "propertyId" TEXT REFERENCES properties(id) ON DELETE CASCADE,
    origin TEXT NOT NULL,
    value NUMERIC(12, 2) NOT NULL,
    taxes NUMERIC(12, 2) DEFAULT 0.0,
    date TEXT NOT NULL,
    description TEXT,
    attachment TEXT
);

-- 3. Tabela de Despesas (Expenses)
CREATE TABLE IF NOT EXISTS expenses (
    id TEXT PRIMARY KEY,
    "propertyId" TEXT REFERENCES properties(id) ON DELETE CASCADE,
    category TEXT NOT NULL,
    supplier TEXT NOT NULL,
    date TEXT NOT NULL,
    value NUMERIC(12, 2) NOT NULL,
    receipt TEXT,
    "paymentMethod" TEXT NOT NULL,
    description TEXT
);

-- 4. Tabela de Reservas (Bookings)
CREATE TABLE IF NOT EXISTS bookings (
    id TEXT PRIMARY KEY,
    "propertyId" TEXT REFERENCES properties(id) ON DELETE CASCADE,
    "guestName" TEXT NOT NULL,
    origin TEXT NOT NULL,
    "checkIn" TEXT NOT NULL,
    "checkOut" TEXT NOT NULL,
    value NUMERIC(12, 2) NOT NULL,
    commission NUMERIC(12, 2) DEFAULT 0.0,
    status TEXT NOT NULL,
    phone TEXT,
    documents TEXT[],
    notes TEXT
);

-- 5. Tabela de Patrimônio (Assets)
CREATE TABLE IF NOT EXISTS assets (
    id TEXT PRIMARY KEY,
    "propertyId" TEXT REFERENCES properties(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    category TEXT NOT NULL,
    value NUMERIC(12, 2) NOT NULL,
    "purchaseDate" TEXT NOT NULL,
    "warrantyUntil" TEXT,
    "lifeSpanYears" INTEGER DEFAULT 10,
    location TEXT,
    "photoUrl" TEXT,
    "invoiceNumber" TEXT
);

-- 6. Tabela de Manutenções (Maintenances)
CREATE TABLE IF NOT EXISTS maintenances (
    id TEXT PRIMARY KEY,
    "propertyId" TEXT REFERENCES properties(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    type TEXT NOT NULL,
    status TEXT NOT NULL,
    date TEXT NOT NULL,
    cost NUMERIC(12, 2) NOT NULL,
    notes TEXT
);

-- 7. Tabela de Fornecedores (Suppliers)
CREATE TABLE IF NOT EXISTS suppliers (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    specialty TEXT NOT NULL,
    "contactName" TEXT NOT NULL,
    phone TEXT NOT NULL,
    email TEXT
);

-- 8. Tabela de Documentos (Documents)
CREATE TABLE IF NOT EXISTS documents (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    type TEXT NOT NULL,
    description TEXT,
    date TEXT NOT NULL,
    "fileSize" TEXT,
    "fileUrl" TEXT
);

-- Habilitar Row Level Security (RLS)
ALTER TABLE properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE revenues ENABLE ROW LEVEL SECURITY;
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE maintenances ENABLE ROW LEVEL SECURITY;
ALTER TABLE suppliers ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;

-- Criar políticas de acesso público irrestrito para simplificar a implantação inicial:
CREATE POLICY "Acesso irrestrito publico" ON properties FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Acesso irrestrito publico" ON revenues FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Acesso irrestrito publico" ON expenses FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Acesso irrestrito publico" ON bookings FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Acesso irrestrito publico" ON assets FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Acesso irrestrito publico" ON maintenances FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Acesso irrestrito publico" ON suppliers FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Acesso irrestrito publico" ON documents FOR ALL USING (true) WITH CHECK (true);
