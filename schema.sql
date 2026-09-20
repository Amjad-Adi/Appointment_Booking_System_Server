-- ============================================================
-- Appointment Booking System
-- INITIAL CREATION SCHEMA (PostgreSQL + PostGIS)
-- ============================================================

-- ============================================================
-- EXTENSIONS
-- ============================================================
CREATE EXTENSION IF NOT EXISTS postgis;
CREATE EXTENSION IF NOT EXISTS pgcrypto;


-- ============================================================
-- 1. LOCATIONS
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
-- 2. ORGANIZATIONS
-- ============================================================
CREATE TABLE organizations (
                               id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
                               uuid UUID NOT NULL DEFAULT gen_random_uuid() UNIQUE,
                               name VARCHAR(256) NOT NULL,
                               email VARCHAR(320) NOT NULL UNIQUE,
                               phone_number VARCHAR(20),
                               bio VARCHAR(4096),
                               location_id BIGINT REFERENCES locations(id) ON DELETE SET NULL ON UPDATE CASCADE,
                               profile_picture_path TEXT NOT NULL DEFAULT 'DEFAULT_PICTURE_PATH',
                               status VARCHAR(8) NOT NULL DEFAULT 'ACTIVE',
                               created_at_utc TIMESTAMPTZ NOT NULL DEFAULT now(),
                               updated_at_utc TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================
-- 3. USERS
-- ============================================================
CREATE TABLE users (
                       id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
                       uuid UUID NOT NULL DEFAULT gen_random_uuid() UNIQUE,
                       first_name VARCHAR(64) NOT NULL,
                       last_name VARCHAR(64) NOT NULL,
                       email VARCHAR(320) NOT NULL UNIQUE,
                       firebase_uid VARCHAR(128) NOT NULL UNIQUE,
                       profile_picture_path TEXT NOT NULL DEFAULT 'DEFAULT_PICTURE_PATH',
                       created_at_utc TIMESTAMPTZ NOT NULL DEFAULT now(),
                       updated_at_utc TIMESTAMPTZ NOT NULL DEFAULT now(),
                       organization_id BIGINT REFERENCES organizations(id) ON DELETE SET NULL ON UPDATE CASCADE,
                       language CHAR(2) NOT NULL DEFAULT 'en',
                       role VARCHAR(16) NOT NULL CHECK (role IN ('WORKER', 'OWNER', 'MANAGER', 'SUPER_ADMIN', 'CRM', 'CUSTOMER')),
                       status VARCHAR(8) NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'INACTIVE'))
);

-- ============================================================
-- 4. SERVICE CATEGORIES
-- ============================================================
CREATE TABLE service_categories (
                                    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
                                    uuid UUID NOT NULL DEFAULT gen_random_uuid() UNIQUE,
                                    name VARCHAR(256) NOT NULL UNIQUE,
                                    description VARCHAR(4096),
                                    picture_path TEXT NOT NULL DEFAULT 'DEFAULT_PICTURE_PATH',
                                    created_at_utc TIMESTAMPTZ NOT NULL DEFAULT now(),
                                    updated_at_utc TIMESTAMPTZ NOT NULL DEFAULT now(),
                                    status VARCHAR(8) NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'INACTIVE'))
);

-- ============================================================
-- 5. SERVICES
-- ============================================================
CREATE TABLE services (
                          id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
                          uuid UUID NOT NULL DEFAULT gen_random_uuid() UNIQUE,
                          name VARCHAR(256) NOT NULL,
                          description VARCHAR(4096),
                          price NUMERIC(10, 2) NOT NULL CHECK (price >= 0),
                          duration_in_minutes INTEGER NOT NULL CHECK (duration_in_minutes > 0),
                          organization_id BIGINT NOT NULL REFERENCES organizations(id) ON DELETE RESTRICT ON UPDATE CASCADE,
                          picture_path TEXT NOT NULL DEFAULT 'DEFAULT_PICTURE_PATH',
                          created_at_utc TIMESTAMPTZ NOT NULL DEFAULT now(),
                          updated_at_utc TIMESTAMPTZ NOT NULL DEFAULT now(),
                          status VARCHAR(8) NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'INACTIVE')),
                          CONSTRAINT services_organization_name_unique UNIQUE (organization_id, name)
);

