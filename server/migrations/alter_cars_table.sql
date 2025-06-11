-- Modificar la tabla Cars para incluir los nuevos campos
ALTER TABLE "Cars"
    ADD COLUMN IF NOT EXISTS "price" INTEGER NOT NULL DEFAULT 0,
    ADD COLUMN IF NOT EXISTS "model_path" VARCHAR(255),
    ADD COLUMN IF NOT EXISTS "preview_image" VARCHAR(255),
    ADD COLUMN IF NOT EXISTS "thumbnail_image" VARCHAR(255),
    ADD COLUMN IF NOT EXISTS "category" VARCHAR(50),
    ADD COLUMN IF NOT EXISTS "specs" JSONB DEFAULT '{
        "power": "",
        "acceleration": "",
        "topSpeed": "",
        "weight": ""
    }';

-- Crear índices para mejorar el rendimiento
CREATE INDEX IF NOT EXISTS idx_cars_category ON "Cars"("category");
CREATE INDEX IF NOT EXISTS idx_cars_price ON "Cars"("price");

-- Insertar los autos de ejemplo
INSERT INTO "Cars" ("id", "name", "description", "preview_image", "thumbnail_image", "price", "model_path", "category", "specs")
VALUES 
    (1, 'Dodge Charger', 'A powerful American muscle car combining modern performance with classic styling.', 
        '/images/cars/dodge_charger_preview.jpg', '/images/cars/dodge_charger_thumb.jpg',
        85000, '/models3d/dodge_charger_1970_rt.glb', 'Muscle', 
        '{"power": "485 HP", "acceleration": "4.3s 0-60 mph", "topSpeed": "175 mph", "weight": "4,300 lbs"}'::jsonb),
    (2, 'Formula 1 Generic', 'Experience the pinnacle of motorsport with this F1 racing machine.',
        '/images/cars/f1_generic_preview.jpg', '/images/cars/f1_generic_thumb.jpg',
        2000000, '/models3d/formula_1_generico_modelo_exemplo.glb', 'Formula',
        '{"power": "1,000 HP", "acceleration": "2.6s 0-60 mph", "topSpeed": "220 mph", "weight": "1,752 lbs"}'::jsonb),
    (3, '2022 Porsche 911 GT3', 'German engineering at its finest, built for both track and road.',
        '/images/cars/porsche_911_gt3_preview.jpg', '/images/cars/porsche_911_gt3_thumb.jpg',
        180000, '/models3d/2022_porsche_911_gt3_992.glb', 'Sports',
        '{"power": "502 HP", "acceleration": "3.2s 0-60 mph", "topSpeed": "197 mph", "weight": "3,126 lbs"}'::jsonb),
    (4, 'BMW M3 E46 GTR', 'A legendary racing icon that dominated motorsports.',
        '/images/cars/bmw_m3_e46_preview.jpg', '/images/cars/bmw_m3_e46_thumb.jpg',
        120000, '/models3d/bmw_m3_e46_gtr.glb', 'Racing',
        '{"power": "444 HP", "acceleration": "3.8s 0-60 mph", "topSpeed": "185 mph", "weight": "2,976 lbs"}'::jsonb),
    (5, '2022 Lamborghini Huracán Super Trofeo EVO2', 'Italian racing excellence, designed for pure performance.',
        '/images/cars/huracan_evo2_preview.jpg', '/images/cars/huracan_evo2_thumb.jpg',
        250000, '/models3d/2022_lamborghini_huracan_super_trofeo_evo2_carb.glb', 'Super',
        '{"power": "620 HP", "acceleration": "2.9s 0-60 mph", "topSpeed": "202 mph", "weight": "2,866 lbs"}'::jsonb),
    (6, '2011 Mosler Super GT', 'An exotic supercar built for ultimate speed and handling.',
        '/images/cars/mosler_gt_preview.jpg', '/images/cars/mosler_gt_thumb.jpg',
        150000, '/models3d/2011_mosler_super_gt.glb', 'Super',
        '{"power": "600 HP", "acceleration": "3.1s 0-60 mph", "topSpeed": "200 mph", "weight": "2,500 lbs"}'::jsonb)
ON CONFLICT (id) DO UPDATE 
SET 
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    preview_image = EXCLUDED.preview_image,
    thumbnail_image = EXCLUDED.thumbnail_image,
    price = EXCLUDED.price,
    model_path = EXCLUDED.model_path,
    category = EXCLUDED.category,
    specs = EXCLUDED.specs; 