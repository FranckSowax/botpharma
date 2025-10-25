import Link from 'next/link'

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <div className="z-10 w-full max-w-5xl items-center justify-between font-mono text-sm">
        <h1 className="text-4xl font-bold text-center mb-8">
          BOT PHARMA
        </h1>
        <p className="text-center text-lg mb-8">
          Assistant conversationnel WhatsApp pour parapharmacie
        </p>
        <div className="flex gap-4 justify-center">
          <Link
            href="/dashboard"
            className="rounded-lg bg-primary px-6 py-3 text-primary-foreground hover:bg-primary/90 transition-colors"
          >
            Accéder au Dashboard
          </Link>
          <Link
            href="/api/docs"
            className="rounded-lg border border-border px-6 py-3 hover:bg-secondary transition-colors"
          >
            Documentation API
          </Link>
        </div>
      </div>
    </main>
  )
}
