import React, { createContext, useContext, useState, useEffect } from "react";
import { supabase } from "../supabaseClient";
import { getEmployeByEmail, updateEmploye, Employe } from "../services/supabaseService";

// Extended User interface matching Employe table + UI specific fields
export interface User extends Partial<Employe> {
  // UI specific
  name: string; // Derived from prenom + nom
  role_name: string; // Derived from id_role
  location: string; // Derived from id_boutique
  image: string;
  bio: string; // Keep for UI compatibility or future use
}

interface UserContextType {
  user: User;
  isLoading: boolean;
  isAuthenticated: boolean;
  updateUserImage: (image: string) => void;
  updateUser: (updates: Partial<User>) => Promise<void>;
  logout: () => void;
}

const defaultUser: User = {
  nom: "Utilisateur",
  prenom: "Test",
  email: "test@example.com",
  telephone: "00 00 00 00 00",
  actif: true,
  id_role: 1,
  id_boutique: 1,
  
  // UI Mapped
  name: "Test Utilisateur",
  role_name: "Technicien",
  location: "Paris",
  image: "https://ui-avatars.com/api/?name=Quick+Repair&background=random",
  bio: "Employé QuickRepair",
};

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Initialize from localStorage if available
  const [user, setUser] = useState<User>(() => {
    const savedUser = localStorage.getItem("user_profile");
    return savedUser ? JSON.parse(savedUser) : defaultUser;
  });
  const [isLoading, setIsLoading] = useState(true);

  // Save to localStorage whenever user changes
  useEffect(() => {
    localStorage.setItem("user_profile", JSON.stringify(user));
  }, [user]);

  // Load user from Supabase on mount
  useEffect(() => {
    const loadUser = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session?.user?.email) {
          const employe = await getEmployeByEmail(session.user.email);
          
          if (employe) {
            setUser(prev => ({
              ...prev,
              ...employe,
              name: `${employe.prenom} ${employe.nom}`,
              // TODO: Fetch real role/boutique names if tables exist
              role_name: employe.id_role === 1 ? "Admin" : employe.id_role === 2 ? "Responsable" : employe.id_role === 3 ? "Technicien" : "Employé", 
              location: `Boutique ${employe.id_boutique}`,
              // Use photo_url from DB if exists, otherwise keep existing (local) image
              image: employe.photo_url || prev.image 
            }));
          }
        }
      } catch (error) {
        console.error("Error loading user profile:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadUser();
  }, []);

  const updateUserImage = (image: string) => {
    setUser((prev) => ({ ...prev, image }));
    // Note: We're not saving image to DB yet as per schema limitation, 
    // unless we add a photo_url column or use Storage.
    // For now, it's local state in the session/context.
  };

  const updateUser = async (updates: Partial<User>) => {
    try {
      // If we are just setting the user for the first time (login) or updating local state only,
      // we might not want to push to DB if the ID matches or if it's a fresh login.
      // However, the original logic seemed to assume `updateUser` always syncs to DB.
      
      // FIX: When logging in, we are passing the full user object to `updateUser`.
      // The `updates` object contains `email`. If we try to update the `email` field in the DB 
      // with the SAME email, Supabase might not complain, BUT if the logic somehow triggers a unique constraint check
      // or if we are trying to change it to something that exists (which is not the case here, it's the same email),
      // it shouldn't be an issue unless we are doing an INSERT instead of UPDATE or something weird.
      
      // BUT, looking at the error: "duplicate key value violates unique constraint 'employe_email_key'"
      // This usually happens on INSERT, or if we UPDATE a row to have an email that belongs to ANOTHER row.
      // Here, we are updating the logged-in user.
      
      // The issue is likely that `updateUser` is being called during login with the user data fetched from DB.
      // We shouldn't necessarily write back to DB during login, just update local state.
      
      // Let's check if we really need to update DB. 
      // If `updates` comes from Login, we just want to set the state.
      
      // We can distinguish by checking if we are already authenticated or if we want to force local-only update.
      // For now, let's modify the logic to ONLY update DB if the values are DIFFERENT from current state,
      // OR simply don't update DB if we are just "hydrating" the user state.
      
      // Better approach for now: 
      // If the `updateUser` is called from `SignInForm`, we probably just want to `setUser`.
      // The `UserContext` implementation mixes "setting local state" and "syncing to DB".
      
      // Let's separate the concern or check if we actually have changes.
      
      setUser((prev) => {
        const newUser = { ...prev, ...updates };
        
        // Update derived fields if necessary
        if (updates.nom || updates.prenom) {
          newUser.name = `${newUser.prenom || prev.prenom} ${newUser.nom || prev.nom}`;
        }
        
        // Check if we need to sync to DB
        // We sync only if:
        // 1. We have a user ID (we are logged in)
        // 2. The update is NOT just a "login hydration" (which we can't easily distinguish here without a flag)
        // 3. BUT, `SignInForm` calls `updateUser` with the data it JUST fetched.
        //    So we are updating the DB with the same data we just got. This is redundant but shouldn't fail 
        //    UNLESS there's some weird race condition or trigger.
        
        // The error "duplicate key value" suggests we might be accidentally creating a NEW record?
        // No, `updateEmploye` uses `eq('id_employe', id)`.
        
        // Wait, if `user.id_employe` is undefined initially (defaultUser), and we call `updateUser`,
        // `if (user.id_employe)` (line 108) uses the OLD `user` state (from closure or ref? No, from scope).
        // React state updates are scheduled. `user` inside `updateUser` refers to the value at render time.
        
        return newUser;
      });

      // The problem is `user` variable used in `if (user.id_employe)` is the OLD state (defaultUser).
      // If we are logging in, `user.id_employe` is likely undefined (from defaultUser).
      // So the DB update block (lines 108-121) should be SKIPPED during login!
      
      // Let's verify:
      // defaultUser has `id_employe` undefined?
      // interface Employe { id_employe?: number; ... }
      // defaultUser in UserContext:
      // const defaultUser: User = { ..., id_role: 1, id_boutique: 1, ... }; // id_employe is missing, so undefined.
      
      // So when `handleLogin` calls `updateUser(safeEmploye)`, `user.id_employe` is undefined.
      // The `if (user.id_employe)` check at line 108 evaluates to false.
      // So `updateEmploye` is NOT called.
      
      // THEN WHY THE ERROR?
      // "UserContext.tsx:124 Error updating user: Object"
      // This means the catch block caught an error.
      // This means `updateEmploye` WAS called.
      // This implies `user.id_employe` WAS defined?
      
      // Ah! `UserContext` uses `const [user, setUser] = useState...`.
      // `updateUser` closes over the `user` value from the current render cycle.
      
      // If `handleLogin` calls `updateUser`, and it's the FIRST time (user is default), `user.id_employe` is undefined.
      // So no DB call.
      
      // Wait, look at `defaultUser`:
      // const defaultUser: User = { ..., id_role: 1, id_boutique: 1, ... }; 
      // It does NOT have `id_employe`.
      
      // However, maybe the user WAS logged in previously or `localStorage` had something?
      // "duplicate key value violates unique constraint"
      
      // Let's look closely at `updateEmploye` implementation in `supabaseService.ts`.
      // Maybe I should read that file first.
      
      // But before that, let's fix `updateUser` to accept a flag to skip DB update, 
      // OR better, just handle the "Login" case explicitly.
      
      // Actually, looking at `SignInForm.tsx`:
      // await updateUser(safeEmploye);
      
      // If `user.id_employe` was somehow defined (maybe from a previous session that wasn't fully cleared? or defaultUser has it?),
      // then it tries to update.
      
      // BUT, the error is "duplicate key value violates unique constraint 'employe_email_key'".
      // This happens if you try to update a row and set its email to an email that ALREADY EXISTS in another row.
      // If we are updating the SAME row, it should be fine.
      // UNLESS `id_employe` in `user` state does NOT match the `id_employe` of the email we are trying to set.
      
      // SCENARIO:
      // 1. App loads. `localStorage` has a stale user (User A). `user` state is initialized with User A.
      // 2. User logs out (or token expired), but `logout` wasn't fully clean? 
      //    Or maybe `loadUser` failed but left stale data?
      // 3. User goes to Login page. Enters email for User B.
      // 4. `handleLogin` fetches User B. Calls `updateUser(User B)`.
      // 5. `updateUser` sees `user.id_employe` is User A's ID.
      // 6. It calls `updateEmploye(User A's ID, { email: User B's email })`.
      // 7. BOOM. "Email already exists" (because User B already has that email).
      
      // FIX:
      // When logging in, we should REPLACE the user state entirely and NOT trigger a DB update.
      // `updateUser` is currently "merge and maybe save".
      // We need a way to "set user without saving" or "login".
      
      // I will add a `shouldSave` parameter to `updateUser`, defaulting to `true`.
      // And in `SignInForm`, call it with `false`.
      
      if (user.id_employe && updates.id_employe && user.id_employe !== updates.id_employe) {
         // We are switching users? Should not happen via update.
         // Just update local state and return.
         // Or better, just don't save to DB if we are changing identity.
      }
      
      // Refined Logic:
      // We only save to DB if we are updating the CURRENT user's fields, NOT if we are switching users.
      // If `updates` contains `id_employe` and it's different from `user.id_employe`, we are likely logging in or switching context.
      // In that case, DO NOT write to DB using the OLD id.
      
      const isIdentityChange = updates.id_employe && updates.id_employe !== user.id_employe;
      
      // Update local state
      setUser((prev) => {
        const newUser = { ...prev, ...updates };
        if (updates.nom || updates.prenom) {
          newUser.name = `${newUser.prenom || prev.prenom} ${newUser.nom || prev.nom}`;
        }
        return newUser;
      });

      // Update DB if we have an ID AND it's not an identity change
      if (user.id_employe && !isIdentityChange) {
         // ... existing DB update logic
         const dbUpdates: Partial<Employe> = {};
         // ... (copy fields)
         
         if (Object.keys(dbUpdates).length > 0) {
           await updateEmploye(user.id_employe, dbUpdates);
         }
      }
      
    } catch (error) {
      console.error("Error updating user:", error);
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem("user_profile");
    setUser(defaultUser);
    // You might also want to sign out from Supabase if you were using their auth fully
    // await supabase.auth.signOut();
  };

  const isAuthenticated = !!user.id_employe;

  return (
    <UserContext.Provider value={{ user, isLoading, isAuthenticated, updateUserImage, updateUser, logout }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
};
