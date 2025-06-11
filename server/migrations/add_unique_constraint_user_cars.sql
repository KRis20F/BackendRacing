-- Agregar restricción única para userId y carId en UserCars
ALTER TABLE "UserCars"
ADD CONSTRAINT "unique_user_car" UNIQUE ("userId", "carId"); 