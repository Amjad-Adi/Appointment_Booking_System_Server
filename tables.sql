CREATE EXTENSION IF NOT EXISTS postgis;

CREATE TABLE users(
id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
uuid UUID DEFAULT gen_random_uuid() UNIQUE,
first_name VARCHAR(64) NOT NULL,
last_name VARCHAR(64) NOT NULL,
email VARCHAR(320) UNIQUE NOT NULL,
firebase_uid VARCHAR(128) NOT NULL,
profile_picture_path TEXT NOT NULL DEFAULT 'DEFAULT_PICTURE_PATH',
created_at_utc TIMESTAMPTZ NOT NULL DEFAULT now(),
updated_at_utc TIMESTAMPTZ NOT NULL DEFAULT now(),
organization_id BIGINT,
language CHAR(2) NOT NULL DEFAULT 'en',
role VARCHAR(16) NOT NULL CHECK (role IN('WORKER','OWNER','MANAGER','SUPER ADMIN', 'CRM', 'CUSTOMER')),
status VARCHAR(8) NOT NULL CHECK (status IN('ACTIVE','INACTIVE')) DEFAULT 'ACTIVE',
FOREIGN KEY (organization_id) REFERENCES organizations(id) ON DELETE CASCADE ON UPDATE CASCADE
);
DROP TABLE users;

ALTER TABLE users ALTER COLUMN role CHECK (role in('SUPER ADMIN','WORKER','MANAGER', 'CRM', 'CUSTOMER')),
ALTER TABLE users ALTER COLUMN language SET NOT NULL;
ALTER TABLE users ALTER COLUMN profile_picture_path set DEFAULT 'DEFAULT_PICTURE_PATH';
UPDATE users
set language='en';

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
type VARCHAR(256) NOT NULL CHECK (type IN ('CRITICAL','IMPORTANT','WARNING','SUCCESS','INFO','REMINDER','ANNOUNCEMENT')),
status VARCHAR(256) NOT NULL CHECK (status IN('ACTIVE,INACTIVE')),
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
profile_picture_path TEXT NOT NULL DEFAULT 'DEFAULT_PICTURE_PATH',
created_at_utc TIMESTAMPTZ NOT NULL DEFAULT now(),
updated_at_utc TIMESTAMPTZ NOT NULL DEFAULT now(),
status VARCHAR(8) NOT NULL CHECK (status in('ACTIVE','INACTIVE')) DEFAULT 'ACTIVE',
FOREIGN KEY (location_id) REFERENCES locations(id) ON DELETE SET NULL ON UPDATE CASCADE
);
ALTER TABLE organizations ALTER COLUMN profile_picture_path set NOT NULL;
DROP TABLE organizations;

CREATE TABLE special_days(
id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
uuid UUID DEFAULT gen_random_uuid() UNIQUE,
organization_id BIGINT NOT NULL,
name VARCHAR(256) NOT NULL,
day_date DATE NOT NULL,
created_at_utc TIMESTAMPTZ NOT NULL DEFAULT now(),
updated_at_utc TIMESTAMPTZ NOT NULL DEFAULT now(),
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
picture_path TEXT  NOT NULL DEFAULT 'DEFAULT_PICTURE_PATH',
created_at_utc TIMESTAMPTZ NOT NULL DEFAULT now(),
updated_at_utc TIMESTAMPTZ NOT NULL DEFAULT now(),
status VARCHAR(8) NOT NULL CHECK (status in('ACTIVE','INACTIVE')) DEFAULT 'ACTIVE',
FOREIGN KEY (organization_id) REFERENCES organizations(id) ON DELETE RESTRICT ON UPDATE CASCADE
);

CREATE TABLE service_categories(
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    uuid UUID DEFAULT gen_random_uuid() UNIQUE,
    name VARCHAR(256) NOT NULL UNIQUE,
    description VARCHAR(4096),
	picture_path TEXT DEFAULT NOT NULL 'DEFAULT_PICTURE_PATH',
    created_at_utc TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at_utc TIMESTAMPTZ NOT NULL DEFAULT now(),
    status VARCHAR(8) NOT NULL CHECK (status IN ('ACTIVE', 'INACTIVE')) DEFAULT 'ACTIVE',
);

