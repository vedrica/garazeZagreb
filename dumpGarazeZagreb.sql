--
-- PostgreSQL database dump
--

-- Dumped from database version 16.2
-- Dumped by pg_dump version 16.2

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
-- Name: garazatarife; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.garazatarife (
    idtarife integer NOT NULL,
    idgaraza integer NOT NULL
);


ALTER TABLE public.garazatarife OWNER TO postgres;

--
-- Name: garaze; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.garaze (
    idgaraza integer NOT NULL,
    imegaraza character varying(50) NOT NULL,
    ulica character varying(50) NOT NULL,
    broj character varying(10) NOT NULL,
    kvart character varying(50) NOT NULL,
    brojmjesta smallint NOT NULL,
    brojrazina smallint NOT NULL,
    tiplokacije integer NOT NULL,
    maksimalnavisina numeric(3,1) NOT NULL,
    dostupnostpovlastenekarte boolean NOT NULL
);


ALTER TABLE public.garaze OWNER TO postgres;

--
-- Name: garaže_idgaraza_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public."garaže_idgaraza_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public."garaže_idgaraza_seq" OWNER TO postgres;

--
-- Name: garaže_idgaraza_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public."garaže_idgaraza_seq" OWNED BY public.garaze.idgaraza;


--
-- Name: radnovrijeme; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.radnovrijeme (
    idvrijeme integer NOT NULL,
    pocetak time without time zone NOT NULL,
    kraj time without time zone NOT NULL
);


ALTER TABLE public.radnovrijeme OWNER TO postgres;

--
-- Name: radnovrijeme_idvrijeme_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.radnovrijeme_idvrijeme_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.radnovrijeme_idvrijeme_seq OWNER TO postgres;

--
-- Name: radnovrijeme_idvrijeme_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.radnovrijeme_idvrijeme_seq OWNED BY public.radnovrijeme.idvrijeme;


--
-- Name: tarife; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.tarife (
    idtarife integer NOT NULL,
    idvrijeme integer NOT NULL,
    cijena numeric(5,2) NOT NULL
);


ALTER TABLE public.tarife OWNER TO postgres;

--
-- Name: tarife_idserial_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.tarife_idserial_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.tarife_idserial_seq OWNER TO postgres;

--
-- Name: tarife_idserial_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.tarife_idserial_seq OWNED BY public.tarife.idtarife;


--
-- Name: tiplokacije; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.tiplokacije (
    idlokacije integer NOT NULL,
    opislokacije character varying(50) NOT NULL
);


ALTER TABLE public.tiplokacije OWNER TO postgres;

--
-- Name: tiplokacije_idlokacije_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.tiplokacije_idlokacije_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.tiplokacije_idlokacije_seq OWNER TO postgres;

--
-- Name: tiplokacije_idlokacije_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.tiplokacije_idlokacije_seq OWNED BY public.tiplokacije.idlokacije;


--
-- Name: garaze idgaraza; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.garaze ALTER COLUMN idgaraza SET DEFAULT nextval('public."garaže_idgaraza_seq"'::regclass);


--
-- Name: radnovrijeme idvrijeme; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.radnovrijeme ALTER COLUMN idvrijeme SET DEFAULT nextval('public.radnovrijeme_idvrijeme_seq'::regclass);


--
-- Name: tarife idtarife; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tarife ALTER COLUMN idtarife SET DEFAULT nextval('public.tarife_idserial_seq'::regclass);


--
-- Name: tiplokacije idlokacije; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tiplokacije ALTER COLUMN idlokacije SET DEFAULT nextval('public.tiplokacije_idlokacije_seq'::regclass);


--
-- Data for Name: garazatarife; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.garazatarife (idtarife, idgaraza) FROM stdin;
1	1
1	2
2	3
3	3
4	4
2	5
3	5
1	6
5	7
6	7
9	8
10	8
7	9
8	9
2	10
11	11
\.


