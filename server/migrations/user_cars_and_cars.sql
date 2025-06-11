-- Tabla de autos/NFTs
CREATE TABLE "Cars" (
  "id" SERIAL PRIMARY KEY,
  "name" VARCHAR(255) NOT NULL,
  "description" TEXT,
  "image_url" VARCHAR(255)
);

-- Tabla relacional entre usuarios y autos (garage)
CREATE TABLE "UserCars" (
  "id" SERIAL PRIMARY KEY,
  "userId" INTEGER NOT NULL REFERENCES "Users"(id) ON DELETE CASCADE,
  "carId" INTEGER NOT NULL REFERENCES "Cars"(id) ON DELETE CASCADE,
  "quantity" INTEGER DEFAULT 1
); 