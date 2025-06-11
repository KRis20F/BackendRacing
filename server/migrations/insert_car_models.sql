-- Insertar los modelos 3D de autos en la tabla Cars
INSERT INTO "Cars" (
    "name",
    "description",
    "price",
    "model_path",
    "preview_image",
    "thumbnail_image",
    "category",
    "specs"
)
VALUES 
    (
        'Dodge Charger 1970 RT',
        'Un clásico muscle car americano con un rugiente motor V8 y un diseño que define una era. Perfecto para los amantes de la potencia pura y el estilo clásico.',
        2,
        '/models3d/dodge_charger_1970_rt.glb',
        '/images/cars/dodge_charger_preview.jpg',
        '/images/cars/dodge_charger_thumb.jpg',
        'Muscle',
        '{
            "power": "425 HP",
            "acceleration": "5.4s 0-60 mph",
            "topSpeed": "140 mph",
            "weight": "3,841 lbs"
        }'::jsonb
    ),
    (
        '1978 Pontiac Firebird Formula',
        'Un ícono de la era dorada de los muscle cars americanos, con un diseño aerodinámico y prestaciones que lo hacen destacar en cualquier pista.',
        1.5,
        '/models3d/1978_pontiac_firebird_formula.glb',
        '/images/cars/pontiac_firebird_preview.jpg',
        '/images/cars/pontiac_firebird_thumb.jpg',
        'Muscle',
        '{
            "power": "400 HP",
            "acceleration": "5.6s 0-60 mph",
            "topSpeed": "145 mph",
            "weight": "3,600 lbs"
        }'::jsonb
    ),
    (
        'Formula 1 Generic',
        'Un coche de Fórmula 1 de última generación, diseñado para ofrecer el máximo rendimiento en circuito. La máxima expresión del automovilismo.',
        8,
        '/models3d/formula_1_generico_modelo_exemplo.glb',
        '/images/cars/f1_generic_preview.jpg',
        '/images/cars/f1_generic_thumb.jpg',
        'Formula',
        '{
            "power": "1,000 HP",
            "acceleration": "2.6s 0-60 mph",
            "topSpeed": "220 mph",
            "weight": "1,752 lbs"
        }'::jsonb
    ),
    (
        '2022 Porsche 911 GT3',
        'La última evolución del icónico 911, llevado al extremo para ofrecer una experiencia de conducción pura y sin compromisos.',
        5,
        '/models3d/2022_porsche_911_gt3_992.glb',
        '/images/cars/porsche_911_gt3_preview.jpg',
        '/images/cars/porsche_911_gt3_thumb.jpg',
        'Sports',
        '{
            "power": "502 HP",
            "acceleration": "3.2s 0-60 mph",
            "topSpeed": "197 mph",
            "weight": "3,126 lbs"
        }'::jsonb
    ),
    (
        'BMW M3 E46 GTR',
        'Una leyenda del automovilismo, el M3 E46 GTR representa la perfecta combinación entre rendimiento en pista y elegancia alemana.',
        3,
        '/models3d/bmw_m3_e46_gtr.glb',
        '/images/cars/bmw_m3_e46_preview.jpg',
        '/images/cars/bmw_m3_e46_thumb.jpg',
        'Racing',
        '{
            "power": "444 HP",
            "acceleration": "3.8s 0-60 mph",
            "topSpeed": "185 mph",
            "weight": "2,976 lbs"
        }'::jsonb
    ),
    (
        '2022 Lamborghini Huracán Super Trofeo EVO2',
        'La última evolución del Huracán de competición, diseñado específicamente para dominar en los circuitos más exigentes del mundo.',
        7,
        '/models3d/2022_lamborghini_huracan_super_trofeo_evo2_carb.glb',
        '/images/cars/huracan_evo2_preview.jpg',
        '/images/cars/huracan_evo2_thumb.jpg',
        'Super',
        '{
            "power": "620 HP",
            "acceleration": "2.9s 0-60 mph",
            "topSpeed": "202 mph",
            "weight": "2,866 lbs"
        }'::jsonb
    ),
    (
        '2011 Mosler Super GT',
        'Un superdeportivo exclusivo y radical, diseñado para ofrecer prestaciones extremas tanto en circuito como en carretera.',
        4,
        '/models3d/2011_mosler_super_gt.glb',
        '/images/cars/mosler_gt_preview.jpg',
        '/images/cars/mosler_gt_thumb.jpg',
        'Super',
        '{
            "power": "600 HP",
            "acceleration": "3.1s 0-60 mph",
            "topSpeed": "200 mph",
            "weight": "2,500 lbs"
        }'::jsonb
    )
ON CONFLICT (id) DO UPDATE 
SET 
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    price = EXCLUDED.price,
    model_path = EXCLUDED.model_path,
    preview_image = EXCLUDED.preview_image,
    thumbnail_image = EXCLUDED.thumbnail_image,
    category = EXCLUDED.category,
    specs = EXCLUDED.specs; 