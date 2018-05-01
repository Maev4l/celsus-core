CREATE TABLE IF NOT EXISTS "celsus"."library"
(
    id VARCHAR(36) NOT NULL,
    user_id VARCHAR(36) NOT NULL,
    name VARCHAR(100) NOT NULL,
    description VARCHAR(512) ,
    CONSTRAINT library_id_key UNIQUE (id)
)
WITH (
    OIDS = FALSE
)
TABLESPACE pg_default;

INSERT INTO "celsus"."library" ("id", "user_id", "name", "description")	VALUES ('1', '', 'My Book Title', 'My Book description');