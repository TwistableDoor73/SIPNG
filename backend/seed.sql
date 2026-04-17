-- SIPNG ERP - Initial Seed Data for Development

BEGIN;

-- Truncate tables to reset
TRUNCATE TABLE ticket_history CASCADE;
TRUNCATE TABLE ticket_comments CASCADE;
TRUNCATE TABLE tickets CASCADE;
TRUNCATE TABLE user_permissions CASCADE;
TRUNCATE TABLE group_members CASCADE;
TRUNCATE TABLE users CASCADE;
TRUNCATE TABLE groups CASCADE;

-- Insert test users
INSERT INTO users (name, email, password_hash, role, avatar_url, age, phone)
VALUES
  ('Jesus Efrain', 'jesusefrainbocanegramata@gmail.com', '$2a$10$VsHPzj3TZxNLJxPdwV.Csurf.6C7pVVIHQNMgSf3QhLMZ9GW.4Cy6', 'superadmin', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Jesus', 24, '+34666000000'),
  ('Diego Admin', 'diego.admin@erp.com', '$2a$10$VsHPzj3TZxNLJxPdwV.Csurf.6C7pVVIHQNMgSf3QhLMZ9GW.4Cy6', 'admin', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Diego', 28, '+34666000001'),
  ('Luis Felipe Dev', 'luis.dev@erp.com', '$2a$10$VsHPzj3TZxNLJxPdwV.Csurf.6C7pVVIHQNMgSf3QhLMZ9GW.4Cy6', 'user', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Luis', 26, '+34666000002'),
  ('Paula Diseño', 'paula.design@erp.com', '$2a$10$VsHPzj3TZxNLJxPdwV.Csurf.6C7pVVIHQNMgSf3QhLMZ9GW.4Cy6', 'user', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Paula', 25, '+34666000003');

-- Insert test groups
INSERT INTO groups (name, description, color, icon)
VALUES
  ('Equipo Dev', 'Equipo de desarrollo backend y frontend', '#3b82f6', 'code'),
  ('Soporte', 'Equipo de soporte y operaciones', '#ef4444', 'headphones'),
  ('UX & Diseño', 'Equipo de diseño y experiencia de usuario', '#8b5cf6', 'palette');

-- Insert group members
INSERT INTO group_members (group_id, user_id)
VALUES
  (1, 1), -- Jesus in Dev
  (1, 2), -- Diego in Dev
  (1, 3), -- Luis in Dev
  (2, 1), -- Jesus in Soporte
  (2, 2), -- Diego in Soporte
  (3, 1), -- Jesus in Design
  (3, 4); -- Paula in Design

-- Insert permissions for superadmin (all permissions in all groups)
-- Group 1 (Dev) - Jesus (superadmin)
INSERT INTO user_permissions (user_id, group_id, permission)
VALUES
  (1, 1, 'ticket:view'),
  (1, 1, 'ticket:create'),
  (1, 1, 'ticket:edit'),
  (1, 1, 'ticket:delete'),
  (1, 1, 'ticket:assign'),
  (1, 1, 'ticket:comment'),
  (1, 1, 'group:view'),
  (1, 1, 'group:manage'),
  (1, 1, 'user:view'),
  (1, 1, 'user:manage'),
  (1, 1, 'admin:all');

-- Group 2 (Soporte) - Jesus (superadmin)
INSERT INTO user_permissions (user_id, group_id, permission)
VALUES
  (1, 2, 'ticket:view'),
  (1, 2, 'ticket:create'),
  (1, 2, 'ticket:edit'),
  (1, 2, 'ticket:delete'),
  (1, 2, 'ticket:assign'),
  (1, 2, 'ticket:comment'),
  (1, 2, 'group:view'),
  (1, 2, 'group:manage'),
  (1, 2, 'user:view'),
  (1, 2, 'user:manage'),
  (1, 2, 'admin:all');

-- Group 3 (Design) - Jesus (superadmin)
INSERT INTO user_permissions (user_id, group_id, permission)
VALUES
  (1, 3, 'ticket:view'),
  (1, 3, 'ticket:create'),
  (1, 3, 'ticket:edit'),
  (1, 3, 'ticket:delete'),
  (1, 3, 'ticket:assign'),
  (1, 3, 'ticket:comment'),
  (1, 3, 'group:view'),
  (1, 3, 'group:manage'),
  (1, 3, 'user:view'),
  (1, 3, 'user:manage'),
  (1, 3, 'admin:all');

-- Admin permissions (Diego in Dev)
INSERT INTO user_permissions (user_id, group_id, permission)
VALUES
  (2, 1, 'ticket:view'),
  (2, 1, 'ticket:create'),
  (2, 1, 'ticket:edit'),
  (2, 1, 'ticket:delete'),
  (2, 1, 'ticket:assign'),
  (2, 1, 'ticket:comment'),
  (2, 1, 'group:view'),
  (2, 1, 'group:manage'),
  (2, 1, 'user:view'),
  (2, 1, 'user:manage');

-- Admin permissions (Diego in Soporte)
INSERT INTO user_permissions (user_id, group_id, permission)
VALUES
  (2, 2, 'ticket:view'),
  (2, 2, 'ticket:create'),
  (2, 2, 'ticket:edit'),
  (2, 2, 'ticket:assign'),
  (2, 2, 'ticket:comment'),
  (2, 2, 'group:view'),
  (2, 2, 'user:view');

-- User permissions (Luis in Dev)
INSERT INTO user_permissions (user_id, group_id, permission)
VALUES
  (3, 1, 'ticket:view'),
  (3, 1, 'ticket:create'),
  (3, 1, 'ticket:edit'),
  (3, 1, 'ticket:assign'),
  (3, 1, 'ticket:comment'),
  (3, 1, 'group:view');

-- User permissions (Paula in Design)
INSERT INTO user_permissions (user_id, group_id, permission)
VALUES
  (4, 3, 'ticket:view'),
  (4, 3, 'ticket:create'),
  (4, 3, 'ticket:edit'),
  (4, 3, 'ticket:comment'),
  (4, 3, 'group:view');

-- Insert sample tickets in Dev group (group_id = 1)
INSERT INTO tickets (title, description, status, priority, creator_id, assigned_to_id, group_id, due_date)
VALUES
  (
    'Implementar autenticación JWT',
    'Necesitamos implementar un sistema de autenticación JWT en el backend para securizar los endpoints.',
    'in_progress',
    'high',
    1,
    3,
    1,
    CURRENT_DATE + INTERVAL '7 days'
  ),
  (
    'Crear tabla de permisos',
    'Diseñar e implementar una tabla de permisos en PostgreSQL sin usar roles.',
    'done',
    'high',
    1,
    3,
    1,
    CURRENT_DATE - INTERVAL '2 days'
  ),
  (
    'Mejorar UI de Kanban',
    'Revisar la experiencia del usuario en el tablero Kanban y hacer mejoras visuales.',
    'todo',
    'medium',
    2,
    NULL,
    1,
    CURRENT_DATE + INTERVAL '14 days'
  ),
  (
    'Documentar API endpoints',
    'Crear documentación completa de todos los endpoints REST del backend.',
    'in_review',
    'medium',
    1,
    2,
    1,
    CURRENT_DATE + INTERVAL '5 days'
  );

-- Insert sample tickets in Support group (group_id = 2)
INSERT INTO tickets (title, description, status, priority, creator_id, assigned_to_id, group_id, due_date)
VALUES
  (
    'Bug en login',
    'Los usuarios reportan problemas al hacer login en ciertos navegadores.',
    'in_progress',
    'urgent',
    2,
    2,
    2,
    CURRENT_DATE + INTERVAL '1 day'
  ),
  (
    'Capacitación de nuevos usuarios',
    'Realizar sesión de capacitación para nuevos usuarios del sistema.',
    'todo',
    'low',
    2,
    NULL,
    2,
    CURRENT_DATE + INTERVAL '10 days'
  );

-- Insert sample tickets in Design group (group_id = 3)
INSERT INTO tickets (title, description, status, priority, creator_id, assigned_to_id, group_id, due_date)
VALUES
  (
    'Diseño de nueva landing page',
    'Crear mockups para la nueva landing page del ERP.',
    'in_progress',
    'high',
    1,
    4,
    3,
    CURRENT_DATE + INTERVAL '12 days'
  ),
  (
    'Revisar paleta de colores',
    'Revisar y ajustar la paleta de colores del sistema.',
    'done',
    'low',
    4,
    4,
    3,
    CURRENT_DATE - INTERVAL '5 days'
  );

-- Insert sample comments
INSERT INTO ticket_comments (ticket_id, author_id, text)
VALUES
  (1, 3, 'Empecé a trabajar en esto. He creado la estructura base.'),
  (1, 1, 'Perfecto! Recuerda validar bien los tokens en el middleware.'),
  (2, 3, 'Todo listo. Los tests están pasando correctamente.'),
  (4, 2, 'He revisado la documentación, necesita algunas aclaraciones.'),
  (5, 2, 'Usuario reportó el bug hace 2 horas, estoy investigando.');

-- Insert sample history
INSERT INTO ticket_history (ticket_id, author_id, action, details)
VALUES
  (1, 1, 'created', '{"status": "todo"}'),
  (1, 1, 'assigned', '{"assigned_to": "Luis Felipe Dev"}'),
  (1, 3, 'moved', '{"from": "todo", "to": "in_progress"}'),
  (2, 1, 'created', '{"status": "todo"}'),
  (2, 3, 'moved', '{"from": "todo", "to": "in_progress"}'),
  (2, 3, 'moved', '{"from": "in_progress", "to": "done"}'),
  (5, 2, 'created', '{"status": "todo", "priority": "urgent"}'),
  (5, 2, 'assigned', '{"assigned_to": "Diego Admin"}'),
  (5, 2, 'moved', '{"from": "todo", "to": "in_progress"}');

-- Verify data
SELECT 'Users:' as info, COUNT(*) FROM users
UNION ALL
SELECT 'Groups:', COUNT(*) FROM groups
UNION ALL
SELECT 'Group Members:', COUNT(*) FROM group_members
UNION ALL
SELECT 'Permissions:', COUNT(*) FROM user_permissions
UNION ALL
SELECT 'Tickets:', COUNT(*) FROM tickets
UNION ALL
SELECT 'Comments:', COUNT(*) FROM ticket_comments
UNION ALL
SELECT 'History:', COUNT(*) FROM ticket_history;

COMMIT;
