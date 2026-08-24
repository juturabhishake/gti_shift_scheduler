import SecureLS from "secure-ls";

export function getStoredAuth() {
  try {
    const ls = new SecureLS({ encodingType: "aes" });
    return {
      employeeId: ls.get("employee_id"),
      password: ls.get("password"),
      fullName: ls.get("full_name"),
      role: ls.get("role"),
      department: ls.get("department"),
    };
  } catch (error) {
    console.warn("Unable to read stored credentials", error);
    return null;
  }
}

export function clearStoredAuth() {
  try {
    const ls = new SecureLS({ encodingType: "aes" });
    ["employee_id", "password", "full_name", "role", "department"].forEach((key) => ls.remove(key));
  } catch (error) {
    console.warn("Unable to clear stored credentials", error);
  }
}

export function redirectToLogin() {
  clearStoredAuth();
  window.location.replace("/");
}