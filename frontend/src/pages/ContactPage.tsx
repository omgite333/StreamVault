import { Mail, MessageCircle } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'

export const ContactPage = () => (
  <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
    <h1 className="mb-8 text-3xl font-bold">Contact Us</h1>
    <div className="grid gap-6 sm:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="size-4 text-primary" />
            Email
          </CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          <a href="mailto:support@streamvault.app" className="text-primary hover:underline">
            support@streamvault.app
          </a>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageCircle className="size-4 text-primary" />
            Community
          </CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          Join our community channels for tips, support, and course updates.
        </CardContent>
      </Card>
    </div>
  </div>
)
