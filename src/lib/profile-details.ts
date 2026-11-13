export function registrationLabel(type: unknown) {
  return type === "teacher" ? "Teacher registration number" : type === "staff" ? "Staff ID / registration number" : "Student SRN";
}
export function validRegistration(value: string) {
  return value.trim().length > 0 && value.trim().length <= 50;
}