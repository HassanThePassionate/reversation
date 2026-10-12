-- CreateIndex
CREATE INDEX "reservations_status_startTime_endTime_idx" ON "reservations"("status", "startTime", "endTime");

-- CreateIndex
CREATE INDEX "reservations_userId_status_startTime_idx" ON "reservations"("userId", "status", "startTime");

-- CreateIndex
CREATE INDEX "resources_isActive_name_idx" ON "resources"("isActive", "name");