-- ============================================================
-- 6. SERVICE JUNCTION CATEGORY
-- ============================================================
CREATE TABLE service_junction_category (
                                           service_category_id BIGINT NOT NULL REFERENCES service_categories(id) ON DELETE CASCADE ON UPDATE CASCADE,
                                           service_id BIGINT NOT NULL REFERENCES services(id) ON DELETE CASCADE ON UPDATE CASCADE,
                                           PRIMARY KEY (service_category_id, service_id)
);

-- ============================================================
-- 7. ROOMS
-- ============================================================
CREATE TABLE rooms (
                       id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
                       uuid UUID NOT NULL DEFAULT gen_random_uuid() UNIQUE,
                       name VARCHAR(256) NOT NULL,
                       description VARCHAR(4096),
                       user_id BIGINT REFERENCES users(id) ON DELETE SET NULL ON UPDATE CASCADE,
                       organization_id BIGINT NOT NULL REFERENCES organizations(id) ON DELETE CASCADE ON UPDATE CASCADE,
                       created_at_utc TIMESTAMPTZ NOT NULL DEFAULT now(),
                       updated_at_utc TIMESTAMPTZ NOT NULL DEFAULT now(),
                       status VARCHAR(8) NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'INACTIVE')),
                       occupancy_status VARCHAR(10) NOT NULL DEFAULT 'AVAILABLE' CHECK (occupancy_status IN ('OCCUPIED', 'AVAILABLE'))
);

-- ============================================================
-- 8. WORKING HOURS
-- ============================================================
CREATE TABLE working_hours (
                               id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
                               uuid UUID NOT NULL DEFAULT gen_random_uuid() UNIQUE,
                               organization_id BIGINT NOT NULL REFERENCES organizations(id) ON DELETE CASCADE ON UPDATE CASCADE,
                               day_of_week VARCHAR(10) NOT NULL CHECK (day_of_week IN ('SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY')),
                               start_time TIME,
                               end_time TIME,
                               CONSTRAINT working_hours_time_check CHECK (
                                   (start_time IS NULL AND end_time IS NULL) OR
                                   (start_time IS NOT NULL AND end_time IS NOT NULL AND start_time < end_time)
                                   ),
                               CONSTRAINT working_hours_organization_day_unique UNIQUE (organization_id, day_of_week)
);

-- ============================================================
-- 9. SPECIAL DAYS
-- ============================================================
CREATE TABLE special_days (
                              id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
                              uuid UUID NOT NULL DEFAULT gen_random_uuid() UNIQUE,
                              organization_id BIGINT NOT NULL REFERENCES organizations(id) ON DELETE CASCADE ON UPDATE CASCADE,
                              name VARCHAR(256) NOT NULL,
                              day_date DATE NOT NULL,
                              description VARCHAR(4096),
                              created_at_utc TIMESTAMPTZ NOT NULL DEFAULT now(),
                              updated_at_utc TIMESTAMPTZ NOT NULL DEFAULT now(),
                              status VARCHAR(8) NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'INACTIVE')),
                              CONSTRAINT special_days_organization_date_unique UNIQUE (organization_id, day_date)
);

-- ============================================================
-- 10. TIME BLOCK
-- ============================================================
CREATE TABLE time_block (
                            id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
                            uuid UUID NOT NULL DEFAULT gen_random_uuid() UNIQUE,
                            reason VARCHAR(4096),
                            start_at_utc TIMESTAMPTZ NOT NULL,
                            end_at_utc TIMESTAMPTZ NOT NULL,
                            organization_id BIGINT NOT NULL REFERENCES organizations(id) ON DELETE RESTRICT ON UPDATE CASCADE,
                            request_user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE ON UPDATE CASCADE,
                            respond_user_id BIGINT REFERENCES users(id) ON DELETE SET NULL ON UPDATE CASCADE,
                            requested_at_utc TIMESTAMPTZ NOT NULL DEFAULT now(),
                            responded_at_utc TIMESTAMPTZ,
                            request_status VARCHAR(16) NOT NULL DEFAULT 'PENDING' CHECK (request_status IN ('APPROVED', 'PENDING', 'REJECTED', 'DELETED')),
                            CONSTRAINT time_block_time_check CHECK (start_at_utc < end_at_utc)
);

