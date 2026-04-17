--
-- PostgreSQL database dump
--

\restrict 29vSfYLsPBRgLFM0uhEvNu0k5S7HrxiRmABkfz2FDI5N4o981uNpMoB9WtiOr5a

-- Dumped from database version 15.15 (Homebrew)
-- Dumped by pg_dump version 15.15 (Homebrew)

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

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: group_members; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.group_members (
    group_id integer NOT NULL,
    user_id integer NOT NULL,
    joined_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- Name: groups; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.groups (
    id integer NOT NULL,
    uuid uuid DEFAULT gen_random_uuid() NOT NULL,
    name character varying(255) NOT NULL,
    description text,
    color character varying(7) DEFAULT '#3b82f6'::character varying,
    icon character varying(50) DEFAULT 'folder'::character varying,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- Name: groups_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.groups_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: groups_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.groups_id_seq OWNED BY public.groups.id;


--
-- Name: ticket_comments; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.ticket_comments (
    id integer NOT NULL,
    uuid uuid DEFAULT gen_random_uuid() NOT NULL,
    ticket_id integer NOT NULL,
    author_id integer NOT NULL,
    text text NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- Name: ticket_comments_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.ticket_comments_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: ticket_comments_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.ticket_comments_id_seq OWNED BY public.ticket_comments.id;


--
-- Name: ticket_history; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.ticket_history (
    id integer NOT NULL,
    uuid uuid DEFAULT gen_random_uuid() NOT NULL,
    ticket_id integer NOT NULL,
    author_id integer NOT NULL,
    action character varying(255) NOT NULL,
    details jsonb,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- Name: ticket_history_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.ticket_history_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: ticket_history_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.ticket_history_id_seq OWNED BY public.ticket_history.id;


--
-- Name: tickets; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.tickets (
    id integer NOT NULL,
    uuid uuid DEFAULT gen_random_uuid() NOT NULL,
    title character varying(255) NOT NULL,
    description text,
    status character varying(50) DEFAULT 'todo'::character varying,
    priority character varying(20) DEFAULT 'medium'::character varying,
    creator_id integer NOT NULL,
    assigned_to_id integer,
    group_id integer NOT NULL,
    due_date date,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    start_date date,
    end_date date,
    CONSTRAINT tickets_priority_check CHECK (((priority)::text = ANY ((ARRAY['low'::character varying, 'medium'::character varying, 'high'::character varying, 'urgent'::character varying])::text[]))),
    CONSTRAINT tickets_status_check CHECK (((status)::text = ANY ((ARRAY['todo'::character varying, 'in_progress'::character varying, 'in_review'::character varying, 'done'::character varying])::text[])))
);


--
-- Name: tickets_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.tickets_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: tickets_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.tickets_id_seq OWNED BY public.tickets.id;


--
-- Name: user_permissions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.user_permissions (
    id integer NOT NULL,
    user_id integer NOT NULL,
    group_id integer,
    permission character varying(100) NOT NULL,
    granted_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- Name: user_permissions_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.user_permissions_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: user_permissions_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.user_permissions_id_seq OWNED BY public.user_permissions.id;


--
-- Name: users; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.users (
    id integer NOT NULL,
    uuid uuid DEFAULT gen_random_uuid() NOT NULL,
    name character varying(255) NOT NULL,
    email character varying(255) NOT NULL,
    password_hash character varying(255) NOT NULL,
    role character varying(50) DEFAULT 'user'::character varying,
    avatar_url text,
    age integer,
    phone character varying(20),
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT users_role_check CHECK (((role)::text = ANY ((ARRAY['superadmin'::character varying, 'admin'::character varying, 'user'::character varying])::text[])))
);


--
-- Name: users_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.users_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: users_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.users_id_seq OWNED BY public.users.id;


--
-- Name: groups id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.groups ALTER COLUMN id SET DEFAULT nextval('public.groups_id_seq'::regclass);


--
-- Name: ticket_comments id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ticket_comments ALTER COLUMN id SET DEFAULT nextval('public.ticket_comments_id_seq'::regclass);


--
-- Name: ticket_history id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ticket_history ALTER COLUMN id SET DEFAULT nextval('public.ticket_history_id_seq'::regclass);


--
-- Name: tickets id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tickets ALTER COLUMN id SET DEFAULT nextval('public.tickets_id_seq'::regclass);


--
-- Name: user_permissions id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_permissions ALTER COLUMN id SET DEFAULT nextval('public.user_permissions_id_seq'::regclass);


--
-- Name: users id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users ALTER COLUMN id SET DEFAULT nextval('public.users_id_seq'::regclass);


--
-- Data for Name: group_members; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.group_members (group_id, user_id, joined_at) FROM stdin;
1	5	2026-04-17 14:27:03.256554
2	5	2026-04-17 14:27:03.256554
3	5	2026-04-17 14:27:03.256554
1	8	2026-04-17 14:29:03.774264
\.


--
-- Data for Name: groups; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.groups (id, uuid, name, description, color, icon, created_at, updated_at) FROM stdin;
1	28d5b726-80f6-4021-8546-11cb2f36bb94	Equipo Dev	Equipo de desarrollo backend y frontend	#3b82f6	code	2026-04-17 07:07:08.615069	2026-04-17 07:07:08.615069
2	129961f0-a5a1-4bcd-885a-ad2032b8311e	Soporte	Equipo de soporte y operaciones	#ef4444	headphones	2026-04-17 07:07:08.615069	2026-04-17 07:07:08.615069
3	8d09393e-817b-49b2-961f-8705d6f93ad2	UX & Diseño	Equipo de diseño y experiencia de usuario	#8b5cf6	palette	2026-04-17 07:07:08.615069	2026-04-17 07:07:08.615069
\.


--
-- Data for Name: ticket_comments; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.ticket_comments (id, uuid, ticket_id, author_id, text, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: ticket_history; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.ticket_history (id, uuid, ticket_id, author_id, action, details, created_at) FROM stdin;
\.


--
-- Data for Name: tickets; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.tickets (id, uuid, title, description, status, priority, creator_id, assigned_to_id, group_id, due_date, created_at, updated_at, start_date, end_date) FROM stdin;
\.


--
-- Data for Name: user_permissions; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.user_permissions (id, user_id, group_id, permission, granted_at) FROM stdin;
212	8	\N	ticket:view	2026-04-17 15:36:58.758535
213	8	\N	ticket:comment	2026-04-17 15:36:58.758535
214	8	\N	group:view	2026-04-17 15:36:58.758535
215	8	\N	user:view	2026-04-17 15:36:58.758535
116	5	1	ticket:create	2026-04-17 09:14:04.488653
117	5	2	ticket:create	2026-04-17 09:14:04.488653
118	5	3	ticket:create	2026-04-17 09:14:04.488653
119	5	1	ticket:edit	2026-04-17 09:14:04.493544
120	5	2	ticket:edit	2026-04-17 09:14:04.493544
121	5	3	ticket:edit	2026-04-17 09:14:04.493544
122	5	1	ticket:delete	2026-04-17 09:14:04.494052
123	5	2	ticket:delete	2026-04-17 09:14:04.494052
124	5	3	ticket:delete	2026-04-17 09:14:04.494052
125	5	1	ticket:view	2026-04-17 09:14:04.494426
126	5	2	ticket:view	2026-04-17 09:14:04.494426
127	5	3	ticket:view	2026-04-17 09:14:04.494426
128	5	1	ticket:assign	2026-04-17 09:14:04.496105
129	5	2	ticket:assign	2026-04-17 09:14:04.496105
130	5	3	ticket:assign	2026-04-17 09:14:04.496105
131	5	1	ticket:change_status	2026-04-17 09:14:04.496377
132	5	2	ticket:change_status	2026-04-17 09:14:04.496377
133	5	3	ticket:change_status	2026-04-17 09:14:04.496377
134	5	1	ticket:comment	2026-04-17 09:14:04.496672
135	5	2	ticket:comment	2026-04-17 09:14:04.496672
136	5	3	ticket:comment	2026-04-17 09:14:04.496672
137	5	1	group:create	2026-04-17 09:14:04.496939
138	5	2	group:create	2026-04-17 09:14:04.496939
139	5	3	group:create	2026-04-17 09:14:04.496939
140	5	1	group:edit	2026-04-17 09:14:04.497096
141	5	2	group:edit	2026-04-17 09:14:04.497096
142	5	3	group:edit	2026-04-17 09:14:04.497096
143	5	1	group:delete	2026-04-17 09:14:04.497251
144	5	2	group:delete	2026-04-17 09:14:04.497251
145	5	3	group:delete	2026-04-17 09:14:04.497251
146	5	1	group:view	2026-04-17 09:14:04.497422
147	5	2	group:view	2026-04-17 09:14:04.497422
148	5	3	group:view	2026-04-17 09:14:04.497422
149	5	1	group:add_member	2026-04-17 09:14:04.497586
150	5	2	group:add_member	2026-04-17 09:14:04.497586
151	5	3	group:add_member	2026-04-17 09:14:04.497586
152	5	1	group:remove_member	2026-04-17 09:14:04.497872
153	5	2	group:remove_member	2026-04-17 09:14:04.497872
154	5	3	group:remove_member	2026-04-17 09:14:04.497872
155	5	1	user:create	2026-04-17 09:14:04.498378
156	5	2	user:create	2026-04-17 09:14:04.498378
157	5	3	user:create	2026-04-17 09:14:04.498378
158	5	1	user:edit	2026-04-17 09:14:04.498623
159	5	2	user:edit	2026-04-17 09:14:04.498623
160	5	3	user:edit	2026-04-17 09:14:04.498623
161	5	1	user:delete	2026-04-17 09:14:04.498879
162	5	2	user:delete	2026-04-17 09:14:04.498879
163	5	3	user:delete	2026-04-17 09:14:04.498879
164	5	1	user:view	2026-04-17 09:14:04.499135
165	5	2	user:view	2026-04-17 09:14:04.499135
166	5	3	user:view	2026-04-17 09:14:04.499135
167	5	1	user:manage_permissions	2026-04-17 09:14:04.499389
168	5	2	user:manage_permissions	2026-04-17 09:14:04.499389
169	5	3	user:manage_permissions	2026-04-17 09:14:04.499389
176	5	\N	ticket:create	2026-04-17 14:56:03.322668
177	5	\N	ticket:edit	2026-04-17 14:56:03.322668
178	5	\N	ticket:delete	2026-04-17 14:56:03.322668
179	5	\N	ticket:view	2026-04-17 14:56:03.322668
180	5	\N	ticket:assign	2026-04-17 14:56:03.322668
181	5	\N	ticket:change_status	2026-04-17 14:56:03.322668
182	5	\N	ticket:comment	2026-04-17 14:56:03.322668
183	5	\N	group:create	2026-04-17 14:56:03.322668
184	5	\N	group:edit	2026-04-17 14:56:03.322668
185	5	\N	group:delete	2026-04-17 14:56:03.322668
186	5	\N	group:view	2026-04-17 14:56:03.322668
187	5	\N	group:add_member	2026-04-17 14:56:03.322668
188	5	\N	group:remove_member	2026-04-17 14:56:03.322668
189	5	\N	user:create	2026-04-17 14:56:03.322668
190	5	\N	user:edit	2026-04-17 14:56:03.322668
191	5	\N	user:delete	2026-04-17 14:56:03.322668
192	5	\N	user:view	2026-04-17 14:56:03.322668
193	5	\N	user:manage_permissions	2026-04-17 14:56:03.322668
208	8	1	ticket:create	2026-04-17 15:30:21.163349
209	8	1	ticket:edit	2026-04-17 15:30:21.163349
210	8	1	ticket:view	2026-04-17 15:30:21.163349
211	8	1	ticket:delete	2026-04-17 15:30:21.163349
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.users (id, uuid, name, email, password_hash, role, avatar_url, age, phone, created_at, updated_at) FROM stdin;
5	40bcca47-7f69-495c-8107-36b9f13a45e3	jesus efrain	jesusefrainbm29@gmail.com	$2a$10$4M0DAb8Ke/tO06.zQtCJ0Oct.d5a8XDck9CRzQZ/VA2dUlrKhFap2	superadmin	\N	20	4428636711	2026-04-17 09:04:33.428033	2026-04-17 09:04:33.428033
8	d2335b59-0bf2-481a-9bbb-3f398be20f21	Paula Valeria Sanchez Trejo	paula@sipng.com	$2a$10$RYXFqms7DggjKtbOL27PJugvYeTaeTImO36awJ.k4gIYW0Mtq51kq	user	\N	21	4423221674	2026-04-17 14:21:31.033204	2026-04-17 14:21:31.033204
\.


--
-- Name: groups_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.groups_id_seq', 5, true);


--
-- Name: ticket_comments_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.ticket_comments_id_seq', 5, true);


--
-- Name: ticket_history_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.ticket_history_id_seq', 9, true);


--
-- Name: tickets_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.tickets_id_seq', 10, true);


--
-- Name: user_permissions_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.user_permissions_id_seq', 215, true);


--
-- Name: users_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.users_id_seq', 8, true);


--
-- Name: group_members group_members_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.group_members
    ADD CONSTRAINT group_members_pkey PRIMARY KEY (group_id, user_id);


--
-- Name: groups groups_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.groups
    ADD CONSTRAINT groups_pkey PRIMARY KEY (id);


--
-- Name: groups groups_uuid_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.groups
    ADD CONSTRAINT groups_uuid_key UNIQUE (uuid);


--
-- Name: ticket_comments ticket_comments_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ticket_comments
    ADD CONSTRAINT ticket_comments_pkey PRIMARY KEY (id);


--
-- Name: ticket_comments ticket_comments_uuid_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ticket_comments
    ADD CONSTRAINT ticket_comments_uuid_key UNIQUE (uuid);


--
-- Name: ticket_history ticket_history_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ticket_history
    ADD CONSTRAINT ticket_history_pkey PRIMARY KEY (id);


--
-- Name: ticket_history ticket_history_uuid_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ticket_history
    ADD CONSTRAINT ticket_history_uuid_key UNIQUE (uuid);


--
-- Name: tickets tickets_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tickets
    ADD CONSTRAINT tickets_pkey PRIMARY KEY (id);


--
-- Name: tickets tickets_uuid_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tickets
    ADD CONSTRAINT tickets_uuid_key UNIQUE (uuid);


--
-- Name: user_permissions user_permissions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_permissions
    ADD CONSTRAINT user_permissions_pkey PRIMARY KEY (id);


--
-- Name: user_permissions user_permissions_user_id_group_id_permission_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_permissions
    ADD CONSTRAINT user_permissions_user_id_group_id_permission_key UNIQUE (user_id, group_id, permission);


--
-- Name: users users_email_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key UNIQUE (email);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: users users_uuid_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_uuid_key UNIQUE (uuid);


--
-- Name: idx_comments_author; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_comments_author ON public.ticket_comments USING btree (author_id);


--
-- Name: idx_comments_ticket; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_comments_ticket ON public.ticket_comments USING btree (ticket_id);


--
-- Name: idx_group_members_group; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_group_members_group ON public.group_members USING btree (group_id);


--
-- Name: idx_group_members_user; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_group_members_user ON public.group_members USING btree (user_id);


--
-- Name: idx_groups_uuid; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_groups_uuid ON public.groups USING btree (uuid);


--
-- Name: idx_history_ticket; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_history_ticket ON public.ticket_history USING btree (ticket_id);


--
-- Name: idx_ticket_comments_ticket; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_ticket_comments_ticket ON public.ticket_comments USING btree (ticket_id);


--
-- Name: idx_ticket_history_ticket; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_ticket_history_ticket ON public.ticket_history USING btree (ticket_id);


--
-- Name: idx_tickets_assigned; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_tickets_assigned ON public.tickets USING btree (assigned_to_id);


--
-- Name: idx_tickets_assigned_to; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_tickets_assigned_to ON public.tickets USING btree (assigned_to_id);


--
-- Name: idx_tickets_creator; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_tickets_creator ON public.tickets USING btree (creator_id);


--
-- Name: idx_tickets_group; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_tickets_group ON public.tickets USING btree (group_id);


--
-- Name: idx_tickets_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_tickets_status ON public.tickets USING btree (status);


--
-- Name: idx_tickets_uuid; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_tickets_uuid ON public.tickets USING btree (uuid);


--
-- Name: idx_user_permissions_group; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_user_permissions_group ON public.user_permissions USING btree (group_id);


--
-- Name: idx_user_permissions_user; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_user_permissions_user ON public.user_permissions USING btree (user_id);


--
-- Name: idx_user_perms_global_unique; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX idx_user_perms_global_unique ON public.user_permissions USING btree (user_id, permission) WHERE (group_id IS NULL);


--
-- Name: idx_user_perms_permission; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_user_perms_permission ON public.user_permissions USING btree (permission);


--
-- Name: idx_user_perms_user_group; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_user_perms_user_group ON public.user_permissions USING btree (user_id, group_id);


--
-- Name: idx_users_email; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_users_email ON public.users USING btree (email);


--
-- Name: idx_users_uuid; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_users_uuid ON public.users USING btree (uuid);


--
-- Name: group_members group_members_group_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.group_members
    ADD CONSTRAINT group_members_group_id_fkey FOREIGN KEY (group_id) REFERENCES public.groups(id) ON DELETE CASCADE;


--
-- Name: group_members group_members_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.group_members
    ADD CONSTRAINT group_members_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: ticket_comments ticket_comments_author_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ticket_comments
    ADD CONSTRAINT ticket_comments_author_id_fkey FOREIGN KEY (author_id) REFERENCES public.users(id);


--
-- Name: ticket_comments ticket_comments_ticket_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ticket_comments
    ADD CONSTRAINT ticket_comments_ticket_id_fkey FOREIGN KEY (ticket_id) REFERENCES public.tickets(id) ON DELETE CASCADE;


--
-- Name: ticket_history ticket_history_author_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ticket_history
    ADD CONSTRAINT ticket_history_author_id_fkey FOREIGN KEY (author_id) REFERENCES public.users(id);


--
-- Name: ticket_history ticket_history_ticket_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ticket_history
    ADD CONSTRAINT ticket_history_ticket_id_fkey FOREIGN KEY (ticket_id) REFERENCES public.tickets(id) ON DELETE CASCADE;


--
-- Name: tickets tickets_assigned_to_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tickets
    ADD CONSTRAINT tickets_assigned_to_id_fkey FOREIGN KEY (assigned_to_id) REFERENCES public.users(id);


--
-- Name: tickets tickets_creator_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tickets
    ADD CONSTRAINT tickets_creator_id_fkey FOREIGN KEY (creator_id) REFERENCES public.users(id);


--
-- Name: tickets tickets_group_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tickets
    ADD CONSTRAINT tickets_group_id_fkey FOREIGN KEY (group_id) REFERENCES public.groups(id) ON DELETE CASCADE;


--
-- Name: user_permissions user_permissions_group_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_permissions
    ADD CONSTRAINT user_permissions_group_id_fkey FOREIGN KEY (group_id) REFERENCES public.groups(id) ON DELETE CASCADE;


--
-- Name: user_permissions user_permissions_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_permissions
    ADD CONSTRAINT user_permissions_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- PostgreSQL database dump complete
--

\unrestrict 29vSfYLsPBRgLFM0uhEvNu0k5S7HrxiRmABkfz2FDI5N4o981uNpMoB9WtiOr5a

