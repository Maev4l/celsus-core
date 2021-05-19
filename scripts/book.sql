CREATE TABLE IF NOT EXISTS "book"
(
    id VARCHAR(36) NOT NULL,
    user_id VARCHAR(36) NOT NULL,
	library_id VARCHAR(36) NOT NULL,
    title VARCHAR(100) NOT NULL,
    description VARCHAR(1024) ,  
	isbn10 VARCHAR(30),
	isbn13 VARCHAR(30),
	authors VARCHAR(1024) ARRAY,
	tags VARCHAR(1024) ARRAY,
	hash VARCHAR(64),
    language VARCHAR(36) NOT NULL DEFAULT('french'),
	book_set VARCHAR(100) DEFAULT(''),
	book_set_order INTEGER DEFAULT(0),
	lending_id VARCHAR(36) DEFAULT(NULL),
    CONSTRAINT book_id_key UNIQUE (id)
)
WITH (
    OIDS = FALSE
)
TABLESPACE pg_default;

CREATE TABLE IF NOT EXISTS "books_search"
(
	id VARCHAR(36) NOT NULL,
	document TEXT,
	language TEXT
)
WITH (
	OIDS = FALSE
)
TABLESPACE pg_default;

CREATE OR REPLACE FUNCTION "celsus_core"."books_search_refresh"() RETURNS TRIGGER
AS $books_search_refresh$
	BEGIN
		IF (TG_OP = 'DELETE') THEN
			DELETE FROM "celsus_core"."books_search" WHERE "id" = OLD."id";
		ELSIF (TG_OP = 'UPDATE') THEN
			UPDATE "celsus_core"."books_search" 
			SET "document" = to_tsvector('simple',unaccent(NEW."title")) || to_tsvector('simple',unaccent(array_to_string(NEW."authors",' '))),
			"language" = NEW."language"
			WHERE "id"=NEW."id";
		ELSIF (TG_OP = 'INSERT') THEN
			INSERT INTO "celsus_core"."books_search" ("id", "document", "language") 
			VALUES (NEW."id",
					to_tsvector('simple',unaccent(NEW."title")) || to_tsvector('simple',unaccent(array_to_string(NEW."authors",' '))),
					NEW."language"
				   );
		END IF;
		RETURN NULL;
	END;
$books_search_refresh$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS books_search_indexer ON "celsus_core"."book";
CREATE TRIGGER books_search_indexer
AFTER INSERT OR UPDATE OR DELETE ON "celsus_core"."book"
	FOR EACH ROW EXECUTE PROCEDURE "celsus_core"."books_search_refresh"();

CREATE INDEX IF NOT EXISTS idx_fts_books ON "celsus_core"."books_search" USING gin(to_tsvector('simple',"document"));

-- Belong to library with id 6 (for retrieval test)
INSERT INTO "book"("id", "user_id", "library_id", "title", "description", "isbn10", "isbn13", "authors", "tags", "hash", "book_set")
  VALUES ('1', 'user4', '6', 'Book Title1', 'Book Desc', 'Book isbn10', 'Book isbn13', ARRAY['Book authors'], ARRAY['Book tags'], 'Book hash', 'book set 1');
INSERT INTO "book"("id", "user_id", "library_id", "title", "description", "isbn10", "isbn13", "authors", "tags", "hash","book_set")
  VALUES ('2', 'user4', '6', 'Book Title2', 'Book Desc', 'Book isbn10', 'Book isbn13', ARRAY['Book authors'], ARRAY['Book tags'], 'Book hash', 'book set 2');

-- Belong to library with id 4 (for deletion test)
INSERT INTO "book"("id", "user_id", "library_id", "title", "description", "isbn10", "isbn13", "authors", "tags", "hash")
  VALUES ('3', 'user2', '4', 'Book Title', 'Book Desc', 'Book isbn10', 'Book isbn13', ARRAY['Book authors'], ARRAY['Book tags'], 'Book hash');

-- Belong to library with id 7 (for deletion test)
INSERT INTO "book"("id", "user_id", "library_id", "title", "description", "isbn10", "isbn13", "authors", "tags", "hash")
  VALUES ('4', 'user5', '7', 'Book Title', 'Book Desc', 'Book isbn10', 'Book isbn13', ARRAY['Book authors'], ARRAY['Book tags'], 'Book hash');
INSERT INTO "book"("id", "user_id", "library_id", "title", "description", "isbn10", "isbn13", "authors", "tags", "hash")
  VALUES ('5', 'user5', '7', 'Book Title', 'Book Desc', 'Book isbn10', 'Book isbn13', ARRAY['Book authors'], ARRAY['Book tags'], 'Book hash');


-- Belong to user 7 (for update book test)
INSERT INTO "book"("id", "user_id", "library_id", "title", "description", "isbn10", "isbn13", "authors", "tags", "hash")
  VALUES ('2894d16a-78fe-4dfc-a2b0-0a080898a490', 'user7', '73b57d71-4938-45cc-9880-51db8ebf3e7a', 'Book Title', 'Book Desc', 'Book isbn10', 'Book isbn13', ARRAY['Book authors'], ARRAY['Book tags'], 'Book hash');

