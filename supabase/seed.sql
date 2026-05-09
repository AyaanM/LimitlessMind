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
-- TOPICS
-- ============================================================
INSERT INTO topics (name, slug, description, icon) VALUES
('Housing',                  'housing',                  'Supported living, independent living, housing applications, and community resources.',          '🏠'),
('Employment',               'employment',               'Job searching, workplace accommodations, interview preparation, and career development.',       '💼'),
('Mental Health',            'mental-health',            'Managing anxiety, emotional regulation, self-care, and mental wellness strategies.',            '🧠'),
('Autism',                   'autism',                   'Understanding autism, neurodiversity, identity, and the autism experience.',                     '🌟'),
('ADHD',                     'adhd',                     'Understanding ADHD, executive function, focus strategies, and co-occurring conditions.',         '⚡'),
('Family',                   'family',                   'Family relationships, caregiver support, communication, and navigating family dynamics.',        '🤝'),
('Health Care',              'health-care',              'Navigating healthcare systems, understanding appointments, and advocating for health needs.',    '🏥'),
('2SLGBTQ+',                 '2slgbtq',                  'LGBTQ+ identities, intersecting experiences, community support, and inclusive resources.',      '🏳️‍🌈'),
('Women and Autism',         'women-and-autism',         'Autism experiences in women and girls, late diagnosis, masking, and gender-specific supports.',  '🌸'),
('Indigenous Perspectives',  'indigenous-perspectives',  'Indigenous knowledge, cultural perspectives, and community-informed approaches to autism.',      '🪶'),
('Transitions to Adulthood', 'transitions-to-adulthood', 'Moving from school to adult life, planning, independence, and post-secondary options.',          '🎓'),
('Communications',           'communications',           'AAC, social communication, nonverbal communication, and self-advocacy.',                         '💬'),
('Sensory Supports',         'sensory-supports',         'Sensory processing, sensory regulation, and building sensory-friendly environments.',            '🎵'),
('Education System',         'education-system',         'Navigating schools, IEPs, educational rights, and supports for autistic students.',              '📚'),
('Aging Adults',             'aging-adults',             'Autism in older adults, aging-related supports, and community resources for seniors.',           '🌿')
ON CONFLICT (slug) DO NOTHING;

-- ============================================================
-- TAGS
-- ============================================================
INSERT INTO tags (name, slug) VALUES
('Alberta',               'alberta'),
('Adults',                'adults'),
('Caregivers',            'caregivers'),
('Self-Advocacy',         'self-advocacy'),
('Accommodations',        'accommodations'),
('Independent Living',    'independent-living'),
('Sensory',               'sensory'),
('Communication',         'communication'),
('Anxiety',               'anxiety'),
('Workplace',             'workplace'),
('Diagnosis',             'diagnosis'),
('Coping Strategies',     'coping-strategies'),
('Neurodiversity',        'neurodiversity'),
('AAC',                   'aac'),
('Late Diagnosis',        'late-diagnosis'),
('Masking',               'masking'),
('Family Support',        'family-support'),
('School',                'school'),
('Benefits',              'benefits'),
('Transitions',           'transitions')
ON CONFLICT (slug) DO NOTHING;

-- ============================================================
-- SPEAKERS
-- ============================================================
INSERT INTO speakers (name, bio, credentials, organization, topic_specialties) VALUES

('Dr. Emily Chen',
 'Dr. Emily Chen is a registered psychologist specializing in autism and anxiety in adults. She has worked with autistic individuals across Alberta for over 12 years and is passionate about destigmatizing mental health care for the autism community.',
 'PhD, Registered Psychologist (Alberta)',
 'Edmonton Autism & Wellness Centre',
 ARRAY['Mental Health', 'Autism', 'Anxiety', 'Women and Autism']),

('Dr. Priya Sharma',
 'Dr. Priya Sharma is an employment specialist and occupational therapist who has supported autistic job seekers and employers to build inclusive workplaces. She offers workshops and one-on-one coaching across Canada.',
 'PhD, Occupational Therapist, Certified Employment Support Professional',
 'Inclusive Workplaces Alberta',
 ARRAY['Employment', 'Accommodations', 'Transitions to Adulthood']),

