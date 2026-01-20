-- CreateIndex
CREATE INDEX "BookLoan_status_idx" ON "BookLoan"("status");

-- CreateIndex
CREATE INDEX "BookLoan_due_date_idx" ON "BookLoan"("due_date");

-- CreateIndex
CREATE INDEX "Expense_date_idx" ON "Expense"("date");

-- CreateIndex
CREATE INDEX "GateLog_entry_time_idx" ON "GateLog"("entry_time");

-- CreateIndex
CREATE INDEX "GateLog_status_idx" ON "GateLog"("status");

-- CreateIndex
CREATE INDEX "GateLog_person_type_idx" ON "GateLog"("person_type");

-- CreateIndex
CREATE INDEX "Homework_status_idx" ON "Homework"("status");

-- CreateIndex
CREATE INDEX "Homework_due_date_idx" ON "Homework"("due_date");

-- CreateIndex
CREATE INDEX "Inquiry_status_idx" ON "Inquiry"("status");

-- CreateIndex
CREATE INDEX "Invoice_status_idx" ON "Invoice"("status");

-- CreateIndex
CREATE INDEX "Invoice_due_date_idx" ON "Invoice"("due_date");

-- CreateIndex
CREATE INDEX "LeaveApplication_user_id_idx" ON "LeaveApplication"("user_id");

-- CreateIndex
CREATE INDEX "LeaveApplication_status_idx" ON "LeaveApplication"("status");

-- CreateIndex
CREATE INDEX "LeaveApplication_start_date_idx" ON "LeaveApplication"("start_date");

-- CreateIndex
CREATE INDEX "LiveClass_teacher_id_idx" ON "LiveClass"("teacher_id");

-- CreateIndex
CREATE INDEX "LiveClass_is_active_idx" ON "LiveClass"("is_active");

-- CreateIndex
CREATE INDEX "Syllabus_teacher_id_idx" ON "Syllabus"("teacher_id");

-- CreateIndex
CREATE INDEX "Syllabus_status_idx" ON "Syllabus"("status");

-- CreateIndex
CREATE INDEX "Ticket_reported_by_idx" ON "Ticket"("reported_by");

-- CreateIndex
CREATE INDEX "Ticket_status_idx" ON "Ticket"("status");

-- CreateIndex
CREATE INDEX "Ticket_priority_idx" ON "Ticket"("priority");
