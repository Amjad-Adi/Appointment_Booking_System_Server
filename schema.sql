-- ============================================================
-- Appointment Booking System
-- FINAL PostgreSQL + PostGIS schema and seed data
--
-- Application tables:
--
--   1.  locations
--   2.  organizations
--   3.  users
--   4.  service_categories
--   5.  services
--   6.  service_junction_category
--   7.  rooms
--   8.  working_hours
--   9.  special_days
--   10. time_block
--   11. appointments
--   12. invitations
--   13. refresh_tokens
--   14. blacklisted_tokens
--
-- PostGIS also creates:
--   - spatial_ref_sys
--   - geometry_columns
--   - geography_columns
--
-- IMPORTANT:
-- This script completely resets the public schema.
-- ONLY run this against a fresh/new database or when you
-- intentionally want to delete the existing database data.
-- ============================================================


-- ============================================================
-- RESET
-- ============================================================

DROP SCHEMA IF EXISTS public CASCADE;

CREATE SCHEMA public;


-- ============================================================
-- EXTENSIONS
-- ============================================================

CREATE EXTENSION IF NOT EXISTS postgis;

CREATE EXTENSION IF NOT EXISTS pgcrypto;


-- ============================================================
-- LOCATIONS
-- ============================================================

CREATE TABLE locations (
                           id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,

                           name VARCHAR(1024) NOT NULL,

                           timezone VARCHAR(64) NOT NULL DEFAULT 'Asia/Jerusalem',

                           location_on_map GEOMETRY(Point, 4326),

                           created_at_utc TIMESTAMPTZ NOT NULL DEFAULT now(),

                           updated_at_utc TIMESTAMPTZ NOT NULL DEFAULT now()
);


-- ============================================================
-- ORGANIZATIONS
-- ============================================================

CREATE TABLE organizations (
                               id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,

                               uuid UUID NOT NULL DEFAULT gen_random_uuid() UNIQUE,

                               name VARCHAR(256) NOT NULL,

                               email VARCHAR(320) NOT NULL UNIQUE,

                               phone_number VARCHAR(20),

                               bio VARCHAR(4096),

                               location_id BIGINT,

                               profile_picture_path TEXT NOT NULL
                                                  DEFAULT 'DEFAULT_PICTURE_PATH',

                               status VARCHAR(8) NOT NULL DEFAULT 'ACTIVE'
                                   CHECK (
                                       status IN (
                                                  'ACTIVE',
                                                  'INACTIVE'
                                           )
                                       ),

                               created_at_utc TIMESTAMPTZ NOT NULL DEFAULT now(),

                               updated_at_utc TIMESTAMPTZ NOT NULL DEFAULT now(),

                               CONSTRAINT organizations_location_fk
                                   FOREIGN KEY (location_id)
                                       REFERENCES locations(id)
                                       ON DELETE SET NULL
                                       ON UPDATE CASCADE
);


-- ============================================================
-- USERS
--
-- Customers are users with role = CUSTOMER.
-- Workers are users with role = WORKER.
--
-- No separate customers/employees tables exist.
-- ============================================================

CREATE TABLE users (
                       id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,

                       uuid UUID NOT NULL DEFAULT gen_random_uuid() UNIQUE,

                       first_name VARCHAR(64) NOT NULL,

                       last_name VARCHAR(64) NOT NULL,

                       email VARCHAR(320) NOT NULL UNIQUE,

                       firebase_uid VARCHAR(128) NOT NULL UNIQUE,

                       profile_picture_path TEXT NOT NULL
                                          DEFAULT 'DEFAULT_PICTURE_PATH',

                       created_at_utc TIMESTAMPTZ NOT NULL DEFAULT now(),

                       updated_at_utc TIMESTAMPTZ NOT NULL DEFAULT now(),

                       organization_id BIGINT,

                       language CHAR(2) NOT NULL DEFAULT 'en',

                       role VARCHAR(16) NOT NULL
                           CHECK (
                               role IN (
                                        'WORKER',
                                        'OWNER',
                                        'MANAGER',
                                        'SUPER_ADMIN',
                                        'CRM',
                                        'CUSTOMER'
                                   )
                               ),

                       status VARCHAR(8) NOT NULL DEFAULT 'ACTIVE'
                           CHECK (
                               status IN (
                                          'ACTIVE',
                                          'INACTIVE'
                                   )
                               ),

                       CONSTRAINT users_organization_fk
                           FOREIGN KEY (organization_id)
                               REFERENCES organizations(id)
                               ON DELETE SET NULL
                               ON UPDATE CASCADE
);


-- ============================================================
-- SERVICE CATEGORIES
-- ============================================================

CREATE TABLE service_categories (
                                    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,

                                    uuid UUID NOT NULL DEFAULT gen_random_uuid() UNIQUE,

                                    name VARCHAR(256) NOT NULL UNIQUE,

                                    description VARCHAR(4096),

                                    picture_path TEXT NOT NULL
                                                       DEFAULT 'DEFAULT_PICTURE_PATH',

                                    created_at_utc TIMESTAMPTZ NOT NULL DEFAULT now(),

                                    updated_at_utc TIMESTAMPTZ NOT NULL DEFAULT now(),

                                    status VARCHAR(8) NOT NULL DEFAULT 'ACTIVE'
                                        CHECK (
                                            status IN (
                                                       'ACTIVE',
                                                       'INACTIVE'
                                                )
                                            )
);


-- ============================================================
-- SERVICES
-- ============================================================

CREATE TABLE services (
                          id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,

                          uuid UUID NOT NULL DEFAULT gen_random_uuid() UNIQUE,

                          name VARCHAR(256) NOT NULL,

                          description VARCHAR(4096),

                          price NUMERIC(10, 2) NOT NULL
                              CHECK (price >= 0),

                          duration_in_minutes INTEGER NOT NULL
                              CHECK (duration_in_minutes > 0),

                          organization_id BIGINT NOT NULL,

                          picture_path TEXT NOT NULL
                                             DEFAULT 'DEFAULT_PICTURE_PATH',

                          created_at_utc TIMESTAMPTZ NOT NULL DEFAULT now(),

                          updated_at_utc TIMESTAMPTZ NOT NULL DEFAULT now(),

                          status VARCHAR(8) NOT NULL DEFAULT 'ACTIVE'
                              CHECK (
                                  status IN (
                                             'ACTIVE',
                                             'INACTIVE'
                                      )
                                  ),

                          CONSTRAINT services_organization_fk
                              FOREIGN KEY (organization_id)
                                  REFERENCES organizations(id)
                                  ON DELETE RESTRICT
                                  ON UPDATE CASCADE,

                          CONSTRAINT services_organization_name_unique
                              UNIQUE (organization_id, name)
);


