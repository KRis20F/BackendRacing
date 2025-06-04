-- Primero eliminamos la restricción NOT NULL
ALTER TABLE "Users" ALTER COLUMN "publicKey" DROP NOT NULL;

-- Nos aseguramos que mantenga el UNIQUE pero permita NULL
ALTER TABLE "Users" DROP CONSTRAINT IF EXISTS "Users_publicKey_idx";
ALTER TABLE "Users" ADD CONSTRAINT "Users_publicKey_unique" UNIQUE ("publicKey");

-- Recreamos el índice
DROP INDEX IF EXISTS "users_publicKey_idx";
CREATE INDEX "users_publicKey_idx" ON "Users" USING BTREE ("publicKey"); 