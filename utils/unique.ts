/**
 * Generates a unique last name by appending a timestamp-based suffix to a prefix.
 *
 * OrangeHRM permits duplicate employee names, so uniqueness is only needed to keep
 * a freshly created employee's name predictable for a follow-up search (so the
 * result set stays deterministic). Pure helper logic — no locators or page state.
 */
export function uniqueLastName(prefix = 'Reg'): string {
  return `${prefix}${Date.now()}`;
}

/**
 * Generates a system-user username as `<prefix><n>` where n is a random integer 1-99.
 *
 * OrangeHRM rejects duplicate usernames, and the teardown project removes each run's
 * user (deleting the employee cascades to the linked system user), so the small range
 * is enough in practice. Widen the range or append a timestamp if aborted runs start
 * leaving collisions behind.
 */
export function randomUsername(prefix = 'PWtest'): string {
  return `${prefix}${Math.floor(Math.random() * 99) + 1}`;
}

/**
 * Generates a random 4-digit employee id (1000-9999) as a string.
 *
 * The PIM employees endpoint requires `employeeId` to be unique across the instance.
 * 4 digits gives ~9000 values, which is sufficient for this suite; widen to 5+ digits
 * if the POST starts failing with "Employee Id already exists".
 */
export function randomEmployeeId(): string {
  return String(Math.floor(Math.random() * 9000) + 1000);
}
