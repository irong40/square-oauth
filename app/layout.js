export const metadata = {
  title: 'Square OAuth - Faith & Harmony',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body style={{ fontFamily: 'system-ui', margin: 0, padding: 0, backgroundColor: '#f5f5f5', minHeight: '100vh' }}>
        {children}
      </body>
    </html>
  )
}