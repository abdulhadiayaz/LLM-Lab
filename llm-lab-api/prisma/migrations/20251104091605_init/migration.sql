-- CreateTable
CREATE TABLE "experiments" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "prompt" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "responses" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "experimentId" TEXT NOT NULL,
    "temperature" REAL NOT NULL,
    "topP" REAL NOT NULL,
    "topK" INTEGER,
    "maxTokens" INTEGER,
    "content" TEXT NOT NULL,
    "rawResponse" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "responses_experimentId_fkey" FOREIGN KEY ("experimentId") REFERENCES "experiments" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "response_metrics" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "responseId" TEXT NOT NULL,
    "coherenceScore" REAL NOT NULL,
    "completenessScore" REAL NOT NULL,
    "lengthScore" REAL NOT NULL,
    "readabilityScore" REAL NOT NULL,
    "structureScore" REAL NOT NULL,
    "overallScore" REAL NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "response_metrics_responseId_fkey" FOREIGN KEY ("responseId") REFERENCES "responses" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "response_metrics_responseId_key" ON "response_metrics"("responseId");
