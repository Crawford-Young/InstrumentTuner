import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Privacy Policy | Instrument Tuner',
  description: 'What music.crawfordyoung.dev collects, why, and what you can do about it.',
}

const EFFECTIVE_DATE = 'July 28, 2026'
const CONTACT_EMAIL = 'hello@crawfordyoung.dev'

export default function PrivacyPage() {
  return (
    <main className="mx-auto max-w-3xl px-6 py-16">
      <Link href="/" className="text-sm text-muted-foreground underline underline-offset-4">
        Back to the tuner
      </Link>

      <h1 className="mt-8 text-4xl font-bold tracking-tight">Privacy Policy</h1>
      <p className="mt-3 text-muted-foreground">Effective {EFFECTIVE_DATE}.</p>

      <div className="mt-14 space-y-12 leading-relaxed text-muted-foreground">
        <section>
          <h2 className="mb-3 text-xl font-semibold text-foreground">What this policy covers</h2>
          <p>
            This policy applies to music.crawfordyoung.dev, operated by Crawford Young. It explains
            what information the site collects, why, and what you can do about it.
          </p>
          <p className="mt-3">
            It does not cover sites this one links to. Once you follow a link away from
            music.crawfordyoung.dev, that site&apos;s own policy applies.
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-xl font-semibold text-foreground">Information collected</h2>
          <p>This site collects very little.</p>
          <ul className="mt-3 list-disc space-y-3 pl-5">
            <li>
              <strong className="text-foreground">Server logs.</strong> The hosting provider (Vercel)
              records standard request data — IP address, user agent, requested path, timestamp — for
              security and reliability. These logs are retained by Vercel under their own policy and
              are not used to build a profile of you.
            </li>
            <li>
              <strong className="text-foreground">Analytics.</strong> Aggregate page-view counts via
              Vercel Analytics. These measure traffic in aggregate. They do not use cookies and do
              not track you across other sites.
            </li>
            <li>
              <strong className="text-foreground">Microphone.</strong> The tuner needs microphone
              access to detect pitch. The audio is analysed entirely in your browser and is{' '}
              <strong className="text-foreground">never transmitted</strong> — it does not reach any
              server, is not recorded, and is not stored. Access is requested only when you start the
              tuner and ends when you leave the page.
            </li>
          </ul>
        </section>

        <section>
          <h2 className="mb-3 text-xl font-semibold text-foreground">Advertising</h2>
          <p>This site may display advertising served by Google.</p>
          <ul className="mt-3 list-disc space-y-3 pl-5">
            <li>Google is a third-party vendor and uses cookies to serve ads on this site.</li>
            <li>
              Google&apos;s use of advertising cookies — including the DoubleClick cookie — enables
              it and its partners to serve ads to you based on your visit to this site and other
              sites on the internet.
            </li>
            <li>
              You may opt out of personalized advertising by visiting{' '}
              <Link
                href="https://www.google.com/settings/ads"
                target="_blank"
                rel="noreferrer"
                className="text-foreground underline underline-offset-4"
              >
                Ads Settings
              </Link>
              .
            </li>
            <li>
              Many other third-party vendors&apos; cookies can be disabled at{' '}
              <Link
                href="https://www.aboutads.info/choices/"
                target="_blank"
                rel="noreferrer"
                className="text-foreground underline underline-offset-4"
              >
                aboutads.info
              </Link>
              .
            </li>
            <li>
              Third-party vendors&apos; use of cookies on this site is governed by Google&apos;s{' '}
              <Link
                href="https://policies.google.com/technologies/ads"
                target="_blank"
                rel="noreferrer"
                className="text-foreground underline underline-offset-4"
              >
                advertising policies
              </Link>
              .
            </li>
          </ul>
        </section>

        <section>
          <h2 className="mb-3 text-xl font-semibold text-foreground">Cookies</h2>
          <p>A cookie is a small file a site stores in your browser.</p>
          <ul className="mt-3 list-disc space-y-3 pl-5">
            <li>Advertising cookies are set by Google as described above.</li>
            <li>
              <strong className="text-foreground">Preference storage.</strong> Your light or dark
              theme choice is stored locally in your browser. It never leaves your device and is not
              a tracking cookie.
            </li>
          </ul>
          <p className="mt-3">
            You can block or delete cookies through your browser settings. Blocking advertising
            cookies does not prevent you from using the tuner; you will simply see less relevant ads.
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-xl font-semibold text-foreground">Your rights under GDPR</h2>
          <p>
            If you are in the European Economic Area or the United Kingdom, you have the right to
            access, correct, or erase personal data held about you, to object to or restrict its
            processing, and to data portability. Because this site holds no account or contact
            database, in practice this concerns server logs and advertising cookies.
          </p>
          <p className="mt-3">
            To exercise any of these rights, email{' '}
            <Link
              href={`mailto:${CONTACT_EMAIL}`}
              className="text-foreground underline underline-offset-4"
            >
              {CONTACT_EMAIL}
            </Link>
            . You also have the right to complain to your local data protection authority.
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-xl font-semibold text-foreground">Your rights under CCPA</h2>
          <p>
            If you are a California resident, you have the right to know what personal information is
            collected and to request its deletion.
          </p>
          <p className="mt-3">
            Personal information is not sold, and never has been. To make a request, email{' '}
            <Link
              href={`mailto:${CONTACT_EMAIL}`}
              className="text-foreground underline underline-offset-4"
            >
              {CONTACT_EMAIL}
            </Link>
            .
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-xl font-semibold text-foreground">Changes to this policy</h2>
          <p>
            This policy may be updated as the site changes. The effective date above reflects the
            most recent revision. Material changes will be noted on this page rather than announced
            separately.
          </p>
        </section>
      </div>
    </main>
  )
}