-- ============================================================
-- SERVICE <-> CATEGORY
-- ============================================================

CREATE TABLE service_junction_category (
                                           service_category_id BIGINT NOT NULL,

                                           service_id BIGINT NOT NULL,

                                           PRIMARY KEY (
                                                        service_category_id,
                                                        service_id
                                               ),

                                           CONSTRAINT service_junction_category_category_fk
                                               FOREIGN KEY (service_category_id)
                                                   REFERENCES service_categories(id)
                                                   ON DELETE CASCADE
                                                   ON UPDATE CASCADE,

                                           CONSTRAINT service_junction_category_service_fk
                                               FOREIGN KEY (service_id)
                                                   REFERENCES services(id)
                                                   ON DELETE CASCADE
                                                   ON UPDATE CASCADE
);


-- ============================================================
-- ROOMS
-- ============================================================

CREATE TABLE rooms (
                       id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,

                       uuid UUID NOT NULL DEFAULT gen_random_uuid() UNIQUE,

                       name VARCHAR(256) NOT NULL,

                       description VARCHAR(4096),

                       user_id BIGINT,

                       organization_id BIGINT NOT NULL,

                       created_at_utc TIMESTAMPTZ NOT NULL DEFAULT now(),

                       updated_at_utc TIMESTAMPTZ NOT NULL DEFAULT now(),

                       status VARCHAR(8) NOT NULL DEFAULT 'ACTIVE'
                           CHECK (
                               status IN (
                                          'ACTIVE',
                                          'INACTIVE'
                                   )
                               ),

                       occupancy_status VARCHAR(10) NOT NULL DEFAULT 'AVAILABLE'
                           CHECK (
                               occupancy_status IN (
                                                    'OCCUPIED',
                                                    'AVAILABLE'
                                   )
                               ),

                       CONSTRAINT rooms_organization_fk
                           FOREIGN KEY (organization_id)
                               REFERENCES organizations(id)
                               ON DELETE CASCADE
                               ON UPDATE CASCADE,

                       CONSTRAINT rooms_user_fk
                           FOREIGN KEY (user_id)
                               REFERENCES users(id)
                               ON DELETE SET NULL
                               ON UPDATE CASCADE
);


-- ============================================================
-- WORKING HOURS
-- ============================================================

CREATE TABLE working_hours (
                               id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,

                               uuid UUID NOT NULL DEFAULT gen_random_uuid() UNIQUE,

                               organization_id BIGINT NOT NULL,

                               day_of_week VARCHAR(10) NOT NULL
                                   CHECK (
                                       day_of_week IN (
                                                       'SUNDAY',
                                                       'MONDAY',
                                                       'TUESDAY',
                                                       'WEDNESDAY',
                                                       'THURSDAY',
                                                       'FRIDAY',
                                                       'SATURDAY'
                                           )
                                       ),

                               start_time TIME,

                               end_time TIME,

                               CONSTRAINT working_hours_time_check
                                   CHECK (
                                       (
                                           start_time IS NULL
                                               AND end_time IS NULL
                                           )
                                           OR
                                       (
                                           start_time IS NOT NULL
                                               AND end_time IS NOT NULL
                                               AND start_time < end_time
                                           )
                                       ),

                               CONSTRAINT working_hours_organization_day_unique
                                   UNIQUE (
                                           organization_id,
                                           day_of_week
                                       ),

                               CONSTRAINT working_hours_organization_fk
                                   FOREIGN KEY (organization_id)
                                       REFERENCES organizations(id)
                                       ON DELETE CASCADE
                                       ON UPDATE CASCADE
);


-- ============================================================
-- SPECIAL DAYS
-- ============================================================

CREATE TABLE special_days (
                              id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,

                              uuid UUID NOT NULL DEFAULT gen_random_uuid() UNIQUE,

                              organization_id BIGINT NOT NULL,

                              name VARCHAR(256) NOT NULL,

                              day_date DATE NOT NULL,

                              description VARCHAR(4096),

                              created_at_utc TIMESTAMPTZ NOT NULL DEFAULT now(),

                              updated_at_utc TIMESTAMPTZ NOT NULL DEFAULT now(),

                              status VARCHAR(8) NOT NULL DEFAULT 'ACTIVE'
                                  CHECK (
                                      status IN (
                                                 'ACTIVE',
                                                 'INACTIVE'
                                          )
                                      ),

                              CONSTRAINT special_days_organization_fk
                                  FOREIGN KEY (organization_id)
                                      REFERENCES organizations(id)
                                      ON DELETE CASCADE
                                      ON UPDATE CASCADE,

                              CONSTRAINT special_days_organization_date_unique
                                  UNIQUE (
                                          organization_id,
                                          day_date
                                      )
);


-- ============================================================
-- TIME BLOCKS
-- ============================================================

CREATE TABLE time_block (
                            id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,

                            uuid UUID NOT NULL DEFAULT gen_random_uuid() UNIQUE,

                            reason VARCHAR(4096),

                            start_at_utc TIMESTAMPTZ NOT NULL,

                            end_at_utc TIMESTAMPTZ NOT NULL,

                            organization_id BIGINT NOT NULL,

                            request_user_id BIGINT NOT NULL,

                            respond_user_id BIGINT,

                            requested_at_utc TIMESTAMPTZ NOT NULL DEFAULT now(),

                            responded_at_utc TIMESTAMPTZ,

                            request_status VARCHAR(16) NOT NULL DEFAULT 'PENDING'
                                CHECK (
                                    request_status IN (
                                                       'APPROVED',
                                                       'PENDING',
                                                       'REJECTED',
                                                       'DELETED'
                                        )
                                    ),

                            CONSTRAINT time_block_time_check
                                CHECK (
                                    start_at_utc < end_at_utc
                                    ),

                            CONSTRAINT time_block_organization_fk
                                FOREIGN KEY (organization_id)
                                    REFERENCES organizations(id)
                                    ON DELETE RESTRICT
                                    ON UPDATE CASCADE,

                            CONSTRAINT time_block_request_user_fk
                                FOREIGN KEY (request_user_id)
                                    REFERENCES users(id)
                                    ON DELETE CASCADE
                                    ON UPDATE CASCADE,

                            CONSTRAINT time_block_respond_user_fk
                                FOREIGN KEY (respond_user_id)
                                    REFERENCES users(id)
                                    ON DELETE SET NULL
                                    ON UPDATE CASCADE
);