--
-- Data for Name: garaze; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.garaze (idgaraza, imegaraza, ulica, broj, kvart, brojmjesta, brojrazina, tiplokacije, maksimalnavisina, dostupnostpovlastenekarte) FROM stdin;
1	Importanne Centar	Trg Ante Starčevića	7	Donji Grad	450	2	1	2.4	t
2	Importanne Galleria	Iblerov trg	10	Donji Grad	500	4	1	2.5	t
3	Langov trg - Langić	Trg Josipa Langa	13	Medvešćak	305	6	2	2.1	t
4	Cvjetni	Varšavska ulica	13	Centar	292	6	1	2.2	t
5	Petrinjska	Petrinjska ulica	59	Donji Grad	134	3	2	2.0	t
6	Kaptol Centar	Nova ves	17	Kaptol	461	2	1	2.1	t
7	Kvaternikov trg	Kvaternikov trg	6	Maksimir	354	3	2	2.1	t
8	KB Rebro	Kišpatićeva ulica	12	Maksimir	664	3	2	2.0	t
9	KB Sveti Duh	Sveti Duh	64	Črnomerec	477	4	3	2.0	t
10	Tuškanac	Tuškanac	1b	Tuškanac	465	4	2	2.3	t
11	Garage International	Miramarska	24	Trnje	447	9	1	2.2	t
\.


--
-- Data for Name: radnovrijeme; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.radnovrijeme (idvrijeme, pocetak, kraj) FROM stdin;
1	00:00:00	24:00:00
2	08:00:00	21:00:00
3	21:00:00	08:00:00
4	08:00:00	18:00:00
5	18:00:00	08:00:00
6	07:00:00	18:00:00
7	18:00:00	07:00:00
\.


--
-- Data for Name: tarife; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.tarife (idtarife, idvrijeme, cijena) FROM stdin;
1	1	2.00
2	2	1.60
3	3	0.80
4	1	2.60
5	4	1.10
6	5	0.50
7	6	0.70
8	7	0.40
9	6	0.80
10	7	0.40
11	1	1.50
\.


--
-- Data for Name: tiplokacije; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.tiplokacije (idlokacije, opislokacije) FROM stdin;
1	tržni/poslovni centar
2	javna garaža
3	bolnički parking
\.


--
-- Name: garaže_idgaraza_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."garaže_idgaraza_seq"', 1, false);


--
-- Name: radnovrijeme_idvrijeme_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.radnovrijeme_idvrijeme_seq', 7, true);


--
-- Name: tarife_idserial_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.tarife_idserial_seq', 11, true);


--
-- Name: tiplokacije_idlokacije_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.tiplokacije_idlokacije_seq', 1, false);


--
-- Name: garazatarife garazatarife_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.garazatarife
    ADD CONSTRAINT garazatarife_pkey PRIMARY KEY (idgaraza, idtarife);


--
-- Name: garaze garaže_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.garaze
    ADD CONSTRAINT "garaže_pkey" PRIMARY KEY (idgaraza);


--
-- Name: radnovrijeme radnovrijeme_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.radnovrijeme
    ADD CONSTRAINT radnovrijeme_pkey PRIMARY KEY (idvrijeme);


--
-- Name: tarife tarife_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tarife
    ADD CONSTRAINT tarife_pkey PRIMARY KEY (idtarife);


--
-- Name: tiplokacije tiplokacije_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tiplokacije
    ADD CONSTRAINT tiplokacije_pkey PRIMARY KEY (idlokacije);


--
-- Name: garazatarife fk_garaze; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.garazatarife
    ADD CONSTRAINT fk_garaze FOREIGN KEY (idgaraza) REFERENCES public.garaze(idgaraza) NOT VALID;


--
-- Name: garazatarife fk_tarife; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.garazatarife
    ADD CONSTRAINT fk_tarife FOREIGN KEY (idtarife) REFERENCES public.tarife(idtarife) NOT VALID;


--
-- Name: garaze fk_tiplokacije; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.garaze
    ADD CONSTRAINT fk_tiplokacije FOREIGN KEY (tiplokacije) REFERENCES public.tiplokacije(idlokacije);


--
-- Name: tarife fk_vrijeme; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tarife
    ADD CONSTRAINT fk_vrijeme FOREIGN KEY (idvrijeme) REFERENCES public.radnovrijeme(idvrijeme);


--
-- PostgreSQL database dump complete
--

