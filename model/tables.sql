CREATE TABLE "testimonials" (
    "id" SERIAL,
    "user_id" INTEGER NOT NULL,
    "author" VARCHAR(250) NULL,
    "text" TEXT NULL,
    CONSTRAINT "PK_testimonials" PRIMARY KEY ("id")
);

CREATE TABLE "users" (
    "id" SERIAL,
    "name" VARCHAR(250) NULL,
    "title" VARCHAR(250) NOT NULL,
    "email" VARCHAR(250) NULL,
    "mobile" CHARACTER(20) NULL,
    "portfolio_link" VARCHAR(250) NULL,
    "skill_summary" TEXT NULL,
    "experience_years" TEXT NULL,
    "experience_details" TEXT NULL,
    "experience_clients" TEXT NULL,
    "additional_info" TEXT NULL,
    CONSTRAINT "PK_users" PRIMARY KEY ("id")
);