-- ============================================================
-- APPOINTMENTS
--
-- user_id   = customer
-- worker_id = worker
-- ============================================================

CREATE TABLE appointments (
                              id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,

                              uuid UUID NOT NULL DEFAULT gen_random_uuid() UNIQUE,

                              user_id BIGINT NOT NULL,

                              organization_id BIGINT NOT NULL,

                              service_id BIGINT NOT NULL,

                              worker_id BIGINT NOT NULL,

                              room_id BIGINT NOT NULL,

                              approval_user_id BIGINT,

                              user_title VARCHAR(256),

                              organization_title VARCHAR(256),

                              user_note VARCHAR(4096),

                              organization_note VARCHAR(4096),

                              user_colour VARCHAR(7) NOT NULL DEFAULT '#2563EB',

                              organization_colour VARCHAR(7) NOT NULL DEFAULT '#2563EB',

                              scheduled_start_at_utc TIMESTAMPTZ NOT NULL,

                              scheduled_end_at_utc TIMESTAMPTZ NOT NULL,

                              actual_start_at_utc TIMESTAMPTZ,

                              actual_end_at_utc TIMESTAMPTZ,

                              appointment_status VARCHAR(64) NOT NULL
                                  DEFAULT 'PENDING_USER_CONFIRMATION'
                                  CHECK (
                                      appointment_status IN (
                                                             'PENDING_USER_CONFIRMATION',
                                                             'PENDING_ORGANIZATION_APPROVAL',
                                                             'CONFIRMED',
                                                             'REJECTED',
                                                             'NO_SHOW',
                                                             'CANCELLED',
                                                             'COMPLETED',
                                                             'IN_PROGRESS'
                                          )
                                      ),

                              rejection_reason VARCHAR(4096),

                              payment_method VARCHAR(64)
                                  CHECK (
                                      payment_method IN (
                                                         'CASH',
                                                         'VISA'
                                          )
                                      ),

                              payment_status VARCHAR(64) NOT NULL DEFAULT 'UNPAID'
                                  CHECK (
                                      payment_status IN (
                                                         'UNPAID',
                                                         'PENDING',
                                                         'PAID',
                                                         'FAILED',
                                                         'REFUNDED'
                                          )
                                      ),

                              paid_at_utc TIMESTAMPTZ,

                              created_at_utc TIMESTAMPTZ NOT NULL DEFAULT now(),

                              updated_at_utc TIMESTAMPTZ NOT NULL DEFAULT now(),

                              CONSTRAINT appointments_scheduled_time_check
                                  CHECK (
                                      scheduled_start_at_utc < scheduled_end_at_utc
                                      ),

                              CONSTRAINT appointments_actual_time_check
                                  CHECK (
                                      (
                                          actual_start_at_utc IS NULL
                                              AND actual_end_at_utc IS NULL
                                          )
                                          OR
                                      (
                                          actual_start_at_utc IS NOT NULL
                                              AND actual_end_at_utc IS NOT NULL
                                              AND actual_start_at_utc < actual_end_at_utc
                                          )
                                      ),

                              CONSTRAINT appointments_paid_at_check
                                  CHECK (
                                      (
                                          payment_status = 'PAID'
                                              AND paid_at_utc IS NOT NULL
                                          )
                                          OR
                                      (
                                          payment_status <> 'PAID'
                                              AND paid_at_utc IS NULL
                                          )
                                      ),

                              CONSTRAINT appointments_user_fk
                                  FOREIGN KEY (user_id)
                                      REFERENCES users(id)
                                      ON DELETE RESTRICT
                                      ON UPDATE CASCADE,

                              CONSTRAINT appointments_organization_fk
                                  FOREIGN KEY (organization_id)
                                      REFERENCES organizations(id)
                                      ON DELETE RESTRICT
                                      ON UPDATE CASCADE,

                              CONSTRAINT appointments_service_fk
                                  FOREIGN KEY (service_id)
                                      REFERENCES services(id)
                                      ON DELETE RESTRICT
                                      ON UPDATE CASCADE,

                              CONSTRAINT appointments_worker_fk
                                  FOREIGN KEY (worker_id)
                                      REFERENCES users(id)
                                      ON DELETE RESTRICT
                                      ON UPDATE CASCADE,

                              CONSTRAINT appointments_room_fk
                                  FOREIGN KEY (room_id)
                                      REFERENCES rooms(id)
                                      ON DELETE RESTRICT
                                      ON UPDATE CASCADE,

                              CONSTRAINT appointments_approval_user_fk
                                  FOREIGN KEY (approval_user_id)
                                      REFERENCES users(id)
                                      ON DELETE SET NULL
                                      ON UPDATE CASCADE
);


-- ============================================================
-- REFRESH TOKENS
-- ============================================================

CREATE TABLE refresh_tokens (
                                id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,

                                user_id BIGINT NOT NULL,

                                token_hash TEXT NOT NULL UNIQUE,

                                created_at_utc TIMESTAMPTZ NOT NULL DEFAULT now(),

                                expires_at_utc TIMESTAMPTZ NOT NULL
                                                                    DEFAULT (now() + INTERVAL '7 days'),

                                revoked BOOLEAN NOT NULL DEFAULT FALSE,

                                revoked_at_utc TIMESTAMPTZ,

                                CONSTRAINT refresh_tokens_user_fk
                                    FOREIGN KEY (user_id)
                                        REFERENCES users(id)
                                        ON DELETE CASCADE
                                        ON UPDATE CASCADE,

                                CONSTRAINT refresh_tokens_expiry_check
                                    CHECK (
                                        expires_at_utc > created_at_utc
                                        ),

                                CONSTRAINT refresh_tokens_revoked_check
                                    CHECK (
                                        (
                                            revoked = TRUE
                                                AND revoked_at_utc IS NOT NULL
                                            )
                                            OR
                                        (
                                            revoked = FALSE
                                                AND revoked_at_utc IS NULL
                                            )
                                        )
);


