CREATE TABLE users(
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    "creatdAt" timestamp WITHOUT TIME ZONE DEFAULT NOW()
);

CREATE TABLE links(
    id SERIAL PRIMARY KEY,
    url TEXT NOT NULL,
    "shortLink" TEXT UNIQUE NOT NULL,
    "userId" INTEGER REFERENCES users(id),
    "visitCount" INTEGER NOT NULL DEFAULT 0,
    "creatdAt" timestamp WITHOUT TIME ZONE DEFAULT NOW()
);

CREATE TABLE sessions(
    id SERIAL PRIMARY KEY,
    "userId" INTEGER REFERENCES users(id),
    token TEXT UNIQUE NOT NULL,
    "creatdAt" timestamp WITHOUT TIME ZONE DEFAULT NOW()
);
