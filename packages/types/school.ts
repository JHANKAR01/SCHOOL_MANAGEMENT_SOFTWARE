// packages/types/school.ts
// School configuration types

export interface SchoolConfig {
    school_id: string;
    name: string;
    logo_url: string;
    primary_color: string;
    features: {
        attendance: boolean;
        fees: boolean;
        transport: boolean;
        library: boolean;
        hostel: boolean;
    };
    location: {
        lat: number;
        lng: number;
    };
    upi_vpa: string;
}
