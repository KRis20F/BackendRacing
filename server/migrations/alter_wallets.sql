-- Paso 1: Hacer backup de la tabla actual
CREATE TABLE IF NOT EXISTS "Wallets_Backup" AS 
SELECT * FROM "Wallets";

-- Paso 2: Eliminar los índices existentes
DROP INDEX IF EXISTS idx_wallets_userid;
DROP INDEX IF EXISTS idx_wallets_address;
DROP INDEX IF EXISTS idx_wallets_public_key;

-- Paso 3: Eliminar las restricciones existentes
ALTER TABLE "Wallets"
    DROP CONSTRAINT IF EXISTS wallets_pkey,
    DROP CONSTRAINT IF EXISTS wallets_public_key_key,
    DROP CONSTRAINT IF EXISTS wallets_userid_fkey,
    DROP CONSTRAINT IF EXISTS wallets_address_key;

-- Paso 4: Eliminar las columnas que no necesitamos
ALTER TABLE "Wallets"
    DROP COLUMN IF EXISTS username_hash,
    DROP COLUMN IF EXISTS email_hash,
    DROP COLUMN IF EXISTS public_key,
    DROP COLUMN IF EXISTS private_key;

-- Paso 5: Asegurarnos de que tenemos todas las columnas necesarias
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'Wallets' AND column_name = 'userId'
    ) THEN
        ALTER TABLE "Wallets" ADD COLUMN "userId" INTEGER;
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'Wallets' AND column_name = 'address'
    ) THEN
        ALTER TABLE "Wallets" ADD COLUMN "address" VARCHAR(255);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'Wallets' AND column_name = 'balance'
    ) THEN
        ALTER TABLE "Wallets" ADD COLUMN "balance" DECIMAL(20,8) DEFAULT 0;
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'Wallets' AND column_name = 'updatedAt'
    ) THEN
        ALTER TABLE "Wallets" ADD COLUMN "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP;
    END IF;
END $$;

-- Paso 6: Renombrar created_at a createdAt si existe
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'Wallets' AND column_name = 'created_at'
    ) THEN
        ALTER TABLE "Wallets" RENAME COLUMN created_at TO "createdAt";
    END IF;
END $$;

-- Paso 7: Limpiar los datos ya que no podemos mapearlos
TRUNCATE TABLE "Wallets";

-- Paso 8: Agregar las restricciones
ALTER TABLE "Wallets"
    ALTER COLUMN "userId" SET NOT NULL,
    ALTER COLUMN "address" SET NOT NULL;

ALTER TABLE "Wallets"
    ADD CONSTRAINT wallets_userid_fkey FOREIGN KEY ("userId") REFERENCES "Users"("id") ON DELETE CASCADE,
    ADD CONSTRAINT wallets_address_key UNIQUE ("address");

-- Paso 9: Crear los nuevos índices
CREATE INDEX IF NOT EXISTS idx_wallets_userid ON "Wallets"("userId");
CREATE INDEX IF NOT EXISTS idx_wallets_address ON "Wallets"("address");

-- Mensaje informativo
DO $$
BEGIN
    RAISE NOTICE 'Se ha creado una copia de seguridad de los datos antiguos en la tabla "Wallets_Backup"';
END $$; 