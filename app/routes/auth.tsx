export const meta = () => ([
  { title: 'Resumind | Auth' },
  {name :'description' ,content:'Log into your account'},
])
const auth = () => {
  return (
      <main className="bg-[url('/images/bg-auth.svg')] bg-cover min-h-screen flex items-center justify-center">
          <div className="bg-gradient-to-b from-light-blue-100 to-light-blue-200 p-4 rounded-2xl">
            <section className="flex ">
                <div className="flex flex-col items-center gap-2">
                    <h1>Welcome</h1>
                    <h2>Log In to Continue Your Job Journey</h2>
          </div>
          <div>{}</div>
          
            </section>
          </div>
          
    </main>
  )
}

export default auth