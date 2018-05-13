CREATE TABLE IF NOT EXISTS "celsus"."book"
(
    id VARCHAR(36) NOT NULL,
    user_id VARCHAR(36) NOT NULL,
	  library_id VARCHAR(36) NOT NULL,
    title VARCHAR(100) NOT NULL,
    description VARCHAR(1024) ,
	  isbn10 VARCHAR(30) ,
	  isbn13 VARCHAR(30) ,
	  thumbnail TEXT,
	  authors VARCHAR(1024) ,
	  tags VARCHAR(1024) ,
	  hash VARCHAR(64) ,
    CONSTRAINT book_id_key UNIQUE (id)
)
WITH (
    OIDS = FALSE
)
TABLESPACE pg_default;

-- Belong to library with id 6 (for retrieval test)
INSERT INTO "celsus"."book"("id", "user_id", "library_id", "title", "description", "isbn10", "isbn13", "thumbnail", "authors", "tags", "hash")
  VALUES ('1', 'user4', '6', 'Book Title1', 'Book Desc', 'Book isbn10', 'Book isbn13', 'Book thumbnal', 'Book authors', 'Book tags', 'Book hash');
INSERT INTO "celsus"."book"("id", "user_id", "library_id", "title", "description", "isbn10", "isbn13", "thumbnail", "authors", "tags", "hash")
  VALUES ('2', 'user4', '6', 'Book Title2', 'Book Desc', 'Book isbn10', 'Book isbn13', 'Book thumbnal', 'Book authors', 'Book tags', 'Book hash');

-- Belong to library with id 4 (for deletion test)
INSERT INTO "celsus"."book"("id", "user_id", "library_id", "title", "description", "isbn10", "isbn13", "thumbnail", "authors", "tags", "hash")
  VALUES ('3', 'user2', '4', 'Book Title', 'Book Desc', 'Book isbn10', 'Book isbn13', 'Book thumbnal', 'Book authors', 'Book tags', 'Book hash');

-- Belong to library with id 7 (for deletion test)
INSERT INTO "celsus"."book"("id", "user_id", "library_id", "title", "description", "isbn10", "isbn13", "thumbnail", "authors", "tags", "hash")
  VALUES ('4', 'user5', '7', 'Book Title', 'Book Desc', 'Book isbn10', 'Book isbn13', 'Book thumbnal', 'Book authors', 'Book tags', 'Book hash');

