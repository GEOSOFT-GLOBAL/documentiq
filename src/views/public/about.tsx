import { FileSearch, Users, Shield, Clock } from "lucide-react"

const About = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 py-16">
      {/* Header */}
      <div className="text-center mb-16">
        <h1 className="text-4xl font-bold mb-4">About DocQuery</h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          A powerful document search platform designed to help you find and access 
          PDF documents quickly and efficiently.
        </p>
      </div>

      {/* Mission */}
      <section className="mb-16">
        <h2 className="text-2xl font-semibold mb-4">Our Mission</h2>
        <p className="text-muted-foreground leading-relaxed">
          DocQuery was built to solve the challenge of finding specific documents 
          within large repositories. We believe that accessing information should be 
          fast, intuitive, and hassle-free. Our platform enables users to search 
          through thousands of documents and get direct links to the PDFs they need.
        </p>
      </section>

      {/* Features Grid */}
      <section className="mb-16">
        <h2 className="text-2xl font-semibold mb-8">What We Offer</h2>
        <div className="grid md:grid-cols-2 gap-6">
          <div className="flex gap-4 p-4 rounded-lg border bg-card">
            <div className="shrink-0">
              <FileSearch className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h3 className="font-medium mb-1">Advanced Search</h3>
              <p className="text-sm text-muted-foreground">
                Powerful search capabilities to find documents by keywords, phrases, or metadata.
              </p>
            </div>
          </div>
          <div className="flex gap-4 p-4 rounded-lg border bg-card">
            <div className="shrink-0">
              <Clock className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h3 className="font-medium mb-1">Search History</h3>
              <p className="text-sm text-muted-foreground">
                Keep track of your past searches and quickly revisit previous queries.
              </p>
            </div>
          </div>
          <div className="flex gap-4 p-4 rounded-lg border bg-card">
            <div className="shrink-0">
              <Shield className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h3 className="font-medium mb-1">Secure Access</h3>
              <p className="text-sm text-muted-foreground">
                Role-based access control ensures documents are only visible to authorized users.
              </p>
            </div>
          </div>
          <div className="flex gap-4 p-4 rounded-lg border bg-card">
            <div className="shrink-0">
              <Users className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h3 className="font-medium mb-1">Team Collaboration</h3>
              <p className="text-sm text-muted-foreground">
                Share bookmarks and search results with your team members.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Contact */}
      <section className="text-center p-8 rounded-lg bg-muted/30">
        <h2 className="text-xl font-semibold mb-2">Have Questions?</h2>
        <p className="text-muted-foreground">
          Contact us at <a href="mailto:support@ncdmb.gov.ng" className="text-primary hover:underline">support@ncdmb.gov.ng</a>
        </p>
      </section>
    </div>
  )
}

export default About
