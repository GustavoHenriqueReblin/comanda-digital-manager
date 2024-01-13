import React, { useEffect, useState } from 'react';
import '../../global.scss';
import './login.scss';
import Cookies from 'js-cookie';
import Loading from '../../components/Loading';

import { useLocation, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { useLazyQuery } from '@apollo/client';
import { GetUser } from '../../graphql/queries/userQueries';
import { zodResolver } from '@hookform/resolvers/zod';
import { routeTitles } from '../../types/types';
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
  const [getUser, { data }] = useLazyQuery(GetUser);
  const navigate = useNavigate();
  const location = useLocation();
  const pageTitle = routeTitles[location.pathname] || 'Comanda digital';

  // Ao dar o refetch no usuário verifica os dados
  useEffect(() => {
    if (data && data.user != null) {
      const token = data.user.token;
      const cookieName = process.env.REACT_APP_COOKIE_NAME_USER_TOKEN;
      if (cookieName) {
        Cookies.set(cookieName, token, { expires: 1 });
      }
      navigate('/admin');
    }

    setLoading(false);
  }, [data, navigate]);

  // Se já tiver token vai para o admin
  useEffect(() => {
    const cookieName = process.env.REACT_APP_COOKIE_NAME_USER_TOKEN;
    if (!loading && !!(Cookies.get(cookieName ? cookieName : ''))) {
      navigate('/admin');
    }
  }, [loading, navigate]);

  // Ao clicar em entrar
  const validateLogin = (data: LoginFormData) => {
    const { user, password } = data;
    try {
      getUser({
        variables: { input: { username: user, password: password } },
      });
    } catch (error) {
      console.error("Erro ao buscar o usuário:", error);
    }
  };

  return (
    <>
      { loading 
      ? ( <Loading title="Aguarde, carregando..." /> ) 
      : (
        <form className='login' onSubmit={handleSubmit(validateLogin)}>
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
