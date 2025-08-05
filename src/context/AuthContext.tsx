// import React, {
//   createContext,
//   useContext,
//   useState,
//   useEffect,
//   ReactNode,
// } from "react";

// type Role = "admin" | "vendor";
// type AuthMode = "login" | "signup" | "forgot-password" | "otp-verification";

// interface User {
//   role: Role;
//   // Add other user fields if needed
// }

// interface AuthContextProps {
//   isAuthenticated: boolean;
//   authMode: AuthMode;
//   otpEmail: string;
//   userRole: Role;
//   setAuthMode: (mode: AuthMode) => void;
//   setOtpEmail: (email: string) => void;
//   handleLogin: () => void;
//   handleSignup: () => void;
//   handleOTPVerified: (token: string, user: User) => void;
//   handleRoleSelect: (role: Role) => void;
//   handleLogout: () => void;
// }

// const AuthContext = createContext<AuthContextProps | undefined>(undefined);

// export const AuthProvider = ({ children }: { children: ReactNode }) => {
//   const [isAuthenticated, setIsAuthenticated] = useState(false);
//   const [authMode, setAuthMode] = useState<AuthMode>("login");
//   const [otpEmail, setOtpEmail] = useState("");
//   const [userRole, setUserRole] = useState<Role>(
//     (localStorage.getItem("user_role") as Role) || "admin"
//   );

//   useEffect(() => {
//     const token = localStorage.getItem("auth_token");
//     const savedRole = localStorage.getItem("user_role");
//     if (token && savedRole) {
//       setIsAuthenticated(true);
//       setUserRole(savedRole as Role);
//     }
//   }, []);

//   const handleLogin = () => {
//     setIsAuthenticated(true);
//     setAuthMode("login");
//   };

//   const handleSignup = () => {
//     setIsAuthenticated(true);
//     setAuthMode("login");
//   };

//   const handleOTPVerified = (token: string, user: User) => {
//     localStorage.setItem("auth_token", token);
//     const userRole = user.role.toLowerCase();
//     if (userRole === "admin" || userRole === "vendor") {
//       setUserRole(userRole as Role);
//       localStorage.setItem("user_role", userRole);
//     } else {
//       console.warn(`Unexpected user role: ${user.role}, defaulting to vendor`);
//       setUserRole("vendor");
//       localStorage.setItem("user_role", "vendor");
//     }
//     setIsAuthenticated(true);
//     setAuthMode("login");
//   };

//   const handleRoleSelect = (role: Role) => {
//     setUserRole(role);
//     localStorage.setItem("user_role", role);
//   };

//   const handleLogout = () => {
//     localStorage.removeItem("auth_token");
//     localStorage.removeItem("user_role");
//     setIsAuthenticated(false);
//     setAuthMode("login");
//     setUserRole("admin");
//   };

//   return (
//     <AuthContext.Provider
//       value={{
//         isAuthenticated,
//         authMode,
//         otpEmail,
//         userRole,
//         setAuthMode,
//         setOtpEmail,
//         handleLogin,
//         handleSignup,
//         handleOTPVerified,
//         handleRoleSelect,
//         handleLogout,
//       }}
//     >
//       {children}
//     </AuthContext.Provider>
//   );
// };

// export const useAuth = () => {
//   const context = useContext(AuthContext);
//   if (!context) {
//     throw new Error("useAuth must be used within an AuthProvider");
//   }
//   return context;
// };
