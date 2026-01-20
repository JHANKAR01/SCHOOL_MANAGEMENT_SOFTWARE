// packages/types/academics.ts
// Academic types (attendance, exams, results)

export interface AttendanceRecord {
    id: string;
    student_id: string;
    date: string;
    status: 'PRESENT' | 'ABSENT' | 'LATE';
    synced: boolean;
}

export interface ExamComponent {
    id: string;
    name: string;
    maxMarks: number;
    weightage: number;
}

export interface StudentResult {
    studentId: string;
    studentName: string;
    marks: Record<string, number>;
}
