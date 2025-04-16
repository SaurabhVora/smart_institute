import { pgTable, foreignKey, check, serial, integer, text, unique, timestamp, boolean } from "drizzle-orm/pg-core"
import { sql } from "drizzle-orm"



export const facultyAllocations = pgTable("faculty_allocations", {
	id: serial().primaryKey().notNull(),
	facultyId: integer("faculty_id").notNull(),
	studentId: integer("student_id").notNull(),
	status: text().default('active'),
}, (table) => [
	foreignKey({
			columns: [table.facultyId],
			foreignColumns: [users.id],
			name: "faculty_allocations_faculty_id_fkey"
		}),
	foreignKey({
			columns: [table.studentId],
			foreignColumns: [users.id],
			name: "faculty_allocations_student_id_fkey"
		}),
	check("faculty_allocations_status_check", sql`status = ANY (ARRAY['active'::text, 'completed'::text])`),
]);

export const passwordResetTokens = pgTable("password_reset_tokens", {
	id: serial().primaryKey().notNull(),
	userId: integer("user_id").notNull(),
	token: text().notNull(),
	expiresAt: timestamp("expires_at", { mode: 'string' }).notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).default(sql`CURRENT_TIMESTAMP`),
	usedAt: timestamp("used_at", { mode: 'string' }),
}, (table) => [
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "password_reset_tokens_user_id_fkey"
		}),
	unique("password_reset_tokens_token_key").on(table.token),
]);

export const emailVerificationTokens = pgTable("email_verification_tokens", {
	id: serial().primaryKey().notNull(),
	userId: integer("user_id").notNull(),
	token: text().notNull(),
	expiresAt: timestamp("expires_at", { mode: 'string' }).notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).default(sql`CURRENT_TIMESTAMP`),
	usedAt: timestamp("used_at", { mode: 'string' }),
}, (table) => [
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "email_verification_tokens_user_id_fkey"
		}),
	unique("email_verification_tokens_token_key").on(table.token),
]);

export const facultyDocuments = pgTable("faculty_documents", {
	id: serial().primaryKey().notNull(),
	facultyId: integer("faculty_id").notNull(),
	title: text().notNull(),
	description: text(),
	filePath: text("file_path").notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).default(sql`CURRENT_TIMESTAMP`),
}, (table) => [
	foreignKey({
			columns: [table.facultyId],
			foreignColumns: [users.id],
			name: "faculty_documents_faculty_id_fkey"
		}),
]);

export const documentFeedback = pgTable("document_feedback", {
	id: serial().primaryKey().notNull(),
	documentId: integer("document_id").notNull(),
	facultyId: integer("faculty_id").notNull(),
	feedback: text().notNull(),
	rating: integer(),
	createdAt: timestamp("created_at", { mode: 'string' }).default(sql`CURRENT_TIMESTAMP`),
	updatedAt: timestamp("updated_at", { mode: 'string' }),
}, (table) => [
	foreignKey({
			columns: [table.documentId],
			foreignColumns: [documents.id],
			name: "document_feedback_document_id_fkey"
		}),
	foreignKey({
			columns: [table.facultyId],
			foreignColumns: [users.id],
			name: "document_feedback_faculty_id_fkey"
		}),
]);

export const users = pgTable("users", {
	id: serial().primaryKey().notNull(),
	username: text().notNull(),
	password: text().notNull(),
	role: text().notNull(),
	name: text().notNull(),
	email: text(),
	emailVerified: boolean("email_verified").default(false),
	phone: text(),
	university: text(),
	department: text(),
	year: text(),
	bio: text(),
	companyName: text("company_name"),
	industry: text(),
	position: text(),
	expertise: text(),
	profileCompleted: boolean("profile_completed").default(false),
	enrollmentNumber: text("enrollment_number"),
	semester: text(),
	createdAt: timestamp("created_at", { mode: 'string' }).default(sql`CURRENT_TIMESTAMP`),
	updatedAt: timestamp("updated_at", { mode: 'string' }).default(sql`CURRENT_TIMESTAMP`),
}, (table) => [
	unique("users_username_key").on(table.username),
	check("users_role_check", sql`role = ANY (ARRAY['admin'::text, 'faculty'::text, 'student'::text, 'company'::text])`),
]);

export const resources = pgTable("resources", {
	id: serial().primaryKey().notNull(),
	title: text().notNull(),
	description: text().notNull(),
	url: text(),
	type: text().notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).default(sql`CURRENT_TIMESTAMP`),
	updatedAt: timestamp("updated_at", { mode: 'string' }).default(sql`CURRENT_TIMESTAMP`),
	createdBy: integer("created_by").notNull(),
}, (table) => [
	foreignKey({
			columns: [table.createdBy],
			foreignColumns: [users.id],
			name: "resources_created_by_fkey"
		}),
	check("resources_type_check", sql`type = ANY (ARRAY['guideline'::text, 'link'::text, 'file'::text])`),
]);

export const internships = pgTable("internships", {
	id: serial().primaryKey().notNull(),
	domainName: text("domain_name").notNull(),
	companyName: text("company_name").notNull(),
	requirements: text().notNull(),
	location: text().notNull(),
	type: text().notNull(),
	duration: text().notNull(),
	applicationDeadline: text("application_deadline").notNull(),
	stipend: text(),
	status: text().default('draft').notNull(),
	createdBy: integer("created_by").notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).default(sql`CURRENT_TIMESTAMP`),
	updatedAt: timestamp("updated_at", { mode: 'string' }).default(sql`CURRENT_TIMESTAMP`),
}, (table) => [
	foreignKey({
			columns: [table.createdBy],
			foreignColumns: [users.id],
			name: "internships_created_by_fkey"
		}),
	check("internships_type_check", sql`type = ANY (ARRAY['remote'::text, 'onsite'::text, 'hybrid'::text])`),
	check("internships_status_check", sql`status = ANY (ARRAY['active'::text, 'closed'::text, 'draft'::text])`),
]);

