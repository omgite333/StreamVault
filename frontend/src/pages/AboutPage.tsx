import { usePageTitle } from '../hooks/usePageTitle'

export const AboutPage = () => {
  usePageTitle('About')
  return (
  <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
    <h1 className="mb-4 text-3xl font-bold">About StreamVault</h1>
    <p className="mb-4 text-muted-foreground">
      StreamVault is a modern learning platform built for educators and students. Administrators upload
      high-quality video courses, and learners stream them securely from anywhere.
    </p>
    <p className="mb-4 text-muted-foreground">
      Every video is stored in secure cloud storage and delivered through signed, expiring URLs so your
      content stays protected. We automatically track your watch progress so you can pick up right where
      you left off.
    </p>
    <p className="text-muted-foreground">
      Whether you are a creator sharing your expertise or a learner chasing a new skill, StreamVault is
      designed to make video learning simple, secure, and delightful.
    </p>
  </div>
  )
}
