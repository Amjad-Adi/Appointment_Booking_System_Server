"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.appointmentTable = void 0;
const pg_core_1 = require("drizzle-orm/pg-core");
const appointment_contract_js_1 = require("../databases/contracts/appointment.contract.js");
const users_db_js_1 = require("./users.db.js");
const organizations_db_js_1 = require("./organizations.db.js");
const service_db_js_1 = require("./service.db.js");
const room_db_js_1 = require("./room.db.js");
const appointment_status_js_1 = require("../models/enums/appointment-status.js");
const payment_status_js_1 = require("../models/enums/payment-status.js");
exports.appointmentTable = (0, pg_core_1.pgTable)(appointment_contract_js_1.TABLE_NAME, {
    id: (0, pg_core_1.bigint)(appointment_contract_js_1.COLUMN_ID, {
        mode: "number",
    })
        .generatedAlwaysAsIdentity()
        .primaryKey(),
    uuid: (0, pg_core_1.uuid)(appointment_contract_js_1.COLUMN_UUID)
        .defaultRandom()
        .unique()
        .notNull(),
    userId: (0, pg_core_1.bigint)(appointment_contract_js_1.COLUMN_USER_ID, {
        mode: "number",
    })
        .notNull()
        .references(() => users_db_js_1.usersTable.id, {
        onDelete: "restrict",
        onUpdate: "cascade",
    }),
    organizationId: (0, pg_core_1.bigint)(appointment_contract_js_1.COLUMN_ORGANIZATION_ID, {
        mode: "number",
    })
        .notNull()
        .references(() => organizations_db_js_1.organizationTable.id, {
        onDelete: "restrict",
        onUpdate: "cascade",
    }),
    serviceId: (0, pg_core_1.bigint)(appointment_contract_js_1.COLUMN_SERVICE_ID, {
        mode: "number",
    })
        .notNull()
        .references(() => service_db_js_1.serviceTable.id, {
        onDelete: "restrict",
        onUpdate: "cascade",
    }),
    workerId: (0, pg_core_1.bigint)(appointment_contract_js_1.COLUMN_WORKER_ID, {
        mode: "number",
    })
        .notNull()
        .references(() => users_db_js_1.usersTable.id, {
        onDelete: "restrict",
        onUpdate: "cascade",
    }),
    roomId: (0, pg_core_1.bigint)(appointment_contract_js_1.COLUMN_ROOM_ID, {
        mode: "number",
    })
        .notNull()
        .references(() => room_db_js_1.roomTable.id, {
        onDelete: "restrict",
        onUpdate: "cascade",
    }),
    approvalUserId: (0, pg_core_1.bigint)(appointment_contract_js_1.COLUMN_APPROVAL_USER_ID, {
        mode: "number",
    }).references(() => users_db_js_1.usersTable.id, {
        onDelete: "set null",
        onUpdate: "cascade",
    }),
    userTitle: (0, pg_core_1.varchar)(appointment_contract_js_1.COLUMN_USER_TITLE, {
        length: 256,
    }),
    organizationTitle: (0, pg_core_1.varchar)(appointment_contract_js_1.COLUMN_ORGANIZATION_TITLE, {
        length: 256,
    }),
    userNote: (0, pg_core_1.varchar)(appointment_contract_js_1.COLUMN_USER_NOTE, {
        length: 4096,
    }),
    organizationNote: (0, pg_core_1.varchar)(appointment_contract_js_1.COLUMN_ORGANIZATION_NOTE, {
        length: 4096,
    }),
    userColour: (0, pg_core_1.varchar)(appointment_contract_js_1.COLUMN_USER_COLOUR, {
        length: 7,
    })
        .notNull()
        .default("#2563EB"),
    organizationColour: (0, pg_core_1.varchar)(appointment_contract_js_1.COLUMN_ORGANIZATION_COLOUR, {
        length: 7,
    })
        .notNull()
        .default("#2563EB"),
    scheduledStartAtUTC: (0, pg_core_1.timestamp)(appointment_contract_js_1.COLUMN_SCHEDULED_START_AT_UTC, {
        withTimezone: true,
        mode: "date",
    }).notNull(),
    scheduledEndAtUTC: (0, pg_core_1.timestamp)(appointment_contract_js_1.COLUMN_SCHEDULED_END_AT_UTC, {
        withTimezone: true,
        mode: "date",
    }).notNull(),
    actualStartAtUTC: (0, pg_core_1.timestamp)(appointment_contract_js_1.COLUMN_ACTUAL_START_AT_UTC, {
        withTimezone: true,
        mode: "date",
    }),
    actualEndAtUTC: (0, pg_core_1.timestamp)(appointment_contract_js_1.COLUMN_ACTUAL_END_AT_UTC, {
        withTimezone: true,
        mode: "date",
    }),
    appointmentStatus: (0, pg_core_1.varchar)(appointment_contract_js_1.COLUMN_APPOINTMENT_STATUS, {
        length: 64,
    })
        .$type()
        .notNull()
        .default(appointment_status_js_1.AppointmentStatus.PENDING_USER_CONFIRMATION),
    rejectionReason: (0, pg_core_1.varchar)(appointment_contract_js_1.COLUMN_REJECTION_REASON, {
        length: 4096,
    }),
    paymentMethod: (0, pg_core_1.varchar)(appointment_contract_js_1.COLUMN_PAYMENT_METHOD, {
        length: 64,
    }).$type(),
    paymentStatus: (0, pg_core_1.varchar)(appointment_contract_js_1.COLUMN_PAYMENT_STATUS, {
        length: 64,
    })
        .$type()
        .notNull()
        .default(payment_status_js_1.PaymentStatus.UNPAID),
    paidAtUTC: (0, pg_core_1.timestamp)(appointment_contract_js_1.COLUMN_PAID_AT_UTC, {
        withTimezone: true,
        mode: "date",
    }),
    createdAtUTC: (0, pg_core_1.timestamp)(appointment_contract_js_1.COLUMN_CREATED_AT_UTC, {
        withTimezone: true,
        mode: "date",
    })
        .notNull()
        .defaultNow(),
    updatedAtUTC: (0, pg_core_1.timestamp)(appointment_contract_js_1.COLUMN_UPDATED_AT_UTC, {
        withTimezone: true,
        mode: "date",
    })
        .notNull()
        .defaultNow(),
});
