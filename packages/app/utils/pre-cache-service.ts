// packages/app/utils/pre-cache-service.ts
// Pre-caching service for offline-first Teacher Dashboard
// Runs on app launch to ensure data is available for classroom usage

import { getStorageAdapter, TimetableSlot, StudentRoster } from './storage-adapter';

// ============================================================================
// TYPES
// ============================================================================

interface PreCacheResult {
    success: boolean;
    classesLoaded: number;
    studentsLoaded: number;
    errors: string[];
}

interface TimetableResponse {
    id: string;
    classId: string;
    className: string;
    subjectId: string;
    subjectName: string;
    period: number;
    startTime: string;
    endTime: string;
    dayOfWeek: number;
}

// ============================================================================
// PRE-CACHE FUNCTION
// ============================================================================

/**
 * Pre-cache teacher data for the current day
 * Call this on app launch or via background fetch
 *
 * @param authToken - Bearer token for API authentication
 * @returns PreCacheResult with status
 */
export async function preCacheTeacherData(authToken?: string): Promise<PreCacheResult> {
    const storage = getStorageAdapter();
    const errors: string[] = [];
    let classesLoaded = 0;
    let studentsLoaded = 0;

    const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        'X-User-Id': 'usr_staff_0068', // <--- TEMP FIX
        'X-School-Id': 'sch_123'       // <--- TEMP FIX
    };

    if (authToken) {
        headers['Authorization'] = `Bearer ${authToken}`;
    }

    try {
        // 1. Fetch today's timetable
        console.log('[PreCache] Fetching timetable...');
        const timetableResponse = await fetch('/api/teacher/my-classes-today', { headers });

        if (!timetableResponse.ok) {
            errors.push(`Failed to fetch timetable: ${timetableResponse.status}`);
        } else {
            const timetableData: TimetableResponse[] = await timetableResponse.json();
            const today = new Date().getDay();

            // Convert to TimetableSlot format
            const slots: TimetableSlot[] = timetableData.map(item => ({
                id: item.id,
                classId: item.classId,
                className: item.className,
                subjectId: item.subjectId,
                subjectName: item.subjectName,
                period: item.period,
                startTime: item.startTime,
                endTime: item.endTime,
                dayOfWeek: today,
            }));

            await storage.saveTimetable(slots);
            classesLoaded = slots.length;
            console.log(`[PreCache] Cached ${classesLoaded} class slots`);

            // 2. For each class, fetch student roster
            const uniqueClassIds = [...new Set(slots.map(s => s.classId))];

            for (const classId of uniqueClassIds) {
                try {
                    console.log(`[PreCache] Fetching roster for class ${classId}...`);
                    const rosterResponse = await fetch(
                        `/api/teacher/class/${classId}/students`,
                        { headers }
                    );

                    if (rosterResponse.ok) {
                        const students: StudentRoster[] = await rosterResponse.json();
                        await storage.saveStudentRoster(classId, students);
                        studentsLoaded += students.length;
                        console.log(`[PreCache] Cached ${students.length} students for class ${classId}`);
                    } else {
                        errors.push(`Failed to fetch roster for ${classId}: ${rosterResponse.status}`);
                    }
                } catch (err) {
                    errors.push(`Error fetching roster for ${classId}: ${err}`);
                }
            }
        }
    } catch (err) {
        errors.push(`Pre-cache failed: ${err}`);
        console.error('[PreCache] Fatal error:', err);
    }

    return {
        success: errors.length === 0,
        classesLoaded,
        studentsLoaded,
        errors,
    };
}

/**
 * Check if pre-cached data exists for today
 */
export async function hasPreCachedData(): Promise<boolean> {
    const storage = getStorageAdapter();
    const timetable = await storage.getTodayTimetable();
    return timetable.length > 0;
}

/**
 * Clear all pre-cached data
 */
export async function clearPreCachedData(): Promise<void> {
    const storage = getStorageAdapter();
    await storage.clear();
}

/**
 * Get pre-cached timetable for quick access
 */
export async function getCachedTimetable(): Promise<TimetableSlot[]> {
    const storage = getStorageAdapter();
    return storage.getTodayTimetable();
}

/**
 * Get pre-cached student roster for a class
 */
export async function getCachedStudentRoster(classId: string): Promise<StudentRoster[]> {
    const storage = getStorageAdapter();
    return storage.getStudentRoster(classId);
}
