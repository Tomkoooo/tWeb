import * as React from "react"

export default async function LoadingTestPage() {
  // Artificial delay to show the loading state
  await new Promise((resolve) => setTimeout(resolve, 15000))

  return (
    <div className="min-h-screen flex items-center justify-center bg-black">
      <div className="text-center p-10 glass-card">
        <h1 className="text-4xl font-heading font-black text-white mb-6 uppercase">
          TESZT SIKERES!
        </h1>
        <p className="text-neutral-400 text-xl">
          Láthattad a Krausz Mestert munka közben.
        </p>
        <a 
          href="/" 
          className="mt-10 inline-block bg-[#FF5500] text-white px-8 py-3 btn-krausz font-black"
        >
          VISSZA A FŐOLDALRA
        </a>
      </div>
    </div>
  )
}
