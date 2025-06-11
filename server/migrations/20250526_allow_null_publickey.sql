-- Eliminar la restricción existente
ALTER TABLE "Users" DROP CONSTRAINT IF EXISTS "Users_publicKey_unique";

-- Modificar la columna para permitir NULL
ALTER TABLE "Users" ALTER COLUMN "publicKey" DROP NOT NULL;

-- Agregar la nueva restricción UNIQUE que ignora NULL
ALTER TABLE "Users" ADD CONSTRAINT "Users_publicKey_unique" 
    UNIQUE ("publicKey") 
    WHERE "publicKey" IS NOT NULL; 