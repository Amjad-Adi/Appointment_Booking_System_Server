create table if not exists spatial_ref_sys
(
    srid      integer not null
    primary key
    constraint spatial_ref_sys_srid_check
    check ((srid > 0) AND (srid <= 998999)),
    auth_name varchar(256),
    auth_srid integer,
    srtext    varchar(2048),
    proj4text varchar(2048)
    );

grant select on spatial_ref_sys to public;

create table if not exists locations
(
    id              bigint generated always as identity
    primary key,
    name            varchar(1024)                          not null,
    created_at_utc  timestamp with time zone default now() not null,
    updated_at_utc  timestamp with time zone default now() not null,
    location_on_map geometry(Point, 4326),
    timezone        varchar(64)                            not null
    );

create table if not exists organizations
(
    id                   bigint generated always as identity
    primary key,
    uuid                 uuid                     default gen_random_uuid()
    unique,
    name                 varchar(256)                                                 not null,
    email                varchar(320)                                                 not null
    unique,
    phone_number         varchar(20)                                                  not null
    unique,
    bio                  varchar(4096),
    location_id          bigint
    references locations
    on update cascade on delete set null,
    profile_picture_path text,
    created_at_utc       timestamp with time zone default now()                       not null,
    updated_at_utc       timestamp with time zone default now()                       not null,
    status               varchar(8)               default 'ACTIVE'::character varying not null
    constraint organizations_status_check
    check ((status)::text = ANY ((ARRAY ['ACTIVE'::character varying, 'INACTIVE'::character varying])::text[])),
    profile_picture_id   text
    constraint organization_profile_picture_id_unique
    unique
    );

create index if not exists idx_organizations_location_id
    on organizations (location_id);

create table if not exists services
(
    id                  bigint generated always as identity
    primary key,
    uuid                uuid                     default gen_random_uuid()
    unique,
    name                varchar(256),
    description         varchar(4096),
    price               numeric(10, 2)                                               not null,
    duration_in_minutes integer                                                      not null,
    organization_id     bigint                                                       not null
    references organizations
    on update cascade on delete restrict,
    picture_path        text,
    created_at_utc      timestamp with time zone default now()                       not null,
    updated_at_utc      timestamp with time zone default now()                       not null,
    status              varchar(8)               default 'ACTIVE'::character varying not null
    constraint services_status_check
    check ((status)::text = ANY ((ARRAY ['ACTIVE'::character varying, 'INACTIVE'::character varying])::text[])),
    picture_id          text
    constraint services_picture_id_unique
    unique,
    unique (organization_id, name)
    );

create table if not exists refresh_tokens
(
    id             bigint generated always as identity
    primary key,
    user_id        bigint                                                        not null,
    token_hash     text                                                          not null,
    created_at_utc timestamp with time zone default now()                        not null,
    expires_at_utc timestamp with time zone default (now() + '7 days'::interval) not null,
    revoked        boolean                  default false                        not null,
    revoked_at_utc timestamp with time zone
                                 );

create index if not exists idx_refresh_tokens_token_hash
    on refresh_tokens (token_hash);

create table if not exists blacklisted_tokens
(
    id                 bigint generated always as identity
    primary key,
    jti                uuid                                   not null,
    expires_at_utc     timestamp with time zone               not null,
    blacklisted_at_utc timestamp with time zone default now() not null,
    reason             varchar(4096)
    );

create index if not exists idx_blacklisted_tokens_jti
    on blacklisted_tokens (jti);

