import BackButton from "@/components/ui/BackButton";
import SignInForm from "@/components/sign-in/SignInForm";
import RightsReserved from "@/components/ui/RightsReserved";

const SignInFormContainer = () => {
  return (
    <div className="bg-white col-span-1 w-full">
      <div className="w-full px-5 md:px-0 md:max-w-[25.625rem] md:mx-auto h-full py-5 flex flex-col justify-between gap-10 md:gap-20 font-dm_sans">
        <div className="">
          <BackButton className={"text-light-grey no-underline hover:no-underline"}/>
        </div>
        <div className="grow">
          <div className="mb-6">
            <h2 className="text-4xl/[1.56] text-purple font-bold">Admin Sign In</h2>
            <p className="text-light-grey font-normal text-base">
              Enter your email and password to sign in!
            </p>
          </div>
          <SignInForm />
        </div>
        <div className="">
          <RightsReserved />
        </div>
      </div>
    </div>
  );
};

export default SignInFormContainer;
