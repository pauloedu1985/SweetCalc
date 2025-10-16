import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getAnalytics } from 'firebase/analytics';

const firebaseConfig = {
  apiKey: "AIzaSyAinyhxoX5wxSwFTXd_0YW6YLubojb13TM",
  authDomain: "sweetcalc-81df4.firebaseapp.com",
  projectId: "sweetcalc-81df4",
  storageBucket: "sweetcalc-81df4.firebasestorage.app",
  messagingSenderId: "285689116695",
  appId: "1:285689116695:web:aff844cb547c2d9e7f8452",
  measurementId: "G-FM8SFNKJ62"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize services
export const auth = getAuth(app);
export const db = getFirestore(app);

// Initialize Analytics (optional)
let analytics = null;
if (typeof window !== 'undefined') {
  analytics = getAnalytics(app);
}

export { analytics };
export default app;
