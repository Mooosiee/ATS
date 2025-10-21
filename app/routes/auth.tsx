import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router";
import { usePuterStore } from "~/lib/puter"
export const meta = () => ([
  { title: 'Resumind | Auth' },
  {name :'description' ,content:'Log into your account'},
])
const Auth = () => {
  const { isLoading, auth } = usePuterStore();
  //whenever use tries to access secure route when not authenticated we can redirect them to auth
  //and after succesfull auth we can automatically redirect them back to the page they wanted to access in the first place
  //how that works
  const location = useLocation();//comes from react router
  const next = location.search.split('next=')[1];//page they want to visit next
  const navigate = useNavigate();
  //useeffect will check isAuthenticated and redirect to dashboard
  useEffect(() => {
    if (auth.isAuthenticated) {
      navigate(next);//Redirection to the page they wanted to go to after they login:similary for home page
    }

  },[auth.isAuthenticated])
  return (
      <main className="bg-[url('/images/bg-auth.svg')] bg-cover min-h-screen flex items-center justify-center">
          <div className="bg-gradient-to-b from-light-blue-100 to-light-blue-200 p-4 rounded-2xl">
            <section className="flex flex-col gap-8 bg-white rounded-2xl p-10">
                <div className="flex flex-col items-center gap-2 text-center">
                    <h1>Welcome</h1>
                    <h2>Log In to Continue Your Job Journey</h2>
                </div>
          <div>{
            isLoading ? (
              <button className="primary-gradient rounded-full w-[600px] max-md:w-full py-4 px-8 cursor-pointer font-semibold text-white text-3xl animate-pulse">
                <p>Signing you in...</p>
              </button>
            ) : (<>
                {auth.isAuthenticated ? <button className="auth-button" onClick={auth.signOut}>
                  <p>Log Out</p>
                </button> : <button className="auth-button" onClick={auth.signIn}>
                  <p>Log In</p>
                </button>}
            </>)}</div>
          
            </section>
          </div>
          
    </main>
  )
}

export default Auth