import { getAuth, signInWithPopup } from "firebase/auth";
import { app } from "../utils/firebase";
import { GoogleAuthProvider } from "firebase/auth";
import { motion } from "framer-motion";
import { FaGoogle } from "react-icons/fa";

const auth = getAuth();
const provider = new GoogleAuthProvider();

auth.languageCode = "it";

export const SigninButton = () => {
  const auth = getAuth(app);

  async function onSignin() {
    signInWithPopup(auth, provider)
      .then((result) => {
        const credential = GoogleAuthProvider.credentialFromResult(result);
        if (!credential) {
          return;
        }
        const user = result.user;
        console.log(user);
        localStorage.setItem("userId", user.uid);
      })
      .catch((error) => {
        const errorCode = error.code;
        const errorMessage = error.message;
        const email = error.customData.email;
        const credential = GoogleAuthProvider.credentialFromError(error);
        console.log(errorCode, errorMessage, email, credential);
      });
  }

  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5, delay: 0.4 }}
      onClick={onSignin}
      className="mt-4 w-full flex items-center justify-center gap-2 bg-gray-900 hover:bg-gray-800 border border-gray-700 py-3 rounded-lg font-medium transition-all duration-200"
    >
      <FaGoogle className="text-white" />
      <span>Sign in with Google</span>
    </motion.button>
  );
};
