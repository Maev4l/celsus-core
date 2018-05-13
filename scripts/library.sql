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

INSERT INTO "celsus"."library" ("id", "user_id", "name", "description")	VALUES ('1', 'user1', 'My Library Name', 'My Library description');
INSERT INTO "celsus"."library" ("id", "user_id", "name", "description")	VALUES ('2', 'user2', 'My Library Name for user 2', 'My Library description for user 2');
INSERT INTO "celsus"."library" ("id", "user_id", "name", "description")	VALUES ('3', 'user2', 'My Library Name for user 2 for update test', 'To be updated');
INSERT INTO "celsus"."library" ("id", "user_id", "name", "description")	VALUES ('4', 'user2', 'My Library Name for user 2 for delete test', 'To be deleted');
INSERT INTO "celsus"."library" ("id", "user_id", "name", "description")	VALUES ('5', 'user3', 'My Library Name for user 3', 'To be read');
INSERT INTO "celsus"."library" ("id", "user_id", "name", "description")	VALUES ('6', 'user4', 'My Library Name', 'My Library description'); -- Contains some books

INSERT INTO "celsus"."library" ("id", "user_id", "name", "description")	VALUES ('7', 'user5', 'My Library Name', 'My Library description'); -- Contains some books