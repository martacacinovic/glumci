--
-- PostgreSQL database dump
--

-- Dumped from database version 14.2
-- Dumped by pg_dump version 14.9

-- Started on 2023-11-12 21:11:17

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
-- TOC entry 225 (class 1255 OID 25079)
-- Name: export_to_json(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.export_to_json() RETURNS void
    LANGUAGE plpgsql
    AS $$
DECLARE
   result JSONB;
BEGIN
   SELECT jsonb_agg(jsonb_build_object(
      'Ime', glumac.ime,
      'Prezime', glumac.prezime,
      'Dob', glumac.dob,
      'Datum rodenja', glumac.datumrodenja,
      'Zemlja rodenja', glumac.zemljarodenja,
      'Visina', glumac.visina,
      'Boja ociju', glumac.bojaociju,
      'Broj osvojenih Oscara', glumac.brojosvojenihoscara,
      'Net worth', glumac.networth,
      'Glumi u', glumi_u.filmovi_serije
   ))
   INTO result
   FROM (
      SELECT
         g.ime,
         g.prezime,
         g.dob,
         g.datumrodenja,
         g.zemljarodenja,
         g.visina,
         g.bojaociju,
         g.brojosvojenihoscara,
         g.networth,
         jsonb_agg(jsonb_build_object('Naslov', fs.naslov)) AS filmovi_serije
      FROM
         glumac g
         JOIN glumiU gu ON g.glumacID = gu.glumacID
         JOIN filmSerija fs ON gu.filmSerijaID = fs.filmSerijaID
      GROUP BY
         g.ime,
         g.prezime,
         g.dob,
         g.datumrodenja,
         g.zemljarodenja,
         g.visina,
         g.bojaociju,
         g.brojosvojenihoscara,
         g.networth
   ) glumi_u;

   -- Pisanje rezultata u datoteku
   EXECUTE 'COPY (SELECT ''' || result || '''::jsonb) TO ''C:\Users\Marta\otvorenoracunarstvo/glumci.json''';
END;
$$;


ALTER FUNCTION public.export_to_json() OWNER TO postgres;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- TOC entry 213 (class 1259 OID 25070)
-- Name: filmserija; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.filmserija (
    filmserijaid integer NOT NULL,
    naslov character varying(255),
    vrsta character varying(255),
    CONSTRAINT filmserija_vrsta_check CHECK (((vrsta)::text = ANY ((ARRAY['film'::character varying, 'serija'::character varying])::text[])))
);


ALTER TABLE public.filmserija OWNER TO postgres;

--
-- TOC entry 212 (class 1259 OID 25069)
-- Name: filmserija_filmserijaid_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.filmserija_filmserijaid_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.filmserija_filmserijaid_seq OWNER TO postgres;

--
-- TOC entry 3333 (class 0 OID 0)
-- Dependencies: 212
-- Name: filmserija_filmserijaid_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.filmserija_filmserijaid_seq OWNED BY public.filmserija.filmserijaid;


--
-- TOC entry 210 (class 1259 OID 25038)
-- Name: glumac; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.glumac (
    glumacid integer NOT NULL,
    ime character varying(255),
    prezime character varying(255),
    dob integer,
    datumrodenja date,
    zemljarodenja character varying(255),
    visina integer,
    bojaociju character varying(255),
    brojosvojenihoscara integer,
    networth integer
);


ALTER TABLE public.glumac OWNER TO postgres;

--
-- TOC entry 209 (class 1259 OID 25037)
-- Name: glumac_glumacid_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.glumac_glumacid_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.glumac_glumacid_seq OWNER TO postgres;

--
-- TOC entry 3334 (class 0 OID 0)
-- Dependencies: 209
-- Name: glumac_glumacid_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.glumac_glumacid_seq OWNED BY public.glumac.glumacid;


--
-- TOC entry 211 (class 1259 OID 25054)
-- Name: glumiu; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.glumiu (
    glumacid integer NOT NULL,
    filmserijaid integer NOT NULL
);


ALTER TABLE public.glumiu OWNER TO postgres;

--
-- TOC entry 3175 (class 2604 OID 25073)
-- Name: filmserija filmserijaid; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.filmserija ALTER COLUMN filmserijaid SET DEFAULT nextval('public.filmserija_filmserijaid_seq'::regclass);


--
-- TOC entry 3174 (class 2604 OID 25041)
-- Name: glumac glumacid; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.glumac ALTER COLUMN glumacid SET DEFAULT nextval('public.glumac_glumacid_seq'::regclass);


--
-- TOC entry 3327 (class 0 OID 25070)
-- Dependencies: 213
-- Data for Name: filmserija; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.filmserija (filmserijaid, naslov, vrsta) FROM stdin;
1	You	serija
2	The Haunting of Hill House	serija
3	Monk	serija
4	Entourage	serija
5	Neighbours	serija
6	How to Get Away with Murder	serija
7	Sofia the First	serija
8	The X-Files	serija
9	Scrubs	serija
10	Fifteen	serija
11	Peaky Blinders	serija
12	Stranger Things	serija
13	Growing Pains	serija
14	Parenthood	serija
15	Origin	film
16	Shirley	film
17	The Hunger Games	film
18	Passengers	film
19	No Hard Feelings	film
20	Don't Look Up	film
21	X-Men: First Class	film
22	Lara Croft: Tomb Raider	film
23	The Tourist	film
24	Maleficent	film
25	Barbie	film
26	Suicide Squad	film
27	The Wolf of Wall Street	film
28	The Help	film
29	The Woman King	film
30	Fences	film
31	Deadpool	film
32	Free Guy	film
33	Green Lantern	film
34	Inception	film
35	Oppenheimer	film
36	28 Days Later	film
37	Red Eye	film
38	Dune	film
39	Call Me by Your Name	film
40	Bones and All	film
41	The Tutor	film
42	The Peanuts Movie	film
43	The Revenant	film
\.


--
-- TOC entry 3324 (class 0 OID 25038)
-- Dependencies: 210
-- Data for Name: glumac; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.glumac (glumacid, ime, prezime, dob, datumrodenja, zemljarodenja, visina, bojaociju, brojosvojenihoscara, networth) FROM stdin;
1	Victoria	Pedretti	28	1995-03-23	USA	160	plava	0	1000000
2	Jennifer	Lawrence	33	1990-08-15	USA	175	plava	1	160000000
3	Angelina	Jolie	48	1975-06-04	USA	169	plava	1	120000000
4	Margot	Robbie	33	1990-07-02	Australia	168	plava	1	40000000
5	Viola	Davis	58	1965-08-11	USA	165	smeđa	1	25000000
6	Ryan	Reynolds	47	1976-10-23	Canada	188	smeđa	0	350000000
7	Cillian	Murphy	47	1976-05-25	Ireland	172	plava	0	20000000
8	Timothée	Chalamet	27	1995-12-27	USA	178	zelena	0	25000000
9	Noah	Schnapp	19	2004-10-03	USA	174	smeđa	0	4000000
10	Leonardo	DiCaprio	48	1974-11-11	USA	183	plava	1	300000000
\.


--
-- TOC entry 3325 (class 0 OID 25054)
-- Dependencies: 211
-- Data for Name: glumiu; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.glumiu (glumacid, filmserijaid) FROM stdin;
1	1
1	2
1	15
1	16
2	17
2	18
2	19
2	20
2	21
2	3
3	22
3	23
3	24
3	4
4	25
4	26
4	27
4	5
5	28
5	29
5	30
5	26
5	6
5	7
6	8
6	31
6	32
6	33
6	9
6	10
7	34
7	35
7	36
7	37
7	11
8	38
8	39
8	40
8	20
9	41
9	42
9	12
10	43
10	34
10	27
10	20
10	13
10	14
\.


--
-- TOC entry 3335 (class 0 OID 0)
-- Dependencies: 212
-- Name: filmserija_filmserijaid_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.filmserija_filmserijaid_seq', 43, true);


--
-- TOC entry 3336 (class 0 OID 0)
-- Dependencies: 209
-- Name: glumac_glumacid_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.glumac_glumacid_seq', 10, true);


--
-- TOC entry 3182 (class 2606 OID 25078)
-- Name: filmserija filmserija_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.filmserija
    ADD CONSTRAINT filmserija_pkey PRIMARY KEY (filmserijaid);


--
-- TOC entry 3178 (class 2606 OID 25045)
-- Name: glumac glumac_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.glumac
    ADD CONSTRAINT glumac_pkey PRIMARY KEY (glumacid);


--
-- TOC entry 3180 (class 2606 OID 25058)
-- Name: glumiu glumiu_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.glumiu
    ADD CONSTRAINT glumiu_pkey PRIMARY KEY (glumacid, filmserijaid);


--
-- TOC entry 3183 (class 2606 OID 25059)
-- Name: glumiu glumiu_glumacid_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.glumiu
    ADD CONSTRAINT glumiu_glumacid_fkey FOREIGN KEY (glumacid) REFERENCES public.glumac(glumacid);


-- Completed on 2023-11-12 21:11:17

--
-- PostgreSQL database dump complete
--

