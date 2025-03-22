import { getAuth, signInWithPopup } from "firebase/auth";
import { app } from "../utils/firebase";
import { GoogleAuthProvider } from "firebase/auth";

const auth = getAuth();
const provider = new GoogleAuthProvider();

auth.languageCode = "it";

export const Signin = () => {
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
                localStorage.setItem('userId', user.uid);
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
        <button onClick={onSignin}>
            Google Signin
        </button>
    );
};