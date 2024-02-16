/* eslint-disable react-hooks/exhaustive-deps */
import './bartenderAuth.scss';

import Loading from "../../components/Loading";
import Header from '../../components/Header/Header';
import { routes } from "../../types/types";
import { GetBartender } from "../../graphql/queries/bartender";
import { UPDATE_BARTENDER } from "../../graphql/mutations/bartender";
import { BARTENDER_AUTH_RESPONSE } from "../../graphql/subscriptions/bartender";

import React, { useEffect, useState } from "react";
import Cookies from 'js-cookie';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useLazyQuery, useMutation, useSubscription } from "@apollo/client";
import { useLocation, useNavigate } from 'react-router-dom';
import { Helmet } from "react-helmet";

interface BartenderFormData {
    securityCode: string;
};

const bartenderFormSchema = z.object({
    securityCode: z.string().nonempty('O código é obrigatório'),
});

function BartenderAuth() {
    const [loading, setLoading] = useState(true);
    const [isInputBlocked, setIsInputBlocked] = useState(false);
    const [bartenderDataIsWaiting, setBartenderDataIsWaiting] = useState(null);
    const [resMessage, setResMessage] = useState('');
    const [updateBartender] = useMutation(UPDATE_BARTENDER);
    const [getBartender] = useLazyQuery(GetBartender, {
        fetchPolicy: 'cache-and-network',
        onCompleted: (res) => {
            const data = res.bartender.data;
            if (data && data !== null && data.id > 0) {
                const hasResponse = data.isApproved != null;
                
                if (!hasResponse && verifyRequstAuthInCookie()) { // Já enviou a solicitação...
                    setLoading(false);
                    return;
                }        
                
                if (!data.isWaiting) {
                    if (!hasResponse) { // Enviou a solicitação
                        updateBartender({ variables: {
                            input: {
                                id: data.id, 
                                isWaiting: true,
                                token: data.token
                            },
                        }, });
        
                        const cookieName = process.env.REACT_APP_COOKIE_NAME_BARTENDER_REQUEST;
                        if (cookieName) {
                            Cookies.set(cookieName, JSON.stringify(data), { expires: 0.0416667 }); // 1 hora
                        }
                        verifyRequstAuthInCookie();
        
                    } else { // Recebeu resposta da solicitação
                        refreshByResponse(data);
                    }
                }
            } else if (!verifyRequstAuthInCookie()) {
                setIsInputBlocked(false);
                setSecurityCodeValue('securityCode', "");
            }
            
            if (data && res.bartender.message !== null) {
                setResMessage(res.bartender.message);
            };
        },
    });
    useSubscription(BARTENDER_AUTH_RESPONSE, {
        onSubscriptionData: (res) => {
            const data = res.subscriptionData.data.authBartenderResponse;
            if (!data.isWaiting &&  data.isApproved != null) {
                refreshByResponse(data);
            };
        }
    });
    const navigate = useNavigate();
    const location = useLocation();

    const { register, setValue: setSecurityCodeValue, handleSubmit, formState: { errors } } = useForm<BartenderFormData>({
        resolver: zodResolver(bartenderFormSchema),
    });
    const currentPage = routes.find(page => page.route === location.pathname);
    const pageTitle = currentPage ? currentPage.title : 'Comanda digital';

    const verifyRequstAuthInCookie = (): boolean => {
        const cookieName = process.env.REACT_APP_COOKIE_NAME_BARTENDER_REQUEST;
        const bartenderDataIsWaiting = Cookies.get(cookieName ? cookieName : ''); 
        const res = !!bartenderDataIsWaiting;  
        setBartenderDataIsWaiting(res ? () => {
            const data = JSON.parse(bartenderDataIsWaiting);
            setSecurityCodeValue('securityCode', data.securityCode);
            setIsInputBlocked(true);
            return data
        } : null);

        return res;
    };

    const refreshByResponse = (data: any) => {
        const { id } = bartenderDataIsWaiting ? bartenderDataIsWaiting : { id: 0 };
        
        if (data.token && Number(id) === Number(data.id) && data.isApproved) { // Aprovou
            const cookieName = process.env.REACT_APP_COOKIE_NAME_BARTENDER_TOKEN;
            if (cookieName) {
                Cookies.set(cookieName, JSON.stringify(data.token), { expires: 1 });
            }  
            verifyBartenderToken();
        } else { // Recusou
            cancelRequestWait(true);
        }
    };

    const verifyBartenderToken = () => {
        const cookieName = process.env.REACT_APP_COOKIE_NAME_BARTENDER_TOKEN;
        const bartenderToken = Cookies.get(cookieName ? cookieName : '');  
        if (bartenderToken) {
            navigate('/queue');
        }
    };

    const deleteCookie = (cookieName: any) => {
        if (cookieName) {
            Cookies.remove(cookieName);
        }
    };

    const cancelRequestWait = (refresh: boolean = false) => {
        setIsInputBlocked(false);
        setSecurityCodeValue('securityCode', "");

        const cookieName = process.env.REACT_APP_COOKIE_NAME_BARTENDER_REQUEST;
        if (cookieName) {
          const bartender = Cookies.get(cookieName);
          
          if (bartender) {
            const bartenderObj = JSON.parse(bartender);
            updateBartender({
              variables: {
                input: {
                  id: bartenderObj.id,
                  isWaiting: false,
                  isApproved: false,
                  token: "",
                },
              },
            });
          }
        }
      
        deleteCookie(cookieName);
        refresh && window.location.reload();
    };

    const validateBartenderCode = (data: BartenderFormData) => {
        const { securityCode } = data;
        try {
            setResMessage('');
            getBartender({
                variables: { input: { securityCode: securityCode } },
            });
        } catch (error) {
            console.error("Erro ao buscar o garçom:", error);
        }
    };

    verifyBartenderToken();
    loading && setLoading(false);
    
    return (
        <>
            { loading 
            ? ( <Loading title="Aguarde, carregando..." /> ) 
            : (
                <>
                    <Helmet>
                        <title>{pageTitle}</title>
                    </Helmet>
                    <div className='main-content'>
                        <Header />
                        <form className="bartender-container" onSubmit={handleSubmit(validateBartenderCode)}>
                            <label className='label-input'>Seu código de segurança:</label>
                            <input
                                className='input'
                                type="text"
                                aria-label="securityCode input"
                                placeholder="Código de garçom"
                                {...register('securityCode')}
                                disabled={isInputBlocked}
                            />
                            {errors.securityCode && <span className='error-input'>{errors.securityCode.message}</span>}
                            {resMessage !== '' && <span className='error-input'>{resMessage}</span>}
                            { bartenderDataIsWaiting
                            ? (
                                <>
                                    <label className='label-input'>Aguardando aprovação...</label>
                                    <button onClick={() => cancelRequestWait(true)} className='button' type="button">Cancelar</button>
                                </>
                            ) 
                            : (<button className='button' type="submit">Enviar</button>)}
                        </form>
                    </div>
                </>
            )}
        </>
    )
}

export default BartenderAuth;