-- ============================================================
-- 11. APPOINTMENTS
-- ============================================================
CREATE TABLE appointments (
                              id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
                              uuid UUID NOT NULL DEFAULT gen_random_uuid() UNIQUE,
                              user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE RESTRICT ON UPDATE CASCADE,
                              organization_id BIGINT NOT NULL REFERENCES organizations(id) ON DELETE RESTRICT ON UPDATE CASCADE,
                              service_id BIGINT NOT NULL REFERENCES services(id) ON DELETE RESTRICT ON UPDATE CASCADE,
                              worker_id BIGINT NOT NULL REFERENCES users(id) ON DELETE RESTRICT ON UPDATE CASCADE,
                              room_id BIGINT NOT NULL REFERENCES rooms(id) ON DELETE RESTRICT ON UPDATE CASCADE,
                              approval_user_id BIGINT REFERENCES users(id) ON DELETE SET NULL ON UPDATE CASCADE,
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
                              appointment_status VARCHAR(64) NOT NULL DEFAULT 'PENDING_USER_CONFIRMATION' CHECK (appointment_status IN ('PENDING_USER_CONFIRMATION', 'PENDING_ORGANIZATION_APPROVAL', 'CONFIRMED', 'REJECTED', 'NO_SHOW', 'CANCELLED', 'COMPLETED', 'IN_PROGRESS')),
                              rejection_reason VARCHAR(4096),
                              payment_method VARCHAR(64) CHECK (payment_method IS NULL OR payment_method IN ('CASH', 'VISA')),
                              payment_status VARCHAR(64) NOT NULL DEFAULT 'UNPAID' CHECK (payment_status IN ('UNPAID', 'PENDING', 'PAID', 'FAILED', 'REFUNDED')),
                              paid_at_utc TIMESTAMPTZ,
                              created_at_utc TIMESTAMPTZ NOT NULL DEFAULT now(),
                              updated_at_utc TIMESTAMPTZ NOT NULL DEFAULT now(),
                              CONSTRAINT appointments_scheduled_time_check CHECK (scheduled_start_at_utc < scheduled_end_at_utc),
                              CONSTRAINT appointments_actual_time_check CHECK (
                                  (actual_start_at_utc IS NULL AND actual_end_at_utc IS NULL) OR
                                  (actual_start_at_utc IS NOT NULL AND actual_end_at_utc IS NOT NULL AND actual_start_at_utc < actual_end_at_utc)
                                  ),
                              CONSTRAINT appointments_paid_at_check CHECK (
                                  (payment_status = 'PAID' AND paid_at_utc IS NOT NULL) OR
                                  (payment_status <> 'PAID' AND paid_at_utc IS NULL)
                                  )
);

-- ============================================================
-- 12. INVITATIONS
-- ============================================================
CREATE TABLE invitations (
                             id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
                             uuid UUID NOT NULL DEFAULT gen_random_uuid() UNIQUE,
                             organization_id BIGINT REFERENCES organizations(id) ON DELETE RESTRICT ON UPDATE CASCADE,
                             sender_id BIGINT REFERENCES users(id) ON DELETE SET NULL ON UPDATE CASCADE,
                             recipient_email VARCHAR(320) NOT NULL,
                             token_hash VARCHAR(255) NOT NULL UNIQUE,
                             created_at_utc TIMESTAMPTZ NOT NULL DEFAULT now(),
                             expires_at_utc TIMESTAMPTZ NOT NULL,
                             accepted_at_utc TIMESTAMPTZ,
                             role VARCHAR(16) NOT NULL DEFAULT 'WORKER' CHECK (role IN ('WORKER', 'OWNER', 'MANAGER', 'SUPER_ADMIN', 'CRM', 'CUSTOMER')),
                             invitation_status VARCHAR(16) NOT NULL DEFAULT 'PENDING' CHECK (invitation_status IN ('PENDING', 'ACCEPTED', 'EXPIRED', 'CANCELLED')),
                             CONSTRAINT invitations_expiry_check CHECK (expires_at_utc > created_at_utc),
                             CONSTRAINT invitations_accepted_at_check CHECK (
                                 (invitation_status = 'ACCEPTED' AND accepted_at_utc IS NOT NULL) OR
                                 (invitation_status <> 'ACCEPTED' AND accepted_at_utc IS NULL)
                                 )
);

