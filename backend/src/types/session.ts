// Purpose: Define the structure of the session data.
import { UserData } from "./user";

// https://stackoverflow.com/questions/65108033/property-user-does-not-exist-on-type-session-partialsessiondata
declare module 'express-session' {
  export interface SessionData {
    currentUser: UserData ,
  }
}
