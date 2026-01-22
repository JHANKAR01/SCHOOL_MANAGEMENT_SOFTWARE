# UI & Layout Patterns

## 1. Dashboard Layouts
* **Mandatory Wrapper:** ALL Dashboard Entry Screens (e.g., `TeacherDashboard`, `StudentDashboard`, `ParentDashboard`) **MUST** be wrapped in the `<DashboardShell>` component.
* **Path:** Import from `packages/app/components/DashboardShell`.
* **Never** leave a dashboard screen as a raw `<View>` or `<SafeAreaView>`. It must inherit the global navigation structure.

## 2. Component Hierarchy
* **Screens:** Top-level views (in `features/`) that take up the full page.
* **Layouts:** Wrappers like `DashboardShell` that provide navigation/headers.
* **Components:** Reusable UI bits (Buttons, Cards) inside `packages/ui/`.