-- ============================================================
-- BLACKLISTED TOKENS
-- ============================================================

CREATE TABLE blacklisted_tokens (
                                    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,

                                    jti UUID NOT NULL UNIQUE,

                                    expires_at_utc TIMESTAMPTZ NOT NULL,

                                    blacklisted_at_utc TIMESTAMPTZ NOT NULL DEFAULT now(),

                                    reason VARCHAR(4096)
);


-- ============================================================
-- INVITATIONS
-- ============================================================

CREATE TABLE invitations (
                             id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,

                             uuid UUID NOT NULL DEFAULT gen_random_uuid() UNIQUE,

                             organization_id BIGINT,

                             sender_id BIGINT,

                             recipient_email VARCHAR(320) NOT NULL,

                             token_hash VARCHAR(255) NOT NULL UNIQUE,

                             created_at_utc TIMESTAMPTZ NOT NULL DEFAULT now(),

                             expires_at_utc TIMESTAMPTZ NOT NULL,

                             accepted_at_utc TIMESTAMPTZ,

                             role VARCHAR(16) NOT NULL DEFAULT 'WORKER'
                                 CHECK (
                                     role IN (
                                              'WORKER',
                                              'OWNER',
                                              'MANAGER',
                                              'SUPER_ADMIN',
                                              'CRM',
                                              'CUSTOMER'
                                         )
                                     ),

                             invitation_status VARCHAR(16) NOT NULL DEFAULT 'PENDING'
                                 CHECK (
                                     invitation_status IN (
                                                           'PENDING',
                                                           'ACCEPTED',
                                                           'EXPIRED',
                                                           'CANCELLED'
                                         )
                                     ),

                             CONSTRAINT invitations_sender_fk
                                 FOREIGN KEY (sender_id)
                                     REFERENCES users(id)
                                     ON DELETE SET NULL
                                     ON UPDATE CASCADE,

                             CONSTRAINT invitations_organization_fk
                                 FOREIGN KEY (organization_id)
                                     REFERENCES organizations(id)
                                     ON DELETE RESTRICT
                                     ON UPDATE CASCADE,

                             CONSTRAINT invitations_expiry_check
                                 CHECK (
                                     expires_at_utc > created_at_utc
                                     ),

                             CONSTRAINT invitations_accepted_at_check
                                 CHECK (
                                     (
                                         invitation_status = 'ACCEPTED'
                                             AND accepted_at_utc IS NOT NULL
                                         )
                                         OR
                                     (
                                         invitation_status <> 'ACCEPTED'
                                             AND accepted_at_utc IS NULL
                                         )
                                     )
);


-- ============================================================
-- INDEXES
-- ============================================================

CREATE INDEX idx_locations_name
    ON locations(name);

CREATE INDEX idx_organizations_location_id
    ON organizations(location_id);

CREATE INDEX idx_users_organization_id
    ON users(organization_id);

CREATE INDEX idx_users_role
    ON users(role);

CREATE INDEX idx_users_status
    ON users(status);

CREATE INDEX idx_services_organization_id
    ON services(organization_id);

CREATE INDEX idx_services_status
    ON services(status);

CREATE INDEX idx_service_junction_service_id
    ON service_junction_category(service_id);

CREATE INDEX idx_rooms_organization_id
    ON rooms(organization_id);

CREATE INDEX idx_rooms_user_id
    ON rooms(user_id);

CREATE INDEX idx_working_hours_organization_id
    ON working_hours(organization_id);

CREATE INDEX idx_special_days_organization_date
    ON special_days(
                    organization_id,
                    day_date
        );

CREATE INDEX idx_time_block_organization_time
    ON time_block(
                  organization_id,
                  start_at_utc,
                  end_at_utc
        );

CREATE INDEX idx_time_block_request_user_time
    ON time_block(
                  request_user_id,
                  start_at_utc,
                  end_at_utc
        );

CREATE INDEX idx_time_block_respond_user_id
    ON time_block(respond_user_id);

CREATE INDEX idx_appointments_organization_time
    ON appointments(
                    organization_id,
                    scheduled_start_at_utc,
                    scheduled_end_at_utc
        );

CREATE INDEX idx_appointments_worker_time
    ON appointments(
                    worker_id,
                    scheduled_start_at_utc,
                    scheduled_end_at_utc
        );

CREATE INDEX idx_appointments_room_time
    ON appointments(
                    room_id,
                    scheduled_start_at_utc,
                    scheduled_end_at_utc
        );

CREATE INDEX idx_appointments_user_id
    ON appointments(user_id);

CREATE INDEX idx_appointments_service_id
    ON appointments(service_id);

CREATE INDEX idx_appointments_status
    ON appointments(appointment_status);

CREATE INDEX idx_refresh_tokens_user_id
    ON refresh_tokens(user_id);

CREATE INDEX idx_refresh_tokens_expires_at
    ON refresh_tokens(expires_at_utc);

CREATE INDEX idx_blacklisted_tokens_expires_at
    ON blacklisted_tokens(expires_at_utc);

CREATE INDEX idx_invitations_organization_id
    ON invitations(organization_id);

CREATE INDEX idx_invitations_recipient_email
    ON invitations(recipient_email);

CREATE INDEX idx_invitations_status
    ON invitations(invitation_status);


-- ============================================================
-- SEED: LOCATIONS
-- ============================================================

INSERT INTO locations (
    name,
    timezone,
    location_on_map
)
VALUES
    (
        'Birzeit University',
        'Asia/Jerusalem',
        ST_SetSRID(
                ST_MakePoint(35.2137, 31.7683),
                4326
        )
    ),
    (
        'Downtown Business Center - Ramallah',
        'Asia/Jerusalem',
        ST_SetSRID(
                ST_MakePoint(35.2038, 31.9038),
                4326
        )
    ),
    (
        'Old City Tech Hub - Jerusalem',
        'Asia/Jerusalem',
        ST_SetSRID(
                ST_MakePoint(35.2332, 31.7767),
                4326
        )
    ),
    (
        'Al-Masyoun Heights - Ramallah',
        'Asia/Jerusalem',
        ST_SetSRID(
                ST_MakePoint(35.1972, 31.8981),
                4326
        )
    ),
    (
        'University Square - Nablus',
        'Asia/Jerusalem',
        ST_SetSRID(
                ST_MakePoint(35.2343, 32.2226),
                4326
        )
    ),
    (
        'Commercial Zone - Hebron',
        'Asia/Jerusalem',
        ST_SetSRID(
                ST_MakePoint(35.0998, 31.5326),
                4326
        )
    );


