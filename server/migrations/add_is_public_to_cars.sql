-- Add isPublic column
ALTER TABLE "Cars" ADD COLUMN "isPublic" BOOLEAN NOT NULL DEFAULT false;

-- Set some cars as public for preview/demo purposes
UPDATE "Cars" SET "isPublic" = true WHERE "category" IN ('Muscle', 'Formula');

-- Add an index for faster queries
CREATE INDEX idx_cars_is_public ON "Cars" ("isPublic"); 