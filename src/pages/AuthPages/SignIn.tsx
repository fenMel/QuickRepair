import PageMeta from "../../components/common/PageMeta";
import AuthLayout from "./AuthPageLayout";
import SignInForm from "../../components/auth/SignInForm";

export default function SignIn() {
  return (
    <>
      <PageMeta
        title="Connexion | QuickRepair France"
        description="Connectez-vous à votre espace QuickRepair France"
      />
      <AuthLayout>
        <SignInForm />
      </AuthLayout>
    </>
  );
}
