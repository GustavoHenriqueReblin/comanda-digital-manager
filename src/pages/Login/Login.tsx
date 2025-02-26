import '../../global.scss';
import './login.scss';
import Loading from '../../components/Loading';
import { routes } from '../../types/types';
import { LoginQuery } from '../../graphql/queries/user';

import React, { useEffect, useState } from 'react';
import Cookies from 'js-cookie';
import { useLocation, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { useLazyQuery } from '@apollo/client';
import { zodResolver } from '@hookform/resolvers/zod';
import { Helmet } from 'react-helmet';

const loginUserFormSchema = z.object({
  user: z.string().nonempty('O e-mail é obrigatório').email('E-mail inválido!'),
  password: z.string().nonempty('A senha é obrigatória'),
});

interface LoginFormData {
  user: string;
  password: string;
};

function Login() {
  const { register, handleSubmit, formState: { errors } } = useForm<LoginFormData>({
    resolver: zodResolver(loginUserFormSchema),
  });

  const [loading, setLoading] = useState(true);
  const [login] = useLazyQuery(LoginQuery);
  
  const navigate = useNavigate();
  const location = useLocation();
  const currentPage = routes.find(page => page.route === location.pathname);
  const pageTitle = currentPage ? currentPage.title : 'Comanda digital';

  // Ao clicar em entrar
  const onSubmit = (data: LoginFormData) => {
    const { user, password } = data;
    login({
      variables: { input: { email: user, password: password } },
    })
      .then(() => {
        navigate('/admin');
      })
      .catch((error) => {
        console.error("Erro ao buscar o usuário:", error);
      });
  };

  useEffect(() => {
    const cookieName = process.env.REACT_APP_COOKIE_AUTH_USER_TOKEN_NAME;
    if (!!(Cookies.get(cookieName ? cookieName : ''))) { // Se já tiver token vai para o admin
      navigate('/admin');
    }
  });

  loading && setLoading(false);

  return (
    <>
      { loading 
      ? ( <Loading title="Aguarde, carregando..." /> ) 
      : (
        <form className='login' onSubmit={handleSubmit(onSubmit)}>
          <Helmet>
              <title>{pageTitle}</title>
          </Helmet>
          <label className='label-input'>E-mail:</label>
          <input
            className='input'
            type="text"
            aria-label="user input"
            placeholder="Seu-email@valido.com.br"
            {...register('user')}
          />
          {errors.user && <span className='error-input'>{errors.user.message}</span>}
          <label className='label-input'>Senha:</label>
          <input
            className='input'
            type="password"
            aria-label="password input"
            placeholder="Sua senha"
            {...register('password')}
          />
          {errors.password && <span className='error-input'>{errors.password.message}</span>}
          <button className='button' type="submit">Entrar</button>
        </form>
      )}
    </>
  );
}

export default Login;