-- ============================================================
-- SEED: ORGANIZATIONS
-- ============================================================

INSERT INTO organizations (
    name,
    email,
    phone_number,
    bio,
    location_id,
    profile_picture_path,
    status
)
VALUES
    (
        'Apex Software Solutions',
        'info@apexsolutions.ps',
        '+970599111222',
        'Leading provider of enterprise software and web development services.',
        (
            SELECT id
            FROM locations
            WHERE name = 'Downtown Business Center - Ramallah'
        ),
        'organizations/apex_logo.png',
        'ACTIVE'
    ),
    (
        'Jerusalem Creative Agency',
        'contact@jcreatives.ps',
        '+970599222333',
        'Full-service branding, digital marketing, and UI/UX design studio.',
        (
            SELECT id
            FROM locations
            WHERE name = 'Old City Tech Hub - Jerusalem'
        ),
        'organizations/jcreatives_logo.png',
        'ACTIVE'
    ),
    (
        'Palestine Tech Incubator',
        'support@paltech.ps',
        '+970599333444',
        'Supporting tech startups with mentorship, seed funding, and workspace.',
        (
            SELECT id
            FROM locations
            WHERE name = 'Al-Masyoun Heights - Ramallah'
        ),
        'organizations/paltech_logo.png',
        'ACTIVE'
    ),
    (
        'Nablus Health & Wellness',
        'care@nablushealth.ps',
        '+970599444555',
        'Comprehensive wellness center and physical therapy clinic.',
        (
            SELECT id
            FROM locations
            WHERE name = 'University Square - Nablus'
        ),
        'organizations/nablus_health_logo.png',
        'ACTIVE'
    ),
    (
        'Hebron Logistics & Trade',
        'operations@hebronlogistics.ps',
        '+970599555666',
        'Supply chain management, warehousing, and freight distribution.',
        (
            SELECT id
            FROM locations
            WHERE name = 'Commercial Zone - Hebron'
        ),
        'organizations/hebron_logistics_logo.png',
        'ACTIVE'
    );


-- ============================================================
-- SEED: USERS
-- ============================================================

INSERT INTO users (
    first_name,
    last_name,
    email,
    firebase_uid,
    role,
    organization_id
)
VALUES
    (
        'Qasem',
        'Mohammad',
        'qasemmohammad@gmail.com',
        'eFwJcSrnDwUOVNImfD0SEMPspkQ2',
        'CUSTOMER',
        NULL
    ),
    (
        'Ahmad',
        'Adi',
        'ahmadadi@gmail.com',
        'OriZRPraMWXWTkHh53izTjnLDU33',
        'OWNER',
        (
            SELECT id
            FROM organizations
            WHERE email = 'info@apexsolutions.ps'
        )
    ),
    (
        'Ali',
        'Naseem',
        'alinaseem@gmail.com',
        'Jilt7vIuzLVEg4aQ35fYOuEDqEz2',
        'CUSTOMER',
        NULL
    ),
    (
        'Mohammad',
        'Karam',
        'testuser@gmail.com',
        'mEKXUxFaO0UnGbMEp89hNZ9VsXG2',
        'CUSTOMER',
        NULL
    ),
    (
        'Amjad',
        'Adi',
        'adminamjad123@gmail.com',
        'mycFV8dE73XCBa6Tm4uZqa15mqf2',
        'SUPER_ADMIN',
        NULL
    ),
    (
        'Omar',
        'Khaled',
        'omarkhaled@gmail.com',
        'aB7xKp92LmQ4RtY8NcV1sDf3GhJ5',
        'CUSTOMER',
        NULL
    ),
    (
        'Yousef',
        'Ahmad',
        'yousefahmad@gmail.com',
        'pR4mTz81XqL6VnC2KbH9wFg5DsE7',
        'CUSTOMER',
        NULL
    ),
    (
        'Samer',
        'Hassan',
        'samerhassan@gmail.com',
        'kN8vQx35LpR2MdT7YcF4sGh9WjA1',
        'OWNER',
        (
            SELECT id
            FROM organizations
            WHERE email = 'contact@jcreatives.ps'
        )
    ),
    (
        'Khaled',
        'Nasser',
        'khalednasser@gmail.com',
        'uC6mZp19VrX5BnQ8LsD2fHg7JwE4',
        'CUSTOMER',
        NULL
    ),
    (
        'Tareq',
        'Saleh',
        'tareqsaleh@gmail.com',
        'gF3xLw72QmN8RcY5VkP1dHs6AzB9',
        'CUSTOMER',
        NULL
    ),
    (
        'Rami',
        'Odeh',
        'ramiodeh@gmail.com',
        'zT5nKq84XcM2LpR7VhD9sFg1WbE6',
        'MANAGER',
        (
            SELECT id
            FROM organizations
            WHERE email = 'contact@jcreatives.ps'
        )
    ),
    (
        'Laith',
        'Mahmoud',
        'laithmahmoud@gmail.com',
        'dP8vYk31NqT6XmC4RsF2hGz9LbW5',
        'CUSTOMER',
        NULL
    ),
    (
        'Hani',
        'Samir',
        'hanisamir@gmail.com',
        'mQ2xVn67KpR9TcL4YwF8sHd1ZgE3',
        'WORKER',
        (
            SELECT id
            FROM organizations
            WHERE email = 'info@apexsolutions.ps'
        )
    ),
    (
        'Fadi',
        'Ibrahim',
        'fadiibrahim@gmail.com',
        'rL9cXk25VmT7QpN3HsD6wFg8YzA4',
        'CUSTOMER',
        NULL
    ),
    (
        'Anas',
        'Kareem',
        'anaskareem@gmail.com',
        'bW4mZq83LpN6RxT1VcF7hDs9KgE2',
        'CUSTOMER',
        NULL
    ),
    (
        'Majd',
        'Saeed',
        'majdsaeed@gmail.com',
        'nY7pQx42KmC9VtL5RsD3fHg8WbE1',
        'CRM',
        (
            SELECT id
            FROM organizations
            WHERE email = 'contact@jcreatives.ps'
        )
    ),
    (
        'Bilal',
        'Hamad',
        'bilalhamad@gmail.com',
        'xC5vNk91QpL4MzT8YwR2sFd6GhA7',
        'CUSTOMER',
        NULL
    ),
    (
        'Zaid',
        'Mansour',
        'zaidmansoursample@gmail.com',
        'qR8mXk36VpN2TcL7HsF5dGz1WbE9',
        'CUSTOMER',
        NULL
    ),
    (
        'Hamza',
        'Adnan',
        'hamzaadnan@gmail.com',
        'sL3xQv75KmR1NzC8YpD6hFg4WbT2',
        'OWNER',
        (
            SELECT id
            FROM organizations
            WHERE email = 'support@paltech.ps'
        )
    ),
    (
        'Suhail',
        'Yasin',
        'suhailyasin@gmail.com',
        'vN6pKx29TcQ4LmR8YwF1sDg7HzE5',
        'CUSTOMER',
        NULL
    );


