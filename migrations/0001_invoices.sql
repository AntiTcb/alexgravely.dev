-- Invoices and payment events (rebuild plan, section 6).
-- Kept out of EmDash: these are financial records, not content.

CREATE TABLE invoices (
	id            TEXT PRIMARY KEY,                   -- uuid
	token         TEXT NOT NULL UNIQUE,               -- 32 random bytes, base64url
	client_name   TEXT NOT NULL,
	client_email  TEXT,
	description   TEXT NOT NULL,
	amount_cents  INTEGER NOT NULL CHECK (amount_cents > 0),
	currency      TEXT NOT NULL DEFAULT 'USD',
	status        TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'paid', 'void')),
	due_date      TEXT,
	provider      TEXT CHECK (provider IN ('stripe', 'paypal')),
	provider_txn  TEXT,                               -- Stripe PaymentIntent or PayPal capture ID
	paid_at       TEXT,
	emailed_at    TEXT,                               -- last time the invoice link was emailed
	created_at    TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX invoices_created_at ON invoices (created_at);

CREATE TABLE payment_events (
	id            INTEGER PRIMARY KEY AUTOINCREMENT,
	invoice_id    TEXT NOT NULL REFERENCES invoices (id),
	provider      TEXT NOT NULL,
	event_id      TEXT NOT NULL,                      -- provider's event ID
	event_type    TEXT NOT NULL,
	provider_txn  TEXT,
	amount_cents  INTEGER,                            -- amount the provider reports as paid
	currency      TEXT,
	applied       INTEGER NOT NULL,                   -- 1 if it marked the invoice paid, 0 if not
	received_at   TEXT NOT NULL DEFAULT (datetime('now')),
	UNIQUE (provider, event_id)
);

CREATE INDEX payment_events_invoice ON payment_events (invoice_id);
