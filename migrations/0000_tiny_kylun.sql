-- Current sql file was generated after introspecting the database
-- If you want to run this migration please uncomment this code before executing migrations
/*
CREATE TABLE "faculty_allocations" (
	"id" serial PRIMARY KEY NOT NULL,
	"faculty_id" integer NOT NULL,
	"student_id" integer NOT NULL,
	"status" text DEFAULT 'active',
	CONSTRAINT "faculty_allocations_status_check" CHECK (status = ANY (ARRAY['active'::text, 'completed'::text]))
);
--> statement-breakpoint
CREATE TABLE "password_reset_tokens" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"token" text NOT NULL,
	"expires_at" timestamp NOT NULL,
	"created_at" timestamp DEFAULT CURRENT_TIMESTAMP,
	"used_at" timestamp,
	CONSTRAINT "password_reset_tokens_token_key" UNIQUE("token")
);
--> statement-breakpoint
CREATE TABLE "email_verification_tokens" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"token" text NOT NULL,
	"expires_at" timestamp NOT NULL,
	"created_at" timestamp DEFAULT CURRENT_TIMESTAMP,
	"used_at" timestamp,
	CONSTRAINT "email_verification_tokens_token_key" UNIQUE("token")
);
--> statement-breakpoint
CREATE TABLE "faculty_documents" (
	"id" serial PRIMARY KEY NOT NULL,
	"faculty_id" integer NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"file_path" text NOT NULL,
	"created_at" timestamp DEFAULT CURRENT_TIMESTAMP
);
--> statement-breakpoint
CREATE TABLE "document_feedback" (
	"id" serial PRIMARY KEY NOT NULL,
	"document_id" integer NOT NULL,
	"faculty_id" integer NOT NULL,
	"feedback" text NOT NULL,
	"rating" integer,
	"created_at" timestamp DEFAULT CURRENT_TIMESTAMP,
	"updated_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"username" text NOT NULL,
	"password" text NOT NULL,
	"role" text NOT NULL,
	"name" text NOT NULL,
	"email" text,
	"email_verified" boolean DEFAULT false,
	"phone" text,
	"university" text,
	"department" text,
	"year" text,
	"bio" text,
	"company_name" text,
	"industry" text,
	"position" text,
	"expertise" text,
	"profile_completed" boolean DEFAULT false,
	"enrollment_number" text,
	"semester" text,
	"created_at" timestamp DEFAULT CURRENT_TIMESTAMP,
	"updated_at" timestamp DEFAULT CURRENT_TIMESTAMP,
	CONSTRAINT "users_username_key" UNIQUE("username"),
	CONSTRAINT "users_role_check" CHECK (role = ANY (ARRAY['admin'::text, 'faculty'::text, 'student'::text, 'company'::text]))
);
--> statement-breakpoint
CREATE TABLE "resources" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"description" text NOT NULL,
	"url" text,
	"type" text NOT NULL,
	"created_at" timestamp DEFAULT CURRENT_TIMESTAMP,
	"updated_at" timestamp DEFAULT CURRENT_TIMESTAMP,
	"created_by" integer NOT NULL,
	CONSTRAINT "resources_type_check" CHECK (type = ANY (ARRAY['guideline'::text, 'link'::text, 'file'::text]))
);
--> statement-breakpoint
CREATE TABLE "internships" (
	"id" serial PRIMARY KEY NOT NULL,
	"domain_name" text NOT NULL,
	"company_name" text NOT NULL,
	"requirements" text NOT NULL,
	"location" text NOT NULL,
	"type" text NOT NULL,
	"duration" text NOT NULL,
	"application_deadline" text NOT NULL,
	"stipend" text,
	"status" text DEFAULT 'draft' NOT NULL,
	"created_by" integer NOT NULL,
	"created_at" timestamp DEFAULT CURRENT_TIMESTAMP,
	"updated_at" timestamp DEFAULT CURRENT_TIMESTAMP,
	CONSTRAINT "internships_type_check" CHECK (type = ANY (ARRAY['remote'::text, 'onsite'::text, 'hybrid'::text])),
	CONSTRAINT "internships_status_check" CHECK (status = ANY (ARRAY['active'::text, 'closed'::text, 'draft'::text]))
);
--> statement-breakpoint
CREATE TABLE "migrations" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"applied_at" timestamp DEFAULT CURRENT_TIMESTAMP,
	CONSTRAINT "migrations_name_key" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE "documents" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"type" text NOT NULL,
	"status" text DEFAULT 'pending',
	"file_path" text NOT NULL,
	"version" integer DEFAULT 1,
	"created_at" timestamp DEFAULT CURRENT_TIMESTAMP,
	"company_name" text,
	"internship_domain" text,
	"filename" text NOT NULL,
	CONSTRAINT "documents_status_check" CHECK (status = ANY (ARRAY['draft'::text, 'submitted'::text, 'under_review'::text, 'approved'::text, 'rejected'::text])),
	CONSTRAINT "documents_type_check" CHECK (type = ANY (ARRAY['offer_letter'::text, 'monthly_report'::text, 'attendance'::text]))
);
--> statement-breakpoint
CREATE TABLE "internship_skills" (
	"id" serial PRIMARY KEY NOT NULL,
	"internship_id" integer NOT NULL,
	"skill" text NOT NULL,
	"created_at" timestamp DEFAULT CURRENT_TIMESTAMP
);
--> statement-breakpoint
CREATE TABLE "internship_applications" (
	"id" serial PRIMARY KEY NOT NULL,
	"internship_id" integer NOT NULL,
	"student_id" integer NOT NULL,
	"status" text DEFAULT 'pending' NOT NULL,
	"applied_at" timestamp DEFAULT CURRENT_TIMESTAMP,
	"updated_at" timestamp DEFAULT CURRENT_TIMESTAMP,
	"name" text,
	"email" text,
	"phone" text,
	"resume_path" text,
	"feedback" text,
	CONSTRAINT "internship_applications_status_check" CHECK (status = ANY (ARRAY['pending'::text, 'accepted'::text, 'rejected'::text, 'withdrawn'::text]))
);
--> statement-breakpoint
CREATE TABLE "tech_sessions" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"description" text NOT NULL,
	"date" timestamp NOT NULL,
	"start_time" text NOT NULL,
	"end_time" text NOT NULL,
	"location" text NOT NULL,
	"virtual_meeting_link" text,
	"capacity" integer DEFAULT 30,
	"category" text DEFAULT 'other',
	"faculty_id" integer NOT NULL,
	"created_at" timestamp DEFAULT CURRENT_TIMESTAMP,
	"updated_at" timestamp DEFAULT CURRENT_TIMESTAMP,
	"status" text DEFAULT 'upcoming'
);
--> statement-breakpoint
CREATE TABLE "session_registrations" (
	"id" serial PRIMARY KEY NOT NULL,
	"session_id" integer NOT NULL,
	"student_id" integer NOT NULL,
	"registered_at" timestamp DEFAULT CURRENT_TIMESTAMP,
	"attended" boolean DEFAULT false,
	"feedback" text,
	"rating" integer
);
--> statement-breakpoint
CREATE TABLE "allocations" (
	"id" serial PRIMARY KEY NOT NULL,
	"faculty_id" integer NOT NULL,
	"student_id" integer NOT NULL,
	"status" text DEFAULT 'pending' NOT NULL,
	"created_at" timestamp DEFAULT CURRENT_TIMESTAMP,
	"updated_at" timestamp DEFAULT CURRENT_TIMESTAMP,
	CONSTRAINT "allocations_faculty_id_student_id_key" UNIQUE("faculty_id","student_id")
);
--> statement-breakpoint
ALTER TABLE "faculty_allocations" ADD CONSTRAINT "faculty_allocations_faculty_id_fkey" FOREIGN KEY ("faculty_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "faculty_allocations" ADD CONSTRAINT "faculty_allocations_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "password_reset_tokens" ADD CONSTRAINT "password_reset_tokens_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "email_verification_tokens" ADD CONSTRAINT "email_verification_tokens_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "faculty_documents" ADD CONSTRAINT "faculty_documents_faculty_id_fkey" FOREIGN KEY ("faculty_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "document_feedback" ADD CONSTRAINT "document_feedback_document_id_fkey" FOREIGN KEY ("document_id") REFERENCES "public"."documents"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "document_feedback" ADD CONSTRAINT "document_feedback_faculty_id_fkey" FOREIGN KEY ("faculty_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "resources" ADD CONSTRAINT "resources_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "internships" ADD CONSTRAINT "internships_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "documents" ADD CONSTRAINT "documents_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "internship_skills" ADD CONSTRAINT "internship_skills_internship_id_fkey" FOREIGN KEY ("internship_id") REFERENCES "public"."internships"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "internship_applications" ADD CONSTRAINT "internship_applications_internship_id_fkey" FOREIGN KEY ("internship_id") REFERENCES "public"."internships"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "internship_applications" ADD CONSTRAINT "internship_applications_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tech_sessions" ADD CONSTRAINT "tech_sessions_faculty_id_fkey" FOREIGN KEY ("faculty_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "session_registrations" ADD CONSTRAINT "session_registrations_session_id_fkey" FOREIGN KEY ("session_id") REFERENCES "public"."tech_sessions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "session_registrations" ADD CONSTRAINT "session_registrations_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "allocations" ADD CONSTRAINT "allocations_faculty_id_fkey" FOREIGN KEY ("faculty_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "allocations" ADD CONSTRAINT "allocations_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
*/