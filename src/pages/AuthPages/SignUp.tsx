import PageMeta from "../../components/common/PageMeta";
import AuthLayout from "./AuthPageLayout";
import SignUpForm from "../../components/auth/SignUpForm";

export default function SignUp() {
  return (
    <>
      <PageMeta
        title="Inscription | QuickRepair France"
        description="Créez votre compte QuickRepair France pour gérer vos réparations"
      />
      <AuthLayout>
        <SignUpForm />
      </AuthLayout>
    </>
  );
}