CREATE TABLE service_category_junction(
    service_category_id BIGINT NOT NULL,
    service_id BIGINT NOT NULL,
    PRIMARY KEY (service_category_id, service_id),
    FOREIGN KEY (service_category_id) REFERENCES service_categories(id) ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (service_id) REFERENCES services(id) ON DELETE CASCADE ON UPDATE CASCADE,

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
name VARCHAR(256) NOT NULL,
description VARCHAR(4096),
user_id BIGINT,
organization_id BIGINT NOT NULL,
created_at_utc TIMESTAMPTZ NOT NULL DEFAULT now(),
updated_at_utc TIMESTAMPTZ NOT NULL DEFAULT now(),
status VARCHAR(8) NOT NULL CHECK (status in('ACTIVE','INACTIVE')) DEFAULT 'ACTIVE',
occupancy_status VARCHAR(10) NOT NULL CHECK (occupancy_status in('OCCUPIED','AVAILABLE')) DEFAULT 'AVAILABLE',
FOREIGN KEY (organization_id) REFERENCES organizations(id) ON DELETE CASCADE ON UPDATE CASCADE,
FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL ON UPDATE CASCADE
);

DROP TABLE rooms;

CREATE TABLE service_use_slot(
slot_id BIGINT NOT NULL,
service_id BIGINT NOT NULL,
PRIMARY KEY (slot_id,service_id),
FOREIGN KEY (slot_id) REFERENCES slots(id) ON DELETE CASCADE ON UPDATE CASCADE,
FOREIGN KEY (service_id) REFERENCES services(id) ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE time_block(
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
uuid UUID DEFAULT gen_random_uuid() UNIQUE,
reason VARCHAR(4096),
start_time_utc TIMESTAMPTZ NOT NUll,
end_time_utc TIMESTAMPTZ NOT NUll,
request_user_id BIGINT NOT NULL,
respond_user_id BIGINT,
requested_at_utc TIMESTAMPTZ NOT NULL DEFAULT now(),
responded_at_utc TIMESTAMPTZ,
request_status VARCHAR(256) NOT NULL CHECK (request_status IN ('APPROVED', 'PENDING', 'REJECTED','DELETED')) DEFAULT 'PENDING',
FOREIGN KEY (request_user_id) REFERENCES users(id) ON DELETE CASCADE ON UPDATE CASCADE,
FOREIGN KEY (respond_user_id) REFERENCES users(id) ON DELETE CASCADE ON UPDATE CASCADE
);

DROP TABLE time_block;

CREATE TABLE appointments(
id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
uuid UUID DEFAULT gen_random_uuid() UNIQUE,
name VARCHAR(256),
user_note VARCHAR(4096),
organizaiton_note VARCHAR(4096),
rejection_reason VARCHAR(4096),
created_at_utc TIMESTAMPTZ NOT NULL DEFAULT now(),
scheduled_start_at_utc TIMESTAMPTZ NOT NUll,
sceduled_end_at_utc TIMESTAMPTZ NOT NUll,
actual_start_at_utc TIMESTAMPTZ,
actual_end_at_utc TIMESTAMPTZ,
user_colour CHAR(7) NOT NULL,
organization_colour CHAR(7) NOT NULL DEFAULT '#2563EB',
payment_method VARCHAR(10) NOT NULL CHECK (payment_method in('CASH','VISA')),
paid_at_utc TIMESTAMPTZ,
appointment_status VARCHAR(16) NOT NULL CHECK (appointment_status in('PENDING','CONFIRMED','CHECKED_IN','IN_PROGRESS','COMPLETED','REJECTED','NO_SHOW')) DEFAULT 'PENDING',
user_id BIGINT NOT NULL,
room_id BIGINT NOT NULL,
service_id BIGINT NOT NULL,
approval_user_id BIGINT,
FOREIGN KEY (room_id) REFERENCES rooms(id) ON DELETE RESTRICT ON UPDATE CASCADE,
FOREIGN KEY (approval_id) REFERENCES users(id) ON DELETE RESTRICT ON UPDATE CASCADE,
FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE RESTRICT ON UPDATE CASCADE
FOREIGN KEY (service_id) REFERENCES services(id) ON DELETE RESTRICT ON UPDATE CASCADE

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
receiver_type VARCHAR(64) NOT NULL CHECK (receiver_type IN(' ')),
status  VARCHAR(256) NOT NULL CHECK (status IN(' ')),
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
action VARCHAR(256) NOT NULL CHECK (action IN(' ')),
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

CREATE TABLE invitations(
id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
uuid UUID DEFAULT gen_random_uuid() UNIQUE,
sender_id BIGINT,
recipient_email VARCHAR(320),
created_at_utc TIMESTAMPTZ NOT NULL DEFAULT now(),
expires_at_utc TIMESTAMPTZ NOT NULL,
invitation_status VARCHAR(16) NOT NULL CHECK (invitation_status IN('PENDING','REJECTED','ACCEPTED','FAILED','EXPIRED')) DEFAULT 'PENDING',
FOREIGN KEY (sender_id) REFERENCES users(id) on DELETE CASCADE ON UPDATE CASCADE
);

DROP TABLE invitations;

CREATE TABLE working_hours(
id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
uuid UUID DEFAULT gen_random_uuid() UNIQUE,
organization_id BIGINT,
day_of_week VARCHAR(10) NOT NULL CHECK (day_of_week IN ('FRIDAY','SATURDAY','SUNDAY','MONDAY','TUESDAY','WEDNESDAY','THURSDAY')),
start_time TIME,
end_time TIME,
UNIQUE(organization_id,day_of_week),
FOREIGN KEY (organization_id) REFERENCES organizations(id) ON DELETE CASCADE ON UPDATE CASCADE
);

DROP TABLE working_hours;

INSERT INTO locations (name, location_on_map)
VALUES ('Birzeit University', ST_GeomFromText('POINT(35.2137 31.7683)', 4326));
SELECT ST_X(location_on_map) AS longitude ,ST_Y(location_on_map) AS latitude
FROM locations;
INSERT INTO users (first_name, last_name, email, firebase_uid, role)
VALUES
    ('Qasem', 'Mohammad', 'qasemmohammad@gmail.com', 'eFwJcSrnDwUOVNImfD0SEMPspkQ2', 'CUSTOMER'),
    ('Ahamd', 'Adi', 'ahamdadi@gmail.com', 'OriZRPraMWXWTkHh53izTjnLDU33', 'OWNER'),
    ('Ali', 'Naseem', 'alinaseem@gmail.com', 'Jilt7vIuzLVEg4aQ35fYOuEDqEz2', 'CUSTOMER'),
    ('Mohammad', 'Karam', 'testuser@gmail.com', 'mEKXUxFaO0UnGbMEp89hNZ9VsXG2', 'CUSTOMER'),
    ('Amjad', 'Adi', 'adminamjad123@gmail.com', 'mycFV8dE73XCBa6Tm4uZqa15mqf2', 'SUPER ADMIN');
    ('Omar', 'Khaled', 'omarkhaled@gmail.com', 'aB7xKp92LmQ4RtY8NcV1sDf3GhJ5', 'CUSTOMER'),
    ('Yousef', 'Ahmad', 'yousefahmad@gmail.com', 'pR4mTz81XqL6VnC2KbH9wFg5DsE7', 'CUSTOMER'),
    ('Samer', 'Hassan', 'samerhassan@gmail.com', 'kN8vQx35LpR2MdT7YcF4sGh9WjA1', 'OWNER'),
    ('Khaled', 'Nasser', 'khalednasser@gmail.com', 'uC6mZp19VrX5BnQ8LsD2fHg7JwE4', 'CUSTOMER'),
    ('Tareq', 'Saleh', 'tareqsaleh@gmail.com', 'gF3xLw72QmN8RcY5VkP1dHs6AzB9', 'CUSTOMER'),
    ('Rami', 'Odeh', 'ramiodeh@gmail.com', 'zT5nKq84XcM2LpR7VhD9sFg1WbE6', 'MANAGER'),
    ('Laith', 'Mahmoud', 'laithmahmoud@gmail.com', 'dP8vYk31NqT6XmC4RsF2hGz9LbW5', 'CUSTOMER'),
    ('Hani', 'Samir', 'hanisamir@gmail.com', 'mQ2xVn67KpR9TcL4YwF8sHd1ZgE3', 'WORKER'),
    ('Fadi', 'Ibrahim', 'fadiibrahim@gmail.com', 'rL9cXk25VmT7QpN3HsD6wFg8YzA4', 'CUSTOMER'),
    ('Anas', 'Kareem', 'anaskareem@gmail.com', 'bW4mZq83LpN6RxT1VcF7hDs9KgE2', 'CUSTOMER'),
    ('Majd', 'Saeed', 'majdsaeed@gmail.com', 'nY7pQx42KmC9VtL5RsD3fHg8WbE1', 'CRM'),
    ('Bilal', 'Hamad', 'bilalhamad@gmail.com', 'xC5vNk91QpL4MzT8YwR2sFd6GhA7', 'CUSTOMER'),
    ('Zaid', 'Mansour', 'zaidmansour@gmail.com', 'qR8mXk36VpN2TcL7HsF5dGz1WbE9', 'CUSTOMER'),
    ('Hamza', 'Adnan', 'hamzaadnan@gmail.com', 'sL3xQv75KmR1NzC8YpD6hFg4WbT2', 'OWNER'),
    ('Suhail', 'Yasin', 'suhailyasin@gmail.com', 'vN6pKx29TcQ4LmR8YwF1sDg7HzE5', 'CUSTOMER');SELECT * FROM users;

INSERT INTO locations (name, location_on_map)
VALUES 
    ('Downtown Business Center - Ramallah', ST_GeomFromText('POINT(35.2038 31.9038)', 4326)),
    ('Old City Tech Hub - Jerusalem', ST_GeomFromText('POINT(35.2332 31.7767)', 4326)),
    ('Al-Masyoun Heights - Ramallah', ST_GeomFromText('POINT(35.1972 31.8981)', 4326)),
    ('University Square - Nablus', ST_GeomFromText('POINT(35.2343 32.2226)', 4326)),
    ('Commercial Zone - Hebron', ST_GeomFromText('POINT(35.0998 31.5326)', 4326));

INSERT INTO organizations (name, email, phone_number, bio, location_id, profile_picture_path, status)
VALUES 
    ('Apex Software Solutions', 'info@apexsolutions.ps', '+970599111222', 'Leading provider of enterprise software and web development services.', 10, 'organizations/apex_logo.png', 'ACTIVE'),
    ('Jerusalem Creative Agency', 'contact@jcreatives.ps', '+970599222333', 'Full-service branding, digital marketing, and UI/UX design studio.', 11, 'organizations/jcreatives_logo.png', 'ACTIVE'),
    ('Palestine Tech Incubator', 'support@paltech.ps', '+970599333444', 'Supporting tech startups with mentorship, seed funding, and workspace.', 12, 'organizations/paltech_logo.png', 'ACTIVE'),
    ('Nablus Health & Wellness', 'care@nablushealth.ps', '+970599444555', 'Comprehensive wellness center and physical therapy clinic.', 13, 'organizations/nablus_health_logo.png', 'ACTIVE'),
    ('Hebron Logistics & Trade', 'operations@hebronlogistics.ps', '+970599555666', 'Supply chain management, warehousing, and freight distribution.', 14, 'organizations/hebron_logistics_logo.png', 'ACTIVE');

UPDATE users SET organization_id = 15 WHERE email = 'ahamdadi@gmail.com';       -- Owner
UPDATE users SET organization_id = 16 WHERE email = 'ramiodeh@gmail.com';        -- Manager
UPDATE users SET organization_id = 17 WHERE email = 'hamzaadnan@gmail.com';      -- Owner
UPDATE users SET organization_id = 18 WHERE email = 'hanisamir@gmail.com';       -- Worker
UPDATE users SET organization_id = 19 WHERE email = 'majdsaeed@gmail.com';        -- CRM

SELECT * FROM locations;
SELECT * FROM organizations;
SELECT * FROM services;
SELECT * FROM blacklisted_token;
SELECT * FROM invitations;
DELETE FROM users;
DELETE  FROM organizations;
SELECT (created_at_utc+(INTERVAL '7 DAYS')) FROM users;

--check if today is not a special day for organizaiton
--check if working hours is good time for organizaiton by using todays day of week
--$1 service uuid
--$2 start time from user
SELECT u.uuid,r.uuid
FROM services s
JOIN  services_rooms sr ON s.id=sr.service_id
JOIN  rooms r ON r.id=sr.room_id
JOIN  users_services us ON s.id=us.s_id
JOIN  users u on us.user_id=u.id
WHERE s.uuid=$1
AND NOT EXISTS (
    SELECT 1
    FROM time_block t
    WHERE t.request_user_id=u.id
    AND t.request_status='APPROVED'
    AND t.start_time<$2+s.duration_in_minutes
    AND t.end_time>$2
)
AND NOT EXISTS (
    SELECT 1
    FROM appointments a
    WHERE a.emp_id = u.id
    AND a.start_time<$2+s.duration_in_minutes
    AND a.end_time>$2
)
AND NOT EXISTS (
    SELECT 1
    FROM appointments a
    WHERE a.room_id = r.id
    AND a.start_time<$2+s.duration_in_minutes
AND a.end_time>$2
);