CREATE TABLE IF NOT EXISTS "library"
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

INSERT INTO "library" ("id", "user_id", "name", "description")	VALUES ('1', 'user1', 'My Library Name', 'My Library description');
INSERT INTO "library" ("id", "user_id", "name", "description")	VALUES ('2', 'user2', 'My Library Name for user 2', 'My Library description for user 2');
INSERT INTO "library" ("id", "user_id", "name", "description")	VALUES ('3', 'user2', 'My Library Name for user 2 for update test', 'To be updated');
INSERT INTO "library" ("id", "user_id", "name", "description")	VALUES ('4', 'user2', 'My Library Name for user 2 for delete test', 'To be deleted');
INSERT INTO "library" ("id", "user_id", "name", "description")	VALUES ('5', 'user3', 'My Library Name for user 3', 'To be read');
INSERT INTO "library" ("id", "user_id", "name", "description")	VALUES ('6', 'user4', 'My Library Name', 'My Library description'); -- Contains some books

INSERT INTO "library" ("id", "user_id", "name", "description")	VALUES ('7', 'user5', 'My Library Name', 'My Library description'); -- Contains some books

INSERT INTO "library" ("id", "user_id", "name", "description")	VALUES ('af9da085-4562-475f-baa5-38c3e5115c09', 'user6', 'My Library Name', 'My Library description'); -- Container for add books tests

INSERT INTO "library" ("id", "user_id", "name", "description")	VALUES ('73b57d71-4938-45cc-9880-51db8ebf3e7a', 'user7', 'My Library Name', 'My Library description'); -- Container for update books tests

INSERT INTO "library" ("id", "user_id", "name", "description")	VALUES ('e0d7422f-ca44-4dac-bb56-51fe67cc3809', 'user8', 'My Library Name', 'My Library description'); -- Container for add book tests with thumbnail

INSERT INTO "library" ("id", "user_id", "name", "description")	VALUES ('979ed879-b3c0-40fa-83ff-5f4442052217', 'user9', 'My Library Name', 'My Library description'); -- Container for update book tests with thumbnail

INSERT INTO "library" ("id", "user_id", "name", "description")	VALUES ('4ba98133-ebd1-4fed-b7b2-920745b9c429', 'user10', 'My Library Name', 'My Library description'); -- Container for search books tests

-- Library for testing lending use case where this library (nor its books) cannot be deleted
INSERT INTO "library" ("id", "user_id", "name", "description")	VALUES ('100', 'user11', 'My Library Name', 'My Library description');

-- Library for testing lending use case
INSERT INTO "library" ("id", "user_id", "name", "description")	VALUES ('101', 'user12', 'My Library Name', 'My Library description');

-- Library with no books, should be deleted
INSERT INTO "library" ("id", "user_id", "name", "description")	VALUES ('103', 'user13', 'My Library Name', 'My Library description');