-- Belong to user 9 (for update book test with thumbnail)
INSERT INTO "book"("id", "user_id", "library_id", "title", "description", "isbn10", "isbn13", "authors", "tags", "hash")
  VALUES ('341e5d68-4682-4b91-9058-200a60d4ad75', 'user9', '979ed879-b3c0-40fa-83ff-5f4442052217', 'Book Title', 'Book Desc', 'Book isbn10', 'Book isbn13', ARRAY['Book authors'], ARRAY['Book tags'], 'Book hash');

-- Belong to user 10 (for search books test)
INSERT INTO "book"("id", "user_id", "library_id", "title", "description", "isbn10", "isbn13", "authors", "tags", "hash", "book_set", "book_set_order")
  VALUES ('d6f7359c-8f2b-428b-a295-806069e60a3f', 'user10', '4ba98133-ebd1-4fed-b7b2-920745b9c429', 'Le château de ma mère', 'Ce deuxième tome est dans le prolongement chronologique de La Gloire de mon père', 'Book isbn10', 'Book isbn13', ARRAY['Marcel Pagnol'], ARRAY['Book tags'], 'Book hash','Set1',2);
INSERT INTO "book"("id", "user_id", "library_id", "title", "description", "isbn10", "isbn13", "authors", "tags", "hash")
  VALUES ('04d1f1ac-90eb-489c-b39d-71acd572b563', 'user10', '4ba98133-ebd1-4fed-b7b2-920745b9c429', 'Le Ventre de Paris', 'Le personnage principal est Florent, le demi-frère de Quenu', 'Book isbn10', 'Book isbn13', ARRAY['Emile Zola'], ARRAY['Book tags'], 'Book hash');
INSERT INTO "book"("id", "user_id", "library_id", "title", "description", "isbn10", "isbn13", "authors", "tags", "hash", "book_set", "book_set_order")
  VALUES ('8fe9470f-4daf-4559-b903-af9a9937ed72', 'user10', '4ba98133-ebd1-4fed-b7b2-920745b9c429', 'La gloire de ma mère', 'Je suis né dans la ville d''Aubagne, sous le Garlaban couronné de chèvres, au temps des derniers chevriers ', 'Book isbn10', 'Book isbn13', ARRAY['Marcel Pagnol'], ARRAY['Book tags'], 'Book hash','Set1',1);

-- Book lending use case where it cannot be deleted
INSERT INTO "book"("id", "user_id", "library_id", "title", "lending_id") VALUES ('100', 'user11', '100', 'Book100', 'lend1');

-- Book for testing lending use case
INSERT INTO "book"("id", "user_id", "library_id", "title") VALUES ('101', 'user12', '101', 'Book101');
INSERT INTO "book"("id", "user_id", "library_id", "title", "lending_id") VALUES ('102', 'user12', '101', 'Book102','PENDING');
INSERT INTO "book"("id", "user_id", "library_id", "title", "lending_id") VALUES ('103', 'user12', '101', 'Book103','PENDING');
INSERT INTO "book"("id", "user_id", "library_id", "title", "lending_id") VALUES ('104', 'user12', '101', 'Book104','PENDING');

-- Book for testing return book use case
INSERT INTO "book"("id", "user_id", "library_id", "title", "lending_id") VALUES ('105', 'user13', '102', 'Book105','lend2');

-- Books for 'list-books-from-library' test
INSERT INTO "book"("id", "user_id", "library_id", "title") VALUES ('106', 'user14', '104', 'Book106');

-- Book for 'get-book' test
INSERT INTO "book"("id", "user_id", "library_id", "title") VALUES ('107', 'user15', '106', 'Book107');

-- Books for 'get-booksets-from-library' test
INSERT INTO "book"("id", "user_id", "library_id", "title", "book_set","book_set_order") VALUES ('108', 'user16', '107', 'Book108', 'Set1',1);
INSERT INTO "book"("id", "user_id", "library_id", "title", "book_set","book_set_order") VALUES ('109', 'user16', '107', 'Book109', 'Set1',2);
INSERT INTO "book"("id", "user_id", "library_id", "title", "book_set","book_set_order") VALUES ('110', 'user16', '107', 'Book110', 'Set2',1);
INSERT INTO "book"("id", "user_id", "library_id", "title", "book_set","book_set_order") VALUES ('111', 'user16', '107', 'Book111', '',0);
INSERT INTO "book"("id", "user_id", "library_id", "title", "book_set","book_set_order") VALUES ('112', 'user16', '107', 'Book112', NULL,0);

-- Book for 'get-book' test
INSERT INTO "book"("id", "user_id", "library_id", "title") VALUES ('113', 'user15', '106', 'Book113');

-- Books for 'list-books-from-library' test
INSERT INTO "book"("id", "user_id", "library_id", "title") VALUES ('114', 'user14', '104', 'Book114');