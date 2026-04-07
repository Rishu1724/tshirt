import { initializeApp } from 'firebase/app';
import { getAnalytics, isSupported } from 'firebase/analytics';

const firebaseConfig = {
  apiKey: 'AIzaSyBKo1uuEygEtNQbSVWTOlU0egtpAjbp_Ds',
  authDomain: 'tshirt-7b97a.firebaseapp.com',
  projectId: 'tshirt-7b97a',
  storageBucket: 'tshirt-7b97a.firebasestorage.app',
  messagingSenderId: '76122158945',
  appId: '1:76122158945:web:869640cb2258674b32b720',
  measurementId: 'G-YQPS7E974T',
};

export const app = initializeApp(firebaseConfig);

export let analytics = null;
isSupported().then((supported) => {
  if (supported) {
    analytics = getAnalytics(app);
  }
});
