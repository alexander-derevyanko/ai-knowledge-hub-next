
-- Rename enum types
ALTER TYPE "OrganizationRole" RENAME TO "organization_role";
ALTER TYPE "DocumentCategory" RENAME TO "document_category";
ALTER TYPE "DocumentType" RENAME TO "document_type";
ALTER TYPE "DocumentStatus" RENAME TO "document_status";

-- Rename tables
ALTER TABLE "User" RENAME TO "users";
ALTER TABLE "Organization" RENAME TO "organizations";
ALTER TABLE "OrganizationMember" RENAME TO "organization_members";
ALTER TABLE "Document" RENAME TO "documents";

-- Rename columns in users
ALTER TABLE "users" RENAME COLUMN "passwordHash" TO "password_hash";
ALTER TABLE "users" RENAME COLUMN "createdAt" TO "created_at";
ALTER TABLE "users" RENAME COLUMN "updatedAt" TO "updated_at";

-- Rename columns in organizations
ALTER TABLE "organizations" RENAME COLUMN "createdAt" TO "created_at";
ALTER TABLE "organizations" RENAME COLUMN "updatedAt" TO "updated_at";

-- Rename columns in organization_members
ALTER TABLE "organization_members" RENAME COLUMN "userId" TO "user_id";
ALTER TABLE "organization_members" RENAME COLUMN "organizationId" TO "organization_id";
ALTER TABLE "organization_members" RENAME COLUMN "joinedAt" TO "joined_at";

-- Rename columns in documents
ALTER TABLE "documents" RENAME COLUMN "fileName" TO "file_name";
ALTER TABLE "documents" RENAME COLUMN "mimeType" TO "mime_type";
ALTER TABLE "documents" RENAME COLUMN "sizeBytes" TO "size_bytes";
ALTER TABLE "documents" RENAME COLUMN "storageKey" TO "storage_key";
ALTER TABLE "documents" RENAME COLUMN "organizationId" TO "organization_id";
ALTER TABLE "documents" RENAME COLUMN "uploadedById" TO "uploaded_by_id";
ALTER TABLE "documents" RENAME COLUMN "createdAt" TO "created_at";
ALTER TABLE "documents" RENAME COLUMN "updatedAt" TO "updated_at";

-- Rename primary key constraints
ALTER TABLE "users"
  RENAME CONSTRAINT "User_pkey" TO "users_pkey";

ALTER TABLE "organizations"
  RENAME CONSTRAINT "Organization_pkey" TO "organizations_pkey";

ALTER TABLE "organization_members"
  RENAME CONSTRAINT "OrganizationMember_pkey" TO "organization_members_pkey";

ALTER TABLE "documents"
  RENAME CONSTRAINT "Document_pkey" TO "documents_pkey";

-- Rename foreign key constraints
ALTER TABLE "organization_members"
  RENAME CONSTRAINT "OrganizationMember_userId_fkey"
  TO "organization_members_user_id_fkey";

ALTER TABLE "organization_members"
  RENAME CONSTRAINT "OrganizationMember_organizationId_fkey"
  TO "organization_members_organization_id_fkey";

ALTER TABLE "documents"
  RENAME CONSTRAINT "Document_organizationId_fkey"
  TO "documents_organization_id_fkey";

ALTER TABLE "documents"
  RENAME CONSTRAINT "Document_uploadedById_fkey"
  TO "documents_uploaded_by_id_fkey";

-- Rename unique indexes
ALTER INDEX "User_email_key"
  RENAME TO "users_email_key";

ALTER INDEX "Organization_slug_key"
  RENAME TO "organizations_slug_key";

ALTER INDEX "OrganizationMember_userId_organizationId_key"
  RENAME TO "organization_members_user_id_organization_id_key";

-- Rename regular indexes
ALTER INDEX "OrganizationMember_organizationId_idx"
  RENAME TO "organization_members_organization_id_idx";

ALTER INDEX "Document_organizationId_createdAt_idx"
  RENAME TO "documents_organization_id_created_at_idx";

ALTER INDEX "Document_organizationId_status_idx"
  RENAME TO "documents_organization_id_status_idx";
