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
