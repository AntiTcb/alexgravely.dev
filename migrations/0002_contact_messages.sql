-- Messages from the /contact form. Stored so nothing is lost if email fails.

CREATE TABLE contact_messages (
	id          INTEGER PRIMARY KEY AUTOINCREMENT,
	name        TEXT NOT NULL,
	email       TEXT NOT NULL,
	subject     TEXT,
	message     TEXT NOT NULL,
	emailed     INTEGER NOT NULL DEFAULT 0,       -- 1 once forwarded to NOTIFY_EMAIL
	created_at  TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX contact_messages_created_at ON contact_messages (created_at);
