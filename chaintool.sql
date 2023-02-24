--
-- PostgreSQL database dump
--

-- Dumped from database version 14.6
-- Dumped by pg_dump version 14.6

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

DROP INDEX IF EXISTS public.abi_fragment_topic;
DROP INDEX IF EXISTS public.abi_fragment_selector;
ALTER TABLE IF EXISTS ONLY public.address DROP CONSTRAINT IF EXISTS address_pkey;
ALTER TABLE IF EXISTS ONLY public.abi_fragment DROP CONSTRAINT IF EXISTS abi_fragment_pkey;
ALTER TABLE IF EXISTS public.abi_fragment ALTER COLUMN id DROP DEFAULT;
DROP TABLE IF EXISTS public.address;
DROP SEQUENCE IF EXISTS public.address_id_seq;
DROP SEQUENCE IF EXISTS public.abi_fragment_seq;
DROP TABLE IF EXISTS public.abi_fragment;
SET default_tablespace = '';


--
-- Name: abi_fragment; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.abi_fragment (
    id integer NOT NULL,
    sig character varying,
    selector character varying,
    add_time timestamp without time zone DEFAULT now() NOT NULL,
    contract character varying,
    chain_id integer,
    sig_full character varying,
    type smallint DEFAULT '-1'::integer NOT NULL,
    topic character varying
);


--
-- Name: COLUMN abi_fragment.type; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.abi_fragment.type IS '-1:未知; 0:构造函数;1:函数;2:事件;3:;错误';


--
-- Name: abi_fragment_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.abi_fragment_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: abi_fragment_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.abi_fragment_seq OWNED BY public.abi_fragment.id;


--
-- Name: address_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.address_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: address; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.address (
    id integer DEFAULT nextval('public.address_id_seq'::regclass) NOT NULL,
    address character varying NOT NULL,
    label character varying,
    is_contract boolean,
    contract_name character varying,
    add_ts timestamp without time zone DEFAULT now() NOT NULL,
    chain_id integer
);


--
-- Name: abi_fragment id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.abi_fragment ALTER COLUMN id SET DEFAULT nextval('public.abi_fragment_seq'::regclass);


--
-- Name: abi_fragment abi_fragment_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.abi_fragment
    ADD CONSTRAINT abi_fragment_pkey PRIMARY KEY (id);


--
-- Name: address address_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.address
    ADD CONSTRAINT address_pkey PRIMARY KEY (id);


--
-- Name: abi_fragment_selector; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX abi_fragment_selector ON public.abi_fragment USING btree (selector);


--
-- Name: abi_fragment_topic; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX abi_fragment_topic ON public.abi_fragment USING btree (topic);


--
-- PostgreSQL database dump complete
--

