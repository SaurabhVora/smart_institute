import { relations } from "drizzle-orm/relations";
import { users, facultyAllocations, passwordResetTokens, emailVerificationTokens, facultyDocuments, documents, documentFeedback, resources, internships, internshipSkills, internshipApplications, techSessions, sessionRegistrations, allocations } from "./schema";

export const facultyAllocationsRelations = relations(facultyAllocations, ({one}) => ({
	user_facultyId: one(users, {
		fields: [facultyAllocations.facultyId],
		references: [users.id],
		relationName: "facultyAllocations_facultyId_users_id"
	}),
	user_studentId: one(users, {
		fields: [facultyAllocations.studentId],
		references: [users.id],
		relationName: "facultyAllocations_studentId_users_id"
	}),
}));

export const usersRelations = relations(users, ({many}) => ({
	facultyAllocations_facultyId: many(facultyAllocations, {
		relationName: "facultyAllocations_facultyId_users_id"
	}),
	facultyAllocations_studentId: many(facultyAllocations, {
		relationName: "facultyAllocations_studentId_users_id"
	}),
	passwordResetTokens: many(passwordResetTokens),
	emailVerificationTokens: many(emailVerificationTokens),
	facultyDocuments: many(facultyDocuments),
	documentFeedbacks: many(documentFeedback),
	resources: many(resources),
	internships: many(internships),
	documents: many(documents),
	internshipApplications: many(internshipApplications),
	techSessions: many(techSessions),
	sessionRegistrations: many(sessionRegistrations),
	allocations_facultyId: many(allocations, {
		relationName: "allocations_facultyId_users_id"
	}),
	allocations_studentId: many(allocations, {
		relationName: "allocations_studentId_users_id"
	}),
}));

export const passwordResetTokensRelations = relations(passwordResetTokens, ({one}) => ({
	user: one(users, {
		fields: [passwordResetTokens.userId],
		references: [users.id]
	}),
}));

export const emailVerificationTokensRelations = relations(emailVerificationTokens, ({one}) => ({
	user: one(users, {
		fields: [emailVerificationTokens.userId],
		references: [users.id]
	}),
}));

export const facultyDocumentsRelations = relations(facultyDocuments, ({one}) => ({
	user: one(users, {
		fields: [facultyDocuments.facultyId],
		references: [users.id]
	}),
}));

export const documentFeedbackRelations = relations(documentFeedback, ({one}) => ({
	document: one(documents, {
		fields: [documentFeedback.documentId],
		references: [documents.id]
	}),
	user: one(users, {
		fields: [documentFeedback.facultyId],
		references: [users.id]
	}),
}));

export const documentsRelations = relations(documents, ({one, many}) => ({
	documentFeedbacks: many(documentFeedback),
	user: one(users, {
		fields: [documents.userId],
		references: [users.id]
	}),
}));

export const resourcesRelations = relations(resources, ({one}) => ({
	user: one(users, {
		fields: [resources.createdBy],
		references: [users.id]
	}),
}));

export const internshipsRelations = relations(internships, ({one, many}) => ({
	user: one(users, {
		fields: [internships.createdBy],
		references: [users.id]
	}),
	internshipSkills: many(internshipSkills),
	internshipApplications: many(internshipApplications),
}));

export const internshipSkillsRelations = relations(internshipSkills, ({one}) => ({
	internship: one(internships, {
		fields: [internshipSkills.internshipId],
		references: [internships.id]
	}),
}));

export const internshipApplicationsRelations = relations(internshipApplications, ({one}) => ({
	internship: one(internships, {
		fields: [internshipApplications.internshipId],
		references: [internships.id]
	}),
	user: one(users, {
		fields: [internshipApplications.studentId],
		references: [users.id]
	}),
}));

export const techSessionsRelations = relations(techSessions, ({one, many}) => ({
	user: one(users, {
		fields: [techSessions.facultyId],
		references: [users.id]
	}),
	sessionRegistrations: many(sessionRegistrations),
}));

export const sessionRegistrationsRelations = relations(sessionRegistrations, ({one}) => ({
	techSession: one(techSessions, {
		fields: [sessionRegistrations.sessionId],
		references: [techSessions.id]
	}),
	user: one(users, {
		fields: [sessionRegistrations.studentId],
		references: [users.id]
	}),
}));

export const allocationsRelations = relations(allocations, ({one}) => ({
	user_facultyId: one(users, {
		fields: [allocations.facultyId],
		references: [users.id],
		relationName: "allocations_facultyId_users_id"
	}),
	user_studentId: one(users, {
		fields: [allocations.studentId],
		references: [users.id],
		relationName: "allocations_studentId_users_id"
	}),
}));