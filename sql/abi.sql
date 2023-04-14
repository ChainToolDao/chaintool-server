--
-- PostgreSQL database dump
--

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

