INSERT INTO public.authors (first_name, last_name, profile_url) VALUES
('John', 'Doe', 'https://example.com/johndoe'),
('Jane', 'Smith', 'https://example.com/janesmith'),
('Alice', 'Johnson', 'https://example.com/alicejohnson'),
('Bob', 'Brown', 'https://example.com/bobbrown');

INSERT INTO public.articles (title, content, published, tags, author_id) VALUES
('First Article', 'This is the content of the first article.', true, ARRAY['tag1', 'tag2'], (SELECT id FROM public.authors ORDER BY RANDOM() LIMIT 1)),
('Second Article', 'This is the content of the second article.', false, ARRAY['tag2', 'tag3'], (SELECT id FROM public.authors ORDER BY RANDOM() LIMIT 1)),
('Third Article', 'This is the content of the third article.', true, ARRAY['tag1', 'tag3'], (SELECT id FROM public.authors ORDER BY RANDOM() LIMIT 1)),
('Fourth Article', 'This is the content of the fourth article.', false, ARRAY['tag2'], (SELECT id FROM public.authors ORDER BY RANDOM() LIMIT 1)),
('Fifth Article', 'This is the content of the fifth article.', true, ARRAY['tag1', 'tag4'], (SELECT id FROM public.authors ORDER BY RANDOM() LIMIT 1)),
('Sixth Article', 'This is the content of the sixth article.', true, ARRAY['tag3', 'tag4'], (SELECT id FROM public.authors ORDER BY RANDOM() LIMIT 1));