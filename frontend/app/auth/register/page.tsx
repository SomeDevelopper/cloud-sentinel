import { RegisterForm } from '@/components/auth/register-form'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default function RegisterPage() {
  return (
    <div className="min-h-screen flex">
      {/* Left side - Visual */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-blue-900 via-purple-900 to-blue-800 items-center justify-center p-12">
        <div className="text-white space-y-6 max-w-lg">
          <h1 className="text-5xl font-bold">Cloud Sentinel</h1>
          <p className="text-xl text-blue-100">
            Commencez à optimiser vos coûts cloud dès aujourd'hui
          </p>
          <div className="space-y-4 pt-8">
            <div className="flex items-start space-x-3">
              <div className="w-2 h-2 mt-2 rounded-full bg-green-400" />
              <div>
                <h3 className="font-semibold">Démarrage gratuit</h3>
                <p className="text-blue-200">Aucune carte de crédit requise</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-2 h-2 mt-2 rounded-full bg-green-400" />
              <div>
                <h3 className="font-semibold">Configuration rapide</h3>
                <p className="text-blue-200">Connectez vos comptes en quelques minutes</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-2 h-2 mt-2 rounded-full bg-green-400" />
              <div>
                <h3 className="font-semibold">Support multi-cloud</h3>
                <p className="text-blue-200">AWS, Azure et GCP dans une seule interface</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right side - Form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-gray-50">
        <Card className="w-full max-w-md">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold">Créer un compte</CardTitle>
            <CardDescription>
              Remplissez les informations ci-dessous pour commencer
            </CardDescription>
          </CardHeader>
          <CardContent>
            <RegisterForm />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