-- ============================================================
-- SEED: SERVICE CATEGORIES
-- ============================================================

INSERT INTO service_categories (
    name,
    description,
    picture_path,
    status
)
VALUES
    (
        'Software Development',
        'Custom software, web applications, backend systems, and application development.',
        'service-categories/software-development.png',
        'ACTIVE'
    ),
    (
        'Web Development',
        'Design and development of modern responsive websites and web applications.',
        'service-categories/web-development.png',
        'ACTIVE'
    ),
    (
        'UI/UX Design',
        'User interface and user experience design for websites and digital products.',
        'service-categories/ui-ux-design.png',
        'ACTIVE'
    ),
    (
        'Digital Marketing',
        'Digital marketing, search engine optimization, social media, and online advertising.',
        'service-categories/digital-marketing.png',
        'ACTIVE'
    ),
    (
        'Business Consulting',
        'Professional consulting services for business strategy, technology, and operations.',
        'service-categories/business-consulting.png',
        'ACTIVE'
    ),
    (
        'Physical Therapy',
        'Physical therapy and rehabilitation services for mobility and recovery.',
        'service-categories/physical-therapy.png',
        'ACTIVE'
    ),
    (
        'Wellness',
        'Health, wellness, and personal wellbeing services.',
        'service-categories/wellness.png',
        'ACTIVE'
    ),
    (
        'Logistics',
        'Supply chain, freight, warehousing, and logistics management services.',
        'service-categories/logistics.png',
        'ACTIVE'
    ),
    (
        'Training',
        'Professional training, workshops, and technical education services.',
        'service-categories/training.png',
        'ACTIVE'
    );


-- ============================================================
-- SEED: SERVICES
-- ============================================================

INSERT INTO services (
    name,
    description,
    price,
    duration_in_minutes,
    organization_id,
    picture_path,
    status
)
VALUES

-- APEX
(
    'Custom Web Application',
    'Development of a custom web application based on the organization''s business requirements.',
    850,
    240,
    (
        SELECT id
        FROM organizations
        WHERE email = 'info@apexsolutions.ps'
    ),
    'services/custom-web-application.png',
    'ACTIVE'
),
(
    'Backend API Development',
    'Design and development of secure REST APIs and backend services.',
    600,
    180,
    (
        SELECT id
        FROM organizations
        WHERE email = 'info@apexsolutions.ps'
    ),
    'services/backend-api.png',
    'ACTIVE'
),
(
    'Software Architecture Consultation',
    'Technical consultation covering application architecture, databases, APIs, and scalability.',
    120,
    60,
    (
        SELECT id
        FROM organizations
        WHERE email = 'info@apexsolutions.ps'
    ),
    'services/software-architecture.png',
    'ACTIVE'
),
(
    'Database Design',
    'Database modeling, normalization, indexing, and query optimization.',
    250,
    90,
    (
        SELECT id
        FROM organizations
        WHERE email = 'info@apexsolutions.ps'
    ),
    'services/database-design.png',
    'ACTIVE'
),

-- JERUSALEM CREATIVE
(
    'Brand Identity Design',
    'Complete visual identity design including logo concepts, typography, and brand guidelines.',
    500,
    180,
    (
        SELECT id
        FROM organizations
        WHERE email = 'contact@jcreatives.ps'
    ),
    'services/brand-identity.png',
    'ACTIVE'
),
(
    'UI/UX Design',
    'User interface and user experience design for websites and digital applications.',
    450,
    180,
    (
        SELECT id
        FROM organizations
        WHERE email = 'contact@jcreatives.ps'
    ),
    'services/ui-ux-design.png',
    'ACTIVE'
),
(
    'Social Media Campaign',
    'Planning and designing a digital social media campaign for a business or product.',
    300,
    120,
    (
        SELECT id
        FROM organizations
        WHERE email = 'contact@jcreatives.ps'
    ),
    'services/social-media-campaign.png',
    'ACTIVE'
),
(
    'Website Design',
    'Modern responsive website design tailored to the organization''s brand.',
    650,
    240,
    (
        SELECT id
        FROM organizations
        WHERE email = 'contact@jcreatives.ps'
    ),
    'services/website-design.png',
    'ACTIVE'
),

-- PALESTINE TECH
(
    'Startup Consultation',
    'One-on-one consultation covering startup strategy, technology, and product development.',
    100,
    60,
    (
        SELECT id
        FROM organizations
        WHERE email = 'support@paltech.ps'
    ),
    'services/startup-consultation.png',
    'ACTIVE'
),
(
    'Technical Mentoring',
    'Technical mentoring for software development teams and early-stage startups.',
    80,
    60,
    (
        SELECT id
        FROM organizations
        WHERE email = 'support@paltech.ps'
    ),
    'services/technical-mentoring.png',
    'ACTIVE'
),
(
    'Product Development Workshop',
    'Interactive workshop covering product planning, validation, and development processes.',
    250,
    180,
    (
        SELECT id
        FROM organizations
        WHERE email = 'support@paltech.ps'
    ),
    'services/product-workshop.png',
    'ACTIVE'
),
(
    'Startup Training Session',
    'Training session covering essential topics for launching and managing a technology startup.',
    150,
    120,
    (
        SELECT id
        FROM organizations
        WHERE email = 'support@paltech.ps'
    ),
    'services/startup-training.png',
    'ACTIVE'
),

