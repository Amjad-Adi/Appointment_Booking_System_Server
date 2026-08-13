CREATE EXTENSION IF NOT EXISTS postgis;

CREATE TABLE users(
	id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
	uuid UUID DEFAULT gen_random_uuid() UNIQUE,
	first_name VARCHAR(64) NOT NULL,
 	last_name VARCHAR(64) NOT NULL,
	email VARCHAR(320) UNIQUE NOT NULL,
	firebase_uid VARCHAR(128) NOT NULL,
	profile_picture_path TEXT DEFAULT 'DEFAULT_PICTURE_PATH',
	created_at_utc TIMESTAMPTZ NOT NULL DEFAULT now(),
	updated_at_utc TIMESTAMPTZ NOT NULL DEFAULT now(),
	organization_id BIGINT,
	language CHAR(2) DEFAULT 'en',
	role VARCHAR(16) NOT NULL CHECK (role in('WORKER','MANAGER','SUPER ADMIN', 'CRM', 'CUSTOMER')),
	status VARCHAR(8) NOT NULL CHECK (status in('ACTIVE','INACTIVE')) DEFAULT 'ACTIVE',
	FOREIGN KEY (organization_id) REFERENCES organizations(id) ON DELETE CASCADE ON UPDATE CASCADE
);
ALTER TABLE users ALTER COLUMN status role CHECK (role in('SUPER ADMIN','''WORKER','MANAGER',, 'CRM', 'CUSTOMER')),
CREATE TABLE locations(
	id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
	name varchar(1024) NOT NULL,
	created_at_utc TIMESTAMPTZ NOT NULL DEFAULT now(),	
	updated_at_utc TIMESTAMPTZ NOT NULL DEFAULT now(),
	location_on_map GEOMETRY(point,4326)
);



CREATE TABLE system_messages(
	uuid UUID DEFAULT gen_random_uuid() UNIQUE PRIMARY KEY,
	message TEXT NOT NULL,
	type VARCHAR(256) NOT NULL CHECK (type in ('CRITICAL','IMPORTANT','WARNING','SUCCESS','INFO','REMINDER','ANNOUNCEMENT')),
	status VARCHAR(256) NOT NULL CHECK (status in('ACTIVE,INACTIVE')),
	created_at_utc TIMESTAMPTZ NOT NULL DEFAULT now(),
	read_at_utc DATE,
);

CREATE TABLE organizations(
	id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
	uuid UUID DEFAULT gen_random_uuid() UNIQUE,
	name VARCHAR(256),
	email VARCHAR(320) UNIQUE NOT NULL,
	phone_number VARCHAR(20),
	bio VARCHAR(4096),
	location_id BIGINT,
	profile_picture_path TEXT DEFAULT 'DEFAULT_PICTURE_PATH',
	created_at_utc TIMESTAMPTZ NOT NULL DEFAULT now(),
	updated_at_utc TIMESTAMPTZ NOT NULL DEFAULT now(),
	status VARCHAR(8) NOT NULL CHECK (status in('ACTIVE','INACTIVE')) DEFAULT 'ACTIVE',
	FOREIGN KEY (location_id) REFERENCES locations(id) ON DELETE SET NULL ON UPDATE CASCADE
);


CREATE TABLE special_days(
	uuid UUID DEFAULT gen_random_uuid() UNIQUE PRIMARY KEY,
	organization_id BIGINT NOT NULL,
	name VARCHAR(256),
	day_date DATE NOT NULL DEFAULT now(),
	description VARCHAR(4096),
	status VARCHAR(256) NOT NULL CHECK (status in(' ')),
	FOREIGN KEY (organization_id) REFERENCES organizations(id) ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE services(
 	id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
	uuid UUID DEFAULT gen_random_uuid() UNIQUE,
	name VARCHAR(256),
	description VARCHAR(4096),
	price REAL NOT NULL,
	duration_in_minutes INTEGER NOT NULL,
	organization_id BIGINT NOT NULL,
	picture_path TEXT DEFAULT 'DEFAULT_PICTURE_PATH',
	created_at_utc TIMESTAMPTZ NOT NULL DEFAULT now(),
	updated_at_utc TIMESTAMPTZ NOT NULL DEFAULT now(),
	status VARCHAR(8) NOT NULL CHECK (status in('ACTIVE','INACTIVE')) DEFAULT 'ACTIVE',
	FOREIGN KEY (organization_id) REFERENCES organizations(id) ON DELETE RESTRICT ON UPDATE CASCADE
);

CREATE TABLE customer_favourite_service(
	customer_id BIGINT NOT NULL,
	service_id BIGINT NOT NULL,
	created_at_utc TIMESTAMPTZ NOT NULL DEFAULT now(),
	PRIMARY KEY (customer_id,service_id),
	FOREIGN KEY (customer_id) REFERENCES customers(user_id) ON DELETE CASCADE ON UPDATE CASCADE,
	FOREIGN KEY (service_id) REFERENCES services(id) ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE rooms(
 	id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
	uuid UUID DEFAULT gen_random_uuid() UNIQUE,
	name VARCHAR(256),
	description VARCHAR(4096),
	organization_id BIGINT NOT NULL,
	created_at_utc TIMESTAMPTZ NOT NULL DEFAULT now(),
	updated_at_utc TIMESTAMPTZ NOT NULL DEFAULT now(),
	status VARCHAR(8) NOT NULL CHECK (status in('ACTIVE','INACTIVE')) DEFAULT 'ACTIVE',
	occupancy_status VARCHAR(10) NOT NULL CHECK (occupancy_status in('OCCUPIED','AVAILABLE')) DEFAULT 'AVAILABLE',
	FOREIGN KEY (organization_id) REFERENCES organizations(id) ON DELETE CASCADE ON UPDATE CASCADE
);
DROP TABLE rooms;
CREATE TABLE service_use_slot(
	slot_id BIGINT NOT NULL,
	service_id BIGINT NOT NULL,
	PRIMARY KEY (slot_id,service_id),
	FOREIGN KEY (slot_id) REFERENCES slots(id) ON DELETE CASCADE ON UPDATE CASCADE,
	FOREIGN KEY (service_id) REFERENCES services(id) ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE slot_blocks(
 	id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
	uuid UUID DEFAULT gen_random_uuid() UNIQUE,
	reason VARCHAR(4096),
	start_time TIMESTAMPTZ NOT NUll,
	end_time TIMESTAMPTZ NOT NUll,
	organization_employee_id BIGINT,
	created_at_utc TIMESTAMPTZ NOT NULL DEFAULT now(),
	status VARCHAR(256) NOT NULL CHECK (status in(' ')),
	FOREIGN KEY (organization_employee_id) REFERENCES organization_employees(user_id) ON DELETE CASCADE ON UPDATE CASCADE
);


CREATE TABLE appointments(
	id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
	uuid UUID DEFAULT gen_random_uuid() UNIQUE,
	name VARCHAR(256),
	note VARCHAR(4096),
	created_at_utc TIMESTAMPTZ NOT NULL DEFAULT now(),
	start_time TIMESTAMPTZ NOT NUll,
	end_time TIMESTAMPTZ NOT NUll,
	colour CHAR(7) NOT NULL,
	payment_method_name VARCHAR(256) NOT NULL CHECK (payment_method_name in(' ')),
	paid_at_utc TIMESTAMPTZ,
	status VARCHAR(256) NOT NULL CHECK (status in(' ')),
	customer_id BIGINT NOT NULL,
	slot_id BIGINT NOT NULL,
	FOREIGN KEY (slot_id) REFERENCES slots(id) ON DELETE RESTRICT ON UPDATE CASCADE,
	FOREIGN KEY (customer_id) REFERENCES customers(user_id) ON DELETE RESTRICT ON UPDATE CASCADE
);

CREATE TABLE reviews(
	customer_id BIGINT NOT NULL,
	appointment_id BIGINT NOT NULL,
	uuid UUID DEFAULT gen_random_uuid() UNIQUE,
	rating REAL,
	comment VARCHAR(4096) NOT NULL,
	created_at_utc TIMESTAMPTZ NOT NULL DEFAULT now(),
	PRIMARY KEY(customer_id, appointment_id),
	FOREIGN KEY (customer_id) REFERENCES customers(user_id) ON DELETE RESTRICT ON UPDATE CASCADE,
	FOREIGN KEY (appointment_id) REFERENCES appointments(id) ON DELETE RESTRICT ON UPDATE CASCADE
);


CREATE TABLE notifications(
	id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
	uuid UUID DEFAULT gen_random_uuid() UNIQUE,
	user_id BIGINT NOT NULL,
	appointment_id BIGINT NOT NULL,
	message TEXT NOT NULL,
	receiver_type VARCHAR(64) NOT NULL CHECK (receiver_type in(' ')),
	status  VARCHAR(256) NOT NULL CHECK (status in(' ')),
	created_at_utc TIMESTAMPTZ NOT NULL DEFAULT now(),
	read_at_utc DATE,
	FOREIGN KEY (user_id) REFERENCES users(person_id) ON DELETE CASCADE ON UPDATE CASCADE,
	FOREIGN KEY (appointment_id) REFERENCES appointments(id) ON DELETE CASCADE ON UPDATE CASCADE
);


CREATE TABLE appointment_histories(
	appointment_id BIGINT NOT NULL,
	uuid UUID DEFAULT gen_random_uuid() UNIQUE PRIMARY KEY,
	name VARCHAR(256),
	note VARCHAR(4096),
	stored_at_utc TIMESTAMPTZ NOT NULL DEFAULT now(),
	start_time TIMESTAMPTZ NOT NUll,
	end_time TIMESTAMPTZ NOT NUll,
	colour CHAR(7) NOT NULL,
	action VARCHAR(256) NOT NULL CHECK (action in(' ')),
	payment_method_name VARCHAR(256) NOT NULL CHECK (payment_method_name in(' ')),
	paid_at_utc TIMESTAMPTZ,
	FOREIGN KEY (appointment_id) REFERENCES appointments(id) ON DELETE RESTRICT ON UPDATE CASCADE
);

CREATE TABLE appointment_handlers(
	appointment_id BIGINT NOT NULL,
	organization_empployee_id BIGINT NOT NULL,
	PRIMARY KEY(appointment_id,organization_empployee_id),
	FOREIGN KEY (appointment_id) REFERENCES appointments(id) ON DELETE CASCADE ON UPDATE CASCADE,
	FOREIGN KEY (organization_empployee_id) REFERENCES organization_employees(user_id) ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE organization_employee_block_slot(
	organization_employee_id BIGINT NOT NULL,
	slot_id BIGINT NOT NULL,
	PRIMARY KEY(slot_id,organization_employee_id),
	FOREIGN KEY (organization_employee_id) REFERENCES organization_employees(user_id) ON DELETE CASCADE ON UPDATE CASCADE,
	FOREIGN KEY (slot_id) REFERENCES slots(id) ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE refresh_tokens(
	id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
	user_id BIGINT NOT NULL,
	token_hash TEXT NOT NULL,
	created_at_utc TIMESTAMPTZ NOT NULL DEFAULT now(),
	expires_at_utc TIMESTAMPTZ NOT NULL DEFAULT now() + INTERVAL '7 days',
    revoked BOOLEAN NOT NULL DEFAULT False,
    revoked_at_utc TIMESTAMPTZ,
	FOREIGN KEY (user_id) REFERENCES users(id) on DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE blacklisted_tokens(
	id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
	jti UUID NOT NULL,
	expires_at_utc TIMESTAMPTZ NOT NULL,
	blacklisted_at_utc TIMESTAMPTZ NOT NULL DEFAULT now(),
	reason VARCHAR(4096)
);

INSERT INTO locations (name, location_on_map)
VALUES ('Birzeit University', ST_GeomFromText('POINT(35.2137 31.7683)', 4326));
SELECT ST_X(location_on_map) AS longitude ,ST_Y(location_on_map) AS latitude
FROM locations;
INSERT INTO users(first_name,last_name, email,firebase_uid,role)
VALUES('Amjad','Adi','adminamjad123@gmail.com','mycFV8dE73XCBa6Tm4uZqa15mqf2','SUPER ADMIN');

INSERT INTO users(first_name,last_name, email,firebase_uid,role)
VALUES('Mohammad','Karam','testuser@gmail.com','mEKXUxFaO0UnGbMEp89hNZ9VsXG2','CUSTOMER');

SELECT * FROM users;
SELECT * FROM locations;
SELECT * FROM organizations;
SELECT * FROM services;
SELECT * FROM blacklisted_token;

