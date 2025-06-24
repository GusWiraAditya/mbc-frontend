import InputForm from "../../../components/ui/Input";
import Button from "../../../components/ui/Button";
import { AiOutlineGoogle } from "react-icons/ai";
import { FaFacebook } from "react-icons/fa";

const FormLogin = () => {
  return (
    <form action="/">
      <div className="mb-2">
        <InputForm
          label="Email"
          id="email"
          type="email"
          name="email"
          placeholder="Email / Username*"
        />
      </div>
      <div className="mb-1">
        <InputForm
          label="Password"
          id="password"
          type="password"
          name="password"
          placeholder="Password*"
        />
      </div>
      <div className="mb-6 text-end">
        <a href="#" className="text-sm text-slate-600 underline">
          Forgot Password
        </a>
      </div>
      <Button classname="bg-primary w-full font-bold text-white font-inter">
        LOG IN
      </Button>
      <div className="flex items-center my-4">
        <div className="flex-grow h-px bg-gray-300"></div>
        <span className="px-4 text-sm text-gray-400 font-semibold">OR</span>
        <div className="flex-grow h-px bg-gray-300"></div>
      </div>
      <div className="mb-2 grid grid-cols-2 gap-4">
        <Button classname="bg-white text-black border border-gray-300">
          <div className="align-items-center flex justify-center">
            <AiOutlineGoogle className="w-7 h-7 text-gray-800 dark:text-black" />
            <span className="ml-1 mt-0.5">Google</span>
          </div>
        </Button>
        <Button classname="bg-white text-black border border-gray-300">
          <div className="align-items-center flex justify-center">
            <FaFacebook className="w-6 h-6  text-gray-800 dark:text-black" />
            <span className="ml-1">Facebook</span>
          </div>
        </Button>
      </div>
    </form>
  );
};

export default FormLogin;
