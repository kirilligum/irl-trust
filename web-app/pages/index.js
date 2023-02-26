import Head from 'next/head'
import Image from 'next/image'
import { Inter } from 'next/font/google'
import styles from '@/styles/Home.module.css'

const inter = Inter({ subsets: ['latin'] })

export default function Home() {
  return (
    <>
      <Head>
        <title>IRL TrustLend</title>
        <meta name="description" content="dao lending pool that uses in-real-life trust between people to give credit" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className={styles.main}>
        
        <div className={styles.description}>
          <p>IRL TrustLend</p>
        </div>

        {/*<div className={styles.center}>
          <Image
            className={styles.logo}
            src="/next.svg"
            alt="Next.js Logo"
            width={180}
            height={37}
            priority
          />
        </div>
        */}

        <div className={styles.grid}>
          <a href="/" className={styles.card} >
            <h2 className={inter.className}>Link 1 heading</h2>
            <p className={inter.className}>Lorem ipsum</p>
          </a>

          <a href="/" className={styles.card} >
            <h2 className={inter.className}>Link 2 heading</h2>
            <p className={inter.className}>Lorem ipsum</p>
          </a>

          <a href="/" className={styles.card} >
            <h2 className={inter.className}>Link 3 heading</h2>
            <p className={inter.className}>Lorem ipsum</p>
          </a>

          <a href="/" className={styles.card} >
            <h2 className={inter.className}>Link 4 heading</h2>
            <p className={inter.className}>Lorem ipsum</p>
          </a>
        </div>

      </main>
    </>
  )
}