create table if not exists users
(
    id                   bigint generated always as identity
    primary key,
    uuid                 uuid                     default gen_random_uuid()
    unique,
    first_name           varchar(64)                                                  not null,
    last_name            varchar(64)                                                  not null,
    email                varchar(320)                                                 not null
    unique,
    firebase_uid         varchar(128)                                                 not null,
    profile_picture_path text,
    created_at_utc       timestamp with time zone default now()                       not null,
    updated_at_utc       timestamp with time zone default now()                       not null,
    organization_id      bigint
    references organizations
                                   on update cascade on delete cascade,
    language             char(2)                  default 'en'::bpchar                not null,
    role                 varchar(16)                                                  not null
    constraint users_role_check
    check ((role)::text = ANY
((ARRAY ['WORKER'::character varying, 'OWNER'::character varying, 'MANAGER'::character varying, 'SUPER ADMIN'::character varying, 'CRM'::character varying, 'CUSTOMER'::character varying])::text[])),
    status               varchar(8)               default 'ACTIVE'::character varying not null
    constraint users_status_check
    check ((status)::text = ANY ((ARRAY ['ACTIVE'::character varying, 'INACTIVE'::character varying])::text[])),
    profile_picture_id   text
    constraint users_profile_picture_id_unique
    unique
    );

create index if not exists idx_users_firebase_uid
    on users (firebase_uid);

create index if not exists idx_users_organization_id
    on users (organization_id);

create table if not exists service_categories
(
    id             bigint generated always as identity
    primary key,
    uuid           uuid                     default gen_random_uuid()
    unique,
    name           varchar(256)                                                 not null
    unique,
    description    varchar(4096),
    picture_path   text,
    created_at_utc timestamp with time zone default now()                       not null,
    updated_at_utc timestamp with time zone default now()                       not null,
    status         varchar(8)               default 'ACTIVE'::character varying not null
    constraint service_categories_status_check
    check ((status)::text = ANY ((ARRAY ['ACTIVE'::character varying, 'INACTIVE'::character varying])::text[])),
    picture_id     text
    unique
    );

create table if not exists service_junction_category
(
    service_category_id bigint not null
    references service_categories
    on update cascade on delete cascade,
    service_id          bigint not null
    references services
    on update cascade on delete cascade,
    primary key (service_category_id, service_id)
    );

create index if not exists idx_service_junction_category_service_id
    on service_junction_category (service_id);

create table if not exists rooms
(
    id               bigint generated always as identity
    primary key,
    uuid             uuid                     default gen_random_uuid()
    unique,
    name             varchar(256)                                                    not null,
    description      varchar(4096),
    user_id          bigint
    references users
    on update cascade on delete set null,
    organization_id  bigint                                                          not null
    references organizations
    on update cascade on delete cascade,
    created_at_utc   timestamp with time zone default now()                          not null,
    updated_at_utc   timestamp with time zone default now()                          not null,
    status           varchar(8)               default 'ACTIVE'::character varying    not null
    constraint rooms_status_check
    check ((status)::text = ANY ((ARRAY ['ACTIVE'::character varying, 'INACTIVE'::character varying])::text[])),
    occupancy_status varchar(10)              default 'AVAILABLE'::character varying not null
    constraint rooms_occupancy_status_check
    check ((occupancy_status)::text = ANY
((ARRAY ['OCCUPIED'::character varying, 'AVAILABLE'::character varying])::text[])),
    unique (organization_id, name)
    );

create index if not exists idx_rooms_user_id
    on rooms (user_id);

create table if not exists time_block
(
    id               bigint generated always as identity
    primary key,
    uuid             uuid                     default gen_random_uuid()
    unique,
    reason           varchar(4096),
    start_at_utc     timestamp with time zone                                      not null,
    end_at_utc       timestamp with time zone                                      not null,
    organization_id  bigint                                                        not null
    references organizations
    on update cascade on delete restrict,
    request_user_id  bigint                                                        not null
    references users
    on update cascade on delete cascade,
    respond_user_id  bigint
    references users
    on update cascade on delete cascade,
    requested_at_utc timestamp with time zone default now()                        not null,
    responded_at_utc timestamp with time zone,
        request_status   varchar(256)             default 'PENDING'::character varying not null
    constraint time_block_request_status_check
    check ((request_status)::text = ANY
((ARRAY ['APPROVED'::character varying, 'PENDING'::character varying, 'REJECTED'::character varying, 'DELETED'::character varying])::text[])),
    constraint time_block_no_overlap
    exclude using gist (organization_id with =, tstzrange(start_at_utc, end_at_utc, '[)'::text) with &&)
    );

