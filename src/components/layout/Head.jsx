import NextHead from 'next/head'
import { useRouter } from 'next/router'

/**
 * Constants & Helpers
 */
export const WEBSITE_HOST_URL = 'https://nextjs-ethereum-starter.vercel.app/'


/**
 * Component
 */
export const Head = ({
  customMeta,
}) => {
  const router = useRouter()
  const meta = {
    title: 'Next.js Ethereum Starter',
    description: 'Next.js - RainbowKit - Hardhat',
    image: `${WEBSITE_HOST_URL}/images/site-preview.png`,
    type: 'website',
    ...customMeta,
  }

  return (
    <NextHead>
      <title>{meta.title}</title>
      <meta content={meta.description} name="description" />
      <meta property="og:url" content={`${WEBSITE_HOST_URL}${router.asPath}`} />
      <link rel="canonical" href={`${WEBSITE_HOST_URL}${router.asPath}`} />
      <meta property="og:type" content={meta.type} />
      <meta property="og:site_name" content="Next.js Ethereum Starter" />
      <meta property="og:description" content={meta.description} />
      <meta property="og:title" content={meta.title} />
      <meta property="og:image" content={meta.image} />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:site" content="@huntarosan" />
      <meta name="twitter:title" content={meta.title} />
      <meta name="twitter:description" content={meta.description} />
      <meta name="twitter:image" content={meta.image} />
      
      <link rel="preconnect" href="https://fonts.googleapis.com"></link>
      <link rel="preconnect" href="https://fonts.gstatic.com" ></link>
      <link href="https://fonts.googleapis.com/css2?family=Modak&Asap:ital,wght@0,400;0,500;0,600;0,700;1,400;1,500;1,600&family=Lilita+One&display=swap" rel="stylesheet"></link>
    </NextHead>
  )
}
