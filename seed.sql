-- Seed banks
INSERT INTO banks (name) VALUES 
  ('Khan Bank'),
  ('Golomt Bank'),
  ('TDB'),
  ('State Bank');

-- Seed categories
INSERT INTO categories (name, icon, color, budget_amount) VALUES 
  ('Groceries', '🛒', '#4CAF50', 500000),
  ('Fuel/Transportation', '⛽', '#FF9800', 200000),
  ('Dining out', '🍽️', '#E91E63', 150000),
  ('Entertainment', '🎬', '#9C27B0', 100000),
  ('Shopping', '🛍️', '#2196F3', 200000),
  ('Bills/Utilities', '📄', '#607D8B', 300000),
  ('Healthcare', '🏥', '#F44336', 100000),
  ('Education', '📚', '#3F51B5', 150000),
  ('Travel', '✈️', '#00BCD4', 200000),
  ('Home projects', '🏠', '#795548', 100000),
  ('Mortgage/Rent', '🏢', '#9E9E9E', 800000),
  ('Other', '📦', '#757575', 50000);

-- Seed sample accounts
INSERT INTO accounts (name, bank_id, account_type, balance, currency) VALUES 
  ('Checking', 1, 'checking', 2500000, '₮'),
  ('Savings', 1, 'savings', 5000000, '₮'),
  ('Credit Card', 2, 'credit_card', -150000, '₮');

-- Seed sample goal
INSERT INTO goals (name, target_amount, current_amount, currency, is_active) VALUES 
  ('HVAC System', 3000000, 1200000, '₮', 1);

