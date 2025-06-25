export default async function Home() {
  return (
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <main className="flex flex-col gap-8 row-start-2 items-center">
        <h1 className="text-4xl text-center sm:text-5xl font-bold text-gray-800">
          Next.js Demo App
        </h1>
        <p className="text-lg text-gray-600 text-center max-w-2xl">
          Explore our demo features and APIs
        </p>
        
        {/* Demo Pages Links */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
          <a
            href="/sayhello"
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-4 rounded-lg text-center transition duration-200 ease-in-out shadow-lg hover:shadow-xl"
          >
            <div className="text-2xl mb-2">👋</div>
            <div className="font-semibold">Say Hello</div>
            <div className="text-sm opacity-90">Test our greeting API</div>
          </a>
          
          <a
            href="/youtube-comments"
            className="bg-red-600 hover:bg-red-700 text-white px-6 py-4 rounded-lg text-center transition duration-200 ease-in-out shadow-lg hover:shadow-xl"
          >
            <div className="text-2xl mb-2">📹</div>
            <div className="font-semibold">YouTube Comments</div>
            <div className="text-sm opacity-90">Extract & download comments</div>
          </a>
        </div>
        
        <a
          className="flex items-center gap-2 hover:underline hover:underline-offset-4 mt-8"
          href="https://docs.sevalla.com/application-hosting"
          target="_blank"
          rel="noopener noreferrer"
        >
          📁 Read Sevalla docs
        </a>
      </main>
      <footer className="row-start-3 flex gap-6 flex-wrap items-center justify-center">
        <a
          className="flex items-center gap-2 hover:underline hover:underline-offset-4"
          href="https://nextjs.org/docs?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
          target="_blank"
          rel="noopener noreferrer"
        >
          📁 Read Next.js docs
        </a>
        <a
          className="flex items-center gap-2 hover:underline hover:underline-offset-4"
          href="https://nextjs.org/learn?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
          target="_blank"
          rel="noopener noreferrer"
        >
          📚 Learn
        </a>
        <a
          className="flex items-center gap-2 hover:underline hover:underline-offset-4"
          href="https://nextjs.org?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
          target="_blank"
          rel="noopener noreferrer"
        >
          🌐 Go to nextjs.org →
        </a>
      </footer>
    </div>
  );
}