-- ============================================
-- ADMIN USER SETUP
-- ============================================
-- Run this SQL after setting up your database to make a user an admin

-- STEP 1: Find your user ID and email
-- Run this query first to see all users:
SELECT id, email, role FROM auth.users;

-- STEP 2: Set admin role
-- Replace 'your-email@example.com' with your actual email:
UPDATE users 
SET role = 'admin' 
WHERE email = 'your-email@example.com';

-- Alternative: Set admin by UUID (if you prefer)
-- Replace the UUID below with your actual user ID from the query above:
-- UPDATE users 
-- SET role = 'admin' 
-- WHERE id = 'c1234567-89ab-cdef-0123-456789abcdef';

-- STEP 3: Verify admin status
-- This should show your user with role = 'admin':
SELECT id, email, role FROM users WHERE role = 'admin';

-- ============================================
-- USAGE EXAMPLES
-- ============================================

-- Make multiple admins at once:
-- UPDATE users SET role = 'admin' 
-- WHERE email IN ('admin1@example.com', 'admin2@example.com');

-- Remove admin role:
-- UPDATE users SET role = 'user' WHERE email = 'user@example.com';

-- List all admins:
-- SELECT id, email, role, created_at FROM users WHERE role = 'admin';

