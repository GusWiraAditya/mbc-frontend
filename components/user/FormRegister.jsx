import InputForm from "../../../components/ui/Input"
import Label from "../../../components/ui/Input/Label"
import Button from "../../../components/ui/Button"

const FormRegister = () => {
    return (
        <form action="/login">
          <div className="mb-2">
          <InputForm
        //   id="username"
          label = "Username"
          type="text"
          name="username"
          placeholder="Username*"
          />
          </div>
          <div className="mb-2">
          <InputForm
        //   id="email"
          label = "Email"
          type="email"
          name="email"
          placeholder="Email Address*"
          />
          </div>
          <div className="mb-2">
          <InputForm
        //   id="password"
          label = "Password"
          type="password"
          name="password"
          placeholder="Password*" />
          </div>
          <div className="mb-2">
          <InputForm
        //   id="confirmPassword"
          label = "Confirm Password"
          type="password"
          name="confirmPassword"
          placeholder="Confirm Password*" />
          </div>
          <div className="mb-2">
          <p href="#" className="text-xs text-slate-600">Your personal data will be used to support your experience throughout this website, to manage access to your account and for other purposes described in our privacy policy.</p>
          </div>
          <div className="mb-6">
            <Label htmlFor="terms" className="flex items-center justify-center" type="checkbox">
              <input type="checkbox" id="terms" name="terms" />
              <span className="text-xs ml-2 text-slate-600">I agree to the <a href="#" className="text-primary font-semibold">Terms and Conditions</a> and <a href="#" className="text-primary font-semibold">Privacy Policy</a></span>
            </Label>
          </div>
          <Button classname="bg-primary w-full font-bold text-white font-inter mb-2">SIGN UP</Button>
        </form>
    )
}

export default FormRegister;