('James Okafor',
 'James Okafor is an autistic self-advocate, speaker, and community organizer. He shares his lived experience navigating employment and housing as an autistic adult and offers practical, honest guidance.',
 'Self-Advocate, Community Educator',
 'Self-employed',
 ARRAY['Employment', 'Housing', 'Autism', 'Self-Advocacy']),

('Sarah Mitchell',
 'Sarah Mitchell has over 15 years of experience in housing navigation and support services for people with disabilities in Alberta. She helps individuals and families understand their options and rights.',
 'BSW, Housing Navigator',
 'Disability Housing Society of Alberta',
 ARRAY['Housing', 'Independent Living', 'Transitions to Adulthood']),

('Dr. Marcus Williams',
 'Dr. Marcus Williams is a speech-language pathologist and autism researcher with expertise in social communication, AAC, and relationship-building. He is also autistic and brings both professional and lived experience to his work.',
 'PhD, Speech-Language Pathologist, RSLP',
 'University of Alberta — Communication Sciences',
 ARRAY['Communications', 'AAC', 'Relationships', 'Autism'])

ON CONFLICT DO NOTHING;

-- ============================================================
-- UPDATE VIDEOS with topic_id and certificate_eligible
-- ============================================================
UPDATE videos SET topic_id = (SELECT id FROM topics WHERE slug = 'housing'),   certificate_eligible = FALSE WHERE category = 'Housing';
UPDATE videos SET topic_id = (SELECT id FROM topics WHERE slug = 'employment'), certificate_eligible = FALSE WHERE category = 'Employment';
UPDATE videos SET topic_id = (SELECT id FROM topics WHERE slug = 'mental-health'), certificate_eligible = FALSE WHERE category = 'Mental Health';
UPDATE videos SET topic_id = (SELECT id FROM topics WHERE slug = 'autism'),     certificate_eligible = FALSE WHERE category = 'Identity';

-- ============================================================
-- VIDEO SPEAKERS — link videos to structured speaker records
-- ============================================================
INSERT INTO video_speakers (video_id, speaker_id)
SELECT v.id, s.id FROM videos v, speakers s
WHERE v.speaker = 'Dr. Emily Chen' AND s.name = 'Dr. Emily Chen'
ON CONFLICT DO NOTHING;

INSERT INTO video_speakers (video_id, speaker_id)
SELECT v.id, s.id FROM videos v, speakers s
WHERE v.speaker = 'Dr. Priya Sharma' AND s.name = 'Dr. Priya Sharma'
ON CONFLICT DO NOTHING;

INSERT INTO video_speakers (video_id, speaker_id)
SELECT v.id, s.id FROM videos v, speakers s
WHERE v.speaker = 'James Okafor' AND s.name = 'James Okafor'
ON CONFLICT DO NOTHING;

INSERT INTO video_speakers (video_id, speaker_id)
SELECT v.id, s.id FROM videos v, speakers s
WHERE v.speaker = 'Sarah Mitchell' AND s.name = 'Sarah Mitchell'
ON CONFLICT DO NOTHING;

INSERT INTO video_speakers (video_id, speaker_id)
SELECT v.id, s.id FROM videos v, speakers s
WHERE v.speaker = 'Marcus Williams' AND s.name = 'Dr. Marcus Williams'
ON CONFLICT DO NOTHING;

-- ============================================================
-- PLAYLISTS
-- ============================================================
INSERT INTO playlists (title, description, topic_id, tags, is_premium) VALUES

('Getting Started with Employment',
 'A guided introduction to employment preparation for autistic adults, from resume basics to your first interview.',
 (SELECT id FROM topics WHERE slug = 'employment'),
 ARRAY['employment', 'adults', 'Alberta'],
 FALSE),

('Housing Essentials',
 'Everything you need to know about finding and keeping stable housing in Alberta as an autistic adult.',
 (SELECT id FROM topics WHERE slug = 'housing'),
 ARRAY['housing', 'independent-living', 'Alberta'],
 FALSE),

