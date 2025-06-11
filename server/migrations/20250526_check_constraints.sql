-- Verificar las restricciones existentes en la tabla Users
SELECT conname, contype
FROM pg_constraint
WHERE conrelid = 'Users'::regclass; 