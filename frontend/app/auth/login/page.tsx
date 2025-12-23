import { LoginForm } from '@/components/auth/login-form'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default function LoginPage() {
  return (
    <div className="min-h-screen flex">
      {/* Left side - Visual */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-blue-900 via-purple-900 to-blue-800 items-center justify-center p-12">
        <div className="text-white space-y-6 max-w-lg">
          <h1 className="text-5xl font-bold">Cloud Sentinel</h1>
          <p className="text-xl text-blue-100">
            Surveillez et optimisez vos coûts cloud en temps réel
          </p>
          <div className="space-y-4 pt-8">
            <div className="flex items-start space-x-3">
              <div className="w-2 h-2 mt-2 rounded-full bg-blue-400" />
              <div>
                <h3 className="font-semibold">Visibilité totale</h3>
                <p className="text-blue-200">Analysez toutes vos ressources AWS, Azure et GCP</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-2 h-2 mt-2 rounded-full bg-purple-400" />
              <div>
                <h3 className="font-semibold">Optimisation des coûts</h3>
                <p className="text-blue-200">Identifiez les ressources les plus coûteuses</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-2 h-2 mt-2 rounded-full bg-blue-400" />
              <div>
                <h3 className="font-semibold">Sécurité renforcée</h3>
                <p className="text-blue-200">ReadOnly access uniquement sur vos comptes</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right side - Form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-gray-50">
        <Card className="w-full max-w-md">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold">Connexion</CardTitle>
            <CardDescription>
              Entrez vos identifiants pour accéder à votre tableau de bord
            </CardDescription>
          </CardHeader>
          <CardContent>
            <LoginForm />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
