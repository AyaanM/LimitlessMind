-- Autism Edmonton LMS — Seed Data
-- Run AFTER schema.sql in a fresh dev environment

-- ============================================================
-- VIDEOS (10 across 5 categories, mix free/premium)
-- Vimeo IDs are real public Vimeo videos used as placeholders
-- Replace with Autism Edmonton's own Vimeo content in production
-- ============================================================
INSERT INTO videos (vimeo_id, title, description, category, speaker, duration_seconds, tags, is_premium, is_featured, is_new_this_month, is_autism_edmonton_pick, popularity_score) VALUES

-- Housing
('76979871',
 'Understanding Housing Options',
 'A clear overview of housing options available for autistic adults, including supported living, independent living, and shared arrangements. Learn what questions to ask and what to expect.',
 'Housing',
 'Autism Edmonton Team',
 540,
 ARRAY['housing','independent living','support','adults'],
 FALSE, TRUE, TRUE, TRUE, 85),

('148751763',
 'Navigating Housing Applications',
 'Step-by-step guidance on applying for housing support programs in Alberta, including documentation, timelines, and who to contact for help.',
 'Housing',
 'Sarah Mitchell',
 720,
 ARRAY['housing','applications','Alberta','support programs'],
 TRUE, FALSE, FALSE, FALSE, 62),

-- Employment
('209078728',
 'Preparing for Your First Job Interview',
 'Practical tips for autistic job seekers: how to prepare answers, what to wear, how to communicate your needs, and what accommodations you can request.',
 'Employment',
 'James Okafor',
 900,
 ARRAY['employment','interview','job search','accommodations'],
 FALSE, TRUE, TRUE, FALSE, 91),

('253989945',
 'Workplace Accommodations You Can Ask For',
 'A detailed guide to understanding your rights and requesting reasonable accommodations at work, including sensory, scheduling, and communication supports.',
 'Employment',
 'Dr. Priya Sharma',
 1080,
 ARRAY['employment','accommodations','rights','workplace'],
 TRUE, FALSE, FALSE, TRUE, 74),

-- Mental Health
('322244877',
 'Understanding Anxiety and Autism',
 'This video explores the connection between autism and anxiety, common triggers, and gentle strategies for managing overwhelming feelings day to day.',
 'Mental Health',
 'Dr. Emily Chen',
 660,
 ARRAY['mental health','anxiety','coping','self-care'],
 FALSE, FALSE, TRUE, TRUE, 88),

('355757424',
 'Building a Calm-Down Toolkit',
 'Learn how to create a personalized collection of calming strategies and sensory tools that work for you when emotions feel too big.',
 'Mental Health',
 'Autism Edmonton Team',
 480,
 ARRAY['mental health','sensory','coping','toolkit','self-regulation'],
 TRUE, FALSE, FALSE, FALSE, 55),

-- Relationships
('169507058',
 'Making and Keeping Friendships',
 'A supportive guide to understanding social connections, navigating friendships, and communicating needs clearly with people you care about.',
 'Relationships',
 'Marcus Williams',
 600,
 ARRAY['relationships','friendships','social skills','communication'],
 FALSE, FALSE, FALSE, TRUE, 79),

('824804225',
 'Setting Healthy Boundaries',
 'Understanding what boundaries are, why they matter, and how to communicate them clearly and kindly in different types of relationships.',
 'Relationships',
 'Dr. Emily Chen',
 720,
 ARRAY['relationships','boundaries','communication','self-advocacy'],
 TRUE, FALSE, TRUE, FALSE, 67),

-- Identity
('76979871',  -- using same vimeo_id is not allowed in practice; using variant
 'Understanding Your Autistic Identity',
 'Exploring what it means to be autistic, the strengths of neurodiversity, and how to build a positive sense of self in a neurotypical world.',
 'Identity',
 'Jordan Lee',
 540,
 ARRAY['identity','autism','neurodiversity','self-acceptance'],
 FALSE, TRUE, FALSE, TRUE, 82),

('209078728',  -- variant ID for demo purposes
 'Self-Advocacy: Speaking Up for Yourself',
 'How to identify your needs, communicate them effectively, and advocate for yourself in educational, workplace, and community settings.',
 'Identity',
 'Autism Edmonton Team',
 660,
 ARRAY['identity','self-advocacy','communication','rights'],
 TRUE, FALSE, TRUE, FALSE, 70);

-- Fix duplicate vimeo_ids for seed data (use unique demo IDs)
UPDATE videos SET vimeo_id = '76979872' WHERE title = 'Understanding Your Autistic Identity';
UPDATE videos SET vimeo_id = '209078729' WHERE title = 'Self-Advocacy: Speaking Up for Yourself';

-- ============================================================
-- GAMES
-- ============================================================
INSERT INTO games (title, description, category, game_type, is_premium, difficulty) VALUES

('Emotion Match',
 'Match faces to emotion words in this gentle memory game. Take your time — there is no rush.',
 'Mental Health',
 'built-in',
 FALSE,
 'easy'),

('Calm Breathing',
 'Follow along with a simple breathing exercise to help when things feel overwhelming. Breathe in, hold, breathe out.',
 'Mental Health',
 'built-in',
 FALSE,
 'easy'),

('Memory Cards',
 'Flip cards to find matching pairs. A quiet, calm game to practice focus and memory.',
 'Mental Health',
 'built-in',
 FALSE,
 'easy'),

('Job Interview Practice',
 'Practice answering common job interview questions in a safe, low-pressure environment. Review sample answers and tips.',
 'Employment',
 'built-in',
 TRUE,
 'medium'),

('Daily Routine Builder',
 'Drag and arrange activities to create a daily schedule that works for you. Visual, step-by-step, and easy to adjust.',
 'Housing',
 'built-in',
 TRUE,
 'easy'),

('Communication Choices',
 'Practice navigating everyday social situations with different communication options. Learn what works best for you.',
 'Relationships',
 'built-in',
 TRUE,
 'medium');

-- ============================================================
-- CONTACT CARDS
-- ============================================================
INSERT INTO contact_cards (name, title, organization, email, phone, website, description, category, display_order) VALUES

('Autism Edmonton',
 'Main Support Line',
 'Autism Edmonton',
 'info@autismedmonton.org',
 '780-453-3971',
 'https://www.autismedmonton.org',
 'Autism Edmonton provides support, resources, and advocacy for autistic individuals and their families across Alberta. Contact us for general questions, program information, or to connect with local supports.',
 'main',
 1),

('Employment Support Team',
 'Employment Services',
 'Autism Edmonton',
 'employment@autismedmonton.org',
 '780-453-3971',
 'https://www.autismedmonton.org',
 'Our employment team helps autistic individuals prepare for, find, and keep meaningful work. We offer one-on-one coaching, job placement support, and employer education.',
 'employment',
 2),

('Housing Navigator',
 'Housing Support',
 'Autism Edmonton',
 'housing@autismedmonton.org',
 '780-453-3971',
 'https://www.autismedmonton.org',
 'The housing team helps individuals and families navigate housing options, applications, and supports in Alberta. Reach out if you have questions about independent living or supported housing.',
 'housing',
 3),

('Crisis & Emergency Services',
 '24/7 Crisis Line',
 'Distress Line Edmonton',
 NULL,
 '780-482-4357',
 NULL,
 'If you or someone you know is in crisis, please call the Edmonton Distress Line. This platform is for learning and information only — it is not an emergency service. In an emergency, always call 911.',
 'emergency',
 4);