-- NABLUS HEALTH
(
    'Initial Physical Therapy Assessment',
    'Comprehensive assessment to evaluate mobility, movement, and rehabilitation needs.',
    50,
    60,
    (
        SELECT id
        FROM organizations
        WHERE email = 'care@nablushealth.ps'
    ),
    'services/physical-therapy-assessment.png',
    'ACTIVE'
),
(
    'Physical Therapy Session',
    'Individual physical therapy session focused on rehabilitation and mobility.',
    40,
    60,
    (
        SELECT id
        FROM organizations
        WHERE email = 'care@nablushealth.ps'
    ),
    'services/physical-therapy.png',
    'ACTIVE'
),
(
    'Wellness Consultation',
    'Personal wellness consultation focused on general wellbeing and healthy routines.',
    35,
    45,
    (
        SELECT id
        FROM organizations
        WHERE email = 'care@nablushealth.ps'
    ),
    'services/wellness-consultation.png',
    'ACTIVE'
),
(
    'Rehabilitation Session',
    'Guided rehabilitation session tailored to an individual recovery plan.',
    45,
    60,
    (
        SELECT id
        FROM organizations
        WHERE email = 'care@nablushealth.ps'
    ),
    'services/rehabilitation.png',
    'ACTIVE'
),

-- HEBRON LOGISTICS
(
    'Logistics Consultation',
    'Consultation for optimizing transportation, warehousing, and supply chain operations.',
    150,
    90,
    (
        SELECT id
        FROM organizations
        WHERE email = 'operations@hebronlogistics.ps'
    ),
    'services/logistics-consultation.png',
    'ACTIVE'
),
(
    'Freight Planning',
    'Planning and coordination of freight transportation and distribution.',
    250,
    120,
    (
        SELECT id
        FROM organizations
        WHERE email = 'operations@hebronlogistics.ps'
    ),
    'services/freight-planning.png',
    'ACTIVE'
),
(
    'Warehouse Management Consultation',
    'Professional consultation for improving warehouse organization and operations.',
    180,
    90,
    (
        SELECT id
        FROM organizations
        WHERE email = 'operations@hebronlogistics.ps'
    ),
    'services/warehouse-management.png',
    'ACTIVE'
),
(
    'Supply Chain Assessment',
    'Analysis of supply chain processes with recommendations for operational improvements.',
    300,
    150,
    (
        SELECT id
        FROM organizations
        WHERE email = 'operations@hebronlogistics.ps'
    ),
    'services/supply-chain-assessment.png',
    'ACTIVE'
);


-- ============================================================
-- SEED: SERVICE <-> CATEGORY RELATIONSHIPS
-- ============================================================

INSERT INTO service_junction_category (
    service_category_id,
    service_id
)
SELECT
    c.id,
    s.id
FROM service_categories c
         CROSS JOIN services s
WHERE
    (
        s.name = 'Custom Web Application'
            AND c.name IN (
                           'Software Development',
                           'Web Development'
            )
        )
   OR
    (
        s.name = 'Backend API Development'
            AND c.name = 'Software Development'
        )
   OR
    (
        s.name = 'Software Architecture Consultation'
            AND c.name IN (
                           'Software Development',
                           'Business Consulting'
            )
        )
   OR
    (
        s.name = 'Database Design'
            AND c.name = 'Software Development'
        )
   OR
    (
        s.name = 'Brand Identity Design'
            AND c.name = 'UI/UX Design'
        )
   OR
    (
        s.name = 'UI/UX Design'
            AND c.name IN (
                           'UI/UX Design',
                           'Web Development'
            )
        )
   OR
    (
        s.name = 'Social Media Campaign'
            AND c.name = 'Digital Marketing'
        )
   OR
    (
        s.name = 'Website Design'
            AND c.name IN (
                           'Web Development',
                           'UI/UX Design'
            )
        )
   OR
    (
        s.name = 'Startup Consultation'
            AND c.name = 'Business Consulting'
        )
   OR
    (
        s.name = 'Technical Mentoring'
            AND c.name IN (
                           'Training',
                           'Software Development'
            )
        )
   OR
    (
        s.name = 'Product Development Workshop'
            AND c.name IN (
                           'Training',
                           'Software Development'
            )
        )
   OR
    (
        s.name = 'Startup Training Session'
            AND c.name = 'Training'
        )
   OR
    (
        s.name = 'Initial Physical Therapy Assessment'
            AND c.name = 'Physical Therapy'
        )
   OR
    (
        s.name = 'Physical Therapy Session'
            AND c.name = 'Physical Therapy'
        )
   OR
    (
        s.name = 'Wellness Consultation'
            AND c.name = 'Wellness'
        )
   OR
    (
        s.name = 'Rehabilitation Session'
            AND c.name IN (
                           'Physical Therapy',
                           'Wellness'
            )
        )
   OR
    (
        s.name = 'Logistics Consultation'
            AND c.name IN (
                           'Logistics',
                           'Business Consulting'
            )
        )
   OR
    (
        s.name = 'Freight Planning'
            AND c.name = 'Logistics'
        )
   OR
    (
        s.name = 'Warehouse Management Consultation'
            AND c.name IN (
                           'Logistics',
                           'Business Consulting'
            )
        )
   OR
    (
        s.name = 'Supply Chain Assessment'
            AND c.name IN (
                           'Logistics',
                           'Business Consulting'
            )
        );


-- ============================================================
-- SEED: ROOMS
-- ============================================================

