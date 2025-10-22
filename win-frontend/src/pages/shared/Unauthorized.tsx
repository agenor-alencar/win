import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { AlertCircle, ArrowLeft, Home } from 'lucide-react';

export default function Unauthorized() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 via-white to-orange-50 p-4">
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader className="text-center space-y-4">
          <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
            <AlertCircle className="w-10 h-10 text-red-600" />
          </div>
          <CardTitle className="text-3xl font-bold text-red-600">
            Acesso Negado
          </CardTitle>
          <CardDescription className="text-lg">
            Você não tem permissão para acessar esta página.
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-4">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
            <p className="text-sm text-red-800">
              Esta área é restrita a usuários com permissões específicas.
              Se você acredita que deveria ter acesso, entre em contato com o administrador.
            </p>
          </div>

          <div className="flex flex-col gap-3 pt-4">
            <Button
              onClick={() => navigate(-1)}
              variant="outline"
              className="w-full"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar
            </Button>
            
            <Link to="/" className="w-full">
              <Button variant="default" className="w-full bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700">
                <Home className="w-4 h-4 mr-2" />
                Ir para Home
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