-- ============================================================
-- 13. REFRESH TOKENS
-- ============================================================
CREATE TABLE refresh_tokens (
                                id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
                                user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE ON UPDATE CASCADE,
                                token_hash TEXT NOT NULL UNIQUE,
                                created_at_utc TIMESTAMPTZ NOT NULL DEFAULT now(),
                                expires_at_utc TIMESTAMPTZ NOT NULL DEFAULT (now() + INTERVAL '7 days'),
                                revoked BOOLEAN NOT NULL DEFAULT FALSE,
                                revoked_at_utc TIMESTAMPTZ,
                                CONSTRAINT refresh_tokens_expiry_check CHECK (expires_at_utc > created_at_utc),
                                CONSTRAINT refresh_tokens_revoked_check CHECK (
                                    (revoked = TRUE AND revoked_at_utc IS NOT NULL) OR
                                    (revoked = FALSE AND revoked_at_utc IS NULL)
                                    )
);

-- ============================================================
-- 14. BLACKLISTED TOKENS
-- ============================================================
CREATE TABLE blacklisted_tokens (
                                    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
                                    jti UUID NOT NULL UNIQUE,
                                    expires_at_utc TIMESTAMPTZ NOT NULL,
                                    blacklisted_at_utc TIMESTAMPTZ NOT NULL DEFAULT now(),
                                    reason VARCHAR(4096)
);


-- ============================================================
-- INDEXES
-- ============================================================

CREATE INDEX idx_locations_name ON locations(name);

CREATE INDEX idx_organizations_location_id ON organizations(location_id);

CREATE INDEX idx_users_organization_id ON users(organization_id);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_status ON users(status);

CREATE INDEX idx_services_organization_id ON services(organization_id);
CREATE INDEX idx_services_status ON services(status);

CREATE INDEX idx_service_junction_service_id ON service_junction_category(service_id);

CREATE INDEX idx_rooms_organization_id ON rooms(organization_id);
CREATE INDEX idx_rooms_user_id ON rooms(user_id);

CREATE INDEX idx_working_hours_organization_id ON working_hours(organization_id);

CREATE INDEX idx_special_days_organization_date ON special_days(organization_id, day_date);

CREATE INDEX idx_time_block_organization_time ON time_block(organization_id, start_at_utc, end_at_utc);
CREATE INDEX idx_time_block_request_user_time ON time_block(request_user_id, start_at_utc, end_at_utc);
CREATE INDEX idx_time_block_respond_user_id ON time_block(respond_user_id);

CREATE INDEX idx_appointments_organization_time ON appointments(organization_id, scheduled_start_at_utc, scheduled_end_at_utc);
CREATE INDEX idx_appointments_worker_time ON appointments(worker_id, scheduled_start_at_utc, scheduled_end_at_utc);
CREATE INDEX idx_appointments_room_time ON appointments(room_id, scheduled_start_at_utc, scheduled_end_at_utc);
CREATE INDEX idx_appointments_user_id ON appointments(user_id);
CREATE INDEX idx_appointments_service_id ON appointments(service_id);
CREATE INDEX idx_appointments_status ON appointments(appointment_status);

CREATE INDEX idx_refresh_tokens_user_id ON refresh_tokens(user_id);
CREATE INDEX idx_refresh_tokens_expires_at ON refresh_tokens(expires_at_utc);

CREATE INDEX idx_blacklisted_tokens_expires_at ON blacklisted_tokens(expires_at_utc);

CREATE INDEX idx_invitations_organization_id ON invitations(organization_id);
CREATE INDEX idx_invitations_recipient_email ON invitations(recipient_email);
CREATE INDEX idx_invitations_status ON invitations(invitation_status);