create index if not exists idx_time_block_request_user_id
    on time_block (request_user_id);

create index if not exists idx_time_block_org_status_start
    on time_block (organization_id, request_status, start_at_utc);

create table if not exists special_days
(
    id              bigint generated always as identity
    primary key,
    uuid            uuid                     default gen_random_uuid()
    unique,
    organization_id bigint                                                       not null
    references organizations
    on update cascade on delete cascade,
    name            varchar(256)                                                 not null,
    day_date        date                                                         not null,
    created_at_utc  timestamp with time zone default now()                       not null,
    updated_at_utc  timestamp with time zone default now()                       not null,
    description     varchar(4096),
    status          varchar(8)               default 'ACTIVE'::character varying not null
    constraint special_days_status_check
    check ((status)::text = ANY ((ARRAY ['ACTIVE'::character varying, 'INACTIVE'::character varying])::text[])),
    unique (organization_id, day_date)
    );

create table if not exists working_hours
(
    id              bigint generated always as identity
    primary key,
    uuid            uuid default gen_random_uuid()
    unique,
    organization_id bigint      not null
    references organizations
    on update cascade on delete cascade,
    day_of_week     varchar(10) not null
    constraint working_hours_day_of_week_check
    check ((day_of_week)::text = ANY
((ARRAY ['FRIDAY'::character varying, 'SATURDAY'::character varying, 'SUNDAY'::character varying, 'MONDAY'::character varying, 'TUESDAY'::character varying, 'WEDNESDAY'::character varying, 'THURSDAY'::character varying])::text[])),
    start_time      time,
    end_time        time,
    unique (organization_id, day_of_week)
    );

create table if not exists invitations
(
    id                bigint generated always as identity
    primary key,
    uuid              uuid                     default gen_random_uuid()
    unique,
    organization_id   bigint
    references organizations
    on update cascade on delete restrict,
    sender_id         bigint
    references users
    on update cascade on delete cascade,
    recipient_email   varchar(320),
    token_hash        varchar(255)
    unique,
    created_at_utc    timestamp with time zone default now()                        not null,
    expires_at_utc    timestamp with time zone                                      not null,
        role              varchar(16)              default 'WORKER'::character varying  not null
    constraint invitations_role_check
    check ((role)::text = ANY
((ARRAY ['WORKER'::character varying, 'OWNER'::character varying, 'MANAGER'::character varying, 'SUPER ADMIN'::character varying, 'CRM'::character varying, 'CUSTOMER'::character varying])::text[])),
    invitation_status varchar(16)              default 'PENDING'::character varying not null
    constraint invitations_invitation_status_check
    check ((invitation_status)::text = ANY
((ARRAY ['PENDING'::character varying, 'ACCEPTED'::character varying, 'EXPIRED'::character varying, 'CANCELLED'::character varying])::text[])),
    updated_at_utc    timestamp with time zone default now()                        not null
    );

create unique index if not exists invitations_unique_organization_id_pending_email_role
    on invitations (organization_id, recipient_email, role)
    where ((invitation_status)::text = 'PENDING'::text);

create index if not exists idx_invitations_sender_id
    on invitations (sender_id);

