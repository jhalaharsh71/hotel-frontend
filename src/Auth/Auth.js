export const getToken = () => {
  return localStorage.getItem("admin_token");
};

export const getRole = () => {
  return localStorage.getItem("role");
};

export const isAuthenticated = () => {
  const token = getToken();
  return token !== null && token !== "";
};

export const isAdmin = () => {
  const role = getRole();
  return role === "admin" || role === "super_admin";
};

export const isSuperAdmin = () => {
  return getRole() === "super_admin";
};

export const logout = () => {
  localStorage.removeItem("admin_token");
  localStorage.removeItem("role");
};

export const saveAuth = (token, role) => {
  localStorage.setItem("admin_token", token);
  localStorage.setItem("role", role);
};
