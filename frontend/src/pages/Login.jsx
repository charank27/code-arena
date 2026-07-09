import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod'; 
function Login(){
    const signupschema=z.object({
        emailId:z.string().email(),
        password:z.string().min(8,"Password should atleast contain 8 characters")
    })
    const {register,handleSubmit,formState: { errors },} = useForm({resolver:zodResolver(signupschema)});
    
    return(
        <div className="min-h-screen flex items-center justify-center bg-base-200 px-4">
  <div className="card w-full max-w-md bg-base-100 shadow-2xl">
    <div className="card-body p-8">

      <h1 className="text-4xl font-bold text-center mb-8">
        Leetcode
      </h1>

      <form
        onSubmit={handleSubmit((data) => console.log(data))}
        className="space-y-5"
      >

        <div>
          <label className="label">
            <span className="label-text font-medium">Email</span>
          </label>

          <input
            {...register("emailId")}
            type="email"
            placeholder="Enter your email"
            className={`input input-bordered w-full ${
              errors.emailId ? "input-error" : ""
            }`}
          />

          {errors.emailId && (
            <p className="text-error text-sm mt-1">
              {errors.emailId.message}
            </p>
          )}
        </div>

        <div>
          <label className="label">
            <span className="label-text font-medium">Password</span>
          </label>

          <input
            {...register("password")}
            type="password"
            placeholder="Enter your password"
            className={`input input-bordered w-full ${
              errors.password ? "input-error" : ""
            }`}
          />

          {errors.password && (
            <p className="text-error text-sm mt-1">
              {errors.password.message}
            </p>
          )}
        </div>

        <button
          type="submit"
          className="btn btn-primary w-full mt-4"
        >
          Login
        </button>
      </form>

    </div>
  </div>
</div>
    )
}
export default Login;