create table if not exists appointments
(
    id                     bigint generated always as identity
    primary key,
    uuid                   uuid                     default gen_random_uuid()                              not null
    unique,
    user_id                bigint                                                                          not null
    references users
    on update cascade on delete restrict,
    organization_id        bigint                                                                          not null
    references organizations
    on update cascade on delete restrict,
    service_id             bigint                                                                          not null
    references services
    on update cascade on delete restrict,
    worker_id              bigint                                                                          not null
    references users
    on update cascade on delete restrict,
    room_id                bigint                                                                          not null
    references rooms
    on update cascade on delete restrict,
    approval_user_id       bigint
    references users
    on update cascade on delete set null,
    user_title             varchar(256),
    organization_title     varchar(256),
    user_note              varchar(4096),
    organization_note      varchar(4096),
    user_colour            varchar(7)               default '#2563EB'::character varying                   not null,
    organization_colour    varchar(7)               default '#2563EB'::character varying                   not null,
    scheduled_start_at_utc timestamp with time zone                                                        not null,
    scheduled_end_at_utc   timestamp with time zone                                                        not null,
    actual_start_at_utc    timestamp with time zone,
    actual_end_at_utc      timestamp with time zone,
        appointment_status     varchar(64)              default 'PENDING_USER_CONFIRMATION'::character varying not null
    constraint appointments_appointment_status_check
    check ((appointment_status)::text = ANY
((ARRAY ['PENDING_USER_CONFIRMATION'::character varying, 'PENDING_ORGANIZATION_APPROVAL'::character varying, 'CONFIRMED'::character varying, 'REJECTED'::character varying, 'NO_SHOW'::character varying, 'CANCELLED'::character varying, 'COMPLETED'::character varying, 'IN_PROGRESS'::character varying])::text[])),
    rejection_reason       varchar(4096),
    payment_method         varchar(64)
    constraint appointments_payment_method_check
    check ((payment_method)::text = ANY
((ARRAY ['CASH'::character varying, 'VISA'::character varying])::text[])),
    payment_status         varchar(64)              default 'UNPAID'::character varying                    not null
    constraint appointments_payment_status_check
    check ((payment_status)::text = ANY
((ARRAY ['UNPAID'::character varying, 'PENDING'::character varying, 'PAID'::character varying, 'FAILED'::character varying, 'REFUNDED'::character varying])::text[])),
    paid_at_utc            timestamp with time zone,
    created_at_utc         timestamp with time zone default now()                                          not null,
    updated_at_utc         timestamp with time zone default now()                                          not null,
    constraint appointments_room_no_overlap
    exclude using gist (room_id with =, tstzrange(scheduled_start_at_utc, scheduled_end_at_utc, '[)'::text) with &&),
    constraint appointments_worker_no_overlap
    exclude using gist (worker_id with =, tstzrange(scheduled_start_at_utc, scheduled_end_at_utc, '[)'::text) with &&),
    constraint appointments_scheduled_time_check
    check (scheduled_start_at_utc < scheduled_end_at_utc),
    constraint appointments_actual_time_check
    check ((actual_start_at_utc IS NULL) OR (actual_end_at_utc IS NULL) OR
(actual_start_at_utc < actual_end_at_utc)),
    constraint appointments_paid_at_check
    check (((payment_status)::text = 'PAID'::text) OR (paid_at_utc IS NULL))
    );

create index if not exists idx_appointments_organization_id
    on appointments (organization_id);

create index if not exists idx_appointments_user_id
    on appointments (user_id);

create index if not exists idx_appointments_worker_id
    on appointments (worker_id);

create index if not exists idx_appointments_room_id
    on appointments (room_id);

create index if not exists idx_appointments_service_id
    on appointments (service_id);

create index if not exists idx_appointments_org_start_status
    on appointments (organization_id, scheduled_start_at_utc, appointment_status);

create table if not exists customer_favourite_service
(
    customer_id    bigint                                 not null
    references users
    on update cascade on delete cascade,
    service_id     bigint                                 not null
    references services
    on update cascade on delete cascade,
    created_at_utc timestamp with time zone default now() not null,
    primary key (customer_id, service_id)
    );

create index if not exists idx_customer_favourite_service_service_id
    on customer_favourite_service (service_id);

create table if not exists reviews
(
    id             bigint generated always as identity
    primary key,
    uuid           uuid                     default gen_random_uuid() not null
    unique,
    customer_id    bigint                                             not null
    references users
    on update cascade on delete cascade,
    appointment_id bigint                                             not null
    constraint reviews_appointment_unique
    unique
    references appointments
    on update cascade on delete cascade,
    rating         integer                                            not null
    constraint reviews_rating_check
    check ((rating >= 1) AND (rating <= 5)),
    comment        varchar(4096)                                      not null,
    created_at_utc timestamp with time zone default now()             not null,
    updated_at_utc timestamp with time zone default now()             not null
    );

