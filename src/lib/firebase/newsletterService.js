import { doc, setDoc } from "firebase/firestore";
import { db } from "./config";

const COLLECTION = "newsletter_subscribers";

/**
 * Subscribe a user to the newsletter. Uses email as document ID to prevent duplicates.
 * Re-subscribing updates the existing record.
 * @param {string} email - Subscriber email
 * @param {string} [name] - Subscriber name
 * @returns {Promise<{ success: true }>}
 */
export async function subscribe(email, name) {
  if (!email || !email.trim()) {
    throw new Error("Email is required");
  }

  if (!process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID) {
    throw new Error("Firebase is not configured. Please add your Firebase config to .env.local");
  }

  const trimmedEmail = email.trim().toLowerCase();
  const docRef = doc(db, COLLECTION, trimmedEmail);

  await setDoc(
    docRef,
    {
      email: trimmedEmail,
      name: name?.trim() || "",
      subscribedAt: new Date().toISOString(),
      status: "active",
    },
    { merge: true }
  );

  return { success: true };
}