('Mental Wellness Foundations',
 'Build your mental wellness toolkit with videos on anxiety, coping strategies, and self-regulation.',
 (SELECT id FROM topics WHERE slug = 'mental-health'),
 ARRAY['mental-health', 'anxiety', 'coping-strategies'],
 TRUE)

ON CONFLICT DO NOTHING;

-- ============================================================
-- PLAYLIST ITEMS
-- ============================================================
INSERT INTO playlist_items (playlist_id, video_id, position)
SELECT p.id, v.id, 1
FROM playlists p, videos v
WHERE p.title = 'Getting Started with Employment' AND v.title = 'Preparing for Your First Job Interview'
ON CONFLICT DO NOTHING;

INSERT INTO playlist_items (playlist_id, video_id, position)
SELECT p.id, v.id, 2
FROM playlists p, videos v
WHERE p.title = 'Getting Started with Employment' AND v.title = 'Workplace Accommodations You Can Ask For'
ON CONFLICT DO NOTHING;

INSERT INTO playlist_items (playlist_id, video_id, position)
SELECT p.id, v.id, 1
FROM playlists p, videos v
WHERE p.title = 'Housing Essentials' AND v.title = 'Understanding Housing Options'
ON CONFLICT DO NOTHING;

INSERT INTO playlist_items (playlist_id, video_id, position)
SELECT p.id, v.id, 2
FROM playlists p, videos v
WHERE p.title = 'Housing Essentials' AND v.title = 'Navigating Housing Applications'
ON CONFLICT DO NOTHING;

INSERT INTO playlist_items (playlist_id, video_id, position)
SELECT p.id, v.id, 1
FROM playlists p, videos v
WHERE p.title = 'Mental Wellness Foundations' AND v.title = 'Understanding Anxiety and Autism'
ON CONFLICT DO NOTHING;

INSERT INTO playlist_items (playlist_id, video_id, position)
SELECT p.id, v.id, 2
FROM playlists p, videos v
WHERE p.title = 'Mental Wellness Foundations' AND v.title = 'Building a Calm-Down Toolkit'
ON CONFLICT DO NOTHING;

-- ============================================================
-- COLLECTIONS
-- ============================================================
INSERT INTO collections (title, description, topic_id, tags, is_premium, certificate_eligible, estimated_hours) VALUES

('Employment Readiness',
 'A complete learning path for autistic adults preparing to enter or re-enter the workforce. Covers interviews, accommodations, and workplace communication.',
 (SELECT id FROM topics WHERE slug = 'employment'),
 ARRAY['employment', 'adults', 'workplace', 'Alberta'],
 FALSE, TRUE, 2.0),

('Housing Support Basics',
 'Learn about housing options available in Alberta, how to navigate applications, and what supports are available for autistic adults.',
 (SELECT id FROM topics WHERE slug = 'housing'),
 ARRAY['housing', 'independent-living', 'Alberta'],
 FALSE, TRUE, 1.5),

('Mental Health and Autism',
 'A curated collection of videos on managing anxiety, emotional regulation, and building a personal wellness toolkit.',
 (SELECT id FROM topics WHERE slug = 'mental-health'),
 ARRAY['mental-health', 'anxiety', 'coping-strategies', 'sensory'],
 TRUE, TRUE, 2.5),

('Caregiver Learning Path',
 'Resources for parents, guardians, and caregivers supporting autistic loved ones through major life transitions.',
 (SELECT id FROM topics WHERE slug = 'family'),
 ARRAY['caregivers', 'family-support', 'transitions'],
 FALSE, FALSE, 1.0),

('Transitions to Adulthood',
 'Support for young adults moving from school to adult life — covering employment, housing, and independence.',
 (SELECT id FROM topics WHERE slug = 'transitions-to-adulthood'),
 ARRAY['transitions', 'adults', 'school', 'employment'],
 FALSE, TRUE, 3.0)

ON CONFLICT DO NOTHING;

-- ============================================================
-- COLLECTION ITEMS
-- ============================================================
INSERT INTO collection_items (collection_id, video_id, position)
SELECT c.id, v.id, 1
FROM collections c, videos v
WHERE c.title = 'Employment Readiness' AND v.title = 'Preparing for Your First Job Interview'
ON CONFLICT DO NOTHING;

