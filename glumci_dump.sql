--
-- PostgreSQL database dump
--

-- Dumped from database version 14.2
-- Dumped by pg_dump version 14.9

-- Started on 2023-10-31 21:21:12

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
-- TOC entry 209 (class 1259 OID 25021)
-- Name: glumac; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.glumac (
    ime character varying,
    prezime character varying,
    dob integer,
    datumrodenja date,
    zemljarodenja character varying,
    visinacm integer,
    "networth$" integer,
    filmovi json,
    serije json,
    nagrade json
);


ALTER TABLE public.glumac OWNER TO postgres;

--
-- TOC entry 3301 (class 0 OID 25021)
-- Dependencies: 209
-- Data for Name: glumac; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.glumac (ime, prezime, dob, datumrodenja, zemljarodenja, visinacm, "networth$", filmovi, serije, nagrade) FROM stdin;
Victoria	Pedretti	28	1995-10-23	USA	160	1000000	["Origin", "Shirley"]	["You", "The Haunting of Hill House"]	["MTV Award", "Saturn Award"]
Jennifer	Lawrence	33	1990-08-15	USA	175	160000000	["The Hunger Games", "Passengers", "No Hard Feelings", "Don't Look Up", "X-Men: First Class"]	["Monk"]	["Golden Globe", "SAG Award", "Academy Award"]
Angelina	Jolie	48	1975-06-04	USA	169	120000000	["Lara Croft: Tomb Raider", "The Tourist", "Maleficent"]	["Entourage"]	["Academy Award", "3 Golden Globe Awards"]
Margot	Robbie	33	1990-07-02	Australia	168	40000000	["Barbie", "Suicide Squad", "The Wolf of Wall Street"]	["Neighbours"]	["3 AACTA International Awards", "Empire Award", "People's Choice Award"]
Viola	Davis	58	1965-08-11	USA	165	25000000	["The Help", "The Woman King", "Fences"]	["How to Get Away with Murder", "Sofia the First"]	["Academy Award", "Emmy Award", "2 Tony Awards", "Golden Globe Award"]
Ryan	Reynolds	47	1976-10-23	Canada	188	350000000	["Deadpool", "Free Guy", "Green Lantern"]	["The X-Files", "Scrubs", "Fifteen"]	["Critic's Choice Award", "Saturn Award", "Teen Choice Award"]
Cillian	Murphy	47	1976-05-25	Ireland	172	20000000	["Inception", "Oppenheimer", "28 Days Later", "Red Eye"]	["Peaky Blinders"]	["Golden FIPA", "IFTA Award", "TV Choice Award"]
Timothée	Chalamet	27	1995-12-27	USA	178	25000000	["Dune", "Call Me by Your Name", "Bones and All", "Don't Look Up"]	\N	["Dorian Awards", "2 Hollywood Film Awards", "Independent Spirit Award"]
Noah	Schnapp	19	2004-10-03	USA	174	4000000	["The Tutor", "The Peanuts Movie"]	["Stranger Things"]	["MTV Movie Award", "People's Choice Award", "Teen Choice Award"]
Leonardo	DiCaprio	48	1974-11-11	USA	183	300000000	["Inception", "The Wolf Of Wall Street", "Don't Look Up", "The Revenant"]	["Growing Pains", "Parenthood"]	["Academy Award", "BAFTA", "3 Golden Globes"]
\.


-- Completed on 2023-10-31 21:21:12

--
-- PostgreSQL database dump complete
--

