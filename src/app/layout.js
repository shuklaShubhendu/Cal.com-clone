import './globals.css'

export const metadata = {
  title: 'Cal.com | Open Scheduling Infrastructure',
  description: 'A scheduling platform that lets you create event types, set availability, and let others book time with you.',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
