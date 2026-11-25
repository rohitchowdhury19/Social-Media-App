import React, { useState } from 'react';
import Logo from '../../Img/logo.png';
import { useDispatch, useSelector } from 'react-redux';
import { logIn, signUp } from '../../actions/AuthAction';
import { cn } from '../../utils/clsx';
import { buttonClass, cardClass, inputClass } from '../../utils/styles';


const Auth = () => {

    const [isSignUp, setIsSignUp] = useState(true);
    const dispatch = useDispatch();
    const loading = useSelector((state) => state.authReducer.loading);

    const [data, setData] = useState({ firstname: "", lastname: "", email: "", password: "", confirmpass: "" });

    const [confirmPass, setConfirmPass] = useState(true);

    const handleChange = (e) => {
        setData({ ...data, [e.target.name]: e.target.value })
    }


    const handlSubmit = (e) => {
        e.preventDefault();

        if (isSignUp) {
            data.password === data.confirmpass ? dispatch(signUp(data)) : setConfirmPass(false)
        } else {
            dispatch(logIn(data))
        }
    }



    const restForm = () => {
        setConfirmPass(true);

        setData({
            firstname: "",
            lastname: "",
            email: "",
            password: "",
            confirmpass: ""
        })
    }

    const authInputClass = cn(inputClass, 'px-4 py-3 flex-1 min-w-0');

    return (

        //    Left Side
        <div className={cn('flex flex-col md:flex-row items-center justify-center min-h-screen gap-16 relative')}>
            <div className={cn('flex items-center justify-center gap-8')}>
                <img src={Logo} alt="" className="w-16 h-16 object-contain" />
                <div>
                    <h2 className="text-2xl font-bold text-[#2b2ba3]">Welcome !</h2>
                    <h5 className="text-sm font-semibold">Explore the ideas throughout <br /> the world.</h5>
                </div>
            </div>


            {/* Right Side */}

            <div className={cn('flex items-center justify-center')}>
                <form className={cn(cardClass, 'flex flex-col items-center justify-center gap-6 p-6 w-full max-w-md')} onSubmit={handlSubmit}>

                    <h2 className="text-2xl font-bold">{isSignUp ? "Sign Up" : "Log In"}</h2>

                    {isSignUp &&
                        <div className="flex gap-4 w-full items-center">
                            <input type="text" placeholder='First Name'
                                className={authInputClass} name='firstname'
                                onChange={handleChange}
                                value={data.firstname}
                            />
                            <input type="text" placeholder='Last Name'
                                className={authInputClass} name='lastname'
                                onChange={handleChange}
                                value={data.lastname}
                            />
                        </div>
                    }

                    <div className="flex gap-4 w-full items-center">
                        <input type="text" placeholder='Email'
                            className={authInputClass} name='email'
                            onChange={handleChange}
                            value={data.email}
                        />
                    </div>

                    <div className="flex gap-4 w-full items-center">
                        <input type="password" placeholder='Password'
                            className={authInputClass} name='password'
                            onChange={handleChange}
                            value={data.password}
                        />
                        {isSignUp &&
                            <input type="password" placeholder='Confirm Password'
                                className={authInputClass} name='confirmpass'
                                onChange={handleChange}
                                value={data.confirmpass}
                            />
                        }
                    </div>


                    <span className={cn('text-xs text-red-500 self-end mr-[5px]', confirmPass ? 'hidden' : 'block')}>
                        * Confirm Password is not same
                    </span>


                    <div className="flex gap-4 w-full items-center justify-center">
                        <span className="text-xs cursor-pointer hover:underline"
                            onClick={() => { setIsSignUp((prev) => !prev); restForm() }}
                        >
                            {isSignUp ? "Already have an account? Login here" : "Don't have an account? SignUp here"}
                        </span>
                    </div>

                    <button className={cn(buttonClass, 'w-24 h-8')} type='submit' disabled={loading}>
                        {loading ? "loading..." : isSignUp ? "Sign Up" : "Login"}
                    </button>

                </form>
            </div>
        </div>
    )
}



export default Auth
