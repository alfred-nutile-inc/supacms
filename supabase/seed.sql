SET session_replication_role = replica;

--
-- PostgreSQL database dump
--

-- Dumped from database version 15.8
-- Dumped by pg_dump version 15.8

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Data for Name: audit_log_entries; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: flow_state; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: users; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: identities; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: instances; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: sessions; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: mfa_amr_claims; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: mfa_factors; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: mfa_challenges; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: one_time_tokens; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: refresh_tokens; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: sso_providers; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: saml_providers; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: saml_relay_states; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: sso_domains; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: authors; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."authors" ("id", "created_at", "first_name", "last_name", "profile_url") VALUES
	(21, '2025-05-05 14:27:05.276092+00', 'John', 'Doe', 'https://example.com/johndoe'),
	(22, '2025-05-05 14:27:05.276092+00', 'Jane', 'Smith', 'https://example.com/janesmith'),
	(23, '2025-05-05 14:27:05.276092+00', 'Alice', 'Johnson', 'https://example.com/alicejohnson'),
	(24, '2025-05-05 14:27:05.276092+00', 'Bob', 'Brown', 'https://example.com/bobbrown');


--
-- Data for Name: articles; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."articles" ("id", "created_at", "title", "content", "published", "tags", "author_id") VALUES
	(19, '2025-05-05 14:28:13.140384+00', 'First Article', 'This is the content of the first article.', true, '{tag1,tag2}', 24),
	(20, '2025-05-05 14:28:13.140384+00', 'Second Article', 'This is the content of the second article.', false, '{tag2,tag3}', 24),
	(21, '2025-05-05 14:28:13.140384+00', 'Third Article', 'This is the content of the third article.', true, '{tag1,tag3}', 22),
	(22, '2025-05-05 14:28:13.140384+00', 'Fourth Article', 'This is the content of the fourth article.', false, '{tag2}', 21),
	(23, '2025-05-05 14:28:13.140384+00', 'Fifth Article', 'This is the content of the fifth article.', true, '{tag1,tag4}', 21),
	(24, '2025-05-05 14:28:13.140384+00', 'Sixth Article', 'This is the content of the sixth article.', true, '{tag3,tag4}', 21);


--
-- Data for Name: files; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: forms; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."forms" ("id", "name", "table_name", "json", "created_at") VALUES
	('737b3bdb-2276-4983-8ad9-e8824f45c587', 'articles', 'articles', '{"fields": [{"name": "title", "type": "text", "label": "Title", "validations": ["required", "max:255"]}, {"name": "content", "type": "textarea", "label": "Content", "validations": ["required", "max:5000"]}, {"name": "published", "type": "checkbox", "label": "Published", "default": false, "validations": []}, {"acl": "public", "name": "header_url", "type": "file", "label": "Header Image", "bucket": "article-assets", "validations": ["file", "image"], "storage_path": "public/articles/header_images"}, {"name": "tags", "type": "array", "label": "Tags", "item_type": "text", "validations": ["required"]}, {"name": "author_id", "type": "relation", "label": "Author", "relation": {"table": "authors", "label_field": "last_name", "value_field": "id"}, "validations": ["required"]}], "form_name": "articles"}', '2025-05-02 14:40:21.248468+00');


--
-- Data for Name: buckets; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--



--
-- Data for Name: objects; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--



--
-- Data for Name: prefixes; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--



--
-- Data for Name: s3_multipart_uploads; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--



--
-- Data for Name: s3_multipart_uploads_parts; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--



--
-- Data for Name: hooks; Type: TABLE DATA; Schema: supabase_functions; Owner: supabase_functions_admin
--



--
-- Data for Name: secrets; Type: TABLE DATA; Schema: vault; Owner: supabase_admin
--



--
-- Name: refresh_tokens_id_seq; Type: SEQUENCE SET; Schema: auth; Owner: supabase_auth_admin
--

SELECT pg_catalog.setval('"auth"."refresh_tokens_id_seq"', 1, false);


--
-- Name: articles_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('"public"."articles_id_seq"', 24, true);


--
-- Name: authors_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('"public"."authors_id_seq"', 24, true);


--
-- Name: files_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('"public"."files_id_seq"', 1, false);


--
-- Name: hooks_id_seq; Type: SEQUENCE SET; Schema: supabase_functions; Owner: supabase_functions_admin
--

SELECT pg_catalog.setval('"supabase_functions"."hooks_id_seq"', 1, false);


--
-- PostgreSQL database dump complete
--

RESET ALL;