export const migrations = pgTable("migrations", {
	id: serial().primaryKey().notNull(),
	name: text().notNull(),
	appliedAt: timestamp("applied_at", { mode: 'string' }).default(sql`CURRENT_TIMESTAMP`),
}, (table) => [
	unique("migrations_name_key").on(table.name),
]);

export const documents = pgTable("documents", {
	id: serial().primaryKey().notNull(),
	userId: integer("user_id").notNull(),
	type: text().notNull(),
	status: text().default('pending'),
	filePath: text("file_path").notNull(),
	version: integer().default(1),
	createdAt: timestamp("created_at", { mode: 'string' }).default(sql`CURRENT_TIMESTAMP`),
	companyName: text("company_name"),
	internshipDomain: text("internship_domain"),
	filename: text().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "documents_user_id_fkey"
		}),
	check("documents_status_check", sql`status = ANY (ARRAY['draft'::text, 'submitted'::text, 'under_review'::text, 'approved'::text, 'rejected'::text])`),
	check("documents_type_check", sql`type = ANY (ARRAY['offer_letter'::text, 'monthly_report'::text, 'attendance'::text])`),
]);

export const internshipSkills = pgTable("internship_skills", {
	id: serial().primaryKey().notNull(),
	internshipId: integer("internship_id").notNull(),
	skill: text().notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).default(sql`CURRENT_TIMESTAMP`),
}, (table) => [
	foreignKey({
			columns: [table.internshipId],
			foreignColumns: [internships.id],
			name: "internship_skills_internship_id_fkey"
		}),
]);

export const internshipApplications = pgTable("internship_applications", {
	id: serial().primaryKey().notNull(),
	internshipId: integer("internship_id").notNull(),
	studentId: integer("student_id").notNull(),
	status: text().default('pending').notNull(),
	appliedAt: timestamp("applied_at", { mode: 'string' }).default(sql`CURRENT_TIMESTAMP`),
	updatedAt: timestamp("updated_at", { mode: 'string' }).default(sql`CURRENT_TIMESTAMP`),
	name: text(),
	email: text(),
	phone: text(),
	resumePath: text("resume_path"),
	feedback: text(),
}, (table) => [
	foreignKey({
			columns: [table.internshipId],
			foreignColumns: [internships.id],
			name: "internship_applications_internship_id_fkey"
		}),
	foreignKey({
			columns: [table.studentId],
			foreignColumns: [users.id],
			name: "internship_applications_student_id_fkey"
		}),
	check("internship_applications_status_check", sql`status = ANY (ARRAY['pending'::text, 'accepted'::text, 'rejected'::text, 'withdrawn'::text])`),
]);

export const techSessions = pgTable("tech_sessions", {
	id: serial().primaryKey().notNull(),
	title: text().notNull(),
	description: text().notNull(),
	date: timestamp({ mode: 'string' }).notNull(),
	startTime: text("start_time").notNull(),
	endTime: text("end_time").notNull(),
	location: text().notNull(),
	virtualMeetingLink: text("virtual_meeting_link"),
	capacity: integer().default(30),
	category: text().default('other'),
	facultyId: integer("faculty_id").notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).default(sql`CURRENT_TIMESTAMP`),
	updatedAt: timestamp("updated_at", { mode: 'string' }).default(sql`CURRENT_TIMESTAMP`),
	status: text().default('upcoming'),
}, (table) => [
	foreignKey({
			columns: [table.facultyId],
			foreignColumns: [users.id],
			name: "tech_sessions_faculty_id_fkey"
		}),
]);

export const sessionRegistrations = pgTable("session_registrations", {
	id: serial().primaryKey().notNull(),
	sessionId: integer("session_id").notNull(),
	studentId: integer("student_id").notNull(),
	registeredAt: timestamp("registered_at", { mode: 'string' }).default(sql`CURRENT_TIMESTAMP`),
	attended: boolean().default(false),
	feedback: text(),
	rating: integer(),
}, (table) => [
	foreignKey({
			columns: [table.sessionId],
			foreignColumns: [techSessions.id],
			name: "session_registrations_session_id_fkey"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.studentId],
			foreignColumns: [users.id],
			name: "session_registrations_student_id_fkey"
		}),
]);

export const allocations = pgTable("allocations", {
	id: serial().primaryKey().notNull(),
	facultyId: integer("faculty_id").notNull(),
	studentId: integer("student_id").notNull(),
	status: text().default('pending').notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).default(sql`CURRENT_TIMESTAMP`),
	updatedAt: timestamp("updated_at", { mode: 'string' }).default(sql`CURRENT_TIMESTAMP`),
}, (table) => [
	foreignKey({
			columns: [table.facultyId],
			foreignColumns: [users.id],
			name: "allocations_faculty_id_fkey"
		}),
	foreignKey({
			columns: [table.studentId],
			foreignColumns: [users.id],
			name: "allocations_student_id_fkey"
		}),
	unique("allocations_faculty_id_student_id_key").on(table.facultyId, table.studentId),
]);
