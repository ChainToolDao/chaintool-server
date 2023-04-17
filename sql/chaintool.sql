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
-- Name: abi; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.abi (
    id integer NOT NULL,
    address character varying NOT NULL,
    chain_id bigint NOT NULL,
    abi character varying NOT NULL,
    name character varying DEFAULT ''::character varying,
    creator character varying
);


--
-- Name: COLUMN abi.address; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.abi.address IS '合约地址';


--
-- Name: COLUMN abi.chain_id; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.abi.chain_id IS '链ID';


--
-- Name: COLUMN abi.abi; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.abi.abi IS 'abi数据';


--
-- Name: COLUMN abi.name; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.abi.name IS '名称';


--
-- Name: COLUMN abi.creator; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.abi.creator IS '创建者';


--
-- Name: abi_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.abi_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: abi_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.abi_id_seq OWNED BY public.abi.id;


--
-- Name: abi id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.abi ALTER COLUMN id SET DEFAULT nextval('public.abi_id_seq'::regclass);


--
-- Name: abi abi_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.abi
    ADD CONSTRAINT abi_pkey PRIMARY KEY (id);


--
-- Name: abi_address; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX abi_address ON public.abi USING btree (address);

--
-- PostgreSQL database dump complete
--