INSERT INTO rooms (
    name,
    description,
    organization_id,
    user_id,
    status,
    occupancy_status
)
VALUES
    (
        'Apex Room 1',
        'Main appointment room.',
        (
            SELECT id
            FROM organizations
            WHERE email = 'info@apexsolutions.ps'
        ),
        (
            SELECT id
            FROM users
            WHERE email = 'hanisamir@gmail.com'
        ),
        'ACTIVE',
        'AVAILABLE'
    ),
    (
        'Apex Room 2',
        'Secondary appointment room.',
        (
            SELECT id
            FROM organizations
            WHERE email = 'info@apexsolutions.ps'
        ),
        NULL,
        'ACTIVE',
        'AVAILABLE'
    ),
    (
        'Creative Studio 1',
        'Main creative studio.',
        (
            SELECT id
            FROM organizations
            WHERE email = 'contact@jcreatives.ps'
        ),
        NULL,
        'ACTIVE',
        'AVAILABLE'
    ),
    (
        'Creative Studio 2',
        'Secondary creative studio.',
        (
            SELECT id
            FROM organizations
            WHERE email = 'contact@jcreatives.ps'
        ),
        NULL,
        'ACTIVE',
        'AVAILABLE'
    ),
    (
        'Incubator Room 1',
        'Startup consultation room.',
        (
            SELECT id
            FROM organizations
            WHERE email = 'support@paltech.ps'
        ),
        NULL,
        'ACTIVE',
        'AVAILABLE'
    ),
    (
        'Wellness Room 1',
        'Physical therapy room.',
        (
            SELECT id
            FROM organizations
            WHERE email = 'care@nablushealth.ps'
        ),
        NULL,
        'ACTIVE',
        'AVAILABLE'
    ),
    (
        'Logistics Meeting Room',
        'Logistics consultation room.',
        (
            SELECT id
            FROM organizations
            WHERE email = 'operations@hebronlogistics.ps'
        ),
        NULL,
        'ACTIVE',
        'AVAILABLE'
    );


-- ============================================================
-- SEED: WORKING HOURS
-- ============================================================

INSERT INTO working_hours (
    organization_id,
    day_of_week,
    start_time,
    end_time
)
SELECT
    o.id,
    d.day_of_week,
    CASE
        WHEN d.day_of_week IN ('FRIDAY', 'SATURDAY')
            THEN NULL
        ELSE TIME '09:00'
        END,
    CASE
        WHEN d.day_of_week IN ('FRIDAY', 'SATURDAY')
            THEN NULL
        ELSE TIME '17:00'
        END
FROM organizations o
         CROSS JOIN (
    VALUES
        ('SUNDAY'),
        ('MONDAY'),
        ('TUESDAY'),
        ('WEDNESDAY'),
        ('THURSDAY'),
        ('FRIDAY'),
        ('SATURDAY')
) AS d(day_of_week);


-- ============================================================
-- SEED: SPECIAL DAYS
-- ============================================================

INSERT INTO special_days (
    organization_id,
    name,
    day_date,
    description,
    status
)
VALUES
    (
        (
            SELECT id
            FROM organizations
            WHERE email = 'info@apexsolutions.ps'
        ),
        'Company Holiday',
        DATE '2026-12-25',
        'Organization closed for the day.',
        'ACTIVE'
    );


-- ============================================================
-- SEED: SAMPLE APPOINTMENTS
-- ============================================================

INSERT INTO appointments (
    user_id,
    organization_id,
    service_id,
    worker_id,
    room_id,

    user_title,
    organization_title,

    user_note,
    organization_note,

    user_colour,
    organization_colour,

    scheduled_start_at_utc,
    scheduled_end_at_utc,

    appointment_status,

    payment_method,
    payment_status,
    paid_at_utc
)
VALUES
    (
        (
            SELECT id
            FROM users
            WHERE email = 'qasemmohammad@gmail.com'
        ),

        (
            SELECT id
            FROM organizations
            WHERE email = 'info@apexsolutions.ps'
        ),

        (
            SELECT s.id
            FROM services s
                     JOIN organizations o
                          ON o.id = s.organization_id
            WHERE s.name = 'Software Architecture Consultation'
              AND o.email = 'info@apexsolutions.ps'
        ),

        (
            SELECT id
            FROM users
            WHERE email = 'hanisamir@gmail.com'
        ),

        (
            SELECT r.id
            FROM rooms r
                     JOIN organizations o
                          ON o.id = r.organization_id
            WHERE r.name = 'Apex Room 1'
              AND o.email = 'info@apexsolutions.ps'
        ),

        'Customer appointment',
        'Regular appointment',

        'Customer requested morning appointment.',
        'Prepare room before appointment.',

        '#2563EB',
        '#2563EB',

        TIMESTAMPTZ '2026-09-16 09:00:00+03',
        TIMESTAMPTZ '2026-09-16 10:00:00+03',

        'CONFIRMED',

        'CASH',
        'PAID',
        TIMESTAMPTZ '2026-09-15 12:00:00+03'
    ),
    (
        (
            SELECT id
            FROM users
            WHERE email = 'alinaseem@gmail.com'
        ),

        (
            SELECT id
            FROM organizations
            WHERE email = 'info@apexsolutions.ps'
        ),

        (
            SELECT s.id
            FROM services s
                     JOIN organizations o
                          ON o.id = s.organization_id
            WHERE s.name = 'Database Design'
              AND o.email = 'info@apexsolutions.ps'
        ),

        (
            SELECT id
            FROM users
            WHERE email = 'hanisamir@gmail.com'
        ),

        (
            SELECT r.id
            FROM rooms r
                     JOIN organizations o
                          ON o.id = r.organization_id
            WHERE r.name = 'Apex Room 2'
              AND o.email = 'info@apexsolutions.ps'
        ),

        'Service appointment',
        'Customer booking',

        'Customer requested a quiet appointment.',
        NULL,

        '#16A34A',
        '#2563EB',

        TIMESTAMPTZ '2026-09-16 10:30:00+03',
        TIMESTAMPTZ '2026-09-16 12:00:00+03',

        'CONFIRMED',

        'VISA',
        'PAID',
        TIMESTAMPTZ '2026-09-15 13:00:00+03'
    );


-- ============================================================
-- FINAL VERIFICATION
-- ============================================================

SELECT
    table_name
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_type = 'BASE TABLE'
ORDER BY table_name;


SELECT COUNT(*) AS organization_count
FROM organizations;


SELECT COUNT(*) AS user_count
FROM users;


SELECT COUNT(*) AS service_count
FROM services;


SELECT COUNT(*) AS room_count
FROM rooms;


SELECT COUNT(*) AS working_hours_count
FROM working_hours;


SELECT COUNT(*) AS appointment_count
FROM appointments;