INSERT INTO collection_items (collection_id, video_id, position)
SELECT c.id, v.id, 2
FROM collections c, videos v
WHERE c.title = 'Employment Readiness' AND v.title = 'Workplace Accommodations You Can Ask For'
ON CONFLICT DO NOTHING;

INSERT INTO collection_items (collection_id, video_id, position)
SELECT c.id, v.id, 1
FROM collections c, videos v
WHERE c.title = 'Housing Support Basics' AND v.title = 'Understanding Housing Options'
ON CONFLICT DO NOTHING;

INSERT INTO collection_items (collection_id, video_id, position)
SELECT c.id, v.id, 2
FROM collections c, videos v
WHERE c.title = 'Housing Support Basics' AND v.title = 'Navigating Housing Applications'
ON CONFLICT DO NOTHING;

INSERT INTO collection_items (collection_id, video_id, position)
SELECT c.id, v.id, 1
FROM collections c, videos v
WHERE c.title = 'Mental Health and Autism' AND v.title = 'Understanding Anxiety and Autism'
ON CONFLICT DO NOTHING;

INSERT INTO collection_items (collection_id, video_id, position)
SELECT c.id, v.id, 2
FROM collections c, videos v
WHERE c.title = 'Mental Health and Autism' AND v.title = 'Building a Calm-Down Toolkit'
ON CONFLICT DO NOTHING;

INSERT INTO collection_items (collection_id, video_id, position)
SELECT c.id, v.id, 1
FROM collections c, videos v
WHERE c.title = 'Transitions to Adulthood' AND v.title = 'Self-Advocacy: Speaking Up for Yourself'
ON CONFLICT DO NOTHING;

INSERT INTO collection_items (collection_id, video_id, position)
SELECT c.id, v.id, 2
FROM collections c, videos v
WHERE c.title = 'Transitions to Adulthood' AND v.title = 'Preparing for Your First Job Interview'
ON CONFLICT DO NOTHING;

-- ============================================================
-- EXTERNAL ORGANIZATIONS
-- ============================================================
INSERT INTO external_organizations (name, description, website_url, organization_type, location, topics) VALUES

('Autism Society Canada',
 'The national voice of the autism community in Canada, providing resources, advocacy, and connection to local chapters across the country.',
 'https://www.autismsociety.ca',
 'National Non-Profit',
 'Canada-wide',
 ARRAY['Autism', 'Advocacy', 'Family']),

('Alberta Disability Workers Association',
 'Supports professionals who work with people with disabilities in Alberta through training, advocacy, and community resources.',
 'https://www.adwa.ca',
 'Professional Association',
 'Alberta',
 ARRAY['Employment', 'Health Care', 'Education System']),

('AIMHI (Alberta Initiative for More Inclusive Housing)',
 'A coalition working to increase housing options and supports for people with developmental disabilities in Alberta.',
 'https://www.aimhi.ca',
 'Advocacy Organization',
 'Alberta',
 ARRAY['Housing', 'Independent Living', 'Adults']),

('Autism Speaks Canada',
 'Provides resources, research, and support for autistic individuals and their families across Canada.',
 'https://www.autismspeakscanada.ca',
 'National Non-Profit',
 'Canada-wide',
 ARRAY['Autism', 'Family', 'Health Care']),

('PeerConnect Alberta',
 'Connects autistic adults with peer mentors and community support groups across Alberta. Free to join.',
 NULL,
 'Community Organization',
 'Alberta',
 ARRAY['Autism', 'Community', 'Adults', 'Mental Health']),

('Canadian Autism Spectrum Disorder Alliance',
 'A cross-disability voice in Canada advocating for consistent national standards and community support for autistic individuals.',
 'https://www.casda.ca',
 'National Advocacy',
 'Canada-wide',
 ARRAY['Autism', 'Advocacy', 'Policy'])

ON CONFLICT DO NOTHING;

-- ============================================================
-- DISCUSSION POSTS (sample community content)
-- ============================================================
-- Note: user_id would need to be a real auth.users id in production.
-- These are placeholder inserts that will only work if a real user id is available.
-- Use Supabase dashboard to add these manually with real user ids.

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