create index if not exists idx_reviews_customer_id
    on reviews (customer_id);

create index if not exists idx_reviews_appointment_id
    on reviews (appointment_id);

create index if not exists idx_reviews_rating
    on reviews (rating);

create table if not exists customer_invitations
(
    id                bigint generated always as identity
    primary key,
    uuid              uuid                     default gen_random_uuid()            not null
    unique,
    organization_id   bigint                                                        not null
    references organizations
    on update cascade on delete cascade,
    sender_id         bigint                                                        not null
    references users
    on update cascade on delete cascade,
    recipient_user_id bigint                                                        not null
    references users
    on update cascade on delete cascade,
    recipient_email   varchar(320)                                                  not null,
    status            varchar(16)              default 'PENDING'::character varying not null
    constraint customer_invitations_status_check
    check ((status)::text = ANY
((ARRAY ['PENDING'::character varying, 'ACCEPTED'::character varying, 'REJECTED'::character varying, 'CANCELLED'::character varying, 'EXPIRED'::character varying])::text[])),
    created_at_utc    timestamp with time zone default now()                        not null,
    updated_at_utc    timestamp with time zone default now()                        not null,
    expires_at_utc    timestamp with time zone                                      not null,
    responded_at_utc  timestamp with time zone,
        constraint customer_invitations_expiry_check
        check (expires_at_utc > created_at_utc),
    constraint customer_invitations_responded_at_check
    check ((((status)::text = ANY
((ARRAY ['ACCEPTED'::character varying, 'REJECTED'::character varying])::text[])) AND
(responded_at_utc IS NOT NULL)) OR (((status)::text <> ALL
((ARRAY ['ACCEPTED'::character varying, 'REJECTED'::character varying])::text[])) AND
(responded_at_utc IS NULL)))
    );

create index if not exists idx_customer_invitations_organization_id
    on customer_invitations (organization_id);

create index if not exists idx_customer_invitations_sender_id
    on customer_invitations (sender_id);

create index if not exists idx_customer_invitations_recipient_user_id
    on customer_invitations (recipient_user_id);

create index if not exists idx_customer_invitations_recipient_email
    on customer_invitations (recipient_email);

create index if not exists idx_customer_invitations_status
    on customer_invitations (status);

create unique index if not exists idx_customer_invitations_pending_unique
    on customer_invitations (organization_id, recipient_user_id)
    where ((status)::text = 'PENDING'::text);

create table if not exists organization_customers
(
    organization_id bigint                                 not null
    references organizations
    on update cascade on delete cascade,
    customer_id     bigint                                 not null
    references users
    on update cascade on delete cascade,
    created_at_utc  timestamp with time zone default now() not null,
    primary key (organization_id, customer_id)
    );

create index if not exists idx_organization_customers_customer_id
    on organization_customers (customer_id);

create table if not exists user_settings
(
    id                    bigint generated always as identity
    primary key,
    user_id               bigint                                                       not null
    unique
    references users
    on update cascade on delete cascade,
    language              varchar(8)               default 'en'::character varying     not null,
    theme                 varchar(16)              default 'SYSTEM'::character varying not null
    constraint user_settings_theme_check
    check ((theme)::text = ANY
((ARRAY ['LIGHT'::character varying, 'DARK'::character varying, 'SYSTEM'::character varying])::text[])),
    email_notifications   boolean                  default true                        not null,
    appointment_reminders boolean                  default true                        not null,
    marketing_emails      boolean                  default false                       not null,
    created_at_utc        timestamp with time zone default now()                       not null,
    updated_at_utc        timestamp with time zone default now()                       not null
    );

create index if not exists idx_user_settings_theme
    on user_settings (theme);

